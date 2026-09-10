# r010 · I69 — fifteen weights, and the thirty seconds they take to come back

**Built 2026-09-10. 34 s. Not posted — Gate 3 (watch it end to end) is outstanding.**

**Rebuilt the same day from a 60 s cycle to a 30 s one.** The 60 s cut passed every gate and every
audit and was then watched by a human, whose first question was *"first frame says 15 weights, are
they all different??"* — see "The rebuild" below. Everything in this file describes the 30 s build.

The Gate 0 sentence, human-approved:

> Fifteen weights on fifteen strings, each one a little longer than the last. For a minute they
> turn into waves, then into total chaos — and then every one of them swings back into a straight
> line at the same instant.

The reel now takes thirty seconds rather than a minute, and never says "chaos" — see *What is NOT
claimed*. Both departures from the approved sentence are deliberate and recorded.

## The figures, and where each came from

Everything below is produced by `simulate.py`, which integrates the real equation
`θ'' = −(g/L)·sin θ` with RK4 at dt = 1/600 s. `emit_ts.py` refuses to write the data module if
any of them stops holding.

| Figure | Value | Provenance |
|:--|--:|:--|
| pendulums | 15 | design |
| cycle `τ` | 30 s | design — see "The rebuild" |
| swings in the cycle | 26 … 40 | design — consecutive integers is the whole trick |
| the same, per minute | 52 … 80 | `2N` |
| string lengths | 32.351 cm … 13.668 cm | `L = g(τ/N)²/4π²/C²` |
| length ratio | **2.367** | measured — this is the number the rebuild was for |
| neighbour gap | 2.35 cm (long end) … 0.71 cm (short end) | measured |
| release angle | 24° | design |
| nonlinear correction `C` | 1.011078 | exact period by AGM |
| reform error after 30 s | **0.000000°** | RK4, worst of the fifteen |
| one full wave across the row | 2.143 s | `τ/(COUNT−1)` |
| most scrambled | 13.40 s, λ = 2.24 pendulums | max raggedness outside the degenerate comb |
| antiphase comb | 15.00 s | `τ/2` — the *ordered* state that looks worst |
| run length | 34 s (1020 frames) | holds 4 s past the reform |

`g = 9.80665 m/s²` (standard gravity, CGPM 1901). **No data source and no licence** — the reel is
computed from first principles.

## The rebuild — why 30 s and not 60

At a 60 s cycle the whole numbers have to be `N = 51…65`, and consecutive integers that high are
close together: the strings come out **33.63 cm … 20.70 cm, a 1.62x spread**. On a phone that is
fifteen identical strings, and the reel's central visual claim — *only the strings differ* — is
invisible. The viewer's question was exactly that.

At a 30 s cycle the same fifteen consecutive integers are `N = 26…40`, and the spread is
**2.37x — 32.35 cm … 13.67 cm**. Obviously different, with no caption.

**The generalisable form: for a harmonic row the extreme ratio is `N_max / N_min`, so lowering the
fundamental buys contrast for free.** The cycle length had been chosen as a runtime and was
silently deciding legibility.

Three of the four notes on the 60 s cut were answered by that one change:

| note | resolution |
|:--|:--|
| "are they all different??" | 1.62x → 2.37x spread |
| "does video have to be 1 min long" | 34 s, payoff at 30 s |
| "first frame doesnt bring any question/hype" | hook is now a **promise + a clock**, not a label |
| "it zooms on shorter string" while the text names the longest | camera keyframes retimed, and `check_annotations.py` now asserts the named bob is on screen |

The fourth note — *"should we also mention other variables like weight?"* — became beat 4.

## The beats

| # | window | says | carries |
|--:|:--|:--|:--|
| 1 | 0.0–5.0 | REMEMBER THIS ROW OF WEIGHTS. / In 30 seconds it comes back. | camera 1.10 → 1.00 |
| 2 | 5.0–10.0 | Nothing joins them. Nothing controls them. | the clock takes the amber |
| 3 | 10.0–15.5 | Every weight is identical. Only the strings. | five length labels on the ropes + the range callout |
| 4 | 15.5–20.5 | Only one of these changes the timing. | `length / everything`, `weight / nothing`, `how far you pull / +1.1%` |
| 5 | 20.5–25.0 | The longest string swings 26 times in 30 seconds. | the design equation → 32.4 cm, camera on the long end |
| 6 | 25.0–29.4 | The shortest one swings 40 times. | the same equation → 13.7 cm, camera on the short end |
| — | 29.4–31.2 | *(no words)* | wide, locked, the row reforms at 30.000 |
| 7 | 31.2–34.0 | Whole numbers of swings — so they get home at once. | "More systems that look designed and aren't." |

