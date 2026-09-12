#!/usr/bin/env python3
"""r012 / I84 — the real income-by-age curve, computed, not authored.

Every anchor point below is either printed directly in the primary source or
computed from a rate it prints (both cases marked). Nothing in between is
invented: the curve is a monotone cubic Hermite interpolation (Fritsch-Carlson,
1980) through the real anchors, which is the standard method for interpolating
a data series without introducing overshoot/false local bumps a plain cubic
spline would add between sparse points.

Source: Peter J. Brady & Steven Bass (Investment Company Institute), "A Day in
the Life Cycle: Using Tax Data to Measure Changes in Income by Age," IRS
Statistics of Income Joint Statistical Research Program, draft Dec 10, 2024.
2016 IRS tax data, whole US population (filers, dependents, nonfilers).
Read in full from the primary PDF (user-supplied) 2026-09-12 -- see
gate0/GATE0.md #6 for the verification record.

    ANCHOR (age, $)         SOURCE
    (30, 30_000)            p.12: "increases rapidly early in adulthood to
                            $30,000 at age 30"
    (46, 41_000)            p.12: "peaking at $41,000 at age 46" -- THE PEAK
    (61, 37_000)            p.12: "to ... $37,000 at age 61"
    (70, 34_000)            p.12: "and $34,000 at age 70"
    (80, computed)          p.12 fn.15: "declines 2.0 percent per year of age,
                            on average, from age 70 through age 80" ->
                            34_000 * (1 - 0.020) ** 10
    (98, computed)          p.12 fn.15: "0.7 percent per year of age, on
                            average, from age 70 through age 98" ->
                            (80-value) * (1 - 0.007) ** 18

The paper is explicit that ages 22-46 are a CROSS-SECTIONAL snapshot of the
2016 tax year (different people at different ages that year), not one
person's career. Ages 55-72 are cross-checked in the paper against Brady and
Bass (2023a), which used PANEL data following the same individuals -- this is
the one leg with real longitudinal backing. Both facts are carried into the
JSON as `evidenceKind` per age band and must stay distinguishable on screen
(SCRIPT.md beat 2 and 4).
"""
import json
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent

# ── the real anchors ─────────────────────────────────────────────────────────
AGE_70, VAL_70 = 70, 34_000
VAL_80 = VAL_70 * (1 - 0.020) ** 10          # fn.15: 2.0%/yr, age 70-80
VAL_98 = VAL_80 * (1 - 0.007) ** 18          # fn.15: 0.7%/yr, age 80-98

ANCHORS = [
    (30, 30_000),
    (46, 41_000),   # the peak
    (61, 37_000),
    (AGE_70, VAL_70),
    (80, round(VAL_80, -2)),
    (98, round(VAL_98, -2)),
]
PEAK_AGE, PEAK_VAL = 46, 41_000


def pchip_slopes(x, y):
    """Fritsch-Carlson (1980) monotone tangents for cubic Hermite interpolation.

    Standard method for a monotone dataset with few points: prevents the
    overshoot a plain natural cubic spline would add near the peak (a false
    local max/min between real anchors), while still giving a smooth curve
    rather than the piecewise-linear kinks a naive interpolation would show.
    """
    x, y = np.asarray(x, float), np.asarray(y, float)
    h = np.diff(x)
    delta = np.diff(y) / h
    n = len(x)
    m = np.zeros(n)
    m[0], m[-1] = delta[0], delta[-1]
    for i in range(1, n - 1):
        if delta[i - 1] * delta[i] <= 0:
            m[i] = 0.0
        else:
            w1, w2 = 2 * h[i] + h[i - 1], h[i] + 2 * h[i - 1]
            m[i] = (w1 + w2) / (w1 / delta[i - 1] + w2 / delta[i])
    return m


