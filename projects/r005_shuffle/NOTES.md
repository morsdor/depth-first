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
