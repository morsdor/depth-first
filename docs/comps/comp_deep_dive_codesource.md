# Deep Dive — @CodeSource

> *Moved to `docs/comps/` on 2026-09-10 — the closest long-form comp; kept because its topic-beats-formula finding and its AI-as-a-subject result outlive the YouTube plan. Paths it names from the
> retired YouTube line (`formula_library.md`, `scripts/fetch_outliers.py`,
> `projects/s001_ai_physical_cost`, `thumbnail-workflow`, `assets_library`) are on the
> `yt-longform-archive-DO_NOT_DELETE` branch.*

*Full-catalog analysis of the closest existing comp to the software-storytelling channel
(`projects/s001_ai_physical_cost`). Pulled 2026-08-15 via the YouTube Data API using
`scripts/fetch_outliers.py`'s plumbing (~5 quota units of 10,000/day). Read-only, public data.*

| | |
|:--|:--|
| **Channel** | CodeSource · `UCrMjUYBsnWIbkXfaaLgDQKA` |
| **Self-description** | "Technical video Documentaries" |
| **Subs / lifetime views** | 101,000 / 7,069,101 |
| **Catalog** | 70 videos — **64 long-form**, 6 Shorts |
| **Channel created** | 2016-08-31 (dormant); **first upload of the current format 2024-09-08** |
| **Cadence** | ~2.5 long-form/month, unbroken for 23 months |
| **Runtime** | 8–15 min (median ~11:30) |
| **Format** | Faceless narrated documentary, AI-assisted stills/3D, ~7 chapters |

**Why this channel matters to us:** it is a 23-month, 64-video controlled experiment in exactly
the thing s001 is trying — software history told as documentary, at our target runtime, by one
person. It is not in `data/comp_channels_software.yaml`. It should be. It is now added.

---

## 1. The headline: this is a topic-selection channel, not a packaging channel

CodeSource runs **one title formula, 44 times**: *"The Untold Story of X."* That makes it an
unusually clean natural experiment — the packaging variable is pinned, so everything left over is
topic.

Restricting to the 50 videos aged ≥180 days (removes the accumulation confound), the 39 mature
videos sharing that identical template land like this:

| min | p25 | median | p75 | max |
|--:|--:|--:|--:|--:|
| 9,596 | 38,822 | 60,265 | 176,395 | 550,522 |

**A 57× spread with the title template held constant** (coefficient of variation 1.10). The formula
explains none of it. Compare the two clearest twins:

- *The Untold Story of **Databases*** — 550,522
- *The Untold Story of **Artificial Intelligence*** — 18,579

Same channel, same formula, same era, same runtime band. **30× apart.** The thumbnails are even the
same design ("WHAT IS DATABASE, REALLY?" / "WHAT IS AI, REALLY?"). The only variable is the noun.

## 2. What the noun has to be

Classifying every mature long-form video by how much of the developer audience the subject
*personally implicates*:

| Tier | n | median views | ≥150k hits |
|:--|--:|--:|--:|
| **T1 — universal** (every dev touches it: Java, Git, Linux, Databases, VS Code, C++, Python, Go, C) | 24 | **117,149** | **10/24 (42%)** |
| **T2 — large but partial** (a big subset: Rust, Kotlin, Swift, Vim, Ubuntu, PHP, Assembly, Next.js…) | 26 | 51,992 | **0/26 (0%)** |

That `0/26` is the sharpest number in the dataset. **In 23 months, no non-universal subject has ever
cleared 150k on this channel** — not Rust (142,332, the ceiling), not Ubuntu, not Swift.

**T1 is necessary but not sufficient.** The T1 floor tells you the second condition:

| T1 flop | views | why it's T1 on paper but not in the gut |
|:--|--:|:--|
| The Untold Story of Stack Overflow | 9,596 | a *website*, not a tool you wield |
| The Untold Story of Artificial Intelligence | 18,579 | an abstraction, not an artifact |
| The Untold Story of NoSQL Databases | 35,222 | a *category*, not a thing |
| The Untold Story of Chromium | 38,822 | a codebase nobody personally touches |

Versus the winners — Java, Golang, C++, Linux, Python, Git, VS Code, Databases: things a developer
**types the name of every day and has an identity stake in.** The working rule:

> **The subject must be a proper noun the viewer has a personal relationship with.** Not a category,
> not an abstraction, not a website, not somebody else's codebase. If a dev wouldn't put it in their
> bio, it caps around 60k.

