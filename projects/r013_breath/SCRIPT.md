# r013 · I81 — script, v1

**GATE 4 — nothing is coded until this is approved.** No Python, no `.tsx`, no data module exists
yet. `gate0/GATE0.md` has both human gates already: **G2 (the sentence) — yes, 2026-09-16.
G3 (the send test) — yes, 2026-09-16.**

**The sentence:**

> "You don't sweat fat off — you breathe it out. Almost all of it leaves as the CO2 in your
> breath, not sweat, not the toilet, not 'turned into energy.'"

**The send test:** sent to a dieting friend, or to whoever just said "sweated it off" / "turned
into energy" / "the toilet" out loud — argument ammunition, corrected with one number.

**Runtime: 37 s.** **ONE ruler for the whole reel: mass, in kilograms/grams of the same fat.**
Never switches to percentages-of-something-else, calories, or an unrelated unit.

**Dimension (Stage 3c): 3D.** The shot that only exists because it's 3D — a single continuous
camera push from the wide human scene (person, scale, breath) down into a real ball-and-stick
model of one triglyceride molecule breaking apart, then back out to the wide scene. No cut. A flat
2D reel would have to cut between "the person" and "the molecule" as two separate shots; the
push/pull is the thing that keeps them the same object.

**Non-negotiable 6 constraint carried into every beat below:** the person + breath cloud (or the
kilogram-block of fat once it appears) must remain visible somewhere in frame for the *entire*
reel, including the molecule beat (B5) — the camera pushes into the breath cloud rather than
cutting away from it, so the recognisable object is never fully replaced by the abstraction, only
approached.

---

| t | Narration — the on-screen words, verbatim | On screen | Why this beat exists |
|:--|:--|:--|:--|
| 0.0–3.0 | **"YOU DON'T SWEAT FAT OFF."** | A person steps onto a bathroom scale. Before any text settles, their breath is already visibly drifting from their mouth (cold-morning style fog) and the scale's number is already ticking down. Title rides over the action, not before it. | Show before tell (non-negotiable 3): the payoff object — breath leaving the body — is on screen and moving inside the first second, not explained first. |
| 3.0–6.5 | **"YOU BREATHE IT OUT."** *(accent colour)* | Camera pushes in on the drifting breath cloud; the scale settles and holds on the lower number in the background. | Completes the hook sentence from B1 as one continuous thought, and keeps the SAME object (the breath) as the through-line the rest of the reel will return to. |
| 6.5–8.3 | **"NOT SWEAT."** | A sweat-droplet icon appears beside the figure, then is crossed out. | Names the first wrong folk-theory — the viewer has said or heard this exact guess, so the correction lands as an argument they recognise, not new information. |
| 8.3–10.1 | **"NOT THE TOILET."** | A toilet icon appears beside the first, crossed out the same way; both crossed icons stay in frame. | Second wrong theory, same crossed-out grammar established in B3 so the third lands instantly with no new setup needed. |
| 10.1–12.2 | **"NOT 'BURNED INTO ENERGY.'"** | A small flame icon appears, crossed out; all three crossed icons now sit together in frame. | The single most common wrong answer (surveyed at >50% among doctors, dietitians and trainers in the source paper) — held together with the other two so the beat reads as one settled list, not three separate claims. |
| 12.2–14.0 | **"SO WHERE DOES IT ACTUALLY GO?"** | Camera pulls back from the three crossed-out icons, which fade; the breath cloud (still drifting from B2) brightens/highlights. | Turns the correction into a question the next beat answers, so B5 feels earned rather than lectured — the `equation.verse` order (amazed/corrected first, understanding as the reward for staying). |
| 14.0–17.5 | **"A MOLECULE OF YOUR FAT MEETS THE OXYGEN YOU BREATHE IN."** | Continuous push (no cut) from the wide shot into the breath cloud; inside it, one real triglyceride molecule (C₅₅H₁₀₄O₆, drawn as an actual ball-and-stick model — 55 carbon, 104 hydrogen, 6 oxygen atoms) drifts to meet inbound O₂ molecules. The person's silhouette stays faintly visible at the edge of frame. | This is the "compute the animation, don't author it" beat — a real molecule, positioned and rotated by real geometry, not an authored diagram. Non-negotiable 6 kept by never fully leaving the breath-cloud frame. |
| 17.5–22.0 | **"IT BREAKS APART. THE CARBON LEAVES AS THE CO2 YOU BREATHE OUT."** | The molecule visibly splits on screen into 55 CO₂ + 52 H₂O fragments (the real balanced equation), CO₂ fragments drifting toward the mouth/breath cloud, H₂O fragments drifting the other way, smaller in number. | The falsifiable "X happens because Y" sentence non-negotiable 7 requires — the split shown is the literal stoichiometry (`compute.py` will assert the fragment counts match 55/52), not an animator's guess at proportion. |
| 22.0–25.0 | **"FOR EVERY KILOGRAM YOU LOSE —"** | Camera pulls back out to the wide shot (person, scale, breath). A one-kilogram block labelled "1 kg FAT" appears beside the scale, intact, about to split. | States the ONE ruler once, before any number lands, so the split that follows (B6b) has a unit already in the viewer's hand — the r009 lesson (one ruler, stated once, used consistently) applied on purpose. |
| 25.0–28.0 | **"840 GRAMS LEAVES AS BREATH. 160 GRAMS LEAVES AS WATER."** | The kilogram block visibly splits into two flows: the larger stream flows up into the breath cloud toward the mouth, the smaller trickles down; counters tick up to 840 g / 160 g in sync with the animation, not appearing as static text. | Pays off the ruler set in B6a with the real computed mass-balance number (GATE0.md §5, independently re-derived to 84.3%/15.7%, matching the published 84%/16%). Motion carries the number, not a title card. |
| 28.0–33.0 | **"MOST OF THE WEIGHT YOU LOSE, YOU LITERALLY BREATHE OUT."** | Full shot returns and holds: person breathing, scale reading the lower number, the breath flow now visibly the dominant stream against the small water trickle. Nothing cuts for the full 5 s; `useBreath()` keeps it alive. | The 2 s+ hold non-negotiable 5 requires — long enough to be read as a settled fact, not glimpsed. Restates the Gate 0 sentence almost verbatim, on the finished visual. |
| 33.0–37.0 | **"SEND THIS TO WHOEVER TOLD YOU TO SWEAT IT OFF."** *(primary)* / "follow — the rest of your body works like this too" *(smaller, secondary line)* | Held over the same finished visual from B7, no new cut. | Turns the GATE 3 send-channel answer into a literal, phone-performable instruction (non-negotiable 9), rather than a generic follow ask that nobody can act on immediately. |

