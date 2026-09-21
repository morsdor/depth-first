# The Animatic (`video_assembler.py`)

*Part of the [pipeline docs](../pipeline_automation.md). Fully local and AI-free
(ffmpeg/moviepy).*

> **Studio-pivot role (July 2026):** this script builds the **animatic** — the stills+VO
> rough cut every studio makes before animating (`cinematography.md ANIMATIC-1/2`). The
> **publish master is conformed in Premiere Pro** from the AE renders + VO; this script no
> longer produces it. The animatic's job: watch the whole video *before* a single AE comp
> is opened, and fix pacing **in the board** (re-time / merge / cut scenes via the
> studio-director) — AE hours are the pipeline's scarcest resource, and this is the
> cheapest place to protect them.

## Running the animatic

```bash
cd "/Users/mritunjaymohitesh/dev/yt video ideas"

# After plates pass the accuracy gate and the VO is recorded + trued-up:
python video_assembler.py \
  --storyboard ./projects/NNN_topic/storyboard.json \
  --output ./projects/NNN_topic/output/animatic.mp4
```

1080p (the default) is right for an animatic — fast, watchable, disposable. The
`--resolution 1440p/2160p` paths still exist (legacy from when this script rendered the
publish master) but there's no reason to use them now.

## What it does

For each scene in the board:
1. **AE render exists** (`ae_build.render.clip` / legacy `animated_clip`)? Uses it — so the
   animatic upgrades toward the final cut as scenes get built.
2. Else **plate still** → Ken Burns motion (legacy `motion` field or auto-cycle) with zoom
   headroom.
3. Else (**v2 assembly scene**, no plate) → a parchment slate carrying the scene id — the
   timing still plays, so pacing is checkable before the scene exists.
4. Adds the `texts[]` overlays (timed, semi-transparent bars) and a 0.5s crossfade.

After all scenes: concatenates, mixes voiceover (full volume) + background music (~8%),
exports h264 MP4.

## What to watch for (one full pass, notes open)

- Scenes that **drag** — they'll drag worse animated. Re-time or split in the board.
- Cuts landing **mid-clause** — nudge `t_start`/`t_end` at the true-up (`RHYTHM-2`).
- Text overlaps or crowding — fix `texts[]` timing (`TEXT-2/4`).
- Two dense scenes back-to-back (`RHYTHM-5`) — re-sequence via the film-director pass.

## Legacy: Ken Burns motion types (v1 boards / still-only scenes)

| Motion | Effect | Best for |
|:---|:---|:---|
| `zoom_in` | Slow zoom into center | Establishing shots, wide views |
| `zoom_out` | Start tight, pull back | Reveals, "big picture" moments |
| `pan_left` | Slide right → left | Timelines, sequences |
| `pan_right` | Slide left → right | Following a path, flow |
| `pan_up` | Slide bottom → top | Tall structures, vertical reveals |
| `zoom_detail` | Zoom into specific point (x, y) | Callouts, mechanism close-ups |

(v2 boards express camera intent in `camera{}` — these enum values survive only for
rendering legacy scenes in the animatic.)
