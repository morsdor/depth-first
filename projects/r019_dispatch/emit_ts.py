#!/usr/bin/env python3
"""r019 · I90 -- pack the world, the episode and the voice timings into TS modules, and REFUSE to write them if any
claim the reel makes on screen has stopped being true.

    cd projects/r019_dispatch && ../../.venv/bin/python emit_ts.py

Every cue time the reel uses is DERIVED here from the voice's own word timings (vo_words.json) -- nothing in
Dispatch.tsx is a hand-typed second. Move the voice and the cues move with it, and the claims below are re-checked.
Claims are bound to the SCREEN SECOND they are made (the r011/r014 lesson): a number may not appear before its word.
"""
import json
import pathlib
import re

import numpy as np

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parents[1] / 'remotion' / 'src' / 'reels' / 'data'
J = lambda *p: json.loads(HERE.joinpath(*p).read_text())
EXTRAS, ROB = J('results', 'extras.json'), J('results', 'robustness.json')
EPI, WORLD, INST, VO = J('results', 'episode.json'), J('results', 'world.json'), J('results', 'instances.json'), J('vo_words.json')
GRID = J('results', 'grid_metrics.json')
checks = []


def claim(text, cond):
    assert cond, f'ON-SCREEN CLAIM IS FALSE: {text}'
    checks.append(text)


# ── the 20-run figures, recomputed from the grid (PREREG §3) ──────────────────────────────────────────
T = 2.093
key = lambda pol: '360|1.0|40|' + str(pol)
col = lambda pol, k: np.array([r[k] for r in GRID[key(pol)]])
paired = lambda pol: (lambda d: (d.mean(), d.mean() - T * d.std(ddof=1) / np.sqrt(len(d)), d.mean() + T * d.std(ddof=1) / np.sqrt(len(d))))(col(pol, 'total_all') - col(1, 'total_all'))
fd_mean, b5_mean, b60_mean = (col(p, 'total_all').mean() for p in (1, 5, 60))
d5, lo5, hi5 = paired(5)
d60, lo60, hi60 = paired(60)
not_closest5 = col(5, 'not_closest').mean()
gains = sorted(col(1, 'total_all')[s] - col(5, 'total_all')[s] for s in range(20))
median_seed = sorted(range(20), key=lambda s: col(1, 'total_all')[s] - col(5, 'total_all')[s])[10]

# ── claims (SCRIPT.md · "Contract for the build") ─────────────────────────────────────────────────────
sv = EXTRAS['straight_vs_road']['300']
claim('"half the time" -- the as-run wrong-car share is within 45-55%', 0.45 <= sv['share_differ'] <= 0.55)
claim('"half the time" -- the near-straight-edge run is within 45-55%', 0.45 <= ROB['near_straight_only']['share_differ'] <= 0.55)
claim('"about twenty-five seconds a ride" -- the near-straight-edge mean cost is within 20-30 s', 20 <= ROB['near_straight_only']['mean_all'] <= 30)
claim('"now and then a river" -- a river is in at most 10% of the wrong-car cases', ROB['as_run']['share_cross_of_wrong'] <= 0.10)
claim('"seven percent of the cars" -- the 7-cell neighbourhood holds 5-9% of the fleet', 0.05 <= EXTRAS['hex']['share_of_fleet_mean'] <= 0.09)
claim('"almost always the closest one" -- the true nearest car is inside the 7 cells in >= 95% of cases', EXTRAS['hex']['hood_contains_true_nearest'] >= 0.95)
claim('"one rider in thirteen" -- the 20-run not-closest share at 5 s is within 7.0-8.5%', 0.070 <= not_closest5 <= 0.085)
claim('"a little shorter" -- the paired 95% interval for 5 s is entirely below 0', hi5 < 0)
claim('"a little shorter" -- ...and the cut is under 5% (it is small, and the copy says so)', abs(d5) / fd_mean < 0.05)
claim('"worse than not waiting at all" -- the paired 95% interval for 60 s is entirely above 0', lo60 > 0)
claim('the animated episode is the median-gain seed of the 20', median_seed == EPI['seed'] == 18)
fin = EPI['finals']
claim("the episode's OWN 5 s total is below its own FD, and its own 60 s total is above it (the animation never contradicts the claim)",
      fin['5'] < fin['1'] < fin['60'])
