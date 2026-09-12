# Gate 0 — `I84`, "most people's pay peaks in their late 40s, and it doesn't come back"

Backlog id `I84`, `backlog/open.md` §1 → accent `data #AD88FF`. Reasoned from scratch,
2026-09-12, after the account owner asked for a "this is you" self-relevant data reel in the
style of `@datakatadka` (screenshots reviewed, not copied) and explicitly agreed to test the
format even though it breaks one of this repo's own rules. No reel number claimed.

**This is a FORMAT experiment first and a topic second**, same footing as `I71`/`r010`'s loop
experiment. The format under test is: a real dataset, computed, played back as a line the viewer
watches move — with an age counter the viewer can match against themselves. That is a chart as
the payoff, which is what Gate 0 kill condition 2 exists to forbid.

## 1. The sentence — G2

**REVISED 2026-09-12 after reading the primary source in full** (user supplied the PDF; see §6).
The original sentence claimed one person's paycheck was tracked across their whole career — the
primary source does not support that for the rise-to-peak part, and the correction is below.

> **"Your pay has a peak age. It's 46 — and past 55, when the same people were actually
> tracked for years, it never came back."**

The first half (rise to a peak at 46) is real 2016 population data, honestly framed as that. The
second half ("never came back," past 55) is the part with genuine longitudinal backing — see §6.

## 2. Who does the viewer send this to, and what are they proving?

Weaker leg of this concept, and said plainly: there is no dispute this settles the way flat earth
or the escalator argument does. The honest answer is **"this is you"** plus mild practical
utility — sent to a peer in their 30s or 40s as a specific, checkable number ("you might already
be near it, or past it"), or to whoever repeats "your best years are whenever you feel
successful" as a vague reassurance rather than a fact with a number attached.

| condition | verdict |
|:--|:--|
| Personally witnessed the evidence | Partial. Everyone has a payslip; nobody has seen their *own* lifetime curve before. |
| A dispute already running, that a non-specialist is in | **No.** This is the honest weak point — carried over from Stage 1 and not resolved by anything below. |
| Resolves to one repeatable number | **Yes** — a specific peak age, to be computed, not assumed. |

## 3. The payoff frame

`payoff_frame.png` — from `mock_payoff.py`. One earnings line drawn against age, an age-counter
readout climbing beside it, the line topping out and visibly never returning to that height by
the end of the frame. **Curve shape only, not final numbers** — see §5.

## 4. The three kill conditions

| Condition | Verdict |
|:--|:--|
| **The sentence needs a CS word** | **No.** paycheck, career, peaks, age. Nothing technical. |
| **The payoff frame shows an object the viewer has never seen** | **YES — and this is deliberately waived. See §5 below, not repaired.** |
| **The amazement depends on understanding first** | **No.** The age counter does the work: a viewer reads their own age off the line and the frame means something with no setup. This is the actual mechanism this format is testing — self-relevance substituting for object-recognition. |

## 5. GATE 0 kill condition 2 — and this one BENDS the gate, in writing, before any build

**Read this before saying yes.** A line chart is exactly the "picture of an idea" kill condition 2
forbids, and there is no version of this reel where the payoff is a recognisable physical object
instead of a plotted curve. This is not an oversight; it is the thing being tested.

**What is waived:** kill condition 2, for this concept only. **What is NOT waived:**

- Kill condition 1 (no CS jargon) — still applies, and the sentence above already clears it.
- Kill condition 3 (amazement-first) — still applies, and §4 above argues it is clear, on a
  mechanism (self-relevance) Gate 0 was never written to anticipate.
- **"Compute the animation, don't author it."** The curve must be a real dataset run through
  real code, not authored to look right. See §6 — this is not yet satisfied and is the open
  item Stage 3 must close.
- GATE 3, the send test — asked honestly above, and it is weak. Not waived, just answered badly.
  This concept proceeds anyway because the experiment is not about GATE 3.

**The pre-registered success metric, stated before any build, the way `I71`/`r010`'s did:**

> **This is judged on completion rate / average watch time and saves, not sends.**
> The bet is that self-relevance ("is this me? how close am I?") produces rewatching or
> pausing-to-read behaviour distinct from both the teaching-reel and loop formats already tried.
> **Success:** watch time or saves measurably above the account's teaching-reel baseline
> (r001–r009 average) on a reel with a weak GATE 3 answer — which would be new evidence that
> self-relevance is a channel independent of argument ammunition. **Failure:** it performs like
> r006/r009 (liked at a normal rate, near-zero sends, no lift in saves or watch time) — in which
> case the honest conclusion is that "this is you" needs an argument attached to it after all, and
> a chart alone is not sufficient, matching the account's existing evidence that craft/format
> alone has never been sufficient.
> **Sends are expected to be low, same as `I71`, and that alone does not falsify anything** —
> only a flat saves/watch-time number does.

## 6. Numbers — VERIFIED 2026-09-12 against the primary source, read in full

**Source:** Peter J. Brady & Steven Bass (Investment Company Institute), *"A Day in the Life
Cycle: Using Tax Data to Measure Changes in Income by Age,"* IRS Statistics of Income Joint
Statistical Research Program, draft December 10, 2024. User supplied the PDF directly after this
session's fetch tool was blocked on every external host tried (irs.gov, nber.org, bls.gov,
even wikipedia.org). Read cover to cover, pages 1–14.

