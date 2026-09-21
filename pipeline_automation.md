# Video Pipeline — Hub

> **This is the index.** The pipeline reference lives in focused files under `docs/`, and the agent-executed procedures are skills. Start here, follow the links.

---

## Operating assumptions (the decisions that shape everything)

**Revised July 13, 2026 — the studio pivot (direction-first pre-production):**
- **The pipeline is a studio, not a prompt chain.** A finished script enters the seven-pass **studio chain** (`studio-director` skill): script-analyzer → film-director → storyboard-artist → scene-composer → asset-planner → motion-director → ae-director. Each pass fills its block in **one accreting `storyboard.json` (schema v2)** — the production document — mirrored by a readable `shot_list.md`. → [docs/storyboard_schema.md](docs/storyboard_schema.md)
- **Image generation is a derived step, not an independent one.** What gets generated (plates, library assets) falls out of the scene-composer's build decisions (`plate` / `assembly` / `plate+layers`) and the asset-planner's batch. Nothing is prompted ad hoc.
- **60–80 scenes × 8–12s**, timestamped to the script; **VO is recorded before the AE build** ("animate to track") and scene timings are trued-up to the real read; AE renders carry ~1s handles.
- **Final conform in Premiere Pro** (clips + VO + music, trim-only); `video_assembler.py` is now the **animatic** tool — a stills+VO rough cut that fixes pacing in the board before AE hours are spent.
- **Two knowledge canons drive every pass:** [docs/cinematography.md](docs/cinematography.md) (craft: shot grammar, rhythm, staging, continuity — rules cited by ID) and `brand_guide.md` §5 **Motion Identity** (the numeric motion limits).

**Revised July 12, 2026 — the animation pivot:**
- **Motion is hand-built in After Effects from AI stills.** Generative image-to-video was dropped after measurement: it softens crisp lines, warps precise geometry, and adds uninvited camera moves on our flat isometric style (~70% of a full batch failed the quality bar). AE transforms the art but never redraws it — sharp by construction. → [docs/after_effects_workflow.md](docs/after_effects_workflow.md)
- **A reusable cross-video asset library** (`assets_library/` — characters, nature, architecture, military, props, diagram elements) feeds AE. AI generates the assets; `STYLE_BIBLE.md` locks the look; `INDEX.md` tracks what exists so nothing is generated twice. Assets compound: video 1 needs ~40, video 10 needs ~5.
- **AI's three levers in AE:** (1) generating assets, (2) directing — the studio passes that fill each scene's numeric motion + build blocks, (3) writing AE expressions and JSX scripts (`ae_scripts/`) that build comps programmatically.
- **Animation is now free at the margin** — no per-clip credits, no charged retries. The budget shifted from credits to *your AE time*, controlled by templates and the three-rung ladder (camera moves → parallax → element motion).

**Revised July 6, 2026** (see `strategy_review.md`):
- **Cadence: 2 videos/month**, not 8 — quality over volume, sustainable alongside a full-time job.
- **Narration is your own recorded voice** from day 1; the AI clone is a pickup-only fallback.
- **Two mandatory human steps:** a real fact-check pass, and the "Altered content" disclosure on upload — these keep the channel monetizable under YouTube's 2026 inauthentic-content policy.
- **Graceful degradation:** any scene not worth AE time simplifies to its Rung-1 camera-only build (validated plate + eased push). You always ship.

**Corrected July 10, 2026** (second review):
- **Visual accuracy is a gated step:** per-project `references/` pack + `visual_facts`, injected into prompts; **no still is animated unvalidated** → [`visual-accuracy-gate` skill](visual-accuracy-gate/SKILL.md).
- **Time per video: ~8–12 hrs** (16–24 hrs/month) → [docs/production_workflow.md](docs/production_workflow.md).
- **Thumbnails are a first-class session** (packaging-first gate, 3 candidates, Test & Compare) → its own **Thumbnails** step in the workflow.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│              PRE-PRODUCTION — THE STUDIO CHAIN                │
│         (studio-director skill, ₹0 by construction)           │
│                                                               │
│  script.md (yours, fact-checked)                              │
│   1 script-analyzer   → 60–80 timestamped scenes (8–12s)      │
│   2 film-director     → shots, sequence, axes   ── GATE       │
│   3 storyboard-artist → frames (focal, bands, neg. space)     │
│   4 scene-composer    → plate/assembly builds + layers        │
│   5 asset-planner     → library diff + batch    ── GATE (₹)   │
│   6 motion-director   → numeric camera + layer motion         │
│   7 ae-director       → comp blueprints + JSX   ── GATE       │
│                                                               │
│  ONE document: storyboard.json v2  (mirror: shot_list.md)     │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
        🎙 YOU record VO → true-up timings to the real read
                       ▼
