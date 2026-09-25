# Gate 0 — `I85`, "of every $100 of gas you buy, about $75 never reaches the wheels"

Proposed as the next reel (`r016` if built), 2026-09-25. Backlog id `I85` (§3 *What actually
happens when you…* → accent `languages #51A4FF`). Reasoned from scratch, not from the backlog.
The subject (how an EV motor works) is the account owner's; the framing inside the EV-vs-gas
argument, **in US dollars and aimed at a US audience**, is by the owner's direction the same day.

Nothing has been built. This file and `payoff_frame.png` are the two artefacts CLAUDE.md requires
**before** any Python, any `.tsx`, any data module. (`mock_payoff.py` is the Gate 0 sketch script,
the same kind of file `r005` and `r015` carry.)

## 1. The sentence

> **"Of every $100 of gas you put in your car, about $75 never moves it — it goes out the radiator
> and the tailpipe as heat. An electric motor gets about $80 of every $100 to the wheels."**

No mechanism word, no unit the viewer does not own. Dollars are the unit every American already
uses for this argument.

## 2. Who does the viewer send this to, and what are they proving?

**Sent to the person who says EVs are a scam or a fad, proving the gas engine they are defending is
mostly a heater.**

| condition | verdict |
|:--|:--|
| Personally witnessed the evidence | **Yes, partly.** Every American has paid at the pump and felt the engine's heat under the hood. The heat is something they have felt, not something they have heard about |
| A dispute already running, that a non-specialist is in | **Yes, a strong one.** EV-vs-gas is one of the most partisan consumer arguments in the US. It runs at dinner tables and in every EV post's comment section |
| Resolves to one repeatable number | **Yes:** "$75 of every $100 is heat" |

**Heat — what the loser stands to lose (the variable `r011` exposed).** In the US, being anti-EV or
pro-EV is a political-identity marker, much closer to `r005`'s flat-earth uncle than `r011`'s
boarding annoyance. Being wrong costs the loser the claim that their side's technology is the
sensible one. **The same heat is the toxicity risk:** the comments will fill with "but the power
plant burns coal". The reel must not claim it has settled that question (§7).

## 3. The payoff frame

`payoff_frame.png`, drawn in PIL by `mock_payoff.py`. It is a sketch, not a render.

- **Top: an electric motor seen end-on.** The coil brightness is **computed**, not drawn. Balanced
  three-phase currents at one instant are fed into a standard 12-slot, 2-pole, 60° phase-belt
  winding. The script **asserts** that the currents sum to zero and that the resulting field points
  at ωt plus the phase-A axis. The lit coils, the field arrow and the lagging rotor magnet are what
  that computation produces. The build animates the same maths.
- **Bottom: two $100 bills.** The gas bill keeps $25; the other $75 is gone, shown as heat rising
  off it. The electric bill keeps $80, with $20 lost.

**Sketch bugs caught on the way, recorded because a still can hide them.** The first draw overflowed
the safe area and put a headline over the motor. The four-pole winding was an invented layout whose
lit coils did not form a pole pair. A float put 60° into the wrong phase belt: `degrees()` of
2π·2/12 is 59.999…, and the new assertion caught it. Compositing the heat glow read the image before
the bills were drawn, so the bills vanished.

## 4. Kill conditions — the gate's own three

| Condition | Verdict |
|:--|:--|
| The sentence needs a CS word | **No.** Gas, heat, radiator, tailpipe, motor, wheels, dollars |
| The payoff frame shows an object the viewer has never seen | **Two objects, one of them borderline.** A $100 bill is instantly nameable. **A motor seen end-on may NOT be nameable with the sound off**: a ring of copper with glowing blocks could read as a generic sci-fi graphic. The build answer is to start inside something recognisable (a car, then its wheel, then the motor behind it) and keep that on screen. **This is the verdict to check.** |
| The amazement depends on understanding first | **No, as long as the hook is the motor running.** Coils firing in sequence and a rotor chasing a field it never touches are impressive before any explanation. The $100 split is the payoff for staying. **Risk:** if the hook opens on the money split instead, it becomes a statistic and fails this condition |

