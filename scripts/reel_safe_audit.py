#!/usr/bin/env python3
"""Does any CONTENT fall outside the Instagram safe area? Measured on the mp4.

The `*-safe` still composition checks one frame. This checks every sampled frame
of the finished render, which is what you need the moment anything moves: a
label that is comfortably inside the column at frame 0 can be shoved under the
action rail by a camera push 200 frames later, and r001 shipped its title inside
Instagram's top bar for exactly this reason.

"Content" is any pixel brighter than --floor. The drafting-grid ground sits well
under it; text, strokes and bobs sit well over. Run --calibrate on a render you
already trust to see the margin before trusting the threshold.
"""
import argparse
import subprocess
import sys

import numpy as np

SAFE = dict(top=270, bottom=1540, left=60, right=870)


def frames(path, fps, w, h):
    p = subprocess.Popen(
        ['ffmpeg', '-v', 'error', '-i', path, '-vf', f'fps={fps}',
         '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
        stdout=subprocess.PIPE)
    n = w * h
    while True:
        buf = p.stdout.read(n)
        if len(buf) < n:
            break
        yield np.frombuffer(buf, np.uint8).reshape(h, w)


def main():
    a = argparse.ArgumentParser()
    a.add_argument('video')
    a.add_argument('--fps', type=float, default=2.0)
    a.add_argument('--floor', type=int, default=90)
    a.add_argument('--calibrate', action='store_true')
    a.add_argument('--width', type=int, default=1080)
    a.add_argument('--height', type=int, default=1920)
    o = a.parse_args()

    W, H = o.width, o.height
    band = np.zeros((H, W), bool)
    band[SAFE['top']:SAFE['bottom'], SAFE['left']:SAFE['right']] = True
    outside = ~band

    worst = []
    lo = np.array([W, H]); hi = np.array([-1, -1])
    for i, g in enumerate(frames(o.video, o.fps, W, H)):
        ink = g > o.floor
        if ink.any():
            ys, xs = np.where(ink)
            lo = np.minimum(lo, [xs.min(), ys.min()])
            hi = np.maximum(hi, [xs.max(), ys.max()])
        bad = ink & outside
        if bad.any():
            ys, xs = np.where(bad)
            worst.append((i / o.fps, len(xs), xs.min(), xs.max(), ys.min(), ys.max(),
                          int(g[bad].max())))

    print(f'{o.video}   floor {o.floor}, sampled at {o.fps} fps')
    print(f'  content bbox over all samples: x {lo[0]}..{hi[0]}   y {lo[1]}..{hi[1]}')
    print(f'  safe area:                     x {SAFE["left"]}..{SAFE["right"]}   '
          f'y {SAFE["top"]}..{SAFE["bottom"]}')
    print(f'  margin: left {lo[0]-SAFE["left"]:+d}  right {SAFE["right"]-hi[0]:+d}  '
          f'top {lo[1]-SAFE["top"]:+d}  bottom {SAFE["bottom"]-hi[1]:+d}')
    if o.calibrate:
        return 0
    if worst:
        print(f'\n  FAIL — content outside the safe area on {len(worst)} sample(s):')
        for t, n, x0, x1, y0, y1, v in worst[:12]:
            print(f'    t={t:6.2f}s  {n:6d}px  x {x0}..{x1}  y {y0}..{y1}  max {v}')
        return 1
    print('\nPASS — nothing outside the safe area')
    return 0


if __name__ == '__main__':
    sys.exit(main())
