#!/usr/bin/env python3
"""Gate 0 payoff still for I58 — "The Sun pulls 179x harder. The Moon makes the tide."

Every figure on the frame is computed here from published orbital constants and
Newtonian gravity. Nothing is recalled and nothing is drawn to taste:

  * the 178.7x direct-pull ratio is GM/d^2 for each body,
  * the two ocean shapes are the EQUILIBRIUM TIDE, eta(t) = K(3cos^2 t - 1)/2
    with K = GM R^2 / (g d^3), drawn with ONE shared exaggeration so the 2.18x
    between them is the real ratio and not a drawing choice,
  * the M2 period is derived from sidereal periods and checked against the
    published tidal constituent to under a second.

No network: this is pure arithmetic, so the gate is not blocked by the egress
policy that refuses NOAA in this container.

Deliberately NOT claimed on this frame: that these two bulges sweep around the
Earth and produce your local high tides. Real ocean tides are set by basin
resonance and amphidromic systems, and the equilibrium tide is the FORCING, not
the observed water level. The frame is about the force. See GATE0.md sec 7.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math

# ── constants (CODATA G; IAU / JPL masses and mean distances) ────────────────
G       = 6.67430e-11
M_MOON  = 7.346e22
M_SUN   = 1.98847e30
R_E     = 6.3710e6
D_MOON  = 3.84399e8
D_SUN   = 1.495979e11
g0      = 9.80665

# ── the physics, computed ────────────────────────────────────────────────────
pull_sun   = G * M_SUN  / D_SUN**2          # direct gravitational pull on Earth
pull_moon  = G * M_MOON / D_MOON**2
PULL_RATIO = pull_sun / pull_moon

K_moon = G * M_MOON * R_E**2 / (g0 * D_MOON**3)   # equilibrium tide amplitude, m
K_sun  = G * M_SUN  * R_E**2 / (g0 * D_SUN**3)
TIDE_RATIO = K_sun / K_moon                        # sun's tide as a fraction of moon's

T_ROT, T_ORB = 23.9344696 / 24.0, 27.321661        # days, sidereal
LUNAR_DAY = 1.0 / (1.0 / T_ROT - 1.0 / T_ORB) * 24 # hours
M2 = LUNAR_DAY / 2

assert abs(M2 - 12.4206012) * 3600 < 1.0, f"M2 off by {abs(M2-12.4206012)*3600:.2f}s"
assert 178 < PULL_RATIO < 180, PULL_RATIO
assert 0.44 < TIDE_RATIO < 0.47, TIDE_RATIO
assert 0.35 < K_moon < 0.36 and 0.16 < K_sun < 0.17, (K_moon, K_sun)

def eta(theta, K):
    """Equilibrium tide height at angle theta from the tide-raising body."""
    return K * (3 * math.cos(theta) ** 2 - 1) / 2

# ── canvas ───────────────────────────────────────────────────────────────────
W, H = 1080, 1920
SAFE_TOP, SAFE_BOT, SIDE, RAIL = 270, 1540, 60, 870
GROUND, MESH, GRAPHITE = '#040E1F', '#0D1F3C', '#274064'
INK, DIM, ACCENT = '#E8E6E1', '#81A2C4', '#00D6F7'   # sec 2 -> infrastructure

F = Path('assets/fonts')
def font(name, size): return ImageFont.truetype(str(F / name), size)
BIG  = font('ArchivoBlack-Regular.ttf', 62)
LAB  = font('IBMPlexSans-Bold.ttf', 34)
SM   = font('IBMPlexSans-Bold.ttf', 30)
MONO = font('IBMPlexMono-Bold.ttf', 46)
MONOS= font('IBMPlexMono-Bold.ttf', 28)

img = Image.new('RGB', (W, H), GROUND)
d = ImageDraw.Draw(img, 'RGBA')
for gx in range(0, W, 45): d.line([(gx, 0), (gx, H)], fill=MESH)
for gy in range(0, H, 45): d.line([(0, gy), (W, gy)], fill=MESH)

placed = []                                   # (x, y, text, font) for the rail assert
def text(xy, s, f, fill):
    d.text(xy, s, font=f, fill=fill)
    placed.append((xy[0], xy[1], s, f))

# ── title ────────────────────────────────────────────────────────────────────
text((SIDE, 292), 'The Sun pulls',        BIG, INK)
text((SIDE, 364), '179x harder.',         BIG, INK)
text((SIDE, 436), 'The Moon makes',       BIG, ACCENT)
text((SIDE, 508), 'the tide.',            BIG, ACCENT)

# ── one panel per body ───────────────────────────────────────────────────────
R_PX     = 96                                 # drawn Earth radius
TIDE_PX  = 34 / K_moon                        # ONE scale for both -> ratio is real
EXAG     = TIDE_PX / (R_PX / R_E)             # how many times sea level is stretched

def earth(r_solid):
    """A disc that reads as Earth: ocean ground plus a few landmasses, masked
    to the circle so nothing spills. Shapes are indicative, not cartographic."""
    n = r_solid * 2
    e = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    ed = ImageDraw.Draw(e)
    ed.ellipse([0, 0, n - 1, n - 1], fill=GRAPHITE)
    land = [[(.16,.30),(.44,.22),(.52,.42),(.38,.60),(.20,.52)],
            [(.56,.16),(.86,.26),(.80,.46),(.60,.40)],
            [(.44,.66),(.66,.62),(.72,.86),(.50,.92)],
            [(.06,.62),(.20,.66),(.18,.80),(.04,.74)]]
    for poly in land:
        ed.polygon([(x * n, y * n) for x, y in poly], fill=DIM)
    mask = Image.new('L', (n, n), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, n - 1, n - 1], fill=255)
    e.putalpha(mask)
    return e


def panel(top, name, K, is_moon):
    d.rounded_rectangle([SIDE, top, RAIL, top + 400], 14,
                        outline=ACCENT if is_moon else GRAPHITE, width=3)
    text((SIDE + 26, top + 18), name, LAB, ACCENT if is_moon else DIM)

    cy, bx = top + 258, SIDE + 116
    br = 54 if not is_moon else 24
    d.ellipse([bx - br, cy - br, bx + br, cy + br],
              fill=INK if not is_moon else DIM)
    if not is_moon:
        for k in range(12):
            a = k * math.pi / 6
            d.line([(bx + math.cos(a) * (br + 14), cy + math.sin(a) * (br + 14)),
                    (bx + math.cos(a) * (br + 30), cy + math.sin(a) * (br + 30))],
                   fill=GRAPHITE, width=4)

    # PULL, to scale: the Moon's bar is the Sun's divided by 178.7
    bar_x, bar_w = SIDE + 26, 300
    w = bar_w if not is_moon else max(2.0, bar_w / PULL_RATIO)
    text((bar_x, top + 76), 'PULL ON EARTH', SM, DIM)
    d.rectangle([bar_x, top + 118, bar_x + w, top + 136],
                fill=INK if not is_moon else ACCENT)

    # the ocean: equilibrium tide envelope, filled, over a solid Earth
    ex = RAIL - 156
    r_solid = R_PX - 30
    env = [(ex + math.cos(math.radians(i)) * (R_PX + eta(math.radians(i), K) * TIDE_PX),
            cy + math.sin(math.radians(i)) * (R_PX + eta(math.radians(i), K) * TIDE_PX))
           for i in range(361)]
    d.polygon(env, fill=(0, 214, 247, 70) if is_moon else (129, 162, 196, 55))
    d.line(env + [env[0]], fill=ACCENT if is_moon else DIM, width=5)
    e = earth(r_solid)
    img.paste(e, (ex - r_solid, cy - r_solid), e)
    text((bar_x, top + 344), f'tide  {K*100:.0f} cm', MONOS,
         ACCENT if is_moon else DIM)
    return cy


panel(620, 'THE SUN',  K_sun,  False)
panel(1050, 'THE MOON', K_moon, True)

# ── the carried number ───────────────────────────────────────────────────────
text((SIDE, 1462), 'PULL', SM, DIM)
text((SIDE + 108, 1450), f'{PULL_RATIO:,.0f}x', MONO, INK)
text((SIDE + 330, 1462), 'TIDE', SM, DIM)
text((SIDE + 438, 1450), f'{TIDE_RATIO:.2f}x', MONO, ACCENT)
text((SIDE, 1506), f'both seas exaggerated x{EXAG:,.0f}', MONOS, DIM)

# ── invariants that have shipped as bugs before ──────────────────────────────
boxes = []
for x, y, s_, f in placed:
    w_ = d.textlength(s_, font=f)
    h_ = f.size * 1.15
    assert x + w_ <= RAIL + 1, f'{s_!r} crosses the action rail'
    assert SAFE_TOP - 1 <= y and y + h_ <= SAFE_BOT + 1, f'{s_!r} outside the safe area'
    boxes.append((x, y, x + w_, y + h_, s_))
for i in range(len(boxes)):
    for j in range(i + 1, len(boxes)):
        ax0, ay0, ax1, ay1, at = boxes[i]
        bx0, by0, bx1, by1, bt = boxes[j]
        if ax0 < bx1 and bx0 < ax1 and ay0 < by1 and by0 < ay1:
            raise AssertionError(f'text overlaps: {at!r} and {bt!r}')

d.line([(0, SAFE_TOP), (W, SAFE_TOP)], fill=(255, 77, 77), width=3)
d.line([(0, SAFE_BOT), (W, SAFE_BOT)], fill=(255, 77, 77), width=3)

out = Path('projects/r007_tides/gate0/payoff_frame.png')
img.save(out)
print(f'sun pull / moon pull      : {PULL_RATIO:.1f}x')
print(f'moon equilibrium tide     : {K_moon*100:.1f} cm')
print(f'sun  equilibrium tide     : {K_sun*100:.1f} cm   ({TIDE_RATIO:.3f}x the Moon)')
print(f'moon/sun tide ratio       : {1/TIDE_RATIO:.3f}x')
print(f'lunar day                 : {LUNAR_DAY:.5f} h')
print(f'M2 (half a lunar day)     : {M2:.7f} h  vs published 12.4206012 h')
print(f'sea-level exaggeration    : x{EXAG:,.0f}')
print(f'wrote {out}')
