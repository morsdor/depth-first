#!/usr/bin/env python3
"""r013 · I81 — you don't sweat fat off, you breathe it out.

STAGE 4 BUILD. Runs the real chemistry — atomic weights, a balanced combustion
equation, and a procedurally computed 3D ball-and-stick molecule — and dumps
every number and every atom position the reel needs to `breath_data.json`.
Nothing on screen is hand-placed: even the molecule's geometry is grown from
tetrahedral (sp3) and trigonal (sp2) bond-angle constraints, the same way
r001-r012 compute their animation instead of authoring it.

    python3 projects/r013_breath/breath.py

── The chemistry, in one paragraph ─────────────────────────────────────────
The paper's average human triglyceride is C55H104O6. Burned (metabolised) with
78 O2, it makes 55 CO2 + 52 H2O. Every one of the fat's OWN 55 carbon atoms
ends up in a CO2 molecule; every one of its OWN 104 hydrogen atoms ends up in
an H2O molecule (52 H2O × 2 H = 104). Its own 6 oxygen atoms get split between
the two product buckets in the same ratio the reaction actually uses oxygen
atoms overall (110 of the 162 product O atoms go into CO2, 52 into H2O) — that
split is what turns "55 C + 6 O(own, split) -> CO2 bucket" into a mass
percentage, independently of the borrowed O2 oxygen. Meerman & Brown (BMJ
2014;349:g7257) headline this as 84% / 16%; this script re-derives it from the
molecular formula alone, having been told nothing but the formula and the
periodic table, and checks the two agree.

── The molecule, in one paragraph ──────────────────────────────────────────
A regular tetrahedron's four vertex directions, call them A B C D, are the
only four unit vectors with every pairwise angle exactly arccos(-1/3) =
109.47 degrees — the real sp3 bond angle. Given ANY two of a carbon's four
bond directions, the other two are algebraically determined (a tetrahedron's
four vertex vectors sum to zero). That one fact is the entire molecule
generator: walk each chain forward picking alternating directions from a
fixed tetrahedral pair (which reproduces the real all-trans extended
zig-zag conformation of an alkane, not a made-up wiggle), and at every atom
solve for whatever bond directions are left over to place its hydrogens or
its ester/carbonyl oxygens. The one C=C double bond the formula implies
(fully-saturated chains of this length would carry 106 H, not 104 — a
2-hydrogen deficit is exactly one degree of unsaturation) is placed
mid-chain and costs each of its two carons one hydrogen, which is the real
reason an unsaturated fat's formula has fewer H than a saturated one of the
same carbon count.
"""
import json
import pathlib

import numpy as np

HERE = pathlib.Path(__file__).resolve().parent

# ═════════════════════════════════════════════════════════════════════════
# 1. THE STOICHIOMETRY — real atomic weights, a real balanced equation.
# ═════════════════════════════════════════════════════════════════════════

# IUPAC standard atomic weights (conventional values).
AW = {'C': 12.011, 'H': 1.008, 'O': 15.999}

# The average human triglyceride, and its combustion, per Meerman & Brown,
# "When somebody loses weight, where does the fat go?", BMJ 2014;349:g7257.
FAT = {'C': 55, 'H': 104, 'O': 6}
O2_COUNT_PUBLISHED = 78
CO2_COUNT = 55
H2O_COUNT = 52


def molar_mass(formula: dict) -> float:
    return sum(AW[el] * n for el, n in formula.items())


fat_mass = molar_mass(FAT)                        # triglyceride, g/mol
o2_mass = molar_mass({'O': 2})                     # one O2, g/mol
co2_mass = molar_mass({'C': 1, 'O': 2})            # one CO2, g/mol
h2o_mass = molar_mass({'H': 2, 'O': 1})            # one H2O, g/mol

# Derive the O2 count from atom balance instead of trusting the published 78:
# total O atoms needed by the products, minus the O atoms the fat brings of
# its own, split across two O2 per equivalent.
o_needed_by_products = CO2_COUNT * 2 + H2O_COUNT * 1
o2_count_derived = (o_needed_by_products - FAT['O']) / 2
assert o2_count_derived == O2_COUNT_PUBLISHED, (
    f'derived O2 count {o2_count_derived} != published {O2_COUNT_PUBLISHED}')
assert o2_count_derived == int(o2_count_derived), 'O2 count is not a whole number'