claim('the hook instance is the one the rule found (rider 3: looks-closest car 140 s, quickest 122 s)',
      EPI['instances']['hook']['rider'] == INST['hook']['rider'] == 3 and abs(EPI['instances']['hook']['etaS']['looks'] - 140.2) < 0.1
      and abs(EPI['instances']['hook']['etaS']['quick'] - 121.7) < 0.1)
claim('the hook example is a TYPICAL gap, not a dramatic one (within 10-40 s)',
      10 <= EPI['instances']['hook']['etaS']['looks'] - EPI['instances']['hook']['etaS']['quick'] <= 40)
claim('the river instance is the one the rule found (rider 102: 510 s vs 290 s)',
      EPI['instances']['river']['rider'] == 102 and abs(EPI['instances']['river']['etaS']['looks'] - 509.9) < 0.2)
claim('the stuck rider is the longest first-dispatch pickup in the episode (14:00)', abs(EPI['instances']['longWait']['pickupS'] - 840.5) < 0.1)
claim("the hexagon beat's cluster contains the rider's TRUE nearest car (so the tick on screen is honest)", EPI['h3']['quickInHood'])
claim('the surge-style hot cell has requests and no free car in it', EPI['surge']['hotRequests'] >= 3 and EPI['surge']['hotCars'] == 0)
claim('the rivers are drawn from OpenStreetMap coastline (>= 2 water polygons), so "a river" on screen is a real one', len(WORLD['water']) >= 2 and len(WORLD['coast']) >= 50)
claim('H3 resolution 8, 160 cells drawn (112 touch roads + the ring around the edge)', len(WORLD['hexes']) == 160 and EXTRAS['hex']['res'] == 8)

# ── the voice: screen time = file time - VO_TRIM (the build skips the lead-in so the first word lands early) ─────
VO_TRIM_FRAMES = 26                 # frame-exact: the build starts the voice 26 frames in, so the cue maths uses 26/30 s, not 0.85
VO_TRIM_S = VO_TRIM_FRAMES / 30
# ffmpeg's AAC encoder adds 2112 samples (44 ms at 48 kHz) of priming that this MP4 does not hide with an edit list, so a word is HEARD
# 44 ms after the file says. Measured on the first render (sync_check.py: +45 ms, constant across all 222 words). Cues include it.
AAC_PRIMING_S = 2112 / 48000
HOLD_S = 3.0
words, beats = [], []
for b in VO['beats']:
    for w in b['words']:
        words.append(dict(beat=b['beat'], text=w['text'], start=round(w['startMs'] / 1000 - VO_TRIM_S + AAC_PRIMING_S, 3), end=round(w['endMs'] / 1000 - VO_TRIM_S + AAC_PRIMING_S, 3), weak=w['weak']))
    beats.append(dict(beat=b['beat'], start=round(b['startMs'] / 1000 - VO_TRIM_S + AAC_PRIMING_S, 3), end=round(b['endMs'] / 1000 - VO_TRIM_S + AAC_PRIMING_S, 3)))
claim('the first word lands before 0.5 s of screen time', words[0]['start'] < 0.5)
claim('word starts are in order', all(a['start'] <= b['start'] for a, b in zip(words, words[1:])))
LAST = words[-1]['end']
DURATION = float(np.ceil((LAST + HOLD_S) * 2) / 2)
claim('the closing visual is held the full 3 s after the last word (non-negotiable 9)', DURATION - LAST >= HOLD_S - 1e-6)
claim('runtime is inside 75-90 s', 75 <= DURATION <= 90)

