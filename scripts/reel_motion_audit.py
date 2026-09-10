#!/usr/bin/env python3
"""Measure whether a reel actually MOVES. Enforces CLAUDE.md non-negotiable #4.

Two metrics, because the first one has a blind spot that shipped a bad reel:

  stillness  -- mean absolute inter-frame change, sampled at 4fps. A stretch
                under ~0.35 for more than ~1.5s reads on a feed as "this ended".
                Measured on r001-r003: 51-55% of each reel had no visible change
                at all, in stretches up to 6.5s.

  event density -- the share of samples with change >= 1.0. A slow push passes
                the stillness rule while nothing HAPPENS: r005's first cut ran
                26% and a viewer called it static despite clearing 0.35.

Density is a floor, not a target. r005 cut 4 hit 68% by LOOPING an animation,
which is change that teaches nothing -- the metric rewards motion and cannot
tell whether the motion carries information. Read it next to the reel, never
instead of it.

    python3 scripts/reel_motion_audit.py projects/r006_greatcircle/r006_greatcircle.mp4
"""
import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

# The Playwright ffmpeg on the render container is built --disable-everything
# and has no h264 decoder or mp4 demuxer, so it cannot read what we just
# rendered. Remotion's bundled compositor ships a full one.
FFMPEG_CANDIDATES = (
    'remotion/node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg',
    'remotion/node_modules/@remotion/compositor-linux-x64-musl/ffmpeg',
)
SAMPLE_FPS = 4
DEAD = 0.35          # below this, the frame is not visibly changing
DEAD_MAX_S = 1.5     # longest tolerable stretch of that
EVENT = 1.0          # at or above this, something happened


def ffmpeg() -> str:
    root = Path(__file__).resolve().parent.parent
    for c in FFMPEG_CANDIDATES:
        if (root / c).exists():
            return str(root / c)
    found = shutil.which('ffmpeg')
    if not found:
        raise SystemExit('no ffmpeg with an h264 decoder found')
    return found


def sample(video: Path, out: Path, width: int) -> list[Path]:
    subprocess.run(
        # -r on the output rather than the fps filter: Remotion's bundled build
        # has scale but not fps, and it is the only ffmpeg here that decodes h264.
        [ffmpeg(), '-loglevel', 'error', '-i', str(video),
         '-r', str(SAMPLE_FPS), '-vf', f'scale={width}:-1', str(out / 'f%05d.png')],
        check=True,
    )
    return sorted(out.glob('*.png'))


def deltas(frames: list[Path]) -> list[float]:
    from PIL import Image, ImageChops, ImageStat
    out, prev = [], None
    for f in frames:
        img = Image.open(f).convert('L')
        if prev is not None:
            out.append(ImageStat.Stat(ImageChops.difference(prev, img)).mean[0])
        prev = img
    return out


def longest_dead(d: list[float]) -> tuple[float, float]:
    """Longest run under DEAD, and the second it starts."""
    best = run = 0
    start = best_start = 0
    for i, v in enumerate(d):
        if v < DEAD:
            if run == 0:
                start = i
            run += 1
            if run > best:
                best, best_start = run, start
        else:
            run = 0
    return best / SAMPLE_FPS, best_start / SAMPLE_FPS


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('video', type=Path)
    ap.add_argument('--width', type=int, default=240)
    a = ap.parse_args()

    with tempfile.TemporaryDirectory() as td:
        frames = sample(a.video, Path(td), a.width)
        d = deltas(frames)

    if not d:
        print('no frames sampled', file=sys.stderr)
        return 2

    d_sorted = sorted(d)
    median = d_sorted[len(d_sorted) // 2]
    dead_s, dead_at = longest_dead(d)
    density = sum(v >= EVENT for v in d) / len(d)
    dur = len(frames) / SAMPLE_FPS

    print(f'{a.video.name}  {dur:.1f}s  ({len(frames)} samples @ {SAMPLE_FPS}fps)')
    print(f'  median change      {median:.3f}')
    print(f'  longest dead spell {dead_s:.2f}s  (limit {DEAD_MAX_S}s, starts {dead_at:.1f}s)')
    print(f'  event density      {density * 100:.0f}%  (samples with change >= {EVENT})')

    ok = dead_s <= DEAD_MAX_S
    print('\n' + ('PASS' if ok else f'FAIL — {dead_s:.2f}s dead spell at {dead_at:.1f}s'))
    return 0 if ok else 1


if __name__ == '__main__':
    raise SystemExit(main())
