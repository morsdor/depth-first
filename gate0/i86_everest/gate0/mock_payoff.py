"""Gate 0 sketch for I86 — the payoff frame, in PIL. A sketch, not a render.

Cross-section of the Everest massif, south (India) on the left, north (Asia) on the right.
The summit band — the Qomolangma limestone, laid down on a seafloor — is the one amber element.
A fossil trilobite sits in it. A dashed line drops from the summit to sea level: 29,032 ft.
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
FONTS = HERE.parents[2] / "assets" / "fonts"
W, H = 1080, 1920
INK, MESH, BONE, ASH = (4, 14, 31), (13, 31, 60), (232, 230, 225), (129, 162, 196)
AMBER, CYAN = (255, 176, 32), (0, 214, 247)
SAFE = (60, 270, 870, 1540)

img = Image.new("RGB", (W, H), INK)
d = ImageDraw.Draw(img)
for x in range(0, W, 60):
    d.line([(x, 0), (x, H)], fill=MESH)
for y in range(0, H, 60):
    d.line([(0, y), (W, y)], fill=MESH)

head = ImageFont.truetype(str(FONTS / "ArchivoBlack-Regular.ttf"), 56)
lab = ImageFont.truetype(str(FONTS / "IBMPlexMono-Bold.ttf"), 38)
small = ImageFont.truetype(str(FONTS / "IBMPlexMono-Bold.ttf"), 36)

d.text((90, 300), "THE TOP OF EVEREST", font=head, fill=BONE)
d.text((90, 372), "WAS ONCE SEAFLOOR.", font=head, fill=BONE)

# sea level and the mountain profile (x from 60 to 870)
SEA_Y = 1330
SUMMIT = (520, 640)


def ridge(x):
    """Mountain surface height (screen y) — a sketch profile with a jagged ridge, peak at SUMMIT."""
    dx = (x - SUMMIT[0]) / 250
    base = SEA_Y - (SEA_Y - SUMMIT[1]) * math.exp(-dx * dx) - 90 * math.exp(-((x - 260) / 70) ** 2)
    jag = 14 * math.sin(x / 23.0) + 9 * math.sin(x / 9.0 + 1.3)
    return min(SEA_Y, base + jag * min(1.0, abs(x - SUMMIT[0]) / 60))


xs = list(range(64, 867, 4))
surface = [(x, ridge(x)) for x in xs]

# strata, following the surface (thrust sheets stacked under the summit)
BANDS = [(0, 80, (150, 130, 95)), (80, 260, (70, 84, 110)), (260, 900, (40, 52, 78))]
for top, bot, col in reversed(BANDS):
    poly = [(x, min(SEA_Y, ridge(x) + top)) for x in xs]
    poly += [(x, min(SEA_Y, ridge(x) + bot)) for x in reversed(xs)]
    d.polygon(poly, fill=col)
# the ONE amber element: the summit limestone cap, only near the peak
cap = [x for x in xs if ridge(x) < SUMMIT[1] + 230]
d.polygon([(x, ridge(x)) for x in cap] + [(x, ridge(x) + 80) for x in reversed(cap)], fill=AMBER)
d.line(surface, fill=BONE, width=4)

# sea
d.rectangle([60, SEA_Y, 870, SEA_Y + 120], fill=(6, 40, 70))
d.line([(62, SEA_Y), (868, SEA_Y)], fill=CYAN, width=4)
d.text((80, SEA_Y + 20), "SEA LEVEL", font=small, fill=CYAN)

# height: dashed drop from summit to sea level
BX = 836
for y in range(SUMMIT[1], SEA_Y, 28):
    d.line([(BX, y), (BX, min(y + 14, SEA_Y))], fill=BONE, width=3)
d.line([(SUMMIT[0] + 30, SUMMIT[1]), (BX + 20, SUMMIT[1])], fill=BONE, width=3)
d.text((640, SUMMIT[1] - 60), "29,032 FT", font=lab, fill=BONE)

# the fossil — a trilobite drawn beside the summit, leader line into the amber cap
cx, cy = 210, 560
d.chord([cx - 75, cy - 120, cx + 75, cy - 10], 180, 360, outline=BONE, width=4)   # head shield
d.line([(cx - 75, cy - 65), (cx - 90, cy + 10)], fill=BONE, width=4)               # genal spines
d.line([(cx + 75, cy - 65), (cx + 90, cy + 10)], fill=BONE, width=4)
d.ellipse([cx - 20, cy - 110, cx + 20, cy - 66], outline=BONE, width=3)            # glabella
for k in range(8):                                                                  # thorax ribs
    yy = cy - 58 + k * 14
    w = 66 - k * 3
    d.line([(cx - w, yy), (cx + w, yy)], fill=BONE, width=3)
d.line([(cx - 18, cy - 62), (cx - 18, cy + 50)], fill=BONE, width=3)               # axial lobe
d.line([(cx + 18, cy - 62), (cx + 18, cy + 50)], fill=BONE, width=3)
d.pieslice([cx - 44, cy + 20, cx + 44, cy + 96], 0, 180, outline=BONE, width=4)    # tail shield
d.line([(cx + 95, cy - 30), (SUMMIT[0] - 20, SUMMIT[1] + 40)], fill=BONE, width=3)
d.text((cx - 120, cy + 120), "SEA FOSSIL,", font=small, fill=BONE)
d.text((cx - 120, cy + 162), "SUMMIT ROCK", font=small, fill=BONE)

# the push: India from the south
d.text((80, 1440), "INDIA →", font=lab, fill=ASH)
d.text((700, 1440), "ASIA", font=lab, fill=ASH)

# safe-area check: every drawn pixel not in the ground grid must sit inside SAFE
px = img.load()
bad = 0
for y in range(H):
    for x in range(W):
        p = px[x, y]
        if p not in (INK, MESH) and not (SAFE[0] <= x <= SAFE[2] and SAFE[1] <= y <= SAFE[3]):
            bad += 1
img.save(HERE / "payoff_frame.png")
assert bad == 0, f"{bad} pixels outside the safe area"
img.save(HERE / "payoff_frame.png")
print("wrote payoff_frame.png · safe area clean")
