"""
Gate 0 mock for I15 — "Dijkstra floods. A* aims."

NOT a render. A PIL still whose only job is to let a human answer: does a
stranger, sound off, know what they are looking at and want to know why one
side of the picture is flooded?

Everything here is real. The graph is Midtown Manhattan pulled from
OpenStreetMap (fetch_graph.py), and both searches are the real runs from
search.py — the same code, differing only in the heuristic. Dijkstra IS A* with
h = 0, which is the reel's actual point.

OSM data is ODbL, so the attribution on the frame is not decoration: a Produced
Work may be distributed under any terms, but it must credit OpenStreetMap.
"""
import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from search import build, haversine, search  # noqa: E402

W, H = 1080, 1920
SAFE_TOP, SAFE_BOT, SIDE, SAFE_W = 270, 1540, 60, 810
INK, DIM, CYAN, AMBER, GRAPHITE = "#E8E6E1", "#81A2C4", "#00D6F7", "#FFB020", "#274064"

START = (40.7580, -73.9855)   # Times Square
GOAL = (40.7794, -73.9632)    # the Met

graph = json.loads((HERE.parent / "graph_nyc.json").read_text())
pos, adj = build(graph)
near = lambda ll: min(pos, key=lambda n: haversine(pos[n], ll))
s, g = near(START), near(GOAL)
gp = pos[g]
dij = search(pos, adj, s, g, lambda n: 0.0)
ast = search(pos, adj, s, g, lambda n: haversine(pos[n], gp))
assert abs(dij["cost"] - ast["cost"]) < 1e-6 and dij["path"] == ast["path"]

S, Wl, N, E = graph["bbox"]
MW = 662
MH = int(MW * (N - S) / ((E - Wl) * math.cos(math.radians((N + S) / 2))))
MX, MY = 465 - MW // 2, 540


def proj(lat, lon):
    return (MX + (lon - Wl) / (E - Wl) * MW, MY + (N - lat) / (N - S) * MH)


def font(sz, bold=False):
    for p in (
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold
        else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ):
        try:
            return ImageFont.truetype(p, sz)
        except Exception:
            pass
    return ImageFont.load_default()


def mono(sz):
    for p in ("/System/Library/Fonts/Menlo.ttc", "/System/Library/Fonts/Courier.ttc"):
        try:
            return ImageFont.truetype(p, sz)
        except Exception:
            pass
    return font(sz)


img = Image.new("RGB", (W, H), "#040E1F")
d = ImageDraw.Draw(img)
for gx in range(0, W, 54):
    d.line([(gx, 0), (gx, H)], fill="#0C1522")
for gy in range(0, H, 54):
    d.line([(0, gy), (W, gy)], fill="#0C1522")

# ── every street, faint. This is the object: a stranger must see "a city". ──
for way in graph["ways"]:
    pts = [proj(*pos[n]) for n in way["nodes"] if n in pos]
    if len(pts) > 1:
        d.line(pts, fill="#1B3149", width=2)

# ── what Dijkstra looked at: everything, in all directions ─────────────────
for n in dij["settled"]:
    x, y = proj(*pos[n])
    d.ellipse([x - 3, y - 3, x + 3, y + 3], fill="#2E5C86")

# ── what A* looked at: a corridor aimed at the goal ────────────────────────
for n in ast["settled"]:
    x, y = proj(*pos[n])
    d.ellipse([x - 3, y - 3, x + 3, y + 3], fill=CYAN)

# ── the answer both of them returned, identically ──────────────────────────
d.line([proj(*pos[n]) for n in dij["path"]], fill=INK, width=6)
for node, col in ((s, INK), (g, AMBER)):
    x, y = proj(*pos[node])
    d.ellipse([x - 11, y - 11, x + 11, y + 11], fill=col)

# "One search", not "one of them" — r007 shipped a bare pronoun in its hook and
# it was the first thing a viewer flagged. Rule 3 bans "this"; it bans this too.
d.text((SIDE, SAFE_TOP + 24), "Same route, either way.", font=font(60, True), fill=INK)
d.text((SIDE, SAFE_TOP + 100), "One search looked at", font=font(60, True), fill=INK)
d.text((SIDE, SAFE_TOP + 176), "three times as much.", font=font(60, True), fill=CYAN)

rows = [
    ("checked every direction", f"{len(dij['settled']):,}", "#2E5C86"),
    ("aimed at the goal", f"{len(ast['settled']):,}", CYAN),
    # They are junctions, not turns. The route passes through 158 junctions; it
    # does not turn 158 times, and the reel is not allowed to imply it does.
    ("same route, either way", f"{dij['cost']/1000:.1f} km", INK),
]
ty = 1330
d.line([(SIDE, ty - 26), (SIDE + SAFE_W, ty - 26)], fill="#1E3348", width=2)
for i, (k, v, col) in enumerate(rows):
    y = ty + i * 58
    d.text((SIDE, y), k, font=mono(36), fill=DIM)
    d.text((SIDE + SAFE_W, y), v, font=mono(36), fill=col, anchor="ra")
    d.line([(SIDE, y + 46), (SIDE + SAFE_W, y + 46)], fill="#1E3348", width=2)

d.text((SIDE, 1500), "Midtown Manhattan · © OpenStreetMap contributors",
       font=mono(26), fill="#4A688A")

out = HERE / "payoff_frame.png"
img.save(out)
print(f"""wrote {out}

  graph        {len(pos):,} junctions, {sum(len(v) for v in adj.values()):,} directed edges
  Dijkstra     {len(dij['settled']):,} junctions expanded
  A*           {len(ast['settled']):,} junctions expanded
  ratio        {len(dij['settled'])/len(ast['settled']):.1f}x fewer
  route        {len(dij['path'])} junctions, {dij['cost']:,.0f} m — IDENTICAL from both""")
