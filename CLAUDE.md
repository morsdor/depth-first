# CLAUDE.md

**Repo for one thing: Depth First short-form reels** — `@thedepthfirst` on Instagram
(`brand_guide_software.md`). Everything in this file is about a reel unless it says otherwise.

> **The YouTube line was retired on 2026-09-10.** The Engineering Atlas (long-form historical
> engineering) is **dead**; Depth First long-form (`s001`) is **parked**, and may be revived.
> Both are preserved *in full* on the branch **`yt-longform-archive-DO_NOT_DELETE`** — the
> strategy and brand docs, the 7-pass studio skills, the Gemini generation code, the AE builders,
> the asset library, both project folders, and `remotion/src/{families,scenes,components,lib}`
> with `public/plates`. Nothing was deleted from history.
>
> ```bash
> git show yt-longform-archive-DO_NOT_DELETE:channel_strategy.md   # read one file
> git checkout yt-longform-archive-DO_NOT_DELETE -- <path>         # bring one back
> git switch yt-longform-archive-DO_NOT_DELETE                     # go and look
> ```
>
> **Any path this repo names that no longer exists is on that branch.** Do not recreate one from
> memory, and do not treat its absence as a bug. Details: [`docs/depth_first/repo_audit.md`](docs/depth_first/repo_audit.md).

---

## Short-form reels — start here

**Operating docs (2026-09-10): [`docs/depth_first/README.md`](docs/depth_first/README.md)** — state of
the account, the full pipeline map, the repo audit, the visual toolbox, module packs, and the growth
strategy with its experiment register. This file stays the law; those are the map.

### The promise is "how systems work" — NOT computer science (2026-09-10)

**The subject is any system whose mechanism can be shown running on real data.** Power grids,
water, tides, ports, railways, orbits, cities — all in scope. Software is one lane of it and has
been mistaken for the whole channel because `content_backlog.md` was written in one sitting by
someone thinking only about software.

**This is the explanation for three Gate 0 failures in a row.** `I52`, both cuts of `I15` and
`I24` all died on the same kill condition — *the amazement depends on understanding first* — and
that is not bad luck. **A software mechanism is invisible by nature**, so it always needs a
sentence of setup before the picture means anything, which is precisely the order Gate 0 forbids.
A physical system is visible by nature. The reel that reached ~66k is a map and a physical fact;
the one that reached ~1.8k is a map and a fact nobody argues about. Widening the subject is not a
new strategy, it is removing a constraint that was never real.

**Length: 30–60 s.** The 28–39 s reels shipped so far were not a format rule, and at ≈6.5 s per
idea 60 s buys eight or nine beats instead of four. Longer is permitted, never required — earn
each beat, and the retention cliff at 1.5–3 s is unchanged by the runtime.

**The backlog is a starting point, not the gate on inventing topics (revised 2026-09-11).** The
69 original ids were written in one AI-generated sitting and their figures are unverified — the
repo already knows this, from the `I54`–`I68` note and from the `I15` hook no real graph
supported. Treating that file as the gate on invention imports its blind spots, so **reasoning a
concept from scratch is allowed and expected**, alongside the backlog. `I70` (r009) was the first.

**What did NOT change: every built concept still gets a permanent id appended to
[`backlog/open.md`](backlog/open.md), with its section and therefore its accent, BEFORE the build
starts.** Ids are what the five logs resolve against; inventing the topic is free, skipping the id
is not. Physical-system ids usually land in §2 (`infrastructure`) or §6 (`failure`).

### THE REGISTER IS `backlog/`, AND POSTED IDEAS LEAVE THE LIVE LIST (2026-09-12)

**The root `content_backlog.md` was one file holding live candidates, shipped reels and dead ideas
together**, so reading it meant filtering out 15 spent ids to reach the 56 that were open. It is now
a pointer, and the register is three files — see [`backlog/README.md`](backlog/README.md):

| File | What is in it |
|:--|:--|
| **[`backlog/open.md`](backlog/open.md)** | **the live list — candidates only. The only file to read when picking a reel** |
| [`backlog/posted.md`](backlog/posted.md) | ids that reached the feed |
| [`backlog/closed.md`](backlog/closed.md) | retired, killed by a gate or by its own data, built and shelved, or **parked by the owner** |

**WHEN A REEL POSTS, ITS ROW MOVES TO `posted.md` THE SAME DAY.** That is now part of the shipping
checklist alongside the "Built so far" table, `reel_captions_log.md` and
`brand_guide_software.md` §13. **Ids are permanent and are never reused** — moving a row between
these files never changes its id, which is what lets an old engagement log resolve. Every row
carries an `Added` date.

**When asked for "a new reel", bring both — the live candidates from `backlog/open.md` and anything
reasoned from scratch that beats them.** **82 ids `I01`–`I82`**, grouped into six sections that map
1:1 onto `DOMAIN_ACCENT` in `remotion/src/brand/tokens.ts` — so the section *is* the accent colour
decision. Live counts come from the script, never from this line:
**11 posted · 6 closed · 65 live** (2026-09-12; 82 ids, `I01`–`I82`).

**`PARKED` IS A STATE AND IT IS NOT A FAILURE (2026-09-12).** `I65` (the traffic reel, built as a
46 s cut) and `I72` (the zipper merge, researched to a measured table and an approved script) were
**set aside by the account owner** — not killed by a gate, not falsified by a number. That is a
fourth thing and it reads differently: the concept stays intact and only the execution stops. Both
rows moved to `backlog/closed.md` marked `[PARKED]`, **each naming the commit its code sits in**
(`18020c6` and `add9b44`) so the work is one `git checkout` away and no measurement is ever repeated.
Their builds are deleted from the tree, which is the same treatment `I51`, `I15` and `I64` got.

**`I72`–`I82` were minted 2026-09-12 on a single filter: does it feed an argument people are already
having.** That is the account's only evidence-backed lever — r005 sends at 1.203% of reach and has
157 follows, against 3 from every other reel combined. Each of those rows carries its GATE 3 answer
in the note beneath it; an id with no named send channel is not a candidate.

**The procedure for all of this is the [`new-reel`](.claude/skills/new-reel/SKILL.md) skill —
`/new-reel`.** It lists the live candidate ids with their real status
(`python3 .claude/skills/new-reel/scripts/backlog_ideas.py`), runs the reasoning that shortlists
them, and then walks Gate 0 → research → build → render → audit → the five logs, stopping at each
of the three human gates. This file stays the law; the skill is the sequence.

- **Ids are permanent.** Never reuse an id for a different concept. Retire with
  "(retired — date, reason)"; the row stays so old logs resolve.
