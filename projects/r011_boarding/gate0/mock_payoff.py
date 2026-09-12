#!/usr/bin/env python3
"""Gate 0 mock for I73 — "your airline boards the plane worse than no method at all".

NOT a render, and NOT a simulation. It exists for one purpose: to prove the
proposed sentence can be SHOWN in a single frame that a stranger can read with
the sound off and no labels.

    "Airlines board back to front. They measured it against letting people on
     in a completely random order, and the random order was a minute and a half
     faster."

WHAT IS MEASURED AND WHAT IS DRAWN — the line matters, because Gate 0 has been
passed on a beautiful picture before (I15) and the repo paid for it.

  MEASURED, published, citable (Steffen & Hotchkiss 2012, field test in a mock
  757 fuselage, 12 rows x 6 seats, single aisle, 72 real passengers):
      back-to-front  6:11        block          6:54
      random         4:44        Steffen        3:36
  Those four clocks are facts. 371 s / 284 s = back-to-front took 31% LONGER
  than random (base: random's time).

  DRAWN, illustrative, NOT a measurement:
      - which individual seats are full at the shared clock reading
      - where the queue stands in each aisle
  The PATTERN is structurally true and is the whole point: back-to-front fills
  from the tail in a solid block and therefore concentrates every passenger who
  still has to stow a bag into one short stretch of aisle, so they stow ONE AT A
  TIME. A random order scatters them down the length of the cabin, so five or
  six stow AT ONCE. The aisle is the resource; parallelism is the mechanism.
  The reel's own fill pattern will come from our simulation, never from here.

    python3 projects/r011_boarding/gate0/mock_payoff.py
"""
import pathlib
import random

from PIL import Image, ImageDraw, ImageFont

HERE = pathlib.Path(__file__).resolve().parent
FONTS = pathlib.Path(__file__).resolve().parents[3] / "assets" / "fonts"

# ── the published field test ────────────────────────────────────────────────
T_B2F, T_RANDOM = 371, 284                      # 6:11 and 4:44, in seconds
PCT_LONGER = (T_B2F - T_RANDOM) / T_RANDOM * 100
ROWS, SEATS_PER_ROW, PAX = 12, 6, 72
print(f"back-to-front {T_B2F//60}:{T_B2F%60:02d}   random {T_RANDOM//60}:{T_RANDOM%60:02d}")
print(f"back-to-front took {PCT_LONGER:.0f}% longer than random (base: random)")

W, H = 1080, 1920
SAFE_TOP, SAFE_BOTTOM, SIDE, SAFE_R = 270, 1540, 60, 870
CX = (SIDE + SAFE_R) // 2                       # 465 — centre of the SAFE width

INK, SLATE, BONE, ASH, GRAPHITE, MESH = (
    (4, 14, 31), (14, 33, 62), (232, 230, 225), (129, 162, 196), (39, 64, 100), (13, 31, 60))
FAIL = (255, 77, 77)                            # DOMAIN_ACCENT.failure — §6
SEATED = (46, 78, 120)

img = Image.new("RGB", (W, H), INK)
d = ImageDraw.Draw(img)
for gx in range(0, W, 60):
    d.line([(gx, SAFE_TOP), (gx, SAFE_BOTTOM)], fill=MESH, width=1)
for gy in range(SAFE_TOP, SAFE_BOTTOM, 60):
    d.line([(SIDE, gy), (SAFE_R, gy)], fill=MESH, width=1)


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)


def fit(text, name, size, limit):
    """Shrink until it fits. A headline that overruns the safe width is a bug."""
    f = font(name, size)
    while d.textlength(text, font=f) > limit and size > 24:
        size -= 2
        f = font(name, size)
    return f


head = font("ArchivoBlack-Regular.ttf", 62)
clock = font("IBMPlexMono-Bold.ttf", 78)
sub = font("IBMPlexSans-Bold.ttf", 30)
tiny = font("IBMPlexSans-Bold.ttf", 26)

