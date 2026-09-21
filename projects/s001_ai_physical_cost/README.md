# s001 · The Physical Cost of AI

**Pilot video (001) of a new, second channel: software-engineering *storytelling*** — narrative,
high-craft, few-but-polished videos, distinct from The Engineering Atlas (this repo's main channel).
The channel is **Depth First** (`@thedepthfirst`, named 2026-08-20); this project is its first
concrete deliverable.

## Why this exists (the evidence trail)

1. **Idea:** can a software-engineering *storytelling* channel (not a coding-tutorial channel) grow?
2. **Scanned the lane:** `data/comp_channels_software.yaml` → `data/outliers_software.csv`
   (42 outliers ≥3× across 16 comps, 2026-08-09). Control group: `data/comp_videos_software.csv`.
3. **Hottest, highest-velocity vein:** AI/LLM. Second was evergreen algorithms-as-animation
   (3B1B/Reducible lane — needs a Manim capability we don't have). Third: incident stories
   (Kevin Fang lane — pilot #2 candidate).
4. **Concept chosen:** the *physical/industrial cost of AI* — the one AI angle that (a) rides the
   strongest replicable precedent (Computerphile *Why AI Tokens are so Expensive*, 14.2×/22.8) and
   (b) renders as **cinematic AI stills + camera/parallax motion**, no Manim-style procedural
   animation required. *(Originally justified as "fits the existing AE pipeline"; AE was retired
   2026-08-17 and the build is now Remotion — the reasoning survives the switch intact, since
   plate-plus-camera is `PlatePush`, the simplest composition family we have.)*
5. **Packaging gate:** passed — see `packaging.md` (locked title + thumbnail + 4-precedent evidence).

## Status

- ✅ Packaging locked (`packaging.md`, 2026-08-09)
- ✅ **Phase-0 research done** (`research.md`, 2026-08-10) — hero number resolved (energy ~0.3 Wh solid;
  water ~10–15 mL all-in but contested). Thumbnail **unblocked**. Two changes: water-bet runner-up title
  **killed** (500 mL/query is false); thumbnail number pivots per-query → **machine/aggregate scale**
  (recommended: the Three Mile Island reactor restart).
- ✅ **Thumbnail direction locked** — A, "the reactor" (Three Mile Island / 835 MW), 2026-08-10.
- ✅ **Script — v2 LOCKED by the user 2026-08-20** (`script.md`): **1,748 words ≈ 12.1 min at 145 wpm**
  (measured; the old "~1,950 / 11.8 min" footer was an estimate and self-inconsistent). Dazzle ladder
  rack→plant→fab→nation→reactor. v2 rebalanced **off water** (power = 3 of 5 tentpoles + climax) and
  **cut the finger-pointing**. ⚠ Words are locked, **register is not** — re-read against
  `brand_guide_software.md` §6 before the VO record.
- ✅ **Thumbnail — Stage-2 plate GENERATED + Stage-4 type LOCKED** (`thumbnail.md` + `output/`,
  2026-08-20). Hero is **`835 MW`, alone**, Archivo Black, **signal amber** (the real plate settled
  amber vs bone — it is full of near-white, which absorbs bone). Plate generated on
  `gemini-3-pro-image` via the new `--brand depthfirst --vary pairing` path; 4 images, ~₹46.
  ✅ **SHIPPED: `output/thumb_FINAL_835mw.png`** (1280×720, 1,035 KB). The phone + chat UI is a **local
  composite**, not model output — which is what makes the AI signal survive the 120px squint.
  ⚠ One accuracy defect was caught and fixed: the first render put **lightning in the cooling-tower
  plume**; root cause was our own palette wording ("power-line arcs"), now corrected at source so it
  cannot recur on future videos. Optional next: variant B (logos) → Test & Compare.
- ✅ **Studio board COMPLETE + scaffolded** (`storyboard.json` + `shot_list.md`, 2026-08-24).
  **77 scenes · 12.24 min · 26,652 frames.** Validator 0 errors; `npm run lint` green
  (eslint + tsc + brand:check). **42 plates / 35 assembly** — every chart, counter, map and
  schematic is built in Remotion from code, so 35 scenes need **no AI generation at all**
  (₹0 instead of ~₹260, and the numbers are correct because no model draws them).
  **The asset batch is empty** — no charged asset gate for this video. 13 Remotion components
  scaffolded, all 77 compositions registered. Three board bugs caught by the build: an illegal
  accent (`#4DA3FF` → `#22D3EE`), `TitleCard.tsx` still saying "LOAD BEARING", and 10 scenes
  mis-routed to `Counter`. See `shot_list.md` Pass 7.
- ⬜ **NEXT — charged gate:** the plate batch, 42 images ≈ ₹310 (flash) / ₹491 (pro). Then the
  VO record + timing true-up, animatic, build session, Premiere conform.

## Format decision — storytelling, not personality (2026-08-10)

Considered and **rejected** the personality/challenge-entertainment lane (ref: **commonLuke** —
@commonLuke, ~51k subs in 8 months on "I Tried to [learn/build] X" videos, 243k median views). It grows
fast, but its moat is a charismatic on-camera human — the one thing we *can't* AI-leverage — and it needs
on-camera charisma + faster cadence. That's the opposite of the "few, high-craft, AI-leveraged, off-camera"
intent. Kept as an **audience-lane reference** (same dev-curious viewer, different format), not a model to
copy. Fireship-style "blend" (voice/personality + tech, faceless) remains a possible future lever.

## Open channel-level decisions

- ✅ **Channel name — LOCKED 2026-08-20: "Depth First"** (`@thedepthfirst`). Chosen over Machine Code,
  Monolith and Commit History; Load Bearing, Bare Metal, Source Code, Code Story and In Review all
  died on either a live handle collision or a wrong signal — full reasoning and the rejection table in
  `brand_guide_software.md` §0. The name is deliberately dev-gated, which **amends §12** (see its
  scope note): the test governs the video, not the name. Wordmark, channel art and **this video's
  thumbnail typography are unblocked** — the thumbnail thread can restart.
- ✅ **Brand guide — written** (`brand_guide_software.md`, 2026-08-17). The Engineering Atlas
  `brand_guide.md` does not transfer; this is its sister document.
- **Visual language** — cinematic/industrial (this concept) vs conceptual-animation (the algorithms
  vein). This pilot deliberately picks cinematic because it is the cheapest to build; revisit if the
  channel leans toward the 3B1B/Reducible lane later.

## Files
- `packaging.md` — the locked Stage-1 gate deliverable (founding document).
- `research.md` — Phase-0 research + fact-check (hero number, industrial chain, honest counter-framing, dazzle spine).
- `script.md` — DRAFT v2 VO script (~12 min); written in EA's witness/engineer registers — **re-check
  against `brand_guide_software.md` §6** ("The Insider and the Translator"), which now supersedes them.
- `teleprompter.html` — standalone offline teleprompter for the read (double-click to open; electric-blue palette). Regenerate from `script.md` if the script changes.
- `thumbnail.md` + `output/thumb_*` — the thumbnail record: Stage-2 plate generation (candidates,
  the accuracy defect and its root cause), the Archivo-vs-mono type test, and the local phone composite.
- `monetization.md` — channel-level earnings model (AdSense / sponsorships / product); migrate to the
  channel brand doc once the channel gets its own home.
- Channel-level docs at repo root: `brand_guide_software.md` (identity, color, type, §5 motion spec),
  `docs/comp_deep_dive_codesource.md` (the comp that shaped the format).
- Shared research assets live at repo root: `data/comp_channels_software.yaml`,
  `data/outliers_software.csv`, `data/comp_videos_software.csv`.
