# Depth First — operating docs for the Instagram-first phase

*Written 2026-09-10, the day the account pivoted from "a discovery layer for a YouTube channel"
to the main thing. Six documents. They describe what exists, not what was planned — every path,
number and command in them was read from the repo or measured on this machine on that date.*

**How these relate to the files that already govern the reels:**

| File | Role |
|:--|:--|
| [`CLAUDE.md`](../../CLAUDE.md) | **The law.** Nine non-negotiables, Gate 0, the argument test, the "Built so far" table. Wins every disagreement. |
| [`.claude/skills/new-reel/`](../../.claude/skills/new-reel/SKILL.md) | **The procedure.** `/new-reel` walks Stage 1 → 6 with three human gates. |
| [`brand_guide_software.md`](../../brand_guide_software.md) §13 | **The ledger.** Every dated lesson, including the retracted ones. |
| [`content_backlog.md`](../../content_backlog.md) | **The topic supply.** 69 permanent ids in six sections; the section is the accent colour. |
| [`reel_captions_log.md`](../../reel_captions_log.md) | Captions, load-bearing phrasings, engagement per posted reel. |
| **These docs** | **The map.** How the machine works end to end, what is clutter, what tools exist beyond it, how to make each reel leave parts behind, and how to run the account like a business. |
| **`software_thesis.md`** | **The bet beyond the account.** The repo as the seed of a product, and what that changes about how the reels are built today. |

---

## Read in this order

1. [`state_of_the_account.md`](state_of_the_account.md) — the numbers as of 2026-09-10 and what they do and do not show. Five minutes.
2. [`reel_pipeline.md`](reel_pipeline.md) — the whole flow: backlog → Gate 0 → Python → JSON → TS → Remotion → Manim layer → ffmpeg audits → five logs → post. Where every tool sits and what it is for.
3. [`repo_audit.md`](repo_audit.md) — **executed 2026-09-10.** The YouTube line was retired to the branch `yt-longform-archive-DO_NOT_DELETE`; this is the record of what moved, what was deleted, what was fixed, and how to get any of it back.
4. [`visual_toolbox.md`](visual_toolbox.md) — everything a reel could be made of beyond what has been used: maps and terrain flyovers, three.js and Blender, charts, body anatomy, real footage, and the licence on each.
5. [`module_packs.md`](module_packs.md) — how each reel becomes a part in a library instead of a one-off, with the concrete duplications measured in the current code.
6. [`growth_strategy.md`](growth_strategy.md) — the CEO view: what the engine is, the portfolio of bets, the pre-registered experiments, the metrics log, the 90-day plan, and the decisions only you can make.
7. [`software_thesis.md`](software_thesis.md) — the product hiding in the repo. What is actually defensible, why an AI editor is the wrong first build, the explainer-engine wedge, the arithmetic to $1M, the three-layer architecture, and the Remotion licence constraint.

---

## The one-paragraph version

Eight reels are posted. One of them (r005, the flight-path map) did 80k+ views and brought ~120 of the account's 145 followers; the other seven sit between ~190 and ~1,800 views. That is the shape `insta_strategy.md` predicted a week before it happened: a power law, where a small number of reels carry everything. The machine that makes a reel is real and reproducible — real algorithm in Python, asserted claims, computed frames, ffmpeg audits, a human at three gates — and it can already produce close to a reel a day. What decides the outcome is not craft; the motion audit and the safe-area audit have never once predicted reach. It is **which argument the reel walks into** and **whether a stranger can name the object in the first half-second**. The strategy is therefore to keep the machine, make it cheaper per reel by turning every build into library parts, and spend the saved time on picking better fights and running pre-registered experiments — logged, read at 24 hours and 7 days, and never over-read from a single data point again.

---

## The account is not the end state

The reels are the R&D lab for something larger — see [`software_thesis.md`](software_thesis.md). The short version: the defensible asset is not the components or the mp4s, it is **the method that makes animation true by construction, the human-gate pattern that makes an agent usable, and the judged corpus of what worked**. That points at an explainer engine sold to people who need to be right, not an editor sold to creators who need to be fast. It changes almost nothing about how a reel is built today, and it raises the priority of [`module_packs.md`](module_packs.md) from a cadence improvement to the first product surface.
