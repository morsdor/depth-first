# Gate 0 — I69 · the pendulum wave

**Status: awaiting the human yes.** Sentence chosen 2026-09-10; still built; falsification run.
Nothing beyond this directory may be built until that yes exists.

## 1. The sentence

> Fifteen weights on fifteen strings, each one a little longer than the last. For a minute they
> turn into waves, then into total chaos — and then every one of them swings back into a straight
> line at the same instant.

No CS word. No word that needs defining. Nothing in it that a viewer has to be taught first.

## 2. The payoff still

`payoff_frame.png` — 4.286 s after release, the instant the row spans exactly one wavelength.
**Every bob in it is integrated, not drawn**: the script solves the fifteen lengths against the
exact nonlinear period and runs RK4 to that moment. If the finished render disagrees with this
still, one of the two has a bug.

## 3. The three kill conditions

| Condition | Verdict |
|:--|:--|
| The sentence needs a CS word | **No.** Weights, strings, a minute, a straight line. |
| The frame shows an object never seen | **No.** Weights hanging on strings from a rail. A stranger names it with the sound off. |
| The amazement depends on understanding first | **No.** You are astonished watching; the one number is the reward for staying. |

## 4. The reach test — two strong legs and one weak one, stated honestly

1. **Has the viewer personally witnessed the evidence?** *Partly, and this is the weak leg.*
   Everyone has pushed a swing and felt that a longer one takes longer — that is the whole
   mechanism. But almost nobody has stood in front of a pendulum wave; they have only seen it on
   a screen. r005's flight path scored a clean yes here and this does not.
2. **Is a dispute already running?** **Yes, and it is loud.** Every posting of this demo argues
   about whether it is real: *CGI · sped up · they're magnets · they're connected underneath.*
   That is the fight the reel walks into, and it is the reason the still says "nothing is
   connected to anything".
3. **Does it resolve to one repeatable thing?** **Yes.** *"The strings are cut so the first one
   swings 51 times a minute and the last one 65 — whole numbers, so they all get home together."*
   One sentence, carried into the argument without the reel.

**Who does the viewer send it to, and what are they proving?** To the person in the comments
saying it's fake — proving nothing is connected, and that the whole trick is fifteen lengths of
string.

## 5. The licence question

**No data source and no licence.** The reel is computed from first principles: `g = 9.80665 m/s²`
(standard gravity, CGPM 1901) and the pendulum equation. Nothing is scraped, sampled, filmed or
licensed. The physical parameters are our own design, not a copy of any particular apparatus.

## 6. Falsification — and it found something

`design.py`. The design cuts lengths from `T = 2π√(L/g)`, which is the **small-angle
approximation**. The test integrates the real equation `θ'' = −(g/L)·sin θ` with RK4 and asks
whether the row still reforms.

| Release | spread at t=60.00 s | at t=60·C | verdict |
|:--|--:|--:|:--|
| same **angle**, 15° | 6.7° | **0.0°** | line reforms |
| same **angle**, 25° | 18.7° | **0.0°** | line reforms |
| same **displacement**, 9 cm | 126.3° | 50.4° | pattern degrades |
| same **displacement**, 5 cm | 18.1° | 14.5° | pattern degrades |

**The wave is real, and the condition is release angle.** The nonlinear correction
`C = T_true/T_small` depends only on amplitude, not on length — so releasing all fifteen from the
same angle stretches every period by the *identical* factor and the pattern survives untouched,
just arriving 0.26 s late. Pull them all sideways by the same *distance* instead — which is what a
single straight lifting bar does — and the short strings start at a much larger angle than the
long ones, `C` spreads by 7789 ppm across the row, and the line never comes back.

That 0.26 s is then removable: solving each length against the exact period instead of the
approximation gives a row that reforms at **t = 60.000 s to a spread of 0.000°**, every bob within
0.0000° of its release angle. Those are the lengths the still uses — **33.6 cm down to 20.7 cm**
at a 24° release, not the 34.4/21.2 the textbook formula gives.

**What this reel must therefore NOT claim:** that any row of pendulums cut to these lengths
resolves. It resolves if they are released from a common angle. That is a real constraint on a
real build and it is the most interesting true thing the test turned up.

## 7. Verdict

Pending. **Ask about the sentence, not the picture.**