# Also check C and H atom balance independently (self-consistency of the
# equation before mass is ever computed).
assert FAT['C'] == CO2_COUNT * 1, 'carbon atoms do not balance'
assert FAT['H'] == H2O_COUNT * 2, 'hydrogen atoms do not balance'

reactant_mass = fat_mass + O2_COUNT_PUBLISHED * o2_mass
product_mass = CO2_COUNT * co2_mass + H2O_COUNT * h2o_mass
mass_balance_error = abs(reactant_mass - product_mass)
assert mass_balance_error < 1e-6 * reactant_mass, (
    f'mass does not conserve: {reactant_mass} reactants vs {product_mass} products')

# ═════════════════════════════════════════════════════════════════════════
# 2. THE OWN-ATOM ATTRIBUTION — where does the FAT'S mass end up, not the
#    borrowed O2's. This is the 84/16 the reel actually puts on screen.
# ═════════════════════════════════════════════════════════════════════════

# All 55 of the fat's own carbon atoms end up in the 55 CO2 molecules.
c_mass_to_co2 = FAT['C'] * AW['C']
# All 104 of the fat's own hydrogen atoms end up in the 52 H2O molecules.
h_mass_to_h2o = FAT['H'] * AW['H']
# The fat's own 6 oxygen atoms split in the ratio the reaction ACTUALLY uses
# oxygen atoms across the two products: 110 of 162 total product-O atoms are
# in CO2, 52 of 162 are in H2O.
o_atoms_in_co2 = CO2_COUNT * 2
o_atoms_in_h2o = H2O_COUNT * 1
o_atoms_total = o_atoms_in_co2 + o_atoms_in_h2o
assert o_atoms_total == o_needed_by_products
o_split_co2 = o_atoms_in_co2 / o_atoms_total
o_split_h2o = o_atoms_in_h2o / o_atoms_total
assert abs((o_split_co2 + o_split_h2o) - 1.0) < 1e-12

o_mass_to_co2 = FAT['O'] * AW['O'] * o_split_co2
o_mass_to_h2o = FAT['O'] * AW['O'] * o_split_h2o

co2_bucket_mass = c_mass_to_co2 + o_mass_to_co2
h2o_bucket_mass = h_mass_to_h2o + o_mass_to_h2o
assert abs((co2_bucket_mass + h2o_bucket_mass) - fat_mass) < 1e-6 * fat_mass, (
    'own-atom buckets do not add back up to the triglyceride molar mass')

co2_pct = 100 * co2_bucket_mass / fat_mass
h2o_pct = 100 * h2o_bucket_mass / fat_mass
assert abs((co2_pct + h2o_pct) - 100) < 1e-9

PUBLISHED_CO2_PCT, PUBLISHED_H2O_PCT = 84.0, 16.0
co2_pp_diff = abs(co2_pct - PUBLISHED_CO2_PCT)
h2o_pp_diff = abs(h2o_pct - PUBLISHED_H2O_PCT)
assert co2_pp_diff < 0.5, f'CO2 bucket {co2_pct:.2f}% is > 0.5pp from published 84%'
assert h2o_pp_diff < 0.5, f'H2O bucket {h2o_pct:.2f}% is > 0.5pp from published 16%'

# ═════════════════════════════════════════════════════════════════════════
# 3. THE PER-KILOGRAM FRAMING — the ONE ruler SCRIPT.md uses throughout.
#    Rounded to the nearest 10 g, which is what "840 GRAMS / 160 GRAMS"
#    actually is: the independently-computed percentage above, applied to
#    1000 g and rounded to a readable figure, not a separately-invented one.
# ═════════════════════════════════════════════════════════════════════════

KG_LOST_G = 1000.0
co2_g_precise = KG_LOST_G * co2_pct / 100
h2o_g_precise = KG_LOST_G * h2o_pct / 100
assert abs((co2_g_precise + h2o_g_precise) - KG_LOST_G) < 1e-6

co2_g_round10 = round(co2_g_precise / 10) * 10
h2o_g_round10 = round(h2o_g_precise / 10) * 10
assert co2_g_round10 + h2o_g_round10 == KG_LOST_G, (
    f'rounded grams {co2_g_round10} + {h2o_g_round10} != {KG_LOST_G}')
assert co2_g_round10 == 840, f'expected 840 g CO2 (nearest 10g), got {co2_g_round10}'
assert h2o_g_round10 == 160, f'expected 160 g H2O (nearest 10g), got {h2o_g_round10}'


