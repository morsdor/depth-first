# r011 · `I71` — the one that started a hair's width away

**Built 2026-09-11. NOT POSTED — at GATE 5.** 12.0 s · 360 frames · 2.7 MB.
Accent `#FF4D4D` (`failure`, §6). **FIRST REEL IN THE LOOP FORMAT.**

- Gate 0, the send test, and the pre-registered metric: [`gate0/GATE0.md`](gate0/GATE0.md)
- The approved script: [`SCRIPT.md`](SCRIPT.md)
- [`chaos.py`](chaos.py) → [`dump_data.py`](dump_data.py) → [`emit_ts.py`](emit_ts.py)
  → `remotion/src/reels/data/divergence.ts` → `remotion/src/reels/Divergence.tsx`

## Why this reel exists, in one paragraph

Every reel r001–r010 ran 28–54 s — **too long to watch twice by accident.** A 12 s loop watched
twice is 200% watch time, and watch time is a confirmed ranking input. **The runtime is the
experiment.** Judge it on **average watch time ≥ 100% of runtime**; sends are expected to be ~0 and
that falsifies nothing. Full reasoning in `gate0/GATE0.md` §4, including the honest admission that
by the letter of GATE 3 this should not have been built.

## The physics, measured

Classic double-pendulum equations, RK4 at dt = 1/2000 s, `g = 9.80665 m/s²` (CGPM 1901).
**No data source, no licence question, no random term anywhere** — the only difference between the
two runs is one perturbation at t = 0.

| | |
|:--|:--|
| perturbation | **70 µm of arc** = 0.004011° — one human hair (cited range 17–181 µm) |
| pixel-identical until | **3.28 s** (tip separation < 1 px at 190.3 px/m) |
| unmistakably two | 4.45 s (20 px) |
| unrelated | 6.16 s (150 px) |
| **λ, largest Lyapunov exponent** | **1.606 /s** — fitted on the clean growth phase |
| **error doubling time** | **0.431 s** |
| energy drift | **3.5 × 10⁻¹¹ of MgL** — the invariant |

`emit_ts.py` asserts all 12 on-screen claims and refuses to write the data module if one fails.

### Chaos is not a property of the pendulum — it is a property of the energy

Same one-hair nudge, 20 s, varying only the release angle:

| θ₀ | energy above rest | apart after 20 s | λ |
|:--|:--|:--|:--|
| 20° | 1.8 J | 0.10 mm | none |
| 45° | 8.6 J | 0.17 mm | none |
| 70° | 19.4 J | 0.22 mm | none |
| 90° | 29.4 J | 1.9 m | 0.59 |
| 110° | 39.5 J | 2.1 m | 1.18 |
| **135°** | 50.2 J | 1.7 m | **1.61** |

**Swung gently, a double pendulum is perfectly predictable.** The transition sits between 70° and
90°, near the energy at which an arm can first flip over the top. 135° was chosen because it has
the largest λ, and therefore the earliest split — this is why the reel is 12 s and not 25 s.

## Audits

```
motion   median 1.233 · longest dead spell 0.25s (limit 1.5) · event density 69%      PASS
safe     360 frames · bbox x 60..868  y 552..1488 · NO bleed exemption needed          PASS
lint     eslint + tsc + brand:check                                                     PASS
```

69% against r004's 42%, r006's 49%, I51 v5's 53% and r010's 61%. There is no still frame anywhere.

## Why 3D, and why the camera is nearly orthographic

3D is the default (CLAUDE.md 2026-09-11), and that rule carries a limit: **it must never cost
legibility.** A double pendulum swings in a *plane*, and this reel rests on a separation measured in
**single screen pixels** — so perspective is the one thing that must not happen. Foreshortening
would distort the traces and quietly corrupt the number the copy quotes.

So the camera sits far back behind a narrow lens (**FOV 12° at z = 48**), orthographic to well under
a pixel across the scene's depth, and the third dimension is spent entirely on **material**: the
bobs are lit spheres, the arms are cylinders. That highlight is the whole reason this is 3D.

