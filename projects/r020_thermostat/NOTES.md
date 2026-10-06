# NOTES — `I91`, the thermostat. Stage 3 record, 2026-10-06

Rules fixed in advance: [`PREREG.md`](PREREG.md) (one amendment, logged). Model: [`house.py`](house.py).
Driver: [`stage3.py`](stage3.py) (≈ 54 s). Raw output: [`results/stage3_run2.txt`](results/stage3_run2.txt);
the first run, which stopped on an assertion, is kept in `results/stage3_run1.txt`. Beat timings:
[`moments.py`](moments.py) → `results/moments.json`. The G4 script awaiting approval:
[`SCRIPT.md`](SCRIPT.md). **No `.tsx`, no data module, no `emit_ts.py` exists.**

## 0. Verdicts, in one table

| Rule (PREREG §5) | Result | Verdict |
|:--|:--|:--|
| **K1** — a setback day uses less gas, like for like | 243 of 243 simulated houses; the baseline house **7.9%** (stored-heat-neutral) | **PASS** |
| **K2** — saving ≥ 3% on the median day | baseline **7.9%**; **240 of 243** houses ≥ 3% (the other three: 2.7%) | **PASS** |
| **K3** — saving rises with depth and with absence | 243 of 243 | **PASS** |
| **K4** — annual 8 °F / 9 h saving in 3–15% | **5.0%** weekday-weighted (7.0% if occupants were out all 365 days) | **PASS** — low-to-mid in the band, not flattering |
| **K5** — the AC clause ships only if the model reproduces the published ordering | (i) 8 h off saves in **every** configuration: **FAIL** — 22 of 243 variable-speed houses do not. (ii) 4 h is mixed: PASS | **FAIL → the AC clause is DROPPED** |
| **K6** — heat-pump scope | an 8 °F setback **costs 1.4% MORE** over a year; 2 °F saves 1.2% | measured; decides the scope line |

## 1. Heating — the lead case (Greensboro NC TMY3, gas furnace, 70 °F held vs 62 °F while away 8–5)

| | held | set back | |
|:--|--:|--:|:--|
| Annual gas, every day | 459.1 therms | 427.2 | −7.0% (upper bound: nobody home at weekends either) |
| **Annual gas, 5/7 weekdays set back** | 459.1 | 436.3 | **−5.0%** — PREREG §4's annual figure |
| **Median Dec–Feb day** (day 364 = 31 Dec, daily-mean 37.4 °F, 36–43 °F) | **3.48 therms** | **3.18** | raw **−8.7%**, stored-heat-neutral **−7.9%** |

**On the meter that day (the numbers the reel can show — all from `moments.py`, 1-minute run):**

| time | held | set back | lead |
|:--|--:|--:|--:|
| 8 AM (everyone leaves) | 32.8% of the day's gas | 35.9% | −3.1 (still re-warming from yesterday) |
| 12 PM | 49.9% | 35.9% | 14.0 |
| **5 PM (they get home)** | **70.5%** | **38.5%** | **32.0** |
| 6 PM | 74.6% | 56.6% | 18.0 |
| 8 PM | 83.0% | 69.6% | 13.5 |
| **midnight** | **100%** | **91.3%** | **8.7** |

- The set-back house's **air** reaches 62 °F at **15:27** — **7.5 hours** after everyone leaves. It used
  almost no gas over 8–5 (1.6% average duty).
- At 5 PM the furnace runs **flat out for 1.03 hours**, and the air is back to 70 °F by **18:03**.
  **Not "hours".** The toy model in Gate 0 said 3.2 h; it was wrong, and the still's caption is retired.
- **Where the day's saving goes.** The house burns **122,234 BTU less while away**, then **81,296 BTU
  more after 5 PM** and **10,746 BTU more before 8 AM** (still re-warming from yesterday) — together
  **92,042 BTU, 75% of the saving, given back.** The meter's lead at 5 PM was 111,488 BTU; by midnight
  30,192 BTU of it remained. **The re-heat takes back about three-quarters of what was saved, and
  stops there.** That is the honest answer to "it costs more to heat it back up": it costs *most* of
  what you saved, not more.
- **Mechanism, measured:** the set-back day leaked **6.7% less heat** through walls and air changes
  (395,063 → 368,445 BTU). The furnace delivered 8.7% less.
- **Time step:** 3-minute and 1-minute runs agree on the median-day saving (7.86% vs 7.85%).

## 2. The sweep — 243 houses, reported as counts (PREREG §5)