The camera is **wide and locked from t = 29.4**, so the reform is never caught mid-move. The run
continues to 34 s, so the closing card plays over the row peeling apart again.

## What the falsification test changed

The obvious design cuts lengths from `T = 2π√(L/g)`, the small-angle approximation. Integrating
the real equation says that row reforms **0.33 s late**, and the payoff frame would have been wrong.

The correction `C = T_true/T_small` depends only on amplitude, **not on length**, so a common
release *angle* stretches all fifteen periods by the identical factor and the pattern survives
untouched. Solving each length against the exact period instead removes the 0.33 s: the row
reforms at t = 30.000 s to 0.000°.

**Release from a common *displacement* destroys it.** A single straight lifting bar pulls every
bob sideways by the same distance, so short strings start at a much larger angle than long ones,
`C` spreads by 10368 ppm across the row, and the line never comes back (48.5° of scatter). Full
table in `gate0/GATE0.md` §6.

**The reel prints the corrected equation**, `L = g·(30 s / N)² / (4π² · 1.0111²)`. The textbook
form would print 33.07 cm beside a rope labelled 32.4 cm. `emit_ts.py` asserts that the expression
on screen reproduces all fifteen lengths to 0.005 cm, and separately that dropping `C` would
change the answer by more than 0.5 cm — so the term cannot quietly become decorative.

## What is NOT claimed

- **That the row ever becomes chaotic.** It does not. The phase is linear in `n`, so the bobs
  always lie on a sampled sinusoid; what looks like chaos is spatial *aliasing* once the
  wavelength drops below two pendulums. Peak raggedness is at `τ/2 = 15 s`, the perfectly
  *ordered* antiphase comb. **The reel never characterises the middle at all** — it lets the frame
  look like a mess and says nothing about it. Only the caption describes it, and only as what it
  looks like.
- **That any row cut to these lengths resolves.** It resolves *if released from a common angle*.
- **That 26 swings are complete before 30 s.** The on-screen counter reads "25 of 26" at 29.9 s
  because only 25.9 are done. Counting toward the total rather than up is what keeps the ticker
  and the closing line from appearing to contradict each other.
- **That weight has a small effect.** It has none: mass appears on both sides of
  `m·L·θ'' = −m·g·sin θ`. The table row says `nothing`, which is the strong claim, and it is exact.

## The build

```
layout.py          apparatus geometry in 1080x1920 reference px — SHARED, see below
camera.py          camera keyframes + an analytic model of what they point at
simulate.py        → pendulum_data.json      1021 frames x 15 angles, self-asserting
design.py          the falsification test; prints the angle-vs-displacement table
emit_ts.py         → remotion/src/reels/data/pendulum.ts   facts, geometry, camera
scene_pendulum.py  → remotion/public/manim/i69pendulum/    1020 transparent PNGs, 1350x2400
check_annotations.py   every drawn box, cleared before rendering
Pendulum.tsx       → r010-pendulum / r010-pendulum-safe
```

The 1020 PNGs are **155 MB and gitignored** (`.gitignore:55`), so a clean checkout has to
regenerate them before `r010-pendulum` will render:

```bash
python3 projects/r010_pendulum/simulate.py
python3 projects/r010_pendulum/emit_ts.py
MANIM_W=1350 MANIM_H=2400 python3 scripts/manim_render.py \
    projects/r010_pendulum/scene_pendulum.py Pendulums i69pendulum
python3 projects/r010_pendulum/check_annotations.py
cd remotion && npx remotion render r010-pendulum \
    ../projects/r010_pendulum/r010_pendulum.mp4 --codec=h264
```

Re-running `simulate.py` → `emit_ts.py` from scratch reproduces `pendulum.ts` byte-for-byte.

**Manim renders the pendulums; it does not animate them.** The angles are read frame-by-frame from
the integration. Rendering the 34 s run takes ~21 s at ~50 fps; the PNGs are ~149 KB each.

The layer is rendered at **1350×2400 — 1.25× the composition** — so the Remotion camera has
somewhere to push into without going soft. The camera lives in `camera.py` and ships through the
data module, so retiming it costs a Remotion render rather than 21 s of Cairo — **and so that the
annotation clearances are checked against the camera the reel actually uses.**

`scene_pendulum.py` asserts that **every bob on every one of the 1020 frames** stays inside the
Instagram safe column. Checking a single frame is not enough — the widest instant is not the one
that happens to be on screen when you look.

