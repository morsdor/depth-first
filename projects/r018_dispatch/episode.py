#!/usr/bin/env python3
"""r018 / I90 -- replay the MEDIAN episode (seed 18, chosen by the rule in PREREG.md §3) and dump everything the reel draws.

Positions, routes and event logs all come from the same run the 20-seed grid used. Each drawn route is
reconstructed edge by edge on the real street geometry and ASSERTED to be as long as the distance the simulation
charged -- so the line on screen and the seconds on screen are the same measurement.

    cd projects/r018_dispatch && ../../.venv/bin/python episode.py
"""
import json
import pathlib
import pickle

import h3
import numpy as np
from scipy.sparse.csgraph import dijkstra

import dispatch_sim as ds
from extras import edge_points_latlon, metres
from world_build import KM, LAT0, LON0, COSLAT

HERE = pathlib.Path(__file__).resolve().parent
SEED, R, RHO, V = 18, 360, 1.0, 40.0
DELTAS = (1, 2, 5, 10, 15, 30, 60)


def main():
    A, e_src, e_dst, e_len, lat, lon, n = ds.load_graph()
    AT = A.T.tocsr()
    W = pickle.load(open(ds.CACHE / 'edge_geom.pkl', 'rb'))
    geom, true_oneway, node_land = W['geom'], W['true_oneway'], W['land']
    eidx = {(int(s), int(d)): i for i, (s, d) in enumerate(zip(e_src, e_dst))}
    chord = np.hypot((lat[e_src] - lat[e_dst]) * KM, (lon[e_src] - lon[e_dst]) * KM * COSLAT)
    straight_edge = (e_len / np.maximum(chord * 1000, 1.0)) <= 1.05

    # ── the episode, regenerated EXACTLY as dispatch_sim.py built it ──────────────────────────────────
    rng = np.random.default_rng(SEED)
    r_edge, r_f = ds.sample_points(rng, e_len, ds.R_MAX)
    c_edge, c_f = ds.sample_points(rng, e_len, ds.C_MAX)
    Dm = ds.road_matrix(AT, e_src, e_dst, e_len, r_edge, r_f, c_edge, c_f)
    C = int(round(RHO * R))
    rc = np.random.default_rng([SEED, R, int(RHO * 100)])
    arr = np.sort(rc.uniform(0, ds.EPISODE_S, R))
    avail = np.zeros(C)
    avail[C // 2:] = rc.uniform(0, ds.EPISODE_S, C - C // 2)
    eta = Dm[:R, :C] / (V / 3.6)
    re_, rf_, ce_, cf_ = r_edge[:R], r_f[:R], c_edge[:C], c_f[:C]
    runs = {d: ds.run_batch(eta, arr, avail, d) for d in DELTAS}
    fd = runs[1]
    assert abs(fd['total'].mean() - 138.8) < 0.1 and abs(runs[5]['total'].mean() - 137.2) < 0.1, 'not the median episode'

    # ── points on the real geometry ───────────────────────────────────────────────────────────────────
    def along(edge, f0, f1):
        """the polyline of edge from fraction f0 to f1 (by arc length), in km."""
        pts = geom[edge][0]
        seg = np.hypot(*np.diff(pts, axis=0).T)
        cum = np.concatenate([[0], np.cumsum(seg)])
        tot = cum[-1]
        def at(f):
            d = f * tot
            i = min(np.searchsorted(cum, d, side='right') - 1, len(seg) - 1)
            t = 0 if seg[i] == 0 else (d - cum[i]) / seg[i]
            return pts[i] + t * (pts[i + 1] - pts[i])
        inner = [p for p, c in zip(pts, cum) if f0 * tot < c < f1 * tot]
        return [at(f0)] + inner + [at(f1)]

    pt = lambda e, f: along(e, f, f)[0]
    rider_xy = np.array([pt(re_[i], rf_[i]) for i in range(R)])
    car_xy = np.array([pt(ce_[j], cf_[j]) for j in range(C)])

    def route(c, r):
        """car c -> rider r on the real streets. Returns (polyline km, length m); asserts it equals the sim's distance."""
        ce, fc, re, fr = int(ce_[c]), float(cf_[c]), int(re_[r]), float(rf_[r])
        if ce == re and fc <= fr:
            poly, L = along(ce, fc, fr), (fr - fc) * e_len[ce]
        else:
            s, t = int(e_dst[ce]), int(e_src[re])
            dist, pred = dijkstra(A, directed=True, indices=s, return_predecessors=True)
            nodes, k = [t], t
            while k != s:
                k = int(pred[k]); nodes.append(k)
            nodes.reverse()
            poly = along(ce, fc, 1.0)
            L = (1 - fc) * e_len[ce]
            used = []
            for a, b in zip(nodes, nodes[1:]):
                ei = eidx[(a, b)]
                poly += list(geom[ei][0][1:])
                L += e_len[ei]
                used.append(ei)
            poly += along(re, 0.0, fr)[1:]
            L += fr * e_len[re]
        assert abs(L - Dm[r, c]) < 0.5, f'route length {L:.1f} m != sim distance {Dm[r, c]:.1f} m'
        return np.array(poly), float(L)

    rla, rlo = edge_points_latlon(e_src, e_dst, lat, lon, re_, rf_)
    cla, clo = edge_points_latlon(e_src, e_dst, lat, lon, ce_, cf_)
    S = metres(rla, rlo, cla, clo)

    # ── the on-screen instances, by the rules written before they were looked up ──────────────────────
    inst = json.load(open(HERE / 'results' / 'instances.json'))
    def free_at(r):
        taken = {int(fd['car'][q]) for q in range(r) if fd['car'][q] >= 0}
        return np.array([c for c in np.flatnonzero(avail <= arr[r]) if c not in taken])

    out_inst = {}
    for name in ('hook', 'river'):
        r = inst[name]['rider']
        free = free_at(r)
        looks, quick = int(free[S[r, free].argmin()]), int(free[eta[r, free].argmin()])
        assert looks == inst[name]['looks_closest_car'] and quick == inst[name]['quickest_car'], f'{name} instance changed'
        pl, Ll = route(looks, r)
        pq, Lq = route(quick, r)
        d = dict(rider=r, t=float(arr[r]), pool=int(len(free)), looks=looks, quick=quick,
                 lineM=dict(looks=float(S[r, looks]), quick=float(S[r, quick])),
                 etaS=dict(looks=float(eta[r, looks]), quick=float(eta[r, quick])),
                 routeLooks=pl.round(4).tolist(), routeQuick=pq.round(4).tolist(),
                 freeCars=[int(c) for c in free])
        # a one-way segment on the looks-car's route (the first whose reverse does not exist): where the arrow goes
        ow = None
        if name == 'hook':
            s_, t_ = int(e_dst[ce_[looks]]), int(e_src[re_[r]])
            _, pred = dijkstra(A, directed=True, indices=s_, return_predecessors=True)
            nodes, k = [t_], t_
            while k != s_:
                k = int(pred[k]); nodes.append(k)
            nodes.reverse()
            for a, b in zip(nodes, nodes[1:]):
                ei = eidx[(a, b)]
                if true_oneway[ei] and e_len[ei] > 60:
                    pts = geom[ei][0]; mid = len(pts) // 2
                    p0, p1 = pts[max(0, mid - 1)], pts[min(len(pts) - 1, mid)]
                    ow = dict(x=float(((p0 + p1) / 2)[0]), y=float(((p0 + p1) / 2)[1]), heading=float(np.degrees(np.arctan2(p1[1] - p0[1], p1[0] - p0[0]))))
                    break
        d['oneWay'] = ow
        out_inst[name] = d
    r = inst['long_wait']['rider']
    pl, Ll = route(int(fd['car'][r]), r)
    out_inst['longWait'] = dict(rider=r, t=float(arr[r]), pickupS=float(fd['pickup'][r]), car=int(fd['car'][r]), route=pl.round(4).tolist())
    r = inst['hook']['rider']
    b5car = int(runs[5]['car'][r])
    pb, _ = route(b5car, r)
    out_inst['hookBatched'] = dict(rider=r, car=b5car, matchT=float(runs[5]['match_t'][r]), pickupS=float(runs[5]['pickup'][r]),
                                   route=pb.round(4).tolist())

    # ── the H3 beat for the hook rider ────────────────────────────────────────────────────────────────
    hr = out_inst['hook']['rider']
    lat_r = LAT0 + rider_xy[hr, 1] / KM
    lon_r = LON0 + rider_xy[hr, 0] / (KM * COSLAT)
    home = h3.latlng_to_cell(float(lat_r), float(lon_r), 8)
    hood = sorted(h3.grid_disk(home, 1))
    cell_of = lambda xy: h3.latlng_to_cell(float(LAT0 + xy[1] / KM), float(LON0 + xy[0] / (KM * COSLAT)), 8)
    free = np.array(out_inst['hook']['freeCars'])
    in_hood = [int(c) for c in free if cell_of(car_xy[c]) in set(hood)]
    h3d = dict(home=home, hood=hood, carsInHood=in_hood, poolSize=int(len(free)),
               quickInHood=bool(out_inst['hook']['quick'] in in_hood), looksInHood=bool(out_inst['hook']['looks'] in in_hood))

    # ── the surge-style layer: requests per free car in each cell (+1 each, so an empty cell has a ratio) ──
    req, car = {}, {}
    for i in range(R):
        c = cell_of(rider_xy[i]); req[c] = req.get(c, 0) + 1
    for j in range(C):
        c = cell_of(car_xy[j]); car[c] = car.get(c, 0) + 1
    pressure = {c: round((req.get(c, 0) + 1) / (car.get(c, 0) + 1), 3) for c in set(req) | set(car)}
    hot = max((c for c in pressure if req.get(c, 0) >= 3), key=lambda c: pressure[c])

    # ── event logs and the running average wait, per policy ───────────────────────────────────────────
    def log(run):
        return dict(matchT=[None if np.isnan(x) else round(float(x), 2) for x in run['match_t']],
                    car=[int(x) for x in run['car']], pickupS=[round(float(x), 1) for x in run['pickup']],
                    total=[round(float(x), 2) for x in run['total']], nearest=[int(x) for x in run['nearest']],
                    cancelled=[bool(not m) for m in run['matched']])
    def running_mean(run, horizon=700, step=2):
        # a rider's wait is KNOWN at the moment they are matched (delay + pickup), or at the cancel (charged 300 s)
        known_at = np.where(run['matched'], np.nan_to_num(run['match_t']), arr + ds.PATIENCE_S)
        out = []
        for t in range(0, horizon + 1, step):
            m = known_at <= t
            out.append(round(float(run['total'][m].mean()), 2) if m.any() else None)
        return out
    series = {str(d): running_mean(runs[d]) for d in (1, 5, 60)}
    finals = {str(d): round(float(runs[d]['total'].mean()), 2) for d in DELTAS}
    not_closest5 = [int(i) for i in range(R) if runs[5]['matched'][i] and runs[5]['car'][i] != runs[5]['nearest'][i]]

    out = dict(
        seed=SEED, riders=R, cars=C, speedKmh=V,
        riderXY=rider_xy.round(4).tolist(), carXY=car_xy.round(4).tolist(),
        arrive=[round(float(x), 2) for x in arr], avail=[round(float(x), 2) for x in avail],
        runs={str(d): log(runs[d]) for d in (1, 5, 60)}, finals=finals, series=dict(step=2, values=series),
        notClosest5=not_closest5, instances=out_inst, h3=h3d,
        surge=dict(pressure={c: pressure[c] for c in pressure}, requests=req, cars=car, hot=hot, hotRequests=req.get(hot, 0), hotCars=car.get(hot, 0)))
    (HERE / 'results' / 'episode.json').write_text(json.dumps(out, separators=(',', ':')))
    print('seed', SEED, '| totals', finals)
    print('hook  rider', out_inst['hook']['rider'], '| looks car', out_inst['hook']['looks'], round(out_inst['hook']['etaS']['looks'], 1), 's  vs quick car',
          out_inst['hook']['quick'], round(out_inst['hook']['etaS']['quick'], 1), 's | one-way arrow:', out_inst['hook']['oneWay'] is not None)
    print('river rider', out_inst['river']['rider'], '|', round(out_inst['river']['etaS']['looks']), 's vs', round(out_inst['river']['etaS']['quick']), 's')
    print('H3: rider cell', home, '| cars in the 7 cells', len(in_hood), 'of', len(free), 'free | nearest-by-road car inside?', h3d['quickInHood'], '| map-preferred inside?', h3d['looksInHood'])
    print('not given the closest car at 5 s:', len(not_closest5), 'of', R, f'({100 * len(not_closest5) / R:.1f}%) in this episode (20-run mean 7.8%)')
    print('hot cell', hot, 'requests', req.get(hot, 0), 'cars', car.get(hot, 0), 'pressure', pressure[hot])
    print('episode.json', round((HERE / 'results' / 'episode.json').stat().st_size / 1e6, 2), 'MB')


if __name__ == '__main__':
    main()
