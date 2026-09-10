#!/usr/bin/env python3
"""I69 payoff still — fifteen weights caught mid-wave.

Every bob position here is INTEGRATED, not drawn. The script solves the fifteen
lengths against the EXACT nonlinear period, runs RK4 on theta'' = -(g/L) sin th
to the chosen instant, and plots where the bobs actually are.

Viewpoint: above and to the left of the rail, near-axonometric. A true
perspective camera sat at the end of the row bunches the far half into a knot
(tried, and the wave stopped reading as a wave) -- the real demos are shot from
high and off to one side for exactly that reason.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
SAFE_TOP, SAFE_BOT, SIDE, RAIL = 270, 1540, 60, 870
INK, SLATE, BONE, ASH = '#040E1F', '#0E213E', '#E8E6E1', '#81A2C4'
GRAPHITE, MESH, AMBER, DATA = '#274064', '#0D1F3C', '#FFB020', '#AD88FF'

G, TAU, N0, COUNT = 9.80665, 60.0, 51, 15
THETA0 = np.radians(24.0)          # a real demo amplitude, and a visible swing
NS = np.arange(N0, N0 + COUNT)


def agm_period(L, th0):
    """Exact nonlinear period by the arithmetic-geometric mean."""
    a, b = 1.0, np.cos(th0 / 2.0)
    for _ in range(60):
        a, b = (a + b) / 2.0, np.sqrt(a * b)
    return 2 * np.pi * np.sqrt(L / G) / a


C0 = agm_period(1.0, THETA0) / (2 * np.pi * np.sqrt(1.0 / G))
LENGTHS = G * (TAU / NS) ** 2 / (4 * np.pi ** 2) / C0 ** 2


def integrate(L, th0, t_end, dt=2e-4):
    n = int(round(t_end / dt))
    th, om = np.array(th0, float), np.zeros(len(L))
    k = G / np.asarray(L, float)
    acc = lambda x: -k * np.sin(x)
    for _ in range(n):
        a1, b1 = om, acc(th)
        a2, b2 = om + .5 * dt * b1, acc(th + .5 * dt * a1)
        a3, b3 = om + .5 * dt * b2, acc(th + .5 * dt * a2)
        a4, b4 = om + dt * b3, acc(th + dt * a3)
        th = th + dt / 6 * (a1 + 2 * a2 + 2 * a3 + a4)
        om = om + dt / 6 * (b1 + 2 * b2 + 2 * b3 + b4)
    return th


# Neighbours drift apart by 2*pi*t/TAU of phase, so the row spans exactly one
# full wavelength at t = TAU / (COUNT - 1). That is the iconic frame.
T_WAVE = TAU / (COUNT - 1)
theta = integrate(LENGTHS, np.full(COUNT, THETA0), T_WAVE)
# Ghosts are real earlier states, not smears -- each bob is integrated to its
# own position a quarter and a half second back.
# One small bright dot per bob, not a faint big one: purple at low alpha
# over ink goes muddy and reads as dirt rather than motion.
GHOSTS = [(0.20, 150), (0.40, 74)]
ghost_th = [integrate(LENGTHS, np.full(COUNT, THETA0), T_WAVE - dt)
            for dt, _ in GHOSTS]

# ── projection ──────────────────────────────────────────────────────────────
# The rail runs up and to the right; strings hang down the screen; the swing
# axis is the rail's perpendicular, seen obliquely, so it tips slightly down.
ROW, SKEW, Y_BASE, CX0 = 29.0, 37.0, 1090.0, 195.0
PPM, SHRINK = 800.0, 0.018
SWING = np.array([0.96, 0.21])          # projected swing direction, unit-ish
DOWN = np.array([0.0, 1.0])
TITLE_BOT, FOOT_TOP = 500, 1372         # the band the apparatus must live in

img = Image.new('RGB', (W, H), INK)
d = ImageDraw.Draw(img, 'RGBA')
for y in range(0, H, 45):
    d.line([(0, y), (W, y)], fill=MESH, width=1)
for x in range(0, W, 45):
    d.line([(x, 0), (x, H)], fill=MESH, width=1)

F = lambda p, s: ImageFont.truetype(f'assets/fonts/{p}', s)
archivo, mono, sans = (F('ArchivoBlack-Regular.ttf', 72),
                       F('IBMPlexMono-Bold.ttf', 36), F('IBMPlexSans-Bold.ttf', 40))


def text(xy, s, f, fill, anchor=None):
    x0, _, x1, _ = d.textbbox(xy, s, font=f, anchor=anchor)
    assert x0 >= SIDE - 2 and x1 <= RAIL + 2, f'{s!r} spans {x0:.0f}..{x1:.0f}'
    d.text(xy, s, font=f, fill=fill, anchor=anchor)


piv, bob, scl = [], [], []
for n in range(COUNT):
    s = 1.0 - SHRINK * n
    p = np.array([CX0 + SKEW * n, Y_BASE - ROW * n])
    rod = (DOWN * np.cos(theta[n]) + SWING * np.sin(theta[n])) * LENGTHS[n] * PPM * s
    piv.append(p); bob.append(p + rod); scl.append(s)

# the rail every string hangs from
a = np.array(piv[0]) - np.array([SKEW, -ROW]) * 0.85
b = np.array(piv[-1]) + np.array([SKEW, -ROW]) * 0.85
# thin and dim on purpose: the rail must not out-shout the curve of bobs
d.line([tuple(a), tuple(b)], fill=GRAPHITE, width=9)
d.line([tuple(a + [0, -4]), tuple(b + [0, -4])], fill=SLATE, width=4)

def rod_at(n, th, s):
    return (DOWN * np.cos(th) + SWING * np.sin(th)) * LENGTHS[n] * PPM * s


for gi, (_, alpha) in enumerate(GHOSTS):      # trails behind everything
    for n in range(COUNT):
        gx, gy = np.array(piv[n]) + rod_at(n, ghost_th[gi][n], scl[n])
        r = 22 * scl[n] * (0.42 - 0.13 * gi)
        d.ellipse([gx - r, gy - r, gx + r, gy + r], fill=(173, 136, 255, alpha))

for n in reversed(range(COUNT)):          # far ones first, near ones in front
    s, (x, y) = scl[n], bob[n]
    d.line([tuple(piv[n]), (x, y)], fill=(129, 162, 196, int(140 + 110 * s)),
           width=max(2, int(4 * s)))
    d.ellipse([piv[n][0] - 5, piv[n][1] - 5, piv[n][0] + 5, piv[n][1] + 5], fill=SLATE)
    r = 22 * s
    d.ellipse([x - r - 4, y - r - 4, x + r + 4, y + r + 4], fill=INK)
    d.ellipse([x - r, y - r, x + r, y + r], fill=(173, 136, 255, int(165 + 90 * s)))
    d.ellipse([x - r * .45 - 2, y - r * .45 - 2, x - r * .45 + 6, y - r * .45 + 6],
              fill=(232, 230, 225, 200))

bx = [p[0] for p in bob]; by = [p[1] for p in bob]
assert min(by) - 24 > TITLE_BOT, f'a bob is in the title band ({min(by):.0f})'
assert max(by) + 24 < FOOT_TOP, f'a bob sits on the footer ({max(by):.0f})'
assert min(bx) - 24 > SIDE and max(bx) + 24 < RAIL, \
    f'the wave is wider than the safe column ({min(bx):.0f}..{max(bx):.0f})'
assert min(p[1] for p in piv) - 22 > TITLE_BOT, 'the rail is in the title'

text((SIDE, 286), 'FIFTEEN WEIGHTS.', archivo, BONE)
text((SIDE, 362), 'FIFTEEN STRINGS.', archivo, AMBER)
text((SIDE, 452), 'Each one cut a little longer than the last.', sans, ASH)

text((SIDE, 1400), f'{T_WAVE:.1f} s after they were let go', mono, DATA)
text((SIDE, 1446), f'{LENGTHS[0]*100:.0f} cm of string down to {LENGTHS[-1]*100:.0f} cm', mono, ASH)
text((SIDE, 1492), 'nothing is connected to anything', mono, ASH)

img.save('projects/r008_pendulum/gate0/payoff_frame.png')
print(f'wave instant t = {T_WAVE:.3f} s   angles '
      f'{np.degrees(theta).min():+.1f}° .. {np.degrees(theta).max():+.1f}°')
print(f'lengths {LENGTHS[0]*100:.1f} .. {LENGTHS[-1]*100:.1f} cm   C = {C0:.5f}')
print(f'bobs span x {min(bx):.0f}..{max(bx):.0f}  y {min(by):.0f}..{max(by):.0f}')