## Traps

1. **A sign error put the pivot 150 px right of where it belonged.** `PIVOT_X_M` is already the
   offset *from* frame centre *to* the safe centre — negative, because x 465 is left of 540 — and
   the group was positioned at `-PIVOT_X_M`. The pivot landed at 615, and the traces ran into
   Instagram's action rail on **all 360 frames**. It typechecked, it passed brand:check, and it
   looked entirely plausible in a still. **Only the frame audit caught it.**
2. **Failure red as the ground glow.** `<ReelGround accent={FAIL} />` washes the whole frame red for
   the whole reel, which is exactly the decorative use `tokens.ts` says destroys the accent. The
   ground is now `ASH`; red exists on one object, from one beat.
3. **Lit-only material dragged bone to a dull tan** — a colour not in the palette at all. Fixed by
   carrying `emissive` at ~0.5 alongside a high ambient, so the brand hue survives and the
   directional light only adds the highlight.
4. **The metadata lied about its own sample rate.** `chaos.run` logs at 200 Hz, so `HZ = 120` gave a
   step of `round(1.667) = 2` — 100 real Hz — while `META.hz` still said 120. Caught by an
   `emit_ts.py` assertion on the frame count; `HZ` is now asserted to divide the log rate.
5. **An assertion that was wrong rather than a datum that was wrong.** `|θ| < 4π` failed on a
   perfectly physical run, because pendulum angles wind up without limit as the arms rotate. The
   real geometric invariant is that the tip never leaves the arms' reach, and that is what is
   asserted now.
6. **The Lyapunov fit ran through the saturated tail** and returned λ = 0.99 instead of 1.61.
   Exponential growth stops when separation fills the system — the two tips cannot exceed 4 m apart
   — after which separation just sloshes. The fit is now cut at the first crossing of 10% of span.
7. **The energy check divided by zero.** Drift was normalised by E₀, and total energy of this system
   is **exactly zero** at θ₀ = 90°, so a clean run reported a relative drift of `1.0e+05` and looked
   like a broken integrator. Normalised by `M·g·L` now.
8. **"IDENTICAL FOR 3.3 SECONDS" was false and nearly shipped.** They were never identical — they
   differed by 70 µm from t = 0, and 3.28 s is when the gap crosses **one screen pixel**, a display
   threshold rather than a physical one. Non-negotiable 7 caught it *at the script stage*, which is
   the cheapest place it has ever been caught. The copy reads **"YOU COULDN'T TELL THEM APART."**
9. **Bob radius is capped by the safe width, not by taste.** At r = 0.155 m exactly two frames of 360
   crossed the rail by 2 and 4 px. Shrinking the bob rather than widening the lens was deliberate:
   `PX_PER_M` must stay equal to `META.pxPerM`, or "one pixel of daylight" stops meaning what
   `emit_ts.py` asserted. **Never fix a layout problem by changing the scale a claim is measured in.**
   That cost motion density (84% → 61%), recovered to 69% by widening the traces instead.
10. **A JSX comment as the first thing inside `return (`** is a second root element. One line, and it
    took the whole render down.

## What this format breaks, deliberately

- **Non-negotiable 5 (read → animate → hold).** No hold, no reading time; 12 s of continuous motion.
- **Non-negotiable 9 (end on a reason to follow).** **An end card kills a loop.** There is none.

Both were flagged at G4 and approved knowingly. 1, 2, 3, 4, 6, 7, 8 are honoured.

## At upload

**Add trending audio in the Instagram composer.** Built silent like every reel since r003; for this
format sound is probably load-bearing, and trending audio is one of Instagram's own listed ranking
inputs. Free, and the reel stays at ₹0.

## Render

```bash
cd remotion && npx remotion render r011-divergence \
  ../projects/r011_divergence/r011_divergence.mp4 --codec=h264 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

Safe-area audit: `reel_safe_audit.py` **fails open here** — see `scripts/reel_safe_frames.py` and
`projects/r010_phantom_jam/NOTES.md`. This reel needs **no** `--bleed` exemption.
