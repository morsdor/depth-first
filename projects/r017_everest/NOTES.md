# NOTES — `r017`, `I86`, "the top of Everest used to be seafloor"

Build record, 2026-10-02. Gate 0, GATE 3 and the Stage 3 research are in `gate0/GATE0.md`; the
approved script is `SCRIPT.md`. This file covers the build, the render and the audits.

**State: POSTED 2026-10-03 (43 s).** GATE 5 passed by the owner. First reading below. Rendered in a cloud container (headless-shell Chromium, `angle`).

## Pipeline

```bash
cd projects/r017_everest
pip install pygplates numpy scipy shapely Pillow
# data/ is not tracked — see data/README.md for the two curl lines (rotations, Natural Earth);
# the static polygons are fetched the same way, from the same repo, and are used ONLY to look up
# which plate each Natural Earth country sits on — never drawn
python3 plate_journey.py     # India's speed in Seton et al. 2012, checked against 3 outside numbers
python3 terrain.py           # AWS Terrain Tiles z12 -> 161x161 height field, summit cap >= 8,520 m
python3 journey.py           # per-plate quaternions 0..80 Ma, outlines, India fill, the ocean gap
python3 emit_ts.py           # asserts 12 on-screen claims, writes remotion/src/reels/data/everest.ts
cd ../../remotion
npx remotion render r017-everest ../projects/r017_everest/r017_everest.mp4 --codec=h264 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell
```

## Figures, with provenance

| On screen | Value | Source |
|:--|:--|:--|
| 29,032 FT | 8,848.86 m | China–Nepal joint survey, 2020-12-08 |
| COLLECTED 20 FEET BELOW THE SUMMIT | 6 m | Sakai et al., *Island Arc* 14 (2005) 297 — via secondary sources; the paper is not reachable from the container. **Read it at the source before posting** |
| FULL OF FOSSIL SEA CREATURES | fragments of trilobites, crinoids, ostracods, brachiopods | same |
| 450 MILLION YEARS AGO, WARM SHALLOW SEA | Middle Ordovician limestone, Qomolangma Formation | Sakai 2005; Montana State Everest Education Expedition |
| FOUR TIMES FASTER THAN YOUR FINGERNAILS | model ≥ 3.74× on every Myr the copy is up (62–55 Ma); peak 4.2×; Cande & Stegman 4.3× | `plate_journey.py` (Seton et al. 2012); Cande & Stegman, *Nature* 475 (2011) 47; Yaemsiri et al. 2010 (3.47 mm/month) |
| 50 MILLION YEARS AGO IT HIT ASIA | the commonly cited onset; literature range ~59–40 Ma | Najman et al. 2010 and others |
| ABOUT THE SPEED YOUR FINGERNAILS GROW | GPS 37–44 mm/yr vs nails 41.6 mm/yr | geodetic plate-motion models, Banerjee et al. *GRL* 2002 |
| the amber cap | DEM cells ≥ 8,520 m, the Qomolangma detachment | Sakai 2005 (detachment outcrop at the First Step, ~8,520 m) |

## What the build does NOT claim

- **The globe never shows India touching Asia.** Present-day outlines are moved by the rotations,
  so the crust consumed after the collision (Greater India, and Asia's own shortening) is not drawn.
  In this model the gap from Everest's spot to the suture is still **3,809 km at 55 Ma**, and it
  would take ~3,100 km of extra crust to make contact at 50 Ma. **The race clock therefore stops at
  55 Ma** (asserted), and the contact is shown only in the crash beat's diagram.
- **The crash beat is a diagram, not a simulation.** Seven amber sheets imbricate at a contact;
  the height readout climbs WITH the stack, never against a time axis, because the uplift's timing
  is not known well enough to animate as a clock.
- **The fossil fragments are drawn**, as types (sea-lily discs and stems, shell pieces, trilobite
  pieces, ostracods), not traced from a specimen. The whole trilobite is a labelled key beside the
  rock, not in it (option (a), approved at GATE 4).
- **The sea's depth is not to scale** and no depth is stated. The water column is a diagram.
- **The mesh is the DEM's shape and the readout is the survey.** The DEM summit reads 8,753 m.
- The mountain is NOT vertically exaggerated.

## The computed layers

- **Mountain:** a polar mesh (64 rings × 160 sectors, radius 3 km) sampled bilinearly from the
  161×161 grid; a skirt drops from the rim to sea level, with strata rings every kilometre.
  Amber is exactly the summit's own connected piece of cells ≥ 8,520 m (66 of 67 such cells; the
  67th is an isolated bump, left grey).
