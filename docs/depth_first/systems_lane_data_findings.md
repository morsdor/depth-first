# What the YouTube data says about the "computing systems, measured" lane

*Written 2026-10-07. Method, results and every caveat. The ideas built on top of it are in
[`youtube_backlog/v1_2026-10-07.md`](youtube_backlog/v1_2026-10-07.md). Nothing here is a Gate 0, a G3 or a
backlog id — it is research for a YouTube line the repo currently has parked.*

## The one-paragraph answer

**The data can rank topics by evidence across many channels and tell you which to stay out of. It cannot predict an
individual video, and it cannot design a "perfect" thumbnail or title.** Out of sample, neither title features
(AUC 0.555) nor the topic taxonomy (AUC 0.509) predicts which videos beat their own channel's normal — the R² is
below zero. What survives: a handful of title levers with modest effects, three topics that repeat across channels
(LLM internals, AI-industry news, data centres), a list of topics that demonstrably do **not** work (outage
stories, algorithm animations, neural-net basics, system design, dev-tool news), and a finding that **colour,
brightness, faces, amount of text and numbers on a thumbnail do not separate a channel's winners from its own
losers**. So thumbnail effort belongs in the *promise*, not the palette.

**Two corrections mid-analysis changed the answer, and they are the most useful thing in this file.** The first pass
put "local-LLM hardware" (×1.64) and "CPU vs GPU" (×1.60) at the top. Dropping the videos that *got a channel into the
sample* (selected on views) cut them to ×1.44 and ×1.46; dropping five vendor channels (Crusoe AI, BIZON, Scan
Business, HOSTKEY, Ready Tensor — Crusoe alone has 8.2M views on 3.3k subscribers) cut them to **×1.16 and ×1.27, both
not significant**. A scan of this kind that is not corrected for selection recommends the wrong topics.

## Data and method

*This is the v1 analysis (snapshot `data/yt_scans/2026-10-07/`). To re-run it and diff against this one, use the
[`yt-lane-scan`](../../.claude/skills/yt-lane-scan/SKILL.md) skill; later scans write short diffs, not a new copy of this file.*

| Dataset | Rows | Used for |
|:--|:--|:--|
| `comp_videos_systems.csv` | 1,007 videos, 36 known channels (newest ≤30 long-form each) | outcome data |
| `small_channel_catalogue_systems.csv` (new — re-pulled **without** the 3,000-view filter that had dropped the flops) | 1,827 videos, 84 channels under 10k subs | outcome data |
| `lane_discovery_v2.csv`, `lane_discovery_systems.csv`, `small_channel_hits_systems.csv` | 1,722 search hits | **topic breadth and crowding only** — pulled with `order=viewCount`, top-viewed *by construction*; never used for lift |

**Outcome** `y = ln(views ÷ the channel's own median)`, capped at ±20× so one viral video cannot move a mean,
residualised on `ln(age)` within channel; videos under 60 days old dropped. **Final sample: 2,071 videos, 109
channels (35 known, 74 under 10k subscribers), 17.3 % at 3× or better.**

**The two corrections.** (1) The small channels were *found* because one of their videos was a view-sorted search
hit; that video is selected on the outcome. All 92 search-found videos were dropped from them. (2) Vendor channels
were dropped (view counts that are ad-driven, not organic demand). Both sensitivity runs are kept:
`data/yt_scans/2026-10-07/sensitivity_with_discovery_videos/` and `.../sensitivity_pre_corporate_exclusion/`.

**Tests.** Every effect: within-channel **permutation** p (labels shuffled inside each channel), channel-cluster
**bootstrap** 90 % interval, **Benjamini–Hochberg** q across the family, then **replication** — same sign in *both*
the known channels and the small channels? Code: `scripts/systems_lane_analysis.py` (numpy + pandas), outputs in
`data/analysis_systems/`. A topic counts as a pattern only if **≥ 3 distinct channels** have a 3×+ video in it.

