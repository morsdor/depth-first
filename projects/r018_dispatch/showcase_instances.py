#!/usr/bin/env python3
"""Do the instances the G4 script promises actually exist in the median-gain episode (seed 18)?

The script is a CONTRACT, so every on-screen example must come from the episode by a RULE written
before it is looked up -- never hand-picked. Rules (SCRIPT.md):

  hook      the FIRST rider, by arrival time, for whom -- among the cars still FREE at that moment under
            first dispatch -- the straight-line-nearest car is not the road-nearest, with the rider and both
            cars on near-straight edges (length/chord <= 1.05, so the chord geometry is honest)
  river     the FIRST rider whose straight-line-nearest free car is on a DIFFERENT landmass (a river between)
            AND is not the road-nearest -- a river crossing that does not cause a wrong car cannot illustrate one
  long wait the rider with the LONGEST first-dispatch pickup in the episode
  and the episode's own Delta=5 and Delta=60 results against its own FD (the animation must not contradict
  the 20-run claims it is illustrating)

    cd projects/r018_dispatch && ../../.venv/bin/python showcase_instances.py | tee results/instances.txt
"""
import json
import pathlib

import numpy as np

import dispatch_sim as ds
from extras import edge_points_latlon, metres
from robustness import landmass_labels

HERE = pathlib.Path(__file__).resolve().parent
SEED, R, RHO, V = 18, 360, 1.0, 40.0


def main():
    A, e_src, e_dst, e_len, lat, lon, n = ds.load_graph()
    AT = A.T.tocsr()
    z = np.load(ds.CACHE / 'nyc_drive.npz')
    node_land, _, _ = landmass_labels(z['node_ids'])
    chord = np.hypot((lat[e_src] - lat[e_dst]) * 111_320.0, (lon[e_src] - lon[e_dst]) * 111_320.0 * np.cos(np.radians(40.74)))
    straight_edge = (e_len / np.maximum(chord, 1.0)) <= 1.05

    # regenerate EXACTLY the episode dispatch_sim.py used for this seed and cell
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
    ed_r, ed_c, f_r, f_c = r_edge[:R], c_edge[:C], r_f[:R], c_f[:C]
    rla, rlo = edge_points_latlon(e_src, e_dst, lat, lon, ed_r, f_r)
    cla, clo = edge_points_latlon(e_src, e_dst, lat, lon, ed_c, f_c)
    S = metres(rla, rlo, cla, clo)

    # the episode's own results, against the 20-run claims it will illustrate
    runs = {d: ds.run_batch(eta, arr, avail, d) for d in (1, 5, 60)}
    tot = {d: runs[d]['total'].mean() for d in runs}
    print(f'SEED {SEED} (the median-gain seed): total wait  FD {tot[1]:.1f} s | every 5 s {tot[5]:.1f} s | every 60 s {tot[60]:.1f} s')
    print(f'  episode own gain at 5 s: {tot[1] - tot[5]:+.2f} s (the 20-run mean was +2.27 s)   '
          f'60 s vs FD: {tot[60] - tot[1]:+.2f} s (the 20-run mean was +5.4 s)')
    print(f'  animation consistent with the claims: 5 s below FD = {tot[5] < tot[1]}, 60 s above FD = {tot[60] > tot[1]}')

    fd = runs[1]
    ok_edge = lambda r, c: straight_edge[ed_r[r]] and straight_edge[ed_c[c]]
    hook = river = None
    for r in range(R):                                            # rows are already in arrival order
        # a car is FREE at arr[r] if it has appeared and was not matched to an EARLIER rider
        taken = {fd['car'][q] for q in range(r) if fd['car'][q] >= 0}
        free = np.array([c for c in np.flatnonzero(avail <= arr[r]) if c not in taken])
        if len(free) < 20:
            continue
        by_line, by_road = free[S[r, free].argmin()], free[eta[r, free].argmin()]
        if hook is None and by_line != by_road and ok_edge(r, by_line) and ok_edge(r, by_road):
            hook = dict(rider=r, t=arr[r], pool=len(free), looks_closest_car=int(by_line), quickest_car=int(by_road),
                        line_m_looks=S[r, by_line], line_m_quick=S[r, by_road],
                        eta_s_looks=eta[r, by_line], eta_s_quick=eta[r, by_road])
        if river is None and by_line != by_road and node_land[e_src[ed_r[r]]] >= 0 and node_land[e_src[ed_c[by_line]]] >= 0 \
                and node_land[e_src[ed_r[r]]] != node_land[e_src[ed_c[by_line]]]:
            river = dict(rider=r, t=arr[r], pool=len(free), looks_closest_car=int(by_line), quickest_car=int(by_road),
                         line_m_looks=S[r, by_line], eta_s_looks=eta[r, by_line], eta_s_quick=eta[r, by_road])
        if hook and river:
            break
    n_river_wrong = 0
    for r in range(R):
        taken = {fd['car'][q] for q in range(r) if fd['car'][q] >= 0}
        free = np.array([c for c in np.flatnonzero(avail <= arr[r]) if c not in taken])
        if len(free) < 20:
            continue
        bl, br = free[S[r, free].argmin()], free[eta[r, free].argmin()]
        if bl != br and node_land[e_src[ed_r[r]]] >= 0 and node_land[e_src[ed_c[bl]]] >= 0 \
                and node_land[e_src[ed_r[r]]] != node_land[e_src[ed_c[bl]]]:
            n_river_wrong += 1
    print(f'\nriders in this episode with a river between them and the map-preferred car AND a wrong car: {n_river_wrong} of {R}')
    long_r = int(np.argmax(np.where(fd['matched'], fd['pickup'], -1)))
    long_wait = dict(rider=long_r, t=arr[long_r], pickup_s=fd['pickup'][long_r], wait_s=fd['total'][long_r])

    def show(name, d):
        print(f'\n{name}:', 'NONE FOUND -- the beat cannot be built as scripted' if d is None else '')
        if d:
            for k, v in d.items():
                print(f'    {k:18} {v:.1f}' if isinstance(v, float) else f'    {k:18} {v}')
    show('HOOK instance (straight-line-nearest != road-nearest, near-straight edges)', hook)
    show('RIVER instance (the map-preferred car is across a river)', river)
    show('LONG-WAIT rider under first dispatch', long_wait)
    json.dump(dict(seed=SEED, totals={str(k): float(v) for k, v in tot.items()},
                   hook=hook, river=river, long_wait=long_wait),
              open(HERE / 'results' / 'instances.json', 'w'), indent=2, default=float)


if __name__ == '__main__':
    main()
