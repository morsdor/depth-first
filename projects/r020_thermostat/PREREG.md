# PREREG — `I91`, the thermostat. Written 2026-10-06, BEFORE the Stage 3 model exists or has run.

Gate 0 passed 2026-10-06 (owner: "Yes and start making the reel" — a yes to the sentence in
`gate0/GATE0.md` §1 and to the person in §2). Everything below is **fixed now**. A figure that
disagrees with it is reported, never edited in place; the only permitted change after a run is a
**bug fix, logged in `NOTES.md` with the number it moved** — which is what the `r011` rule and the
Gate 0 heating bug (2% → 6.6%) already showed is not optional.

## 1. Weather — forced by availability, declared before looking

Every weather host (NOAA, NREL, Open-Meteo, EIA, energy.gov) is refused by this container's egress
proxy; only PyPI is open. `pvlib`'s wheel bundles three typical-meteorological-year files, so the
choice of city **was made by what could be fetched, not by what a result looked like**:

| Use | File | Why |
|:--|:--|:--|
| **Heating — the lead case** | **Greensboro NC, TMY3 (723170)** — HDD65 ≈ 4,050, min 1.9 °F | a mid-US winter, real cold nights, real sun |
| **Cooling — the mirror** | **Miami FL, TMY2 (12839)** — CDD65 ≈ 4,150 | the hardest cooling climate in the US, and humid |
| not used | Sand Point AK (TMY3) | a remote Alaskan station no US household resembles |

