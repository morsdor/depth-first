"""
Gate 0 mock for I22 — "Your message to a friend abroad goes underwater".

NOT a render. A five-minute PIL still whose only job is to let a human answer
one question: does a stranger, sound off, know what they are looking at and
want to know why?

Geography is real even in the mock, because a mock with invented numbers can
pass a gate the real reel would fail:
  * coastlines   — GSHHG rings reused from r006's generated i17_geo.ts, re-wrapped
                   from its mid-Atlantic seam to a Pacific seam (this route crosses
                   the Atlantic, so r006's seam would cut it in half).
  * cable routes — TeleGeography submarine cable map, api/v3 GeoJSON.
  * latency      — measured route length / (c / 1.4675), the group velocity in
                   silica at 1550 nm. Satellite leg travels at c.
"""
import json, math, re, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
SCRATCH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")

W, H = 1080, 1920
SAFE_TOP, SAFE_BOT, SIDE, SAFE_W = 270, 1540, 60, 810
INK, DIM, CYAN, AMBER = "#E8EEF4", "#81A2C4", "#22D3EE", "#F2A93B"
R_E, C_KMS, N_SILICA = 6371.0, 299792.458, 1.4675
V_FIBRE = C_KMS / N_SILICA
GEO_ALT = 35786.0

def hav(a, b):
    (y1, x1), (y2, x2) = a, b
    p1, p2 = math.radians(y1), math.radians(y2)
    h = (math.sin(math.radians(y2 - y1) / 2) ** 2
         + math.cos(p1) * math.cos(p2) * math.sin(math.radians(x2 - x1) / 2) ** 2)
    return 2 * R_E * math.asin(min(1, math.sqrt(h)))

def slant(lat):
    """Ground->geostationary range, best case: satellite at the station's own longitude."""
    la = math.radians(lat)
    r = R_E + GEO_ALT
    return math.sqrt(R_E ** 2 + r ** 2 - 2 * R_E * r * math.cos(la))

# ── coastlines, re-wrapped to a Pacific seam ────────────────────────────────
def coastlines():
    src = (ROOT / "remotion/src/reels/data/i17_geo.ts").read_text()
    block = src[src.index("export const COAST"):]
    block = block[:block.index("];")]
    rings = []
    for row in re.findall(r"\[([-0-9.,\s]+)\]", block):
        v = [float(t) for t in row.split(",") if t.strip()]
        pts = [((v[i] + 180) % 360 - 180, v[i + 1]) for i in range(0, len(v) - 1, 2)]
        # split where the ring jumps the 180 seam — r006's NOTES: a subpath that
        # crosses the seam paints a chord straight across the map if you don't.
        run = [pts[0]]
        for p, q in zip(pts, pts[1:]):
            if abs(q[0] - p[0]) > 180:
                if len(run) > 1: rings.append(run)
                run = [q]
            else:
                run.append(q)
        if len(run) > 1: rings.append(run)
    return rings

# ── the route, from real cable geometry ─────────────────────────────────────
MUM, MRS, BIL, VAB = (19.076, 72.877), (43.29, 5.37), (43.27, -2.95), (36.76, -76.06)

def cable_path(cg, name, A, B):
    """Shortest walk from A to B over ALL of `name`'s vertices.

    A cable's GeoJSON is a MultiLineString split into many parts, so trimming a
    single part yields a shortcut that is shorter than the great circle — i.e.
    obviously not a cable. Weld vertices that sit within 25 km of each other
    across parts, then run Dijkstra over the welded graph.
    """
    import heapq
    from collections import defaultdict
    parts = []
    for f in cg["features"]:
        if f["properties"]["name"] != name: continue
        g = f["geometry"]
        parts += g["coordinates"] if g["type"] == "MultiLineString" else [g["coordinates"]]
    V, adj = [], defaultdict(list)
    for part in parts:
        idx = []
        for x, y in part:
            V.append((y, x)); idx.append(len(V) - 1)
        for a, b in zip(idx, idx[1:]):
            w = hav(V[a], V[b]); adj[a].append((b, w)); adj[b].append((a, w))
    grid = defaultdict(list)
    for i, (y, x) in enumerate(V):
        grid[(round(y * 4), round(x * 4))].append(i)
    for (gy, gx), ids in list(grid.items()):
        cand = [j for dy in (-1, 0, 1) for dx in (-1, 0, 1) for j in grid.get((gy + dy, gx + dx), [])]
        for i in ids:
            for j in cand:
                if j <= i: continue
                w = hav(V[i], V[j])
                if w < 25: adj[i].append((j, w)); adj[j].append((i, w))
    s_ = min(range(len(V)), key=lambda i: hav(A, V[i]))
    t_ = min(range(len(V)), key=lambda i: hav(B, V[i]))
    dist, prev, pq = {s_: 0.0}, {}, [(0.0, s_)]
    while pq:
        dd, u = heapq.heappop(pq)
        if u == t_: break
        if dd > dist.get(u, 1e18): continue
        for v, w in adj[u]:
            nd = dd + w
            if nd < dist.get(v, 1e18):
                dist[v] = nd; prev[v] = u; heapq.heappush(pq, (nd, v))
    path, u = [t_], t_
    while u in prev:
        u = prev[u]; path.append(u)
    path.reverse()
    return [V[i] for i in path], dist[t_], hav(A, V[s_]) + hav(B, V[t_])

cg = json.loads((SCRATCH / "cable-geo.json").read_text())
leg1, km1, _ = cable_path(cg, "IMEWE", MUM, MRS)          # Mumbai -> Marseille
leg3, km3, _ = cable_path(cg, "MAREA", BIL, VAB)          # Bilbao -> Virginia Beach
km2 = hav(MRS, BIL) * 1.35                                # overland France/Spain, 1.35x detour
leg2 = [MRS, BIL]