**Say it up front:** ~800 rows of known channels and ~1,300 of small ones throw up spurious features; q and
replication are the filter, and several things below fail them.

## Titles

Effect = how many times a channel's own normal a video with the feature does, versus one without, same channel.

| Feature | Effect | 90 % interval | n (channels) | q | Same sign in both halves? |
|:--|:--|:--|:--|:--|:--|
| **"explained"** | **×1.32** | 1.15–1.52 | 216 (52) | 0.004 | yes (1.24 / 1.35) |
| **brand / hardware noun** (Nvidia, ASML, RTX, iPhone…) | **×1.29** | 1.14–1.45 | 315 (66) | 0.004 | yes (1.20 / 1.35) |
| **an ALL-CAPS word** | **×1.18** | 1.08–1.29 | 606 (96) | 0.004 | yes (1.12 / 1.22) |
| a physical-hardware word (chip, cable, power, server…) | ×1.37 | 1.18–1.60 | 180 (55) | 0.006 | **no** — 1.00 in known channels, 1.51 in small ones |
| "from scratch" | ×1.42 | 0.86–4.05 | 28 (10) | 0.28 | n/s |
| "vs" / "versus" | ×1.21 | 0.94–1.61 | 48 (30) | 0.44 | n/s (was ×1.56 before the corrections) |

**No effect found:** numbers in the title (×1.00), question marks (×0.97), "How" at the start (×1.11), "why" (×1.12),
threat/problem words (×1.10, sign flips between halves), a year (×0.85), a dollar amount (×1.11), first-person "I
built" (×1.05), colon subtitles (×1.04), second person "you" (×0.90). Short titles (≤ 35 chars) ×0.91 and long
(≥ 60) ×1.08, both q 0.28.

**Words.** None survive correction (best q = 0.135). Leaning up: *optimization, guide, data center, server, animation,
code, starlink, llm, works*. Leaning down: *easy, practical, making, software, security, self(-hosted)* — the
how-to/tutorial register loses, which fits the premise that tutorials have been commoditised. Leads, not findings.

**How much does it all predict?** Leave-channels-out ridge, out of sample:

| Model | R² | AUC for "3×+" |
|:--|:--|:--|
| title features | −0.6 % | **0.555** |
| topic taxonomy | −1.4 % | **0.509** |
| both | −3.0 % | 0.558 |
| ln(age) only | −0.1 % | 0.497 |

Packaging nudges the odds; it never decides them, and a topic label alone is no better than a coin flip at
predicting a single video.

## Topics

27 hand-written topic regexes (multi-label), not clusters, so each can be read and argued with. Full tables:
`data/analysis_systems/topic_effects.csv`, `topic_breadth.csv`, `topic_small_channel_yield.csv`,
`topic_opportunity_ranking.csv`, `topic_evidence.csv` (the 3×+ videos behind each topic, one per channel).

| Topic | Effect vs own normal | 90 % interval | n (ch) | channels with 3×+ | q | Both halves? |
|:--|:--|:--|:--|:--|:--|:--|
| ai_industry_news | ×1.36 | 1.09–1.70 | 110 (36) | 18 | 0.01 | yes (1.36 / 1.36) |
| llm_internals | ×1.34 | 1.14–1.65 | 164 (31) | 18 | <0.01 | yes (1.73 / 1.14) |
| **data_centers** | **×2.82** | 1.73–7.12 | 20 (8) | 7 | <0.01 | **untestable** — 1 video in the known channels |
| physical_networks | ×1.27 | 0.93–1.60 | 112 (33) | 14 | 0.08 | weak (1.04 / 1.33) |
| transistors_logic | ×1.54 | 1.00–2.27 | 24 (14) | 7 | 0.20 | n/a |
| ai_power_energy | ×1.53 | 1.12–2.41 | 20 (12) | 6 | 0.20 | n/a |
| graphics_engines | ×2.08 | 1.01–2.89 | 12 (7) | **2** | 0.19 | n/a — one channel dominates |
| cpu_gpu_architecture | ×1.27 | 0.98–1.66 | 52 (17) | 7 | 0.30 | yes (1.77 / 1.19) |
| local_ai_hardware_bench | ×1.16 | 0.93–1.47 | 35 (15) | 5 | 0.73 | n/a |
| memory_storage | ×1.13 | 0.88–1.44 | 44 (31) | 6 | 0.73 | **no** (0.75 / 1.45) |
| geopolitics_of_tech | ×2.70 | 1.21–5.11 | 16 (6) | 2 | <0.01 | spike — every hit in the last 180 days |

