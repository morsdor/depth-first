# SCRIPT — `I65`, "a traffic jam with no cause"

**GATE 4. Nothing is coded until this is approved.** No Python beyond the Stage 3 measurement
(`ring.py`), no `.tsx`, no data module. Read it and say yes or no.

- **Runtime 46 s** (30–60 s permitted). 7 beats, ≈6.5 s each.
- **Accent** `#51A4FF` (`languages`, §3). **Amber `#FFB020` = exactly one element per frame**,
  and it is always *the car or the thing the beat is about* — the perturbed car, then the jam,
  then the car that fixes it. Never two ambers at once.
- **THE ONE RULER: a km/h speed bar, on screen continuously from 3.2 s to the end.** Every
  number in this reel is a speed on that bar. Counts (22 cars, 230 m) are setup, stated once,
  never used as a measurement again. This is the r009 v1 failure and it does not recur here.

## The script

| t | Narration — the on-screen words, verbatim | On screen | Why this beat exists |
|:--|:--|:--|:--|
| **0.0–3.2** | **YOU CRAWLED FOR TEN MINUTES.**<br>**THERE WAS NOTHING THERE.** | Top-down slice of motorway. Cars nose-to-tail, crawling, speed bar reads **4 km/h**. At 1.6 s the queue ahead pulls away and the road empties; hold 1 s on bare tarmac. | **The hook SHOWS, it does not promise** (+60% on r009). No setup sentence, no pronoun — the object is a road full of cars and the memory is the viewer's own. This is argument-test condition 1: they have personally witnessed this, repeatedly. |
| **3.2–8.0** | **22 CARS. 230 METRES OF ROAD.**<br>**ONE INSTRUCTION: 30 KM/H.**<br><sub>Nagoya, 2008 — a real experiment</sub> | The motorway strip curls up into the ring (same road, bent — not a cut). 22 cars evenly spaced, all accent blue, all steady. **Speed bar arrives at 30 and stays for the rest of the reel.** | Establishes that there is *nothing to blame*. Without the controlled conditions stated, "no cause" is an assertion; with them it is airtight. The credit rides here so the rest of the reel never has to stop for it. |
| **8.0–17.0** | **NOBODY BRAKED.**<br>**NOBODY CRASHED.**<br><sub>clock: 0:00 → 1:47 · ×12</sub> | One car drifts **10 cm** out of position — flashes amber for 0.5 s, then back to blue. The wobble passes backward, grows, cars begin to bunch. By 15 s, five cars are stopped. Speed bar spreads from 38 down to 1. | The surprise, and the payoff of the hook's unasked question. The clock is honest about time compression and doubles as the countdown non-negotiable 3 asks for. The 10 cm is the whole causal claim: this much, and nothing else. |
| **17.0–25.0** | **THE CARS GO FORWARDS.**<br>**THE JAM GOES BACKWARDS.**<br>**20 KM/H.** | Amber arc locks onto the stopped cars. Cars visibly drive *through* it and out the front while the arc slides the other way around the ring. Speed bar splits into two readings: **CARS +30 · JAM −20**. | **The reel.** One number, one direction, on the same ruler as everything else — and it is the one repeatable thing that gets carried into the argument without the video. Everything before this is setup; everything after is consequence. |
| **25.0–31.0** | **YOU NEVER DROVE INTO IT.**<br>**IT DROVE INTO YOU.** | The ring unrolls back into the motorway strip. One car is labelled **YOU**, driving forward at a steady 30. The jam slides backwards along the road and passes through it: YOU slows to 4, crawls, then comes out the other side onto empty tarmac — the exact frame the reel opened on. | Converts a lab result into the viewer's own Tuesday, and closes the hook's loop on the identical image. **This is the sentence that gets sent**, so it is said plainly, in words with no technical content. |
| **31.0–40.0** | **ONE CAR IN TWENTY-TWO**<br>**JUST LEFT THE GAP.**<br>**40% LESS FUEL.**<br><sub>Stern et al., 2018 — same track, real cars</sub> | Back to the ring, jam running. One car turns amber and simply stops closing on the car ahead — holds steady while the gap opens. The bunch thins, the arc shrinks and dies. All 22 return to a flat 30 on the speed bar. | The half of this subject that is **not** saturated: coverage stops at "jams form from nothing" and almost never carries the fix. It is also the practical-utility channel, and the reason a viewer sends it to someone rather than just liking it. |
| **40.0–46.0** | **THE GAP IN FRONT OF YOU**<br>**IS THE BRAKE YOU DON'T HAVE TO USE.**<br><br><sub>Next: why your city's traffic lights aren't broken.</sub> | Held on the smooth ring, all blue, breathing. Speed bar flat at 30. | Non-negotiable 9 — a reason to follow, naming what the next reel does, over the finished visual, held the full stretch. The ask is performable on the phone in their hand: follow. (Next reel = `I66`, already in the backlog.) |

## What is claimed, and on whose authority

| On screen | Whose number |
|:--|:--|
| 22 cars · 230 m · 30 km/h · 20 km/h backwards | **Sugiyama et al. 2008.** Cited, not ours. |
| 40% less fuel | **Stern et al. 2018.** Cited, not ours. |
| Everything that MOVES | **Ours** — `ring.py`, a real car-following model, played back. The animation is computed, never keyframed. |

**The jam forming, persisting, and dying when one car holds its gap are all emergent outputs of
the model, not authored.** Three model parameters are calibrated to the experiment's three
measured properties, so those three numbers are attributed to the experiment above. The critical
density was *not* calibrated and lands on the experiment's value anyway (smooth at ≤20 cars,
jams at ≥22) — see `gate0/GATE0.md` §5.

## Pre-handover checklist

| Check | Status |
|:--|:--|
| ONE ruler | **Yes** — km/h speed bar, 3.2 s to end, every number on it |
| Hook shows rather than promises | **Yes** — the crawl and the empty road, by 3.2 s, no setup |
| Names ride on objects | **Yes** — YOU on the car, THE JAM on the arc; no caption slot |
| Never more than three text blocks | **Yes** — max 3, in beats 3 and 6 |
| No jargon | **Yes** — "instability", "critical density", "car-following model", "FollowerStopper" appear nowhere |
| Every claim traced | **Yes** — table above; full grading in `gate0/GATE0.md` §5 |
| Opens on a civilian object and never leaves it | **Yes** — cars on a road, every frame |
| Ends on a reason to follow | **Yes** — beat 7 |

## Known risk, carried forward from Gate 0

**Genre saturation.** The backward wave is standard in phantom-jam explainers. The reel is
therefore built on **argument ammunition and practical utility, not novelty** — the `r005`
channels, which saturation does not damage. If it fails, the most likely reason is that the
viewer already knew the fix in beat 6, and Gate 5 is the cheapest place to find that out.
