# `r021` — Which ice raises the sea (`I93`) — build record

**Backlog id `I93` · §2 `infrastructure` · silent, 3D, 59.4 s · number claimed 2026-10-14 · NOT POSTED.**
The sentence: *"When the ice in your drink melts, the glass doesn't overflow — so melting sea ice barely raises the sea. It's the ice sitting on land that does."*
Gate 0 and the send test passed 2026-10-13; **G4 approved 2026-10-14 ("let it take its full length")**; G5 is the owner watching it end to end.

**READ FIRST — what is and is not settled:**

| | |
|:--|:--|
| the physics | **EXACT**, asserted (`research/melt_check.py`) |
| the reading time | **a rule a program checks** (`research/read_budget.py`), re-run on every `emit_ts.py` |
| "about 1.5 inches" (all floating ice) | **SEARCH-LEVEL, one abstract.** Must be read at a primary before posting |
| "about 24 feet" (all of Greenland's ice) | **SEARCH-LEVEL** (Morlighem et al. 2017, 7.42 m). Must be read at a primary before posting |
| Greenland on screen | real ice-SURFACE elevation, checked at five stations; **not** ice thickness, **not** imagery |

## The files

```
projects/r021_whichice/
  gate0/            GATE0.md · mock_payoff.py · payoff_frame.png          the sentence, the still, the send test
  SCRIPT.md         the G4 script, the contract; §9 is what the build changed
  research/
    melt_check.py   → figures.json        the physics, asserted; the level curves the build plays back
    read_budget.py  → beats.json          the owner's reading-time rule; BLOCKS and EVENTS (the copy and its windows)
    RESEARCH.md                           every figure graded; negative results
  greenland.py      → greenland_grid.json · remotion/public/whichice/greenland_tex.jpg
  emit_ts.py        → remotion/src/reels/data/whichice.ts                 REFUSES to write if a claim is false
  NOTES.md          this file
  r021_whichice.mp4 the render
remotion/src/reels/WhichIce.tsx · lib/glass3d.tsx · data/whichice.ts (generated)
scripts/glass_probe/                       the probe that settled whether the glass was possible (not a reel)
```

Regenerate: `python3 -I projects/r021_whichice/research/melt_check.py && python3 -I projects/r021_whichice/greenland.py && python3 -I projects/r021_whichice/emit_ts.py`.

## Figures, with provenance

| figure | value | grade | source |
|:--|:--|:--|:--|
| floating ice leaves the level unchanged | identical at all 200 melt steps (< 1e-9 cm) | **EXACT** | `melt_check.py` §1 |
| the shelf glass ends where the floating glass already was | 9.525 cm, to 1e-9 | **EXACT** | §1 |
| a real 20 °C drink | level falls 0.17 mm, returns exactly when it warms back | **EXACT** | §2 (not on screen) |
| the salt-water remainder | 2.60 % of displaced volume at ρ = 1.026, unfitted | computed; **agrees** with the published 2.6 % | §3; Noerdlinger & Brower 2007, search-level |
| all floating ice, sea ice + shelves | about 4 cm = 1.57 in | **SEARCH-LEVEL, one abstract** | Noerdlinger & Brower 2007, *GJI* 170:145–150 |
| Greenland, all of it | 7.42 ± 0.05 m = 24.3 ft | **SEARCH-LEVEL** | Morlighem et al. 2017, *GRL* |
| the Greenland ice surface | five stations within 1.2 % (Summit 3,209 vs 3,216 m; NGRIP 2,921 vs 2,917; Dye-3 2,476 vs 2,490; EGRIP 2,674 vs 2,708; Camp Century 1,876 vs 1,886) | **computed against published station heights** | `greenland.py`; AWS terrain tiles z4 |
| glaciated area, and its share of the land | 1.83 M km², 83 % (published ~1.8 M, ~80 %) | computed against outside numbers | `greenland.py`; Natural Earth 1:10m |

## The beats (`SCRIPT.md` is the table; times are `emit_ts.py`'s `ANIM` and `read_budget.py`'s `BLOCKS`)

0.3 **B01** the hook · 1.0 the cube starts to melt, the ring holds · 2.0 the crack · 5.0 **B02** · 8.6 the outline · 10.2 **B03** · 12.8 the fill ·
16.0 the camera slides to two glasses · 17.2 **B04** · 21.8 the shelf ice melts, the ring climbs · 27.0 **B05** · 33.4 the pull-out ·
34.8 **B06** · 36.4 the dissolve to Greenland · 37.8 **B07** · 41.7 the dissolve to the house · 42.2 **B08** · 43.2 the 1.5-inch lift ·
47.7 **B09** · 49.2 the climb to 24 ft · 53.7 **B10** · 59.4 end.

**24 claims asserted in `emit_ts.py`**, among them the timeline-bound ones: the cube is >= 25 % melted when B02 arrives; the outline is fully in
before B03 arrives and stays up as long as the line naming it; the shelf ring has finished climbing *before* the rule (B05) is on screen; the
floes are in before their tag is readable; the "30X" on screen is the mesh's exaggeration; the ring has finished lifting with >= 2 s of B08 still to
read. **A mutation test proved the guard bites:** ending the shelf melt at 28 s made it refuse to write.

## The reading-time rule (the owner, 2026-10-13)

1.0 s + 0.40 s per word at full opacity, one reader in order, every finished animation held >= 2 s, <= 3 blocks at once. **Every line passes; several
have 0.03 s to spare, by construction — the build must not shorten any.** 83 words, 45.0 s of full-opacity reading.

## Traps (the ones worth keeping)

1. **AWS terrain tiles hold the BED under the ice at z5–z9 and the SURFACE at z<=4 and z>=10.** Found only because Summit read 262 m against 3,216. See `research/RESEARCH.md` §4.
2. **A `delayRender` inside `<ThreeCanvas>` did not hold the frame.** Load assets in the DOM tree and pass them in.
3. **Nested transmissive bodies fight over the depth buffer** (`scripts/glass_probe/README.md`): refraction on the glass only, everything inside is a blended volume.
4. **A camera that looks slightly down moves everything when you dolly the group.** `gyFor()` solves the height.
5. **A single-sided plane vanishes from underneath**: the house camera stays above the final sea level.
6. **`useDelayRender`'s release must follow the state update**, not precede it.
7. **A background wrapper reports "completed" while its subshell runs on.**
8. **Fixing one audit can break the other.** Darkening the grounds to pass the safe-area audit pulled held shots under the motion audit's 0.35 floor. Run both
   audits after any change to how the frame looks.
9. **No audit sees a ruler that cannot be read.** The bank stood in front of the tide staff, hiding its 0 mark and most of the ring through the 1.5-inch beat;
   both audits passed it. It was found by looking at a contact sheet of the render. Look at the render, not only at the numbers.
10. **Test an ambient-motion change on a frame range, not the whole reel**: `remotion render <comp> out.mp4 --frames=840-899` is 2.5 min against 40, and
    `reel_motion_audit.py` runs on the short file (ignore its first sample).

## What is NOT claimed

- That any ice melts, at any rate, or over any time: **there is no time anywhere in the script.** The 24 feet is *all of it*.
- That sea ice or floating shelves "don't matter". The sentence is about sea level.
- The ice **thickness** or the **bed**: Greenland is drawn from surface elevation only.
- The height of the house: it is a stylised two-storey, and the staff is the ruler.
- A source: nothing on screen says "a study found".

## Audits (rendered 2026-10-14, cloud container, third full render)

The file: 1,782 frames, 59.46 s, 1080 x 1920, 30 fps, h264, 25.5 MB (Remotion adds a silent AAC track; the reel has no sound by design). ~39 min on 4 vCPUs,
software GL, `--concurrency=2`.

| audit | result |
|:--|:--|
| `scripts/reel_motion_audit.py` (default width) | **PASS** — longest dead spell 0.25 s (limit 1.5 s), median change 1.062, **event density 53 %** |
| `scripts/reel_safe_audit.py --bleed 16.3-17.4,34.0-42.3` | **PASS** on all 1,782 frames; the header band (y < 270) is enforced inside both ranges |
| the beats in the rendered file against `read_budget.py` | every block is absent 0.1 s before its `t_in`, fully on screen 0.45 s after it, still fully on screen 0.25 s before its `t_out`, and gone 0.1 s after it (near-white pixels counted in its caption zone, per block); B07's top zone still held the dissolving house at 42.2 s, read by eye at 41.9 / 42.1 / 42.4 s |
| `research/read_budget.py` | **PASS**; `emit_ts.py` re-ran with all 24 claims asserted |

**The two declared bleed ranges, and why.** 34.0–42.3 s is the sea floes and Greenland's full-bleed relief: scenery that runs off the frame by design, with every
caption inside the safe area. **16.3–17.4 s is the right-hand glass sliding in from outside the frame** (a second render failed 29 frames there; the first
frame outside is at 16.37 s): about one second of a glass crossing the edge, no text. Nothing was done to the luminance threshold (55).

**Read the 53 % honestly.** The camera orbit added in render 3 moves the whole frame at constant speed, so it lifts the density number without being an
event. The events are the beats in `read_budget.py`; the orbit's job is only that no held stretch is at rest. The run of renders: **render 1 failed the safe-area
audit on all 1,782 frames** (scenic grounds above the threshold, header band included), **render 2 failed the motion audit** (5.0 s dead spell at 27.8 s, because
darkening the grounds for the first audit left a held glass pair changing ~0.2 per sample against the 0.35 floor) and one safe-area range, and showed a
**staff and ring hidden by the bank** that no audit can see.

## Open, and whose

| item | who |
|:--|:--|
| read Noerdlinger & Brower 2007 and Morlighem et al. 2017 at the primary | **Mac, or the owner pastes them** — blocks posting |
| G5: watch it end to end, on a phone | **the owner** |
| the thin ring and outline on a phone | **the owner's phone** |
| the caption: name both slogans, state the 2.6 % salt effect, the scope of "all", and no time scale | drafted in `reel_captions_log.md` |
| strict one-move glass-to-planet, ice thickness, NASA imagery | a Mac build, if wanted |
