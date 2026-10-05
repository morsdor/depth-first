"""Gate 0 artefact for I87 — the payoff frame, drawn once, before any build.

NOT the reel and NOT a Remotion render: the five-minute still Gate 0 demands, so
the concept can be killed for a rupee instead of a day.

Coastlines: GSHHG via `basemap-data`, offline. The swirl of debris is a SKETCH —
a hand-made spiral into the patch, not an ocean-current run. The build replaces
it with particles advected on a real surface-current field (Stage 3).

The one figure drawn, ">= 46% of the mass is fishing nets", is Lebreton et al.,
Sci. Rep. 8, 4666 (2018): >= 79,000 t over 1.6 million km2, >= 46% nets.
Checked at search level 2026-10-04; the paper itself is still to be read.
"""
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.basemap import Basemap
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

HERE = Path(__file__).parent
FONTS = HERE.parents[2] / "assets" / "fonts"
W, H = 1080, 1920
SAFE = (60, 270, 870, 1540)                 # x0, y0, x1, y1 — CLAUDE.md non-negotiable 1
GROUND = (4, 14, 31)
GROUND_HEX = "#040E1F"
INK = (232, 230, 225)
DIM = (129, 162, 196)
ACCENT = (0, 214, 247)                      # DOMAIN_ACCENT.infrastructure — §2
AMBER = (255, 176, 32)                      # the ONE amber element: the nets
LAND = "#0D1F3C"
COAST = "#274064"

NETS_SHARE = 0.46                           # Lebreton 2018, "at least"
PATCH = (-142.0, 32.0)                      # rough centre, between California and Hawaii

# ── map: North Pacific, Pacific-centred ────────────────────────────────────
MAP_W = 810
MAP_H = round(MAP_W * 53 / 120)          # cyl projection: keep degrees square
fig = plt.figure(figsize=(MAP_W / 100, MAP_H / 100), dpi=100)
ax = fig.add_axes([0, 0, 1, 1])
fig.patch.set_facecolor(np.array(GROUND) / 255)
m = Basemap(projection="cyl", llcrnrlon=130, urcrnrlon=250, llcrnrlat=5, urcrnrlat=58,
            resolution="l", ax=ax)
m.drawmapboundary(fill_color=GROUND_HEX, linewidth=0)
m.fillcontinents(color=LAND, lake_color=GROUND_HEX)
m.drawcoastlines(color=COAST, linewidth=0.8)

rng = np.random.default_rng(87)
cx, cy = PATCH[0] + 360, PATCH[1]
# sketch: debris spiralling clockwise into the patch from the whole basin
for k in range(900):
    r0 = rng.uniform(4, 30)
    th0 = rng.uniform(0, 2 * np.pi)
    t = np.linspace(0, 1, 40)
    r = r0 * (1 - 0.85 * t)
    th = th0 - 2.2 * t
    xs, ys = cx + 1.6 * r * np.cos(th), cy + 0.75 * r * np.sin(th)
    ok = (xs > 132) & (xs < 248) & (ys > 7) & (ys < 56)
    if k % 6 == 0:
        ax.plot(xs[ok], ys[ok], color=np.array(DIM) / 255, lw=0.4, alpha=0.35)
    ax.scatter(xs[-1:], ys[-1:], s=2.5, color=np.array(INK) / 255, alpha=0.8, lw=0)
ax.add_patch(matplotlib.patches.Ellipse((cx, cy), 26, 11, fill=False,
                                        ec=np.array(ACCENT) / 255, lw=1.6, ls="--"))
fig.savefig(HERE / "_map.png", dpi=100, facecolor=fig.get_facecolor())
plt.close(fig)

# ── compose ────────────────────────────────────────────────────────────────
img = Image.new("RGB", (W, H), GROUND)
d = ImageDraw.Draw(img)
f_head = ImageFont.truetype(str(FONTS / "ArchivoBlack-Regular.ttf"), 58)
f_lab = ImageFont.truetype(str(FONTS / "IBMPlexSans-Bold.ttf"), 28)
f_num = ImageFont.truetype(str(FONTS / "ArchivoBlack-Regular.ttf"), 64)
f_small = ImageFont.truetype(str(FONTS / "IBMPlexMono-Bold.ttf"), 22)

