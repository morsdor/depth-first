# NOTES — `I90`, the Stage 3 research record (2026-10-05)

Everything here was produced by the scripts in this folder, against rules written **before** the
results existed (`PREREG.md`). Nothing is rounded in our favour. **Read §3 and §4 first: the result is
real and it is small, and the largest effect we measured is not the one the approved sentence is about.**

## 1. Provenance — every figure the reel may use

| Figure | Value | Source | Status |
|:--|:--|:--|:--|
| Uber's early method: "the closest available driver", which "sometimes led to long wait times for others… across a whole city… really added up" | — | `uber.com/us/en/marketplace/matching/` | verified verbatim (curl + text extraction) |
| Batching: "if we wait just a few seconds after a request"; "everyone's collective wait time is shorter"; aim is the average wait "for everyone, not just the closest pair" | — | same page | verified verbatim |
| "closest doesn't always mean quickest" — "traffic, overpasses, rivers" | — | same page | verified verbatim |
| H3 is "our grid system for efficiently optimizing ride pricing and dispatch"; hexagons have "only one distance… to its neighbors'" (two for squares, three for triangles); surge priced "by measuring supply and demand in hexagons" | — | `uber.com/blog/h3` | verified verbatim |
| Delft simulation of Manhattan: first dispatch **302.4 s**; best fixed batching interval (15 s) **268.7 s = −11.1%**; 60 s interval **298.0 s = −1.5%** | Bao et al., *Transp. Res. C* 187 (2026) 105644, Table 1 | peer-reviewed; trip-record-calibrated; **their number, not ours** | read; PDF kept out of the repo |
| Our batching run, headline cell | below, §3 | `dispatch_sim.py` → `results/grid_metrics.json`, `analyze.py` → `results/report.txt` | computed |
| Straight line vs road (robustness-checked); hexagon counts; the animation's instances | below, §4–§5 | `extras.py`, `robustness.py`, `showcase_instances.py` → `results/` | computed |

**Cut, and why:** Uber's "saves 10 years of people's time every day" (a marketing figure; no method);
"drivers ping every ~4 seconds", "a 2-second window", "DISCO / S2 / Ringpop", "1 million requests per
second" (secondary blog posts that contradict each other; no primary source).

## 2. What was built

- **Road graph** — OpenStreetMap, `osmnx` 2.0.7, fetched 2026-10-05, region fixed in `PREREG.md` §2:
  **5,131 junctions, 11,044 directed segments, 1,250 km of road**, largest strongly connected component.
  `npz` sha256 `0bca36a6…8c8e` (`_cache/graph_meta.json`). The bounding-box guard passed, and a node
  sits within 200 m of Times Square.
- **`dispatch_sim.py`** — riders and cars placed at random points **along the road length**; travel
  time = road distance ÷ a flat speed; one matching routine (`linear_sum_assignment`, minimise total
  pickup time) run at different clocks. 27 supply/demand/speed cells × FD + six intervals + the
  report-only greedy `G` × **20 seeds**, common random numbers. A full run is about 20 seconds.
- **Self-consistency** (necessary, not sufficient): optimal = brute force on 300 random small cases;
  optimal ≤ greedy; FD ≈ nearest; delay ≤ interval; and in **all 4,320 runs** total = pickup + delay
  (no cost dropped).

## 3. The pre-registered verdict, and what it actually says

**HEADLINE CELL — 360 riders, supply ratio 1.0, 40 km/h (chosen by position, not result):**

| Policy | total wait (cancels charged 300 s) | pickup | waiting to be matched | riders given a car that is NOT their closest | vs FD, paired by seed |
|:--|--:|--:|--:|--:|:--|
| FD (match every 1 s) | **143.7 ± 3.2 s** | 143.2 | 0.5 | 2.2% | — |
| every 2 s | 142.4 | 141.4 | 1.0 | 3.8% | −1.3 s [−2.3, −0.3] |
| **every 5 s** ("a few seconds") | **141.4 ± 3.4 s** | 138.9 | 2.5 | **7.8%** | **−2.3 s [−3.5, −1.0] → −1.6%** |
| every 10 s | 140.3 | 135.3 | 5.0 | 13.6% | −3.4 s [−4.8, −2.0] |
| every 15 s | 140.3 | 132.7 | 7.6 | **16.4%** | −3.4 s [−5.3, −1.6] → −2.4% (best) |
| every 30 s | 141.3 | 126.2 | 15.1 | 24.3% | −2.4 s [−4.4, −0.4] |
| **every 60 s** | **149.1 ± 2.9 s** | 119.5 | 29.6 | 33.5% | **+5.4 s [+3.1, +7.7] → +3.8% WORSE** |
| `G` greedy (report-only) | 144.5 | 144.5 | 0 | — | ≈ FD, as intended |

