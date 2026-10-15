"""Gate 0 artefact for I94 — the payoff frame, drawn once, before any build.

NOT the reel and NOT a Remotion render: the five-minute still Gate 0 demands, so the concept can
be killed for a rupee instead of a day.

What is drawn is the SENTENCE ("Boeing bent a 787's wings up 25 feet and they held — turbulence
hurts the people who aren't buckled in"):
  * TOP: an airliner head-on, wings flexed up 25 ft (7.62 m) against the unflexed line, on a
    wingspan drawn to scale. The famous test is a head-on photograph, so the object is nameable
    with the sound off;
  * BOTTOM: a cabin cross-section. One passenger buckled in a seat, one at the ceiling. The ONLY
    red on the frame is the person who is not buckled in (failure accent, on the beat something
    breaks, and nowhere else). Amber stays one element: the 25 ft bracket.

HONEST LIMITS OF THIS SKETCH
  * The wing's curve is the textbook uniform-load cantilever shape scaled to ONE published datum
    (tip rise 25 ft at 150% of limit load). It is a drawing of Boeing's number, not a prediction of
    ours; a build would use the published figure the same way and claim nothing about the structure.
  * The airliner is a generic twin-aisle silhouette. 787-8 span 60.1 m and fuselage 5.77 m are
    from memory of Boeing's published specs and are search-level leads for Stage 3.
  * Nothing here is a Boeing image. Boeing's photographs and video are copyrighted and are NOT used;
    only the published test figures (facts) are.

Needs only numpy + Pillow (matplotlib is not installed in the cloud container).
"""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

HERE = Path(__file__).parent
FONTS = HERE.parents[2] / "assets" / "fonts"
W, H = 1080, 1920
SAFE = (60, 270, 870, 1540)                 # x0, y0, x1, y1 — CLAUDE.md non-negotiable 1
GROUND = np.array([4, 14, 31])
INK = (232, 230, 225)
DIM = (129, 162, 196)
SLATE = (26, 40, 74)
ACCENT = (255, 77, 77)                      # DOMAIN_ACCENT.failure — §6; ONLY on the unbuckled person
CYAN = (0, 214, 247)                        # used for the ground glow only
AMBER = (255, 176, 32)                      # the ONE amber element: the 25 ft the wing rose
S = 2                                       # supersample for the geometry layer

# ── the published numbers, and the scale they set ──────────────────────────
FT = 0.3048
TIP_RISE_M = 25 * FT                        # Boeing 2010 ultimate-load test: ~25 ft (7.6 m)
SPAN_M = 60.12                              # 787-8 wingspan (Stage 3 lead)
FUSE_D_M = 5.77                             # 787 fuselage outside diameter (Stage 3 lead)
LOAD_PCT = 150                              # "150 percent of the most extreme in-service forces"
assert abs(TIP_RISE_M - 7.62) < 1e-9
assert LOAD_PCT == 150

CX = 465                                    # centre of the safe area
SPAN_PX = 700                               # leaves room inside x 60-870 for the 25 ft bracket on the right tip
K = SPAN_PX / SPAN_M                        # px per metre
L_PX = SPAN_PX / 2
RISE_PX = TIP_RISE_M * K                    # 98.9 px
FUSE_R = FUSE_D_M / 2 * K                   # 37.4 px
assert 80 < RISE_PX < 110, RISE_PX
# a cabin person is drawn at a DIFFERENT, larger scale (a cutaway): stated here, not hidden

# ── ground: never a flat fill (non-negotiable 2) ───────────────────────────
yy, xx = np.mgrid[0:H, 0:W]
glow = np.exp(-(((xx - CX) / 560.0) ** 2 + ((yy - 900) / 760.0) ** 2))
ground = GROUND[None, None, :] + glow[..., None] * (np.array(CYAN) * 0.07)[None, None, :]
base = Image.fromarray(np.clip(ground, 0, 255).astype(np.uint8), "RGB").convert("RGBA")

layer = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
g = ImageDraw.Draw(layer)

def P(x, y):
    return (x * S, y * S)

def line(a, b, fill, width):
    g.line([P(*a), P(*b)], fill=fill, width=int(width * S))

