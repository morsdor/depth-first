# Growth strategy — running `@thedepthfirst` like a business

*Written 2026-09-10 at 145 followers and eight posts. The brief was "reason like the CEO of a
million-dollar Instagram page in the making". A CEO's job here is not to guess what goes viral; it
is to know what the engine is, what it costs to pull the lever, which numbers are real, and which
bets to make with limited time. Every claim below cites the reel that produced it. Where the
evidence is one data point, it says so.*

---

## 1. What this business is

**A studio that manufactures true, computed, arguable pictures of how systems work, at ₹0 cash per
unit and about one human-day per unit, and distributes them where the ranking system rewards
"send this to someone".**

It is not yet a media business with revenue. It is a machine plus an audience-finding process, and
the asset being built is not followers — it is (a) a library of parts that makes each reel cheaper,
(b) a logged record of what travels and why, and (c) a reputation for never being wrong. All three
compound; follower count is the lagging output.

## 2. The moat

*"Every animation here is the real algorithm, actually run — not drawn."* True of these reels and
false of essentially every competitor in the lane. Nobody copies it without rebuilding their
pipeline — the seven fact-checking points in `reel_pipeline.md` §4 are months of accumulated
discipline, and the `emit_ts.py` assert chain means the numbers on screen cannot drift. Protect it:
no image models, no recalled figures, no "tightened" captions. Accuracy is also the only thing that
survives a rival account with a bigger budget.

## 3. The market, from the comps in the repo

| Account | Followers | What it proves |
|:--|--:|:--|
| `equation.verse` | ~20k | one reel (Berlin pathfinding) is a **74× outlier** against its own median; **51% send ratio** on the utility post; the Substack it funnels to has zero posts — *build the destination before pointing traffic at it* |
| `@thebrainmaze` | ~1M | the "body as a system" lane at scale, on Instagram and TikTok; "making science fun for everyone" |
| Fern, Johnny Harris | long-form north stars | 3D reenactment and map-driven documentary; the *place* as the object |
| `@thedepthfirst` | 145 | one reel at 80k+ (r005), the argument engine observed once |

The lane is crowded with approximately-right content and nearly empty of computed, verified,
argument-settling content. That is the position.

## 4. Unit economics

| | Value | Source |
|:--|:--|:--|
| Cash cost per reel | ₹0 | rule; no generation |
| Time cost per reel | ~1 human-day (three gates + review) | the skill's time budget; eight reels in nine days |
| Time to outcome | ~24 hours | `insta_strategy.md` §2.0 — r001 gained 2 views in four days |
| Hit rate so far | 1 in 8 | r005 |
| Floor | ~190–420 views | r002, r003, r007, r008 |
| Follow conversion on the hit | 0.216% of day-1 viewers; ~0.15% per view by the 80k reading | r005 |
| Followers from the hit | ~120 of 145 | user report |

**What that implies.** At the hit's conversion rate, follower milestones cost roughly:

| Followers | Viewers needed at ~0.2% | Hits needed at ~80k viewers each |
|--:|--:|--:|
| 1,000 | ~500k | ~6 |
| 10,000 | ~5M | ~60 |
| 100,000 | ~50M | ~600 |

Read that table as a statement about **conversion**, not about reach. The reach engine is real and
lottery-shaped; the conversion rate is the multiplier on every ticket, it has never been worked on
deliberately, and doubling it halves every row. Two levers, and the second is cheaper.

## 5. What the engine is — ranked by evidence

| Rank | Hypothesis | Evidence | n |
|--:|:--|:--|--:|
| 1 | **A reel travels when it settles an argument the viewer is already having**, with evidence they have personally witnessed, resolving to one repeatable number | r005 (the flat-earth exhibit) 80k vs r006 (same pattern minus the argument) 1.8k; r007 and r008 both flagged "no argument running" at Gate 0 and landed on the floor | 1 vs 3 |
| 2 | **A legible, nameable object in the first half-second buys reach** | r004 (photograph) 1,617 viewers vs r003 (QR matrix) 324, lowest skip rate on the account | 1 vs 1 |
| 3 | **Spectacle + utility together** (the `equation.verse` finding: utility without spectacle did 6% of its sibling) | comp data only | — |
| — | *Not engines:* motion density, length, section, craft, rigor, posting time | r006 46% density/1.8k vs r005 38%/80k; r008 99%/190; the floor spans 28–54 s | — |

**The refined discriminating question, one sentence, asked before building:** *who does the viewer
send this to, and what are they proving?* No answer → liked and forgotten (`CLAUDE.md`).

**The obvious trap** is chasing conspiracy arenas because flat earth was the first one found.
Arguments people already have about their own lives are everywhere and cheaper: the seatback map,
the "sped up / it's magnets" comment under every pendulum video, the queue you switched out of, the
shuffle that repeats an artist, the blue dot that is 10 km off, the green tariff, the noise
cancelling. The engine is *a live dispute*, not *a conspiracy*.

## 6. The portfolio

Reels are lottery tickets with a power-law payoff, so the strategy is to hold **as many qualified
tickets as the human gates can sustain**, with the floor protected by the nine non-negotiables.

