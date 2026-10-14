# Gate 0 — `I93`, "which ice raises the sea"

Proposed 2026-10-13. Backlog id `I93` (§2 *Maps and real geography* → accent `infrastructure
#00D6F7`). **Reasoned from scratch** — not in the original sitting. Picked by the owner at Gate 1 on
2026-10-13 from six candidates (the other five — `I74`, `I83`, the Thanksgiving rinse, rockets and
feathers, a buried river — stay where they were or unminted), with one direction attached: **"we
need amazing visuals for this video."** §5 is the answer to that and §6 is what stands in its way.

**Reel number `r021` is claimed (2026-10-14), when the first reel `.tsx` was written.** This folder moved from
`gate0/i93_whichice/` to `projects/r021_whichice/` the same day, as CLAUDE.md prescribes. `I92` (daylight saving) was also waiting on
`r021`; **it will take `r022` when its build starts.**

Nothing has been built as a reel. This file and `payoff_frame.png` are the two artefacts CLAUDE.md requires
**before** any Python, any `.tsx`, any data module. `mock_payoff.py` is the five-minute still.

> **STAGE 2–3 RECORD, 2026-10-13.** The owner answered the Gate 0 presentation with **"Looks good"** and one added direction.
> **I took that as a yes to the sentence, to "barely", to the two-sided framing, and to the drafted send test (§2).** The owner did
> not name a person at G3, so **§2's drafted answer is what was accepted — if "looks good" did not cover it, say so and §2 reopens.**
> **The added direction: "give enough time for people to read on the screen on the animation and text."** It is now a rule the
> script is checked against by a program (`research/read_budget.py`), and its cost is stated in `SCRIPT.md` §4.
> Stage 3 then ran: the physics is asserted (`research/melt_check.py`), the figures are graded (`research/RESEARCH.md`), a **glass
> probe** answered the visuals question (`scripts/glass_probe/README.md`: possible, with limits), and the **G4 script is drafted
> (`SCRIPT.md`) and awaits the owner.** **Two numbers in §0 and §1 below were corrected by that work — marked in place.**

## 0. What the first draft got wrong, found by computing it before writing it down

The sentence offered at Gate 1 ended **"melting sea ice doesn't raise the sea."** Computed today,
that is **false as worded**, by a small and exact amount:

> Fresh ice floating in SALT water displaces a little less than it melts into. Ice 0.917 g/cm³ in
> seawater 1.025 g/cm³: the meltwater is **2.24 % of the ice's own volume** larger than the hole it
> was sitting in. (`mock_payoff.py` asserts this; the glass case, fresh ice in fresh water, is
> exactly 0 to 1e-12.)

It is tiny at planet scale. **[CORRECTED 2026-10-13: the first draft said "about 1 mm if ALL Arctic sea
ice melted" — true, but the wrong object.]** All **Arctic** sea ice is **at most 1.8 mm** (PIOMAS peak volume,
28,000 km³, search-level), and **ALL floating ice on Earth — sea ice and shelves together — is about 4 cm**
(Noerdlinger & Brower 2007, abstract via search), **against 7.42 m if all of Greenland's ice melted**
(Morlighem et al. 2017, search-level): **Greenland alone is ~186× all floating ice, and all ice on land
~1,640×** (`research/melt_check.py`). The salt-water remainder itself — **2.60 % of the displaced volume at
ρ = 1.026** — reproduces the published 2.6 % **unfitted**, which is the outside-number check. But a
viewer who knows the paper will say "technically it does", and that comment is the exact
environment this reel posts into. So the word changes, as `r016`'s "$80" and `r020`'s "not all"
did: **"doesn't raise" → "barely raises".** Costs the sentence nothing.

## 1. The sentence

> **"When the ice in your drink melts, the glass doesn't overflow — so melting sea ice barely raises
> the sea. It's the ice sitting on land that does."**

