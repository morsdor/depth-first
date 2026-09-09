# r008 · `I15` — "One route across Paris. Two ways to find it."

28 s. Built 2026-09-10. Third reel through Gate 0, and the first built on
OpenStreetMap — `I15` had been deferred since 2026-09-06 because the cloud
container's egress proxy refused every OSM host. It also clears a promise r004
made to ~160 viewers.

**Sentence — RE-SPINED 2026-09-10, after the first cut failed on being watched:**

> **"Your phone doesn't aim at your destination. It spreads out in every direction
> until it bumps into it — and it checks 17,092 junctions on the way."**

The first cut was framed as a comparison of two algorithms, and the verdict was
*"I didn't understand the point. We are comparing 2 algos?"* — correct. The
question asked was "how does a maps app find a route", and an algorithms
comparison is not an answer to it.

**Gate 0 passed it anyway, because the gate question was about the picture.**
The frame was good and got an honest yes; the sentence — *"the difference between
checking 17,000 junctions and checking 1,700"* — was never tested and is not
something anyone would repeat. The lesson is in `brand_guide_software.md` §13 and
now in `CLAUDE.md`'s Gate 0 section: **ask about the sentence, not the frame.**

**Nothing was rebuilt.** Every frame was reusable; the flood stopped being
"algorithm 1 of 2" and became the answer, and A* dropped to a four-second twist.

Gate artefacts are in [`gate0/`](gate0/GATE0.md).

## The figures

Every number is output of `search.py` on a graph pulled by `fetch_graph.py`.
Nothing is recalled.

| | |
|:--|--:|
| Central Paris, drivable roads | **26,193 junctions**, 34,782 directed edges |
| Route | Arc de Triomphe → Notre-Dame, **5.2 km** |
| Dijkstra expanded | **17,092 junctions** |
| A\* expanded | **1,700 junctions** |
| | **10.1× fewer, identical route** |

`emit_ts.py` asserts the three things the reel claims, and refuses to write the
module otherwise: a route exists, A\*'s cost equals Dijkstra's, and the paths are
the same node sequence. `search.py` additionally verifies the heuristic is
admissible at every settled node by running a full backwards Dijkstra from the
goal — the exact distance-to-goal, not an estimate of it.

## Why Paris — and a hypothesis that had to be thrown away

**Manhattan was built first and measured only 3.6×.** True, but not a picture:
A\*'s "corridor" was nearly as wide as the flood. I assumed the cause was the
grid — a straight-line heuristic underestimates true road distance by up to √2 in
a lattice, so A\* should be weakest exactly where streets are square.

**Four cities, twelve matched routes each (all ≥ 2.5 km straight-line), says no.**

| city | junctions | median ratio | road ÷ straight-line |
|:--|--:|--:|--:|
| Manhattan | 13,797 | 3.5× | 1.33 |
| Delhi | 22,151 | 4.4× | 1.31 |
| London | 30,687 | 5.0× | 1.29 |
| **Paris** | 26,193 | **6.5×** | 1.31 |

**The detour factors are ~1.3 everywhere.** Manhattan's grid does not make its
roads meaningfully less direct than Paris's boulevards, so the geometry story is
dead. What moves with the ratio is graph size, which is the textbook result and
nothing cleverer: Dijkstra fills an *area* and grows with r², A\* follows a
*corridor* and grows with r, so the advantage widens as the search gets bigger.
**Paris was chosen because it measured best, and no causal claim reaches the
screen.**

## The ratio is route-dependent, and the reel says so by naming its endpoints

Within Paris alone, on named landmark pairs:

| route | ratio |
|:--|--:|
| Arc de Triomphe → Notre-Dame | **10.1×** |
| Eiffel Tower → Gare du Nord | 6.1× |
| Montmartre → Eiffel Tower | 2.7× |
| Eiffel Tower → Bastille | 1.9× |
| Arc de Triomphe → Bastille | 1.7× |

Same city, same code, **1.7× to 10.1×**. The low ones head for the edge of the
window, where the flood hits the boundary and stops growing while the corridor
still has to cross the map. **So the endpoints are on screen for the whole reel.**
"10.1×" is a fact about this route; without the names it would be a headline.

## The beats

| t | Beat | What moves |
|--:|:--|:--|
| 0.0 | The city arrives in 0.7 s | 6,539 streets, one path |
| 0.6 | **The flood — this is the answer**, in real settle order | 14,018 pixels + a white frontier band |
| 2.0 | Title rides over it: "Your phone doesn't aim. It floods the city." | handoff at 2.8 |
| 2.9 | **01 No aim at all** — cheapest-so-far first, in every direction | |
| 7.9 | Readout: 17,092 junctions checked | |
| 10.4 | **The twist: the clever version DOES aim** — and still checks 1,700 | 1,420 pixels + frontier |
| 13.8 | Readout: 17,092 against 1,700 | |
| 15.8 | The route draws — the same one, either way | |
| 16.1 | **10.1× less of the city.** The same 5.2 km route | |
| 18.6 | **03 Your phone does neither** — it looked this up | a pulse runs the route |
| 22.4 | End card | pulse continues |

