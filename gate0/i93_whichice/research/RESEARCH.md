# `I93` — Stage 3 research (2026-10-13)

**Read this before the script.** Every figure the reel may say is graded below. **Nothing has been read at a primary
source**: NSIDC, NOAA, the IPCC, Nature, Wikipedia, USGS and the UW Polar Science Center all refuse this container
(egress test, `GATE0.md` §6). `WebSearch` works, so what follows is **search-level**: an abstract or a result snippet was
seen, the paper was not. **Grades:** *EXACT* = asserted by computation here; *SEARCH-LEVEL* = a result snippet saw it; *UNVERIFIED* = from memory.

## 1. What was computed (`melt_check.py`, exit 0, asserts pass)

| # | claim | result |
|:--|:--|:--|
| 1 | Floating ice does not move the level, **at every step of the melt** (not just start and end) | the level is **9.5250 cm at all 200 steps**, max drift < 1e-9 cm; the cube rides **91.7 %** under the line at every size |
| 1 | Ice on a shelf raises it, linearly | 8.0000 → 9.5250 cm, **+1.525 cm**, linear in the melt fraction |
| 1 | The shelf glass ends where the floating glass already was | **asserted equal to 1e-9 cm** |
| 2 | A real 20 °C drink: does it overflow? | **No — the level *falls* 0.17 mm** (it cools to 3.98 °C and water contracts toward 4 °C) and **returns to exactly where it started** once the drink warms back to 20 °C |
| 3 | The salt-water remainder, on both bases people use | **2.24 % of the ice's volume = 2.50 % of the water it displaced** at ρ = 1.025; **2.60 % of displaced at ρ = 1.026**. The remainder is exactly ρ_sea/ρ_fresh − 1 (asserted) |
| 3 | Sea ice is itself salty | its remainder is smaller (**2.19 %** at about 5 g/kg), so the fresh-ice figure is an upper bound |
| 4 | Greenland from the volume alone | **7.58 m** against the published **7.42 m** (+2.1 %), *above*, as it must be |
| 4 | Upper bound, all Arctic sea ice (28,000 km³) | **≤ 1.80 mm** |
| 4 | Ice on land against all floating ice | **~65.6 m against ~4 cm: 1,641×**; Greenland alone **186×** |
| 5 | On-screen units | **1.57 in** → "about 1.5 inches"; **24.3 ft** → "about 24 feet" |

**An outside number that was not fitted agrees.** The published salt-water remainder is **2.6 %** of the displaced volume (below, search-level).
The computation above uses nothing but two densities and reproduces it at ρ_sea = 1.026 g/cm³ — a typical value, chosen *before* looking.
That is the `r011` check: an outside number to disagree with, and it did not.

## 2. What search found, and how far to trust it

| figure | what was seen | grade | what would change it |
|:--|:--|:--|:--|
| Greenland, **7.42 ± 0.05 m** of global sea level; volume **2.99 ± 0.02 × 10⁶ km³** | Morlighem et al. 2017, *Geophys. Res. Lett.* (BedMachine v3): a result snippet quoting both numbers | SEARCH-LEVEL | read the paper; confirm "above floatation" is the base |
| Antarctica, **57.9 ± 0.9 m** | Morlighem et al. 2020, *Nature Geoscience* 13:132–137; one site gives 58.3 m | SEARCH-LEVEL, the sources disagree by 0.4 m | not on screen |
| other glaciers, **0.32 ± 0.08 m** | Farinotti et al. 2019, *Nature Geoscience* 12:168–173; **Millan et al. 2022 argues ~20 % lower** | SEARCH-LEVEL, **contested** | not on screen |
| meltwater from floating ice is **~2.6 % more** than the seawater it displaced; **all extant sea ice and shelf ice would raise the sea about 4 cm** | Noerdlinger & Brower 2007, *Geophys. J. Int.* 170:145–150: the abstract, via a search result. Jenkins & Holland (2007) commented that it is "a good first approximation in cold waters" | SEARCH-LEVEL, **one abstract** | **read the paper before "1.5 inches" ships**; the 4 cm depends on shelf volumes |
| Arctic sea ice volume, **28,000 km³ (April) to 11,500 km³ (September)** | the PIOMAS page, via search; the baseline moved from 1979–2016 to 1979–2025 with the same numbers | SEARCH-LEVEL | not on screen; used for the 1.8 mm bound |

