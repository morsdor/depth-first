# r009 · I70 — the biggest star in the universe is a speck

**Built 2026-09-11. 53 s. Accent `infrastructure #00D6F7` (§2).**
First **3D** reel in the repo (`@remotion/three`), and the first built on a topic that did not
come from `content_backlog.md`.

## The sentence (approved at Gate 0 before anything was built)

> **"Everyone shows you how big stars get. Nobody shows you the emptiness — the biggest star
> anyone has found would still be a speck in the gap between two ordinary ones."**

Full gate record, including the two rejected alternatives and the honest reach-test failure:
[`gate0/GATE0.md`](gate0/GATE0.md).

> **Gate 3, 2026-09-11 — the first viewer read says the message does not land.** *"I had a hard
> time understanding what it had to convey. We don't know what we are comparing against. The
> sphere can also tell us what it represents."* The craft was praised; the script was not. The
> diagnosis and the script-first rewrite are in [`SCRIPT.md`](SCRIPT.md) — one ruler instead of
> seven, labels riding on the bodies, the catalogue name out of the title, and the wide third cut
> to a sequel. **Everything below describes the v1 cut as built and is unchanged.**

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

## The beats

| Beat | s | What it does |
|:--|:--|:--|
| hook | 0.0–4.2 | Earth → Jupiter. A promise naming its object and its second, with a clock keeping it. |
| sun | 4.2–7.0 | The Sun, held. |
| giant | 7.0–13.0 | WOH G64 swells in, 1,540× wider, the Sun a point beside it. |
| orbits | 13.0–18.0 | Orbits drawn outward from its seat: it swallows Jupiter's, stops short of Saturn's. |
| saturate | 20.0–24.5 | The five largest ever measured, near-identical. **Sizes stop.** |
| break | 24.5–35.0 | The gap. Counter runs 1 → 18,749. Giant gone at **t=31.0**, the second the hook promised. |
| hood | 35.0–41.0 | 25 real neighbouring systems in real 3D. |
| nebula | 41.0–43.8 | The Orion Nebula at its measured 24 ly. |
| galaxy | 43.8–49.0 | The galaxy, Sun pinned at its real radius, pulsing. |
| close | 49.0–53.0 | Staggered close naming what the next reel does. |

## The architecture: one number moves

The reel spans ~14 orders of magnitude. A float32 depth buffer falls apart after about 7, so a
scene really containing both Earth and the galaxy would z-fight into noise.

**Nothing is ever scaled or flown through.** One number moves — `viewKm`, the height of the world
the camera can see, log-interpolated across the beats — and every object is placed at
`km / viewKm * WORLD_H`. World coordinates stay O(1) at every rung, and "zooming out" is a
re-basing rather than a translation. Each beat also owns its local origin and cross-fades on the
shared `viewKm`.

## Traps, all of them found by measuring rather than by looking

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
motion (default --width 240):  median 0.658 · dead spell 1.50s (limit 1.5) · event density 31%  PASS
Instagram chrome:              TOP 0 px · BOTTOM 0 px · RAIL worst 888 px
```

**On the rail number:** the repo's `reel_safe_audit.py` uses a flat `x 60..870`, which is the
rail-safe *width*; Instagram's action rail actually covers `x>=870` only below `y=1050`. Measured
against the real rectangles, nothing lands in the top or bottom bands, and the rail overlap is
**888 px worst-case against r005's 876 px** — r005 being the only reel on this account that
worked. Most of it is the shared `Progress` bar's tail, which every reel in the repo has.

**On event density:** 31% is below r004's 42% and I51 v5's 53%, and it is the honest weak point
of this build. The wide rungs are the cause — a sparse point cloud cannot carry a hold at 240 px
wide however big or bright it is, which is the blind spot `CLAUDE.md` names. Every hold in the
reel had to be given continuous motion (the galaxy never stops receding; the orbit plane tilts;
the five-star row travels a wave; a pulse crosses the gap after the tally lands). Watch this at
Gate 3: if it reads static, the wide third is where to cut.

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
