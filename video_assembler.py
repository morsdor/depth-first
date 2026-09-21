#!/usr/bin/env python3
"""
video_assembler.py — the ANIMATIC builder (stills + VO rough cut, Ken Burns + text).

Studio-pivot role (July 2026): the final master is conformed in PREMIERE PRO from the
AE-rendered clips/scene_NN.mp4 + voiceover — this script no longer produces the publish
master. Its job is the studio animatic (docs/cinematography.md ANIMATIC-1/2): after the
plates pass the accuracy gate and the VO is recorded, assemble stills + VO into a rough
1080p cut and watch it once. Pacing problems get fixed IN THE BOARD (re-time / merge /
cut scenes via the studio-director) — never improvised later at the AE desk. The
animatic protects the pipeline's scarcest resource: your AE hours.

Takes a storyboard.json + images + voiceover audio → produces the rough cut.

Dependencies:
    pip install "moviepy==1.0.3" pillow

Also requires:
    - ffmpeg installed (brew install ffmpeg)

Note: Text overlays are rendered with Pillow — NO ImageMagick needed. Drop your
brand fonts into assets/fonts/ (IBMPlexSans-Bold.ttf, Fraunces-Bold.ttf); the
assembler falls back to a system font if they're absent. Edit FONT_CANDIDATES
to reorder preference.

Usage:
    python video_assembler.py --storyboard storyboard.json --output animatic.mp4

1080p is the right speed/size for an animatic. (The 1440p/2160p paths still exist —
legacy from when this script rendered the publish master — but the master now comes
out of Premiere.)
"""

import json
import argparse
import os
from moviepy.editor import (
    ImageClip, TextClip, CompositeVideoClip, 
    concatenate_videoclips, AudioFileClip, 
    ColorClip, vfx, VideoFileClip
)
import numpy as np


# ── Style Constants ──────────────────────────────────────────────────────────

# Output resolution — selectable via --resolution. RESOLUTION/BITRATE are reassigned
# by set_output_resolution() in __main__ before assembly; the rest of the module
# reads these globals and scales pixel constants off RESOLUTION[1] via _px().
RESOLUTIONS = {
    "1080p": (1920, 1080),
    "1440p": (2560, 1440),
    "2160p": (3840, 2160),
}
RESOLUTION_ALIASES = {"4k": "2160p", "uhd": "2160p", "hd": "1080p", "qhd": "1440p",
                      "1080": "1080p", "1440": "1440p", "2160": "2160p"}
# x264 target bitrate per resolution (scales ~with pixel count; 4K needs ~5× 1080p).
BITRATE_BY_RES = {"1080p": "8000k", "1440p": "16000k", "2160p": "40000k"}

RESOLUTION = RESOLUTIONS["1080p"]   # default; reassigned from --resolution in __main__
FPS = 30
BITRATE = BITRATE_BY_RES["1080p"]   # reassigned alongside RESOLUTION


def _px(base_1080: float) -> int:
    """Scale a pixel constant authored at 1080p to the current RESOLUTION height."""
    return max(1, int(round(base_1080 * RESOLUTION[1] / 1080)))


def set_output_resolution(name: str) -> str:
    """Set the module-level RESOLUTION + BITRATE from a --resolution value (e.g. '2160p', '4k')."""
    global RESOLUTION, BITRATE
    key = RESOLUTION_ALIASES.get(name.lower(), name.lower())
    if key not in RESOLUTIONS:
        raise SystemExit(f"unknown --resolution '{name}'; choose {', '.join(RESOLUTIONS)} (alias '4k' = 2160p)")
    RESOLUTION = RESOLUTIONS[key]
    BITRATE = BITRATE_BY_RES[key]
    return key

# Text is rendered with Pillow (NOT ImageMagick/TextClip) so it works everywhere
# without an ImageMagick install or a magic "Arial-Bold" font name.
# Brand fonts: drop the .ttf files into assets/fonts/. First existing path wins.
FONT_CANDIDATES = [
    "assets/fonts/IBMPlexSans-Bold.ttf",
    "assets/fonts/Fraunces-Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",   # macOS
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", # Linux fallback
]
FONT_SIZE = 46
FONT_COLOR = (250, 247, 242)   # brand cream #FAF7F2
TEXT_BG_COLOR = (44, 44, 44)   # brand charcoal #2C2C2C
TEXT_BG_OPACITY = 0.6
CROSSFADE_DURATION = 0.5       # seconds of crossfade between scenes


