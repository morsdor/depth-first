# r007 · `I22` — "Your message to a friend abroad goes underwater."

28 s. Built 2026-09-09. Second reel through Gate 0, and the test of the r006
belief-correction pattern (`brand_guide_software.md` §13).

**Gate 0 sentence** — the thing a viewer repeats to a friend:

> "When you message someone in America it doesn't go up to a satellite — it goes
> along a glass cable lying on the ocean floor. And going up would be three times
> slower."

Gate artefacts and the human yes are in [`gate0/`](gate0/GATE0.md).

## The figures

Everything comes from `build_geo.py`. Nothing is recalled.

| | km | ms (one way) | Provenance |
|:--|--:|--:|:--|
| Mumbai → Marseille, via Bab-el-Mandeb and Suez | 9,012 | 44.1 | great-circle chain through public chokepoints |
| Marseille → Bilbao, overland | 909 | 4.4 | **assumed** — great circle × 1.35 |
| Bilbao → Virginia Beach | 6,414 | 31.4 | same method; MAREA publishes **6,605** |
| **Glass, total** | **16,335** | **80.0** | at `c / 1.4675` = 204,288 km/s |
| **Geostationary, best case** | **73,458** | **245.0** | at `c`; see below |
| Straight line at `c` — the floor | 13,003 | 43.4 | nothing can beat this |

**Ratio 3.06×.** Geostationary altitude is **35,786 km**.

### Three things about those numbers

**The satellite figure is deliberately generous.** It assumes one geostationary
satellite parked at each city's own longitude, which no single satellite can be.
Mumbai and Virginia Beach are 148.9° apart; a geostationary satellite's
horizon-to-horizon width is 162.6°, so a genuine one-hop link exists only at ~0°
elevation and is unusable. **Reality is worse than what the reel shows.**

**Every millisecond is a speed-of-light FLOOR, not a ping.** Distance over medium
velocity, with no switching, no queuing, and no acknowledgement that traffic does
not take the path you drew. The reel says so on screen — `speed-of-light floor,
not a ping` sits under the payoff line — because rule 7 is about sentences, not
just figures, and "245 ms" next to a satellite icon would read as a measured RTT.

**The one assumption cannot change the conclusion.** The overland leg across
France is a routing allowance, not a measurement. Sweeping it across its whole
plausible range, and additionally scaling every leg up to published lengths:

| detour × | total km | fibre ms | payoff ms |
|--:|--:|--:|--:|
| 1.00 | 15,871 | 77.7 | 167.3 |
| 1.35 | 16,107 | 78.8 | 166.1 |
| 2.00 | 16,544 | 81.0 | 164.0 |
| 2.00 + scaled to published | 17,082 | 83.6 | 161.4 |

167 → 161 ms, ratio 2.9–3.2× throughout. **So the reel resolves to the ratio and
carries the milliseconds as instrumentation.** Lengths are left unscaled because
scaling makes the cable slower and the claim stronger — the conservative
direction is the honest one.

## Why the route is not TeleGeography's

The first build measured this route out of `submarinecablemap.com/api/v3`
GeoJSON. **That was not shippable.** TeleGeography's citation policy permits
screenshots of the published maps under CC BY-SA 4.0 but states that *"access to
the underlying databases remains restricted to paying subscribers"* — measuring
route geometry out of the API is use of the database, not of a map.

The replacement is built from **public geography only**: real ports, and the
chokepoints any cable between them must physically pass. It agrees with the
licensed geometry **to 1.4%**, and its ocean legs cross-check against published
cable lengths, which are facts and citable — MAREA 6,605 km, IMEWE 12,091 km end
to end.

**The general rule this establishes: a licence check belongs in Gate 0, beside
the friend test.** It is cheaper to find a source you may use before the reel
exists than after. `I15` is still blocked on OpenStreetMap for the opposite
reason — the data is free and the container's egress was not.

## The beats

| t | Beat | What moves |
|--:|:--|:--|
| 0.0 | Tight on Mumbai. Amber traffic climbs out and off the top of the frame | camera at 1.75×; climbers on a 1.6 s cycle |
| 2.2 | Title rides over the action — "Your message doesn't go to space." | header handoff at 3.0 |
| 3.4 | **Pull back.** The whole ocean between the two cities | camera 1.75 → 1.0 |
| 6.3 | **Surprise 1.** The cable is laid, Arabia → Suez → Med → Gibraltar → Atlantic | camera follows the drawing head at 1.35× |
| 11.4 | Readout: 73,458 km up, 16,335 km under, 57,123 km shorter | wavefront sweeps the finished cable every 2.1 s |
| 14.4 | **Surprise 2.** Glass is the *slower* medium — 204,288 vs 299,792 km/s | bars measured out, not switched on |
| 17.5 | **The race.** Both leave Mumbai at their own true speed | 5.25 s lap × exactly 2 |
| 21.8 | End card over the still-running race | |
| 22.9 | The payoff lands on the first arrival: 80 ms of glass, 245 ms of sky | |

**The satellite never arrives, and that is the ending.** Given its true 3.06×
handicap one trip takes 16.1 s, so it cannot finish inside the reel. The last
frame is the cable arriving for the second time with the amber counter still
climbing through 47,000 km. Two laps of 5.25 s fill 17.5 → 28.0 exactly, so the
reel **ends on an arrival** — the one structural thing carried over from r006
unchanged, because r006's last frame was an arrival and was its most-liked frame.

## What r006's day-1 numbers changed

- **28 s, not 32.** Instagram's like-timing histogram put r006's tallest bar on
  its final frame and its weakest sustained stretch on the 10.8 s race leading
  up to it. So the race is shorter and the end card runs *over* it rather than
  after it.
