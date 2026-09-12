# Reels that shipped

**Last updated 2026-09-12.**

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
| **I65** [BUILT] | A traffic jam with no cause | You have crawled for ten minutes and then found nothing there | Cars driving a ring at a steady speed still produce a jam, and the jam travels BACKWARDS through the traffic. It has been done with real cars on a real track | Real car-following simulation, the jam condensing out of nothing and moving upstream against the flow | Diagram + Counter | 2026-09-10 |
*(Gate 0 written 2026-09-11 — the first concept run under the new gate sequence, and the first with a GATE 3 answer on two channels since `r005`: the passenger who said "there must have been an accident", proving there wasn't one. Geometry and the 20 km/h backward wave are Sugiyama et al., New J. Phys. 10 (2008) 033001; the one-car fix and the 40% fuel figure are Stern et al., Transp. Res. C 89 (2018). Our own model reproduces the experiment's critical density without being fitted to it. **Known risk: the phenomenon is genre-saturated**, so the reel is built on argument ammunition and utility, not novelty. `gate0/i65_phantom_jam/` — GATE0.md, SCRIPT.md, ring.py.)*

## §6 · Failure autopsies — accent `failure`

| Id | Hook — the line that opens the reel | What they already know | What they have never seen | On screen | Family | Added |
|:--|:--|:--|:--|:--|:--|:--|
| **I71** [BUILT] | The one that started a hair's width away | Everyone has seen a pendulum swing | Two identical pendulums released **70 micrometres** apart — one human hair — trace the same path for three seconds and then have nothing to do with each other. Nothing is random and nothing is nudged again | Two double pendulums overlapping exactly, then daylight, then two unrelated machines | Diagram | 2026-09-11 |
*(Added 2026-09-11. **The first entry written for the LOOP format**, not the 30-60 s teaching format: ~12 s, no narration, one line of copy, built to be rewatched rather than understood. The format, not the topic, is what is being tested — see `gate0/i71_divergence/GATE0.md`. Perturbation and every timing are outputs of `chaos.py`; energy drift 8e-12 of MgL.)*
*(`I54`-`I68` added 2026-09-10, the first ids under the widened "how systems work" remit. Every figure in these fifteen rows is a RESEARCH LEAD carried from memory and none has been verified — the same status that made `I15` ship a hook of 300,000/300 that no real graph supported, and that killed `I53` in twenty minutes. Verify before any of them reaches a gate.)*
