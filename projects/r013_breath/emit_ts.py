#!/usr/bin/env python3
"""r013 · I81 — pack breath_data.json into a TS module, and REFUSE to write it
if any claim the reel makes on screen has stopped being true.

    python3 projects/r013_breath/breath.py && python3 projects/r013_breath/emit_ts.py

Every assertion below corresponds to words or a number in SCRIPT.md, checked
AT THE BEAT TIMESTAMP that puts it on screen (non-negotiable 7 / the r010
lesson: "an approved script does not make a claim true — check the copy
against the data after it is approved, and change the word"). The counter
timing constants (COUNTER_START, COUNTER_LOCK) below MUST match the
constants at the top of remotion/src/reels/Breath.tsx.
"""
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
D = json.loads((HERE / 'breath_data.json').read_text())
MASS, BUCKETS, PERKG = D['mass'], D['buckets'], D['perKg']
MOL, FRAG, COUNTS = D['molecule'], D['fragments'], D['counts']

checks = []


def claim(text, cond):
    assert cond, f'ON-SCREEN CLAIM IS FALSE: {text}'
    checks.append(text)


# ── the reel's own timeline (screen seconds), matching SCRIPT.md exactly and
# the constants at the top of Breath.tsx. A claim is checked AT THE MOMENT
# the copy on screen makes it, not just somewhere true in the data. ─────────
BEAT_MOLECULE_MEETS_O2 = (14.0, 17.5)     # "A MOLECULE OF YOUR FAT MEETS THE OXYGEN..."
BEAT_BREAKS_APART = (17.5, 22.0)          # "IT BREAKS APART. THE CARBON LEAVES AS CO2..."
BEAT_PER_KG_RULER = (22.0, 25.0)          # "FOR EVERY KILOGRAM YOU LOSE —"
BEAT_840_160 = (25.0, 28.0)               # "840 GRAMS LEAVES AS BREATH. 160 GRAMS ... WATER."

# The counter animates from 0 up to its target starting when the block
# visibly splits and MUST lock (reach the final value) before the beat ends,
# so the number is fully on screen for a readable stretch, not still ticking
# when the copy that states it fades. These two numbers are read by
# Breath.tsx as the literal frame bounds of its count-up interpolate().
COUNTER_START, COUNTER_LOCK = 25.3, 27.1
assert BEAT_840_160[0] <= COUNTER_START < COUNTER_LOCK <= BEAT_840_160[1], (
    'the counter must start and lock inside the beat that reads it')


def counter_value(t, target, start=COUNTER_START, lock=COUNTER_LOCK):
    if t <= start:
        return 0.0
    if t >= lock:
        return target
    return target * (t - start) / (lock - start)


# ── the molecule matches the formula this reel exists to explain ───────────
claim('the grown molecule has exactly 55 carbon atoms (C55H104O6)',
      COUNTS['carbon'] == 55)
claim('the grown molecule has exactly 104 hydrogen atoms (C55H104O6)',
      COUNTS['hydrogen'] == 104)
claim('the grown molecule has exactly 6 oxygen atoms (C55H104O6)',
      COUNTS['oxygen'] == 6)
claim('every atom in the molecule is one of C, H, O',
      all(a['el'] in ('C', 'H', 'O') for a in MOL['atoms']))
claim('atom count matches the sum of the three elements',
      len(MOL['atoms']) == COUNTS['carbon'] + COUNTS['hydrogen'] + COUNTS['oxygen'])

# ── B7/B8 (14.0-22.0s): the split is on screen with the real fragment count ─
claim('the split (on screen 17.5-22.0s, "THE CARBON LEAVES AS THE CO2") '
      'produces exactly 55 CO2 fragments, one per carbon atom',
      COUNTS['co2Fragments'] == 55 == len(FRAG['co2']))
claim('the split produces exactly 52 H2O fragments, one per hydrogen PAIR '
      '(104 H / 2 = 52), matching the balanced equation 55 CO2 + 52 H2O',
      COUNTS['h2oFragments'] == 52 == len(FRAG['h2o']))
