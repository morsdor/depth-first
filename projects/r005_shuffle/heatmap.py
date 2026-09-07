"""Is the naive shuffle's bias VISIBLE?

The counting argument (n^n paths onto n! orders) proves the naive shuffle is
non-uniform, but at n=3 the biggest spread is 1.25x -- invisible on a phone.
r005's first four cuts tried to animate that spread and could not, because the
picture and the caption disagreed.

This asks a question a picture can answer: for each card, where does it END UP?
That is an n x n table, and a table can be looked at. Random should have no
pattern in it. This script measures whether the naive shuffle's pattern is
strong enough to see, and the honest floor is the Fisher-Yates table run at the
same sample size -- if FY also looks patterned, the image is a lie.

It also dumps the table at log-spaced checkpoints, so the reel can play the
signal emerging from noise instead of cutting to a finished plot.
"""
import json
import random
from pathlib import Path

N_CARDS = 13          # one suit; 13x13 gives 44px cells at phone size
RUNS = 400_000
SEED = 20260907
SNAPS = 22            # checkpoints, log-spaced from pure noise to the final table


def naive(n, rnd):
    """The obvious way: walk the deck, swap each card with ANY card."""
    a = list(range(n))
    for i in range(n):
        j = rnd.randrange(n)
        a[i], a[j] = a[j], a[i]
    return a


def fisher_yates(n, rnd):
    """The correct way: swap each card only with one not yet dealt."""
    a = list(range(n))
    for i in range(n - 1, 0, -1):
        j = rnd.randrange(i + 1)
        a[i], a[j] = a[j], a[i]
    return a


def checkpoints(runs, snaps):
    """Log-spaced, so the early frames show noise resolving and the late ones refine."""
    lo, out = 60, []
    for k in range(snaps):
        v = round(lo * (runs / lo) ** (k / (snaps - 1)))
        if not out or v > out[-1]:
            out.append(v)
    return out


def table(fn, n, runs, seed, snaps):
    """counts[start][end], plus a normalised snapshot at each checkpoint."""
    rnd = random.Random(seed)
    counts = [[0] * n for _ in range(n)]
    marks, series = checkpoints(runs, snaps), []
    nxt = 0
    for done in range(1, runs + 1):
        for end, start in enumerate(fn(n, rnd)):
            counts[start][end] += 1
        if nxt < len(marks) and done == marks[nxt]:
            exp = done / n
            series.append([round(c / exp, 3) for row in counts for c in row])
            nxt += 1
    return counts, marks, series


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
        counts, marks, series = table(fn, N_CARDS, RUNS, SEED, SNAPS)
        s = stats(counts, N_CARDS, RUNS)
        out[name] = {'counts': counts, 'series': series, **s}
        print(f'{name:>13}  min {s["min"]:.3f}  max {s["max"]:.3f}  '
              f'contrast {s["contrast"]:.2f}x  mean|dev| {s["mean_abs_dev"]*100:.2f}%')

    # The image is only honest if FY's spread is sampling noise and naive's is not.
    fy, nv = out['fisher_yates'], out['naive']
    assert fy['contrast'] < 1.10, 'FY should be flat to within noise at this sample size'
    assert nv['mean_abs_dev'] > 10 * fy['mean_abs_dev'], 'naive bias must dominate the noise floor'
    ratio = nv['mean_abs_dev'] / fy['mean_abs_dev']
    print(f'\nnaive bias is {ratio:.0f}x the sampling noise floor')

    # When does the pattern become legible? The reel's hook depends on the answer:
    # the stripe has to be there by ~3s, so the fill has to reach this many runs.
    marks = checkpoints(RUNS, SNAPS)
    legible = next(m for m, snap in zip(marks, nv['series'])
                   if sum(abs(v - 1) for v in snap) / len(snap) > 4 * fy['mean_abs_dev'])
    print(f'naive pattern clears 4x the final noise floor at {legible:,} runs '
          f'(checkpoint {marks.index(legible)} of {len(marks) - 1})')

    ramp = ' .:-=+*#%@'
    exp = RUNS / N_CARDS
    for name in ('naive', 'fisher_yates'):
        print(f'\n{name}: rows = starting position, cols = final position')
        for i, row in enumerate(out[name]['counts']):
            print(f'  {i:>2} |' + ''.join(ramp[min(9, int((c / exp) * 3.2))] for c in row) + '|')

    Path(__file__).with_name('heatmap_data.json').write_text(json.dumps({
        'n': N_CARDS, 'runs': RUNS, 'seed': SEED, 'marks': marks,
        'signal_noise': round(ratio), 'legible_at': legible, **out}, indent=1))
    print(f'\nwrote heatmap_data.json  ({len(marks)} checkpoints)')


if __name__ == '__main__':
    main()
