# Gate 0 — `I64`, the queue you switched out of

Section 3 (`languages`, `#51A4FF`) · target 45–60 s · proposed reel `r009`

## The sentence

> **A single snaking line doesn't make the queue faster. Same tills, same shoppers — it just
> takes a quarter off your *worst* wait, because you can't get stuck behind one trolley while
> three tills clear beside you.**

Chosen by the human on 2026-09-10 over three alternatives. It is deliberately *not* the version
I pitched first — see "What this falsified" below.

## The three kill conditions

**Does the sentence need a CS word?** No. It has no technical noun at all: line, till, shopper,
trolley, wait. "Queueing theory" never appears and never needs to.

**Does the payoff frame show an object the viewer has never seen?** No. It is two shops. A
stranger with the sound off and every label removed can name what is on screen: people standing
in lines at checkouts, and a trolley at one of them. This is the first frame in the recent run
that passes this condition without argument — `I52`, `r008` and `I24` all failed it.

**Does the amazement depend on understanding first?** No, and this is the load-bearing one. The
frame is a race, and a race is legible before any explanation: two shops, the same thirteen
people, one of them jammed. The viewer wants to know which side won *before* being told anything.
Understanding why 8.6 beats 11.3 is the reward for staying, which is the required order.

## The reach test — all three conditions

1. **Personally witnessed.** Everybody has switched lanes and watched the lane they left move
   first. It is one of the most reliably experienced events in ordinary life.
2. **A dispute is already running.** The live argument is "should I switch?" and its sibling,
   "why does this shop make us queue in one stupid snake?" — the second is a standing complaint
   at any airport security line, bank, or Argos. People are wrong about this out loud, weekly.
3. **One repeatable carryable thing.** *You are in the wrong lane three times out of four, and
   that is arithmetic, not luck.* One number, no props.

**Who does the viewer send this to, and what are they proving?** To the person they were just
queueing with who said "we picked the wrong one" — proving it was never a pick. r006's uncle,
r007's nobody; this one has a named recipient.

## Licence

**None required.** There is no dataset. The queueing discipline *is* the real thing being run,
the same way the shuffle was in `r005`. `sim.py` depends only on numpy.

## The measurement

`sim.py` — discrete-event, 4 tills, 85% utilisation, 300,000 customers, first 20,000 discarded as
warm-up. Identical arrival stream and identical service times across all four disciplines; the
only thing that changes is where people are told to stand. Service is a mixture — 80% baskets
(exponential, mean 0.5) and 20% trolleys (exponential, mean 3.0), overall mean 1.0, which is what
lets one time unit be called a minute on screen.

| discipline | mean wait | 95th pct | vs one line |
|:--|--:|--:|--:|
| ONE shared line (a snake) | 2.13 | 8.57 | — |
| 4 lines, join the shortest | 2.54 | 11.28 | 1.19x |
| 4 lines, with x-ray vision | 2.13 | 8.57 | 1.00x |
| 4 lines, join at random | 10.99 | 38.14 | 5.16x |

Your line is the fastest of 4: **25.0%** of the time — so you are in the wrong line **75%** of the
time, and not because you are unlucky.

**Corrected after the still was drawn: "same average wait" is false.** The means are 2.13 and 2.54,
a 16.0% cut, not a tie. What is identical is **throughput — 203.57 against 203.56 served per hour**,
which is the true and better version of "one line doesn't make the shop faster": it adds no till.
The frame and the script now say *"same 204 served an hour"*.

**Seed stability, five seeds** (a figure that moves with the seed cannot go on screen):

| statistic | ratio 4-lines / 1-line | range | one line cuts |
|:--|--:|--:|--:|
| mean wait | 1.191 | 1.181–1.198 | 16.0% |
| 95th pct | 1.306 | 1.290–1.320 | 23.4% |
| 99th pct | 1.342 | 1.269–1.385 | 25.5% |
| **maximum** | 1.747 | **1.353–2.190** | **unstable — barred from the screen** |

The single-run maximum (53 min against 24) is the most dramatic pair in the data and it is the one
figure that must not be used: it swings by a factor of two with the seed.

**The bug that nearly shipped the wrong answer.** v1 of the sim gave "shared" and "shortest"
identical results to 2dp, because both picked the till that would *free* soonest. That hands the
simulated shopper knowledge no human has: a basket of three and a full trolley look the same from
behind. Rewritten so `visible` counts heads only, which is the whole reason separate lines lose.
The x-ray row above is kept precisely because it shows this: **with perfect information, four
lines exactly equal one line.** Separate lines are not worse queueing, they are worse *guessing*.

## What this falsified — the honesty constraint on the script

I pitched this concept as "one shared line cuts everyone's wait several-fold". **Measured, it is
19% on the mean.** The real, sturdy finding is the tail: 24% off the 95th percentile
(1 - 8.57/11.28), which is the "quarter off your worst wait" in the sentence.

So the script may not say *faster*. It says the shop serves the same number either way and the
bad day disappears —
which is both true and the more surprising claim, because the thing everyone repeats is the
opposite. **The 5.16x row is not the reel's headline number** and must not be cropped into one:
joining at random is nobody's behaviour, and quoting it would be the r004 "300 roads, not 300,000"
mistake again.

## The payoff frame

`payoff_frame.png`, from `mock_payoff.py` (PIL, ~5 min, not a render). Two shops stacked, the same
13 people in each — asserted in code, because a frame that cheated on the head count would be
arguing the reel's point by drawing it. Four lines above with one trolley jamming lane 2 and three
tills nearly clear; one line below, fanning to all four tills. Both `1 in 20 waits …` figures are
the 95th percentile and are labelled as such — "worst wait" was the first label and it was false.

Two layout invariants are asserted rather than eyeballed, both having shipped as bugs before: no
drawn text crosses the action rail at x=870, and no till hangs out of its panel.

## Open before building

- **Runtime.** This wants 45–60 s under the widened budget: hook, the switch, the 75% number, the
  race, the tail, the "same average" turn, the close. Eight beats at ≈6.5 s.
- **Motion.** The object is a queue of people and it must never stop moving — target ≥50% event
  density at `--width 240`. People shuffling forward is large-area motion by construction, which
  is a better starting position than r007's 16% route-draw beat.
- **The close** must be performable on the phone in hand (r003's failure). Candidate: "count the
  trolleys, not the people" — the one thing that actually improves a lane guess.
