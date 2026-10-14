# `I93` — SCRIPT (GATE 4) · "which ice raises the sea"

**Status: APPROVED at G4, 2026-10-14. The owner's words: "No let it take its full length. Go ahead."** That is a yes to the
script as drafted **and to decision #1 — the full 59.6 s, no cuts.** Decisions #2–#6 were not answered individually, **so they stand
as drafted, with my recommendations** (the house with its two guards; the close names the fight, not both slogans; the hook rule resolved by
starting the melt at 1.0 s). **From here the script is the CONTRACT.** The history below is kept as it was handed over.

*Was: DRAFT, awaiting the owner's approval. Nothing below is coded as a reel.* The only code that exists is
`research/melt_check.py`, `research/read_budget.py`, and the **glass probe** (`remotion/src/reels/GlassProbe.tsx`, not a
reel). Once approved this is the CONTRACT: a beat that cannot be animated as written comes back here as a script change.

Runtime **59.6 s**, US framing (inches and feet), 3D. Every on-screen number is computed or graded in
`research/`, and will be **re-asserted in `emit_ts.py` at the moment its copy appears.**

**THE OWNER'S NOTE, 2026-10-13: "give enough time for people to read on the screen on the animation and text."**
It is a hard rule for this script, and it is checked by a program, not by feel: `research/read_budget.py` fails the
script if any line is on screen for less than **1.0 s + 0.40 s per word at full opacity** (150 words per minute — a
1.6× margin on the 238 wpm average adult reading rate), if a *single reader going through the lines in order* cannot
finish each one before it fades, or if any finished animation is not held for **at least 2.0 s**. The same file holds
the beat times, and `emit_ts.py` will import them, so **moving a beat in the build cannot quietly shorten a reading
window.** Its cost is stated in §4: this is a 59.6 s reel because reading takes the time it takes.

**One ruler: *the water level* — the amber ring.** In the glass it is the level of the water; on the house it is
the level of the sea. **Every number answers one question: how high does the ring go?** (1.5 inches, 24 feet.) The
viewer is always looking at *the same ring*.

## 1. The script

