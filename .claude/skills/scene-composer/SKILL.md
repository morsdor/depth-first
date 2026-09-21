---
name: scene-composer
description: >-
  Studio pass 4 of 7. Use after storyboard-artist to decide how each composed frame gets
  BUILT (invoked by studio-director, or on "compose the scenes", "plan the layers", "decide
  plates vs assembly"). Fills build ("plate"/"assembly"/"plate+layers"), plate{} (subject,
  reference_image, visual_facts, accent) and layers[] (asset, role, placement, scale, parallax)
  in storyboard.json v2. This is where image generation stops being independent — every plate
  and asset need is DERIVED from the frame. Never generates anything itself.
---

# Scene Composer — Studio Pass 4: frames → build plans (plates & layers)

**Role:** the layout/technical-direction department. For each frame you answer: *how is
this picture physically constructed?* An AI-generated plate? An assembly of library assets
on a simple background? A plate with library elements layered on top? You specify; the
asset-planner (pass 5) sources; `asset-generation` executes. **You never generate.**

**Loads:** `storyboard.json` (passes 1–3) · `docs/cinematography.md` § COMP-3 ·
`assets_library/STYLE_BIBLE.md` (view conventions, what makes a good library asset) ·
`assets_library/INDEX.md` (what already exists — prefer reuse) ·
`docs/storyboard_schema.md` (block contract).

**Fills:** per-scene `build`, `image` (plate builds), `plate{}`, `layers[]` (assets named
but not yet resolved). Stamps `passes.scene_composer`. Appends "Pass 4 — Builds" to
`shot_list.md`.

---

## The build decision (the doctrine)

| `build` | When | Examples |
|:---|:---|:---|
| **`plate`** | The frame IS one continuous artwork — hero architecture, cross-sections, maps, anything whose geometry must be *accurate as a whole* | the stepwell vista, the aqueduct section, the route map |
| **`assembly`** | The frame is a *stage* — characters/props acting on a simple background; geometry is arrangement, not architecture | the surveyor party arrives, villagers at the well rim (flat view) |
| **`plate+layers`** | A plate base that needs live elements or parallax bands on top | stepwell plate + drifting clouds + a tiny descending figure |

Rules of thumb: real, photographed structures → plate (with `reference_image` +
`visual_facts` — accuracy can't be assembled from generic parts). Narrative/character beats
→ assembly (reuse compounds: by video 10 these cost nothing). Anything the motion brief
wants to *move independently* must be its own layer — a motion need is a layer need.

## Procedure

1. **Decide `build`** per the doctrine. When torn between plate and plate+layers, ask:
   "will anything here move independently, or parallax?" If yes → the moving thing is a
   layer, not part of the plate.
2. **For plate builds, write `plate{}`:**
   - `subject`: the lean prompt subject (boilerplate — style card, scene recipe, accent —
     is injected by `prompt_builder.py`; write only what's specific). It must *exclude*
     anything that's coming in as a layer, and honour the reserved negative space
     (`COMP-2`) — e.g. "sky band left clear upper-third".
   - `reference_image` + `visual_facts[]` for real structures (`PRIME-3`).
   - `accent`: only if pass 2 marked this a key scene; else `null`.
   - `image`: `images/scene_NN.png`.
3. **For every layered element, write a `layers[]` entry:**
   - `asset`: an existing `assets_library/<category>/<name>.png` path (**check INDEX.md
     first — reuse is the whole point**, `CONT-2`), or a request:
     `"generate:<category>/<name> — <one-line spec, view convention, isolation notes>"`.
   - `role` (`bg`/`mid`/`fg`/`overlay`), `placement` (where in frame, in words),
     `scale_hint`, `parallax` (bg ≈ 0.25 · mid ≈ 0.6 · fg = 1.0 — only meaningful if the
     camera will move; default 1.0).
   - Leave `motion` as `null` — that's the motion-director's (pass 6).
4. **Assembly backgrounds** are specified as the simplest thing that works: flat parchment
   + ground line, a soft horizon band, or an existing bg asset. Simple stages are the
   Oversimplified look — don't art-direct them into plates.
5. **Recurring elements must be the same file** across all their scenes (`CONT-2`); record
   them in `continuity_registry.props`/`characters`.
6. **Write, stamp, append** the builds table to `shot_list.md`
   (`| id | build | plate subject / stage | layers (asset ← role) |`).

## Rules

1. **Reuse before request.** A `generate:` entry for something 80%-covered by an existing
   asset is a fail — variants (`_02`) are for genuinely different poses/states, not taste.
2. **A plate never contains a layer's subject.** If the cloud drifts, the plate's sky is
   empty. Double-painted elements are the classic compositing bug — the plate subject line
   must actively exclude layered subjects ("empty sky, no clouds").
3. **Respect the view conventions** (STYLE_BIBLE): isometric assets on isometric plates,
   flat assets on flat stages — never across.
4. **≤5 layers per scene** (excluding the plate). More means the frame is over-populated —
   back to the storyboard-artist.

## Enrichment mode

The plates exist and already contain their full scenes: `build` is `plate` for all
(populate `plate{}` retroactively from existing `image_prompt`/`visual_facts`/
`reference_image`). Add `layers[]` only where motion genuinely wants an independent element
(clouds, a figure, an arrow) — as *additions on top* of the existing still, sourced from the
library. Don't propose repainting existing plates.

**Handoff:** asset-planner (pass 5).