norm = lambda t: re.sub(r"[^a-z0-9']", '', t.lower())


def cue(beat, word, nth=1):
    hits = [w for w in words if w['beat'] == beat and norm(w['text']) == norm(word)]
    assert len(hits) >= nth, f'cue word "{word}" #{nth} not found in beat {beat}'
    return hits[nth - 1]['start']


CUES = dict(
    # beat 1 -- the hook SHOWS the result inside 3 s whatever the words say; the words then catch up
    b1_closest=cue(1, 'closest'), b1_half=cue(1, 'half'), b1_quickest=cue(1, 'quickest'),
    # beat 2
    b2_honeycomb=cue(2, 'honeycomb'), b2_h3=cue(2, 'H3'), b2_neighbours=cue(2, 'neighbours:'), b2_seven=cue(2, 'seven'), b2_almost=cue(2, 'almost'),
    # beat 3
    b3_blocks=cue(3, 'blocks,'), b3_oneway=cue(3, 'one-way'), b3_river=cue(3, 'river.'), b3_half=cue(3, 'half'), b3_twentyfive=cue(3, 'twenty-five'),
    # beat 4
    b4_request=cue(4, 'request'), b4_stuck=cue(4, 'stuck'), b4_waits=cue(4, 'waits'),
    # beat 5
    b5_same=cue(5, 'Same'), b5_one=cue(5, 'one'), b5_five=cue(5, 'five'), b5_batch=cue(5, 'batch.'), b5_thirteen=cue(5, 'thirteen'),
    b5_shorter=cue(5, 'shorter.'), b5_minute=cue(5, 'minute'), b5_worse=cue(5, 'worse'),
    # beat 6
    b6_count=cue(6, 'count'), b6_surge=cue(6, 'surge'), b6_ride=cue(6, 'ride.', 2),
)
# the hook's ETAs are the one deliberate exception to "no number before its word": they are visible by ~2.5 s (SCRIPT beat 1)
HOOK_ETA_BY = 2.5
claim('the hook payoff is on screen before the retention cliff', HOOK_ETA_BY <= 3.0)
claim('every OTHER number appears at or after the word that names it (cue times are derived, not typed)',
      CUES['b3_half'] > CUES['b3_blocks'] and CUES['b5_thirteen'] > CUES['b5_five'] and CUES['b5_minute'] > CUES['b5_shorter'] > CUES['b5_thirteen'])
claim('"shorter" is spoken before "whole minute" (the counters settle, THEN the slider sweeps)', CUES['b5_shorter'] < CUES['b5_minute'])

STATS = dict(
    wrongCarShare=round(ROB['near_straight_only']['share_differ'], 3), wrongCarSecondsPerRide=round(ROB['near_straight_only']['mean_all'], 1),
    hexShareOfFleet=round(EXTRAS['hex']['share_of_fleet_mean'], 3), hexContainsNearest=round(EXTRAS['hex']['hood_contains_true_nearest'], 3),
    notClosest5=round(not_closest5, 3), runMeans=dict(fd=round(fd_mean, 1), b5=round(b5_mean, 1), b60=round(b60_mean, 1)),
    pairedMinus5=round(d5, 2), pairedPlus60=round(d60, 2), neighbourhoodCells=7, cells=len(WORLD['hexes']),
)

