#!/usr/bin/env python3
"""Apply PREREG.md §1 and §3 to results/grid_metrics.json -- mechanically, no judgement calls.

    .venv/bin/python projects/r019_dispatch/analyze.py | tee projects/r019_dispatch/results/report.txt
"""
import json
import pathlib

import numpy as np

HERE = pathlib.Path(__file__).resolve().parent
M = json.load(open(HERE / 'results' / 'grid_metrics.json'))
T = 2.093                                   # t(0.975, 19 d.o.f.) -- PREREG §3's paired 95% interval
RIDERS, RHOS, SPEEDS = (120, 360, 1080), (0.75, 1.0, 1.5), (20, 30, 40)
DELTAS = (2, 5, 10, 15, 30, 60)
H = dict(R=360, rho=1.0, v=40)              # the headline cell, fixed by position in PREREG §3


def col(R, rho, v, pol, key):
    return np.array([row[key] for row in M[f'{R}|{rho}|{v}|{pol}']], float)


def paired(R, rho, v, pol, key='total_all'):
    d = col(R, rho, v, pol, key) - col(R, rho, v, 1, key)
    se = d.std(ddof=1) / np.sqrt(len(d))
    return d.mean(), d.mean() - T * se, d.mean() + T * se


def ms(x):
    return f'{x.mean():7.1f} ±{x.std(ddof=1) / np.sqrt(len(x)):4.1f}'


def sign(lo, hi):
    return 'LOWER' if hi < 0 else ('HIGHER' if lo > 0 else 'n.s.')


print('=' * 100)
print(f"HEADLINE CELL  R={H['R']}  rho={H['rho']}  v={H['v']} km/h   (riders/batch at D=5: ~{H['R'] / 600 * 5:.1f})")
print('=' * 100)
print(f"{'policy':>8} {'total (cancels=300)':>20} {'pickup':>8} {'wait-to-match':>14} {'cancel%':>8} {'not-closest%':>13} {'pressure':>9}   vs FD (paired 95%)")
fd = col(**H, pol=1, key='total_all')
for pol in (1, 2, 5, 10, 15, 30, 60, 'G'):
    t = col(**H, pol=pol, key='total_all')
    extra = ''
    if pol not in (1, 'G'):
        d, lo, hi = paired(**H, pol=pol)
        extra = f'{d:+7.1f}s [{lo:+6.1f},{hi:+6.1f}] {sign(lo, hi):>6}  {100 * d / fd.mean():+5.1f}%'
    name = 'FD(1s)' if pol == 1 else ('G' if pol == 'G' else f'D={pol}s')
    print(f"{name:>8} {ms(t):>20} {col(**H, pol=pol, key='pickup').mean():8.1f} {col(**H, pol=pol, key='delay').mean():14.1f} "
          f"{100 * col(**H, pol=pol, key='cancel').mean():8.1f} {100 * np.nanmean(col(**H, pol=pol, key='not_closest')):13.1f} "
          f"{np.nanmean(col(**H, pol=pol, key='pressure')):9.2f}   {extra}")

d5, lo5, hi5 = paired(**H, pol=5)
print(f"\nPRE-REGISTERED VERDICT (headline cell, D=5 s):  paired difference {d5:+.2f} s, 95% [{lo5:+.2f}, {hi5:+.2f}]  ->  "
      f"{'THE SENTENCE HOLDS AS MEASURED' if hi5 < 0 else 'DOES NOT HOLD AT D=5 s (see PREREG §3 for what that means)'}")

best_h = min(DELTAS, key=lambda d: col(**H, pol=d, key='total_all').mean())
db, lob, hib = paired(**H, pol=best_h)
print(f"best interval in the headline cell (descriptive, post-selected): D={best_h}s  {db:+.1f}s [{lob:+.1f},{hib:+.1f}]  {100 * db / fd.mean():+.1f}% of FD")

print('\nwinners and losers at the headline cell, per rider vs FD (same riders in every policy):')
for pol in (5, best_h):
    w, l = col(**H, pol=pol, key='wl_better'), col(**H, pol=pol, key='wl_worse')
    print(f"  D={pol:>2}s  shorter wait for {100 * w.mean():4.1f}% of riders (mean {col(**H, pol=pol, key='wl_gain').mean():5.1f}s shorter) | "
          f"longer for {100 * l.mean():4.1f}% (mean {col(**H, pol=pol, key='wl_loss').mean():5.1f}s longer) | unchanged {100 * (1 - w.mean() - l.mean()):4.1f}%")