**Can the recognisable object stay on screen for the whole reel (non-negotiable 6)?** Yes, if the
car stays in frame and the motor is shown inside it rather than floating on its own.

## 5. Numbers, and where they came from — all LEADS until Stage 3

| Figure | Gate 0 value | Source (to verify at primary level) |
|:--|:--|:--|
| Gas fuel energy that moves the car | **12–30%**, depending on drive cycle. The sketch uses 25% | fueleconomy.gov, *Where the Energy Goes: Gasoline Vehicles* (US DOE/EPA) |
| Engine heat through the radiator and tailpipe | ~58–62% of fuel energy | Same page, as relayed by search. **Not yet read at the source** |
| EV electricity from the wall that reaches the wheels | **~77%**, with ~80% for motor, inverter and gear. The sketch uses 80% | fueleconomy.gov, *Where the Energy Goes: Electric Cars*; *All-Electric Vehicles* |

**`$25` sits at the TOP of the gas range.** Stage 3 must fix one drive cycle (EPA combined) and
quote that figure. If it is nearer 20%, the copy becomes "$80 is heat" and the ratio gets stronger,
not weaker. Pick the cycle before looking at which one reads better. Choosing afterwards would be
the dataset-shopping that the rules forbid.

**One base, stated (non-negotiable 7): "the energy you pay for".** For gas that is what goes into
the tank at the pump; for an EV it is what leaves the wall at the meter. Both are what the viewer
buys, so the two percentages are on the same base. Charging losses count against the EV.

`fueleconomy.gov` is **blocked by this container's egress proxy**. The figures above came through
search summaries and must be read on the page itself (from the Mac, or via an archived copy) before
the script is written.

## 6. Licence and feasibility

- **Figures:** US government publications, which are public domain and citable.
- **Motor geometry:** computed from textbook winding theory, so there is no database to license.
  If the build copies a named production motor's pole and slot count, that is a published fact
  and citable.
- **Feasibility:** nothing needs outside data at runtime. Everything is computable offline, at ₹0.

## 7. Accuracy risks the build must not skate past

1. **Efficiency is NOT emissions.** The reel may say where the energy goes. It may **not** imply
   that an EV is cleaner, since that depends on the grid and is a different, contested claim. No
   copy line may drift from "$ to the wheels" to "cleaner".
2. **"Goes out as heat":** strictly, all losses end up as heat, including friction and idling. The
   copy names "radiator and tailpipe" only for the share the source attributes to them. The rest is
   "never moves the car".
3. **The motor's own efficiency (~90–95%) is not the 77–80% figure.** The latter covers the charger,
   battery and inverter as well. The reel must not show a motor and quote a number that belongs to
   the whole chain without saying so.
4. **"The rotor never touches the ring"** is true for the magnetic drive. The bearings do touch, so
   the copy must not say "no contact anywhere".
5. **Saturated genre (the `r009` warning).** EV-motor animations are common. The argument, not the
   animation, is the reason to build it, and the hook has to show something the common videos
   don't: the field computed from real currents, inside a real car.

## 8. Verdict so far

**GATE 0 and GATE 3: a "go ahead" from the owner, 2026-09-25.** The message was truncated after
"Go ahead and"; it is taken as a yes to the sentence and the send test, subject to the correction
below.

## 9. Stage 3 — the numbers, measured (2026-09-25). THE APPROVED SENTENCE'S EV FIGURE IS WRONG.

`../energy_budget.py` → `../energy_budget.json`. NREL's **FASTSim 2.1.5** (a DOE-validated vehicle
model, installed from PyPI, which is reachable where fueleconomy.gov is not) runs a **2016 Toyota
Camry** and a **2017 Chevrolet Bolt** over the two EPA cycles behind the window-sticker "combined"
figure: UDDS city and HWFET highway, weighted 55/45 by distance. The ruler was chosen **before**
any result was seen:

**Validation, before any result is trusted.** Each car's model economy is checked against EPA's
own sticker figure, after FASTSim's EPA 5-cycle label adjustment: **Camry −2.4%, Bolt +8.8%**.
The tolerance is 10%. **The first run compared raw test-cycle mpg with the sticker figure and read
+26%.** Two bases had been mixed, and the assertion refused to continue until they matched.

