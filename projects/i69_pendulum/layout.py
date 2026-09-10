"""I69 — the apparatus geometry, in 1080x1920 reference pixels.

Single source of truth for where the fifteen pendulums are. scene_pendulum.py
draws from it, and emit_ts.py ships the same numbers to Remotion so the length
labels drawn over the layer land ON the strings Manim drew rather than near them.

The Manim layer renders at 1350x2400 and <ManimLayer> stretches it across a
1080x1920 box, so reference px and composition px are the same coordinate space
inside the camera div. That equivalence is the whole reason this file exists.
"""
import json
import pathlib

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parents[2]
D = json.loads((ROOT / 'projects/i69_pendulum/pendulum_data.json').read_text())

REF_W, REF_H = 1080.0, 1920.0
# Re-fitted for the 30 s cycle: the strings now run 32.35..13.67 cm (a 2.37x
# spread, against 1.62x at 60 s), which frees vertical room at the short end.
# S/PPM are the largest that keep every bob on every frame inside the safe
# column AND clear of the readout strip at y=1330 -- searched, not chosen.
S = 1.04                         # bigger than the Gate 0 still: small objects
SKEW, ROW = 37.0 * S, 29.0 * S   # vanish under the motion audit's 240px downscale
PPM, BOB_R = 1200.0 * S, 22.0 * S
SHRINK = 0.018
# Aim the apparatus at the middle of the Instagram SAFE column (x 60..870,
# y 270..1540), not at the middle of the canvas -- centring on the frame pushes
# the far bobs out to x=961, behind the action rail.
TARGET = np.array([465.0, 936.0])
SWING = np.array([0.96, 0.21]) / np.linalg.norm([0.96, 0.21])   # y is DOWN
DOWN = np.array([0.0, 1.0])

COUNT = D['count']
LEN_CM = np.array(D['lengthsCm'], dtype=float)
THETA0 = np.radians(D['theta0Deg'])
TH = np.radians(np.array(D['thetaCentiDeg'], dtype=float) / 100.0)


def depth(n):
    """Fake perspective: the far end of the row is slightly smaller."""
    return 1.0 - SHRINK * n


def rod_px(n):
    return LEN_CM[n] / 100.0 * PPM * depth(n)


def bob_px(n):
    return BOB_R * depth(n)


def _end(piv, n, th):
    return piv[n] + (DOWN * np.cos(th) + SWING * np.sin(th)) * rod_px(n)


def pivots():
    """Pivot centres in reference px.

    Centred on the extremes of the BOB positions over the full swing, which is
    what the eye reads as the object -- not on the pivots, and not on the canvas.
    """
    rel = np.array([[SKEW * n, -ROW * n] for n in range(COUNT)], float)
    lo = np.full(2, 1e9)
    hi = -lo
    for n in range(COUNT):
        for th in (-THETA0, 0.0, THETA0):
            p = _end(rel, n, th)
            lo = np.minimum(lo, p)
            hi = np.maximum(hi, p)
    return rel - (lo + hi) / 2.0 + TARGET


def bob_track(n, piv=None):
    """Every position bob n takes, all 1801 frames, in reference px."""
    piv = pivots() if piv is None else piv
    c, s = np.cos(TH[:, n]), np.sin(TH[:, n])
    return piv[n] + np.outer(c, DOWN) * rod_px(n) + np.outer(s, SWING) * rod_px(n)


if __name__ == '__main__':
    P = pivots()
    print(f'pivots   x {P[:,0].min():.0f}..{P[:,0].max():.0f}   '
          f'y {P[:,1].min():.0f}..{P[:,1].max():.0f}')
    lo = np.full(2, 1e9); hi = -lo
    for n in range(COUNT):
        q = bob_track(n, P)
        lo = np.minimum(lo, (q - bob_px(n)).min(0))
        hi = np.maximum(hi, (q + bob_px(n)).max(0))
    print(f'bobs     x {lo[0]:.0f}..{hi[0]:.0f}   y {lo[1]:.0f}..{hi[1]:.0f}')
    print(f'beam     {P[0]} -> {P[-1]}')
    for n in range(COUNT):
        print(f'  n={n:2d}  N={D["swingCounts"][n]}  L={LEN_CM[n]:6.2f} cm  '
              f'pivot ({P[n,0]:6.1f},{P[n,1]:6.1f})  rod {rod_px(n):6.1f} px')
