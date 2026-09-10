#!/usr/bin/env python3
"""r009 / I58 — the real computation behind "the Sun pulls 179x harder and still
loses the tide".

Everything the reel puts on screen is produced here, from published constants and
Newtonian gravity. Nothing is authored and nothing is recalled.

WHAT THIS IS, PRECISELY
-----------------------
This computes the EQUILIBRIUM TIDE: the shape a frictionless global ocean would
take if it could reach equilibrium with the tide-raising force at every instant.
That is the FORCING, not the water level at any real port. Real ocean tides are
set by basin resonance and amphidromic systems, they lag the forcing, and their
range varies by an order of magnitude between coastlines. The reel is about the
force, and every on-screen label says force.

Deliberately NOT computed or claimed here:
  * anybody's local high-tide time,
  * that the two bulges sweep around the Earth producing your two tides,
  * anything requiring a tide-gauge record (NOAA CO-OPS is refused by this
    container's egress proxy -- see GATE0.md section 6).

Run:  .venv/bin/python projects/i58_tides/tides.py
"""
import json
import math
from pathlib import Path

OUT = Path(__file__).with_name('tides_data.json')

# ── published constants ─────────────────────────────────────────────────────
# G: CODATA 2018.  Masses and mean distances: IAU 2015 / JPL.
G       = 6.67430e-11        # m^3 kg^-1 s^-2
M_MOON  = 7.346e22           # kg
M_SUN   = 1.98847e30         # kg
M_EARTH = 5.97217e24         # kg
R_E     = 6.3710e6           # m   mean Earth radius
D_MOON  = 3.84399e8          # m   mean Earth-Moon centre separation
D_SUN   = 1.495979e11        # m   mean Earth-Sun centre separation
g0      = 9.80665            # m s^-2
T_ROT   = 23.9344696 / 24.0  # days, Earth SIDEREAL rotation period
T_ORB   = 27.321661          # days, Moon sidereal orbital period

BODY_H  = 1.70               # m,  a person head to toe
BODY_M  = 70.0               # kg, a person


def span(M, d, L):
    """Difference in gravitational acceleration between the two ends of a body
    of length L whose centre lies at distance d from mass M.

    Written as 4ad/((d^2-a^2)^2) rather than 1/(d-a)^2 - 1/(d+a)^2: the direct
    form loses every significant digit to cancellation once d >> a, which is
    exactly the regime this is used in. A first pass at the body figures used
    the direct form and returned garbage.
    """
    a = L / 2.0
    return G * M * (4.0 * a * d) / ((d * d - a * a) ** 2)


def eta(theta, K):
    """Equilibrium tide height at angle theta from the tide-raising body."""
    return K * (3 * math.cos(theta) ** 2 - 1) / 2


# ── 1. direct pull, and the tide it raises ──────────────────────────────────
pull_sun  = G * M_SUN  / D_SUN ** 2
pull_moon = G * M_MOON / D_MOON ** 2
PULL_RATIO = pull_sun / pull_moon

K_moon = G * M_MOON * R_E ** 2 / (g0 * D_MOON ** 3)     # metres
K_sun  = G * M_SUN  * R_E ** 2 / (g0 * D_SUN ** 3)
TIDE_RATIO = K_sun / K_moon

# ── 2. near side, centre, far side — why there are two bulges ───────────────
a_near   = G * M_MOON / (D_MOON - R_E) ** 2
a_centre = G * M_MOON / D_MOON ** 2
a_far    = G * M_MOON / (D_MOON + R_E) ** 2
tide_near = a_near - a_centre        # residual, pointing TOWARD the Moon
tide_far  = a_centre - a_far         # residual, pointing AWAY from the Moon
ASYM_PCT  = 100 * (1 - tide_far / tide_near)

# ── 2b. the same three pulls as RELATIVE numbers ────────────────────────────
# Gate 3 feedback: "1.128e-6 is hard to understand by any person." Scientific
# notation is what a script prints, not what a viewer reads. These are the same
# measurements expressed against a baseline, which is all the reel ever claimed.
near_vs_centre_pct = (a_near / a_centre - 1) * 100      # near side, vs the middle
far_vs_centre_pct = (1 - a_far / a_centre) * 100        # far side, vs the middle
bulge_far_rel = tide_far / tide_near * 100              # far bulge, near bulge = 100

