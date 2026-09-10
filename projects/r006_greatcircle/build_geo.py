#!/usr/bin/env python3
"""r006 / I17 — compute the geometry, don't author it.

Everything the reel draws is produced here from real data and real geodesy:

  * coastlines  — GSHHG, bundled offline in `basemap-data`. No OpenStreetMap,
                  so nothing in this build depends on a host the container's
                  egress proxy refuses.
  * great circle— slerp on the unit sphere between DEL and SFO. This is the
                  shortest path, and it is the line the reel calls "straight".
  * rhumb line  — the constant-bearing track, which is the line that LOOKS
                  straight on a Mercator map. Sampled by walking Mercator's own
                  y-coordinate linearly, because that is the definition.
  * distances   — computed three ways and cross-checked (see the assertions).

Emits remotion/src/reels/data/r006_geo.ts. The projection maths itself lives in
the .tsx, because the reel MORPHS between two projections and the interpolation
has to happen per frame; the formulas there are exact, not eased approximations.

Run:  .geoenv/bin/python projects/r006_greatcircle/build_geo.py
"""
import json
import math
import textwrap
from pathlib import Path

import numpy as np
from mpl_toolkits.basemap import Basemap
from pyproj import Geod

R = 6371.0088                     # IUGG mean radius, km
DEL = (28.61, 77.21)              # lat, lon — Indira Gandhi Intl
SFO = (37.62, -122.38)            # San Francisco Intl
LON0 = 150.0                      # map centre. Seam lands mid-Atlantic (-30 deg),
                                  # so no continent on the route is cut in half.
OUT = Path("remotion/src/reels/data/r006_geo.ts")


# ── the two lines ───────────────────────────────────────────────────────────
def to_xyz(p):
    la, lo = math.radians(p[0]), math.radians(p[1])
    return np.array([math.cos(la) * math.cos(lo),
                     math.cos(la) * math.sin(lo),
                     math.sin(la)])


def great_circle(a, b, n=241):
    u, v = to_xyz(a), to_xyz(b)
    om = float(np.arccos(np.clip(u @ v, -1, 1)))
    t = np.linspace(0, 1, n)[:, None]
    p = (np.sin((1 - t) * om) * u + np.sin(t * om) * v) / np.sin(om)
    lat = np.degrees(np.arcsin(p[:, 2]))
    lon = np.degrees(np.arctan2(p[:, 1], p[:, 0]))
    return lat, lon, om * R


def merc_y(lat_deg):
    la = math.radians(max(-85.0, min(85.0, lat_deg)))
    return math.log(math.tan(math.pi / 4 + la / 2))


def rhumb(a, b, n=121):
    """Constant bearing. Straight in Mercator, which is the whole point."""
    p1, p2 = math.radians(a[0]), math.radians(b[0])
    dpsi = merc_y(b[0]) - merc_y(a[0])
    dlon = (b[1] - a[1]) % 360.0          # eastward, across the Pacific
    if dlon > 180:                         # take the shorter of the two ways round
        dlon -= 360
    dlam = math.radians(dlon)
    q = (p2 - p1) / dpsi if abs(dpsi) > 1e-12 else math.cos(p1)
    dist = math.hypot(p2 - p1, q * dlam) * R
    t = np.linspace(0, 1, n)
    psi = merc_y(a[0]) + t * dpsi
    lat = np.degrees(2 * np.arctan(np.exp(psi)) - math.pi / 2)
    lon = a[1] + t * dlon
    return lat, lon, dist


GC_LAT, GC_LON, GC_KM = great_circle(DEL, SFO)
RH_LAT, RH_LON, RH_KM = rhumb(DEL, SFO)
VERTEX = float(GC_LAT.max())
VERTEX_LON = float(GC_LON[int(np.argmax(GC_LAT))])

# ── cross-checks. A number that only one method produces is a number I made up.
geod = Geod(ellps="WGS84")
WGS84_KM = geod.inv(DEL[1], DEL[0], SFO[1], SFO[0])[2] / 1000.0
# Independent check of the great circle: sum the leg lengths of the sampled path.
_legs = sum(geod.inv(GC_LON[i], GC_LAT[i], GC_LON[i + 1], GC_LAT[i + 1])[2]
            for i in range(len(GC_LAT) - 1)) / 1000.0
assert abs(_legs - WGS84_KM) < 6, (_legs, WGS84_KM)      # sampling is dense enough
assert abs(GC_KM - WGS84_KM) < 40, (GC_KM, WGS84_KM)     # sphere vs ellipsoid gap
# Independent check of the rhumb: walk it and sum, on the sphere.
_rlegs = 0.0
for i in range(len(RH_LAT) - 1):
    a, b = to_xyz((RH_LAT[i], RH_LON[i])), to_xyz((RH_LAT[i + 1], RH_LON[i + 1]))
    _rlegs += float(np.arccos(np.clip(a @ b, -1, 1))) * R
assert abs(_rlegs - RH_KM) < 5, (_rlegs, RH_KM)
assert RH_KM > GC_KM, "the constant-bearing track must be the longer one"