No CS word. The only terms of art are "sea ice" and "ice on land", and every viewer owns both.
"Archimedes" never appears on screen; the picture does that work (§3).

**What the sentence deliberately does NOT say, and the reel must not drift into:**

- **It does not say sea ice "doesn't matter."** Loss of sea ice matters for other reasons (it
  reflects sunlight; it is habitat). The sentence is about *sea level*, and the copy keeps to that.
- **It does not say floating ice shelves are harmless.** Shelves are floating, so their own melt adds
  almost nothing — but they hold back the land ice behind them. That is a second sentence, and it is
  out of scope here.
- **It is not a forecast.** "All of Greenland" is a thought experiment on a time scale of centuries
  to millennia. A flooded-city shot is only ever labelled as a scale, never as a prediction (§5 D).

**Supporting figures — all LEADS, none read at a primary** (this container cannot reach NSIDC, NOAA,
the IPCC, Nature or Wikipedia: §6). They are for Stage 3, not for the copy:

| figure | status (2026-10-13) | what kills it |
|:--|:--|:--|
| Greenland, all of it | **7.42 ± 0.05 m** — Morlighem et al. 2017, **search-level** | read the paper; confirm "above floatation" is the base |
| Antarctica; all other glaciers | **57.9 m**; **0.32 m** (Millan 2022 argues ~20 % lower) — search-level, **not on screen** | — |
| the salt-water correction | **2.24 % of the ice's volume = 2.60 % of the displaced volume** at ρ = 1.026 — **computed, and it reproduces the published 2.6 %** (Noerdlinger & Brower, search-level) | read the paper |
| all floating ice, sea ice + shelves | **about 4 cm** — Noerdlinger & Brower 2007, **one abstract**, search-level | **read the paper before "1.5 inches" ships** |
| all Arctic sea ice, upper bound | **≤ 1.8 mm** — computed from the PIOMAS peak, search-level | not on screen; the script's fallback line |

## 2. Who does the viewer send this to, and what are they proving? (GATE 3, drafted)

**Sent to whoever posts the ice-cube-in-a-glass meme to say sea level can't rise — and to whoever
says the melting Arctic will flood Miami. It proves that *which ice melts* is the whole question, and
each of them was half right.**

| condition | verdict |
|:--|:--|
| Personally witnessed the evidence | **Yes — and it is the strongest leg on the account.** Everyone has watched ice melt in a drink. The experiment is in their own hand |
| A dispute already running, that a non-specialist is in | **Yes, in both directions.** The ice-cube-in-a-glass image is a standing exhibit for the sceptical side; "the Arctic is melting, the sea will rise" is the standing slogan on the other, and it uses the wrong ice. Neither is a specialist |
| Resolves to one repeatable thing | **Yes:** *floating ice, no; ice on land, yes* |

**Heat: what the loser stands to lose.** The person who posts the ice-cube meme was *right about the
physics* and is told it is the wrong ice — a **competence sting on something they were proud of**,
the same shape as `r005`'s flat-earth loser, though softer. The person who says "Arctic melt floods
cities" is told the picture in their head is the wrong mechanism — a smaller sting. **It is
two-sided, so it is the first reel on the account where each camp has something to send the other.**
**Stated before building: expect `r016`'s band, not `r005`'s** — shares per reach 0.15–0.35 %.

**Saturation risk, stated up front and real.** The ice-cube puzzle is old. A viewer who has seen the
answer gets recognition, not surprise — the `r009` shape. What the usual treatment lacks, and what
this reel has to carry to be worth posting:

1. **The second half, shown at true scale.** The usual piece stops at the glass. Ice *on land*, at
   Greenland's real size and real thickness, is the part nobody has been shown (§5 C).
2. **The mechanism, drawn.** The submerged volume is outlined and the meltwater fills it exactly — the
   viewer *sees* why the level does not move, rather than being told (§3).
