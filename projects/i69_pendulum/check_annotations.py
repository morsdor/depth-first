#!/usr/bin/env python3
"""Do the drawn annotations ever touch the apparatus, or leave the safe column?

Answered analytically from layout.py + camera.py, before anything is rendered.
Every box here mirrors a block in remotion/src/reels/Pendulum.tsx; if one moves
there it moves here, and this script is what says whether it still fits.

IBM Plex Mono advances exactly 0.6 em, so a text box's width is chars*size*0.6.
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

import numpy as np
import camera as C
import layout as LO

MONO = 0.6
P = LO.pivots()
U = (P[-1] - P[0]); U /= np.linalg.norm(U)
PERP = np.array([U[1], -U[0]])          # up-left, away from the hanging strings

LABEL_N = [0, 4, 8, 11, 14]
LABEL_SIZE, LABEL_OFF = 36, 46
HOOK = (0.0, 5.0)                        # "remember this line" + the promise
B3 = (10.0, 15.5)                        # "only the strings differ" + labels
VARS = (15.5, 20.5)                      # what does and does not change the timing
EQ = (20.5, 29.4)                        # the two equation beats
END = (31.2, 34.0)                       # the closing card, after the reform
RUN = (0.0, 34.0)                        # the headline band exists in every beat


def box(x0, y0, x1, y1):
    return (float(x0), float(y0), float(x1), float(y1))


def text_box(anchor, chars, size, align='right'):
    w, h = chars * size * MONO, size * 1.22
    x1 = anchor[0] if align == 'right' else anchor[0] + w
    return box(x1 - w, anchor[1] - h / 2, x1, anchor[1] + h / 2)


CHECKS = []
for n in LABEL_N:
    a = P[n] + PERP * LABEL_OFF
    CHECKS.append((f'length label n={n} ({LO.LEN_CM[n]:.1f} cm)',
                   text_box(a, 4, LABEL_SIZE), *B3))
CHECKS += [
    # The clear region is a TRIANGLE bounded by the beam, not a rectangle: at
    # y=462 a block may run to x=700, at y=620 only to x=560. Every box below
    # was sized against that profile, not chosen and then checked.
    # Clearance-only: a reservation the strings must never enter, not a drawn
    # box. Excluded from the overlap pass -- the headlines live INSIDE it.
    ('headline band',       box(60, 286, 780, 420), *RUN),
    # Modelled per LINE, not as one rectangle: beat 3's headline is long-then-
    # short, and the rectangle over it falsely collided with the n=14 label.
    # IBM Plex Sans semibold is not monospaced; 0.56 em is a deliberate
    # over-estimate of its average advance.
    # 52px at lineHeight 1.25 = 65px a line, stacked from y=286, half-open.
    ('b3 headline line 1',  box(60, 286, 60 + 26 * 52 * 0.56, 351), *B3),
    ('b3 headline line 2',  box(60, 351, 60 + 17 * 52 * 0.56, 416), *B3),
    ('hook headline',       box(60, 286, 700, 436), *HOOK),
    ('hook promise',        box(60, 447, 480, 580), *HOOK),
    # 430, not 560: at 560 this box ran into the n=8 length label, which the
    # apparatus check cannot see. See the overlap pass below.
    ('range callout',       box(60, 462, 430, 612), *B3),
    ('variables table',     box(60, 448, 560, 620), *VARS),
    ('equation fraction',   box(60, 468, 552, 604), *EQ),
    ('equation result',     box(60, 626, 404, 700), *EQ),
    ('closing follow line', box(60, 462, 620, 556), *END),
]

print(f'{"annotation":34s} {"box":>30s} {"clear":>8s}  safe')
bad = 0
for name, b, t0, t1 in CHECKS:
    g, when = C.clearance(b, t0, t1, step=1 / 6)
    safe = C.in_safe(b)
    flag = '' if (g >= 10 and safe) else '   <-- FAILS'
    if flag:
        bad += 1
    print(f'{name:34s} {f"{b[0]:.0f},{b[1]:.0f} {b[2]:.0f},{b[3]:.0f}":>30s} '
          f'{g:7.1f}px  {str(safe):5s}{flag}')

# The apparatus check above cannot see the annotations colliding with EACH
# OTHER, and they did: the range callout as first drawn overlapped the n=8
# length label by 86x27px, in a beat where both are on screen. Two boxes that
# share screen time must be disjoint, and that is a different question.
print('\nannotations that share screen time must not overlap:')
clash = 0
for i in range(len(CHECKS)):
    for k in range(i + 1, len(CHECKS)):
        (na, a, a0, a1), (nb, b, b0, b1) = CHECKS[i], CHECKS[k]
        if a1 <= b0 or b1 <= a0:                      # never on screen together
            continue
        if 'band' in (na, nb) or na.endswith('band') or nb.endswith('band'):
            continue                                  # a reservation, not a box
        ox = min(a[2], b[2]) - max(a[0], b[0])
        oy = min(a[3], b[3]) - max(a[1], b[1])
        if ox > 0 and oy > 0:
            print(f'  {na} x {nb}: {ox:.0f}x{oy:.0f}px  <-- FAILS')
            clash += 1
bad += clash
print(f'  {"none" if not clash else f"{clash} overlap(s)"}')

print('\nthe marked bob is on screen while the text names it:')
for n, t0, t1, what in [(0, 22.2, 25.0, 'longest'), (14, 26.5, 27.8, 'shortest')]:
    lo = np.full(2, 1e9); hi = -lo
    for t in np.arange(t0, t1 + 1e-9, 1 / 6):
        c, r = C.track(n, float(t))
        lo = np.minimum(lo, c - r); hi = np.maximum(hi, c + r)
    on = lo[0] > 0 and hi[0] < 1080 and lo[1] > 0 and hi[1] < 1920
    print(f'  {what:8s} bob {n:2d}  x {lo[0]:7.1f}..{hi[0]:7.1f}  y {lo[1]:7.1f}..{hi[1]:7.1f}'
          f'  {"ON SCREEN" if on else "*** CLIPPED ***"}')
    bad += 0 if on else 1

print(f'\n{"ALL CLEAR" if not bad else f"{bad} PROBLEM(S)"}')
sys.exit(1 if bad else 0)
