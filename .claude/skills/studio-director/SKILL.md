---
name: studio-director
description: >-
  The pre-production orchestrator. Use when a video's script is approved and it's time to
  board it — "run the studio", "board this script", "start pre-production", "direct video
  NNN". Invokes the seven studio passes in order (script-analyzer → film-director →
  storyboard-artist → scene-composer → asset-planner → motion-director → remotion-director) on
  the single accreting storyboard.json v2, enforces the human gates and pass ordering, runs
  --validate between passes, and delivers the finished board (storyboard.json + shot_list.md)
  ready for VO recording, generation, and the build session. Consult art-director first when the
  video enters new visual territory.
---

# Studio Director — the pre-production chain

**Role:** the producer-director who runs the room. You own *sequence and gates*, not
content: each pass's craft lives in its own skill; yours is making sure they run in order,
on a valid document, with the user signing off at the right moments.

**The chain** (each pass fills its blocks in `storyboard.json` v2 and appends its section
to `shot_list.md` — see `docs/storyboard_schema.md`):

```
script.md (approved)
   │
   ├─ [if new civilization/territory] art-director → motif kit into the bibles
   │
 1 script-analyzer      scene skeletons (id, t_start/t_end, purpose, register, needs)
 2 film-director        shot{} + axes/sides into continuity_registry   ── HUMAN GATE: sequence
 3 storyboard-artist    composition{} (frame, focal, bands, negative space)
 4 scene-composer       build / plate{} / layers[]  (generation becomes DERIVED here)
 5 asset-planner        assets resolved + _batches/batch_NN.json       ── HUMAN GATE: batch (charged)
 6 motion-director      camera{} + layers[].motion{} + texts[] (numbers)
 7 remotion-director    remotion_build{} + component scaffolds         ── HUMAN GATE: full board
   │
   ▼
🎙 record VO → true-up t_start/t_end/durations to the real read → vo_duration set
   ▼
asset-generation skill (plates + batch, gated by visual-accuracy-gate)
   ▼
animatic (video_assembler.py: stills + VO — pacing check, fix the board not the comps)
   ▼
build session (per remotion_build + families) → Layer 3 render QC → /remotion-render → Premiere conform
```

> **Pass 7 changed 2026-08-17.** The compositor is **Remotion**, not After Effects
> (`remotion-pipeline-decision` memory). `ae-director` is **retired**; `remotion-director`
> replaces it and fills `remotion_build{}`. Passes 1–6 are **unchanged** — they were already
> tool-agnostic. `ae_build{}` remains readable for the one board that predates the switch
> (`projects/001_roman_aqueduct`); do not write new `ae_build{}` blocks.

## Operating rules

1. **One document.** Every pass reads and writes `storyboard.json` v2 — never a side file.
   `shot_list.md` is the human-readable mirror, rebuilt/extended per pass. If a pass wants
   to record something with no block for it, it goes in shot_list notes, and consider a
   schema proposal — don't invent ad-hoc JSON fields.
2. **Order is strict; the ledger enforces it.** A pass only runs when its predecessors are
   stamped in `passes`. Re-running a pass invalidates downstream stamps for the scenes it
   changed — clear them and re-run those passes on the affected scenes only.
3. **Validate between passes:** `python prompt_builder.py <sb> --validate` after every
   pass. Warnings are triaged (deliberate exceptions get a note); errors block the next
   pass.
4. **Gates are real stops.** Sequence review (after 2), batch approval (after 5 — charged),
   full-board review (after 7). Present the relevant shot_list section, wait for the user.
   Never mark `passes` complete past an unanswered gate.
5. **Passes may be batched in one session** (1+2 together, then 3+4, then 5, then 6+7 is a
   natural rhythm) but each still writes its own blocks, stamps its own ledger entry, and
   appends its own shot_list section — the seams stay visible even when the work is fluid.
6. **VO before AE.** After the board is approved: user records (per
   `docs/voice_narration.md`), then true-up — measure the real read, correct
   `t_start`/`t_end`/`duration` per scene, set `vo_duration`, re-run `--validate`, and note
   scenes whose duration changed >1.5s (their motion specs may need re-pacing by pass 6 on
   just those scenes).
7. **The animatic protects AE hours** (`cinematography.md ANIMATIC-1/2`): after plates pass
   the accuracy gate and VO exists, cut the animatic and watch it once. Pacing fixes happen
   in the board (re-time/merge/cut scenes, re-stamp affected passes) — never improvised at
   the AE desk.

## Enrichment mode (retro-directing a v1 board)

For a project mid-production on a v1 board: run the same chain with each
pass in its documented enrichment mode — keep scene boundaries, durations, and existing
stills; derive skeletons from what exists; audit rather than redesign the sequence; describe
the real rendered frames; add layers only as additions; convert motion intent to numbers;
blueprint the builds. Gates still apply. The result is the same v2 board, at zero
regeneration cost except user-approved additions.

## Failure handling

- A pass that can't complete (script resists segmentation, sequence audit finds structural
  problems, budget blows past the gate) **stops and reports** — with the specific scenes and
  the options. No pass papers over an upstream problem downstream.
- Anything touching charged generation defers to the asset-planner/asset-generation gates.
  The studio chain itself is ₹0 by construction.

**Companions:** the seven pass skills + `art-director` · execution: `asset-generation`,
`visual-accuracy-gate` · parent checklist: `the-engineering-atlas-video` · canon:
`docs/cinematography.md`, `brand_guide.md`, `assets_library/STYLE_BIBLE.md`,
`docs/storyboard_schema.md`.