**Each city is run once, with the parameters below.** No other city is tried. If a result is
awkward the answer is a smaller claim, not a different climate (`I53`'s rule).

**The typical day shown on screen is chosen by rule, not by looking:** the **median day by
daily-mean temperature among Dec–Feb days with any heating demand** (Greensboro), and the median
Jun–Aug day (Miami). **Not** the coldest or hottest day.

## 2. The house — one, fixed, ordinary

| Parameter | Value | Note |
|:--|:--|:--|
| Floor area / volume | 1,800 ft² / 14,400 ft³ | |
| Envelope conductance `UA_env` | 520 BTU/h·°F | mid-vintage code walls, roof, windows, slab |
| Infiltration | 0.35 ACH → `UA_inf` = 0.018 × 14,400 × 0.35 ≈ 91 BTU/h·°F | |
| Air + furnishings node `Ca` | 6,000 BTU/°F | |
| Envelope / structure node `Cm` | 14,000 BTU/°F | |
| Air ↔ structure coupling `hA` | 2,000 BTU/h·°F | |
| Solar | effective aperture 3.0 m² × GHI × 3.412 BTU/Wh, into the air node | |
| Internal gains | 800 BTU/h always; +1,500 BTU/h when someone is home | |

Two-node RC. **Not a CFD, not EnergyPlus** — a lumped model, said so on the tin.

## 3. Equipment and control

- **Furnace (lead):** 60,000 BTU/h output, AFUE 0.95 constant. Control: ideal — **coast (off) while
  warmer than the target; flat out while colder; match the leak exactly when at it.** Cycling losses
  are lumped into AFUE.
- **AC (mirror):** 3-ton, 36,000 BTU/h; COP(T_out) = 3.95 − 0.043 × (T_out − 82 °F); 400 W fan while
  running. Two variants: **single-speed** (COP independent of load) and **variable-speed**
  (`COP × (1 + 0.30 × (1 − PLR))`, PLR floor 0.4 — efficient held at low load, inefficient on a
  flat-out recovery). Control as for the furnace, mirrored.
- **Heat pump, heating (scope test):** capacity 36,000 BTU/h at 47 °F falling linearly to 21,600 at
  17 °F; COP 3.0 at 47 °F, 2.2 at 30 °F, 1.7 at 17 °F; **auxiliary resistance 10 kW (COP 1) engages
  whenever the house is more than 1.5 °F under target**, which is what a deep-setback recovery does.
- **Schedule:** away **08:00–17:00**; recovery starts at **17:00**, no pre-heating.
- **Setpoints:** heating **70 °F held vs 62 °F while away** (8 °F — inside DOE's 7–10 °F); cooling
  **75 °F held vs AC OFF while away** (matches the CU Boulder test) and, separately, **83 °F while
  away** (8 °F, matches "easing off").
- **Time step:** 1 minute for the headline day; 3 minutes for the annual run and the sweeps, **after
  checking that 3 minutes moves the median-day saving by less than 0.3 percentage points.**

## 4. What is computed, and on what base

**One base: the energy (gas input, or electricity) for one 24-hour day or one year, with BOTH days
ending at the same indoor state.** The like-for-like test: air-node temperature within **0.3 °F**
AND the structure node's difference converted to energy and added back — if that correction exceeds
**1%** of the day's energy the pair is flagged NOT COMPARABLE and excluded and counted.

- **Day figure:** the median day (§1), taken from the continuous annual run, so yesterday's state
  carries in.
- **Annual figure:** every day of the TMY year as a school/work day **weighted 5/7**, plus two
  weekend days of "held" in seven — occupants are home at weekends, so there is no setback.
  Reported as `E_year = 5/7·E_setback_every_day + 2/7·E_hold_every_day`.
- **Money:** the EIA price host is blocked, so **no price is fixed and no dollar figure goes on
  screen** until the owner supplies a sourced one. The reel is in percent and in the gas meter.

## 5. Rules — each a kill or a scoping, stated before any run

| # | Rule | If it fails |
|:--|:--|:--|
| K1 | **The claim.** In the lead case the setback day uses **less gas** than the held day, like for like | **KILL.** The sentence is false. Write it up as a failure record, keep the id |
| K2 | **The effect is large enough to carry a reel.** Median-day saving **≥ 3%** | the claim is true but too small — **stop at G4 and tell the owner**; this is a decision, not a repair |
| K3 | **Direction.** Saving rises with setback depth and with absence length, across the whole sweep | the model is wrong; find the bug, do not tune |
| K4 | **Plausibility against the literature (soft — the primaries are unread).** Annual saving for 8 °F / 9 h lies in **3–15%**: DOE's rule of thumb is ~1% per degree for 8 h (≈ 8%) and "as much as 10%" a year; the Canadian twin-house test reports 10–13% seasonal for deeper day-and-night setbacks | outside the band → a bug until proven otherwise; **never tuned into it** |
| K5 | **Cooling mirror eligibility.** The AC clause ships on screen only if the model reproduces the **published ordering**: (i) AC off 8 h saves in **every** configuration (single-speed and variable-speed, every sweep point); (ii) AC off 4 h is **mixed** — a saving **≤ 2% or negative in at least one** configuration | if (ii) fails the model flatters the claim (`r011`): **the AC clause is dropped**, which is a script change and goes back to G4 |
| K6 | **Heat-pump scope.** Measured and reported. Whatever it shows decides the scope line on screen | n/a — it changes the words, not whether the reel exists |

**Sweep (reported as a count, never cherry-picked):** `UA_env` × {0.6, 1, 1.5} · `Ca`,`Cm` × {0.5, 1,
2} · furnace/AC capacity × {0.7, 1, 1.5} · ACH {0.2, 0.35, 0.6} · solar aperture {1.5, 3, 6} = **243
houses**, on the median day, for absences of 2, 4 and 9 h and setbacks of 4, 8 and 15 °F. Report **how
many of 243 satisfy each of K1–K5**, and the range of the saving.

## 6. What this does NOT claim

- Not an annual saving for a real household: weekends, vacations, setback habits and equipment age
  are not modelled, and the 5/7 weighting is a stated simplification.
- Not that a heat pump saves — §3's heat-pump run exists to bound that, not to support it.
- Not any dollar figure (§4).
- Not that this model *validates* the Canadian or CU Boulder results — it is checked **against**
  them on ordering and magnitude only, and **none of the four primary documents has been read**
  (`colorado.edu`, `energy.gov`, `assets.cmhc-schl.gc.ca`, `eia.gov` are all refused). Nothing here
  may appear on screen as "a study found" until the primary is read.


---

## AMENDMENT 1 — 2026-10-06, after the first run of `stage3.py` (heating, §4 like-for-like rule)

**The rule in §4 was mis-specified, and the first run is what showed it.** §4 compares the two runs'
END states (air node, plus the structure node's difference converted to energy). That assumes both
runs START the day in the same state. They do not: each is a continuous run with its own schedule, so
the setback run begins every day with a structure node a degree or so colder than the held run's.
On the median day the rule fired — air 70.00 °F in both, structure 63.30 vs 61.95 °F, a correction of
**5.7% of the day's gas** — and it cut the saving from **8.7% raw to 3.0%**. But the setback run also
STARTED the day cold, so the end-state difference over-corrects: it charges the setback run for a
deficit it did not create that day.

**Replacement rule (declared AFTER seeing the result, which is why it is recorded here and why both
numbers are always reported):** make each day **stored-heat-neutral on its own** — remove from each
run's energy the heat its own two nodes gained or lost over that day,
`E_net = E − ΔStored/η` (heating) or `E + ΔStored/COP_ref` (cooling), with
`ΔStored = Ca·ΔTa + Cm·ΔTm` between that day's own start and end. What remains is
`heat leaked − heat gained` for the day, which is the quantity the claim is about. A day is flagged
**NON-STATIONARY and excluded (and counted)** if either run's correction exceeds **10%** of that run's
day energy.

**Reported every time, in this order:** (1) raw day, (2) the original §4 end-state-difference figure,
(3) the replacement `E_net` figure. **K1–K5 are evaluated on (3)**; (2) is shown so a reader can see
the rule changed the answer. The annual figure is unaffected — over a year the carried-in state is
negligible against the energy — and is the cleanest number here.
