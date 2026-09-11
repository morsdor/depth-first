# What travels — the evidence, graded

*Written 2026-09-11, after r009 v3 read 8 s average watch, 215 views, **0 sends**.*

The account has nine reels, one hit, and every craft rule in `CLAUDE.md` governs what happens
**after** a viewer is shown a reel. Nothing in the repo governed whether it gets shown to anyone.
This is that gap, filled with evidence rather than instinct, and graded so a future session can
tell what is load-bearing from what is folklore.

---

## A. The distribution mechanic — why the reach test was right

**Instagram's three ranking metrics are watch time, likes per reach, and sends per reach**, and
the three are **ratios against reach, not totals**. Of those, **sends per reach is the signal that
reaches people who do not follow you**, reported as carrying roughly **3–5× the weight of a like**
for unconnected reach. Likes matter more within your existing followers; sends are what get you
out of the pool you were tested in.

**Evidence grade: MEDIUM.** Instagram's own creator documentation confirms the shape — distribution
is driven by *"engagement per viewer … through actions such as watch time, sharing, following,
liking, commenting"* — and names the first three seconds, visual quality and trending audio as
things that matter. The specific three-metric framing and the 3–5× multiplier come from Adam
Mosseri's public statements as reported consistently across many secondary write-ups; I could not
reach a primary transcript. Treat the ordering as solid and the multiplier as approximate.

### What this does to our own numbers

| | r005 (the hit) | r009 v3 |
|:--|--:|--:|
| viewers | 32,882 | 171 |
| likes per reach | 2.79% | **2.92%** |
| **sends per reach** | **0.92%** | **0.00%** |
| saves per reach | 1.10% | 0.00% |

**The like rate matches.** People who see r009 like it as much as people liked the reel that did
66k. The difference is entirely in the signal that buys distribution. This repo inferred "who does
the viewer send this to?" from a single comparison; the platform's own ranking says the same thing
for a mechanical reason.

---

## B. What makes a person actually send something

**Berger & Milkman, "What Makes Online Content Viral?", *Journal of Marketing Research* (2012)** —
roughly 7,000 New York Times articles over three months, testing what gets emailed on.

- **Physiological AROUSAL is the driver, not positivity.** High-arousal emotions — **awe, anger,
  anxiety** — increase transmission. **Low-arousal emotions — sadness, contentment — decrease
  it.** Positive content beats negative overall, but arousal explains more than valence does.
- **Practical utility, surprise and interest are each independently positive**, and the arousal
  effect survives controlling for all three.

**Evidence grade: STRONG for the finding, WEAK for the transfer.** It is peer-reviewed and heavily
replicated, but it is 2008–09 newspaper articles being emailed, not 2026 reels being DM'd. The
mechanism is plausible on any platform; the magnitudes are not ours to assume.

### The tension this creates, and the resolution

**r009 is an awe reel — cosmic scale is the canonical awe stimulus — and it got zero sends.** So
"pick an awe subject" is not sufficient, and we have the counter-example in hand.

The resolution is that **arousal requires novelty.** The cosmic-scale genre is saturated to the
point where a viewer's response to another one is *recognition*, not awe. You cannot feel awe at
the thousandth iteration. r005 was not awe at all — it was **surprise plus argument ammunition**,
the practical-utility channel, aimed at a dispute that was already running.

---

## C. What holds attention in *educational* video specifically

**Guo, Kim & Rubin, "How video production affects student engagement", ACM Learning@Scale (2014)**
— 6.9 million video-watching sessions across four edX courses. The largest study of its kind.

- **Shorter is much more engaging.** The strongest single finding.
- **Informal, personal delivery beats high production.** Talking-head and Khan-style tablet
  drawing both beat polished studio lectures.
- **A high-quality recorded lecture is not an engaging online video.** Production value and
  engagement are not the same axis.

**Evidence grade: STRONG for the finding, MEDIUM for the transfer.** MOOC learners have chosen to
be there; feed viewers have not, which should make the hook matter *more*, not less. The
"informal beats polished" result is the uncomfortable one for this account and is discussed below.

---

## D. The first three seconds

Instagram's own creator guidance: **make sure the first 3 seconds are engaging so people don't
move on.** Creator-side aggregate data puts **50–60% of all drop-off inside the first three
seconds**, with a working target of **>70% of viewers surviving past 3 s**.

**Evidence grade: STRONG (platform-primary) for the principle, WEAK (creator blogs, no published
method) for the specific percentages.** Our own retention curve is consistent with the shape: r009
v3 loses roughly 70% inside the first four seconds and then decays gently, which is the same
"cliff then flatten" `CLAUDE.md` recorded on r001/r002.

---

## E. Two things our own data FALSIFIES, so they don't become folklore

1. **"The reels are silent, and that's the problem."** r003–r009 carry no audio at all; only r001
   and r002 do. **But r005 is silent and did 66k**, so silence cannot be the cause of the floor.
   Instagram does say trending audio affects distribution, so audio may be an unused *tailwind* —
   it is not the missing cause. Low confidence, cheap to test, not a priority.
2. **"It's the craft."** r008 scored the best motion number on the account (99%) and floored.
   r009 v3 has the best opening this account has built — measured, +60% on watch time — and the
   worst reach. Craft is necessary and has never once been sufficient.

---

## F. What this adds up to for Depth First

**The binding constraint is not how a reel is made. It is whether a viewer has a reason to send it
to a specific person.** That was already in `CLAUDE.md` as a filter that cost "one sentence to
apply", was applied five times, correctly predicted five outcomes, and never once stopped a build.

The research says the reason to send comes through a small number of channels. Name one, or don't
build:

| Channel | What it looks like | Ours |
|:--|:--|:--|
| **Argument ammunition** | a dispute is already running and this settles it | **r005** — your uncle, that the earth is round |
| **High-arousal novelty** | awe/anger/anxiety at something genuinely unfamiliar | r009 aimed here and missed: the genre is saturated, so it read as recognition |
| **"This is you"** | sent to one person because it is about them or a shared experience | none yet |
| **Practical utility** | the viewer will actually use it | none yet |

**Measure sends per reach, not views.** r005 set the only benchmark we have: **0.92%**. Everything
since is 0.

---

## Sources

- Berger, J. & Milkman, K., *What Makes Online Content Viral?*, Journal of Marketing Research, 2012 —
  https://journals.sagepub.com/doi/10.1509/jmr.10.0353
- Guo, P., Kim, J. & Rubin, R., *How Video Production Affects Student Engagement*, ACM L@S, 2014 —
  https://dl.acm.org/doi/10.1145/2556325.2566239 (PDF: https://learningatscale.acm.org/las2014/talks/paper_philip_guo2.pdf)
- Instagram, *Ranking Explained / How Our Algorithm Works* — https://about.instagram.com/blog/announcements/instagram-ranking-explained
- Instagram for Creators, *Algorithms and ranking* — https://creators.instagram.com/grow/algorithms-and-ranking
- Instagram Help, *View insights on your Instagram reels* — https://help.instagram.com/202865988324236/
- Mosseri's three-metric framing and the 3–5× send weighting, as reported — https://sproutsocial.com/insights/instagram-algorithm/ and https://www.dataslayer.ai/blog/instagram-algorithm-2025-complete-guide-for-marketers
- Short-form retention benchmarks (creator-side aggregates, method unpublished) — https://www.opus.pro/blog/ideal-youtube-shorts-length-format-retention
