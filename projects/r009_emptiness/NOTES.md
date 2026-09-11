# r009 · I70 — the biggest star in the universe is a speck

**Built 2026-09-11. Re-cut the same day after the Gate 3 read: 53 s → 40 s. Accent
`infrastructure #00D6F7` (§2).**
First **3D** reel in the repo (`@remotion/three`), and the first built on a topic that did not
come from `content_backlog.md`.

## The sentence (approved at Gate 0 before anything was built)

> **"Everyone shows you how big stars get. Nobody shows you the emptiness — the biggest star
> anyone has found would still be a speck in the gap between two ordinary ones."**

Full gate record, including the two rejected alternatives and the honest reach-test failure:
[`gate0/GATE0.md`](gate0/GATE0.md).

> **Gate 3, 2026-09-11 — the first viewer read said the message did not land.** *"I had a hard
> time understanding what it had to convey. We don't know what we are comparing against. The
> sphere can also tell us what it represents."* The craft was praised; the script was not. The
> diagnosis and the script-first rewrite are in [`SCRIPT.md`](SCRIPT.md) — one ruler instead of
> seven, labels riding on the bodies, the catalogue name out of the title, and the wide third cut
> to a sequel. **v2 is built, rendered and audited — the tables below describe it.** The v1
> figures are kept inline wherever the change is the lesson.

## The spine

Every cosmic-scale video does **sizes** and ends on "and this one is even bigger". Sizes
saturate — the five largest stars ever measured, found across two galaxies, are all within
**8.7%** of each other. Distances do not. So the ladder **breaks** in the middle, and the break
is the rung the genre skips.

`emit_ts.py` asserts the break as a claim — `GAP.fits > LADDER[3].step` (18,749 > 1,540) — and
refuses to write the data module if it ever stops holding.

## Figures, with provenance

Everything on screen is computed by `scale_ladder.py` and printed to stdout. No number is typed
into a label anywhere in `Emptiness.tsx`.

| Figure | Value | Source |
|:--|:--|:--|
| Solar radius | 695,700 km | IAU 2015 Resolution B3 (nominal) |
| Astronomical unit | 149,597,870.7 km | IAU 2012 Resolution B2 (exact) |
| Light-year | 9,460,730,472,580.8 km | exact by definition (Julian year × c) |
| Proxima Centauri | 4.2465 ly | Gaia parallax, standard nearest-star catalogues |
| **WOH G64 A radius** | **1,540 ± 77 R☉** | **Ohnaka et al. 2024, A&A 691 L15 (arXiv:2412.01921)** |
| VX Sagittarii | 1,556 ± 110 R☉ | Wikipedia "List of largest stars", as cited there |
| RSGC1-F01 | 1,530 (+330/−424) R☉ | ditto |
| RSGC1-F04 | 1,422 (+305/−390) R☉ | ditto |
| VY Canis Majoris | 1,420 ± 120 R☉ | ditto |
| Orion Nebula | 24 ly across, 1,344 ly away | Menten et al. 2007 (VLBA parallax) |
| Sun's galactocentric radius | 8.178 kpc = 26,673 ly | GRAVITY Collaboration 2019, A&A 625 L10 |
| Milky Way diameter | ~100,000 ly | commonly quoted; **genuinely uncertain, 87k–120k** |

**Derived, and asserted:**

```
Earth -> Jupiter          x11.2
Jupiter -> the Sun        x9.7
the Sun -> WOH G64        x1,540          <- sizes stop here
WOH G64 fits in the gap   x18,749         <- distances do not
the Sun fits in the gap   x28,873,790
WOH G64 in the Sun's seat reaches 7.16 AU  (Jupiter 5.204, Saturn 9.583)
five largest, spread      8.7%
gap across Orion Nebula   5.7x
gap as % of the galaxy    0.0042%
```

## Two claims that were killed during research — both by this repo's own rules