| Share | Bet | Qualification |
|--:|:--|:--|
| 70% | **Argument reels in the proven lane** — maps, physical systems, things people touch daily | passes all three argument conditions + a nameable object at 0.5 s + licence settled |
| 20% | **Adjacent objects on the same engine** — the body, satellites, the grid, real footage with computed overlay | same test; one new tool at most per reel |
| 10% | **Format experiments** — a hook-only re-cut, a 15 s version, a series card, sound | pre-registered in §8, otherwise not built |

**Cadence.** Eight in nine days is not sustainable beside a full-time job and it is not necessary:
the outcome of each reel is known in a day, so a weekly cycle loses nothing. Target **three a week,
all argument-qualified**, and spend the recovered time on the packs in `module_packs.md` — which is
what makes three a week cost two days instead of three.

## 7. The follower-conversion programme (the cheap lever)

1. **The end card, every reel** (rule 9): a line naming what the next reel does, over the finished
   visual, held 3 s, with an ask performable on the phone in hand. r004 showed a single reel cannot
   measure this (0.13 expected follows from 161 last-frame viewers); the programme measures it across
   ten.
2. **The profile.** The Name field still reads `Depth First · how code works` and the bio says
   "algorithms". The promise widened to *how systems work* on 2026-09-10; the profile is what a viewer
   reads at the follow decision. Update both, keep the moat line ("the real algorithm, actually run").
3. **The grid.** Cover frames are objects, never charts or code — a wall of maps, weights, photos.
   A viewer who lands from a hit decides on the grid in two seconds.
