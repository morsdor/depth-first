# How a reel is made — the whole flow

*Every path and command below exists in the repo as of 2026-09-10. The procedure is the `new-reel`
skill (`/new-reel`); this document is the map of the machine it drives — which tool does what, what
artefact each stage leaves behind, where ffmpeg is, where the fact-checking actually happens, and
where the three humans gates sit.*

---

## 0. The method in one sentence

**Compute the animation, don't author it.** Run the real algorithm (or the real physics) in Python
on real data, dump its intermediate state to JSON, pack that into a TypeScript module, and play it
back frame by frame in Remotion. On-screen numbers are then free and correct because the run
produced them. No image model, no hand-keyframing, no stock footage: ₹0 per reel.

## 1. The flow

```
backlog/open.md (live ids only, six sections = six accent colours)
   │
   │  STAGE 1 · present 5–7 candidates   python3 .claude/skills/new-reel/scripts/backlog_ideas.py
   ▼
 ┌─────────── GATE 1 · the human picks the id ───────────┐
   │
   │  STAGE 2 · Gate 0, in gate0/<id>_<slug>/gate0/
   │     GATE0.md        the sentence, three kill conditions, the argument test, the licence question
   │     mock_payoff.py  PIL / matplotlib, five minutes — proves the sentence CAN be shown
   │     payoff_frame.png
   ▼
 ┌─────────── GATE 2 · the human says yes to the SENTENCE (not the picture) ───────────┐
   │
   │  STAGE 3 · research & measure
   │     fetch_*.py      network once, cached to JSON (Overpass with a real User-Agent, 3 mirrors)
   │     <compute>.py    the real algorithm / integrator; prints every figure; asserts its invariants
   │     design.py       the falsification experiment (r008's found the design equation was wrong)
   │     NOTES.md        every figure with the script and run that produced it; negative results too
   │       → a figure can still kill the concept here (I53 died on its own data)
   ▼
   │  STAGE 4 · build
   │     <name>_data.json ──► emit_ts.py ──► remotion/src/reels/data/<name>.ts   (GENERATED, never hand-edited)
   │                            └── asserts every on-screen claim before writing; refuses otherwise
   │     optional external renderer:
   │     scene_<x>.py ──► scripts/manim_render.py ──► remotion/public/manim/<name>/0000.png … ──► <ManimLayer/>
   │     remotion/src/reels/<Name>.tsx     built on reels/lib/chrome.tsx (ground, header, breath, safe area)
   │     remotion/src/Root.tsx             TWO compositions: r<NNN>-<name> and r<NNN>-<name>-safe
   ▼
   │  STAGE 5 · render & validate
   │     npx tsc --noEmit · npm run brand:check · npx remotion render r<NNN>-<name> … --codec=h264
   │     scripts/reel_motion_audit.py   (ffmpeg samples 4 fps at 240 px wide; dead spell ≤ 1.5 s; event density)
   │     per-beat slices with ffmpeg      (the global number hides the dead beat)
   │     scripts/reel_safe_audit.py      (ffmpeg → raw grey frames → any ink outside x 60–870, y 270–1540?)
   │     the *-safe still · a filmstrip · watch it end to end
   ▼
 ┌─────────── GATE 3 · the human watches the whole reel ───────────┐
   │
   │  STAGE 6 · log & ship — five files, then STOP, do not commit
   │     CLAUDE.md (Built so far) · brand_guide_software.md §13 · reel_captions_log.md ·
   │     backlog/open.md (row + corrections) -> backlog/posted.md on posting · projects/r<NNN>_<name>/NOTES.md
   ▼
   post from the phone · read Insights at 24 h and 7 d · log them
```

Time budget from the skill: Stage 1 ≈ 5 min, Stage 2 ≈ 20 min, Stage 3 hours, Stage 4 hours,
Stage 5 ≈ 1 h, Stage 6 ≈ 20 min. A reel is a day.

---

## 2. The toolchain, as installed on this Mac (2026-09-10)

