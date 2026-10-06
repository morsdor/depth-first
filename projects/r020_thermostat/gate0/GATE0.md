# Gate 0 — `I91`, "if nobody's home all day, easing off the heat or AC saves money"

Proposed as the next reel (`r020` if built), 2026-10-06. Backlog id `I91` (§1 *Things you touch
every day* → accent `data #AD88FF`, from `DOMAIN_ACCENT`). **Reasoned from scratch, not from the
backlog.** The account owner picked it from a list of six on 2026-10-06 (option 2), and the same day
chose **"thermostat" (heat or AC) over "AC only"**. That choice changed the sentence, the model and
the numbers; this file is the rewrite. The AC-only version is kept in §5 as the cooling mirror.

**Format, by the owner's decision the same day: silent, caption-driven, 30–60 s — no voice-over.**
`r019`'s narrated 80.5 s cut held 17 s of average watch, the same absolute figure as the silent
42–44 s reels (`r014` 16 s, `r016` 18 s, `r017` 17 s). That figure is a design constraint here, not
a footnote: **the verdict — the two bills — has to be on screen by ~12–15 s, not saved for the end**,
because the average viewer is gone by about 17 s and `r019`'s curve lost two thirds of its audience
by ~7 s.

Nothing has been built. This file, `payoff_frame.png`, and the two scripts beside them
(`sim_sketch.py`, `mock_payoff.py`) are the artefacts CLAUDE.md requires **before** any Python,
any `.tsx`, any data module.

## 1. The sentence

> **"If nobody's home all day, easing off the heat or AC saves money — bringing the house back to
> normal costs less than holding it all day."**

No mechanism word, no unit the viewer does not own. Three scoping choices, all deliberate:

- **"All day", not "never".** The published tests find a short absence is a different story (§5,
  §7), so the word "never" is not in the sentence and must not enter the copy.
- **"Easing off", not "turning off".** In winter *off* risks frozen pipes, and DOE's own advice is a
  7–10 °F setback. The copy must never say "off" for heat.
- **"Heat or AC" is one physics, shown once.** A house leaks heat in proportion to the gap with
  outside, in July and in January. **The build proves ONE season; the other is a one-beat mirror, and
  only if the model reproduces its published ordering.** The lead case is **heating**, chosen *before*
  it was run, on grounds that do not depend on its result: it is in season (6 Oct), DOE's figure and
  the Canadian twin-house measurement are both for heating, and a gas furnace's efficiency does not
  move with outdoor temperature, so the toy model is least wrong there.

## 2. Who does the viewer send this to, and what are they proving?

**Sent to whoever in the house says "don't touch the thermostat — it just costs more to heat (or
cool) it back up" — proving the bill is paying to heat an empty house.**

| condition | verdict |
|:--|:--|
| Personally witnessed the evidence | **Yes.** Everyone has paid the bill, come home to a cold house, and heard the furnace run and run — the exact moment the myth looks true |
| A dispute already running, that a non-specialist is in | **Yes.** It is a household argument, had by non-specialists, at every thermostat. It is **not** a public one: there is no comment-section war the way flat earth or EV-vs-gas has |
| Resolves to one repeatable number | **Partly, and weaker than it looks.** The carry-away is a *reason* — "a house leaks heat in proportion to the gap, so a cooler house leaks less" — and the number it comes with differs by season and by house (§5). Stage 3 must pick the one that survives |

**Heat — what the loser stands to lose (the variable `r011` exposed).** The loser is told they have
been wasting money for years. That is a competence sting inside the household, **not an identity
loss** — nobody's politics or self-concept rides on thermostat strategy. **This is closer to `r011`
(boarding, 0.041% sends) than to `r005` (flat earth, 1.203%).** What it has that `r011` did not:
money on every bill, in dollars, for a US audience, and a utility leg. The nearest comparable is
`r016` (EV vs gas): money plus a real dispute, the best reach since `r005`, shares **0.172% → 0.223%
over two days, still 5x under `r005`**. **I would expect `r016`'s band, not `r005`'s.**

**Weak leg, stated before building: the saving is small, and it is smaller in the lead case.** The
sketch's heating saving is **about 7% — $0.78 on a $11.77 cold day**. A dollar figure that size will
not travel on its own; what travels, if anything does, is *correcting a belief the viewer already
holds*. The reel is a correction, not a saving. (The cooling mirror reads 15% / $0.69 on a hot day.)