**Topics that do NOT beat their channels' normals:** failures / outages / bugs as stories (×0.98; **0 of 16**
small-channel videos reached 10k; 3 % hit rate), algorithms visualised (×0.93), neural-net basics (×0.96), OS and
low-level (×1.00), system design (×1.14, ns), history of computing and companies (×1.06), dev-tools and language news
(×1.05), memory/storage as a stand-alone topic (×1.13, sign flips), physical electronics as a pooled topic (×0.91).

**The within-channel view and the absolute view disagree, and both matter.** Within-channel lift asks "did the video
beat *that channel's* normal?" — easy for a channel whose normal is a few hundred views. The absolute view asks how
often a channel under 5k subscribers reaches 10k views at all (base rate 7.7 %):

| Topic | ≥10k share among <5k-sub channels | vs base | n (channels) |
|:--|:--|:--|:--|
| data_centers | 15.8 % | **2.06×** | 19 (7; 3 with a 10k+) |
| local_ai_hardware_bench | 22.2 % | 2.90× | 9 (5; **1** with a 10k+) |
| llm_internals | 2.5 % | **0.32×** | 81 (13; 2 with a 10k+) |
| physical_networks | 2.6 % | 0.34× | 38 (15; 1 with a 10k+) |
| cpu_gpu_architecture | 0 % | 0× | 26 (7; 0 with a 10k+) |

**LLM internals beats its channels' normal and still rarely reaches 10k for a small channel** — crowded with tiny
channels getting hundreds of views each. **Data centres is the only topic that does both.**

*A correction worth recording:* an earlier version of this table showed "electronics / motors / physical engineering" at
16.7 %, 2.17× base. That was an artefact — the topic regex matched "engine", so six of its seven 10k+ videos were
game-engine videos (Divine203, *Unreal in 5 Minutes*). After the fix the topic is ×0.91 vs own normal (ns), **9.1 %
reach 10k (1.18×) from 22 videos in 10 channels, and one channel (Curious flight) supplies the only 10k+ video**.

**Ranking.** Six criteria (lift, channels with a 3×+ video, small-channel yield, an evergreen proxy, demand,
crowding), then 3,000 random re-weightings to test how stable each rank is:

| Median rank (p10–p90) | Topic | In the top 5 of … |
|:--|:--|:--|
| **2** (1–12) | ai_industry_news — *80 % of its front-page top-15 is 1M+ channels, and it is not this channel's identity* | 74 % of weightings |
| **3** (1–10) | llm_internals | 76 % |
| **4** (1–11) | data_centers | 67 % |
| 4 (2–9) | physical_networks | 69 % |
| 5 (1–10) | transistors_logic | 58 % |
| 8 / 8 / 9 / 9 / 9 | ai_power, memory_storage, cpu_gpu, local_ai_hardware, dev-tools | 14–25 % |
| 18 of 19 | physical electronics (after the regex fix) | 0 % |
| 19 of 19 | failures_outages_bugs | 0 % |

**"Will it stay visible?" is a proxy, not a measurement.** One snapshot cannot show decay. The proxy: among videos
over 18 months old, views per day relative to the channel's own median (≥ 1 = old videos still earn). Reads ≥ 1:
cpu_gpu (2.27, **n = 8**), transistors (1.85, n = 6), ai_industry (1.57), llm_internals (1.44), physical_networks
(1.23). Reads low: dev-tools (0.64), history (0.64), algorithms (0.80), local_ai (0.54, n = 5), generative images
(0.10, n = 7). **Cannot be tested: data_centers and ai_power (n = 1–2 old videos — the topics are two years old).**
**Spikes, not evergreen:** geopolitics of tech (all hits in the last 180 days), ai_power (50 % recent), local_ai (43 %).