**Verdict under the rule fixed in `PREREG.md` §3: THE SENTENCE HOLDS AS MEASURED** — at Δ = 5 s the
paired difference is −2.27 s with a 95% interval of [−3.49, −1.05], which excludes 0.

**But the effect is small, and the pre-registered checks say so:**

- **R1 (ratio) is LOW in the headline cell:** the best interval cuts total wait by **2.4%**, against the
  Delft study's **11.1%** and a pre-registered band of 3–30%. Per `PREREG.md`: *reported as small; not
  evidence of a bug and not hidden.* **No cell exceeds 30%** (the maximum over all 27 is 9.5%), so the
  bias-toward-the-claim alarm never fired — if anything the model under-agrees with the literature.
  **Likely cause, UNTESTED:** our riders and cars are spread evenly over the road length. Real demand
  is clustered, which makes riders compete for the same few cars — and competition is what batching
  exploits. We have no trip data here and did not tune toward the paper's number.
- **O3 (the U-shape) HOLDS in the headline cell:** total wait falls to a minimum at 10–15 s and **climbs
  past first dispatch by 60 s** — the same shape as Delft's (302 → 269 → 298), at a smaller scale.
  **The reel's engineering lesson is this trade-off, not a big percentage.**
- **O1 FAILS in 9 of 27 cells — every one with plentiful cars (supply ratio 1.5).** Investigated, as
  `PREREG.md` requires, and it is real, not a bug: with cars everywhere pickup barely improves (60.1 s →
  57.7 s even at 60 s) while the waiting costs 0.5 s → 29.9 s, because riders almost never compete for the
  same car (0.2% get a non-closest car under FD). **Waiting only helps when cars are scarce.**
- **O3 FAILS in 6 of 27 cells — five scarce-supply plus the smallest, slowest supply-1.0 cell (120
  riders, 20 km/h)**; in each the best interval is the 60 s edge of our grid. The
  delay accounting is right (delay ≈ Δ/2 throughout), so this reads as *the best window moves later when
  pickups are long*, which matches Delft's own finding that the right interval depends on supply
  pressure. Not a bug; the grid just doesn't extend past 60 s.
- **Sweep at Δ = 5 s, of 27 cells:** batching **lower in 13, not significant in 5, HIGHER (worse) in 9.**
  The reel must not say "always".

**Who wins and loses (headline cell, vs FD, same riders):** at 5 s, **8.5% of riders wait ~129 s less,
74% wait ~12 s more, 17% are unchanged** (net −2.3 s). **Caution before using this:** the two runs are
different histories — a different car taken early changes which cars are free later — so the per-rider
comparison mixes the real effect with butterfly noise. The robust version is the 7.8% (at 5 s) who were
**not** given their closest car, and who wait **~94 s longer for pickup than that closest car would have
given them** — someone else takes it, and the net is a small gain.

## 4. The largest effect we found is not the batching — and its first estimate was too big

**Closest on the map ≠ closest on the road** (`extras.py`, then stress-tested by `robustness.py`, which
was added AFTER seeing the first result — `PREREG.md` §6). 360 riders, a snapshot of 300 cars, 40 km/h, 20 seeds:

| Version | riders whose straight-line-nearest car is NOT their road-nearest | extra pickup, all riders (mean / median) | among the wrong-car riders (mean / median / p90) |
|:--|--:|:--|:--|
| as first run (`extras.py`) | **50.2%** | 34.4 s / 0.2 s | 68.5 / 25.0 / 218.7 s |
| **points only on near-straight edges (length/chord ≤ 1.05) — USE THIS** | **48.6%** | **23.7 s** / 0.0 s | 48.7 / **21.5** / 118.2 s |
| every street made two-way | 39.5% | 17.0 s / 0.0 s | 43.0 / 16.4 / 109.9 s |

