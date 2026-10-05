#!/usr/bin/env python3
"""I90 -- the batching race. Implements PREREG.md EXACTLY; every free parameter lives there.

Question: does matching waiting riders to cars every few seconds shorten the total wait,
compared with matching at once? And does our checker agree with the outside paper
(Bao et al., Transportation Research Part C 187 (2026) 105644, Table 1)?

    .venv/bin/python projects/r018_dispatch/dispatch_sim.py --selftest     # invariants, brute force
    .venv/bin/python projects/r018_dispatch/dispatch_sim.py                # the whole grid -> results/

Model in one paragraph. Riders request over 600 s at random points along the roads; cars become
available at random junctions (half at t=0, the rest uniform over the 600 s) and then stand still.
Travel time = road distance / a flat speed. A policy decides WHEN to run the same matching
(minimise the sum of pickup times, scipy linear_sum_assignment). FD runs it every 1 s (the outside
paper's definition of first dispatch); batching every 2/5/10/15/30/60 s. A rider unmatched after
300 s cancels and is CHARGED 300 s. Total wait = wait-to-be-matched + pickup.
"""
import argparse
import itertools
import json
import pathlib
import sys
import time

import numpy as np
import scipy.sparse as sp
from scipy.optimize import linear_sum_assignment
from scipy.sparse.csgraph import dijkstra

HERE = pathlib.Path(__file__).resolve().parent
CACHE, OUT = HERE / '_cache', HERE / 'results'

# ── PREREG.md §2 — fixed, never tuned ────────────────────────────────────────
EPISODE_S, PATIENCE_S = 600.0, 300.0
RIDERS = (120, 360, 1080)
RHOS = (0.75, 1.0, 1.5)
SPEEDS_KMH = (20, 30, 40)
INTERVALS = (1, 2, 5, 10, 15, 30, 60)          # 1 == FD
SEEDS = tuple(range(20))
HEADLINE = dict(R=360, rho=1.0, v=40, delta=5)  # chosen by POSITION, not by result (§3)
R_MAX, C_MAX = max(RIDERS), int(round(max(RHOS) * max(RIDERS)))
T_975_19 = 2.093                                 # t quantile, 19 d.o.f., for the paired 95% interval


def load_graph():
    z = np.load(CACHE / 'nyc_drive.npz')
    n = len(z['node_ids'])
    A = sp.csr_matrix((z['length_m'], (z['src'], z['dst'])), shape=(n, n))
    return A, z['src'], z['dst'], z['length_m'], z['lat'], z['lon'], n


def sample_points(rng, e_len, k):
    """k positions chosen uniformly ALONG THE ROAD LENGTH: a random directed edge (weighted by its
    length) and a fraction along it. Junction-only placement would put ~1 in 4 riders on the same
    junction as a car on a 5,000-junction graph -> 0 s pickups (PREREG amendment, 2026-10-05)."""
    edge = rng.choice(len(e_len), size=k, p=e_len / e_len.sum())
    return edge, rng.uniform(0.0, 1.0, k)


def road_matrix(AT, e_src, e_dst, e_len, r_edge, r_f, c_edge, c_f):
    """metres from each car to each rider along the road network.
    A car on edge (u_c -> v_c) first drives the rest of its own edge to v_c; a rider on edge
    (u_r -> v_r) is reached by arriving at u_r and driving r_f of that edge. If they share an edge
    and the car is behind the rider, it just drives the gap. Dijkstra from u_r on the TRANSPOSED
    graph == the v_c -> u_r distance on the real one."""
    D = dijkstra(AT, directed=True, indices=e_src[r_edge], return_predecessors=False)[:, e_dst[c_edge]]
    D = D + ((1.0 - c_f) * e_len[c_edge])[None, :] + (r_f * e_len[r_edge])[:, None]
    same = (r_edge[:, None] == c_edge[None, :]) & (c_f[None, :] <= r_f[:, None])
    gap = (r_f[:, None] - c_f[None, :]) * e_len[r_edge][:, None]
    D[same] = gap[same]
    return D


# ── the matching clock ────────────────────────────────────────────────────────
def run_batch(eta, arr, avail, delta):
    """Match every `delta` seconds. eta[r,c] seconds, arr[r] sorted arrival times, avail[c] times.
    Returns per-rider arrays and the 'not the closest car' diagnostic. Asserts its own invariants."""
    R, C = eta.shape
    match_t = np.full(R, np.nan)
    car_of = np.full(R, -1, dtype=int)
    nearest_of = np.full(R, -1, dtype=int)             # the road-nearest FREE car at the moment this rider was matched
    cancelled = np.zeros(R, bool)
    free = np.ones(C, bool)
    waiting, nxt, unresolved = [], 0, R
    nc_total, nc_not, nc_extra = 0, 0, []
    t = float(delta)
    while unresolved > 0:
        while nxt < R and arr[nxt] <= t:
            waiting.append(nxt)
            nxt += 1
        keep = []
        for r in waiting:                                   # cancel FIRST, then match (PREREG §2 mechanics)
            if t - arr[r] >= PATIENCE_S:
                cancelled[r] = True
                unresolved -= 1
            else:
                keep.append(r)
        waiting = keep
        cars = np.flatnonzero(free & (avail <= t))
        if waiting and cars.size:
            sub = eta[np.ix_(waiting, cars)]
            rows, cols = linear_sum_assignment(sub)
            nearest = sub.argmin(axis=1)
            for i, j in zip(rows, cols):
                r, c = waiting[i], cars[j]
                nc_total += 1
                if j != nearest[i]:                          # a different car from the closest available one
                    nc_not += 1
                    nc_extra.append(sub[i, j] - sub[i, nearest[i]])
                match_t[r], car_of[r] = t, c
                nearest_of[r] = cars[nearest[i]]
                free[c] = False
                unresolved -= 1
            matched = {waiting[i] for i in rows}
            waiting = [r for r in waiting if r not in matched]
        t += delta
    return _finish(eta, arr, avail, match_t, car_of, cancelled, nc_total, nc_not, nc_extra, nearest_of)


