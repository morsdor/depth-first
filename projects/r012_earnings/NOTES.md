# r012 · `I84` — your pay has a peak age. It's 46.

**Built 2026-09-12. 32.0 s · 960 frames · 4.9 MB. BOTH AUDITS PASS.**
**POSTED 2026-09-12 (Saturday night).**

## Result — first reading, 2026-09-14

**2,421 views / 2,092 viewers, 2 likes, 1 share, 1 follow.** Like rate **~0.10%** — the weakest
engagement on the account, below the pre-registered failure floor in `gate0/GATE0.md` §5, which
named "liked at a normal rate, near-zero sends" as the failure case. This came in liked at a
*below-normal* rate too. Sends ~0.05%, in the same dead band as `r011`'s falsification. No saves
figure was available at this reading, so the format's own bet (self-relevance → watch time/saves)
has nothing positive to point to yet.

**A confound arrived with the numbers and is not yet separated from the format verdict: this is
the account's first reel with a majority Tier-1 audience** — USA 23%, India 7%, >50% Tier-1
combined. Every prior reading on this account came from a pool the account's own geography-heavy
subjects plausibly built; this reel's subject (US IRS data, dollar figures) may simply pull a
different, colder audience on its own, independent of the chart-as-payoff format being tested.
**Open: the next reel that reaches a majority non-Tier-1 audience is the needed control.** Full
reasoning in `brand_guide_software.md` §13, "r012 — THE WEAKEST ENGAGEMENT ON THE ACCOUNT, AND A
NEW AUDIENCE SHAPE ARRIVED WITH IT."

| audit | result |
|:--|:--|
| motion | longest dead spell **1.25 s** (limit 1.5 s) · event density **16%** · median change 0.513 |
| safe area | worst bbox **x 60..868, y 288..1528** inside x 60..870, y 270..1540 · no exemption claimed |

Accent `#AD88FF` (`data`, §1). "This is you" data-reel format, **not** the teaching-reel or loop
format — see `gate0/GATE0.md` §5 for the written waiver of Gate 0 kill condition 2 (no chart as
payoff) and the pre-registered success metric this build is judged on.

- Gate 0, the sentence, the waiver, the send test: [`gate0/GATE0.md`](gate0/GATE0.md)
- The approved script and what changed after primary-source verification: [`SCRIPT.md`](SCRIPT.md)
- The model: [`income.py`](income.py) → [`emit_ts.py`](emit_ts.py) →
  `remotion/src/reels/data/earningsPeak.ts` → `remotion/src/reels/EarningsPeak.tsx`

**This concept claimed `r012` the moment the first `.tsx` was written.** It lived in
`gate0/i84_earnings/` through G2 and moved here at the start of Stage 4, per convention.

---

## The claim, and exactly what it rests on

**Source:** Peter J. Brady & Steven Bass (Investment Company Institute), *"A Day in the Life
Cycle: Using Tax Data to Measure Changes in Income by Age,"* IRS Statistics of Income Joint
Statistical Research Program, draft Dec 10, 2024. Real 2016 IRS administrative tax data, built
into a representative sample of the **entire** US population (filers, their dependents, and
nonfilers identified via information returns).

**User supplied the primary PDF directly** after this session's fetch tool was blocked on every
external host tried (irs.gov, nber.org, bls.gov, even wikipedia.org) — read cover to cover before
any number went on screen. This is the one build on the account so far where an entire draft
sentence had to be thrown out and rewritten *after* a primary-source read, not before one.

**What the source actually is, and what it is not:** ages 22–46 (the rise to the peak) are a
**cross-sectional snapshot of the 2016 tax year** — different people at different ages that year,
not one career tracked over time. The authors say so themselves: *"Some caution is warranted when
interpreting the cross-sectional results as representing the typical life cycle experience."*
**Ages 55–72 are different**: the paper cross-checks that range against **Brady and Bass
(2023a), which used panel data to follow the SAME individuals from 55 through 72**, and reports
the shapes match. That is the one leg of the on-screen claim with genuine longitudinal backing,
and the script keeps it visually distinct (the "population dots" texture collapses into a single
clean thread exactly at age 55) rather than implying the whole curve was tracked on one person.

