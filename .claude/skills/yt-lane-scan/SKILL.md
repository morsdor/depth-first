---
name: yt-lane-scan
description: >-
  Use when re-running the YouTube outlier / small-channel data for the "computing systems, measured"
  YouTube line — "/yt-lane-scan", "refresh the outliers", "re-run the YouTube data", "before the next
  video", "has the lane changed", "cut a new backlog version", "update the YouTube backlog". Re-pulls
  the data with the YouTube Data API, freezes it as a dated snapshot, diffs it against the last one,
  re-runs the within-channel title/topic/thumbnail analysis with its corrections, and walks the
  changes into a NEW version of the versioned YouTube backlog. Does NOT touch backlog/open.md (the
  reel register), does NOT mint reel ids, does NOT edit an earlier backlog version.
---

# YouTube lane scan — refresh the evidence, then version the ideas

The first scan (2026-10-07) is in [`data/yt_scans/2026-10-07/`](../../../data/yt_scans/2026-10-07/); its method and every
caveat are in [`docs/depth_first/systems_lane_data_findings.md`](../../../docs/depth_first/systems_lane_data_findings.md);
the ideas it produced are v1 of [`docs/depth_first/youtube_backlog/`](../../../docs/depth_first/youtube_backlog/README.md).
**Read the findings doc's "Data and method" and `references/pitfalls.md` before trusting a number from a re-run.**

**Why re-run at all.** Making one high-quality video takes about two weeks, and the lane moves in that time: small
channels grow past 5k subscribers, videos age out of a channel's newest 30, new outliers appear, a topic's q-value
shifts. The versioned backlog exists so that every idea can say *which scan it was based on* and what changed since.

**Status of the YouTube line:** parked in `CLAUDE.md`. This skill is research for the day it runs; it is not a reel
procedure (`/new-reel` is) and nothing here has passed Gate 0 / G3 / G4. The Instagram reels and their register
(`backlog/`) are untouched.

## The honesty rules (they cost a day to learn — `references/pitfalls.md` has the stories)