# ═════════════════════════════════════════════════════════════════════════
# 4. THE MOLECULE — a procedurally grown ball-and-stick C55H104O6.
# ═════════════════════════════════════════════════════════════════════════

TAU = -1 / 3  # cos(109.47 deg) — the one number a tetrahedron is built from.


def _unit(v):
    v = np.asarray(v, dtype=float)
    return v / np.linalg.norm(v)


# The four vertex directions of a regular tetrahedron centred at the origin.
# Every pair has dot product exactly -1/3 (verified below).
_T = {
    'A': _unit([1, 1, 1]),
    'B': _unit([1, -1, -1]),
    'C': _unit([-1, 1, -1]),
    'D': _unit([-1, -1, 1]),
}
for _k1, _v1 in _T.items():
    for _k2, _v2 in _T.items():
        if _k1 != _k2:
            assert abs(np.dot(_v1, _v2) - TAU) < 1e-9, 'tetrahedron construction is wrong'

# The alternating backbone pair used to grow every linear chain: consecutive
# PLACEMENT vectors 70.53 deg apart, which makes the INTERIOR bond angle
# (the angle a chain atom actually sees between its neighbours) the correct
# 109.47 deg. This also happens to be planar — the real all-trans extended
# conformation real alkane chains sit in.
BOND_A = _T['A']
BOND_B = _unit(-_T['B'])
_interior_angle = np.degrees(np.arccos(np.clip(np.dot(-BOND_A, BOND_B), -1, 1)))
assert abs(_interior_angle - 109.47) < 0.1, f'interior angle {_interior_angle} is not tetrahedral'

L_CC = 0.62     # world units, one carbon-carbon (or C-O) bond
L_CH = 0.40     # C-H bonds are shorter, for a readable ball-and-stick
L_DBL = 0.56    # a double bond draws slightly short, as real ones are


def rot_z(deg):
    r = np.radians(deg)
    c, s = np.cos(r), np.sin(r)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


def known2_others(e1, e2):
    """Given 2 of a tetrahedral centre's 4 bond directions, return the other 2.

    A regular tetrahedron's 4 unit vertex vectors sum to zero, so the missing
    pair sums to -(e1+e2); by the tetrahedron's own mirror symmetry they are
    then placed symmetrically off that sum, along the axis perpendicular to
    both e1-e2 and e1+e2. Solved once in NOTES.md; used for every atom with
    exactly 2 already-placed neighbours (every CH2, and every 2-substituent
    branch point).
    """
    e1, e2 = _unit(e1), _unit(e2)
    s = -(e1 + e2)
    n = _unit(np.cross(e1, e2))
    half = s / 2
    k = np.sqrt(max(0.0, 1 - np.dot(half, half)))
    return _unit(half + k * n), _unit(half - k * n)


def known1_others(e1):
    """Given 1 of a tetrahedral centre's 4 bond directions, return the other 3
    (a symmetric tripod at 109.47 deg from e1 and from each other) — used for
    every terminal CH3."""
    e1 = _unit(e1)
    ref = np.array([0.0, 0.0, 1.0]) if abs(e1[2]) < 0.9 else np.array([1.0, 0.0, 0.0])
    u = _unit(np.cross(e1, ref))
    v = np.cross(e1, u)
    r = np.sqrt(8) / 3
    return [_unit(-e1 / 3 + r * (np.cos(np.radians(a)) * u + np.sin(np.radians(a)) * v))
            for a in (0, 120, 240)]


# ── verify the geometric primitives before a single atom is placed ─────────
_e1, _e2 = _unit([0.3, 1, 0.1]), _unit([-0.4, 0.2, 1])
# force them tetrahedral for the self-test
_e2 = _unit(known2_others(_e1, _T['B'])[0])
for _pair in (known2_others(_T['A'], _T['B']),):
    _f3, _f4 = _pair
    for _pv in (_T['A'], _T['B']):
        assert abs(np.dot(_pv, _f3) - TAU) < 1e-6
        assert abs(np.dot(_pv, _f4) - TAU) < 1e-6
    assert abs(np.dot(_f3, _f4) - TAU) < 1e-6
_trip = known1_others(_T['A'])
assert len(_trip) == 3
for _fv in _trip:
    assert abs(np.dot(_T['A'], _fv) - TAU) < 1e-6
