#!/usr/bin/env python3
"""I64 — the replayable race. Python computes every position; React only scales.

`sim.py` produces the STATISTICS (300,000 shoppers). This produces the twelve
seconds of shop the viewer actually watches: the same arrival stream and the
same baskets run under both disciplines, with one shopper followed through both.

It is an EXCERPT of a long run, not a fresh short run staged to look good, and
the shopper it follows is chosen by a rule written down before it was run:

    the first shopper after warm-up who
      * carries a basket, not a trolley                 (so the wait isn't theirs)
      * waits between the 70th and 90th percentile of the four-line shop
        (a bad-ish day, not a freak one — the freak days are unstable by seed)
      * waits less than the MEDIAN in the one-line shop (the discipline is what
        changed, nothing else)
      * has at least one trolley ahead of them in their four-line lane

If no shopper satisfies all four, the script fails rather than relaxing a
condition, because relaxing one after looking is how you end up shopping for
the result you wanted.

Positions are emitted as panel-local floats in [0,1] per frame, including the
walk from the queue to the till and the exit — so the .tsx does no queue logic
at all and cannot disagree with the simulation.
"""
import heapq
import json
from collections import deque
from pathlib import Path

import numpy as np

C, RHO, N, WARM = 4, 0.85, 4000, 400
SMALL, BIG, P_BIG = 0.5, 3.0, 0.20
SEED = 20260910

FPS, RACE_S = 30, 13.0
RACE_F = int(FPS * RACE_S)
XP = 0.072            # panel-widths per person of queue depth
SNAKE_HEAD = 0.70     # where the snake's front stands, in panel-local x
WALK_S, EXIT_S = 0.45, 0.55
SMOOTH = 0.30         # exponential smoothing: a queue shuffles, it does not jump


def draw(rng, n):
    big = rng.random(n) < P_BIG
    return np.where(big, rng.exponential(BIG, n), rng.exponential(SMALL, n)), big


def run(mode, arr, svc):
    """Returns per-customer (lane, t_start, t_end). Same code path as sim.py."""
    pick = np.random.default_rng(SEED + 1)
    lines = [deque() for _ in range(C)]
    busy = [False] * C
    lane = np.full(len(arr), -1)
    t0 = np.full(len(arr), np.nan)
    t1 = np.full(len(arr), np.nan)
    ev = [(arr[i], 0, i) for i in range(len(arr))]
    heapq.heapify(ev)

    def start(j, i, t):
        busy[j] = True
        lane[i], t0[i], t1[i] = j, t, t + svc[i]
        heapq.heappush(ev, (t + svc[i], 1, j))

    while ev:
        t, kind, x = heapq.heappop(ev)
        if kind == 0:
            i = x
            if mode == 'shared':
                idle = [j for j in range(C) if not busy[j]]
                if idle:
                    start(idle[0], i, t)
                else:
                    lines[0].append(i)
            else:
                n = [len(lines[j]) + busy[j] for j in range(C)]
                m = min(n)
                j = int(pick.choice([k for k in range(C) if n[k] == m]))
                lines[j].append(i)          # joined queue j — recorded below
                if not busy[j] and len(lines[j]) == 1:
                    start(j, lines[j].popleft(), t)
                else:
                    lane[i] = j             # waiting in j
        else:
            j = x
            busy[j] = False
            q = lines[0] if mode == 'shared' else lines[j]
            if q:
                start(j, q.popleft(), t)
    return lane, t0, t1


rng = np.random.default_rng(SEED)
arr = np.cumsum(rng.exponential(1.0 / (RHO * C), N))
svc, big = draw(rng, N)

lane4, s4, e4 = run('visible', arr, svc)
lane1, s1, e1 = run('shared', arr, svc)
w4, w1 = s4 - arr, s1 - arr
join4 = lane4.copy()                          # which line they stood in

lo, hi = np.percentile(w4[WARM:], [70, 90])
med1 = np.median(w1[WARM:])
you = None
for i in range(WARM, N - 200):
    if big[i] or not (lo <= w4[i] <= hi) or w1[i] >= med1:
        continue
    ahead = [k for k in range(i) if join4[k] == join4[i] and e4[k] > arr[i]]
    if any(big[k] for k in ahead):
        you = i
        break
assert you is not None, 'no shopper met all four conditions — do NOT relax one'

print(f'following shopper #{you}: basket {svc[you]:.2f} min')
print(f'  four lines: joined line {join4[you]}, waited {w4[you]:.2f} min')
print(f'  one line  : waited {w1[you]:.2f} min')
print(f'  selection band: p70={lo:.2f} p90={hi:.2f}, one-line median={med1:.2f}')