4. **A series identity.** A recurring first-frame shape for the argument reels ("your uncle is wrong
   about…" is the energy, not the wording) so a second hit is recognisably from the same account.
5. **Check the followers you already have.** Insights per reel shows follower vs non-follower
   share. If r005's 120 did not watch r007 or r008, the followers an argument buys are not the
   channel's audience, and the series identity matters more than reach.

## 8. The experiment register — pre-registered, with kill criteria

*The r006 test is the model: hypothesis written before the build, prediction stated, result
accepted. Each row is read at 24 h and 7 d, then closed. Move this table to its own file once it
passes ten rows.*

| # | Question | Design | Prediction if true | Decision rule |
|--:|:--|:--|:--|:--|
| E1 | Is the argument engine real? | five reels that pass all three conditions, nothing else changed | ≥ 2 of 5 clear 10k views | < 1 of 5 → the engine is elsewhere; run four `equation.verse`-style spectacle+utility reels (E3) before anything else |
| E2 | Does the physical widening buy reach, or only Gate 0 passes? | inside E1, at least two physical, at least two software | no difference attributable to physical vs software | if physical loses 2–0 with equal argument scores, treat "physical" as topic supply only |
| E3 | Does spectacle+utility travel without an argument? | one Berlin-style flood on a real Indian city vs one on a Tier-1 city (the comp's own 55× natural experiment) | Tier-1 city ≥ 5× | informs the city list for §2 ids |
| E4 | How much is the hook worth? | re-post r005's body with a different first 3 s as a Trial Reel when eligible | within 3× of the original | if ≥ 3× apart, hooks get their own Gate |
| E5 | Does the end card convert? | ten consecutive reels with the rule-9 card vs the four without | follows per last-frame viewer ≥ 2× | fold the winner into the pack |
| E6 | Is Shorts really the strong leg? | post all eight existing reels to YouTube Shorts this week, same day, same caption | any Short ≥ its Instagram views | if yes, every reel ships twice from now on; if no, Instagram-only and stop guessing |
| E7 | Object class on the same engine | one body reel, one satellite reel, one grid reel, each argument-qualified | none falls to the floor | decides where the 20% goes next quarter |
| E8 | Length | one 30 s and one 45 s cut of the same reel via Trial Reels | equal | kill the "60 s buys nine beats" idea if the 45 s loses |
| E9 | Real footage + computed overlay | one reel that opens on the user's own footage of the object | above the floor | a new lane if it clears 5k |
| E10 | Sound | the same reel with and without a CC0 track, via Trial Reels | equal | close the question |

**Trial Reels** — Instagram's own A/B instrument: a reel shown only to non-followers for up to 72 h,
metrics after ~24 h, auto-shared to followers if it clears a bar. The official post names no
follower threshold; several third-party guides say 1,000 followers. Check the app; it becomes the
tool for E4, E8 and E10 the day it is available.

## 9. The metrics log — `data/reels_log.csv`

`insta_strategy.md` §7 promised `data/social_log.csv` and it was never created; the captions log
holds prose. One CSV, one row per reel, appended by hand at 24 h and 7 d:

```
reel, id, section, posted_at, length_s, first_frame_object, hook_line,
arg_witnessed, arg_dispute, arg_one_number, object_nameable,   # the four Gate 0 booleans, as recorded BEFORE posting
event_density, longest_dead_s,
v24_views, v24_viewers, v24_avg_watch_s, v24_skip_pct, v24_likes, v24_shares, v24_saves, v24_follows, v24_reels_pct, v24_explore_pct, v24_follower_pct,
v7_views, v7_viewers, v7_likes, v7_shares, v7_saves, v7_follows,
shorts_views_7d, experiment_id, notes
```

**Reading protocol, from the ledger's own retractions:** never conclude from under 24 h (saves at
1 h, shares at 4 h and skip rate at 7 h were all read wrong on r005); compare rates on one stated
base (unique viewers); like-rate differences under ~30 taps are noise; a single reel is a hypothesis.

## 10. What "a million-dollar page" actually means, and when

Instagram pays little directly, and this audience will be India-heavy and student-heavy — the
lowest-monetising segment on the platform (`insta_strategy.md` §4.3). The paths that exist for an
account like this, in the order they open:

1. **Sponsorship** from education and tools brands — opens somewhere past ~50–100k engaged
   followers; the accuracy moat is the pitch. Note it changes two licences (Google Earth Studio,
   CC BY-SA meshes) the day it happens.
2. **YouTube** — Shorts feeding long-form AdSense on the same platform. **Note this path narrowed
   on 2026-09-10:** the Engineering Atlas is dead and Depth First long-form is parked on the
   `yt-longform-archive-DO_NOT_DELETE` branch, so there is no destination to funnel to
   today. `I42` (the reactor behind the chat box) is still the natural bridge if long-form is
   ever revived — and `docs/comps/comp_deep_dive_equationverse.md` §5 is the warning about
   pointing traffic at a destination that does not exist yet.
3. **Products and licensing** — the animations themselves are licensable to educators and
   publishers; the pipeline that makes verified computed explainers is a B2B product in its own
   right, and the only path here that scales without an audience.

None of these matter at 145 followers. **The only KPIs that matter this quarter are the qualified
hit rate and the follow conversion**, logged in §9. Everything else is derived.

## 11. Risks

| Risk | Mitigation |
|:--|:--|
| Chasing the conspiracy arena because it was the first argument found | the discriminating question is "who do they send it to", and most answers are their own family, not a faction |
| Day-one finality: no long tail, every reel a fresh lottery | cadence; and the packs so a miss costs hours, not a day |
| Burnout at a reel a day beside a job | three a week, weekly review, the scaffold |
| Tool sprawl — three.js, Blender, Cesium, anatomy are each weeks | one new tool per reel, only when a gated id needs it (`visual_toolbox.md` §3 boundary rule) |
| Followers bought by an argument who do not want the next reel | §7.5 measures it before it is optimised for |
| Licence exposure once sponsored | every Gate 0 records the licence; the two flagged tools are re-decided at the first deal |
| Over-reading n = 1 (this repo's documented habit — five rebuilds of I51) | the register in §8 with predictions written first |

## 12. The next 90 days

**Days 1–14 (to 24 Sep) — decide, clean, scaffold, and ship three.**
Answer the decisions in §13 and `repo_audit.md` §6. Fix the five cheap defects (r007 collision, the
mp4 pattern, the stale tables, the profile text, the reels `requirements.txt`) — **all six were
done on 2026-09-10, see `repo_audit.md` §4**; what remains from that list is pushing the archive
branch and backing up the charged plates. Build the scaffold and
the `camera` + `geo` packs. Post all eight existing reels to Shorts (E6). Ship three argument-
qualified reels (start of E1) and open `data/reels_log.csv`.

**Days 15–42 (to 22 Oct) — three a week, all logged.**
Complete E1 and E2. Extract `layers` and `sim`. One technical spike, not a reel: `@remotion/three`
with a NASA-textured globe, to price the satellite lane. Read the followers' behaviour (§7.5).

**Days 43–70 (to 19 Nov) — object classes.**
E7: one body reel (Z-Anatomy → glTF or Blender layer), one satellite reel, one grid reel. E5 reads
at ten reels. First Trial Reel experiments if eligible.

**Days 71–90 (to 9 Dec) — review and reallocate.**
Read the register. If E1 held, the 70/20/10 stands and the next quarter buys Blender fluency for
the body lane. If E1 failed, the spectacle+utility lane (E3) becomes the 70%. Decide whether `I42`
goes to Shorts as the s001 warm-up — noting that reviving s001 now means restoring it from the
archive branch, which is a deliberate decision rather than a default.

**Kill / continue gates:** day 30 — at least one of the first six qualified reels above 10k, or
switch lanes; day 60 — follow conversion measured across ten end cards; day 90 — a written
one-page verdict per experiment, and a new register.

## 13. Decisions only you can make

1. **Cadence you can sustain** for twelve weeks with a job: three a week is the assumption.
2. **Shorts, yes or no** — the eight-reel test costs an hour.
3. **The profile text** — approve the widened Name and bio.
4. **The r007 numbering fix** and the `.gitignore` pattern — one commit, if you want them.
5. **The archive decision** for the two frozen eras (`repo_audit.md` §6).
6. **Whether to spend on any key this quarter** (MapTiler, Google 3D Tiles) or stay at ₹0 and
   use Google Earth Studio under its attribution terms.
7. **Whether the body lane gets Blender** or waits for a gated id.
