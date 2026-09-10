# r006 (I17) — what is claimed, and what it cost

## The claim, in one sentence

*"The curvy flight paths on the seatback map are the straight lines — the map is bent, not the
flight."* That sentence is the Gate 0 artefact (`gate0/GATE0.md`), it contains no CS word, and it was
greenlit by a human before any code existed. The reel is that sentence and nothing else.

## Every figure, and where it comes from

All output of `build_geo.py`, which is the only place these numbers are produced. Spherical figures
use the IUGG mean radius **R = 6,371.0088 km**.

| Figure | Value | How it is checked |
|:--|--:|:--|
| Great circle DEL → SFO | **12,373 km** | vs WGS84 geodesic 12,395 km (`pyproj.Geod`), and vs the sum of the 241 sampled legs |
| WGS84 geodesic, same pair | 12,395 km | `pyproj.Geod.inv` — printed, not used on screen |
| Rhumb line (one constant bearing) | **14,945 km** | vs the sum of its own 121 sampled legs |
| The illusion's cost | **+2,572 km** (20.8%) | difference of the two above |
| Highest latitude on the arc | **75.5° N** at 158.8° E | the sampled arc's own maximum |
| Mercator linear stretch at that latitude | **4.00×** | `1/cos(75.5°)` = 3.997 |

`build_geo.py` **asserts** all four cross-checks and refuses to emit if any fails, including
`RHUMB_KM > GC_KM`. A number that only one method produces is a number I made up.

## Where the geography comes from

`basemap-data`'s bundled GSHHG coastlines, land polygons only (`kind == 1`), decimated with an
iterative Ramer–Douglas–Peucker — iterative because GSHHG's rings blow the recursion limit. 101 rings,
3,941 points, 64 KB of TS. **Nothing is fetched at build time**, which is deliberate: `I15` is
stalled precisely because it needs OpenStreetMap and the container's egress proxy refuses
`overpass-api.de`, `api.openstreetmap.org` and `download.geofabrik.de`. This reel was chosen partly
because its data ships with a pip package.

## The beats

| t | Beat | What moves |
|--:|:--|:--|
| 0.0 | Globe, arc drawing taut between two dots | arc draws to 50% by 0.9 s; globe rolling |
| 2.1 | Title rides over the action — "Your flight path isn't curved." | headline swap at 3.1 s |
| 2.8 | Morph globe → Mercator | per-point blend, 2.6 s |
| 7.4 | Readout: 12,373 km, 75.5° N | |
| 12.0 | Morph back to globe, and out again at 15.2 | the same arc, straight then bowed |
| 15.4 | Two 2,000 km scale bars grow — equator vs 75.5° N | the 4.00× is shown, not asserted |
| 18.8 | The constant-bearing line draws, flat across the Pacific | dashes flowing |
| 21.2 | **The race.** Two markers leave Delhi together at the same speed | two laps of 5.4 s fill 21.2 → 32.0 |
| 25.6 | End card over the still-running race | "Open a flight tracker. Those arcs aren't detours." |

The race is why `LAP` is 5.4 and not 5: exactly two laps fill the remaining time, so **the reel ends
on the arrival** — the cyan marker at San Francisco, the amber one still out over the Pacific. At
LAP = 5 the last frame had both markers bunched back at Delhi, which is the worst possible final
frame for a reel whose end card is the follow ask.

## Gate numbers

```
r006_greatcircle.mp4  32.5s  (130 samples @ 4fps)
  median change      0.608
  longest dead spell 0.50s  (limit 1.5s)
  event density      38%  (samples with change >= 1.0)
PASS
```

38% against r004's 42% and r005 v5's 53%. It clears the 26% level a viewer called static, and it gets
there the way `brand_guide_software.md` says to — by never pausing the thing the reel is about. The
globe rolls continuously, the dashes flow continuously, and the race runs under the end card.

`npx tsc --noEmit` and `npm run brand:check` clean.

## Traps this build hit, so the next one doesn't

- **A great circle is straight in orthographic only when the view centre lies on it.** The opening
  beat's whole claim is that the line is taut and straight, so the globe is centred on a point of the
  path and rolls along it. The roll is not decoration; without it the "straight line" beat is a lie.
- **Two SVG path splits, both of which paint garbage rather than erroring.** A coastline subpath must
  break where its Mercator x jumps more than half the map width (the seam), and runs behind the
  terminator must be dropped mid-morph. Filling a ring that is cut at the terminator paints a chord
  straight across the ocean, so the land fill is gated to the last 18% of the morph (`m > 0.82`).
- **`Readout`'s default width runs under Instagram's action rail.** 960 wide from x=60 reaches
  x=1020; the rail starts at 870. This reel's payoff *is* three right-aligned kilometre figures, so
  they were being eaten. `Readout` now takes an optional `width` (default unchanged) and this reel
  passes `SAFE_W`. Found by the `*-safe` scrub, which is the argument for it being mandatory.
- **The seam position is a content decision.** `LON0 = 150°` puts the cut at −30° in the mid-Atlantic,
  so nothing on the route is sliced in half and the arc reads as one unbroken curve. The first mockup
  used a standard-centred map and split the route into two half-arcs at the dateline, which destroys
  the entire image.
- **`GLOBE_R` is 282, not 300.** At 300 the globe's crown ran under the step label's second line.
- **NumPy 2.0 removed `ndarray.ptp()`** and deprecated `np.cross` on 2-D vectors; both bit the
  mockup script.

## What is NOT claimed

The reel never says a real Delhi–San Francisco flight follows this path. Filed routes bend for
jetstream winds, ETOPS constraints and closed airspace, and none of that was verifiable here. The
claim is about the **shortest** path on a sphere, which is what the code computes. See
`reel_captions_log.md` → r006 → load-bearing phrasings.
