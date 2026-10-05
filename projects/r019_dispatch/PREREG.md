# PREREG — `I90`, the batching race. Written 2026-10-05, BEFORE the road graph was fetched or any run

**Nothing in this file may be changed after a result has been seen.** If a parameter turns out to be
wrong, the run is thrown away, the change is written at the bottom under "Amendments" with the reason
and the date, and every number is regenerated — never edited in place. This is the `r011` rule
("pick the parameters BEFORE running the comparison") and the `I72` lesson ("a model that flatters
your claim is not caught by any invariant").

The claim under test is the Gate 0 sentence: *batching requests for a few seconds makes the total
wait shorter than serving one at a time.* Uber states it; we are checking it, and checking our
checker against an outside measurement.

## 1. The outside number we must agree with (read 2026-10-05)

**Bao, Gao, He, Oliehoek & Cats, "A timely match for ride-hailing and ride-pooling services using a
deep reinforcement learning approach", *Transportation Research Part C* 187 (2026) 105644 — Delft.**
Simulator calibrated on NYC TLC FHV trip records (Manhattan, Jan–Mar 2022); peak hour 8:30–8:40;
**600 one-second steps**; vehicles at a **constant 40 km/h**; passengers **cancel after 5 min**;
matching over the whole region; every strategy uses the same matching algorithm, so only *when* it
runs differs; **mean ± SE over 20 runs.** Table 1, ride-hailing, average seconds per passenger:

| Strategy | pickup | waiting to be matched | **total** | vs first dispatch |
|:--|--:|--:|--:|--:|
| First dispatch (match each request at once) | 300.7 | 1.7 | **302.4** | — |
| Batched every 5 s | 276.8 | 6.8 | **283.6** | −6.2% |
| Batched every 15 s | 252.0 | 16.7 | **268.7** | **−11.1%** (their best fixed) |
| Batched every 30 s | 245.6 | 31.1 | **276.7** | −8.5% |
| Batched every 60 s | 235.4 | 62.5 | **298.0** | −1.5% |

**Three things to reproduce — ordering and ratio, not the absolute seconds** (their demand and fleet
are calibrated to taxi data we do not have, so absolute waits cannot match):

- **O1.** First dispatch has a longer total wait than the best batching interval.
- **O2.** Pickup time falls steadily as the interval grows; the wait-to-be-matched rises with it.
- **O3.** Total wait is **U-shaped** in the interval, with an interior minimum, and a long enough
  interval gives the gain back.
- **R1 (ratio).** The best interval cuts total wait by **3%–30%** of first dispatch (theirs: 11.1%).
  **Above 30% we treat our model as suspected-biased and hunt the bug before any number is used** —
  the `r011` rule: be most suspicious when the model agrees with the story more than the literature.

**What each check does when it FAILS — fixed now, so a miss has a consequence:**

| Check | If it fails | Action |
|:--|:--|:--|
| **O1** — FD is not beaten by the best interval | batching shows no gain at any Δ | stop and investigate before any number is used; if it survives, the sentence is false as measured → back to G2 (§3) |
| **O2** — pickup does not fall as Δ grows | the matching is not exploiting the larger pool | suspect a bug in candidate construction |
| **O3** — total keeps improving out to Δ = 60 | batching costs nothing | suspect the match-delay accounting: the cost of waiting is being dropped |
| **R1 low** — best cut is **< 3%** | a small effect | **report it as small.** It is not evidence of a bug and is not hidden |
| **R1 high** — best cut is **> 30%** in ANY cell | model likely biased toward the claim | bug hunt before use. **This ceiling applies to every cell, not only the headline** — it is a bug detector, not an agreement test |

What this paper does NOT give us, and is not used for: its remark that fixed-interval batching is
"as currently implemented by ride-hailing platforms such as Uber" is the authors' statement, not
Uber's. The only claims about what Uber does come from Uber's own pages (GATE0.md §6).

## 2. The model — every free parameter, fixed now

**Region (fixed once, never revisited): lat 40.690–40.790, lon −74.020 to −73.930.** Lower
Manhattan to about 96th St, both rivers, and the near banks of Brooklyn, Williamsburg and Long
Island City. Road network: OpenStreetMap, `network_type='drive'`, largest strongly connected component.
**Travel time = length ÷ a flat speed** (no road-class table, no live traffic — Uber's page says real
matching accounts for traffic; ours does not, and says so).

**Copied from the outside paper so the comparison is like-for-like, not tuned:** 600 s of arrivals;
5-minute cancellation; 40 km/h as the headline speed; **20 runs** per cell; the interval list;
matching over the whole region; both policies use the same matching code whenever a match runs.

**Ours:**

| Parameter | Values | Note |
|:--|:--|:--|
| Riders per episode `R` | **120, 360, 1080** | arrival times uniform on [0, 600) s; locations **uniform along the road length** (a random directed edge, weighted by its length, and a random fraction along it) |
| Supply ratio `ρ = cars / riders` | **0.75, 1.0, 1.5** | half the cars available at t = 0, the rest at uniform times in [0, 600); static once available; never re-enter |
| Speed `v` | **20, 30, 40 km/h** | headline = 40 (the paper's) |
| Policy | **FD**, and batch every **Δ = 2, 5, 10, 15, 30, 60 s** | **FD is the SAME matching code run every 1 s** — the outside paper's own definition ("matching at every time step"). It is therefore "batching with Δ = 1", and ONLY the timing differs between policies. When a rider arrives alone this is exactly "the closest available car"; when no car is free, waiting riders are matched jointly the moment one appears — no separate rule to invent. |
| Matching when a batch runs | minimise the **sum of pickup times** over all waiting riders × available cars (`scipy` `linear_sum_assignment`) | rectangular allowed |
| Seeds | **0 … 19**, fixed | common random numbers: every policy sees the identical riders, cars and times |

`3 × 3 × 3 = 27` supply/demand/speed cells × 7 policies (FD + six Δ; plus the report-only `G`) × 20 seeds. A seed draws one set of rider
and car locations; smaller cells use **prefixes** of it.

**Metrics, defined now.**
- **Total wait** = (time from request to the match) + (pickup time from the assigned car's road
  distance). **A rider who cancels counts as 300 s** — so cancellations are charged, never dropped
  (dropping them would flatter whichever policy cancels more).
- **Matched-only wait** and **cancellation rate**, reported alongside.
- **"Not the closest" share:** among matched riders, the fraction whose car was **not** the nearest
  available car by road time *at the moment of the match*. FD should score **≈ 0, and is REPORTED,
  not assumed** — a clearly non-zero FD share would mean riders in one tick compete, which is the
  mechanism itself and is worth knowing.
- **Winners and losers:** per rider (same rider ids across policies), the share whose total wait is
  shorter / longer under batching, and the mean change for each group.
- **Pressure diagnostic (report-only, NOT part of any verdict):** mean waiting-to-be-matched ÷ (Δ / 2)
  per cell. The outside paper's is above 1 at Δ = 15 (16.7 s against 7.5 s), meaning its riders often
  wait several ticks because supply is tight. **Our headline cell is likely a gentler regime** — about
  3 riders per 5 s batch — so a smaller gain at Δ = 5 there is plausible and is not a bug. This column
  shows which of our cells resemble their pressure.
- **Report-only variant `G` — greedy on arrival** (the early method Uber's page describes): each
  request takes the nearest available car at once; if none is free, the next car to appear goes to the
  **oldest** waiting rider. Included only to show FD ≈ G when riders arrive one at a time. **It never
  enters a verdict** — a different matching rule would mix how with when.

**Mechanics — fixed now, not decided while coding.** Ticks fire at Δ, 2Δ, 3Δ … (not at 0). The run
continues until every rider is matched or cancelled — up to 900 s. At each tick, riders whose wait has
reached 300 s are **cancelled first** (and charged 300 s), then the match runs. Cancellations are
reported **per policy**: minimising total pickup time can strand a far-away rider until they cancel, so
batching may cancel *more* than FD, and the totals above already charge for it.

## 3. The decision rule — fixed now

**Headline cell: `R = 360`, `ρ = 1.0`, `v = 40`** — the middle of every axis, chosen by position and
not by result. **Headline interval: `Δ = 5 s`** — Uber's words are "a few seconds".

- **The sentence HOLDS as measured** iff, in the headline cell at Δ = 5 s, the paired (by seed) mean
  difference in total wait, batching minus FD, is **negative with a 95% interval that excludes 0**.
- **If Δ = 5 fails but the best Δ wins** in the headline cell, the reel may say what the data says —
  and names *that* interval — and nothing wider. It is never "a few seconds" if it was not.
- **If batching does not beat FD in the headline cell at any Δ, the sentence is FALSE as we can
  measure it and goes BACK TO G2** for the human, not quietly reworded. The beat does not ship.
- **The reel states the sweep honestly:** "in *k* of 9 supply-and-demand settings" with the three
  speeds counted separately, including the cells where batching lost. A cell where it loses is not
  hidden; it is the reason the Uber page says "a few seconds" and not "a minute".
- **The showcase episode** that the reel animates is **the seed whose headline-cell gain is the
  median of the 20** — never the most dramatic one.

## 4. Self-consistency checks (necessary, NOT sufficient — they cannot show the model is unbiased)

Every rider matched at most once; every car at most once; no match before the rider requested or
before the car was available; total = match delay + pickup; FD's chosen car is the true argmin; on
random static snapshots the assignment cost ≤ the greedy cost and equals brute force on tiny cases.
**Passing these says the code agrees with itself. Only §1 says it agrees with the world.**

## 5. Two more measurements, same discipline

- **Straight-line vs road ("closest doesn't always mean quickest" — Uber's own words).** For random
  riders and the fleet pools above: the share of riders whose nearest car **by straight line** is not
  their nearest **by road time**, and the median extra pickup if you trusted the straight line.
  Pre-stated: the region contains rivers, so we expect a non-zero share — a result of 0% would mean a
  bug.
- **The hexagon beat.** `h3` at **resolution 8** (fixed now). Report: cell count over the region,
  average edge length, and — for a fleet of 300 — the cars inside "your cell and its six neighbours"
  versus all 300. **Not claimed:** that Uber's matching searches cells this way. What is verified is
  that Uber built H3 for "pricing and dispatch"; the demonstration shows what a hexagon grid *makes
  possible*, and the narration says exactly that.

## 5b. Reproducibility of the road graph

The graph is fetched once, **cached under `projects/r019_dispatch/_cache/`** (git-ignored), and every
run reads the cache. NOTES.md records the fetch date, the `osmnx` version, node and edge counts and a
file hash — OpenStreetMap changes continuously, and the amendment rule above says every number is
regenerated, so the input has to be pinned. **Bounding-box check after the fetch:** `osmnx` 2.x takes
`bbox = (left, bottom, right, top)` = (west, south, east, north); a swapped order fails silently with
a wrong or empty map. The fetch script **asserts** every node falls inside lat 40.690–40.790 and lon
−74.020 to −73.930, and that it is not near-empty.

## 6. Amendments — in chronological order

**1. 2026-10-05, before any result existed (an edit in place, not an amendment):** review of this file
found that first dispatch was defined as greedy-on-arrival while the outside paper's is the same
matching run every step — mixing *how* to match with *when* — and left "no car free" undefined. FD is
now the same matching code at Δ = 1 s; greedy-on-arrival survives only as the report-only variant `G`.
Failure consequences for O1–O3 and R1, the pressure diagnostic, the tick mechanics and the graph
pinning were added in the same pass.

**2. 2026-10-05, still before any grid run (again an edit in place):** the fetched graph has only 5,131
junctions, and placing cars and riders ON junctions would put roughly one rider in four on the same
junction as a car — a 0-second pickup, which is not physical and would distort both policies. Positions
are now random points **along the road length** (edge weighted by length, uniform fraction along it);
a car first drives the rest of its own edge, a rider is reached after driving their fraction of theirs,
and a car behind a rider on the same edge just drives the gap. Nothing else changed.

**3. 2026-10-05, AFTER the main grid ran and BEFORE the two §5 extras ran — an addition, not a change:**
the hexagon beat gains one report-only metric: **the share of riders whose true nearest car by road
lies inside their own cell plus its six neighbours.** Reason: the narration would otherwise be free to
imply that "your cell and its neighbours" always contains your closest car, and nothing measured that.
It cannot change any verdict. It was added knowing the main grid's results, so it is flagged as such.

**4. 2026-10-05, AFTER the extras had run and shown a striking result (50.2% wrong-car share, 34 s) —
three robustness checks added knowing that result:** (A) the median beside the mean; (B) a chord-geometry
sensitivity, because the extras placed points on junction-to-junction chords while road distance uses the
true length; (C) which factor drives it — landmass labels derived from the graph and a two-way-streets
variant. They were added **because the result was good**, which is the direction that deserves the more
suspicion. They cannot touch the batching verdict; they did change the lead claim's size (34 → ~25 s)
and its stated cause (rivers → the street grid and one-way streets, with rivers rare and severe). Also
fixed in the same pass: the river-instance rule was tightened after it matched a crossing that caused no
wrong car.
