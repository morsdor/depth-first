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
"""
import heapq
import numpy as np
from collections import deque

C, RHO, N, WARM = 4, 0.85, 300_000, 20_000
SMALL, BIG, P_BIG = 0.5, 3.0, 0.20        # mean = .8*.5 + .2*3.0 = 1.0


def draw(rng, n):
    big = rng.random(n) < P_BIG
    return np.where(big, rng.exponential(BIG, n), rng.exponential(SMALL, n))


def run(mode, seed=20260910):
    rng = np.random.default_rng(seed)
    arr = np.cumsum(rng.exponential(1.0 / (RHO * C), N))
    svc = draw(rng, N)
    pick = np.random.default_rng(seed + 1)

    lines = [deque() for _ in range(C)]        # customer ids waiting
    free = np.zeros(C)                          # when till j goes idle
    busy = [False] * C
    waits = np.full(N, np.nan)
    ev = [(arr[i], 0, i) for i in range(N)]     # (time, kind, payload)
    heapq.heapify(ev)

    def start(j, i, t):
        busy[j] = True
        waits[i] = t - arr[i]
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
    w = w[~np.isnan(w)]
    return w.mean(), np.percentile(w, 95)


print(f'{C} tills, utilisation {RHO:.0%}, {N:,} customers.')
print('Identical arrivals and identical service times in every run — the only')
print('thing that changes is where people are told to stand.\n')
print(f'{"discipline":34s} {"mean wait":>10s} {"95th pct":>10s}')
base = None
for mode, label in (('shared',  'ONE shared line (a snake)'),
                    ('visible', f'{C} lines, join the shortest'),
                    ('oracle',  f'{C} lines, with x-ray vision'),
                    ('random',  f'{C} lines, join at random')):
    m, p95 = run(mode)
    if base is None:
        base = m
    tag = '' if mode == 'shared' else f'   {m/base:.2f}x'
    print(f'  {label:32s} {m:9.2f}  {p95:9.2f}{tag}')

rng = np.random.default_rng(7)
T = 200_000
ahead = draw(rng, T * C).reshape(T, C) + draw(rng, T * C).reshape(T, C)
print(f'\n  your line is the fastest of {C}: '
      f'{(ahead.argmin(1) == 0).mean():.1%}  (1/{C}, as it must be)')
print(f'  so you are in the wrong line {1 - 1/C:.0%} of the time — '
      f'not because you are unlucky')