| Tool | Version here | Used for | Notes |
|:--|:--|:--|:--|
| Node / npm | 24.13.0 / 11.6.2 | Remotion | |
| Remotion | 4.0.512 (`@remotion/cli`, `remotion`, `@remotion/google-fonts`, `@remotion/tailwind-v4`) | compositor + renderer | React 19.2.3, TypeScript 5.9.3. Encodes h264 with its own bundled compositor (`@remotion/compositor-darwin-arm64`), not Homebrew ffmpeg |
| Python | 3.9.6 (system, `.venv`, `.manimenv` — all three) | every computation | `scripts/manim_requirements.txt`'s "Python 3.11" note is about the cloud container, not this machine |
| numpy, Pillow | in system python3 and both venvs | simulation, PIL mocks, the audits | |
| matplotlib | `.venv` | Gate 0 mocks, `design.py` sweeps | |
| Manim Community | 0.18.1 in `.manimenv` | vector/physics layers (r008) | **no LaTeX installed** — `Text` (Pango) only, no `MathTex` |
| ffmpeg | 8.1.2 (Homebrew, `/opt/homebrew/bin/ffmpeg`) | audits, beat slicing, filmstrips; Manim's encoder via `imageio-ffmpeg` symlink | `reel_motion_audit.py` lists Linux compositor paths first and falls through to this one |
| segno, opencv-python-headless | `.venv` | r003 — spec-correct QR encoding and an *independent* decoder | |
| pyproj | `.venv` | r005 — WGS84 geodesic cross-check | |
| After Effects 2026 | installed | **nothing in the reel pipeline** | legacy of the long-form era; no reel ever touched it, and its build scripts were archived to `yt-longform-archive-DO_NOT_DELETE` on 2026-09-10 |
| Blender, three.js, LaTeX | **not installed** | — | see `visual_toolbox.md` |

Environment weights on disk: `remotion/node_modules` 581 MB, `.venv` 431 MB, `.manimenv` 407 MB —
all regenerable, all git-ignored.

**Python dependencies a reel actually needs**, measured by grepping every `projects/i*/` and
`projects/r*/` script: `numpy` (20 files), `PIL` (10), `matplotlib` (2), `manim` (2), `segno` (1),
`cv2` (1), `pyproj` (1). `requirements.txt` was rewritten for exactly this on 2026-09-10 — the
core three plus the per-reel extras commented out, and Manim's separate venv explained.

---

## 3. Stage by stage — what actually happens

### Stage 1 · picking the id

`backlog_ideas.py` reads status from the repo, not from memory: built reels from `CLAUDE.md`'s
table, Gate 0 verdicts from `projects/*/gate0/GATE0.md`, in-flight work from `projects/`. On
2026-09-10 it reports 69 ids: 10 built, 1 failed (`I53`), 3 in gate (`I33`, `I52`, `I64`), 55 open.

For each of 5–7 candidates the skill demands, one line each: the draft sentence; **who does the
viewer send it to and what are they proving**; is the object nameable with the sound off; is it
visible by nature; does usable data exist. Then it asks. It does not pick.

A topic with no row does not get built. A new concept gets a permanent id appended first, with a
section — the section decides the accent from `DOMAIN_ACCENT` in `remotion/src/brand/tokens.ts`
(`infrastructure #00D6F7`, `security #3DDF7D`, `data #AD88FF`, `ai #FFB020`, `failure #FF4D4D`,
`languages #51A4FF`). The hexes in the backlog headings are stale; `tokens.ts` wins.

### Stage 2 · Gate 0

Two artefacts, in this order, then a human yes:

1. **The sentence** — what a viewer says to a friend afterwards. Plain words. Put in front of the
   human *as text* before any picture exists.
2. **One still of the payoff frame** — `gate0/mock_payoff.py`, PIL or matplotlib, five minutes.
   Evidence that the sentence can be shown; nothing more. r008's mock integrated the real physics to
   4.286 s so the still and the render could not disagree.

Three kill conditions, any one ends the id: the sentence needs a CS word; the frame shows an object
the viewer has never seen (a matrix, a chart, a graph — pictures *of* an idea); the amazement
depends on understanding first. Then the argument test (three conditions, all required) and the
licence question. `GATE0.md` records verdicts on each, honestly — r007 and r008 both wrote down the
leg they were weak on, and both then landed on the floor.

The model file is `.claude/skills/new-reel/reference/gate0.md`; the best examples are
`projects/r008_pendulum/gate0/GATE0.md` (a pass with a falsification that changed the design) and
`gate0/i53_flood/gate0/GATE0.md` (a failure record).

### Stage 3 · research and measure

