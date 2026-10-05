#!/usr/bin/env python3
"""r018 · I87 — everything the reel draws on the North Pacific, computed from real data.

    python3 research/fetch_drifters.py && python3 pacific.py && python3 emit_ts.py

  * coast      Natural Earth 1:50m land (public domain), clipped to the view, thinned to ~0.4 deg.
  * buoy       NOAA GDP drifter 300234066410130, its real 6-hourly track, deploy -> last fix.
  * witnesses  other real drifters that started > 2,500 km away and reached the patch.
  * particles  debris carried by the transition model built from every real drifter
               (research/measure_patch.py, reference setting: 1 deg, 60 days, all drifters,
               seasonal, MIN_PAIRS 20). Each particle is a Markov chain on that matrix: every
               60 days it jumps to a cell drawn from the observed transitions out of its cell,
               and it BEACHES (leaves) with the probability the matrix leaks.
  * patch      Lebreton et al. 2018's measured centre (32N 145W) and area (1.6 million km2),
               drawn as a circle of that area: the paper's outline is not in hand, so the shape is
               NOT claimed, only the centre and the size.

Prints every figure the reel uses and asserts what it can.
"""
import json
import math
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / "research"))
import measure_patch as M  # noqa: E402  (loads the drifter cache)

BUOY_ID = 300234066410130
PATCH_C = M.TARGET                      # (32, -145)
PATCH_KM2 = 1.6e6
R_EARTH = 6371.0088
VIEW = dict(lat0=-12, lat1=66, lon0=100, lon1=300)   # lon in 0..360
SEED = 87
N_PART = 2400
STEPS = 42                              # 60-day steps: 0..42 = 6.9 years
DT = 60


def lon360(lon):
    return np.mod(lon, 360)


def in_view(lat, lon):
    l = lon360(lon)
    return (lat >= VIEW["lat0"]) & (lat <= VIEW["lat1"]) & (l >= VIEW["lon0"]) & (l <= VIEW["lon1"])


# ── coast ────────────────────────────────────────────────────────────────────────────────
def coast():
    gj = json.loads((HERE / "data" / "ne_50m_land.geojson").read_text())
    out = []
    for f in gj["features"]:
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            ring = np.array(poly[0])
            if len(ring) < 8:
                continue
            lat, lon = ring[:, 1], ring[:, 0]
            keep = in_view(lat, lon)
            # split into runs inside the view, thinned to >= 0.4 deg steps
            run = []
            for la, lo, k in zip(lat, lon, keep):
                if k:
                    if not run or abs(la - run[-1][0]) + abs(lon360(lo) - run[-1][1]) >= 0.4:
                        run.append((round(float(la), 2), round(float(lon360(lo)), 2)))
                elif len(run) > 3:
                    out.append(run)
                    run = []
                else:
                    run = []
            if len(run) > 3:
                out.append(run)
    # drop lines that jump across the 0/360 seam
    out = [r for r in out if max(abs(a[1] - b[1]) for a, b in zip(r[:-1], r[1:])) < 20]
    return out


# ── real tracks ──────────────────────────────────────────────────────────────────────────
# NpzFile re-reads (and decompresses) an array on EVERY D[key] access, so load each one once
D = {k: M.D[k] for k in ("id", "DeployingCountry", "drogue_status")}
D.update(lat=M.LAT, lon=M.LON, time=M.T)
ST = np.cumsum(M.RS) - M.RS


def track(tr):
    s, e = ST[tr], ST[tr] + M.RS[tr]
    return D["lat"][s:e], D["lon"][s:e], D["time"][s:e], D["drogue_status"][s:e]