def dashed(a, b, fill, width, dash=14, gap=10):
    (x0, y0), (x1, y1) = a, b
    n = math.hypot(x1 - x0, y1 - y0)
    ux, uy = (x1 - x0) / n, (y1 - y0) / n
    t = 0.0
    while t < n:
        e = min(t + dash, n)
        line((x0 + ux * t, y0 + uy * t), (x0 + ux * e, y0 + uy * e), fill, width)
        t += dash + gap

# ═══ TOP: the airliner, head-on, wings flexed ══════════════════════════════
WING_Y0 = 712                               # wing root height on screen
FUSE_Y = WING_Y0 - 6

def flex(s_px):
    """Uniform-load cantilever, normalised so the tip (s = L) rises exactly RISE_PX."""
    u = s_px / L_PX
    return RISE_PX * (6 * u ** 2 - 4 * u ** 3 + u ** 4) / 3.0

assert abs(flex(L_PX) - RISE_PX) < 1e-9

# the unflexed wing, for comparison: dashed, dim
for sgn in (-1, 1):
    dashed((CX + sgn * (FUSE_R - 4), WING_Y0), (CX + sgn * L_PX, WING_Y0), DIM + (200,), 3)

# tail (behind the fuselage, head-on): fin and tailplane as thin shapes
g.polygon([P(CX - 5, FUSE_Y - FUSE_R + 4), P(CX + 5, FUSE_Y - FUSE_R + 4), P(CX + 2, FUSE_Y - FUSE_R - 66),
           P(CX - 2, FUSE_Y - FUSE_R - 66)], fill=SLATE + (255,), outline=DIM + (255,))
line((CX - 128, FUSE_Y + 8), (CX + 128, FUSE_Y + 8), DIM + (255,), 4)

# the flexed wings: polygon whose thickness tapers 15 px at the root to 5 px at the tip
for sgn in (-1, 1):
    top, bot = [], []
    for s in np.linspace(FUSE_R - 6, L_PX, 80):
        t = (s - FUSE_R) / (L_PX - FUSE_R)
        th = 15 - 10 * max(t, 0)
        y = WING_Y0 - flex(s)
        top.append(P(CX + sgn * s, y - th / 2))
        bot.append(P(CX + sgn * s, y + th / 2))
    g.polygon(top + bot[::-1], fill=SLATE + (255,), outline=INK + (255,))
    for pt_a, pt_b in zip(top[:-1], top[1:]):
        g.line([pt_a, pt_b], fill=INK + (255,), width=int(3 * S))

# the engines hang below the wing and ride the flex
for sgn in (-1, 1):
    s_e = 9.2 * K
    ye = WING_Y0 - flex(s_e) + 24
    g.ellipse([P(CX + sgn * s_e - 18, ye - 18), P(CX + sgn * s_e + 18, ye + 18)], fill=(8, 16, 38, 255),
              outline=INK + (255,), width=3 * S)
    g.ellipse([P(CX + sgn * s_e - 8, ye - 8), P(CX + sgn * s_e + 8, ye + 8)], fill=SLATE + (255,),
              outline=DIM + (255,), width=2 * S)

# the fuselage, head-on, drawn last so it overlaps the wing roots
g.ellipse([P(CX - FUSE_R, FUSE_Y - FUSE_R), P(CX + FUSE_R, FUSE_Y + FUSE_R)], fill=SLATE + (255,),
          outline=INK + (255,), width=4 * S)
g.rounded_rectangle([P(CX - 22, FUSE_Y - 22), P(CX + 22, FUSE_Y - 6)], radius=6 * S, fill=(8, 16, 38, 255),
                    outline=DIM + (255,), width=2 * S)

# the amber bracket: the 25 ft the right wingtip rose, measured from the dashed unflexed line
BX = CX + L_PX - 6 + 26
tip_y = WING_Y0 - RISE_PX
line((BX, WING_Y0), (BX, tip_y), AMBER + (255,), 5)
line((BX - 12, WING_Y0), (BX + 12, WING_Y0), AMBER + (255,), 5)
line((BX - 12, tip_y), (BX + 12, tip_y), AMBER + (255,), 5)
dashed((CX + L_PX - 4, tip_y), (BX - 12, tip_y), AMBER + (150,), 2, dash=6, gap=6)

