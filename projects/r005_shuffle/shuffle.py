"""
r005 — "Your shuffle isn't broken"  (backlog I07)

Runs real shuffles and measures what they actually do, in the shape r001/r003/r004
established: the run produces the numbers, so every figure on screen is correct.

WHAT IS AND IS NOT CLAIMED
  The backlog hook is "True random felt broken, so Spotify faked it". The second
  half of that is a claim about a company's engineering decisions, and the source
  for it cannot be reached from the container this was built in. Under the
  accuracy gate (CLAUDE.md non-negotiable 7) a mechanism sentence that cannot be
  falsified by an experiment does not go on screen, so THE REEL DOES NOT SAY IT.

  What the reel says is what this script proves: a truly random shuffle clumps,
  it clumps far more than people expect, and a shuffle engineered to LOOK random
  is measurably less random than one that is. The viewer is shown both and asked
  which looks shuffled. That is a demonstration, not an attribution.

  If a primary source for the Spotify story is ever obtained, it can be added --
  see NOTES.md in this folder.

THE SELF-CHECK
  The expected number of adjacent same-artist pairs has a closed form. For a
  uniformly random arrangement, by linearity of expectation over the n-1 adjacent
  slots:

      E[pairs] = (n-1) * P(a given adjacent slot matches)
               = (n-1) * sum_a k_a(k_a - 1) / (n(n-1))
               = sum_a k_a(k_a - 1) / n

  The Monte Carlo must converge to that. If it does not, the shuffle is not
  uniform or the counting is wrong, and nothing downstream can be trusted.

Usage:  python3 shuffle.py [--artists 6] [--per-artist 4] [--trials 200000]
"""

from __future__ import annotations

import argparse
import json
import pathlib
import random

HERE = pathlib.Path(__file__).resolve().parent


def fisher_yates(seq: list[int], rng: random.Random) -> list[int]:
    """The real algorithm, written out rather than called, because it IS the subject."""
    a = list(seq)
    for i in range(len(a) - 1, 0, -1):
        j = rng.randint(0, i)
        a[i], a[j] = a[j], a[i]
    return a


def adjacent_pairs(order: list[int]) -> int:
    return sum(1 for x, y in zip(order, order[1:]) if x == y)


def longest_run(order: list[int]) -> int:
    best = run = 1
    for x, y in zip(order, order[1:]):
        run = run + 1 if x == y else 1
        best = max(best, run)
    return best


def spread(counts: list[int], rng: random.Random) -> list[int]:
    """
    A shuffle built to LOOK shuffled: repeatedly take the artist with the most
    songs left, never the one just played. This is the shape of what music apps
    moved to -- deliberately anti-clustered -- and the point is that it is LESS
    random than the one people call broken, not more.
    """
    left = list(counts)
    out: list[int] = []
    last = -1
    while sum(left) > 0:
        best = max(
            (a for a in range(len(left)) if left[a] > 0 and a != last),
            key=lambda a: (left[a], rng.random()),
            default=-1,
        )
        if best < 0:                       # only the just-played artist remains
            best = next(a for a in range(len(left)) if left[a] > 0)
        out.append(best)
        left[best] -= 1
        last = best
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--artists', type=int, default=6)
    ap.add_argument('--per-artist', type=int, default=4)
    ap.add_argument('--trials', type=int, default=200_000)
    ap.add_argument('--seed', type=int, default=7)
    args = ap.parse_args()

    counts = [args.per_artist] * args.artists
    n = sum(counts)
    songs = [a for a, k in enumerate(counts) for _ in range(k)]
    rng = random.Random(args.seed)

    exact_expected = sum(k * (k - 1) for k in counts) / n

    with_pair = runs3 = 0
    total_pairs = 0
    run_hist: dict[int, int] = {}
    for _ in range(args.trials):
        order = fisher_yates(songs, rng)
        p = adjacent_pairs(order)
        r = longest_run(order)
        total_pairs += p
        with_pair += p > 0
        runs3 += r >= 3
        run_hist[r] = run_hist.get(r, 0) + 1

    mean_pairs = total_pairs / args.trials
    err = abs(mean_pairs - exact_expected)
    assert err < 0.02, (
        f'Monte Carlo mean {mean_pairs:.4f} does not match the closed form '
        f'{exact_expected:.4f} (off by {err:.4f}) — the shuffle is not uniform '
        'or the pair counting is wrong'
    )

    # Three example shuffles for the reel to replay, plus one spread arrangement.
    show = random.Random(args.seed + 1)
    examples = [fisher_yates(songs, show) for _ in range(3)]
    spread_example = spread(counts, show)
    assert adjacent_pairs(spread_example) == 0, 'the spread arrangement should have no clumps'
    assert sorted(spread_example) == sorted(songs), 'the spread arrangement lost a song'

    data = {
        'artists': args.artists,
        'per_artist': args.per_artist,
        'songs': n,
        'trials': args.trials,
        'exact_expected_pairs': round(exact_expected, 4),
        'measured_mean_pairs': round(mean_pairs, 4),
        'pct_with_any_pair': round(100 * with_pair / args.trials, 2),
        'pct_with_run_of_3': round(100 * runs3 / args.trials, 2),
        'longest_run_hist': {str(k): v for k, v in sorted(run_hist.items())},
        'examples': examples,
        'example_pairs': [adjacent_pairs(e) for e in examples],
        'spread': spread_example,
    }
    (HERE / 'shuffle_data.json').write_text(json.dumps(data))

    print(f'playlist     {n} songs, {args.artists} artists, {args.per_artist} each')
    print(f'self-check   closed form E[pairs] = {exact_expected:.4f}, '
          f'measured over {args.trials:,} real shuffles = {mean_pairs:.4f}  (off by {err:.4f})')
    print(f'clumping     {data["pct_with_any_pair"]}% of shuffles put at least two '
          f'songs by one artist back to back')
    print(f'             {data["pct_with_run_of_3"]}% contain a run of three')
    print(f'             mean {mean_pairs:.2f} adjacent same-artist pairs per shuffle')
    print(f'longest run  ' + '  '.join(
        f'{k}:{100*v/args.trials:.1f}%' for k, v in sorted(run_hist.items()) if v / args.trials > 0.005))
    print(f'examples     ' + ' | '.join(
        f'{e} pairs' for e in data['example_pairs']))
    print(f'spread       0 pairs by construction — and less random than any of the above')


if __name__ == '__main__':
    main()
