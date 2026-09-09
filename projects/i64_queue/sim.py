#!/usr/bin/env python3
"""I64 — one line or four? A real discrete-event queueing simulation.

No data source and no licence question: the queueing discipline IS the real
thing, the same way the shuffle was in r005.

THE POINT, and the thing a first version of this script got wrong: a shopper
choosing a line can see HOW MANY PEOPLE are in it, not how long each will take.
A basket of three and a full trolley look the same from behind. If you let the
simulated shopper pick the line that will FREE soonest, they have information no
human has, separate lines stop being worse, and the reel's claim evaporates.

So service times are a real mixture — mostly small baskets, a fifth big trolleys
— and the shopper is only allowed to count heads.

  shared   one snake feeding c tills, strict FIFO
  visible  c lines, join the one with the fewest PEOPLE (what a shopper can do)
  oracle   c lines, join the one that will free soonest (what nobody can do)
  random   c lines, join at random

Every figure this prints is dumped to stats.json and asserted in emit_ts.py
before it can reach the screen. The seed sweep at the bottom exists because the
single-run MAXIMUM wait is the most dramatic pair in the data (53 min against
24) and swings by a factor of two with the seed — it is barred from the reel.
"""
import heapq
import json
from collections import deque
from pathlib import Path

import numpy as np

C, RHO, N, WARM = 4, 0.85, 300_000, 20_000
SMALL, BIG, P_BIG = 0.5, 3.0, 0.20        # mean = .8*.5 + .2*3.0 = 1.0
SEEDS = (20260910, 11, 222, 3333, 44444)


def draw(rng, n):
    big = rng.random(n) < P_BIG
    return np.where(big, rng.exponential(BIG, n), rng.exponential(SMALL, n))


def run(mode, seed=SEEDS[0]):
    """Returns (waits after warm-up, customers served per hour)."""
    rng = np.random.default_rng(seed)
    arr = np.cumsum(rng.exponential(1.0 / (RHO * C), N))
    svc = draw(rng, N)
    pick = np.random.default_rng(seed + 1)

    lines = [deque() for _ in range(C)]        # customer ids waiting
    free = np.zeros(C)                          # when till j goes idle
    busy = [False] * C
    waits = np.full(N, np.nan)
    last = 0.0
    ev = [(arr[i], 0, i) for i in range(N)]     # (time, kind, payload)
    heapq.heapify(ev)

    def start(j, i, t):
        nonlocal last
        busy[j] = True
        waits[i] = t - arr[i]
        last = max(last, t + svc[i])
        heapq.heappush(ev, (t + svc[i], 1, j))

    while ev:
        t, kind, x = heapq.heappop(ev)
        if kind == 0:                            # an arrival
            i = x
            if mode == 'shared':
                idle = [j for j in range(C) if not busy[j]]
                if idle:
                    start(idle[0], i, t)
                else:
                    lines[0].append(i)
            else:
                if mode == 'visible':
                    n = [len(lines[j]) + busy[j] for j in range(C)]
                    m = min(n)
                    j = int(pick.choice([k for k in range(C) if n[k] == m]))
                elif mode == 'oracle':
                    j = int(np.argmin([free[j] if busy[j] else t
                                       for j in range(C)]))
                else:
                    j = int(pick.integers(C))
                if not busy[j]:
                    start(j, i, t)
                else:
                    lines[j].append(i)
                free[j] = max(free[j], t) + svc[i]
        else:                                    # a till goes idle
            j = x
            busy[j] = False
            q = lines[0] if mode == 'shared' else lines[j]
            if q:
                start(j, q.popleft(), t)

    w = waits[WARM:]
    return w[~np.isnan(w)], N / (last - arr[0]) * 60.0


MODES = (('shared',  'ONE shared line (a snake)'),
         ('visible', f'{C} lines, join the shortest'),
         ('oracle',  f'{C} lines, with x-ray vision'),
         ('random',  f'{C} lines, join at random'))

print(f'{C} tills, utilisation {RHO:.0%}, {N:,} customers.')
print('Identical arrivals and identical service times in every run — the only')
print('thing that changes is where people are told to stand.\n')
print(f'{"discipline":34s} {"mean wait":>10s} {"95th pct":>10s} {"served/hr":>10s}')
main, base = {}, None
for mode, label in MODES:
    w, thru = run(mode)
    main[mode] = dict(mean=float(w.mean()), p95=float(np.percentile(w, 95)),
                      p99=float(np.percentile(w, 99)), mx=float(w.max()),
                      thru=float(thru))
    if base is None:
        base = main[mode]['mean']
    tag = '' if mode == 'shared' else f'   {main[mode]["mean"]/base:.2f}x'
    print(f'  {label:32s} {main[mode]["mean"]:9.2f}  {main[mode]["p95"]:9.2f}'
          f'  {thru:9.2f}{tag}')

# The claim that survives every seed: one line adds no capacity whatsoever.
print(f'\n  throughput, one line vs four: {main["shared"]["thru"]:.2f} vs '
      f'{main["visible"]["thru"]:.2f} per hour — the shop is NOT faster')
print(f'  with x-ray vision four lines tie one line exactly: '
      f'{main["oracle"]["mean"]:.3f} vs {main["shared"]["mean"]:.3f} — so the')
print('  whole gap is the guessing penalty, not the queueing')

rng = np.random.default_rng(7)
T = 200_000
ahead = draw(rng, T * C).reshape(T, C) + draw(rng, T * C).reshape(T, C)
fastest = float((ahead.argmin(1) == 0).mean())
print(f'\n  your line is the fastest of {C}: {fastest:.1%}  (1/{C}, as it must be)')
print(f'  so you are in the wrong line {1 - 1/C:.0%} of the time — '
      f'not because you are unlucky')

print(f'\n  seed sweep, {len(SEEDS)} seeds — ratio (four lines / one line):')
sweep = {k: [] for k in ('mean', 'p95', 'p99', 'mx')}
for s in SEEDS:
    a, _ = run('shared', s)
    b, _ = run('visible', s)
    for k, f in (('mean', np.mean), ('p95', lambda x: np.percentile(x, 95)),
                 ('p99', lambda x: np.percentile(x, 99)), ('mx', np.max)):
        sweep[k].append(float(f(b) / f(a)))
for k, label in (('mean', 'mean wait'), ('p95', '95th pct'),
                 ('p99', '99th pct'), ('mx', 'MAXIMUM')):
    r = np.array(sweep[k])
    flag = '   <- unstable, barred from the screen' if np.ptp(r) > 0.2 else ''
    print(f'    {label:10s} {r.mean():.3f}   range {r.min():.3f}-{r.max():.3f}'
          f'   one line cuts {100*(1-1/r.mean()):4.1f}%{flag}')

out = Path(__file__).parent / 'stats.json'
out.write_text(json.dumps(dict(
    c=C, rho=RHO, n=N, warm=WARM, small=SMALL, big=BIG, p_big=P_BIG,
    seeds=list(SEEDS), modes=main, fastest_share=fastest,
    sweep={k: dict(mean=float(np.mean(v)), lo=float(np.min(v)),
                   hi=float(np.max(v))) for k, v in sweep.items()},
), indent=2))
print(f'\nwrote {out}')
