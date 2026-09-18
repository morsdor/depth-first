#!/usr/bin/env python3
"""r015 · I77 -- pack llr_data.json into a TS module, and REFUSE to write it if
any claim the reel makes on screen has stopped being true.

    python3 projects/r015_moonmirrors/llr.py && python3 projects/r015_moonmirrors/emit_ts.py

Beat times below MUST match remotion/src/reels/MoonMirrors.tsx's own BEAT
constant. Per the r011/r012/r014 lesson, a claim is checked at the SCREEN
SECOND it is made, not merely somewhere in the data.
"""
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
D = json.loads((HERE / 'llr_data.json').read_text())
KF = D['clockKeyframes']
YKF = D['yearKeyframes']
M = D['meta']
checks = []


def clock_at(screen_s: float) -> float:
    if screen_s <= KF[0][0]:
        return KF[0][1]
    for (s0, r0), (s1, r1) in zip(KF, KF[1:]):
        if s0 <= screen_s <= s1:
            if s1 == s0:
                return r1
            f = (screen_s - s0) / (s1 - s0)
            return r0 + f * (r1 - r0)
    return KF[-1][1]


def year_at(screen_s: float) -> float:
    (s0, y0), (s1, y1) = YKF
    if screen_s <= s0:
        return y0
    if screen_s >= s1:
        return y1
    f = (screen_s - s0) / (s1 - s0)
    return y0 + f * (y1 - y0)


def claim(text, cond):
    assert cond, f'ON-SCREEN CLAIM IS FALSE: {text}'
    checks.append(text)


# ── beat times, must match MoonMirrors.tsx's BEAT constant ─────────────────
BEAT_MOON_ARRIVE = 9.0        # beam reaches the Moon -- beat 2/3 boundary
BEAT_DILUTION_END = 14.0      # "a handful come back" locks by here
BEAT_ROUNDTRIP_LOCK = 20.0    # clock must read the full round trip here
BEAT_ROUNDTRIP_END = 26.0     # still locked at end of the round-trip beat
BEAT_TIMELAPSE_START = 26.0
BEAT_TIMELAPSE_END = 30.0     # year counter must reach CURRENT_YEAR here

# ── exact physics, re-checked here rather than trusted from llr.py's own run ─
claim('the round trip is exactly twice the one-way time',
      abs(M['roundTripSeconds'] - 2 * M['oneWaySeconds']) < 0.0001)
claim('384,400 km at c gives a ~2.56s round trip, matching the on-screen "TIME '
      'THAT ROUND TRIP" beat', abs(M['roundTripSeconds'] - 2.5644) < 0.001)

# ── the clock, asserted AT THE SCREEN SECOND the copy makes the claim ───────
claim('the clock reads the one-way time exactly when the beam is shown '
      'arriving at the Moon', abs(clock_at(BEAT_MOON_ARRIVE) - M['oneWaySeconds']) < 0.0001)
claim('the clock still reads one-way time through the dilution beat (no '
      'return yet)', abs(clock_at(BEAT_DILUTION_END) - M['oneWaySeconds']) < 0.0001)
claim('the clock has reached the full round-trip time by the moment the copy '
      'says "TIME THAT ROUND TRIP"',
      abs(clock_at(BEAT_ROUNDTRIP_LOCK) - M['roundTripSeconds']) < 0.0001)
claim('the clock is still locked on the round-trip time through the end of '
      'that beat, not drifting past it',
      abs(clock_at(BEAT_ROUNDTRIP_END) - M['roundTripSeconds']) < 0.0001)
claim('the clock never exceeds the true round-trip time at any bound screen '
      'second', max(clock_at(s) for s, _ in KF) <= M['roundTripSeconds'] + 1e-9)

# ── the year time-lapse, bound to the "do that for over fifty years" beat ───
claim('the year counter starts at 1969, the year Apollo 11 placed the first '
      'array', year_at(BEAT_TIMELAPSE_START) == M['firstYear'])
claim('the year counter reaches the current year by the end of the '
      'time-lapse beat', year_at(BEAT_TIMELAPSE_END) == M['currentYear'])
claim('the span is genuinely OVER fifty years, matching the on-screen copy '
      '(never "fifty" flat, which would understate it)', M['yearsOfData'] > 50)

# ── photon figures -- ONE station (APOLLO) named, never blended ────────────
claim('310 quadrillion photons equals the verified APOLLO pulse energy '
      '(3.1e17)', abs(M['photonsSent'] - 310_000_000_000_000_000) < 1)
claim('the displayed return count sits inside APOLLO\'s own verified 5-10 '
      'photon-per-pulse range',
      M['photonsReturnedMin'] <= M['photonsReturnedDisplay'] <= M['photonsReturnedMax'])
claim('the return count is a single digit, matching the on-screen "a handful '
      'come back"', M['photonsReturnedDisplay'] < 10)