---

## Checks before this goes to you

- **Read the Narration column alone, other columns covered (the r010 check):** it reads as one
  complete sentence-by-sentence argument — hook, three corrections, a question, the real
  mechanism, the real numbers, the restated claim, the ask. Nothing depends on the "on screen" or
  "why" columns to make sense.
- **ONE ruler:** kilograms/grams of the same fat, start to finish. No percentage, calorie, or
  unrelated unit substitutes for it anywhere.
- **No jargon beyond what Gate 0 already cleared:** "CO2" and "molecule" are the only
  chemistry-adjacent words, both taught before secondary school and already accepted at Gate 0.
  Nothing else technical appears (no "stoichiometry," no "triglyceride" spoken aloud — the formula
  is shown, not narrated).
- **Three-text-blocks-at-once max:** the busiest frame is B4 (three crossed icons + fading
  question), which is icons, not stacked text blocks.
- **Never more than one on-screen "why should I believe this" claim without a source:** the 55/52
  fragment count and the 840 g/160 g split are both asserted in `compute.py` before `emit_ts.py`
  is allowed to write the data module (non-negotiable 7 / the r011 lesson) — this is a Stage 4
  commitment this script makes, not yet built.

## Awaiting

**A human yes on this script.** Once approved it is a contract — a beat that cannot be animated as
written comes back here as a script change, not an improvisation at build time.

---

# v2 — the re-cut, 2026-09-16

**The v1 cut posted, GATE 5 passed, and the reading came back poor: average watch 5s on a 37s
reel (13.5%), skip rate flagged "Higher" than this account's own typical, and a retention curve
that never flattens — it bleeds continuously to near-zero by ~15-20s instead of holding a plateau
after the opening cliff the way this account's other reels do.**

**Diagnosis:** the reel TOLD the claim in text (B1-B2, 0-6.5s) long before it SHOWED anything
surprising — the molecule split and the real numbers (840g/160g) didn't land until 14-28s. That is
backwards from non-negotiable 3 ("the first surprising result lands by ~3s") and it is the exact
risk `gate0/GATE0.md` §4 flagged in writing before this was built: *"the visual needs a genuinely
real-time payoff... or it drifts toward being told rather than shown."* It also matches a number
already in this repo's ledger almost exactly — r009's pre-recut cut averaged 5s of a 40s reel
(12.5%) for the same reason (`brand_guide_software.md` §13, "THE 5-SECOND NUMBER").

**The fix: a new B0, 0.0-2.0s, a wordless flash-forward of the real payoff numbers** — "840g" and
"160g", large, bold, no label, no explanation — shown cold over the SAME wide shot (person,
breath) already live and moving underneath. Every beat from the old B1 onward is UNCHANGED
content, uniformly shifted +2.0s. Runtime: 37s → **39s**.

| t | Narration | On screen | Why |
|:--|:--|:--|:--|
| 0.0–2.0 | *(none — numbers only, no words)* | "840g" and "160g" pop in fast (0.0-0.35s), hold, fade out by 2.0s. The 3D wide shot (person, breath cloud already drifting) is visible underneath and already moving. | Show the actual payoff before any setup — a curiosity gap ("840g of *what*?") that the very next beat answers. Reuses the exact `PER_KG` values `emit_ts.py` already asserts for B10; not a new claim. |
| 2.0–5.0 | **"YOU DON'T SWEAT FAT OFF."** | *(was B1, unchanged, +2.0s)* | Now arrives AFTER the viewer has already seen something happen — the hook sentence explains what they just glimpsed, rather than being the first thing on screen. |
| 5.0–8.5 → 35.0–39.0 | *(all subsequent beats, unchanged content, +2.0s)* | — | — |

**What did NOT change:** the sentence, the send test, the chemistry, the 22 asserted claims (all
re-verified against the shifted timeline — `emit_ts.py`'s `BEAT_*`/`COUNTER_START`/`COUNTER_LOCK`
constants were shifted +2.0s in lockstep, not re-derived), the ONE ruler, the close. This is a
re-cut of ORDER, not of content — matching the r009/r010 precedent of a same-day recut after a
poor reading, not a new Gate 0/Gate 3 pass (the concept and send channel are unchanged).

## Awaiting (v2)

Both audits pass (motion 30% event density / 1.25s max dead spell; safe-area clean, 64-868 /
272-1524 against the 60-870 / 270-1540 box). Awaiting GATE 5 on the re-cut before it replaces the
posted v1.
