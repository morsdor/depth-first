# Deep Dive — @equation.verse (Instagram)

> *Moved to `docs/comps/` on 2026-09-10 — the short-form comp that this whole line was modelled on — its findings are cited by `CLAUDE.md` and every strategy doc. Paths it names from the
> retired YouTube line (`formula_library.md`, `scripts/fetch_outliers.py`,
> `projects/s001_ai_physical_cost`, `thumbnail-workflow`, `assets_library`) are on the
> `yt-longform-archive-DO_NOT_DELETE` branch.*

*Short-form comp for the software channel (**Depth First**). Pulled 2026-08-27 from Instagram's
public web profile endpoint (read-only, public data, no login). Reel files probed locally with
`ffprobe` for true duration/resolution; filmstrips extracted for craft assessment.*

| | |
|:--|:--|
| **Handle** | [@equation.verse](https://www.instagram.com/equation.verse/) · numeric id `22015110129` |
| **Display name** | Equation Verse |
| **Operator** | **Nilesh Jha** (named on the linked Substack) |
| **Category** | Education · professional account · **not** verified |
| **Followers / following** | **20,072** / **0** |
| **Posts** | 64 (11 reels + 1 carousel sampled — see *Sampling limits*) |
| **Bio** | `AI • Software Architecture • Maths` / `Recursion -> @equation.verse` / `📨Email for Paid Collabs` / `👇Join our Newsletter for Weekly Editorials` |
| **Link in bio** | `equationverse.substack.com` → *The Missing Layer*, **0 posts published** |
| **Format** | 9:16 vertical reels, 720×1280 @ 30 fps, **10–15 s modal**, up to 60 s |
| **Pinned** | 3 posts (the A* hit, the OSI hit, and an Independence Day post) |

**Why this account matters to us:** it is the closest *craft* comp we have found for Depth First —
same subject matter (algorithms, networking, systems), same "explain the machine visually" thesis,
and it has found the format that makes it work. It is a **short-form** comp, so it does not speak to
retention or RPM, but it speaks very directly to *how the pictures get made*.

---

## 1. The headline: the animation is computed, not authored

Every high-performing reel on this account is **the rendered output of a real program**, not a
hand-keyframed illustration of one. That is the single most important finding here, and it is
visible in the frames:

- **Pathfinding reel** — an actual OpenStreetMap road graph with Dijkstra / Greedy Best-First /
  A* / Bidirectional Dijkstra / Bidirectional A* genuinely run across it. The on-screen readout
  shows real instrumentation: `Nodes: 27,026 · Time: 361.6 ms`, and the time complexity
  `TC: O((V + E) log V)`. The "animation" is the frontier expanding. Nobody drew that.
- **Sorting reel** — an instrumented sort. Live `COMPARES` / `SWAPS` counters, an `ACTIVE` badge
  naming the running function, and — the strongest single craft element on the account — **the real
  Python source in a code panel with the currently-executing line highlighted**, stepping in sync
  with the bars above it.
- **OSI reel** — packet encapsulation. Headers accumulate as coloured chips layer by layer down the
  stack, the active layer lights up, a callout bar names the PDU at each step
  (`PDU: L4 TCP SEGMENT (PORT 443)` → `PDU: L1 PHYSICAL BITSTREAM`), and a binary bitstream runs
  along the bottom.

**The implication for us is uncomfortable and useful:** this account beats our current s001 build
while doing *less* visual authoring, not more. It has no cinematic plates, no isometric art, no
image-model spend, and — critically — **no camera moves at all**. The camera is locked for the
entire runtime of every reel sampled. What carries the video is that the thing on screen is
*actually executing*.

Our s001 pipeline spends its money on plates and its hours on hand-keyframing camera pushes across
them. This account spends nothing on art and writes code instead. It is winning.

## 2. The template is fixed and reused — the content varies inside it

Every reel is the same chassis:

| Zone | Content | Behaviour |
|:--|:--|:--|
| Top | Fixed title, 2 lines, present the entire runtime | never animates |
| Sub-header | Current algorithm name, colour-coded per algorithm | swaps per section |
| Right rail | Complexity chips (`TIME O(n²)` / `SPACE O(1)`), live counters | ticks continuously |
| Centre | The visualization | **the only moving thing** |
| Bottom | Big label (city name / nothing) + segmented progress bar | progress fills |

The title never leaves the screen. That is a short-form convention (a scroller who lands 6 seconds
in still knows what they are watching) and it is worth stealing for our own YouTube thumbnails and
chapter cards, though not for long-form full-frame use.

## 3. Performance — one hit carries the account

Sampled reels, by views (Instagram's public `video_view_count`):

| Reel | Subject | Dur | Views | Likes | Like-rate |
|:--|:--|--:|--:|--:|--:|
| `DagKd4iyni-` 📌 | **Pathfinding algorithms — BERLIN** | 37.6 s | **633,165** | 130,947 | 20.7 % |
| `DcQqJjpyN3C` 📌 | OSI layers — "After you hit send" | 10.1 s | **144,467** | 10,484 | 7.3 % |
| `Dcd4BHZSnow` | Docker vs Podman | 12.1 s | 17,106 | 717 | 4.2 % |
| `DcWEvify-GR` | 14 sorting techniques in 60 s | 60.1 s | 13,999 | 1,113 | 8.0 % |
| `DcUCDBZSpt2` | What the "S" in HTTPS hides | 10.2 s | 11,752 | 793 | 6.7 % |
| `DcYvKBkyIzz` | **Pathfinding algorithms — HYDERABAD** | 37.6 s | 11,358 | 380 | 3.3 % |
| `DcbgRjWyH1b` | The internet doesn't run on OSI | 15.1 s | 5,726 | 569 | 9.9 % |
| `DcTsaZkSIUO` | POTD 2/100 — N-Queens | 30.2 s | 2,690 | 123 | 4.6 % |
| `Dcd4j5Fyz3h` | POTD 3/100 — Rat in a Maze | 15.0 s | 2,374 | 80 | 3.4 % |
| `DcDkvedSOyU` | Independence Day post | 13.0 s | 1,721 | 104 | 6.0 % |
| `DcYpy88yMP5` | OAuth / "Continue with Google" | 11.1 s | 1,437 | 85 | 5.9 % |

- **Median views ex-hero: 8,542.** The hero is a **74× outlier** against its own account.
- **0.57 views per follower at the median** — the account is not being served to its own audience
  much; it lives or dies on Explore.
- Like-rate on the hero is **20.7 %**, roughly 3× the account's own norm. That is a save/share-driven
  distribution signal, not a follower signal.
- **Comments are near-zero everywhere** (0.03–0.4 %). This is passive-consumption content. Nobody
  is discussing it; they are saving it.

## 4. The most instructive data point on the account: Berlin vs Hyderabad

The same reel was made twice. **Identical template, identical algorithms, identical 37.6 s runtime.**
The variable is the city.

| | Berlin (2026-07-07) | Hyderabad (2026-08-23) |
|:--|--:|--:|
| Views | **633,165** | **11,358** |
| Like-rate | 20.7 % | 3.3 % |

**~55× apart.** This is the cleanest natural experiment we have seen on the Tier-1 targeting
question, and it lands squarely on `channel_strategy.md` §4b. But it is *not* a clean single-variable
test, and the confounds must be stated:

1. **Age.** Berlin had ~7 weeks to accumulate; Hyderabad had 4 days. Reels front-load hard, but 4
   days is not full maturity — call it a 2–3× correction at most, not 55×.
2. **It is pinned.** Berlin sits at the top of the profile grid; Hyderabad does not.
3. **Craft regressed.** Berlin has a proportional sans header and a coloured progress bar; Hyderabad
   uses a monospace header with a typo (`30seconds`), drops the progress bar, and letterboxes the map
   into a narrower band with dead black margins.
4. **The Berlin road graph is simply denser** and floods more dramatically. Hyderabad's sparser
   network makes a less spectacular picture.

So: **not proof, but a strong directional signal that survives every discount.** Even attributing
most of the gap to age + craft + pinning, the subject-recognition penalty is real, and it is the
same penalty §4b was written to avoid.

## 5. The funnel has a hole in it

The bio drives 20K followers to `equationverse.substack.com`. That publication — *The Missing
Layer* — is titled **"Work In Progress"** and has **zero published posts**. The bio promises
"Weekly Editorials" against an empty archive.

Worth noting for our own sequencing: **build the destination before you point traffic at it.** The
same trap is live for us — a channel name is locked and a pilot is in production, but there is no
published destination yet.

## 6. What is actually transferable to Depth First

**Take:**
- **Compute the animation, don't author it.** This is the big one. Remotion is a React renderer —
  running a real Dijkstra/sort/packet-walk inside a component and drawing its state per frame is
  *easier* than hand-keyframing, and it is accurate by construction. It also kills the entire class
  of problem that has been making s001 painful.
- **Real instrumentation on screen** — node counts, ms timings, compare/swap counters, complexity
  notation. It reads as authority and it costs nothing because the numbers are already in the run.
- **Code panel with the executing line highlighted**, synced to the visualization. Strongest single
  element on the account and directly buildable in Remotion.
- **Locked camera.** The account has *zero* camera moves and outperforms our camera-heavy build.
  This vindicates the one mandatory static hold in §5 and suggests our push/pull budget is not
  where the value is.
- **Colour-per-concept** (Dijkstra blue, Greedy magenta, A* cyan, Bidirectional red/yellow) rather
  than one brand accent per video. Worth testing against our domain-accent rule.

**Leave:**
- The 10–15 s length and always-on title — short-form conventions that do not transfer to a 12-min
  long-form.
- The hashtag stuffing (`#viralreels #fyp #followme`).
- The engagement-bait captions ("Save this carousel", "Follow us and revise 1 DSA problem every day").
- The pace. At 37 s for five algorithms this is a highlight reel, not an explanation. Depth First's
  bet is the opposite.

---

## Sampling limits

- **12 of 64 posts.** Instagram's public endpoint returns one page; pagination rate-limited (HTTP
  401 "please wait a few minutes") before a second page landed. The sample is the 11 most recent
  plus the pinned hero, so it is **recency-biased and misses the account's back catalogue** — there
  may be other hits between July and August that are not represented here.
- View counts are Instagram's public play counts; there is no impressions, retention, or follows-
  from-reel data without owner access.
- The Berlin/Hyderabad comparison has four named confounds (§4) and should be treated as directional.
- Durations and resolution are measured from the delivered CDN files, so they are exact.
