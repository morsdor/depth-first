# NOTES — `r014`, `I31`, "a typo once took a country off the internet" (it wasn't a typo)

Stage 5 (render & validate) build record. Gate 0, the send test, Stage 3 research and Gate 4
(the script) are all in `gate0/GATE0.md` and `SCRIPT.md` — this file only covers what happened
from render onward, since that is where the actual problems turned up.

## Figures, with provenance

All verified 2026-09-14 against three independent sources (RIPE NCC's own RIS case study, Google
Research's published BGP-dynamics analysis of this exact event, Renesys's contemporaneous incident
writeup + its CircleID follow-up). Full table and quotes: `gate0/GATE0.md` §5.

- Announcement: 24 Feb 2008, 18:47 UTC (Pakistan Telecom, AS17557, to upstream PCCW Global, AS3491).
- Propagation: 97 ASNs carrying the route by 18:49:30 — **2:30 from the announcement**, not the
  "1:45" some sources quote (that reads from first-evidence-in-Asia, not the announcement itself).
- Resolution: 21:01 UTC (PCCW withdraws Pakistan Telecom's prefixes).
- Total duration: **2h14m** (18:47 → 21:01), not "almost two hours."
- "Typo" is false-by-omission and appears nowhere on screen: the block was intentional (Pakistan's
  own order); the accident was PCCW not validating the announcement before repeating it worldwide.

`hijack.py` computes real great-circle arcs (six cities → Karachi) and the piecewise clock;
`emit_ts.py` re-asserts all of this — plus that the clock reads the right value at the exact frame
each piece of copy claims it (the `r010`/`r011` lesson: bind the claim to the beat, not just the
data) — before it will write `remotion/src/reels/data/hijack.ts`. 27 claims, all passing.

## What Stage 5 actually found: three real bugs, not audit noise

The build (Hijack.tsx, the data module, Root.tsx registration) was already sitting in the tree,
untested, when this session picked it up. Every one of the problems below was a genuine defect in
what a viewer would see, not a threshold-tuning exercise — each was confirmed with stills before
being called a bug.

**1. The close beat's hold was a frozen frame.** The camera's rotation/scale keyframes all end at
`BEAT.leak[1]` (20.5s) and hold constant for the rest of the reel (23.5s — more than half the
runtime). `useBreath()`'s translate/scale is too small to register at 240px (the audit's fixed
width). Fixed by resuming a slow ambient spin post-leak and adding a repeating "ping" pulse at
Karachi from the point the leak convergence visually settles (see below) — both a real motion fix
and a story choice ("the exposed point, still there").

**2. The signature 3D dive shot sent the camera INSIDE the globe.** `dive` (the group's scale
during announce/contained/leak) originally peaked at 15. At `R * dive > CAM_Z`, the sphere's near
surface passes the fixed camera position, so for several seconds the frame was solid
background-colour with nothing readable — confirmed with stills at the peak (frames 150/210/260 of
the pre-fix render). This directly defeated the reel's one stated reason to be 3D (`SCRIPT.md`:
"the sphere's own curvature reads as street level"). Fixed by capping `dive` well under `CAM_Z/R`.

**3. The dive also blew past Instagram's header band.** Once (2) was fixed enough to stop the
inside-the-sphere bug, the safe-area audit still failed: at the old peak the sphere's vertical
extent reached y≈4, inside the safe area's HEADER exclusion (y<270), which `reel_safe_frames.py`
never exempts, `--bleed` or not. This is the actual binding constraint on the dive's peak scale, not
the "camera inside the sphere" ceiling — recomputed `dive_max ≈ 2.09` from `CAM_Z=8, R=0.715`
(`sin⁻¹(0.71875 × 15°) × CAM_Z / R`); shipped at 1.9 for margin.

## Camera/geometry tuning, and why each number is what it is

Went through several iterations because two different constraints (motion audit wants a
big/fast-moving scene; safe-area audit wants a small one, especially horizontally) pull in opposite
directions on the same globe:

- `R` (sphere radius): **0.72 → 0.66**. The idle (dive=1) globe's silhouette alone bled past the
  safe column's right edge (x870) — confirmed this was the globe, not the Head text (see below), by
  changing R and CAM_Z independently and watching the measured edge move. Shrinking R (rather than
  pulling CAM_Z back further) was the more surgical fix: R only pulls in the globe's own geometry,
  while CAM_Z shrinks *everything's* on-screen size via perspective, including the close-beat ping
  this reel depends on for its motion-audit pass.
- `CAM_Z`: **6 → 8.15**. Needed some pull-back regardless of R, both to keep the "inside the sphere"
  margin healthy at the (much-reduced) dive peak and because R alone couldn't close the very last
  ~2px of idle overflow (see the audit-quantization note below).
- `dive` keyframes: **[1, 1, 15, 5, 1] → [1, 1, 1.9, 1.5, 1]** (hook / announce-peak / contained /
  leak-end). The header-band constraint above is what actually sets this; it is a much smaller zoom
  than the original build shipped with. It is still a real, visible push-in from baseline — see the
  stills at 6s/11s/17s in the render — just not the dramatic full-frame immersion the original
  numbers implied (which was never actually reachable without either sending the camera inside the
  globe or invading Instagram's own header).

**A false lead worth recording:** the persistent "x872, off by 2px" reading did not move at all
across the first two R/CAM_Z changes, which looked like evidence it wasn't geometric. It turned out
to be `reel_safe_audit.py`'s SCALE=4 downsample: a real, continuous edge motion of a few px can stay
inside the same 4px measurement bucket. Confirmed by measuring the *undownsampled* frame directly
(`x1` landed exactly on 870, the boundary itself) rather than continuing to guess from the
quantized audit output. Lesson: when a change that should obviously move a number doesn't, check
whether the measurement tool itself is the thing quantizing it, before concluding the change had no
effect.

**A real (separate, now-fixed) bug found along the way:** the `Head`/`Clock`/`NetworksReadout`/close
-card text containers were all `left: 60, width: 810` — i.e. their right edge sat at literally
x=870, the safe boundary itself, zero margin, and bold-text antialiasing bled a couple of px past
it. Inset to `left: 70, width: 790` on all four. This did not turn out to be what was causing the
x872 idle reading (that was the globe, per above) but was a real latent bug independent of it and is
fixed regardless.

## Motion-audit fixes, and why they kept needing to get bigger

Every safe-area fix that shrank the globe (R and/or CAM_Z) also weakened whatever was providing
motion during the beats that don't have their own animation (stat/duration's clock-only hold, the
tail of resolve, all of close) — because a marker/arc/rotation's on-screen size is exactly what
CAM_Z and R control. This produced a genuine whack-a-mole for a few iterations; the fixes that
actually stuck were the ones sized to clear the audit with real margin, not just barely:

