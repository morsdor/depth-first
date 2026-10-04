# Gate 0 — `I87`, "the Pacific garbage patch isn't straws"

Proposed as the next reel (`r018` if built), 2026-10-04. Backlog id `I87` (§2 *Maps and real
geography* → accent `infrastructure #00D6F7`). Reasoned from scratch: the owner asked for sea ideas
and picked this from seven candidates the same day (the others were the cargo-ship sulphur meme,
Stockholm's falling sea, the 2004 tsunami, rip currents, the sea-surface "hills" and rogue waves).

Nothing has been built. This file and `payoff_frame.png` are the two artefacts CLAUDE.md requires
**before** any Python, any `.tsx`, any data module.

## 1. The sentence

> **"The Great Pacific Garbage Patch isn't a floating island of straws and bags. Almost half of it,
> by weight, is fishing nets."**

No CS or oceanography word: no "gyre", "microplastic", "ghost gear", "convergence zone". "By
weight" is load-bearing. Counted piece by piece, the patch is mostly tiny fragments, so the sentence
is only true about weight and has to say so.

## 2. Who does the viewer send this to, and what are they proving? (GATE 3, drafted)

**Sent to whoever is defending, or mocking, a plastic-straw ban, to prove that the biggest single
thing in the patch comes off fishing boats, not out of a drink.**

| condition | verdict |
|:--|:--|
| Personally witnessed the evidence | **Partly.** Everyone has handled a paper straw and seen the "island of trash" photo, and the photo is usually not the patch. Nobody has seen the patch itself. Weaker than r005's seatback map, about level with r016's petrol receipt |
| A dispute already running, that a non-specialist is in | **Yes.** Straw bans (California 2018, the UK 2020, the US federal phase-out argument) are a standing culture-war fight. "Straw bans are pointless, it's the fishing industry" is a common reply, and so is the counter-reply |
| Resolves to one repeatable thing | **Yes:** "almost half of it is fishing nets" |

**Heat: what the loser stands to lose.** Identity on both sides. For one side the straw ban is a
visible moral act, and this says it barely touches the patch. For the other, "the ocean plastic
thing is exaggerated", and this says the patch is real, 1.6 million km², and growing. **Unlike
`r017`, the copy names the fight**: "straws" is on screen in the hook. That is the r017 lesson
applied: an argument the reel refuses to name may not be one the viewer brings to it.

**Saturation risk, stated up front.** Netflix's *Seaspiracy* (2021) put this exact 46% figure in
front of a large audience and drew a wave of fact-checks, some of them overstating it ("46% of
*ocean* plastic"). So the number is not new to everyone. The part nobody has shown is **why it
all ends up in one place**: real ocean currents, run, carrying debris from the whole basin into one
spot. That is what the reel adds, and it is visible by nature.

## 3. The payoff frame

`payoff_frame.png`, drawn by `mock_payoff.py` (matplotlib + PIL, GSHHG coastlines offline). A
sketch, not a render.

- The North Pacific with Japan, California and Hawaii. A cloud of debris spirals in from the whole
  basin and piles up between California and Hawaii, inside a dashed cyan outline: 1.6 MILLION KM².
  **The spiral is hand-drawn.** The build replaces it with real current data (§6).
- Below it, a balance scale. **Fishing nets (the one amber element) on one pan, everything else on
  the other**: bottles, crates, bags, a few straws. Nearly level, 46 against 54.
- The script asserts every text block sits inside the safe area.

**The build will not be this frame.** In 3D the move is: the camera rides one piece of debris
across the Pacific into the patch, drops to sea level where the water looks almost empty, then the
scale is filled from what was collected.

## 4. Kill conditions: the gate's own three

| Condition | Verdict |
|:--|:--|
| The sentence needs a CS word | **Pass.** None |
| The payoff frame shows an object the viewer has never seen | **Pass, with one risk.** An ocean map, a fishing net and a balance scale are all nameable with the sound off. The risk is the scale reading as a disguised bar chart. It must hold real objects, not bars |
| The amazement depends on understanding first | **Pass.** Debris from the whole Pacific converging on one spot is striking before any explanation; *why* it converges is the reward for staying |

Non-negotiable 6: **the ocean stays on screen the whole reel**, and the scale sits over it rather
than replacing it.

## 5. Numbers, and where they came from

| Figure | Source | Status |
|:--|:--|:--|
| ≥ 79,000 t of floating plastic in the patch | Lebreton et al., *Sci. Rep.* 8, 4666 (2018) | search-level, **paper still to be read** |
| ≥ 46% of that mass is fishing nets | same | search-level, **"at least", must keep the qualifier** |
| 1.6 million km² | same | search-level |
| 1.8 trillion pieces, > 94% of them under 5 mm | same | search-level. **This is why "by weight" is non-negotiable** |
| > 75% of the mass is pieces > 5 cm | same | search-level |
| What the other 54% is made of, and where straws sit in it | **unknown** | **LEAD.** "Isn't straws" needs a figure for straws or a category containing them. If Lebreton has no such category, the hook changes |
| A later paper attributing most identifiable hard plastic to industrial fishing | Lebreton et al. 2022 (from memory) | **LEAD, unverified** |

## 6. Licence and feasibility

- **Lebreton 2018 is open access (CC BY 4.0 per Scientific Reports' policy, to confirm).** The
  figures are facts and citable regardless.
- **The currents. Preferred: NOAA's Global Drifter Program**, thousands of real satellite-tracked
  buoys since 1979, US government data (public domain, to confirm). Real buoys drifting into the
  patch is the "re-run somebody else's experiment" shape: van Sebille, England & Froyland
  (*Environ. Res. Lett.* 2012) built a transition model from exactly these drifters and showed the
  garbage patches form from it. Our model can reproduce theirs, and their result is the outside
  number to check it against (non-negotiable 7).
- Fallback: OSCAR or Copernicus surface currents (free, registration).
- **This container's egress proxy blocked nature.com and USGS today**, so the downloads may have to
  happen on the Mac.

## 7. Accuracy risks the build must not skate past

1. **"The patch" is not "the ocean".** The 46% is about the floating mass in the patch. It says
   nothing about all ocean plastic, most of which never reaches a gyre. The copy must never
   generalise. That is the exact error the *Seaspiracy* fact-checks caught.
2. **"Almost half" ↔ "at least 46%".** Both are honest. "Most" would be false.
3. **By weight, not by count.** A frame that shows *pieces* must not imply the 46%.
4. **"Isn't straws"** is a claim about the other 54% and has no figure yet (§5). If Stage 3 cannot
   support it, the hook becomes "isn't what you think" or names bags and bottles instead.
5. **The drift animation is a model.** If drawn from a drifter-derived transition model, say so in
   `NOTES.md`, and check where the debris accumulates against the published location of the patch.
6. **The 2018 survey is a snapshot.** Use the paper's year on screen, not "today".

## 8. Awaiting

**A human yes on the SENTENCE.** Gate 0 is not mine to pass. Then GATE 3: the drafted answer in §2
needs the owner's yes, or a better name for who sends it.
