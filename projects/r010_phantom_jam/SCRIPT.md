# SCRIPT — `I65`, "a traffic jam with no cause"

**GATE 4. Nothing is coded until this is approved.** No `.tsx`, no data module, no reel number
claimed. Read it and say yes or no.

- **Runtime 46 s** (30–60 s permitted). 7 beats, ≈6.5 s each.
- **Accent** `#51A4FF` (`languages`, §3). **Amber `#FFB020` = exactly one element per frame**,
  always *the car or the thing the beat is about* — the nudged car, then the jam, then the car
  that fixes it. Never two ambers at once.
- **THE ONE RULER: an mph speed bar, on screen continuously from 3.2 s to the end.** Every
  number in this reel is a speed on that bar. Counts (22 cars, 755 feet) are setup, stated
  once, never reused as a measurement.
- **US units and US words throughout** (2026-09-11). Physics stays SI inside `ring.py`; only the
  display converts. Metric equivalents are kept in `gate0/GATE0.md` §5 so every claim stays
  checkable against its source, which published in metric.

## The script

| t | Narration — the on-screen words, verbatim | On screen | Why this beat exists |
|:--|:--|:--|:--|
| **0.0–3.2** | **YOU CRAWLED FOR TEN MINUTES.**<br>**THERE WAS NOTHING THERE.** | Top-down slice of highway. Cars nose-to-tail, crawling, speed bar reads **2 MPH**. At 1.6 s the queue ahead pulls away and the road empties; hold 1 s on bare road. | **The hook SHOWS, it does not promise** (+60% on r009). No setup sentence, no pronoun — the object is a road full of cars and the memory is the viewer's own. Argument-test condition 1: they have personally witnessed this, repeatedly. |
| **3.2–8.0** | **22 CARS. 755 FEET OF ROAD.**<br>**ONE INSTRUCTION: 19 MPH.**<br><sub>Nagoya, 2008 — a real experiment</sub> | The highway strip curls up into the ring (same road, bent — not a cut). 22 cars evenly spaced, all accent blue, all steady. **Speed bar arrives at 19 and stays for the rest of the reel.** | Establishes that there is *nothing to blame*. Without the controlled conditions stated, "no cause" is an assertion; with them it is airtight. The credit rides here so the rest of the reel never stops for it. |
| **8.0–17.0** | **NOBODY BRAKED.**<br>**NOBODY CRASHED.**<br><sub>clock: 0:00 → 1:50 · ×12</sub> | One car drifts **four inches** out of position — flashes amber for 0.5 s, then back to blue. The wobble passes backward, grows, cars begin to bunch. By 15 s, five cars are stopped. Speed bar spreads from 24 down to 1. | The surprise, and the payoff of the hook's unasked question. The clock is honest about time compression and doubles as the countdown non-negotiable 3 asks for. Four inches is the whole causal claim: this much, and nothing else. |
| **17.0–25.0** | **THE CARS GO FORWARDS.**<br>**THE JAM GOES BACKWARDS.**<br>**12 MPH.** | Amber arc locks onto the stopped cars. Cars visibly drive *through* it and out the front while the arc slides the other way around the ring. Speed bar splits into two readings: **CARS +19 · JAM −12**. | **The reel.** One number, one direction, on the same ruler as everything else — and it is the one repeatable thing carried into the argument without the video. Everything before is setup; everything after is consequence. |
| **25.0–31.0** | **YOU NEVER DROVE INTO IT.**<br>**IT DROVE INTO YOU.** | The ring unrolls back into the highway strip. One car is labelled **YOU**, driving forward at a steady 19. The jam slides backwards along the road and passes through it: YOU slows to 2, crawls, then comes out the other side onto empty road — the exact frame the reel opened on. | Converts a lab result into the viewer's own Tuesday, and closes the hook's loop on the identical image. **This is the sentence that gets sent**, so it is said plainly, with no technical content. |
| **31.0–40.0** | 31.0–36.0 **ONE CAR IN TWENTY-TWO**<br>**STOPPED CHASING THE CAR AHEAD.**<br><br>36.0–40.0 **NOBODY STOPS ANY MORE.**<br><sub>and every car burned 40% less gas — Stern et al., 2018</sub><br><sub>clock ×18</sub> | Back to the ring, jam running. One car turns amber and stops closing on the car ahead — holding just under the average speed, so a gap opens in front of it. The braking wave reaches that gap, is absorbed, and is not handed back. The bunch thins and breaks up. Speeds still vary — **the ring does not go flat** — but no car drops below 5 mph again. | The half of this subject that is **not** saturated: coverage stops at "jams form from nothing" and almost never carries the fix. It is the practical-utility channel, and the reason a viewer sends it rather than just liking it. **The jam breaking up is SHOWN, never narrated.** The claim is deliberately "nobody stops", not "traffic is fixed" — see below. |
| **40.0–46.0** | **THE GAP IN FRONT OF YOU**<br>**IS THE BRAKE YOU DON'T HAVE TO USE.**<br><br><sub>Next: why your city's traffic lights aren't broken.</sub> | Held on the smooth ring, all blue, breathing. Speed bar flat at 19. | Non-negotiable 9 — a reason to follow, naming what the next reel does, over the finished visual, held the full stretch. The ask is performable on the phone in their hand: follow. (Next reel = `I66`, already in the backlog.) |