# ═══ BOTTOM: the cabin cross-section ═══════════════════════════════════════
CC_X, CC_Y, CC_R = CX, 1130, 250            # cabin circle: centre and radius (px) — a cutaway scale
FLOOR_Y = CC_Y + 112
g.ellipse([P(CC_X - CC_R, CC_Y - CC_R), P(CC_X + CC_R, CC_Y + CC_R)], outline=DIM + (255,), width=5 * S)
# the floor and the cavity below it
line((CC_X - 218, FLOOR_Y), (CC_X + 218, FLOOR_Y), DIM + (255,), 5)
# overhead bins, left and right
for sgn in (-1, 1):
    g.polygon([P(CC_X + sgn * 214, CC_Y - 120), P(CC_X + sgn * 118, CC_Y - 176), P(CC_X + sgn * 90, CC_Y - 150),
               P(CC_X + sgn * 190, CC_Y - 96)], fill=SLATE + (255,), outline=DIM + (255,))
# windows
for sgn in (-1, 1):
    g.rounded_rectangle([P(CC_X + sgn * 236 - 9, CC_Y - 40), P(CC_X + sgn * 236 + 9, CC_Y + 4)], radius=7 * S,
                        fill=(8, 16, 38, 255), outline=DIM + (255,), width=2 * S)

def seat(cx):
    # seat back and cushion, seen from the front
    g.rounded_rectangle([P(cx - 46, FLOOR_Y - 150), P(cx + 46, FLOOR_Y - 30)], radius=14 * S, fill=(34, 52, 94, 255),
                        outline=DIM + (255,), width=2 * S)
    g.rounded_rectangle([P(cx - 50, FLOOR_Y - 42), P(cx + 50, FLOOR_Y - 8)], radius=10 * S, fill=(42, 62, 108, 255),
                        outline=DIM + (255,), width=2 * S)
    line((cx - 34, FLOOR_Y - 8), (cx - 34, FLOOR_Y), DIM + (255,), 4)
    line((cx + 34, FLOOR_Y - 8), (cx + 34, FLOOR_Y), DIM + (255,), 4)

def person(cx, dy, col, arms_up=False):
    """A front-on seated figure; dy lifts the whole figure (negative = up)."""
    hy = FLOOR_Y - 128 + dy                  # head centre
    g.ellipse([P(cx - 21, hy - 21), P(cx + 21, hy + 21)], fill=col + (255,))
    g.rounded_rectangle([P(cx - 32, hy + 26), P(cx + 32, hy + 104)], radius=14 * S, fill=col + (255,))
    g.rounded_rectangle([P(cx - 34, hy + 96), P(cx + 34, hy + 114)], radius=8 * S, fill=col + (255,))   # lap
    for lx in (-18, 18):                                                                               # shins
        g.rounded_rectangle([P(cx + lx - 8, hy + 110), P(cx + lx + 8, hy + 168)], radius=6 * S, fill=col + (255,))
    if arms_up:
        line((cx - 30, hy + 40), (cx - 62, hy - 6), col, 10)
        line((cx + 30, hy + 40), (cx + 62, hy - 6), col, 10)
    else:
        line((cx - 30, hy + 40), (cx - 40, hy + 100), col, 10)
        line((cx + 30, hy + 40), (cx + 40, hy + 100), col, 10)

A_X, B_X = CC_X - 120, CC_X + 120
seat(A_X)
seat(B_X)
person(A_X, 0, INK)                          # buckled: in the seat
line((A_X - 34, FLOOR_Y - 128 + 96), (A_X + 34, FLOOR_Y - 128 + 96), AMBER + (0,), 1)   # (belt drawn below)
g.rounded_rectangle([P(A_X - 36, FLOOR_Y - 128 + 92), P(A_X + 36, FLOOR_Y - 128 + 104)], radius=5 * S,
                    fill=DIM + (255,))                                                   # the lap belt, visible
