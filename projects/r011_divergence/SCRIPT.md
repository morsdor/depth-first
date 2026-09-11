# SCRIPT — `I71`, "the one that started a hair's width away"

**GATE 4. Nothing is coded until this is approved.** One page, because it is a 12-second loop.

> ## CUT 2 — re-scripted 2026-09-11 after the GATE 5 verdict on cut 1
>
> **The verdict: _"what is the text on video supposed to say?? i do not understand it; how would i
> send this to anyone"_.** Cut 1 rendered, passed both audits, scored the account's best motion
> number, and said nothing. Two failures, both in the copy column of the table below, and both
> visible in it before a line of code was written:
>
> 1. **"ONE OF THESE IS / A HAIR'S WIDTH OFF."** is a plural pointing at a singular. Cut 1 drew
>    pendulum B in bone *on purpose* so the pair would read as one object — and then asked the
>    viewer to pick one of two. A viewer looks for the second thing and there isn't one. "OFF" also
>    had no stated reference: off from what?
> 2. **The sentence the reel is about was never on screen in any form** — two released from the same
>    place, nothing touched either, they ended up unrelated. Cut 1 animated the consequence and
>    reported a *duration* six seconds later, in the past tense, after the payoff was over.
>    "NOTHING WAS RANDOM." answered a question no viewer had asked.
>
> **The process lesson, and it is about this file.** This table has a "why this beat exists" column
> sitting next to the copy, so every line read as comprehensible *here* and incomprehensible on a
> phone: the column beside it supplied the context the viewer would never get. **Read the copy
> column alone, with the others covered.** That is the only way it is read at delivery.
>
> Cut 2 states the setup BEFORE the split and lets the split be the payoff. The physics, the data
> module and all twelve `emit_ts.py` assertions are unchanged — what changed is three lines of copy
> and which pendulum is visible when.

- **Runtime 12.0 s**, against the 28–54 s of every reel this account has posted. **The runtime IS
  the experiment** — see `gate0/GATE0.md` §4.
- **Accent** `#FF4D4D` (`failure`, §6), used on exactly one element from exactly the beat it breaks.
- **Three text moments, one at a time. No narration. Nothing is explained.**
- **THE ONE RULER: there isn't one, and that is correct here.** No number is compared to another
  number — **cut 2 puts no number on screen at all.** Cut 1's "3.3 SECONDS" was the only quantity
  and it was the least interesting fact available about the split.

## The script — CUT 2

| t | On-screen words | On screen | Why this beat exists |
|:--|:--|:--|:--|
| **0.0–0.6** | — | **Two** double pendulums, released from 135° and coincident to under a pixel: a solid **bone** pendulum wearing a **`#FF4D4D` ring** on each bob. One tip traces a path behind it. | Motion on frame 1. Two objects are on screen from frame 1, which is the whole fix to cut 1 — they are in the same place, and they are visibly two. |
| **0.6–2.1** | **TWO PENDULUMS.<br>RELEASED TOGETHER.** | Unchanged, swinging, trace building. | **The antecedent.** Named objects, plural, present and countable before anything happens to them. This is the sentence cut 1 never said. |
| **2.3–4.1** | **ONE STARTED<br>A HAIR HIGHER.** | Still one silhouette. The ring is still concentric. | **The one difference**, stated while it is still invisible — so the viewer is watching a controlled experiment rather than a graphic. |
| **3.28–4.5** | *(copy above still up)* | **Daylight.** The ring walks off the bone bob and becomes its own red pendulum with its own trace. Measured: 1 px at 3.28 s, 20 px at 4.45 s. | The payoff, and the entire reel. It is *shown* and never named, and it now lands on a setup the viewer already has. |
| **4.7–10.2** | **NOTHING ELSE<br>CHANGED.** | Two unrelated machines, both tracing; the wide dim bone ghost of the shared path still underneath. | The only claim the reel makes, and it lands *after* they are unmistakably two. Pre-empts the sole objection — that something else was done to one of them. |
| **10.2–12.0** | — | Text out. Both still swinging. Hard cut to frame 0, where they are one object again. | The loop. |

**Nothing crossfades in place.** The three text moments share one `top` and are strictly sequential
with a real gap (0.2 s, then 0.6 s); two type blocks dissolving through each other in the same spot
reads as a double exposure.

## The loop is a HARD CUT, and that is honest

**A chaotic system cannot loop seamlessly** — by definition it never returns to its initial state.
So this does not pretend to: at 12.0 s it cuts back to two pendulums that are identical again.

**The cut is the point.** The restart re-delivers the surprise — you have just watched them become
unrelated, and now they are one object again. Nothing anywhere claims a seamless loop.

## What is claimed, and on whose authority

| On screen | Whose |
|:--|:--|
| "two pendulums, released together" | **ours** — same equations, same solver, same release angle, identical initial state but for one nudge |
| "a hair's width" | 70 µm, mid of the cited 17–181 µm range for human hair |
| **"a hair HIGHER"** | **ours, and checked against the integrator rather than reasoned from the sign of the constant.** The perturbation adds +0.004011° to θ₁, and at a release angle of 135° a larger θ is *further from* the downward vertical — so B's elbow starts at y = +0.707107645 m against A's +0.707106781 m. **The approved copy said "LOWER" and that would have been false.** Non-negotiable 7 covers sentences, not just figures. |
| "nothing else changed" | **ours** — one perturbation at t = 0, no noise term anywhere in the integrator, both runs through the same RK4 |
| the split at 3.28 s | **ours** — the last sample where tip separation is under ONE SCREEN PIXEL. **They were never identical**: they differed by 70 µm from t = 0, so "identical" would have been false, and 3.28 s is a display threshold rather than a physical one. Cut 2 no longer quotes the number on screen at all; it is now a render timing, not a claim. |
| every position that moves | **ours** — RK4 at dt = 1/2000 s, energy drift 3.5 × 10⁻¹¹ of MgL |

## Pre-handover checklist

| Check | Status |
|:--|:--|
| Hook shows rather than promises | **Yes** — moving on frame 1, nothing to read |
| Names ride on objects | **Yes, and this is what cut 1 got wrong** — "TWO PENDULUMS" names two objects that are both on screen and both countable when the line appears |
| Never more than three text blocks | **Yes** — max 1 at a time, 3 in the reel, never overlapping |
| No jargon | **Yes** — "chaos", "Lyapunov", "sensitive dependence" appear nowhere |
| **The copy column read ALONE** | **Yes — added after cut 1.** "TWO PENDULUMS. RELEASED TOGETHER. / ONE STARTED A HAIR HIGHER. / NOTHING ELSE CHANGED." is a complete, self-contained thought with no help from any other column. |
| Every claim traced | **Yes** — table above |
| Civilian object, never left | **Yes** — a pendulum, every frame |
| Safe area · ground · motion | **Yes** |
| **Non-negotiable 5 — read/animate/hold** | **BROKEN ON PURPOSE.** No hold, no reading time. |
| **Non-negotiable 9 — end on a reason to follow** | **BROKEN ON PURPOSE.** An end card kills a loop. |

Those two need a knowing yes. They are in `gate0/GATE0.md` §7 as well.

## How it gets judged

**Average watch time ≥ 100% of runtime = the format works.** 20–60% = runtime was never the
variable, and the problem is the account rather than the format.

**Sends are expected to be ~0 and that does not falsify anything.** If this is judged by the send
test it fails now, for free, and should not be built.

## At upload

**Add trending audio in the Instagram composer.** Built silent like every reel since r003; for this
format sound is probably load-bearing, and trending audio is one of Instagram's own listed ranking
inputs. Free, and it keeps the reel at ₹0.
