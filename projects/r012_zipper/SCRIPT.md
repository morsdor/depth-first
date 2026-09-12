# SCRIPT — `I72` / `r012`, the zipper merge

**GATE 4. Nothing is animated until this is approved.**

- **Runtime 40 s.** Teaching format, not the loop — this one is judged on **sends per reach**
  against r005's 1.203%.
- **Accent** `#FF4D4D` (`failure`, §6), on the cone and on the jam bar. One element per frame.
- **Every number below is output of [`merge.py`](merge.py)**, measured before this script existed.
- **THE ONE RULER: metres of jam, from the cone backwards.** Every length on screen is drawn at one
  scale, and it never changes. The clock, where it appears, runs at true rate.

## Read the copy column ALONE first — the G4 rule added after r011

> THIS QUEUE IS A MILE LONG. HALF THE ROAD IS EMPTY. → YOU KNOW THIS DRIVER. → HE SAVES 25 SECONDS.
> HE COSTS YOU NOTHING. → MERGING EARLY LETS NOBODY THROUGH FASTER. 1,400 CARS AN HOUR, EITHER WAY. →
> BOTH LANES TO THE CONE. SAME TRAFFIC. A THIRD OF THE JAM. → THE CONE DECIDES HOW FAST. YOU DECIDE
> HOW LONG.

That is a complete argument with no help from any other column.

## The script

| t | On-screen words | On screen | Why this beat exists |
|:--|:--|:--|:--|
| **0.0–4.5** | **THIS QUEUE IS A MILE LONG.<br>HALF THE ROAD IS EMPTY.** | Camera low behind a car in a stopped single-file queue, then rising and turning to reveal the **empty closing lane running beside it to the horizon**. Real simulated positions, 177 cars, 1,494 m. | **The hook is a promise, not a label** (r008). Two facts the viewer has personally seen, and the second one is an accusation. Movement on frame 1; the reveal lands by 3 s. |
| **4.5–11.0** | **YOU KNOW THIS DRIVER.** | One car enters the empty lane and runs the length of the queue. The camera tracks it. Every car it passes is a real car from the run. | The civilian object and the antagonist of the argument, named in four words. No claim yet — the viewer is supplying the anger themselves. |
| **11.0–18.0** | **HE SAVES 25 SECONDS.<br>HE COSTS YOU NOTHING.** | The jumper reaches the cone and slots in. Two readouts settle: **his delay 227 s · everyone else 252 s**, and the compliant drivers' figure against the all-early baseline of 258 s. | The first measured claim, and it is the one that defuses the anger. Stated as two numbers on one base — seconds of delay per car. |
| **18.0–25.5** | **MERGING EARLY LETS<br>NOBODY THROUGH FASTER.<br>1,400 CARS AN HOUR, EITHER WAY.** | Split screen, both policies running at once from the same arrivals. A counter on each ticks cars past the cone. **They stay locked together.** | The load-bearing beat. It kills the belief that early merging is what keeps traffic moving, and it is the claim the research had to rescue — the pitch said the zipper is faster and the model says it is not. |
| **25.5–34.0** | **BOTH LANES TO THE CONE.<br>SAME TRAFFIC.<br>A THIRD OF THE JAM.** | Hold the split. The early jam bar stays at **1,494 m**; the zipper's collapses to **477 m** as the second lane fills. Both bars drawn at one scale, both labelled in feet and miles. | **The payoff, and the whole reel.** Same traffic, same hour, same cone: 0.93 miles against 0.30. It is *shown* as two lengths before either number is read. |
| **34.0–40.0** | **THE CONE DECIDES HOW FAST.<br>YOU DECIDE HOW LONG.**<br><br>*(end line)* **NEXT: WHY YOUR PLANE<br>BOARDS BACK-TO-FRONT,<br>AND WHY THAT'S THE SLOW WAY.** | The zipper running clean, both lanes feeding the cone alternately, held the full beat with the bars still on screen. | Closes on the one repeatable sentence, then names what the next reel does (non-negotiable 9). The ask is performable: it is a thing to do on the next drive. |

## What is claimed, and on whose authority

| On screen | Whose |
|:--|:--|
| "a mile long" | **ours** — 1,494 m = 0.93 mi, the measured jam under early merging at 1,800 veh/h |
| "half the road is empty" | **ours** — the closing lane carries no traffic downstream of the sign under early merging, by construction of the policy |
| "he saves 25 seconds" | **ours** — 226.7 s against 251.9 s for the compliant drivers in the same run, 5% jumping |
| "he costs you nothing" | **ours** — compliant drivers 251.9 s with 5% jumping against 258.0 s with nobody jumping. **Stated as "nothing", not "less", deliberately**: the difference is inside run-to-run spread and must not be sold as a benefit |
| "1,400 cars an hour, either way" | **ours** — 1,400 under both policies, identical to three figures, three seeds |
| "a third of the jam" | **ours** — 477 m against 1,494 m = 0.319. Drawn at one scale |
| the model is a road at all | **published** — emergent work-zone capacity **1,487 veh/h/lane**, inside the published 1,400–1,600 band, and never fitted to it |
| the car-following model | Bando et al., Phys Rev E 51, 1035 (1995) — the same model r010 was validated on |

## Pre-handover checklist

| Check | Status |
|:--|:--|
| Hook is a promise, not a label | **Yes** — a mile of queue and an empty lane, in the first two lines |
| Names a recognisable object, never "this" or "it" | **Yes** — "THIS QUEUE" with the queue on screen, then "THIS DRIVER" with the driver on screen |
| The copy column reads alone | **Yes** — see above |
| One ruler | **Yes** — metres of jam from the cone, one scale, feet and miles for a US audience |
| Every percentage has one stated base | **Yes** — seconds of delay per car; cars per hour past the cone |
| Civilian object, never left | **Yes** — a road with a lane closed, every frame |
| No jargon | **Yes** — "car-following model", "capacity", "throughput" appear nowhere on screen |
| read → animate → hold (5) | **Yes** — six beats, ≈6.5 s each |
| End on a reason to follow (9) | **Yes** — the boarding reel, which is `I73` and reuses this engine |
| 3D by default | **Yes** — driver's eye rising to near-top-down, as r010 |
| GATE 3 answered | **Yes** — the family member who blocks the closing lane |

## Risks worth saying out loud

- **"He costs you nothing" will be argued with in the comments**, and the arguers have a point at
  high jumper fractions: at 15% the jumper's advantage is already gone (244.8 s against 241.8 s).
  The reel states 5%, and the figure on screen must be labelled as such.
- **`EARLY` is modelled as its limiting case** — everyone merges at the sign, a kilometre up. Real
  traffic is a mixture, which sits between the two runs. `merge.py`'s docstring says so.
- **r010 is a traffic reel that is still unposted at GATE 5.** If it posts and floors, that is
  evidence about this lane arriving after this reel is built.
