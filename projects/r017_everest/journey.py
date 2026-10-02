"""r017 · I86 — the race: India's real path north, for the globe beat.

    python3 plate_journey.py && python3 journey.py

Rotations: Seton et al. 2012 (plate 501 India; every plate relative to 301 Eurasia, so Asia holds
still on screen). Geometry: Natural Earth 1:50m countries (public domain), each assigned to the
plate whose Seton static polygon contains its representative point, then rotated by THAT plate's
poles. Only the rotations come from the model — never its geometry (licence, GATE0.md §8).

Exports, per plate used: a unit quaternion for every whole million years 0..80 Ma (present -> past).
The TS side slerps between neighbouring Myr. Also exports:
  * outlines (simplified, densified to <= 1 deg per edge so they hug the sphere),
  * a triangulated, subdivided India fill (interior grid points, so triangles sag < 0.2% of R),
  * the amber dot: Everest's present spot on India's northern edge, carried by plate 501.

KNOWN SIMPLIFICATION, stated in NOTES: present-day outlines are moved, so the crust between India
and Asia that was consumed after the collision (Greater India, and Asia's own shortening) is not
drawn. The globe beat therefore stops at 55 Ma, India still at sea, and never shows contact.
"""
import json
import math
from pathlib import Path

import numpy as np
import pygplates
from scipy.spatial import Delaunay
from shapely.geometry import MultiPolygon, Point, Polygon, shape
from shapely.ops import unary_union

HERE = Path(__file__).resolve().parent
D = HERE / "data"
ROT = pygplates.RotationModel(str(D / "Seton_etal_ESR2012_2012.1.rot"))
SP = pygplates.FeatureCollection(str(D / "Seton_etal_ESR2012_StaticPolygons_2012.1.gpmlz"))
NE = json.loads((D / "ne_50m_admin_0_countries.geojson").read_text())
EURASIA, INDIA = 301, 501
T_MAX = 80
EVEREST = (27.98817, 86.92502)
SUTURE = (29.3, 87.0)            # Indus-Yarlung suture south of Everest
INDIA_ISO = {"IND", "BGD", "NPL", "BTN"}     # drawn as "India" (all on plate 501 today; Sri Lanka is 502)

polys = [(f.get_reconstruction_plate_id(), g) for f in SP for g in f.get_all_geometries()
         if isinstance(g, pygplates.PolygonOnSphere)]


def plate_of(lat, lon):
    p = pygplates.PointOnSphere(lat, lon)
    hits = [pid for pid, g in polys if g.is_point_in_polygon(p)]
    return hits[0] if hits else None


def quat(t, pid):
    """Unit quaternion (w, x, y, z) in pygplates' frame: x = cos(lat)cos(lon), y = cos(lat)sin(lon),
    z = sin(lat)."""
    r = ROT.get_rotation(float(t), pid, 0.0, EURASIA)
    if r.represents_identity_rotation():
        return [1.0, 0.0, 0.0, 0.0]
    plat, plon, ang = r.get_lat_lon_euler_pole_and_angle_degrees()
    plat, plon = math.radians(plat), math.radians(plon)
    h = math.radians(ang) / 2
    ax = (math.cos(plat) * math.cos(plon), math.cos(plat) * math.sin(plon), math.sin(plat))
    return [round(v, 7) for v in (math.cos(h), *(a * math.sin(h) for a in ax))]


def densify(coords, step=1.0):
    out = []
    for (x0, y0), (x1, y1) in zip(coords[:-1], coords[1:]):
        n = max(1, int(math.ceil(max(abs(x1 - x0), abs(y1 - y0)) / step)))
        out += [(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n) for k in range(n)]
    out.append(coords[-1])
    return out


outlines, plates_used = [], set([INDIA])
india_parts = []
for feat in NE["features"]:
    iso = feat["properties"].get("ADM0_A3")
    g = shape(feat["geometry"])
    parts = list(g.geoms) if isinstance(g, MultiPolygon) else [g]
    for part in parts:
        if part.area < 0.6:                 # sq deg; drops islets that would only add noise
            continue
        if iso in INDIA_ISO:
            india_parts.append(part)
            continue
        rp = part.representative_point()
        pid = plate_of(rp.y, rp.x)
        if pid is None:
            continue
        s = part.simplify(0.35, preserve_topology=True)
        ring = densify(list(s.exterior.coords))
        if len(ring) < 4:
            continue
        plates_used.add(pid)
        outlines.append(dict(pid=pid, ll=[[round(y, 2), round(x, 2)] for x, y in ring]))