for _i in range(3):
    for _j in range(3):
        if _i != _j:
            assert abs(np.dot(_trip[_i], _trip[_j]) - TAU) < 1e-6

atoms = []   # [{el, pos(np.array), h=None}]
bonds = []   # [(i, j, order)]


def add_atom(el, pos):
    atoms.append({'el': el, 'pos': np.array(pos, dtype=float)})
    return len(atoms) - 1


def add_bond(i, j, order=1):
    bonds.append((i, j, order))


def add_h(parent_i, direction):
    p = atoms[parent_i]['pos'] + direction * L_CH
    hi = add_atom('H', p)
    add_bond(parent_i, hi, 1)


# ── glycerol backbone: G0 - G1 - G2, the shared spine all 3 chains hang off ─
g0 = add_atom('C', [0, 0, 0])
g1_pos = atoms[g0]['pos'] + BOND_A * L_CC
g1 = add_atom('C', g1_pos)
add_bond(g0, g1)
g2_pos = atoms[g1]['pos'] + BOND_B * L_CC
g2 = add_atom('C', g2_pos)
add_bond(g1, g2)

# G0: 1 known neighbour (G1) -> tripod of 3: 1 ester-O + 2 H.
dir_g0_to_g1 = _unit(atoms[g1]['pos'] - atoms[g0]['pos'])
_g0_others = known1_others(dir_g0_to_g1)
ester_dir_g0 = _g0_others[0]
add_h(g0, _g0_others[1])
add_h(g0, _g0_others[2])

# G1: 2 known neighbours (G0, G2) -> 2 unknowns: 1 ester-O + 1 H.
dir_g1_to_g0 = _unit(atoms[g0]['pos'] - atoms[g1]['pos'])
dir_g1_to_g2 = _unit(atoms[g2]['pos'] - atoms[g1]['pos'])
ester_dir_g1, h_dir_g1 = known2_others(dir_g1_to_g0, dir_g1_to_g2)
add_h(g1, h_dir_g1)

# G2: 1 known neighbour (G1) -> tripod: 1 ester-O + 2 H.
dir_g2_to_g1 = _unit(atoms[g1]['pos'] - atoms[g2]['pos'])
_g2_others = known1_others(dir_g2_to_g1)
ester_dir_g2 = _g2_others[0]
add_h(g2, _g2_others[1])
add_h(g2, _g2_others[2])

GLYCEROL_C = [g0, g1, g2]
ESTER_DIRS = [ester_dir_g0, ester_dir_g1, ester_dir_g2]

# ── 3 fatty-acid chains, splayed 120 deg apart so they don't overlap ───────
# 55 C total: 3 glycerol + 52 across the chains. Chain lengths (each length
# INCLUDES its own carbonyl carbon, position 0) are picked only to be a
# plausible, roughly-even 3-way split of the 52 remaining carbons for a
# legible ball-and-stick layout — NOT a claim about any specific named fatty
# acid. Only the totals (55 C / 104 H / 6 O) are the figures the reel cites.
CHAIN_LENGTHS = [18, 18, 16]
assert sum(CHAIN_LENGTHS) == FAT['C'] - 3, 'chain carbons + glycerol carbons must total 55'

# The one C=C double bond the formula implies (106 H fully saturated -> 104 H
# actual = one degree of unsaturation). Placed mid-chain in the first (18-C)
# chain, at the bond between local positions DBOND_POS and DBOND_POS+1 —
# loosely at the real cis-9 position convention for an 18-carbon fatty acid,
# though (as above) this reel makes no on-screen claim about which acid it
# is, only that one double bond exists, because the H COUNT requires it.
DBOND_CHAIN, DBOND_POS = 0, 8
assert DBOND_POS + 1 < CHAIN_LENGTHS[DBOND_CHAIN] - 1, 'double bond must land on 2 interior carbons'

chains_meta = []

