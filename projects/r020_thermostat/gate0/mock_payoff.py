"""Gate 0 artefact for I91 — the payoff frame, drawn once, before any build.

NOT the reel and NOT a render: the five-minute still CLAUDE.md demands so the
concept can be killed for a dollar instead of a day.

Redrawn 2026-10-06 when the owner chose "thermostat" (heat or AC) over "AC". The lead case
is HEATING, chosen before it was run: it is in season, DOE's published figure and the
Canadian twin-house measurement are both for heating, and a gas furnace's efficiency does
not move with outdoor temperature, so the toy model is least wrong there.

Two identical houses, one cold day, the end-of-day tally. The numbers come from
`sim_sketch.py` (a one-zone heat balance with placeholder parameters fixed before the
comparison). They are Gate-0 LEADS, not measurements; Stage 3 replaces them with a model
that is checked against the published ordering first.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

import sim_sketch as S

W, H = 1080, 1920
GROUND = (4, 14, 31)
INK = (232, 230, 225)
DIM = (129, 162, 196)
WALL = (13, 31, 60)
ROOF = (28, 44, 74)
ACCENT = (0xAD, 0x88, 0xFF)   # DOMAIN_ACCENT.data — §1 "Things you touch every day"
AMBER = (0xFF, 0xB0, 0x20)    # the ONE amber element on the frame: the saving

FONT = str(Path(__file__).resolve().parents[3] / "assets" / "fonts") + "/"
f_head = ImageFont.truetype(FONT + "ArchivoBlack-Regular.ttf", 52)
f_big = ImageFont.truetype(FONT + "ArchivoBlack-Regular.ttf", 96)
f_num = ImageFont.truetype(FONT + "ArchivoBlack-Regular.ttf", 66)
f_lab = ImageFont.truetype(FONT + "IBMPlexSans-Bold.ttf", 34)
f_cap = ImageFont.truetype(FONT + "IBMPlexSans-Bold.ttf", 40)
f_mono = ImageFont.truetype(FONT + "IBMPlexMono-Bold.ttf", 26)

# ---- figures: from the sketch model, printed so nothing on the frame is typed by hand ----
A = S.day_heat(setback=False)
B = S.day_heat(setback=True)
assert abs(A["T_end"] - S.SET_H) < 0.05 and abs(B["T_end"] - S.SET_H) < 0.05
cost_a, cost_b = A["therms"] * S.PRICE_THERM, B["therms"] * S.PRICE_THERM
saving = 1 - B["therms"] / A["therms"]
flat_out_h = sum(1 for (h, _), q in zip(B["hist"], B["fur"]) if h >= 17 and q >= S.FURN_CAP - 1) / 60.0
print(f"LEAD held at {S.SET_H:.0f}   {A['therms']:.2f} therms  ${cost_a:.2f}   (gas ${S.PRICE_THERM}/therm is a placeholder)")
print(f"LEAD set back {S.BACK_H:.0f}  {B['therms']:.2f} therms  ${cost_b:.2f}   house fell to {B['low']:.0f}°F")
print(f"LEAD saving {saving:.1%}; furnace ran flat out {flat_out_h:.1f} h after return")

img = Image.new("RGB", (W, H), GROUND)

# faint accent glow behind the houses — the ground is never a flat fill (non-negotiable 2)
yy, xx = np.mgrid[0:H, 0:W]
r = np.sqrt(((xx - 465) / 700.0) ** 2 + ((yy - 700) / 560.0) ** 2)
glow = np.clip(1.0 - r, 0, 1) ** 2 * 0.18
arr = np.asarray(img).astype(float)
arr += glow[..., None] * np.array(ACCENT, dtype=float)
img = Image.fromarray(np.clip(arr, 0, 255).astype("uint8"))
d = ImageDraw.Draw(img)


def ctext(cx, y, s, font, fill):
    w = d.textlength(s, font=font)
    d.text((cx - w / 2, y), s, font=font, fill=fill)


def house(x0, y0, w):
    """Front elevation. Everything drawn is what a stranger names with the sound off: a house,
    a door, windows, a chimney, snow on the roof, a thermostat on the wall."""
    top = y0 + 130
    d.rectangle([x0 + w - 90, y0 + 40, x0 + w - 60, top - 10], fill=ROOF, outline=DIM, width=3)   # chimney
    for k, (dx, dy, rr) in enumerate([(-8, -22, 12), (6, -48, 16), (-4, -80, 20)]):               # smoke
        d.ellipse([x0 + w - 75 + dx - rr, y0 + 40 + dy - rr, x0 + w - 75 + dx + rr, y0 + 40 + dy + rr],
                  outline=DIM, width=3)
    d.polygon([(x0 - 6, top + 6), (x0 + w / 2, y0), (x0 + w + 6, top + 6)], fill=ROOF)
    d.polygon([(x0 + w / 2 - 70, y0 + 52), (x0 + w / 2, y0), (x0 + w / 2 + 70, y0 + 52)], fill=INK)   # snow cap
    d.polygon([(x0 + w / 2 - 70, y0 + 52), (x0 + w / 2 + 70, y0 + 52), (x0 + w / 2 + 46, y0 + 74),
               (x0 + w / 2 - 46, y0 + 74)], fill=ROOF)
    d.rectangle([x0 + 14, top, x0 + w - 14, top + 250], fill=WALL, outline=DIM, width=3)
    for wx in (x0 + 44, x0 + w - 44 - 90):                       # lit windows
        d.rectangle([wx, top + 40, wx + 90, top + 130], fill=(196, 214, 238), outline=DIM, width=3)
        d.line([wx + 45, top + 40, wx + 45, top + 130], fill=DIM, width=3)
        d.line([wx, top + 85, wx + 90, top + 85], fill=DIM, width=3)
    dx = x0 + w / 2 - 28                                          # door
    d.rectangle([dx, top + 150, dx + 56, top + 250], fill=ROOF, outline=DIM, width=3)
    d.ellipse([dx + 40, top + 198, dx + 48, top + 206], fill=INK)
    tx, ty = x0 + 70, top + 200                                   # thermostat on the wall
    d.ellipse([tx - 30, ty - 30, tx + 30, ty + 30], fill=(20, 40, 76), outline=ACCENT, width=4)
    ctext(tx, ty - 15, "70°", f_mono, INK)


def bill(x0, y0, w, sub, dollars):
    d.rounded_rectangle([x0, y0, x0 + w, y0 + 190], radius=18, fill=(20, 40, 76), outline=DIM, width=3)
    ctext(x0 + w / 2, y0 + 16, "TODAY'S HEATING", f_mono, DIM)
    ctext(x0 + w / 2, y0 + 62, f"${dollars:.2f}", f_num, INK)
    ctext(x0 + w / 2, y0 + 148, sub, f_mono, DIM)


# ---- layout inside the safe area: x 60–870, y 270–1540 ----
ctext(462, 300, "SAME HOUSE.", f_head, INK)
ctext(462, 366, "SAME COLD DAY.", f_head, INK)

HW = 320
LX, RX = 70, 470
house(LX, 530, HW)
house(RX, 530, HW)
ctext(LX + HW / 2, 950, "70° ALL DAY", f_lab, INK)
ctext(RX + HW / 2, 950, "62° 8 AM – 5 PM", f_lab, INK)

bill(LX, 1030, HW, f"{A['therms']:.2f} therms", cost_a)
bill(RX, 1030, HW, f"{B['therms']:.2f} therms", cost_b)

ctext(462, 1280, f"{saving:.0%} LESS", f_big, AMBER)
ctext(462, 1410, f"The furnace ran flat out for {flat_out_h:.1f} hours", f_cap, INK)
ctext(462, 1462, "when they got home. Still cost less.", f_cap, INK)

# outside the safe area on purpose: this is a sketch, and it says so
ctext(540, 1700, "GATE 0 SKETCH — NOT A RENDER", f_mono, DIM)
ctext(540, 1738, "toy one-zone model, placeholder parameters", f_mono, DIM)
ctext(540, 1776, "figures are LEADS until Stage 3", f_mono, DIM)

out = Path(__file__).resolve().parent / "payoff_frame.png"
img.save(out)
print("wrote", out)
