#!/usr/bin/env python3
"""Fetch the New York road network ONCE, pin it, and refuse a wrong or empty map.

Region is fixed in PREREG.md §2 and is not to be changed after any result is seen:
    lat 40.690-40.790, lon -74.020 to -73.930   (lower Manhattan to ~96th St, both rivers,
                                                  the near banks of Brooklyn / Williamsburg / LIC)

OpenStreetMap, ODbL -- attribute "(c) OpenStreetMap contributors" on screen and in the caption.
We publish a video, not a database; the cached graph stays out of git (gate0/*/_cache/).

    .venv/bin/python projects/r018_dispatch/fetch_graph.py
"""
import hashlib
import json
import pathlib
import sys
from datetime import date

import numpy as np
import osmnx as ox
import scipy.sparse as sp

HERE = pathlib.Path(__file__).resolve().parent
CACHE = HERE / '_cache'
CACHE.mkdir(exist_ok=True)

# PREREG.md §2 -- fixed. osmnx 2.x takes bbox = (left, bottom, right, top) = (west, south, east, north);
# the argument order changed between 1.x and 2.x and a swap fails SILENTLY, so it is asserted below.
SOUTH, NORTH, WEST, EAST = 40.690, 40.790, -74.020, -73.930
BBOX = (WEST, SOUTH, EAST, NORTH)

ox.settings.use_cache = True
ox.settings.cache_folder = str(CACHE / 'osmnx_http')
ox.settings.log_console = False


def main():
    print('fetching drive network ...', flush=True)
    G = ox.graph_from_bbox(BBOX, network_type='drive', simplify=True)
    n0, e0 = G.number_of_nodes(), G.number_of_edges()
    G = ox.truncate.largest_component(G, strongly=True)
    n, e = G.number_of_nodes(), G.number_of_edges()
    print(f'raw {n0} nodes / {e0} edges  ->  largest strongly connected component {n} / {e}')

    ids = np.array(list(G.nodes))
    index = {nid: i for i, nid in enumerate(ids)}
    lat = np.array([G.nodes[i]['y'] for i in ids])
    lon = np.array([G.nodes[i]['x'] for i in ids])

    # ── the bbox guard: a swapped argument order gives a wrong or empty map without an error ──
    assert n > 5000, f'near-empty graph ({n} nodes) -- wrong bbox order or a failed fetch'
    assert SOUTH - 0.002 <= lat.min() and lat.max() <= NORTH + 0.002, (lat.min(), lat.max())
    assert WEST - 0.002 <= lon.min() and lon.max() <= EAST + 0.002, (lon.min(), lon.max())
    # and it must really be Manhattan: a known point (Times Square) has a node within 200 m
    d = np.hypot((lat - 40.7580) * 111_000, (lon + 73.9855) * 84_000)
    assert d.min() < 200, f'no node within 200 m of Times Square (nearest {d.min():.0f} m)'

    # directed edge list; parallel edges collapse to the SHORTEST length
    best = {}
    for u, v, data in G.edges(data=True):
        key = (index[u], index[v])
        L = float(data['length'])
        if key not in best or L < best[key]:
            best[key] = L
    src = np.fromiter((k[0] for k in best), dtype=np.int32, count=len(best))
    dst = np.fromiter((k[1] for k in best), dtype=np.int32, count=len(best))
    length_m = np.fromiter(best.values(), dtype=np.float64, count=len(best))
    assert (length_m > 0).all()

    # which nodes sit on which side of the rivers is NOT stored -- the sim does not need it
    out = CACHE / 'nyc_drive.npz'
    np.savez_compressed(out, node_ids=ids, lat=lat, lon=lon, src=src, dst=dst, length_m=length_m)
    digest = hashlib.sha256(out.read_bytes()).hexdigest()

    meta = dict(
        fetched=str(date.today()), osmnx=ox.__version__, bbox_west_south_east_north=BBOX,
        nodes_raw=n0, edges_raw=e0, nodes=n, edges_unique_directed=len(best),
        total_road_km=round(float(length_m.sum()) / 1000, 1),
        lat_range=[round(float(lat.min()), 5), round(float(lat.max()), 5)],
        lon_range=[round(float(lon.min()), 5), round(float(lon.max()), 5)],
        npz_sha256=digest,
    )
    (CACHE / 'graph_meta.json').write_text(json.dumps(meta, indent=2))
    print(json.dumps(meta, indent=2))
    # sanity that scipy can build the CSR the sim will use
    A = sp.csr_matrix((length_m, (src, dst)), shape=(n, n))
    print('csr', A.shape, A.nnz, 'nnz')


if __name__ == '__main__':
    sys.exit(main())