- **The "open with these eight" are nearly used up.** `I01 I02 I03 I17` are built (r003, r001,
  r004, r005) and `I15` is retired, so **only `I25`, `I31` and `I42` remain**. They were chosen to
  cover all six sections as a pillar test; with five gone that job is mostly done, and the argument
  test below now matters more than finishing the list. `I42` was the s001 warm-up — s001 is parked
  on the archive branch, so `I42` is now just a strong `§5 ai` candidate on its own merits.
- **Propose the id and confirm before building.** A reel is a day of work; don't guess which one.

### Gate 0 — the friend test. Runs BEFORE any code, and it is not mine to pass.

Nothing is built — no Python, no `.tsx`, no data module — until these two things exist and the
**human has said yes**:

1. **The sentence.** One sentence, in a normal person's words, that a viewer would say to a friend
   after watching. Not a description of the reel. The thing they'd repeat at dinner.
2. **One still of the payoff frame.** Drawn by hand or in PIL, in five minutes. Not a render.

**Three kill conditions. Any one of them ends the concept — pick a different id, don't repair it.**

- **The sentence needs a CS word.** "Shuffle bias", "hash", "index", "edit distance", "quantise".
  If the sentence cannot survive without it, the idea has no civilian surface and never will.
- **The payoff frame shows an object the viewer has never seen.** A matrix, a bar chart, a grid of
  abstract cells, a graph — these are pictures *of* an idea, not the thing itself. A city map, a
  photograph, a keyboard, a song, a lock, a queue of people: those are objects. The test is whether
  a stranger can name what is on screen with the sound off and no labels.
- **The amazement depends on understanding first.** If the viewer has to follow an argument before
  the frame is impressive, it is a blog post. The `equation.verse` reel at 131,000 likes is a real
  Berlin street map flooding with a pathfinding search — you are amazed *first*, and understanding
  is the reward for staying. That order is not optional and it is not reversible.

**I do not pass this gate.** I wrote the sentence, so I already know what it means, and I cannot
un-know it to judge whether a stranger would. The human says yes or no, in under a minute. That is
the entire cost of the gate, and it replaces a day of building the wrong thing.

**Ask about the SENTENCE, not the picture — I15, 2026-09-10.** I15 passed this gate on the
question *"does a stranger know that's a city and want to know why the blue spread everywhere?"*
and the answer was yes, because the picture was genuinely good. It was built, and the verdict on
watching it was **"I didn't understand the point. We are comparing 2 algos?"** — which was exactly
right: its sentence was *"that one change is the difference between checking 17,000 junctions and
checking 1,700"*, a fact about algorithmic efficiency that nobody would ever repeat to a friend.

A beautiful payoff frame will carry a bad sentence straight through this gate. **The gate question
must be "would you say this sentence to someone?", and the frame is only there to prove the
sentence can be shown.** The order matters: sentence first, frame as evidence for it.

**Why this exists — I51, five rebuilds, 2026-09-07/08.** Every rebuild raised rigor and lowered
recognition: v1 drew 16 coloured bars, v5 drew a 13x13 landing-position matrix measured over 400,000
shuffles. v5 is the more honest reel and it is the less watchable one, because no viewer has ever
seen either object. The verdict that ended it — *"anyone who sees that will not understand even a
single word; nobody knows what it is for"* — was given five times before it was heard, because each
time it was answered with a craft fix. **Every other gate in this file can be checked by me alone,
which is exactly why the one that decides whether the reel works had to become a human gate.**
Machine-checkable rigor is the thing I will drift toward if nothing stops me.

**A subject whose defining property is that it is invisible cannot pass this gate.** The naive
shuffle's whole point is that nobody can see the bias and no test catches it. That is a good essay
and a bad reel, and recognising it early is cheaper than five rebuilds.

### SCRIPT FIRST. Nothing is coded until a script is approved. (2026-09-11)

**r009 was cut three times — v1 53 s, v2 40 s, v3 40.4 s — and every one of those cuts was a
SCRIPT problem found after a full build, render and audit.** v2 fixed the message. v3 fixed the
hook. Both were correct fixes and both cost a complete build cycle to discover, because Gate 0
approves a *sentence* and the next human read is of a *finished reel*. Everything in between is
mine alone, and everything expensive lives in between.

**The gates, in order. Never run ahead of one.**

```
G1  the id ............ human picks it
G2  the sentence ...... human says yes         (Gate 0 — friend test, 3 kill conditions)
G3  THE SEND TEST ..... human names the person  ← NEW · HARD · costs one sentence
    research & measure ...................... a figure can still kill it (I53 died here)
G4  THE SCRIPT ........ human approves it       ← NEW · HARD · costs one page, two minutes
    build → render → audit .................. the script is now a CONTRACT
G5  the render ........ human watches it end to end
```

**G4 — the script — is a table, not prose, and it is written before any Python, `.tsx` or data
module exists:**

| t | Narration (the on-screen words, verbatim) | On screen | Why this beat exists |
|:--|:--|:--|:--|

Every beat, every line of copy, every number, the runtime, the hook and the close. The human reads
it in two minutes and says yes or no. **`projects/r009_emptiness/SCRIPT.md` is the model** — it was
written *after* the fact and it is exactly what should have existed before.

**READ THE COPY COLUMN ALONE, WITH THE OTHER COLUMNS COVERED — r010, 2026-09-11.** The table's
"why this beat exists" column sits next to the copy and silently supplies the context the viewer
will never get, so a line that means nothing on a phone reads as perfectly clear *in the table*.
r010 cut 1 passed G4, rendered, passed both audits with the best motion number on the account, and
drew the verdict *"what is the text on video supposed to say?? i do not understand it"*. Its copy
was **"ONE OF THESE IS / A HAIR'S WIDTH OFF."** over what was deliberately drawn to look like a
single pendulum — a plural pointing at a singular — and the sentence the reel was actually about was
never on screen in any form. **The copy column, read by itself, must be a complete thought.** That
check is one minute and it is now part of G4.

**AN APPROVED SCRIPT DOES NOT MAKE A CLAIM TRUE.** r010's re-cut copy was approved as "ONE STARTED
A HAIR LOWER" and the integrator says higher. Non-negotiable 7 outranks G4 and it covers sentences,
not just figures — check the copy against the data *after* it is approved, and change the word.

**Once approved, the script is the contract and the animation serves it.** If a beat cannot be
animated as scripted, that goes BACK to G4 as a script change — it is never solved by improvising
at build time. Improvising at build time is how v1 ended up with seven different rulers.

**Why this is not just another gate: it is where the cost is.** A build-render-audit cycle is
hours of wall time and the single largest token cost in the repo. A script is one page of markdown.
Three of r009's cycles were spent discovering things a two-minute read would have caught.

### GATE 3 — the send test. It is now BINDING. (2026-09-11)