STRETCH = 1.0 / math.cos(math.radians(VERTEX))   # Mercator scale factor, sec(lat)


# ── coastlines ──────────────────────────────────────────────────────────────
def rdp(pts, eps):
    """Ramer-Douglas-Peucker. Iterative, because GSHHG polygons blow the stack."""
    keep = np.zeros(len(pts), bool)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        seg = pts[j] - pts[i]
        n = math.hypot(*seg)
        rel = pts[i + 1:j] - pts[i]
        d = (np.abs(seg[0] * rel[:, 1] - seg[1] * rel[:, 0]) / n if n > 1e-12
             else np.hypot(rel[:, 0], rel[:, 1]))
        k = int(np.argmax(d))
        if d[k] > eps:
            keep[i + 1 + k] = True
            stack += [(i, i + 1 + k), (i + 1 + k, j)]
    return pts[keep]


def coastlines(eps=0.30, min_span=2.2):
    m = Basemap(projection="cyl", llcrnrlat=-60, urcrnrlat=84,
                llcrnrlon=LON0 - 180, urcrnrlon=LON0 + 180, resolution="l")
    out = []
    for poly, kind in zip(m.coastpolygons, m.coastpolygontypes):
        if kind != 1:                       # land only; lakes are sub-pixel here
            continue
        pts = np.column_stack(poly).astype(float)
        if pts.shape[0] < 4:
            continue
        span = max(np.ptp(pts[:, 0]), np.ptp(pts[:, 1]))
        if span < min_span:                    # islands too small to read at 1080px
            continue
        s = rdp(pts, eps)
        if len(s) >= 3:
            out.append(s)
    return out


COAST = coastlines()
N_PTS = sum(len(c) for c in COAST)


def flat(lat, lon):
    return [round(float(v), 3) for pair in zip(lon, lat) for v in pair]


EPS_STR = "0.30"
COAST_STR = ",\n".join(
    "  " + json.dumps([round(float(v), 2) for p in c for v in p]) for c in COAST)


body = f"""\
// GENERATED by projects/r006_greatcircle/build_geo.py — do not edit by hand.
//
// r006 / I17 — "Your flight path isn't curved. Your map is."
//
// Coordinates are [lon, lat] degrees, flat-packed. They are PROJECTED in the
// .tsx rather than here, because the reel morphs between a globe and a flat map
// and the interpolation has to be evaluated every frame. Pre-projecting would
// mean shipping {N_PTS} points once per morph step instead of once.
//
// The seam sits at {LON0 - 180:.0f} deg (mid-Atlantic), so the map is Pacific-centred —
// the seatback view — and no landmass the route crosses is cut in half.

/** Centre longitude of the flat map. */
export const LON0 = {LON0};

/** Great-circle vertex: the highest latitude the shortest path reaches. */
export const VERTEX_LAT = {VERTEX:.1f};
export const VERTEX_LON = {VERTEX_LON:.1f};

/** Mercator's scale factor at the vertex, sec(lat). Both directions equally. */
export const STRETCH_AT_VERTEX = {STRETCH:.2f};

/** Shortest path, on a sphere of the IUGG mean radius ({R} km). */
export const GC_KM = {GC_KM:.0f};
/** The same pair as a WGS84 geodesic, for reference. The reel quotes the sphere. */
export const WGS84_KM = {WGS84_KM:.0f};
/** Constant-bearing track — the line that looks straight on the flat map. */
export const RHUMB_KM = {RH_KM:.0f};
/** How much longer the straight-LOOKING line actually is. */
export const EXTRA_KM = {RH_KM - GC_KM:.0f};

export const DEL: [number, number] = [{DEL[1]}, {DEL[0]}];
export const SFO: [number, number] = [{SFO[1]}, {SFO[0]}];

/** {len(GC_LAT)} points, slerped on the unit sphere. */
export const GC: number[] = {json.dumps(flat(GC_LAT, GC_LON))};

/** {len(RH_LAT)} points, sampled linearly in Mercator's own y. */
export const RHUMB: number[] = {json.dumps(flat(RH_LAT, RH_LON))};

/** GSHHG coastlines, low resolution, Douglas-Peucker at {EPS_STR} deg: {len(COAST)} rings, {N_PTS} points. */
export const COAST: number[][] = [
{COAST_STR}
];
"""

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(body)

print(f"great circle : {GC_KM:8.1f} km   (WGS84 {WGS84_KM:.1f}, sampled {_legs:.1f})")
print(f"rhumb        : {RH_KM:8.1f} km   (+{RH_KM - GC_KM:.0f} km, {100*(RH_KM/GC_KM-1):.1f}% longer)")
print(f"vertex       : {VERTEX:.1f}N at {VERTEX_LON:.1f}E,  Mercator stretch {STRETCH:.2f}x")
print(f"coast        : {len(COAST)} rings, {N_PTS} points -> {OUT} ({OUT.stat().st_size/1024:.0f} KB)")