**What the three checks found:**

- **The share is robust (48.6–50.2%); the SIZE was inflated.** `extras.py` places a point on the straight chord
  between two junctions while road distance uses the true length; only **2.8% of edges (5.8% of road
  length)** are curved enough (> 1.05) to matter, but they sit on ramps, bridge approaches and the FDR
  and they fatten the tail: p90 falls **218.7 → 118.2 s**, the mean **34.4 → 23.7 s**. **The claim uses the
  conservative version: about 25 seconds a ride, not 34.** (The restricted run also drops legitimate
  curved roads, so it is a lower bound — but a defensible one.)
- **The mean is carried by a tail.** Among the wrong-car riders the median is **21.5 s** and the mean
  **48.7 s**; 17% lose more than a minute. "About 25 seconds a ride **on average**" is true; "every wrong
  car costs half a minute" would not be.
- **It is NOT mainly rivers.** With a landmass label derived from the graph itself (components after
  removing 163 long bridge/tunnel segments: 2,832 / 1,657 / 586 junctions), a river lies between the rider
  and the map-preferred car in only **2.9%** of the wrong-car cases. **Making every street two-way still
  leaves 39.5%** — so the bulk is the **street grid itself** (road distance on a grid behaves like block
  counting, straight-line like a ruler, and the two rank nearby cars differently) plus **one-way streets**
  (about 10 points). **Rivers are rare and severe:** across one, the wrong-car rate is **88–95%** and the
  loss **128–199 s**, but only ~1.5% of riders are in that position. The narration therefore says "blocks,
  one-way streets, **now and then** a river" — **not** "rivers" first, which would have misattributed the effect.

**Pre-stated expectation (`PREREG.md` §5) for the first run:** a non-zero share because of the rivers; 0%
would mean a bug. It was non-zero, but the *reason* it was expected turned out to be the minor one.

**Instances for the animation, chosen by rule in `showcase_instances.py` (seed 18, cars still free under
first dispatch at the rider's request time, near-straight edges only):**

| Beat | Rule | Result |
|:--|:--|:--|
| hook | the first rider, by arrival, whose straight-line-nearest car is not the road-nearest | rider 3, t = 6.7 s, 179 free cars: the car that looks closest is **928 m** away and **2:20** by road; the quickest is **980 m** and **2:02** (a modest, honest 18.5 s) |
| river | the first rider whose map-preferred car is across a river **and** is not the quickest (the first rule matched a crossing that caused no wrong car, so it was tightened before use) | rider 102, t = 146.6 s: **664 m** by straight line but **8:30** by road; the quickest car is **4:50**. **13 of the episode's 360 riders** are in this position |
| "stuck waiting" | the rider with the longest first-dispatch pickup | rider 355: a **14:00** pickup |

**The animated episode agrees with the claims it illustrates:** seed 18's own totals are FD 138.8 s, every
5 s **137.2 s** (below FD), every 60 s **141.6 s** (above FD).

## 5. The hexagon beat (H3 resolution 8, fixed in advance)

- The region's roads touch **112 cells**; the library's average cell is **0.737 km², edge 0.531 km**.
- For a fleet of 300: a rider's own cell plus its six neighbours holds **20.2 cars on average (10th–90th
  percentile 12–28) = 6.7% of the fleet.**
- **Report-only, added after the main grid and before this ran (`PREREG.md` §6):** that 7-cell
  neighbourhood contains the rider's **true road-nearest car in 97.6% of cases.**
- **Not claimed:** that Uber's matching searches cells this way. Verified: Uber built H3 "for… pricing
  and dispatch". The demonstration is what a hexagon grid *makes possible*, and says exactly that.

## 6. Limits of the model — every one is a reason to say "in our simulation"