| t | Narration — the on-screen words, verbatim | On screen | Why this beat exists |
|:--|:--|:--|:--|
| 0.0–5.0 | **B01 "DOES MELTING ICE RAISE THE SEA?"** (0.3–4.6) | A macro 3D **glass of ice water** on a dark table, camera at the waterline, slow push-in. A cube floats with its top just above the surface; **the amber ring sits at the waterline.** From **1.0 s the cube is already melting**, a first crack runs through it at 2.0 s, caustics shimmer on the table. The ring does not move | **Hook.** Names the argument the viewer already has an opinion on, with the object that argument is about on screen at 0.0 s. **Shows before it tells:** the viewer *watches the ring hold* while they read the question, and B02 names what they have just seen |
| 5.0–10.0 | **B02 "THE ICE MELTS. THE WATER LEVEL DOESN'T MOVE."** (5.0–10.0) | The cube keeps shrinking (melt runs 1.0–10.6 s). The ring is still where it was. **From ~9.0 s a thin cyan outline appears around the part of the cube that was under the water** | **The surprise, named.** The first half of the sentence: the glass does not overflow. The words arrive when the viewer has had four seconds to see it, so they confirm rather than announce |
| 10.2–17.2 | **B03 "THE ICE TOOK UP THIS SPACE. ITS MELTWATER FILLS IT EXACTLY."** (10.2–16.4) | The cube is gone; **the outline of the space it took up stays.** From 12.8–15.0 s water fills the outline from the bottom. The ring has not moved. **Hold 15.0–17.2 on the finished state** | **The mechanism, drawn.** The viewer *sees* why the level does not move instead of being told. **It is true to the volume:** the meltwater (58.7 cm³) is exactly the displaced volume — `melt_check.py` asserts it at all 200 melt steps |
| 17.2–27.0 | **B04 "NOW THE SAME ICE, ABOVE THE WATER."** (17.2–21.6) | The camera slides to **two glasses side by side.** Left: the finished one, its ring on a thin guide line. Right: **the same cube on a rock shelf above the water**, the water lower, its ring at the lower level. From 21.8 s the shelf ice melts, drips fall, **and the right ring climbs, through a ghost band, to the guide line, finishing at 26.0 s** | **The contrast, and the second half of the sentence.** Ice sitting above the water is ice on land. **The right glass ends exactly where the left glass already was** (asserted) — the floating ice had already "raised" the water the moment it went in |
| 27.0–33.4 | **B05 "FLOATING ICE BARELY RAISES THE SEA. ICE ON LAND DOES."** (27.0–32.8) | Hold on the two glasses: **both rings on one line.** The camera drifts, never still | **The line the viewer repeats.** It is the amended Gate 0 sentence in the reel's own words, with "barely" (the unqualified word is false by 2.24 % of the ice's volume). **Held 5.8 s** so it can be read and sent |
| 33.4–42.4 | **B06 "SEA ICE: FLOATS"** (35.4–38.2) then **B07 "GREENLAND'S ICE: ON LAND"** (38.4–42.2) | **The 3D-only shot, one continuous move, no cut.** The camera pulls back from the glass; the glass's waterline becomes **the horizon of an ocean** with ice floes riding almost level with it (tag B06 on a floe). The camera swings to **Greenland on the real-imagery globe** (`acb4820`), the ice sheet at true thickness resting on rock *above* the sea (tag B07 on the sheet). **Vertical exaggeration declared on screen** | **Where the rule applies.** The two glasses become the two kinds of ice on Earth, and the viewer is shown which is which. Names ride on the objects |
| 42.4–53.8 | **B08 "ALL FLOATING ICE MELTS: SEA LEVEL RISES ABOUT 1.5 INCHES"** (42.4–47.9) then **B09 "ALL OF GREENLAND'S ICE MELTS: SEA LEVEL RISES ABOUT 24 FEET"** (47.9–53.8) | A **coastal house at the sea's edge** with a **tide staff** beside it marked in feet. **The same amber ring is now the sea.** At 43.2 s it lifts **1.5 inches** — barely a mark on the staff — and holds. From 49.2 s it climbs the staff to **24 feet** and holds. **Calm: no wreckage, no drowned cars** | **The payoff and the stakes, on the one ruler.** The 1.5 inches is the second half of "barely"; the 24 feet is "ice on land does". **"ALL" is on both lines** — they are thought experiments, not forecasts, and the copy says so by saying *all* |
| 53.9–59.6 | **B10 "SEND THIS TO WHOEVER'S ARGUING ABOUT ICE. FOLLOW FOR MORE."** (53.9–59.4) | The finished frame: the house, the staff, the ring at 24 feet, breathing; the glass ring echoed small in a corner so the two scales are in one picture | **Names the fight** (the `r017` lesson: an argument the reel does not name does not arrive in the comments) and **ends on a reason to follow** (non-negotiable 9), held the full 5.5 s. **The next reel is not decided, and I will not promise one that has not passed a gate** |

## 2. The copy column read ALONE

Cover every other column and read this. It must be a complete thought:

> DOES MELTING ICE RAISE THE SEA? — THE ICE MELTS. THE WATER LEVEL DOESN'T MOVE. — THE ICE TOOK UP THIS
> SPACE. ITS MELTWATER FILLS IT EXACTLY. — NOW THE SAME ICE, ABOVE THE WATER. — FLOATING ICE BARELY RAISES
> THE SEA. ICE ON LAND DOES. — SEA ICE: FLOATS. — GREENLAND'S ICE: ON LAND. — ALL FLOATING ICE MELTS: SEA
> LEVEL RISES ABOUT 1.5 INCHES. — ALL OF GREENLAND'S ICE MELTS: SEA LEVEL RISES ABOUT 24 FEET. — SEND THIS
> TO WHOEVER'S ARGUING ABOUT ICE. FOLLOW FOR MORE.

**It reads as one argument:** a question → the ice melts and the level does not move → *why*, in volume →
the same ice above the water, and the level rises → the rule → which ice on Earth is which → how high the sea
goes for each → send it to the argument.

**Weak spots found by the read:** (a) **B03's "THIS SPACE"** is a pointer to the outline on screen. Read alone it is a
sentence about *a* space; it works only because the outline is there — the `r010` failure shape, in a mild form. The
alternative is **"THE ICE TOOK UP THAT MUCH ROOM. ITS MELTWATER FILLS EXACTLY THAT MUCH."**, which is no less
deictic and one word longer; I kept the shorter one. **If you read it cold and it fails, that is a G4 change.**
(b) **B06 and B07 are two tags**, not a sentence, and read alone they are a pair of labels. They are tags on
objects, which is what a tag is. (c) **B08's "FLOATING ICE" needs "ALL"** and has it; **B09 needed "ALL OF"** and
did not, in the first draft — a line saying *Greenland's ice melts: 24 feet* is false for any amount less than all of it.
The check that caught the miscount that came with it is `read_budget.py`.

