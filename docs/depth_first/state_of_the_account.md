# State of the account — 2026-09-10

*`@thedepthfirst` on Instagram. Figures are the user's report of 2026-09-10 plus the per-reel
Insights readings already recorded in `brand_guide_software.md` §13 and `reel_captions_log.md`.
Where a figure was read at a different age, the age is in the last column — the ledger's own rule
is that readings at different ages and bases are not compared.*

## The eight posted reels

| Reel | Id | Subject | Length | Posted | Views | Likes | Shares | Saves | Follows | Reading |
|:--|:--|:--|--:|:--|--:|--:|--:|--:|--:|:--|
| r001 | I02 | Shazam fingerprinting | 40 s | 09-02 | 1,656 (1,286 viewers) | 24 | 6 | 6 | 1 | 3 days |
| r002 | I08 | Autocorrect / edit distance | 43 s | 09-02 | 322 | — | — | — | — | 09-07 |
| r003 | I01 | QR damage tolerance | 37 s | 09-05 | 422 (324 viewers at 18 h) | 3 | 0 | 1 | 0 | 09-07 |
| r004 | I03 | JPEG stores no pixels | 40 s | 09-06 | 1,809 (1,617 viewers) | 17 | 1 | 5 | 0 | 09-07 |
| **r005** | I17 | Flight path isn't curved, the map is | 32 s | 09-08 | **80,000+** (46,782 at day 1) | 916 at day 1 | 303 | 362 | **~120** (71 at day 1) | 09-10 |
| r006 | I22 | Your message goes underwater | 28 s | 09-09 | ~1,800 peak | — | — | — | — | 09-10 |
| r007 | I58 | Sun pulls 179× harder, Moon makes the tide | 54 s | 09-10 | 189 | 4 | — | — | 1 | 09-10 |
| r008 | I69 | Fifteen pendulums come back at 30 s | 34 s | 09-10 | 190 | 0 | 0 | 0 | 0 | 09-10 |

**Followers: 145.** Built and not posted: I51 shuffle (`I51`, 39 s, five rebuilds), I15 A\* (`I15`,
28 s, failed the sentence test after building), and the `I64` queue build (shelved on watching —
"the output is not sound" — despite the best motion score in the repo).

**Cadence so far: eight reels in nine days.** The build cost is "a day of work" on paper, and the
machine kept up with it. Cadence is not the constraint right now. Qualified topics are.

---

## What the numbers show

**1. It is a power law, exactly as predicted.** `insta_strategy.md` §2.1 (written 2026-09-02, from
`equation.verse`'s 74× outlier) said the account would live on a hit distribution. One reel now
carries ~95% of all views and ~83% of all followers. The other seven sit between ~190 and ~1,800.
There is no middle.

**2. Reach and follows are two separate problems.** r005 converted 0.216% of its day-1 viewers into
follows — the account's best measured rate — and about 0.15% per view by the 80k reading. At that
conversion, 10,000 followers costs roughly five million viewers. Reach is bought one hit at a time;
conversion is bought on every reel by the end card, the grid, and the bio, and it has never been
worked on deliberately (rule 9 in `CLAUDE.md` exists because r001's 230 last-frame viewers produced
one follow).

**3. The floor is ~200–400 views and it is a binary outcome, not a gradient.** r002 (322), r003
(422), r007 (189) and r008 (190) are what "shown to followers plus a small cold sample that did not
engage" looks like. The ranking system either keeps feeding a reel in its first hours or it stops.
r006 at ~1,800 got some cold distribution; the floor reels got essentially none.

**4. The two physical reels are the two weakest — and both were flagged weak *before* posting.**
`CLAUDE.md` widened the subject to physical systems on 2026-09-10 because three software ideas in a
row died at Gate 0. The first two physical reels then landed on the floor. Read that carefully
before drawing the obvious conclusion:

- r007's Gate 0 record says: *"nobody is arguing about tidal bulges, so the reach test's 'a dispute
  is already running' is unmet."*
- r008's Gate 0 record says: *"almost nobody has stood in front of a pendulum wave; they have only
  seen it on a screen"* — the "personally witnessed" leg was declared the weak one.

So the result is what the **argument test** predicted for both, and it says nothing about physical
versus software. **The widening stands as a topic-supply decision** (more ids can pass Gate 0), not
as a reach engine. "Physical is stronger" is untested, not falsified — and the honest way to test
it is a physical reel that passes all three argument conditions.

**5. Day-one finality.** `insta_strategy.md` §2.0 measured it on r001–r004: a reel gains two or three
views after its first day. r007 and r008 were read on the day they were posted, so they are
provisional in principle; in practice the account's history says they will not move.

**6. Things that have never predicted reach on this account:**

| Candidate lever | Evidence against it |
|:--|:--|
| Motion / event density | r006 scored 46% and did ~1.8k; r005 scored 38% and did 80k; r008 scored 99% and did 190 |
| Length | the floor holds 28 s, 37 s, 43 s and 54 s reels alike |
| Section / accent colour | floor and hit are both §2 maps |
| Rendering craft, rigor, per-beat audits | five rebuilds of I51 raised rigor and lowered watchability every time |

**7. Things that have, each on a single data point:**

| Lever | Evidence | n |
|:--|:--|--:|
| An argument already running, evidence personally witnessed, one repeatable number | r005 (flat-earth exhibit) vs r006 (built to the same pattern minus the argument): 80k vs 1.8k | 1 vs 1 |
| A legible object in the first half-second | r004 (a photograph, 1,617 viewers, lowest skip rate) vs r003 (a QR matrix, 324 viewers) | 1 vs 1 |

Both are hypotheses with one confirming case. `growth_strategy.md` turns them into pre-registered
tests instead of laws.

---

## What is not known and could be measured next week

- **Did r005's ~120 followers watch r007 and r008?** Insights shows follower vs non-follower share
  per reel. If the answer is "mostly no", the followers bought by an argument are not the
  channel's audience — §13 raised this and it is still open.
- **Retention curves for r006, r007, r008.** Only r001–r004 and r005 have theirs recorded.
- **Whether any reel was ever cross-posted to YouTube Shorts.** `insta_strategy.md` §4.2 called
  Shorts "the strong leg" at zero marginal cost. Nothing in the repo records a single Shorts post.
- **The first-frame object per reel, in one table.** The 0.5 s legibility lever has never been
  tabulated across all eight; it takes ten minutes with the filmstrips.
