#!/usr/bin/env python3
"""Does the lead claim -- 'trusting the straight line picks the wrong car ~50% of the time, ~34 s lost' --
survive the three ways it could be an artefact?  (Added 2026-10-05 AFTER extras.py, on review; written
down in PREREG.md §6 as an addition made knowing the headline result.)

  A. MEDIAN vs MEAN      -- a few cross-river cases could drag the mean up
  B. CHORD ARTEFACT      -- extras.py puts a point on the straight chord between two junctions, but road
                            distance uses the true OSM length; on long curved edges the point lands wrong
  C. WHICH FACTOR        -- rivers, or one-way blocks?  (landmass labels from the graph itself, and a
                            two-way-streets variant)

    .venv/bin/python projects/r018_dispatch/robustness.py | tee projects/r018_dispatch/results/robustness.txt
"""
import json
import pathlib

import networkx as nx
import numpy as np
import osmnx as ox
import scipy.sparse as sp
from scipy.sparse.csgraph import dijkstra

import dispatch_sim as ds
from extras import edge_points_latlon, metres

HERE = pathlib.Path(__file__).resolve().parent
CACHE = HERE / '_cache'
R, POOL, V = 360, 300, 40.0
BBOX = (-74.020, 40.690, -73.930, 40.790)        # PREREG §2 -- (west, south, east, north), unchanged


def landmass_labels(ids):
    """Label every junction with its landmass: connected components after removing long bridges/tunnels.
    Two junctions on different labels have a river (or bay) between them -- derived from the graph itself."""
    ox.settings.use_cache = True
    ox.settings.cache_folder = str(CACHE / 'osmnx_http')              # cache hit: no new network traffic
    G = ox.graph_from_bbox(BBOX, network_type='drive', simplify=True)
    G = ox.truncate.largest_component(G, strongly=True)
    H = nx.Graph()
    H.add_nodes_from(G.nodes)
    n_cut = 0
    for u, v, d in G.edges(data=True):
        tagged = any(d.get(k) not in (None, 'no', False) for k in ('bridge', 'tunnel'))
        if tagged and float(d['length']) > 150:
            n_cut += 1
            continue
        H.add_edge(u, v)
    comps = sorted(nx.connected_components(H), key=len, reverse=True)
    label = {}
    for k, comp in enumerate(comps):
        for node in comp:
            label[node] = k if len(comp) >= 200 else -1                  # tiny fragments = "on a span / unclassified"
    sizes = [len(c) for c in comps[:6]]
    return np.array([label[i] for i in ids]), n_cut, sizes


def one_pass(A, AT, e_src, e_dst, e_len, lat, lon, node_land, sample_edges=None):
    """straight-vs-road for the 300-car pool over the 20 seeds. Returns per-rider arrays pooled over seeds."""
    chosen = np.arange(len(e_len)) if sample_edges is None else sample_edges
    p = e_len[chosen] / e_len[chosen].sum()
    out = dict(differ=[], extra=[], cross=[], same_land=[])
    for s in ds.SEEDS:
        rng = np.random.default_rng(s)
        # same draw order as the grid/extras; when restricted, map the draw onto the allowed edge set
        r_edge = chosen[rng.choice(len(chosen), size=ds.R_MAX, p=p)]
        r_f = rng.uniform(0, 1, ds.R_MAX)
        c_edge = chosen[rng.choice(len(chosen), size=ds.C_MAX, p=p)]
        c_f = rng.uniform(0, 1, ds.C_MAX)
        Dm = ds.road_matrix(AT, e_src, e_dst, e_len, r_edge, r_f, c_edge, c_f)[:R, :POOL]
        rla, rlo = edge_points_latlon(e_src, e_dst, lat, lon, r_edge[:R], r_f[:R])
        cla, clo = edge_points_latlon(e_src, e_dst, lat, lon, c_edge[:POOL], c_f[:POOL])
        S = metres(rla, rlo, cla, clo)
        by_road, by_line = Dm.argmin(1), S.argmin(1)
        ar = np.arange(R)
        out['differ'].append(by_road != by_line)
        out['extra'].append((Dm[ar, by_line] - Dm[ar, by_road]) / (V / 3.6))
        rl, cl = node_land[e_src[r_edge[:R]]], node_land[e_src[c_edge[:POOL][by_line]]]
        out['cross'].append((rl != cl) & (rl >= 0) & (cl >= 0))                  # a river is between rider and the car the map prefers
        out['same_land'].append((rl == cl) & (rl >= 0))
    return {k: np.concatenate(v) for k, v in out.items()}


