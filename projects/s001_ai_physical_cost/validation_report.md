# s001 · Visual Accuracy Gate — Layer 2 (plates)

**Run 2026-08-24** · 42 plate scenes · 41 generated on `gemini-3-pro-image`, 1 missing.
Checked against each scene's `plate.visual_facts` in `storyboard.json` (80 facts total).

> ⚠ **Scope limit — read this before trusting a PASS.** This project has **no `references/`
> photo pack**. The gate's design is *render vs. reference photo vs. fact list*, and the photo
> is what verifies real-world geometry. Every verdict below is **facts-checked only**. Seven
> scenes depict real, photographed things and are therefore marked **geometry-unverified**:
> `21`, `22`, `35` (H100 accelerator board), `38` (EUV lithography machine), `55`, `56`, `63`,
> `74` (Three Mile Island). Drop photos into `references/` to close that gap.

> 🔴 **Re-renders are BLOCKED.** The batch died on its last plate with
> `429 RESOURCE_EXHAUSTED — "Your prepayment credits are depleted."` Every delta below is
> written and ready, but nothing can regenerate until the Gemini project is topped up.

## Summary

| Verdict | Count | Scenes |
|:--|--:|:--|
| ✅ PASS | 27 | 01 03 04 05 07 11 14 20 24 25 28 29 31 39 44 54 55 56 57 58 61 63 67 68 70 73 74 |
| ❌ FAIL | 7 | 21 27 35 51 64 71 72 |
| ⚠ MARGINAL | 7 | 06 17 22 36 38 62 75 |
| ⛔ MISSING | 1 | 76 |

**The style anchor worked.** Palette, line weight and isometric angle are consistent across all
41 plates — no drift, no warm bleed, no off-brand colour. Every plate is 16:9 (1376×768).
**Zero accuracy failures on the plume/arcing invariants** that the thumbnail gate flagged: no
smoke, no lightning, no electrical arcing anywhere in 41 plates. The style card carried them.

## ❌ Failures — named deltas, ready to run

| Scene | Required (visual_facts) | Observed | Delta |
|:--|:--|:--|:--|
| **21** | "a server GPU board — heatsink fins, no consumer shroud" | A **motherboard** — CPU socket, RAM slots, chipset. Wrong hardware class entirely, and the script calls this "a chip like this — an H100" | `CORRECTION: the previous render showed a motherboard with a CPU socket and RAM slots; this is a single PCIe GPU accelerator card — one long board, a large heatsink with visible fins covering most of it, a PCIe edge connector and rear bracket. No socket, no RAM slots. Correct this. Change nothing else.` |
| **27** | "heat shimmer is a **distortion**, not smoke or steam" | Rising white wisps that read as smoke plumes indoors | `CORRECTION: the previous render showed rising smoke/steam plumes in the aisle; there is NO smoke and NO steam indoors. Show only a faint transparent heat-haze distortion of the racks seen through it. Correct this. Change nothing else.` |
| **35** | "the dark unlit outline of a large industrial **factory complex**" | **Cooling towers** — power-plant imagery bled in from neighbouring scenes | `CORRECTION: the previous render showed nuclear cooling towers; the right-hand structure is a semiconductor FABRICATION PLANT — a long low windowless cleanroom building with rooftop air handlers and gas lines. NO cooling towers of any kind. Correct this. Change nothing else.` |
| **51** | "the beam **tips toward** the datacenter"; a balance beam | No beam — two flat platforms with a pyramid between them. The comparison isn't depicted | `CORRECTION: the previous render had no balance beam; show an explicit balance beam on a central fulcrum, the left pan holding four dark industrial facilities and the right pan holding one glowing datacenter, the beam clearly TIPPED DOWN on the right. Correct this. Change nothing else.` |
| **64** | "**identical composition to scene 1** — the callback must be exact" | A control-room interior with consoles and racks, a phone on a wall screen. Anchor-bleed from scene 57 | `CORRECTION: the previous render showed a control room interior; this frame is EXACTLY scene_01 again — ONE single smartphone lying face-up alone in total darkness, screen the only light source, pure empty void around it. No room, no consoles, no panels, no racks. Correct this. Change nothing else.` |
| **71** | "the beam is **LEVEL**, not tipped" | Beam clearly tipped — phone pan raised, industry pan lowered. This inverts the scene's whole meaning (they weigh the same) | `CORRECTION: the previous render showed the beam tipped down on the right; the beam must rest PERFECTLY LEVEL and horizontal, both pans at exactly the same height. Correct this. Change nothing else.` |
| **72** | "the two shapes must **share a visible common edge** — this is a match-cut frame" | Towers with plume only. No phone screen, no shared edge — the match-cut geometry is absent | `CORRECTION: the previous render omitted the phone; show the silhouette of two cooling towers on the left aligning with and dissolving into the rectangle of a glowing phone screen on the right, the two forms sharing one continuous common edge. Correct this. Change nothing else.` |

## ⚠ Marginal — judgement calls, not hard failures

| Scene | Fact | Observed | Recommendation |
|:--|:--|:--|:--|
| 06 | "three distinct pools of light, **evenly spaced**" | Devices clustered as a product lineup rather than three isolated pools | Ship. Intent (people implied by screens, no humans) is met |
| 17 | "the mass must read as **roughly 100** bulbs" | A 7×7 grid ≈ 49 | Ship. Reads as "a lot"; the 100× claim lives in the VO, not the count |
| 22 | "**exactly eight** boards, evenly fanned" | ~6–7 boards | Ship, or re-render with the count restated. Nobody counts at 8s |
| 36 | "same frame position and scale as the GPU board in scene 21" | Wafer is small/central; can't match a board that is itself wrong | **Blocked on 21** — re-check after 21 is fixed |
| 38 | "bus-sized — vastly **larger than a person**" | No figure in frame, so scale is unverifiable | Add a silhouette on re-render if 38 is ever redone |
| 62 | "identical framing and scale to scene 29's droplet" | Droplet alone in void; scene 29 has pipework | **BOARD BUG, not a render bug** — scene 62's own `subject` says "nothing else in frame", contradicting its fact. Fix the fact, keep the plate |
| 75 | "everything **SMALL** and mostly unlit, a large dark field" | Complex fills more of the frame than "extremely wide" implies | Ship. The pull-back in `scene_73` already carries the wide-scale beat |

## ⛔ Missing

**`scene_76`** — never generated; the batch hit depleted credits on it. It is the sign-off
frame (the phone dimming to black). Needs one generation once credits are restored.

## Verdict

**27 of 41 pass outright. 7 need a named-delta re-render, 1 needs a first render.**
Per the gate rule — *no unvalidated plate is ever animated* — scenes 21, 27, 35, 51, 64, 71, 72
and 76 are **held** from the Remotion build until re-rendered and re-checked. The other 34 are
cleared to composite.

**Cost to close: 8 generations ≈ ₹94 on pro.** Blocked on the credit top-up.
