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
| `r009` | *not posted* | A (below) — drafted, awaiting Gate 3 | "The Sun pulls on the Earth 179 times harder than the Moon does. The Moon still makes the tide." | — | — | — | — | First reel outside software and the longest at 54 s. Gate 0 recorded its weak leg in advance: nobody is arguing about tidal bulges, so the reach test's "a dispute is already running" is unmet and the body comparison carries that load in the last beat. |
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

### r007 — "Your message doesn't go to space" (`I22`) — **written 2026-09-09, not yet posted**

Every figure is output of `projects/i22_cables/build_geo.py`. Distances are spherical on
R = 6,371 km; fibre latency uses `c / 1.4675`, the group index of silica at 1550 nm.

#### Caption A — recommended

> Your message to America doesn't go up to a satellite. It goes into the sea.
>
> Mumbai to Virginia Beach along the seabed is 16,335 km of glass — round Arabia, through
> Bab-el-Mandeb, up the whole length of the Red Sea, through Suez, across the Mediterranean,
> out past Gibraltar, then the Atlantic. It comes ashore once, crosses France on land, and
> dives again. Light covers the whole thing in 80 ms.
>
> Go up instead. Geostationary orbit is 35,786 km straight up, so up and back down is
> 73,458 km — 4.5× the distance — and 245 ms. And that is the generous version: it assumes a
> satellite parked directly above each city, which one satellite cannot be, because Mumbai and
> Virginia Beach are 148.9° apart. A real satellite path is worse than that.
>
> The part I didn't expect is that glass is the *slower* medium. Light does 299,792 km/s in
> vacuum and 204,288 km/s in fibre — it gives up almost a third of its speed the moment it
> enters the cable. The wire runs the whole race with a 32% handicap and still wins about three
> to one, purely because the sky route is so much further.
>
> Those milliseconds are speed-of-light floors for the route, not pings — no switching, no
> queuing. The line is traced through the chokepoints a cable has to pass, not one particular
> cable's filed track; the Atlantic leg is the stretch MAREA runs, 6,605 km published. Every
> coastline and every kilometre computed in Python and played back frame by frame.

**Hook line** (74 chars, shows before "more"): *"Your message to America doesn't go up to a
satellite. It goes into the sea."*

#### Caption B — alternate, shorter

> Nothing you send abroad has been to space.
>
> Mumbai to Virginia Beach is 16,335 km of glass on the seabed — Suez, the Mediterranean,
> Gibraltar, the Atlantic — and 80 ms. Geostationary orbit is 35,786 km straight up; up and back
> down is 73,458 km and 245 ms, and that assumes a satellite directly above each city, which one
> satellite cannot be.
>
> And glass is the *slower* medium: 204,288 km/s against 299,792 in vacuum. The cable runs with
> a 32% speed handicap and still wins three to one, on distance alone.
>
> Speed-of-light floors, not pings. Computed in Python, played back frame by frame.

#### Hashtags

`#submarinecables #maps #internetinfrastructure #depthfirst`

Four, following r006's shape. `#submarinecables` is the specific one worth ranking in and has a
real enthusiast community. **`#maps` is the deliberate repeat** — it is the only tag reaching
outside the dev audience, and Explore carried 17.0% of r006's views, the highest on the account,
on the strength of the map being the object. `#depthfirst` is the brand. Dropped:
`#howtheinternetworks` (generic enough to be noise), `#fiberoptics` (narrow and technical, the
wrong end of the civilian/dev split), `#telecom` (an industry tag, not an audience).

#### Load-bearing phrasings — do not loosen

| Written as | Never | Why |
|:--|:--|:--|
| "speed-of-light **floors** for the route, not pings" | "takes 80 ms" / "the latency is 80 ms" | Every millisecond here is distance ÷ medium velocity. Real RTT adds switching, queuing and the fact that traffic does not take the drawn path. Drop the word "floor" and the caption is claiming a measurement nobody made. |
| "traced through the **chokepoints a cable has to pass**" | "this is the route your message takes" / "this is MAREA's route" | The line is a reconstruction from public geography — real ports and real straits — not any cable's filed track, and TeleGeography's actual route geometry is licensed and was deliberately not used. Naming MAREA and quoting its **published** 6,605 km is a fact; claiming the drawn line *is* MAREA is not. |
| "that is the **generous** version… a real satellite path is worse" | "a satellite would take 245 ms" | 73,458 km assumes one satellite parked over each city's own longitude. At 148.9° apart a single-satellite link sits at ~0° elevation and is unusable, so the honest framing is that the reel understates the satellite on purpose. |
| "**crosses France on land**" | silence | 909 km of the 16,335 is overland at an assumed ×1.35 routing allowance. Saying it out loud is cheaper than being caught implying the whole path is underwater — and a sensitivity sweep (1.0×–2.0×, plus scaling to published lengths) moves the payoff only 167 → 161 ms, so the assumption cannot change the claim. |

---

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

---

## r009 — "The Sun pulls 179x harder. The Moon makes the tide." (`I58`) — DRAFT, not posted

All figures are output of `projects/i58_tides/tides.py`, re-asserted by `emit_ts.py` before the
data module was written. See `projects/i58_tides/NOTES.md`.

### Caption A — drafted

> The Sun pulls on the Earth 179 times harder than the Moon does. The Moon still makes the tide.
>
> A tide isn't about how hard you're pulled. It's about how much *harder* your near side is pulled
> than your far side — and that difference falls off with the cube of distance, not the square. The
> Sun is 390 times further away, so it wins the pull and loses the tide: 36 cm of lunar bulge
> against 16 cm of solar.
>
> Same rule, applied to you: the Moon raises a tide across your body of 0.0000000000003 m/s².
> The person standing a metre away raises one about 700,000 times bigger.
>
> Everything here is the tide-raising *force*, computed from published constants — not a tide table.
> Real coastlines are a different and much messier problem.
>
> The whole thing in one sum: the Sun is 27 million times heavier and 389 times further away.
> Divide by 389 twice and you get 179x the pull. Divide once more and you get 0.46x the tide.
> One extra division is the entire difference.

### Load-bearing phrasings — do not "tighten" these

- **"the tide-raising force"**, not "the tide". The reel draws the equilibrium tide, which is the
  forcing. Real tides are set by basin resonance, lag the forcing, and vary enormously by coast.
- **"about 700,000 times"** must keep its distance ("a metre away"). The figure is exact-form for a
  70 kg person at 1 m against a 1.7 m body; it is not a general fact about people.
- **"The Moon still makes the tide"** — not "only the Moon". The Sun's 16 cm is real and is what
  makes spring and neap tides.
- **Do not write "two high tides a day."** Tides are semidiurnal, diurnal or mixed by location; the
  Gulf of Mexico gets one. This is the claim the backlog row proposed and the build refused.
- **The two divisions are the real sum**, asserted in `tides.py` to reproduce the measured ratios to
  1e-12 — not a tidy restatement of them. Keep both lines or neither; one alone is just a ratio.
- **The tide-table line was cut at Gate 3** ("tomorrow's high is about 51 minutes later"). It was an
  absolute about a prediction this reel does not make. Its removal also removed rule 9's
  *performable* ask, which is a known trade — see `projects/i58_tides/NOTES.md`.

### Not in the caption, on purpose

The phrase "centrifugal force is wrong". The rotating-frame derivation about the barycentre is
legitimate; only the popular version is wrong. Saying it flatly would be the reel making the same
class of error it exists to avoid.
