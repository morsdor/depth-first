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

> **"Follow the same person's paycheck their whole career, and for most people it peaks in
> their late 40s or early 50s — and it never gets that high again."**

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

## 6. Numbers, and where they came from — NONE of this is verified yet, all of it is a LEAD

- **Guvenen, Kaplan, Song & Weidner, "Lifetime Incomes in the United States over Six Decades"**
  (NBER WP 23371; published as "Lifetime Earnings in the United States over Six Decades,"
  *American Economic Journal: Applied Economics* 14(4): 446–479, 2022) — constructs lifetime
  earnings for millions of individuals from a 57-year SSA administrative panel (1957–2013),
  tracking the SAME people across their careers. This is the right *kind* of source (longitudinal,
  not cross-sectional) but its headline results are cohort lifetime totals, not yet confirmed to
  contain a plotted age-by-age profile at the resolution this reel needs — **must be checked**.
- **Guvenen, "What Do Data on Millions of U.S. Workers Reveal About Lifecycle Earnings
  Dynamics?"**, *Econometrica* 89(5), 2021 — also SSA panel data, explicitly about the shape of
  earnings over the lifecycle rather than lifetime totals. **Best candidate primary source for
  the actual age-earnings profile** — must be read in full, not taken from a search summary.
- Un-sourced-yet, general finding repeated across secondary summaries (not yet traced to a
  primary table): real earnings rise through the 20s–40s, **peak somewhere in the 45–54
  bracket**, then plateau or decline — with the peak age and post-peak shape reportedly
  **different by education level** (some sources: high-school-or-less cohorts peak and plateau
  in their 40s for over a decade before declining; more educated cohorts may peak later or hold
  longer). **This variation must be resolved before the sentence can say "most people" —
  it may need to be scoped to a specific, stated group.**
- **BLS CPS usual-weekly-earnings-by-age tables exist and are public**, but are cross-sectional
  (different people at different ages in the same year) and **cannot support the individual-
  trajectory claim** ("yours doesn't come back") on their own — same trap `I65`'s advisor-caught
  correction warns against. Usable only as supporting context, never as the payoff's data source.
- Two attempted primary-source fetches (`nber.org`, `gregkaplan.me` PDFs) and one BLS page were
  blocked by this session's egress proxy — not evaluated, not ruled out. **Must be resolved via
  Stage 3 research**, ideally from a session where those hosts are reachable, or via a public
  microdata source this account can compute against directly (candidates: PSID, NLSY — both
  public-use panel surveys tracking real individuals across decades; SSA microdata itself is
  restricted-access and not an option).

## 7. Licence and feasibility

**Not yet resolved — the central open item.** "Compute the animation, don't author it" requires
a real longitudinal dataset this account can legally hold and run code against:

- **SSA administrative panel data** (what the two academic papers above use): restricted access,
  not public. Not usable directly.
- **PSID** (Panel Study of Income Dynamics): public-use, free registration, decades of individual
  earnings histories. Likely candidate — needs a registration/access check.
- **NLSY** (National Longitudinal Survey of Youth, BLS): public-use, free registration, purpose-
  built for career-trajectory research. Likely candidate — needs the same check.
- If neither is feasible inside a build cycle, the fallback is **published, citable age-profile
  figures from the papers in §6** (a published figure is a fact and is citable, same distinction
  `I22`'s Gate 0 licence note draws — the underlying microdata is the database, not the printed
  chart), with the animation driven by digitised published values rather than a from-scratch
  run. That is a weaker fit to "compute, don't author" and must be flagged on screen if used.

## 8. Accuracy risks the build must not skate past

1. **Cross-sectional vs longitudinal, restated because it is the whole risk.** "Your pay peaks in
   your late 40s and doesn't come back" is a claim about **one person's trajectory over time**.
   A same-year snapshot of different people at different ages cannot prove it, no matter how
   often that shape gets cited as if it does. If Stage 3 cannot secure genuinely longitudinal
   data, the sentence must be rewritten to a population-snapshot claim ("people ten years older
   than you, right now, earn X" — still self-relevant, just an honest different claim).
2. **"Most people" needs a defined population.** If the peak age or post-peak shape differs
   meaningfully by education, sex, or occupation, the reel must either pick one stated group and
   say so on screen, or show that the qualitative shape (rise, peak, plateau/decline) holds
   across groups even if the exact age moves — not paper over the variation the way `I15` papered
   over Paris-vs-Manhattan.
3. **Real vs nominal.** Earnings must be inflation-adjusted (real terms) or the "never comes back"
   claim is trivially true by inflation alone and means nothing.

## 9. Awaiting

**A human yes on the sentence and the frame, with the kill-condition-2 waiver read and accepted
as written above.** Gate 0 is not mine to pass, and the waiver is not mine to grant unilaterally
either — it is written down because the account owner already said yes to testing the format;
this file is that agreement made checkable later.
