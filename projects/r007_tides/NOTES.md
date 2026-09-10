# r007 · `I58` — "The Sun pulls the Earth 179x harder than the Moon. The Moon makes the tide."

Built 2026-09-10. 54 s, §2 Maps and real geography → accent `infrastructure #00D6F7`.
Gate 0 record: [`gate0/GATE0.md`](gate0/GATE0.md). Not posted — awaiting Gate 3.

---

## What this reel is about, precisely

**The tide-raising FORCE. Not anyone's local water level.**

What is drawn is the *equilibrium tide*: the shape a frictionless global ocean would take if it
could keep up with the forcing at every instant. Real ocean tides are set by basin resonance and
amphidromic systems, they lag the forcing, and their range varies by an order of magnitude between
coastlines.

That distinction is the reel. The backlog row proposed *"two high tides a day, and one of them
shouldn't be there"*, and building that would have shipped two falsehoods:

- **"Two high tides a day" is not universally true.** Tides are semidiurnal, diurnal or mixed by
  location — the Gulf of Mexico gets **one** high a day.
- **The two bulges do not sweep around the Earth delivering your high tide.** That is the textbook
  simplification, and animating it would be a false mechanism sentence of exactly the kind
  non-negotiable 7 exists to prevent. `r001` shipped "the cafe noise dies here" and it was false.

So the reel names no port, animates no bulge arriving at a coast, and captions its own curve
*"the tide-raising force, not a gauge record"*.

## The figures, and which script produced them

Every number on screen comes from `tides.py`, from published constants (CODATA `G`; IAU/JPL masses
and mean distances) and Newtonian gravity. `emit_ts.py` re-asserts **23 claims** and refuses to
write the TS module if any is false.

| figure | value | on screen |
|:--|--:|:--|
| Sun's direct pull ÷ Moon's | **178.7×** | title, beat 5 |
| Sun's equilibrium tide ÷ Moon's | **0.459×** | beat 5 |
| Moon's ÷ Sun's | **2.178×** | beat 5 |
| lunar equilibrium amplitude | **35.7 cm** → "36 cm" | beat 2 |
| solar equilibrium amplitude | **16.4 cm** → "16 cm" | beat 1 |
| near-side pull | 3.431e-5 m/s² | beat 3 |
| centre | 3.318e-5 m/s² | beat 3 |
| far side | 3.211e-5 m/s² | beat 3 |
| residual toward the Moon | 1.128e-6 m/s² | beat 4 |
| residual away from it | 1.073e-6 m/s² | beat 4 |
| far bulge weaker by | **4.9%** | beat 4 |
| lunar day | 24.84 h | beat 6 |
| M2 | **12.4206 h** | beat 6 |
| high tide later each day | **50.5 min** → "51 minutes" | end card |
| a person at 2 m ÷ the Moon, on your body (TIDE) | **10,077×** | beat 7 |
| the Moon ÷ that person, on your body (GRAVITY) | **28,409×** | beat 7, conceded |
| a person stops out-tiding the Moon at | **37.8 m** | caption only |

### The self-check that matters

`M2` is **derived** from the sidereal rotation and orbital periods — nothing tidal goes in — and
lands on the independently published tidal constituent 12.4206012 h to **0.005 s**. Separately, the
Moon-only equilibrium curve's highs come out **12.425 h** apart, matching that derived period to
under a minute at 1-minute sampling. Two independent routes to the same number.

## What was measured and was NOT what I expected

**Adding the Sun moves the combined highs 8.5 minutes EARLIER**, not later. S2 and M2 start in
phase in this run and S2 is the faster constituent. I would have written "the highs are 12h25m
apart" by hand and it would have been wrong for the combined curve.

The reel therefore says *the Moon's part* repeats every 12.42 h — which is what M2 means — and
plots `MOON_CURVE` (Moon alone), not the combined one. `BOTH_CURVE` is emitted and unused, kept so
the difference stays visible to the next person.

**The two bulges are not equal.** The far one is 4.9% weaker. The backlog row implied symmetry.

## Traps hit, and what they cost

1. **A first pass at the body figures returned garbage.** `1/(d−a)² − 1/(d+a)²` loses every
   significant digit to cancellation once `d ≫ a`, and a bisection built on it converged to
   nonsense (it reported the crossover distance as 0.0 km). Rewritten algebraically as
   `4ad/((d²−a²)²)`. The asymptotic `2GML/d³` form is *also* wrong here — a 1.7 m body at 1 m is
   not a small perturbation — so the 702,858× figure is exact-form only.

