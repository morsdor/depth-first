# Gate 0 — `I81`, "when you lose weight, you breathe it out"

Proposed as **r013**, 2026-09-16. Backlog id `I81` (§3 *What actually happens when you…* →
accent `languages #51A4FF`). Nothing has been built. This file and `payoff_frame.png` are the
two artefacts CLAUDE.md requires **before** any Python, any `.tsx`, any data module.

**Numbering note:** `r012` (`I84`, earnings) is already claimed, built, rendered, and sits at
GATE 5 in `projects/r012_earnings/`. Per the account owner, `I84` has already been posted outside
this tree's logs, so this concept claims the next open number, `r013`, rather than waiting on
`r012`'s four logs to be written.

## 1. The sentence

> **"You don't sweat fat off — you breathe it out. Almost all of it leaves as the CO2 in your
> breath, not sweat, not the toilet, not 'turned into energy.'"**

Short form for the title card: **"You don't sweat fat off. You breathe it out."**

## 2. Who does the viewer send this to, and what are they proving?

Sent to anyone currently dieting, or anyone who just said one of the three wrong answers out
loud — "sweated it out," "it turns into muscle," "it just burns off." This is a dispute almost
everyone has actually had, usually across a gym or a dinner table, and almost nobody gets the
mechanism right — the honest folk answer is usually "energy" or "toilet," both wrong.

| condition | verdict |
|:--|:--|
| Personally witnessed the evidence | **Yes** — everyone who has lost or tried to lose weight has stepped on a scale and had no idea where the number went. Universal, repeated evidence, not secondhand. |
| A dispute already running, that a non-specialist is in | **Yes** — "where does the fat go" is one of the most common wrong-answer questions in casual conversation; not a specialist's argument (contrast `I24`'s Minecraft-seed failure). |
| Resolves to one repeatable number | **Yes** — 84% of the lost mass leaves as exhaled CO2, 16% as water (LEAD, see §5). One ratio, portable without the reel. |

## 3. The payoff frame

`payoff_frame.png` — from `mock_payoff.py`, PIL, ~5 minutes. A person in profile exhaling a
drifting breath cloud, a bathroom scale below reading a dropped weight, an arrow tying the missing
mass to the breath, and the three wrong answers named and crossed out in the closing line. Both
objects (a person breathing, a bathroom scale) are ordinary and nameable with the sound off; no
chart, no matrix, no abstract cell grid.

## 4. Kill conditions — the gate's own three

| Condition | Verdict |
|:--|:--|
| The sentence needs a CS word | **No.** "Breathe," "sweat," "toilet," "CO2" — CO2 is taught in primary school, not a specialist term, and the sentence is fully intelligible without it ("you breathe it out" alone carries the claim). |
| The payoff frame shows an object the viewer has never seen | **No.** A person's exhale and a bathroom scale are both objects everyone has seen and used. |
| The amazement depends on understanding first | **No — this is the one to watch closely, and the honest read is below.** The surprise ("your breath, not sweat, not the toilet") lands on first viewing with no setup: the viewer already knows the three wrong answers and the frame directly contradicts them. Unlike `I15`, there is no algorithm to follow before the picture matters — the picture *is* the mechanism (mass leaving via the lungs). Risk noted for Gate 2: this is closer to a "surprising fact" reel than a "watch a process run" reel like r005's great circle, so the visual needs a genuinely real-time payoff (the counter moving, the breath actually flowing) rather than a static claim card, or it drifts toward being told rather than shown. |

Recognisable object stays on screen for the whole reel (non-negotiable 6): yes — the plan is to
keep a body/breath visual (or a single stated mass, e.g. a 10 kg block of fat) in frame throughout,
with the chemistry (§5) computed underneath it rather than replacing it.

## 5. Numbers, and where they came from — VERIFIED 2026-09-16, Stage 3

