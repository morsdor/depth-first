# s001 · Thumbnail — Stage-4 Typography

> `thumbnail-workflow` SKILL Stage 4 (local typography, **never AI lettering**). Locked direction:
> **A · "The Asymmetry / the reactor"** (`packaging.md` + `research.md` §6). Type is **real** —
> rendered locally with Pillow, never by the image model. **The Stage-2 plate is generated** as of
> 2026-08-20; the earlier stand-in renders are kept below, marked superseded. Outputs in `output/`.

## Decided

- ✅ **Direction:** A — the reactor (Three Mile Island / 835 MW), phone-vs-machine asymmetry.
- ✅ **Layout convention (this channel, all videos):** **subject on the RIGHT, hero type on the LEFT**
  over clean dark space. Same discipline as 001's structure-left / text-right.
- ✅ **Hero text (2026-08-20): `835 MW`, alone.** No kicker. Reasoning in `packaging.md` — short
  version: the image is a cooling tower, so the picture already says "nuclear reactor"; the number is
  the one thing it can't say. This reverses the ⭐ the earlier study put on "A NUCLEAR REACTOR".
- ✅ **Display face (2026-08-20): Archivo Black**, now vendored at `assets/fonts/ArchivoBlack-Regular.ttf`
  (OFL). The channel brand exists as of 2026-08-17, so the font is no longer provisional — this
  supersedes the Arial Black / IBM Plex Sans study below.
- ✅ **The §4 rule collision, settled by test.** `brand_guide_software.md` §4 says *thumbnail hero →
  Archivo Black* **and** *numbers are always mono*. `835 MW` is a number, so both applied. Rendered
  head-to-head (`thumb_D_font_contact_sheet.png`): **Archivo Black wins decisively.** Mono's uniform
  advance width forces wide sidebearings — at 120px the lockup spreads wider at lower stroke density
  and fragments "835" and "MW" into two words instead of one mark. §4 now carries an explicit
  thumbnail carve-out so this doesn't get re-litigated per video. **In-frame numbers stay mono.**

## ✅ SHIPPED — `output/thumb_FINAL_835mw.png` (2026-08-20)

