# `I64` — the queue you switched out of · SHELVED at Gate 3

**Built 2026-09-10. Never posted. Holds no reel number** — it was proposed as `r009`, that number
went to `I58` tides, and the build's compositions were renamed to `i64-queue` / `i64-queue-safe`
on 2026-09-10 so a shelved build cannot collide with a posted one. The render is
`i64_queue_shelved.mp4` (untracked by design — a shelved build is not a deliverable).

This file exists because **a failure record is worth as much as a build record**, and the verdict
on this one was living only inside r010's notes and `brand_guide_software.md` §13. Model:
[`../i53_flood/gate0/GATE0.md`](../i53_flood/gate0/GATE0.md).

## The Gate 0 sentence, human-approved

> **A single snaking line doesn't make the queue faster. Same tills, same shoppers — it just takes
> a quarter off your *worst* wait, because you can't get stuck behind one trolley while three tills
> clear beside you.**

Chosen by the human on 2026-09-10 over three alternatives, and it is deliberately not the version
pitched first. Full record in [`gate0/GATE0.md`](gate0/GATE0.md), including the three kill
conditions — which this concept **passed cleanly**, the first in its run to do so without argument
after `I52`, `r008` (twice) and `I24` all failed on "the amazement depends on understanding first".

## Why it was shelved

**Gate 3, on watching it: "the output is not sound."**

The build was mechanically excellent and that is the entire lesson:

| Check | Result |
|:--|--:|
| Event density (`reel_motion_audit.py`, `--width 240`) | **65%** — the best in the repo at the time |
| Longest dead spell | inside the 1.5 s limit |
| `emit_ts.py` asserts | 15 |
| `tsc --noEmit`, `brand:check` | clean |
| Gate 0 kill conditions | all three passed |

**It cleared every automated gate in the repo and a human still stopped it.** That is not the
audits failing; it is the audits doing exactly what they can do and nothing more. The motion audit
counts pixels changing. It cannot count whether a stranger can follow what the pixels mean, and a
65% density earned by many small figures shuffling is not the same as a legible race.

## What it taught, and where that lesson now lives

1. **A record motion score is not a quality result.** Recorded in `brand_guide_software.md` §13
   ("r010 — 99% event density is not a quality result"), which cites this build as its evidence:
   the two highest-scoring builds in the repo are a shelved one and a 190-view one.
2. **Density is a floor, never a target** — already the rule in
   `.claude/skills/new-reel/reference/validate-and-ship.md`; this build is its strongest case.
3. **Gate 3 earns its place on builds that pass everything else.** r007's pronoun hook, r008's whole
   framing and this reel were each caught only by a human watching.

## What is NOT concluded

- **Not that the concept is dead.** `I64` stays open in `content_backlog.md`. The sentence passed a
  human gate and the queueing simulation in `sim.py` / `trace.py` is real, verified work that a
  rebuild can reuse. What failed was the *execution*, and nobody has established which part.
- **Not that the figures were wrong.** They were not; `emit_ts.py` asserts fifteen of them.
- **Not a diagnosis.** "The output is not sound" is a verdict, not a cause. Nobody has since sat
  down to determine whether the fault was the visual metaphor, the pacing, the number of figures on
  screen, or the fact that a queue of abstract dots is not a queue of people (which would make it
  the `r005` "a bar chart is not a playlist" failure wearing a third costume). **A rebuild should
  start by answering that**, not by re-rendering.

## The build

```
sim.py          → stats.json        the queueing simulation
trace.py        → trace_data.json   per-frame state
emit_ts.py      → remotion/src/reels/data/queue.ts   15 asserts
gate0/          GATE0.md, mock_payoff.py, payoff_frame.png, chk_*.png
Queue.tsx       → i64-queue / i64-queue-safe
i64_queue_shelved.mp4
```