2. **The reel failed the motion audit at 19% event density, every beat dead.** Cause: the Earth sat
   in an 800×520 panel, so at the audit's 240 px sampling width the planet was 15–40 px across —
   precisely the "a moving 15px dot is worth almost nothing" failure the reference names. Fix was
   structural, not cosmetic: full-bleed stage, `R_EARTH` 110 → 300, one rotation per 10 s instead
   of 26, and **no two consecutive camera keyframes equal**. 19% → 38%.

3. **Beats 6 and 7 stayed dead (14% and 32%) after that**, because the camera shrank the planet to
   0.43× to clear room for the panels. The panels only need the *bottom* of the frame, so the Earth
   is lifted rather than shrunk, and beat 7 now **pushes in** — the beat carrying the reel's second
   surprise should not be its quietest. 38% → **44%, PASS, zero dead time in any beat**.

4. **The filmstrip caught two things no automated check could.** The Sun was an 82 px sliver at the
   frame edge — in a reel whose entire claim is about the Sun — and beat 2 read *"same scale as the
   bar above"* while the Sun's bar had faded out five seconds earlier. Two states in sequence is not
   a relation. Both bars are now co-present: 720 px against 4 px, one picture.

5. **`remotion render` could not run at all**: it tries to download Chromium (host not on the egress
   allowlist), and once pointed at the container's own Chromium, the headless browser is not
   proxy-aware and could not fetch fonts from `fonts.gstatic.com`. Fixed by **vendoring the five
   latin-subset woff2 files** into `remotion/public/fonts` and replacing `@remotion/google-fonts`
   with local `@font-face`. Renders are now offline. TLS verification was never disabled.

## Gate 3 — first human viewing, 2026-09-10, and what it changed

Four corrections, all from watching it on a phone. None were visible to any automated gate.

1. **"The secondary text and background look the same."** Diagnosed wrong at first glance — the
   cause was not the colour but the *placement*: the reel is full-bleed by necessity (the audit
   needs the planet to BE the frame), so body copy was lying directly on the ocean. Fixed by giving
   every text block a scrim — ground at 0.88 behind the words — and moving secondary type from ash
   `#81A2C4` to bone at 0.72. Ash reads fine on the bare ground and vanishes over cyan water.

2. **"`e-6` is hard to understand by any person."** Correct, and it was a script's habit leaking
   onto the screen. `1.128e-6 / 1.073e-6` became **`100` and `95`**; `3.431e-5 / 3.318e-5 /
   3.211e-5` became **`3.4% harder` / `the baseline` / `3.2% weaker`**. Same measurements, same
   assertions, expressed against the thing the beat was already comparing them to.

3. **"The last frame doesn't need the tide table. Give relative values and a calculation."** The
   strongest note of the four, and it made the reel better rather than just clearer. The end card
   was an absolute about a prediction this reel deliberately never makes. It is now the whole
   argument as one sum:

   > The Sun is **27 million** times heavier and **389** times further away.
   > ÷ 389 twice → **179x the pull**. ÷ 389 once more → **0.46x the tide**.
   > *One extra division. That's the whole thing.*

   `tides.py` computes `mass_ratio / dist_ratio²` and `mass_ratio / dist_ratio³` and **asserts they
   reproduce the measured `PULL_RATIO` and `TIDE_RATIO` to 1e-12**, so the arithmetic shown is
   provably the arithmetic that was run, not a restatement of it.

4. **"Make text more user friendly."** *"Pull falls off as d squared. A tide falls off as d cubed"*
   → *"Move twice as far away: the pull drops 4x. The tide drops 8x."* No algebra survives on
   screen anywhere in the reel.

**The scrims cost 8 points of event density** (44% → 36%, with a 1.75 s dead spell) because a scrim
is a large static area. Readability was not negotiable, so the motion was bought back the documented
way — widening camera travel in every beat rather than shrinking the panels. **Final: 46%, better
than before the scrims.**

**What this cost the end card:** rule 9's *performable* ask went with the tide-table line. The close
is now a calculation and the Gate 0 sentence. That is a deliberate trade made by the human, and it
is worth watching in the day-1 numbers — r005's performable ask ("open a flight tracker") produced
its most-liked frame.

## Gate 3, second pass — the body beat was wrong, and it was the dangerous kind of wrong

Three defects in one beat, found by reading the frame rather than by any check.

1. **Every label said PULL, and the comparison is only true for the TIDE.** On straight gravity the
   Moon beats a person standing 2 m away by **28,409x** — the opposite result. Both facts are true;
   they are different quantities. A viewer reading "pull" plainly would have concluded the reel
   claimed a person out-pulls the Moon, which is false, and the correction would have been theirs to
   make. Both bars now say *tide*, and the reel **concedes the gravity case on screen**: *"The Moon's
   straight pull on you is 28,409x theirs. It just doesn't stretch you."*

