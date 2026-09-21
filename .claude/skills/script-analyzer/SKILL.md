---
name: script-analyzer
description: >-
  Studio pass 1 of 7. Use when breaking a finished narration script into timestamped scenes —
  the first pass of the studio pre-production chain (invoked by studio-director, or on
  "analyze the script", "break down the script", "segment the script into scenes"). Reads
  projects/NNN/script.md, segments it into 60–80 scenes of 8–12s at ~145 wpm, and writes the
  scene skeletons (id, t_start/t_end, duration, narration_segment, purpose, register, needs)
  into storyboard.json v2. No visuals, no prompts — story structure and timing only.
---

# Script Analyzer — Studio Pass 1: script → timestamped scene skeletons

**Role:** the script supervisor. You read the *approved* narration script and decide where
scenes begin and end — nothing visual yet. Output feeds the film-director (pass 2).

**Loads:** `projects/NNN/script.md` · `docs/cinematography.md` (§ SHOT-4, RHYTHM) ·
`brand_guide.md` §7 (beat sheet) · `docs/storyboard_schema.md` (v2 field contract).

**Fills:** per-scene `id`, `t_start`, `t_end`, `duration`, `narration_segment`, `purpose`,
`register`, `needs` — plus top-level `version: 2` and the `passes.script_analyzer` ledger
entry. Appends a "Pass 1 — Scene breakdown" table to `shot_list.md`.

---

## Procedure

1. **Strip and measure.** Remove fact-check markers `⟦n⟧` and stage directions. Count words
   per paragraph; at **~145 wpm ≈ 2.4 words/second**, estimate running time. Sanity: a 10–13
   min script ≈ 1,450–1,900 words.
2. **Cut on ideas, not lengths.** One scene = one idea (`SHOT-4`). A sentence that makes two
   points is two scenes. Natural cut points: sentence boundaries, breath points, register
   shifts (witness→engineer), the arrival of a number.
3. **Then check lengths.** Target **8–12s** (≈ 19–29 words). A 5s idea merges with its
   neighbour *only if they share a purpose*; a 16s idea splits at its internal pivot. Under
   8s is allowed only inside a deliberate staccato run (max one run per video, flag it for
   the film-director). Over 12s must be justified in `purpose` (`RHYTHM-6`).
4. **Timestamp.** `t_start`/`t_end` cumulative from 0:00, contiguous, no gaps. These are
   **estimates** — they get trued-up against the real VO recording later (the VO true-up
   step); write them anyway, they drive all downstream planning.
5. **Tag each scene:**
   - `purpose` — one line: what the viewer must understand or feel. If you can't write it,
     the scene shouldn't exist.
   - `register` — `witness` | `engineer` | `wit` | `data` (from the script's braid,
     `brand_guide.md` §6).
   - `needs` — coarse tags for later passes: `diagram`, `map`, `character`, `architecture`,
     `infographic`, `nature`. Multiple allowed.
6. **Map to the beat sheet.** Confirm the scene runs land on the brand beat structure
   (cold-open → title → stakes → how → scale → your-take → callback → outro). Note the beat
   boundaries in the shot_list section — the film-director paces against them.
7. **Write and validate.** Write the skeletons into `storyboard.json` (`version: 2`), stamp
   `passes.script_analyzer` with today's date, run
   `python prompt_builder.py <sb> --validate` (expect warnings only for deliberate
   exceptions), and append the breakdown table to `shot_list.md`:
   `| id | t_start–t_end | dur | register | purpose | needs |`.

## Rules

1. **Scene count lands in 60–80.** Outside that band, revisit step 2 — the script's idea
   density, not padding/cramming, decides the fix; if the script itself is the problem, say
   so to the user instead of forcing the count.
2. **Never rewrite narration.** If a segment resists segmentation (a 40-word compound
   sentence), flag it for the user — the script is theirs.
3. **`narration_segment` is verbatim** — it's the contract that every script word is covered
   by exactly one scene. Full coverage, no overlaps.
4. **Emotional peaks get a note.** Mark the 2–3 highest beats (the reveal, the scale payoff)
   in shot_list — the film-director spends the expensive shots there.

## Enrichment mode (retro-directing an existing v1 board)

When the storyboard already has scenes (a legacy v1 board): **do not re-segment.** Keep
existing scene boundaries and durations; add the missing skeleton fields (`id` from position,
`t_start`/`t_end` cumulative from existing durations, `purpose`, `register`, `needs` derived
from each scene's `narration_segment` and `scene_type`), set `version: 2`, stamp the ledger.

**Handoff:** film-director (pass 2).