def hermite_eval(x, y, m, xs):
    x, y, m = np.asarray(x, float), np.asarray(y, float), np.asarray(m, float)
    xs = np.asarray(xs, float)
    idx = np.clip(np.searchsorted(x, xs, side='right') - 1, 0, len(x) - 2)
    x0, x1 = x[idx], x[idx + 1]
    y0, y1 = y[idx], y[idx + 1]
    m0, m1 = m[idx], m[idx + 1]
    h = x1 - x0
    t = (xs - x0) / h
    t2, t3 = t * t, t * t * t
    h00 = 2 * t3 - 3 * t2 + 1
    h10 = t3 - 2 * t2 + t
    h01 = -2 * t3 + 3 * t2
    h11 = t3 - t2
    return h00 * y0 + h10 * h * m0 + h01 * y1 + h11 * h * m1


ax = [a for a, _ in ANCHORS]
ay = [v for _, v in ANCHORS]
slopes = pchip_slopes(ax, ay)

# Sampled once per tenth of a year for smooth per-frame playback.
AGE_START, AGE_END = 30, 98
ages = np.round(np.arange(AGE_START, AGE_END + 0.001, 0.1), 1)
values = hermite_eval(ax, ay, slopes, ages)

peak_idx = int(np.argmax(values))
peak_age_computed = float(ages[peak_idx])
peak_val_computed = float(values[peak_idx])

# ── real invariants, asserted before anything is written ───────────────────
for a, v in ANCHORS:
    j = int(np.argmin(np.abs(ages - a)))
    assert abs(values[j] - v) < 1.0, f'anchor mismatch at age {a}: {values[j]} != {v}'

assert abs(peak_age_computed - PEAK_AGE) <= 0.15, (
    f'interpolated peak at {peak_age_computed}, expected {PEAK_AGE}')
assert abs(peak_val_computed - PEAK_VAL) < 5.0, (
    f'interpolated peak value {peak_val_computed}, expected {PEAK_VAL}')

rising = values[(ages >= 30) & (ages <= 46)]
assert np.all(np.diff(rising) >= -1e-6), 'income must not dip before the peak'
falling = values[(ages >= 46) & (ages <= 98)]
assert np.all(np.diff(falling) <= 1e-6), 'income must not rise after the peak'

drop_at_61 = 1 - hermite_eval(ax, ay, slopes, [61])[0] / PEAK_VAL
assert 0.09 <= drop_at_61 <= 0.11, f'expected ~10% drop by 61, got {drop_at_61:.1%}'

pct_of_peak = (values / PEAK_VAL).tolist()

data = {
    'meta': {
        'source': ('Brady & Bass (ICI), "A Day in the Life Cycle: Using Tax '
                   'Data to Measure Changes in Income by Age," IRS SOI '
                   'working paper, draft Dec 10 2024. 2016 IRS tax data, '
                   'whole US population.'),
        'peakAge': PEAK_AGE,
        'peakValue': PEAK_VAL,
        'dropAt61Pct': round(drop_at_61 * 100, 1),
        'evidenceKind': {
            'crossSectional': [30, 46],
            'longitudinalCheck': [55, 72],
            'note': ('22-46 (actually plotted from 30) is a cross-sectional '
                     'snapshot of the 2016 tax year -- different people at '
                     'different ages, not one career. 55-72 is cross-checked '
                     'in the paper against Brady & Bass (2023a), which used '
                     'panel data following the SAME individuals.'),
        },
    },
    'ages': ages.tolist(),
    'values': [round(v, 2) for v in values.tolist()],
    'pctOfPeak': [round(p, 4) for p in pct_of_peak],
    'anchors': [{'age': a, 'value': v} for a, v in ANCHORS],
}

out = HERE / 'income_data.json'
out.write_text(json.dumps(data, indent=2))
print(f"""wrote {out}

  peak                age {peak_age_computed:.1f}, ${peak_val_computed:,.0f}
  age 61              ${hermite_eval(ax, ay, slopes, [61])[0]:,.0f}  ({drop_at_61:.1%} below peak)
  age 70              ${hermite_eval(ax, ay, slopes, [70])[0]:,.0f}
  age 80 (computed)   ${VAL_80:,.0f}
  age 98 (computed)   ${VAL_98:,.0f}
  samples             {len(ages)} points, age {AGE_START}-{AGE_END} step 0.1
""")
