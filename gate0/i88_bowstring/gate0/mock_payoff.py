"""Gate 0 artefact for I88 — the payoff frame, drawn once, before any build.

NOT the reel and NOT a Remotion render: the five-minute still Gate 0 demands, so the concept can
be killed for a rupee instead of a day.

What is drawn is the SENTENCE ("'sine' was a bowstring"), not the maths:
  * an archery bow whose limb is an arc of a circle and whose string is the chord of that arc —
    the string's upper half is the one amber element, and it is the sine;
  * the word chain  jya -> jiba -> jaib -> sinus  with what each word meant;
  * the job it was for: a strip of sky with a planet's looping path.

SKETCH, not data: the planet loop is a hand-made epicycle curve, not an ephemeris and not
Aryabhata's table. The build replaces it (Stage 3). The word chain and the "half-chord" definition
are search-level checked 2026-10-05 (Singh, arXiv 2309.13577; MacTutor; Britannica) — the
primary-source reading is Stage 3.

Needs only numpy + Pillow (matplotlib is not installed in the cloud container).
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

HERE = Path(__file__).parent
FONTS = HERE.parents[2] / "assets" / "fonts"
W, H = 1080, 1920
SAFE = (60, 270, 870, 1540)                 # x0, y0, x1, y1 — CLAUDE.md non-negotiable 1
GROUND = np.array([6, 10, 28])
INK = (232, 230, 225)
DIM = (129, 162, 196)
ACCENT = (173, 136, 255)                    # DOMAIN_ACCENT.data — §1
AMBER = (255, 176, 32)                      # the ONE amber element: the half-string = the sine
S = 2                                       # supersample for the geometry layer

# ── ground: never a flat fill (non-negotiable 2) ───────────────────────────
yy, xx = np.mgrid[0:H, 0:W]
OX, OY, R = 520, 790, 300                   # circle centre and radius
glow = np.exp(-(((xx - OX) / 520.0) ** 2 + ((yy - OY) / 620.0) ** 2))
ground = GROUND[None, None, :] + glow[..., None] * (np.array(ACCENT) * 0.10)[None, None, :]
base = Image.fromarray(np.clip(ground, 0, 255).astype(np.uint8), "RGB").convert("RGBA")

# ── geometry on a 2x layer, downsampled for antialiasing ───────────────────
layer = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
g = ImageDraw.Draw(layer)

def P(x, y):
    return (x * S, y * S)

def line(a, b, fill, width):
    g.line([P(*a), P(*b)], fill=fill, width=int(width * S))

def arc_pts(cx, cy, r, a0, a1, n=80):
    t = np.radians(np.linspace(a0, a1, n))
    return [(cx + r * np.cos(u), cy - r * np.sin(u)) for u in t]

# faint full circle: the circle every school diagram draws
g.ellipse([P(OX - R, OY - R), P(OX + R, OY + R)], outline=DIM + (70,), width=2 * S)

THETA = 50                                  # half the bow's opening angle, degrees
top = (OX + R * np.cos(np.radians(THETA)), OY - R * np.sin(np.radians(THETA)))
bot = (top[0], OY + R * np.sin(np.radians(THETA)))
mid = (top[0], OY)                          # where the arrow is nocked on the string
tip = (OX + R, OY)                          # arc midpoint

# the bow: limb = arc of the circle, in ink; grip a heavier stroke at the midpoint
limb = arc_pts(OX, OY, R, -THETA, THETA, 120)
g.line([P(*p) for p in limb], fill=INK, width=12 * S, joint="curve")
g.line([P(*p) for p in arc_pts(OX, OY, R, -9, 9, 20)], fill=(150, 120, 80), width=22 * S)
for p in (top, bot):
    g.ellipse([P(p[0] - 9, p[1] - 9), P(p[0] + 9, p[1] + 9)], fill=INK)

# the string: lower half in ink, UPPER HALF AMBER — the sine
line(mid, bot, INK, 5)
line(mid, top, AMBER, 9)

# the arrow, nocked on the string, so the bow reads as a bow with the sound off
line((mid[0] - 95, OY), (tip[0] + 14, OY), INK, 6)
g.polygon([P(tip[0] + 38, OY), P(tip[0] + 10, OY - 14), P(tip[0] + 10, OY + 14)], fill=INK)
for k in range(3):                          # fletching
    x = mid[0] - 95 + k * 16
    line((x, OY), (x - 14, OY - 15), DIM, 3)
    line((x, OY), (x - 14, OY + 15), DIM, 3)

# a bracket along the amber half-string, so "this length" is unmistakable
bx = mid[0] - 34
line((bx, mid[1] - 6), (bx, top[1] + 6), AMBER, 3)
line((bx, mid[1] - 6), (bx + 12, mid[1] - 6), AMBER, 3)
line((bx, top[1] + 6), (bx + 12, top[1] + 6), AMBER, 3)

# the word chain's arrows (positions fixed by the four columns below)
COLS = [150, 360, 570, 780]
CHAIN_Y = 1170
for a, b in zip(COLS, COLS[1:]):
    y = CHAIN_Y + 22
    line((a + 62, y), (b - 74, y), DIM, 2)
    g.polygon([P(b - 62, y), P(b - 78, y - 8), P(b - 78, y + 8)], fill=DIM)

# the sky strip: a planet's looping path — a hand-made epicycle sketch (NOT an ephemeris)
SKY = (60, 1330, 870, 1535)
g.rounded_rectangle([P(SKY[0], SKY[1]), P(SKY[2], SKY[3])], radius=22 * S,
                    fill=(4, 6, 20, 235), outline=ACCENT + (120,), width=2 * S)
rng = np.random.default_rng(88)
for _ in range(110):
    sx = rng.uniform(SKY[0] + 14, SKY[2] - 14)
    sy = rng.uniform(SKY[1] + 14, SKY[3] - 14)
    r = rng.choice([1.0, 1.0, 1.6, 2.2])
    g.ellipse([P(sx - r, sy - r), P(sx + r, sy + r)], fill=INK + (int(rng.uniform(90, 220)),))
t = np.linspace(0, 2 * np.pi, 400)
pathx = SKY[0] + 70 + (t / (2 * np.pi)) * 640 + 38 * np.cos(5 * t + 0.4)
pathy = SKY[1] + 118 + 34 * np.sin(5 * t + 0.4)
g.line([P(x, y) for x, y in zip(pathx, pathy)], fill=ACCENT + (255,), width=3 * S)
g.ellipse([P(pathx[-1] - 9, pathy[-1] - 9), P(pathx[-1] + 9, pathy[-1] + 9)], fill=INK)

layer = layer.resize((W, H), Image.LANCZOS)
img = Image.alpha_composite(base, layer).convert("RGB")
d = ImageDraw.Draw(img)

# ── text ───────────────────────────────────────────────────────────────────
f_head = ImageFont.truetype(str(FONTS / "ArchivoBlack-Regular.ttf"), 60)
f_lab = ImageFont.truetype(str(FONTS / "ArchivoBlack-Regular.ttf"), 34)
f_word = ImageFont.truetype(str(FONTS / "IBMPlexMono-Bold.ttf"), 38)
f_small = ImageFont.truetype(str(FONTS / "IBMPlexSans-Bold.ttf"), 25)
f_mono = ImageFont.truetype(str(FONTS / "IBMPlexMono-Bold.ttf"), 22)

boxes = []
def text(xy, s, font, fill, anchor="la"):
    d.text(xy, s, font=font, fill=fill, anchor=anchor)
    boxes.append(d.textbbox(xy, s, font=font, anchor=anchor))

CX = (SAFE[0] + SAFE[2]) // 2
text((CX, 285), "“SINE” WAS", f_head, INK, "ma")
text((CX, 355), "A BOWSTRING.", f_head, INK, "ma")

# the name rides on the object, not in a caption slot far away
text((bx - 14, (mid[1] + top[1]) / 2), "SINE", f_lab, AMBER, "rm")

words = [("jya", "bowstring"), ("jiba", "(just a sound)"), ("jaib", "a fold, a bay"), ("sinus", "Latin: a fold")]
for cx, (w, meaning) in zip(COLS, words):
    text((cx, CHAIN_Y), w, f_word, INK if w != "jya" else ACCENT, "ma")
    text((cx, CHAIN_Y + 56), meaning, f_small, DIM, "ma")
text((CX, 1100), "SANSKRIT → ARABIC → LATIN", f_mono, DIM, "ma")

text((SKY[0] + 24, SKY[1] + 20), "THE JOB: WHERE WILL MARS BE?", f_mono, INK, "la")

# ── safe-area check: every block of content inside x 60–870, y 270–1540 ────
for b in boxes:
    assert b[0] >= SAFE[0] - 1 and b[2] <= SAFE[2] + 1, f"x outside safe area: {b}"
    assert b[1] >= SAFE[1] and b[3] <= SAFE[3], f"y outside safe area: {b}"
geo_x = [OX - R, tip[0] + 38, SKY[0], SKY[2]]
geo_y = [OY - R, SKY[3]]
assert SAFE[0] <= min(geo_x) and max(geo_x) <= SAFE[2], f"geometry x outside safe area: {geo_x}"
assert SAFE[1] <= min(geo_y) and max(geo_y) <= SAFE[3], f"geometry y outside safe area: {geo_y}"

img.save(HERE / "payoff_frame.png")
print("payoff_frame.png written;", len(boxes), "text blocks, all inside the safe area")
