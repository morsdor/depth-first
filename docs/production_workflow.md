# Production Workflow (2 videos/month)

*Part of the [pipeline docs](../pipeline_automation.md). The agent-driven version of this
workflow is the [`the-engineering-atlas-video` skill](../.claude/skills/the-engineering-atlas-video/SKILL.md);
pre-production is the [`studio-director` chain](../.claude/skills/studio-director/SKILL.md); the
accuracy steps are the [`visual-accuracy-gate` skill](../.claude/skills/visual-accuracy-gate/SKILL.md).*

Produce videos in a steady rhythm — one focused block per video, ~2 videos worth of work
spread across the month. **Do not batch 4–6 in a weekend**; that guarantees either burnout
or shallow fact-checking, and the templated-batch signature is what YouTube's
inauthentic-content enforcement flags.

```
PRE-PRODUCTION  packaging (topic from the data) → research → script → studio (board)
PRODUCTION      VO + true-up → generate + animatic → AE build
DELIVERY        conform in Premiere → thumbnails → QA + publish
```

## PRE-PRODUCTION

### Packaging (30–45 min, ₹0 — the topic earns its production hours here)

*Executable versions: the Packaging gate of the `the-engineering-atlas-video` skill +
`thumbnail-workflow` Stage 1. Evidence base: [outlier_system.md](outlier_system.md).*

```
Before ANY research hour is spent:
  → Refresh the database if stale (scripts/weekly_refresh.py) and read the top
    patterns (scripts/tag_outliers.py — Claude tags new rows in-session, ₹0)
  → PRECEDENT CHECK (hard): the concept needs a ≥3× outlier on a comparable
    channel (data/outliers.csv or vidIQ). None anywhere → PARK it, pick again
  → ~25 title candidates from formula_library.md (weighted to the top-3
    patterns) → bored-scroller kill pass → 3 survivors
  → One-sentence thumbnail concept ("dominant object + 3–4 words") + 120-px mock
  → LOCK projects/NNN_topic/packaging.md: title + 2 alternates, formula id,
    precedent rows (video id + multiple), thumbnail concept.
    No packaging.md → no research.
```

### Research + Fact-Check (2–4 hours, non-negotiable)

```
For the topic:
  → Gather real sources (books, papers, museum/engineering references), not just AI summary
  → Collect 5–15 REAL photos/plans into projects/XXX/references/ and write
    references/visual_facts.md (see the visual-accuracy-gate skill) — these feed
    the board's plate.visual_facts and the validation gate later
  → New civilization/territory? Consult the art-director skill (motif kit into the bibles)
  → YOU verify every date, tonnage, mechanism, name, and attribution against sources
  → Decide the "what most people miss" insight — your engineer's-eye take
```

### Script (1–2 hours)

```
Using your fact-checked research notes from the Research stage:
  → Claude drafts a 10–13 min script on the beat sheet (brand_guide §7)
  → YOU rewrite the hook + 2–3 perspective paragraphs in your own voice
  → PACKAGING DRIFT CHECK: the script still delivers what packaging.md
    (from Packaging) promises. Story moved during research? Update the packaging
    deliberately (re-run the Packaging checks) — never drift silently.
  → Save script.md. The script is now FINAL enough to record.
```

### The Studio — boarding (2–3 hours, ₹0)

*Run the `studio-director` skill. Seven passes fill ONE `storyboard.json` (schema v2),
mirrored by `shot_list.md`. Craft: [cinematography.md](cinematography.md); numbers:
`brand_guide.md` §5; contract: [storyboard_schema.md](storyboard_schema.md).*

```
  1 script-analyzer    → 60–80 scenes × 8–12s, timestamped, purpose + register
  2 film-director      → shots, sequence, axes/sides        ── YOU review the sequence
  3 storyboard-artist  → frames: focal, depth bands, negative space
  4 scene-composer     → plate / assembly / plate+layers + layer specs
  5 asset-planner      → library diff + generation batch    ── YOU approve the batch (charged)
  6 motion-director    → numeric camera + per-layer motion + text choreography
  7 ae-director        → comp blueprints + JSX scaffolds    ── YOU approve the full board
  → python prompt_builder.py <sb> --validate between passes
```

## PRODUCTION

### Voice Recording + True-Up (~45 min)

```
BEFORE any generation or AE work — the pipeline animates to track:
  → Record narration yourself into your mic (see docs/voice_narration.md);
    ~140–150 wpm; let key numbers breathe; consistent sign-off
  → Clean up in Audacity / Adobe Podcast; ElevenLabs clone pickups only
  → Save voiceover.mp3 to projects/XXX/audio/
  → TRUE-UP: measure the real read; correct each scene's t_start/t_end/duration;
    set vo_duration; re-run --validate; scenes shifted >1.5s get a motion re-pace
```

### Generation + Animatic (1–2 hours wall-clock, can run alongside other work)

*Run the [`asset-generation` skill](../.claude/skills/asset-generation/SKILL.md) — it executes
the board, never improvises.*

