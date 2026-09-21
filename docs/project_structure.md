# Project Folder Structure

*Part of the [pipeline docs](../pipeline_automation.md). Each video is a self-contained project folder.*

```
yt video ideas/
├── video_assembler.py          ← the assembly script
├── style_card.txt              ← master prompt prefix (see strategy doc)
├── example_storyboard.json     ← template
│
├── projects/
│   ├── 001_roman_aqueducts/
│   │   ├── packaging.md        ← LOCKED title + formula id + precedent + thumbnail concept (Packaging gate)
│   │   ├── storyboard.json     ← scene list + metadata (~54 scenes)
│   │   ├── script.md           ← full narration script
│   │   ├── references/         ← REAL photos/plans of the actual structure (Wikimedia etc.)
│   │   │   ├── visual_facts.md ← verifiable visual claims (geometry, materials, orientation)
│   │   │   ├── ref_01.jpg
│   │   │   └── ...
│   │   ├── images/             ← AI-generated stills (~55 images)
│   │   │   ├── scene_01.png
│   │   │   └── ...
│   │   ├── images_4k/          ← upscaled versions (static scenes only)
│   │   │   └── ...
│   │   ├── clips/              ← AI-animated clips (~27 clips)
│   │   │   ├── scene_01_animated.mp4
│   │   │   └── ...
│   │   ├── particles/          ← particle overlay videos
│   │   │   ├── dust_overlay.mp4
│   │   │   └── sparks_overlay.mp4
│   │   ├── audio/
│   │   │   ├── voiceover.mp3
│   │   │   └── ambient.mp3
│   │   ├── output/
│   │   │   ├── final_video.mp4
│   │   │   ├── thumb_a.png     ← 3 thumbnail candidates for Test & Compare
│   │   │   ├── thumb_b.png
│   │   │   └── thumb_c.png
│   │   └── metadata.json       ← title, description, tags for upload
│   │
│   ├── 002_mohenjo_daro/
│   │   └── ...
│   └── ...
│
└── assets/
    ├── style_anchors/           ← 8-10 reference images defining visual brand
    ├── music/                   ← ambient background tracks (royalty-free)
    ├── particles/               ← reusable particle overlay clips
    ├── fonts/                   ← custom fonts for text overlays
    └── thumbnails_log.md        ← per-video thumbnail concepts, A/B winners, CTR at 7/28 days
```

## Kicking off a new video

Paste one of these into a **fresh chat** with this folder connected. The
`the-engineering-atlas-video` skill and your saved memory carry the whole pipeline, so the
prompt only has to aim it and hold the gates. The pipeline's first stage is **Packaging**
(pick/validate the topic → title → thumbnail → `packaging.md`); nothing else starts until
that's locked.

**1 · You want help picking the idea** — no topic yet, source it from the data:

```
New Engineering Atlas video — help me pick it. Run the Packaging stage from the data:
refresh data/outliers.csv if stale, show me the current top breakout formulas, then
propose 3–4 candidate topics that each have a ≥3× precedent AND fit our historical-
engineering lane. For the one I pick: ~25 titles from formula_library.md → kill to 3 →
thumbnail concept → draft packaging.md. Stop at each gate for my sign-off.
```

**2 · You already have a topic:**

```
New Engineering Atlas video: {{TOPIC}} ({{one-line hook}}).
Civilization / accent: {{region}} ({{#hex}}).
Use the the-engineering-atlas-video skill. Packaging first (precedent check → ~25 titles
→ kill to 3 → thumbnail → packaging.md), then the gated pipeline, stopping at each gate.
Save to projects/{{NNN_shortname}}/.
```

The fully annotated template — placeholder key + a worked example — lives in
[`new_video_prompt_template.md`](../new_video_prompt_template.md).