**The dispute is running in both directions** (the G3 leg): search turned up a Skeptical Science piece on "sea level rise due to floating
ice?", a University of Reading blog on the same, **and a Lead Stories 2019 "fake news" item whose title claims melting floating ice raises
sea level** — the rebuttal pointing the *other* way from the ice-cube meme. So **both** camps have published exhibits; this is
search-result titles only, none opened. It is evidence that the argument exists, not that it is as big as `r005`'s.

## 3. Reading time — where 0.40 s per word comes from

| input | value | grade |
|:--|:--|:--|
| average adult silent reading rate, English non-fiction | **238 wpm** (183 wpm reading aloud); most adults 175–300 wpm | SEARCH-LEVEL: Brysbaert 2019 abstract, a meta-analysis of 190 studies (a preprint at the time of one summary) |
| the budget used | **150 wpm** (0.40 s/word) **+ 1.0 s** to notice the line | a choice: a 1.6× margin on 238 wpm for a phone, no sound, and motion competing |
| broadcast subtitles | about 20 characters/s (~3.6 words/s) for adult programmes | **UNVERIFIED:** only a third-party summary of Netflix's English guide was found, and it says to confirm against the current guide |
| the repo's own rule | end-of-beat text ≥ 3 s at full opacity; ~2 s hold on a finished state | `brand_guide_software.md` "Reading time"; CLAUDE.md non-negotiable 5 |

**The budget is deliberately slower than subtitles**, because subtitle readers expect text at the bottom of the frame and a reel
viewer is looking at the animation. The owner's direction (2026-10-13) outranks any figure here: **if the reel still reads too fast
when watched, the constants in `read_budget.py` are the thing to change, and every line re-checks.**

## 4. Negative results and traps

- **The first draft's "1 mm for all Arctic sea ice" was the wrong object.** It is the Arctic alone; the published "about 4 cm" covers *all* floating
  ice, including Antarctic sea ice and the shelves. Both are now in `GATE0.md` §0 and §1, and the script uses the larger, published one.
- **My first count of a line was a word short** (`B08`, 10 words, not 9) and the budget caught it. **A hand count of a reading window is not a check.**
- **A second copy error the program could not catch:** "GREENLAND'S ICE MELTS: … 24 FEET" is false for any amount less than all of it. The first
  number said "ALL FLOATING ICE" and the second did not. **No script catches a missing quantifier; reading the copy against the claim does.**
- **Glass probe traps** (`scripts/glass_probe/README.md`): nested transmissive objects fight over the depth buffer; `material.envMapIntensity` is ignored
  for `scene.environment`; `LatheGeometry` leaves a visible seam; a tone-mapped plane is darker than an un-tone-mapped background.
- **A background wrapper reports "completed" while its subshell is still running.** `npm ci` was started as `( … ) &` inside a background command; the
  notification meant "the wrapper returned", not "the install finished", and `node_modules` was half-populated. **Key a wait on the output line, not on the
  wrapper's exit.**

## 5. What is NOT claimed

- That any ice melts at any rate, or over any time scale. **There is no time anywhere in the script.**
- That Greenland's loss is happening, will happen, or how fast. The 24 feet is *all of it*.
- That sea ice or ice shelves "don't matter". The sentence is about sea level and the copy keeps to it.
- Anything about the Antarctic ice sheet, which holds 58 m and is deliberately not on screen: it would be a third number on a ruler built for two.

## 6. Still to do, and who can do it

| item | who | blocks |
|:--|:--|:--|
| read Noerdlinger & Brower 2007 and Morlighem et al. 2017 at the primary | **Mac**, or the owner pastes them | the two on-screen numbers |
| fetch NASA Blue Marble imagery of Greenland | **Mac** (host refused here) | the pull-out |
| fetch ice thickness (BedMachine via NSIDC, or ETOPO 2022 from NOAA) | **Mac** | the "ice at true thickness" shot |
| the house and the tide staff | cloud (primitives) | beats B08–B09 |
| phone check of the ring and the outline | **Mac / the owner's phone** | the thin-line legibility |
| the render | **Mac** (~1.7 s/frame here; GPU there) | Stage 5 |
