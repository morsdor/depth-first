# Reel Captions Log — Depth First (Instagram / Shorts)

*The caption equivalent of [`assets/thumbnails_log.md`](assets/thumbnails_log.md). One row per posted
reel, with the engagement columns filled in retroactively. Captions are the only part of a reel that
can be edited after posting, which makes them the cheapest thing to learn from — and the easiest to
forget having written.*

**A caption that isn't here taught us nothing.**

---

## The rules this log enforces

From [`insta_strategy.md`](insta_strategy.md) §6 and the `equation.verse` teardown
([`docs/comp_deep_dive_equationverse.md`](docs/comp_deep_dive_equationverse.md)), explicitly on the
"leave" list:

- **No hashtag stuffing.** No `#viralreels #fyp #followme`. Six topical tags is plenty.
- **No engagement bait.** No "save this", no "follow for one X a day". The teardown named these as
  the things *not* to copy from an account with 20,000 followers.
- **Accuracy is the differentiator.** The lane is full of approximately-right content. Every figure
  in a caption obeys the same gate as every figure on screen: computed by the run, one stated base,
  verified against a primary source or explicitly marked as not.

### Load-bearing phrasings

Some caption wordings are the difference between true and false. When one exists, it is recorded
with the row, because the temptation to "tighten" it later is exactly how a false claim ships.

---

## Posted

| Reel | Posted | Caption | Hook line (first ~125 chars, what shows before "more") | Likes | Shares | Saves | Follows | Lesson |
|:--|:--|:--|:--|--:|--:|--:|--:|:--|
| `r001` | 2026-09-02 | **not recorded** — predates this log | — | 24 | 6 | 6 | 1 | — |
| `r002` | 2026-09-02 | **not recorded** — predates this log | — | — | — | — | — | — |
| `r003` | 2026-09-05 | **not recorded** — predates this log | — | 3 | 0 | 1 | 0 | — |
| `r004` | 2026-09-06 | A (below) | "A JPEG doesn't store your photo. It stores a recipe." | 17 | 1 | 5 | 0 | Lowest skip rate of the three (34.8%, flagged "Lower") and the widest reach (1,617 viewers) — but 1 share against r001's 6. A caption cannot be credited or blamed for either at this sample size; see `brand_guide_software.md` §13. |
| `r006` | 2026-09-08 | A (below) | "Those curved flight paths on the seatback map are the straight lines. The map is bent, not the flight." | 916 | 303 | 362 | 71 | **Figures at day 1 (2026-09-09 09:47); views curve had not flattened, so these are lower bounds.** 32,882 viewers / 46,782 views — 20.3x the account's previous best reach — and best on every per-viewer metric: likes 2.79%, shares 0.92%, saves 1.10%, follows 0.216%. Skip 29.9%, the lowest recorded. Average watch rose 16 -> 16 -> 17 -> 20 s across four readings while reach grew 64x. Audience was **99.9% non-followers**, 58% India, 67% aged 25-44. **Three early conclusions were retracted** (saves at 1 h, shares at 4 h, skip rate at 7 h) — see `brand_guide_software.md` §13. |

Engagement figures are per the reel's own Insights, on the base Instagram reports them against
(unique viewers). r001's are at 3 days, r003's at ~18 h — see `brand_guide_software.md` §13.

---

## r004 — "Your photos contain no pixels" (`I03`)

All figures below are output of `projects/r004_jpeg/dct.py` on the posted crop
(`references/r004_source.jpg`, crop 470,640 + 360×360, computed at 128 px, quality 50).

### Caption A — posted

> A JPEG doesn't store your photo. It stores a recipe.
>
> Every 8×8 square of an image gets rebuilt as a mix of 64 fixed wave patterns. The file saves *how
> much of each* — not what colour each pixel is. There are no pixels in there.
>
> Then most of those numbers are thrown away. Run at quality 50 on this photo I took at a museum:
> 78% of the coefficients round to zero. The busiest square in the frame kept 22 of its 64. And the
> picture stops visibly changing at 44 of 64 — the last twenty move it by under 3 shades out of 255.
>
> So where does the colour come from? It's stored separately, and coarsely. At this quality the
> encoder keeps colour at half the width and half the height. Squash the colour 16× and the error is
> 2.6 out of 255. Squash the *brightness* by exactly the same amount: 15.8. Six times the damage
> from the same operation — because your eye is far more sensitive to light than to hue, and the
> format has been quietly exploiting that for decades.
>
> Every frame here is the real transform, computed in Python. No blur filter, no fake.

### Caption B — alternate, unused