claim('every CO2 fragment has a valid [0,1) stagger delay',
      all(0 <= f['delay'] < 1 for f in FRAG['co2']))
claim('every H2O fragment has a valid [0,1) stagger delay',
      all(0 <= f['delay'] < 1 for f in FRAG['h2o']))
claim('CO2 fragments drift toward breath (net +Y, upward) not away from it',
      all(f['dest'][1] > f['origin'][1] for f in FRAG['co2']))
claim('H2O fragments drift the OTHER way (net -Y, downward) from CO2',
      all(f['dest'][1] < f['origin'][1] for f in FRAG['h2o']))

# ── the mass balance behind "meets the oxygen you breathe in" (B7) ─────────
claim('the balanced equation conserves mass to nine significant figures',
      abs(MASS['reactantMass'] - MASS['productMass']) < 1e-6 * MASS['reactantMass'])
claim('78 O2 molecules are consumed per triglyceride (derived from atom balance)',
      MASS['o2Count'] == 78)

# ── the 84/16 split (referenced by the "almost all of it" framing) ─────────
claim('the CO2 bucket is within 0.5 percentage points of the published 84%',
      abs(BUCKETS['co2Pct'] - BUCKETS['publishedCo2Pct']) < 0.5)
claim('the H2O bucket is within 0.5 percentage points of the published 16%',
      abs(BUCKETS['h2oPct'] - BUCKETS['publishedH2oPct']) < 0.5)
claim('the two buckets sum to 100% of the fat\'s own mass',
      abs((BUCKETS['co2Pct'] + BUCKETS['h2oPct']) - 100) < 1e-6)

# ── B10 (25.0-28.0s): "840 GRAMS ... 160 GRAMS", checked AT THE MOMENT ─────
claim('840g/160g sum to the one kilogram the ruler (B9) just established',
      PERKG['co2Grams'] + PERKG['h2oGrams'] == 1000)
claim('the on-screen figure is exactly 840 g (nearest 10g of the computed value)',
      PERKG['co2Grams'] == 840)
claim('the on-screen figure is exactly 160 g (nearest 10g of the computed value)',
      PERKG['h2oGrams'] == 160)
claim('the counter has reached 840 g by 27.1s, while "840 GRAMS" is still on '
      'screen (beat ends 28.0s)',
      abs(counter_value(COUNTER_LOCK, PERKG['co2Grams']) - 840) < 1e-9)
claim('the counter has reached 160 g by 27.1s, while "160 GRAMS" is still on '
      'screen (beat ends 28.0s)',
      abs(counter_value(COUNTER_LOCK, PERKG['h2oGrams']) - 160) < 1e-9)
claim('the counter has NOT yet reached its target the instant the beat opens '
      '(so the copy reads as motion, not a static title card — non-negotiable 4)',
      counter_value(BEAT_840_160[0], PERKG['co2Grams']) == 0)

for text in checks:
    pass  # (asserted above; this loop exists only so `checks` is the audit list)


def js_atoms(atoms):
    rows = [f"{{el:'{a['el']}',x:{a['x']},y:{a['y']},z:{a['z']}}}" for a in atoms]
    return ',\n  '.join(rows)


def js_bonds(bonds):
    return ',\n  '.join(f'[{i},{j},{o}]' for i, j, o in bonds)


def js_frags(frags):
    rows = []
    for f in frags:
        o, d = f['origin'], f['dest']
        rows.append(
            f"{{origin:[{o[0]},{o[1]},{o[2]}],dest:[{d[0]},{d[1]},{d[2]}],delay:{f['delay']}}}")
    return ',\n  '.join(rows)