**Both searches are replayed in their real settle order** — the order the run
actually committed to each junction — not a radial wipe that imitates one.

## Gate numbers

```
r008_astar.mp4  28.5s  (114 samples @ 4fps)
  median change      1.035
  longest dead spell 0.25s  (limit 1.5s)
  event density      54%          PASS
```

`npx tsc --noEmit` clean. `npm run brand:check` clean — 43 files, 12 colours,
2 easing curves, min 36px. Safe-area scrub clean: top bar, bottom bar and action
rail all empty of anything above ground brightness, once the shared `Progress`
bar is excluded (960 wide on every reel since r002, ornamental).

**54% is the highest on the account** — past r005 v5 (53%), r007 (46%), r004
(42%) and r006 (38%). It did not start there.

| beat | first cut | shipped |
|:--|--:|--:|
| Dijkstra floods | 91% | 91% |
| **A\* aims** | **20%** | — |
| route draws | 45% | — |
| the twist | 29% | — |
| end card | 21% | — |
| **overall** | **41%** | **54%** |

The flood was never the problem. **A\*'s corridor is intrinsically small** — 1,420
pixels appearing against the flood's 14,018 — so the beat that carries the reel's
actual argument was its deadest, for 6.2 s. Two fixes, both of which are the
truest thing to draw rather than decoration:

- **A bright frontier band** on both searches: the ~150 junctions each has just
  committed to. That band *is* the search frontier, and it gives the beat a
  moving mass, which is what the audit measures.
- **A pulse running the finished route** from 17.8 s, so the last ten seconds are
  a route being driven rather than a still frame.

## Traps

- **A real bug that only real data could find.** `build()` dropped any node that
  was not a *key* in the adjacency map — but a node that is only ever the
  *destination* of a one-way street never becomes one, and it is still passed to
  `heuristic()` as a neighbour. Instant `KeyError`. It survived every prior test
  because the only graph it had run on was a synthetic 40×40 lattice with no
  one-way edges. **Manhattan's avenues are almost all one-way, so it failed on
  the first real graph.** Fixed to keep any node touched as source *or* target.
- **`astar_data.json` is overwritten by every `search.py` run**, so it holds
  whichever city was measured last — during the four-city comparison it ended up
  holding *London*, in a folder whose reel is about Paris. It is now regenerated
  for the shipped route, but **it is a side effect, not the reel's source**: the
  reel reads `remotion/src/reels/data/i15_geo.ts`, which `emit_ts.py` writes.
  Check `place` before believing anything in it.
- **Overpass answers urllib's default User-Agent with HTTP 406.** It is donated
  infrastructure and asks callers to identify themselves; `fetch_graph.py` now
  does. It then returned **504** under load on a full-Manhattan bbox, so the
  fetcher tries three mirrors in order and says which one served it.
- **Endpoints must both sit in the largest strongly-connected component.**
  Central Paris has **1,526 SCCs and the largest holds 24,506 nodes (93.6%)**;
  Midtown Manhattan was far more fragmented at 1,295 SCCs with only 75.9% in the
  largest. Outside it Dijkstra correctly reports no route — bbox clipping plus
  one-ways, not a bug, and the "no route exists" assertion is the right failure.
  *(The first draft of this note carried Manhattan's figures under Paris's name.
  Numbers do not survive a change of subject; re-measure, do not re-use.)*
- **This reel pre-projects to screen integers, where r006 did not.** r006 ships
  lon/lat because it morphs between projections every frame. This graph is an
  order of magnitude bigger — 26,193 junctions against 3,475 coastline points —
  and never morphs, so degrees would be ~3× the bytes and per-frame trigonometry
  over tens of thousands of points. **The stage constants are therefore duplicated
  between `emit_ts.py` and `Astar.tsx`, and the .tsx throws on a mismatch** rather
  than silently drawing the city in the wrong place.
- **14,018 dots and 6,539 streets are ONE `<path>` each.** Remotion re-renders
  every frame; tens of thousands of DOM nodes per frame is the difference between
  a render that finishes and one that does not.
- **The map is 700×591 at y=672, and every part of that was forced.** At 810 wide
  from y=528 it ran under the step label, and 42 px ash text over a bright flood
  is unreadable. Shrinking it to 660 wide fixed the text and **cost 12 points of
  event density (54% → 42%)**, because a smaller map floods fewer pixels. Moving
  it *down* instead of shrinking it kept both — the comparison readout drops to
  y=1274 to make room.

## What is NOT claimed

**Google Maps does not run either of these at query time.** Production routing
pre-processes the network into shortcut edges and answers from that — backlog
`I16`. The reel's third beat says so outright ("Your phone does neither — it
worked the shortcuts out months ago"), because the alternative is a reel that is
spectacular and wrong about the thing the viewer asked.

The reel also never claims A\* is ten times faster *in general*, never explains
the ratio by street geometry, and never implies the flood stopped for any reason
other than the data window ending — which is why the window is drawn.

Street data © OpenStreetMap contributors, ODbL. A Produced Work may be
distributed under any terms, but the credit is not optional and is on screen for
the entire reel.