boxes = []
def text(xy, s, font, fill, anchor="la"):
    d.text(xy, s, font=font, fill=fill, anchor=anchor)
    boxes.append(d.textbbox(xy, s, font=font, anchor=anchor))

text((W // 2 - 70, 285), "THE PACIFIC", f_head, INK, "ma")
text((W // 2 - 70, 350), "GARBAGE PATCH", f_head, INK, "ma")
text((W // 2 - 70, 415), "ISN'T STRAWS.", f_head, INK, "ma")

map_xy = (60, 540)
img.paste(Image.open(HERE / "_map.png").convert("RGB"), map_xy)
boxes.append((60, 540, 60 + MAP_W, 540 + MAP_H))
(HERE / "_map.png").unlink()
# place labels on the map (cyl projection: linear in lon/lat)
def mxy(lon, lat):
    return (map_xy[0] + (lon % 360 - 130) / 120 * MAP_W, map_xy[1] + (58 - lat) / 53 * MAP_H)
text(mxy(-123, 44), "CALIFORNIA", f_small, DIM, "ra")
hx, hy = mxy(-157, 20.5)
text((hx, hy + 14), "HAWAII", f_small, DIM, "ma")
px, py = mxy(*PATCH)
text((px - 20, py + 48), "1.6 MILLION KM²", f_small, ACCENT, "ma")

# ── the balance: nets on one pan, everything else on the other ─────────────
bx, by = W // 2 - 70, 1110                  # pivot
beam = 250
tilt = np.radians(2.5)                      # 46 vs 54: the right pan sits a little lower
L = (bx - beam * np.cos(tilt), by - beam * np.sin(tilt))
R = (bx + beam * np.cos(tilt), by + beam * np.sin(tilt))
d.polygon([(bx, by), (bx - 40, 1260), (bx + 40, 1260)], fill=(30, 52, 86))
d.line([L, R], fill=INK, width=6)
for (x, y) in (L, R):
    d.line([(x, y), (x - 90, y + 110)], fill=DIM, width=2)
    d.line([(x, y), (x + 90, y + 110)], fill=DIM, width=2)
    d.arc([x - 120, y + 80, x + 120, y + 150], 0, 180, fill=INK, width=5)
# left pan: a tangled net, amber mesh
nx, ny = L[0], L[1] + 112
for i in range(60):
    a = rng.uniform(0, np.pi)
    p0 = (nx + rng.uniform(-100, 100), ny - rng.uniform(0, 70))
    p1 = (p0[0] + 60 * np.cos(a), p0[1] - 30 * np.sin(a))
    d.line([p0, p1], fill=AMBER, width=3)
# right pan: everything else — bottles, crates, bags, a few straws
ex, ey = R[0], R[1] + 112
for i in range(22):
    x0, y0 = ex + rng.uniform(-100, 80), ey - rng.uniform(5, 60)
    kind = i % 3
    if kind == 0:
        d.rounded_rectangle([x0, y0 - 34, x0 + 16, y0], 5, outline=INK, width=2)
    elif kind == 1:
        d.rectangle([x0, y0 - 18, x0 + 30, y0], outline=DIM, width=2)
    else:
        d.line([(x0, y0), (x0 + 40, y0 - 10)], fill=INK, width=2)

text((L[0], 1270), "FISHING NETS", f_lab, AMBER, "ma")
text((L[0], 1308), f"{NETS_SHARE:.0%}", f_num, AMBER, "ma")
text((R[0], 1270), "EVERYTHING ELSE", f_lab, INK, "ma")
text((R[0], 1308), f"{1 - NETS_SHARE:.0%}", f_num, INK, "ma")
text((W // 2 - 70, 1410), "BY WEIGHT · LEBRETON ET AL. 2018", f_small, DIM, "ma")

# safe-area check: every piece of content inside x 60–870, y 270–1540
for b in boxes:
    assert b[0] >= SAFE[0] - 1 and b[2] <= SAFE[2] + 1, f"x outside safe area: {b}"
    assert b[1] >= SAFE[1] and b[3] <= SAFE[3], f"y outside safe area: {b}"
for x in (L[0] - 120, R[0] + 120):
    assert SAFE[0] <= x <= SAFE[2], f"pan outside safe area: {x}"

img.save(HERE / "payoff_frame.png")
print("payoff_frame.png written;", len(boxes), "blocks inside the safe area")