## 3. The reading-time check (generated — `research/read_budget.py`, exit 0)

```
READ BUDGET: 1.0 s + 0.40 s/word at full opacity (min 2.0 s; end-of-beat >= 3.0 s)

id      in   out words  full  need  slack  copy
B01    0.3   4.6     6  3.83  3.40  +0.43  OK  DOES MELTING ICE RAISE THE SEA?
B02    5.0  10.0     8  4.53  4.20  +0.33  OK  THE ICE MELTS. THE WATER LEVEL DOESN'T MOVE.
B03   10.2  16.4    11  5.73  5.40  +0.33  OK  THE ICE TOOK UP THIS SPACE. ITS MELTWATER FILLS IT EXACTLY.
B04   17.2  21.6     7  3.93  3.80  +0.13  OK  NOW THE SAME ICE, ABOVE THE WATER.
B05   27.0  32.8    10  5.33  5.00  +0.33  OK  FLOATING ICE BARELY RAISES THE SEA. ICE ON LAND DOES.
B06   35.4  38.2     3  2.33  2.20  +0.13  OK  SEA ICE: FLOATS
B07   38.4  42.2     4  3.33  2.60  +0.73  OK  GREENLAND'S ICE: ON LAND
B08   42.4  47.9    10  5.03  5.00  +0.03  OK  ALL FLOATING ICE MELTS: SEA LEVEL RISES ABOUT 1.5 INCHES
B09   47.9  53.8    11  5.43  5.40  +0.03  OK  ALL OF GREENLAND'S ICE MELTS: SEA LEVEL RISES ABOUT 24 FEET
B10   53.9  59.4    10  5.03  5.00  +0.03  OK  SEND THIS TO WHOEVER'S ARGUING ABOUT ICE. FOLLOW FOR MORE.

HOLDS — the finished state stays on screen after the last motion:
  OK  the cube melts, the ring stays            motion  1.0-10.6   state held to 12.8   hold 2.2 s
  OK  the meltwater fills the outlined space    motion 12.8-15.0   state held to 17.2   hold 2.2 s
  OK  the shelf ice melts and the ring climbs   motion 21.8-26.0   state held to 33.4   hold 7.4 s
  OK  the camera pulls out, glass to sea to Greenland   motion 33.4-38.8   held to 42.4   hold 3.6 s
  OK  the ring on the house rises 1.5 in        motion 43.2-44.2   state held to 47.9   hold 3.7 s
  OK  the ring on the house climbs to 24 ft     motion 49.2-52.8   state held to 59.6   hold 6.8 s

most text blocks on screen at once: 1 (limit 3)    runtime 59.6 s (limit 60)
80 words of copy in 10 blocks, 44.5 s of full-opacity reading
```

**Read the slack column, not the verdict.** Several windows have **0.03 s** to spare, because each was sized to its
budget and no larger. **The build must not shorten any of them**, and `emit_ts.py` imports these times so it cannot.

## 4. Decisions only the owner can make

1. **The runtime is 59.6 s, at the 60 s ceiling, and reading time is the whole reason.** At 0.40 s per word the 80 words
   alone take **44.5 s of full-opacity reading** in a reel that also has to show a melt, a contrast, a scale jump and a number.
   The longest reel on the account is `r007` at 54 s; `r016` and `r017` held 43 % and 40 % of their runtime. **The cut list, in the
   order I would cut:** (a) **B06 "SEA ICE: FLOATS"** → **−2.6 s**, the floes stay and B05 has just said "FLOATING ICE"; (b) **B03's
   second sentence** → **−2.0 s**, the filling outline carries it; (c) **B07** → **−3.8 s**, if B06 goes too the pull-out lands straight on the house.
   All three: **~51 s**, and the reel still makes both halves of the sentence and both numbers. **If you want it shorter than
   59.6 s, tell me which and the budget re-runs.**
2. **The hook rule against the reading rule.** CLAUDE.md wants the first surprising result by ~3 s. **Reading B01 takes 3.4 s.** I resolved
   it by starting the melt at **1.0 s**: the viewer watches the ring hold *while* they read the question, so the surprise lands visually
   at about 3–4 s and B02 names it at 5.0 s. **If the question alone should not carry the first 4.6 s, say so.**