**What the data actually is:** US IRS administrative tax data for **tax year 2016**, built into a
representative sample of the *entire* US population (filers, their dependents, and nonfilers
identified via information returns — not just tax filers). Individual-level, per-capita income.

**This is a CROSS-SECTIONAL snapshot, not a full-career panel — the authors say so themselves:**
*"Some caution is warranted when interpreting the cross-sectional results as representing the
typical life cycle experience."* The original G2 sentence's "same person, whole career" framing
overclaimed this. **One real exception:** the authors cross-check their 55–72 range against
**Brady and Bass (2023a), which used panel data to follow the SAME individuals from age 55
through age 72** — and found the cross-sectional results consistent with it. So the decline
*from 55 onward* has genuine longitudinal backing; the *rise to the peak* (22→46) does not.

**Verified figures (median per-capita total income, Figure 4):**

| Age | Income | Note |
|:--|:--|:--|
| 30 | $30,000 | rising |
| **46** | **$41,000** | **the peak** |
| 61 | $37,000 | falling — this leg IS panel-verified (see above) |
| 70 | $34,000 | |
| 70→80 | declines 2.0%/yr on average | footnote 15 |
| 70→98 | declines 0.7%/yr on average | footnote 15 |

**Spendable income** (total income minus federal income + payroll taxes) follows a **flatter**
version of the same hump — also **peaks at 46**, declines **~10% by 61** ($37,200→$32,300),
and is actually **$500 higher at 70 than at 61** ($32,800 vs $32,300) despite total income being
**$2,900 lower** at 70 than 61 ($34,300 vs $37,200) — falling tax rates in retirement flatten the
spendable curve. This is a genuinely surprising, verified, on-brand nuance worth a beat of its own
if runtime allows, though the reel's core claim uses total income for the cleaner single number.

**Superseded from the earlier search-summary-only version of this file:** the SSA-panel papers
(Guvenen 2021 *Econometrica*; Guvenen, Kaplan, Song & Weidner 2022 *AEJ:Applied*) are no longer
needed as the primary source — the Brady & Bass paper is now read directly and is sufficient on
its own, with its own explicit cross-check against a real panel study for the part of the claim
that needs one.

## 7. Licence and feasibility — RESOLVED

**Published figures are facts and are citable** (the same distinction `I22`'s licence note draws
for route geometry vs. published maps). The numbers in §6 are printed in the paper's text and
Figure 4, not reconstructed from restricted microdata — no PSID/NLSY access needed, no licence
question. "Compute the animation, don't author it" is satisfied by running real interpolation and
timing arithmetic over these real, cited anchor points, the same shape r006 used for MAREA/IMEWE
published cable lengths.

## 8. Accuracy risks — resolved by the primary-source read, restated for the build

1. **Cross-sectional vs longitudinal — resolved by scoping the sentence, not by more data.** The
   rise-to-peak (22→46) is presented as real population data for a stated year, not as one
   person's trajectory. The decline (55→72) is presented as panel-verified, because it is (§6).
   The build must keep this distinction on screen, not blur it back together.
2. **"Most people" needs a defined population — still open.** The paper's median is the whole
   representative 2016 population; it does not break out the peak age by education or occupation
   in the pages read here. The reel should say "the typical American," not "everyone," and not
   imply the peak age is fixed across every group.
3. **Real vs nominal — resolved.** The paper's income measure is nominal 2016 dollars for a single
   year, so the "inflation makes it trivially true" trap in the old §8 doesn't apply here — the
   comparison is across people in the same year, not across years for one person. No adjustment
   needed for the claim as scoped above.

## 9. Awaiting

**A human yes on the REVISED sentence (§1) and the frame, with the kill-condition-2 waiver read
and accepted as written above.** Gate 0 is not mine to pass, and the waiver is not mine to grant
unilaterally either — it is written down because the account owner already said yes to testing
the format; this file is that agreement made checkable later.