## Crowding — what a viewer sees on the front page

`scripts/idea_saturation_check.py`: each finalist query in **relevance** order, 10 results.

| Query | Top-10 median views | From 500k+ channels | Newest | Read |
|:--|:--|:--|:--|:--|
| undersea cables | 1.85M | 8/10 | 776 d | wall (11.8M, 6.0M, 4.3M) — **but stale** |
| transistors → adder | 1.20M | 7/10 | 432 d | wall (Ben Eater 3.1M, Core Dumped 1.6M) |
| why AI data centers use power | 349k | 9/10 | 4 d | news wall (TED-Ed, BBC, CNBC) |
| how EUV works | 153k | 4/10 | 83 d | giants own it (CNBC 3.6M, 4.2M) |
| how data-center power works | 130k | 2/10 | 8 d | **moderate** — MEP Academy 1.4M, Base Config 47k at 2.1k subs |
| CPU vs GPU, matmul | 11.8k | 0/10 | 0 d | **gap** (best 322k, 886 days old) |
| KV cache | 9.5k | 1/10 | 17 d | gap, low ceiling (IBM 196k is the exception) |
| LLM speed / memory bandwidth | 7.8k | 1/10 | 1 d | gap, low ceiling |
| HBM / RAM prices | 10.7k | 4/10 | 7 d | news spike (1.0M, seven days old) |
| FlashAttention | 1.8k | 0/10 | 1 d | nobody — and few are searching |

**The trade-off the data shows plainly:** the uncrowded topics have small demand today (10–40k ceilings); the
high-demand topics are walls. The cell worth building in is **moderate demand, moderate wall, and a computed or
measured angle nobody has** — data-centre power is the one topic where all of that is visible.

## Thumbnails

**1. Pixel statistics — nothing.** Brightness, contrast, saturation, colourfulness (Hasler–Süsstrunk), edge density,
dark/light background, warm/cool share, vivid-accent share, palette size, centre-vs-sides: 14 measures on 2,071
`mqdefault` thumbnails, tested within channel. **Best q = 0.27.** (`mqdefault`, 320×180, because `hqdefault` has black
bars that corrupt every brightness statistic.)

**2. Hand tags on a matched sample — nothing survives correction.** For each channel, its best and worst videos by
within-channel views (known channels top-3/bottom-3; 40 random small channels top-2/bottom-2), vendor channels
removed: **344 thumbnails, 69 channels, tagged blind** (shuffled; only a number visible — no title, views or role).
Every channel contributes equal winners and losers, so "Fireship-style vs 3B1B-style" cannot leak in. (Winner/loser roles
were assigned from the first, uncorrected outcome column; the within-channel ordering is almost unchanged by the
corrections, but it is not re-derived.)

| Tag | Winners | Losers | Channels: winners have more / fewer | p | q |
|:--|:--|:--|:--|:--|:--|
| a human face | 41.3 % | 41.3 % | 11 / 12 | 1.00 | 1.00 |
| 4+ words of text | 50.0 % | 48.8 % | 20 / 20 | 0.90 | 0.95 |
| a number on the thumbnail | 17.4 % | 18.6 % | 17 / 16 | 0.89 | 0.95 |
| busy (clutter 3 of 3) | 27.9 % | 29.7 % | 16 / 20 | 0.76 | 0.95 |
| brand logo or name | 32.6 % | 24.4 % | 22 / 16 | 0.074 | 0.28 |
| clean, one focal point | 30.2 % | 22.1 % | 21 / 11 | 0.066 | 0.28 |
| diagram / screenshot / code | 24.4 % | 17.4 % | 15 / 7 | 0.048 | 0.28 |
| 3D render / CGI of the subject | 15.7 % | 10.5 % | 11 / 4 | 0.081 | 0.28 |
| …same, small channels only | 20.0 % | 8.6 % | 7 / 1 | 0.036 | 0.31 |
| text-only, or illustration | 2.3 %, 7.6 % | 5.8 %, 12.2 % | 1 / 6, 5 / 10 | 0.074, 0.14 | 0.28, 0.39 |

