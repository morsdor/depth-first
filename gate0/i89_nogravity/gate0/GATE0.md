# Gate 0 — `I89`, "there's no gravity in space"

Proposed 2026-10-05. Backlog id `I89` (§2 *Maps and real geography* → accent `infrastructure
#00D6F7`; `I59`, the satellites overhead, is its neighbour). **Reasoned from scratch.** The owner
asked for a better math/physics idea than `I88` (the bowstring) and picked this from four:
"red is due" (roulette), this one, the Great Wall from space, and CO₂ at 0.04%. `I88` is left
open and unbuilt. The "why 0s and 1s" half of the original brief is still unminted.

**No reel number is claimed.** `r018` is taken *if built* by `I87`. Whichever build writes its first
`.tsx` first claims it.

Nothing has been built. This file and `payoff_frame.png` are the two artefacts CLAUDE.md requires
**before** any Python, any `.tsx`, any data module.

## 1. The sentence

> **"Astronauts don't float because there's no gravity up there. The space station feels almost 90%
> of the gravity you do. They float because they're falling, and they keep missing the Earth."**

No CS word. "Gravity", "orbit" and "free fall" are school words, not developer nouns.

**The word "almost 90%" is NASA's rounding, and our own number is lower.** Computed from GM and the
Earth's mean radius, gravity at the station is **88.5% at 400 km and 88.0% at 420 km** (the station
flies 400–420 km; the current altitude is a Stage 3 lookup). The still carries 89%. This is the
`r016` lesson ("$80" approved, falsified by Stage 3, the word changed): **the copy column must use
the computed figure and one stated altitude, and "almost 90%" should be treated as already
falsified.**

## 2. Who does the viewer send this to, and what are they proving? (GATE 3, drafted)

**Sent to whoever says astronauts float because there's no gravity in space, to prove they weigh 62
of your 70 kilos up there.**