# ── 2c. the end-card arithmetic ─────────────────────────────────────────────
# The whole reel in two divisions. The Sun is far heavier AND far further, and
# the ONLY difference between winning the pull and losing the tide is dividing
# by the distance ratio one more time.
mass_ratio = M_SUN / M_MOON                             # ~27 million
dist_ratio = D_SUN / D_MOON                             # ~389
pull_from_ratios = mass_ratio / dist_ratio ** 2
tide_from_ratios = mass_ratio / dist_ratio ** 3

# ── 3. the rhythm ───────────────────────────────────────────────────────────
lunar_day_h = 1.0 / (1.0 / T_ROT - 1.0 / T_ORB) * 24
M2_h        = lunar_day_h / 2
S2_h        = 12.0
drift_min   = (M2_h - S2_h) * 60          # how much later each successive high is
daily_drift_min = (lunar_day_h - 24.0) * 60

# ── 4. spring and neap, from the same two amplitudes ────────────────────────
spring = K_moon + K_sun
neap   = K_moon - K_sun
SPRING_NEAP = spring / neap

# ── 5. the same law applied to a person ─────────────────────────────────────
moon_on_body   = span(M_MOON, D_MOON, BODY_H)
moon_on_earth  = span(M_MOON, D_MOON, 2 * R_E)
EARTH_VS_BODY  = moon_on_earth / moon_on_body

# 1 m centre-to-centre was the first cut's figure and it is NOT PHYSICAL: with a
# 1.7 m body the near end of you sits 0.15 m from the other person's centre, so
# the point-mass formula is evaluated deep inside its own singularity and the
# 702,858x it returns is mostly that artefact. 2 m is two people standing near
# each other, and it is the number the reel quotes.
PERSON_D       = 2.0
person_at_1m   = span(BODY_M, 1.0, BODY_H)          # kept only to document the trap
person_near    = span(BODY_M, PERSON_D, BODY_H)
BODY_RATIO     = person_near / moon_on_body

# The distance at which a person finally stops out-tiding the Moon. This is the
# robust form of the claim: it does not depend on picking a separation at all.
CROSSOVER_M    = (2 * G * BODY_M * BODY_H / moon_on_body) ** (1 / 3.0)

# The concession the reel must make, or the comparison reads as false. These are
# GRAVITY, not tide, and they point the other way: the Moon's straight pull on
# you beats a nearby person's by thousands of times. Both facts are true; they
# are different quantities, and the reel has to say which one it means.
moon_grav_you    = G * M_MOON / D_MOON ** 2
person_grav_2m   = G * BODY_M / PERSON_D ** 2
GRAV_MOON_WINS   = moon_grav_you / person_grav_2m
GRAV_VS_TIDE     = moon_grav_you / moon_on_body

# ── 6. the ocean envelope, as playback-ready polylines ──────────────────────
# Radius multiplier at 1-degree steps, relative to mean sea level. The reel
# rotates this shape; it does not recompute it.
STEP = 2
envelope_moon = [eta(math.radians(a), K_moon) / K_moon for a in range(0, 360, STEP)]
envelope_sun  = [eta(math.radians(a), K_sun) / K_sun for a in range(0, 360, STEP)]
# identical shape, different amplitude — that is the point, so assert it
assert max(abs(m - s) for m, s in zip(envelope_moon, envelope_sun)) < 1e-12

# ── 7. the equilibrium tide at one spot, over two days ──────────────────────
# A point ON THE EQUATOR, with both bodies taken in the equatorial plane. That
# simplification is stated on screen and in NOTES.md: it removes the diurnal
# inequality (successive highs differ when the Moon has declination) and keeps
# the two-per-lunar-day rhythm the beat is about.
HOURS, SAMPLES = 48.0, 2880          # 1-minute resolution
def sample(with_sun):
    out = []
    for i in range(SAMPLES + 1):
        h = HOURS * i / SAMPLES
        v = eta(2 * math.pi * h / lunar_day_h, K_moon)
        if with_sun:
            v += eta(2 * math.pi * h / 24.0, K_sun)
        out.append(v)
    return out

def highs_of(c):
    idx = [i for i in range(1, SAMPLES) if c[i] > c[i - 1] and c[i] >= c[i + 1]]
    hrs = [HOURS * i / SAMPLES for i in idx]
    return hrs, [b - a for a, b in zip(hrs, hrs[1:])]