# the unbuckled passenger: lifted until the head meets the ceiling
ceil_y = CC_Y - math.sqrt(CC_R ** 2 - (B_X - CC_X) ** 2)
lift = (ceil_y + 26 + 6) - (FLOOR_Y - 128)  # head centre sits just under the ceiling
person(B_X, lift, ACCENT, arms_up=True)
# the loose belt left hanging on the seat
line((B_X - 30, FLOOR_Y - 40), (B_X - 54, FLOOR_Y - 8), DIM + (255,), 5)
line((B_X + 30, FLOOR_Y - 40), (B_X + 54, FLOOR_Y - 8), DIM + (255,), 5)
# impact ticks at the ceiling and upward motion marks
for dx in (-26, 0, 26):
    line((B_X + dx, ceil_y + 3), (B_X + dx * 1.4, ceil_y - 11), ACCENT + (255,), 4)
for dx in (-52, 52):
    line((B_X + dx, FLOOR_Y - 150), (B_X + dx, FLOOR_Y - 236), ACCENT + (150,), 4)
    g.polygon([P(B_X + dx, FLOOR_Y - 248), P(B_X + dx - 9, FLOOR_Y - 230), P(B_X + dx + 9, FLOOR_Y - 230)],
              fill=ACCENT + (150,))

layer = layer.resize((W, H), Image.LANCZOS)
img = Image.alpha_composite(base, layer).convert("RGB")
d = ImageDraw.Draw(img)

# ── text ───────────────────────────────────────────────────────────────────
f_head = ImageFont.truetype(str(FONTS / "ArchivoBlack-Regular.ttf"), 47)
f_foot = ImageFont.truetype(str(FONTS / "ArchivoBlack-Regular.ttf"), 36)
f_mono = ImageFont.truetype(str(FONTS / "IBMPlexMono-Bold.ttf"), 22)
f_lab = ImageFont.truetype(str(FONTS / "IBMPlexMono-Bold.ttf"), 25)

boxes = []
def text(xy, s, font, fill, anchor="la"):
    d.text(xy, s, font=font, fill=fill, anchor=anchor)
    boxes.append(d.textbbox(xy, s, font=font, anchor=anchor))

MID = (SAFE[0] + SAFE[2]) // 2
text((MID, 285), "BOEING BENT A 787'S WINGS", f_head, INK, "ma")
text((MID, 348), "UP 25 FEET. THEY HELD.", f_head, INK, "ma")
text((MID, 428), f"{LOAD_PCT}% OF THE WORST LOAD EXPECTED IN SERVICE", f_mono, DIM, "ma")

# names ride on the objects
text((BX + 2, (WING_Y0 + tip_y) / 2 - 18), "25", f_lab, AMBER, "mm")
text((BX + 2, (WING_Y0 + tip_y) / 2 + 12), "FT", f_lab, AMBER, "mm")
text((A_X, FLOOR_Y + 22), "BUCKLED", f_lab, DIM, "ma")
text((B_X, FLOOR_Y + 22), "NOT BUCKLED", f_lab, ACCENT, "ma")

text((MID, 1430), "THE PLANE IS FINE.", f_foot, INK, "ma")
text((MID, 1486), "TURBULENCE HURTS THE UNBUCKLED.", f_foot, ACCENT, "ma")

# ── safe-area check: every block of content inside x 60–870, y 270–1540 ────
for b in boxes:
    assert b[0] >= SAFE[0] - 1 and b[2] <= SAFE[2] + 1, f"x outside safe area: {b}"
    assert b[1] >= SAFE[1] and b[3] <= SAFE[3], f"y outside safe area: {b}"
geo_x = [CX - L_PX, CX + L_PX, BX + 12, CC_X - CC_R, CC_X + CC_R]
geo_y = [tip_y - 4, WING_Y0 + 40, CC_Y - CC_R, FLOOR_Y + 60]
assert min(geo_x) >= SAFE[0] and max(geo_x) <= SAFE[2], (min(geo_x), max(geo_x))
assert min(geo_y) >= SAFE[1] and max(geo_y) <= SAFE[3], (min(geo_y), max(geo_y))

out = HERE / "payoff_frame.png"
img.save(out)
print(f"wrote {out}  ({W}x{H})")
print(f"tip rise {TIP_RISE_M:.2f} m = {RISE_PX:.1f} px at {K:.2f} px/m; fuselage r = {FUSE_R:.1f} px")
