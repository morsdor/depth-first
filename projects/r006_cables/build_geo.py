"""
r006 / I22 — "Your message to a friend abroad goes underwater."

Emits remotion/src/reels/data/r006_geo.ts. Run it, don't hand-edit the output.

── Where every number comes from ───────────────────────────────────────────
  * The route      — built here, from public geography only: real ports and the
                     real chokepoints a cable between them must physically pass
                     (round Arabia, Bab-el-Mandeb, the Red Sea, Suez, the
                     Sicily Channel, Gibraltar, open Atlantic), great-circle
                     interpolated between waypoints.
  * Coastlines     — GSHHG low-resolution rings, re-emitted from r005's
                     generated r005_geo.ts and re-wrapped from its mid-Atlantic
                     seam to a Pacific one. This route crosses the Atlantic, so
                     r005's seam would cut it in half.
  * Fibre speed    — c / 1.4675. 1.4675 is the group index of silica at 1550 nm,
                     the band long-haul submarine systems actually run in.
  * Satellite      — geostationary radius 42,164 km, signal at c.

── Why NOT TeleGeography ───────────────────────────────────────────────────
The first draft measured this route out of submarinecablemap.com's api/v3
GeoJSON. Their citation policy allows screenshots of the published maps under
CC BY-SA 4.0 but says "access to the underlying databases remains restricted to
paying subscribers", so that geometry is not ours to compute from. The waypoint
route below agrees with it to 1.4%, and its ocean legs cross-check against
PUBLISHED cable lengths, which are facts and citable:
    MAREA  Bilbao -> Virginia Beach   published 6,605 km   here 6,414
    IMEWE  end to end                 published 12,091 km  here 9,012 for the
                                      Mumbai -> Marseille trunk alone
"""
from __future__ import annotations

import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "remotion/src/reels/data/r006_geo.ts"

R_E = 6371.0
C_KMS = 299792.458
N_SILICA = 1.4675
V_FIBRE = C_KMS / N_SILICA
GEO_R = 42164.0
# 35,786 km is THE published geostationary altitude and a viewer can check it.
# It is defined above the EQUATOR, so it is GEO_R minus the equatorial radius
# 6,378.137 — not the mean radius 6,371 used everywhere else here. Subtracting
# the mean radius gives 35,793, which is wrong by 7 km and, worse, wrong against
# the one number in this reel the audience might already know.
R_EQ = 6378.137
GEO_ALT = GEO_R - R_EQ

# ── the stage. Mirrors Greatcircle.tsx: 800 wide from x=60 stops at x=860,
# clear of the action rail at x=870. ────────────────────────────────────────
LON_W0, LON_W1 = -100.0, 90.0
LAT_S, LAT_N = -20.0, 63.0

D2R = math.pi / 180.0


def hav(a, b):
    (y1, x1), (y2, x2) = a, b
    p1, p2 = y1 * D2R, y2 * D2R
    h = (math.sin((y2 - y1) * D2R / 2) ** 2
         + math.cos(p1) * math.cos(p2) * math.sin((x2 - x1) * D2R / 2) ** 2)
    return 2 * R_E * math.asin(min(1.0, math.sqrt(h)))


def slerp(a, b, step_km=110.0):
    """Great-circle interpolation, so a leg curves the way a route does rather
    than reading as a chain of straight hops."""
    la1, lo1, la2, lo2 = a[0] * D2R, a[1] * D2R, b[0] * D2R, b[1] * D2R
    d = 2 * math.asin(min(1.0, math.sqrt(
        math.sin((la2 - la1) / 2) ** 2
        + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2)))
    n = max(2, int(hav(a, b) / step_km))
    out = []
    for i in range(n):
        f = i / n
        if d < 1e-12:
            out.append(a)
            continue
        A, B = math.sin((1 - f) * d) / math.sin(d), math.sin(f * d) / math.sin(d)
        x = A * math.cos(la1) * math.cos(lo1) + B * math.cos(la2) * math.cos(lo2)
        y = A * math.cos(la1) * math.sin(lo1) + B * math.cos(la2) * math.sin(lo2)
        z = A * math.sin(la1) + B * math.sin(la2)
        out.append((math.degrees(math.atan2(z, math.hypot(x, y))),
                    math.degrees(math.atan2(y, x))))
    return out