CABLE_KM = km1 + km2 + km3
SAT_KM   = slant(MUM[0]) + slant(VAB[0])
CABLE_MS = 1000 * CABLE_KM / V_FIBRE
SAT_MS   = 1000 * SAT_KM / C_KMS
FLOOR_MS = 1000 * hav(MUM, VAB) / C_KMS

# ── projection: equirectangular, cropped to the route ───────────────────────
# Crop and width chosen so BOTH endpoint dots and their labels stay inside
# x 60..870. At the full 960 content width Mumbai's dot lands at x=923 — under
# Instagram's action rail. That is the r006 bug, and it repeated here.
LON0, LON1, LAT0, LAT1 = -90.0, 80.0, -8.0, 66.0
MX, MY, MW = 60, 480, 760
MH = int(MW * (LAT1 - LAT0) / (LON1 - LON0))

def proj(lat, lon):
    return (MX + (lon - LON0) / (LON1 - LON0) * MW,
            MY + (LAT1 - lat) / (LAT1 - LAT0) * MH)

def font(sz, bold=False):
    for p in ("/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold
              else "/System/Library/Fonts/Supplemental/Arial.ttf",
              "/System/Library/Fonts/Helvetica.ttc"):
        try: return ImageFont.truetype(p, sz)
        except Exception: pass
    return ImageFont.load_default()

def mono(sz):
    for p in ("/System/Library/Fonts/Menlo.ttc", "/System/Library/Fonts/Courier.ttc"):
        try: return ImageFont.truetype(p, sz)
        except Exception: pass
    return font(sz)

img = Image.new("RGB", (W, H), "#070C14")
d = ImageDraw.Draw(img)

# ground: drafting grid, never a flat fill (rule 2)
for gx in range(0, W, 54):  d.line([(gx, 0), (gx, H)], fill="#0C1522")
for gy in range(0, H, 54):  d.line([(0, gy), (W, gy)], fill="#0C1522")
d.rectangle([MX, MY, MX + MW, MY + MH], outline="#16283C")

for ring in coastlines():
    pts = [proj(la, lo) for lo, la in ring
           if LON0 - 40 < lo < LON1 + 40 and LAT0 - 30 < la < LAT1 + 30]
    if len(pts) > 1:
        d.line(pts, fill="#22344A", width=2)

# the belief, in amber: straight up to orbit, off the top of the frame.
# It leaves the frame because it does not fit in it — that is the argument.
for pt in (MUM, VAB):
    x, y = proj(*pt)
    d.line([(x, y), (x, 0)], fill=AMBER, width=4)
d.text((SIDE + SAFE_W / 2, 300), "35,786 km straight up", font=font(38, True),
       fill=AMBER, anchor="ma")

# the truth, in cyan: the real cable route along the seabed
for leg in (leg1, leg2, leg3):
    d.line([proj(la, lo) for la, lo in leg], fill=CYAN, width=5)
# labels grow INWARD from each dot so neither can overflow its side of the frame
for pt, lab, anc, dx in ((MUM, "Mumbai", "rm", -20), (VAB, "Virginia Beach", "lm", 20)):
    x, y = proj(*pt)
    d.ellipse([x - 9, y - 9, x + 9, y + 9], fill=CYAN)
    d.text((x + dx, y), lab, font=font(30, True), fill=INK, anchor=anc)

# headline sits BELOW the map: show before you tell (rule 3)
d.text((SIDE, 1042), "02", font=mono(30), fill=DIM)
d.text((SIDE, 1082), "It never goes up.", font=font(64, True), fill=INK)

# readout — SAFE_W, not the full content width: these values are the payoff and
# the default 960 parks them under Instagram's action rail (the r006 bug).
rows = [("by satellite",       f"{SAT_MS:,.0f} ms"),
        ("by glass on the seabed", f"{CABLE_MS:,.0f} ms"),
        ("cost of the guess",  f"+{SAT_MS - CABLE_MS:,.0f} ms")]
ty = 1230
d.line([(SIDE, ty - 26), (SIDE + SAFE_W, ty - 26)], fill="#1E3348", width=2)
for i, (k, v) in enumerate(rows):
    y = ty + i * 52
    col = AMBER if i == 0 else (CYAN if i == 1 else INK)
    d.text((SIDE, y), k, font=mono(36), fill=DIM)
    d.text((SIDE + SAFE_W, y), v, font=mono(36), fill=col, anchor="ra")

d.text((SIDE, 1430), "Nothing you send abroad has been to space.",
       font=font(40, True), fill=INK)
d.line([(SIDE, SAFE_BOT), (SIDE + SAFE_W, SAFE_BOT)], fill="#1E3348", width=2)

out = Path(__file__).parent / "payoff_frame.png"
img.save(out)
print(f"""wrote {out}

  IMEWE   Mumbai -> Marseille      {km1:9,.0f} km   (measured along route geometry)
  land    Marseille -> Bilbao      {km2:9,.0f} km   (great circle x1.35, ASSUMED)
  MAREA   Bilbao -> Virginia Bch   {km3:9,.0f} km   (measured; TeleGeography publish 6,605)
  ----------------------------------------------
  glass                            {CABLE_KM:9,.0f} km  ->  {CABLE_MS:6.1f} ms one way
  geostationary, best case         {SAT_KM:9,.0f} km  ->  {SAT_MS:6.1f} ms one way
  straight line at c (the floor)   {hav(MUM,VAB):9,.0f} km  ->  {FLOOR_MS:6.1f} ms

  the satellite is {SAT_KM/CABLE_KM:.1f}x the distance and {SAT_MS/CABLE_MS:.1f}x the time""")
