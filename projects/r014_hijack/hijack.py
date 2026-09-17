#!/usr/bin/env python3
"""r014 / I31 -- the real geography and the real timeline behind the 2008
Pakistan Telecom / YouTube route leak.

Two things are computed here, neither authored:

1. REAL great-circle arcs from six real cities to Karachi, via proper
   spherical interpolation (haversine + slerp), the same method r006 used for
   its cable route. These are illustrative geography -- real places, a real
   shortest path between each pair -- not a claim that these six networks were
   among the 97 actually affected (we do not have that granular a source; see
   NOTES.md "what is not claimed").

2. The REAL timeline, verified against three independent primary sources
   (gate0/GATE0.md Sec5): 24 Feb 2008, 18:47 UTC announcement, 97 ASNs by
   18:49:30 (+150s), resolved 21:01 UTC (+8040s = 2h14m). A piecewise-linear
   screen-time <-> real-time keyframe schedule is defined here and re-used by
   emit_ts.py to assert every on-screen number at the exact frame it appears,
   and by the .tsx to actually drive the clock.

Run:
    python3 projects/r014_hijack/hijack.py
"""
import json
import math
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]

# ── real geography ───────────────────────────────────────────────────────────
KARACHI = (67.0011, 24.8607)
CONVERGING = {
    "LONDON": (-0.1278, 51.5074),
    "LAGOS": (3.3792, 6.5244),
    "TOKYO": (139.6917, 35.6895),
    "SYDNEY": (151.2093, -33.8688),
    "SAO PAULO": (-46.6333, -23.5505),
    "MUMBAI": (72.8777, 19.0760),
}
# Decorative "the internet, alive" traffic for the hook, before Karachi is
# named. Real places, real distances -- not a claim about which networks were
# among the 97, purely ambient motion (same status as r009's galaxy backdrop).
AMBIENT_PAIRS = [
    (("NEW YORK", (-74.0060, 40.7128)), ("FRANKFURT", (8.6821, 50.1109))),
    (("LOS ANGELES", (-118.2437, 34.0522)), ("HONG KONG", (114.1694, 22.3193))),
    (("SINGAPORE", (103.8198, 1.3521)), ("CAPE TOWN", (18.4241, -33.9249))),
    (("MIAMI", (-80.1918, 25.7617)), ("FRANKFURT", (8.6821, 50.1109))),
]

R_E = 6371.0088


def hav_km(a, b):
    lon1, lat1 = a
    lon2, lat2 = b
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lon2 - lon1)
    h = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return 2 * R_E * math.asin(min(1, math.sqrt(h)))


def great_circle(a, b, n=64):
    """Real spherical interpolation (slerp) between two (lon, lat) points,
    returning n+1 (lon, lat) waypoints along the true shortest path -- the
    same method r006 used (`densify`), generalised to a fixed point count so
    every arc packs the same size regardless of distance."""
    lon1, lat1 = math.radians(a[0]), math.radians(a[1])
    lon2, lat2 = math.radians(b[0]), math.radians(b[1])
    x1, y1, z1 = math.cos(lat1) * math.cos(lon1), math.cos(lat1) * math.sin(lon1), math.sin(lat1)
    x2, y2, z2 = math.cos(lat2) * math.cos(lon2), math.cos(lat2) * math.sin(lon2), math.sin(lat2)
    d = math.acos(max(-1, min(1, x1 * x2 + y1 * y2 + z1 * z2)))
    pts = []
    for i in range(n + 1):
        f = i / n
        if d < 1e-9:
            x, y, z = x1, y1, z1
        else:
            A = math.sin((1 - f) * d) / math.sin(d)
            B = math.sin(f * d) / math.sin(d)
            x = A * x1 + B * x2
            y = A * y1 + B * y2
            z = A * z1 + B * z2
        lat = math.degrees(math.atan2(z, math.hypot(x, y)))
        lon = math.degrees(math.atan2(y, x))
        pts.append((lon, lat))
    return pts