def densify(waypoints):
    pts = []
    for a, b in zip(waypoints, waypoints[1:]):
        pts += slerp(a, b)
    pts.append(waypoints[-1])
    return pts


def length_km(pts):
    return sum(hav(pts[i], pts[i + 1]) for i in range(len(pts) - 1))


# ── the route ───────────────────────────────────────────────────────────────
MUM = (19.076, 72.877)    # Mumbai
MRS = (43.290, 5.370)     # Marseille — where the Mediterranean cables come ashore
BIL = (43.270, -2.950)    # Bilbao — where MAREA leaves for America
VAB = (36.760, -76.060)   # Virginia Beach — where MAREA lands

LEG1_WP = [MUM, (12.5, 60.0), (12.6, 45.0), (12.6, 43.3), (19.0, 38.5),
           (27.5, 34.5), (30.5, 32.35), (31.3, 32.3), (33.8, 28.0),
           (36.8, 12.0), (38.5, 4.0), MRS]
LEG2_WP = [MRS, BIL]
LEG3_WP = [BIL, (44.5, -6.5), (42.0, -12.0), (39.0, -35.0), (37.5, -60.0), VAB]

LEG1, LEG2, LEG3 = densify(LEG1_WP), densify(LEG2_WP), densify(LEG3_WP)

KM1 = length_km(LEG1)
# The one assumption in the reel. Terrestrial fibre does not run straight; 1.35x
# great circle is a standard routing allowance. A sensitivity sweep over
# 1.0x-2.0x moves the reel's payoff by 3 ms out of 165, so it cannot matter.
LAND_DETOUR = 1.35
KM2 = length_km(LEG2) * LAND_DETOUR
KM3 = length_km(LEG3)
CABLE_KM = KM1 + KM2 + KM3

# Best case for the satellite, and deliberately so: one geostationary bird
# parked at each city's own longitude. Mumbai and Virginia Beach are 148.9 deg
# apart and a geostationary satellite's horizon-to-horizon width is 162.6 deg,
# so a genuine one-hop link exists only at ~0 deg elevation and is unusable.
# The real thing is WORSE than the number this reel puts on screen.
def slant(lat):
    return math.sqrt(R_E ** 2 + GEO_R ** 2 - 2 * R_E * GEO_R * math.cos(lat * D2R))


SAT_KM = slant(MUM[0]) + slant(VAB[0])
GC_KM = hav(MUM, VAB)

CABLE_MS = 1000 * CABLE_KM / V_FIBRE
SAT_MS = 1000 * SAT_KM / C_KMS
FLOOR_MS = 1000 * GC_KM / C_KMS
RATIO = SAT_MS / CABLE_MS

# ── coastlines ──────────────────────────────────────────────────────────────
def coastlines():
    """GSHHG rings from r005's generated module, re-wrapped to a Pacific seam
    and clipped to this reel's window.

    Reading another reel's generated data module is a build-time coupling and
    it is deliberate: it is the same GSHHG extract, it costs nothing, and it
    keeps the two map reels pixel-consistent. If r005_geo.ts is ever regenerated
    at a different simplification, regenerate this too.
    """
    src = (ROOT / "remotion/src/reels/data/r005_geo.ts").read_text()
    block = src[src.index("export const COAST"):]
    block = block[:block.index("];")]
    rings = []
    for row in re.findall(r"\[([-0-9.,\s]+)\]", block):
        v = [float(t) for t in row.split(",") if t.strip()]
        pts = [(((v[i] + 180) % 360) - 180, v[i + 1]) for i in range(0, len(v) - 1, 2)]
        run = [pts[0]]
        for p, q in zip(pts, pts[1:]):
            if abs(q[0] - p[0]) > 180:      # the seam. Painting through it draws
                if len(run) > 1:            # a chord straight across the map.
                    rings.append(run)
                run = [q]
            else:
                run.append(q)
        if len(run) > 1:
            rings.append(run)
    keep = []
    for r in rings:
        if any(LON_W0 - 25 < lo < LON_W1 + 25 and LAT_S - 20 < la < LAT_N + 20
               for lo, la in r):
            keep.append([round(c, 2) for lo, la in r for c in (lo, la)])
    return keep