Where the numbers come from, and the rules that keep them honest:

- **Nothing is recalled.** Every figure that reaches the screen is printed by a script in the
  project folder, and `NOTES.md` says which script and which run.
- **Cache the network.** the deleted `I15` build's `fetch_graph.py` hits Overpass with a real User-Agent (the
  default one gets HTTP 406), falls back across three mirrors, and writes `graph_<city>.json` so
  every rebuild is offline. Four city graphs (Paris, London, NYC, Delhi) are already cached.
- **Falsify the mechanism.** `r008_pendulum/design.py` integrated the real `θ'' = −(g/L) sin θ` and
  found the textbook small-angle lengths reform 0.33 s late — so the reel prints the corrected
  equation. `r007_tides/tides.py` asserts 23 claims from CODATA/IAU constants. `r003`'s damage
  verdicts come from OpenCV, not from the encoder that made the code.
- **One stated base per percentage**, never two figures on different bases side by side.
- **No dataset shopping.** Trying cities until one supports the claim is p-hacking when the claim is
  the reel.
- **Record negative results**, including broken tests (`I53`'s flow-accumulation test returned
  96–99 for everything, controls included).
- **Licence at this stage, not after.** r006 was measured out of TeleGeography's API, whose
  database is subscriber-only, and had to be rebuilt from public geography. Published figures are
  facts; route geometry is a database.

### Stage 4 · build

**Python → JSON → TS.** `emit_ts.py` is the checkpoint: it re-derives the reel's claims from the
JSON and refuses to write the module if any is false. The assert counts today tell you how much
that discipline has grown: r002–I51 `emit_ts.py` have **0** asserts, r001 has 1, `i58` has 3,
`i15` has 6, `i64` has 15, `i69` has 22. **Downsample in Python, not in React** — the TS module
holds playback-ready state (frames of frontier, polylines, per-beat counters), never raw data for
the browser to crunch.

**The Remotion side.** Every reel is one `.tsx` under `remotion/src/reels/`, built on
`reels/lib/chrome.tsx`:

| Export | What |
|:--|:--|
| `FPS` 30 · `REEL_W` 1080 · `REEL_H` 1920 | canvas |
| `SAFE_TOP` 270 · `SAFE_BOTTOM` 1540 · `SAFE_H` 1270 · `CONTENT_W` 960 · `SAFE_W` 810 · `SAFE_CX` 465 | **the real canvas is 1080×1270, x 60–870** |
| `t(s)` · `fmt(n)` · `ease` | seconds→frames, thousands separators, the one brand curve `cubic-bezier(0.4,0,0.2,1)` clamped |
| `Fade` · `ReelHeader` · `StepLabel` · `Readout` · `Progress` | the fixed chrome |
| `ReelGround` | drafting-grid ground tinted by the accent; **never a flat fill** |
| `useBreath()` | a transform string; every graphic stage carries it so nothing is ever still |
| `SafeZones` | the overlay the `*-safe` composition renders |
| `reels/lib/manim.tsx` → `ManimLayer` | plays a transparent PNG sequence from `public/manim/<dir>/` |

Six traps in that API have each cost a build; they are listed in
`.claude/skills/new-reel/reference/build.md` (`Fade` overwrites `transform`; `Readout` defaults to
960 wide and runs under the action rail; the ground must not scale; Archivo Black fits ~22
characters at 72 px; thresholds must be computed in screen space, not map space).

**Colour is linted.** `npm run brand:check` (`remotion/scripts/check-brand.mjs`) fails on any hex
outside `tokens.ts`; computed `rgb()` strings are allowed, which is how data-driven ramps stay
legal. Amber is one element per frame; `failure #FF4D4D` only on the beat something breaks.

**The camera** lives in one of two places: as a keyframe table in the `.tsx`
(`Tides.tsx` `CAM: [second, scale, cx, cy][]`, rule: no two consecutive keyframes equal) or in
Python (`r008_pendulum/camera.py`), shipped through the data module so that annotation clearances
can be asserted against the camera the reel actually uses.