## 3. The thumbnail is doing the hook work — and it says something completely different from the title

This is the most transferable craft finding, and it is invisible from the title list alone. Every
title is *"The Untold Story of X."* **Not one thumbnail says that.**

| Video | Title (evergreen/SEO) | Thumbnail text (the actual hook) |
|:--|:--|:--|
| Databases (550k) | The Untold Story of Databases | **WHAT IS DATABASE, REALLY?** |
| Golang (457k) | The Untold Story of Golang | **WHY GO IS WINNING** |
| Java (447k) | The Untold Story of Java | **WRITE ONCE, SUE FOREVER** |
| C++ (402k) | The Untold Story of C++ | **HATED BY HUMANS. LOVED BY MACHINES** |
| Linux (380k) | Linux: The Untold Story | **THE KERNEL THAT CHANGED COMPUTING** |
| VS Code (254k) | The Untold Story of VS Code | **WHY VS CODE WON** |

**A two-channel packaging system.** The title is a stable, searchable, brandable container that
never varies. The thumbnail carries the curiosity, the conflict and the specific promise. Our
`formula_library.md` currently treats the *title* as the formula carrier — on this channel the
thumbnail is F2/F5/F1 and the title is a wrapper. Worth absorbing.

Shared visual grammar across the winners (verified at 120 px — all survive the squint):

- **A recurring red/blue 3D figure at a desk** — a de-facto mascot, present in Databases, Java, C++,
  Linux. Consistent enough to be channel identity, cheap enough to regenerate per video.
- **The subject's own mascot as the hero object** — the Go gopher (wearing a crown), the Java egg,
  Tux, the Python logo. Free instant recognition; the logo *is* the focal point.
- **Sticker callouts carrying the scandal**: "BETRAYED BY MICROSOFT", "$10 BILLION DOLLAR", "BANNED
  FROM LINUX KERNEL", "MICROSOFT CALLED IT A CANCER", "$ TRILLIONS RUN ON IT".
- **Conflict verbs**: winning, hated, betrayed, sue, banned, cancer. Never "history", never "story".

And the flops fail visibly at 120 px: WordPress is an ornate cluttered throne (no focal point), *What
Is AI, Really?* is muddy gold-on-black with no mascot and no conflict, DeepAgent is a product logo
and mascot that **reads as an advertisement**, Stack Overflow is a logo on fire with no human in frame.

## 4. Trajectory: plateaued, with one fresh signal

Median long-form views by half-year — the channel is **flat, not compounding**:

| 2024-H2 | 2025-H1 | 2025-H2 | 2026-H1 | 2026-H2* |
|--:|--:|--:|--:|--:|
| 70,151 | 60,090 | 66,773 | 57,522 | 82,197* |

<sub>*2026-H2 videos are 8–44 days old and still accumulating — not comparable.</sub>

> [!WARNING]
> **Do not compare `views_per_day` across ages on this channel.** Lifetime vpd rises from 110
> (2024-H2) to 3,215 (2026-H2) purely because view curves are front-loaded — an 8-day-old video's
> lifetime average is its launch spike, a 400-day-old video's is its long tail. That column is an
> age artifact here, not growth. This is a live trap in `docs/outlier_system.md`'s two-axis read
> whenever a comp's uploads are recent.

**Every breakout is in one 5-month window.** All nine videos above 180k published between
2025-04-09 and 2025-09-12 (plus VS Code, 2024-09-08). Of the 17 long-form videos published *after*
the Databases peak that are now mature, the best is **Visual Basic at 117,678** — the channel has
not repeated its 2025 summer since.

**The one counter-signal:** *The Untold Story of SSH* (2026-07-02) is at **171,952 views in 44 days**
and will cross 180k within days — the first video since Sep 2025 on a breakout trajectory. Note what
it is: SSH is squarely T1-universal *and* a proper noun you type daily. Consistent with §2.

**View concentration:** top 3 videos = 20.6% of all channel views; top 10 = 47.7%. Half the channel's
lifetime traffic comes from 10 videos. **Median video = 61% of subscriber count** — under 100%, so
this is a subscriber-and-suggested-fed channel, not a search/browse engine. The library is not
compounding into evergreen search traffic the way the "documentary" framing implies it should.

## 5. What's evolving in the 2026 slate

They are quietly abandoning the monoformula. 2026 titles: *How Fedora Broke Linux*, *Why Building
Android Was Hell*, *The Strange Rise of Arch Linux*, *How PostgreSQL Quietly Took Over*, *The Shell
That Runs the World*, *Why Perl Quietly Disappeared*, *The Infrastructure Trap: Why COBOL is Immortal*.

