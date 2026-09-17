#!/usr/bin/env python3
"""r014 · I31 -- pack hijack_data.json into a TS module, and REFUSE to write it
if any claim the reel makes on screen has stopped being true.

    python3 projects/r014_hijack/hijack.py && python3 projects/r014_hijack/emit_ts.py

Beat times below MUST match remotion/src/reels/Hijack.tsx's own BEAT constant.
Per the r011/r012 lesson, a claim is checked at the SCREEN SECOND it is made,
not merely somewhere in the data.
"""
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
D = json.loads((HERE / 'hijack_data.json').read_text())
KF = D['clockKeyframes']
M = D['meta']
checks = []


def clock_at(screen_s: float) -> float:
    """Piecewise-linear lookup into CLOCK_KEYFRAMES -- same function the .tsx
    uses to drive the on-screen clock. Clamped at both ends."""
    if screen_s <= KF[0][0]:
        return KF[0][1]
    for (s0, r0), (s1, r1) in zip(KF, KF[1:]):
        if s0 <= screen_s <= s1:
            if s1 == s0:
                return r1
            f = (screen_s - s0) / (s1 - s0)
            return r0 + f * (r1 - r0)
    return KF[-1][1]


def mmss(total_seconds: float) -> str:
    h = int(total_seconds // 3600)
    m = int((total_seconds % 3600) // 60)
    s = int(round(total_seconds % 60))
    if h:
        return f'{h}:{m:02d}:{s:02d}'
    return f'{m}:{s:02d}'


def claim(text, cond):
    assert cond, f'ON-SCREEN CLAIM IS FALSE: {text}'
    checks.append(text)


# ── beat times, must match Hijack.tsx's BEAT constant ───────────────────────
BEAT_97 = 20.5          # "97 NETWORKS. TWO AND A HALF MINUTES."
BEAT_DURATION_END = 32.0  # clock must have reached the real duration by here
BEAT_RESOLVE_END = 38.0   # clock must still read the real duration here (locked)

# ── the real event, sanity-checked against gate0/GATE0.md Sec5 ─────────────
claim('the announcement date is 24 Feb 2008', M['announceUTC'].startswith('2008-02-24'))
claim('the resolution date is the same day', M['resolvedUTC'].startswith('2008-02-24'))
claim('the verified duration is 2h14m (8040s)', M['durationSeconds'] == 8040)
claim('97 ASNs is the verified network count', M['asnsAffected'] == 97)
claim('the 97-ASN window is 2:30 from the announcement, not 1:45',
      M['asnsWindowSeconds'] == 150)

# ── the clock, asserted AT THE SCREEN SECOND the copy makes the claim ───────
claim('the clock reads 2:30 (150s) at the moment the copy says "97 NETWORKS. '
      'TWO AND A HALF MINUTES."', abs(clock_at(BEAT_97) - 150) < 0.01)
claim('the clock has reached the full verified duration (2:14:00) by the end '
      'of the "just over two hours" beat', clock_at(BEAT_DURATION_END) == M['durationSeconds'])
claim('the clock is still locked on the verified duration through the '
      'resolution beat, not drifting past it',
      clock_at(BEAT_RESOLVE_END) == M['durationSeconds'])
claim('the clock never exceeds the verified duration at any bound screen '
      'second', max(clock_at(s) for s, _ in KF) <= M['durationSeconds'])
claim('mmss(150) reads "2:30", matching the on-screen copy exactly',
      mmss(150) == '2:30')
claim('mmss(8040) reads "2:14:00", matching the on-screen copy exactly',
      mmss(8040) == '2:14:00')

# ── geometry: six real cities, real great-circle distances to Karachi ──────
claim('six converging cities are present',
      set(D['converging']) == {'LONDON', 'LAGOS', 'TOKYO', 'SYDNEY', 'SAO PAULO', 'MUMBAI'})
for name, arc in D['converging'].items():
    path = arc['path']
    claim(f'{name}\'s arc starts at {name} and ends at Karachi',
          abs(path[0][0] - {'LONDON': -0.1278, 'LAGOS': 3.3792, 'TOKYO': 139.6917,
                             'SYDNEY': 151.2093, 'SAO PAULO': -46.6333,
                             'MUMBAI': 72.8777}[name]) < 0.01
          and abs(path[-1][0] - M['karachi']['lon']) < 0.01
          and abs(path[-1][1] - M['karachi']['lat']) < 0.01)
    claim(f'{name}\'s arc has no point closer to either pole than +/-85 degrees '
          '(a sane great circle, not a degenerate one)',
          all(-85 <= lat <= 85 for _, lat in path))
claim('Mumbai is the closest converging city to Karachi (same subcontinent)',
      D['converging']['MUMBAI']['km'] == min(v['km'] for v in D['converging'].values()))
claim('Sao Paulo is the farthest converging city from Karachi',
      D['converging']['SAO PAULO']['km'] == max(v['km'] for v in D['converging'].values()))

claim('at least one real coastline ring is present (reused from r005, not invented)',
      len(D['coastlines']) > 100)

print(f'{len(checks)} on-screen claims verified:')
for c in checks:
    print(f'  ok  {c}')


def flat(path):
    return ','.join(f'{lon:.3f},{lat:.3f}' for lon, lat in path)


def coast_ts(rings):
    return ',\n  '.join('[' + flat(r) + ']' for r in rings)


CLOCK_KF_TS = ',\n  '.join(f'[{s}, {r}]' for s, r in KF)

CONVERGING_TS = ',\n'.join(
    '  ' + json.dumps(name) + ': { km: ' + str(arc['km']) + ', path: ['
    + ','.join(f'[{lon:.4f},{lat:.4f}]' for lon, lat in arc['path']) + '] }'
    for name, arc in D['converging'].items()
)

AMBIENT_TS = ',\n'.join(
    '  { a: ' + json.dumps(seg['a']) + ', b: ' + json.dumps(seg['b']) + ', path: ['
    + ','.join(f'[{lon:.4f},{lat:.4f}]' for lon, lat in seg['path']) + '] }'
    for seg in D['ambient']
)

COAST_TS = coast_ts(D['coastlines'])

ts = f'''/**
 * r014 · I31 -- GENERATED by projects/r014_hijack/emit_ts.py. Do not hand-edit.
 *
 * 24 Feb 2008, 18:47 UTC: Pakistan Telecom announces a route for YouTube's
 * address block, meant to stay inside Pakistan. Its upstream provider, PCCW
 * Global, never validated the announcement before repeating it worldwide.
 * 97 networks were carrying it within 2 min 30 s. It took until 21:01 UTC --
 * 2 hours 14 minutes -- for YouTube to out-announce it and end the leak.
 *
 * VERIFIED against RIPE NCC's own RIS case study, Google Research's published
 * BGP-dynamics analysis of this exact event, and Renesys's contemporaneous
 * incident writeup (cross-checked against its CircleID follow-up). Full
 * table and quotes: gate0/GATE0.md Sec5. NOT a typo -- the block was
 * intentional; the leak was PCCW's missing validation.
 *
 * Coastlines are r005's real GSHHG data, reused rather than re-fetched. The
 * six converging arcs are real great-circle paths (haversine + slerp) to six
 * real cities -- illustrative geography, not a claim that these specific
 * networks were among the 97 (that granular a source was not found).
 *
 * {len(checks)} on-screen claims are asserted by emit_ts.py, which refuses to
 * write this file if one of them stops being true.
 */

export const META = {{
  announceUTC: {json.dumps(M['announceUTC'])},
  resolvedUTC: {json.dumps(M['resolvedUTC'])},
  durationSeconds: {M['durationSeconds']},
  asnsAffected: {M['asnsAffected']},
  asnsWindowSeconds: {M['asnsWindowSeconds']},
  karachi: [{M['karachi']['lon']}, {M['karachi']['lat']}] as [number, number],
}} as const;

/** [screenSeconds, realSeconds] -- piecewise-linear, the ONE ruler. */
export const CLOCK_KEYFRAMES: [number, number][] = [
  {CLOCK_KF_TS},
];

export type ArcPoint = [number, number]; // [lon, lat] degrees

export const CONVERGING: Record<string, {{ path: ArcPoint[]; km: number }}> = {{
{CONVERGING_TS}
}};

export const AMBIENT: {{ a: string; b: string; path: ArcPoint[] }}[] = [
{AMBIENT_TS}
];

/** Real GSHHG coastline rings, reused from r005_geo.ts. [lon, lat] flat pairs
 * per ring; projected to the sphere in Hijack.tsx (same "project at playback"
 * rationale r005 used for its own coastline data). */
export const COASTLINES: number[][] = [
  {COAST_TS}
];
'''

out = HERE.parents[1] / 'remotion' / 'src' / 'reels' / 'data' / 'hijack.ts'
out.write_text(ts)
print(f'\nwrote {out}  ({out.stat().st_size / 1024:.0f} KB)')
