# I87 — SCRIPT (GATE 4) · "Almost half the garbage patch is fishing nets."

**Written 2026-10-04, before any `.tsx`, data module or build. APPROVED (GATE 4) 2026-10-04 — "yes on all accounts": the hook stays as written ("by weight" in the payoff only), MEASURED 2015 stays on the source line, and the follow line stays a placeholder, to be flagged again at GATE 5.** No reel number is
claimed yet. It becomes `r018` when the build starts and this file moves to `projects/r018_*/`.
Accent `infrastructure #00D6F7` (the ocean, the currents, the buoys). **Amber is the fishing nets
and nothing else, in every frame.**

**The sentence (Gate 0 approved 2026-10-04; reworded at Stage 3 after the owner dropped straws):**

> "Almost half of the Great Pacific Garbage Patch, by weight, is one thing: fishing nets."

**Runtime 42 s · 3D (`@remotion/three`) · 6 beats · US English.**

---

## THE ONE RULER

**The only measured quantity on screen is SHARE OF THE PATCH'S WEIGHT.** It appears once as a
number, **46%**, on the scale in the payoff. Everywhere else it is said in words ("almost half").

Kept off that ruler on purpose:
- **Dates** ("2019", "4½ years later") label one real buoy's trip. They are never compared with
  anything.
- **No tonnage, no area, no piece count, no straw figure.** 79,000 t, 1.6 million km² and 1.8
  trillion pieces are all true and all answer different questions (the r009 lesson). The 75–86%
  from 2022 is a different base and stays off screen (owner, 2026-10-04).
- **"Hundreds" of buoys, not 425.** It is a count of witnesses, not a measurement of the patch.

