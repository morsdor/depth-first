"""Gate 0 artefact for I89 — the payoff frame, drawn once, before any build.

NOT the reel and NOT a Remotion render: the five-minute still Gate 0 demands, so the concept can
be killed for a rupee instead of a day.

What is drawn is the SENTENCE ("the space station is falling, and still feels ~89% of your
gravity"), and the geometry is TO SCALE, which costs nothing and is the point:
  * the Earth, radius 6,371 km, and the station's ring 400 km above it — 6.3% of a radius, so the
    ring hugs the planet. That is true and it is part of the surprise;
  * the amber ring is the 7.67 km/s orbit — Newton's cannon fired fast enough to keep missing —
    and the station is on it, with its sideways speed as an arrow;
  * a bathroom scale on the ground and on a 400 km tower: 70 kg and 62 kg. 70 x g(400 km)/g(0).

WHAT THIS STILL DELIBERATELY DOES NOT DRAW — Newton's cannon at 3, 5 and 6.5 km/s. They are real
conics (computed and asserted below: the launch point is the apoapsis, e = 1 - (v/v_circ)^2,
r = p/(1 - e cos psi), p = r0 (1 - e)) and at true scale they sweep 8.6, 17.5 and 32.8 degrees, but
the whole drop is 400 km = 19 px here, so they collapse into the ring and read as clutter. Drawing
them at true scale needs a camera that pulls into the limb. That is a BUILD constraint, recorded
in GATE0.md section 3, not a thing this still can prove.

SKETCH, not the build: the Earth texture is a few summed sinusoids, not imagery. Every number is
computed below from GM and R, not typed in. Checked at search level 2026-10-05 against NASA's own
"about 90%" and the free-fall explanation; the primary-source reading is Stage 3.

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
ACCENT = (0, 214, 247)                      # DOMAIN_ACCENT.infrastructure — §2
AMBER = (255, 176, 32)                      # the ONE amber element: the orbit that never lands
S = 2                                       # supersample for the geometry layer

# ── the physics, computed not typed ────────────────────────────────────────
GM = 3.986004418e14                         # m^3/s^2
R_E = 6371.0e3                              # mean radius, m
H_ISS = 400.0e3                             # a typical ISS altitude (it flies 400-420 km)
r0 = R_E + H_ISS
g_surface = GM / R_E ** 2
g_iss = GM / r0 ** 2
RATIO = g_iss / g_surface                   # 0.885
V_CIRC = math.sqrt(GM / r0)                 # 7.673 km/s
KG_ON_TOWER = 70 * RATIO                    # 62.0
assert 0.88 < RATIO < 0.89, RATIO
assert abs(V_CIRC - 7673) < 5, V_CIRC
assert round(KG_ON_TOWER) == 62

# ── ground: never a flat fill (non-negotiable 2) ───────────────────────────
yy, xx = np.mgrid[0:H, 0:W]
CX_E, CY_E, RE_PX = 465, 860, 300           # Earth centre and radius in pixels
K = RE_PX / (R_E / 1e3)                     # pixels per km
R0_PX = r0 / 1e3 * K                        # station ring radius in pixels (to scale)
glow = np.exp(-(((xx - CX_E) / 560.0) ** 2 + ((yy - CY_E) / 700.0) ** 2))
ground = GROUND[None, None, :] + glow[..., None] * (np.array(ACCENT) * 0.08)[None, None, :]
base = Image.fromarray(np.clip(ground, 0, 255).astype(np.uint8), "RGB").convert("RGBA")

# ── the Earth: lit sphere, a little land, an atmosphere rim ────────────────
ex = (xx - CX_E) / RE_PX
ey = (yy - CY_E) / RE_PX
rr2 = ex ** 2 + ey ** 2
inside = rr2 <= 1.0
nz = np.sqrt(np.clip(1 - rr2, 0, 1))
nx, ny = ex, -ey
land_f = (np.sin(3.1 * nx + 1.7 * ny + 2.0 * nz) + 0.8 * np.sin(5.3 * ny - 2.1 * nz + 0.7)
          + 0.5 * np.sin(7.9 * nx + 4.1 * nz + 1.3))
land = land_f > 1.0
light = np.clip(-0.45 * nx + 0.55 * ny + 0.70 * nz, 0, 1)
shade = 0.22 + 0.78 * light
ocean = np.array([10, 44, 104], float)
landc = np.array([30, 98, 96], float)
col = np.where(land[..., None], landc, ocean) * shade[..., None]
rim = np.exp(-np.clip(rr2 - 0.55, 0, None) * 5.0)[..., None]      # slight limb brightening
col = col + (1 - rim) * np.array(ACCENT, float) * 0.16 * light[..., None]
earth = np.zeros((H, W, 4), np.uint8)
earth[..., :3] = np.clip(col, 0, 255).astype(np.uint8)
earth[..., 3] = (inside * 255).astype(np.uint8)
# atmosphere: a thin cyan halo just outside the limb
halo = np.exp(-((np.sqrt(rr2) - 1.0) / 0.018) ** 2) * (~inside) * 150
halo_img = np.zeros((H, W, 4), np.uint8)
halo_img[..., 0], halo_img[..., 1], halo_img[..., 2] = ACCENT
halo_img[..., 3] = np.clip(halo, 0, 255).astype(np.uint8)
base = Image.alpha_composite(base, Image.fromarray(halo_img, "RGBA"))
base = Image.alpha_composite(base, Image.fromarray(earth, "RGBA"))

# ── geometry on a 2x layer, downsampled for antialiasing ───────────────────
layer = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
g = ImageDraw.Draw(layer)

def P(x, y):
    return (x * S, y * S)

def pol(r_px, psi_deg):
    """psi measured clockwise from the top of the Earth, on screen."""
    a = math.radians(psi_deg)
    return (CX_E + r_px * math.sin(a), CY_E - r_px * math.cos(a))

def line(a, b, fill, width):
    g.line([P(*a), P(*b)], fill=fill, width=int(width * S))

# the falling shots (computed and asserted, NOT drawn — see the docstring): Newton's cannon at 3, 5, 6.5 km/s
shots = []
for v_kms in (3.0, 5.0, 6.5):
    e = 1 - (v_kms * 1e3 / V_CIRC) ** 2
    p = r0 * (1 - e)
    cos_land = (1 - p / R_E) / e
    psi_land = math.degrees(math.acos(cos_land))
    pts = []
    for psi in np.linspace(0, psi_land, 120):
        r_m = p / (1 - e * math.cos(math.radians(psi)))
        pts.append(pol(r_m / 1e3 * K, psi))
    shots.append((v_kms, psi_land, pts))
assert [round(s[1]) for s in shots] == [9, 18, 33], [s[1] for s in shots]

# the amber orbit: the 7.67 km/s shot that never lands — a soft halo under a clean stroke
g.ellipse([P(CX_E - R0_PX, CY_E - R0_PX), P(CX_E + R0_PX, CY_E + R0_PX)],
          outline=AMBER + (70,), width=14 * S)
g.ellipse([P(CX_E - R0_PX, CY_E - R0_PX), P(CX_E + R0_PX, CY_E + R0_PX)],
          outline=AMBER + (255,), width=5 * S)

# the station, drawn on the ring at 42 degrees: a truss with two pairs of panels
iss = pol(R0_PX, 42)
a = math.radians(42)
tx, ty = math.cos(a), math.sin(a)                   # tangent
nxv, nyv = math.sin(a), -math.cos(a)                # outward normal
def quad(c, w, h):
    corners = []
    for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
        corners.append((c[0] + tx * sx * w + nxv * sy * h, c[1] + ty * sx * w + nyv * sy * h))
    return corners
line((iss[0] - tx * 30, iss[1] - ty * 30), (iss[0] + tx * 30, iss[1] + ty * 30), INK, 6)
for off in (-24, 24):
    c = (iss[0] + tx * off, iss[1] + ty * off)
    g.polygon([P(*q) for q in quad(c, 7, 17)], fill=(70, 120, 210))
g.ellipse([P(iss[0] - 7, iss[1] - 7), P(iss[0] + 7, iss[1] + 7)], fill=INK)

# the sideways speed: an arrow along the tangent, ahead of the station
a0 = (iss[0] + tx * 40, iss[1] + ty * 40)
a1 = (iss[0] + tx * 88, iss[1] + ty * 88)
line(a0, a1, INK, 4)
g.polygon([P(*a1), P(a1[0] - tx * 14 + nxv * 8, a1[1] - ty * 14 + nyv * 8),
           P(a1[0] - tx * 14 - nxv * 8, a1[1] - ty * 14 - nyv * 8)], fill=INK)

# leader from the label to the station
LAB_Y = 478
line((iss[0], LAB_Y + 34), (iss[0], iss[1] - 30), DIM, 2)

# ── the scales: a bathroom scale on the ground and on a 400 km tower ───────
SC_Y0, SC_W, SC_H = 1290, 290, 130
SCALES = [(250, "70 KG", "ON THE GROUND"), (680, f"{KG_ON_TOWER:.0f} KG", "ON A 400 KM TOWER")]
for cx, _, _ in SCALES:
    g.rounded_rectangle([P(cx - SC_W / 2, SC_Y0), P(cx + SC_W / 2, SC_Y0 + SC_H)], radius=26 * S,
                        fill=(26, 40, 74, 255), outline=DIM + (255,), width=3 * S)
    g.rounded_rectangle([P(cx - 84, SC_Y0 + 32), P(cx + 84, SC_Y0 + 96)], radius=12 * S,
                        fill=(5, 9, 24, 255), outline=ACCENT + (160,), width=2 * S)
    for fx in (-1, 1):
        g.ellipse([P(cx + fx * 118 - 16, SC_Y0 + SC_H - 6), P(cx + fx * 118 + 16, SC_Y0 + SC_H + 8)],
                  fill=(60, 70, 96, 255))

layer = layer.resize((W, H), Image.LANCZOS)
img = Image.alpha_composite(base, layer).convert("RGB")
d = ImageDraw.Draw(img)

# ── text ───────────────────────────────────────────────────────────────────
f_head = ImageFont.truetype(str(FONTS / "ArchivoBlack-Regular.ttf"), 54)
f_dial = ImageFont.truetype(str(FONTS / "IBMPlexMono-Bold.ttf"), 44)
f_small = ImageFont.truetype(str(FONTS / "IBMPlexSans-Bold.ttf"), 25)
f_mono = ImageFont.truetype(str(FONTS / "IBMPlexMono-Bold.ttf"), 23)
f_mono21 = ImageFont.truetype(str(FONTS / "IBMPlexMono-Bold.ttf"), 21)

boxes = []
def text(xy, s, font, fill, anchor="la"):
    d.text(xy, s, font=font, fill=fill, anchor=anchor)
    boxes.append(d.textbbox(xy, s, font=font, anchor=anchor))

CX = (SAFE[0] + SAFE[2]) // 2
text((CX, 285), "NO GRAVITY IN SPACE?", f_head, INK, "ma")
text((CX, 350), f"THE STATION FEELS {RATIO:.0%}.", f_head, INK, "ma")

# the name rides on the object
text((iss[0], LAB_Y), "THE STATION · 400 KM UP", f_mono, INK, "ma")
text((a1[0] + 10, a1[1] + 2), f"{V_CIRC / 1e3:.1f} KM/S", f_mono21, INK, "lm")
for cx, dial, cap in SCALES:
    text((cx, SC_Y0 + 64), dial, f_dial, INK, "mm")
    text((cx, SC_Y0 + SC_H + 40), cap, f_small, DIM, "ma")

# ── safe-area check: every block of content inside x 60–870, y 270–1540 ────
for b in boxes:
    assert b[0] >= SAFE[0] - 1 and b[2] <= SAFE[2] + 1, f"x outside safe area: {b}"
    assert b[1] >= SAFE[1] and b[3] <= SAFE[3], f"y outside safe area: {b}"
geo_x = [CX_E - R0_PX, CX_E + R0_PX, 250 - SC_W / 2, 680 + SC_W / 2]
geo_y = [CY_E - R0_PX, CY_E + R0_PX, SC_Y0, SC_Y0 + SC_H + 8]
assert SAFE[0] <= min(geo_x) and max(geo_x) <= SAFE[2], f"geometry x outside safe area: {geo_x}"
assert SAFE[1] <= min(geo_y) and max(geo_y) <= SAFE[3], f"geometry y outside safe area: {geo_y}"

img.save(HERE / "payoff_frame.png")
print(f"g(surface)={g_surface:.3f}  g(400 km)={g_iss:.3f}  ratio={RATIO:.4f}  "
      f"v_circ={V_CIRC / 1e3:.3f} km/s  70 kg -> {KG_ON_TOWER:.1f} kg")
print("landing arcs (deg of Earth swept):", [(s[0], round(s[1], 1)) for s in shots])
print("ring height / radius:", round(H_ISS / R_E, 4), f"-> {R0_PX - RE_PX:.1f} px above the surface")
print("payoff_frame.png written;", len(boxes), "text blocks, all inside the safe area")
