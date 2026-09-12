# SCRIPT — `r012`, `I84`, "your pay peaks in your late 40s, and it doesn't come back"

**Gate 4.** Nothing below is coded yet — no Python, no `.tsx`, no data module. Runtime target
**32 s**. Format: "this is you" data reel, kill condition 2 deliberately waived per
`gate0/GATE0.md` §5. 3D not used — the object under test is a single line and an age counter;
adding depth would fight the one thing this format needs (instant self-relevant legibility), so
this is the stated non-3D exception per Stage 3c.

**Data status, said plainly before the table:** the peak-age and dollar figures below come from
Brady & Bass, *"A Day in the Life Cycle: Using Tax Data to Measure Changes in Income by Age,"*
IRS Statistics of Income working paper (2024) — real IRS tax-return data, and the paper's own
framing ("changes in income by age," a per-year-of-age rate of decline in the older brackets) is
the individual-trajectory shape this reel needs, not a same-year snapshot. **These figures are
sourced from search-engine summaries of the paper, not a direct read of the PDF** — this
session's web-fetch tool is blocked on every external host tried (irs.gov included). They are
carried as **LEADS, not verified facts**, exactly like every other unverified row in this
backlog, and must be confirmed against the primary PDF (or a reachable mirror/session) before
this ships. If a number below turns out wrong at that check, the shape survives (the paper's
`peaks mid-40s, declines after` finding is corroborated independently by Guvenen et al.,
*Econometrica* 2021, on SSA panel data) but the specific dollar figures and ages must be corrected
first, per non-negotiable 7 — this is not optional and is the single biggest risk to this build.

| t | Narration — on-screen words, verbatim | On screen | Why this beat exists |
|:--|:--|:--|:--|
| 0.0–3.0 | **"YOUR PAY PEAKS IN YOUR LATE 40s."** | The earnings line is already drawn and already animating in as the words land — rising from bottom-left, an age counter ticking up fast beside it. No step label, no setup: the claim and the moving line arrive together. | Hook shows before it tells (non-negotiable 3). The line moving *is* the payoff frame from Gate 0, already in motion. |
| 3.0–8.0 | **"Tracked as ONE person, their whole career — not a snapshot of different people at different ages."** | Line continues climbing; counter passes age 30 at **$30,000** (real anchor). A small "1 person" icon rides the line's leading tip. | This is the correctness claim the whole build rests on (GATE0.md §8) — it has to be said on screen, not just true in the data, or the sentence is unearned. |
| 8.0–15.0 | **"By 46, it peaks — at $41,000."** | Line keeps rising, visibly slowing; a marker drops at the peak point, age counter reads **46**, dollar readout locks at **$41,000**. Brief hold on the peak (non-negotiable 5). | The single number the whole reel resolves to. Gets the full hold time non-negotiable 5 requires — this is the moment everything else is scaffolding for. |
| 15.0–21.0 | **"After that, it only goes down. By 61, it's already 9% below its best year."** | Line turns and descends past the peak marker; a faint horizontal line stays at peak height so the gap is visible, not asserted; counter reaches **61**, readout ticks down, a small **−9%** tag appears against the peak line. | Turns the shape into a number the viewer can hold onto — "9% by 61" is the repeatable fact GATE 3 needs, weak as that answer already is (GATE0.md §2). |
| 21.0–26.0 | **"WHERE ARE YOU ON THIS LINE?"** | Camera/frame pulls back to show the whole curve, 22 to 65. A bright marker slides to a middle-of-the-pack age (illustrative "41" from the Gate 0 mock, or left as a blank marker the copy invites the viewer to place themselves at). | This is the actual mechanism under test (GATE0.md §4): self-relevance substituting for object-recognition. The whole format lives or dies on this beat landing as a question, not a lecture. |
| 26.0–32.0 | **"Save this. Check where you land — and where it turns."** | Full curve held steady, peak still marked, save icon animates once over the frame. | Practical-utility close: a save-driven CTA fits the "this is you" channel better than a follow ask, and this is the metric (§ pre-registered in GATE0.md) the experiment is actually judged on. |

## Copy column, read alone — the r010 check

"YOUR PAY PEAKS IN YOUR LATE 40s." / "Tracked as ONE person, their whole career." / "By 46, it
peaks — at $41,000." / "After that, it only goes down. By 61, it's already 9% below its best
year." / "WHERE ARE YOU ON THIS LINE?" / "Save this. Check where you land — and where it turns."
Read with the other columns covered: this is a complete, self-contained claim without needing the
table's context — no r010-style silent dependency on the "why" column.

## One ruler

Every number is real income in dollars, at a real age, on the same line. No unit ever changes.

## What this script does NOT yet resolve

1. **The exact figures need primary-source verification** (see status note above) — this is
   Stage 3's unfinished business carried into Gate 4 deliberately, flagged rather than hidden.
2. **Longitudinal-ness of the IRS source itself is not yet confirmed from the primary text** —
   the "changes in income by age" framing strongly implies a year-over-year matched-filer design,
   but this must be read, not inferred from a search summary, before the on-screen claim ships.
3. If Stage 3 verification lowers confidence below "computed, cited, individual-trajectory," the
   copy at 3.0–8.0 and 15.0–21.0 changes to match whatever the primary source actually supports —
   the shape of this script stays, the numbers do not ship unchecked.

**Awaiting a human yes on this table before any Python or `.tsx` is written.**
