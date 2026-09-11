#!/usr/bin/env python3
"""Safe-area audit that reads DECODED FRAMES, not the mp4 directly.

    python3 scripts/reel_safe_frames.py <dir-of-pngs> [--scale 4]

Why this exists: `scripts/reel_safe_audit.py` FAILS OPEN on the render container.
Neither available ffmpeg will do `-f rawvideo` on h264 — the Remotion build has no
rawvideo muxer and the Playwright build is compiled --disable-everything — so it
decodes zero frames, reports a PASS and prints an inverted bounding box
(x 1080..-1). A green tick from it there means nothing was measured.

Decode first with the compositor ffmpeg, which is the only one here that reads
h264, then point this at the directory:

    remotion/node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg \
        -i reel.mp4 -vf scale=270:480 frames/%04d.png

"Content" is luminance > 55, which takes in cars, text, rules and markings but not
the ground, its drafting grid or the accent glow — those are full-bleed by design
(non-negotiable 2) and are not what the safe area is protecting.
"""
import pathlib
import sys

import numpy as np
from PIL import Image

SAFE = {'x0': 60, 'x1': 870, 'y0': 270, 'y1': 1540}
THRESH = 55

# The ONE line that is never exempt. r001 shipped with its title inside Instagram's
# header; nothing may enter the top band, whatever the camera is doing.
HEADER_Y = SAFE['y0']


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    d = pathlib.Path(sys.argv[1])
    scale = int(sys.argv[sys.argv.index('--scale') + 1]) if '--scale' in sys.argv else 4
    files = sorted(d.glob('*.png'))
    if not files:
        raise SystemExit(f'no PNGs in {d} — decode step did not run')

    # Ranges, in seconds, where the camera is DOWN ON THE SCENE and the set bleeds
    # off-frame by design — a road at driver's eye leaves the bottom corners the way
    # ReelGround leaves every edge. Naming them here is deliberate: an exemption has
    # to be written down and justified in NOTES.md, not bought by nudging a
    # brightness threshold until the number goes green.
    bleed = []
    if '--bleed' in sys.argv:
        for part in sys.argv[sys.argv.index('--bleed') + 1].split(','):
            a, b = part.split('-')
            bleed.append((float(a), float(b)))

    def exempt(i):
        t = i / 30.0
        return any(a <= t < b for a, b in bleed)

    worst = {'x0': 10**9, 'x1': -1, 'y0': 10**9, 'y1': -1}
    bad = []
    for f in files:
        a = np.asarray(Image.open(f).convert('RGB'), dtype=np.float32)
        lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
        ys, xs = np.nonzero(lum > THRESH)
        if len(xs) == 0:
            continue
        x0, x1 = int(xs.min()) * scale, int(xs.max() + 1) * scale
        y0, y1 = int(ys.min()) * scale, int(ys.max() + 1) * scale
        worst['x0'] = min(worst['x0'], x0)
        worst['x1'] = max(worst['x1'], x1)
        worst['y0'] = min(worst['y0'], y0)
        worst['y1'] = max(worst['y1'], y1)
        if exempt(int(f.stem) - 1):
            if y0 < HEADER_Y:
                bad.append((f.name + ' [HEADER]', x0, x1, y0, y1))
            continue
        if x0 < SAFE['x0'] or x1 > SAFE['x1'] or y0 < SAFE['y0'] or y1 > SAFE['y1']:
            bad.append((f.name, x0, x1, y0, y1))

    print(f'{len(files)} frames · content = luminance > {THRESH} · scale x{scale}')
    if bleed:
        print('  declared bleed ranges (header band still enforced): '
              + ', '.join(f'{a}-{b}s' for a, b in bleed))
    print(f"  worst bbox   x {worst['x0']}..{worst['x1']}   y {worst['y0']}..{worst['y1']}")
    print(f"  safe area    x {SAFE['x0']}..{SAFE['x1']}   y {SAFE['y0']}..{SAFE['y1']}")
    if worst['x1'] < 0:
        raise SystemExit('FAIL — nothing was measured; the decode step produced no content')
    if bad:
        print(f'\n  {len(bad)} frame(s) outside the safe area, first 8:')
        for n, x0, x1, y0, y1 in bad[:8]:
            print(f'    {n}  x {x0}..{x1}  y {y0}..{y1}')
        raise SystemExit('FAIL')
    print('\nPASS')


if __name__ == '__main__':
    main()
