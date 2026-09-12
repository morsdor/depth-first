# GATE 0 — `I72`, the zipper merge

**Written 2026-09-12, AFTER the measurement and before any animation code.** The research moved
the claim, so this records what the data actually supports rather than what the idea was pitched as.

## 1. The sentence — G2

> **"The lane-closed jam is three times longer than it needs to be, and the guy who drives to the
> front is saving twenty-five seconds and costing you nothing."**

Kill conditions, all three cleared:

| Kill condition | Verdict |
|:--|:--|
| needs a CS word | **No.** Lane, cone, queue, merge. Nothing technical survives in it. |
| payoff frame shows an object nobody has seen | **No.** A road from above with a lane closed — every driver has seen this from inside it, and most from a bridge or a dashcam. |
| amazement depends on understanding first | **No.** Two jams side by side, same traffic, one three times shorter. The picture lands before any sentence does. |

**Licence: none required.** There is no dataset. The road is synthetic, the demand is synthetic, and
the motion is the Optimal Velocity model integrated here. The only external numbers are published
work-zone capacity figures used to CHECK the model, and published figures are citable facts.

## 2. The send test — G3

**Who does the viewer send this to, and what are they proving?**

> **To the driver in their own family who blocks the closing lane on purpose — proving that the
> person they are blocking costs them nothing, and that the blocking is what makes the jam a mile
> long.**

Channel: **argument ammunition.** Graded against the three conditions that separated r005 from r006:

| Condition | `I72` |
|:--|:--|
| the viewer has personally witnessed the evidence | **Yes, repeatedly.** Every driver has sat in this queue and seen the empty lane beside them. |
| a dispute is already running | **Yes, and it is angry.** People straddle lanes to block late mergers; every driving forum has the thread; "zipper merge" campaigns exist because the public disagrees with them. |
| resolves to one repeatable thing | **Yes.** *Three times longer.* Carried into the argument without the reel. |

**This is the first reel since r005 to score 3 of 3.** r006 scored 1, r009 scored 1, r011 bent the
test by construction and sent at 0.124% against r005's 1.203%.

**Where it is weaker than r005:** flat earth is a fight people enjoy having in public, so the reel
was ammunition in a running spectacle. This fight happens in a car, between two people, and may be
sent privately rather than posted — which reads as a send but generates no comment thread.

## 3. The payoff frame

`gate0/payoff_frame.png` — the two jams at the same scale, same traffic, same moment.

## 4. What the research CHANGED, and this is the point of having a gate here

**The pitch was "the zipper gets everyone through faster." The model says that is false**, and it
says so in the cleanest possible way: **throughput is 1,400 veh/h either way, to three figures.** A
lane closure's capacity is set by the cone, and no merging discipline adds a single car to it. Had
this gone straight to a script, the reel would have shipped a false central claim — the `I15` and
`r001`-cafe-noise failure mode.

**What survived, and is stronger:**

1. **Throughput is identical.** Merging early gets nobody through sooner. The cone decides.
2. **The jam is 68% shorter** when everyone uses both lanes — 477 m against 1,494 m, the same
   traffic. Just under a mile becomes a third of a mile.
3. **The queue-jumper saves ~25 s and costs the others nothing measurable** — in the mixed run the
   compliant drivers were marginally *better* off than in the all-early run.
4. Total delay is **6% lower** when everyone zips. Real, but too small to be the headline.

**So the reel is not "the late merger is right".** It is *"your anger is aimed at the wrong thing,
and the thing you are doing is what makes the jam a mile long."* That is a better argument and it is
the one the data supports.

## 5. Falsification, stated in advance

The concept dies if the model says any of:

- throughput differs materially between the policies — it would mean the reel is about capacity, and
  the "nobody gets through faster" line is false. **Checked: identical.**
- the jam is not materially shorter under the zipper. **Checked: 68% shorter.**
- the queue-jumper imposes a large cost on everyone else, which would make the anger correct.
  **Checked: no measurable cost at 5%, and their own gain is only ~25 s.**
- the emergent work-zone capacity falls outside the published 1,400–1,600 veh/h/lane band, which
  would mean the model is not a road. **Checked: 1,487, unfitted.**
