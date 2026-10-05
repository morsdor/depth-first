#!/usr/bin/env python3
"""Gate 0 mock for I90 -- "the Uber you get isn't always the closest one".

Five minutes of PIL. NOT a render, NOT the reel. Exists only to prove the sentence can be SHOWN:

    "The Uber you get isn't always the closest one -- it waits a few seconds and
     matches everyone at once, so the city's total wait comes out shorter."

THE MINUTES BELOW ARE ILLUSTRATIVE. They are a hand-built two-rider, two-car case, chosen so the
effect is visible in one frame -- they are NOT measured and say so on the frame. The real build
runs the matching on a real road graph (Stage 3) and puts ITS numbers on screen; nothing here
carries into the reel except the composition.

The case: car 1 is nearest to BOTH riders. Serving whoever asked first grabs it for them and leaves
the other rider the far car. Looking at both requests together gives car 1 to the rider who would
otherwise wait longest -- you wait a little longer, the city waits much less.

    .venv/bin/python projects/r019_dispatch/gate0/mock_payoff.py
"""
import pathlib

import numpy as np
from PIL import Image, ImageDraw, ImageFont

# ── Illustrative minutes (NOT measured) ──────────────────────────────────────
ETA = {('you', 1): 1, ('you', 2): 3, ('them', 1): 2, ('them', 2): 9}
NEAREST_FIRST = [('you', 1), ('them', 2)]      # whoever asked first takes the closest car
MATCHED = [('you', 2), ('them', 1)]            # both requests looked at together
total = lambda pairs: sum(ETA[p] for p in pairs)
assert total(NEAREST_FIRST) == 10 and total(MATCHED) == 5

# ── Frame. Instagram safe area, not the raw canvas (CLAUDE.md non-negotiable 1) ─
W, H = 1080, 1920
SAFE_TOP, SAFE_BOTTOM, SIDE, RAIL = 270, 1540, 60, 210
SAFE_W = W - SIDE - RAIL
X0, X1 = SIDE, SIDE + SAFE_W

INK, SLATE, BONE, ASH, GRAPHITE, MESH, AMBER = (
    (4, 14, 31), (14, 33, 62), (232, 230, 225), (129, 162, 196), (39, 64, 100), (13, 31, 60), (255, 176, 32))
ACCENT = (0, 214, 247)                         # DOMAIN_ACCENT.infrastructure -- §2 Maps and real geography

FONTS = pathlib.Path(__file__).resolve().parents[3] / 'assets' / 'fonts'
font = lambda name, size: ImageFont.truetype(str(FONTS / name), size)
mono, mono_s = font('IBMPlexMono-Bold.ttf', 30), font('IBMPlexMono-Bold.ttf', 22)
sans = font('IBMPlexSans-Bold.ttf', 30)

# positions in the map box (x 60-870, y 500-1250)
POS = {('rider', 'you'): (430, 890), ('rider', 'them'): (720, 980),
       ('car', 1): (540, 800), ('car', 2): (120, 1100)}
# where each ETA pill sits -- placed by hand so no pill lands on a pin, a car or another route
PILL = {('nearest', 'you'): (430, 790), ('nearest', 'them'): (560, 1058),
        ('matched', 'you'): (245, 958), ('matched', 'them'): (700, 862)}


def fit_font(draw, text, max_w, start=76, floor=40):
    size = start
    f = font('ArchivoBlack-Regular.ttf', size)
    while draw.textlength(text, font=f) > max_w and size > floor:
        size -= 2
        f = font('ArchivoBlack-Regular.ttf', size)
    return f


def dashed(d, a, b, fill, width=4, dash=18, gap=14):
    L = np.hypot(b[0] - a[0], b[1] - a[1])
    ux, uy = (b[0] - a[0]) / L, (b[1] - a[1]) / L
    s = 0.0
    while s < L:
        e = min(s + dash, L)
        d.line([a[0] + ux * s, a[1] + uy * s, a[0] + ux * e, a[1] + uy * e], fill=fill, width=width)
        s += dash + gap


def pill(d, centre, text, fg):
    w = d.textlength(text, font=mono_s) + 26
    x, y = centre
    d.rounded_rectangle([x - w / 2, y - 21, x + w / 2, y + 21], 21, fill=SLATE, outline=fg, width=2)
    d.text((x, y), text, font=mono_s, fill=fg, anchor='mm')


