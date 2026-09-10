# Instagram Strategy: short-form as the discovery layer

> ## ⚠ Status banner — added 2026-09-10. Read before trusting anything below.
>
> **This document's central premise has been overtaken by events, and its evidence has not.**
>
> It was written 2026-09-02 arguing for short-form as a *discovery layer feeding YouTube*. On
> 2026-09-10 the YouTube line was retired: The Engineering Atlas is dead and Depth First long-form
> is parked, both preserved on the branch `yt-longform-archive-DO_NOT_DELETE`.
> **Instagram is now the main line, not a funnel to anything.** Every "this feeds Depth First
> long-form" argument here — §1's priority order, §4.2's "the Shorts leg is the strong argument",
> §8's "s001 still ships" — is superseded. So is the §3 plan to reuse `MapRoute`/`Diagram`/
> `Counter`: no reel ever imported them and they are now archived.
>
> **What survives, and is still the best analysis in the repo:** §2's `equation.verse` teardown and
> the three findings (hit distribution, spectacle × utility, computed-not-generated), §2.0's
> first-party 24-hour finality measurement, §4.1's honest funnel arithmetic, §4.3's warning that
> this audience is the wrong *buyer*, §6's pillars, and §9's metrics. §5's "first-party demand data
> is the real asset" is more true now, not less.
>
> **Paths named here that no longer exist** — `channel_strategy.md`, `strategy_review.md`,
> `formula_library.md`, `scripts/fetch_outliers.py`, `scripts/tag_outliers.py`, `data/outliers.csv`,
> `visual-accuracy-gate`, `projects/s001_ai_physical_cost` — are on the archive branch, not lost.
>
> **The live successors:** [`docs/depth_first/growth_strategy.md`](docs/depth_first/growth_strategy.md)
> (what to do now) and [`docs/depth_first/software_thesis.md`](docs/depth_first/software_thesis.md)
> (where it is going). This file is kept for its evidence and its reasoning, not its plan.

*Written 2026-09-02, after the `equation.verse` teardown. This is a **third** strategic move for
this repo, and the previous two are documented: `channel_strategy.md` *(archived)*
(The Engineering Atlas, historical engineering) and
[`brand_guide_software.md`](brand_guide_software.md) (Depth First, software documentaries). This
document does **not** replace either. It proposes a discovery layer that feeds Depth First, and it
is deliberately explicit about what that layer can and cannot do — because the honest answer to
"will Instagram followers become YouTube subscribers?" is mostly no, and the plan has to be built
on the parts that do transfer.*

---

## 1. The decision, in one paragraph

Build a vertical short-form account in the `equation.verse` mould — procedurally computed CS/systems
visualizations, dark ground, real data, no AI imagery — and publish **every asset twice**: once to
Instagram Reels, once to YouTube Shorts. The account is **not** a revenue channel and **not** a
separate brand. It is three things in priority order: **(1)** a first-party demand-testing instrument
that upgrades the Packaging gate from inference to measurement, **(2)** a Shorts production line that
feeds Depth First on the platform where conversion actually works, **(3)** an audience and portfolio.
Follower count is the *least* important of the three, despite being the reason the idea came up.

---

## 2. The evidence — what `equation.verse` actually proves

Five posts observed 2026-09-02 (engagement figures read directly from the app; follower figures are
user-reported, not verified):

| Post | Likes | Comments | Shares | Sends | Sends ÷ likes |
|:--|--:|--:|--:|--:|--:|
| "Visualizing all pathfinding algorithms in 30 seconds" — Greedy Best-First on a real Berlin street graph | 131,000 | 285 | 1,408 | 15,700 | 12% |
| "Seven OSI Layers" — encapsulation animated header-by-header (15 Aug) | 10,800 | 47 | 453 | 5,535 | **51%** |
| "OSI vs TCP/IP" — four-layer mapping | 639 | 5 | 36 | 292 | 46% |
| "Rat in a Maze" — backtracking grid + live code panel (20 Aug) | — | — | — | — | — |

