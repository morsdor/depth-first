#!/usr/bin/env python3
"""Does any CONTENT fall outside the Instagram safe area? Measured on the mp4.

    python3 scripts/reel_safe_audit.py <reel.mp4> [--bleed 12.4-18.0,22.1-24.0]

The `*-safe` still composition checks one frame. This checks EVERY frame of the
finished render, which is what you need the moment anything moves: a label that is
comfortably inside the column at frame 0 can be shoved under the action rail by a
camera push 200 frames later, and r001 shipped its title inside Instagram's top
bar for exactly this reason.

── Why this decodes to PNGs, 2026-09-12 ────────────────────────────────────────
It used to pipe `-f rawvideo` out of a system ffmpeg, and that had two failure
modes, the second of which is the dangerous one:

  1. On the render container there is no system ffmpeg at all, so it died on a
     bare FileNotFoundError.
  2. Where an ffmpeg existed but could not decode h264 or muxer rawvideo, the
     generator yielded ZERO frames and the script printed **PASS** with an
     inverted bounding box (x 1080..-1). A green tick over nothing measured.

Neither available ffmpeg here will do rawvideo — Remotion's bundled compositor
has no rawvideo muxer (verified, not assumed) and the Playwright build is
compiled --disable-everything. Both will write PNGs, and so will any normal
system ffmpeg, so PNGs are the one path that works everywhere. The measurement
itself lives in `reel_safe_frames.py` so there is exactly one implementation and
one verdict, and it FAILS CLOSED when nothing was measured.
"""
import argparse
import pathlib
import shutil
import subprocess
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from reel_safe_frames import measure, parse_bleed  # noqa: E402

# Remotion's bundled compositor is the only ffmpeg on the render container that
# decodes h264; the Playwright one is built --disable-everything. A system ffmpeg
# (your Mac, brew) is preferred when present because it is a full build.
FFMPEG_CANDIDATES = (
    'remotion/node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg',
    'remotion/node_modules/@remotion/compositor-linux-x64-musl/ffmpeg',
)
# The frames are measured at 1/SCALE and the coordinates multiplied back up.
# 270x480 is plenty: the safe area is a 60 px margin, which is 15 px here.
SCALE = 4


def ffmpeg() -> str:
    root = pathlib.Path(__file__).resolve().parent.parent
    found = shutil.which('ffmpeg')
    if found:
        return found
    for c in FFMPEG_CANDIDATES:
        if (root / c).exists():
            return str(root / c)
    raise SystemExit('FAIL — no ffmpeg found that can decode h264')


def main():
    a = argparse.ArgumentParser()
    a.add_argument('video')
    a.add_argument('--bleed', default=None,
                   help='seconds ranges the camera is DOWN ON THE SCENE and the set '
                        'bleeds by design, e.g. 12.4-18.0. The header band is never '
                        'exempt. Justify every range in NOTES.md.')
    a.add_argument('--keep', metavar='DIR', default=None,
                   help='keep the decoded PNGs here instead of a temp dir')
    o = a.parse_args()

    video = pathlib.Path(o.video)
    if not video.exists():
        raise SystemExit(f'FAIL — no such render: {video}')

    with tempfile.TemporaryDirectory() as tmp:
        out = pathlib.Path(o.keep) if o.keep else pathlib.Path(tmp)
        out.mkdir(parents=True, exist_ok=True)
        r = subprocess.run(
            [ffmpeg(), '-loglevel', 'error', '-i', str(video),
             '-vf', f'scale={1080 // SCALE}:{1920 // SCALE}', str(out / '%04d.png')],
            capture_output=True, text=True)
        files = sorted(out.glob('*.png'))
        if r.returncode != 0 or not files:
            # Never fall through to the measurement on a broken decode: that is
            # the path that used to print PASS.
            print(r.stderr.strip()[:800])
            raise SystemExit(
                f'FAIL — decode produced {len(files)} frames from {video.name}. '
                'Nothing was measured, so this is not a pass.')
        bleed = parse_bleed(['--bleed', o.bleed] if o.bleed else [])
        return measure(files, scale=SCALE, bleed=bleed, label=f'{video.name}  ')


if __name__ == '__main__':
    sys.exit(main())