# ── Motion Functions ─────────────────────────────────────────────────────────
# Each function returns a transform(get_frame, t) for moviepy's .fl() method

def motion_zoom_in(duration, intensity=0.15):
    """Slow zoom into center of image."""
    def transform(get_frame, t):
        frame = get_frame(t)
        h, w = frame.shape[:2]
        zoom = 1 + intensity * (t / duration)
        new_w, new_h = int(w / zoom), int(h / zoom)
        x1 = (w - new_w) // 2
        y1 = (h - new_h) // 2
        cropped = frame[y1:y1+new_h, x1:x1+new_w]
        from PIL import Image
        img = Image.fromarray(cropped).resize((w, h), Image.LANCZOS)
        return np.array(img)
    return transform


def motion_zoom_out(duration, intensity=0.15):
    """Start zoomed in, slowly pull out."""
    def transform(get_frame, t):
        frame = get_frame(t)
        h, w = frame.shape[:2]
        zoom = 1 + intensity * (1 - t / duration)
        new_w, new_h = int(w / zoom), int(h / zoom)
        x1 = (w - new_w) // 2
        y1 = (h - new_h) // 2
        cropped = frame[y1:y1+new_h, x1:x1+new_w]
        from PIL import Image
        img = Image.fromarray(cropped).resize((w, h), Image.LANCZOS)
        return np.array(img)
    return transform


def motion_pan_left(duration, pan_fraction=0.15):
    """Pan from right to left across image."""
    def transform(get_frame, t):
        frame = get_frame(t)
        h, w = frame.shape[:2]
        crop_w = int(w * (1 - pan_fraction))
        max_x = w - crop_w
        x1 = int(max_x * (1 - t / duration))
        cropped = frame[:, x1:x1+crop_w]
        from PIL import Image
        img = Image.fromarray(cropped).resize((w, h), Image.LANCZOS)
        return np.array(img)
    return transform


def motion_pan_right(duration, pan_fraction=0.15):
    """Pan from left to right across image."""
    def transform(get_frame, t):
        frame = get_frame(t)
        h, w = frame.shape[:2]
        crop_w = int(w * (1 - pan_fraction))
        max_x = w - crop_w
        x1 = int(max_x * (t / duration))
        cropped = frame[:, x1:x1+crop_w]
        from PIL import Image
        img = Image.fromarray(cropped).resize((w, h), Image.LANCZOS)
        return np.array(img)
    return transform


def motion_pan_up(duration, pan_fraction=0.12):
    """Pan from bottom to top."""
    def transform(get_frame, t):
        frame = get_frame(t)
        h, w = frame.shape[:2]
        crop_h = int(h * (1 - pan_fraction))
        max_y = h - crop_h
        y1 = int(max_y * (1 - t / duration))
        cropped = frame[y1:y1+crop_h, :]
        from PIL import Image
        img = Image.fromarray(cropped).resize((w, h), Image.LANCZOS)
        return np.array(img)
    return transform


