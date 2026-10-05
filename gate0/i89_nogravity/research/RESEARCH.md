# Stage 3 — research and measurement, `I89`

2026-10-05. `measure.py` computes every figure the script puts on screen and **asserts** it; it is
the only place a number is allowed to come from. `figures.json` is its output. Wikipedia and
`nasa.gov` are blocked by the cloud egress proxy, so **no primary page was read**: the outside
claims below are search-level and marked so. Run: `python3 gate0/i89_nogravity/research/measure.py`.

## What changed since Gate 0

**The 89% on the Gate 0 still is a 400 km figure, and the station does not fly at 400 km.** It flies
roughly **410–420 km** (drag pulls it down 50–100 m a day, reboosts restore it). Computed against
one stated base (g at the mean radius, 9.8203 m/s²):

| altitude | gravity vs the ground |
|:--|:--|
| 400 km | 88.53% |
| 410 km | 88.27% |
| **418.4 km (the stated 260 miles)** | **88.05%** |
| 420 km | 88.01% |

**Every altitude the station is reported at rounds to 88%**, asserted in `measure.py`. So the
on-screen figure is **88%**, not 89% and not NASA's "about 90%". The Gate 0 sentence said "almost
90%": at 88%, "almost 90%" is a stretch and the copy drops it. **This is the third time on this account
that a Gate 0 headline word met its own computed figure** (`r010` "lower", `r016` "$80", now this).

## Figures, asserted

| Claim as it will appear | Computed | Check |
|:--|:--|:--|
| The station feels **88%** of your gravity | 88.05% at 260 mi | `assert round(...) == 88` across 410–420 km |
| **150 lb** on the ground → **132 lb** on a 260-mile tower | 132.08 lb at the poles, 131.53 lb at the equator (a co-rotating tower loses ~0.4% more to the Earth's spin) | within 0.75 lb of 132 at both |
| Gravity weakens with distance from the centre; the station is **7%** farther out | 6.57% farther; (1/1.0657)² = 0.8805, equal to the gravity ratio to 1e-12 | `assert round(far*100) == 7` |
| A plane **6 miles** up feels **99.7%** | 99.69% at 32,000 ft (6.06 mi); 99.77% at 24,000 ft | `assert round(.., 1) == 99.7` |
| At **17,000 mph** it never lands | 17,140 mph circular speed; **integrated 10 full orbits, radius drift 0.0 m, never landed** | step-by-step RK4 run, not the formula |
| Slower and it lands | 0.95 × circular: perigee at the ground, landed | integrated |
| Fired at 3 / 5 / 6.5 km/s it lands 8.8° / 18.0° / 33.8° away | closed form and integration agree to 4 decimals | `diff < 0.05°` |
| Every second it **falls 14 feet** and the **ground curves away 14 feet** | falls 14.18 ft; over the 4.76 miles it covers the straight line leaves the orbit circle by 14.18 ft | equal to 1% |
| One lap every **93 minutes** | 92.8 min, 15.5 laps a day | `assert round(T/60) == 93` |

**Honest scope of the "independent" check.** The step-by-step integration uses the same inverse-
square law as the closed form, so it agrees to four decimals and proves the *algebra* and the
*claim "it never lands at that speed"* — not that Newton's law is right. The physics is checked from
outside: NASA's own ~90% and the aircraft.

## Outside sources — search-level, primary pages unread

| Claim | Source (secondary) | Status |
|:--|:--|:--|
| NASA says gravity at the station is "about 90%" ("a 100 lb person would weigh about 90 lb") | NASA student material, quoted by Sciencing and others | **search-level.** Our 88% is the more precise figure at the real altitude; the caption should say so, to pre-empt the comment that NASA says 90 |
| The station flies ~410–420 km | space.com, orbitalradar, NASA ISS reference page (unread) | **LEAD: check the live altitude on posting day.** Any altitude from 410 to 420 km still says 88% |
| Reduced-gravity aircraft fly a parabola between roughly **24,000 and 32,000 ft**, giving **~22–25 s** of weightlessness | Wikipedia "Reduced-gravity aircraft", Zero-G Corp | **search-level.** The copy says "over 20 seconds" |
| NASA **cancelled its own** Reduced Gravity Program in July 2014; Zero-G Corp flies parabolic flights under NASA contract | same | **The copy says "a plane", never "NASA's plane".** Present-tense "NASA's vomit comet" would be false |
| The misconception is common: students say astronauts float because there's no gravity | IOP SPARK, UCT (arXiv 1409.2363), a UK study of 202 students | **search-level, percentages NOT retrieved. No "x% believe" figure may appear on screen** |
| Newton's cannon thought experiment (1687) | *Principia* / *System of the World* | **LEAD, unread.** The copy does not credit Newton or give a date |

## Negative and awkward results (recorded, not buried)

- **The Gate 0 headline number was wrong for the real altitude** (89% vs 88%). Fixed here, before any build.
- **The "independent" integration cannot check the law**, only the algebra (above).
- **The equator reading sits on a rounding edge** (131.53 lb). The dial says 132, the claim is "about
  132", and the first version of the assertion passed only because Python rounds half to even. It now
  asserts a tolerance.
- **The cannon cannot be drawn at true scale in a still** (Gate 0 finding): 19 px of drop. Recorded in
  `GATE0.md` §3 and handled in `SCRIPT.md` as a camera move.

## What is NOT claimed

- **That the cannonball never lands in the real world.** It never lands **in vacuum**. The station is
  at the edge of the atmosphere, loses 50–100 m a day to drag and is reboosted. The cannon beat carries
  an on-screen "NO AIR" note.
- **That astronauts feel no weightlessness.** They do. The claim is about its cause.
- **That "space" has one gravity.** The copy says the *station's* altitude, always.
- **That the tower exists.** It is a thought experiment and is labelled one.
- **"NASA's plane."** See above.
- **132 lb everywhere.** 132.1 at the poles, 131.5 at the equator; "about 132".
- **A percentage of people who believe the myth.** Not retrieved.

## The one thing that can still go wrong

Nothing numeric. The physics is exact and asserted. The risk is Gate 3, and it was stated at Gate 0
and has not moved: low heat, a saturated correction. The only new information from this stage is
that the headline is **88%, not 89%**.
