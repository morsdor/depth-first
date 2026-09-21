# s001 · The Physical Cost of AI — Packaging (LOCKED)

> **Stage-1 packaging-gate deliverable** — the founding document for this project, locked *before*
> research spend (mirrors `projects/001_roman_aqueduct/packaging.md`, the house format precedent).
> This is **video 001 of the software-storytelling channel** (a separate channel from The Engineering
> Atlas — see `projects/s001_ai_physical_cost/README.md`). Evidence base:
> `data/outliers_software.csv` (42 outliers / 16 comps, scanned 2026-08-09).

| Field | Value |
|:--|:--|
| **Video #** | s001 (software channel — pilot) |
| **Concept** | The hidden industrial machine — power, water, chips — behind a single AI answer |
| **Vein** | AI/LLM (hottest + highest-velocity vein in the software scan) told as an *infrastructure story*, not equation derivation |
| **Pipeline** | Cinematic AI-stills → **Remotion** (datacenters, grid, cooling, fabs). **No Manim / procedural-animation build required** — the concept was chosen partly because it renders as plate-plus-camera, the cheapest motion we have. *(Amended 2026-08-17: originally read "→ After Effects"; AE was retired that day. The rationale is unaffected — plate-plus-camera is the `PlatePush` family, and the stills themselves are unchanged.)* |
| **Runtime target** | 10–13 min |
| **Status** | ✅ Packaging locked (2026-08-09) · ✅ **Phase-0 research done (2026-08-10)** — hero number resolved, thumbnail unblocked (see `research.md`). Two changes below: water-bet runner-up **killed**; thumbnail number pivots per-query → **machine/aggregate scale**. Next: user locks thumbnail direction → script |
| **Locked** | 2026-08-09 |

## Locked title

> ## Why AI Is So Expensive to Run

- **Formula:** **F2 · Why X Is/Isn't Y** — resolves a tension every viewer half-feels but never had
  answered: AI *feels* weightless and free; it isn't.
- **Our twist:** reframe "expensive" from dollars → **physical cost** (gigawatts, water cooling,
  silicon). That's the part the proven precedent (a talking-head channel) never *showed*, and the part
  our cinematic pipeline renders best. Same proven hook, better-looking execution.

## Why it earned production — the gate evidence (both axes)

A concept earns research hours only on a **≥3× precedent** that clears **both** axes — packaging lift
(`multiple`) *and* topic demand (`views_per_day`). The "physical machine behind AI/computing" clears
the bar on **four** independent comps, across both the cost frame and the hardware frame:

| Precedent (comp channel) | Angle | Lift (`multiple`) | Demand (`views/day`) | Read |
|:--|:--|:--|:--|:--|
| Computerphile — *Why AI Tokens are so Expensive* | cost of AI | **14.2×** | **22.8** ⬅ 2nd-highest velocity in the software set | Direct hook precedent; both axes maxed |
| Branch Education — *How are Microchips Made?* | the silicon behind AI | 5.8× | 5.7 | The physical machine; both axes strong |
| Branch Education — *How do Graphics Cards Work? (GPU Architecture)* | the chip that runs AI | 3.7× | 4.6 | GPU = the literal engine of the story |
| Veritasium — *The World's Most Important Machine* (EUV litho) | how the chips get made | 3.8× | 2.9 | Cinematic industrial-machine storytelling, huge Tier-1 reach |

**Verdict:** the strongest gate pass available in the software set that *also* fits our pipeline — a
proven cost hook (Computerphile) with a proven, renderable, hardware subject (Branch ×2, Veritasium).

## Locked thumbnail concept — Direction A · "The Asymmetry"

> **Dominant object:** an isometric hyperscale **datacenter glowing electric-blue** against a dark grid
> of power lines / a cooling-tower plume. Foreground: a single tiny phone showing one trivial chat
> message ("hi").
> **Words (≤4):** ✅ **LOCKED — Direction A (2026-08-10): the reactor.** Hero image = phone "hi" → datacenter
> wired to a **nuclear reactor**; hero number/phrase = **835 MW** (or "a nuclear reactor"), the Three Mile
> Island restart Microsoft bought for its AI datacenters. Chosen over per-query figures (0.3 Wh true but not
> visceral; per-query water contested) because it's honest, documented, *and* jaw-dropping. Fleet-multiplier
> ("1B/day") and "3% of Earth's power" retained as A/B test alternates only. See `research.md` §6.

### Hero text — ✅ LOCKED 2026-08-20: **`835 MW`**, alone (2 words)

Set in **Archivo Black** (`brand_guide_software.md` §4 + its thumbnail carve-out — the hero is a number
but display beats mono at 120px). No kicker line.

**Why the number and not the words "A NUCLEAR REACTOR"** (which the Stage-4 study had starred): the
image *is* a cooling tower. The picture already says "nuclear reactor" — loudly, and without requiring
any engineering knowledge. The 001 discipline is *a number carrying what the image can't*, and `835 MW`
is the one thing the picture cannot say. Putting the words on it spends the scarcest resource in the
frame restating the art. It also ran 5 words against the ≤4 budget above, and 17 characters forces the
hero down a size. The earlier ⭐ was set weighing the two options against *each other*, not against the
image — that was the error.