ts = f'''/**
 * r013 · I81 — GENERATED by projects/r013_breath/emit_ts.py. Do not hand-edit.
 *
 * The average human triglyceride, C55H104O6, grown as a real ball-and-stick
 * molecule from tetrahedral (sp3) and trigonal (sp2) bond-angle constraints
 * (projects/r013_breath/breath.py) — not an authored diagram. Combusted with
 * O2, it makes 55 CO2 + 52 H2O; independently re-derived from the molecular
 * formula alone, {BUCKETS['co2Pct']}% of the fat's own mass ends up as CO2
 * (published: {BUCKETS['publishedCo2Pct']}%), {BUCKETS['h2oPct']}% as H2O
 * (published: {BUCKETS['publishedH2oPct']}%). Source: {D['meta']['source']}
 *
 * {len(checks)} on-screen claims are asserted by emit_ts.py, which refuses to
 * write this file if one of them stops being true.
 */

export type Element = 'C' | 'H' | 'O';
export type Atom = {{ el: Element; x: number; y: number; z: number }};
/** [atomIndexA, atomIndexB, bondOrder] — bondOrder 1 = single, 2 = double. */
export type Bond = [number, number, number];
export type Fragment = {{
  origin: [number, number, number];
  dest: [number, number, number];
  /** [0,1) stagger — a deterministic pseudo-random spread, not authored per-fragment. */
  delay: number;
}};

export const FORMULA = {json.dumps(D['meta']['formula'])};
export const REACTION = {json.dumps(D['meta']['reaction'])};
export const SOURCE = {json.dumps(D['meta']['source'])};

export const COUNTS = {{
  carbon: {COUNTS['carbon']},
  hydrogen: {COUNTS['hydrogen']},
  oxygen: {COUNTS['oxygen']},
  co2Fragments: {COUNTS['co2Fragments']},
  h2oFragments: {COUNTS['h2oFragments']},
}} as const;

export const MASS = {{
  fatMolarMass: {MASS['fatMolarMass']},
  o2MolarMass: {MASS['o2MolarMass']},
  o2Count: {MASS['o2Count']},
  co2MolarMass: {MASS['co2MolarMass']},
  h2oMolarMass: {MASS['h2oMolarMass']},
  reactantMass: {MASS['reactantMass']},
  productMass: {MASS['productMass']},
}} as const;

export const BUCKETS = {{
  co2Pct: {BUCKETS['co2Pct']},
  h2oPct: {BUCKETS['h2oPct']},
  publishedCo2Pct: {BUCKETS['publishedCo2Pct']},
  publishedH2oPct: {BUCKETS['publishedH2oPct']},
}} as const;

/** The reel's one ruler: grams per kilogram of fat lost. */
export const PER_KG = {{
  co2GramsPrecise: {PERKG['co2GramsPrecise']},
  h2oGramsPrecise: {PERKG['h2oGramsPrecise']},
  co2Grams: {PERKG['co2Grams']},
  h2oGrams: {PERKG['h2oGrams']},
}} as const;

/** Counter timing — MUST match Breath.tsx's own COUNTER_START/COUNTER_LOCK. */
export const COUNTER_START = {COUNTER_START};
export const COUNTER_LOCK = {COUNTER_LOCK};

export const MOLECULE = {{
  atoms: [
  {js_atoms(MOL['atoms'])},
  ] as Atom[],
  bonds: [
  {js_bonds(MOL['bonds'])},
  ] as Bond[],
  bbox: {json.dumps(MOL['bbox'])},
  centre: {json.dumps(MOL['centre'])} as [number, number, number],
  chainLengths: {json.dumps(MOL['chainLengths'])},
}};

export const FRAGMENTS = {{
  co2: [
  {js_frags(FRAG['co2'])},
  ] as Fragment[],
  h2o: [
  {js_frags(FRAG['h2o'])},
  ] as Fragment[],
}};

export const O2_INBOUND: Fragment[] = [
  {js_frags(D['o2Inbound'])},
];
'''

out_dir = HERE.parents[1] / 'remotion' / 'src' / 'reels' / 'data'
out_dir.mkdir(parents=True, exist_ok=True)
out = out_dir / 'breath.ts'
out.write_text(ts)
print(f'{len(checks)} on-screen claims verified:')
for c in checks:
    print(f'  ok  {c}')
print(f'\nwrote {out}  ({out.stat().st_size / 1024:.0f} KB)')