| Share of the energy you PAY for… | Gas (Camry) | Electric (Bolt) | Outside number |
|:--|:--|:--|:--|
| **…that reaches the wheels** (braking energy included; DOE's own definition) | **22.6%** | **64.0%** | DOE's gas range is **12–30%** ✓ · DOE Fact #884 gives EV wall-to-road **"about 65%"** before regen is credited (2012 Leaf, 72 °F) ✓ |
| …that pushes against air and road only (braking energy excluded) | 14.5% | 62.4% | none published |
| city / highway, on the stricter ruler | 9.9% / 22.5% | 53.7% / 71.0% | |

**What this changes.**

- **The EV's "$80 of every $100" is FALSE on a like-for-like base.** DOE's 77–80% headline counts
  energy recovered by regenerative braking as a gain *on top of* what came out of the wall. It is
  not a share of the electricity you paid for. Two independent routes agree that the honest figure
  is **~64–65%**: our model (64.0%) and DOE's own pre-regen figure (65%). The owner approved the
  sentence, but the number in it is wrong, and non-negotiable 7 outranks the approval. **So the
  word changes and goes back to the owner.**
- **The gas "$75 never moves it" is right, and slightly conservative.** The measured figure is
  77.4% on the DOE-comparable ruler.
- **The ratio survives: about 2.8x on DOE's ruler.** The stricter ruler gives 4.3x, and **it is
  deliberately NOT the headline.** It flatters the reel's own thesis more than any published
  figure does, which is exactly the shape the `r011` lesson says to distrust. It has no outside
  number to check it against.

**Proposed corrected sentence (needs the owner's yes):**

> **"Of every $100 of gas you put in your car, about $77 never reaches the wheels. Of every $100 of
> electricity you put in an electric car, about $64 does."**

**Still open, and not closed by this run:**

- The **heat** phrasing ("out the radiator and tailpipe"). FASTSim puts engine loss at about 72%
  of fuel energy on the combined cycle. DOE's radiator-plus-tailpipe share is 58–62%. The copy
  should say "never reaches the wheels" rather than naming where the heat goes, unless DOE's page
  is read at the source.
- **fueleconomy.gov, afdc.energy.gov and web.archive.org are all blocked by this container's
  egress policy.** DOE's figures above came through search excerpts of those pages and of
  energy.gov Fact #884. **Read them at the source from the Mac before the script is locked.**
- **Two cars is n = 2.** The Camry and Bolt are the FASTSim database's closest US mass-market pair.
  A sweep across every conventional car and BEV in the database would show whether the ratio holds
  across the fleet or only for this pair. Run it before the script is written.
- FASTSim's label routine prints "trace miss" warnings. They come from its high-speed and
  acceleration test legs, not from UDDS or HWFET, whose energy audit is what the table uses.
  Recorded, not ignored.

## 10. Corrected sentence APPROVED, fleet sweep run (2026-09-25)

The owner said yes to the §9 sentence. `../fleet_sweep.py` → `../fleet_sweep.json` runs **every
light-duty gas car and EV in FASTSim's database** through the same audit, with trucks, motorcycles
and the three-wheeler excluded by name before any result was seen:

| | n | min | median | max |
|:--|:--|:--|:--|:--|
| gas (all) | 29 | 21.5% | 24.6% | 31.1% |
| electric (all) | 22 | 57.1% | 63.9% | 67.1% |
| gas (within 10% of EPA sticker) | 10 | 22.6% | 23.7% | 29.1% |
| electric (within 10% of EPA sticker) | 6 | 57.1% | 64.3% | 67.1% |

**The ranges do not overlap: the best gas car reaches 31.1%, the worst EV 57.1%.** Camry (22.6%) and
Bolt (64.0%) sit at their groups' medians, so the pair is typical, not cherry-picked. Validation
misses are reported, not dropped. Six cars miss EPA by more than 10%, among them the 2020 VW Golfs
at −29% and −40% and the Maruti Swift at +34%, whose database entries are EU/India-spec. None of
them changes the verdict.

## 11. Awaiting

**GATE 4, the script: [`../SCRIPT.md`](../SCRIPT.md).** Nothing is coded until it is approved.