# ── ONE MOMENT, ONE CLOCK. ─────────────────────────────────────────────────
# The frame is the instant the RANDOM cabin finishes: 4:44 on the published
# field test. The random cabin is full and its aisle is empty. The airline's
# cabin still has its front third empty and a queue standing in the aisle
# behind one person stowing a bag. Drawing two finish times on two clocks was
# the first attempt and it showed two different moments, which is not a race.
CAB_W, GAP = 372, 46
CAB_X = (CX - GAP // 2 - CAB_W, CX + GAP // 2)
CAB_TOP, ROW_H = 700, 56
SEAT, AISLE_W = 46, 56
CAB_H = ROWS * ROW_H


def seat_xy(cab, row, seat):
    """seat 0-2 = port side, 3-5 = starboard; the aisle sits between them."""
    col = seat if seat < 3 else seat + 1            # column 3 is the aisle
    x = CAB_X[cab] + 8 + col * (SEAT + 5) + (AISLE_W - SEAT - 5 if seat >= 3 else 0)
    return x, CAB_TOP + row * ROW_H + 6


def aisle_x(cab):
    return CAB_X[cab] + 8 + 3 * (SEAT + 5) + AISLE_W // 2 - 3


# Row 0 is the FRONT (nose). Back-to-front boards rows 11 -> 0, so at any
# moment before it finishes the empty seats are a solid block at the FRONT.
seated_b2f = {(r, s) for r in range(4, ROWS) for s in range(SEATS_PER_ROW)}
seated_b2f |= {(3, s) for s in (0, 1, 4, 5)}
seated_rand = {(r, s) for r in range(ROWS) for s in range(SEATS_PER_ROW)}   # done
occupied = (seated_b2f, seated_rand)

for cab in (0, 1):
    d.rounded_rectangle([CAB_X[cab], CAB_TOP - 24, CAB_X[cab] + CAB_W, CAB_TOP + CAB_H + 18],
                        radius=54, outline=GRAPHITE, width=3)
    for row in range(ROWS):
        for s in range(SEATS_PER_ROW):
            x, y = seat_xy(cab, row, s)
            box = [x, y, x + SEAT, y + SEAT - 10]
            if (row, s) in occupied[cab]:
                d.rounded_rectangle(box, radius=7, fill=SEATED)
                d.rounded_rectangle([x + 9, y + 6, x + SEAT - 9, y + SEAT - 18], radius=5, fill=ASH)
            else:
                d.rounded_rectangle(box, radius=7, outline=GRAPHITE, width=2)

# LEFT aisle — the mechanism, and therefore the brightest thing on the frame.
# One person is stowing a bag at the head of the queue; the eight behind them
# cannot do anything at all, because the aisle is the resource.
ax = aisle_x(0)
HEAD_ROW = 3
for k in range(8):
    y = CAB_TOP + 6 + k * 30
    d.ellipse([ax - 14, y, ax + 14, y + 28], fill=(150, 52, 52) if k < 5 else (198, 64, 64))
hy = CAB_TOP + HEAD_ROW * ROW_H + 2
d.ellipse([ax - 18, hy, ax + 18, hy + 36], fill=FAIL)
d.line([ax + 16, hy + 10, ax + 34, hy + 4], fill=FAIL, width=5)       # the bag going up
d.rectangle([ax + 28, hy - 14, ax + 52, hy + 6], fill=FAIL)

# RIGHT aisle — empty. That is the entire claim: same people, same plane, done.

# ── copy ───────────────────────────────────────────────────────────────────
d.text((CX, SAFE_TOP + 20), f"SAME {PAX} PEOPLE.", font=head, fill=BONE, anchor="ma")
d.text((CX, SAFE_TOP + 94), "SAME PLANE.", font=head, fill=BONE, anchor="ma")
d.text((CX, SAFE_TOP + 186), "SAME MOMENT", font=tiny, fill=ASH, anchor="ma")
d.text((CX, SAFE_TOP + 214), "4:44", font=clock, fill=BONE, anchor="ma")

for cab, (name, state, colour) in enumerate(
        (("BACK TO FRONT", "still boarding", FAIL), ("RANDOM ORDER", "everyone seated", BONE))):
    cabcx = CAB_X[cab] + CAB_W // 2
    d.text((cabcx, CAB_TOP - 96), name,
           font=fit(name, "ArchivoBlack-Regular.ttf", 32, CAB_W), fill=ASH, anchor="ma")
    d.text((cabcx, CAB_TOP - 54), state,
           font=fit(state, "IBMPlexSans-Bold.ttf", 30, CAB_W), fill=colour, anchor="ma")

tail = f"It needs another 1:27. That is {PCT_LONGER:.0f}% longer than no order at all."
d.text((CX, SAFE_BOTTOM - 92), tail,
       font=fit(tail, "IBMPlexSans-Bold.ttf", 31, SAFE_R - SIDE), fill=BONE, anchor="md")
d.text((CX, SAFE_BOTTOM - 44), "Field test, 72 passengers, a mock 757 cabin.",
       font=tiny, fill=ASH, anchor="md")

out = HERE / "payoff_frame.png"
img.save(out)
print(f"cabin bottom y = {CAB_TOP + CAB_H + 18}   footer starts y = {SAFE_BOTTOM - 92 - 31}")
print(f"wrote {out}")
