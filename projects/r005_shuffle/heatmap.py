"""Is the naive shuffle's bias VISIBLE?

The counting argument (n^n paths onto n! orders) proves the naive shuffle is
non-uniform, but at n=3 the biggest spread is 1.25x -- invisible on a phone.

This asks a different question: for each card, where does it END UP?
That is an n x n table, and a table can be looked at. Random should have no
pattern in it. The question this script answers is whether the naive shuffle's
pattern is strong enough to see, and the honest floor is the Fisher-Yates map
run at the same sample size -- if FY also looks patterned, the image is a lie.
"""
import json
import random
from pathlib import Path

N_CARDS = 13          # one suit; 13x13 is legible at phone size
RUNS = 400_000
SEED = 20260907


def naive(n, rnd):
    """The obvious way: walk the deck, swap each card with ANY card."""
    a = list(range(n))
    for i in range(n):
        j = rnd.randrange(n)
        a[i], a[j] = a[j], a[i]
    return a


def fisher_yates(n, rnd):
    """The correct way: swap each card only with one not yet placed."""
    a = list(range(n))
    for i in range(n - 1, 0, -1):
        j = rnd.randrange(i + 1)
        a[i], a[j] = a[j], a[i]
    return a


def table(fn, n, runs, seed):
    """counts[start][end] -- how often the card starting at `start` finished at `end`."""
    rnd = random.Random(seed)
    counts = [[0] * n for _ in range(n)]
    for _ in range(runs):
        order = fn(n, rnd)
        for end, start in enumerate(order):
            counts[start][end] += 1
    return counts


def stats(counts, n, runs):
    exp = runs / n
    flat = [c / exp for row in counts for c in row]   # 1.0 == exactly fair
    return {
        'min': min(flat),
        'max': max(flat),
        'contrast': max(flat) / min(flat),
        'mean_abs_dev': sum(abs(v - 1) for v in flat) / len(flat),
    }


def main():
    out = {}
    for name, fn in (('naive', naive), ('fisher_yates', fisher_yates)):
        counts = table(fn, N_CARDS, RUNS, SEED)
        s = stats(counts, N_CARDS, RUNS)
        out[name] = {'counts': counts, **s}
        print(f'{name:>13}  min {s["min"]:.3f}  max {s["max"]:.3f}  '
              f'contrast {s["contrast"]:.2f}x  mean|dev| {s["mean_abs_dev"]*100:.2f}%')

    # The image is only honest if FY's spread is sampling noise and naive's is not.
    fy, nv = out['fisher_yates'], out['naive']
    assert fy['contrast'] < 1.10, 'FY should be flat to within noise at this sample size'
    assert nv['mean_abs_dev'] > 10 * fy['mean_abs_dev'], 'naive bias must dominate the noise floor'
    print(f'\nnaive bias is {nv["mean_abs_dev"] / fy["mean_abs_dev"]:.0f}x '
          f'the sampling noise floor')

    # Where is the pattern? Print the naive table as a coarse ramp.
    print('\nnaive: rows = starting position, cols = final position')
    ramp = ' .:-=+*#%@'
    exp = RUNS / N_CARDS
    for i, row in enumerate(nv['counts']):
        cells = ''.join(ramp[min(9, int((c / exp) * 3.2))] for c in row)
        print(f'  {i:>2} |{cells}|  row max {max(row)/exp:.2f}')

    print('\nfisher-yates: same scale')
    for i, row in enumerate(fy['counts']):
        cells = ''.join(ramp[min(9, int((c / exp) * 3.2))] for c in row)
        print(f'  {i:>2} |{cells}|  row max {max(row)/exp:.2f}')

    Path(__file__).with_name('heatmap_data.json').write_text(json.dumps({
        'n': N_CARDS, 'runs': RUNS, **out}, indent=1))


if __name__ == '__main__':
    main()