Flat speed, no live traffic (Uber says its real matching uses traffic); demand and cars spread
**evenly** along the road, no hot spots; cars never re-enter after a trip; 10-minute episodes; a 5-minute
patience copied from Delft; no driver acceptance or refusals; no pooling; **no real Uber data of any
kind** — the fleet is simulated and must be labelled so on screen. The graph is a drive network of an
~11 km (north–south) × 7.6 km (east–west) box, not the whole city — label it on screen **"SIMULATED · NEW YORK · SOUTH OF 96TH ST"** — about 55% of the junctions are Manhattan and the rest are the near banks of Brooklyn and Queens, so the label says New York and not "Manhattan".

## 7. What is NOT claimed

- **Not** that batching is why any particular rider's last car was far — many things send a farther car.
- **Not** that Uber's batch window, solver or parameters are ours. Uber says "a few seconds".
- **Not** that the 2–3% is what Uber achieves. Delft's 11% is a different, calibrated simulation; ours is
  a deliberately plain one, and the gap is unexplained beyond the untested clustering hypothesis.
- **Not** that "first to request" is what Uber does today — its page puts it in "the early days".
- **Not** anything about surge *prices*: only the verified mechanism (supply and demand measured per hexagon).

## 8. Traps hit, so the next build does not

- **Provenance of the label: this reel was built as `I85` / `r016` and renumbered `I90` / `r018` at integration (2026-10-05), then `r019` the same day by the owner: `I87` (the garbage patch) had claimed `r018` when its build started on 2026-10-04.**
  The build ran on a checkout 18 commits behind `origin/main` and claimed the next numbers it could see. By the time it was
  pushed, origin had already posted `r016` (`I85`, the EV motor) and `r017` (`I86`, Everest). Ids are never reused and posted
  reels cannot move, so this unposted build moved. **`git fetch` and read `origin/main`'s `backlog/` before minting an id or
  claiming a reel number** — the claim rule only works across machines if the claim is visible. Nothing in the pixels carries
  the number, so the render was not redone.
- **A lead claim's SIZE can be an artefact even when its direction is real.** The 34 s was inflated by
  placing points on junction-to-junction chords; the share barely moved (50.2 → 48.6%) but the cost fell by a
  third. Re-run the headline with the geometry made honest *before* it reaches a script.
- **"Why" has to be measured, not assumed.** Rivers were the expected cause and are 2.9% of it. The first
  river-instance rule matched a crossing where the map-preferred car was also the quickest — a river that
  caused no wrong car. Ask what an example must demonstrate before writing the rule that finds it.

- **Junction placement made ~1 rider in 4 share a junction with a car** (0 s pickups on a 5,131-node
  graph). Caught by reading the code before the first run; fixed to road-length placement and logged in
  `PREREG.md` §6. Always ask what the *smallest possible* ETA is.
- **First dispatch was defined as greedy-on-arrival**, which mixed *how* to match with *when*. Caught in
  review of the pre-registration; FD is now the same matching run every second, as in the paper.
- **`osmnx` 2.x bbox order is `(west, south, east, north)`**; a swap fails silently. Asserted.
- **`ugrep` chokes on `.{0,90}` regexes** — use Python for text search. The Uber blog URL returns **HTTP
  406** to a bare User-Agent; a browser UA works.
- **A fetch tool that summarises is not a quote.** Two phrases were first seen through one and re-checked
  against the raw page before being used.

## 9. Reproduce

```bash
.venv/bin/python projects/r019_dispatch/fetch_graph.py          # ~2.5 min, network; pins _cache/nyc_drive.npz
.venv/bin/python projects/r019_dispatch/dispatch_sim.py --selftest
.venv/bin/python projects/r019_dispatch/dispatch_sim.py         # ~20 s
.venv/bin/python projects/r019_dispatch/analyze.py | tee projects/r019_dispatch/results/report.txt
cd projects/r019_dispatch
../../.venv/bin/python extras.py              | tee results/extras.txt
../../.venv/bin/python robustness.py         | tee results/robustness.txt   # chord, median, one-way vs river
../../.venv/bin/python showcase_instances.py | tee results/instances.txt    # the on-screen examples, by rule
```

The showcase episode for the reel is the **median-gain seed, 18** (`results/showcase_headline.json`),
fixed by the rule in `PREREG.md` §3 — not the most dramatic one.