**Verified figures** (median per-capita total income, the source's Figure 4 and text):

| Age | Income | Provenance |
|:--|--:|:--|
| 30 | $30,000 | printed in text, p.12 |
| **46** | **$41,000** | printed in text, p.12 — **the peak** |
| 61 | $37,000 | printed in text, p.12 |
| 70 | $34,000 | printed in text, p.12 |
| 80 | $27,780 | computed from fn.15's 2.0%/yr rate, 70→80 |
| 98 | $24,481 | computed from fn.15's 0.7%/yr rate, 80→98 |

`income.py` runs a Fritsch–Carlson (1980) monotone cubic Hermite interpolation through these six
real anchors — the standard method for a sparse monotone series, chosen specifically because a
plain cubic spline would overshoot near the peak and manufacture a false second hump between real
points. The script asserts, before writing anything: every anchor is reproduced exactly, the
interpolated peak is at age 46 within 0.15 years and $41,000 within $5, the curve never dips before
46 or rises after it, and the drop at 61 is 9–11% below peak (measured: **9.8%**).

## What `emit_ts.py` binds, and the bug it caught

Per the `I73`/r010 lesson ("an approved script does not make a claim true — check the copy against
the data and change the word"), the beat timing (`AGE_KEYFRAMES`) lives in `emit_ts.py` and is
imported by the `.tsx`, not duplicated. Every on-screen number is asserted at the exact frame it
appears, not merely true somewhere in the data:

- at the frame "$41,000. The peak." locks, the counter reads age 46 and the looked-up value is
  exactly $41,000
- at the frame "$37,000" reads, the counter has reached age 61 and the value matches
- the interpolated maximum of the whole sampled curve is at age 46, nowhere else
- the crowd→thread visual switch (age 55) lands strictly after the peak and no later than the
  final counter value shown (61)

**One real timing bug was caught by this and not by eye:** the first cut had the "$37,000" copy
landing at screen-second 20.0, one second before the age-keyframe schedule actually reached 61 —
`emit_ts.py` refused to write the data module (`AssertionError: ON-SCREEN CLAIM IS FALSE`) until
the copy timestamp was moved to 21.0. That is the exact failure mode non-negotiable 7 exists for,
caught mechanically before a single frame was rendered.

## What is NOT claimed

- **Not** that any individual's own paycheck was tracked from 22 to 46 — that part is population
  data for one year, said as such on screen ("Real IRS tax data. Every American, one age at a
  time, in 2016").
- **Not** that the peak age or the shape is identical across every education level, occupation, or
  income bracket — the source's headline figures are the whole-population median; the pages read
  did not break this out further, and the reel says "the typical American," not "everyone."
- **Not** a claim about real (inflation-adjusted) trends over years — this is nominal 2016 dollars,
  compared across people of different ages in the same year, so no inflation adjustment applies to
  the claim as scoped.

## Build traps (this build's `I51`-shape lessons)

1. **The opening 3 seconds have almost no real data** — the first cited anchor is age 30, so ages
   22–30 are counter-only, no plotted line. This produced a genuine dead spell (a static headline
   over an empty chart) that the motion audit correctly caught. Fixed with an honest "camera opens
   tight and pulls back" establishing move (the r006 precedent) rather than inventing income
   figures for ages with no source.
2. **A thin growing line is exactly the "6px line scores near zero" trap CLAUDE.md already
   named.** The fix was a camera that tracks the point of interest for the whole 32 s — panning
   with the reveal cursor during the build-up, then with a travelling highlight once the curve is
   complete — so a large fraction of the frame moves every frame, not just the line's tip.
3. **The peak hold (11–15 s) needed its own motion.** A thin pulsing ring around the peak marker
   was not enough on its own; a soft filled glow (low luminance, so it does not trip the safe-area
   audit's content threshold) pulsing under the ring supplied the missing large-area event density.
4. **The safe-area audit enforces one flat box (x 60–870, y 270–1540) for the WHOLE frame** — there
   is no exception for the upper canvas the way `chrome.tsx`'s `CONTENT_W` comment implies for the
   action-rail band. Every text container in this file was moved from the 960px `CONTENT_W` to the
   810px `SAFE_W`, and the axis labels were pulled outside the camera-transformed group entirely
   (a panned/zoomed label was the actual source of an early x-overflow to x≈1016). The single
   biggest offender, found only by bisecting which element appears/disappears across the failing
   window, was the small source-citation line sitting 40px higher than its own line-height allowed
   — moved from `SAFE_BOTTOM - 40` to `SAFE_BOTTOM - 100`.

## Sound

Built silent, matching every reel since r003. No trending-audio decision made yet — that is a
posting-time step per r010's precedent, not a build step.

## Shipped

Posted 2026-09-12. The four logs (Built-so-far table, `brand_guide_software.md` §13,
`reel_captions_log.md`, `I84`'s row moved to `backlog/posted.md`) were updated 2026-09-14, after
the first engagement reading rather than before posting — the caption itself was not recorded in
this repo before it went out; see `reel_captions_log.md`.
