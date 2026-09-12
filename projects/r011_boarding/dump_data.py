#!/usr/bin/env python3
"""r011 · I73 — dump the boarding run the reel animates.

Runs boarding.py for the TWO arms the reel compares, on the ONE seed declared in
gate0/GATE0.md §13, and writes every passenger's trajectory to JSON. Nothing in
the reel is authored: each figure moving down an aisle is this file's output.

    python3 projects/r011_boarding/dump_data.py

Trajectories, not snapshots. `arr` is the time a passenger ARRIVED at each aisle
sub-slot, so the reel reconstructs real stop-and-go motion -- stand, shuffle
forward one body-width, stand again -- instead of tweening between frames. A
tween would smooth away the queue, which IS the subject.
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import boarding as B  # noqa: E402

# Declared in gate0/GATE0.md §13 BEFORE the numbers were read: the seed whose
# totals sit closest to the 20-seed median on BOTH arms. Choosing a run after
# seeing its numbers is how a reel ends up showing its luckiest seed.
SEED = 12
ARMS = (('random', 'random'), ('backToFront', 'back_to_front'))
SEEDS_FOR_STATS = 20


def series(samples):
    """The running maximum of people stowing at once, as step changes.

    A running max, not the instantaneous count: it is a readout the viewer can
    still read a second later, and it is the number the copy quotes. The live
    count is dumped too -- the reel shows both.
    """
    out, mx = [], 0
    for tt, v in samples:
        if v > mx:
            mx = v
            out.append([round(tt, 2), v])
    return out


def live(samples):
    """The instantaneous count, as step changes only (it is a step function)."""
    out, last = [], None
    for tt, v in samples:
        if v != last:
            out.append([round(tt, 2), v])
            last = v
    return out


def rnd(x, k=2):
    return None if x is None else round(x, k)


data = {
    'meta': {
        'seed': SEED,
        'rows': B.ROWS,
        'seats': B.SEATS,
        'sub': B.SUB,
        'pax': B.ROWS * B.SEATS,
        'tRow': B.T_ROW,
        'tSub': B.T_ROW / B.SUB,
        'tStow': B.T_STOW,
        'tSit': B.T_SIT,
        'shuffle': list(B.SHUFFLE),
        'bagRate': B.BAG_RATE,
        'stowReach': B.STOW_REACH,
    },
    'arms': {},
    'published': {
        'source': 'Steffen & Hotchkiss, J. Air Transport Management 18 (2012) 64-67',
        'setup': '72 passengers, mock 757 fuselage, 12 rows x 6, single aisle, 2011',
        'times': {'steffen': 216, 'wilma': 253, 'random': 284,
                  'backToFront': 371, 'block': 414},
    },
    'airlines': {
        'united': 'window-middle-aisle from 26 Oct 2023',
        'southwest': 'assigned seats and window-middle-aisle from 27 Jan 2026',
    },
}

print(f'seed {SEED}, {B.ROWS} rows x {B.SEATS} = {B.ROWS * B.SEATS} passengers\n')
for key, method in ARMS:
    total, samples, _, pax = B.simulate(method, seed=SEED)
    mean_c = B.mean_concurrency(samples, total)
    peak_c = B.peak_concurrency(samples)
    data['arms'][key] = {
        'method': method,
        'total': round(total, 2),
        'meanStow': round(mean_c, 3),
        'peakStow': peak_c,
        'maxStow': series(samples),
        'liveStow': live(samples),
        'pax': [{'row': d['row'], 'seat': d['seat'], 'bag': d['bag'],
                 'arr': [[rnd(tt), sl] for tt, sl in d['arr']],
                 'stow': None if d['stow'] is None else [rnd(d['stow'][0]), rnd(d['stow'][1])],
                 'sit': rnd(d['sit'])} for d in pax],
    }
    print(f'{method:<15} {B.mmss(total):>6} ({total:6.1f} s)   '
          f'mean stowing {mean_c:.2f}   peak {peak_c}   '
          f'published {B.mmss(data["published"]["times"][key])} '
          f'({(total - data["published"]["times"][key]) / data["published"]["times"][key] * 100:+.0f}%)')

r, b = data['arms']['random'], data['arms']['backToFront']
data['claim'] = {
    'longerPct': round((b['total'] - r['total']) / r['total'] * 100, 1),
    'longerSecs': round(b['total'] - r['total'], 1),
    'stowRatio': round(r['meanStow'] / b['meanStow'], 2),
}

# What the back-to-front cabin still owes at the moment the random one is full.
at = r['total']
standing = sum(1 for d in b['pax'] if d['arr'][0][0] <= at < d['sit'])
data['claim']['standingAtRandomDone'] = standing
data['claim']['remainingAtRandomDone'] = round(b['total'] - at, 1)

# The across-seed context, so a single run can never be mistaken for the result.
stats = {}
for key, method in ARMS:
    mean, sd, con, peak = B.run(method, seeds=SEEDS_FOR_STATS)
    stats[key] = {'seeds': SEEDS_FOR_STATS, 'meanTotal': round(mean, 1),
                  'sdTotal': round(sd, 1), 'meanStow': round(con, 3),
                  'meanPeakStow': round(peak, 2)}
data['acrossSeeds'] = stats

out = HERE / 'boarding_data.json'
out.write_text(json.dumps(data, separators=(',', ':')))
print(f"\nback to front is {data['claim']['longerPct']:.0f}% longer "
      f"(+{data['claim']['longerSecs']:.0f} s, base: random)")
print(f"at {B.mmss(at)} the back-to-front cabin still has {standing} people standing "
      f"and needs another {B.mmss(data['claim']['remainingAtRandomDone'])}")
print(f"running max stowing — random {r['maxStow'][-1][1]}, back to front {b['maxStow'][-1][1]}")
print(f"across {SEEDS_FOR_STATS} seeds: random {stats['random']['meanTotal']:.0f}+-"
      f"{stats['random']['sdTotal']:.0f} s, back to front "
      f"{stats['backToFront']['meanTotal']:.0f}+-{stats['backToFront']['sdTotal']:.0f} s")
print(f"\nwrote {out}  ({out.stat().st_size / 1024:.0f} KB)")