**"Who does the viewer send this to, and what are they proving?" has predicted five outcomes in a
row — r006, r007, r008, r009 ×2 — and has never once stopped a build.** That is not a filter, it
is a prediction log. It is now a gate: **no answer, no build.**

**The platform mechanic that makes it real** (full evidence and grading:
[`docs/depth_first/what_travels.md`](docs/depth_first/what_travels.md)): Instagram ranks on watch
time, **likes per reach** and **sends per reach**, as ratios to reach. **Sends are what reach people
who do not follow you** — reported at roughly 3–5× the weight of a like for unconnected reach.
Likes move you within your own followers; sends are how a reel escapes the pool it was tested in.

Our own numbers say the same thing. r009 v3 **likes at 2.92% of viewers against r005's 2.79%** —
the people who see it like it as much as they liked the reel that did 66k. It has **0.00% sends
against r005's 0.92%**. It is not liked less. **It does not travel.**

**The answer must name a channel.** Berger & Milkman (JMR 2012) find sharing is driven by
high-AROUSAL emotion — awe, anger, anxiety — with low-arousal emotion (sadness) suppressing it,
and practical utility and surprise independently positive:

| Channel | The test | Ours |
|:--|:--|:--|
| **Argument ammunition** | a dispute is already running and this settles it | **r005** — your uncle, that the earth is round |
| **High-arousal novelty** | awe/anger/anxiety at something genuinely UNFAMILIAR | r009 aimed here and missed |
| **"This is you"** | sent to one person because it is about them | none yet |
| **Practical utility** | the viewer will actually use it | none yet |

**Awe is not enough on its own, and r009 is the proof.** Cosmic scale is the canonical awe
stimulus and it got zero sends, because **arousal requires novelty** — in a saturated genre the
response is recognition, not awe. Check the channel against the genre, not just the subject.

**Measure sends per reach, never views.** r005 is the only benchmark: **1.20% at day 4**, revised up
from the 0.92% read at day 1. Everything since is zero or near it — r010, the best of them, sends at
**0.124%**, which is **9.7x below** it.

**AND THE BENCHMARK ROSE AS IT SPREAD, WHICH IS THE WHOLE MECHANISM (2026-09-12).** Between day 1
and day 4 r005's reach grew **2.12x** and its shares grew **2.77x** — share rate **0.921% → 1.203%**.
Engagement rates normally DILUTE as a post escapes its warm pool into colder audiences, and r010's
cold Reels-tab traffic is what dilution looks like. r005 did the opposite: **the further it
travelled, the more sendable it got**, because the further it travels the likelier it lands on
somebody who has an argument to settle with it. A reel that is sent does not plateau — each send
opens a pool the algorithm never tested. **That is the difference between 94k over four days and
3.5k in eight hours**, and it is a property of the CONTENT, not of the push.

### GATE 3 IS NECESSARY, NOT SUFFICIENT — r011 tested a full score, and it failed (2026-09-12)

**Every GATE 3 answer up to `r011` was tested by a reel with ONE named channel, or none.** `r011`
named **three** — argument ammunition, "this is you", practical utility, the best score any reel
has carried into a build — and it is the cleanest test the gate has had. Result: **sends 0.041%
(1 share, 2,422 viewers)** — below `r010`'s already-poor 0.124%, **29x below** r005's 1.203%
benchmark, and inside the **<0.2%** band `r011`'s own pre-registered reading (written before
posting, `projects/r011_boarding/NOTES.md`) named as falsifying the current thesis.

**Five correct predictions of a MISSING channel — r006, r007, r008, r009 ×2 — is a different claim
from "a full score guarantees travel", and `r011` is the first test of the second claim.
It failed.** The gate stands as a floor, unchanged: nothing here suggests a reel with no channel
would have done better. What is now falsified is treating a named channel as sufficient on its own.

**The likely missing variable is HEAT — how much the loser of the dispute stands to have taken from
them.** Flat earth is identity-loaded: being wrong marks you as someone who doesn't understand how
the world works, and correcting your uncle is a status move as much as an informational one.
Boarding order is annoyance-loaded, not identity-loaded — nobody's self-concept is at stake in
whether they believe airlines board efficiently. `r011` met every written condition in "pick a
fight, not a gap" and still didn't move, because that filter never asked what losing the argument
COSTS the other person. **The next id picked on this filter should also answer: what does the
person on the other side of this lose if they're proven wrong?**

**SAVES AND SHARES ARE DIFFERENT CHANNELS AND DIVERGED ON `r011` — measure them separately.** Share
rate: "Lower" than the account's own typical (argument ammunition failed). Save rate: **"Higher"**
(practical utility partly worked, even with nothing sent). GATE 3's table conflates both into one
"sends" line; a reel that names multiple channels should be graded on a metric per channel, not one
number standing in for all of them.

### Pick a fight, not a gap (r005 vs r006 — the belief-correction test FAILED)

**r006 was the pre-registered test of the "correct a belief" pattern and it failed.** Built to all
five points, better motion numbers than r005, and it peaked at **~1.8k views against r005's ~66k**.
The stated fallback explanation — that the engine was the map and Explore's geography audience —
died with it, because r006 is also a map.

**What r005 actually had, per its comments: it landed inside the flat-earth argument.** The curved
flight path on a flat map is the most-cited exhibit on both sides of that fight, so the reel was
usable as evidence in a dispute already running. r006 corrected a belief nobody argues about.

**Three conditions, all required** (full reasoning in `brand_guide_software.md` §13):

1. **The viewer has personally witnessed the evidence** — seen it themselves, repeatedly. The
   seatback map. The blue dot. The shuffle that repeats an artist.
2. **A dispute is already running.** Somebody is publicly wrong about this on a regular basis and
   somebody else corrects them. If you cannot picture the argument, there isn't one.
3. **It resolves to one repeatable thing** — one number, ratio or subtraction, carried into the
   argument without the reel.

**Ask before building: who does the viewer send this to, and what are they proving?** r005: your
uncle, that the earth is round. r006: nobody, nothing. **No answer means the reel gets liked and
forgotten.** This is n=1 against n=1 and is not a law — but it is the cheapest available filter,
and it costs one sentence to apply.

**It does not license chasing conspiracy content.** The engine is "settles a live argument"; flat
earth is one arena and most others are cheaper and less toxic. Also unresolved and worth checking
before optimising for reach: whether r005's 71 follows stayed, and whether they watched r006.

### Built so far