3. **The two numbers need a primary read before they ship** (§5). **1.5 inches** is from one abstract (Noerdlinger & Brower,
   2007: all sea ice and shelf ice, "about 4 cm") and **24 feet** is Morlighem et al. 2017's 7.42 ± 0.05 m — **both search-level, neither
   read at a primary, and this container cannot reach either.** Nothing says "a study found". **Fallback if the 4 cm does not survive a read:**
   "ALL ARCTIC SEA ICE" and **"LESS THAN A TENTH OF AN INCH"** (my computation from the PIOMAS peak volume, 1.8 mm = 0.07 in), which is
   a smaller claim about a smaller object and an even starker contrast.
4. **The house.** The payoff is a calm amber ring climbing a tide staff beside a coastal house, to 24 feet — the strongest picture and the
   most alarm-flavoured one. **Two guards are in the script:** both lines say **ALL**, and there is no wreckage. **What the script does NOT
   do is say how long it would take.** If you want a time on screen it needs a source I have not read ("centuries to millennia" is a search-level
   lead) and **+0.8 s**. Alternative: **no house**, the payoff stays in the two glasses and the numbers go in the caption — a quieter reel and a
   weaker one. **I recommend the house with the guards.**
5. **The close names the fight, not both slogans.** B10 says "ARGUING ABOUT ICE". **The two-sided framing is carried by B05** (it gives each camp
   half) **and by the caption**, which should quote both slogans. If you want both on screen it is **+3 s**.
6. **The pre-registered reading** (`gate0/GATE0.md` §8) stands: shares per reach vs `r016`'s 0.172 % and `r017`'s 0.143 %; comments
   as the heat read (≥ 15 supports it, ≤ 5 means the fight did not come).
7. **The Mac.** Stage 5 is a Mac render (§6). The globe imagery and the ice thickness are Mac fetches. I can write everything else here.

## 5. Every claim, and where it stands

| on-screen claim | status | how it is checked |
|:--|:--|:--|
| the level does not move as floating ice melts | **EXACT** (computed, asserted) | `melt_check.py` §1: level identical at all 200 melt steps, max drift < 1e-9 cm |
| the meltwater fills exactly the space the ice took up | **EXACT** | the displaced volume equals the meltwater volume (58.69 cm³); §1 |
| the ice on a shelf raises the level, ending where the floating glass already was | **EXACT** | §1: +1.525 cm, linear in the melt, ends on 9.525 cm |
| "BARELY" for floating ice | **computed**, agrees with a published figure | §3: the salt-water remainder is **2.60 % of the displaced volume at ρ = 1.026**, unfitted, against **2.6 %** in Noerdlinger & Brower (search-level) |
| a real drink also does not overflow | **computed**, not on screen | §2: a 20 °C drink's level *falls* 0.17 mm and returns exactly when it warms back |
| all floating ice: about 1.5 inches (4 cm) | **SEARCH-LEVEL, one abstract** | Noerdlinger & Brower 2007, *GJI* 170:145–150. **Must be read at the primary** |
| Greenland: about 24 feet (7.42 m) | **SEARCH-LEVEL** | Morlighem et al. 2017, *GRL*. **Independent check:** volume × density ÷ ocean area gives 7.58 m, 2.1 % above 7.42 — *above*, as it must be, because ice below sea level is already in the sea's level |
| "ice on land holds ~1,640× what all floating ice does" | **not on screen** | §4 of `melt_check.py`; 65.6 m of land ice (Greenland 7.42 + Antarctica 57.9 + glaciers 0.32, all search-level) |

**No sentence in the script says "because".** The two mechanism sentences (B03 and B05) are volume statements that the
computation asserts.

## 6. 3D — the shots that only exist because it is 3D (Stage 3c)

- **The glass-to-planet pull-out (B06–B07).** One continuous move, no cut: a glass of water becomes an ocean becomes Greenland.
  **A flat reel cannot do it, and it is the sentence's own argument** — the same rule at two scales.
- **The glass probe has answered whether the first half is possible** (`scripts/glass_probe/README.md`, `glass_probe_sheet.png`).
  **Yes, with limits:** refractive glass, tinted water, cracked ice, the ring and the outlined space all render and read; nested
  transparent bodies do not (built around it). **~1.7 s per frame here, so the render is a Mac job.**
