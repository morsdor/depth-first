# r005 (I07) — what is claimed, and what was cut

## Cut: the Spotify attribution

The backlog hook for `I07` is *"True random felt broken, so Spotify faked it."* The second half is a
claim about one company's engineering decisions. **It is not in the reel**, because it could not be
verified: the container this was built in cannot reach Spotify's engineering write-ups, and
CLAUDE.md non-negotiable 7 is explicit that a mechanism sentence needs an experiment that could
falsify it. "I remember reading it" is exactly the failure mode that put *"the cafe noise dies here"*
into r001.

**To reinstate it**, someone with network access needs to find the primary source — Spotify's own
engineering blog post on shuffling — record the URL and date here, and only then may the reel name
the company. Until then the reel demonstrates the mathematics and lets the viewer draw the
conclusion, which is stronger anyway: it shows two shuffles and asks which looks random.

## Kept: everything the run proves

All figures are output of `shuffle.py` over 200,000 real Fisher–Yates shuffles of a 24-song playlist
with 6 artists, 4 songs each. Base is stated on screen.

| Figure | Value |
|:--|--:|
| Shuffles with at least two songs by one artist back to back | **95.94%** |
| …therefore shuffles that come out "clean" | **4.06%** |
| Shuffles containing a run of three | 22.18% |
| Mean adjacent same-artist pairs | 3.01 |
| Closed form for the same quantity | 3.0000 |

The closed form is the self-check. By linearity of expectation over the n−1 adjacent slots,
E[pairs] = Σ k_a(k_a−1) / n = 72/24 = 3. The Monte Carlo must converge to it, and lands at 3.0056.
If it ever does not, the shuffle is not uniform or the counting is wrong.

## Load-bearing phrasing

- **"a truly random shuffle"** — never "Spotify's shuffle" or "your app's shuffle". The measurement is
  of uniform random permutation, nothing else.
- **"less random"** for the spread arrangement is literal and provable: it is constructed to avoid
  repeats, so it cannot produce most of the permutations a uniform shuffle can. It is not a figure
  of speech.

---

## The landing-position map (`heatmap.py`) — the v5 subject

The v4 reel proved the naive shuffle is biased with a six-bar histogram and `27 ÷ 6 = 4.5`. It
failed with a viewer for a reason no pacing fix could reach: **the payoff frame visually argued
against its own caption.** The claim is "these orders are not equally likely"; the picture is six
bars of near-identical height, because the true spread at n=3 is only 1.25x. The viewer is asked to
trust text over their own eyes, and does not.

`heatmap.py` makes the same bias visible instead of arguing it. For each card, count where it ends
up, over 400,000 shuffles — an n x n table. A fair shuffle is featureless; the naive shuffle has a
bright staircase diagonal and a dark wedge. No magnitude comparison is required of the viewer, only
pattern detection, which is the one perceptual task humans are superhuman at.

| Figure | Value |
|:--|--:|
| Naive mean absolute deviation from fair | **8.34%** |
| Fisher–Yates, same sample size (the noise floor) | **0.46%** |
| Signal / noise | **18x** |
| Naive brightest : dimmest cell | 1.71x |

The Fisher–Yates map at the same sample size is the honesty control: it establishes that "flat"
is what this measurement actually produces when the algorithm is correct, so the naive pattern
cannot be an artefact of the rendering. `heatmap.py` asserts both — FY contrast under 1.10, and
naive deviation at least 10x the FY floor — and fails rather than emitting a flattering picture.

Deck size is a legibility choice, not an accuracy one: the bias runs 7.27% (n=6), 8.26% (n=13),
8.68% (n=26), 8.88% (n=52). n=13 gives 44px cells at phone size.

### Do not explain the shape of the pattern

A first draft of the mechanism sentence was "cards the loop reaches late are touched fewer times,
so they stay nearer where they started." **Measurement falsified it.** Touch count does fall
monotonically across starting positions (2.93x down to 1.38x), but mean distance moved is U-shaped
(6.00 at position 0, 3.25 in the middle, 5.48 at position 12) — the last card is touched least and
still travels far. The distance measure is confounded in any case: a card at either end of the deck
is geometrically farther from a uniformly random position than a card in the middle, whatever the
algorithm does.

So the reel explains **why a bias must exist** (the counting argument) and never **why the pattern
takes that shape**. Gate #7 in `CLAUDE.md` is what caught this: the sentence was hand-written and
plausible, and it was wrong.

### The v5 cut as built — 39 s, five beats

| Beat | Window | What is on screen |
|:--|:--|:--|
| 1 · hook | 0.0–9.0 s | Both maps fill from 60 runs to 400,000. No labels. The verdict "One of these decks was shuffled **wrong**" lands at 4.8 s, the title rides over the filling at 8.7 s |
| 2 · what you are looking at | 9.3–16.2 s | Row = where a card started, column = where it ended. "Fair means featureless." Deviation readout: 8.34% vs 0.46% |
| 3 · the bug | 16.6–25.2 s | One word. "Swap it with **any card** in the deck" vs "swap it with one you **haven't dealt yet**" |
| 4 · why it can never be fair | 25.6–34.4 s | 27 dots dealt into 6 piles; three come out taller. `EXACT_NAIVE = [4,5,5,5,4,4]` |
| 5 · close | 34.8–39.0 s | "It took 400,000 of them to see the bug — a test would never have caught it." |

Final gate, on `r005_shuffle.mp4`:

```
brand:check    35 files · 12 colours · 2 easing curves · min 36px · damping >= 200
motion audit   39.5 s (158 samples @ 4 fps)
               median change      1.035
               longest dead spell 0.50 s  (limit 1.50 s, starts 2.8 s)
               event density      53%
               PASS
```

All five end-of-beat holds are 3.2–4.2 s, clearing the 3 s reading-time rule. The staircase is
legible by 2.0 s / 16,261 shuffles, inside the 3 s hook window.

Two traps this cut hit, both recorded in `brand_guide_software.md` §13:

- **The run counter must be read off the same playhead as the pixels.** A second `interpolate` for
  the caption drifted to "393,881 shuffles" over a picture drawn from ~340,000 runs. It is now
  derived from the same `k` that indexes the snapshot array, so it cannot disagree with the image.
- **`Fade` overwrites `transform`.** Breath handed to a `Fade` via `style` is silently dropped. The
  text-only beats sat dead for 3.75 s until the breath wrapper moved outside the `Fade`.

### Still owed before posting

The `r005-shuffle-safe` composition has not been scrubbed in Studio. That is non-negotiable #1 and
it is a human gate — stills and filmstrips do not substitute for it.