`UA_env` ×{0.6, 1, 1.5} · thermal mass ×{0.5, 1, 2} · furnace capacity ×{0.7, 1, 1.5} · ACH
{0.2, 0.35, 0.6} · solar aperture {1.5, 3, 6}. Every day stationary: 243 of 243.

| Setback | min | **median** | max |
|:--|--:|--:|--:|
| 4 °F, 9 h | 2.7% | **4.9%** | 5.6% |
| **8 °F, 9 h** | 2.7% | **7.7%** | 10.3% |
| 15 °F, 9 h | 2.7% | **7.8%** | 16.8% |
| 8 °F, **4 h** | 0.5% | **2.0%** | 4.2% |
| 8 °F, **2 h** | 0.2% | **0.7%** | 1.9% |

**Two things worth knowing that the sentence depends on.** (1) **"All day" is load-bearing:** a 4-hour
absence saves a median 2.0%, a 2-hour one 0.7% — close to nothing. (2) **A deeper setback buys almost
nothing** (15 °F: median 7.8% vs 8 °F: 7.7%) because most houses never fall that far in 9 hours — the
structure's time constant is longer than a working day. **Easing off 8 °F gets nearly all of it.**

## 3. Heat pump, heating — an assumed model, not a measurement

COP, capacity and the 1.5 °F auxiliary trigger are the PREREG §3 placeholders; the result is only as
good as those.

| Setback | annual saving | median day | coldest Jan–Feb day | annual aux strip |
|:--|--:|--:|--:|--:|
| held | — | — | — | 122 kWh |
| 2 °F | +1.2% | +1.1% | +1.5% | 193 kWh |
| 4 °F | +0.4% | +0.2% | +0.9% | 391 kWh |
| **8 °F** | **−1.4%** | **−3.6%** | −1.0% | **698 kWh** |

**An 8 °F setback on a heat pump costs more than holding the temperature**, and the backup strip burns
5.7× the electricity. This matches what the trade and extension sources say (deep setbacks erase the
saving) but **no primary source has been read**, so the on-screen line is worded "can", tagged
SIMULATED, and says nothing about how many homes have a heat pump (not sourced).

## 4. Cooling mirror — Miami FL TMY2, AC off while away (K5)

Median Jun–Aug day: day 237, daily-mean 82.2 °F. AC off 8–5:

| Unit | held | off | saving (amended rule) | flat out after 5 PM | house peaks |
|:--|--:|--:|--:|--:|--:|
| single-speed | 15.54 kWh | 13.79 | **11.9%** | 1.4 h | 81.7 °F |
| variable-speed | 13.47 kWh | 12.56 | **7.6%** | 1.4 h | 81.7 °F |

(The "83 °F while away" case is identical to "off": the house never reaches 83 °F.)

Sweep, 243 houses × 2 unit types, absences of exactly 8 h and 4 h as in the CU Boulder test:

| | AC off 8 h saves | AC off 4 h ≤ 2% or negative |
|:--|--:|--:|
| single-speed | **243 of 243** (min 3.0%, median 9.8%) | 23 of 243 (median 4.0%) |
| variable-speed | **221 of 243** (**min −1.3%**, median 5.4%) | **150 of 243** (median 1.2%) |

