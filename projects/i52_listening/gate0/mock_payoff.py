"""
Gate 0 mock for I52 — "Your phone is listening for exactly one word."

NOT a render. A five-minute PIL still whose only job is to let a human answer:
does a stranger, sound off, know what they are looking at and want to know why?

Real data even in the mock:
  * the waveform is the RMS envelope of a real speech recording — the narration
    from projects/001_roman_aqueduct. Our own audio, so no licence question,
    and only its envelope is ever drawn.
  * the counters are the real arithmetic (see the printout).

The two claims the reel rests on are platform behaviour, verified against
primary sources rather than recalled:
  * iOS 14+ shows an orange dot whenever an app uses the microphone.
    https://support.apple.com/en-in/108331
  * Android 12+ shows a status-bar indicator for microphone and camera use, it
    is MANDATORY for all OEMs, and indirect use through SoundTriggerManager
    (i.e. wake-word detection) is attributed to the originating package.
    https://source.android.com/docs/core/permissions/privacy-indicators
"""
import math
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[3]
SRC = ROOT / "projects/001_roman_aqueduct/vo_001_final.wav"

W, H = 1080, 1920
SAFE_TOP, SAFE_BOT, SIDE, SAFE_W = 270, 1540, 60, 810
INK, DIM, BLUE, AMBER = "#E8E6E1", "#81A2C4", "#51A4FF", "#FFB020"

# ── the arithmetic ──────────────────────────────────────────────────────────
DAY_S = 86_400
OPUS_KBPS = 16            # typical Opus speech setting
CLIP_S, CLIP_KBPS = 3, 32  # what actually leaves after a trigger

always_on_gb_month = OPUS_KBPS * 1000 / 8 * DAY_S * 30 / 1e9
clip_kb = CLIP_KBPS * 1000 / 8 * CLIP_S / 1024


def envelope(n=520):
    """RMS envelope of real speech, normalised. Mono, first ~40 s."""
    # The source is WAVE_FORMAT_EXTENSIBLE, which stdlib `wave` refuses. Decode
    # to plain 16-bit mono PCM first rather than hand-parsing the header.
    tmp = Path(tempfile.gettempdir()) / "i52_vo_mono.wav"
    if not tmp.exists():
        subprocess.run(
            ["ffmpeg", "-loglevel", "error", "-y", "-i", str(SRC),
             "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", "-t", "40", str(tmp)],
            check=True,
        )
    with wave.open(str(tmp), "rb") as w:
        rate, nch, width = w.getframerate(), w.getnchannels(), w.getsampwidth()
        frames = w.readframes(min(w.getnframes(), rate * 40))
    dt = {1: np.int8, 2: np.int16, 4: np.int32}[width]
    a = np.frombuffer(frames, dtype=dt).astype(np.float64)
    if nch > 1:
        a = a.reshape(-1, nch).mean(axis=1)
    chunks = np.array_split(a, n)
    env = np.array([math.sqrt(float(np.mean(c ** 2))) if len(c) else 0.0 for c in chunks])
    return env / (env.max() or 1.0)


def font(sz, bold=False):
    for p in (
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
        if bold
        else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ):
        try:
            return ImageFont.truetype(p, sz)
        except Exception:
            pass
    return ImageFont.load_default()


def mono(sz):
    for p in ("/System/Library/Fonts/Menlo.ttc", "/System/Library/Fonts/Courier.ttc"):
        try:
            return ImageFont.truetype(p, sz)
        except Exception:
            pass
    return font(sz)


img = Image.new("RGB", (W, H), "#040E1F")
d = ImageDraw.Draw(img)
for gx in range(0, W, 54):
    d.line([(gx, 0), (gx, H)], fill="#0C1522")
for gy in range(0, H, 54):
    d.line([(0, gy), (W, gy)], fill="#0C1522")

# ── the phone, and its status bar. The dot is the whole argument, so the
# object on screen is the strip the viewer looks at fifty times a day. ──────
PX, PY, PW, PH = 150, 560, 630, 620
d.rounded_rectangle([PX, PY, PX + PW, PY + PH], radius=54, outline="#274064", width=4)
d.rounded_rectangle(
    [PX + 18, PY + 18, PX + PW - 18, PY + 96], radius=26, fill="#08172C"
)
# the indicator, OFF — drawn as the absence it is
d.ellipse([PX + PW - 74, PY + 44, PX + PW - 46, PY + 72], fill="#1B2E47")
d.text((PX + PW - 96, PY + 58), "off", font=mono(26), fill="#3E5A73", anchor="rm")
d.text((PX + 40, PY + 58), "9:41", font=font(28, True), fill="#4A688A", anchor="lm")

# ── the waveform: real speech, pouring in ───────────────────────────────────
env = envelope()
wx0, wx1 = PX + 40, PX + PW - 40
wy = PY + 400
half = 128
for i, v in enumerate(env):
    x = wx0 + (wx1 - wx0) * i / (len(env) - 1)
    h = max(1.0, v * half)
    d.line([(x, wy - h), (x, wy + h)], fill=BLUE, width=2)
d.text((PX + 40, PY + 150), "listening", font=mono(30), fill=DIM)
d.text((PX + 40, PY + 196), "for one word", font=font(40, True), fill=INK)

# ── headline ────────────────────────────────────────────────────────────────
d.text((SIDE, SAFE_TOP + 26), "Your phone IS listening.", font=font(66, True), fill=INK)
d.text(
    (SIDE, SAFE_TOP + 112),
    "It just isn't recording.",
    font=font(66, True),
    fill=BLUE,
)

# ── the payoff: everything in, nothing out ─────────────────────────────────
rows = [
    ("heard today", "24 h 00 m", INK),
    ("left your phone", "0 bytes", BLUE),
]
ty = 1258
d.line([(SIDE, ty - 26), (SIDE + SAFE_W, ty - 26)], fill="#1E3348", width=2)
for i, (k, v, col) in enumerate(rows):
    y = ty + i * 62
    d.text((SIDE, y), k, font=mono(40), fill=DIM)
    d.text((SIDE + SAFE_W, y), v, font=mono(40), fill=col, anchor="ra")
    d.line([(SIDE, y + 50), (SIDE + SAFE_W, y + 50)], fill="#1E3348", width=2)

d.text(
    (SIDE, 1418),
    "The dot lights up every time anything records.",
    font=font(42, True),
    fill=INK,
)
d.text(
    (SIDE, 1476),
    "Look at the top of your screen right now.",
    font=font(36),
    fill=DIM,
)
d.line([(SIDE, SAFE_BOT), (SIDE + SAFE_W, SAFE_BOT)], fill="#1E3348", width=2)

out = Path(__file__).parent / "payoff_frame.png"
img.save(out)
print(f"""wrote {out}

  waveform      real speech envelope, {len(env)} windows from {SRC.name}
  heard         {DAY_S:,} s/day  = 24 h
  left phone    0 bytes, until the wake word fires
  one clip      {clip_kb:.0f} KB  ({CLIP_S} s at {CLIP_KBPS} kbps)

  and the reason nobody streams it all:
  always-on at {OPUS_KBPS} kbps = {always_on_gb_month:.1f} GB/month
  -- but that is only ~19% on top of an average Indian mobile bill,
     so it is SUPPORTING evidence, not the payoff. The payoff is the dot.""")
