# `backlog/` — the reel idea register

**Created 2026-09-12.** Replaces the single root `content_backlog.md`, which had grown into one
list holding live candidates, shipped reels and dead ideas together — so reading it meant filtering
out the 15 ids that were already spent before you could see the 56 that were not.

| File | What is in it | Rule |
|:--|:--|:--|
| [`open.md`](open.md) | **The live list. Candidates only.** | This is the only file to read when picking a reel |
| [`posted.md`](posted.md) | Ids that reached the feed | Moved here on posting, never moved back |
| [`closed.md`](closed.md) | Retired, killed by a gate or by its own data, built and shelved, or **parked by the owner** | Rows stay forever so old logs resolve |

**Counts at 2026-09-25: 85 ids `I01`–`I85`.** Never take live/posted/closed counts from this line —
the script below reads them from the repo.

```bash
python3 .claude/skills/new-reel/scripts/backlog_ideas.py          # the live candidates
python3 .claude/skills/new-reel/scripts/backlog_ideas.py --id I73 # one in full
```

It reads `open.md` for the rows and `CLAUDE.md` + `gate0/` for the status of each, so status is
never taken from memory. Ask it for a spent id and it says which file the id moved to, rather than
offering it as free.

## The rules

- **Ids are permanent and are NEVER reused for a different concept.** That is what lets an old
  engagement log resolve years later. Moving a row between these files never changes its id.
- **An id is minted BEFORE a build starts**, with its section — and the section is the accent
  decision, mapping 1:1 onto `DOMAIN_ACCENT` in `remotion/src/brand/tokens.ts`.
- **When a reel is posted, its row moves to `posted.md` the same day**, along with the updates to
  `CLAUDE.md`'s "Built so far" table, `../reel_captions_log.md` and `../brand_guide_software.md` §13.
- **Every figure in a row is a research lead, not a fact.** `I15` shipped a hook no real graph
  supported; `I53` died in twenty minutes once its figure was checked.
- **Row format is parsed** by `backlog_ideas.py` — keep the column order, and put the GATE 3 answer
  in an italic `*(...)*` note directly beneath the row, where the script picks it up.

## Dates

Every row carries an `Added` column. `I01`–`I53` were written 2026-09-02 in one sitting and their
figures are unverified; `I54`–`I69` were added 2026-09-10 when the remit widened from software to
"how systems work"; `I70`–`I71` on 2026-09-11, the first invented rather than taken from the list;
`I72`–`I82` on 2026-09-12, the first batch selected on a single filter — **does it feed an argument
people are already having;** `I83` also on 2026-09-12, reasoned from scratch rather than taken from
either batch — a roundabout-vs-traffic-light throughput claim we compute ourselves, on the same
"does it feed an argument people are already having" filter. `I84` on 2026-09-12, also reasoned
from scratch — the account's first deliberate, written waiver of Gate 0 kill condition 2, testing
a "this is you" self-relevant data format against a channel `what_travels.md` names and marks
**"none yet"** against.

## `PARKED`, added 2026-09-12

**`I65` and `I72` were set aside by the account owner rather than by a gate or a number**, which is
a fourth thing and now has its own state in [`closed.md`](closed.md). `I65` had been built as a
46 s reel and never posted; `I72` had been researched to a measured table and an approved script and
never animated. Both rows name the commit their code sits in, so the work is one `git checkout`
away and no measurement is repeated. **`I65` was also wrongly filed in `posted.md` — it never
reached the feed** — and that is fixed.

**One consequence outside this folder: `I65` gave its reel number back.** It held `r010`; reel
numbers mean "the Nth reel POSTED", so `r010` now belongs to `I71`, the pendulum loop, and the reel
being built from `I73` is `r011`.