**K5(i) fails** — and it fails in the direction the literature points ("heat pumps and minisplits save
less"), but the published simulation says 8 h saves for *every* system type and this model does not
reproduce that. **Under the pre-registered rule the AC clause is dropped; it is not argued back in.**
It is a finding in its own right (§7).

## 5. The pre-registration defect, and what it moved

PREREG §4 compared the two runs' END states. That assumes they start the day identically; the
continuous runs do not. **The rule fired on the headline day** (structure 63.30 vs 61.95 °F at midnight,
a 5.7% correction) and cut the saving from 8.7% to 3.0% — borderline on K2. The amended rule
(**AMENDMENT 1**, appended, original text untouched) makes each day stored-heat-neutral on its own.
**Both numbers are reported every time; K1–K5 are evaluated on the amended one.** If the original
rule is the reader's preference the median-day saving is 3.0% — still ≥ 3% but only just — and the
annual figure (5.0%), which does not depend on either rule, is the number to trust.

## 6. Bugs found, and what found them

| Bug | Effect | Found by |
|:--|:--|:--|
| Gate 0 toy heating model: furnace held the setback target while the house was still above it | saving 2% instead of 6.6% | **an outside number** (DOE and the Canadian test said 7–21%); every assertion passed with the bug in place |
| PREREG §4 like-for-like rule mis-specified (above) | raw 8.7% vs rule 3.0% vs amended 7.9% | the rule firing on its own headline day |
| Gate 0 sketch: 3.2 h "flat out" | actual **1.0 h** | the real model; the toy had no structure node |

**What `check_invariants`-style checks DID establish:** energy closes to 1.5 × 10⁻⁵ over a year; the
integrator matches the closed-form exponential to 0.001 °F; every compared pair ended with the air node
at 70.00 °F. **None of that says the model is unbiased.** The model's direction is *conservative* in
heating (5.0% annual is below DOE's ≈ 8% rule and well below the Canadian test's 10–13%), which is the
safe side, but it has not been checked against a primary measurement.

## 7. What the owner should know — beyond this reel

- **A better reel may be hiding in the AC result.** *"Turning the AC off isn't always free — on a
  variable-speed unit it can cost you."* 22 of 243 simulated variable-speed houses lose over an 8-hour
  absence, and a 4-hour absence is a coin-flip for them. It is surprising, it is true to the model, it
  cuts against the thing everyone is told — and it is **not** verified (no primary read, placeholder
  part-load curve). Logged as a lead, not a candidate.
- **The effect is small, in every version.** 7.9% of one cold day's gas; 5.0% across a winter of
  weekdays. **No price is fixed** (the EIA host is refused), so there is no dollar figure — and at any
  plausible US gas price it is tens of cents a day. The reel corrects a belief; it does not save a
  household money worth chasing.

## 8. Sources — every one read through summaries only

| Claim | Source | Status |
|:--|:--|:--|
| Weather | NREL TMY3 723170 Greensboro, TMY2 12839 Miami — **in the `pvlib` wheel, read directly** | read, public data |
| "as much as 10% / ~1% per degree for 8 h" | energy.gov *Thermostats*; NDSU Extension 2008 | **unread at the primary** |
| Canadian twin-house test, 11 °F → 13% gas | CMHC report 63816 (CCHT) | **unread** — host refused |
| CU Boulder 2022: 8 h off saves, 4 h mixed | Baker, Scheib & Pigott | **unread** — host refused |
| 2,658-home programmable-thermostat study ≈ 6% | unidentified | **not citable** |

**Hosts this container refuses, which an owner can allow** (environment settings → Network access →
Custom → Allowed domains): `www.energy.gov`, `assets.cmhc-schl.gc.ca`, `www.colorado.edu`, `www.eia.gov`,
and, if a real-city weather file is ever wanted, `archive-api.open-meteo.com`. **Nothing on screen may
say "a study found" until those primaries are read.** The script as written says none.

## 9. NOT claimed

Not a saving for any real household (weekends, habits, equipment age, thermal mass, windows and
infiltration all vary; the 5/7 weighting is a stated simplification). Not that the AC version saves.
Not that a heat pump behaves as modelled. Not any dollar figure. Not that this reproduces, or
validates, the Canadian or CU Boulder results — it is checked against their *headline direction* only.

## 10. Build record, 2026-10-06

**Pipeline (all in this folder; nothing recalled, every figure printed by a script):**

| Step | File | What it does |
|:--|:--|:--|
| weather | `extract_weather.py` → `data/*.csv` | NREL typical-year files from the `pvlib` wheel (the only reachable source) |
| model | `house.py` | two-node RC house; furnace, AC and heat-pump control; energy closes to 1.5 × 10⁻⁵ |
| Stage 3 | `stage3.py` → `results/stage3_results.json` | the pre-registered runs, K1–K6, the 243-house sweep |
| beat timings | `moments.py` → `results/moments.json` | the numbers the script quotes |
| the compute | `thermostat.py` → `thermostat_data.json` | the median day at 1-minute resolution, both houses, furnace and heat pump |
| the claims | `emit_ts.py` → `remotion/src/reels/data/thermostat.ts` | **33 on-screen claims asserted at the screen second their words appear**; the clock map and every copy time are defined here and emitted, not mirrored |
| the reel | `remotion/src/reels/Thermostat.tsx` | 3D (`@remotion/three`); registered with a `-safe` variant in `Root.tsx` |

**What is computed per frame, not drawn:** air colour (62 °F blue → 70 °F copper, a computed `rgb()` ramp),
furnace flame height and smoke rate (furnace output ÷ capacity), the two meter needles (cumulative gas as a
share of the held house's day), the leak arrows' thickness (the model's heat flow that minute) with a
reference ring at the held house's thickness, and the heat pump's backup-strip brightness (the computed
resistance-strip power).

**Build traps — each cost a render, recorded so the next one does not:**

1. **The first still showed a label running past the safe edge (x ≈ 900).** A label projected onto a dial
   inherits the dial's position, and the right-hand house's dial is already near the rail. Labels now ride
   above the roof. *Found only by looking at a still; nothing automated checks an HTML overlay's position
   against the safe area until the safe audit runs on the mp4.*
2. **A big translucent "ground slab" looked fine in the wide shot and rendered as a hard diagonal wall in
   the close-up.** Removed; each house has its own thin snow pad.
3. **The heat-pump strip was invisible at first** — drawn on a tiny outdoor unit at wide scale, lit for
   1.5 s. The beat's whole claim rested on something nobody could see. It was fixed by moving the strip
   to the indoor air handler (where it physically is), going house-scale, and slowing the replay.
4. **Leak arrows first pointed the left house's heat into the right-hand house.** The wall arrow had
   a fixed direction for both; it now depends on the side.
5. **Copy checked against the clock, not against the data:** the draft named "1 HOUR" at 5:00 PM, an
   hour before it was true. `emit_ts.py` now refuses to write if "FOR 1 HOUR." could appear before the
   on-screen clock passes 6:00 PM, or the ¾ line before the give-back reaches 72%.
6. **Brand floor of 36 px hit five overlay strings** (the meter label, thermostat labels, the lead line,
   the tag and the credit). The credit became two lines. *A credit that must be legible costs 80 px of
   the safe area.*
7. **A claim whose text said "within 10%" while its check allowed 25%** passed silently until it was
   re-read. The text now says what the check checks.
8. **The container refused one shell command** (`rm -f` on a variable path). The scratch folders were
   simply not reused; nothing was deleted.

## 11. Validation of the render — 2026-10-06, `r020_thermostat.mp4` (version 6)

1080×1920, 30 fps, **1,200 frames, 40.000 s**, 16.0 MB, silent. Rendered in this container (headless chromium,
`angle`); `remotion render r020-thermostat … --browser-executable=…/headless_shell`.

| Check | Result |
|:--|:--|
| `tsc --noEmit` · `brand:check` · `eslint` | clean (min font 36 px; 12 colours) |
| `emit_ts.py` | **33 claims asserted** at the screen second their words appear |
| `reel_motion_audit.py` (default width 240) | **PASS** — median change 0.88, longest dead spell 0.00 s (limit 1.5 s), **event density 41%** |
| `reel_safe_audit.py` on the mp4 (every frame) | **PASS**, no `--bleed` used — worst extent **x 68..856, y 296..1528** inside x 60..870 / y 270..1540 |
| Stricter 2× re-check (own script, 540 px frames) | **0 of 1,200 frames** outside; extent x 64..857, y 298..1527 |
| The last caption holds to the final frame | yes — caption-band brightness 44.8 at the last frame against 45.6 at 38 s |

**Per-beat motion (4 fps, width 240, change ≥ 1.0 = an event).** No beat is dead (every median ≥ 0.58 against the 0.35
floor). **The weakest are the hold phases, on ambient motion only — snow, the orbit, easing needles:** the ¾ hold
(27.0–31.5 s) **17%**, the setup (2.5–5.0 s) **20%**, the heat-pump beat **20%**, the verdict hold **25%**. The strongest are
the drop (14.0–16.5 s) 80% and the fast-forward (23.5–27.0 s) 100%. **Global 41% sits between r017 (32%) and r016 (85%).**
Flag for GATE 5: the three low holds are where the eye is asked to read, which is what the hold is for — but they are the
stretches to watch for "this ended".

**The safe-area audit failed five times before it passed, and each failure was a different thing:** (1) snow flakes
and the family car drove content out to x = 12 and x = 1068 — 1,200 frames; (2) the left-hand house cropped at x ≈ 0 in the
close-ups; (3) the two-house shot was 812 px wide before sway; (4) a half-faded held house still drew bright edges
under x = 60; (5) the house plus the outdoor unit spanned 817 px, and the unit overshot the right edge as the camera settled.
**The audit was right every time, and the audit at its default scale was not strict enough alone** — a 2× re-check found
123 frames the ×4 audit had passed down to 18 (and 0 at the end). Worth keeping as a second step.

**Stills read, with a safe-area guide drawn on them, at 0.3, 3, 8.4, 12, 15, 17.5, 20, 22, 25, 29, 33, 35.7, 37.2 and 38.7 s.**
Not yet watched as video end to end — that is GATE 5 and it is the owner's.