| Figure on screen | Value | Source |
|:--|:--|:--|
| 46% / ALMOST HALF, BY WEIGHT | "at least 46%" of floating plastic mass is fishing nets | Lebreton et al., *Sci. Rep.* 8, 4666 (2018); survey 2015 (vessels) + 2016 (aerial) |
| MEASURED 2015 | the vessel survey year | same |
| DROPPED OFF TAIWAN IN 2019 | NOAA GDP buoy 300234066410130, deployed 2019-09-07 at 22.1°N 121.3°E by Taiwan | `research/real_tracks.py` |
| 4½ YEARS LATER | arrived within 500 km of the patch centre 2024-03-05, so 4.49 years | same |
| HUNDREDS OF OTHERS | 425 GDP buoys have come within 500 km of 32°N 145°W; 170 of them started > 2,500 km away | same |
| (the pile's position, not a number on screen) | the model's pile centres 103 km from the measured 32°N 145°W | `research/measure_patch.py`, reference setting; 185 of 216 settings within 1,000 km |

---

## The script

| t (s) | Copy — on screen, verbatim | On screen | Why this beat exists |
|:--|:--|:--|:--|
| **0.0–5.0** HOOK | **ALMOST HALF OF THE / GREAT PACIFIC GARBAGE PATCH** → (at 2.0 s) **IS ONE THING: / FISHING NETS.** | **Opens moving, low over open water** in the middle of the Pacific. A tangled **amber net** drifts toward the camera, rising and falling on the swell, then slides past close to the lens. Other debris (a crate, a bottle, fragments) bobs sparsely around it, in ink and grey. | **Shows the result, doesn't promise it** (non-negotiable 3). The net is on screen by 0.5 s, and the claim is complete by 2.0 s, inside the retention cliff. "Great Pacific Garbage Patch" is the recognisable noun, and nobody needs setup to picture it |
| **5.0–11.0** THE PICTURE IN YOUR HEAD | **MOST PEOPLE PICTURE A FLOATING ISLAND / OF BAGS AND BOTTLES.** → **IT ISN'T AN ISLAND. / IT'S SPREAD THIN ACROSS THE OCEAN.** | First, a dense floating "trash island" builds up on the water, the picture everyone has seen. Then it **dissolves outward**: the same pieces spread into a thin scatter over a much wider sea, and the camera rises to show how wide. | Names the belief the reel corrects, in the viewer's own image. Sets up the question the next beat answers: if it is spread out, why does it gather *here*? |
| **11.0–20.0** ONE REAL BUOY | **WHY HERE? / FOLLOW ONE REAL BUOY.** → **DROPPED OFF TAIWAN IN 2019.** → **4½ YEARS LATER, IT WAS HERE.** | The camera keeps rising to a **3D globe of the North Pacific** (Japan, Taiwan, California, Hawaii recognisable). One marker, **NOAA buoy 300234066410130**, travels its **real recorded track** from off Taiwan across the ocean to the patch, with a small date clock (2019 → 2024). The track draws behind it. | The mechanism, shown by a real object, not a drawing. A buoy is the one witness that is nameable, real, and actually made the trip. The date clock is a label, not a ruler |
| **20.0–28.0** WHY IT PILES UP | **HUNDREDS OF OTHERS DID THE SAME.** → **SCATTER DEBRIS ACROSS THE WHOLE OCEAN, / LET THE REAL CURRENTS CARRY IT…** → **…AND IT PILES UP IN ONE PLACE.** | Real tracks of other buoys that reached the patch fade in as thin lines converging on it. Then **thousands of dots** appear spread evenly across the whole North Pacific and are carried by the **current model built from 28,728 real buoys**: they swirl clockwise and **pile up between California and Hawaii**. The measured patch outline (Lebreton) fades in **where they land**. | The reel's own contribution: the patch is not a dumping ground, it is where the ocean's surface currents converge. The model was never told where the patch is, and the pile lands 103 km from the measured centre. Amazement (the pile forming) comes before the explanation |
| **28.0–36.0** PAYOFF | **SO WHAT IS IT MADE OF?** → **ALMOST HALF OF IT, BY WEIGHT, / IS FISHING NETS.** | Camera dives back to sea level in the patch. **A balance scale** rises out of the water: **amber fishing nets on one pan, everything else on the other** (crates, bottles, bags, fragments), nearly level. **46%** rides on the nets' pan. Small source line beneath: **MEASURED 2015 · LEBRETON ET AL.** | The hook's claim returns, now earned, and the one number arrives on a nameable object (a scale), not a chart. "By weight" is load-bearing: counted piece by piece, the patch is mostly tiny fragments |
| **36.0–42.0** CLOSE | **IT'S NOT JUST WHAT WE THROW AWAY. / IT'S WHAT FISHING BOATS LEAVE AT SEA.** → follow line | The net from the hook drifts slowly past again over a wide, calm view of the ocean. Held through the follow line. | **Names the argument** the reel lands in, who is to blame for ocean plastic (the r017 lesson: an argument the reel doesn't name isn't one the viewer brings). Ends on the object the reel opened on |

**The copy column read alone, with the other columns covered (the r010 check):**

> Almost half of the Great Pacific Garbage Patch is one thing: fishing nets. Most people picture a
> floating island of bags and bottles. It isn't an island. It's spread thin across the ocean. Why
> here? Follow one real buoy. Dropped off Taiwan in 2019. 4½ years later, it was here. Hundreds of
> others did the same. Scatter debris across the whole ocean, let the real currents carry it, and it
> piles up in one place. So what is it made of? Almost half of it, by weight, is fishing nets. It's
> not just what we throw away. It's what fishing boats leave at sea.

A complete thought, with no beat needing its picture to make sense. **"Here" is the one word that
leans on the frame** (beats 3 and 4). It always appears while the patch is the thing on screen, and
"why here?" follows directly on "spread thin across the ocean", so in the copy alone it still reads
as "why in this one place".

**Text blocks on screen at once:** never more than three (copy, the date clock in beat 3, the source
line in beat 5).

---

## Accuracy, sentence by sentence (non-negotiable 7)

| Copy | True because | Not claimed |
|:--|:--|:--|
| ALMOST HALF … IS ONE THING: FISHING NETS | "at least 46%" of mass is fishing nets (Lebreton 2018) | not "most". Not "of ocean plastic": always "of the patch". **The hook says "almost half" without "by weight"; the payoff adds it.** If that is too loose for the hook, the fix is "ALMOST HALF ITS WEIGHT" (a G4 call, below) |
| MOST PEOPLE PICTURE A FLOATING ISLAND OF BAGS AND BOTTLES | **a claim about belief, not about the patch.** Supported by how it is commonly reported (the "island" framing is what the 2018 coverage and the Yale and National Geographic explainers correct) | that bags and bottles are absent: they are in the other 54% and are drawn on the scale |
| IT ISN'T AN ISLAND. IT'S SPREAD THIN ACROSS THE OCEAN | mean concentration of order 50 kg/km² over 1.6 million km² (79 kt ÷ 1.6 M km²) | a figure. None is shown |
| DROPPED OFF TAIWAN IN 2019 | deployed 2019-09-07, 22.1°N 121.3°E, deploying country Taiwan | that it is debris. It is a buoy, and the copy says buoy |
| 4½ YEARS LATER, IT WAS HERE | first fix within 500 km of 32°N 145°W on 2024-03-05 | **that it stayed.** Its last signal was 2024-04-03 (`RESEARCH.md` trap) |
| HUNDREDS OF OTHERS DID THE SAME | 425 buoys reached within 500 km; 170 from > 2,500 km away | that all of them came from Asia |
| SCATTER DEBRIS … LET THE REAL CURRENTS CARRY IT … IT PILES UP IN ONE PLACE | the transition model built from 48.9 M real buoy positions. 216 of 216 settings enrich the patch box, 185 of 216 put the pile within 1,000 km of the measured centre | **why** the currents converge (wind-driven convergence). The reel shows that they do, and asserts no mechanism it did not test. Also not the patch's size or tonnage: the model predicts where, not how much |
| ALMOST HALF OF IT, BY WEIGHT | ≥ 46% | today's share. The source line says 2015 |
| IT'S WHAT FISHING BOATS LEAVE AT SEA | fishing nets are fishing gear by definition; "leave" covers lost, abandoned and discarded | that they are dumped on purpose, or which country's boats |

`emit_ts.py` will assert: the buoy marker reaches the patch on the frame "4½ YEARS LATER, IT WAS
HERE" appears and not before; the patch outline is drawn at Lebreton's position and the pile at the
model's, never snapped together; the scale's tilt is computed from 46/54.

---

## Decisions for you at this gate

1. **"By weight" in the hook.** The hook says "almost half … is one thing: fishing nets" and adds
   "by weight" only in the payoff, because a 2-second hook can't carry the qualifier. **I recommend
   keeping it as is**: it is true as stated, since the only way to measure "half" of floating
   plastic that anyone reports is by weight. The stricter option is **"ALMOST HALF THE WEIGHT OF THE
   GREAT PACIFIC GARBAGE PATCH / IS FISHING NETS."**
2. **"MEASURED 2015"** stays on the source line unless the 2024 paper shows the share still holds
   (you are reading it). If it does, the line becomes "LEBRETON ET AL." alone.
3. **The follow line (non-negotiable 9).** Placeholder: **"Follow for how the planet actually
   works."** Same as r017. Give me a better one, or I keep it and flag it again at GATE 5.
