#!/usr/bin/env python3
"""r020 · I91 — pack thermostat_data.json into a TS module, and REFUSE to write it if any claim the reel
makes on screen has stopped being true — at the SCREEN SECOND its words appear (the r011 rule).

    python3 thermostat.py && python3 emit_ts.py

The clock map (screen second -> simulated minute of the day) and every copy time are DEFINED HERE and
emitted into the module, so the claims below and Thermostat.tsx read the same constants — nothing is
mirrored by hand. Move a beat and this script refuses to regenerate until the script and the run agree.
"""
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parents[1] / "remotion" / "src" / "reels" / "data" / "thermostat.ts"
D = json.loads((HERE / "thermostat_data.json").read_text())
F, HP = D["furnace"], D["hp"]
checks = []


def claim(text, cond):
    assert cond, f"ON-SCREEN CLAIM IS FALSE: {text}"
    checks.append(text)


# ── the clock map: (screen second, simulated minute of the day, 0 = midnight). A jump is two points 1 ms apart.
CLOCK = [
    (0.0, 480), (5.0, 480),                    # 8:00 AM, everyone leaves; thermostat turns
    (11.0, 1440),                              # THE DAY IN SIX SECONDS, 8 AM -> midnight
    (14.0, 1440), (14.001, 1019),              # verdict held; clock jumps back to 4:59 PM for the camera drop
    (16.5, 1019), (19.0, 1020),                # 4:59 -> 5:00 PM: they are home
    (22.4, 1083),                              # slow motion: 5:00 -> 6:03 PM, the furnace flat out
    (23.5, 1083),
    (27.0, 1425),                              # fast-forward 6:03 -> 11:45 PM
    (31.5, 1440),                              # 11:45 PM -> midnight, the three-quarters line held
    (31.501, 480), (36.0, 927),                # leak replay, 8:00 AM -> 3:27 PM (the set-back air reaches 62°)
    (36.001, 1020), (39.0, 1080), (40.0, 1080),  # heat-pump replay, 5:00 -> 6:00 PM, then held
]
DURATION = 40.0

# ── copy windows (screen seconds), the contract in SCRIPT.md
COPY = dict(
    hook=(0.0, 2.5), same=(2.5, 5.0), labels=(2.7, 14.0), verdict=(11.0, 14.0), question=(14.0, 16.5),
    home=(16.5, 19.0), flat1=(19.0, 23.5), flat2=(22.3, 23.5), threeq=(27.0, 31.5), leak=(31.5, 36.0), hp=(36.0, 40.0),
)


def sim(s):
    """Simulated minute at screen second s (piecewise linear; a 1 ms pair is a jump)."""
    if s <= CLOCK[0][0]:
        return CLOCK[0][1]
    for (s0, m0), (s1, m1) in zip(CLOCK, CLOCK[1:]):
        if s0 <= s <= s1:
            return m0 + (m1 - m0) * ((s - s0) / (s1 - s0) if s1 > s0 else 1.0)
    return CLOCK[-1][1]


def at(series, s):
    return series[min(1439, max(0, int(sim(s)) - 1))]


hold, back = F["hold"], F["back"]
CAP = D["cap"]
lead = [h - b for h, b in zip(hold["gas"], back["gas"])]

# 1 · "THE 62° HOUSE USED 9% LESS GAS" — read at the minute the clock reaches midnight
v0 = COPY["verdict"][0]
claim("the clock reads midnight when the verdict words appear", sim(v0) >= 1439)
claim('"9% LESS GAS": the held meter reads 100% and the set-back meter reads 91.3% at that moment',
      abs(at(hold["gas"], v0) - 100.0) < 0.01 and abs(at(back["gas"], v0) - 91.34) < 0.05)
claim('"9%" is 100 minus the set-back meter, rounded', round(100.0 - at(back["gas"], v0)) == 9)
claim("the verdict is on screen by 14 s — inside the account's ~17 s average watch", v0 + 3.0 <= 14.0)
claim("the meters are on one ruler: both are a share of the HELD house's whole day (held ends at exactly 100)",
      abs(hold["gas"][-1] - 100.0) < 1e-6)