Mapped to our `formula_library.md`, on trailing-baseline lift (each video vs the median of the 8
long-form before it — this corrects for the era, which the lifetime median does not):

| New family | Best result | Trailing lift |
|:--|:--|--:|
| Named-mechanism noun (F9-ish) — *The Shell That Runs the World* | 133,217 | **2.96×** |
| Rise/Fall arc — *Visual Basic's Rise and Fall* / *The Strange Rise of Arch Linux* | 117,678 / 112,541 | **2.13× / 2.13×** |
| How X Took Over (F12/F2) — *How PostgreSQL Quietly Took Over* | 92,496 | **2.06×** |
| Untold Story of X (the legacy monoformula), 2026 rows | 82,197 (Kubernetes) | 0.38–1.69× |

**In 2026 the diversified hooks are outperforming the house formula on its own channel.** Four of the
five best trailing-lift videos of 2026 have abandoned "The Untold Story of." That is a channel
telling you its own template has fatigued — and it fatigued at roughly 40 uses.

## 6. Monetization — the strongest part of the channel

**63 of 64 long-form videos carry an ad read (98%);** 57 name an identifiable brand. Exactly one
video in 23 months has no sponsor at all — *The Story of HTMX* (2024-10-31). Unbroken streak since:
**58 videos.**

**They were sponsored from the first upload of the format.** Emergent bought *The Untold Story of
VS Code* on 2024-09-08 — day one, zero audience, zero track record. In dev-tool land the sponsor
market will transact at zero subscribers; "build the audience first, monetize later" is not the
constraint it is in other niches.

**25 distinct sponsors, 11 of them repeat (44%):**

| Sponsor | Placements | Span |
|:--|--:|:--|
| CodeRabbit | 11× | 2025-05-30 → 2026-07-08 |
| Convex | 9× | 2024-12-18 → 2026-01-06 |
| Abacus.ai | 7× | 2025-05-30 → 2025-09-24 |
| Emergent | 4× | 2024-09-08 → 2025-10-05 |
| Brilliant | 3× | 2025-03-26 → 2025-06-30 |
| JetBrains · Traycer · MongoDB · Supabase · PostHog | 2× each | — |
| Docker · Neon · Infisical · Descope · Depot · TryHackMe · Kinsta · Typesense · Boot.dev · TimescaleDB · DevStats · Skywork · TestSprite · Hostinger · FloppyData | 1× | — |

**Advertiser quality is climbing even though views aren't** — the key finding here:

| Year | Established (Docker, MongoDB, JetBrains, Supabase, Neon) | Mid-tier devtool | AI-tool / low-trust |
|:--|--:|--:|--:|
| 2024 | 25% | 0% | **75%** |
| 2025 | 42% | 23% | 32% |
| 2026 | 38% | **52%** | **10%** |

They began on "describe your app, it builds the code" AI advertisers and have largely replaced them
with infrastructure companies. **Docker sponsored the Docker documentary, MongoDB the NoSQL one, Neon
the Postgres one** — endorsements from the *subject* of the video. The sales story is now credibility,
not reach. Flat views with a rising advertiser tier usually means the rate card is moving even when
the audience isn't.

**Order-of-magnitude economics.** Sponsor rates are not public — this is public-CPM arithmetic over
their real view data, a range and not a figure:

| Line | Basis | Estimate |
|:--|:--|:--|
| Sponsorship | $15–30 CPM × 59,641 median × 37 videos/yr | **$33K–66K/yr** (~$900–1,800/video) |
| AdSense | $4–8 RPM × 3.34M long-form views/yr | **$13K–27K/yr** |

Sponsorship runs **~2.5× the ad revenue**. The plateau costs them far less than it would an
AdSense-primary channel: sponsors buy predictable median delivery, and a stable 60k is eminently
sellable — arguably more so than a volatile channel.

### Two things that did *not* go well

> [!WARNING]
> **The one time the advertiser picked the topic, it was their second-worst video ever.**
> *The Story of the Most Powerful AI Agent* (2025-06-02) is a DeepAgent/Abacus.ai piece — the
> thumbnail reads "WHY IS DEEPAGENT WINNING?" with the product mascot in frame. It landed
> **17,914 views: rank 2 of 64**, 0.16× trailing lift. The audience priced the paid subject
> instantly. **Sell the slot, never the subject.**