- **A second surprise at 14.4 s.** r006's retention was a linear bleed with no
  plateau — one surprise at 3 s, then twenty seconds elaborating it. "Glass is
  the slower one" exists to re-commit the viewer where that curve was leaking.
- **A performable end-card ask**, in the shape that worked on r006 ("open a
  flight tracker") rather than the shape that failed on r003 (scan an on-screen
  QR code while holding one phone). It deliberately promises no specific next
  reel: r006's end card promised this one, and `I15`'s promise was broken.

## Gate numbers

```
r007_cables.mp4  28.5s  (114 samples @ 4fps)
  median change      0.956
  longest dead spell 0.25s  (limit 1.5s)
  event density      46%          PASS
```

`npx tsc --noEmit` clean. `npm run brand:check` clean — 41 files, 12 colours,
2 easing curves, min 36px.

**Event density is the whole story of this build.** The first cut ran **19%** —
below r005's first cut at 26%, which a viewer called static. Flowing dashes took
it to 20%, a heavier race and a sweeping wavefront to 27%. Per-beat measurement
found the cause:

| beat | before | after |
|:--|--:|--:|
| hook / sky climb | 17% | — |
| 01 what you picture | 15% | — |
| **02 route draws** | **16%** | — |
| distance readout | 23% | — |
| 03 speed bars | 38% | — |
| race lap 1 | 48% | — |
| **overall** | **27%** | **49%** |

**The audit measures mean change over the WHOLE frame, so only large-area motion
counts.** A 6 px line growing, or a 15 px dot moving, changes almost nothing —
which is why the route-draw beat, the most important animation in the reel,
scored lowest of any beat. r006 cleared the bar because a globe↔map morph moves
every coastline at once.

The fix was a camera. It opens tight on Mumbai, pulls back at 3.4 s to reveal
the ocean, and follows the cable as it is laid. All three are moves a documentary
camera would make, each is meaningful, and each moves the entire map. 27% → 49%.

**Run the audit at its own default width.** It samples at `--width 240`; a
per-beat analysis at 360 reported 51% for a reel the script scored 27%, because
small moving objects survive downscaling to 360 and vanish at 240. Every
benchmark in `CLAUDE.md` (r004 42%, r005 v5 53%, r006 38%) is at 240.

## The hook shipped with a pronoun and no antecedent

The first cut opened on **"It doesn't go up. It goes under."** for six seconds,
over a map, before anything named the subject. Rule 3 says name a recognisable
object in the title and **never "this"** — "It" is that failure wearing a
different pronoun, and nobody caught it until the reel was watched end to end.

It also threw away the reel's own civilian anchor. The Gate 0 sentence is *"when
you **message** someone in America"*, and the word **message** never reached the
screen at all. r006 had this right and its header is the model: **"Your flight
path isn't curved"** names the object in the first three words.

Now: **"Your message / doesn't go to space."** — object on line 1, correction on
line 2, and "space" rather than "up" because space is the belief being corrected
and it pays off on the end card ("Nothing you send abroad goes to space").
The small header carries the same anchor: "Your message goes underwater."

**Two things that made this fiddly and are worth knowing:**

- **Archivo Black runs ~0.58em per character**, so 960 px holds about 22
  characters at 72 px. "Your message doesn't go up." is 27 and wrapped to three
  lines, orphaning "up." onto the climbing marker and colliding with the step
  label at y=470. The header has room for exactly two lines.
- **The climber dimming has to be computed in SCREEN space.** The first attempt
  thresholded on map-space `y` and did nothing, because the opening is zoomed
  1.75× — a marker at map y=653 is drawn at screen y=430. `skyDim` applies the
  camera before comparing.

## Traps

- **Cable geometry must be welded before it is measured.** Trimming a single
  `MultiLineString` part gave a Mumbai → Marseille "cable" of 5,585 km — shorter
  than the great circle, so obviously not a cable. Parts have to be joined into
  a graph and walked.
- **The seam is at 180°, not r006's −30°.** This route crosses the Atlantic, so
  r006's mid-Atlantic seam would cut it in half. Coastline rings are re-wrapped
  and split at the Pacific seam; a ring painted through a seam draws a chord
  across the whole map and fails silently rather than erroring.
- **Instagram's action rail caught this reel too.** The first layout put Mumbai's
  dot at x=923, inside the rail. The map is 800 wide from x=60 so it stops at
  x=860, and both city labels grow *inward* from their dots so neither can
  overflow its side of the frame.
- **`GEO_ALT` is 35,786, which needs the equatorial radius.** Subtracting the
  mean radius 6,371 from 42,164 gives 35,793 — wrong by 7 km, and wrong against
  the one number in this reel a viewer might already know. Caught on the
  filmstrip, not by any check.
- **Coastlines at `#274064` are invisible on this ground.** The map is the object
  the whole reel depends on being nameable with the sound off; it needs ash
  `#81A2C4` at 0.42, not graphite at 1.0.
- **The shared `Progress` bar is 960 wide and runs under the action rail** on
  every reel from r002 on. It is ornamental so it was left alone, but it is the
  only thing in this reel's rail zone and it will show up in any future scrub.

## What is NOT claimed

The reel never says a specific message takes this exact path. Traffic is routed
dynamically, most Mumbai↔US traffic is served by several systems at once, and
the land leg across France is a routing allowance rather than a measured duct.
What is claimed is narrower and true: **the route exists, it is glass on the
seabed, and the satellite alternative is 4.5× the distance and about three times
the time.**
