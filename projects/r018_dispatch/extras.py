#!/usr/bin/env python3
"""PREREG §5 -- the two extra measurements. Same graph, same seeds, same point sampling as the grid.

  1. straight-line vs road ("closest doesn't always mean quickest" -- Uber's own words)
  2. the hexagon beat: H3 resolution 8 (fixed in PREREG), plus the report-only 'does the 7-cell
     neighbourhood actually contain the nearest car' metric.

    .venv/bin/python projects/r018_dispatch/extras.py | tee projects/r018_dispatch/results/extras.txt
"""
import json
import pathlib

import h3
import numpy as np

import dispatch_sim as ds

HERE = pathlib.Path(__file__).resolve().parent
RES = 8                                   # PREREG §5, fixed before any result
POOLS = (150, 300, 600)                   # car pools = the fleet sizes the grid uses at R=360..1080 (prefixes)
V_KMH = 40.0                              # the headline speed


def edge_points_latlon(e_src, e_dst, lat, lon, edge, f):
    """lat/lon of a point a fraction f along each directed edge (straight chord between its two junctions)."""
    la = lat[e_src[edge]] + f * (lat[e_dst[edge]] - lat[e_src[edge]])
    lo = lon[e_src[edge]] + f * (lon[e_dst[edge]] - lon[e_src[edge]])
    return la, lo


def metres(lat1, lon1, lat2, lon2):
    """equirectangular straight-line metres, all-pairs: (len(1), len(2)) -- accurate to <0.1% at this latitude."""
    k = 111_320.0
    dy = (lat1[:, None] - lat2[None, :]) * k
    dx = (lon1[:, None] - lon2[None, :]) * k * np.cos(np.radians(40.74))
    return np.hypot(dx, dy)


def main():
    A, e_src, e_dst, e_len, lat, lon, n = ds.load_graph()
    AT = A.T.tocsr()
    R = 360
    out = {'straight_vs_road': {}, 'hex': {}}

    # ── 1. straight-line vs road ──────────────────────────────────────────────
    stats = {m: dict(diff=[], extra_all=[], extra_when_diff=[], gap_ratio=[]) for m in POOLS}
    for s in ds.SEEDS:
        rng = np.random.default_rng(s)
        r_edge, r_f = ds.sample_points(rng, e_len, ds.R_MAX)
        c_edge, c_f = ds.sample_points(rng, e_len, ds.C_MAX)
        Dm = ds.road_matrix(AT, e_src, e_dst, e_len, r_edge, r_f, c_edge, c_f)
        rla, rlo = edge_points_latlon(e_src, e_dst, lat, lon, r_edge[:R], r_f[:R])
        cla, clo = edge_points_latlon(e_src, e_dst, lat, lon, c_edge, c_f)
        S = metres(rla, rlo, cla, clo)
        for m in POOLS:
            road, line = Dm[:R, :m], S[:, :m]
            by_road, by_line = road.argmin(1), line.argmin(1)
            differ = by_road != by_line
            extra_s = (road[np.arange(R), by_line] - road[np.arange(R), by_road]) / (V_KMH / 3.6)
            st = stats[m]
            st['diff'].append(differ.mean())
            st['extra_all'].append(extra_s.mean())
            st['extra_when_diff'].append(extra_s[differ].mean() if differ.any() else 0.0)
            st['gap_ratio'].append(np.median(road[np.arange(R), by_road] / np.maximum(line[np.arange(R), by_road], 1.0)))
    print('STRAIGHT LINE vs ROAD  (360 riders, static snapshot of every car in the pool, 40 km/h, 20 seeds)')
    print(f"{'cars':>5} | riders whose straight-line-nearest car is NOT their road-nearest | extra pickup if you trusted the straight line | median road/line distance")
    for m in POOLS:
        st = stats[m]
        d, e, w, g = (np.array(st[k]) for k in ('diff', 'extra_all', 'extra_when_diff', 'gap_ratio'))
        out['straight_vs_road'][m] = dict(share_differ=float(d.mean()), share_se=float(d.std(ddof=1) / np.sqrt(len(d))),
                                          extra_s_all=float(e.mean()), extra_s_when_differ=float(w.mean()),
                                          median_road_over_line=float(g.mean()))
        print(f"{m:>5} | {100 * d.mean():6.1f}% ±{100 * d.std(ddof=1) / np.sqrt(len(d)):.1f}   | all riders {e.mean():5.1f}s;  among those {w.mean():6.1f}s | {g.mean():.2f}x")

    # ── 2. the hexagon beat ───────────────────────────────────────────────────
    node_cells = {h3.latlng_to_cell(float(a), float(b), RES) for a, b in zip(lat, lon)}
    edge_km = h3.average_hexagon_edge_length(RES, unit='km')
    area_km2 = h3.average_hexagon_area(RES, unit='km^2')
    out['hex'] = dict(res=RES, cells_touching_roads=len(node_cells), avg_edge_km=edge_km, avg_area_km2=area_km2)
    print(f'\nH3 resolution {RES}: {len(node_cells)} cells touch the road network of this region; average edge {edge_km:.3f} km, area {area_km2:.3f} km^2')

    FLEET = 300
    in_hood, share_of_fleet, holds_nearest = [], [], []
    for s in ds.SEEDS:
        rng = np.random.default_rng(s)
        r_edge, r_f = ds.sample_points(rng, e_len, ds.R_MAX)
        c_edge, c_f = ds.sample_points(rng, e_len, ds.C_MAX)
        Dm = ds.road_matrix(AT, e_src, e_dst, e_len, r_edge, r_f, c_edge, c_f)[:R, :FLEET]
        rla, rlo = edge_points_latlon(e_src, e_dst, lat, lon, r_edge[:R], r_f[:R])
        cla, clo = edge_points_latlon(e_src, e_dst, lat, lon, c_edge[:FLEET], c_f[:FLEET])
        ccell = np.array([h3.latlng_to_cell(float(a), float(b), RES) for a, b in zip(cla, clo)])
        nearest = Dm.argmin(1)
        for i in range(R):
            hood = set(h3.grid_disk(h3.latlng_to_cell(float(rla[i]), float(rlo[i]), RES), 1))   # own cell + six neighbours
            inside = np.array([c in hood for c in ccell])
            in_hood.append(inside.sum())
            share_of_fleet.append(inside.mean())
            holds_nearest.append(bool(inside[nearest[i]]))
    ih, sf, hn = np.array(in_hood), np.array(share_of_fleet), np.array(holds_nearest)
    out['hex'].update(fleet=FLEET, cars_in_7_cells_mean=float(ih.mean()), cars_in_7_cells_p10=float(np.percentile(ih, 10)),
                      cars_in_7_cells_p90=float(np.percentile(ih, 90)), share_of_fleet_mean=float(sf.mean()),
                      hood_contains_true_nearest=float(hn.mean()))
    print(f'fleet of {FLEET}: a rider\'s own cell plus its six neighbours holds {ih.mean():.1f} cars on average '
          f'(10th-90th percentile {np.percentile(ih, 10):.0f}-{np.percentile(ih, 90):.0f}) = {100 * sf.mean():.1f}% of the fleet')
    print(f'REPORT-ONLY: that 7-cell neighbourhood contains the rider\'s true road-nearest car in {100 * hn.mean():.1f}% of cases')
    json.dump(out, open(HERE / 'results' / 'extras.json', 'w'), indent=2)


if __name__ == '__main__':
    main()