### ⚠ Known defect in this direction — the AI signal is invisible at 120px

A phone showing a chat bubble reads as **texting**, not as AI. At squint size the phone is a dark
sliver (confirmed in the 120px study renders). The thumbnail can therefore scan as an
energy/infrastructure video — a materially narrower audience than an AI video, and a mis-sell of the
subject. **Fix, folded into the Stage-2 plate prompt:** the foreground device must be an unmistakable
**assistant-chat interface** — the recognisable chat-UI silhouette with "hi" in it — not a generic SMS
bubble. This is a plate-prompt change, not a text change.

### A/B axis — revised (supersedes the scale-cue plan below)

| | Composition | What it tests |
|:--|:--|:--|
| **A** (primary) | cinematic reactor + chat-UI phone, `835 MW` | craft-led — the channel's founding bet |
| **B** (variant) | reactor + **AI model logos side by side**, `835 MW` | category-convention — instant subject recognition at 120px |

**B is a real test, not a throwaway**, because A's known defect is exactly what B fixes: logos are the
most recognisable shapes in the category and survive any squint. But B carries real costs, which is why
it is the variant and not the lock: it is the single most saturated visual in AI content (undercutting
the craft differentiation that is this channel's whole moat); `docs/comp_deep_dive_codesource.md` found
AI-as-a-subject was that comp's **worst** category, 3 for 3, and logos pull the framing back toward
generic AI content and away from the physical-machine twist that passed the gate; and corporate logos
beside a reactor read as accusation, which contradicts the wonder-not-blame framing `research.md`
settled and the finger-pointing cut from script v2. If B wins anyway, that is a finding worth having.

**Logos, if B is built, are local vector assets only** — never image-model output. Same rule as
lettering: AI-drawn logos come out mangled and read as slop.

*(The original scale-cue A/B — one datacenter → a horizon of them → one wired to a plant — is parked.
It varies a less decisive axis than subject-recognition and can be tested on a later video.)*

- **Design logic (from 001's 120 px study):** one focal point + hard color contrast (electric-blue/gold
  energy vs a dark, moody background) + a number carrying what the image can't. The **absurd gap**
  between one throwaway message and the industrial machine behind it *is* the hook — no infographic
  clutter (busy charts are the first thing 120 px destroys).
- **Number rides the hero stat, not a chart.** Same discipline as 001's `2.5 cm`.
- **Typography:** local only, channel display face (never AI lettering). One side image / one side text.

### A/B generation plan (Stage 2 — vary ONE axis)
- **Hold:** the hero number, the electric-blue-on-dark palette, the phone-vs-datacenter asymmetry.
- **Vary:** the **scale cue** — a/b/c from a single datacenter → a horizon of them → a datacenter wired
  to a power plant. Teaches "how much scale-shock wins in this niche."

## Runner-up titles (for Test & Compare / fallback)
1. **F5 · AI's Enormous Power Problem** — sharper, more visual thumbnail (grid/substation); the
   power-grid-strain angle is the most documented and defensible, and the purest engineering framing.
   The safe alternate.
2. ~~**Number bet · It Takes a Bottle of Water to Answer One AI Question**~~ — 🚫 **KILLED by Phase-0
   research (2026-08-10).** The modern per-query figure is **~15 mL, not 500 mL**; the 500 mL figure was
   *10–50 queries* on GPT-3 (2023) and its own author has retracted it. As a literal per-query title this
   is the overclaim that burns the expert audience (the F1/F2 failure mode). If a water-shock title is
   ever revived it must move to the **aggregate** and even then sits behind the two power lanes. See
   `research.md` §2 + §6.

## Gate sign-off (Stage-1 checklist)
- [x] ≥3× precedent on comparable channels — **four**, cost + hardware frames
- [x] Clears **both** axes (lift *and* demand) — Computerphile 14.2× / 22.8 vpd
- [x] Title from `formula_library.md`, proven-at-topic formula (F2, backed by F5)
- [x] One-sentence thumbnail concept (dominant object + ≤4 words) that's a real hook
- [x] Locked here before any research spend
- [x] **Hero number fact-checked** ✅ (2026-08-10, `research.md`) — energy ~0.3 Wh (solid); water ~10–15 mL
      all-in (contested). Blocker cleared; thumbnail number pivots per-query → machine/aggregate scale.

## Phase-0 handoff (research questions this packaging commits us to)
1. **The hero number** — energy (Wh) and/or water (mL) per typical LLM query, with a *defensible,
   sourced* figure and its assumptions (model size, datacenter PUE, cooling type). This is the `2.5 cm`
   of this video — **no thumbnail lock without it.**
2. **The industrial chain to render** — query → GPU cluster → datacenter power draw → grid/substation →
   generation source → water cooling. Each link is a plate/scene.
3. **The honest counter-framing** — a *single* query's cost is small; the story is *aggregate* scale.
   Pin the framing so the title cashes what the video delivers (the F1/F2 overclaim failure mode).