india = unary_union(india_parts)
india = max(india.geoms, key=lambda p: p.area) if isinstance(india, MultiPolygon) else india   # mainland
india_s = india.simplify(0.15, preserve_topology=True)
ring = densify(list(india_s.exterior.coords), 0.75)
# fill: boundary + an interior 1-degree grid, Delaunay, keep triangles whose centroid is inside
minx, miny, maxx, maxy = india_s.bounds
grid = [(x, y) for x in np.arange(minx, maxx, 1.0) for y in np.arange(miny, maxy, 1.0)
        if india_s.buffer(-0.3).contains(Point(x, y))]
pts = np.array(ring[:-1] + grid)
tri = Delaunay(pts)
tris = [t.tolist() for t in tri.simplices if india_s.contains(Point(pts[t].mean(axis=0)))]
max_edge = max(max(np.linalg.norm(pts[a] - pts[b]) for a, b in ((t[0], t[1]), (t[1], t[2]), (t[0], t[2]))) for t in tris)

checks = []


def check(text, cond):
    assert cond, f"JOURNEY CHECK FAILED: {text}"
    checks.append(text)


check(f"India's pieces are all on plate 501 today ({sorted(INDIA_ISO)})",
      all(plate_of(p.representative_point().y, p.representative_point().x) == INDIA for p in india_parts))
check(f"India fill: {len(tris)} triangles, longest edge {max_edge:.2f} deg (≤ 3, so sag < 0.04% of R)", max_edge <= 3.0)
check("India fill covers ≥ 97% of the outline's area",
      sum(Polygon(pts[t]).area for t in tris) >= 0.97 * india_s.area)
def qrot(q, lat, lon):
    w, x, y, z = q
    v = np.array([math.cos(math.radians(lat)) * math.cos(math.radians(lon)),
                  math.cos(math.radians(lat)) * math.sin(math.radians(lon)), math.sin(math.radians(lat))])
    u = np.array([x, y, z])
    return v + 2 * np.cross(u, np.cross(u, v) + w * v)


ref = ROT.get_rotation(60.0, INDIA, 0.0, EURASIA) * pygplates.PointOnSphere(*EVEREST)
check("the exported quaternion moves Everest's spot exactly where pygplates does (60 Ma)",
      np.linalg.norm(qrot(quat(60, INDIA), *EVEREST) - np.array(ref.to_xyz())) < 1e-5)
check("Eurasia never moves in its own frame", all(abs(quat(t, EURASIA)[0]) > 0.999999 for t in range(T_MAX + 1)))

# the gap the race closes: Everest's spot (on India) to the suture (on Asia), every Myr
ev = pygplates.PointOnSphere(*EVEREST)
su = pygplates.PointOnSphere(*SUTURE)
gap = [pygplates.GeometryOnSphere.distance(ROT.get_rotation(float(t), INDIA, 0.0, EURASIA) * ev, su) * 6371
       for t in range(T_MAX + 1)]
check("the ocean ahead of India narrows every million years from 80 to 50 Ma",
      all(gap[t] < gap[t + 1] for t in range(50, T_MAX)))

speed = json.loads((HERE / "plate_journey.json").read_text())["speed_cm_yr"]
out = dict(
    tMax=T_MAX, plates=sorted(plates_used),
    quats={str(pid): [quat(t, pid) for t in range(T_MAX + 1)] for pid in sorted(plates_used)},
    outlines=outlines,
    india=dict(ll=[[round(y, 3), round(x, 3)] for x, y in pts], tris=tris,
               ring=[[round(y, 3), round(x, 3)] for x, y in ring]),
    everest=list(EVEREST), suture=list(SUTURE),
    gapKm=[round(g) for g in gap], speedCmYr=speed[:T_MAX + 1],
)
(HERE / "journey.json").write_text(json.dumps(out, separators=(",", ":")))
for c in checks:
    print("  ✓", c)
print(f"plates {len(plates_used)} · outlines {len(outlines)} · gap 80 Ma {gap[80]:.0f} km -> 55 Ma {gap[55]:.0f} km")
print(f"wrote journey.json ({(HERE / 'journey.json').stat().st_size // 1024} KB)")
