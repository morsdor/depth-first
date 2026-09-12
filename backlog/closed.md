# Retired, killed and shelved

**Last updated 2026-09-12.**

*Ids that will not be built as written. **The rows stay forever** so old logs keep resolving and
so a dead idea is not reinvented. `RETIRED` = withdrawn; `FAILED` = killed by a gate or by its own
data; `SHELVED` = built and stopped, so the concept may still be open but the execution is spent —
read the row before rebuilding.*


## §1 · Things you touch every day — accent `data`

| Id | Hook — the line that opens the reel | What they already know | What they have never seen | On screen | Family | Added |
|:--|:--|:--|:--|:--|:--|:--|
| **I51** [RETIRED] | The obvious way to shuffle is wrong  (retired — 2026-09-10, built and never posted) | Every shuffle button you have pressed | `for i: swap(a[i], a[random 0..n-1])` has n^n equally likely runs over n! orders. For n=3 that is 27/6 = 4.5 — not a whole number, so some order MUST be likelier. Fisher–Yates shrinks the range and gives exactly n! runs, one per order | Two landing-position maps side by side from a real 400,000-run trial — where every card starts (row) vs where it ends (column). The naive map grows a bright staircase and a dark wedge; Fisher–Yates stays featureless. Deviation from fair: 8.34% vs 0.46% | Heatmap + Counter | 2026-09-02 |
*(Visual rewritten 2026-09-07 after the v4 build failed: six bars at n=3 differ by only 1.25x, so the payoff frame visually argued against its own caption. The counting argument `27 ÷ 6 = 4.5` is still the reel's proof — it is now beat 4, supporting a pattern the viewer has already seen, not the thing they are asked to read off a chart.)*
*(Added 2026-09-07 as I51. NOT a rename of `I07` — that entry is about clumping in a CORRECT shuffle and remains unbuilt. Ids are permanent, so a different concept gets a different id.)*

## §2 · Maps and real geography — accent `infrastructure`

| Id | Hook — the line that opens the reel | What they already know | What they have never seen | On screen | Family | Added |
|:--|:--|:--|:--|:--|:--|:--|
| **I15** [RETIRED] ★ | One route across Paris. Two ways to find it.  (retired — 2026-09-10, built and never posted) | Every route your phone has given you | Dijkstra expands in all directions. A\* adds one term — straight-line distance still to go — and the search collapses into a beam at the destination | Split screen on one real city graph, both frontiers expanding, node counters diverging violently | MapRoute + Counter | 2026-09-02 |
*(Hook corrected 2026-09-10. "Dijkstra checks 300,000 roads. A* checks 300" was a figure from memory and no real graph supports it. Measured on central Paris (26,193 junctions from OSM), Arc de Triomphe to Notre-Dame: Dijkstra expands **17,092**, A* expands **1,700** — **10.1x**, identical route. Manhattan was tried first and gave only 3.6x. Four cities x 12 matched routes: Manhattan 3.5x median, Delhi 4.4x, London 5.0x, Paris 6.5x. The grid-weakens-the-heuristic theory was tested and FAILED — detour factors are ~1.3 everywhere; what moves is graph size, which is just Dijkstra filling an area (r^2) against A* following a corridor (r). The ratio is also strongly route-dependent — 1.7x to 10.1x within Paris alone — so the reel names its route and never generalises. Measured by `the deleted `I15` build/`.)*
| **I53** [FAILED] | Your street is the bottom of a bowl you can't see — ❌ **FAILED Gate 0, 2026-09-10** | Every monsoon, the same junctions under water | *(claim falsified — see below)* | Real SRTM terrain, water routing downhill, the junctions the news names | MapRoute + Counter | 2026-09-02 |
*(Added and killed the same day — the first concept under the widened "how systems work" remit, and the first killed by measurement rather than judgement. Proposed sentence: "your street floods because it's the bottom of a bowl, and a satellite names the same three junctions every year." Tested on real SRTM 1-arcsec over Bengaluru (1260x1080 cells, georeference verified against published elevations) against eight junctions the city reports flooded by name, controlled on 3,000 random points in the built-up core. **All three metrics went the wrong way**: flood spots sit at the 57.4th elevation percentile of their own 1 km neighbourhood vs 47.7 for random points, have a 20.5 m rim above them vs 24.0, and LESS flow accumulation (1.23 vs 1.34 log10). Only Silk Board is genuinely in a dip. 30 m SRTM cannot see an underpass and better data is not free, so this does not improve by retrying. NOT repaired and no city shopping — testing Mumbai and Chennai until one fits is p-hacking when the causal claim is the reel. Full record in `gate0/i53_flood/gate0/GATE0.md`.)*

## §3 · What actually happens when you… — accent `languages`

| Id | Hook — the line that opens the reel | What they already know | What they have never seen | On screen | Family | Added |
|:--|:--|:--|:--|:--|:--|:--|
| **I64** [SHELVED] | The queue you switched out of speeds up  (shelved — 2026-09-10, built and stopped at Gate 3; concept still open) | Everyone has changed lanes and lost | You were never in "the slow queue" — there is one fast queue and it is not yours. One shared line at identical staffing cuts everyone's wait several-fold, and the shops that know this already did it | Two shops side by side, same arrivals and same tills: separate lanes backing up while the single snake stays short | Diagram + Counter | 2026-09-10 |
