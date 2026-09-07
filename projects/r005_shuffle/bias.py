"""
r005 — "The obvious way to shuffle is wrong"  (backlog I07, reframed)

The first three cuts of this reel measured how often a correct shuffle CLUMPS,
which is a statistics demo, not a mechanism. r001 ran Shazam's fingerprinting,
r003 ran Reed-Solomon, r004 ran the DCT; this ran random.shuffle and counted
pairs, and a viewer duly said it taught nothing. The algorithm was always here.

WHAT IS COMPUTED
  1. The NAIVE shuffle, exhaustively. `for i in 0..n-1: swap(a[i], a[rand 0..n-1])`
     has exactly n^n equally likely execution paths. Enumerating all of them gives
     the exact probability of every output order — no sampling involved.
  2. FISHER-YATES, exhaustively. `for i in n-1..1: swap(a[i], a[rand 0..i])` has
     n! paths, one per order.
  3. Both again by Monte Carlo, as an independent check on the enumeration.
  4. Cumulative counts at checkpoints, so the reel replays a real run rather than
     animating a curve someone drew.

THE PROOF THE REEL RESTS ON
  n^n paths distributed over n! orders can only be uniform if n! divides n^n. For
  n = 3 that is 27 / 6 = 4.5. It is not an integer, so SOME order must be more
  likely than another, whatever the random source. That is a counting argument,
  not a measurement, and the enumeration then shows exactly where it lands.

Usage:  python3 bias.py [--n 3] [--trials 100000]
"""

from __future__ import annotations

import argparse
import json
import pathlib
import random
from collections import Counter
from itertools import permutations, product

HERE = pathlib.Path(__file__).resolve().parent


def naive(a: list, choices) -> list:
    a = list(a)
    for i, j in enumerate(choices):
        a[i], a[j] = a[j], a[i]
    return a


def fisher_yates(a: list, choices) -> list:
    a = list(a)
    for i, j in zip(range(len(a) - 1, 0, -1), choices):
        a[i], a[j] = a[j], a[i]
    return a


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--n', type=int, default=3)
    ap.add_argument('--trials', type=int, default=100_000)
    ap.add_argument('--seed', type=int, default=11)
    args = ap.parse_args()

    n = args.n
    songs = list('ABCDEF'[:n])
    orders = sorted(permutations(songs))

    # ── exact enumeration ──────────────────────────────────────────────────
    exact_naive = Counter(
        tuple(naive(songs, c)) for c in product(range(n), repeat=n)
    )
    exact_fy = Counter(
        tuple(fisher_yates(songs, c))
        for c in product(*[range(i + 1) for i in range(n - 1, 0, -1)])
    )
    paths_naive = n ** n
    paths_fy = 1
    for k in range(2, n + 1):
        paths_fy *= k

    assert sum(exact_naive.values()) == paths_naive
    assert sum(exact_fy.values()) == paths_fy
    assert set(exact_fy.values()) == {1}, 'Fisher-Yates is not uniform — implementation is wrong'
    assert len(set(exact_naive.values())) > 1, (
        'the naive shuffle came out uniform, which contradicts the counting argument'
    )

    # ── the same thing by sampling, as an independent check ────────────────
    rng = random.Random(args.seed)
    run_naive: Counter = Counter()
    run_fy: Counter = Counter()
    checkpoints, series_naive, series_fy = [], [], []
    every = max(1, args.trials // 60)
    for k in range(1, args.trials + 1):
        run_naive[tuple(naive(songs, [rng.randrange(n) for _ in range(n)]))] += 1
        run_fy[tuple(fisher_yates(songs, [rng.randint(0, i) for i in range(n - 1, 0, -1)]))] += 1
        if k % every == 0:
            checkpoints.append(k)
            series_naive.append([run_naive[o] for o in orders])
            series_fy.append([run_fy[o] for o in orders])

    for o in orders:
        want = exact_naive[o] / paths_naive
        got = run_naive[o] / args.trials
        assert abs(want - got) < 0.01, (
            f'sampled {got:.4f} for {"".join(o)} but enumeration says {want:.4f}'
        )

    lo, hi = min(exact_naive.values()), max(exact_naive.values())
    data = {
        'n': n,
        'songs': songs,
        'orders': [''.join(o) for o in orders],
        'paths_naive': paths_naive,
        'paths_fy': paths_fy,
        'divides': paths_naive % len(orders) == 0,
        'ratio': round(paths_naive / len(orders), 4),
        'exact_naive': [exact_naive[o] for o in orders],
        'exact_fy': [exact_fy[o] for o in orders],
        'pct_naive': [round(100 * exact_naive[o] / paths_naive, 2) for o in orders],
        'pct_fy': [round(100 * exact_fy[o] / paths_fy, 2) for o in orders],
        'worst_ratio': round(hi / lo, 2),
        'pct_low': round(100 * lo / paths_naive, 2),
        'pct_high': round(100 * hi / paths_naive, 2),
        'trials': args.trials,
        'checkpoints': checkpoints,
        'series_naive': series_naive,
        'series_fy': series_fy,
    }
    (HERE / 'bias_data.json').write_text(json.dumps(data))

    print(f'n = {n}: {paths_naive} naive paths, {paths_fy} Fisher-Yates paths, {len(orders)} orders')
    print(f'proof        {paths_naive} / {len(orders)} = {data["ratio"]} — '
          f'{"divides evenly, no bias forced" if data["divides"] else "NOT a whole number, so it cannot be fair"}')
    print(f'self-check   Fisher-Yates exactly uniform; sampled {args.trials:,} runs agree '
          f'with the enumeration to under 1 point')
    for i, o in enumerate(data['orders']):
        print(f'  {o}   naive {data["exact_naive"][i]}/{paths_naive} = {data["pct_naive"][i]:5.2f}%'
              f'    F-Y {data["exact_fy"][i]}/{paths_fy} = {data["pct_fy"][i]:5.2f}%')
    print(f'spread       {data["pct_high"]}% vs {data["pct_low"]}% — '
          f'the likeliest order is {data["worst_ratio"]}x the rarest')


if __name__ == '__main__':
    main()