3. **A fact the puzzle never states:** the floating glass **is already at the after-melt level** —
   the ice had already "raised" the water the moment it went in. There is nothing left to add.
   (`mock_payoff.py` asserts that the two glasses end on the same level.)
4. **Both slogans named on screen**, which a one-sided debunk cannot do.

**Toxicity, and the mitigation.** Climate is the most charged arena on the list. The reel is
physics-only and names *both* camps' slogans, so neither can read it as a hit piece. It still
invites the worst comments on the account; that is the price of the heat.

## 3. The three kill conditions

| kill condition | verdict |
|:--|:--|
| The sentence needs a CS word | **Pass.** None |
| The payoff frame shows an object the viewer has never seen | **Pass.** A glass of ice water, which a stranger names with the sound off and no labels. **The bottom band of the still is a diagram, and is NOT the payoff** — Stage 3 replaces it with real imagery of Greenland, an object |
| The amazement depends on understanding first | **Pass, with a risk.** The surprise lands *before* any argument: a cube vanishes and the level line does not move. The reason is shown, not argued. **Risk:** if a viewer needs a sentence of setup before the left glass surprises them, the right glass is what supplies the contrast. G2 should judge this on the picture |

## 4. The payoff frame

`payoff_frame.png`, drawn by `mock_payoff.py` (Pillow + numpy). A flat sketch, not a render.

- **The same cube of ice, the same glass, the same water, melted twice**: floating (left) and
  sitting on a rock shelf above the water (right). Sizes, levels and the 91.7 %-under-the-line
  position of the floating cube are **computed from stated geometry**, not painted.
- **One level line runs through both glasses.** The left glass is already on it; the right glass climbs
  to it. The right glass's `AFTER` line is **the one amber element**, because it is the one that moves.
- **The bottom band** carries the same rule at planet scale, as a diagram with no number on it.
- The headline is the question the viewer has an opinion on; the answer is on the two readouts.

**What the still deliberately does not draw:** the reel's visuals. This is a flat 2D sketch; §5 is
what the finished thing is meant to be, and **§5 A cannot be judged from a still** — see §6.

## 5. The visuals — the owner's direction, answered

**The shot that only exists because this is 3D (Stage 3c):** one continuous move from a glass of
water to the planet, without a cut — the camera pulls back from the rim and **the glass's waterline
becomes the ocean's horizon**. A flat reel cannot do that, and it is the sentence's own argument:
the same rule, at two scales.

| beat | the shot | what it needs |
|:--|:--|:--|
| **A. The glass** | A macro, physically-based glass: real transmission, refraction, caustics on the table, the cube cracking as it melts. **The submerged volume glows as a ghost shape and the meltwater fills it exactly** — an amber ring marks the level and does not move | **PROBED 2026-10-13 (`scripts/glass_probe/`): possible, with limits.** Refractive glass, tinted water, cracked ice, the ring and the outlined space all render and read. Nested transmissive bodies do not (built around). **~1.7 s per frame here, so the render is a Mac job** |
| **B. The shelf** | The same cube on rock, above the water. It melts, drips fall, and **the amber ring climbs** through the ghost band | same scene, same camera; the contrast is the point |
| **C. The scale jump** | The camera pulls out; the glass's surface becomes the sea; floes appear; then **Greenland, in real NASA imagery** on the globe engine (`acb4820`), the ice sheet at true thickness (vertical exaggeration declared on screen) resting on rock *above* the sea | the globe engine exists; Greenland imagery and ice thickness are **Mac tasks** (§6) |
| **D. The payoff** | **Decision for G4.** Either the amber ring climbs along a **real coast** (AWS terrain tiles, the only data host reachable here), scoped on screen as *"if all of it melted"* — or the payoff stays in the glass and the coast goes in the caption | the coast is the strongest visual and the most alarm-flavoured one. **I recommend the coast with the scope words on screen**; the owner decides |

