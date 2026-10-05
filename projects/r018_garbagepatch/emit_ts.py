#!/usr/bin/env python3
"""r018 · I87 — pack pacific.json into a TS module, and REFUSE to write it if any claim the reel
makes on screen has stopped being true.

    python3 pacific.py && python3 emit_ts.py

Beat and copy times below MUST match remotion/src/reels/GarbagePatch.tsx. Per the r011 rule, a
claim is checked at the SCREEN SECOND its words appear, not merely somewhere in the data.
"""
import json
import math
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parents[1] / "remotion" / "src" / "reels" / "data" / "garbagepatch.ts"
J = json.loads((HERE / "pacific.json").read_text())
B, W, P, PATCH = J["buoy"], J["witnesses"], J["particles"], J["patch"]
checks = []


def claim(text, cond):
    assert cond, f"ON-SCREEN CLAIM IS FALSE: {text}"
    checks.append(text)


def gc_km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371.0088 * math.asin(math.sqrt(h))


# ── beats and copy times, must match GarbagePatch.tsx ────────────────────────────────────
BEAT = dict(hook=(0.0, 5.0), island=(5.0, 11.0), buoy=(11.0, 20.0), pile=(20.0, 28.0),
            payoff=(28.0, 36.0), close=(36.0, 42.0))
COPY_HOOK_B = 2.0                       # "IS ONE THING: FISHING NETS."
COPY_DROPPED = (13.4, 16.6)             # "DROPPED OFF TAIWAN IN 2019."
COPY_HERE = (16.6, 20.0)                # "4½ YEARS LATER, IT WAS HERE."
BUOY_RUN = (13.4, 16.4)                 # screen seconds over which the buoy covers deploy -> arrival
BUOY_TAIL = (16.4, 19.6)                # ... and arrival -> last fix
COPY_OTHERS = (20.0, 22.6)              # "HUNDREDS OF OTHERS DID THE SAME."
PART_RUN = (22.4, 26.8)                 # particle steps 0 -> STEPS
COPY_SCATTER = (22.6, 25.4)             # "SCATTER DEBRIS ... LET THE REAL CURRENTS CARRY IT…"
COPY_PILES = (25.4, 28.0)               # "…AND IT PILES UP IN ONE PLACE."
PATCH_ON = 26.2                         # Lebreton's patch circle fades in
COPY_HALF = (30.4, 36.0)                # "ALMOST HALF OF IT, BY WEIGHT, IS FISHING NETS."

NETS_PCT = 46                           # Lebreton et al. 2018: "at least 46%" of mass
SURVEY_YEAR = 2015
TILT_PER_SHARE = 0.6                    # rad of beam tilt per unit of (right - left) / total


def buoy_day_at(s):
    if s <= BUOY_RUN[0]:
        return 0.0
    if s <= BUOY_RUN[1]:
        return B["arriveDay"] * (s - BUOY_RUN[0]) / (BUOY_RUN[1] - BUOY_RUN[0])
    k = min(1.0, (s - BUOY_TAIL[0]) / (BUOY_TAIL[1] - BUOY_TAIL[0]))
    return B["arriveDay"] + (B["lastDay"] - B["arriveDay"]) * max(0.0, k)


def part_step_at(s):
    k = (s - PART_RUN[0]) / (PART_RUN[1] - PART_RUN[0])
    return max(0.0, min(1.0, k)) * P["steps"]


def box_share(step):
    i = int(step)
    inbox = alive = 0
    for p in range(P["n"]):
        d = P["death"][p]
        if d != -1 and d <= i:
            continue
        alive += 1
        la = P["lat"][i][p] / 100
        lo = P["lon"][i][p] / 100 + 180
        inbox += 200 <= lo <= 240 and 20 <= la <= 45
    return inbox / alive


# 1 · the one ruler
claim('"ALMOST HALF" is honest for Lebreton\'s "at least 46%" (40-50, and not "most")', 40 <= NETS_PCT < 50)
tilt = TILT_PER_SHARE * ((100 - NETS_PCT) - NETS_PCT) / 100
claim(f"the scale tips toward EVERYTHING ELSE (54 > 46): beam tilt {tilt:.3f} rad, computed, not drawn",
      tilt > 0)
claim('"MEASURED 2015" is the vessel survey year', SURVEY_YEAR == 2015)

# 2 · one real buoy
claim(f'"DROPPED OFF TAIWAN IN 2019": buoy {B["id"]} deployed {B["deployed"]} by {B["country"]}',
      B["deployed"].startswith("2019") and "Taiwan" in B["country"])
start = B["pts"][0]
km_taiwan = gc_km((start[1], start[2]), (21.90, 120.85))      # Eluanbi, Taiwan's southern tip
claim(f'"OFF TAIWAN": deployed {km_taiwan:.0f} km from Taiwan\'s southern tip', km_taiwan < 150)
claim(f'"4½ YEARS LATER": {B["years"]:.2f} years, deploy to first fix within 500 km of 32N 145W',
      abs(B["years"] - 4.5) < 0.1)
claim('"IT WAS HERE" appears only once the buoy marker has reached the patch on screen',
      buoy_day_at(COPY_HERE[0]) >= B["arriveDay"] and BUOY_RUN[1] <= COPY_HERE[0])