| condition | verdict |
|:--|:--|
| Personally witnessed the evidence | **Yes.** Everyone has seen astronauts float, and has stood on a bathroom scale |
| A dispute already running, that a non-specialist is in | **Weak, and this is the `r006` shape.** The belief is real and documented (physics-education research lists "there is no gravity in space" as a standing misconception; NASA's student pages correct it by name), but it is a *correction*, not a two-sided fight. Nobody is publicly wrong about it and shouted down the way flat earth is. `r006` corrected a belief nobody argues about and peaked at ~1.8k against `r005`'s ~66k |
| Resolves to one repeatable thing | **Yes:** "the space station feels almost 90% of your gravity — they're falling, not floating free of it" |

**Heat: what the loser stands to lose.** Almost nothing. Someone who said "there's no gravity in
space" is told a school-physics fact. By `what_travels.md` §G this scores **low heat**, lower than
`r011`'s boarding and far below `r005`'s flat earth. **Stated before building: by the heat
hypothesis this should not reach `r005`'s travel band.**

**What lifts it slightly, and costs nothing.** (a) **"This is you":** the 70 kg → 62 kg scale puts
the viewer's own body in the frame, the one thing `r006` never had. (b) **Name the fight on screen**
(the `r017` lesson): the hook opens on the claim the viewer has heard, with a question mark, not on
a label.

**Saturation risk, stated up front and it is serious.** This correction is everywhere: NASA's own
student pages, Sciencing, physics-class sites, a dozen YouTube explainers. **NASA already gives
the "100 lb on the ground, 90 lb on a ladder to the station" version**, so the scale beat is not new.
Space is also the genre `r009` and `r015` already ran in. This is the `r009` failure shape:
for a science-literate viewer the response is recognition, not awe. **What the standard explainer
lacks, and what this reel can add:** (1) the geometry drawn to scale: the station's ring is **6.3% of
the Earth's radius** above the surface, so the orbit hugs the planet; (2) the cannon sequence
*computed*, not asserted; (3) the plane test below, which most explainers skip.

**Pre-registered reading (proposed — owner to change before posting).** Same thresholds as `I88`,
so the two are comparable. Measure shares and saves *per reach*, separately:

| shares / reach at day 2–4 | reading |
|:--|:--|
| **≥ 0.6%** (half of `r005`'s 1.203%) | a correction-with-your-body-in-it travels. Mint more |
| **0.2% – 0.6%** | `r016`/`r017`'s band: a mild-heat reel moves like a mild-heat reel |
| **< 0.2%** | inside the band `r011` named as falsifying. Saturated corrections do not travel here |

**My prediction, written before the build: below 0.2%.** `r017` (7,014 views) sent at 0.143% and
this has less heat than `r017`. The reason to build it anyway is the owner's choice and the cheap,
exact, falsification-proof headline, not an expectation of travel.

## 3. The payoff frame

`payoff_frame.png`, drawn by `mock_payoff.py` (Pillow + numpy). A sketch, not a render. Every
figure on it is computed in the script from GM and R and asserted.

- The Earth with the station's ring **drawn at true scale, 400 km = 18.8 px on a 300 px radius**,
  in amber (the one amber element). The station sits on it with its sideways speed, **7.7 km/s**.
- The headline: **NO GRAVITY IN SPACE? / THE STATION FEELS 89%.** The claim is named on screen.
- Two bathroom scales: **70 KG on the ground, 62 KG on a 400 km tower** (70 × 0.885 = 62.0).

**What the still does NOT prove, and a real finding from making it.** Newton's cannon — fired from a
400 km tower at 3, 5 and 6.5 km/s — is the mechanism of "they keep missing the Earth". Those arcs
are real conics (computed in the script: they land **8.6°, 17.5° and 32.8°** of Earth away), but at
true scale the whole drop is 19 px, so they collapse into the ring and read as clutter. **A first
draft drew them and was unreadable; they were removed from the still.** The consequence for the
build is a script (G4) item, not a drawing one:

- **The one shot that only exists because it is 3D** (Stage 3c): the camera starts at the cannon on
  top of the tower, close to the limb, where the arcs are readable and the ground visibly falls
  away; then **pulls back** to the full planet, where the ring hugs it. One continuous move, no
  cut. It spends the third dimension on a scale change 2D cannot show.
- **Legibility:** the Earth stays on screen the whole reel (non-negotiable 6); the arcs are never
  redrawn "bigger than true" without saying so.

## 4. Kill conditions: the gate's own three

| Condition | Verdict |
|:--|:--|
| The sentence needs a CS word | **Pass.** None |
| The payoff frame shows an object the viewer has never seen | **Pass, with one risk.** An Earth, a space station and a bathroom scale are all nameable with the sound off. **The risk:** in the still, the amber ring reads as an atmospheric glow, not an orbit. The station and the speed arrow carry it. The build must trace the path with the station moving on it |
| The amazement depends on understanding first | **Pass, narrowly.** "62 kg" and "the ring is that close to the ground" land before any explanation. The second half of the sentence, *falling and missing*, IS the explanation, and is the reward for staying. If the hook has to explain free fall before the 62 kg, it fails here |

## 5. Numbers, and where they came from

Computed in `mock_payoff.py` (GM = 3.986004418×10¹⁴ m³/s², R = 6,371 km mean). **One stated base for
every percentage: gravity at the mean surface radius, 9.820 m/s².** (Standard g is 9.80665; against
that, 88.7% at 400 km. The base must be named on screen, or the number is loose.)

| Figure | Value | Status |
|:--|:--|:--|
| Gravity at 400 km / 420 km | **88.5% / 88.0%** (8.694 / 8.643 m/s²) | **computed**, exact |
| Gravity at the ISS, "about 90%" | NASA student material ("100 lb → 90 lb") | search-level; NASA's number is a rounding of ours |
| Circular speed at 400 km | **7.673 km/s**, period **92.4 min** | computed, exact |
| Free-fall drop in 1 s at 400 km | **4.35 m** | computed |
| Earth's surface curves away **4.90 m per 7.9 km** | computed | the classic "5 m per 8 km" |
| 70 kg on a 400 km tower | **62.0 kg** | computed |
| Ring height / Earth radius | **6.28%** | computed |
| Landing arcs at 3, 5, 6.5 km/s | **8.6°, 17.5°, 32.8°** | computed (Keplerian conics, apoapsis launch) |
| The ISS flies 400–420 km | memory / search-level | **LEAD: check the altitude on the day, and the planned deorbit lowering** |
| The misconception is common | physics-education literature (a UK study of 202 students aged 16–18; UCT introductory astronomy; IOP SPARK) | **search-level, percentages NOT retrieved.** Do not put a "x% of people believe" figure on screen |

**Verification strategy — this is the safest headline on the account.** The central claim is exact
physics from two constants, so **no model of ours can falsify it** (the `I72` / `r011` failure
class does not apply). What remains falsifiable is the *copy*: the altitude, the base, and the word
"almost". The outside number to check against is NASA's own 90% and the free-fall explanation.

**The strongest piece of evidence, for the script (a lead, not yet sourced):** NASA's reduced-gravity
aircraft (the "vomit comet") gives about 20–25 s of weightlessness at ~10 km altitude, where gravity
is **99.7%** of the surface value. **If "no gravity" caused weightlessness, a plane could not do it.**
That is an experiment that could falsify the viewer's belief, run by someone else. Candidate for the
G4 script as the proof beat.

**What is NOT claimed, and must not become claimed by accident:**

- **That astronauts don't feel weightless.** They do. The claim is about the *cause*.
- **That space has no places with almost no gravity.** Gravity falls as 1/r², so far from any body it
  is tiny. "Space" is not one place; **the reel's claim is at the station's altitude** and the copy
  must say where. NASA calls the condition *microgravity* (residual ~10⁻⁶ g), so never write "zero g".
- **That the tower exists.** It is a thought experiment, and must be labelled one.
- **A "% of people believe" figure.** Not retrieved. See above.

## 6. Data and licence (beside the friend test)

- **Physics:** two constants and an inverse-square law. Facts. No licence.
- **Imagery:** none needed. The Earth is rendered in code. **If a real Earth texture or station model
  is wanted later:** NASA media are generally free for use but the usage terms and any per-asset
  exceptions must be read first. **LEAD, not a clearance.** No image model, ₹0.
- **NASA's "90%" and the misconception literature:** published statements, citable.

## 7. What could still end it

There is **no I53-style figure that can kill this**: the headline is exact. What ends it is Gate 3
and saturation, and those are the owner's call, not a number's. If the owner reads §2 and decides a
low-heat, saturated correction should not be built, close it as **killed by Gate 3** and keep the id,
the way `I82` is graded. **That decision is the gate working, not failing.**

## 8. What happens next

1. **G2 — the owner:** *would you say the sentence in §1 to someone?* Two sub-questions: (a) are you
   happy with "almost 90%" becoming the computed **89%** (88.5% at 400 km) on screen, with the
   altitude named? (b) does the claim-in-the-hook ("NO GRAVITY IN SPACE?") feel right, or should the
   hook be the 62 kg?
2. **G3** is named in §2 and graded **weak**, with the prediction recorded above.
3. Stage 3 is light: altitude on the day, the aircraft figure, the one stated base. Then `SCRIPT.md`
   at **G4**. Nothing is coded before it.