| Reel | Backlog id | Subject | State |
|:--|:--|:--|:--|
| `r001` | `I02` | Shazam fingerprinting | **posted 2026-09-02** |
| `r002` | `I08` | Autocorrect / edit distance | **posted 2026-09-02** |
| `r003` | `I01` | QR / Reed–Solomon damage tolerance | **posted 2026-09-05** (without the end beat) |
| `r004` | `I03` | JPEG / DCT — a photo stores no pixels | **posted 2026-09-06** |
| `r005` | `I17` | Great circle — the flight path that looks curved is the straight one | **posted 2026-09-08** (32 s) — first reel built under Gate 0; **94,171 views / 69,816 viewers and 157 follows at day 4 (2026-09-12), still climbing.** The account's only hit, and the only reel that has produced follows at all: every other reel r001–r010 combined has produced **3** |
| `r006` | `I22` | Submarine cables — your message abroad goes underwater, not to space | **posted 2026-09-09** (28 s) — peaked ~1.8k views; the r005 pattern test, and it failed |
| `r007` | `I58` | Tides — the Sun pulls 179x harder and the Moon still makes the tide | built 2026-09-10 (54 s), **posted 2026-09-10** — 189 views · 4 likes · 1 follow at first reading; first reel outside software, and the longest |
| `r008` | `I69` | Pendulum wave — fifteen strings, and the thirty seconds they take to come back | built 2026-09-10 (34 s), **posted 2026-09-10** — 190 views · 0 engagement at first reading; first reel with a Manim layer; rebuilt down from a 60 s cycle after the first viewer could not tell the fifteen strings apart |
| `r009` | `I70` | Scale — the biggest star ever measured is a speck in the gap to the next one | **posted 2026-09-11 (40 s), then RE-CUT AND RE-POSTED the same day as v3 (40.4 s)** — first 3D reel (`@remotion/three`) and first topic invented rather than taken from the backlog. Built at 53 s and **re-cut the same day**: the Gate 3 verdict was *"I had a hard time understanding what it had to convey. We don't know what we are comparing against."* — the account's first Gate 3 failure on MESSAGE rather than concept or craft. One ruler replaced seven, every sphere got its own name, and the wide third was cut. See [`projects/r009_emptiness/SCRIPT.md`](projects/r009_emptiness/SCRIPT.md) |

| `r010` | `I71` | Two double pendulums released one human hair apart — the same object for 3.3 s, then unrelated | **POSTED 2026-09-11/12 (12 s), after a same-day re-cut.** First reel in the loop format and the account's **first pre-registered experiment**. Cut 1 passed both audits with the best motion number on the account and **failed GATE 5 on its copy** — *"what is the text on video supposed to say?? i do not understand it"*. **The result at ~8 h: 3,546 views / 2,429 viewers — second-best reach ever — average watch 8 s on 12 s (66.7%), and views per viewer 1.460 against r005's 1.423. The rewatch bet FAILED: runtime was not the variable.** Like rate 0.247% against r005's 2.786%. See `brand_guide_software.md` §13 "THE LOOP FORMAT RETURNED A RESULT" and [`projects/r010_divergence/NOTES.md`](projects/r010_divergence/NOTES.md) traps 11–14 |

| `r011` | `I73` | Aeroplane boarding — back to front is slower than no order at all | **POSTED 2026-09-12 (45 s)**, GATE 5 on the first cut — *"a great video … I absolutely love it"*. **First reading ~6 h later: 2,913 views / 2,422 viewers, 98.3% cold — and sends at 0.041%, the SEND TEST'S FIRST FALSIFICATION on a reel that scored 3 of 3 named channels.** Skip rate flagged "Lower" (the hook worked); saves flagged "Higher" while shares were "Lower" — practical utility partly travelled, argument ammunition did not. See "GATE 3 IS NECESSARY, NOT SUFFICIENT" above and [`projects/r011_boarding/NOTES.md`](projects/r011_boarding/NOTES.md) |

| `r012` | `I84` | Earnings by age — median US pay peaks at 46 and, past 55, tracked on the same people, never comes back | **POSTED 2026-09-12 (Saturday night) (32 s)** — the "this is you" data-reel format test, Gate 0 kill condition 2 (chart as payoff) deliberately waived in writing. **First reading: 2,421 views / 2,092 viewers, 2 likes, 1 share, 1 follow — like rate ~0.10%, the lowest on the account, against the pre-registered failure case of merely "liked at a normal rate".** The format's own bet (self-relevance → watch time/saves) has no supporting read yet; on likes and sends alone this reads as a clean failure, worse than the pre-registered floor. **First reel with a majority Tier-1 audience — USA 23%, India 7% — a first for this account**, worth separating the format question from the audience-mix question before drawing a verdict. See [`projects/r012_earnings/NOTES.md`](projects/r012_earnings/NOTES.md) and `brand_guide_software.md` §13 |

| `r013` | `I81` | Breath — you don't sweat fat off, you breathe it out | **POSTED 2026-09-16 (37 s), RE-CUT AND RE-POSTED 2026-09-17 (39 s).** Argument ammunition (Meerman & Brown, BMJ 2014: 84% of lost fat mass is exhaled as CO2, 16% becomes water), independently re-derived from a real balanced equation (C55H104O6 + 78 O2 → 55 CO2 + 52 H2O) rather than cited — 84.25%/15.75% computed, within 0.25 points of the paper; `emit_ts.py` carries 22 asserted on-screen claims. **Cut 1: 159 views, avg watch 5s/37s (13.5%), skip rate 58.4% "Higher".** Re-cut same-shape as r009's fix (a flash-forward front-loading the real payoff numbers, plus a fuller body). **Cut 2 (posted): 197 views, avg watch 3s/39s (7.7%), skip rate 83.3% "Higher" — WORSE on every retention metric, falsifying the hook-reorder hypothesis rather than confirming it.** Read as a content/heat floor, not a craft floor — see "A HOOK FIX MADE RETENTION WORSE" in `brand_guide_software.md` §13 and [`projects/r013_breath/NOTES.md`](projects/r013_breath/NOTES.md) |

| `r014` | `I31` | BGP hijack — one country tried to block YouTube for itself, and broke it for the whole world | **GATE 5 passed, POSTED 2026-09-18 (44 s).** First-ever GATE 3 pass on pure high-arousal novelty with no argument-ammunition leg, pre-registered against `r009`'s reading rather than sends (`projects/r014_hijack/gate0/GATE0.md` §9). **First reading: 1,949 views / 1,531 viewers, average watch 16 s/44 s (36%), 6 likes, 0 comments, 0 shares, 3 saves, 2 follows.** Like rate 0.4% ("Lower" than typical) — well under `r009`'s 2.92%, in `r010`/`r012`'s failure band rather than `r009`'s "liked normally, didn't send" shape. Skip rate 33.5% ("Lower" — hook held) and save rate 0.2% ("Higher") are the only lifts; sends 0.0%, continuing the account's run of zero-send readings outside `r005`. **Falsifies the hypothesis that genre saturation, not the novelty channel itself, was `r009`'s problem.** See [`projects/r014_hijack/NOTES.md`](projects/r014_hijack/NOTES.md) and `brand_guide_software.md` §13 |