## Beat 6 was rewritten TWICE, and the second time the data did it

**The measured result is weaker than the one I scripted, and the script now says the weaker
thing.** The draft claimed the ring returns to a flat 19 mph. It does not. Measured over the
80 s after the controller settles:

| | before the fix | after |
|:--|:--|:--|
| car-samples under 5 mph | **17.5%** | **0.0%** |
| slowest car | 0.00 mph | 10.9 mph |
| speed spread | 25.7 mph | 11.3 mph |
| speed variation (std dev) | 8.39 mph | 1.58 mph — **81% cut** |

So the honest claim is **"nobody stops any more"**, not "traffic is fixed". That is also what
Stern et al. report — waves *dissipated* and large fuel savings, never a uniform ring — and
`emit_ts.py` now asserts the weaker claim and would refuse to write the data module if the
stopped share were not exactly zero.

**One disclosed choice:** the controlled car targets **95% of the uniform-flow speed**, which is
what opens the gap in front of it. At 100% it cannot claw back an already-jammed ring — measured,
20 mph of spread still present after 300 s. Stern et al. likewise command a speed at or just
below the average flow. Recorded in `gate0/GATE0.md` §5.

## Beat 6, and why it was rewritten the first time

The first draft read **"ONE CAR IN TWENTY-TWO / JUST LEFT THE GAP. / 40% LESS FUEL."** The first
human to read it asked what it meant, which is the gate doing its job for the price of a line of
markdown. Two real defects:

1. **"left the gap" is ambiguous** — *departed* the gap, or *allowed it to remain*? It only reads
   correctly if you already know the answer. It is also British-English phrasing.
2. **"40% LESS FUEL" states no base**, which breaks non-negotiable 7 — *every percentage gets one
   stated base*. Less than what, and whose fuel? It is the **whole fleet's** consumption against
   **the same cars on the same track with the wave running**, and neither half was on screen.

**What the beat actually claims, in full:** every one of the 22 drivers is doing the normal thing
— close the gap when it opens, brake when you get near. That chase-and-brake *is* the wave. One
driver stops doing it and lets a bigger gap open. That gap is a shock absorber: when the braking
wave arrives from ahead, that car has spare room, so it never brakes hard, so it never hands the
braking back to the car behind. The wave reaches that one car and dies. The other 21 did nothing.

## What is claimed, and on whose authority

| On screen | Published as | Whose number |
|:--|:--|:--|
| 22 cars · 755 feet · 19 mph · 12 mph backwards | 22 cars · 230 m · ~30 km/h · ~20 km/h | **Sugiyama et al. 2008.** Cited, not ours. |
| 40% less gas, fleet-wide, vs. the wave running | same | **Stern et al. 2018.** Cited, not ours. |
| Everything that MOVES | — | **Ours** — `ring.py`, a real car-following model, played back. Computed, never keyframed. |

**The jam forming, persisting, and dying when one car holds its gap are all emergent outputs of
the model, not authored.** Three model parameters are calibrated to the experiment's three
measured properties, so those three numbers are attributed to the experiment above. The critical
density was *not* calibrated and lands on the experiment's value anyway — see `gate0/GATE0.md` §5.

## Pre-handover checklist

| Check | Status |
|:--|:--|
| ONE ruler | **Yes** — mph speed bar, 3.2 s to end, every number on it |
| Hook shows rather than promises | **Yes** — the crawl and the empty road, by 3.2 s, no setup |
| Names ride on objects | **Yes** — YOU on the car, THE JAM on the arc; no caption slot |
| Never more than three text blocks | **Yes** — max 3 (+ one subordinate credit line) |
| No jargon | **Yes** — "instability", "critical density", "car-following model", "FollowerStopper" appear nowhere |
| No British English | **Yes** — highway not motorway, gas not petrol, road not tarmac |
| Every percentage has a stated base | **Yes** — fixed in beat 6 |
| Every claim traced | **Yes** — table above; full grading in `gate0/GATE0.md` §5 |
| Opens on a civilian object and never leaves it | **Yes** — cars on a road, every frame |
| Ends on a reason to follow | **Yes** — beat 7 |

## Known risk, carried forward from Gate 0

**Genre saturation.** The backward wave is standard in phantom-jam explainers. The reel is
therefore built on **argument ammunition and practical utility, not novelty** — the `r005`
channels, which saturation does not damage. If it fails, the likeliest reason is that the viewer
already knew the fix in beat 6, and Gate 5 is the cheapest place to find that out.
