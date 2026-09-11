# SCRIPT — `I71`, "the one that started a hair's width away"

**GATE 4. Nothing is coded until this is approved.** One page, because it is a 12-second loop.

- **Runtime 12.0 s**, against the 28–54 s of every reel this account has posted. **The runtime IS
  the experiment** — see `gate0/GATE0.md` §4.
- **Accent** `#FF4D4D` (`failure`, §6), used on exactly one element from exactly the beat it breaks.
- **Two text moments. No narration. Nothing is explained.**
- **THE ONE RULER: there isn't one, and that is correct here.** No number is compared to another
  number. The only quantity on screen is the 3.3 s the two were identical.

## The script

| t | On-screen words | On screen | Why this beat exists |
|:--|:--|:--|:--|
| **0.0–0.8** | — | Two double pendulums released from 135°, drawn in **bone**, perfectly overlapping — they read as **one** pendulum. The tip begins tracing a bright path behind it. | Motion on frame 1. No title card, no setup, nothing to read. The hook is the object. |
| **0.8–3.2** | **ONE OF THESE IS A HAIR'S WIDTH OFF.** | Still one object, swinging chaotically, trace building. The viewer is now looking for a second pendulum and cannot find one. | **The promise** (non-negotiable 3), and the only thing that makes the first three seconds tense instead of merely pretty. "These" has an antecedent on screen — it is not r006's bare pronoun. |
| **3.2–4.5** | — | **Daylight.** The trace splits into two. One pendulum turns `#FF4D4D` and separates. Measured: 1 px at 3.28 s, 20 px at 4.45 s. | The payoff, and the entire reel. It is *shown* and never named. The failure accent arrives exactly on the beat something breaks. |
| **4.5–6.2** | — | They swing to completely unrelated positions — 150 px apart by 6.16 s. Both traces continue. | The hold, done as motion instead of stillness. |
| **6.2–11.0** | **YOU COULDN'T TELL THEM APART<br>FOR 3.3 SECONDS.**<br>**NOTHING WAS RANDOM.** | Two unrelated machines, both tracing. The bone path from the shared stretch is still on screen underneath. | The one piece of information in the reel, and it lands *after* the amazement rather than before it. Second line pre-empts the only objection: that one was nudged. |
| **11.0–12.0** | — | Text out. Both still swinging. Hard cut to frame 0. | The loop. |

## The loop is a HARD CUT, and that is honest

**A chaotic system cannot loop seamlessly** — by definition it never returns to its initial state.
So this does not pretend to: at 12.0 s it cuts back to two pendulums that are identical again.

**The cut is the point.** The restart re-delivers the surprise — you have just watched them become
unrelated, and now they are one object again. Nothing anywhere claims a seamless loop.

## What is claimed, and on whose authority

| On screen | Whose |
|:--|:--|
| "a hair's width" | 70 µm, mid of the cited 17–181 µm range for human hair |
| "couldn't tell them apart for 3.3 s" | **ours** — the last sample where tip separation is under ONE SCREEN PIXEL. **They were never identical**: they differed by 70 µm from t=0, so "identical" would have been false and 3.28 s is a display threshold, not a physical one. Caught by non-negotiable 7 before the build. |
| "nothing was random" | **ours** — one perturbation at t=0 and no noise term anywhere in the integrator |
| every position that moves | **ours** — RK4 at dt = 1/2000 s, energy drift 3.5 × 10⁻¹¹ of MgL |

## Pre-handover checklist

| Check | Status |
|:--|:--|
| Hook shows rather than promises | **Yes** — moving on frame 1, nothing to read |
| Names ride on objects | **Yes** — "these" points at the only thing on screen |
| Never more than three text blocks | **Yes** — max 2 |
| No jargon | **Yes** — "chaos", "Lyapunov", "sensitive dependence" appear nowhere |
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