## Placing text over a moving apparatus

The 60 s cut was called "very blank", and the fix is text over the apparatus — a placement problem
with fifteen bobs sweeping through the frame for the whole runtime. It was solved analytically
rather than by rendering and looking.

`<ManimLayer>` stretches the 1350×2400 render across a 1080×1920 div, so **inside the camera div
one reference pixel is one composition pixel at any camera scale** — which is what lets a plain
HTML `<div>` sit on a string Manim drew. `layout.py` is imported by both `scene_pendulum.py` and
`emit_ts.py`, so the scene and the annotations cannot disagree about where anything is. (The
extraction was verified a no-op: the refactored scene renders **bit-identical** frames, maxdiff 0.)

`check_annotations.py` then asserts, for every box in `Pendulum.tsx`:

1. it clears every string and bob, for the whole beat it is on screen (tightest box: 17.0 px);
2. it is inside the Instagram safe area;
3. it does not overlap any other box that shares screen time;
4. and for the two beats that name a specific pendulum, that bob is on screen throughout.

Three real defects, all caught before rendering. **The clear region is a wedge, not a rectangle** —
a bisection probe of a block starting at y = 462 measured its floor against its right edge:

| right edge x | clear down to y |
|--:|--:|
| 520 | 655 |
| 560 | 624 |
| 600 | 592 |
| 700 | 514 |

Every box is sized against that profile. The other two: a bob clipped at x = 1098 on a proposed
camera keyframe, and the range callout overlapping the `n=8` length label by 86×27 px — which the
apparatus check structurally cannot see, and which is why check 3 exists.

**The limit of the method, found the hard way:** it checks the box you declare, not the box you
draw. The variables table was cleared at 36 px and rendered at 40 px because it reused the
readout's `<Row>` component and inherited its size — the label ran into the value and the block
stood 26 px taller than the verified box. A filmstrip caught it in five seconds. `<Row>` now takes
an explicit `size`.

## Motion

`scripts/reel_motion_audit.py` at its default `--width 240`:

```
median change 3.36 · longest dead spell 0.00s · event density 99%   PASS
```

Per beat: seven of eight at **100%**, the hook at 95%; medians 2.74–4.61. Benchmarks: r004 42%,
r005 v5 53%, r006 38%, r007 46%, r008 54%, r009 (tides) 47%, and the shelved `I64` queue build 65%.

**That number should be read with suspicion, not pride.** The queue build scored the best in the
repo at 65% and the verdict on watching it was "the output is not sound" — the audit counts pixels
changing, not whether a stranger can name what they are seeing. The reason this reel scores so high is not
craft: fifteen large bright bobs never stop moving for the entire 34 seconds. Read it as "the
metric is saturated and no longer discriminating".

`scripts/reel_safe_audit.py` reports content outside the safe area at 22 sample times. **Checked,
and intended**: it is the apparatus bleeding past the side margins under camera push, which is
composition, not a bug. Every piece of *text* is inside — the readout's ink ends at x = 866 and
Instagram's action rail begins at x = 870. That tool is a report, not a gate.

## Traps found while building

- **Manim does not keep `frame_height` at 8 for a tall canvas.** It holds `frame_width` at the
  16:9 default and grows `frame_height`, so unit constants silently render at a third of their
  intended size. The layout is written in 1080×1920 reference pixels and converted at run time.
- **Rod direction vectors must be unit vectors.** Building them through the px→unit converter
  multiplies by `u` a second time and parks every bob on the rail.
- **`scripts/manim_render.py` never cleared its work directory** (fixed). Manim appends into
  `media/images/` and never prunes, so a re-render producing fewer frames left the previous run's
  tail behind and the frame lookup shipped a mix of the two.
- **`manim_render.py` replaced the subprocess environment** (fixed), so env-parameterised scenes
  silently ignored their parameters.
- **No LaTeX in `.manimenv`** — `latex`, `pdflatex` and `xelatex` are all absent, so `MathTex` is
  unavailable. The design equation is typeset in Remotion HTML/CSS instead, which is also why it
  can be asserted against the data.
- **A `TracedPath` comparison needs a warm trail.** A probe render started cold showed maxdiff 158
  against the reference and looked like a regression; re-probed from 0.6 s earlier so the trail had
  history, it was maxdiff 0.
- **A bob reappeared *below* the readout** during the short-end push at t = 27 — the longest
  string hangs 400 px past its pivot and the scrim stopped at y = 1576. The scrim now runs to the
  bottom of the frame.
- `np.ptp` was removed in NumPy 2.0 — same bite as the `I64` queue build.