- **Globe:** 289 Natural Earth outlines, each on the plate whose Seton static polygon holds its
  representative point, rotated per frame by that plate's quaternion (slerped between whole Myr),
  Eurasia fixed. India is a 778-triangle fill. `journey.py` checks the exported quaternion moves
  Everest's spot exactly where pygplates does.
- **The ocean ahead:** a dashed arc from the amber dot to the suture south of Everest; it shortens
  every Myr the clock passes (asserted).

## Traps found in the build, in order

1. **Stage 3: a check loosened until it passed.** The present-day check was written as "inside
   GPS's 37–44 mm/yr" with a bound of 46; the model reads 45. Rewritten so the bound states its
   own slack, and the on-screen fingernail comparison is made against GPS, not the model.
2. **A tautology in `terrain.py`:** "the cap is one piece" was `... or n >= 1`, true for any input.
   The honest version found two pieces and now asserts the summit's own piece holds ≥ 80%.
3. **"FOUR TIMES FASTER" was false on its first timing**: the slowest Myr under the copy ran 3.497×.
   Not repaired by lowering the bar: the race clock became piecewise (80→62 Ma fast, 62→55 Ma slow)
   so the copy sits only on Myr where the model is ≥ 3.74×.
4. **Greater India:** present-day India never reaches Asia in the model (above). Caught before any
   frame was drawn, by measuring the gap.
5. **Sri Lanka is its own plate (502)** in Seton 2012; it was in India's fill and failed the
   "India's pieces are all on plate 501" check. It now moves as an outline on its own plate.
6. **pygplates 1.0's Euler-pole call** takes no keyword and returns radians; the degree-returning
   variant is used, and the quaternion is verified against pygplates on a test point.
7. **Stills:** the continents were invisible (graphite on slate), the sediment fell in a spiral
   (golden-angle sampling), the close copy collided with the summit labels, and the plumb line
   orbited in front of the mountain. Outlines are ash, sediment is seeded-random, the close shot
   drops the mountain, and the plumb now runs up the core's own axis, drawn through the rock.

## Audits (final render, 43 s, 1,290 frames)

| Audit | Result |
|:--|:--|
| `reel_motion_audit.py` (default width 240) | **PASS**: median change 0.73, longest dead spell 0.25 s, **event density 32%** |
| `reel_safe_audit.py` | **PASS** with **no bleed ranges** (worst box x 72–860, y 304–1540) |

Per beat (event density = samples with change ≥ 1.0):

| hook | proof | sea | race | crash | payoff | close |
|:--|:--|:--|:--|:--|:--|:--|
| 39% | 42% | 46% | 23% | **11%** | 50% | **14%** |

**32% overall is below `r004`'s 42% and above `I51` cut 1's 26%, which a viewer called static.** The
first render failed the dead-spell rule (4.0 s in the close, 31% overall); camera moves fixed the
dead spell but barely moved the crash and close, whose objects cover a small share of the frame.
**Flagged for GATE 5.** The audit cannot tell whether the crash *reads* as static; a watch can.

## Known weaknesses to judge at GATE 5

- **The mountain is a lumpy top on a tall dark column.** That is the true proportion: Everest's
  base here is ~5 km above sea level, so the core is mostly the rock beneath the visible mountain.
- **The globe is small** (it must fit the 810 px safe column) and India is the size of a thumbnail.
- **The sea beat does not obviously read as "under water"** in a still.
- **The follow line is a placeholder** (non-negotiable 9), as agreed at GATE 4.
- **Toxicity:** the reel never mentions the flood; expect the comments to.

## First reading (2026-10-04, ~1 day after posting)

| Metric | Value |
|:--|:--|
| Views / viewers | 7,014 / 5,579 (1.257 per viewer) |
| Sources | Reels tab 77.9% · Explore 20.9% · Feed 0.6% · Profile 0.2% |
| Average watch | 17 s of 43 (40%); ~35% left by ~12 s, then nearly flat to the end |
| Likes · comments · reposts · shares · saves · follows | 72 · 2 · 3 · 8 · 25 · 6 |
| Per viewer | likes 1.29% · comments 0.04% · **shares 0.143%** · saves 0.45% · **follows 0.11%** |

**Against its own bet (a second heat test, the flood argument):** sends sit just under r016's day-1
rate, in the same <0.2% band. **The argument did not show up: 2 comments against r016's 32 at the same
age.** The reel never names the flood, and the caption's send line names the question, not the fight —
so the heat may never have been switched on. What it did better than r016: saves (0.45% vs 0.33%) and
follows (6 on 5.6k viewers, the best follow rate since r005).

**Retention:** the curve drops through the proof and sea beats (4.5–17.5 s) and then holds almost
flat through the race, crash and payoff — the viewers who reach the globe stay. The motion audit's
weakest beats (crash 11%, close 14%) are not where people left.