## 10. The build (2026-10-05)

**Stack.** Remotion 4.0.512 + `@remotion/three` for the map (roads as line segments, water as tinted polygons, cars as discs,
routes as flat ribbons, H3 cells as outlines and fills); beat 5 is **flat SVG on purpose** — two panels read side by side, and
a tilted camera would cost legibility. The camera never moves, a wrapping group does (`lib/geo3d.ts`), and HTML labels ride
on 3D objects through a projector that reproduces the same matrix maths. **The 3D shot that only exists because this is 3D:**
the camera drops from the whole city to one street and its one-way arrow (beat 3), and the hexagon grid blooms outward
across real ground (beat 2).

**The voice is the master clock.** `emit_ts.py` derives every cue from `vo_words.json`; `Dispatch.tsx` contains no
hand-typed second. 27 on-screen claims are asserted before the data module is written (the contract in `SCRIPT.md`).

**Provenance of the drawn world.** Streets: OpenStreetMap (ODbL), true geometry simplified to 2 m; water: OSM coastline
polygonised, a face with road junctions in it is land and a large one without is water; hexagons: the real `h3` library at
resolution 8. Every route on screen is rebuilt edge by edge on that geometry and **asserted equal in length to the distance
the simulation charged** (`episode.py`). The fleet and riders are simulated and labelled so from the first frame.

**Traps hit, so the next build does not.**
- **A hook inside conditional JSX** (`useMemo` in a branch) changes hook order between frames. All geometry hooks are
  unconditional at the top of `Scene`.
- **No river was visible at the river beat.** A map of an island with no water cannot show a river; the first still caught it.
  Coastline + a land/water classification by "does the face contain road junctions" fixed it in one pass.
- **Labels collided with the persistent tag** four times (H3, the 7% pill, the 49% block, the clocks) because the tag owns
  y 285-345. Any label in the map window starts at y >= WIN.y + 100.
- **Thumbnails lie about scale.** A contact sheet made the beat-6 hexagons look 3x too big; the full-size frame showed the
  camera was right. Read the real frame before debugging a camera.
- **A single wrapped number** ("≈ 25 s" broke onto three lines) — a block anchored by `translateX(-100%)` shrinks to the free
  width; anchor with `right` and `white-space: nowrap`.
- **The voice sat +45 ms late in the MP4, on every word.** Re-aligning the audio *pulled back out of the render* found a constant, not
  drift: AAC encoding adds 2112 samples of priming (44 ms at 48 kHz) and this container does not hide it with an edit list.
  `emit_ts.py` now adds `AAC_PRIMING_S` to the cues. The denoiser separately delays the audio 25 ms (trimmed in `vo_clean.wav`), and
  `<Audio startFrom>` takes whole frames, so the lead-in trim is `26 / 30` s, not a round number of seconds.
- **Two rulers on screen at once.** The race card (20-run averages) showed over the episode's own counters. Counters now fade while
  the card is up, the card sits clear of the caption, and each average carries its own label (AT ONCE / 5 s WAIT / 60 s WAIT).

**Final render, measured on the exact file (2026-10-05).** `r019_dispatch.mp4`, 1080x1920 h264 crf 22, 55.1 MB, **80.55 s**.

| Check | Result |
|:--|:--|
| Motion audit (default width 240) | **PASS** - longest dead spell 1.25 s (limit 1.5), event density 46%, median change 0.877 |
| Safe-area audit | **PASS** - 2,415 frames, worst box x 60..868, y 288..1524 inside x 60-870 / y 270-1540 |
| Word sync (`sync_check.py`, audio re-extracted from the mp4 and re-aligned) | **OK** - 222 words, median +1 ms, mean abs 4 ms, p95 20 ms, max 21 ms (one frame = 33 ms) |
| Loudness | **-16.13 LUFS**, true peak -4.47 dBTP - headroom left for the owner's background music |
| `tsc`, `brand:check` | clean at the last run before the render |

**Not verified by a machine, and the reason GATE 5 exists:** whether the pacing of 222 words in 80 s reads as comfortable, and
whether the captions are in the right place on a real phone. Both need the owner watching with sound.