- **The camera is at the waterline for B01–B05**, so the ring is read edge-on. A dramatic angle that hid it would spend the 3D on the
  wrong thing — the `r009` lesson. **The camera is animated by moving the ROOT GROUP**, not the camera (CLAUDE.md). No hook is called
  in a branch.
- **The house and the tide staff are new geometry** (primitives; no asset). **Greenland is the globe engine** with a vertical
  exaggeration that must be declared on screen. **Neither has been tried yet.**
- **Not tried:** caustics on the table, condensation, a phone's eye. The ring and the outline are thin; **the phone check is the first thing
  to do on the Mac.**

## 7. What this script deliberately does NOT contain

- "Doesn't raise the sea" — it is false by 2.24 % of the ice's volume. The word is **"barely"**.
- A claim that sea ice or floating shelves **"don't matter"**, or any time scale or forecast.
- The word **"because"**; "Archimedes"; any CS word; any unit the viewer does not own (inches and feet only).
- The IPCC, a scientist's name, or "a study found" — nothing has been read at a primary.
- Wreckage, drowned streets, or a named city.
- A promise of the next reel.

## 8. Awaiting

**A human yes on this script**, with the decisions in §4 — above all #1 (the runtime and the cut list), #3 (the two numbers) and
#4 (the house). Nothing past the probe is built until this is approved. **The cheapest way to read it:** the copy column alone (§2), in
two minutes, then say what you would change.

## 9. BUILD-TIME AMENDMENTS, 2026-10-14 — what the build changed against the approved script

**Nothing below changes a claim, a number, or the reading budget. Each is a place the build could not do exactly what the table said, or where
the table contradicted itself. Each is recorded here so the contract is the truth, and each is the owner's to overrule.**

1. **B07 gained a line, and the beat times moved.** The §1 table promised *"vertical exaggeration declared on screen"* for the Greenland beat, but
   `read_budget.py` had no line for it, so the contract contradicted itself. **B07 is now "GREENLAND'S ICE: ON LAND. HEIGHT EXAGGERATED 30X."**
   (7 words, 3.8 s to read); B06 moved earlier (34.8–37.6) to pay for it. **Runtime 59.4 s, down from 59.6.** `emit_ts.py` asserts that the "30X"
   on screen is the exaggeration of the mesh (`EXAG = 30`). **The reading budget passes with every line.**
2. **Greenland is real elevation, not NASA imagery or ice thickness.** The container cannot reach either (`RESEARCH.md` §6). The shot is built from
   **AWS terrain tiles at zoom 4, which hold the ICE SURFACE** (checked at five stations, all within 1.2 %), and **Natural Earth's glaciated-areas
   polygons** for the ice mask (`projects/r021_whichice/greenland.py`). **It shows the ice standing above the sea. It does NOT show the ice
   THICKNESS or the bed** — the table said "the ice sheet at true thickness resting on rock above the sea", and **that cannot be drawn from surface
   data, and the bed under the middle of the sheet is below sea level in places**. The copy never claims it. **A Mac fetch of BedMachine would allow it.**
3. **The glass-to-planet move is a dissolve, not one continuous 3D move.** The glass pulling back until it is a speck on the sea **is** one continuous move in
   one scene. The sea to Greenland (36.4–38.0 s) and Greenland to the house (41.7–42.3 s) are **cross-dissolves of separate canvases**, because one
   float32 depth buffer cannot hold a 15 cm glass and a 2,600 km island (the `r009` lesson). **If you want the strict version it is a Mac task and a
   different build.**
4. **B06's tag is in the top caption zone with a leader line to a floe**, not set on the floe: the floe moves during the pull-out and a moving label cannot
   be read. The line follows the floe; the tag stays put, on a dark pill so it reads over pale ice.
5. **The house stands on a 6 ft bank**, two storeys of 17 ft, so that **24.3 ft of sea reaches just above the eaves** and the roof stays visible. It is
   calm: no wreckage, no streets, no named place. The ring is drawn round the tide staff; **the staff, not the house, is the ruler** (the house's height is
   a stylised guess and the reel never says how tall it is).
6. **The camera in the house scene stays above the final sea level** (36 ft). Below it, a single-sided sea plane vanishes when viewed from underneath.
7. **The glass echo in the close is in the lower right**, over the sea, small, with its own ring.