def run_greedy(eta, arr, avail):
    """REPORT-ONLY variant G (PREREG §2): nearest available car at once; if none, the next car to
    appear goes to the OLDEST waiting rider. Never enters a verdict."""
    R, C = eta.shape
    match_t = np.full(R, np.nan)
    car_of = np.full(R, -1, dtype=int)
    cancelled = np.zeros(R, bool)
    free = np.ones(C, bool)
    events = [(a, 1, r) for r, a in enumerate(arr)] + [(a, 0, c) for c, a in enumerate(avail) if a > 0]
    events.sort()                                           # at equal times a car appearing precedes a request
    queue = []
    nc_total = nc_not = 0
    nc_extra = []
    for t, kind, idx in events:
        if kind == 1:                                       # a rider asks
            cars = np.flatnonzero(free & (avail <= t))
            if cars.size:
                c = cars[eta[idx, cars].argmin()]
                match_t[idx], car_of[idx], free[c] = t, c, False
                nc_total += 1
            else:
                queue.append(idx)
        else:                                               # a car appears
            while queue:
                r = queue.pop(0)
                if t - arr[r] >= PATIENCE_S:
                    cancelled[r] = True
                    continue
                match_t[r], car_of[r], free[idx] = t, idx, False
                nc_total += 1
                break
    for r in queue:
        cancelled[r] = True
    return _finish(eta, arr, avail, match_t, car_of, cancelled, nc_total, nc_not, nc_extra)


def _finish(eta, arr, avail, match_t, car_of, cancelled, nc_total, nc_not, nc_extra, nearest_of=None):
    R = len(arr)
    matched = ~np.isnan(match_t)
    assert (matched ^ cancelled).all(), 'every rider must end matched XOR cancelled'
    assert len(set(car_of[matched])) == matched.sum(), 'a car was given to two riders'
    assert (match_t[matched] >= arr[matched] - 1e-9).all(), 'matched before requesting'
    assert (avail[car_of[matched]] <= match_t[matched] + 1e-9).all(), 'matched with a car not yet available'
    delay = np.where(matched, match_t - arr, 0.0)
    pickup = np.where(matched, eta[np.arange(R), np.where(matched, car_of, 0)], 0.0)
    total = np.where(matched, delay + pickup, PATIENCE_S)   # cancellations are CHARGED, never dropped
    assert (total[matched] == (delay + pickup)[matched]).all()
    return dict(total=total, matched=matched, delay=delay, pickup=pickup, car=car_of,
                nc_total=nc_total, nc_not=nc_not, nc_extra=np.array(nc_extra, float),
                match_t=match_t, nearest=(nearest_of if nearest_of is not None else car_of.copy()))


def summarise(run, delta):
    m = run['matched']
    nm = max(1, int(m.sum()))
    mean_delay = run['delay'][m].sum() / nm
    return dict(
        total_all=float(run['total'].mean()),                       # cancellations charged 300 s
        total_matched=float(run['total'][m].mean()) if m.any() else float('nan'),
        pickup=float(run['pickup'][m].mean()) if m.any() else float('nan'),
        delay=float(mean_delay),
        cancel=float(1 - m.mean()),
        not_closest=float(run['nc_not'] / run['nc_total']) if run['nc_total'] else float('nan'),
        extra_pickup=float(run['nc_extra'].mean()) if len(run['nc_extra']) else 0.0,
        pressure=float(mean_delay / (delta / 2.0)) if delta else float('nan'),
    )


def winners_losers(base, run):
    """Per rider (same ids, same riders in every policy): who waits less / more under `run` than `base`."""
    d = run['total'] - base['total']
    better, worse = d < -1e-9, d > 1e-9
    return dict(better=float(better.mean()), worse=float(worse.mean()),
                gain=float(-d[better].mean()) if better.any() else 0.0,
                loss=float(d[worse].mean()) if worse.any() else 0.0)