| `r015` | `I77` | Mirrors on the Moon — there are real retroreflectors up there, and observatories still bounce lasers off them | **GATE 5 passed, POSTED 2026-09-18 (45 s).** Strongest GATE 3 send-test answer on the account since `r005` — settles moon-landing denial with a real, ongoing measurement, not a photo — and also the most toxicity-exposed candidate on the backlog by its own Gate 0 note. Absorbed the older, unverified duplicate `I63`. Every figure VERIFIED against APOLLO's own instrument papers, an LLR round-trip-loss review, and Eos.org's recession feature: round-trip light time 2.5644s (exact physics), ~3.1×10¹⁷ photons sent per pulse vs 5-10 typically returned, ±1mm ranging precision, 3.83 cm/year recession over 57 years of data. Four real build bugs found and fixed before render — an oversized arrival "spot," unbounded ambient rotation that quietly ruined the wide shots by the close beat, the off-focus body swinging into Instagram's header band during a dive, and a since-miscalibrated ping marker that grew to dwarf the Moon. See [`projects/r015_moonmirrors/NOTES.md`](projects/r015_moonmirrors/NOTES.md). Engagement pending first reading |

**Reel numbers are contiguous and mean "the Nth reel posted".** `r001`–`r015` have shipped.
**`r011` claimed its number when the first `.tsx` was written, not when its Gate 0 was** — the
rule as written, and what `I72` had just shown the cost of getting wrong. **The next reel is
`r016`.**

**THE PENDULUM LOOP WAS `r011` UNTIL 2026-09-12 AND IS NOW `r010` (2026-09-12).** The traffic reel
(`I65`) held `r010`, was never posted, and was **parked by the account owner** on 2026-09-12 along
with the zipper merge (`I72`); both rows are in [`backlog/closed.md`](backlog/closed.md) with the
commit their code sits in. A number is claimed when a build starts and **released if the build is
abandoned**, so `r010` went back and the tenth reel POSTED took it — which is the rule this file
already carried, applied. `I71` is unchanged, and ids are what the five logs resolve against, so
nothing in the ledger breaks.

**A re-post does NOT claim a new number.** r009 was posted at 40 s, re-cut after its watch-time
reading, and posted again the same day at 40.4 s. That is one reel with two posting events, not
two reels — the number belongs to the concept, not to the upload.

**Three built reels were never posted and were deleted on 2026-09-10** — the shuffle bias (`I51`,
five rebuilds), A\* vs Dijkstra (`I15`, which failed the sentence test after being built) and the
shelved queue (`I64`). Their project folders, components and data modules are gone from the tree and
remain in git history.

**The number is claimed when a build starts and released if the build is abandoned.** Claiming it
at build time is what stops two builds colliding; releasing it is what keeps the sequence gapless.
**An unpublished build has no reel number and is called by its backlog id** — which is what ids are
for. `I51` and `I15` briefly held r005 and r008; those numbers now belong to the great-circle and
pendulum reels, and everything those builds taught is in `brand_guide_software.md` §13 under their
ids.

### Where things live — the whole repo (2026-09-10)

```
depth-first/
├── CLAUDE.md                    the law — this file
├── README.md                    what this is, how to run it, where the YouTube line went
├── content_backlog.md           A POINTER — the register moved to backlog/ on 2026-09-12
├── backlog/                     the reel idea register. open.md is the live list
│   ├── open.md                  LIVE CANDIDATES ONLY — the only one to read when picking
│   ├── posted.md                ids that reached the feed; a row moves here on posting day
│   ├── closed.md                retired / killed / shelved — rows stay so old logs resolve
│   └── README.md                the rules, the counts and the Added dates
├── brand_guide_software.md      §13 is the ledger: every dated lesson, incl. retracted ones
├── reel_captions_log.md         caption, hook line, load-bearing phrasings, engagement per reel
├── insta_strategy.md            superseded premise, surviving evidence — read its status banner
├── requirements.txt             numpy · Pillow · matplotlib (Manim has its own venv)
│
├── projects/r<NNN>_<name>/      A REEL THAT SHIPPED. r001…r008, contiguous, in posting order
│   ├── gate0/                   GATE0.md · mock_payoff.py · payoff_frame.png
│   ├── <compute>.py             the real algorithm; prints every figure; asserts its invariants
│   ├── <name>_data.json         its dumped intermediate state
│   ├── emit_ts.py               packs JSON → TS and REFUSES to write if a claim is false
│   ├── NOTES.md                 figures with provenance · beats · gate numbers · traps
│   └── r<NNN>_<name>.mp4        the render — tracked, so it can reach a phone
│
├── gate0/i<NN>_<slug>/          A WRITTEN GATE 0 WITH NO SHIPPED REEL — in gate, or killed
│                                I33, I52 in gate · I53 killed by its own data
│
├── remotion/
│   ├── src/reels/               one .tsx per reel + lib/chrome.tsx (the shared chrome)
│   │   ├── lib/chrome.tsx       SAFE area · ReelGround · useBreath · ReelHeader · Readout
│   │   ├── lib/manim.tsx        ManimLayer — plays a transparent PNG sequence
│   │   └── data/                GENERATED TS modules — never hand-edited
│   ├── src/brand/tokens.ts      palette · easing · type scale — brand:check enforces it
│   ├── src/Root.tsx             16 compositions: 8 reels × (plain + -safe), plus manim-probe
│   └── public/{fonts,reels,manim}/   vendored fonts (renders are offline) · audio · PNG layers
│
├── scripts/
│   ├── reel_motion_audit.py     dead spell ≤ 1.5 s · event density (run at DEFAULT --width 240)
│   ├── reel_safe_audit.py       any content outside x 60–870 / y 270–1540, on the mp4
│   ├── manim_render.py          Manim scene → transparent PNG sequence for ManimLayer
│   └── manim_probe/             the Manim→PNG→Remotion bridge smoke test. NOT a reel
│
├── docs/depth_first/            the operating docs — start at README.md
├── docs/comps/                  equation.verse and @CodeSource teardowns
├── data/                        the *_software competitor evidence
└── assets/{brand,fonts}/        the wordmark and the type
```

**A concept lives in `gate0/` from the moment its Gate 0 is written and moves to
`projects/r<NNN>_<name>/` when the build starts and claims its number.** If a build is abandoned it
is deleted and its number is released, which is what keeps `r001`–`r008` gapless.

**When one ships, update all four:** this table, `brand_guide_software.md` §13,
[`reel_captions_log.md`](reel_captions_log.md), and **move the id's row from
[`backlog/open.md`](backlog/open.md) to [`backlog/posted.md`](backlog/posted.md)**.