def buoy():
    tr = int(np.flatnonzero(D["id"] == BUOY_ID)[0])
    la, lo, t, dg = track(tr)
    d = M.gc_km((la, lo), PATCH_C)
    k = int(np.argmax(d < 500))
    assert d[k] < 500 and d[:k].min() >= 500
    days = (t - t[0]) / 86400
    pick = np.arange(0, la.size, 8)                       # every 2 days
    if pick[-1] != la.size - 1:
        pick = np.append(pick, la.size - 1)
    pick = np.union1d(pick, [k])
    return dict(
        id=BUOY_ID,
        country=str(D["DeployingCountry"][tr]),
        deployed=str(np.datetime64(int(t[0]), "s"))[:10],
        arrived=str(np.datetime64(int(t[k]), "s"))[:10],
        last=str(np.datetime64(int(t[-1]), "s"))[:10],
        arriveDay=round(float(days[k]), 2),
        lastDay=round(float(days[-1]), 2),
        years=round(float(days[k] / 365.25), 3),
        startKm=round(float(d[0])),
        droguedShare=round(float(dg.mean()), 3),
        daysInsideAfter=round(float((d[k:] < 500).sum() / 4), 1),
        pts=[[round(float(days[i]), 2), round(float(la[i]), 3), round(float(lon360(lo[i])), 3)] for i in pick],
    )