# ── self-consistency (NECESSARY, NOT SUFFICIENT — PREREG §4) ─────────────────
def selftest():
    rng = np.random.default_rng(0)
    # 1. the assignment is optimal: equals brute force on tiny cases and never loses to greedy
    for _ in range(300):
        r, c = int(rng.integers(1, 5)), int(rng.integers(1, 6))
        M = rng.uniform(0, 100, (r, c))
        rows, cols = linear_sum_assignment(M)
        best = min(sum(M[i, p[i]] for i in range(min(r, c))) if r <= c else
                   sum(M[p[j], j] for j in range(c))
                   for p in (itertools.permutations(range(c), r) if r <= c else itertools.permutations(range(r), c)))
        assert abs(M[rows, cols].sum() - best) < 1e-9
        g, used = 0.0, set()
        for i in range(r):
            cand = [j for j in range(c) if j not in used]
            if cand:
                j = min(cand, key=lambda k: M[i, k])
                used.add(j)
                g += M[i, j]
        if r <= c:                                           # greedy places every rider -> comparable
            assert M[rows, cols].sum() <= g + 1e-9
    # 2. FD with riders arriving one at a time hands each the true nearest available car
    R, C = 40, 80
    eta = rng.uniform(30, 600, (R, C))
    arr = np.sort(rng.uniform(0, 600, R))
    run = run_batch(eta, arr, np.zeros(C), 1)
    # arrivals are ~15 s apart and FD ticks every 1 s, so a tick almost never holds two riders
    assert run['nc_not'] <= 2, f"FD should be ~always the nearest car, got {run['nc_not']} of {run['nc_total']}"
    # 3. with ample cars and a long interval the delay is charged: total >= delay + pickup, delay <= interval
    run60 = run_batch(eta, arr, np.zeros(C), 60)
    assert (run60['delay'][run60['matched']] <= 60 + 1e-9).all()
    # 4. G and FD agree when riders are far apart in time and cars are plentiful
    g = run_greedy(eta, arr, np.zeros(C))
    assert abs(g['total'].mean() - run['total'].mean()) < 5.0, (g['total'].mean(), run['total'].mean())
    print('selftest OK: optimal-vs-brute-force (300 cases), optimal<=greedy, FD~nearest, delay charged, G~FD')


# ── the grid ──────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--selftest', action='store_true')
    ap.add_argument('--seeds', type=int, default=len(SEEDS))
    a = ap.parse_args()
    if a.selftest:
        return selftest()

    OUT.mkdir(exist_ok=True)
    A, e_src, e_dst, e_len, lat, lon, n = load_graph()
    AT = A.T.tocsr()
    seeds = SEEDS[:a.seeds]
    metrics = {}                                            # key -> list over seeds of summarise()+winners
    showcase = {}
    t0 = time.time()
    for s in seeds:
        rng = np.random.default_rng(s)
        r_edge, r_f = sample_points(rng, e_len, R_MAX)      # nested prefixes: smaller cells reuse the same people
        c_edge, c_f = sample_points(rng, e_len, C_MAX)
        Dm = road_matrix(AT, e_src, e_dst, e_len, r_edge, r_f, c_edge, c_f)   # metres, R_MAX x C_MAX
        for R in RIDERS:
            for rho in RHOS:
                C = int(round(rho * R))
                rc = np.random.default_rng([s, R, int(rho * 100)])
                arr = np.sort(rc.uniform(0, EPISODE_S, R))
                avail = np.zeros(C)
                avail[C // 2:] = rc.uniform(0, EPISODE_S, C - C // 2)
                for v in SPEEDS_KMH:
                    eta = Dm[:R, :C] / (v / 3.6)
                    runs = {d: run_batch(eta, arr, avail, d) for d in INTERVALS}
                    runs['G'] = run_greedy(eta, arr, avail)
                    for pol, run in runs.items():
                        row = summarise(run, pol if pol != 'G' else 0)
                        if pol not in (1, 'G'):
                            row.update({'wl_' + k: x for k, x in winners_losers(runs[1], run).items()})
                        metrics.setdefault(f'{R}|{rho}|{v}|{pol}', []).append(row)
                    if (R, rho, v) == (HEADLINE['R'], HEADLINE['rho'], HEADLINE['v']):
                        showcase[s] = dict(gain=float(runs[1]['total'].mean() - runs[HEADLINE['delta']]['total'].mean()),
                                           rider_edge=r_edge[:R].tolist(), rider_f=r_f[:R].tolist(),
                                           car_edge=c_edge[:C].tolist(), car_f=c_f[:C].tolist(),
                                           arr=arr.tolist(), avail=avail.tolist(),
                                           fd_car=runs[1]['car'].tolist(), b5_car=runs[HEADLINE['delta']]['car'].tolist())
        print(f'seed {s:2d} done  ({time.time() - t0:5.0f}s)', flush=True)

    json.dump(metrics, open(OUT / 'grid_metrics.json', 'w'))
    med = sorted(showcase, key=lambda k: showcase[k]['gain'])[len(showcase) // 2]   # the MEDIAN seed (PREREG §3)
    json.dump(dict(seed=med, **showcase[med]), open(OUT / 'showcase_headline.json', 'w'))
    print('wrote results/grid_metrics.json and results/showcase_headline.json; median-gain seed =', med)


if __name__ == '__main__':
    sys.exit(main())