1280×720, 1,035 KB (YouTube's cap is 2,048 KB). The v2 plate, tight crop, phone composite,
`835 MW` in Archivo Black signal amber. Locked by the user.

Still open, both optional and neither blocking:
- ~₹12 for a denser native-resolution re-render (the shipped crop is a 1076px source upscaled 1.19×,
  and v2's datacenter is a low flat hall — less imposing than the rejected v1's tall block).
- **A/B variant B** (reactor + AI model logos) — approved as the test axis, not yet built. Same plate,
  local vector logos only. See `packaging.md`.

---

## Stage-2 plate — GENERATED 2026-08-20 (4 images on `gemini-3-pro-image`, ~₹46)

Run: `--brand depthfirst --vary pairing`. The `pairing` axis (added for this video) varies how the
two objects are weighed against each other, not crop tightness — the inherited `crop` axis was
written for linear stone structures and teaches nothing about a two-object composition.

| | Framing | Squint result |
|:--|:--|:--|
| a | power source dominates, datacenter small at its foot | Elegant but collapses to *one cooling tower* at 120px; datacenter is a thin strip |
| **b** ⭐ | the two side by side, joined by the cable run | **The only one where both objects survive the squint.** Datacenter unmistakably a datacenter |
| c | a horizon of datacenters converging on one tower | The fleet never materialised — two buildings, one a ghost |

**The composition constraints held on all three** (left third clean, subject right two-thirds, clear
lower-left plane). That is the pro model earning its cost; stacked spatial clauses are exactly what
flash drops. **Colour question settled: amber.** The real plate is full of near-white (plume, window
rows); bone shares both luminance and hue with all of it and is absorbed, while amber owns a hue
nothing else in the frame uses. This **reverses** the stand-in study's provisional read — correctly,
since that read was flagged as placeholder-dependent.

### ⚠ Accuracy defect found and fixed — the "arcs" bug

v1 of candidate b rendered **lightning inside the cooling-tower plume**, plus arcing along the
transmission lines, and a dark storm-grey plume that read as smoke. All three are wrong: a fission
plant burns nothing, so there is no exhaust — the plume is condensing water vapour off the tertiary
loop, three loops removed from the core and not radioactive. A dark smoky plume reinforces the single
most common misconception about nuclear power, on the debut thumbnail of a channel whose §12 test is
*"would an engineer watch it without wincing."*

**Root cause was our own prompt, not the model.** The Depth First palette clause said
*"power-line arcs"* — meant as the catenary sag of hanging cable, read by the model as electrical
arcing. Changed to **"illuminated cable runs"** in `generate_thumbnail.py`'s brand profile, so it
cannot re-seed on future videos. A `--facts` flag was added for physical-accuracy constraints
(the thumbnail's `visual_facts`), and `--only` so fixing one candidate does not pay for three.

**v2 fixed the plume completely** — clean white/pale-blue vapour, clear dark sky, steady glowing
conductors — but the reworded subject made the model reflow the scene smaller, weakening the squint.
Recovered for ₹0 by cropping in (`thumb_b_v2crop_final.png`, 1076px source → 1280×720, a mild 1.19×
upscale). Compare all three in `thumb_final_compare.png`; `thumb_b_v1_final_amber.png` and
`thumb_b_v1.png` are kept as the rejected-but-punchier reference.

**Remaining weakness:** v2's datacenter is a low flat hall, less imposing than v1's tall glowing
block. If that matters more than the ~₹12, one more generation with a fill-the-frame instruction
would give a native-resolution, denser version.

---

## The phone is a LOCAL composite, not a prompt instruction — and that was the right call

The Stage-2 prompt bans all text and logos (SKILL rule 3), so "hi" and the chat UI could never have
come from the model. Drawing them locally turned the chat-UI requirement from *hope the model
complies* into a guarantee, and it is free to iterate. Two things the build learned:

- **Size, not UI detail, is what makes it read.** The original concept said "a single tiny phone";
  at 120px a tiny phone is a dark sliver and the thumbnail scans as an energy video. The phone is
  drawn at ~40% of frame height.
- **The AI signal is the SHAPE of the exchange**, not the interface chrome: one small bright question
  bubble, then a long dense block of answer. That silhouette survives blur. A single message bubble
  reads as SMS at any size.

Logos for variant B follow the same rule — local vector only, never image-model output.

## Current renders

| File | What it is |
|:--|:--|
| **`thumb_FINAL_835mw.png`** | ✅ **SHIPPED.** (identical to `thumb_b_v2crop_final.png`) v2 plate, tight crop, phone composite, `835 MW` in Archivo Black amber |
| `thumb_b_final_amber.png` / `_bone.png` | v2 uncropped, both colour options — the amber-vs-bone test |
| `thumb_final_compare.png` | v1 vs v2-uncropped vs v2-crop, full · 120px · 120px zoomed |
| `thumb_b_v1_final_amber.png`, `thumb_b_v1.png` | the rejected lightning-plume version, kept for reference |
| `thumb_a.png`, `thumb_c.png` | the losing pairing candidates |
| `thumb_squint_sheet.png` | the raw a/b/c plates at squint size |

<details>
<summary>Superseded — the 2026-08-13 study (pre-brand, pre-hero-lock)</summary>

Rendered before the channel had a brand guide or a name, in Arial Black + one IBM Plex Sans comparison,
across three candidate heroes. Kept for the record; **do not build from these.**

| File | Hero | Then-verdict |
|:--|:--|:--|
| `thumb_A_835mw.png` | 835 MW | "leans on the image to explain MW" — now the locked hero |
| `thumb_B_reactor.png` | A NUCLEAR / REACTOR | ⭐ then-recommended — now rejected (restates the image; 5 words vs the ≤4 budget) |
| `thumb_C_fleet.png` | 1 BILLION / A DAY | fleet-scale alt; still a title-level alternate only |
| `thumb_B_reactor_plex.png` | as B, IBM Plex Sans | font comparison, superseded by the Archivo test |

</details>

## Re-stamping type (the house tool, ₹0)

Type is stamped by `add_thumbnail_text.py` (Pillow, local, never AI text). The `--font` flag is
**required** for this channel — the tool's default is Fraunces, The Engineering Atlas's face, so
omitting it silently stamps the wrong brand.

```bash
python add_thumbnail_text.py \
  --input  projects/s001_ai_physical_cost/output/thumb_plate.png \
  --output projects/s001_ai_physical_cost/output/thumb_835mw_text.png \
  --hero "835 MW" \
  --corner tl \
  --color "255,176,32" \
  --font assets/fonts/ArchivoBlack-Regular.ttf
```

Swap `--color "232,230,225"` for the bone comparison, then squint both at 120px and lock the colour.

*(The study driver that produced the stand-in renders lives in the session scratchpad:
`build_s001_thumb_typo_v2.py` — it imports `add_thumbnail_text.render`, so the type is stamped by the
real house tool; only the 120px siblings and contact sheet are scratchpad code.)*

## Stage-3 squint check (recorded, on the stand-in)

- [x] One dominant object ≥60% (the machine, right) — ✅ in the stand-in; **must hold in the real plate**.
- [x] ≤4 words readable at 120 px — ✅ `835 MW` survives cleanly at 2 words.
- [x] **AI signal legible at 120px — ✅ PASSES on the real plate.** Not because the UI is readable
      (at 120px nothing inside a phone could be) but because the *shape of the exchange* survives
      blur: one tiny bright bubble, then a long dense block of answer. That silhouette says "AI";
      a plain message bubble would not. The phone is drawn locally at ~40% of frame height —
      "a tiny phone" as originally specced would have vanished.
- [x] Pops on dark UI — ✅. ⚠ Re-check on a **light** UI once the real plate lands.
- [x] Curiosity gap — ✅ tiny "hi" vs a reactor is the whole hook; the number doesn't answer *why*.

## Next

1. 120px re-check on a **light** UI — only dark has been checked.
2. Build variant B (logos, local vector) → YouTube Test & Compare → log in `assets/thumbnails_log.md`.
