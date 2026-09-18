# NOTES — `r015`, `I77`, "there are mirrors on the Moon, and observatories still bounce lasers off them"

Stage 5 (render & validate) build record. Gate 0, GATE 3 and Stage 3 research are all in
`gate0/GATE0.md`; the approved script is `SCRIPT.md`. This file covers what happened from build
onward, since that is where the real problems turned up — same shape as `r014`'s NOTES.md.

## Figures, with provenance

All verified 2026-09-18 against lunar-laser-ranging literature (APOLLO station instrument papers —
Murphy et al., IOPscience; arXiv instrument-description papers — an LLR round-trip-loss review, and
Eos.org's feature on the current best-fit recession rate). Full table and sources:
`gate0/GATE0.md` §5.

- Earth–Moon distance: 384,400 km (standard constant).
- Round trip light time: **2.5644 s** — exact physics, `llr.py` computes it from `distance / c`,
  not a research lead.
- Photon budget, APOLLO station named explicitly: 3.1×10¹⁷ sent (115 mJ @ 532 nm), 5–10 typically
  detected back (displayed value: 7, the midpoint of the verified range). Never blended with the
  ~1:10¹⁸ figure for older, unnamed stations — that ratio does not appear on screen.
- Ranging precision: ±1 mm, APOLLO's own published figure.
- Recession rate: 3.83 cm/year, 50+ years of LLR data (Eos.org, corroborated by IFLScience,
  ScienceBlog and an arXiv review on lunar recession and length-of-day).
- Five real, named, still-used arrays: Apollo 11 (1969), 14 (1971), 15 (1971), Lunokhod 1 (1970),
  Lunokhod 2 (1973) — 57 years of data as of 2026, so "over fifty years" (not "fifty" flat, which
  the original script draft used at beat 6 and was corrected here to match beat 8's phrasing).

`llr.py` computes and asserts the physics; `emit_ts.py` re-asserts all of it — plus that the
round-trip clock and year counter read the right value at the exact screen second each piece of
copy claims it (the `r010`/`r011`/`r014` lesson) — before it will write
`remotion/src/reels/data/moonmirrors.ts`. 19/19 claims passing.

## What Stage 5 actually found: four real bugs, not audit noise

Every one of these was a genuine defect in what a viewer would see, confirmed with stills before
being called a bug — same discipline `r014`'s NOTES.md used.

**1. The arrival "spot" was bigger than the Moon itself.** The spread beat's widening circle used
`circleGeometry` with a base radius of 1 world unit, scaled by `spotGrow` (max 0.34) — but that
0.34 was multiplied by the group's own dive scale too, so the spot's effective radius (≈1.16 units)
dwarfed `R_MOON` (0.19 at the time). The whole "moon" for several seconds was just a giant green
disc. Fixed by basing the circle's geometry on `R_MOON * 0.6` instead of `1`.

**2. The headline text was silently erased by the Moon's own glow patch.** `glow_sphere`-style
rendering (`Earth`/`Moon` drawn as opaque squares roughly 6x their radius, per the Gate 0 mock's own
convention — not applicable here since the reel draws real spheres, but the ANALOGOUS bug showed up
in the Gate 0 payoff-frame script itself, `mock_payoff.py`: the Moon's opaque square patch, pasted
*after* the headline text, painted over the right half of both title lines. Confirmed by sampling
lit pixels row-by-row — the cut sat at the patch's edge, not at any text-measurement boundary.
Fixed by drawing the headline last, over the finished scene, in the Gate 0 script (this predates
the .tsx build and is recorded here for completeness; see `gate0/GATE0.md` §3).

**3. Unbounded ambient rotation quietly ruined the "wide" shots by the close beat.** The first draft
spun the whole scene at a constant rate (`-0.045 * s`); by s=36–45 (the close beat) that had drifted
past 90°, swinging both bodies through the camera's Z-axis so the "wide" framing no longer resembled
the hook's at all (confirmed via stills at f1080/f1260 — Earth and Moon in completely different
relative positions than at f15). Fixed by switching to a bounded oscillation
(`-0.1 * sin(2*pi*s/16)`) — the FOCUS-centering position formula (`position = -scale *
rotateY(focus)`) is exact for any rotation value, so this cost nothing else.

**4. The off-focus body swings into the header band during a dive.** While diving to the
observatory (Earth), the Moon — not being the focus point — gets carried to an extreme position by
the same group transform, and at the original peak scale (3.4x) its silhouette's BOTTOM edge
reached inside the never-exempt `y<270` header band (measured: y≈250, worst case). This is the same
underlying issue as `r014`'s single-globe dive, generalised badly: with one body centred at the
group's own local origin, only rotation mattered; with two bodies offset from it, the *other* body's
swing is a second free variable nobody was watching. Fixed two ways together: (a) peak dive scale
brought down from 3.4 to 1.9, and (b) the off-focus body's opacity now fades to a near-invisible
0.08 during the *other* body's dive, saturating within the first ~15% of each transition (fast
enough to be fully dimmed well before the swing peaks) — which also reads better narratively:
attention genuinely narrows to whichever body the beat is about.

## The safe-area layout math, done properly this time

At `CAM_Z=7.2`, `FOV=30`, the safe column (x 60–870, y 270–1540) at z=0 depth maps to world-space
x∈[-0.964, 0.663], y∈[-1.165, 1.386] (497.7 px/world-unit). The first draft placed `EARTH_POS` at
x=-0.85 with `R_EARTH=0.5` — Earth's own left edge (-1.35) was nowhere near the safe column, and the
safe-area audit failed on **1348 of 1350 frames**, not just during the dive. Recomputed both bodies'
positions and radii (`EARTH_POS=(-0.5,-0.6)`, `R_EARTH=0.3`; `MOON_POS=(0.32,0.62)`, `R_MOON=0.13`)
to sit inside that box with real margin at rest, and declared the one continuous dive window
(3.0–26.8s — the outbound trip, the dilution, and the return, all one continuous elevated-scale
sequence) as bleed, the same shape as `r014`'s single dive-and-pull-back window, just covering both
legs of this reel's round trip instead of one.

## Motion-audit fixes

- **Hook (0–3s) and the payoff/close beats (30–45s) were dead spells** (a thin beam's opacity swing
  and a slow "recede" drift both measured well under the 0.35 stillness threshold at the audit's
  240px downsample — a thin line or a small marker is worth almost nothing there, the `r006`
  lesson, confirmed again). Fixed by pulsing the Earth and Moon SPHERES' own scale (real screen
  area, unlike a small added marker) during those windows specifically — a small dedicated "ping"
  marker (same idea as `r014`'s Karachi ping) measured only ~0.15–0.18 mean change on its own and
  was not enough by itself.
- The ping marker itself, once the sphere-pulses were carrying the audit requirement, was left over
  from an earlier size calibration and had grown to visually dwarf the Moon after `R_MOON` was
  shrunk for the safe-area fix — caught on a visual pass (f1260), not the audit. Shrunk back to a
  small highlight (radius 0.02–0.045 vs `R_MOON=0.13`).

## Final validation state

```
npx tsc --noEmit                                    clean
npm run brand:check                                 12 colours, 2 easing curves, min 36px — pass
python3 llr.py && python3 emit_ts.py                 19/19 on-screen claims verified
npx remotion render r015-moonmirrors ...             45s, 1350 frames
python3 scripts/reel_motion_audit.py ... (--width 240, default)
    median change 0.722 · longest dead spell 0.75s (limit 1.5s) · event density 30% — PASS
python3 scripts/reel_safe_audit.py ... --bleed 3.0-26.8
    worst bbox inside bounds once bled window applied; header band clear throughout — PASS
```

Both `r015-moonmirrors` and `r015-moonmirrors-safe` compositions render.

## Declared bleed

```
python3 scripts/reel_safe_audit.py projects/r015_moonmirrors/r015_moonmirrors.mp4 --bleed 3.0-26.8
```

3.0–26.8s covers the announce → spread → dilution → roundtrip sequence: the beam firing, arriving,
diluting/returning, and the distance locking — the one continuous 3D-only shot (camera fixed,
diving between two real bodies through actual depth) that needs to fill the frame, the same
justification `r014` used for its single dive. The header band (y<270) is clear throughout this
window even before any bleed is applied.

## What is NOT claimed

- Not that this was the only lunar retroreflector count — five real, still-used arrays are named
  (Apollo 11/14/15, Lunokhod 1/2); no claim about total historical count.
- Not a causal mechanism for WHY the Moon recedes (tidal dissipation) — Gate 0's approved sentence
  only claims the measurement, not the cause, so the script never reaches for a mechanism sentence
  it would then have to source and defend on top of everything else.
- Not that every LLR station gets APOLLO's photon-return numbers — beat 4 names APOLLO specifically
  and does not imply this is typical of all lunar-ranging stations.
- The five mirror-site selenographic coordinates are illustrative near-side placements (correct
  general region per mission), not asserted to survey precision.

## GATE 5 — PASSED, posted 2026-09-18

Watched end to end and approved without a repair. The oversized spot and the header-band swing
both passed every static check (tsc, brand:check, even the motion/safe audits at earlier stages of
the build) and were only caught by looking at actual frames during this build — recorded above so
the next 3D two-body scene doesn't rediscover either the hard way.

Caption logged in [`reel_captions_log.md`](../../reel_captions_log.md). First engagement reading
pending.