```
  → generate_images.py: plates only (assembly scenes are skipped — they're built
    in AE from the library). Scene 1 first, eyeball, then the rest; scenes with
    plate.reference_image get the real photo as geometry reference automatically
  → VISUAL ACCURACY GATE (hard): vision vs reference + facts, YOU confirm,
    delta-prompt fixes. NO unvalidated plate proceeds
  → generate_asset.py --batch: the approved batch → Layer 2.5 asset gate → INDEX.md
  → Upscale plates to 4K (local, free)
  → ANIMATIC: python video_assembler.py --storyboard <sb> --output animatic.mp4
    Watch it once, full length. Pacing problems are fixed IN THE BOARD
    (re-time/merge/cut via studio-director) — never at the AE desk.
```

### Animation in After Effects (the craft hours, hand-built)

*Full reference: [after_effects_workflow.md](after_effects_workflow.md). The board preps
everything; you build. AE transforms the art but never redraws it, so scenes stay sharp
and accurate by construction.*

```
Build (you, in AE — duplicate template.aep per video):
  → Follow the ae-director's session plan in shot_list.md: build families together,
    run each scene's JSX scaffold (File → Scripts → Run Script File…), then keyframe
    per the scene's numeric camera{}/layers[].motion{} specs
  → The ladder still governs effort: RUNG 1 camera move (every scene, eased F9)
    → RUNG 2 parallax (3–5 hero scenes, bg ~0.25×) → RUNG 3 element/character
    motion (2–3 scenes max)
  → Save each finished family as a TEMPLATE COMP — next video you swap art,
    not rebuild (first scene ~2 hrs, tenth ~15 min)
  → Render clips/scene_NN.mp4 — native 4K, 30fps, ~1s HANDLES both ends
  → RENDER QC per scene (visual-accuracy-gate Layer 3): craft (eased, ≤2 moving,
    board numbers respected) + continuity (registry: light, sides, same asset
    files) + comprehension (2-second test, text readable)
  → GRACEFUL DEGRADATION: any scene not worth AE time ships as its Rung-1
    camera-only build — validated plate + eased push. You always ship.
```

## DELIVERY

### Conform in Premiere Pro (~1 hour)

```
For the video (this replaces the old automated final assembly):
  → New project: voiceover.mp3 + music (~8%, brand_guide §9) on the timeline
  → Lay clips/scene_NN.mp4 in order at their t_start marks (shot_list.md has
    the column); trim into the handles so every cut lands on a narration beat
    (cinematography.md RHYTHM-2 — J-cut feel: subject named ±0.5s of the cut)
  → Transitions per the board's transition_in: cuts default; crossfades only
    where marked (time passing); check the match-cuts align
  → Export the 4K publish master (H.264, YouTube 2160p preset)
```

### Thumbnails (~30–45 min — a growth lever, not an afterthought)

*Executable version: the [`thumbnail-workflow` skill](../.claude/skills/thumbnail-workflow/SKILL.md).*

```
For the video (concept was locked back in Packaging's packaging.md):
  → Generate 3 CANDIDATES (thumb_a/b/c.png), varying ONE axis at a time:
    focal object, crop tightness, or accent intensity
  → The 120-px squint test on each candidate (shrink to inbox size):
     □ one dominant object, ≥60% of frame, instantly recognizable
     □ ≤4 words, readable at 120px
     □ focal point survives the shrink
     □ pops against BOTH YouTube dark and light UI
     □ curiosity gap intact — intrigues, doesn't answer
  → Text/typography added locally (ImageMagick/Figma) — never AI-generated text
  → Upload all 3 via YouTube "Test & Compare"; log in assets/thumbnails_log.md
    (concept, winner, CTR at 7 and 28 days)
```

### QA + Disclosure + Publish

```
For the video:
  → Watch it FULLY (not 2x) at least once — facts and feel, not just glitches
  → FEEL/POLISH (the "does this look sloppy?" pass): motion reads as intended
    (eased, subtle, nothing linear), cuts land on beats, text timing tracks the
    narration, music sits under the voice, pacing doesn't drag. A video can be
    100% accurate and still feel cheap — this is where you catch that.
  → On upload: TICK the "Altered content" checkbox (AI-assisted visuals/voice)
  → Title (per formula) + description (hook → chapters → sources → subscribe)
  → 2–3 Shorts from self-contained beats; drip between uploads
  → Publish/schedule on your consistent day/time (e.g., Saturday AM US)
  → SEED where Tier-1 lives (channel_strategy §4b): HN, relevant subreddits,
    engineering Twitter — NEVER Indian WhatsApp/LinkedIn (early viewers train
    the lookalike model)
  → GEOGRAPHY CHECK (§4b): Studio → Audience → Top geographies;
    US+UK+CA+AU ≥50% by ~video 10 — drifting? correct within two videos
```

**Time per video:** ~10–14 hours end to end, spread across the two-week cycle (the first
2–3 videos will run longer while the AE muscle builds — the asset library, template comps,
and JSX scaffolds are what pull it back down toward ~8–10). Two videos ≈ **20–28
hours/month** — sustainable alongside a full-time job *only* at this 2/month cadence; this
number is the real reason not to scale up early.
