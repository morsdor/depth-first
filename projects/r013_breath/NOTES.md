# r013 · I81 — build record

**Runtime 37.0s. GATE 5 (human watch-through) passed 2026-09-16.** Awaiting posting; the four
"when it ships" logs below are written now so nothing is re-derived later, and `backlog/open.md`'s
`I81` row moves to `posted.md` when it actually reaches the feed.

## The claim, and where it came from

> "You don't sweat fat off — you breathe it out. Almost all of it leaves as the CO2 in your
> breath, not sweat, not the toilet, not 'turned into energy.'"

**Primary source:** Meerman KC, Brown AJ, *"When somebody loses weight, where does the fat go?"*,
BMJ 2014;349:g7257 (PubMed 25516540). `bmj.com` and `pubmed.ncbi.nlm.nih.gov` were both blocked by
this session's egress proxy (same class of block CLAUDE.md already records for `I15`'s Overpass
fetches), so the figures are corroborated through the paper's own quoted balanced equation and
headline numbers, repeated identically across independent secondary write-ups (ScienceDaily, an
NPR-affiliate wire story, UNSW's press release, ScienceBlog), **plus an independent from-scratch
recomputation that was never told the answer in advance** (below).

## The real algorithm — `breath.py`

The balanced equation for the average human triglyceride, quoted by the source:

```
C55H104O6 + 78 O2 -> 55 CO2 + 52 H2O + energy
```

`breath.py` builds a real C55H104O6 molecule atom-by-atom from tetrahedral/trigonal bond-angle
constraints (not an authored diagram), balances the equation with standard IUPAC atomic weights,
and attributes the triglyceride's *own* atoms (not the borrowed O2) to two buckets — CO2 vs H2O —
by tracking which product each atom ends up in:

| step | value |
|:--|:--|
| C55H104O6 molar mass | 861.431 g/mol |
| mass balance, reactants vs. products | 3357.275 g = 3357.275 g — exact to 9 significant figures |
| CO2 bucket (own-atom attribution) | 725.786 g → **84.25%** |
| H2O bucket (own-atom attribution) | 135.645 g → **15.75%** |
| published (Meerman & Brown 2014) | 84% / 16% |
| agreement | within 0.25 percentage points, from the molecular formula alone |
| per kilogram of fat lost | **840 g as CO2 (breath), 160 g as water** |

This is the r011-shape check carried into a second reel: an outside, already-published number,
re-derived independently from first principles rather than trusted on citation alone, and it holds.

**`emit_ts.py` verified 22 on-screen claims before writing the data module** — atom counts, the
55 CO2 / 52 H2O fragment split, mass conservation, the 84%/16% agreement with the published figure,
and (non-negotiable 7 / the r011 lesson) that the **840 g / 160 g counters have actually reached
their target values on screen before the beat that names them ends** (checked at 27.1s against
B10's 25.0-28.0s window). Two of these are the exact failure mode that mattered on `r011`: a claim
that is true in the data but not yet true on screen at the moment the copy makes it.

## Build traps — this build's `I51`-shape lessons

**1. A component's early `return null` before a later `useMemo` is a conditionally-called hook.**
The first pass gated `Molecule`'s visibility with `if (envelope <= 0.005) return null` placed
*before* the `useMemo` computing atom positions — invisible in the type system, but it varies
which hooks run frame-to-frame and crashed the render outright (`@react-three/fiber` internal
error, not even a React warning). Fixed by keeping the hook unconditional and gating visibility
through material opacity only. Stage 3c's own warning about conditional hook calls, and this is
exactly the shape it warned about — a gate meant to LIMIT a component's footprint instead broke
its hook order.

**2. A component that renders for the whole 37s is not "always visible", it's "always in the
way".** The first cut's `Molecule` and `O2Cloud` had no visibility envelope at all — full ball-and-
stick structure sitting behind the B1-B2 hook text and the B11-B12 close. Fixed with an opacity
envelope on both, and critically **the envelope had to match `pushAmountAt`'s own keyframes
exactly**, not an independent faster ramp — a mismatch put the molecule at full brightness while
the camera anchor was still mid-transition, which is the single worst moment for screen-space
overshoot (see trap 4).

**3. Motion and safe-area pull in opposite directions, and both audits have to be satisfied
together.** Hiding the molecule for most of the runtime fixed the overlap but dropped event
density enough to fail `reel_motion_audit.py` (a 3.0s dead spell at B2). Fixed by making the
breath cloud a continuous outward flow (puffs cycle mouth→reach→respawn on a 3.4s period, not a
fixed cluster with a small wobble) and adding a real chest-rise pulse to the person — both diegetic
motion tied to "breathing," not decoration added to satisfy a checker.

**4. A camera push that interpolates anchor and scale together has a transient overshoot, not
just two clean endpoints.** A point near the push target renders FARTHER from center mid-transition
than at either the wide shot or the full close-up — the anchor hasn't "caught up" proportionally to
the scale increase yet. This cost the most iteration: tuning `BREATH_DIR`, reach ranges, and
`MOL_TO_WORLD` down repeatedly chased the safe-area audit through several near-misses (806 → 120 →
99 → 90 → 71 → 67 failing frames) without ever reaching zero from constant-tuning alone.
**The robust fix was structural, not numeric**: the `<ThreeCanvas>` is now wrapped in a container
clipped to the exact safe box (`overflow: hidden`, sized to `SAFE_W`/`SAFE_TOP`/`SAFE_BOTTOM`),
with `ReelGround` staying outside the clip so it's still full-bleed (non-negotiable 2). This
guarantees the constraint regardless of any future animation-math imprecision, rather than
depending on getting every constant exactly right.

**5. Decorative "flavour" objects (inbound O2, the fallback destination for the 6 non-counted
oxygen atoms) can still break the safe area even though no on-screen claim depends on their
position.** The original fallback oxygen destination `[0, 46, 4]` was a 4-15x outlier against the
real CO2/H2O fragment destination norms (2.6-12.4 / 0.97-8.87) in `breath_data.json`, and scaled up
by the close-up zoom during the pull-back it sent those atoms far enough to blow past both edges.
Brought back into the same magnitude range as the real fragments.

## What is NOT claimed

- **Not** that any individual's body composition matches the paper's average triglyceride exactly
  — C55H104O6 is a representative formula for human adipose fat, and the reel says "about 84%,"
  never a false-precision "84.25%."
- **Not** disputing that the fat's chemical energy is used — "not turned into energy" corrects the
  common belief that the *mass itself* becomes or is stored as energy; the energy release and the
  mass's exit as CO2/H2O are two separate, both-true facts, and the reel is about the second one.
- **Not** claiming zero water leaves via sweat — the correction is about where the *lost mass*
  (fat) goes, predominantly the lungs, not that sweat carries zero water at all.

## Sound

Built silent, matching every reel since r003. No trending-audio decision made yet — a posting-time
step per r010's precedent, not a build step.

## Awaiting

Posting. When it ships: `CLAUDE.md`'s "Built so far" table, `brand_guide_software.md` §13,
`reel_captions_log.md`, and moving `I81`'s row from `backlog/open.md` to `backlog/posted.md`.
