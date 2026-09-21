# New Video — Kickoff Prompt Template

Copy the block below into a **new chat** (with the `yt video ideas` folder connected),
replace the `{{...}}` placeholders, and send. The `the-engineering-atlas-video` skill
carries the full structure; this prompt just aims it and enforces the review gates.

A topic may arrive two ways: **from the database** (an outlier pattern suggests it —
the default) or as your own idea (it must still pass the same Packaging gate). Either
way, the Packaging step runs before any research.

---

## Template (copy this)

```
Start a new video for The Engineering Atlas: {{TOPIC_OR_CONCEPT}} ({{ONE_LINE_HOOK}}).
Use the `the-engineering-atlas-video` skill and follow `brand_guide.md` and `style_card.txt`.
Civilization / accent: {{CIVILIZATION}} ({{ACCENT_HEX}}).

Work through it in gated steps and STOP for my sign-off at each gate — don't run ahead:
1. Packaging — check data/outliers.csv (+ tell me if the CSV is stale)
   for a ≥3× precedent for this concept; if none, say so and suggest what the
   outlier data DOES support instead. Then ~25 titles from formula_library.md
   → kill to 3, one-sentence thumbnail concept, and a draft
   projects/{{PROJECT_FOLDER}}/packaging.md — I lock it BEFORE any research.
2. Research + fact-check — show me your sources and the key facts
   ({{KEY_FACTS_TO_VERIFY}}) so I can verify BEFORE you write anything.
   Also build the reference pack: 5–15 real photos/plans into references/ (with
   source URLs) + references/visual_facts.md with the visually checkable claims.
3. Script — draft it in the witness + engineer + wit voice; I'll rewrite the hook
   and my perspective paragraphs. Confirm it still delivers what packaging.md
   promises (drift check).
4. Storyboard (~60–80 scenes) — populate visual_facts + reference_image on every
   scene that depicts the real structure.

Save to projects/{{PROJECT_FOLDER}}/. I'll generate the images (with the accuracy
gate before any animation) and record narration myself.
```

### Placeholder key
- `{{TOPIC_OR_CONCEPT}}` — the subject, e.g. *"the Grand Anicut (Kallanai) — the 2nd-century dam still irrigating Tamil Nadu"* (the final title comes out of step 0, not in)
- `{{ONE_LINE_HOOK}}` — the curiosity angle in a phrase, e.g. *"a 1,900-year-old dam that never stopped working"*
- `{{CIVILIZATION}}` / `{{ACCENT_HEX}}` — region + its accent from brand_guide §3 (e.g. Indian / `#D4812A`)
- `{{KEY_FACTS_TO_VERIFY}}` — the specific numbers/claims to check (dates, dimensions, mechanism)
- `{{PROJECT_FOLDER}}` — `NNN_shortname`, e.g. `001_grand_anicut`

---

## Filled example

```
Start a new video for The Engineering Atlas: the Grand Anicut / Kallanai
(a 1,900-year-old Chola dam that still irrigates a million acres).
Use the `the-engineering-atlas-video` skill and follow `brand_guide.md` and `style_card.txt`.
Civilization / accent: Indian (#D4812A).

Work through it in gated steps and STOP for my sign-off at each gate — don't run ahead:
1. Packaging — check data/outliers.csv (+ tell me if the CSV is stale)
   for a ≥3× precedent for ancient-dam / still-in-use infrastructure; if none,
   say so and suggest what the outlier data DOES support instead. Then ~25
   titles from formula_library.md → kill to 3, one-sentence thumbnail concept,
   and a draft projects/001_grand_anicut/packaging.md — I lock it BEFORE any
   research.
2. Research + fact-check — show me your sources and the key facts
   (construction era, dimensions, the water-splitting mechanism, what's original
   vs British-era retrofit) so I can verify BEFORE you write anything.
   Also build the reference pack: 5–15 real photos/plans into references/ (with
   source URLs) + references/visual_facts.md with the visually checkable claims.
3. Script — draft it in the witness + engineer + wit voice; I'll rewrite the hook
   and my perspective paragraphs. Confirm it still delivers what packaging.md
   promises (drift check).
4. Storyboard (~60–80 scenes) — populate visual_facts + reference_image on every
   scene that depicts the real structure.

Save to projects/001_grand_anicut/. I'll generate the images (with the accuracy
gate before any animation) and record narration myself.
```

---

## Short version (once you're comfortable)

After a few videos you can skip the detail — the skill remembers all of it:

```
New Engineering Atlas video: {{TOPIC_OR_CONCEPT}}. Packaging first
(precedent + titles + packaging.md), then the gated pipeline, stop at each gate.
Save to projects/{{PROJECT_FOLDER}}/.
```