print('\n' + '=' * 100)
print('ALL 27 CELLS -- the outside-paper checks (PREREG §1) and the sweep (PREREG §3)')
print('=' * 100)
print(f"{'R':>5} {'rho':>5} {'v':>3} | {'FD':>6} {'best D':>6} {'cut%':>6} | {'D=5 vs FD':>14} {'verdict':>7} | O1 O2 O3  R1 | cancel% FD→D5 | pressure@15")
n_lower = n_higher = n_ns = 0
flags = []
rows = []
for R in RIDERS:
    for rho in RHOS:
        for v in SPEEDS:
            c = dict(R=R, rho=rho, v=v)
            tot = {p: col(**c, pol=p, key='total_all').mean() for p in (1,) + DELTAS}
            best = min(DELTAS, key=lambda d: tot[d])
            cut = 100 * (tot[1] - tot[best]) / tot[1]
            d, lo, hi = paired(**c, pol=5)
            s = sign(lo, hi)
            n_lower += s == 'LOWER'; n_higher += s == 'HIGHER'; n_ns += s == 'n.s.'
            pick = [col(**c, pol=p, key='pickup').mean() for p in (1,) + DELTAS]
            o1 = tot[best] < tot[1]
            o2 = all(pick[i + 1] <= pick[i] + 0.01 * pick[i] for i in range(len(pick) - 1))   # steadily falling (1% slack)
            o3 = best in (2, 5, 10, 15, 30) and tot[60] > tot[best]
            r1 = 3 <= cut <= 30
            rows.append((R, rho, v, tot[1], best, cut, d, s, o1, o2, o3, r1))
            if cut > 30:
                flags.append(f'R1-HIGH (>30%): R={R} rho={rho} v={v} cut={cut:.1f}%  -> bug hunt before use')
            if not o1:
                flags.append(f'O1 FAILS: R={R} rho={rho} v={v}')
            print(f"{R:>5} {rho:>5} {v:>3} | {tot[1]:6.0f} {best:>5}s {cut:6.1f} | {d:+7.1f}s {('['+format(lo,'+.0f')+','+format(hi,'+.0f')+']'):>10}"
                  f" {s:>7} | {'ok' if o1 else 'NO'} {'ok' if o2 else 'NO'} {'ok' if o3 else 'NO'} {'ok' if r1 else ('hi' if cut > 30 else 'lo')} |"
                  f" {100 * col(**c, pol=1, key='cancel').mean():5.1f}→{100 * col(**c, pol=5, key='cancel').mean():5.1f} | "
                  f"{col(**c, pol=15, key='pressure').mean():6.2f}")

print(f'\nSWEEP at D = 5 s (Uber\'s "a few seconds"), of 27 cells: batching LOWER in {n_lower}, not significant in {n_ns}, HIGHER (worse) in {n_higher}')
for v in SPEEDS:
    sub = [r for r in rows if r[2] == v]
    print(f"   v={v}: LOWER in {sum(r[7] == 'LOWER' for r in sub)} of 9, n.s. {sum(r[7] == 'n.s.' for r in sub)}, HIGHER {sum(r[7] == 'HIGHER' for r in sub)}")
print(f"best-D cut vs FD across 27 cells: min {min(r[5] for r in rows):.1f}%  median {np.median([r[5] for r in rows]):.1f}%  max {max(r[5] for r in rows):.1f}%  (outside paper: 11.1%)")
print(f"O1 ok in {sum(r[8] for r in rows)}/27, O2 ok in {sum(r[9] for r in rows)}/27, O3 ok in {sum(r[10] for r in rows)}/27, R1 in-band in {sum(r[11] for r in rows)}/27")
print('\nFLAGS:' if flags else '\nFLAGS: none')
for f in flags:
    print('  ', f)

print('\nHeadline cell, the outside-paper SHAPE (total wait vs interval; theirs: 302.4 / 283.6 / 268.7 / 276.7 / 298.0 for FD / 5 / 15 / 30 / 60):')
print('  ours: ' + '  '.join(f"{('FD' if p == 1 else p)}={col(**H, pol=p, key='total_all').mean():.1f}" for p in (1,) + DELTAS))