**Anchor accounts churn hard.** Abacus.ai ran 7 videos in 117 days and vanished. Convex ran 9 and
stopped Jan 2026. Emergent stopped Oct 2025. Only CodeRabbit has held past a year. The 98% coverage
is real but it is sustained by continuously re-filling the funnel, not by a stable book of business.
Current active roster (last 6 months): CodeRabbit, Supabase, Infisical, MongoDB, Neon, Docker,
Depot, TryHackMe, Hostinger, Skywork.

**Net read for our business case:** a faceless software-documentary channel at ~100k subs and a ~61k
median sustains continuous dev-tool sponsorship at roughly **$50–90K/yr all-in**. That is a solid
job, not a compounding asset — flat views × flat cadence = flat revenue. The compounding has to come
from the craft axis (the format lane: 3Blue1Brown, Branch Education, Welch Labs) that they don't have
and we do.

---

## 7. What this changes for our software channel

**Confirms:**

1. The format works at our exact spec — 10–15 min, faceless, narrated, AI-assisted visuals, one
   person, ~2.5/month. 101k subs and full sponsor coverage in 23 months from a standing start.
2. Longer is better *within* the band: the 12–20 min bucket medians 82,197 vs 48,213 for 8–12 min.
   s001's 10–13 min target sits in the weaker half. **Consider pushing s001 to 13–15.**
3. Sponsorship is the business model, not AdSense.

**Warns:**

4. ⚠️ **AI as a subject is this channel's worst-performing category, three for three.** *Artificial
   Intelligence* 18,579 · *Generative AI* 32,622 · *Most Powerful AI Agent* 17,914 — median 18,579
   against a channel median of 61,307. All three are ~0.12–0.75× trailing lift.
   **This is a real caution flag for s001 "The Physical Cost of AI" and it is not in
   `projects/s001_ai_physical_cost/packaging.md`.**
   The honest reading is not "don't make it" — it is that the failure mode is specific and avoidable:
   all three CodeSource AI videos are *abstract-category* videos ("what is AI, really") with no
   artifact in frame. s001's precedent (Computerphile's *Why AI Tokens Are So Expensive*, 14.2× lift)
   is the opposite — a concrete mechanism with a number. **s001's thumbnail pivot to machine-scale
   (the 835 MW reactor) is exactly the correction this data says is required.** Treat CodeSource's
   AI record as evidence *for* the reactor direction and *against* any drift back to "the story of AI."
5. Its own T1/T2 law says a *category* ("AI") caps low while a *proper noun you touch* breaks out.
   s001 wins by being about a **datacenter, a reactor and a chip** — nameable objects — not "AI."
6. The monoformula fatigues around 40 uses. Don't lock a template for the life of a channel.

**Adopt:**

7. **The two-channel packaging split** — stable searchable title, thumbnail carries the conflict
   hook. Our `thumbnail-workflow` skill already tests three thumbnails against one title; this says
   the thumbnail should be allowed to make a *different promise* than the title, not a restatement.
8. **A recurring figure as channel identity.** The red/blue desk figure appears across the top
   winners and costs nothing to regenerate. Our `assets_library` + `brand_guide.md` Motion Identity
   could carry an equivalent — and the software channel still needs its own brand guide.
9. **Sticker callouts carrying a documented scandal** ("BANNED FROM LINUX KERNEL"). One focal object
   + one number/claim sticker is the pattern that survives 120 px — the same discipline as 001's
   `2.5 cm`.

**The uncomfortable one:**

10. This channel plateaued at ~60k/video with a 61%-of-subs view rate. It proves the format is
    *viable and sponsorable*; it does not prove it *compounds*. Their ceiling came from ~10 universal
    nouns, and there is a finite supply of those. A software-storytelling channel that wants to grow
    past this needs an axis CodeSource doesn't have — which is precisely the cinematic-visual bar in
    our format lane (3Blue1Brown, Branch Education, Welch Labs), not more nouns.

---

### Reproducing this

```bash
# channel + full catalog dump (reuses scripts/fetch_outliers.py; ~5 quota units)
.venv/bin/python scripts/fetch_outliers.py \
    --channels data/comp_channels_software.yaml --csv data/outliers_software.csv --only CodeSource
```

CodeSource is now in `data/comp_channels_software.yaml`. The scan above has **not** been re-run —
adding a 17th channel would shift the "42 outliers / 16 comps" evidence base that
`projects/s001_ai_physical_cost/packaging.md` cites as locked. Re-run it when you're ready to
re-baseline that document.