def report(name, r):
    d, x, c, sl = r['differ'], r['extra'], r['cross'], r['same_land']
    print(f'\n--- {name}')
    print(f'  riders whose straight-line-nearest car is NOT their road-nearest : {100 * d.mean():5.1f}%   (n={len(d)})')
    print(f'  extra pickup, ALL riders        mean {x.mean():5.1f} s | median {np.median(x):4.1f} s')
    xd = x[d]
    print(f'  extra pickup, among the WRONG-car riders  mean {xd.mean():5.1f} s | median {np.median(xd):5.1f} s | p25 {np.percentile(xd, 25):4.1f} | p75 {np.percentile(xd, 75):5.1f} | p90 {np.percentile(xd, 90):5.1f}'
          f' | share > 60 s: {100 * (xd > 60).mean():4.1f}%')
    print(f'  among the wrong-car riders: a river between rider and the car the map prefers in {100 * c[d].mean():5.1f}% of cases')
    print(f'  wrong-car rate  when the map-preferred car is on the SAME landmass: {100 * d[sl].mean():5.1f}%   |   across a river: {100 * d[c].mean():5.1f}%  (cross share of all riders {100 * c.mean():4.1f}%)')
    if c[d].any() and (d & ~c).any():
        print(f'  mean extra when across a river: {x[d & c].mean():5.1f} s   |   same landmass: {x[d & ~c].mean():5.1f} s')
    return dict(share_differ=float(d.mean()), mean_all=float(x.mean()), median_wrong=float(np.median(xd)), mean_wrong=float(xd.mean()),
                p90_wrong=float(np.percentile(xd, 90)), share_cross_of_wrong=float(c[d].mean()),
                rate_same=float(d[sl].mean()), rate_cross=float(d[c].mean()))


def main():
    A, e_src, e_dst, e_len, lat, lon, n = ds.load_graph()
    AT = A.T.tocsr()
    z = np.load(CACHE / 'nyc_drive.npz')
    node_land, n_cut, sizes = landmass_labels(z['node_ids'])
    print(f'LANDMASSES: removed {n_cut} long bridge/tunnel segments (>150 m); largest components (junctions): {sizes}')
    print(f'  junction labels: ' + ', '.join(f'{k}: {(node_land == k).sum()}' for k in sorted(set(node_land.tolist()))))
    res = {}

    # ── B. chord artefact ────────────────────────────────────────────────────
    chord = np.hypot((lat[e_src] - lat[e_dst]) * 111_320.0, (lon[e_src] - lon[e_dst]) * 111_320.0 * np.cos(np.radians(40.74)))
    ratio = e_len / np.maximum(chord, 1.0)
    print(f'\nCHORD CHECK: share of directed edges with length/chord > 1.05: {100 * (ratio > 1.05).mean():.1f}%  '
          f'(by road length: {100 * e_len[ratio > 1.05].sum() / e_len.sum():.1f}%);  > 1.20: {100 * (ratio > 1.20).mean():.1f}%')
    near_straight = np.flatnonzero(ratio <= 1.05)

    full = one_pass(A, AT, e_src, e_dst, e_len, lat, lon, node_land)
    res['as_run'] = report('AS RUN (same sampling as extras.py: should reproduce 50.2% and 34.4 s)', full)

    res['near_straight_only'] = report('B. CHORD SENSITIVITY: points sampled ONLY on edges with length/chord <= 1.05', one_pass(A, AT, e_src, e_dst, e_len, lat, lon, node_land, near_straight))

    # ── C. which factor: the same question on TWO-WAY streets ────────────────
    A2 = A.maximum(A.T).tocsr()                               # every street two-way
    res['two_way_streets'] = report('C. ONE-WAY CONTRIBUTION: every street made two-way (rivers still there)', one_pass(A2, A2.T.tocsr(), e_src, e_dst, e_len, lat, lon, node_land))

    json.dump(res, open(HERE / 'results' / 'robustness.json', 'w'), indent=2)


if __name__ == '__main__':
    main()