# 2 · "SAME 37° OUTSIDE"
claim('"37° OUTSIDE" is the day\'s mean outdoor temperature, rounded', round(D["outdoor"]["mean"]) == 37)

# 3 · the two thermostats
Tb = back["Ta"]
t62 = next(i for i, x in enumerate(Tb) if x <= 62.0 + 1e-3)
claim('"DROPS TO 62°": the set-back air actually reaches 62.0° — and before anyone is home',
      min(Tb) > 61.99 and t62 < 1020)
claim("the set-back air reaches 62° at 3:27 PM (minute 927), the end of the leak replay", abs(t62 - 927) <= 1)
claim('"HOLDS 70°": the held house never leaves 70° and both houses end the day at 70.0°',
      min(hold["Ta"][480:]) > 69.99 and abs(hold["Ta"][-1] - 70.0) < 0.05 and abs(Tb[-1] - 70.0) < 0.05)

# 4 · the roar: "THE FURNACE GOES FLAT OUT" … "FOR 1 HOUR."
flat = [i for i in range(1020, 1440) if back["q"][i] >= CAP * 0.999]
claim("the furnace goes flat out at 5:00 PM and stays flat out contiguously",
      flat[0] == 1020 and flat == list(range(1020, 1020 + len(flat))))
claim('"FOR 1 HOUR": 1.03 h at full output (between 45 and 75 minutes)', 45 <= len(flat) <= 75)
t70 = next(i for i in range(1020, 1440) if Tb[i] >= 70.0 - 1e-3)
claim("the air is back to 70° when the flat-out hour ends, matching the clock map (6:03 PM = minute 1083)",
      abs(t70 - 1083) <= 2 and abs((flat[-1] + 1) - 1083) <= 2)
claim('"FOR 1 HOUR." does not appear before the on-screen clock passes 6:00 PM', sim(COPY["flat2"][0]) >= 1080)
claim('"THE FURNACE GOES FLAT OUT" appears no earlier than the moment it does', sim(COPY["flat1"][0]) >= 1020)
claim("the held house's furnace never goes flat out in the evening (it is the contrast)",
      max(hold["q"][1020:]) < CAP * 0.5)

# 5 · the meters during the roar: 38% -> 57% against 70% -> 75%, the gap closing 32 -> 18
m5, m6 = 1019, 1079
claim('"38% → 57%": the set-back meter climbs from 38 to 57 between 5 and 6 PM',
      round(back["gas"][m5]) == 38 and round(back["gas"][m6]) == 57)
claim('"70% → 75%": the held meter climbs from 70 to 75 between 5 and 6 PM',
      round(hold["gas"][m5]) == 70 and round(hold["gas"][m6]) == 75)
claim("the gap closes from 32 to 18 points in that hour", round(lead[m5]) == 32 and round(lead[m6]) == 18)
claim("the needle LEAPS at 5 PM: the set-back meter gains more than 15 points in one hour",
      back["gas"][m6] - back["gas"][m5] > 15)

# 6 · "THE RE-HEAT TAKES BACK ABOUT ¾ OF WHAT IT SAVED — NOT ALL"
gb = [1 - lead[i] / lead[m5] for i in range(1440)]
gb72 = next(i for i in range(1020, 1440) if gb[i] >= 0.72)
q0 = COPY["threeq"][0]
claim("the lead at 5 PM is 32 points and at midnight 9 points", round(lead[m5]) == 32 and round(lead[-1]) == 9)
claim('"ABOUT ¾": 72.9% of the 5 PM lead has been given back by midnight (70–80%)', 0.70 <= gb[-1] <= 0.80)
claim('"NOT ALL": the set-back house is still ahead at midnight', lead[-1] > 5.0)
claim('"TAKES BACK ABOUT ¾" does not appear before the on-screen give-back reaches 72% (23:39)',
      sim(q0) >= gb72 and gb[int(sim(q0)) - 1] >= 0.72)
claim("the lead narrows and STOPS: it never goes negative and is still falling-then-flat at midnight",
      min(lead[1020:]) > 0 and abs(lead[-1] - lead[-30]) < 0.5)

