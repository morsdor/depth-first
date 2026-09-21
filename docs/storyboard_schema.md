# The Storyboard JSON Schema — v2 (the production document)

*Part of the [pipeline docs](../pipeline_automation.md). Since the July 2026 studio pivot,
`storyboard.json` is no longer a list of images with motion bolted on — it is the **single
accreting production document**: every studio role (script-analyzer → film-director →
storyboard-artist → scene-composer → asset-planner → motion-director → ae-director) fills its
own block in a pass, like departments annotating one master board. One schema, staged passes —
no parallel documents to drift apart. `shot_list.md` is its human-readable mirror, rendered by
`prompt_builder.py`.*

**Frame of reference:** 60–80 scenes × 8–12s · VO recorded before the AE build ("animate to
track") · every scene is an AE scene rendered to `clips/scene_NN.mp4` with ~1s handles ·
final conform in Premiere Pro. Craft rules: `docs/cinematography.md`. Motion numbers:
`brand_guide.md` §5.

---

## Top level

```json
{
  "version": 2,
  "civilization": "Indian",
  "accent_hex": "#D4812A",
  "style_anchor_strength": 0.7,
  "scene_recipes": { "establishing": "wide establishing view, ..." },
  "base_dir": "./projects/002_topic",
  "voiceover": "audio/voiceover.mp3",
  "vo_duration": null,
  "background_music": "audio/ambient.mp3",
  "music_volume": 0.08,
  "continuity_registry": {
    "light": "upper-left, warm golden-hour — every plate, every asset, every scene",
    "sides": { "water_flow": "left-to-right", "attackers": "left", "defenders": "right" },
    "characters": { "mason_01": "ochre turban, charcoal dhoti, carries chisel" },
    "maps": "north up, terrain muted, route in accent",
    "props": { "water_pot_01": "assets_library/props/water_pot_01.png" }
  },
  "passes": {
    "script_analyzer": null, "film_director": null, "storyboard_artist": null,
    "scene_composer": null, "asset_planner": null, "motion_director": null,
    "ae_director": null
  },
  "scenes": [ ... ]
}
```

| Field | Type | Set by | Description |
|:---|:---|:---|:---|
| `version` | number | — | `2`. Absence ⇒ legacy v1 (tools keep a v1 fallback during the 001 transition). |
| `vo_duration` | number\|null | VO true-up | Measured seconds of the recorded VO. `null` until recorded; `--validate` checks Σ durations ≈ this. |
| `continuity_registry` | object | film-director, grows over passes | Named invariants (light, side assignments, character sheets, map rules, recurring prop files). Scenes cite entries; the accuracy gate checks renders against it. `cinematography.md CONT-1`. |
| `passes` | object | studio-director | Ledger: role → ISO date when its pass completed. Guards ordering; `--validate` checks required blocks exist for completed passes. |
| *(rest)* | — | — | As v1: `civilization`, `accent_hex`, `style_anchor_strength`, `scene_recipes` (per-video recipe map, storyboard wins over defaults), `voiceover`, `background_music`, `music_volume`. |

---

## Per-scene blocks (in pass order)

A full plate+layers scene:

```json
{
  "id": "scene_04",
  "t_start": 22.5, "t_end": 32.0, "duration": 9.5,
  "narration_segment": "Down she goes: one step, then another...",
  "purpose": "feel the descent — the staircase as a journey",
  "register": "witness",
  "needs": ["architecture", "character"],

  "shot": {
    "scene_type": "detail", "shot_size": "action",
    "progression_role": "approach", "transition_in": "cut"
  },

  "composition": {
    "frame": "close isometric on the double-flight steps folding back on themselves",
    "focal_point": "the descending figure, upper-right third",
    "fg": "shadowed step edge", "mid": "the V-flight lattice + figure", "bg": "far wall in haze",
    "negative_space": "bottom",
    "labels": []
  },

  "build": "plate+layers",
  "image": "images/scene_04.png",
  "plate": {
    "subject": "close isometric of the double-flight steps folding back on themselves",
    "reference_image": "references/ref_03.jpg",
    "visual_facts": ["steps descend in paired V-flights forming a tessellated diamond lattice"],
    "accent": null
  },
  "layers": [
    { "asset": "assets_library/characters/villager_female_01.png",
      "role": "mid", "placement": "on the fourth flight, descending",
      "scale_hint": "tiny — scale silhouette only", "parallax": 1.0,
      "motion": { "kind": "drift", "px_per_s": 12, "direction": "down-right", "ease": "F9" } },
    { "asset": "assets_library/nature/cloud_02.png",
      "role": "bg", "placement": "upper sky band", "scale_hint": "large, soft",
      "parallax": 0.25,
      "motion": { "kind": "drift", "px_per_s": 8, "direction": "right", "ease": "linear" } }
  ],

  "camera": { "move": "push_in", "amount_pct": 5, "ease": "F9 60%", "hold_in_s": 0.7, "hold_out_s": 0.7 },
  "texts": [ { "text": "3,500 steps", "start": 4.0, "end": 7.5, "position": "bottom" } ],
  "particle_overlay": null,
  "continuity": ["light", "characters.mason_01"],

  "ae_build": {
    "comp": "3840x2160 @ 30fps",
    "hierarchy": "CAMERA_CTRL null ► [plate, villager, cloud]; cloud parented at 0.25x via slider",
    "precomps": [], "expressions": ["cloud drift: loopOut, de-synced phase"],
    "jsx": null,
    "render": { "clip": "clips/scene_04.mp4", "handles_s": 1.0 }
  }
}
```

An assembly scene (no AI plate — built from library assets on a simple background):

```json
{
  "id": "scene_12",
  "t_start": 96.0, "t_end": 105.0, "duration": 9.0,
  "narration_segment": "The king's surveyors arrived first...",
  "purpose": "narrative beat — the survey party at the site",
  "register": "witness",
  "needs": ["character", "nature"],
  "shot": { "scene_type": "narrative", "shot_size": "stage", "progression_role": "beat", "transition_in": "cut" },
  "composition": { "frame": "flat stage: parchment ground line, three figures, banyan right",
                   "focal_point": "lead surveyor, left third", "fg": null,
                   "mid": "figures on the stage line", "bg": "flat parchment + distant hills",
                   "negative_space": "top", "labels": [] },
  "build": "assembly",
  "layers": [
    { "asset": "assets_library/characters/surveyor_01.png", "role": "mid", "placement": "left third, facing right",
      "scale_hint": "full stage height x0.4", "parallax": 1.0,
      "motion": { "kind": "gesture", "note": "arm raise at t=3s, 2-frame anticipation", "ease": "F9" } },
    { "asset": "assets_library/nature/banyan_01.png", "role": "mid", "placement": "right third", "scale_hint": "x0.6",
      "parallax": 1.0, "motion": null }
  ],
  "camera": { "move": "none", "amount_pct": 0, "ease": null, "hold_in_s": 0, "hold_out_s": 0 },
  "texts": [],
  "continuity": ["light", "sides.water_flow"],
  "ae_build": { "comp": "3840x2160 @ 30fps", "hierarchy": "flat stage, no camera null needed",
                "precomps": [], "expressions": [], "jsx": null,
                "render": { "clip": "clips/scene_12.mp4", "handles_s": 1.0 } }
}
```

### Block reference

| Block / field | Pass (fills it) | Required | Notes |
|:---|:---|:---|:---|
| `id` | 1 script-analyzer | ✅ | `scene_NN`, zero-padded, stable across passes. |
| `t_start`, `t_end`, `duration` | 1 (trued-up after VO) | ✅ | Seconds into the VO. `duration` = `t_end − t_start`, target **8–12s** (`RHYTHM-6`; <8s only in a deliberate staccato run, >12s only for one continuous motion). Estimated at ~145 wpm first, corrected to the real recording at the VO true-up. |
| `narration_segment` | 1 | ✅ | Verbatim script slice this scene covers. |
| `purpose` | 1 | ✅ | One line: what this scene makes the viewer understand/feel (`SHOT-4`: one idea). |
| `register` | 1 | ✅ | `witness` \| `engineer` \| `wit` \| `data`. |
| `needs` | 1 | ❌ | Coarse tags feeding later passes: `diagram`, `map`, `character`, `architecture`, `infographic`, `nature`. |
| `shot{}` | 2 film-director | ✅ | `scene_type` (`establishing`, `cross_section`, `map`, `detail`, `scale_comparison`, `narrative`, `title`, `outro`) · `shot_size` (`vista`/`stage`/`action`/`study`/`abstract`, `SHOT-1`) · `progression_role` (`hook`/`establish`/`approach`/`payoff`/`beat`/`reset`/`close`) · `transition_in` (`cut`/`crossfade`/`match_cut`, `TRANS-*`). |
| `composition{}` | 3 storyboard-artist | ✅ | `frame`, `focal_point`, `fg`/`mid`/`bg` (three-band depth, `COMP-3` — parallax needs bands), `negative_space` (`top`/`bottom`/`center`/`none`, reserved BEFORE generation, `COMP-2`), `labels[]`. |
| `build` | 4 scene-composer | ✅ | `plate` (AI-generated full scene — hero architecture, sections, maps) \| `assembly` (library assets on simple bg — narrative/character beats) \| `plate+layers` (plate base + library elements on top). |
| `image` | 4 | plate builds | Path for the generated plate still (`images/scene_NN.png`). Absent on `assembly`. |
| `plate{}` | 4 | plate builds | `subject` (the lean prompt subject — boilerplate injected by `prompt_builder.py` from `scene_recipes` + `style_card.txt`), `reference_image` (real photo: GEOMETRY; anchor: LOOK), `visual_facts[]` (hold-constraints + accuracy checklist), `accent`. |
| `layers[]` | 4 (assets resolved in 5) | ❌ | Each: `asset` (library path, or `"generate:<category>/<name> — <spec>"` until asset-planner resolves it), `role` (`bg`/`mid`/`fg`/`overlay`), `placement`, `scale_hint`, `parallax` (bg ≈ 0.25, mid ≈ 0.6, fg = 1.0), `motion` (filled in pass 6). |
| `camera{}` | 6 motion-director | ✅ | `move` (`push_in`/`pull_back`/`pan_left`/`pan_right`/`pan_up`/`pan_down`/`none`) · `amount_pct` or `px_per_s` · `ease` · `hold_in_s`/`hold_out_s` (0.5–1). Numbers within `brand_guide.md` §5 limits; every move needs a verb (`CAM-1`). |
| `layers[].motion{}` | 6 | ❌ | Numeric per layer: `kind` (`drift`/`oscillate`/`gesture`/`draw_on`/`sway`/`none`) + params (`px_per_s`, `amplitude_px`, `period_s`, `direction`, `ease`). **≤2 moving elements** per scene, camera excluded (`ANIM-3`). |
| `texts[]` | 6 | ❌ | As v1: `{text, start, end, position}` — but timed by the rules: enter 0.2–0.5s after the ear, exit ≥0.5s before the cut, ≤6 words (`TEXT-*`). |
| `particle_overlay` | 6 | ❌ | Stock overlay path (dust/sparks/rain) — counts toward the moving-element budget. |
| `continuity[]` | 2–6 | ❌ | Registry keys this scene touches; the accuracy gate checks them. |
| `remotion_build{}` | 7 remotion-director | ✅ | `component` (path under `remotion/src/`), `family` (`PlatePush`/`Stage`/`Diagram`/`Counter`/`MapRoute`/`CodePanel`), `props{}`, `sequences[]` (`{component, from, durationInFrames, props}` — **frames, not seconds**), `motion_refs[]` (which `src/brand/tokens.ts` constants the scene uses — the §5 audit trail), `durationInFrames` (= round(duration×30) + 60), `render {clip, handles_frames: 30}` → `clips/scene_NN.mp4`. |
| `ae_build{}` | 7 ae-director — **RETIRED 2026-08-17** | legacy only | Superseded by `remotion_build{}`. Still read for the one pre-switch board (`projects/001_roman_aqueduct`). **Do not write new `ae_build{}` blocks.** Was: `comp`, `hierarchy`, `precomps[]`, `expressions[]`, `jsx`, `render {clip, handles_s}`. |

> **Frames, not seconds, below pass 6.** Passes 1–6 speak seconds (`t_start`, `t_end`,
> `duration`, `hold_in_s`). Remotion speaks frames. **`remotion-director` owns the single
> conversion** at 30fps and writes integers into the board, so nothing downstream re-derives
> it — off-by-one-frame drift is this pipeline's classic bug.

---

## Retired v1 fields

| v1 field | Fate |
|:---|:---|
| `type` (`"animated"`/`"static"`) | **Gone.** Every scene is an AE scene; richness is a spectrum, not a type. |
| `motion`, `focus_x`, `focus_y` | → `camera{}` (numeric, eased). |
| `animation_prompt` | → the scene *is* the motion brief (`camera{}` + `layers[].motion{}`). |
| `animated_clip` | → `ae_build.render.clip` (uniform `clips/scene_NN.mp4`). |
| `image_prompt` | → `plate.subject`. |
| top-level two-pass note | → the seven studio passes + `passes` ledger. |

`prompt_builder.py` and `generate_images.py` retain v1 fallbacks for legacy boards;
all new projects are v2-only.

---

## Validation

`python prompt_builder.py <sb> --validate` checks: durations in 8–12s (warn), scene count
60–80 (warn), `t_start`/`t_end` contiguous and Σ ≈ `vo_duration` (when set), every completed
pass's blocks present, every `layers[].asset` resolvable in `assets_library/INDEX.md` or a
pending `_batches/*.json`, render targets unique. Run it after every pass; it is the studio's
continuity supervisor for the *document* itself.