def car(d, p):
    x, y = p
    d.rounded_rectangle([x - 34, y - 17, x + 34, y + 17], 9, fill=BONE)
    d.rounded_rectangle([x - 18, y - 11, x + 18, y + 11], 5, fill=INK)
    for dx in (-20, 20):
        d.ellipse([x + dx - 7, y + 12, x + dx + 7, y + 26], fill=GRAPHITE)


def pin(d, p, label, fill):
    x, y = p
    d.polygon([(x - 16, y - 8), (x + 16, y - 8), (x, y + 30)], fill=fill)
    d.ellipse([x - 24, y - 40, x + 24, y + 8], fill=fill)
    d.ellipse([x - 9, y - 25, x + 9, y - 7], fill=INK)
    d.text((x, y + 54), label, font=mono_s, fill=fill, anchor='mm')


def main():
    img = Image.new('RGB', (W, H), INK)
    d = ImageDraw.Draw(img)
    rng = np.random.default_rng(85)

    # drafting mesh on the ground (§3a) -- the ground is never a flat fill
    for gx in range(0, W, 60):
        d.line([gx, 0, gx, H], fill=MESH, width=1)
    for gy in range(0, H, 60):
        d.line([0, gy, W, gy], fill=MESH, width=1)

    # ── the city: jittered street grid, two avenues, a river -- reads as a map, not a diagram
    top, bottom = 500, 1250
    d.rectangle([X0, top, X1, bottom], fill=(8, 22, 46))
    river = [(X0 + 560 + 40 * np.sin(y / 120.0), y) for y in range(top, bottom + 1, 10)]
    d.line(river, fill=SLATE, width=44)
    for i, gx in enumerate(range(X0 + 20, X1, 82)):
        j = rng.uniform(-10, 10)
        d.line([gx + j, top, gx - j, bottom], fill=GRAPHITE, width=2)
    for i, gy in enumerate(range(top + 30, bottom, 78)):
        j = rng.uniform(-8, 8)
        d.line([X0, gy + j, X1, gy - j], fill=GRAPHITE, width=2)
    d.line([X0, bottom - 40, X1 - 160, top + 60], fill=GRAPHITE, width=5)        # a diagonal avenue
    d.line([X0 + 120, top, X1, bottom - 200], fill=GRAPHITE, width=5)

    # what Uber would do if it served requests one at a time: first caller takes car 1 (dashed, dim)
    for who, c in NEAREST_FIRST:
        a, b = POS[('rider', who)], POS[('car', c)]
        dashed(d, a, b, ASH)
        pill(d, PILL[('nearest', who)], f'{ETA[(who, c)]} MIN', ASH)
    # what it does instead: both requests looked at together (solid, accent)
    for who, c in MATCHED:
        a, b = POS[('rider', who)], POS[('car', c)]
        d.line([a, b], fill=ACCENT, width=7)
        pill(d, PILL[('matched', who)], f'{ETA[(who, c)]} MIN', ACCENT)

    car(d, POS[('car', 1)])
    car(d, POS[('car', 2)])
    pin(d, POS[('rider', 'you')], 'YOU', BONE)
    pin(d, POS[('rider', 'them')], 'SOMEONE ELSE', BONE)

    # ── the two totals -- the sentence, shown
    d.text((X0, 1300), 'ONE AT A TIME', font=mono, fill=ASH)
    d.text((X1, 1300), f'{ETA[NEAREST_FIRST[0]]} + {ETA[NEAREST_FIRST[1]]} = {total(NEAREST_FIRST)} MIN', font=mono, fill=ASH, anchor='ra')
    d.text((X0, 1360), 'MATCHED TOGETHER', font=mono, fill=ACCENT)
    d.text((X1, 1360), f'{ETA[MATCHED[0]]} + {ETA[MATCHED[1]]} = {total(MATCHED)} MIN', font=mono, fill=AMBER, anchor='ra')   # the one amber element

    d.text((X0, 1470), 'MOCK  -  ILLUSTRATIVE MINUTES, NOT TO SCALE, NOT MEASURED', font=mono_s, fill=GRAPHITE)

    # headline drawn LAST so nothing paints over it
    lines = ['THE CLOSEST CAR', "ISN'T ALWAYS YOURS."]
    f = fit_font(d, max(lines, key=len), SAFE_W)
    for i, ln in enumerate(lines):
        d.text((X0 + SAFE_W / 2, 330 + i * 92), ln, font=f, fill=BONE, anchor='mm')

    out = pathlib.Path(__file__).with_name('payoff_frame.png')
    img.save(out)
    print('wrote', out)


if __name__ == '__main__':
    main()
