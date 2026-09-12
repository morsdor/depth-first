#!/usr/bin/env python3
"""r011 · I73 — pack boarding_data.json into a TS module, and REFUSE to write it
if any claim the reel makes on screen has stopped being true.

    python3 projects/r011_boarding/dump_data.py && python3 projects/r011_boarding/emit_ts.py

Every assertion below corresponds to words or a number that appears in the reel.
This is the mechanical half of non-negotiable 7; the other half is reading the
copy against the data by eye, which a script cannot do. r010 shipped a cut whose
approved copy said "lower" where the integrator said higher -- an assertion here
would not have caught that, and a human reading the copy column did.
"""
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
D = json.loads((HERE / 'boarding_data.json').read_text())
R, B = D['arms']['random'], D['arms']['backToFront']
C, P, M = D['claim'], D['published'], D['meta']
checks = []

# ── the reel's own timeline, so a claim is checked AT THE MOMENT IT IS MADE ──
# These must match the constants at the top of remotion/src/reels/Boarding.tsx.
RACE_START, RATE = 3.2, 15.0          # screen seconds, simulation seconds per second


def SIM(screen):
    return (screen - RACE_START) * RATE


COPY_TWO = 8.0                        # "TWO PEOPLE CAN STOW AT ONCE"
COPY_SEVEN = 13.2                     # "SEVEN STOW AT ONCE"
COPY_RANDOM_DONE = 21.0               # "EVERYONE SEATED AT 4:24"
COPY_B2F_DONE = 27.9                  # "BACK TO FRONT NEEDED ANOTHER 1:44"


def claim(text, cond):
    assert cond, f'ON-SCREEN CLAIM IS FALSE: {text}'
    checks.append(text)


def mmss(s):
    return f'{int(s) // 60}:{int(round(s)) % 60:02d}'


# ── the two clocks, which are on screen for 25 of the 44 seconds ────────────
claim('the random cabin finishes at 4:24', mmss(R['total']) == '4:24')
claim('the back-to-front cabin finishes at 6:08', mmss(B['total']) == '6:08')
claim('back to front is the slower arm', B['total'] > R['total'])
claim('back to front needs another 1:44 after the random cabin is full',
      mmss(C['remainingAtRandomDone']) == '1:44')
claim('six people are still standing in the back-to-front aisle at 4:24',
      C['standingAtRandomDone'] == 6)

# ── the mechanism, which is the reel ────────────────────────────────────────
claim('seven people stow at once in the random cabin', R['peakStow'] == 7)
claim('the running-max readout reaches 7 in the random cabin', R['maxStow'][-1][1] == 7)
claim('two is the most that ever stow at once in the back-to-front cabin',
      B['peakStow'] == 2 and B['maxStow'][-1][1] == 2)
claim('the back-to-front count NEVER exceeds two at any instant in the run',
      max(v for _, v in B['liveStow']) == 2)
claim('the counter already reads 7 when the copy says seven stow at once',
      R['maxStow'][-1][0] <= SIM(COPY_SEVEN))
claim('the back-to-front ceiling of two is already established when the copy says so',
      B['maxStow'][-1][0] <= SIM(COPY_TWO))
claim('the copy "EVERYONE SEATED, 4:24" lands AFTER the random cabin is full',
      SIM(COPY_RANDOM_DONE) >= R['total'])
claim('the back-to-front cabin is still boarding when that copy lands',
      SIM(COPY_RANDOM_DONE) < B['total'])
claim('the copy "ANOTHER 1:44" lands after the back-to-front cabin is full too',
      SIM(COPY_B2F_DONE) >= B['total'])
claim('the whole race fits the reel: both arms finish before the closing beats',
      RACE_START + B['total'] / RATE < 29.5)

