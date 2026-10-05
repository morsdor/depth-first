#!/usr/bin/env python3
"""r018 / I90 -- build the WORLD the reel draws: real street geometry, the H3 cells, and the landmass names.

Everything is in a local frame in KILOMETRES: x = east, y = north, origin = the centre of the box (40.740 N, -73.975 E).
Streets use their true OpenStreetMap geometry (the curved FDR, the ramps, the bridge approaches), simplified to 2 m --
the sim measured distance on those same lengths, so the picture and the numbers describe one network.

    cd projects/r018_dispatch && ../../.venv/bin/python world_build.py
"""
import json
import pathlib
import pickle

import h3
import numpy as np
import osmnx as ox
import shapely
from shapely.geometry import LineString, Point, box
from shapely.ops import polygonize, unary_union

import dispatch_sim as ds
from robustness import BBOX, landmass_labels

HERE = pathlib.Path(__file__).resolve().parent
CACHE = HERE / '_cache'
LAT0, LON0, KM = 40.740, -73.975, 111.32
COSLAT = np.cos(np.radians(LAT0))


def to_xy(lat, lon):
    return (np.asarray(lon) - LON0) * KM * COSLAT, (np.asarray(lat) - LAT0) * KM


def main():
    z = np.load(CACHE / 'nyc_drive.npz')
    ids, lat, lon = z['node_ids'], z['lat'], z['lon']
    src, dst, length_m = z['src'], z['dst'], z['length_m']
    index = {int(n): i for i, n in enumerate(ids)}
    nx_, ny_ = to_xy(lat, lon)

    ox.settings.use_cache = True
    ox.settings.cache_folder = str(CACHE / 'osmnx_http')
    G = ox.graph_from_bbox(BBOX, network_type='drive', simplify=True)
    G = ox.truncate.largest_component(G, strongly=True)

    # one polyline per DIRECTED edge, oriented u -> v; parallel edges keep the SHORTEST, exactly as fetch_graph.py did
    best = {}
    for u, v, d in G.edges(data=True):
        key = (index[int(u)], index[int(v)])
        L = float(d['length'])
        if key in best and best[key][0] <= L:
            continue
        if 'geometry' in d:
            gx, gy = d['geometry'].xy
            px, py = to_xy(np.array(gy), np.array(gx))
        else:
            px, py = np.array([nx_[key[0]], nx_[key[1]]]), np.array([ny_[key[0]], ny_[key[1]]])
        oneway = d.get('oneway') in (True, 'yes', 'True', '-1')
        best[key] = (L, np.column_stack([px, py]), bool(oneway), str(d.get('highway')), d.get('name'))
    geom = []
    for i in range(len(src)):
        L, pts, ow, hw, name = best[(int(src[i]), int(dst[i]))]
        assert abs(L - length_m[i]) < 1e-6, 'edge arrays and geometry are out of step'
        geom.append((pts, ow, hw, name))
    # an edge is genuinely one-way only if its reverse does not exist
    has = {(int(s), int(d)) for s, d in zip(src, dst)}
    true_oneway = [((int(dst[i]), int(src[i])) not in has) for i in range(len(src))]

    # ── roads for drawing: each undirected segment once, simplified to 2 m ───────────────────────────
    seen, polys = set(), []
    for i in range(len(src)):
        k = (min(int(src[i]), int(dst[i])), max(int(src[i]), int(dst[i])))
        if k in seen:
            continue
        seen.add(k)
        pts = geom[i][0]
        if len(pts) > 2:
            pts = np.array(shapely.simplify(LineString(pts), 0.002).coords)
        polys.append(pts)
    flat = np.concatenate([p.reshape(-1) for p in polys]).round(3)
    offs = np.cumsum([0] + [len(p) for p in polys])
    print(f'{len(polys)} road polylines, {len(flat) // 2} points')

    # ── landmasses, named by where they are ───────────────────────────────────────────────────────────
    land, _, _ = landmass_labels(ids)
    ts = np.hypot((lat - 40.7580) * KM, (lon + 73.9855) * KM * COSLAT).argmin()          # Times Square
    names = {int(land[ts]): 'MANHATTAN'}
    for lab in sorted(set(land.tolist()) - {-1, int(land[ts])}):
        m = land == lab
        names[lab] = 'BROOKLYN' if lat[m].mean() < 40.725 else 'QUEENS'
    labels = []
    for lab, name in names.items():
        m = land == lab
        labels.append(dict(name=name, junctions=int(m.sum()), x=float(nx_[m].mean().round(3)), y=float(ny_[m].mean().round(3))))
    print('landmasses:', [(l['name'], l['junctions'], round(l['x'], 2), round(l['y'], 2)) for l in labels])

    # ── H3, resolution 8 (fixed in PREREG.md) ─────────────────────────────────────────────────────────
    cells = sorted({h3.latlng_to_cell(float(a), float(b), 8) for a, b in zip(lat, lon)})
    cells = sorted(set(cells) | {n for c in cells for n in h3.grid_disk(c, 1)})          # plus the ring around the edge
    hexes = {}
    for c in cells:
        b = np.array(h3.cell_to_boundary(c))
        x, y = to_xy(b[:, 0], b[:, 1])
        hexes[c] = np.column_stack([x, y]).round(3).tolist()


    # ── the water: OSM coastline + the box edge -> faces; a face with road junctions in it is land, a big one without is water ──
    cl = ox.features_from_bbox(BBOX, {'natural': ['coastline']})
    lines = []
    for g in cl.geometry:
        lines += [g] if g.geom_type == 'LineString' else [g.exterior]
    W_, S_, E_, N_ = BBOX
    faces = list(polygonize(unary_union(lines + [box(W_, S_, E_, N_).exterior])))
    pts = [Point(float(a), float(b)) for a, b in zip(lon, lat)]
    tree = shapely.STRtree(pts)
    water = []
    for f in faces:
        has_roads = len(tree.query(f, predicate='contains')) > 0
        if not has_roads and f.area * (KM * COSLAT) * KM > 0.4:                 # > 0.4 km^2 and no streets in it: water
            rings = [np.array(f.exterior.coords)] + [np.array(h.coords) for h in f.interiors]
            out_rings = []
            for r in rings:
                x, y = to_xy(r[:, 1], r[:, 0])
                simp = LineString(np.column_stack([x, y])).simplify(0.003).coords
                out_rings.append(np.array(simp).round(3).tolist())
            water.append(out_rings)
    coast = []
    for ln in lines:
        c = np.array(ln.coords)
        x, y = to_xy(c[:, 1], c[:, 0])
        coast.append(np.array(LineString(np.column_stack([x, y])).simplify(0.004).coords).round(3).tolist())
    print(f'{len(faces)} faces -> {len(water)} water polygons, {len(coast)} coast lines')

    box_ = dict(w=(BBOX[2] - BBOX[0]) * KM * COSLAT, h=(BBOX[3] - BBOX[1]) * KM)
    out = dict(origin=dict(lat=LAT0, lon=LON0), kmPerDegLat=KM, box=box_, water=water, coast=coast,
               roads=dict(pts=flat.tolist(), offs=offs.tolist()), landmasses=labels, hexes=hexes)
    (HERE / 'results' / 'world.json').write_text(json.dumps(out, separators=(',', ':')))
    print('world.json', round((HERE / 'results' / 'world.json').stat().st_size / 1e6, 2), 'MB;', len(hexes), 'hex cells; box', round(box_['w'], 2), 'x', round(box_['h'], 2), 'km')

    # geometry for routing (episode.py); not shipped to the reel
    pickle.dump(dict(geom=geom, true_oneway=true_oneway, node_xy=np.column_stack([nx_, ny_]), land=land, ids=ids),
                open(CACHE / 'edge_geom.pkl', 'wb'))


if __name__ == '__main__':
    main()
