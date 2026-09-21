---
name: asset-planner
description: >-
  Studio pass 5 of 7. Use after scene-composer to source every layer asset (invoked by
  studio-director, or on "plan the assets", "source the assets", "build the shopping list").
  Diffs all layers[].asset entries against assets_library/INDEX.md, resolves reuse to real
  paths, batches the misses into assets_library/_batches/batch_NN.json in generate_asset.py's
  format, and writes the shopping list to shot_list.md. Ends at a HUMAN gate — the batch is
  charged generation, nothing is generated without approval.
---

# Asset Planner — Studio Pass 5: layer needs → sourced assets + generation batch

**Role:** the asset librarian and procurement desk. Every `layers[].asset` in the board
either resolves to an existing library file or becomes one entry in a generation batch.
This pass is where 70% of long-run speed compounds: the library grows once, is reused
forever.

**Loads:** `storyboard.json` (pass 4) · `assets_library/INDEX.md` (the catalog) ·
`assets_library/STYLE_BIBLE.md` (naming, categories, generation rules, view conventions) ·
`assets_library/_batches/` (numbering).

**Fills:** resolves `layers[].asset` paths in place; writes
`assets_library/_batches/batch_NN.json`; records recurring assets in
`continuity_registry.props`/`characters`. Stamps `passes.asset_planner`. Appends "Pass 5 —
Asset plan" to `shot_list.md`.

---

## Procedure

1. **Sweep the board.** Collect every `layers[].asset` across all scenes; group identical
   and near-identical requests (three scenes wanting "a drifting cloud" = one asset, reused).
2. **Resolve against INDEX.md.** Exact or serviceable match → replace the `generate:` entry
   with the real path. *Serviceable* means: right category, right view convention, right
   palette — placement/scale/flip happen in AE for free. When in doubt, reuse.
3. **Batch the misses.** Each unresolved `generate:` becomes one spec in
   `assets_library/_batches/batch_NN.json` (next free NN), in **`generate_asset.py`'s
   existing format**:
   ```json
   { "category": "characters", "name": "surveyor_01", "view": "flat",
     "subject": "ONLY a single male surveyor in ochre turban ... floating alone, no ground,
                 no scene, absolutely nothing else", "notes": "...", "anchor": false }
   ```
   Follow STYLE_BIBLE generation rules: one element per image, hard-isolation wording,
   flat magenta background, declared view; `"anchor": false` for simple props (the anchor's
   *subject* can leak — the water_pot_01 lesson).
4. **Name for the future, not the video.** `banyan_01`, not `NNN_topic_tree` — assets are
   cross-video by design. Variants get `_02`, `_03`.
5. **Register recurrences.** Any asset appearing in 2+ scenes goes into the
   `continuity_registry` with its canonical path (`CONT-2`).
6. **Write the shopping list** to `shot_list.md`: reused (path ← scenes) / to generate
   (spec ← scenes) / count + estimated cost (≈₹7.4/image ×(1 + expected retries)).
7. **STOP — HUMAN GATE.** Generation is charged. Present the batch; the user approves,
   trims, or edits. On approval the batch runs via
   `python generate_asset.py --batch assets_library/_batches/batch_NN.json` (the
   `asset-generation` skill's stage), and every new asset passes the
   `visual-accuracy-gate` **Layer 2.5 asset gate** before entering the library.

## Rules

1. **The library is append-only quality.** Nothing enters INDEX.md without passing the
   asset gate; a bad asset poisons every future video that reuses it.
2. **No speculative generation.** Batch only what the board actually cites. "While we're at
   it" assets are how budgets die — a genuine future-library idea goes in the shot_list
   notes, unbatched.
3. **One asset, one subject.** A spec asking for "soldiers marching" is three assets and a
   layout note, not one image.
4. **Respect categories:** `characters` / `nature` / `architecture` / `military` / `props`
   / `diagram` / `overlays` — INDEX.md's taxonomy is the catalog's usability.

**Handoff:** motion-director (pass 6) — which can proceed in parallel with generation, since
motion specs don't depend on the pixels existing yet.