curve_moon = sample(False)
curve_both = sample(True)
moon_hours, moon_gaps = highs_of(curve_moon)
both_hours, both_gaps = highs_of(curve_both)
moon_gap = sum(moon_gaps) / len(moon_gaps)
both_gap = sum(both_gaps) / len(both_gaps)

# MEASURED, and it is not what I would have written by hand: adding the Sun
# pulls the combined highs EARLIER than the Moon's own period, because S2 and
# M2 start in phase here and S2 is the faster of the two. The reel may say the
# Moon's part repeats every 12h25m; it may NOT say the sea does.
sun_shift_min = (moon_gap - both_gap) * 60

# ── invariants: if the reel claims it, this asserts it ──────────────────────
assert abs(M2_h - 12.4206012) * 3600 < 1.0, f'M2 off by {abs(M2_h-12.4206012)*3600:.3f} s'
assert 178 < PULL_RATIO < 180, PULL_RATIO
assert 0.45 < TIDE_RATIO < 0.47, TIDE_RATIO
assert 0.35 < K_moon < 0.36 and 0.16 < K_sun < 0.17, (K_moon, K_sun)
assert tide_near > tide_far > 0, 'both residuals must point outward'
assert 4.0 < ASYM_PCT < 6.0, ASYM_PCT
assert 10_000 < BODY_RATIO < 10_200, BODY_RATIO
assert 37 < CROSSOVER_M < 39, CROSSOVER_M
# the crossover must actually be a crossover
assert abs(span(BODY_M, CROSSOVER_M, BODY_H) / moon_on_body - 1) < 0.01
# and the honesty check: on GRAVITY the Moon wins, by a lot
assert GRAV_MOON_WINS > 1000, GRAV_MOON_WINS
# the end card's arithmetic must reproduce the measured ratios EXACTLY, or the
# calculation shown on screen is a different sum from the one that was computed
assert abs(pull_from_ratios - PULL_RATIO) / PULL_RATIO < 1e-12, (pull_from_ratios, PULL_RATIO)
assert abs(tide_from_ratios - TIDE_RATIO) / TIDE_RATIO < 1e-12, (tide_from_ratios, TIDE_RATIO)
assert 3.0 < near_vs_centre_pct < 3.8 and 3.0 < far_vs_centre_pct < 3.5
assert 94.5 < bulge_far_rel < 95.5, bulge_far_rel
# the Moon acting alone must produce highs exactly half a lunar day apart --
# an end-to-end check that the curve and the period agree
assert len(moon_gaps) >= 2, moon_gaps
assert abs(moon_gap - M2_h) * 60 < 1.0, (moon_gap, M2_h)
assert 5.0 < sun_shift_min < 12.0, sun_shift_min
# the reel's headline reversal, asserted rather than asserted-by-assertion:
assert PULL_RATIO > 100 and TIDE_RATIO < 0.5, 'the reversal must actually hold'

data = {
    'pull': {
        'sun': pull_sun, 'moon': pull_moon, 'ratio': PULL_RATIO,
    },
    'tide': {
        'k_moon_m': K_moon, 'k_sun_m': K_sun,
        'ratio_sun_over_moon': TIDE_RATIO,
        'ratio_moon_over_sun': 1 / TIDE_RATIO,
        'spring_m': spring, 'neap_m': neap, 'spring_over_neap': SPRING_NEAP,
    },
    'bulges': {
        'a_near': a_near, 'a_centre': a_centre, 'a_far': a_far,
        'tide_near': tide_near, 'tide_far': tide_far, 'asym_pct': ASYM_PCT,
        'near_vs_centre_pct': near_vs_centre_pct,
        'far_vs_centre_pct': far_vs_centre_pct,
        'bulge_far_rel': bulge_far_rel,
    },
    'ratios': {
        'mass': mass_ratio, 'distance': dist_ratio,
        'pull_from_ratios': pull_from_ratios, 'tide_from_ratios': tide_from_ratios,
    },
    'rhythm': {
        'lunar_day_h': lunar_day_h, 'm2_h': M2_h, 's2_h': S2_h,
        'drift_min_per_cycle': drift_min, 'drift_min_per_day': daily_drift_min,
        'published_m2_h': 12.4206012,
        'moon_only_gap_h': moon_gap,
        'moon_plus_sun_gap_h': both_gap,
        'sun_shift_min': sun_shift_min,
    },
    'body': {
        'height_m': BODY_H, 'mass_kg': BODY_M,
        'moon_on_body': moon_on_body, 'moon_on_earth': moon_on_earth,
        'person_distance_m': PERSON_D,
        'person_near': person_near, 'person_at_1m_UNPHYSICAL': person_at_1m,
        'person_over_moon': BODY_RATIO, 'earth_over_body': EARTH_VS_BODY,
        'crossover_m': CROSSOVER_M,
        'moon_grav_you': moon_grav_you, 'person_grav_near': person_grav_2m,
        'grav_moon_wins_by': GRAV_MOON_WINS, 'grav_over_tide': GRAV_VS_TIDE,
    },
    'envelope': {'step_deg': STEP, 'moon': envelope_moon, 'sun': envelope_sun},
    'curve': {'hours': HOURS, 'samples': SAMPLES,
              'moon_m': curve_moon, 'both_m': curve_both,
              'moon_high_hours': moon_hours, 'both_high_hours': both_hours},
    'constants': {
        'G': G, 'M_moon': M_MOON, 'M_sun': M_SUN, 'M_earth': M_EARTH,
        'R_earth': R_E, 'd_moon': D_MOON, 'd_sun': D_SUN, 'g0': g0,
        'T_rot_sidereal_d': T_ROT, 'T_orb_sidereal_d': T_ORB,
    },
}
OUT.write_text(json.dumps(data, indent=1))