**Primary source:** Meerman KC, Brown AJ, *"When somebody loses weight, where does the fat go?"*,
BMJ 2014;349:g7257 (PubMed 25516540, Christmas issue). Full-text (`bmj.com`) and PubMed were both
blocked by this session's egress proxy — consistent with the block CLAUDE.md already records for
`I15`'s Overpass fetches — so the figures below are corroborated through the paper's own quoted
equation and headline numbers, repeated consistently across independent secondary write-ups
(ScienceDaily, NPR-affiliate wire copy, UNSW's own press release, ScienceBlog) that all quote the
same equation and the same two figures, **plus an independent from-scratch recomputation (below)
that was never told the answer in advance.**

**The paper's balanced equation** for the average human triglyceride:

> C₅₅H₁₀₄O₆ + 78 O₂ → 55 CO₂ + 52 H₂O + energy

**Headline, quoted consistently across sources:** of 10 kg of fat (triglyceride) lost, **8.4 kg
(84%) is exhaled as CO₂ through the lungs; 1.6 kg (16%) becomes water**, excreted via urine,
sweat, breath moisture, tears and other fluids. The paper's own framing: **the lungs are the
primary excretory organ for weight loss.**

**Independent stoichiometric re-derivation (this session, `verify_i81.py`, standard IUPAC atomic
weights, not fitted to the target number):**

| step | value |
|:--|:--|
| C₅₅H₁₀₄O₆ molar mass | 861.431 g/mol |
| mass balance, reactants vs. products | 3357.275 g = 3357.275 g — **exact** |
| the fat's own 55 C atoms → all end up in the 55 CO₂ | |
| the fat's own 104 H atoms → all end up in the 52 H₂O | |
| the fat's own 6 O atoms → split in the same ratio the reaction actually uses O atoms (110 into CO₂, 52 into H₂O, of 162 total) | |
| **result** | **84.3% of the fat's own mass → CO₂; 15.7% → H₂O** |
| **published** | **84% / 16%** |
| **agreement** | within 0.25 percentage points, computed from the molecular formula alone |

This is the r011-shape check — an outside, already-published number, re-derived independently
rather than trusted on citation alone — and it holds. **This is also the reel's real "compute the
animation, don't author it" backbone**: the build's `compute.py` runs this exact mass-balance
calculation (not an authored ratio), so the on-screen 84%/16% is produced by code, the same shape
as every other shipped reel.

**Open items carried into the script:** the paper computes this for an *average* triglyceride
composition; individual body-fat composition varies slightly, so "about 84%" rather than a
false-precision "84.3%" is the honest on-screen figure. The energy-release term is real but is
explicitly NOT part of this reel's mass claim (see §7.1) and will not be quantified on screen.

## 6. Licence and feasibility

**Published figures, fully citable — no database/licence question.** The BMJ paper is a public,
peer-reviewed article; its headline ratio is a citable fact, not a restricted dataset (same
distinction as `I22`'s submarine-cable note). The independent stoichiometric check needs nothing
but the molecular formula and standard atomic weights — public, freely computable, no external
data source at all. Feasibility is not in question: this is a closed-form chemistry calculation.

## 7. Accuracy risks the build must not skate past

1. **"Turned into energy" is not simply false — it needs a precise correction.** The fat's
   chemical energy *is* released and used; what leaves the body is the carbon and oxygen atoms,
   as CO2, not "the energy" as a substance. The on-screen sentence must say mass leaves as CO2,
   not conflate that with the (true, separate) fact that the energy is used. This is exactly the
   kind of mechanism sentence non-negotiable 7 requires an experiment (here: a mass balance) to
   back, not just a citation.
2. **84/16 must be re-derived from the primary source, not assumed correct from memory** — the
   backlog row already flags this as a LEAD; treat the number as a hypothesis until the BMJ
   paper (or the independent stoichiometric calculation) confirms it in Stage 3.
3. **"Almost all of it" needs a stated base.** State clearly: 84% of the *mass lost*, not 84% of
   body mass, not 84% of calories. One stated base, per non-negotiable 7.
4. **Water is excreted through multiple routes** (urine, sweat, breath humidity, tears) — the
   sentence's "not sweat" line must not overclaim that *no* water leaves via sweat; the correction
   is about where the *lost mass* (fat) goes, i.e., predominantly the lungs, not that sweat carries
   zero water at all. Word this precisely in the script.

## 8. Awaiting

**A human yes.** Gate 0 is not mine to pass.