# 7 · "A COOLER HOUSE LEAKS LESS HEAT" — and the leak replay is computed, not drawn
tot_leak = lambda h: sum(h["leak"]) / 60.0
less = 1 - tot_leak(back) / tot_leak(hold)
claim('"A COOLER HOUSE LEAKS LESS HEAT": the set-back day leaked 6.7% less heat (6.0–7.5%)', 0.060 <= less <= 0.075)
claim("during the replay the set-back house's leak FALLS as its air cools, and ends below the held house's",
      back["leak"][927] < back["leak"][480] and back["leak"][927] < hold["leak"][927])
claim("over the working day the held house's leak varies by under a quarter (outdoor temperature alone) while the set-back house's falls by more than 10%",
      (max(hold["leak"][480:1020]) - min(hold["leak"][480:1020])) / max(hold["leak"][480:1020]) < 0.25
      and (back["leak"][480] - back["leak"][927]) / back["leak"][480] > 0.10)

# 8 · "HEAT PUMP? A BIG DROP CAN COST MORE" — an ASSUMED model, tagged SIMULATED on screen
hp8 = next(r for r in D["stage3"]["hp"] if r["depth_F"] == 8)
claim('"A BIG DROP CAN COST MORE": the 8°F heat-pump setback costs MORE over a year and on the median day',
      hp8["annual"] < 0 and hp8["median_day"] < 0)
claim("the backup strip is DARK in the held house and blazing in the set-back one during 5–6 PM",
      max(HP["hold"]["aux"][1020:1080]) < 1.0 and max(HP["back"]["aux"][1020:1080]) > 30000)
aux_min = sum(1 for x in HP["back"]["aux"][1020:1080] if x > 1000)
claim("the strip is lit for at least 1.5 s of screen time (the replay runs 60 minutes in 3.0 s)", aux_min / 60.0 * 3.0 >= 1.5)
claim("the heat-pump replay starts at 5 PM and ends at 6 PM, where the backup strip fires", sim(COPY["hp"][0] + 0.002) >= 1020 and sim(COPY["hp"][1]) <= 1080)

# 9 · the structure of the reel
claim("runtime is 40.0 s with no close (owner's waiver of non-negotiable 9, 2026-10-06)", DURATION == 40.0 and COPY["hp"][1] == DURATION)
claim("the 5 PM door opens inside the time-lapse: 5 PM falls between 5 s and 11 s of screen time",
      5.0 < next(s / 100 for s in range(500, 1100) if sim(s / 100) >= 1020) < 11.0)

ts = f"""// GENERATED by projects/r020_thermostat/emit_ts.py — never hand-edited.
// {len(checks)} on-screen claims asserted at the screen second their words appear.
export const DURATION = {DURATION};
/** screen second -> simulated minute of the day (0 = midnight). A 1 ms pair is a jump. */
export const CLOCK: [number, number][] = {json.dumps([list(p) for p in CLOCK])};
export const COPY = {json.dumps({k: list(v) for k, v in COPY.items()})} as Record<string, [number, number]>;
export const CAP = {CAP};
export const FACTS = {json.dumps(dict(verdictPct=9, outdoor=round(D['outdoor']['mean']), lead5=round(lead[m5]), leadMid=round(lead[-1]), t62=t62))};
export const DAY = {json.dumps(dict(hold={k: hold[k] for k in ('Ta', 'Tm', 'q', 'leak', 'gas')}, back={k: back[k] for k in ('Ta', 'Tm', 'q', 'leak', 'gas')}, To=D['To']))};
export const HP = {json.dumps(dict(hold=dict(Ta=HP['hold']['Ta'], aux=HP['hold']['aux']), back=dict(Ta=HP['back']['Ta'], aux=HP['back']['aux'])))};
"""
OUT.write_text(ts)
print(f"{len(checks)} claims asserted. wrote {OUT.relative_to(HERE.parents[1])}  ({round(OUT.stat().st_size / 1024)} KB)")
for c in checks:
    print("  ✓", c)