print(f'PULL   sun/moon            {PULL_RATIO:>12.1f}x')
print(f'TIDE   sun/moon            {TIDE_RATIO:>12.3f}x   (moon/sun {1/TIDE_RATIO:.3f}x)')
print(f'       lunar amplitude     {K_moon*100:>12.1f} cm')
print(f'       solar amplitude     {K_sun*100:>12.1f} cm')
print(f'       spring / neap       {SPRING_NEAP:>12.2f}x   ({spring*100:.0f} cm vs {neap*100:.0f} cm)')
print(f'RELATIVE near side vs mid  {near_vs_centre_pct:>11.2f}% harder')
print(f'         far side vs mid   {far_vs_centre_pct:>11.2f}% weaker')
print(f'         far bulge         {bulge_far_rel:>11.1f}  (near bulge = 100)')
print(f'END CARD mass ratio        {mass_ratio:>11,.0f}x   distance ratio {dist_ratio:.0f}x')
print(f'         / {dist_ratio:.0f} squared     {pull_from_ratios:>11.1f}x the pull')
print(f'         / {dist_ratio:.0f} cubed       {tide_from_ratios:>11.3f}x the tide')
print(f'BULGE  near residual       {tide_near:>12.4e} m/s^2')
print(f'       far  residual       {tide_far:>12.4e} m/s^2   ({ASYM_PCT:.1f}% weaker)')
print(f'RHYTHM lunar day           {lunar_day_h:>12.5f} h')
print(f'       M2 derived          {M2_h:>12.7f} h  vs published 12.4206012 h')
print(f'       moon-only highs     {moon_gap:>12.5f} h apart  ({len(moon_gaps)} gaps) -- matches M2')
print(f'       moon+sun highs      {both_gap:>12.5f} h apart  ({len(both_gaps)} gaps)')
print(f'       adding the Sun      {sun_shift_min:>12.1f} min EARLIER per cycle')
print(f'       later each day      {daily_drift_min:>12.1f} min')
print(f'BODY   moon across you     {moon_on_body:>12.4e} m/s^2')
print(f'       person at {PERSON_D:.0f} m       {person_near:>12.4e} m/s^2   ({BODY_RATIO:,.0f}x the Moon)')
print(f'       crossover           {CROSSOVER_M:>12.1f} m     (beyond this the Moon wins)')
print(f'HONESTY moon GRAVITY on you {moon_grav_you:>12.4e} m/s^2')
print(f'        person gravity 2 m  {person_grav_2m:>12.4e} m/s^2   -> MOON wins by {GRAV_MOON_WINS:,.0f}x')
print(f'        gravity / tide      {GRAV_VS_TIDE:>12,.0f}x  -- different quantities, opposite winners')
print(f'  (1 m figure kept in JSON as UNPHYSICAL: {person_at_1m/moon_on_body:,.0f}x, near end 0.15 m away)')
print(f'       earth / your body   {EARTH_VS_BODY:>12,.0f}x')
print(f'wrote {OUT}')