2. **1 metre was not a physical separation.** With a 1.7 m body the near end of you sits 0.15 m from
   the other person's centre, so the point-mass formula was being evaluated deep inside its own
   singularity, and most of the 702,858x was that artefact. The ratio is brutally sensitive to it:
   702,858x at 1 m, 34,795x at 1.5 m, **10,077x at 2 m**, 2,370x at 3 m. The reel now quotes 2 m.
   The 1 m value is kept in the JSON as `person_at_1m_UNPHYSICAL` so the trap stays visible.

   **The qualitative claim was never at risk** — a 70 kg person out-tides the Moon until they are
   **37.8 m** away, which is the robust form and is what the caption uses.

3. **"Drawn to the same scale" was false on this frame.** At 10,077x the Moon's bar would be 0.07 px;
   it was drawn at a 2 px floor. (The same caption is *true* on the Sun/Moon frame, where the bar is
   4.03 px and drawn at 4.) It now reads **"too small to draw here"**, which is both honest and the
   better line.

**This is the r004 "300 roads, not 300,000" failure mode caught before shipping rather than after:**
a figure that is technically derivable but is not what a fair measurement gives. `emit_ts.py` now
verifies **23 claims**, including the two that assert the concession is true.

## Motion audit — final

```
r007_tides.mp4  54.5s  (218 samples @ 4fps, --width 240)
  median change      0.939
  longest dead spell 0.25s  (limit 1.5s)
  event density      47%
PASS
```

| beat | median | density | dead |
|:--|--:|--:|--:|
| 1 hook | 0.853 | 46% | 0% |
| 2 reversal | 0.735 | 39% | 4% |
| 3 near/far | 1.170 | 64% | 0% |
| 4 left behind | 0.891 | 43% | 0% |
| 5 cube law | 0.794 | 35% | 8% |
| 6 clock | 1.003 | 50% | 4% |
| 7 body | 0.938 | 39% | 4% |
| 8 end | 1.342 | 55% | 0% |

47% sits between r004 (42%) and r006 (49%), below I51 v5's 53%. **It was not chased further on
purpose** — density is a floor, not a target, and it cannot tell whether motion carries information.
Every beat is alive; adding drift to reach 50 would have bought a number and nothing else.

## Safe area

Verified programmatically on the plain composition, not by eye: zero content pixels above y=270,
below y=1540, or under the action rail (x≥870, y≥1050) — **excluding the `Progress` bar**, which is
960 wide and has run under the rail on every reel since r002 (`build.md` item 3, ornamental,
deliberately unchanged). Bottom panels use `PANEL_W = SAFE_W − 30`: `SAFE_W` puts the right edge at
exactly x=870, a boundary touch that glyph overhang crosses.

## What is NOT claimed

- **Not that "centrifugal force is the wrong answer."** The rotating-frame derivation about the
  Earth–Moon barycentre is legitimate; what is wrong is the popular version (Earth's *spin* flinging
  water outward, or a centrifugal term varying across the Earth). The reel makes only the positive
  statement: the Moon pulls the centre harder than the far side, so the far side is left behind.
- **Not that the sea's highs are 12h25m apart.** See above — measured, they are not.
- **Not any local tide time, range, or port.**
- **Not that the Moon has no effect on a person** — it has one, and it is 2.93e-13 m/s². The claim
  is comparative, it is about the TIDE and not the pull, and it is stated with its distance.
- **Not that a person out-pulls the Moon.** On gravity the Moon wins by 28,409x, and the reel says
  so on the same frame.

## Known weakness, carried from Gate 0

On the three-condition reach test this concept passes 1 (personally witnessed) and 3 (one carryable
number) strongly, and **2 — a dispute already running — is weak**. Nobody argues about the second
tidal bulge. The mitigation is structural: the reel closes on the body comparison at 41.5 s, which
is the one beat that lands inside an argument people actually have. **If r007 underperforms, that is
the first thing to test, and `I63` is the shortlist alternative that passes condition 2 outright.**

## Files

```
tides.py        → tides_data.json     the real computation; asserts its own invariants
emit_ts.py      → remotion/src/reels/data/tides.ts   13 claims re-asserted before writing
gate0/          GATE0.md, mock_payoff.py, payoff_frame.png
r007_tides.mp4  the render
remotion/src/reels/Tides.tsx          both compositions registered in Root.tsx
```