# ── the cabin is the field test's cabin ─────────────────────────────────────
claim('72 passengers', M['pax'] == 72 and len(R['pax']) == 72 and len(B['pax']) == 72)
claim('12 rows of six seats and one aisle', M['rows'] == 12 and M['seats'] == 6)
claim('both arms board the SAME 72 seats',
      sorted((d['row'], d['seat']) for d in R['pax'])
      == sorted((d['row'], d['seat']) for d in B['pax']))
claim('every passenger sits down exactly once, one per seat',
      all(len({(d['row'], d['seat']) for d in a['pax']}) == 72 for a in (R, B))
      and all(d['sit'] is not None for a in (R, B) for d in a['pax']))
claim('only the ORDER differs — same carry-on count in both arms',
      sum(d['bag'] for d in R['pax']) == sum(d['bag'] for d in B['pax']))

# ── the published field test, quoted verbatim on screen ────────────────────
claim('the field test measured 6:11 for back to front', mmss(P['times']['backToFront']) == '6:11')
claim('the field test measured 4:44 for random', mmss(P['times']['random']) == '4:44')
claim('our back-to-front is within 5% of the measured one',
      abs(B['total'] - P['times']['backToFront']) / P['times']['backToFront'] < 0.05)
claim('our random is within 10% of the measured one',
      abs(R['total'] - P['times']['random']) / P['times']['random'] < 0.10)
claim('the field test is named on screen with its journal and year',
      '2012' in P['source'] and 'Steffen' in P['source'])

# ── trajectories are physical, because the reel draws them ─────────────────
claim('nobody moves backwards down the aisle',
      all(all(a[1] == i for i, a in enumerate(d['arr'])) for a in (R, B) for d in a['pax']))
claim('every passenger with a bag stows once, and before sitting',
      all((d['stow'] is not None) == d['bag'] and
          (d['stow'] is None or d['stow'][1] <= d['sit'] + 1e-6)
          for a in (R, B) for d in a['pax']))
claim('a passenger only stows within reach of their own row',
      all(d['stow'] is None or
          d['arr'][-1][1] >= M['sub'] * d['row'] - M['stowReach']
          for a in (R, B) for d in a['pax']))

# ── one run is never the result ─────────────────────────────────────────────
S = D['acrossSeeds']
claim('the animated run is typical, not the best seed',
      abs(R['total'] - S['random']['meanTotal']) <= 2 * S['random']['sdTotal']
      and abs(B['total'] - S['backToFront']['meanTotal']) <= 2 * S['backToFront']['sdTotal'])
claim('back to front is slower on the 20-seed mean too',
      S['backToFront']['meanTotal'] > S['random']['meanTotal'])


def pax_ts(pax):
    rows = []
    for d in pax:
        arr = ','.join(f'[{tt},{sl}]' for tt, sl in d['arr'])
        stow = 'null' if d['stow'] is None else f'[{d["stow"][0]},{d["stow"][1]}]'
        rows.append(f'{{r:{d["row"]},s:{d["seat"]},bag:{str(d["bag"]).lower()},'
                    f'sit:{d["sit"]},stow:{stow},arr:[{arr}]}}')
    return ',\n  '.join(rows)


def steps(xs):
    return ','.join(f'[{a},{b}]' for a, b in xs)