1. **A view-sorted search can only prove existence, never lift.** Use the outcome datasets (known channels' full
   recent catalogue; small channels' *unfiltered* catalogue) for "what predicts views"; use the search pulls only for
   topic breadth and crowding.
2. **Normalise within the channel**: `ln(views ÷ the channel's own median)`, residualised on `ln(age)`; drop videos under
   60 days; cap at ±20×.
3. **Drop the videos that put a channel in the sample.** They were selected on the outcome.
4. **Drop vendor and promoted channels** (`CORPORATE` in `scripts/systems_lane_analysis.py`) — ad-driven views are not
   demand. Add new ones as you find them; say so in the version changelog.
5. **Every effect needs a within-channel permutation p, a channel-cluster bootstrap interval, a BH q, and a
   replication check** (same sign in the known channels and the small ones). A topic is a *pattern* only with ≥ 3
   distinct channels holding a 3×+ video.
6. **When a number moves between scans, suspect in this order: the sample, the regex, then the world.** Print the rows
   behind any topic that moves (a regex that matched "engine" turned game-engine tutorials into "electronics").
7. **Report what predicts nothing.** Out-of-sample AUC was 0.555 for titles and 0.509 for topics in v1. The data ranks
   topics and lists what to avoid; it does not forecast a video and it does not design a "perfect" thumbnail.
8. **Base rates go in every report:** in v1 the median small-channel video got ~800 views, 7.7 % reached 10k, 1.9 %
   reached 40k. A pass line that ignores this is a wish.
9. **Every external figure is a lead** until read from a primary source (Gartner, DRAM prices, vendor specs).

## Stage 0 — preflight (2 minutes)

- `YOUTUBE_API_KEY` is in `.env` (git-ignored). **Never read, print or paste it.** The scripts load it themselves.
- The API is free but capped at **10,000 units/day**; a full run is ~6,100. Check nothing else used today's quota.
- **API data is perishable.** The YouTube API developer policies ask that stored non-authorised API data be refreshed
  or deleted within about 30 days — check the current terms. Snapshots older than a month are a record, not evidence;
  that is a second reason the cadence is two weeks.
- `git status` is clean enough to see what this scan changes. Work on `main` (repo rule).

## Stage 1 — plan, then run

1. Write the saturation queries for the **current top backlog ideas** (one `tag|query` per line, `#` comments allowed)
   to a file, e.g. `data/yt_scans/queries.txt`. These are what a viewer would type for each idea — see v1's
   `scripts/idea_saturation_check.py` list for the shape. Stale queries make the crowding table describe old ideas.
2. `python3 scripts/yt_lane_scan.py plan` — read the unit estimate.
3. `python3 scripts/yt_lane_scan.py run --yes --queries data/yt_scans/queries.txt`
   runs, in order: known-channel refresh (`fetch_outliers.py`) → 40 topic searches (`small_channel_hunt.py`) →
   unfiltered small-channel catalogues (`small_channel_catalogue.py`) → analysis (`systems_lane_analysis.py`) →
   saturation check → **snapshot** (`data/yt_scans/<today>/`) → **diff** against the previous snapshot.
   - `--only analysis` re-analyses data already on disk (0 units). `--with-lane-discovery` adds the 26 pillar searches
     (~2,600 units). `--no-snapshot` skips freezing. A step that fails stops the run; fix, then re-run that step with
     `--only`.
   - **Do not overwrite a snapshot.** Same-day re-runs need `--date <label>`.
4. Add or change a topic only by editing `TOPICS` in `scripts/systems_lane_analysis.py`, then print the rows it
   matches before believing it.

## Stage 2 — vet the new outliers by hand

Open `data/yt_scans/<today>/diff_vs_<previous>.md`. For every **new entrant**: on-lane? a vendor channel? off-lane viral
(a cave channel, a finance channel)? Drop or tag each. Note **channels that graduated** past 5k subs and videos
**still climbing** — those are the evergreen candidates the one-snapshot proxy cannot see. Record vendor additions in
`CORPORATE` and rerun `--only analysis` if you add any.

## Stage 3 — read the analysis, apply the rules

Read the diff's topic, title and ranking tables, then `data/analysis_systems/*.csv`. For each topic that **moved or
changed SUPPORTED ↔ no**, check the three suspects (rule 6). Compare with v-previous's ledger row; write the reason as
"new data", "corrected method" or "changed regex" — never just "moved".

## Stage 4 — thumbnails (optional, needs a yes)

Only if the question is about thumbnails. **Ask first**: state the count, the source (`i.ytimg.com`) and the size
(~15 KB each; 2,834 files was 39 MB in v1) — downloading is an explicit-permission action.
1. Fetch `mqdefault.jpg` (320×180). **Never `hqdefault`** — it has black bars that corrupt every brightness statistic.
   Keep them in the session scratchpad or the git-ignored `data/`, not in git.
2. `python3 scripts/thumb_features.py --dir <folder>` — pixel statistics, tested within channel.
3. Hand tags on a **matched sample** — each channel's best and worst by within-channel views, shuffled and numbered so
   the coder sees no title, views or role (v1: known channels top-3/bottom-3, 40 random small channels top-2/bottom-2,
   vendor channels removed). Tags: face, text (0/1–3/4+ words), subject (P/R/D/I/M/H/X), annotation, brand, number,
   clutter 1–3. Save to `data/analysis_systems/thumb_matched_sample_tags.csv`, then
   `python3 scripts/thumb_tag_analysis.py`.
4. Report intervals, not verdicts: ~170 per side detects only about ±10 points. Today's thumbnails are often
   A/B-swapped since publishing and are not necessarily the ones that earned the views.

## Stage 5 — cut the next backlog version

Procedure in [`docs/depth_first/youtube_backlog/README.md`](../../../docs/depth_first/youtube_backlog/README.md). In short:
1. Copy the previous version file to `v(N+1)_<date>.md`; set the header: the new snapshot link, the diff link, a
   changelog (added / promoted / demoted / retired, which numbers moved and *why*).
2. Re-tier every idea from the **new** data. Add ideas for topics that gained support; retire (never delete) those that lost it.
3. Fold in the result of any posted pilot against its pre-registered pass line (day-28 views, the thumbnail variants'
   watch-time shares, the channel's own multiple).
4. Append one row per idea to `ledger.csv` for the new version. **Ids are permanent and never reused.**
5. Add the row to the README's Versions table. Leave every earlier version file exactly as it was.

## Stage 6 — report and commit

Report in this order, short: **headline** (what the data does and does not say) → **what changed since the last scan**
(new entrants, graduates, risers, topic and ranking moves) → **what was corrected** → **base rates** → **the new
version's pilots** → **what was not verified**. Then commit snapshot + version + ledger together on `main`
(the repo rule is commit-and-push to `main`; no branches except `/wip`). Do not edit `backlog/open.md` and do not mint
`I##` ids; promotion is the owner's call (`git fetch`, read `origin/main`'s `backlog/`, then a section, an Added date and
a GATE 3 sentence).

## Where things are

| What | Where |
|:--|:--|
| Orchestrator (plan / run / snapshot / diff) | `scripts/yt_lane_scan.py` |
| Pulls | `scripts/fetch_outliers.py` (known channels, `data/comp_channels_systems.yaml`), `small_channel_hunt.py`, `small_channel_catalogue.py`, `lane_discovery.py` (optional), `idea_saturation_check.py` |
| Analysis | `scripts/systems_lane_analysis.py` → `data/analysis_systems/`; thumbnails: `thumb_features.py`, `thumb_tag_analysis.py` |
| Frozen scans | `data/yt_scans/<date>/` (raw pulls, analysis, `manifest.json`, `diff_vs_*.md`) |
| Versioned ideas | `docs/depth_first/youtube_backlog/` (`README.md`, `vN_<date>.md`, `ledger.csv`) |
| Method, caveats, the v1 reasoning | `docs/depth_first/systems_lane_data_findings.md`, `references/pitfalls.md` |