COAST = coastlines()


def flat(pts):
    return [round(c, 3) for la, lo in pts for c in (lo, la)]


def arr(xs):
    return "[" + ", ".join(str(x) for x in xs) + "]"


n_pts = sum(len(r) for r in COAST) // 2
ts = f'''// GENERATED by projects/r006_cables/build_geo.py — do not edit by hand.
//
// r006 / I22 — "Your message to a friend abroad goes underwater."
//
// Coordinates are [lon, lat] degrees, flat-packed, and projected in the .tsx.
// The map never morphs in this reel, but the projection still lives there so
// the window can be tuned in Studio without a rebuild.
//
// The route is built from public geography — real ports and the chokepoints a
// cable between them must pass. It is NOT TeleGeography's route geometry,
// which is licensed; see build_geo.py for the full provenance note.

/** Projection window. The map is 800 wide from x=60, stopping clear of the rail. */
export const LON_W0 = {LON_W0};
export const LON_W1 = {LON_W1};
export const LAT_S = {LAT_S};
export const LAT_N = {LAT_N};

/** Landing points. */
export const MUMBAI: [number, number] = [{MUM[1]}, {MUM[0]}];
export const MARSEILLE: [number, number] = [{MRS[1]}, {MRS[0]}];
export const BILBAO: [number, number] = [{BIL[1]}, {BIL[0]}];
export const VIRGINIA: [number, number] = [{VAB[1]}, {VAB[0]}];

/** The three legs, drawn in order. Leg 2 is the only one over land. */
export const LEG_SEA_1: number[] = {arr(flat(LEG1))};
export const LEG_LAND: number[] = {arr(flat(LEG2))};
export const LEG_SEA_2: number[] = {arr(flat(LEG3))};

/** Kilometres. LAND_KM carries a {LAND_DETOUR}x routing allowance — the reel's one assumption. */
export const KM_SEA_1 = {KM1:.0f};
export const KM_LAND = {KM2:.0f};
export const KM_SEA_2 = {KM3:.0f};
export const CABLE_KM = {CABLE_KM:.0f};

/** Up to geostationary orbit and back down — best case, so an understatement. */
export const SAT_KM = {SAT_KM:.0f};
export const GEO_ALT_KM = {GEO_ALT:.0f};
/** Straight through the Earth at c. Nothing can beat this; nothing reaches it. */
export const FLOOR_KM = {GC_KM:.0f};

/** Speed-of-light FLOORS, one way, in ms. Not pings: no switching, no queuing. */
export const CABLE_MS = {CABLE_MS:.0f};
export const SAT_MS = {SAT_MS:.0f};
export const FLOOR_MS = {FLOOR_MS:.0f};
export const RATIO = {RATIO:.1f};

/** km/s. Glass is 32% slower than vacuum — the handicap the cable wins anyway. */
export const V_FIBRE = {V_FIBRE:.0f};
export const V_RADIO = {C_KMS:.0f};

/** GSHHG coastlines, low resolution: {len(COAST)} rings, {n_pts} points. */
export const COAST: number[][] = [
{chr(10).join("  " + arr(r) + "," for r in COAST)}
];
'''

OUT.write_text(ts)
print(f"""wrote {OUT}  ({OUT.stat().st_size / 1024:.0f} KB)

  Mumbai -> Marseille   {KM1:9,.0f} km   {len(LEG1):4d} pts
  Marseille -> Bilbao   {KM2:9,.0f} km   {len(LEG2):4d} pts   (x{LAND_DETOUR} overland, ASSUMED)
  Bilbao -> Virginia    {KM3:9,.0f} km   {len(LEG3):4d} pts
  ------------------------------------------------
  glass                 {CABLE_KM:9,.0f} km  ->  {CABLE_MS:6.1f} ms
  geostationary         {SAT_KM:9,.0f} km  ->  {SAT_MS:6.1f} ms
  floor (straight, c)   {GC_KM:9,.0f} km  ->  {FLOOR_MS:6.1f} ms
  ratio                 {RATIO:.2f}x
  coast                 {len(COAST)} rings, {n_pts} points""")
