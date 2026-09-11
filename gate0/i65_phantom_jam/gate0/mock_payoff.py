#!/usr/bin/env python3
"""Gate 0 mock for I65 — "a traffic jam with no cause".

Five minutes of PIL. NOT a render, NOT the reel. It exists only to prove the
approved sentence can be SHOWN:

    "You didn't drive into a traffic jam. The jam drove into YOU -- it's a wave
     that rolls backwards down the motorway at about 20 km/h, and it was built
     out of nothing by people just following the car in front."

Every car on this frame is at a position produced by the real car-following
simulation in ../ring.py. Nothing is placed by hand.

    python3 gate0/i65_phantom_jam/gate0/mock_payoff.py
"""
import pathlib
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import ring  # noqa: E402

HERE = pathlib.Path(__file__).resolve().parent
FONTS = pathlib.Path(__file__).resolve().parents[3] / "assets" / "fonts"

# ── The real run. A jam frame, well after the 10 cm offset has grown up. ─────
T, X, V = ring.simulate(noise=1.0, seed=1)
FRAME = int(np.argmin(np.abs(T - 360.0)))
pos, spd = X[FRAME], V[FRAME]
WAVE = ring.wave_speed(T, X, V)
WAVE_MEASURED_KMH = 20.0   # Sugiyama et al. 2008 -- the CITED figure, not ours
stopped = int((spd < 5 / 3.6).sum())

print(f"frame at t = {T[FRAME]:.0f} s")
print(f"  slowest car   {ring.kmh(spd.min()):6.2f} km/h")
print(f"  fastest car   {ring.kmh(spd.max()):6.2f} km/h")
print(f"  cars under 5 km/h: {stopped} of {ring.N_CARS}")
print(f"  wave speed    {ring.kmh(WAVE):+6.2f} km/h")

# ── Frame. Instagram safe area, not the raw canvas (non-negotiable 1). ──────
W, H = 1080, 1920
SAFE_TOP, SAFE_BOTTOM, SIDE, RAIL = 270, 1540, 60, 210
SAFE_W = W - SIDE - RAIL
CX = SIDE + SAFE_W // 2

INK, SLATE, BONE, ASH, GRAPHITE = (4, 14, 31), (14, 33, 62), (232, 230, 225), (129, 162, 196), (39, 64, 100)
ACCENT = (81, 164, 255)          # DOMAIN_ACCENT.languages -- content_backlog.md §3
AMBER = (255, 176, 32)           # BRAND ANCHOR -- exactly one element

img = Image.new("RGB", (W, H), INK)
d = ImageDraw.Draw(img)


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)


head_f = font("ArchivoBlack-Regular.ttf", 64)
sub = font("IBMPlexSans-Bold.ttf", 30)
mono = font("IBMPlexMono-Bold.ttf", 27)
mono_s = font("IBMPlexMono-Bold.ttf", 22)

for gx in range(0, W, 60):
    d.line([(gx, SAFE_TOP), (gx, SAFE_BOTTOM)], fill=(13, 31, 60), width=1)
for gy in range(SAFE_TOP, SAFE_BOTTOM, 60):
    d.line([(SIDE, gy), (W - SIDE, gy)], fill=(13, 31, 60), width=1)

RCX, RCY, RR = CX, 1055, 285

# The ring has no preferred phase, so ROTATE it to put the jam at 12 o'clock.
# That is what keeps the jam label out of the track instead of on top of it.
slow = pos[spd < 5 / 3.6]
ref = slow[0]
rel = (slow - ref + ring.L_RING / 2) % ring.L_RING - ring.L_RING / 2
JAM_MID = ref + (rel.min() + rel.max()) / 2
JAM_HALF = (rel.max() - rel.min()) / 2 + 9
OFFSET = -JAM_MID


def ring_xy(metres, radius=RR):
    """Track position -> pixels. Increasing metres runs CLOCKWISE on screen."""
    a = 2 * np.pi * ((metres + OFFSET) / ring.L_RING) - np.pi / 2
    return RCX + radius * np.cos(a), RCY + radius * np.sin(a)


d.ellipse([RCX - RR - 34, RCY - RR - 34, RCX + RR + 34, RCY + RR + 34], outline=SLATE, width=68)
d.ellipse([RCX - RR, RCY - RR, RCX + RR, RCY + RR], outline=GRAPHITE, width=2)

for p_, s_ in zip(pos, spd):
    f = float(np.clip(s_ / ring.V_MAX, 0, 1))
    col = tuple(int(GRAPHITE[i] + (ACCENT[i] - GRAPHITE[i]) * f) for i in range(3))
    x, y = ring_xy(p_)
    r = 13
    d.ellipse([x - r, y - r, x + r, y + r], fill=col)

# the jam, marked where the stopped cars actually are
a0 = (JAM_MID - JAM_HALF + OFFSET) / ring.L_RING * 360 - 90
a1 = (JAM_MID + JAM_HALF + OFFSET) / ring.L_RING * 360 - 90
d.arc([RCX - RR - 46, RCY - RR - 46, RCX + RR + 46, RCY + RR + 46], a0, a1, fill=AMBER, width=7)
d.text((RCX, RCY - RR - 132), "THE JAM", font=mono, fill=AMBER, anchor="mm")
d.text((RCX, RCY - RR - 98), f"{stopped} cars stopped, no reason",
       font=mono_s, fill=ASH, anchor="mm")

# the arrow. The jam travels BACKWARDS -- toward DECREASING metres. This is the reel.
TAIL, TIP = JAM_MID - JAM_HALF - 3, JAM_MID - JAM_HALF - 17
for k in range(12):
    t = k / 11
    ax, ay = ring_xy(TAIL + (TIP - TAIL) * t, RR + 46)
    d.ellipse([ax - 4, ay - 4, ax + 4, ay + 4], fill=BONE)
tipx, tipy = ring_xy(TIP - 5, RR + 46)
nx, ny = ring_xy(TIP + 6, RR + 46)
dx, dy = tipx - nx, tipy - ny
n = (dx * dx + dy * dy) ** 0.5
dx, dy = dx / n, dy / n
d.polygon([(tipx, tipy), (tipx - 18 * dx + 11 * dy, tipy - 18 * dy - 11 * dx),
           (tipx - 18 * dx - 11 * dy, tipy - 18 * dy + 11 * dx)], fill=BONE)

d.text((RCX, RCY - 40), f"{WAVE_MEASURED_KMH:.0f} km/h", font=head_f, fill=BONE, anchor="mm")
d.text((RCX, RCY + 22), "BACKWARDS", font=sub, fill=BONE, anchor="mm")
d.text((RCX, RCY + 68), "while every car drives forwards", font=mono_s, fill=ASH, anchor="mm")

d.text((CX, SAFE_TOP + 40), "NOBODY BRAKED.", font=head_f, fill=BONE, anchor="ma")
d.text((CX, SAFE_TOP + 116), "NOBODY CRASHED.", font=head_f, fill=ACCENT, anchor="ma")
d.text((CX, SAFE_TOP + 208), "22 cars. 230 metres of road. No obstacle.",
       font=sub, fill=ASH, anchor="ma")

d.text((CX, SAFE_BOTTOM - 74), "You never drove into it.", font=sub, fill=ASH, anchor="md")
d.text((CX, SAFE_BOTTOM - 22), "It drove into you.", font=head_f, fill=BONE, anchor="md")

out = HERE / "payoff_frame.png"
img.save(out)
print(f"\nsim wave {ring.kmh(WAVE):+.2f} km/h   frame shows the CITED {WAVE_MEASURED_KMH:.0f} km/h")
print(f"wrote {out}")