**r003 shipped without the end beat** — it was added to `Qr.tsx` after the reel was posted, so the
`I03` line in that file is a plan, not a public promise.

**`I15` was built (2026-09-10, never posted, since deleted) and its numbers were nothing like the promise.** r004 shipped
promising "300 roads, not 300,000". A real graph does not do that: on 26,193 junctions of central
Paris, Arc de Triomphe to Notre-Dame, Dijkstra expands **17,092** and A* expands **1,700** —
**10.1x**, not 1000x. Manhattan gave only 3.6x. **Treat every backlog figure as a research lead,
including the ones in the hooks.**

The block that deferred it — `overpass-api.de` and every other OSM host refused by the cloud
container's egress proxy — does not apply on a local machine. Overpass also answers urllib's
default User-Agent with **HTTP 406**, so `fetch_graph.py` identifies itself and falls back across
three mirrors.

### Gate 0 also has a licence question (added 2026-09-09, from `I22`)

**Before building, check that the data source may actually be used.** r006's
route was first measured out of TeleGeography's submarine-cable API; their policy
permits screenshots of the published maps under CC BY-SA 4.0 but restricts "the
underlying databases" to paying subscribers, so the whole build had to be
re-sourced after Gate 0 had already passed. It survived only because a route
rebuilt from public geography alone — real ports and the chokepoints between
them — landed within 1.4% of it.

**Published figures are facts and are citable. Route geometry is a database.**
That distinction is what let r006 keep naming MAREA and IMEWE and quoting their
lengths. Ask the licence question next to the friend test, not after it.

### The method: compute the animation, don't author it

Run the **real algorithm** in Python, dump its intermediate state to JSON, pack it to a TS module,
play it back in Remotion. See `projects/r001_shazam/` for the reference shape
(`fingerprint.py` → `emit_ts.py` → `emit_audio.py` → `remotion/src/reels/Shazam.tsx`).

On-screen numbers are then free and correct because the run produced them. **₹0 — no image model is
involved in a reel.** Keep it that way.

### RE-RUN SOMEBODY ELSE'S EXPERIMENT. The strongest claim is not ours. (2026-09-12, r011)

**Every reel up to `r011` computed its own claim, and that is the expensive way to be right.** If
the model is the only evidence, then the model is also the only thing standing between the reel and
a false central sentence — and `I72` is what that costs: a day of research, an approved script, and
a pitch ("the zipper gets everyone through faster") falsified by our own simulation the moment it
ran.

**`r011` inverted it. The headline is a published field test** — 72 real people, a mock 757,
five boarding methods, timed (Steffen & Hotchkiss, JATM 18 (2012) 64–67) — **and the simulation's
job is to show the MECHANISM behind a result that is already in.** That removes the whole failure
class. The claim cannot be falsified by our own model, because it was never ours; what the model can
do is fail to reproduce it, which is a cheap and early signal rather than a dead build.

**When a published measurement of the thing exists, prefer this shape.** The reel gets three things
it cannot otherwise have:

1. **The claim is somebody else's**, so "we measured it" becomes "they measured it, and here is
   why it happens" — which is a stronger sentence and a more sendable one.
2. **An unfitted validation is available.** Our agent model landed **−1% on back-to-front and −8%
   on random** with parameters chosen before any comparison was run. That number is only sayable
   because an outside measurement existed to say it against.
3. **The mechanism is the reel's own contribution**, and it is the part no published table contains.

**It does not license citing instead of computing.** The animation is still the real model, run —
`₹0`, no authored frames. And a citation carries its own confound: **if such a reel travels, it may
be the "they actually tested this" credibility doing the work rather than the send channel.** That
confound is registered in advance in `projects/r011_boarding/NOTES.md`; register it again next time
rather than concluding from one post.

### 3D BY DEFAULT — `@remotion/three` (2026-09-11)

**Every reel is built in 3D unless there is a stated reason not to.** Directed by the account
owner: *"it just adds a layer of awe."* `r009` proved the stack works (`@remotion/three`,
`<ThreeCanvas>`, `Config.setChromiumOpenGlRenderer("angle")`) and the quality verdict on it was
unambiguous even when the message failed.

**Two things this does NOT license, both already paid for once:**

- **Awe is not distribution.** `r009` was the account's first 3D reel, drew the best craft verdict
  it has ever had, and posted the worst reach. Awe without a send channel does not travel —
  `docs/depth_first/what_travels.md` §B. 3D raises the ceiling on a reel that already answers
  GATE 3; it never substitutes for the answer.
- **3D must not cost legibility.** If the thing the reel is about reads more clearly from one
  angle, the camera goes to that angle and stays there. A wave travelling backwards through a
  line of cars reads from above and nowhere else, so the reveal beat of the parked `I65` traffic
  build was near-top-down and the dimensionality was spent on getting there — driver's eye on the
  road, rising as the road bends into the ring — rather than on the moment carrying the claim.

**The camera is animated by moving the ROOT GROUP, not the camera.** `<ThreeCanvas>` takes its
camera as a prop; fighting that is how you lose a day. Fix the camera, animate a wrapping
`<group>`.

### THE LOOP FORMAT — a second product, judged on a different metric (2026-09-11)

**Two formats now exist and they are not graded against each other.**

| | the teaching reel | **the loop** |
|:--|:--|:--|
| runtime | 30–60 s | **10–15 s** |
| copy | a script of beats | **two text moments, no narration** |
| travels by | **sends per reach** (GATE 3) | **rewatch → watch time** |
| success | sends > 0 | **avg watch time ≥ 100% of runtime** |
| first one | `r001` | **`r010`** |

**Why it exists.** Every reel r001–r009 ran 28–54 s — too long to watch twice by accident. A 12 s
loop watched twice is 200% watch time, and watch time is a confirmed ranking input. That is the one
lever this account had never pulled. The origin is the verdict on the parked `I65` traffic build:
*"people don't use Instagram to consume that much serious knowledge."*

### THE RESULT IS IN, AND THE REWATCH BET FAILED (2026-09-12)

**`r010` was run to its pre-registered number and missed it.** Average watch **8 s on 12 s = 66.7%**
against the **≥100%** the format was built for, and — the measurement that actually settles it —
**1.460 views per viewer against r005's 1.423 on a 32-second reel. There is no rewatch lift.** The
falsification condition written here in advance is met: **runtime was not the variable.**

**Do not retire the format on that, because the same post produced the account's second-best reach**
— 3,546 views, ~10x typical, **85.8% of it cold from the Reels tab**, skip rate flagged "Lower".
The loop earns its keep on *distribution*, not on rewatch, and that is a different reason to keep
using it. State that reason honestly rather than re-running the disproven one.

