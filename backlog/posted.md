# Reels that shipped

**Last updated 2026-09-18.**

*One row per backlog id that reached the feed, removed from [`open.md`](open.md) so the live list
stays live. **Ids are permanent and are never reused**, which is what lets old engagement logs
resolve. Reel numbers, engagement and lessons live in `CLAUDE.md`'s "Built so far" table,
[`../reel_captions_log.md`](../reel_captions_log.md) and `../brand_guide_software.md` §13 — this
file only records that the id is spent.*


## §1 · Things you touch every day — accent `data`

| Id | Hook — the line that opens the reel | What they already know | What they have never seen | On screen | Family | Added |
|:--|:--|:--|:--|:--|:--|:--|
| **I01** [BUILT] ★ | A QR code you've destroyed still scans — ✅ **produced as r003, 2026-09-03** | Every menu, every UPI payment | A stain over **24%** of the code still reads; the same damage as confetti dies at 4%; and nine modules in a finder corner — 0.7% — kill it outright | Real QR stained, speckled, then corner-hit, with OpenCV's verdict at every step; one Reed–Solomon block lit up to show it smeared across the whole square | Diagram | 2026-09-02 |
| **I02** [BUILT] ★ | Shazam names a song from three seconds of noise | You've held your phone up in a café | It never hears music. Spectrogram → loudest peaks only → match the *constellation of gaps* between them, which is why chatter doesn't break it | Audio → spectrogram → peaks igniting as stars → constellation locking onto a match | Diagram + Counter | 2026-09-02 |
| **I03** [BUILT] ★ | Watch a photograph assemble from 64 patterns | Every JPEG you've opened | A JPEG stores no pixels. It stores how much of each of 64 fixed wave patterns to mix — and discards the ones the eye can't resolve | The 8×8 DCT basis grid, then a real photo rebuilding coefficient by coefficient | PlateAnnotated | 2026-09-02 |
| **I08** [BUILT] | Your keyboard is measuring distance between words | Autocorrect fixes your typo daily | It scores candidates by single-character edits, weighted by which keys physically sit next to each other | Real typo, edit-distance matrix filling cell by cell, winning path traced back | Diagram | 2026-09-02 |
| **I69** [BUILT] | Fifteen weights, and for one minute they refuse to stay in a line | Everyone has pushed a swing, and most people have seen a pendulum clock | Cut each string so that in 30 s it swings a whole number of times — 26, 27, 28 … 40 — and the row turns into waves, then into apparent chaos, then snaps back into a straight line at the same instant. The trick is entirely in the lengths; nothing is connected to anything | Fifteen real pendulums integrated from the NONLINEAR equation, not the textbook approximation, with the phase pattern resolving on screen | Manim layer + Counter | 2026-09-10 |
> **I69 — produced as r008, 2026-09-10.** The 60 s cycle it was first built on was wrong, and not
> for a physics reason. At 60 s the fifteen strings run 33.63–20.70 cm — a **1.62x** spread — and
> fifteen strings within 1.62x of each other read on a phone as fifteen identical strings. The
> first viewer's question was literally *"first frame says 15 weights, are they all different??"*.
> Re-solving at a **30 s** cycle (N = 26…40) gives **32.35–13.67 cm, a 2.37x spread**, visible with
> no caption; it also halves the runtime to 34 s and moves the payoff to t = 30 s, inside the span
> a viewer will still hold a promise made at t = 0. **The cycle length of a resonance demo is a
> legibility parameter, not only a timing one.**
>
> Lengths are 32.35 cm down to 13.67 cm, not the 33.07/13.97 the textbook period gives: solving
> against the EXACT nonlinear period is what makes the row reform at 30.000 s instead of 0.33 s
> late. The wave survives the real equation **only if every bob is released from the same angle** —
> a common sideways displacement (one straight lifting bar) spreads the correction by 10368 ppm and
> the line never returns. There is also no chaos in it: the phase is linear in n, so the row is
> always a sampled sinusoid and the mess is spatial aliasing. Falsification in
> `projects/r008_pendulum/gate0/GATE0.md` §6.
| **I84** [BUILT] | Your pay has a peak age. It's 46 — and past 55 it never comes back — ✅ **produced as r012, 2026-09-12** | Every payslip you've ever gotten, and every "it's all downhill after 40" joke | Median US income by age from real 2016 IRS tax data (Brady & Bass, ICI/IRS SOI): a cross-sectional population peak at age 46 ($41,000), and — the part with genuine panel backing — the SAME people tracked from 55–72 never return to that height | A single earnings line with an age counter, a crowd-of-dots texture (cross-sectional) collapsing into one bright thread at age 55 (panel-verified), the line topping out and never returning | Diagram + Counter | 2026-09-12 |
> **I84 — GATE 0 kill condition 2 (no chart as payoff) was deliberately WAIVED in writing**
> (`projects/r012_earnings/gate0/GATE0.md` §5) as a format experiment: self-relevance (an age
> counter to match against yourself) substituting for object-recognition. **First reading, 2026-09-14:
> 2,421 views / 2,092 viewers, 2 likes, 1 share, 1 follow — like rate ~0.10%, the weakest engagement
> on the account, below the pre-registered failure floor of "liked at a normal rate."** A confound
> arrived at the same time and is not yet separated from the format verdict: this is the account's
> first reel with a majority Tier-1 audience (USA 23%, India 7%). See `brand_guide_software.md` §13
> "r012 — THE WEAKEST ENGAGEMENT ON THE ACCOUNT, AND A NEW AUDIENCE SHAPE ARRIVED WITH IT."

