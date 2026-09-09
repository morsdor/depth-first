#!/usr/bin/env python3
"""Gate 0 payoff still for I64 — "One line isn't faster. It's fair."

Numbers are sim.py's, not chosen: 4 tills at 85% utilisation, 300,000 customers,
identical arrivals and identical service times under both disciplines.
95th-percentile wait 11.28 against 8.57, mean wait 2.54 against 2.13. One time
unit is called a minute on screen, which the service mixture earns: baskets
average 30 s and trolleys 3 min, so the mean till visit is 1 min.

Two things are asserted rather than eyeballed, because both have shipped as bugs
before: every shop holds the SAME thirteen people, and no drawn text crosses
Instagram's action rail at x=870.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
SAFE_TOP, SAFE_BOT, SIDE, RAIL = 270, 1540, 60, 870
INK, SLATE, BONE, ASH, GRAPHITE, MESH = (
    '#040E1F', '#0E213E', '#E8E6E1', '#81A2C4', '#274064', '#0D1F3C')
ACCENT, FAILURE = '#51A4FF', '#FF4D4D'      # I64 sits in backlog section 3
F = Path('assets/fonts')
font = lambda n, s: ImageFont.truetype(str(F / n), s)

LANES = [2, 8, 1, 2]
TOTAL = sum(LANES)
YOU_LANE, YOU_DEPTH, YOU_SNAKE = 1, 7, 3

img = Image.new('RGB', (W, H), INK)
d = ImageDraw.Draw(img, 'RGBA')
for g in range(0, W, 45):
    d.line([(g, 0), (g, H)], fill=MESH)
for g in range(0, H, 45):
    d.line([(0, g), (W, g)], fill=MESH)

big, lab, small, mono = (font('ArchivoBlack-Regular.ttf', 72),
                         font('IBMPlexSans-Bold.ttf', 38),
                         font('IBMPlexSans-Bold.ttf', 36),
                         font('IBMPlexMono-Bold.ttf', 36))


def text(xy, s, f, fill, anchor=None):
    """Draw, then refuse to let anything cross the rail — twice-shipped bug."""
    x0, _, x1, _ = d.textbbox(xy, s, font=f, anchor=anchor)
    assert x0 >= SIDE - 2 and x1 <= RAIL + 2, f'{s!r} spans {x0:.0f}..{x1:.0f}'
    d.text(xy, s, font=f, fill=fill, anchor=anchor)


text((SIDE, 300), "One line isn't", big, BONE)
text((SIDE, 382), "faster. It's fair.", big, ACCENT)


def person(cx, cy, col):
    d.ellipse([cx - 9, cy - 21, cx + 9, cy - 3], fill=col)
    d.rounded_rectangle([cx - 12, cy, cx + 12, cy + 19], 6, fill=col)


def till(cx, cy):
    d.rounded_rectangle([cx - 34, cy - 26, cx + 34, cy + 26], 6, fill=GRAPHITE)
    d.rounded_rectangle([cx - 20, cy - 16, cx + 20, cy - 2], 3, fill=ASH)


PH, PITCH, TILL_X = 380, 36, 806
HEAD = {0: 668, 1: 560}        # snake head sits back so its fan has room to open
drawn = []
for s, (y0, title, worst, col) in enumerate([
        (530, 'FOUR LINES', '11.3', FAILURE),
        (952, 'ONE LINE', ' 8.6', ACCENT)]):
    d.rounded_rectangle([SIDE, y0, RAIL, y0 + PH], 12, fill=SLATE,
                        outline=col, width=3)
    text((SIDE + 24, y0 + 18), title, lab, col)
    # p95, NOT the maximum — "worst wait" would have been a false label
    text((RAIL - 24, y0 + 20), f'1 in 20 waits {worst} min', mono, col,
         anchor='ra')
    ty = [y0 + 106 + i * 76 for i in range(4)]
    assert ty[-1] + 30 < y0 + PH, 'the last till hangs out of the panel'
    head = HEAD[s]
    cy = (ty[0] + ty[3]) / 2
    if s == 1:                                 # fan FIRST, so tills sit on top
        for t in ty:
            d.line([(head + 26, cy), (TILL_X - 30, t)], fill=(129, 162, 196, 95),
                   width=3)
    for t in ty:
        till(TILL_X, t)
    n = 0
    if s == 0:
        for i, cnt in enumerate(LANES):
            for k in range(cnt):
                me = (i == YOU_LANE and k == YOU_DEPTH)
                person(head - k * PITCH, ty[i], FAILURE if me else BONE)
                if me:
                    text((head - k * PITCH, ty[i] + 46), 'YOU', small,
                         FAILURE, anchor='ma')
                n += 1
            if i == YOU_LANE:                  # the one trolley jamming a till
                d.rounded_rectangle([head + 24, ty[i] - 20, head + 86,
                                     ty[i] + 12], 4, outline=ASH, width=4)
                for dx in (36, 74):
                    d.ellipse([head + dx - 5, ty[i] + 14,
                               head + dx + 5, ty[i] + 24], fill=ASH)
    else:
        for k in range(TOTAL):
            me = (k == YOU_SNAKE)
            person(head - k * PITCH, cy, ACCENT if me else BONE)
            if me:
                text((head - k * PITCH, cy + 46), 'YOU', small, ACCENT,
                     anchor='ma')
            n += 1
    drawn.append(n)

assert drawn[0] == drawn[1] == TOTAL, f'the shops differ: {drawn}'

text((SIDE, 1372), 'Same tills. Same shoppers.', lab, BONE)
text((SIDE, 1416), 'Same average wait.', lab, BONE)
text((SIDE, 1468), '4 tills · 85% busy · 300,000 shoppers', small, GRAPHITE)
text((SIDE, 1504), 'baskets 30 s, trolleys 3 min', small, GRAPHITE)

for y in (SAFE_TOP, SAFE_BOT):
    d.line([(0, y), (W, y)], fill=(255, 176, 32, 60), width=2)
d.line([(RAIL, 1050), (RAIL, SAFE_BOT)], fill=(255, 176, 32, 60), width=2)

out = Path('projects/i64_queue/gate0/payoff_frame.png')
img.save(out)
print(f'wrote {out} — {drawn[0]} people per shop, asserted equal; '
      f'no text crosses x={RAIL}')