- **Ambient traffic pulse (hook beat, 0–3s):** the six background arcs' `reveal` now oscillates
  (phase-offset per arc, 1.8s period) instead of sitting at a constant 1 — "traffic light-trails
  already animating" per `SCRIPT.md` beat 1, not just an audit patch. This alone was too subtle
  (a tube's reveal-length change is mostly hidden behind its own fixed 0.018-unit thickness) —
  see next.
- **Origin-city marker twinkle (hook beat):** the six `CONVERGE_ORDER` markers now scale
  0.7×(0.7–2.5), phase-offset, ~12.8x area swing at the peak. A marker's own screen size doesn't
  shrink when R does (only its *position* does), which is why this — sized aggressively, matching
  the Karachi ping below — is what actually cleared the audit, after a milder ±22% version did not.
- **Karachi "ping" (post-leak hold, 20.5s onward — not just the close beat's tail):** a second,
  larger `Marker` at Karachi's position, continuously breathing (cosine, 1.6s period, scale
  0.8–3.0, opacity 0.12–0.5, never fully invisible so there's no discontinuous reset at the wrap).
  Runs for the whole post-convergence hold (stat/duration/resolve/close), not just before the close
  card, because the STAT beat (21.8s) turned out to need it too once the globe shrank. Doubles as
  the story's own closing idea: the exposed point doesn't stop being exposed once the cameras look
  away.
- **Continued globe rotation (post-leak):** `rotY` gets a small added spin (`-0.05 rad/s`) once the
  leak/convergence animation finishes, instead of freezing at its last keyframe. Kept from the first
  attempt at fixing the close beat; on its own it was not enough (hence the ping above), but it
  still contributes and costs nothing.

## Declared bleed

```
python3 scripts/reel_safe_audit.py projects/r014_hijack/r014_hijack.mp4 --bleed 3.5-17.5
```

3.5–17.5s covers the announce/contained/leak dive (measured overflow: 3.73–17.43s, two segments
with a brief gap where the interpolation passes back under threshold; 3.5–17.5 gives margin on both
ends). This is the one shot in the reel that is 3D *because* it needs to fill the frame — "arriving
at street level" is supposed to read as the ground taking over the view, the same way a road at
driver's-eye leaves the frame's edges in the parked `I65` build. Confirmed the header band (y<270,
never exempt) is clear throughout this window even before applying `--bleed` — the declared range
only covers the x-axis (and briefly y-bottom) overflow, never a header violation. Every frame outside
this window passes the safe-area check unexempted.

## Final validation state

```
npx tsc --noEmit                                    clean
npm run brand:check                                 12 colours, 2 easing curves, min 36px — pass
python3 hijack.py && python3 emit_ts.py              27/27 on-screen claims verified
npx remotion render r014-hijack ...                  44s, 1320 frames
python3 scripts/reel_motion_audit.py ... (--width 240, default)
    median change 0.754 · longest dead spell 0.25s (limit 1.5s) · event density 34% — PASS
python3 scripts/reel_safe_audit.py ... --bleed 3.5-17.5
    worst bbox inside bounds once bled window applied — PASS
```

Both `r014-hijack` and `r014-hijack-safe` compositions render; spot-checked the `-safe` overlay at
6s (inside the declared bleed — content does cross into the action-rail/header guide lines there, by
design) and at 41s (well outside it — text and globe both sit cleanly inside the guides).

## What is NOT claimed (unchanged from Gate 0 / the script)

- Not that this was the only or largest BGP incident of its kind.
- Not that PCCW or Pakistan Telecom were the only parties who could have stopped it.
- The six-city convergence stagger (leak beat) is a directorial choice for legibility, not a claim
  about real per-city propagation order — only the aggregate "97 networks in 2:30" figure is
  measured and verified.

## GATE 5 — PASSED, posted 2026-09-18

## First reading (2026-09-18)

**1,949 views / 1,531 viewers, average watch 16s of 44s (36%), 6 likes, 0 comments, 0 shares,
3 saves, 2 follows.** Skip rate 33.5% ("Lower" than typical), share rate 0.0% ("Lower"), like rate
0.4% ("Lower"), save rate 0.2% ("Higher"), repost/comment rate 0.0% (typical). Sources: Reels tab
88.4%, Explore 9.6%, Stories 1.1%, Feed 0.5%, Profile 0.1% — ~98% cold/algorithmic.

**Grading against the `gate0/GATE0.md` §9 pre-registration:** the experiment was framed as a test
of whether genre saturation (not the novelty channel itself) was `r009`'s real problem, judged
against `r009`'s reading rather than sends. `r009` liked at a *normal* rate (2.92%, on par with
`r005`) while sending at 0%. `r014`'s like rate is 0.4% — an order of magnitude under `r009`'s, and
inside `r010` (0.247%) / `r012` (~0.10%)'s failure band instead. **This falsifies the hoped
result**: a fresh, unsaturated novelty subject with a genuine "this could happen again" anxiety
hook still did not clear `r009`'s bar. The only lifts are skip rate (hook held attention) and save
rate (mild) — the same "watched, not felt" signature already seen on `r008`/`r010`/`r011`. Full
analysis: `brand_guide_software.md` §13, "r014 — THE NOVELTY-ALONE EXPERIMENT ALSO FAILED, AND
WORSE THAN ITS OWN FLOOR."
