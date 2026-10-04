# `I87` — Stage 3 research record

Started 2026-10-04, after GATE 2 and GATE 3 passed. Everything here is reproducible from the three
scripts beside this file. The drifter cache (~1.2 GB) lives in the session scratchpad, never in the
repo: `python3 fetch_drifters.py` rebuilds it in ~20 s.

**Network note.** From the cloud container, nature.com, PMC, NOAA's own sites, ourworldindata.org
and the van Sebille PDF are all blocked. **NOAA's drifter archive on AWS open data is not**, which
is the one source the build depends on. The paper figures below are therefore **search-level**
(abstracts, press releases, secondary summaries) until the PDFs are read on the Mac. Each is marked.

---

## 1. The claim — what the papers say

| Figure | Value | Base | Source | Status |
|:--|:--|:--|:--|:--|
| Floating plastic in the patch | ≥ 79,000 t (45–129 kt) | the patch, survey 2015 (vessels) + 2016 (aerial) | Lebreton et al., *Sci. Rep.* 8, 4666 (2018) | search-level |
| Patch area | 1.6 million km² | same | same | search-level |
| **Fishing nets** | **≥ 46% of the mass** | **same** | same | search-level |
| Nets + ropes + lines ("type N") | 52% of mass | same | same, via secondary summary | **search-level, needs the table** |
| Hard plastic, sheet, film ("type H") | 47% of mass | same | same, via secondary summary | **search-level, needs the table** |
| Pieces < 5 mm | 8% of mass, 94% of the 1.8 trillion pieces | same | same | search-level |
| Debris > 5 cm | > 75% of mass | same | same | search-level |
| Patch centre | oscillates around **32°N 145°W** | model + survey | same | search-level — **used as the outside check in §2** |
| Fishing's share of the > 5 cm mass | **75–86%** | 6,093 items, 573 kg, collected Jun–Nov 2019 | Lebreton et al., *Sci. Rep.* 12, 12590 (2022) | search-level |
| Fish boxes, oyster spacers, eel traps | 26% of items (2nd category; 33% unidentifiable fragments) | same | same | search-level |
| Origin of identifiable items | mostly Japan, China, South Korea, USA, Taiwan | same | same | search-level |
| Fragments 0.5–50 mm | **2.9 → 14.2 kg/km², 2015 → 2022** | 917 manta + 162 mega trawls, 74 aerial surveys, 2015–2022 | "Seven years into the North Pacific garbage patch", *Environ. Res. Lett.* (2024) | search-level |

### Findings that change the copy

1. **No survey of the patch counts straws.** Lebreton 2018's categories are H/N/P/F, so straws sit
   unreported inside "hard plastic, sheet or film". The widely quoted "straws are 0.03% (or 0.025%)
   of ocean plastic" is computed on **a different base**: all plastic *entering* the ocean
   worldwide in a year, not the patch. Non-negotiable 7 forbids putting it beside the 46%.
   **So "isn't straws" cannot carry a straw number.** It can stand as the named fight, with the
   measured claim about nets, e.g. "THE GARBAGE PATCH ISN'T YOUR STRAWS" → "ALMOST HALF OF IT IS
   FISHING NETS". Whether that negation is fair is a GATE 4 question for the owner, not mine.
2. **The 46% is a 2015 snapshot, and the patch has changed since.** Fragments roughly quintupled by
   2022. Back-of-envelope only (mine, not published): if the 2015 total was ~49 kg/km² (79 kt ÷
   1.6 M km²) and everything above 5 cm stayed flat, adding ~11 kg/km² of fragments takes nets from
   46% to roughly 38–40%. The 2024 paper reports the larger objects also rising, which would pull it
   back up. **Needs the paper's large-object trend before any "today" claim.** The safe copy names
   the year: "MEASURED IN 2015".
3. **The 2022 figure is the stronger sentence and a different ruler.** "Three-quarters of the big
   pieces come from fishing" (75–86%, > 5 cm, 2019) is bigger than 46% but counts crates, eel traps
   and floats as well as nets, on a different size base and year. **One ruler only** (the r009
   lesson). Pick one at GATE 4: 46% nets keeps a single nameable object (a net); 75–86% is the
   bigger number.

---

## 2. The mechanism — re-running van Sebille et al. (2012) on real drifters

**Data.** NOAA Global Drifter Program, 6-hourly, May 2025 release:
`s3://noaa-oar-hourly-gdp-pds/experimental/gdp6h_ragged_may25.zarr`. 28,728 drifters, 48,887,074
positions, 1979-02-15 → 2025-06-12. doi:10.25921/7ntx-z961, licence **"freely available"** (dataset
attributes). US government data.

**Method** (`measure_patch.py`). 1° (or 2°) cells; for every drifter, where it is DT days later; a
transition matrix per two-month season; debris spread evenly over every sampled ocean cell; stepped
forward 10 and 30 years. **The van Sebille paper was blocked, so its settings (I recall 1°, 60 days,
seasonal) are swept, not trusted.**

**The outside check: Lebreton 2018's measured centre, 32°N 145°W.** Nothing is fitted to it.

### A negative result, recorded first

The first run kept debris in any cell that had no outgoing data. **The pile then formed in the Sea of
Okhotsk (55.5°N 139.5°E)**: sparse coastal and sea-ice cells became traps. The fix was the standard
one: a cell needs `MIN_PAIRS` observed departures to count as sampled ocean, and debris drifting into
an unsampled cell counts as beached and leaves. **The method was changed after seeing a bad result**,
so the threshold is swept (5 / 20 / 50) and every setting is reported, not only the good ones.

### The sweep

*(filled in from `sweep.json` when the run completes)*

---

## 3. Real buoys that made the trip (`real_tracks.py`)

**425 drifters** have ever come within 500 km of 32°N 145°W. **170** of them started more than
2,500 km away, **134** of those on the Asian side (west of 170°W).

| Buoy | Deployed | From | Reached the patch | Then |
|:--|:--|:--|:--|:--|
| **56761** | 2005-11-11 | 20.2°N 121.2°E — Luzon Strait, between Taiwan and the Philippines, ~9,180 km away | 2009-09-25 (**3 yr 10 mo**) | inside for all 54 days until its **last signal, 2009-11-18** |
| **300234066410130** | 2019-09-07, by Taiwan | 22.1°N 121.3°E — off southern Taiwan, ~9,050 km away | 2024-03-05 (**4 yr 6 mo**) | inside for 25 of its last 28 days, last signal 2024-04-03 |

Both had **lost their drogue** (the sea anchor that pins a drifter to the current 15 m down) for
98–99% of their lives, so they rode the surface the way a lost net does: currents plus wind.

**TRAP — "it never left".** Neither buoy is known to have stayed. Both arrived and then went silent
(battery or transmitter) weeks later. The honest copy is "it was still there when it went silent".

---

## 4. Still open before GATE 4

- Read Lebreton 2018, 2022 and the 2024 ERL paper in full (on the Mac): confirm the H/N split, the
  "at least 46%" definition, and the large-object trend 2015–2022.
- Decide the ruler: 46% nets (2015) vs 75–86% fishing (2019, > 5 cm).
- Decide whether "isn't straws" stays as the named fight with no straw figure.
- Licence of the Lebreton papers (CC BY 4.0 expected for *Sci. Rep.*); figures are citable regardless.