claim('the marker does not reach the patch while "DROPPED OFF TAIWAN" is still the copy',
      buoy_day_at(COPY_DROPPED[1] - 0.25) < B["arriveDay"])
claim('the copy never says it STAYED: the track ends at its real last fix, not in the centre',
      B["lastDay"] - B["arriveDay"] < 60)

# 3 · hundreds of others
claim(f'"HUNDREDS OF OTHERS": {W["total"] - 1} other drifters reached within 500 km', W["total"] - 1 >= 200)
claim(f'the drawn tracks are real witnesses that started > 2,500 km away ({len(W["drawn"])} drawn of {W["far"]})',
      len(W["drawn"]) <= W["far"] and all(gc_km(w["pts"][0], (32, 215)) > 2500 for w in W["drawn"]))

# 4 · it piles up
share0 = box_share(0)
share_at_copy = box_share(part_step_at(COPY_PILES[0]))
claim(f'"SCATTER DEBRIS ACROSS THE WHOLE OCEAN": at step 0 the patch box holds {share0:.1%}, '
      f'about its area share ({P["boxAreaShare"]:.1%})', abs(share0 - P["boxAreaShare"]) < 0.04)
claim(f'"…AND IT PILES UP IN ONE PLACE": when the words appear the box holds {share_at_copy:.0%} '
      f'(>= 3x its area share)', share_at_copy >= 3 * P["boxAreaShare"])
claim(f'the densest spot the particles reach is {P["peakKm"]} km from the measured centre (< 500 km)',
      P["peakKm"] < 500)
claim("the patch circle is drawn at Lebreton's measured centre, 32N 145W, never snapped to the pile",
      (PATCH["lat"], PATCH["lon"]) == (32.0, 215.0))
claim("the patch circle appears while the pile is already forming, after the particles start",
      PART_RUN[0] < PATCH_ON < PART_RUN[1])

# 5 · copy order
claim("the hook's claim is complete inside 3 s", COPY_HOOK_B <= 3.0)
claim("no beat overlaps the next", all(BEAT[a][1] <= BEAT[b][0] for a, b in
                                        zip(list(BEAT)[:-1], list(BEAT)[1:])))


# ── write ─────────────────────────────────────────────────────────────────────────────────
def flat(rows):
    return [v for r in rows for v in r]


ts = f"""// GENERATED by projects/r018_garbagepatch/emit_ts.py — never hand-edit.
// {len(checks)} on-screen claims asserted before this file was written.

export const BEAT = {json.dumps(BEAT)} as const;
export const COPY_HOOK_B = {COPY_HOOK_B};
export const COPY_DROPPED = {json.dumps(COPY_DROPPED)} as const;
export const COPY_HERE = {json.dumps(COPY_HERE)} as const;
export const BUOY_RUN = {json.dumps(BUOY_RUN)} as const;
export const BUOY_TAIL = {json.dumps(BUOY_TAIL)} as const;
export const COPY_OTHERS = {json.dumps(COPY_OTHERS)} as const;
export const PART_RUN = {json.dumps(PART_RUN)} as const;
export const COPY_SCATTER = {json.dumps(COPY_SCATTER)} as const;
export const COPY_PILES = {json.dumps(COPY_PILES)} as const;
export const PATCH_ON = {PATCH_ON};
export const COPY_HALF = {json.dumps(COPY_HALF)} as const;
export const NETS_PCT = {NETS_PCT};
export const SURVEY_YEAR = {SURVEY_YEAR};
export const BEAM_TILT = {tilt:.5f};

/** Natural Earth 1:50m land outlines in the view, [lat, lon 0..360]. */
export const COAST: readonly (readonly (readonly [number, number])[])[] = {json.dumps(J["coast"])};

/** NOAA GDP buoy {B["id"]}: flat [day, lat, lon360, ...]. */
export const BUOY = {{
  id: '{B["id"]}',
  deployed: '{B["deployed"]}',
  arrived: '{B["arrived"]}',
  arriveDay: {B["arriveDay"]},
  lastDay: {B["lastDay"]},
  pts: {json.dumps(flat(B["pts"]))} as readonly number[],
}};

/** Other real drifters that reached the patch from > 2,500 km: flat [lat, lon360, ...] each. */
export const WITNESSES: readonly (readonly number[])[] = {json.dumps([flat(w["pts"]) for w in W["drawn"]])};

/** {P["n"]} particles x {P["steps"] + 1} steps of {P["dtDays"]} days on the drifter transition model.
 *  lat in centi-degrees; lon as centi-degrees of (lon360 - 180). death = step it beached, -1 never. */
export const PARTICLES = {{
  n: {P["n"]},
  steps: {P["steps"]},
  death: {json.dumps(P["death"])} as readonly number[],
  lat: {json.dumps(flat(P["lat"]))} as readonly number[],
  lon: {json.dumps(flat(P["lon"]))} as readonly number[],
}};

/** Lebreton et al. 2018: measured centre and area. Drawn as a circle of that area — shape NOT claimed. */
export const PATCH = {json.dumps(dict(lat=PATCH["lat"], lon=PATCH["lon"], radiusDeg=PATCH["radiusDeg"]))} as const;
"""
OUT.write_text(ts)
for c in checks:
    print("  ✓", c)
print(f"{len(checks)} claims hold · wrote {OUT.relative_to(HERE.parents[1])} ({OUT.stat().st_size // 1024} KB)")
