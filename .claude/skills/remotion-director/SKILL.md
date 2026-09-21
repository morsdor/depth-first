---
name: remotion-director
description: >-
  Studio pass 7 of 7. Use after motion-director to turn motion specs into Remotion build
  blueprints (invoked by studio-director, or on "plan the remotion build", "write the
  composition specs", "scaffold the scenes"). Fills remotion_build{} per scene in
  storyboard.json v2 — composition family, props, child sequences in FRAMES, brand motion
  refs, render spec (3840x2160@30, 30-frame handles, clips/scene_NN.mp4) — and scaffolds
  React components into remotion/src/. Delegates all framework correctness to Remotion's
  official Agent Skills. Ends at the final HUMAN gate: the complete shot_list.md review
  before generation and the build session. Replaces ae-director (AE pipeline, retired
  2026-08-17).
---

# Remotion Director — Studio Pass 7: motion specs → composition blueprints

**Role:** the technical director. You translate each scene's motion spec into the concrete
Remotion build: which composition family it belongs to, what props it takes, what child
sequences fire on which **frame**, which brand motion constants it uses, and what renders.
After this pass the components get written and the user *tunes*; nothing is designed at the
keyboard.

**Loads:** `storyboard.json` (passes 1–6) · `brand_guide_software.md` **§5 (hard motion
limits) + §3/§4 (color, type) + §11 (the code map)** · `remotion/src/brand/` (the compiled
constants) · `remotion/src/families/` (existing composition families) ·
`docs/cinematography.md` (craft canon).

**Fills:** per-scene `remotion_build{}`. Scaffolds components under `remotion/src/`. Stamps
`passes.remotion_director`. Appends "Pass 7 — Remotion blueprints" to `shot_list.md`, runs
the direction QA checklist, and presents the finished board at the **final human gate**.

---

## The division of labor — read this first

Remotion ships **12 official Agent Skills** (`npx skills add remotion-dev/skills`). They are
not competitors to this chain; they are the layer beneath it.

> **This chain owns *what* and *why*. Remotion's skills own *how*.**
> You decide that scene 34 pulls back 8% to reveal the rack row, holds 0.5s, and lands the
> amber counter on frame 210. You **never** decide from memory what Remotion's API for that
> is — you delegate to `/remotion-markup` and `/remotion-docs`.

| Remotion skill | Use it for |
|:--|:--|
| `/remotion-markup` | **Every component you scaffold.** Idiomatic markup, `<Sequence>` nesting, `useCurrentFrame` discipline |
| `/remotion-docs` | Any API question. **Never guess a prop name** — fetch the page |
| `/remotion-studio` | The review loop at the final gate, and the user's tuning sessions |
| `/remotion-render` | Producing `clips/scene_NN.mp4`. Owns the output contract |
| `/remotion-captions` | Burned-in captions from the VO — directly serves the non-technical-viewer goal (§1) |
| `/remotion-maps` | Mapbox/GeoJSON scenes: cable routes, datacenter geography, outage blast radius, founding locations. **A capability the AE pipeline did not have** — reach for it |
| `/remotion-interactivity` | Exposing scene props as Studio-editable. **The trajectory lever** — see Rule 7 |
| `/remotion-create` | One-time project scaffold; per-video `<Composition>` registration |
| `/remotion-best-practices` | Umbrella; keep installed |
| `/remotion-upgrade` | Version maintenance |

Not needed: `/remotion-saas`, `/remotion-multimedia`.

---

## Project layout — one shared project, per-video scenes

The compounding lives in `brand/` and `families/`. Never scaffold a fresh Remotion project
per video.

```
remotion/
  src/
    Root.tsx                    registerRoot — every video's <Composition>s
    brand/
      tokens.ts  fonts.ts               ← brand_guide_software.md §3/§4/§5, compiled
                                          (ONE tokens file — see §11: it is the spec and
                                           the validator, never a runtime import)
    families/                            ← the reusable shot archetypes (was: AE template comps)
      PlatePush.tsx  Stage.tsx  Diagram.tsx  Counter.tsx  MapRoute.tsx  CodePanel.tsx
    components/
      Callout.tsx  Num.tsx  Lower.tsx  Highlight.tsx
    videos/
      s001/  Scene01.tsx … Scene72.tsx
```

---

## Procedure

1. **Group scenes into composition families.** Scenes sharing a structure share a family
   component (`PlatePush`, `Stage`, `Diagram`, `Counter`, `MapRoute`, `CodePanel`). Name the
   family in `remotion_build.family`. **By video 3 the families ARE the pipeline's speed** —
   a new scene should be props, not code. Only add a family when ≥3 scenes need it.

2. **Convert every time to FRAMES, and own the conversion.** Passes 1–6 speak seconds;
   Remotion speaks frames. At 30fps: `frames = round(seconds × 30)`. Handles are
   **30 frames** each end. A scene's composition duration is
   `round(duration × 30) + 60`. **Off-by-one-frame drift is this pipeline's classic bug** —
   compute once, here, and write the integers into the board so nothing downstream re-derives them.

3. **Per scene, write `remotion_build{}`:**
   ```json
   "remotion_build": {
     "component": "videos/s001/Scene34.tsx",
     "family": "PlatePush",
     "props": { "plate": "plates/scene_34.png", "accent": "cyan", "push": 8, "holdFrames": 15 },
     "sequences": [
       { "component": "Callout", "from": 45, "durationInFrames": 90, "props": { "text": "835 MW", "mono": true } }
     ],
     "motion_refs": ["EASE.standard", "CAMERA.pullBack", "TEXT_IN"],
     "durationInFrames": 390,
     "render": { "clip": "clips/scene_34.mp4", "handles_frames": 30 }
   }
   ```
   - `family` + `props` carry the shot. If a scene needs a prop no family accepts, either
     extend the family (if ≥3 scenes want it) or mark it a one-off component.
   - `sequences[]` is frame-accurate child timing — every callout, label, counter, highlight.
   - `motion_refs[]` names which **brand constants** the scene uses. This is the audit trail
     for §5 compliance; a scene with an inline easing curve fails review.

4. **Enforce §5 at the type level, not by inspection.** When scaffolding families, clamp:
   `push` is a union of allowed values (not `number`), easing comes from `EASE`, text in/out
   from `TEXT_IN`/`TEXT_OUT`. **A brand rule that can be violated by typing a different
   number is not enforced.** This is the single biggest advantage this pass has over the
   retired AE pass — use it.

5. **Decide what gets scaffolded vs hand-tuned.** Scaffold when ≥3 scenes share a family, or
   the build is mechanical (import plate, set push, place two callouts). Leave for hand-tuning
   when the timing is taste-heavy — a comedic beat, a reveal's exact landing frame. Delegate
   the actual markup to `/remotion-markup`; your job is the blueprint, not the syntax.

6. **Sequence the build session** in `shot_list.md`: families first (one component unlocks
   many scenes), then per-video scenes, then the taste-heavy one-offs last. Note which
   scenes the user should tune in Studio and what to look at.

7. **Run the direction QA checklist** (`docs/cinematography.md` §11) plus the §5 audit: any
   inline curve, any `push` outside 3–9%, any spring with `damping < 200`, any text under
   36px at 4K, more than one amber element in a frame, >2 moving elements per scene.

8. **STOP — FINAL HUMAN GATE.** Present `shot_list.md` complete (all seven pass sections + QA
   result). On approval the board freezes: plates/assets generate (`asset-generation`), VO
   records if not already done, and the build session begins.

---

## Rules

1. **The blueprint must be executable cold.** Nobody should have to re-derive a decision
   mid-build. If a question could come up, answer it in `remotion_build` now.
2. **Handles are law.** Every clip renders **30 frames longer at both ends** than nominal;
   Premiere conform stays trim-only (`RHYTHM-1`). A clip without handles gets rebuilt.
3. **Never guess Remotion's API.** `/remotion-docs` exists precisely so this pass doesn't
   hallucinate a prop. A wrong prop name that renders anyway is the worst failure mode here.
4. **Brand literals are hardcoded in scenes; `brand:check` is what enforces them.** Do
   **not** import tokens into an interactive `style` prop — Studio only makes a style
   canvas-interactive when every value is an inline literal, and `color: BASE.amber` greys
   the control out. Scenes hardcode; `remotion/src/brand/tokens.ts` is the source of truth;
   `npm run brand:check` scans scene files and fails on drift (off-brand hex, non-brand
   easing, spring under damping 200, sub-36px type, CSS `transition`). Import tokens freely
   **outside** interactive styles — `<Composition>` metadata, `defaultProps`,
   `calculateMetadata()`, the check script.
5. **Families compound; name them stably.** `PlatePush`, `Stage`, `Diagram`, `Counter`,
   `MapRoute`, `CodePanel`. Next video's board reuses the names, not just the idea.
6. **Motion is information (§5).** If a move doesn't tell the viewer something, delete it.
   The hardest technical beat of every video is a **static** frame — check that one exists.
7. **Build toward the user holding the wheel.** Anything the user will want to nudge —
   a landing frame, a push amount, a callout position — gets exposed via
   `/remotion-interactivity` so it's tunable in Studio **without touching code**. This is the
   stated long-term direction: AI scaffolds the machinery, the creative call stays with the
   user. Design every family with that in mind from scene one.

---

## Enrichment mode

Retro-fitting a board that has plates but no `remotion_build{}`: most scenes are single-plate
builds → `PlatePush` with a push value from `camera{}` and nothing else. Only scenes where
pass 4 added layers need richer blueprints. Leverage is very high here — one `PlatePush`
family plus a props table covers the majority of a 60–80 scene board.

**Handoff:** final gate → `asset-generation` (plates + batch) → component build session →
`visual-accuracy-gate` Layer 3 render QC → `/remotion-render` → Premiere conform.

**Migration note:** replaces `ae-director` (retired 2026-08-17, see
`remotion-pipeline-decision` memory). `ae_build{}` → `remotion_build{}`; `comp` →
`durationInFrames` + `<Composition>` props; `precomps[]` → `families/`; `expressions[]` →
`motion_refs[]`; `jsx` → dropped; `handles_s: 1.0` → `handles_frames: 30`. Passes 1–6 and the
storyboard schema are **unchanged** — only this pass moved.