def motion_zoom_detail(duration, focus_x=0.5, focus_y=0.4, start_zoom=1.0, end_zoom=1.8):
    """Zoom into a specific region of the image."""
    def transform(get_frame, t):
        frame = get_frame(t)
        h, w = frame.shape[:2]
        zoom = start_zoom + (end_zoom - start_zoom) * (t / duration)
        new_w, new_h = int(w / zoom), int(h / zoom)
        cx, cy = int(w * focus_x), int(h * focus_y)
        x1 = max(0, min(cx - new_w // 2, w - new_w))
        y1 = max(0, min(cy - new_h // 2, h - new_h))
        cropped = frame[y1:y1+new_h, x1:x1+new_w]
        from PIL import Image
        img = Image.fromarray(cropped).resize((w, h), Image.LANCZOS)
        return np.array(img)
    return transform


# ── Motion Registry ──────────────────────────────────────────────────────────

MOTIONS = {
    "zoom_in":     motion_zoom_in,
    "zoom_out":    motion_zoom_out,
    "pan_left":    motion_pan_left,
    "pan_right":   motion_pan_right,
    "pan_up":      motion_pan_up,
    "zoom_detail": motion_zoom_detail,
}

DEFAULT_MOTION_CYCLE = ["zoom_in", "pan_right", "zoom_out", "pan_left", "pan_up", "zoom_in"]


# ── Text Rendering (Pillow — no ImageMagick needed) ──────────────────────────

from PIL import ImageFont, ImageDraw


def _load_font(size: int):
    for path in FONT_CANDIDATES:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            continue
    return ImageFont.load_default()


def make_text_image(text: str, max_width: int, fontsize: int = FONT_SIZE,
                    color=FONT_COLOR, bg_color=TEXT_BG_COLOR,
                    bg_opacity: float = TEXT_BG_OPACITY, pad: int = None) -> np.ndarray:
    """Render wrapped, centered text on a rounded translucent bar → RGBA array.
    pad/radius/line spacing scale with fontsize so the bar looks right at any resolution."""
    from PIL import Image
    if pad is None:
        pad = int(fontsize * 0.56)          # ~26 at the 1080p base fontsize (46)
    radius = max(8, int(fontsize * 0.3))    # ~14 at base
    font = _load_font(fontsize)
    measure = ImageDraw.Draw(Image.new("RGBA", (10, 10)))

    # word-wrap to max_width
    words, lines, cur = text.split(), [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if measure.textlength(test, font=font) <= max_width or not cur:
            cur = test
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)

    line_h = fontsize + int(fontsize * 0.22)   # ~56 at base
    text_w = max((measure.textlength(l, font=font) for l in lines), default=1)
    W = int(text_w) + pad * 2
    H = line_h * len(lines) + pad * 2

    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if bg_color is not None:
        d.rounded_rectangle([0, 0, W - 1, H - 1], radius=radius,
                            fill=(bg_color[0], bg_color[1], bg_color[2], int(255 * bg_opacity)))
    y = pad
    for l in lines:
        lw = measure.textlength(l, font=font)
        d.text(((W - lw) / 2, y), l, font=font, fill=(color[0], color[1], color[2], 255))
        y += line_h
    return np.array(img)


# ── Scene Builder ────────────────────────────────────────────────────────────

def build_scene(scene: dict, index: int, base_dir: str) -> CompositeVideoClip:
    """Build a single scene clip from a storyboard entry.

    Animatic logic: prefer a finished compositor render if one exists (v2
    remotion_build.render.clip, or the retired ae_build.render.clip; v1 animated_clip),
    else the scene's still + Ken Burns. v2 assembly scenes (no plate) get a parchment
    slate carrying the scene id — pacing is still checkable."""

    duration = scene.get("duration", 10)
    build = scene.get("remotion_build") or scene.get("ae_build") or {}
    clip_rel = (build.get("render") or {}).get("clip") or scene.get("animated_clip")
    clip_path = os.path.join(base_dir, clip_rel) if clip_rel else None

    # 1. Base: finished render if present → still + Ken Burns → parchment slate (assembly)
    if clip_path and os.path.isfile(clip_path):
        base_clip = VideoFileClip(clip_path).resize(RESOLUTION)
        # Handle cases where the clip is shorter than requested duration
        if base_clip.duration < duration:
            base_clip = base_clip.fx(vfx.loop, duration=duration)
        else:
            base_clip = base_clip.subclip(0, duration)
    elif not scene.get("image"):
        # v2 assembly scene, not yet built in AE: hold a parchment slate
        base_clip = ColorClip(RESOLUTION, color=(245, 240, 232)).set_duration(duration)
        slate = (scene.get("id") or f"scene_{index + 1:02d}") + "  [assembly — built in AE]"
        scene = dict(scene)
        scene.setdefault("texts", [])
        scene["texts"] = [{"text": slate, "start": 0.2, "end": max(duration - 0.2, 0.4),
                           "position": "center"}] + list(scene["texts"])
    else:
        image_path = os.path.join(base_dir, scene["image"])
        motion_type = scene.get("motion", DEFAULT_MOTION_CYCLE[index % len(DEFAULT_MOTION_CYCLE)])
        
        headroom = _px(200)   # extra pixels beyond the frame that Ken Burns crops into
        img_clip = (
            ImageClip(image_path)
            .set_duration(duration)
            .resize(height=RESOLUTION[1] + headroom)
        )
        if img_clip.w < RESOLUTION[0] + headroom:
            img_clip = img_clip.resize(width=RESOLUTION[0] + headroom)
        
        # 2. Apply Ken Burns motion
        motion_kwargs = {}
        if motion_type == "zoom_detail":
            motion_kwargs = {
                "focus_x": scene.get("focus_x", 0.5),
                "focus_y": scene.get("focus_y", 0.4),
            }
        
        motion_fn = MOTIONS.get(motion_type, motion_zoom_in)
        base_clip = img_clip.fl(motion_fn(duration, **motion_kwargs), apply_to="mask")
        base_clip = base_clip.resize(RESOLUTION)
    
    # 3. Build layers
    layers = [base_clip]
    
    # Support both old single `text` and new `texts` array formats
    texts = scene.get("texts", [])
    if not texts and scene.get("text"):
        texts = [{
            "text": scene.get("text"),
            "start": 0.5,
            "end": duration - 0.5,
            "position": scene.get("text_position", "bottom")
        }]
        
    for txt_info in texts:
        text_str = txt_info.get("text")
        if not text_str:
            continue

        t_start = txt_info.get("start", 0.5)
        t_end = txt_info.get("end", duration - 0.5)
        t_pos = txt_info.get("position", "bottom")
        t_dur = t_end - t_start

        if t_dur <= 0:
            continue

        # Render text + background bar in one Pillow image (no ImageMagick).
        arr = make_text_image(text_str, max_width=RESOLUTION[0] - _px(300),
                              fontsize=_px(FONT_SIZE))
        txt_clip = (
            ImageClip(arr, transparent=True)
            .set_duration(t_dur)
            .set_start(t_start)
            .crossfadein(0.3)
            .crossfadeout(0.3)
        )

        th = txt_clip.h
        if t_pos == "bottom":
            txt_clip = txt_clip.set_position(("center", RESOLUTION[1] - th - _px(80)))
        elif t_pos == "top":
            txt_clip = txt_clip.set_position(("center", _px(60)))
        else:  # center
            txt_clip = txt_clip.set_position("center")

        layers.append(txt_clip)

    return CompositeVideoClip(layers, size=RESOLUTION).set_duration(duration)


# ── Main Assembly ────────────────────────────────────────────────────────────

def assemble_video(storyboard_path: str, output_path: str):
    """Assemble a full video from a storyboard JSON file."""
    
    with open(storyboard_path, "r") as f:
        storyboard = json.load(f)
    
    base_dir = storyboard.get("base_dir", os.path.dirname(storyboard_path))
    scenes = storyboard["scenes"]
    voiceover_path = storyboard.get("voiceover", None)
    music_path = storyboard.get("background_music", None)
    music_volume = storyboard.get("music_volume", 0.08)
    
    print(f"Loaded storyboard: {len(scenes)} scenes")
    
    clips = []
    for i, scene in enumerate(scenes):
        print(f"  Building scene {i+1}/{len(scenes)}: {scene.get('text', 'no text')[:50]}...")
        clip = build_scene(scene, i, base_dir)
        clips.append(clip)
    
    print("Concatenating scenes...")
    if CROSSFADE_DURATION > 0 and len(clips) > 1:
        final = concatenate_videoclips(clips, method="compose", padding=-CROSSFADE_DURATION)
    else:
        final = concatenate_videoclips(clips, method="compose")
    
    if voiceover_path and os.path.exists(os.path.join(base_dir, voiceover_path)):
        print("Adding voiceover...")
        voice = AudioFileClip(os.path.join(base_dir, voiceover_path))
        final = final.set_audio(voice.set_duration(final.duration))
    
    if music_path and os.path.exists(os.path.join(base_dir, music_path)):
        print("Mixing background music...")
        music = (
            AudioFileClip(os.path.join(base_dir, music_path))
            .volumex(music_volume)
            .set_duration(final.duration)
        )
        if final.audio:
            from moviepy.audio.AudioClip import CompositeAudioClip
            final = final.set_audio(CompositeAudioClip([final.audio, music]))
        else:
            final = final.set_audio(music)
    
    print(f"Rendering to {output_path} at {RESOLUTION[0]}x{RESOLUTION[1]} @ {BITRATE}...")
    final.write_videofile(
        output_path, fps=FPS, codec="libx264", audio_codec="aac",
        bitrate=BITRATE, preset="medium", threads=4,
    )
    print(f"Done! Output: {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Assemble video from storyboard JSON")
    parser.add_argument("--storyboard", required=True, help="Path to storyboard.json")
    parser.add_argument("--output", default="output.mp4", help="Output video path")
    parser.add_argument("--resolution", default="1080p",
                        help="1080p (fast review default) | 2160p / 4k (publish master, feed 4K assets) | 1440p")
    args = parser.parse_args()
    key = set_output_resolution(args.resolution)
    print(f"Output resolution: {key} {RESOLUTION[0]}x{RESOLUTION[1]}")
    assemble_video(args.storyboard, args.output)