**The Manim layer (r008).** Manim renders; it does not animate. Angles are read frame by frame from
`pendulum_data.json`. `scripts/manim_render.py` renders `--format=png --transparent` at the
composition's fps into `remotion/public/manim/<name>/0000.png …` and prints the `<ManimLayer>` tag.
PNG, not video, because Chromium cannot decode qtrle `.mov` and this ffmpeg build silently drops
alpha when writing VP9 (reports `yuva420p`, writes `yuv420p`). Render taller than the composition
(`MANIM_W=1350 MANIM_H=2400`) when the Remotion camera will push into the layer. `layout.py` is
imported by both the Manim scene and `emit_ts.py`, so annotations drawn in HTML land on strings
Manim drew. 1,020 frames ≈ 155 MB, git-ignored, regenerated in ~21 s.

**Registration.** Export `DURATION_SECONDS`, register `r<NNN>-<name>` and `r<NNN>-<name>-safe` in
`Root.tsx`. The safe variant exists purely to be eyeballed before posting.

### Stage 5 · render and validate

```bash
cd remotion
npx tsc --noEmit && npm run brand:check
npx remotion render r<NNN>-<name> ../projects/r<NNN>_<name>/r<NNN>_<name>.mp4 --codec=h264
npx remotion still r<NNN>-<name>-safe ../projects/r<NNN>_<name>/safe_check.png --frame=600
cd ..
python3 scripts/reel_motion_audit.py projects/r<NNN>_<name>/r<NNN>_<name>.mp4      # default --width 240
python3 scripts/reel_safe_audit.py   projects/r<NNN>_<name>/r<NNN>_<name>.mp4      # report, not a gate
```

**Where ffmpeg is, precisely:**

| Use | Command shape | Why it is shaped that way |
|:--|:--|:--|
| Motion audit sampling | `ffmpeg -i reel.mp4 -r 4 -vf scale=240:-1 f%05d.png` → PIL mean abs diff | `-r` on the output, not the `fps` filter, because the container's compositor build has `scale` but not `fps` |
| Per-beat slice | `ffmpeg -i reel.mp4 -ss 6.3 -t 5.1 -c:v libx264 -preset ultrafast beat.mp4` | **re-encode, `-ss` after `-i`** — input seeking with `-c copy` snaps to a keyframe and silently reports the wrong beat |
| Safe-area audit | `ffmpeg -i reel.mp4 -vf fps=2 -f rawvideo -pix_fmt gray -` → numpy | any pixel brighter than `--floor 90` outside x 60–870 / y 270–1540 is reported |
| Manim's own encoder | `imageio-ffmpeg` static binary, symlinked into `.manimenv/ffmpegbin/` | Manim needs an ffmpeg on `PATH` |
| Filmstrip (not scripted yet) | e.g. `ffmpeg -i reel.mp4 -vf "fps=1,scale=180:-1,tile=10x4" strip.png` | stills are for layout, video and filmstrip are for timing |
| Final encode | **not ffmpeg** — Remotion's bundled compositor | |

**Thresholds.** Longest dead spell ≤ 1.5 s under mean change 0.35; event density is the share of
samples with change ≥ 1.0, a floor and not a target (I51 cut 4 hit 68% by looping and taught
nothing; r008 hit 99% and did 190 views). Run at 240 px: the same reel scores 27% at 240 and 51%
at 360. Benchmarks: r004 42 · I51 v5 53 · r005 38 · r006 49 · I15 54 · r007 44 · r008 99.

**What the audits cannot see** — and what Gate 3 is for: a pronoun with no antecedent (r006's
first cut), a payoff whose subject is an 82 px sliver at the frame edge (r007), a whole framing
that compares two algorithms nobody asked about (I15). All three passed every automated check.

### Stage 6 · the five logs, then posting

| File | What goes in |
|:--|:--|
| `CLAUDE.md` | the "Built so far" row |
| `brand_guide_software.md` §13 | a dated subsection — what this build taught, including what failed |
| `reel_captions_log.md` | caption A/B, hook line, hashtags (four to six, no bait), **load-bearing phrasings**, deliberately omitted claims; engagement filled in later |
| `backlog/open.md` | the row marked built/failed, and every figure it had wrong, corrected in italics with the date and the measuring script |
| `projects/r<NNN>_<name>/NOTES.md` | figures with provenance, beats, gate numbers, **traps**, what is NOT claimed |

Then stop and let the human read the diff. Never commit unless told, and then straight to `main`.

