# Gate 0 — `I58`, "The Sun pulls 179× harder. The Moon makes the tide."

Proposed as **r009**, 2026-09-10. Backlog id `I58` (§2 Maps and real geography → accent
`infrastructure #00D6F7`). Nothing has been built. This file and `payoff_frame.png` are the two
artefacts `CLAUDE.md` requires **before** any Python, any `.tsx`, any data module.

Chosen by the human on 2026-09-10 from an astronomy shortlist (`I58`, `I63`, `I59`, and three
proposed new ids). `I58` was preferred because a tide is the most-witnessed astronomical event
there is and because the data underneath it is public domain.

## 1. The sentence

> **"The Sun pulls on the Earth 179 times harder than the Moon does — and it's the Moon that
> moves the sea. A tide isn't about how hard you're pulled. It's about how much harder your near
> side is pulled than your far side."**

Two alternatives were put up beside it and are recorded because the reasons matter:

- **"There's a high tide facing the Moon and another on the exact opposite side — the far one is
  the water the Moon left behind."** This is the backlog row's literal subject. Rejected as the
  *sentence* because it is the framing most exposed to the accuracy trap in §7: it invites drawing
  two bulges sweeping around the Earth, which is not how ocean tides work.
- **"The person standing next to you raises a bigger tide in your body than the Moon does — about
  seven hundred thousand times bigger."** The strongest **reach** case of the three, because it
  lands inside a live argument (full-moon behaviour, lunar sleep, "we're 60% water"). Held as the
  **closing beat** rather than the sentence, so the reel ends inside an argument the viewer is
  already having.

## 2. Who does the viewer send this to, and what are they proving?

| condition | verdict |
|:--|:--|
| Personally witnessed the evidence | **Yes, strongly.** Everyone has watched a tide come in, and anyone with a tide table has seen high tide slip ~50 min later each day. |
| A dispute already running, that a non-specialist is in | **Weak for this sentence — stated plainly.** Nobody argues about the second tidal bulge or about the Sun's tide. The live argument in this space is the *body* one, which is why it is the closing beat. |
| Resolves to one repeatable number | **Yes.** "The Sun pulls 179× harder and makes half the tide." One subtraction, carried without the reel. |

**This is the concept's known weakness and it is not being hidden.** `r007` failed on exactly this
condition. The mitigation is structural: the reel opens on the paradox (conditions 1 and 3, both
strong) and closes inside the one argument that is genuinely running. If that is judged
insufficient, `I63` is the shortlist's alternative and it passes condition 2 outright.

## 3. The payoff frame

`payoff_frame.png`, from `mock_payoff.py` (PIL, ~5 min, not a render). Composed inside the
Instagram safe area, with the 270/1540 lines drawn for eyeballing only.

Two panels, the Earth drawn at identical size in both. The **PULL ON EARTH** bar is drawn to
scale — the Moon's bar is the Sun's divided by 178.7, which is why it is a hairline. The ocean is
the **equilibrium tide envelope**, `η(θ) = K(3cos²θ − 1)/2`, filled, with **one shared
exaggeration** across both panels so the 2.18× between them is the real ratio and not a drawing
choice. The exaggeration factor is printed on the frame.

Three invariants are asserted rather than eyeballed, all having shipped as bugs before: no drawn
text crosses the action rail at `x=870`, no text leaves the safe area, and **no two texts
overlap** — the last was added after the first draft collided "THE MOON" with "PULL ON EARTH".

## 4. Kill conditions — the gate's own three

| Condition | Verdict |
|:--|:--|
| The sentence needs a CS word | **No.** It has no technical noun at all: pull, sea, tide, near side, far side. |
| The payoff frame shows an object the viewer has never seen | **No.** The Sun, the Moon, the Earth and its ocean. First draft failed this — the Earth was a bare grey disc, which is the `r005` "legible but nameable by nobody" trap — and was redrawn with a real ocean and landmasses. |
| The amazement depends on understanding first | **No, and this is the load-bearing one.** The frame shows a huge pull making a small tide and a hairline pull making a bigger one. That is a visible contradiction before any explanation. Understanding *why* is the reward for staying. |

**Can the recognisable object stay on screen for the whole reel (non-negotiable 6)?** Yes. The
Earth and its ocean are present in every beat, including the closing body beat, where the same
inverse-cube law is applied to a person instead of a planet.

## 5. Numbers, and where they came from

All computed in `mock_payoff.py` from published constants (CODATA `G`; IAU/JPL masses and mean
distances). Nothing here is recalled.