for k, L in enumerate(CHAIN_LENGTHS):
    az = 120.0 * k
    a_k = rot_z(az) @ BOND_A
    b_k = rot_z(az) @ BOND_B

    ester_o_pos = atoms[GLYCEROL_C[k]]['pos'] + ESTER_DIRS[k] * L_CC
    ester_o = add_atom('O', ester_o_pos)
    add_bond(GLYCEROL_C[k], ester_o)

    chain_atoms = []
    prev_i = ester_o
    prev_pos = ester_o_pos
    prev_in_dir = ESTER_DIRS[k]     # direction FROM glycerol-C INTO ester-O

    for pos_in_chain in range(L):
        step_dir = a_k if pos_in_chain % 2 == 0 else b_k
        is_dbond_first = (k == DBOND_CHAIN and pos_in_chain == DBOND_POS)
        is_dbond_second = (k == DBOND_CHAIN and pos_in_chain == DBOND_POS + 1)
        bond_len = L_DBL if (is_dbond_first or is_dbond_second) else L_CC
        cpos = prev_pos + step_dir * bond_len
        ci = add_atom('C', cpos)
        # The bond just added runs prev_i (position pos_in_chain-1) -> ci
        # (position pos_in_chain), so it is the C=C double bond exactly when
        # THIS atom is the second alkene carbon (DBOND_POS+1).
        order = 2 if is_dbond_second else 1
        add_bond(prev_i, ci, order)
        chain_atoms.append(ci)

        known_back = _unit(prev_pos - cpos)   # direction from THIS atom back
        is_last = pos_in_chain == L - 1

        if is_last:
            hs = known1_others(known_back)
            for hd in hs:
                add_h(ci, hd)
        else:
            next_dir = b_k if pos_in_chain % 2 == 0 else a_k
            e3, e4 = known2_others(known_back, next_dir)
            if pos_in_chain == 0:
                # carbonyl carbon: e3 -> the double-bonded carbonyl O, e4 unused (0 H)
                o_pos = cpos + e3 * L_DBL
                oi = add_atom('O', o_pos)
                add_bond(ci, oi, 2)
            elif is_dbond_first or is_dbond_second:
                # sp2 alkene carbon: only ONE H (loses the second to the pi bond)
                add_h(ci, e3)
            else:
                add_h(ci, e3)
                add_h(ci, e4)

        prev_i, prev_pos, prev_in_dir = ci, cpos, step_dir

    chains_meta.append({'esterO': ester_o, 'carbons': chain_atoms, 'length': L})

# ═════════════════════════════════════════════════════════════════════════
# 5. INVARIANTS ON THE GROWN MOLECULE — the geometry must match the formula.
# ═════════════════════════════════════════════════════════════════════════

el_counts = {'C': 0, 'H': 0, 'O': 0}
for a in atoms:
    el_counts[a['el']] += 1

assert el_counts['C'] == FAT['C'], f"grew {el_counts['C']} carbons, need {FAT['C']}"
assert el_counts['H'] == FAT['H'], f"grew {el_counts['H']} hydrogens, need {FAT['H']}"
assert el_counts['O'] == FAT['O'], f"grew {el_counts['O']} oxygens, need {FAT['O']}"

# Every atom's bond-order sum + attached H must equal its real valence.
VALENCE = {'C': 4, 'O': 2, 'H': 1}
bond_order_sum = {i: 0 for i in range(len(atoms))}
for i, j, order in bonds:
    bond_order_sum[i] += order
    bond_order_sum[j] += order
for i, a in enumerate(atoms):
    assert bond_order_sum[i] == VALENCE[a['el']], (
        f"atom {i} ({a['el']}) has bond-order sum {bond_order_sum[i]}, "
        f"needs {VALENCE[a['el']]}")

double_bonds = [b for b in bonds if b[2] == 2]
cc_double = [b for b in double_bonds if atoms[b[0]]['el'] == 'C' and atoms[b[1]]['el'] == 'C']
co_double = [b for b in double_bonds if {atoms[b[0]]['el'], atoms[b[1]]['el']} == {'C', 'O'}]
assert len(cc_double) == 1, f'expected exactly one C=C double bond, found {len(cc_double)}'
assert len(co_double) == 3, f'expected exactly 3 C=O carbonyl double bonds, found {len(co_double)}'

# The H deficit that the one C=C double bond accounts for: a fully-saturated
# skeleton of the same carbon count would carry 2 more H.
saturated_h_estimate = FAT['H'] + 2 * len(cc_double)
assert saturated_h_estimate == 106, (
    'the fully-saturated analogue of this carbon skeleton should be C55H106O6')

positions = np.array([a['pos'] for a in atoms])
bbox_min, bbox_max = positions.min(axis=0), positions.max(axis=0)
bbox_diam = float(np.linalg.norm(bbox_max - bbox_min))