T0 = arr[you] - 1.2
T1 = max(e4[you], e1[you]) + 1.0
print(f'  window {T0:.2f}..{T1:.2f} min ({T1-T0:.2f} min) over {RACE_S}s '
      f'= {(T1-T0)/RACE_S:.2f} sim-min per screen second')

live = np.where((arr < T1) & (np.maximum(e4, e1) > T0))[0]
print(f'  {len(live)} shoppers on screen at some point')


def positions(lane, t0, t1, shared):
    """Panel-local (x, y) per frame per live shopper. y: lane 0..3 -> 0..1."""
    walk, exit_ = WALK_S * (T1 - T0) / RACE_S, EXIT_S * (T1 - T0) / RACE_S
    out = [[] for _ in range(RACE_F)]
    raw = {}
    for f in range(RACE_F):
        t = T0 + (T1 - T0) * f / (RACE_F - 1)
        for i in live:
            if t < arr[i] or t > t1[i] + exit_:
                continue
            ln = int(lane[i])
            if t >= t1[i]:                                   # leaving the till
                a = (t - t1[i]) / exit_
                x, y, st = 1.0 + 0.30 * a, ln / 3.0, 2
            elif t >= t0[i]:                                 # being served
                x, y, st = 1.0, ln / 3.0, 1
            else:                                            # waiting
                ahead = [k for k in live if arr[k] < arr[i] and t1[k] > t
                         and (shared or lane[k] == ln)]
                if shared:
                    served = sum(1 for k in ahead if t0[k] <= t)
                    slot = len(ahead) - served + 1
                    x, y = SNAKE_HEAD - (slot - 1) * XP, 0.5
                else:
                    x, y = 1.0 - len(ahead) * XP, ln / 3.0
                st = 0
                if t > t0[i] - walk:                          # walking to till
                    a = 1 - (t0[i] - t) / walk
                    tx, ty = 1.0, ln / 3.0
                    x, y, st = x + (tx - x) * a, y + (ty - y) * a, 0
            prev = raw.get(i)
            if prev is not None and st == 0:                  # shuffle, not jump
                x = prev[0] + (x - prev[0]) * SMOOTH
                y = prev[1] + (y - prev[1]) * SMOOTH
            raw[i] = (x, y)
            out[f].append([int(i), round(x, 4), round(y, 4), st])
    return out


four = positions(join4, s4, e4, False)
one = positions(lane1, s1, e1, True)
for f in (0, RACE_F // 2, RACE_F - 1):
    assert four[f] and one[f], f'frame {f} is empty in one of the shops'

served4 = [int(((e4[live] <= T0 + (T1 - T0) * f / (RACE_F - 1)) &
                (e4[live] > T0)).sum()) for f in range(RACE_F)]
served1 = [int(((e1[live] <= T0 + (T1 - T0) * f / (RACE_F - 1)) &
                (e1[live] > T0)).sum()) for f in range(RACE_F)]
print(f'  served during the window: four lines {served4[-1]}, '
      f'one line {served1[-1]}  (throughput is identical, so these track)')

# ── beat 3: sixteen rounds of "which of four lanes frees first" ────────────
# Shown as a tally the viewer can count. The 25.0% in sim.py is 200,000 rounds;
# this is 16 of them, and the reel reports the 16 it actually shows.
r3 = np.random.default_rng(99)
ROUNDS, DEPTH = 16, 2
sv, bg = draw(r3, ROUNDS * C * DEPTH)
tot = sv.reshape(ROUNDS, C, DEPTH).sum(2)
winner = tot.argmin(1)
rounds = [dict(win=int(winner[r]),
               big=[[bool(x) for x in bg.reshape(ROUNDS, C, DEPTH)[r][j]]
                    for j in range(C)])
          for r in range(ROUNDS)]
yours = int((winner == 0).sum())
print(f'  beat 3: your lane won {yours} of {ROUNDS} rounds '
      f'(long-run share is 1/{C})')

out = Path(__file__).parent / 'trace_data.json'
out.write_text(json.dumps(dict(
    c=C, fps=FPS, raceFrames=RACE_F, t0=T0, t1=T1, xp=XP, snakeHead=SNAKE_HEAD,
    you=int(you), youWait4=float(w4[you]), youWait1=float(w1[you]),
    youBasket=float(svc[you]),
    band=[float(lo), float(hi)], med1=float(med1),
    big={int(i): bool(big[i]) for i in live},
    four=four, one=one, served4=served4, served1=served1,
    rounds=rounds, roundsYours=yours, roundsN=ROUNDS,
)))
print(f'wrote {out}  ({out.stat().st_size/1024:.0f} KB)')
