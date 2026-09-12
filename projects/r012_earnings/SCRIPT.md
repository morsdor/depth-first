# SCRIPT — `r012`, `I84`, "your pay has a peak age. it's 46."

**Gate 4 — REVISED 2026-09-12** after reading the primary source in full (user supplied the PDF;
`gate0/GATE0.md` §6 has the verification). The original sentence claimed one person's paycheck was
tracked across their whole career; the source doesn't support that for the rise-to-peak part, and
this version is corrected. Nothing below is coded yet — no Python, no `.tsx`, no data module.

**Runtime target 32 s.** Format: "this is you" data reel, kill condition 2 deliberately waived
per `GATE0.md` §5. No 3D — the object under test is one line and an age counter; depth would fight
the instant legibility this format needs, so this is the stated non-3D exception (Stage 3c).

**Source, and exactly what it supports — read this before the table:**
Brady & Bass (ICI), *"A Day in the Life Cycle: Using Tax Data to Measure Changes in Income by
Age,"* IRS SOI working paper, draft Dec 10, 2024. Real 2016 IRS tax data, the whole US population
(filers, dependents, nonfilers). **The rise to the peak (22→46) is a cross-sectional snapshot of
one year — different people at different ages in 2016, not one career.** The authors say so
directly. **The decline from 55 onward is different: the paper cross-checks it against a real
panel study (Brady & Bass 2023a) that tracked the SAME people from 55 to 72, and the shapes
match.** The script keeps these two claims visually and verbally distinct rather than blurring
them into one "your whole career" story.

| t | Narration — on-screen words, verbatim | On screen | Why this beat exists |
|:--|:--|:--|:--|
| 0.0–3.0 | **"YOUR PAY HAS A PEAK AGE."** | The earnings line is already drawn and already animating in as the words land — rising from bottom-left, an age counter ticking up fast beside it. No step label, no setup. | Hook shows before it tells (non-negotiable 3). The line moving *is* the Gate 0 payoff frame, already in motion. |
| 3.0–8.0 | **"Real IRS tax data. Every American, one age at a time, in 2016."** | Line climbs; counter passes age 30 at **$30,000** (verified). A small crowd-of-dots texture rides behind the line — many people, one snapshot year — to keep the cross-sectional framing visible rather than implied. | This is the correctness fix itself, said on screen: a real, large, representative sample for one year — not a promise about any one person's career. Directly answers `GATE0.md` §8.1. |
| 8.0–15.0 | **"It's 46. $41,000. The peak."** | Line keeps rising, visibly slowing; a marker drops at the peak, age counter reads **46**, dollar readout locks at **$41,000**. Full hold (non-negotiable 5). | The single number the reel resolves to — verified, not a lead. Gets the complete hold time non-negotiable 5 requires. |
| 15.0–21.0 | **"Past 55, when the SAME people were tracked for years — it never came back."** | Line turns down past the peak; the "crowd" texture drops away here and the line becomes a single bright thread — visually marking the switch from population snapshot to real tracked individuals. Counter reaches **61**, readout falls to **$37,000**; a faint line stays at peak height so the gap is visible, not asserted. | This is the one part of the claim with genuine longitudinal backing (`GATE0.md` §6) — the visual switch (crowd → single thread) is doing real work, not decoration: it marks exactly where the evidence changes kind. |
| 21.0–26.0 | **"WHERE ARE YOU ON THIS LINE?"** | Frame pulls back to the whole curve, age 22–70. A bright marker sits at a middle-of-the-pack age, inviting the viewer to place themselves. | The mechanism under test (`GATE0.md` §4): self-relevance substituting for object-recognition. |
| 26.0–32.0 | **"Save this. Check back at your birthday."** | Full curve held steady, peak still marked, a save icon animates once. | Practical-utility close, matching the pre-registered success metric (saves/watch time, not sends). |

## Copy column, read alone — the r010 check

"YOUR PAY HAS A PEAK AGE." / "Real IRS tax data. Every American, one age at a time, in 2016." /
"It's 46. $41,000. The peak." / "Past 55, when the SAME people were tracked for years — it never
came back." / "WHERE ARE YOU ON THIS LINE?" / "Save this. Check back at your birthday." — reads as
a complete, honest claim on its own, with the cross-sectional/panel distinction stated in words,
not left to the "why" column to carry silently.

## One ruler

Every number is real income in dollars, at a real age, on the same line. No unit ever changes.

## What changed from the pre-verification draft, and why

- Dropped **"tracked as the same person, their whole career"** — false for the 22→46 leg per the
  primary source's own caveat. Replaced with an honest cross-sectional framing plus a visual
  device (the crowd texture) that keeps the distinction legible without a lecture.
- **"Doesn't come back"** is kept, but now scoped to the 55+ leg specifically, which is the part
  the source's own panel cross-check actually supports.
- Age at peak is **46**, not "late 40s to early 50s" — the earlier range was a search-summary
  approximation; the primary source gives one clean, verified number.
- **$41,000 / $37,000** replace the earlier unverified "$41k / 9% by 61" mix — both figures now
  read directly off the paper's Figure 4 and text, not a search engine's summary of it.

**Awaiting a human yes on this table before any Python or `.tsx` is written.**