| figure | value | how |
|:--|--:|:--|
| Sun's direct pull ÷ Moon's | **178.7×** | `GM/d²` each, exact |
| Sun's equilibrium tide ÷ Moon's | **0.459×** | `K = GM R²/(g d³)` |
| Moon's equilibrium tide ÷ Sun's | **2.178×** | the same, inverted |
| Lunar equilibrium tide amplitude | **35.7 cm** | as above |
| Solar equilibrium tide amplitude | **16.4 cm** | as above |
| Far bulge vs near bulge | **4.9% weaker** | exact near/far difference — they are **not** equal |
| Lunar day | **24 h 50.5 m** | from sidereal periods |
| M2, half a lunar day | **12.4205999 h** | derived; published constituent is 12.4206012 h — **agreement to 0.005 s** |
| Moon's tidal pull across a 1.7 m person | 2.93 × 10⁻¹³ m/s² | exact, stable form |
| A 70 kg person at 1 m, vs the Moon, on your body | **≈703,000×** | exact |

**The M2 agreement is the self-check that matters.** The period was derived from orbital periods
alone and landed on the independently published tidal constituent, which is evidence the constants
and the arithmetic are both right.

**Corrections to the backlog row already earned at this gate:**
- The row's headline, *"two high tides a day"*, **is not universally true.** Tides are semidiurnal,
  diurnal or mixed by location — the Gulf of Mexico gets one high a day. Any port shown must be
  named and its type stated.
- The two bulges are **not equal**; the far one is 4.9% weaker.

## 6. Licence and feasibility

**Licence: clean.** NOAA CO-OPS water levels and harmonic constituents are US Government work in
the public domain. No `r007`-style rebuild is waiting. The physics needs no licence at all.

**Feasibility: the frame is done and needed no network.** But **NOAA is refused by this
container's egress proxy** — `403` on CONNECT to `api.tidesandcurrents.noaa.gov`, recorded twice in
the proxy's own `recentRelayFailures`. That is an organisation policy denial, so it was reported
rather than retried or routed around.

This is the `I15` situation exactly: blocked in the cloud, fine on a local machine. Consequences:

- **The physics half of the reel is fully buildable here** — the tide-generating field, the two
  amplitudes, the M2 period and the body comparison are pure arithmetic.
- **The measured-record half needs one fetch run locally**, in a `fetch_tide.py` shaped like
  `i15_astar/fetch_graph.py` (real User-Agent, mirrors, cached JSON committed).
- If that never happens, the reel still stands on computed physics alone. It is weaker without a
  real gauge record, and that trade should be a deliberate choice, not a discovery at Stage 5.

## 7. Accuracy risks the build must not skate past

1. **The equilibrium tide is the FORCING, not the observed water level.** Real ocean tides are set
   by basin resonance and amphidromic systems; the two bulges do **not** sweep around the Earth
   under the Moon producing your local high tide. Drawing them doing so would be a false mechanism
   sentence of exactly the kind non-negotiable 7 exists to stop — `r001` shipped "the cafe noise
   dies here" and it was false. **The reel is about the force.** If a real gauge record appears, it
   is shown as *the ocean's response*, never as the bulge arriving.
2. **"Centrifugal force is the wrong answer" needs care and may not be said flatly.** The
   *rotating-frame* derivation about the Earth–Moon barycentre is legitimate and gives the right
   answer. What is wrong is the popular version — Earth's *spin* flinging water outward, or a
   centrifugal term that varies across the Earth. The safe and sufficient statement is the positive
   one: the Moon pulls the Earth's centre harder than it pulls the far side, so the far side is
   left behind.
3. **No port may be shown without naming it and its tide type** (see §5).
4. **The 703,000× body figure must be quoted with its distance.** It is exact for a 70 kg person at
   1 m and a 1.7 m body; the asymptotic `2GML/d³` form is invalid at that separation. A first pass
   at this number used the unstable difference-of-inverse-squares and returned garbage; it was
   redone algebraically as `4ad/(d²−a²)²`.

## 8. Open before building

- **Runtime 45–60 s** under the widened budget: hook (the 179×), the reversal, why (near-vs-far),
  the cube law, the far side left behind, the real record if it exists, the body beat, the close.
  Eight beats at ≈6.5 s.
- **Motion is the top risk, as always.** Two panels and a caption is the shape that scores badly
  (`I33`'s gate said the same). The ocean is the moving mass and must never stop — a breathing,
  bulging sea is large-area motion by construction, which is a better starting position than
  `r007`'s 16% route-draw beat. Target ≥50% event density at `--width 240`.
- **The close must be performable on the phone in hand** (r003 failed this). Candidate: "check your
  tide table — high tide is about 50 minutes later tomorrow." That is checkable in ten seconds and
  it is the Moon's clock, not the Sun's.

## 9. Awaiting

**A human yes.** Gate 0 is not mine to pass.

The question is about the **sentence**, not the picture — the r008 lesson, which cost a full build:

> **Would you say that sentence to someone?**

And the one this concept specifically needs answering, given §2:

> **Is "the Sun pulls 179× harder and still loses" worth 45 seconds when nobody is arguing about
> it — or does the body beat need to be the whole reel instead?**

Yes → build as r009. No → `I58` is parked with the reason recorded; do not repair it, pick a
different id.