1. **Stephenson 2-18 at 2,150 R☉.** The Gate 0 mock was built on it. It does not survive:
   revised down toward ~1,400 R☉, and the original figure was inflated by the ejected-material
   nebula around the star confusing where the photosphere is. Replaced with WOH G64 A, which is
   measured, recent, citable, and was **the first star ever imaged in detail outside our own
   galaxy** (ESO VLTI/GRAVITY, Nov 2024). The headline number moved **13,430 → 18,749** — the
   claim got stronger *and* more honest.
2. **"The Hayashi limit caps stars at 1,500 R☉."** False, and it nearly shipped. The Hayashi
   limit is a **temperature** line (~2,500 K) on the H–R diagram, not a radius cap in solar
   radii; the number came from a fan wiki. This is non-negotiable 7 exactly — a mechanism
   *sentence*, not a figure, and it would have passed every automated check in the repo.
   Replaced by an **observation** instead of a theory: the five largest ever measured are all
   within 8.7% of each other.

## What is NOT claimed

- **Not "WOH G64 is definitively the largest star".** Hypergiant radii are model-dependent and
  disputed; the source list carries its own caveat ("All the sizes stated in these lists have
  inaccuracies and may be disputed"). The reel says "the biggest star we have ever measured".
  Conservative fallback if ever challenged: **Betelgeuse, 764 R☉**, interferometrically
  constrained, still fits the gap **37,793×**.
- **Not "there is a physical size limit".** See above.
- **Not "space is empty".** It is empty *of stars*. Gas, dust and plasma are everywhere.
- **Not "4.25 ly is a typical gap".** Proxima is unusually *close*; typical local separations are
  larger, which makes the claim stronger.
- **`GALAXY` and `NEBULA` are seeded procedural point clouds, not measurements.** No number on
  screen derives from either. The one real quantity in the galaxy rung is the Sun's
  galactocentric radius, which the marker is pinned to. The spiral is drawn at 19° pitch rather
  than the measured ~12° because at 12° the arms read as concentric rings on a 1080-wide frame.
- **Neighbour effective temperatures drive COLOUR ONLY**, never a number on screen. They are
  published values where measured and representative values for the spectral class otherwise.

## Colour is computed, not chosen

Star colour is **Planck's law at each star's published effective temperature**, integrated
against the CIE 1931 colour matching functions (Wyman/Sloan/Shirley 2013 analytic fits), then
XYZ → sRGB. Sirius comes out blue-white because it is 9,940 K; WOH G64 comes out deep amber
because it is 3,400 K and **Stefan–Boltzmann** puts its surface at 12% of the Sun's brightness
per unit area. The nebula is the sRGB of the **H-alpha line at 656.28 nm**, which is the actual
reason emission nebulae photograph red.

`brand:check` bans hex literals outside `brand/` but accepts computed `rgb()` strings, so the
honest path and the legal path turned out to be the same one.

## The beats — v2, 40 s

| Beat | s | What it does |
|:--|:--|:--|
| hook | 0.0–3.8 | **The giant itself**, receding, with the promise over it and a clock keeping it. |
| earth | 3.8–7.8 | Hard cut to Earth. Jupiter grows beside it and **Earth stays**. The ruler is born: `×11.2`. |
| sun | 7.8–11.3 | The Sun grows past Jupiter, which stays. `×9.7`. The title says the ruler out loud. |
| giant | 11.3–17.0 | The giant returns at `×1,540`, the Sun a **labelled** point beside it for the whole beat. |
| orbits | 17.0–20.2 | Wordless: rings drawn outward from its seat, Jupiter's swallowed. No new number. |
| saturate | 21.2–25.8 | The five largest ever measured. The ruler visibly **refuses to climb**. |
| break | 25.8–34.8 | The gap. Counter 1 → 18,749. Giant gone at **t=31.0**, the second the hook promised. |
| close | 34.8–40.0 | Stays on the gap while the fill drains out of it. Four staggered arrivals. |

**Cut from v1:** `hood` (25 neighbouring systems), `nebula` (Orion at 24 ly) and `galaxy` (the
Sun at its real galactocentric radius) — 18 s that opened three new scales *after* the payoff had
landed, in three more units. `HoodGroup`, `NebulaGroup` and `GalaxyGroup` are deleted from
`Emptiness.tsx` and remain in git; the subject is a reel of its own. The v1 titles that named
`WOH G64` and quoted `7.16 AU`, `8.7%` and `4.2465` are gone with them — see
[`SCRIPT.md`](SCRIPT.md) for the full jargon kill list.

## The architecture: one number moves

The reel spans ~14 orders of magnitude. A float32 depth buffer falls apart after about 7, so a
scene really containing both Earth and the galaxy would z-fight into noise.

**Nothing is ever scaled or flown through.** One number moves — `viewKm`, the height of the world
the camera can see, log-interpolated across the beats — and every object is placed at
`km / viewKm * WORLD_H`. World coordinates stay O(1) at every rung, and "zooming out" is a
re-basing rather than a translation. Each beat also owns its local origin and cross-fades on the
shared `viewKm`.

## Traps, all of them found by measuring rather than by looking

**v2, 0 — only large-area change counts, and this is what that means in numbers.** The audit
measures mean change over the whole frame, so on an almost-empty frame **the only real events are
text arrivals** — a 62 px title block measures **3.7** against a 1.0 event threshold, while a
disc receding across a whole beat measures 0.15–0.30. A shrinking disc changes an *annulus*, whose
area scales with its radius, so a beat built on one dies exactly as the star gets small. Three
consequences, each of which took a render to find:

- the hook was cut 5.0 s → 3.8 s and its title split into two arrivals at 0.6 and 2.4 with the
  clock landing at 1.5 between them, because three events is what 3.8 s of one star can be given;
- the tail was cut 5.5 s → 3.0 s after the payoff and every line of it lands on its own beat;
- **`ease` takes the rate to zero AT every keyframe**, so a long pull needs keyframes 0.4 s apart,
  not 1.6 s apart. Three widely-spaced ones read as three separate dead spells (2.00 s at 2.8 s,
  then 1.75 s at 15.0 s). The hook's ten geometric steps are what fixed it.

**v2, 0b — four rendering bugs that typecheck, lint and brand:check all passed.** Every one was
caught by looking at a still:

1. **An empty `<div>` creates no line box.** A staggered title passing `''` as a spacer collapsed
   to zero height, so "IS ABOUT TO VANISH" rendered *on top of* "THE BIGGEST STAR".
2. **"Accent the last line" paints the wrong line** once a title is split — the last line of the
   first half is not the last line of the title. `Title` now takes an explicit `accent` index.
3. **An extra `/2`** in the gap ticks' pixel conversion put both a quarter of the way in and
   printed `OUR SUNHE NEXT STAR` across the middle of the payoff.
4. **An early return guarded on the wrong opacity** killed the span line with the ticks, leaving
   34.4–35.1 as a frame with nothing in it but the rule.
5. **`useBeat` crosses in 0.6 s EARLY, which is a leak across a hard cut.** `useBeat(B.earth[0], …)`
   put the giant beat's names — `OUR SUN`, `THE BIGGEST STAR` — at 83% opacity on the HOOK's star,
   0.1 s before it cut away and ten seconds before the beat they belong to. Two beats' worth of
   text inside one second across a cut, and the reader's verdict was *"it gets unreadable."*
   **A beat that begins on a cut cannot use `useBeat`'s lead-in** — it needs an explicit ramp that
   starts after the cut has landed.

**v2, 0c — a cut needs a beat of silence on each side.** The first v2 cut ran the hook title out at
3.6, cut at 3.8, and brought the next title in at 4.2: three text states changing inside 0.6 s
across the biggest visual change in the reel. The promise now holds to **3.75** and leaves *with*
the cut, so one decisive change replaces two small ones; then Earth has **1.1 s on its own** — its
name at 4.5, its title at 4.9 — before Jupiter starts growing at 5.6. `useRung` gained a keyframe
to match: Earth **holds centred** until 4.7 instead of sliding left the instant it arrived, toward
a Jupiter not admitted for another 0.3 s.


1. **The visibility ceiling is the important number, and it caused a white flash.** Bodies faded
   in while still *larger than the frame*: a lit sphere filling the picture blows out, and frames
   79–100 of the first render averaged **180/255**. Invisible in the Studio, invisible in stills,
   obvious the moment every frame's mean was scanned. Ceiling is now `log10(r/viewKm) = -0.74`,
   capping a visible body at ~0.53 of the frame.
2. **Rings at `r * 0.997` are sub-pixel and never render at any zoom.** The orbit beat had no
   visible orbits at all for several renders. Ring thickness is now in **world units**.
3. **A yaw rotation turns a tilted ring edge-on.** Euler XYZ applies yaw after tilt. Only the
   tilt does anything useful; the yaw was deleted.
4. **`interpolate` needs an ascending input range** — `[0.62, 0.46]` throws at render time, not
   at typecheck.
5. **An earlier "fix" for the orbits beat snapped the giant down to Sun size** at 12.1 s and grew
   it back. It improved the audit and was wrong on screen. Replaced by rings drawn outward.
6. **Points render as hard SQUARES without a map** — the nebula read as red confetti.
7. **Stage budget:** title 300–480 · stage 520–1140 · countdown 1462 · caption 1300–1450. The
   module **throws at load** if a hero object outgrows the stage at its own keyframe.
8. **`fps=2` sampling and `-ss` keyframe seeking disagree.** `-ss` before `-i` seeks to a
   keyframe and silently reads a different frame; it hid the white flash for one debugging round.

## Audits

```
                        v1 (53 s)                    v2 (40 s)
motion, --width 240     median 0.658                 median 0.723
                        dead 1.50s (limit 1.5)       dead 0.75s          PASS
                        event density 31%            event density 35%
Instagram chrome        TOP 0 · BOTTOM 0 · RAIL 888  TOP 0 · BOTTOM 0 · RAIL 1017
```

**Per beat (v2), median | dead samples | event density:**

```
hook     0.529 |  5/15 | 20%      orbits    0.446 |  3/12 | 25%
earth    2.492 |  0/16 | 94%      saturate  0.539 |  2/19 | 21%
sun      1.075 |  2/14 | 50%      break     0.814 |  2/36 | 28%
giant    0.522 |  9/23 | 39%      close     0.299 | 11/21 | 19%
```

**On the rail number, and why 1017 is not a regression.** The repo's `reel_safe_audit.py` uses a
flat `x 60..870`; Instagram's action rail actually covers `x>=870` only below `y=1050`. Measured
against the real rectangle, **the only thing r009 puts in the rail is the shared `Progress` bar at
y=1534 — and r005 measures 1017 there too**, on the same probe. Everything else the flat test
flags is the gap line and its two end stars at y≈830, which is 220 px above the rail. Top and
bottom bands are clean at 0 px.

**`reel_safe_audit.py` cannot run in the cloud container and FAILS OPEN.** Neither available
ffmpeg does `-f rawvideo` on h264 — the Remotion build has no rawvideo muxer, the Playwright build
is `--disable-everything` and cannot decode h264 — so the frame generator yields nothing, the
bbox comes back inverted (`x 1080..-1`) and the script prints **PASS**. The numbers above came
from the same logic re-sourced through PNG frames, which is what `reel_motion_audit.py` already
does. Treat a `PASS` with an inverted bbox as "did not run".

**On event density:** 35% is above v1's 31% and r004's 42% is still the target. The weak beats are
the hook (20%) and the close (19%), and both are weak for the same measurable reason — see the
trap below.

## Rebuild

```bash
python3 projects/r009_emptiness/scale_ladder.py    # measurements -> emptiness_data.json, asserts
python3 projects/r009_emptiness/emit_ts.py         # -> remotion/src/reels/data/emptiness.ts
cd remotion && npx remotion render r009-emptiness \
  ../projects/r009_emptiness/r009_emptiness.mp4 --codec=h264
```

`remotion.config.ts` sets `Config.setChromiumOpenGlRenderer("angle")`. **Without it a
`<ThreeCanvas>` composition renders zero frames** with `THREE.WebGLRenderer: Error creating WebGL
context`. It is set in the config rather than as a `--gl=angle` flag so a 3D reel cannot be
rendered wrongly by someone copying the command out of this file.