## §2 · Maps and real geography — accent `infrastructure`

| Id | Hook — the line that opens the reel | What they already know | What they have never seen | On screen | Family | Added |
|:--|:--|:--|:--|:--|:--|:--|
| **I17** [BUILT] ★ | Your flight path isn't curved. Your map is. | The arc on the seatback screen | The shortest path on a sphere is a great circle. Mercator stretches high latitudes, so a straight line *becomes* an arc — Delhi–SF really does go near the Arctic | Globe with the straight great circle, then unrolling to Mercator as the line bends | MapRoute | 2026-09-02 |
| **I22** [BUILT] | Your message to a friend abroad goes underwater | It feels instant, and it feels wireless | Almost none of it is satellite. It's glass on the seabed — and you can name the cable, the landing station, and the milliseconds each leg costs | Mumbai→Virginia traced cable by cable, latency accumulating against the speed-of-light floor | MapRoute + Counter | 2026-09-02 |
| **I58** [BUILT] | Two high tides a day, and one of them shouldn't be there — ✅ **BUILT as r007, 2026-09-10** *(re-spined: see note)* | Everyone has seen a tide come in | The moon pulls the near side hardest. The FAR bulge is the one almost every explanation gets wrong, and "centrifugal force" is not the answer | Real harmonic constituents for one named port, both bulges, a month of predicted tide against the measured record | Diagram + Counter | 2026-09-10 |
*(`I58` built 2026-09-10 as r007, and the row's own framing was corrected during Gate 0 rather than
| **I70** [BUILT] | The biggest star in the universe is a speck — ✅ **POSTED as r009, 2026-09-11** | Every scale video you have ever seen ends on "and this one is even bigger" | Star sizes run out — the five largest ever measured are all within 8.7% of each other (VERIFIED; the Stephenson 2-18 / Hayashi-limit versions of this claim were both false and were cut). Distances do not. Drawn together at one scale, the largest known star is 1/18,749th of the gap (VERIFIED: WOH G64 A, 1,540 R☉, Ohnaka+ 2024) to the nearest neighbouring star, which is the rung every scale video skips | A single continuous re-based 3D ladder — planet, Sun, red hypergiant, then the ladder breaks and the giant vanishes into the gap; nebula and galaxy after it | Three.js + Counter | 2026-09-11 |

## §3 · What actually happens when you… — accent `languages`

| Id | Hook — the line that opens the reel | What they already know | What they have never seen | On screen | Family | Added |
|:--|:--|:--|:--|:--|:--|:--|
| **I31** [BUILT] ★ | One country tried to block YouTube for itself, and broke it for the whole world — ✅ **POSTED as r014, 2026-09-18 (44 s)** | Everyone's heard "the internet went down" | Routing between networks runs on trust, unverified. In 2008 Pakistan Telecom announced it owned a slice of YouTube's addresses; PCCW never checked before repeating it worldwide, and 97 networks were carrying the route within 2:30 (VERIFIED against RIPE NCC RIS, Google Research, Renesys/CircleID) | Camera diving from orbit to street level at Karachi as the announcement fires, six real cities' traffic converging on one point, then reversing as YouTube out-announces it | Three.js + Counter | 2026-09-02 |
> **I31 — shipped as the account's first pure high-arousal-novelty GATE 3 pass, with no
> argument-ammunition leg** (`projects/r014_hijack/gate0/GATE0.md` §9), pre-registered against
> `r009`'s reading rather than sends. **First reading: 1,949 views / 1,531 viewers, average watch
> 16 s / 44 s (36%), 6 likes, 0 comments, 0 shares, 3 saves, 2 follows.** Like rate **0.4%** ("Lower"
> than typical) — well under `r009`'s 2.92% and the account's own pre-registered floor for this
> experiment, closer to `r010`/`r012`'s failure band than to `r009`'s "liked normally, didn't send"
> shape. Skip rate 33.5% ("Lower," the hook held attention better than typical) and save rate 0.2%
> ("Higher") are the only positive signals; sends are 0.0%, continuing the account's near-unbroken
> run of zero-send readings outside `r005`. **Falsifies the stated hypothesis that genre saturation,
> not the novelty channel itself, was `r009`'s problem** — a genuinely fresh novelty subject still
> did not out-perform it. See `brand_guide_software.md` §13 and
> [`projects/r014_hijack/NOTES.md`](../projects/r014_hijack/NOTES.md).
| **I81** [BUILT] | You don't sweat fat off — you breathe it out — ✅ **POSTED as r013, 2026-09-16 (37s), RE-CUT AND RE-POSTED 2026-09-17 (39s)** | Everyone has dieted or watched someone diet, and everyone has a theory about where it goes | Fat is oxidised to carbon dioxide and water: **VERIFIED 84.25%/15.75%**, independently re-derived from the real balanced equation (C55H104O6 + 78 O2 → 55 CO2 + 52 H2O), within 0.25 points of the published 84%/16% (Meerman & Brown, BMJ 2014;349:g7257) | The real balanced equation run on a stated mass of fat, with the carbon atoms leaving through breath and the output weighed on screen | Diagram + Counter | 2026-09-12 |
*(Both cuts floored — cut 1: 159 views, avg watch 5s/37s; cut 2: 197 views, avg watch 3s/39s, WORSE
on every retention metric despite a hook re-cut. Read as a content/heat floor, not a craft floor —
see `brand_guide_software.md` §13 "A HOOK FIX MADE RETENTION WORSE" and
`projects/r013_breath/NOTES.md`.)*

## §6 · Failure autopsies — accent `failure`

| Id | Hook — the line that opens the reel | What they already know | What they have never seen | On screen | Family | Added |
|:--|:--|:--|:--|:--|:--|:--|
| **I71** [BUILT] | The one that started a hair's width away | Everyone has seen a pendulum swing | Two identical pendulums released **70 micrometres** apart — one human hair — trace the same path for three seconds and then have nothing to do with each other. Nothing is random and nothing is nudged again | Two double pendulums overlapping exactly, then daylight, then two unrelated machines | Diagram | 2026-09-11 |
*(Added 2026-09-11. **The first entry written for the LOOP format**, not the 30-60 s teaching format: ~12 s, no narration, one line of copy, built to be rewatched rather than understood. The format, not the topic, is what is being tested — see `../projects/r010_divergence/gate0/GATE0.md`. Perturbation and every timing are outputs of `chaos.py`; energy drift 8e-12 of MgL.)*
| **I73** [BUILT] | Your airline boards the plane worse than no method at all | Everybody has stood in that queue, and everybody has a theory about it | Back-to-front — the method most airlines use — is reportedly SLOWER than seating people in a completely random order, because it packs everyone who must stow luggage into the same few rows at the same time. An optimised order roughly halves it (LEAD: Steffen 2008 J. Air Transport Management and the 2012 field test to verify) | A cabin from above, four boarding methods racing in parallel from the same passenger list, each with its own clock | Diagram + Counter | 2026-09-12 |
*(**Produced as `r011`, posted 2026-09-12.** GATE 3 scored three channels; the reel shipped on the first two. The headline is not ours — Steffen & Hotchkiss, J. Air Transport Management 18 (2012) 64-67, measured 72 real people in a mock 757: back to front 6:11 against a random order's 4:44. Our own agent model reproduces that to −1% and −8% with nothing fitted, and 144 of 144 sweep points keep back to front slower. **The mechanism is one number: the back-to-front cabin never gets more than TWO people stowing at once, in any seed at any parameter setting; random reaches seven.** The falsification risk that nearly killed the copy was the word "airlines" — most carriers do something like back-to-front but United went window-middle-aisle in 2023 and Southwest in January 2026, so the reel names the METHOD and never the viewer's airline. Pre-registered reading in `../projects/r011_boarding/NOTES.md`, written before it went up.)*
*(`I54`-`I68` added 2026-09-10, the first ids under the widened "how systems work" remit. Every figure in these fifteen rows is a RESEARCH LEAD carried from memory and none has been verified — the same status that made `I15` ship a hook of 300,000/300 that no real graph supported, and that killed `I53` in twenty minutes. Verify before any of them reaches a gate.)*
