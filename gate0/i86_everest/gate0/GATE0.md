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

**Awaiting the owner — GATE 2 (the sentence), then GATE 3 (the send line in §2).**