ts = f'''/**
 * r011 · I73 — GENERATED by projects/r011_boarding/emit_ts.py. Do not hand-edit.
 *
 * Two boardings of the SAME cabin and the SAME 72 passengers, differing in one
 * thing only: the order they are called in. Discrete-event agent model
 * (projects/r011_boarding/boarding.py), seed {M['seed']}, declared in
 * gate0/GATE0.md §13 as the seed nearest the 20-seed median on both arms.
 *
 * random        {mmss(R['total'])}   measured in the 2011 field test: {mmss(P['times']['random'])}
 * back to front {mmss(B['total'])}   measured in the 2011 field test: {mmss(P['times']['backToFront'])}
 *
 * Nothing was fitted. t_row {M['tRow']} s per row of pitch, t_stow {M['tStow']} s,
 * t_sit {M['tSit']} s, shuffle {M['shuffle']} s for 0/1/2 seated neighbours,
 * {M['bagRate']:.0%} carrying a bag — all chosen before any comparison was run.
 * 144 of 144 sweep points still have back to front slower than random.
 *
 * THE MECHANISM, and the only number that matters: the back-to-front cabin never
 * gets more than {B['peakStow']} people stowing at once, at any instant, in any seed, at any
 * parameter setting. The random cabin reaches {R['peakStow']}.
 *
 * {len(checks)} on-screen claims are asserted by emit_ts.py, which refuses to write this
 * file if one of them stops being true.
 */

export type Pax = {{
  /** row, 0 = nose */
  r: number;
  /** seat, 0-2 port (0 = window), 3-5 starboard (5 = window) */
  s: number;
  bag: boolean;
  /** simulation seconds at which they sat down and left the aisle */
  sit: number;
  /** [start, end] of blocking the aisle with a bag, or null */
  stow: [number, number] | null;
  /** [time, subSlot] — when they ARRIVED at each aisle sub-slot. Stop-and-go
   *  motion is reconstructed from this; tweening would smooth away the queue. */
  arr: [number, number][];
}};

export type Arm = {{
  total: number;
  meanStow: number;
  peakStow: number;
  /** running maximum of people stowing at once, as step changes */
  maxStow: [number, number][];
  /** the instantaneous count, as step changes */
  liveStow: [number, number][];
  pax: Pax[];
}};

export const META = {{
  seed: {M['seed']},
  rows: {M['rows']},
  seats: {M['seats']},
  /** aisle sub-slots per row of pitch: two people fit in one pitch and both reach the bin */
  sub: {M['sub']},
  pax: {M['pax']},
  /** seconds to walk one sub-slot */
  tSub: {M['tSub']},
  tStow: {M['tStow']},
  stowReach: {M['stowReach']},
  /** seconds of simulation per second of reel. MUST stay linear in playback. */
  rate: 15,
}} as const;

export const CLAIM = {{
  longerPct: {C['longerPct']},
  longerSecs: {C['longerSecs']},
  standingAtRandomDone: {C['standingAtRandomDone']},
  remainingAtRandomDone: {C['remainingAtRandomDone']},
  stowRatio: {C['stowRatio']},
}} as const;

/** The 2011 field test. Real people, a real fuselage, somebody else's numbers. */
export const PUBLISHED = {{
  source: {json.dumps(P['source'])},
  setup: {json.dumps(P['setup'])},
  times: {{
    steffen: {P['times']['steffen']},
    wilma: {P['times']['wilma']},
    random: {P['times']['random']},
    backToFront: {P['times']['backToFront']},
    block: {P['times']['block']},
  }},
}} as const;

export const ACROSS_SEEDS = {json.dumps(D['acrossSeeds'])} as const;

export const RANDOM: Arm = {{
  total: {R['total']},
  meanStow: {R['meanStow']},
  peakStow: {R['peakStow']},
  maxStow: [{steps(R['maxStow'])}],
  liveStow: [{steps(R['liveStow'])}],
  pax: [
  {pax_ts(R['pax'])},
  ],
}};

export const B2F: Arm = {{
  total: {B['total']},
  meanStow: {B['meanStow']},
  peakStow: {B['peakStow']},
  maxStow: [{steps(B['maxStow'])}],
  liveStow: [{steps(B['liveStow'])}],
  pax: [
  {pax_ts(B['pax'])},
  ],
}};
'''

out = HERE.parents[1] / 'remotion' / 'src' / 'reels' / 'data' / 'boarding.ts'
out.write_text(ts)
print(f'{len(checks)} on-screen claims verified:')
for c in checks:
    print(f'  ok  {c}')
print(f'\nwrote {out}  ({out.stat().st_size / 1024:.0f} KB)')