### 2.0 First-party confirmation of Finding 1 (added 2026-09-07)

Four reels in, the hit distribution and the 24-hour window are both visible on our own account, so
Finding 1 below is no longer an inference from someone else's numbers.

| Reel | Views | Read earlier | Gained since |
|:--|--:|:--|--:|
| `r001` | 1,658 | 1,656 at 3 days | **+2** |
| `r002` | 322 | — | — |
| `r003` | 422 | 390 at ~18 h | +32 |
| `r004` | 1,809 | 1,806 at ~1 day | **+3** |

**A reel is finished in about 24 hours.** r001 gained two views in four days; r004 gained three. It
is not decaying, it is over — there is no long tail to work, and nothing done after the first day
changes a post's outcome.

**And the spread is already 5.6x** — two reels at ~1,733 and two at ~372, same account, same format,
same month, which is the `equation.verse` pattern below reproducing in miniature. Craft moved the
floor (r004 has the lowest skip rate of the four) but did not decide the ceiling.

Both facts point at the same lever, and it is the one this section already names: **cadence.** At
roughly a day of work per reel we hold about four tickets a month. The cheapest available win is not
a better reel, it is more of them — which makes the per-reel build cost a strategic number, not an
engineering detail.

**Growth (user-reported):** ~20,000 followers in ~3 months, currently ~300/day.
That is ~222/day average — and rising, which means it is compounding rather than decaying.

### 2.1 The three findings that matter

**Finding 1 — a 200× engagement spread on one account inside a few weeks.**
131,000 and 639 are the same creator, same format, same month. This is not a quality gradient; it is
a hit distribution. **Cadence is therefore the strategy, not craft-per-post.** You are not buying
followers at a steady rate — you are buying lottery tickets on breakouts, and posting frequency is
how many tickets you hold. A plan that produces two exquisite posts a month will lose to one that
produces sixteen good ones.

> This is the single biggest conflict with Depth First's stated thesis — *"few videos, long, one
> subject exhausted properly"* (`brand_guide_software.md` §0). That thesis is correct for long-form
> and wrong for the feed. The two lines must be allowed to run on different clocks.

**Finding 2 — two distinct mechanics, and the winners have both.**

- **Spectacle** buys reach. Berlin won on a beautiful real-city map with a real algorithm racing
  across it. Low send ratio (12%) — people watched, liked, moved on.
- **Utility** buys distribution. The OSI post's send ratio is **51%** — half of everyone who liked it
  forwarded it to someone. That is the study-group share, and sends are what the ranking system feeds on.
- **Utility without spectacle dies.** "OSI vs TCP/IP" is the same educational payload as the OSI post
  with the visual drama removed, and it did 6% of its numbers.

**Design rule: every post needs a spectacle surface and a utility payload.** A diagram that teaches
but does not astonish will not travel. A spectacle that astonishes but teaches nothing will not be sent.

**Finding 3 — the content is computed, not generated.** Real OpenStreetMap data. Real node counts
(`Nodes: 293`, `Time: 2.0 ms`). Headers that actually accumulate down the stack. Nothing in these
posts came out of an image model, which is exactly why they read as credible to an engineering audience.

---

## 3. Why this fits this repo unusually well

The capability already exists and is already lint-enforced. This is not a new pipeline; it is a new
output size on an existing one.

| What `equation.verse` does | What this repo already has |
|:--|:--|
| Pathfinding over a real city graph | `remotion/src/families/MapRoute.tsx` |
| OSI stack, encapsulation diagram | `remotion/src/families/Diagram.tsx` |
| `Nodes: 293 · Time: 2.0 ms` stat badges | `remotion/src/families/Counter.tsx` |
| Dark ground, one accent per topic | `remotion/src/brand/tokens.ts` — `BASE.ink #0B0E14`, `DOMAIN_ACCENT` |
| Consistent palette across hundreds of posts | `npm run brand:check` fails the build on any off-palette colour |