The mp4 is tracked in git on purpose (`!projects/r*/*.mp4`) so downloading it from GitHub is the
shortest path to the phone. **But the negation only matches `projects/r*/`.** The renders in the
newer `projects/i*/` folders (r005–r007) were force-added, and r008's mp4 — posted — is untracked
as of 2026-09-10. `repo_audit.md` has the one-line pattern fix.

Posting is manual: caption from the log, cover frame chosen for the grid (a wall of *objects*, not
code), and a reading of Insights at 24 h and again at 7 d — with the three-readings-two-retractions
lesson from r005 in mind (saves at 1 h, shares at 4 h and skip rate at 7 h were all read wrong).

---

## 4. Where fact-checking actually lives

There is no separate "fact-check step". Accuracy is enforced at seven points, and the reason there
are seven is that each was added after something false shipped or nearly shipped:

1. **The backlog row is a research lead, not a fact.** `I01` was wrong twice (30% → 24%; "no region
   is essential" → a 0.7% corner is fatal); `I15`'s hook promised 1000× and the real graph gave 10×.
2. **The compute script asserts its own invariants** (A\*'s cost equals Dijkstra's and the paths
   match; the heuristic is admissible at every settled node, verified by a full backwards Dijkstra).
3. **A falsification experiment for any "X because Y"** — r001 shipped "the cafe noise dies here",
   which is false (noise yields 224 peaks against the song's 202).
4. **`emit_ts.py` refuses to write a module whose claims are false** — including that the equation
   printed on screen reproduces the numbers on screen (r008: to 0.005 cm).
5. **Load-bearing phrasings are recorded with the caption** ("78% of the *coefficients*", never "of
   the file"; "the tide, not the pull"; "let go from the same *angle*"), because tightening one
   later is exactly how a false claim ships.
6. **Deliberately omitted claims are listed** (the JPEG standard's year — unverifiable through the
   proxy — was left out rather than recalled).
7. **A primary source is recorded for every figure**, and the licence of every dataset is settled
   inside Gate 0.

---

## 5. A worked example — r008, start to finish

```bash
python3 .claude/skills/new-reel/scripts/backlog_ideas.py --id I69     # Stage 1
# Stage 2: gate0/GATE0.md written, gate0/mock_payoff.py → payoff_frame.png, human yes to the sentence
python3 projects/r008_pendulum/design.py        # Stage 3: falsification — found the 0.33 s error
python3 projects/r008_pendulum/simulate.py      # → pendulum_data.json (RK4, dt = 1/600 s, self-asserting)
python3 projects/r008_pendulum/emit_ts.py       # → remotion/src/reels/data/pendulum.ts (22 asserts)
MANIM_W=1350 MANIM_H=2400 python3 scripts/manim_render.py \
    projects/r008_pendulum/scene_pendulum.py Pendulums i69pendulum   # → public/manim/i69pendulum/ (1,020 PNGs)
python3 projects/r008_pendulum/check_annotations.py                  # every text box cleared, before rendering
cd remotion && npx tsc --noEmit && npm run brand:check
npx remotion render r008-pendulum ../projects/r008_pendulum/r008_pendulum.mp4 --codec=h264
cd .. && python3 scripts/reel_motion_audit.py projects/r008_pendulum/r008_pendulum.mp4
python3 scripts/reel_safe_audit.py projects/r008_pendulum/r008_pendulum.mp4
# Gate 3: watched end to end → rebuilt from a 60 s cycle to 30 s (strings 1.62× → 2.37× apart)
# Stage 6: five logs written; posted 2026-09-10; 190 views at first reading
```

The first cut of this reel passed every audit and every lint and was then rebuilt on one human
question — *"are they all different??"* — which is the whole argument for the three human gates.

---

## 6. What the pipeline does not do yet

- **No scaffold.** Every project folder, `emit_ts.py` and `Reel.tsx` starts from a blank file or a
  copy of the last one. `module_packs.md` proposes `scripts/new_reel_scaffold.py`.
- **No per-beat audit script.** The ffmpeg slicing recipe is re-typed each time.
- **No filmstrip script.** Same.
- **No engagement log in machine-readable form.** `reel_captions_log.md` holds prose;
  `insta_strategy.md` §7 promised `data/social_log.csv` and it was never created.
- **No Shorts cross-post.** Zero marginal cost; never recorded as done.
- **No 3D, no basemap, no anatomy, no real footage.** All available — `visual_toolbox.md`.
