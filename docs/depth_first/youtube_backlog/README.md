# The versioned YouTube backlog

*Started 2026-10-07. A **separate** register from [`backlog/`](../../../backlog/README.md), which is the Instagram reel
register and is not touched by anything here.* The YouTube line is parked in `CLAUDE.md`; this is the research and
idea supply for when it runs, kept so that two weeks of making a high-quality video cannot silently change what the
ideas were based on.

## Why it is versioned

The evidence moves: small channels grow past 5k, videos age out of a channel's newest 30, a new outlier appears, a
topic that was SUPPORTED loses its q-value. An idea list that is edited in place hides that. So:

- **A version is a frozen file** — `vN_YYYY-MM-DD.md` — tied to one scan snapshot in
  [`data/yt_scans/<date>/`](../../../data/yt_scans/). Once committed it is not edited (typos aside).
- **A new opinion is a new version**, with a changelog against the last one and the scan diff
  (`data/yt_scans/<date>/diff_vs_<previous>.md`) as its evidence.
- **[`ledger.csv`](ledger.csv) is the history in one table**: one row per idea per version (tier, status, wall, cost,
  evidence). Append rows; never rewrite earlier ones.

## Rules

1. **Ids `Y01…` are permanent and never reused.** A dead idea is marked `retired` and its row stays, so an old
   note that says "Y07" always resolves — the same rule as the reel ids.
2. **Status vocabulary:** `live` (a candidate) · `pilot` (pre-registered, build started or posted) · `posted` ·
   `parked` (set aside by the owner — not killed by data) · `retired` (killed by data or by a gate; say which).
3. **Tier is the strength of the data, not the quality of the idea.** A = significant and replicated, or significant
   and untestable but with ≥ 3 channels behind it; B = demand or lift on one leg only; C = one channel, a spike, or a
   wall. Re-tier from the new scan, never from memory.
4. **Every figure is a research lead** until checked against a primary source. Nothing in a version has passed Gate 0,
   G3 or G4.
5. **A version records what changed:** ideas added, promoted, demoted, retired; which numbers moved and why
   (new data, or a corrected method — say which); and the result of any pilot posted since, against its
   pre-registered pass line.
6. **Pilot results are evidence.** When a video posts, its day-28 views, its thumbnail variants' watch-time shares and
   the channel's own multiple go into the next version's ledger row and into the next scan's dataset.
7. **Promotion to the reel register** (`backlog/open.md`) only on the owner's yes: `git fetch`, read `origin/main`'s
   `backlog/` for the next free id, then give it a section, an Added date and a GATE 3 sentence before any build.

## Versions

| Version | Scan | What it is |
|:--|:--|:--|
| [v1](v1_2026-10-07.md) | [`2026-10-07`](../../../data/yt_scans/2026-10-07/) | 16 ideas (Y01–Y16), three recommended pilots (Y01, Y02, Y04). Method and caveats: [`../systems_lane_data_findings.md`](../systems_lane_data_findings.md) |

## Cutting the next version

Run the [`yt-lane-scan`](../../../.claude/skills/yt-lane-scan/SKILL.md) skill (or `/yt-lane-scan`). It re-pulls the
data, snapshots it, diffs it against the previous snapshot, and walks the changes into `v(N+1)` and new ledger rows.
Cadence: **every two weeks while a video is in production, and before each final topic decision.** Data older than a
month should be re-pulled before it is used for a decision.
