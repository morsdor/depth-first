# Voice & Narration

*Part of the [pipeline docs](../pipeline_automation.md).*

## Primary: record your own narration (from day 1)

Recording ~10–13 minutes of narration for 2 videos/month is a trivial time cost (~20–30 min/video including cleanup) and is the single strongest authenticity + differentiation signal you can send. This is the default.

> **When: right after the board is approved, BEFORE any generation or AE work** (the Narration stage
> of [production_workflow.md](production_workflow.md)). The pipeline *animates to track*
> (`cinematography.md RHYTHM-1`): scenes are timed to your real read, AE renders carry ~1s
> handles, and the Premiere conform becomes trim-only. Recording last (the old order) meant
> animating to estimates and absorbing the drift in the edit.

**Workflow:**
1. Read the **fact-checked, perspective-added** script into a USB condenser mic (~₹4,000) in a quiet room.
2. One or two takes; drop obvious flubs.
3. Clean up with Audacity or Adobe Podcast (free) — noise removal, light leveling.
4. Export `voiceover.mp3` → `projects/XXX/audio/`.
5. **True-up the board:** measure the real read; correct each scene's `t_start`/`t_end`/`duration` in `storyboard.json`; set `vo_duration`; re-run `python prompt_builder.py <sb> --validate`. Scenes shifted >1.5s get their motion re-paced (studio-director).
6. **Tick the "Altered content" box on upload** if the video uses AI-generated visuals prominently (it does), and always if any AI-voice pickups are spliced in.

**Narration settings to aim for (documentary style):** calm, measured, ~140–150 wpm, curious not lecturing — let key numbers breathe (the board holds ~1s after data beats, `RHYTHM-3`; give the edit that pause to work with).

## Fallback only: ElevenLabs clone for pickups

Keep a clone of *your own* voice for surgical fixes — a mispronounced name, a sentence you changed post-recording — so you don't re-record a whole session. Splice sparingly. **This is a convenience tool, never the narration source.** If it becomes the default, you've drifted into the "AI narration without human context" profile YouTube demonetizes.

```python
from elevenlabs import ElevenLabs

client = ElevenLabs(api_key="sk_...")

# Pickup line only — e.g., re-recording a single sentence you changed.
audio = client.text_to_speech.convert(
    voice_id="your_cloned_voice_id",
    text=pickup_sentence,
    model_id="eleven_multilingual_v2",
    voice_settings={
        "stability": 0.7,        # higher = more consistent
        "similarity_boost": 0.8,  # higher = more like your sample
        "style": 0.3,            # lower = more neutral/documentary
    }
)

with open("pickup_01.mp3", "wb") as f:
    f.write(audio)
```

## Voice Settings for Documentary Style

| Setting | Value | Why |
|:---|:---|:---|
| Stability | 0.7 | Consistent tone, slight natural variation |
| Similarity Boost | 0.8 | Sounds like you, not generic |
| Style | 0.2–0.3 | Calm and measured, not dramatic |
| Speed | 0.9–1.0 | Slightly slower than default for clarity |