**Two channels, graded on two metrics** (`r011`'s lesson — do not fold them into one number):

| Channel | Metric | Why this reel names it |
|:--|:--|:--|
| Argument ammunition | **shares per reach** | the household argument above |
| Practical utility | **saves per reach** | the viewer can act on it tonight |

## 3. The payoff frame

`payoff_frame.png`, drawn in PIL by `mock_payoff.py`. A sketch, not a render, and it says so on its
own face. Two identical houses on the same cold day: **left, 70 °F all day, $11.77; right, 62 °F
from 8 AM to 5 PM, $10.99; "7% LESS"; "The furnace ran flat out for 3.2 hours when they got home.
Still cost less."** Both thermostats read 70° because the frame is the end-of-day tally, after the
house has recovered. Every number on the frame is printed by `sim_sketch.py`, none typed by hand.

**Be honest about what the still proves and does not.** It proves the sentence can be *shown* with
nameable objects. It shows the **verdict** — a comparison of two numbers, which is `r012`'s shape
and `r012` had the account's lowest like rate. **The amazement is not in this frame. It is in the
frame before it:** the right house's furnace running flat out for hours, its counter climbing faster
than the left's, and still finishing behind it. The build has to make that the payoff beat, not
the tally.

**Sketch bugs caught on the way, recorded because a still can hide them.** The first draw had the
two houses overlapping and the left AC unit hidden behind the right house; the first AC fan read as a
car logo; the first sweep reported a 30% saving for a small unit that never cooled the house back
down, so the two days did not end at the same temperature. **And the heating mirror's first run
reported a 2% saving against published figures of 7–21% — it had the furnace holding the 62 °F
target while the house was still 70 °F, i.e. heating a house that was already above target.** Every
assertion passed with that bug in place, including "both days end at the setpoint". **What caught it
was an outside number to disagree with** — the `r011` lesson, found again in miniature. After the
fix the heating saving is 6.6%.

## 4. Kill conditions — the gate's own three

| Condition | Verdict |
|:--|:--|
| The sentence needs a CS word | **No.** Heat, AC, house, money, bring back to normal, all day |
| The payoff frame shows an object the viewer has never seen | **No.** A house, a thermostat, a chimney, a dollar readout — all nameable with the sound off. **Borderline:** heat flow is invisible, so the *mechanism* has no object. The build must draw the leak as colour on the house itself, as `r016` did with the coil glow, **never as a graph** — a temperature-vs-time line is kill condition 2 |
| The amazement depends on understanding first | **Passes narrowly — the weakest of the three.** The viewer needs to hold a belief ("it costs more to heat it back up") to be surprised by the result, so **the hook must state that belief**; a hook that opens on a statistic is a blog post. The visible event (a furnace straining for hours and still losing the race) is amazement-first, but the tally is not |

**Can the recognisable object stay on screen for the whole reel (non-negotiable 6)?** Yes — both
houses stay in frame from the first second to the close.

## 5. Numbers, and where they came from — all LEADS until Stage 3

**Every source below was read through search-result summaries only.** `colorado.edu`,
`inquirer.com`, `gigazine.net` and `assets.cmhc-schl.gc.ca` are all refused by this container's
egress proxy, so **no primary document has been read**.

| Figure | Gate 0 value | Source (to read at the primary level) |
|:--|:--|:--|
| **Heating — a measured twin-house test** | 11 °F setback, night + work hours → **13% gas saved**, 2% electricity; setbacks to 64 °F / 61 °F day and night → up to **17% / 21% on the coldest day**, **10% / 13% over the season** | Canadian Centre for Housing Technology twin-house experiment, CMHC report (`63816`). **The outside number this reel should be checked against, and the strongest one found.** The summary mixes the setback schedules; the report must be read to know which figure belongs to which |
| Heating — DOE rule of thumb | "as much as 10%" a year for 7–10 °F back, 8 h/day; ~**1% per degree** for 8 h. An older DOE figure quoted by NDSU says 5–15% a year | energy.gov *Thermostats*; NDSU Extension, "Thermostat setbacks do pay off" (2008). **ANNUAL, not one cold day — a different base from the sketch** |
| The mechanism, in words | "the fuel used to reheat the house is roughly equal to the fuel savings while it was dropping … the savings occur while the system is at the lower temperature" | NDSU Extension (2008), Carl Pedersen. A source's sentence, not evidence — Stage 3 has to test it |
| Real behaviour | ~**6%** across 2,658 US gas-heated homes with programmable thermostats | found via search; **the study is unidentified**, not citable yet |
| **Cooling** | AC off 8 h **saves on every system type**; **4 h is mixed**; up to **11% annual** with conventional central AC; heat pumps and minisplits save less | Baker, Scheib & Pigott, CU Boulder, 2022 — simulated average homes in Arizona and Georgia |
| Heat pumps, heating | deep setbacks can trigger auxiliary heat and **erase the saving** | trade and extension sources via search; no primary read |
| Sketch, heating (lead) | 7.36 vs 6.87 therms, **6.6%**, furnace flat out 3.2 h, house falls to 62 °F; 4 h absence 1.7%, 2 h absence 0.5% | `sim_sketch.py` — parameters fixed before the comparison, none tuned |
| Sketch, cooling (mirror) | 28.0 vs 23.9 kWh, **14.6%**, 5.7 h flat out, house peaks 84 °F; 4 h absence 4.8% | same file |
| Prices | $1.60/therm gas, $0.17/kWh electricity — **placeholders** | EIA, to be fixed to one year and one table in Stage 3 |

**One base, stated (non-negotiable 7): "the heating bill for one 24-hour day, ending at the same
indoor temperature."** Both days must end at the setpoint or the comparison is not like for like.
**Never put the sketch's one-day 6.6% next to DOE's annual 10% or the CCHT's seasonal 10–13%** —
different bases; a cold day is expected to save more than a season does.

## 6. Licence and feasibility

- **Licence.** Published figures are facts and citable. There is no scraped database and no route
  geometry in this reel; the model is ours. Weather, if used, is NOAA/NSRDB typical-year data
  (public). DOE's residential prototype building models and EnergyPlus are public and open — a
  candidate for the outside check if the CMHC and CU Boulder parameters cannot be read.
- **Feasibility.** A one-zone heat balance is a day of work, not a research project. A better one
  (furnace cycling and infiltration for heat; COP-vs-load and a latent/humidity term for cooling) is
  what Stage 3 actually needs — see §7.
- **No climate-shopping.** Pick the climate, the house and the setback **before running anything,
  and say so** — the same rule that stopped `I53` from trying Mumbai and then Chennai. The Canadian
  test and the CU Boulder paper each fix their own; reuse theirs.

## 7. Accuracy risks the build must not skate past

1. **"All day" is load-bearing.** In the toy model a 2 h absence saves 0.5% and a 4 h one 1.7% in
   heating; the CU Boulder paper calls 4 h *mixed* for cooling. The copy keeps "all day" on screen
   at the hook, not in a footnote.
2. **Heat pumps are the comment-section risk.** They are the fastest-growing share of US homes and a
   deep setback can erase the saving. The reel names its scope on screen (a conventional furnace) or
   the top comment will be "mine doesn't work like that".
3. **THE TWO HALVES OF THE TOY MODEL LIE IN OPPOSITE DIRECTIONS.** Cooling *flatters* the claim: it
   saves at 4 h where the literature says mixed — a constant-COP, no-humidity model cannot lose, so it
   cannot be the evidence. Heating, once fixed, reads *at or below* DOE's rule. **A model that is
   wrong in both directions is not validated by agreeing with itself**: `check_invariants`-style
   asserts passed with the 2% heating bug in place. **Stage 3 must reproduce the published ORDERING
   first — the CCHT's seasonal and cold-day figures for heating — before any figure goes on screen.
   If it cannot, that is a kill and not a repair.**
4. **"The furnace doesn't work harder" is a mechanism sentence and needs a falsifiable test.** The
   furnace does run flat out for hours on return (3.2 h in the sketch); what is claimed is that
   *total gas used* is lower. The test: **heat in = heat out + heat stored**, asserted per run, and
   the counter on screen must never claim a saving at a moment its own data does not show one (the
   `r011` timeline-bound `claim()` pattern).
5. **Percentages need one base** (§5), and two houses must end the day at the same temperature.
6. **Never "off" for heat** (§1).
7. **Season.** Heating is the lead because it is in season. The cooling mirror ships only if it
   reproduces the CU Boulder ordering; otherwise the reel says "heat" and drops the AC clause —
   which is a *script* change, and goes back to G4, not an improvisation at build time.

## 8. Awaiting

**A human yes — Gate 0 is not mine to pass.** The sentence changed when you chose "thermostat", so
a yes on the AC version does not carry over:

1. **Would you say the sentence in §1 to someone?** (G2.)
2. **Is the person in §2 the one you'd send it to?** — whoever says "don't touch the thermostat, it
   costs more to heat it back up". (G3.)

---

## 9. Stage 3 update — 2026-10-06 (the gates above passed the same day)

Gate 0 passed (owner: "Yes and start making the reel"). Stage 3 is done: [`../NOTES.md`](../NOTES.md);
rules fixed in advance: [`../PREREG.md`](../PREREG.md) (one logged amendment); the G4 script awaiting
approval: [`../SCRIPT.md`](../SCRIPT.md). **What changed against this file:**

- **The AC clause is dropped.** Pre-registered rule K5 required the model to reproduce the published
  "AC off 8 h saves on every system type"; 22 of 243 simulated variable-speed houses lose. The sentence
  in §1 is therefore narrowed to **heat only** — **pending the owner's yes at G4 (D1).**
- **The sketch figures in §3 and §5 are retired.** "7% LESS" and "3.2 hours flat out" came from the Gate 0
  toy model; the real model says **9% less gas on the median winter day** (7.9% stored-heat-neutral,
  5.0% over a winter of weekdays) and **1.0 hour** flat out. `payoff_frame.png` and `mock_payoff.py` are
  kept as the Gate 0 record, not as the reel's numbers.
- **Sketch bug recorded:** the toy model's 3.2 h came from having no structure node.