# ── precision and recession, the reel's two payoff numbers ─────────────────
claim('ranging precision is stated as ±1mm, APOLLO\'s own published figure',
      M['rangingPrecisionMm'] == 1)
claim('the recession rate is 3.83 cm/year, matching the on-screen copy '
      'exactly', M['recessionCmYr'] == 3.83)

# ── the five mirrors, close beat ────────────────────────────────────────────
claim('exactly five real, named reflector arrays are present, matching the '
      'close beat\'s "FIVE MIRRORS"', len(D['mirrors']) == 5)
claim('the five mirrors are the five real missions, no invented site',
      {m['name'] for m in D['mirrors']} ==
      {'APOLLO 11', 'APOLLO 14', 'APOLLO 15', 'LUNOKHOD 1', 'LUNOKHOD 2'})
claim('every mirror\'s placement year is before the current year',
      all(m['year'] < M['currentYear'] for m in D['mirrors']))
claim('the named reflector (beat 3-5) is one of the five real mirrors',
      D['reflector']['name'] in {m['name'] for m in D['mirrors']})

print(f'{len(checks)} on-screen claims verified:')
for c in checks:
    print(f'  ok  {c}')


CLOCK_KF_TS = ',\n  '.join(f'[{s}, {r}]' for s, r in KF)
YEAR_KF_TS = ',\n  '.join(f'[{s}, {y}]' for s, y in YKF)
MIRRORS_TS = ',\n'.join(
    '  { name: ' + json.dumps(m['name']) + f', year: {m["year"]}, lon: {m["lon"]}, lat: {m["lat"]} }}'
    for m in D['mirrors']
)

ts = f'''/**
 * r015 · I77 -- GENERATED by projects/r015_moonmirrors/emit_ts.py. Do not hand-edit.
 *
 * There are mirrors on the Moon: Apollo 11, 14 and 15 (US, 1969-71) and the
 * Soviet Lunokhod 1 and 2 arrays (French-built, 1970/73) are all still in
 * use. An observatory fires a laser at one; by the time it arrives the beam
 * has spread to roughly {M['spotAtMoonKm']} km wide, and of the
 * {M['photonsSent']:.1e} photons in a single APOLLO-station pulse, only
 * {M['photonsReturnedMin']}-{M['photonsReturnedMax']} are typically detected coming back. Timing that
 * round trip to a few picoseconds gives APOLLO's own stated ranging
 * precision of {M['rangingPrecisionMm']} mm on a {M['earthMoonKm']:,} km distance -- and {M['yearsOfData']}
 * years of that measurement show the Moon receding {M['recessionCmYr']} cm every year.
 *
 * VERIFIED against APOLLO station instrument papers (Murphy et al.,
 * IOPscience), an LLR round-trip-loss review, and Eos.org's feature on the
 * current best-fit recession rate. Full table and sources: gate0/GATE0.md
 * Sec5. {len(checks)} on-screen claims are asserted by emit_ts.py, which
 * refuses to write this file if one of them stops being true.
 */

export const META = {{
  earthMoonKm: {M['earthMoonKm']},
  oneWaySeconds: {M['oneWaySeconds']},
  roundTripSeconds: {M['roundTripSeconds']},
  photonsSent: {M['photonsSent']:.1f},
  photonsReturnedMin: {M['photonsReturnedMin']},
  photonsReturnedMax: {M['photonsReturnedMax']},
  photonsReturnedDisplay: {M['photonsReturnedDisplay']},
  spotAtMoonKm: {M['spotAtMoonKm']},
  spotAtEarthKm: {M['spotAtEarthKm']},
  rangingPrecisionMm: {M['rangingPrecisionMm']},
  recessionCmYr: {M['recessionCmYr']},
  firstYear: {M['firstYear']},
  currentYear: {M['currentYear']},
  yearsOfData: {M['yearsOfData']},
}} as const;

/** [screenSeconds, realSeconds elapsed of THIS beam's round trip] -- the ONE ruler, beats 2-5. */
export const CLOCK_KEYFRAMES: [number, number][] = [
  {CLOCK_KF_TS},
];

/** [screenSeconds, year] -- the time-lapse ruler, beat 6 only. */
export const YEAR_KEYFRAMES: [number, number][] = [
  {YEAR_KF_TS},
];

export const OBSERVATORY = {{ lon: {D['observatory']['lon']}, lat: {D['observatory']['lat']} }} as const;
export const REFLECTOR = {{ name: {json.dumps(D['reflector']['name'])}, year: {D['reflector']['year']}, lon: {D['reflector']['lon']}, lat: {D['reflector']['lat']} }} as const;

export type Mirror = {{ name: string; year: number; lon: number; lat: number }};
export const MIRRORS: Mirror[] = [
{MIRRORS_TS}
];
'''

out = HERE.parents[1] / 'remotion' / 'src' / 'reels' / 'data' / 'moonmirrors.ts'
out.write_text(ts)
print(f'\nwrote {out}  ({out.stat().st_size / 1024:.1f} KB)')