> There are no pixels in your photos.
>
> A JPEG stores how much of each of 64 fixed wave patterns to mix into every 8×8 square — then
> deletes most of those numbers. At quality 50, 78% of them round to zero and you can't tell.
>
> Colour is stored separately and coarsely. Squash the colour 16× → 2.6 error out of 255. Squash the
> brightness the same → 15.8. Six times worse, same operation.
>
> Every frame is the real transform, run in Python on a photo I took.

### Hashtags

`#jpeg #imagecompression #computerscience #softwareengineering #howitworks #depthfirst`

### Load-bearing phrasings — do not loosen

| Written as | Never | Why |
|:--|:--|:--|
| "78% of the **coefficients**" | "78% of the file / of the data" | Entropy coding means bytes are not proportional to surviving coefficients. This is the r001 cafe-noise class of error: a mechanism sentence that sounds right and is false. |
| "**At this quality the encoder** keeps colour at half the width and half the height" | "JPEGs store colour at quarter resolution" | The source photograph is **4:4:4** — no chroma subsampling at all. 4:2:0 is what libjpeg chose when re-encoding at quality 50, measured by reading the sampling factors back out of a file it wrote. |
| "under 3 shades **out of 255**" | merging it with the 78% figure | Two different bases. §7 of CLAUDE.md: one stated base per percentage, never compare across two. |

### Deliberately omitted

- **The JPEG standard's publication year.** It would have had to come from memory — the egress proxy
  blocked both `itu.int` and the `w3.org` mirror of ITU-T T.81, so it could not be checked. "For
  decades" is true and needs no source.

---

## Caption detail

### r006 — "Your flight path isn't curved" (`I17`) — posted 2026-09-08

Every figure is output of `projects/i17_greatcircle/build_geo.py`. Distances are spherical, on the
IUGG mean radius R = 6,371.0088 km, cross-checked against the WGS84 geodesic (`pyproj.Geod`) and
against the sum of the sampled legs.

#### Caption A — posted

> Those curved flight paths on the seatback map are the straight lines. The map is bent, not the
> flight.
>
> Delhi to San Francisco is 12,373 km if you go the short way — which takes you up over the Arctic to
> 75.5° N, nowhere near either city's latitude. Draw the route that *looks* straight on a flat map
> instead, holding one compass bearing the whole way, and it is 14,945 km. The illusion costs
> 2,572 km. Same two airports, same planet.
>
> The reason is that Mercator has to stretch the top of the world to keep angles honest. At the
> latitude that route peaks, the map is showing you 4.00× more width per kilometre than it does at
> the equator. Two 2,000 km bars, one at the equator and one up there, are drawn at four times
> different lengths.
>
> The globe here is a real projection, not an illustration — every coastline, both routes and every
> number computed in Python and played back frame by frame.

#### Caption B — alternate, unused

> The curved line on the flight map is the straight one.
>
> Delhi → San Francisco: 12,373 km over the Arctic. The route that looks straight on a flat map —
> one compass bearing, start to finish — is 14,945 km. The flat map costs you 2,572 km.
>
> Mercator stretches the top of the world 4× at the latitude that route peaks. Real coastlines, real
> geodesy, computed and replayed.

#### Hashtags

`#maps #mercator #aviation #depthfirst`

Four, not six. `#mercator` is the specific one worth ranking in, `#aviation` is the only tag here
that reaches outside the dev audience, `#depthfirst` is the brand. Dropped: `#geodesy` (too small to
carry traffic) and `#howitworks` (generic enough to be noise).

#### Load-bearing phrasings — do not loosen

| Written as | Never | Why |
|:--|:--|:--|
| "if you go the **short way**" / "the **shortest** path" | "the route your flight takes" | Real DEL–SFO routings bend for jetstream winds, ETOPS and closed airspace. The claim is about the shortest path on a sphere, which is what the reel computes; it is not a claim about any particular flight's filed track. |
| "**on a flat map**" / naming Mercator once on screen | "on the map" | Mercator is one projection among many. The 4.00× stretch is a property of *that* projection, and the reel says so rather than implying every flat map does this. |
| "12,373 km" (spherical) | quoting it as the WGS84 figure | The WGS84 geodesic for the same pair is 12,395 km. The 22 km gap is the sphere assumption the reel is built on, so the spherical number is the honest one to show beside a spherical construction — and both are printed by the build script. |
| "**4.00×** more width per kilometre" | "4× bigger" | The stretch is in linear scale at one latitude (75.5° N), not in area, and it is quoted at the arc's own vertex rather than at some worse latitude chosen to flatter the number. |

#### Deliberately omitted

- **Any named airline or flight number.** It would make the reel a claim about a real filed route,
  which is the first row of the table above.
- **"Great circle" in the caption's first line.** It is the CS word Gate 0 tests for. It appears
  nowhere in the hook, on screen or in the opening sentence — the viewer gets "the map is bent, not
  the flight" and can look the term up if they want it.