With about 170 per side the data could have seen a swing of roughly **±10 percentage points**. So "faces boost
clicks" is **not supported here at any size that matters**; the leanings (a visible brand or hardware object, one clean
focal point, a rendered subject) are hypotheses to test. "Diagram/screenshot/code" leaned right in this version and
did not in an earlier one — treat every leaning as unstable.

**3. One real template, and what it does and doesn't prove.** 42 Index (3.4k subscribers) uses a split frame — *"X:
THIS IS OUTDATED | Y: THIS IS THE FUTURE"* — on 8 of its 28 videos (three more are variants). The 8 strict-template
videos: median **13.1k** views, against **0.8k** for the 17 non-template videos; its biggest four (174k, 27k, 26k, 18k)
are template videos. **But** the template also flopped four times (8.2k, 2.0k, 1.3k, 0.8k), and its winners are about
ASML and Nvidia, the better-known subjects. One channel, confounded with topic — a series identity that helps, not a
guarantee. (This comparison uses the channel's full catalogue, including the search-found videos excluded everywhere
else; several of its template winners are the videos that put the channel in the sample.)

**4. Caveats on all of it.** Today's thumbnails, often A/B-swapped since publishing, not necessarily the ones that
earned the views; one coder, not blind to my own priors; the thumbnail cannot be separated from the title beside it;
view count is the outcome, not click-through rate (which only a channel owner sees).

**What to do with that (a design brief, not a recipe):**
- Spend the effort on the **promise**: one subject the viewer can name with the sound off, one claim, one number.
- For measured comparisons use the **A | B verdict frame** (CPU | GPU, with | without KV cache, 32 | 48 | 64 GB) — the
  one template with repeated small-channel evidence, and what a rendered frame from our own scene produces for free.
- Make it from the **video's own computed scene** — the repo already renders it; a 3D render of the real subject is
  the one tag that leaned right in the small channels.
- Check legibility at **168 × 94 px** before shipping.
- **A/B inside YouTube.** Per vendor write-ups (1of10, Influencer Marketing Hub — *not* YouTube's own help page, so
  verify) Test & Compare serves up to three variants and picks the winner on **watch-time share, not click rate**.
  Test three different *promises*, not three palettes.

**The images are not in the repo.** The 2,834 thumbnails, the contact sheets and the raw tag list live in the session's
scratchpad and will not survive; `thumb_features.py --dir …` needs them. The merged tags are saved in
`data/analysis_systems/thumb_matched_sample_tags.csv`; the images can be re-fetched from `i.ytimg.com` (≈39 MB) or
moved into the git-ignored `data/` folder on request.

## Using the data from here

1. **Your own channel's within-channel multiples will beat all of this** after about 20 videos — log each video's
   multiple and thumbnail tags and re-run `systems_lane_analysis.py`.
2. **Pre-register** each pilot the way the reels do (`PREREG.md`): topic, title, thumbnail, pass line, before posting.
3. Re-pull in a quarter: the evergreen proxy is the weakest part and only time fixes it.

## Limits, once more

Search is mine and ranked by views, so topic *presence* is an existence proof, not a base rate. Subscriber counts
are today's. The small channels were found through my topic queries, so the topic mix is partly my queries even after
dropping the discovery videos. Regex topics mislabel titles at the margins — the CSVs let you check. Off-lane viral
videos sit in some channels' catalogues (a cave-exploration channel, a Hindi business-documentary channel); winsorising
limits their pull but does not remove it. External figures cited in the backlog draft (Gartner, DRAM prices) come from
search summaries and aggregators and are **unverified**. Nothing here has been checked against a primary source, and no
number in it should go on screen without that.