┌──────────────────────────────────────────────────────────────┐
│            GENERATION (derived from the board)                │
│                                                               │
│  generate_images.py → plates (plate scenes only)              │
│    └─ VISUAL ACCURACY GATE (hard gate — skill)                │
│  generate_asset.py → approved batch → assets_library/         │
│    └─ Layer 2.5 asset gate                                    │
│  video_assembler.py → ANIMATIC (stills + VO pacing check)     │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│           ANIMATION (every scene) — AFTER EFFECTS             │
│                    (hand-built, by YOU)                       │
│                                                               │
│  Per scene's ae_build blueprint + JSX scaffolds               │
│    → transforms only, art never redrawn = always sharp        │
│    → render clips/scene_NN.mp4 (native 4K, ~1s handles)       │
│    └─ Layer 3 render QC (craft + continuity + comprehension)  │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│              CONFORM — PREMIERE PRO (YOU)                     │
│                                                               │
│  VO + music on the timeline → clips at their t_start marks    │
│  → trim into the handles, cuts on narration beats             │
│  → 4K publish master                                          │
└──────────────────────────────────────────────────────────────┘
```

---

## The docs

| Doc | What's in it | Read it when |
|:---|:---|:---|
| [docs/setup.md](docs/setup.md) | Prerequisites, API keys, After Effects + Duik install, file reference | Once, before video #1 |
| [docs/project_structure.md](docs/project_structure.md) | The per-video folder layout (`references/`, `images/`, `clips/`, `output/`…) | Starting a new project folder |
| [docs/storyboard_schema.md](docs/storyboard_schema.md) | **Schema v2** — the accreting production document: per-scene blocks per studio pass, continuity registry, passes ledger, `--validate` | Writing or reviewing a board; any studio pass |
| [docs/cinematography.md](docs/cinematography.md) | **The craft canon** — shot grammar, composition, motivated camera, rhythm vs VO, staging/continuity, text choreography (rules cited by ID) | Any direction decision; the studio passes cite it |
| [docs/image_generation.md](docs/image_generation.md) | Prompt structure, resolution/upscaling, style-consistency tiers (prefix → anchors → LoRA) | Generating stills; style drift problems |
| [docs/after_effects_workflow.md](docs/after_effects_workflow.md) | **The animation stage**: asset library, motion briefs, the three-rung ladder, JSX/expressions, quality gates, learning curve | Building animated scenes; anything AE |
| [assets_library/STYLE_BIBLE.md](assets_library/STYLE_BIBLE.md) | Asset-generation rules: palette, view conventions, character design language, cutout pipeline | Generating library assets |
| [docs/video_assembly.md](docs/video_assembly.md) | Running `video_assembler.py` — the **animatic** (stills + VO rough cut); final conform happens in Premiere | Cutting the animatic; pacing checks |
| [docs/upscaling.md](docs/upscaling.md) | 4K still upscaling via Real-ESRGAN — install + the model-bundle gotcha | Upscaling stills for Ken Burns headroom / AE |
| [docs/voice_narration.md](docs/voice_narration.md) | Self-recording workflow, ElevenLabs pickup fallback + settings | Recording narration |
| [docs/costs.md](docs/costs.md) | Per-video + monthly budget, cost levers | Budget questions; plan sizing |
| [docs/production_workflow.md](docs/production_workflow.md) | Sessions −1–7: packaging (from the outlier data) → research → storyboard → images → animation → voice → assembly → thumbnails → publish | The month-to-month operating rhythm |
| [docs/outlier_system.md](docs/outlier_system.md) | **Competitor outlier database** — free YouTube Data API scan of the 23-channel comp set → `data/outliers.csv` (packaging-lift + demand axes) and `data/comp_videos.csv` (the full control group, for base rates), formula tagging, weekly Action | Setting up / running packaging research; the Packaging precedent check |
| [formula_library.md](formula_library.md) | **Title formula library** — the canonical F1–F12 patterns (driver, niche example, failure mode); §4 points here, Packaging generates from it, `tag_outliers.py` tags against it | Writing or judging titles; growing the pattern list |

## The skills (agent-executed procedures)

| Skill | What it does | Invoked when |
|:---|:---|:---|
| [`the-engineering-atlas-video`](the-engineering-atlas-video/SKILL.md) | The full per-video production checklist with human gates (packaging gate → research → script → studio → VO → generate → animatic → AE → conform → publish) | "Start a new video…" (see `new_video_prompt_template.md`) |
| [`studio-director`](studio-director/SKILL.md) | **The pre-production orchestrator** — runs the seven passes below on one storyboard.json v2, enforces gates + pass order, `--validate` between passes | Script approved — "board this script" |
| `script-analyzer` → `film-director` → `storyboard-artist` → `scene-composer` → `asset-planner` → `motion-director` → `ae-director` | The seven studio passes: segmentation+timestamps → shots+sequence → frames → builds+layers → asset sourcing → numeric motion → AE blueprints+JSX. Each fills its block; each SKILL.md carries its role's craft | In order, via studio-director (each also invocable solo for rework) |
| [`art-director`](art-director/SKILL.md) | Keeper of the bibles — motif kits per civilization, style rulings, consolidation. Consulted, not sequential | New civilization/territory; style questions; drift |
| [`asset-generation`](asset-generation/SKILL.md) | Executes the board: plates from `plate{}` blocks → accuracy gate → approved batch → asset gate → 4K prep → render QC when AE clips land | Board approved — "generate the assets" |
| [`visual-accuracy-gate`](visual-accuracy-gate/SKILL.md) | Layer 2 plates vs references/facts · Layer 2.5 assets · Layer 3 renders (motion craft + **continuity registry** + **comprehension QA**); delta-prompt fixes; "no unvalidated plate is animated" | Mandatory gates inside generation, and after AE renders land |
| [`thumbnail-workflow`](thumbnail-workflow/SKILL.md) | Packaging-first gate → 3 candidates (one axis varied) → 120-px squint test → local typography → Test & Compare → `thumbnails_log.md` | At script approval (gate), and publish (production) |

> **Skills work in both environments:** claude.ai co-work picks them up from these root-level folders when the project folder is connected; Claude Code discovers the same skills via symlinks in `.claude/skills/`. One source of truth, two runtimes.

---

## The one-paragraph version

Research and fact-check yourself (incl. the reference pack) → your approved script enters the **studio chain** (`studio-director`): seven passes turn it into one `storyboard.json` v2 — 60–80 timestamped scenes with shots, frames, plate/assembly builds, sourced assets, numeric motion, and AE blueprints (three human gates; packaging-first thumbnail gate at the script) → **record your own narration** and true-up timings to the real read → generation *derived from the board*: `generate_images.py` plates (**accuracy gate: no unvalidated plate proceeds**) + `generate_asset.py` approved batch (asset gate) → `video_assembler.py` cuts the **animatic** (fix pacing in the board, not in AE) → **you build every scene in After Effects** per its blueprint (JSX scaffolds do the setup; transforms only, so the art stays sharp; ~1s handles) → Layer 3 render QC (craft + continuity + comprehension) → **conform in Premiere Pro** (clips on the VO, cuts on narration beats, 4K master) → 3 thumbnails + Test & Compare → full watch, "Altered content" disclosure, publish. **~₹500–750 marginal cash + ~10–14 hrs per video; ~₹5,000/month all-in (Claude + Adobe + images) at 2 videos/month.**

---

*Last updated: July 22, 2026 — **outlier metrics hardening** (reviewer-driven, before video 1): added the **control group** `data/comp_videos.csv` (every scanned long-form video, ~690 rows — not just outliers) so formula counts can be checked against base rates (Animagraffs/Branch/Jared Owen are 80–83% cutaway, so their F12 breakouts are format-native, not packaging lift); added a **demand axis** (`views_per_day` / `vpd_multiple`) alongside packaging `multiple`, since the two disagree (Neutron Bomb 16.9× but ~13k/day vs LA Aqueduct 4.5× but ~37k/day); broadened **F1** (The Insane Logistics → The Extremity Frame — its evidence is intensity-adjective framing, not scale alone) and **narrowed F11** to the true impossible-feat question, re-tagging 7 question-*shaped* rows (mechanism → F12, the rest → `none`) — `formula_library.md` v1.1 → v1.2. F11 now has 0 evidence rows (the house pattern has no external precedent). Deferred, tracked: the refresh-freeze fix, z-score admission for tight-distribution channels, time-bounded baseline (none change video 1). Earlier the same day — pipeline stages renamed from numbers to names: the per-video pipeline is now **Packaging → Research → Script → Studio → Narration → Generation → Animatic → AE build → Render QC → Premiere → Publish**, grouped into PRE-PRODUCTION / PRODUCTION / DELIVERY — no more Phase −1 / Session −1 numbering (the multi-year business phases in `channel_strategy.md` §6 and the After Effects doc's own internal phases keep their numbers). Earlier — July 21, 2026 — comp-set expansion + formula **F12**: the competitor set grew 15 → 23 channels (added the animated-engineering lane — Jared Owen, Sabin Civil Engineering, Branch Education, Animagraffs, The Efficient Engineer, toldinstone, Historia Civilis, Ancient Architects), a full scan added 21 outliers (`data/outliers.csv` now 36 rows, all tagged in-session), and the dominant new cluster (12 "How It Works" cutaway titles that were tagging `none`) earned **F12 How It Works (The Cutaway Reveal)** in `formula_library.md` (v1.0 → v1.1) — the channel's own native format. Earlier the same day — packaging-research system, part 4 (final): the Tier-1 geographic-targeting rule is written down as `channel_strategy.md` **§4b** — outside-in framing, dollars-before-rupees, Tier-1 precedent bias at Packaging, seeding to HN/subreddits/eng-Twitter, KPI **US+UK+CA+AU ≥50% of views by ~video 10** with a geography check + seeding step each publish (the Publish stage in the SKILL + production_workflow); §5's RPM progression now cites §4b as its mechanism. Part 3, same day: the packaging gate moved to **Packaging**, before research — topics are now sourced from the outlier database and must show a ≥3× precedent plus a locked `projects/NNN_topic/packaging.md` (title from the formula library + thumbnail concept) before earning any production hours; the Script stage keeps only a drift check (`the-engineering-atlas-video` SKILL, `thumbnail-workflow` Stage 1, `docs/production_workflow.md` Packaging, and the kickoff template all retimed). Part 2, same day: `formula_library.md` (F1–F11) is now the single canonical title-pattern list — §4's inline five-pattern list replaced by a pointer, and `tag_outliers.py` has its parse target. Same day: first live outlier scan committed (15 channels, 15 rows, ~65 quota units). July 13, 2026 (second pass) — part 1: competitor outlier database (`scripts/fetch_outliers.py` + `weekly_refresh.py` + `tag_outliers.py`, `data/comp_channels.yaml` with the 15-channel comp set, weekly GitHub Action; see `docs/outlier_system.md`). Earlier the same day — the studio pivot: direction-first pre-production (seven-pass studio chain on one storyboard.json v2), image generation now derived, VO before build, Premiere Pro conform, video_assembler repurposed as the animatic. Previous revisions: July 12 (animation pivot — generative i2v removed, AE hand-built motion), July 10 (visual accuracy, thumbnails, corrected budget + hours), July 6 (2/month cadence, self-narration, fact-check + disclosure gates — see `strategy_review.md`).*