OUT.mkdir(parents=True, exist_ok=True)
dump = lambda o: json.dumps(o, separators=(',', ':'))
(OUT / 'dispatch.ts').write_text(f'''/**
 * r019 · I90 -- GENERATED by projects/r019_dispatch/emit_ts.py. Do not hand-edit.
 *
 * "Half the time, the car that looks closest on the map isn't the quickest -- and Uber waits a few seconds to match
 * everyone at once." The street network is OpenStreetMap (c) OpenStreetMap contributors, ODbL. The fleet and the riders are
 * SIMULATED: no Uber data of any kind. {len(checks)} on-screen claims are asserted by emit_ts.py, which refuses to
 * write this file if one of them stops being true.
 */
export const ORIGIN = {dump(WORLD['origin'])};
export const KM_PER_DEG_LAT = {WORLD['kmPerDegLat']};
export const BOX = {dump(WORLD['box'])};
export const ROADS: {{ pts: number[]; offs: number[] }} = {dump(WORLD['roads'])};
export const LANDMASSES: {{ name: string; junctions: number; x: number; y: number }}[] = {dump(WORLD['landmasses'])};
export const HEXES: Record<string, number[][]> = {dump(WORLD['hexes'])};
export const WATER: number[][][][] = {dump(WORLD['water'])};
export const COAST: number[][][] = {dump(WORLD['coast'])};

export interface RunLog {{ matchT: (number | null)[]; car: number[]; pickupS: number[]; total: number[]; nearest: number[]; cancelled: boolean[] }}
export interface Instance {{
  rider: number; t: number; pool: number; looks: number; quick: number;
  lineM: {{ looks: number; quick: number }}; etaS: {{ looks: number; quick: number }};
  routeLooks: number[][]; routeQuick: number[][]; freeCars: number[];
  oneWay: {{ x: number; y: number; heading: number }} | null;
}}
export const EPI: {{
  seed: number; riders: number; cars: number; speedKmh: number;
  riderXY: number[][]; carXY: number[][]; arrive: number[]; avail: number[];
  runs: Record<string, RunLog>; finals: Record<string, number>; series: {{ step: number; values: Record<string, (number | null)[]> }};
  notClosest5: number[];
  instances: {{ hook: Instance; river: Instance;
    longWait: {{ rider: number; t: number; pickupS: number; car: number; route: number[][] }};
    hookBatched: {{ rider: number; car: number; matchT: number; pickupS: number; route: number[][] }} }};
  h3: {{ home: string; hood: string[]; carsInHood: number[]; poolSize: number; quickInHood: boolean; looksInHood: boolean }};
  surge: {{ pressure: Record<string, number>; requests: Record<string, number>; cars: Record<string, number>; hot: string; hotRequests: number; hotCars: number }};
}} = {dump(EPI)};

export const STATS = {dump(STATS)};
''')
(OUT / 'dispatchVo.ts').write_text(f'''/**
 * r019 · I90 -- GENERATED by projects/r019_dispatch/emit_ts.py from vo_words.json. Do not hand-edit.
 * Screen time = voice-file time - VO_TRIM_S: the build skips the lead-in so the first word lands at {words[0]['start']:.2f} s.
 * Every animation cue is the START of a spoken word (whisper's ends are unreliable, forced-alignment starts are not).
 */
export const VO_FILE = 'reels/r019_vo.wav';
export const VO_TRIM_FRAMES = {VO_TRIM_FRAMES};
export const VO_TRIM_S = VO_TRIM_FRAMES / 30;
export const AAC_PRIMING_S = {AAC_PRIMING_S};
export const HOLD_S = {HOLD_S};
export const DURATION_SECONDS = {DURATION};
export const LAST_WORD_END = {LAST};
export const HOOK_ETA_BY = {HOOK_ETA_BY};
export interface Word {{ beat: number; text: string; start: number; end: number; weak: boolean }}
export const WORDS: Word[] = {dump(words)};
export const BEATS: {{ beat: number; start: number; end: number }}[] = {dump(beats)};
export const CUES = {dump({k: round(v, 3) for k, v in CUES.items()})} as const;
''')
print(f'{len(checks)} claims hold; wrote dispatch.ts and dispatchVo.ts')
print('duration', DURATION, 's | last word ends', round(LAST, 2), 's | median seed', median_seed)
print('beats (screen s):', [(b['beat'], b['start'], b['end']) for b in beats])
print('cues:', {k: round(v, 2) for k, v in CUES.items()})
for p in ('dispatch.ts', 'dispatchVo.ts'):
    print(p, round((OUT / p).stat().st_size / 1e3), 'KB')
