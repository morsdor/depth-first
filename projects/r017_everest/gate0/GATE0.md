# Gate 0 — `I86`, "the top of Everest was once seafloor"

Proposed as the next reel (`r017` if built), 2026-10-02. Backlog id `I86` (§2 *Maps and real
geography* → accent `infrastructure #00D6F7`). Reasoned from scratch, not from the backlog. The
subject (how the Himalayas formed) is the account owner's; the framing inside the "fossils on
Everest" argument was chosen by the owner from five candidates the same day (A of A–E; the others
were India's speed, the US redrawing its coordinates, California sliding, and Africa splitting).

Nothing has been built. This file and `payoff_frame.png` are the two artefacts CLAUDE.md requires
**before** any Python, any `.tsx`, any data module.

## 1. The sentence

> **"The rock at the very top of Everest is full of fossil sea creatures. It formed on the floor of
> a sea, and India crashing into Asia pushed it five and a half miles into the sky."**

No geology word: no "tectonic", "subduction", "Tethys", "limestone" or "Ordovician". Miles and feet,
for the US audience `r016` was framed for. 29,032 ft ÷ 5,280 = 5.50 miles.

**Deliberately NOT "seashells".** The summit fossils are trilobites, crinoids (sea lilies),
ostracods and brachiopods — mostly not what anyone calls a shell. "Sea creatures" is true of all of
them.

## 2. Who does the viewer send this to, and what are they proving? (GATE 3, drafted)

**Sent to the person who says the sea fossils on Everest prove a global flood, proving the seafloor
didn't come to the mountain by water — the mountain WAS the seafloor, pushed up by a continent you
can still measure moving.**

| condition | verdict |
|:--|:--|
| Personally witnessed the evidence | **Partly.** Few have seen the fossils; everyone has seen Everest and a fossil shell. Weaker than r005's seatback map |
| A dispute already running | **Yes.** "Marine fossils on Everest = Noah's flood" is a standing young-earth creationist argument, and the "why are there sea fossils on Everest" question circulates on its own (IFLScience ran a piece on people being confused by it; a 2026-08 piece frames the summit rock as a "biblical parallel") |
| Resolves to one repeatable thing | **Yes:** "the top of Everest was seafloor, and India pushed it 5½ miles up" |

**Heat — what the loser stands to lose.** Identity: for one side this is evidence for scripture,
for the other a marker of scientific literacy. Closer to `r005`'s flat-earth uncle than to `r011`'s
boarding annoyance. **The same heat is the toxicity risk**, as with `r015`. The reel never mentions
the flood, the Bible or creationism. It shows the mechanism and lets the viewer carry it.

**Second channel, weaker: high-arousal novelty.** A continent crossing an ocean and folding a
seafloor into the highest point on Earth is genuinely spectacular — but tectonics animations are a
saturated genre (`r009`, `r014`). The fight has to carry it, not the animation.

## 3. The payoff frame

`payoff_frame.png`, drawn in PIL by `mock_payoff.py`. A sketch, not a render, and its geology is a
diagram, not a measured section.

- A cross-section of the mountain, India (south) on the left, Asia on the right.
- **The summit cap — the rock that formed on a seafloor — is the one amber element.**
- A fossil trilobite drawn beside it, leader line into the cap: "SEA FOSSIL, SUMMIT ROCK".
- Sea level as a cyan line; a dashed bar from the summit to sea level: 29,032 FT.
- The script asserts nothing touches Instagram's header/footer bands.

**Sketch bugs caught on the way.** The first draw ran the headline 25 px past the safe area's right
edge; the strata were tilted, which opened an empty gap under the summit line; and the first
trilobite read as a beetle. All fixed in the sketch.

**The build will not be this frame.** In 3D the payoff is the camera rising up the mountain to the
amber band and closing on a fossil in the rock, after India has crossed the ocean to get there.

## 4. Kill conditions

| Condition | Verdict |
|:--|:--|
| The sentence needs a CS word | **No.** Rock, Everest, fossil, sea, India, Asia, miles |
| The payoff frame shows an object the viewer has never seen | **No for the mountain.** Everest is the most recognisable mountain there is. **The fossil is the borderline object**: a trilobite is famous but not universal. It must be drawn so it reads as "an animal in the rock", not as a pattern |
| The amazement depends on understanding first | **Risk, and the one to judge.** "Seafloor at 29,000 ft" is surprising with no setup — but only if the hook SHOWS it (camera on the summit, a fossil in the rock, the sea level line far below) rather than opening on a globe and a lecture about plates. Opening on India drifting would fail this condition |

## 5. Figures — all LEADS until Stage 3

| Figure | Gate 0 value | Source to verify at primary level |
|:--|:--|:--|
| Everest height | 29,032 ft (8,848.86 m) | 2020 China–Nepal joint survey |
| Summit rock and its fossils | Qomolangma Formation; Ordovician limestone (~450–470 Ma) with trilobite, crinoid, ostracod and brachiopod fragments, sampled just below the summit | Sakai et al., *Island Arc* (2005), "Geology of the summit limestone of Mount Qomolangma (Everest)"; Montana State's Everest Education Expedition page; Searle's work on the Everest massif |
| Where it formed | the northern continental shelf of India (a shallow sea margin) | same |
| India's speed before the collision | ~15–20 cm/yr, the fastest of any continent | plate reconstruction models (e.g. Müller et al. 2019 / GPlates) — **licence check needed: Stage 3** |
| India's speed today | ~4–5 cm/yr against Asia | GPS studies |
| Collision onset | ~50 Ma | literature range ~59–40 Ma; pick a cited figure, not the nicest |

