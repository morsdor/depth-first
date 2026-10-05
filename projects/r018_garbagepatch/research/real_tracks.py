"""Real buoys that drifted into the patch: which ones, from where, how long it took.

"In the patch" = within 500 km of Lebreton et al. 2018's measured centre, 32N 145W. "Far away" =
deployed more than 2,500 km from it. Every figure printed here is a fact about a real, numbered
NOAA drifter, never a model.
"""
import os
from pathlib import Path
import numpy as np
from measure_patch import gc_km, TARGET, CACHE

D = np.load(CACHE / "gdp6h_may25.npz")
lat, lon, t, rs, ids = D["lat"], D["lon"], D["time"], D["rowsize"], D["id"]
st = np.cumsum(rs) - rs
dist = gc_km((lat, lon), TARGET)
inside = dist < 500
traj = np.repeat(np.arange(rs.size), rs)
first_in = {}
for k in np.flatnonzero(inside):
    tr = traj[k]
    if tr not in first_in:
        first_in[tr] = k
rows = []
for tr, k in first_in.items():
    s = st[tr]
    d0 = gc_km((lat[s], lon[s]), TARGET)
    if d0 > 2500:
        days = (t[k] - t[s]) / 86400
        stay = inside[s:s + rs[tr]][k - s:].mean()      # share of the rest of its life spent inside
        rows.append((tr, int(ids[tr]), float(lat[s]), float(lon[s]), round(float(d0)), round(days),
                     round(float(stay), 2), str(D["DeployingCountry"][tr]),
                     str(np.datetime64(int(t[s]), "s"))[:10]))
print(f"{len(first_in)} drifters ever came within 500 km of 32N 145W; "
      f"{len(rows)} of them started more than 2,500 km away")
starts = np.array([(r[2], r[3]) for r in rows])
west = ((starts[:, 1] > 120) | (starts[:, 1] < -170)).sum()
print(f"  {west} started west of 170W (the Asian side)")
rows.sort(key=lambda r: -r[4])
print("farthest-travelled (id, start lat/lon, km from patch at start, days to arrive, share of rest of life inside, country, deployed):")
for r in rows[:15]:
    print("  ", r[1:])