print('── molecule grown ──────────────────────────────────────────────────')
print(f'  atoms   C={el_counts["C"]} H={el_counts["H"]} O={el_counts["O"]}  '
      f'({len(atoms)} total, {len(bonds)} bonds)')
print(f'  C=C double bonds: {len(cc_double)}   C=O double bonds: {len(co_double)}')
print(f'  bounding box diameter: {bbox_diam:.2f} world units')

# ═════════════════════════════════════════════════════════════════════════
# 6. THE SPLIT — 55 CO2 fragments (one per C atom) + 52 H2O fragments (one
#    per PAIR of H atoms, 104/2 = 52 exactly), drawn from the real atoms.
# ═════════════════════════════════════════════════════════════════════════


def det_rand(seed: int) -> float:
    """Deterministic, reproducible pseudo-random in [0,1) — a fixed formula,
    not a stored per-fragment authored value, so the scatter is computed and
    identical on every re-run."""
    x = np.sin(seed * 12.9898 + 78.233) * 43758.5453
    return float(x - np.floor(x))


c_atom_indices = [i for i, a in enumerate(atoms) if a['el'] == 'C']
h_atom_indices = [i for i, a in enumerate(atoms) if a['el'] == 'H']
assert len(c_atom_indices) == CO2_COUNT, (
    f'{len(c_atom_indices)} carbon atoms grown, need exactly {CO2_COUNT} for one CO2 each')
assert len(h_atom_indices) == 2 * H2O_COUNT, (
    f'{len(h_atom_indices)} hydrogen atoms grown, need exactly {2 * H2O_COUNT} '
    f'({H2O_COUNT} pairs) for one H2O each')

CENTRE = positions.mean(axis=0)
UP = np.array([0.0, 1.0, 0.0])

co2_fragments = []
for k, ci in enumerate(c_atom_indices):
    origin = atoms[ci]['pos']
    r1, r2, r3 = det_rand(k * 3 + 1), det_rand(k * 3 + 2), det_rand(k * 3 + 3)
    outward = _unit(origin - CENTRE) if np.linalg.norm(origin - CENTRE) > 1e-6 else UP
    # Kept modest deliberately: the CLOSE-UP camera framing (Breath.tsx) has a
    # fixed safe-area budget, so drift is sized to stay legible inside it
    # rather than to look maximally explosive.
    dest = origin + UP * (2.6 + 1.1 * r1) + outward * (0.9 + 0.8 * r2)
    dest[0] += (r3 - 0.5) * 1.6
    co2_fragments.append({
        'origin': origin.tolist(),
        'dest': dest.tolist(),
        'delay': round(det_rand(k * 7 + 11), 4),
    })
assert len(co2_fragments) == CO2_COUNT

h2o_fragments = []
for k in range(H2O_COUNT):
    hi, hj = h_atom_indices[2 * k], h_atom_indices[2 * k + 1]
    origin = (atoms[hi]['pos'] + atoms[hj]['pos']) / 2
    r1, r2, r3 = det_rand(k * 5 + 101), det_rand(k * 5 + 102), det_rand(k * 5 + 103)
    dest = origin + np.array([0.0, -(0.9 + 0.7 * r1), 0.0])
    dest[0] += (r2 - 0.5) * 1.3
    dest[2] += (r3 - 0.5) * 1.3
    h2o_fragments.append({
        'origin': origin.tolist(),
        'dest': dest.tolist(),
        'delay': round(det_rand(k * 9 + 211), 4),
    })
assert len(h2o_fragments) == H2O_COUNT

print(f'  fragments: {len(co2_fragments)} CO2 (1 per carbon), '
      f'{len(h2o_fragments)} H2O (1 per hydrogen pair)')

# ── decorative inbound O2 — no on-screen count is claimed for these, so no
#    assertion binds them; they are flavour for "meets the oxygen you
#    breathe in", not a stoichiometric rendering of all 78. ─────────────────
o2_inbound = []
N_O2_SHOWN = 14
for k in range(N_O2_SHOWN):
    r1, r2, r3, r4 = (det_rand(k * 13 + 301), det_rand(k * 13 + 302),
                       det_rand(k * 13 + 303), det_rand(k * 13 + 304))
    theta = r1 * 2 * np.pi
    phi = np.arccos(2 * r2 - 1)
    R = 6.5 + 2.0 * r3
    origin = CENTRE + R * np.array([
        np.sin(phi) * np.cos(theta), np.cos(phi), np.sin(phi) * np.sin(theta),
    ])
    dest = CENTRE + _unit(origin - CENTRE) * (1.8 + 0.6 * r4)
    o2_inbound.append({'origin': origin.tolist(), 'dest': dest.tolist(),
                        'delay': round(det_rand(k * 17 + 401), 4)})