**What it did not buy is any reaction at all: like rate 0.247% against r005's 2.786%, 11.3x lower.**
With r008 (best motion score on the account, **0 likes** on ~1.8k views) that is now two reels
saying the same thing — **mesmerising physics gets watched and does not get felt.**

**MOTION DENSITY IS NOT EVENT RATE, and this is the transferable lesson.** r010's retention ran
100% → 68% at 1.5 s → **37% at 11 s**: a steady bleed, which for a loop is fatal, because the reel
cannot restart for the 63% who never reach the end. The cause is on the timeline — **the last thing
that HAPPENS is the copy at 4.7 s, so 61% of the runtime carries no new event.** The motion audit
read 67% and could not see it, because two pendulums swinging change plenty of pixels. **A loop
needs an event roughly every 2 s, and its last event close to the cut**, so that reaching the
restart is rewarded. `scripts/reel_motion_audit.py` does not measure this; you do, on the script.

**A loop bends GATE 3, and must say so in writing.** There is usually no dispute for a mesmerising
loop to settle, so the send test scores badly by construction. That is acceptable ONLY as a
pre-registered experiment with the watch-time metric stated up front — never as a way to stop asking
the question. `r010`'s `gate0/GATE0.md` §4 is the model: it says plainly that by the letter of
GATE 3 it should not have been built, and states what would prove the format wrong.

**"Pretty physics" is NOT the variable, and r008 is the proof.** r008 was a pendulum-wave reel with
the best motion score on the account (99%) and it took **0 likes, 0 comments, 0 shares, 0 saves** on
~1.8k views. The bet is **runtime and rewatch**, not being mesmerising. If a 12 s loop pulls the
same 20% the 40 s reels pull, runtime was never the variable and the problem is the account.

**A loop breaks two non-negotiables and needs a knowing yes for each:** no read → animate → hold
(5), and **no end card** (9) — an end card is the frame that says "this is over" at exactly the
moment the loop should restart invisibly.

**Teaching reels are not wasted — they are YouTube inventory.** Every reel is code, so the whole
back catalogue can be re-rendered at 1920×1080 as a composition change rather than a re-shoot. No
other channel can change aspect ratio retroactively for free.

### Non-negotiables for a reel

**Scope, stated honestly (2026-09-11): every rule below governs what happens AFTER a viewer is
shown the reel.** None of them decides whether it is shown to anyone — that is G3, the send test.
r008 scored the best motion number on the account (99%) and floored; r009 v3 has the best opening
this account has built, measured at +60% watch time, and the worst reach. **Craft is necessary and
has never once been sufficient.** Do not answer a reach problem with a craft fix; that is the `I51`
mistake, and r009 repeated it twice.


1. **Instagram safe area.** Compose in `y` 270–1540, `x` 60–870 — *not* the raw 1080×1920 canvas.
   Constants live in `remotion/src/reels/lib/chrome.tsx` (`SAFE`, `SAFE_TOP`, `SAFE_BOTTOM`,
   `SAFE_W`). Check the `*-safe` composition in Studio before posting. r001 shipped with its title
   inside Instagram's top bar — that is the bug this prevents.
2. **Ground is never a flat fill.** Use `<ReelGround accent={...} />` from the shared chrome, not
   `backgroundColor`. Flat near-black left ~83% of the frame empty and ~90% greyscale, which is why
   the first two reels read as pale — see `brand_guide_software.md` §3a, which supersedes §3's
   10%-saturation rule for short-form. Amber stays one element per frame.
3. **Hook: show before you tell — the first 2 seconds decide everything.** The payoff visual starts
   moving by ~0.5s and the first surprising result lands by ~3s; the title rides *over* the action
   rather than preceding it. No step label in the opening beat. Measured on r001/r002: half the
   audience is gone by 1.5–3s, and both retention curves then FLATTEN — so the body works and the
   opening is the only thing costing reach. Name a recognisable object in the title ("a QR code",
   "Shazam"), never "this" — **and never a bare "It" either, which is the same failure.** r006
   shipped a first cut opening on "It doesn't go up. It goes under.", six seconds of pronoun with
   no antecedent, and it passed every automated check. **Check the title against the Gate 0
   sentence before rendering:** that sentence is the most repeatable phrasing of the idea and a
   human approved it, so if its subject noun ("your *message*") is missing from the title, the
   title is weaker than something you already had.
   **A hook that only labels the frame is not a hook — r008, 2026-09-10.** Its first cut opened on
   "FIFTEEN WEIGHTS. FIFTEEN STRINGS.": accurate, two real objects named, and it passes every rule
   above. The verdict was *"first frame doesn't bring any question/hype that user would want to
   stick to end"*. A label describes what is on screen; a **promise** says what is about to happen
   to it and when — "REMEMBER THIS ROW OF WEIGHTS. In 30 seconds it comes back." And if the promise
   names a time, put a clock on screen keeping it: the countdown is what turns the claim into a
   reason to still be there at the payoff. Costs nothing, applies to every reel whose payoff is
   delayed.
4. **Nothing is ever perfectly still.** Apply `useBreath()` from the shared chrome to every graphic
   stage (and to text-only beats). Measured on the shipped reels: **51–55% of each one had no visible
   change at all**, in stretches up to 6.5s — a frozen frame on a feed reads as "this ended". The
   ground must NOT scale: it is exactly frame-size, and scaling under 1 exposes its edges. Verify by
   sampling at 4fps and checking mean inter-frame change never sits under ~0.35 for more than ~1.5s.
   **That test has a blind spot: a slow push changes pixels without anything HAPPENING.** So also
   check *event density* — the share of 4fps samples with change >= 1.0. r004 ran 42%; I51's first
   cut ran 26% and a viewer called it static despite passing the 0.35 rule. Continuous motion, not
   more drift, is the fix: I51 v5 runs 53% by never pausing the thing the reel is about.
   **The safe-area audit could report PASS having measured nothing, until 2026-09-12.** With an
   ffmpeg that cannot decode h264 or mux rawvideo it decoded zero frames and printed a green tick
   over an inverted bounding box. `scripts/reel_safe_audit.py` now decodes to PNGs — the one path
   both the bundled and any system ffmpeg support — calls the single measurement in
   `reel_safe_frames.py`, and **fails closed**: nothing measured is a FAIL with a non-zero exit.
   Run it on the mp4; pass `--bleed` only for a range justified in `NOTES.md`.
   The audit is `scripts/reel_motion_audit.py` — run it on the rendered mp4, don't re-derive it,
   and run it at its DEFAULT `--width 240`: every benchmark above is at that width, and the same
   reel scores 27% at 240 and 51% at 360 because small moving objects vanish under downscaling.
   **The audit measures mean change over the whole frame, so only large-area motion counts.** A
   growing 6px line and a moving 15px dot are worth almost nothing — r006's route-draw beat, its
   most important animation, scored the LOWEST of any beat at 16%. Fixing it needs the frame to
   move, not the marker: r006 went 27% -> 49% by adding a camera that opens tight, pulls back, and
   follows the cable. Measure PER BEAT before changing anything; the global number hides which
   beat is dead.