**Legibility beats spectacle (CLAUDE.md, 3D by default).** The level ring has to be read *edge-on*,
so beats A and B put the camera at the waterline and keep it there. A dramatic angle that hides the
ring would spend the 3D on the wrong thing — the `r009` lesson.

**Every frame is computed, ₹0, no image model.** The glass optics are rendered, not generated.

## 6. Licence, data, and what this container can and cannot reach

**Egress test, 2026-10-13:** `WebSearch` works, so **figures can be graded at search level here** (`research/RESEARCH.md`); reading a paper at its host cannot. Hosts reachable — AWS terrain tiles (HTTP 200). **Not reachable** — NASA
eoimages, Natural Earth's site, NSIDC, NOAA NCEI, the IPCC, the UW Polar Science Center, Nature,
Wikipedia, USGS. (`raw.githubusercontent.com`, which `scripts/globe_probe/README.md` uses for Natural
Earth, was not tested.)

| item | source | licence | where it can be fetched |
|:--|:--|:--|:--|
| Greenland imagery | NASA Blue Marble | public domain, credit NASA | **Mac** (host refused here) |
| Coastlines | Natural Earth | public domain | Mac, or GitHub raw — untested |
| Coast elevation for beat D | AWS Terrain Tiles | open; attribution | **here** |
| Greenland ice thickness | BedMachine (NSIDC), or ETOPO 2022 (NOAA, public domain) as the fallback | free with citation; Earthdata login — **to check** | **Mac** |
| The published numbers | IPCC AR6, Morlighem et al., the salt-water-correction paper | **figures are facts and citable; the databases are not** | **Mac, or the owner pastes them** |

**This is the same wall `I92` and `r020` hit: no primary source is readable from the cloud.** Nothing
on screen may say "a study found" until one has been read. **The physics here is exact**
(`mock_payoff.py` asserts it), so what Stage 3 needs from outside is the *scale* figures, not the
claim.

## 7. What could still end it

There is **no `I53`-style figure that can kill this**: the central claim is Archimedes' principle,
and the only number on the sentence is "barely", which is asserted. What ends it is Gate 3 and
saturation — and those are the owner's call, not a number's. If the owner reads §2 and decides a
saturated puzzle with this much toxicity is not worth a day, **close it as killed by Gate 3 and keep
the id.**

## 8. Pre-registered reading (proposed — owner to change before posting)

Written before any engagement exists, as `I92`'s was. **The third heat test**: `r016` moved every
metric, `r017` did not.

| metric | `r016` day 1 | `r017` day 1 | this reel is read as… |
|:--|:--|:--|:--|
| sends per reach | 0.172 % | 0.143 % | **works** ≥ 0.30 % · **in band** 0.15–0.30 % · **falsifies** < 0.10 % |
| comments (the heat indicator) | 32 | 2 | naming both slogans on screen should bring the argument into the comments: **≥ 15 supports it, ≤ 5 means the fight did not come** |
| saves per reach | 0.33 % | 0.45 % | informational — the figure to repeat is "7.4 m" |

**Posted outside the climate news cycle, with no calendar tailwind** (unlike `I92`), so this is the
cleaner read of the *topic*.

## 9. What I need from the owner

1. **G2 — would you say the sentence in §1 to someone?** Two sub-questions: (a) **accept "barely"** in
   place of "doesn't" (the unqualified word is false by 2.2 %); (b) **accept the two-sided framing**
   — the reel names both camps' slogans and takes neither's side.
2. **G3 — name the person.** §2 drafts it; say who you would actually send it to.
3. **Can wait until G4:** the coast payoff (§5 D), and whether the Mac does the Greenland fetch.

**Next, if G2 and G3 pass:** Stage 3 — the glass-optics probe (not a reel; the first thing to settle,
because it decides whether beat A is possible), the scale figures, the Greenland data fetch on the Mac,
and the G4 script. **No code is written before the yes.**