# ═════════════════════════════════════════════════════════════════════════
# 7. PRINT EVERY FIGURE, THEN DUMP.
# ═════════════════════════════════════════════════════════════════════════

print()
print('── stoichiometry ───────────────────────────────────────────────────')
print(f'  C55H104O6 molar mass     {fat_mass:.3f} g/mol')
print(f'  O2 molar mass            {o2_mass:.3f} g/mol   x{O2_COUNT_PUBLISHED} '
      f'(derived from O atom balance, matches published)')
print(f'  reactants                {reactant_mass:.3f} g')
print(f'  products (55 CO2+52 H2O) {product_mass:.3f} g   (|diff| {mass_balance_error:.2e} g)')
print()
print('── own-atom attribution (what the fat\'s OWN mass turns into) ───────')
print(f'  -> CO2 bucket   {co2_bucket_mass:.3f} g   {co2_pct:.2f}%   (published 84%, '
      f'diff {co2_pp_diff:.2f}pp)')
print(f'  -> H2O bucket   {h2o_bucket_mass:.3f} g   {h2o_pct:.2f}%   (published 16%, '
      f'diff {h2o_pp_diff:.2f}pp)')
print()
print('── per kilogram lost (the reel\'s one ruler) ─────────────────────────')
print(f'  CO2   {co2_g_precise:.1f} g precise  -> {co2_g_round10:.0f} g on screen')
print(f'  H2O   {h2o_g_precise:.1f} g precise  -> {h2o_g_round10:.0f} g on screen')

data = {
    'meta': {
        'source': ('Meerman KC, Brown AJ, "When somebody loses weight, where does the fat '
                    'go?", BMJ 2014;349:g7257.'),
        'formula': 'C55H104O6',
        'reaction': 'C55H104O6 + 78 O2 -> 55 CO2 + 52 H2O',
        'atomicWeights': AW,
    },
    'mass': {
        'fatMolarMass': round(fat_mass, 3),
        'o2MolarMass': round(o2_mass, 3),
        'o2Count': O2_COUNT_PUBLISHED,
        'co2MolarMass': round(co2_mass, 3),
        'h2oMolarMass': round(h2o_mass, 3),
        'reactantMass': round(reactant_mass, 3),
        'productMass': round(product_mass, 3),
    },
    'buckets': {
        'co2BucketMass': round(co2_bucket_mass, 3),
        'h2oBucketMass': round(h2o_bucket_mass, 3),
        'co2Pct': round(co2_pct, 2),
        'h2oPct': round(h2o_pct, 2),
        'publishedCo2Pct': PUBLISHED_CO2_PCT,
        'publishedH2oPct': PUBLISHED_H2O_PCT,
    },
    'perKg': {
        'co2GramsPrecise': round(co2_g_precise, 1),
        'h2oGramsPrecise': round(h2o_g_precise, 1),
        'co2Grams': co2_g_round10,
        'h2oGrams': h2o_g_round10,
    },
    'molecule': {
        'atoms': [{'el': a['el'], 'x': round(float(a['pos'][0]), 4),
                    'y': round(float(a['pos'][1]), 4), 'z': round(float(a['pos'][2]), 4)}
                   for a in atoms],
        'bonds': [[i, j, order] for i, j, order in bonds],
        'bbox': {'min': bbox_min.tolist(), 'max': bbox_max.tolist(), 'diameter': bbox_diam},
        'centre': CENTRE.tolist(),
        'chainLengths': CHAIN_LENGTHS,
        'doubleBondChain': DBOND_CHAIN,
    },
    'fragments': {
        'co2': co2_fragments,
        'h2o': h2o_fragments,
    },
    'o2Inbound': o2_inbound,
    'counts': {
        'carbon': el_counts['C'],
        'hydrogen': el_counts['H'],
        'oxygen': el_counts['O'],
        'co2Fragments': len(co2_fragments),
        'h2oFragments': len(h2o_fragments),
    },
}

out = HERE / 'breath_data.json'
out.write_text(json.dumps(data, indent=2))
print(f'\nwrote {out}  ({out.stat().st_size / 1024:.0f} KB)')