def witnesses(n_draw=26):
    dist = M.gc_km((D["lat"], D["lon"]), PATCH_C)
    inside = dist < 500
    first = {}
    traj = M.TRAJ
    for k in np.flatnonzero(inside):
        first.setdefault(int(traj[k]), int(k))
    far = []
    for tr, k in first.items():
        s = ST[tr]
        if dist[s] > 2500:
            far.append((tr, k))
    rng = np.random.default_rng(SEED)
    # spread the drawn ones across start longitude so they visibly come from all sides
    far.sort(key=lambda x: lon360(D["lon"][ST[x[0]]]))
    idx = np.linspace(0, len(far) - 1, n_draw).round().astype(int)
    drawn = []
    for i in idx:
        tr, k = far[i]
        if int(D["id"][tr]) == BUOY_ID:
            continue
        s = ST[tr]
        seg = np.arange(s, k + 1)
        step = max(1, seg.size // 140)
        seg = np.append(seg[::step], k)
        drawn.append(dict(id=int(D["id"][tr]),
                          pts=[[round(float(D["lat"][j]), 2), round(float(lon360(D["lon"][j])), 2)] for j in seg]))
    return dict(total=len(first), far=len(far),
                asian=int(sum(((lon360(D["lon"][ST[tr]]) > 120) & (lon360(D["lon"][ST[tr]]) < 190)) for tr, _ in far)),
                drawn=drawn)


# ── particles on the real-current model ─────────────────────────────────────────────────
def particles():
    mats, clat, clon, npairs = M.build(1.0, DT, "all", True, 20)
    n = clat.size
    # destinations by row: CSR of the transposed (column-stochastic) matrices back to rows
    rows = [m.T.tocsr() for m in mats]
    npac = M.north_pacific(clat, clon)
    w = np.where(npac, np.cos(np.radians(clat)), 0)
    rng = np.random.default_rng(SEED)
    cell = rng.choice(n, size=N_PART, p=w / w.sum())
    alive = np.ones(N_PART, bool)
    death = np.full(N_PART, -1)
    jit = rng.uniform(-0.5, 0.5, size=(STEPS + 1, N_PART, 2))
    pos = np.zeros((STEPS + 1, N_PART, 2))
    pos[0] = np.c_[clat[cell], clon[cell]] + jit[0]
    for s in range(STEPS):
        P = rows[int(((s * DT) % 365.25) / 365.25 * 6) % 6]
        for p in np.flatnonzero(alive):
            a, b = P.indptr[cell[p]], P.indptr[cell[p] + 1]
            probs = P.data[a:b]
            u = rng.random()
            c = np.searchsorted(np.cumsum(probs), u, side="right")
            if c >= probs.size:                       # leaked: beached
                alive[p] = False
                death[p] = s + 1
            else:
                cell[p] = P.indices[a + c]
        pos[s + 1] = np.c_[clat[cell], clon[cell]] + jit[s + 1]
        pos[s + 1][~alive] = pos[s][~alive]
    # concentration check on the particles themselves, against the measured centre
    end = pos[-1][alive]
    box = (lon360(end[:, 1]) >= 200) & (lon360(end[:, 1]) <= 240) & (end[:, 0] >= 20) & (end[:, 0] <= 45)
    box_area = M.score(np.ones(n), clat, clon, 1.0)["box_area_share"]
    start = pos[0]
    sbox = (lon360(start[:, 1]) >= 200) & (lon360(start[:, 1]) <= 240) & (start[:, 0] >= 20) & (start[:, 0] <= 45)
    # densest 2x2 deg window of the survivors
    H, ye, xe = np.histogram2d(end[:, 0], lon360(end[:, 1]), bins=[np.arange(0, 61, 2), np.arange(120, 262, 2)])
    i, j = np.unravel_index(np.argmax(H), H.shape)
    peak = ((ye[i] + ye[i + 1]) / 2, (xe[j] + xe[j + 1]) / 2)
    out = dict(
        n=N_PART, steps=STEPS, dtDays=DT, pairs=npairs,
        survivors=int(alive.sum()),
        startInBox=round(float(sbox.mean()), 3),
        endInBox=round(float(box.mean()), 3),
        boxAreaShare=box_area,
        peak=[float(peak[0]), float(peak[1])],
        peakKm=round(float(M.gc_km(peak, (PATCH_C[0], PATCH_C[1] % 360)))),
        death=death.tolist(),
        # int16 centi-degrees, lon in 0..360 -> stored as lon - 180 to fit
        lat=np.round(pos[:, :, 0] * 100).astype(int).tolist(),
        lon=np.round((lon360(pos[:, :, 1]) - 180) * 100).astype(int).tolist(),
    )
    return out


if __name__ == "__main__":
    C = coast()
    B = buoy()
    W = witnesses()
    P = particles()
    r = math.sqrt(PATCH_KM2 / math.pi)
    patch = dict(lat=PATCH_C[0], lon=PATCH_C[1] % 360, km2=PATCH_KM2, radiusKm=round(r, 1),
                 radiusDeg=round(r / (R_EARTH * math.pi / 180), 3))
    print(f"coast: {len(C)} lines, {sum(map(len, C))} points")
    print(f"buoy {B['id']} ({B['country']}): deployed {B['deployed']}, {B['startKm']:,} km from the centre; "
          f"arrived {B['arrived']} = {B['years']} yr; last fix {B['last']}; "
          f"{B['daysInsideAfter']} of {B['lastDay'] - B['arriveDay']:.0f} days inside after; drogued {B['droguedShare']:.0%}")
    print(f"witnesses: {W['total']} drifters came within 500 km; {W['far']} from > 2,500 km; "
          f"{W['asian']} of those from the Asian side; {len(W['drawn'])} drawn")
    print(f"particles: {P['n']} seeded evenly over the North Pacific, {P['steps']} x {P['dtDays']} days; "
          f"{P['survivors']} afloat at the end")
    print(f"  in Lebreton's box: {P['startInBox']:.0%} at the start -> {P['endInBox']:.0%} at the end "
          f"(box is {P['boxAreaShare']:.1%} of North Pacific area)")
    print(f"  densest 2x2 deg window: {P['peak']} = {P['peakKm']} km from 32N 145W")
    print(f"patch circle: radius {patch['radiusKm']} km")
    assert P["endInBox"] > 2 * P["startInBox"], "the particles did not gather in the patch box"
    (HERE / "pacific.json").write_text(json.dumps(dict(coast=C, buoy=B, witnesses=W, particles=P, patch=patch,
                                                      view=VIEW)))
    print("wrote pacific.json", (HERE / "pacific.json").stat().st_size // 1024, "KB")
