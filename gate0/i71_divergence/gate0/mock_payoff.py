#!/usr/bin/env python3
"""Gate 0 mock for I71 — "the one that started a hair's width away".

NOT a render. It exists to prove the approved sentence can be SHOWN:

    "Two identical pendulums, one started a human hair's width off. For three
     seconds they are the same pendulum. Then they have nothing to do with
     each other -- and nothing touched them."

Both arms and both traces come straight out of ../chaos.py. The single still
carries the whole reel: ONE trace that becomes TWO.

    python3 gate0/i71_divergence/gate0/mock_payoff.py
"""
import pathlib
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import chaos  # noqa: E402

HERE = pathlib.Path(__file__).resolve().parent
FONTS = pathlib.Path(__file__).resolve().parents[3] / "assets" / "fonts"

THETA0 = 135.0
HAIR_UM = 70.0
NUDGE = np.degrees(HAIR_UM * 1e-6 / chaos.L1)
T_FRAME = 6.4

T, sep, A, B, drift = chaos.run(THETA0, NUDGE, t_end=T_FRAME + 0.1)
i = int(np.argmin(np.abs(T - T_FRAME)))
print(f"frame at t = {T[i]:.2f} s   energy drift {drift:.2e} of MgL")
print(f"perturbation {NUDGE:.6f} deg = {HAIR_UM:.0f} um of arc at the first bob")

W, H = 1080, 1920
SAFE_TOP, SAFE_BOTTOM, SIDE = 270, 1540, 60
CX = 465                       # centre of the SAFE width, not of the raw frame
PIVOT_Y = 880
PX_PER_M = 190.0

INK, SLATE, BONE, ASH, GRAPHITE = (4, 14, 31), (14, 33, 62), (232, 230, 225), (129, 162, 196), (39, 64, 100)
FAIL = (255, 77, 77)           # DOMAIN_ACCENT.failure — the beat something breaks

img = Image.new("RGB", (W, H), INK)
d = ImageDraw.Draw(img)
for gx in range(0, W, 60):
    d.line([(gx, SAFE_TOP), (gx, SAFE_BOTTOM)], fill=(13, 31, 60), width=1)
for gy in range(SAFE_TOP, SAFE_BOTTOM, 60):
    d.line([(SIDE, gy), (W - SIDE, gy)], fill=(13, 31, 60), width=1)


def pt(theta1, theta2, which):
    x1 = chaos.L1 * np.sin(theta1)
    y1 = -chaos.L1 * np.cos(theta1)
    if which == 1:
        return CX + x1 * PX_PER_M, PIVOT_Y - y1 * PX_PER_M
    x2 = x1 + chaos.L2 * np.sin(theta2)
    y2 = y1 - chaos.L2 * np.cos(theta2)
    return CX + x2 * PX_PER_M, PIVOT_Y - y2 * PX_PER_M


def trace(states, colour, width, lo=0, hi=None):
    pts = [pt(s[0], s[2], 2) for s in states[lo:(i + 1 if hi is None else hi)]]
    if len(pts) > 1:
        d.line(pts, fill=colour, width=width, joint="curve")


# SPLIT is the last logged sample where the two are still the same PIXEL. Before it
# there is one shared path; after it there are two.
#
# Painting B's whole trace over A's was the first attempt, and it buried the shared
# stretch under the red — the still then showed two tangles rather than one line that
# becomes two, which is the entire sentence. The shared path is now drawn ONCE.
SPLIT = int(np.argmax(sep * PX_PER_M > 1.0))
print(f"shared path ends at t = {T[SPLIT]:.2f} s")

trace(A, tuple(int(c * 0.8) for c in BONE), 7, hi=SPLIT + 1)          # the shared path
trace(A, tuple(int(c * 0.45) for c in BONE), 5, lo=SPLIT)             # A after the split
trace(B, FAIL, 5, lo=SPLIT)                                           # B after the split


def arms(state, colour, bob):
    p0 = (CX, PIVOT_Y)
    p1 = pt(state[0], state[2], 1)
    p2 = pt(state[0], state[2], 2)
    d.line([p0, p1], fill=colour, width=9)
    d.line([p1, p2], fill=colour, width=9)
    for p, r in ((p1, 15), (p2, 19)):
        d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=bob)


arms(A[i], ASH, BONE)
arms(B[i], (150, 52, 52), FAIL)
d.ellipse([CX - 11, PIVOT_Y - 11, CX + 11, PIVOT_Y + 11], fill=GRAPHITE)


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)


head = font("ArchivoBlack-Regular.ttf", 68)
sub = font("IBMPlexSans-Bold.ttf", 38)

d.text((CX, SAFE_TOP + 30), "ONE STARTED", font=head, fill=BONE, anchor="ma")
d.text((CX, SAFE_TOP + 104), "A HAIR'S WIDTH OFF.", font=head, fill=FAIL, anchor="ma")
d.text((CX, SAFE_BOTTOM - 96), f"Identical for {T[SPLIT]:.1f} seconds.", font=sub, fill=ASH, anchor="md")
d.text((CX, SAFE_BOTTOM - 44), "Nothing was random.", font=sub, fill=ASH, anchor="md")

out = HERE / "payoff_frame.png"
img.save(out)
print(f"tip separation at this frame: {sep[i] * PX_PER_M:.0f} px")
print(f"wrote {out}")
