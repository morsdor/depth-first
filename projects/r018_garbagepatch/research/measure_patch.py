"""Where does floating debris end up? Re-run van Sebille, England & Froyland (2012) on real drifters.

Method (van Sebille et al., Environ. Res. Lett. 7 044040 (2012), as recalled — the paper itself was
blocked from this container, so every setting below is SWEPT rather than trusted):
  1. Bin the ocean into cells. For every real drifter, count where it moved over DT days.
  2. That gives a transition matrix: the share of what is in cell i that is in cell j DT days later.
     Seasonal: one matrix per two-month window of the START date, applied in calendar order.
  3. Spread debris evenly over every ocean cell the drifters ever visited, step forward, and see
     where it piles up.

The outside numbers we are checked against, both NOT ours:
  - Lebreton et al. 2018 (Sci. Rep. 8 4666): the measured patch centre oscillates around 32N 145W;
    their study box is 120-160W, 20-45N.
  - van Sebille 2012: one patch per subtropical basin (5) and the North Pacific the most compact.

Nothing here is fitted to the target. Parameters are chosen before comparison and the whole grid is
reported.
"""
import itertools, json, os, sys
from pathlib import Path
import numpy as np
import scipy.sparse as sp

CACHE = Path(os.environ.get("I87_CACHE", "/tmp/claude-0/-home-user-depth-first/"
                            "0f34dec1-f71f-5b7a-991c-59813c89984c/scratchpad/i87"))
HERE = Path(__file__).parent
TARGET = (32.0, -145.0)                     # Lebreton 2018 patch centre
BOX = (-160.0, -120.0, 20.0, 45.0)          # Lebreton 2018 study box: lon0, lon1, lat0, lat1

D = np.load(CACHE / "gdp6h_may25.npz")
LAT, LON, T, DROG = D["lat"], D["lon"], D["time"], D["drogue_status"]
RS = D["rowsize"]
TRAJ = np.repeat(np.arange(RS.size), RS)
MONTH = ((T / 86400 / 365.2425 % 1) * 12).astype(int).clip(0, 11)   # calendar month of start


def gc_km(a, b):
    la1, lo1, la2, lo2 = map(np.radians, (a[0], a[1], b[0], b[1]))
    h = np.sin((la2 - la1) / 2) ** 2 + np.cos(la1) * np.cos(la2) * np.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371.0088 * np.arcsin(np.sqrt(h))


MIN_PAIRS = 20     # a cell needs this many observed departures to count as sampled ocean


def build(res, dt_days, which, seasonal, min_pairs=MIN_PAIRS):
    nx, ny = int(360 / res), int(180 / res)
    cell = (np.floor((LAT + 90) / res).clip(0, ny - 1) * nx
            + np.floor((LON + 180) / res).clip(0, nx - 1)).astype(np.int64)
    K = dt_days * 4                                   # 6-hourly
    i = np.arange(LAT.size - K)
    j = i + K
    ok = (TRAJ[i] == TRAJ[j]) & (np.abs(T[j] - T[i] - dt_days * 86400) < 1)
    if which == "drogued":
        ok &= DROG[i] == 1
    elif which == "undrogued":
        ok &= DROG[i] == 0
    i, j = i[ok], j[ok]
    a, b = cell[i], cell[j]
    # sampled ocean = cells with enough observed departures. Debris that drifts into an unsampled
    # cell (coasts, sea ice, the Sea of Okhotsk) is treated as BEACHED and leaves the system;
    # keeping it there instead made those cells traps and put the "patch" off Sakhalin.
    cells, counts = np.unique(a, return_counts=True)
    ocean = cells[counts >= min_pairs]
    idx = -np.ones(nx * ny, np.int64)
    idx[ocean] = np.arange(ocean.size)
    n = ocean.size
    groups = [list(range(m, m + 2)) for m in range(0, 12, 2)] if seasonal else [list(range(12))]
    mats = []
    for g in groups:
        s = np.isin(MONTH[i], g) & (idx[a] >= 0)
        dep = np.bincount(idx[a[s]], minlength=n).astype(float)   # every departure, incl. beaching
        s &= idx[b] >= 0
        P = sp.coo_matrix((np.ones(s.sum()), (idx[a[s]], idx[b[s]])), shape=(n, n)).tocsr()
        # a sampled cell with no departures in this season: hold the debris for that step
        hold = dep == 0
        P = P + sp.diags(hold.astype(float))
        dep[hold] = 1
        mats.append((sp.diags(1 / dep) @ P).T.tocsr())     # x_{t+1} = M x_t; columns sum <= 1
    lat_c = (ocean // nx + 0.5) * res - 90
    lon_c = (ocean % nx + 0.5) * res - 180
    return mats, lat_c, lon_c, int(ok.sum())


def evolve(mats, years, dt_days, seasonal):
    n = mats[0].shape[0]
    x = np.ones(n) / n
    steps = int(round(years * 365.25 / dt_days))
    for s in range(steps):
        if seasonal:
            day = (s * dt_days) % 365.25
            M = mats[int(day / 365.25 * 6) % 6]
        else:
            M = mats[0]
        x = M @ x
    return x


def north_pacific(lat, lon):
    return (lat > 0) & (lat < 60) & ((lon > 120) | (lon < -100))


def score(x, lat, lon, res):
    npac = north_pacific(lat, lon)
    area = np.cos(np.radians(lat)) * res * res          # concentration = mass / area
    c = np.where(npac, x / area, -1)
    k = int(np.argmax(c))
    # concentration-weighted centre of the top 1% of North Pacific cells
    top = npac & (c >= np.quantile(c[npac], 0.99))
    w = c[top]
    clat = float(np.average(lat[top], weights=w))
    clon = float(np.degrees(np.arctan2(np.average(np.sin(np.radians(lon[top])), weights=w),
                                       np.average(np.cos(np.radians(lon[top])), weights=w))))
    inbox = (lon >= BOX[0]) & (lon <= BOX[1]) & (lat >= BOX[2]) & (lat <= BOX[3])
    box_area_share = area[inbox].sum() / area[npac].sum()
    box_mass_share = x[inbox].sum() / x[npac].sum()
    return dict(peak=(float(lat[k]), float(lon[k])), centre=(round(clat, 1), round(clon, 1)),
                km_to_target=round(float(gc_km((clat, clon), TARGET))),
                box_mass_share=round(float(box_mass_share), 3),
                box_area_share=round(float(box_area_share), 3),
                enrichment=round(float(box_mass_share / box_area_share), 2))


if __name__ == "__main__":
    rows = []
    grid = list(itertools.product([1.0, 2.0], [30, 60, 90], ["all", "drogued", "undrogued"],
                                  [True, False], [5, 20, 50]))
    for res, dt, which, seas, mp in grid:
        mats, lat, lon, npairs = build(res, dt, which, seas, mp)
        for years in (10, 30):
            x = evolve(mats, years, dt, seas)
            r = dict(res=res, dt=dt, drifters=which, seasonal=seas, min_pairs=mp, years=years,
                     pairs=npairs, kept=round(float(x.sum()), 3),
                     **score(x, lat, lon, res))
            rows.append(r)
            print(json.dumps(r), flush=True)
    (HERE / "sweep.json").write_text(json.dumps(rows, indent=1))
    ok = [r for r in rows if r["km_to_target"] < 1000 and r["enrichment"] > 1]
    print(f"\n{len(ok)} of {len(rows)} runs put the North Pacific pile within 1,000 km of the "
          f"measured patch centre (32N 145W) with the Lebreton box enriched above its area share")