def coastlines():
    """Reuse r005's real GSHHG coastline data rather than inventing one."""
    src = (ROOT / "remotion/src/reels/data/r005_geo.ts").read_text()
    block = src[src.index("export const COAST"):]
    block = block[: block.index("];") + 1]
    rings = []
    for row in re.findall(r"\[([-0-9.,\s]+)\]", block):
        vals = [float(t) for t in row.split(",") if t.strip()]
        pts = [(vals[i], vals[i + 1]) for i in range(0, len(vals) - 1, 2)]
        if len(pts) > 1:
            rings.append(pts)
    return rings


converging_arcs = {
    name: great_circle(coord, KARACHI, n=48) for name, coord in CONVERGING.items()
}
converging_km = {name: hav_km(coord, KARACHI) for name, coord in CONVERGING.items()}
ambient_arcs = [
    {"a": a[0], "b": b[0], "path": great_circle(a[1], b[1], n=32)}
    for a, b in AMBIENT_PAIRS
]

# ── the real timeline, verified (gate0/GATE0.md Sec5) ────────────────────────
# All times as seconds elapsed since the 18:47:00 UTC announcement.
T_ANNOUNCE = 0
T_ASIA = 45           # 18:47:45, first evidence in Asia
T_97_ASNS = 150       # 18:49:30, 97 ASNs carrying the route -- 2 min 30 s from
                      # the announcement (NOT the "1:45" some write-ups quote,
                      # which is measured from T_ASIA instead; our clock starts
                      # at the announcement, so 150s is the honest figure)
T_YOUTUBE_COUNTERS = 4800   # 20:07 UTC, +80 min
T_YOUTUBE_MORE_SPECIFIC = 5460  # 20:18 UTC, +91 min
T_RESOLVED = 8040     # 21:01 UTC, +134 min = 2h14m

assert T_RESOLVED == 2 * 3600 + 14 * 60, "2h14m must equal 8040s"
assert T_97_ASNS == T_ASIA + 105, "97 ASNs lands 1:45 after first Asia evidence"

# Piecewise-linear (screenSecond, realSecond) keyframes. Shared with emit_ts.py
# (which asserts every on-screen claim against it) and the .tsx (which drives
# the clock from it). This is the ONE ruler for the whole reel.
CLOCK_KEYFRAMES = [
    (3.0, T_ANNOUNCE),     # beat 2 -- the message is sent, clock appears at 0:00
    (13.5, 5),             # beat 3 -- "contained" hold, clock barely moves
    (20.5, T_97_ASNS),     # beat 4 end / beat 5 start -- 97 networks, 2:30
    (26.0, T_97_ASNS),     # beat 5 -- holds on the fact
    (32.0, T_RESOLVED),    # beat 6 end / beat 7 start -- time-lapse to 2h14m
    (38.0, T_RESOLVED),    # beat 7 -- locked
]

data = {
    "meta": {
        "announceUTC": "2008-02-24T18:47:00Z",
        "resolvedUTC": "2008-02-24T21:01:00Z",
        "durationSeconds": T_RESOLVED,
        "asnsAffected": 97,
        "asnsWindowSeconds": T_97_ASNS,
        "karachi": {"lon": KARACHI[0], "lat": KARACHI[1]},
    },
    "clockKeyframes": CLOCK_KEYFRAMES,
    "converging": {
        name: {"path": path, "km": round(converging_km[name])}
        for name, path in converging_arcs.items()
    },
    "ambient": ambient_arcs,
    "coastlines": coastlines(),
}

out = HERE / "hijack_data.json"
out.write_text(json.dumps(data))
print(f"wrote {out} ({out.stat().st_size / 1024:.0f} KB)")
print(f"converging arcs: {list(converging_arcs)}")
print(f"distances (km): { {k: round(v) for k, v in converging_km.items()} }")
print(f"clock keyframes: {CLOCK_KEYFRAMES}")