**The cost argument is already proven in this repo.** s001 boarded 77 scenes of which **35 are
`assembly`** — every chart, counter, map and schematic built from code, at **₹0** instead of ~₹260,
"and the numbers are correct because no model draws them"
(`projects/s001_ai_physical_cost/README.md`). That is 100% of the `equation.verse` format. Marginal
cost per post after a family exists is render time.

**And it dissolves the biggest risk in `channel_strategy.md` §4a.** The "inauthentic content"
demonetization profile is *AI narration over AI images, batch-produced from a template*. Procedurally
computed visualizations over real data are the opposite of that profile. High volume stops being
dangerous the moment nothing is model-generated.

---

## 4. Three honest corrections to the optimistic case

The case for doing this is real. These are the parts of it that do not survive scrutiny, recorded here
so they are not rediscovered painfully in six months.

### 4.1 Instagram followers will not shortcut the YouTube subscriber problem

Cross-platform funnels are leaky. The working rule of thumb is **1–3% of followers convert to YouTube
subscribers**, and only with active, repeated funnelling — link in bio, explicit CTAs, end frames.

> ⚠ That 1–3% is an industry rule of thumb, not a measured figure for this niche. Treat it as an
> order of magnitude, and replace it with our own number once we have one.

At 20,000 IG followers that is **200–600 YouTube subscribers**. `strategy_review.md` puts a well-run
new channel at **500–800 subs at month 6** organically. So a year of successful Instagram work buys
roughly what six months of simply publishing would have. **Followers are not the transferable asset.**

### 4.2 The Shorts leg is the strong argument, not the Instagram leg

Same render, same day, zero marginal cost, posted to YouTube Shorts. Conversion from Shorts to
long-form **on the same platform** is materially better than anything cross-platform, and it teaches
YouTube's ranking system what the channel is about before the first long-form video ships.
`channel_strategy.md` §4 already notes that channels running both reach 1,000 subs **30–50% faster**.

**Architecture: one production line, two outputs. The Shorts leg is what feeds Depth First. The
Instagram leg is where the format is tested and where the audience and portfolio live.**

### 4.3 This inverts the Tier-1 audience engineering — accept it deliberately

`channel_strategy.md` §4b exists specifically to engineer a Tier-1 audience, because India-heavy
skews RPM to $0.5–1.5. A "learn CSE" short-form account will be India-heavy and student-heavy: the
lowest-monetizing, lowest-purchasing-power segment available, on a platform that pays creators far
less than YouTube to begin with.

**This account will not make money from views. Plan it as top-of-funnel and portfolio, and do not put
a revenue line against it.** That is an acceptable trade for §5 — but only if it is a decision rather
than a surprise.

---

## 5. The actual highest-value asset: first-party demand data

Today, topic selection runs on **inference about other people's audiences**: `scripts/fetch_outliers.py`
scans competitors, `scripts/tag_outliers.py` labels them against `formula_library.md` F1–F12, and the
Packaging gate reasons from `data/outliers.csv`. Every caveat in `formula_library.md` — base rate not
lift, runtime transfer unproven, lift ≠ demand — exists because we are reading someone else's numbers.

Four posts a week is **~17 topic tests a month on our own audience**. Whatever spikes is a validated
long-form topic, measured rather than inferred, with our framing and our visual language already
attached to it.

**This is a better reason to build the account than the follower count is.** It should be instrumented
from post one: every post logged with its concept, its formula tag, its pillar, and its 7-day
engagement, in the same spirit as `assets/thumbnails_log.md`.

---

## 6. Content pillars — recruiting the *right* audience

This is the decision that is free now and expensive later.

A 20,000-follower audience built on *Rat in a Maze* and two-pointer tricks is a **placement-prep
audience**. Depth First is technical documentaries — *"the thing you depend on has a story, and it is
more fragile and more human than you think."* Someone grinding DSA for interviews is not reliably the
person who watches twelve minutes on the physical cost of AI. **The funnel leaks on platform transfer
and again on topic transfer.**

Same format, same spectacle mechanic, different subject matter:

| # | Pillar | The spectacle | The utility | Feeds |
|:--|:--|:--|:--|:--|
| P1 | **Real systems traced** | A request's actual path — DNS, CDN edge, TLS, the packet crossing an ocean cable | You now know what happens when you hit send | Depth First core |
| P2 | **Algorithms on real data** | Pathfinding over real OSM cities; routing over the real AS graph; consensus on a real cluster | The algorithm, its complexity, why it picks that path | Broadest reach — the Berlin mechanic |
| P3 | **Scale made physical** | 835 MW. A rack. A fab. A nation's grid | What an AI query actually costs in the world | **Directly s001** |
| P4 | **Failure autopsies** | The 30-second version of an outage — what broke, in what order | The mechanism, and the design lesson | Pilot #2 (Kevin Fang lane) |

**Explicitly excluded: interview-prep DSA**, however well it performs. It recruits the wrong audience,
and the wrong audience is worse than a smaller one because it distorts every subsequent demand signal
in §5.

**Accuracy is the differentiator.** This lane is full of approximately-right content. A brand that is
never wrong — complexity bounds correct, protocol details correct, numbers sourced — is a real
position, and it is the discipline this repo already has in `visual-accuracy-gate`. A short-form
equivalent of that gate should exist before volume starts.

---

## 7. Production model

- **Identity:** Depth First. `@thedepthfirst` where available. No third brand — the wordmark, palette
  and token system already exist and are software-scoped (`brand_guide_software.md` §0–§5).
- **Format:** 1080×1920 @ 30fps, 15–45s, hook in frame one, original audio.
- **Build:** a `vertical/` composition family set in `remotion/src/`, reusing `MapRoute`, `Diagram`
  and `Counter`. Same `brand:check` enforcement — an off-palette post should fail lint exactly the way
  an off-palette scene does.
- **Cadence target:** 4/week (~17/month). Front-load the family work; batch-produce afterwards.
- **Every asset publishes twice** — Reels and Shorts — on the same day.
- **Log everything** to a `data/social_log.csv` in the spirit of `assets/thumbnails_log.md`, so §5
  compounds instead of evaporating.

---

## 8. What this does NOT change

**s001 still ships.** `projects/s001_ai_physical_cost` is one charged gate from production: script
locked (1,748 words / 12.1 min), thumbnail shipped, 77 scenes boarded and scaffolded, validator and
lint green. The remaining gate is the 42-plate batch at ~₹310–491.

Pillar P3 above is *the same subject matter as s001*. Short-form posts on the physical cost of AI are
the ideal warm-up for it: they test the concept's pull, build the audience that wants it, and cost
almost nothing. **Shorts first, then the video, is a better order than shelving the video.**

---

## 9. Metrics that matter

| Metric | Why | Vanity alternative to ignore |
|:--|:--|:--|
| **Sends per post** | The distribution engine; 51% send ratio is what a great post looks like | Likes |
| **Follower growth on breakout weeks** | Confirms the hit distribution is working | Daily average |
| **Concept spike → long-form validation** | The §5 payoff, the whole point | Total followers |
| **Shorts → Depth First subscribers** | The only conversion number that funds anything | IG follower count |

---

## 10. Open questions

1. **Cadence sustainability.** 4/week alongside a full-time job and s001. Is the family-first,
   batch-later model enough to make that real? Unproven until tried.
2. **Handle.** `@thedepthfirst` availability on Instagram is unverified.
3. **Whether the spectacle survives our palette.** `equation.verse` uses saturated violet on black.
   Depth First is `#0B0E14` ground with a single accent and a hard one-amber-element-per-frame rule.
   That restraint is right for a documentary and may be too quiet for a feed. **This is the question
   the pilot post exists to answer.**

**Next action: build one post end to end** — the P2 pathfinding-on-a-real-city concept, since
`MapRoute.tsx` already exists — and judge it at 1080×1920 in the Depth First palette. If it lands, the
thesis is proven and §7 follows. If it does not, no further planning rescues it.