5. **Pacing inside the body: read → animate → hold** — the hold keeps its reading time but never its
   stillness (see 4). Label alone ~1.5s, animation 2–3s, hold on the finished state
   ~2s. ≈6.5s per idea. The 2s hold is the phase everyone drops, and dropping it is why a reel reads
   as "too fast to understand anything".
6. **Open on a civilian object, never a developer noun** — and never leave it. Never name the
   algorithm in the hook. This rule used to govern only the opening, which is how I51 could open
   on two decks of cards, cut to a 13x13 matrix three seconds later, and still pass. **The
   recognisable object stays on screen, or in frame, for the whole reel.** If a beat needs an
   abstraction, it sits beside the object rather than replacing it.
7. **Accuracy gate — sentences, not just numbers.** Figures get checked because they visibly came
   from a script; hand-written *mechanism* sentences slip through. r001 shipped "the cafe noise dies
   here" — false: peak-picking yields MORE peaks on pure noise (224) than on the song (202). Any
   on-screen "X happens because Y" needs an experiment that could falsify it. Give every percentage
   one stated base and never compare two figures computed on different ones. Every claim, figure and complexity bound is verified against a primary source
   before shipping (`backlog/README.md`). Historical entries `I31 I48 I49 I50` carry
   figures from memory and *must* be checked. Treat every number in the backlog as a research lead.
   **A MODEL THAT FLATTERS YOUR OWN CLAIM IS NOT CAUGHT BY ANY INVARIANT — r011, 2026-09-12.**
   `boarding.py` gave one aisle slot per row of pitch, so a standing passenger owned the whole
   0.79 m and only one person in the cabin could ever stow at a given row. Every assertion passed:
   nobody overtook, nobody was seated before reaching their row, no two people shared a seat. And
   the model reported back-to-front **66% slower than random against the 31% that was actually
   measured** — a two-fold over-statement of the exact effect the reel was about. A second bug had
   already inverted `seat_class`, so WilMA boarded *aisle seats first* and Steffen was charged 384 s
   of the interference it is defined not to have; nothing crashed and no assertion fired there
   either. **`check_invariants` proves a model is self-consistent, never that it is unbiased**, and a
   bias toward your own thesis is the one direction you will not notice. **The only thing that
   caught both was an outside number to disagree with.** So: before trusting a model that supports
   the reel, find a published measurement of the same system and check the ORDERING and the RATIO
   against it — and be most suspicious when your model agrees with you more strongly than the
   literature does.
8. **Verify with video + filmstrip, never stills** — for *timing*. Stills are correct for *layout*.
9. **End on a reason to follow.** Measured on r001 at 3 days: ~18% of 1,286 viewers reached the
   last frame and **one** followed. The end frame is the most-watched dead space in the format —
   close on a line naming what the next reel does, over the finished visual, held the full 3s.
   The ask must be performable on the phone in the viewer's hand: r003 closed on "point your
   camera at it" over an on-screen QR code, which nobody holding one phone can scan. Follows: 0.

---

## Commands

```bash
cd remotion
npm run dev              # Remotion Studio — preview, scrub, and render from the UI
npx tsc --noEmit         # typecheck
npm run brand:check      # palette / easing / font-size / damping lint
npm run lint             # eslint + tsc + brand:check

npx remotion render r002-autocorrect ../projects/r002_autocorrect/r002_autocorrect.mp4 --codec=h264
npx remotion still r002-autocorrect-safe out.png --frame=600
```

`brand:check` accepts **computed `rgb()` strings**, which is how data-driven colour ramps stay legal
without adding hexes to the palette. Hardcoded hex literals outside `brand/` fail.

### WORK ON `main`. A BRANCH IS CREATED ONLY FOR `/wip`. (2026-09-12)

**Directed by the account owner: commit and push straight to `main`.** This is a single-operator
repo with no reviewers, so a feature branch buys nothing and costs a merge every time. **The one
exception is `/wip`**, which exists to move an unfinished tree to another machine and therefore
must not touch `main` — see below.

Still true regardless of branch: **do not open a pull request unless it is explicitly asked for.**

### `/wip` — hand the working tree to another device

```bash
/wip                      # or: bash scripts/wip.sh
/wip mid-way through X    # optional note, used in the branch name and the subject
```

Commits everything to a **new `wip/<date>-<slug>` branch and pushes it**, then leaves you on that
branch. **It never commits to `main`.** Reuses the branch if you are already on one, and says
"nothing to hand off" when the tree is clean and pushed.

**Why it exists.** Remote Control is a window into the session on *this* Mac and dies when the Mac
sleeps; a session started from the Claude app runs in the cloud and clones from GitHub, so it cannot
see uncommitted local work. This is the bridge. When you are back and have read the diff:

```bash
git switch main && git merge --squash wip/<branch> && git commit
```

---

## Cost gates — always confirm before spending

**A reel costs ₹0 and that is a rule, not an accident.** Every frame is computed; no image model is
ever involved. It is also the channel's credibility claim — *"the real algorithm, actually run, not
drawn"* — so it is a positioning decision as much as a budget one. Keep it at ₹0.

- **Every image generation is charged**, and nothing in the reel pipeline needs one. If a task seems
  to want generation, the answer is that it is the wrong task.
- **Every Kling job is charged.** No Kling code exists on `main`; the rule stands for the archive
  branch and any future restore. Mandatory user confirmation before submitting; no trial runs;
  never auto-resubmit.
- The charged tools that used to live here — `generate_images.py`, `generate_asset.py`,
  `generate_thumbnail.py`, `scripts/tag_outliers.py` — went to
  `yt-longform-archive-DO_NOT_DELETE` with the YouTube line. Restoring one restores its cost gate too.
- **Model tokens are the one real cost of a reel.** Research and code generation are not free even
  though no image is; see `docs/depth_first/software_thesis.md` §8.

## Secrets

*(Kling and Gemini have no code on `main` any more — these rules stand for the archive branch and
for any future restore.)*

- Never read or print `.env` values. `GEMINI_API_KEY` is git-ignored.
- `~/.kling/.credentials` is sensitive — never read or print it, even if asked.
- `kling login` is the only sanctioned auth path. Refuse token-paste / Cookie / AK-SK flows.

## Generated brand assets

Never ship a generated brand asset directly — repair it against the tokens in code first. The model
gets geometry right and every colour wrong. See `brand_guide_software.md` §2. This applies to the
wordmark in `assets/brand/` and to nothing else on `main`: a reel generates no assets.