**One accuracy trap already visible.** "The seafloor was pushed up" compresses a story: the
limestone was laid down ~450 Ma on India's shelf, India later rifted off and crossed the ocean, and
the collision from ~50 Ma stacked and lifted it. The sentence does not claim the sea was there 50
million years ago, and the copy must not either.

## 6. Data and licence

The motion of India can be **computed** from a published plate reconstruction rather than drawn,
which keeps the reel in "compute, don't author". GPlates' software is GPL and EarthByte's models are
generally CC BY — **to be confirmed for the specific model in Stage 3**, together with whether the
container's proxy can reach the data. The summit geology is published fact and citable. The mountain
mesh, if real elevation is used, needs a free DEM (SRTM/Copernicus GLO-30) — also a Stage 3 check.

## 7. Verdict

**GATE 2 and GATE 3 passed by the owner, 2026-10-02** ("Go ahead"), sentence and send line as
written in §1 and §2.

## 8. Stage 3 — research and measurement (2026-10-02)

**Nothing falsified the sentence.** Every lead in §5 is now sourced or measured:

| Figure | Value | Source |
|:--|:--|:--|
| Everest | **8,848.86 m = 29,031.7 ft → "29,032 FT"; 5.50 miles** | China–Nepal joint announcement, 2020-12-08 |
| Summit rock | Qomolangma Formation, **Middle Ordovician limestone, ~450 Ma**, laid down in a warm shallow sea on India's northern margin | Sakai et al., *Island Arc* 14 (2005) 297; Montana State Everest Education Expedition |
| The fossils | **abundant fragments of trilobites, crinoids (sea lilies), ostracods and brachiopods**, in samples taken **6 m (20 ft) below the summit** | Sakai et al. 2005, as reported by secondary sources — **paper not read in full; the container cannot reach the publisher** |
| India's peak speed | model **17.4 cm/yr (6.9 in) at 55 Ma**, 5-Myr mean; Cande & Stegman: **~18 cm/yr around 65 Ma** | `plate_journey.py` on Seton et al. 2012; Cande & Stegman, *Nature* 475 (2011) 47 |
| India's speed today | GPS **37–44 mm/yr** along the Himalaya; model 45 mm/yr at Nagpur | geodetic plate-motion models as summarised in Banerjee et al., *GRL* 2002, and others |
| Fingernails | **3.47 mm/month = 41.6 mm/yr** | Yaemsiri et al., *JEADV* 24 (2010) 420 |
| Ratio, peak | **4.2× fingernails** (model) · 4.3× (Cande & Stegman) | derived |
| Ratio, today | fingernails lie **inside** the GPS range | derived |
| India since 80 Ma | 6,611 km = **4,108 miles** (Nagpur vs Eurasia, model) | `plate_journey.py` |

**The model against the outside numbers (`plate_journey.py`, parameters chosen before the run,
nothing fitted).** Five checks, all pass. Two disagreements, stated rather than hidden:
- **The model's peak is 10 Myr later than Cande & Stegman's** (55 vs ~65 Ma), though inside their
  52–67 Ma fast window. The reel never names the year of the peak.
- **The model's present-day rate is 45 mm/yr, one above GPS's 37–44.** The first draft of the check
  allowed 46 under a label reading "37–44". That is loosening a test until it passes; it was caught
  and rewritten so the bound states its own slack, and **the fingernail comparison is made against
  GPS, never the model.**

**Data and licence, resolved.**
- **Rotations:** Seton et al. 2012, taken from GPlates' own `pygplates-tutorials` repository
  (EarthByte/zenodo hosts are blocked by the proxy). The rotation poles are published parameters,
  citable as facts. The repo carries no licence file, and the model's own licence could not be
  read from this container. **So the reel uses only the ROTATIONS, never the model's geometry.**
- **Geometry: Natural Earth** outlines (public domain), rotated by plate 501's poles — r006's
  rule: published figures are facts, geometry is a database.
- **Elevation: AWS Terrain Tiles** (Mapzen "terrarium", free with attribution to their SRTM/GMTED
  sources), z12 around the summit. **The DEM's summit reads 8,753 m, 96 m under the survey**, as a
  30-m-grid DEM always does on a sharp peak. The mesh is the shape; the number on screen is the survey.

**Accuracy traps carried into the script.**
1. **The sea the rock formed in is NOT the ocean India crossed.** The limestone is ~450 Ma; the
   ocean India raced across opened much later. The script gives the two their own beats and never
   says the rock formed in the ocean that closed.
2. **They are fragments, not whole animals.** "Full of fossil sea creatures" is true; a whole
   trilobite in the rock would not be. See SCRIPT.md, the open question on the fossil.
3. **The uplift's timing is not known well enough to animate as a clock.** The height counter in
   the collision beat runs alongside the stacking, never against a time axis.
4. **The crumpling is a diagram, not a simulation**, and is labelled as such in NOTES.

**Next: GATE 4 — `SCRIPT.md`.**
