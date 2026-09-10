# Module packs — every reel leaves a part behind

*Today each reel starts from `chrome.tsx` and a blank `.tsx`, and the parts it needs get re-derived.
This document measures the duplication that already exists in the code, proposes the packs that
would absorb it, and sets the contract that makes a pack trustworthy. It is a plan; nothing here
has been built.*

---

## 1. Why this is the growth investment

`insta_strategy.md` §2.1 named cadence as the strategy and the per-reel build cost as a strategic
number. Eight reels in nine days shows the machine can already hit the cadence — but it did so by
building every reel from scratch, with a human reviewing every stage. Packs do three things:

1. **Cut the build to hours** for any reel in a lane that already has a pack (maps, apparatus,
   graphs), which is most of §1 and §2 of the backlog.
2. **Carry the traps forward.** Every trap in a `NOTES.md` — the 180° seam, `Fade` overwriting
   `transform`, the `Readout` under the rail, Manim's `frame_height` surprise — is a bug that a pack
   fixes once and a copied file re-introduces.
3. **Make experiments cheap.** A hook-only re-cut, a 30 s vs 45 s test, a different object class on
   the same engine — each is a parameter change on a pack, not a day of work.

---

## 2. The duplication as it stands (measured 2026-09-10)

**TypeScript, across `remotion/src/reels/*.tsx`:**

| Helper | Defined in | What it is |
|:--|:--|:--|
| `mercY`, `GRATICULE`, `tailPath`, `ringPaths` | `Cables.tsx`, `Greatcircle.tsx` | Mercator y, the lat/lon grid, the moving-marker tail and rings |
| `CAM` keyframe table + per-axis `interpolate` | `Tides.tsx`, `Queue.tsx` | `[second, scale, cx, cy][]`; `Pendulum.tsx` does the same from a data module (`PENDULUM.camera`) |
| `Row` | `Pendulum.tsx`, `Tides.tsx` | a key/value line — and the size-inheritance bug in r008's NOTES came from reusing it without an explicit `size` |
| `Table` | `Autocorrect.tsx`, `Shuffle.tsx` | a small on-screen table |
| `STAGE`, `CELL`, `PANEL_W`, `MAP_W`, `MAP_H` | four to five files each | layout constants re-chosen per reel |

Every reel imports the shared chrome (14–19 references per file; `Shazam.tsx` predates it and
carries its own copies), but **no reel imported anything from the long-form `families/`,
`components/` or `lib/` folders** — the "reuse `MapRoute`/`Diagram`/`Counter`" plan in
`insta_strategy.md` §3 never happened. That independence is what made it safe to archive those
folders to the `yt-longform-archive-DO_NOT_DELETE` branch on 2026-09-10; the packs
below are therefore the *only* shared code the reels will ever have, which raises their priority.

**Python, across `projects/`:**

| Function | Count | Where |
|:--|--:|:--|
| `coastlines()` | 2 | `r005_greatcircle/build_geo.py`, `r006_cables/build_geo.py` |
| `rdp()` (polyline simplification) | 2 | the same two |
| `fisher_yates()` | 3 | the I51 scripts |
| `main()` with the same fetch → compute → assert → write shape | 9 | every project |

And the discipline that matters most is unevenly applied: `emit_ts.py` carries **22** asserts in
`i69`, 15 in `i64`, 6 in `i15`, 3 in `i58`, 1 in `r001`, and **0** in `r002`–`I51`.

---

## 3. The packs

Each pack is a folder under `remotion/src/reels/lib/<pack>/` (TypeScript) and/or
`projects/_reelkit/<pack>.py` (Python), with a `README.md` that names the reel that proved it.

| # | Pack | What it absorbs | Proven by | Unlocks |
|--:|:--|:--|:--|:--|
| 1 | **`chrome`** *(exists)* | ground, header, step label, readout, progress, breath, safe zones | r002 → r008 | — |
| 2 | **`camera`** | a `useCamera(keys)` hook over `[t, s, x, y]` keyframes; the rule *no two consecutive keyframes equal*; the Python `camera.py` model that checks what the camera points at | r006 (camera fixed the audit), r007, r008 | every physical reel |
| 3 | **`geo`** | projections (Mercator, orthographic, the globe↔map morph), graticule, Natural Earth coastlines as a committed JSON cache, great-circle sampling, `tailPath`/`ringPaths`; Python: `coastlines()`, spherical distance, `rdp()`, chokepoint routing | r005, r006, r007 | 20 ids in §2 |
| 4 | **`graph`** | Overpass fetch with User-Agent, three mirrors and a JSON cache; Dijkstra / A\* trace to per-frame frontier sets; the flood renderer | I15 | I16 I20 I21, any city |
| 5 | **`layers`** | `FrameSequenceLayer` (today `ManimLayer`), `scripts/manim_render.py`, a `blender_render.py` sibling, the `layout.py` pattern for sharing reference-pixel geometry between renderer and annotations | r008 | anything 3D or mesh-based |
| 6 | **`annotate`** | the `check_annotations.py` idea made generic: declare every text box with its beat window; assert it clears the moving geometry, sits inside the safe area, and never overlaps another box on screen at the same time | r008 (three real defects caught before rendering) | every reel with text over a moving subject |
| 7 | **`readout`** | one `Row`/`Table` with an explicit `size`, rail-safe by default (`SAFE_W`) | r005 (the rail ate the payoff), r008 | every reel |
| 8 | **`hook`** | *promise + clock*: the countdown that turns "in 30 seconds it comes back" into a reason to stay; title-over-action; the end card with a performable ask | r008 hook, r005 end card | every reel whose payoff is delayed |
| 9 | **`sim`** *(Python)* | RK4 integrator, resampling to 30 fps, the `emit_ts` scaffold with an `assert_claims()` block that cannot be skipped | r008, r007 | every physics reel |
| 10 | **`audit`** *(exists, partly)* | `reel_motion_audit.py`, `reel_safe_audit.py`, plus the two recipes typed by hand today: per-beat slicing and the filmstrip | I51 → r008 | Stage 5 in one command |

**Order of extraction, by backlog leverage:** `camera` and `geo` first (they cover half the open
ids and are the two most-duplicated), then `layers` (the door to 3D and the body), then `sim`,
`annotate`, `readout`, `hook`, `audit`. `graph` when the next city id is gated.

---

## 4. The scaffold — the single biggest cadence lever

`scripts/new_reel_scaffold.py <ID> <slug>` creates, from templates:

```
projects/r<NNN>_<name>/
  gate0/GATE0.md          the sentence · three kill conditions · the argument test · the licence question — all as headed blanks
  gate0/mock_payoff.py    PIL skeleton that writes payoff_frame.png
  fetch_<slug>.py         User-Agent, mirrors, JSON cache — from the graph pack
  <slug>.py               compute skeleton: prints every figure it produces; asserts its invariants
  emit_ts.py              reads the JSON · assert_claims() with a deliberately failing placeholder · writes data/<slug>.ts
  NOTES.md                the template from validate-and-ship.md, sections pre-headed (figures · beats · gate numbers · traps · NOT claimed · what this reel left in the library)
remotion/src/reels/<Name>.tsx   chrome imported · ReelGround with the section's accent · useBreath on the stage · useCamera with two keyframes · DURATION_SECONDS exported
remotion/src/Root.tsx           both compositions registered inside a <Folder name="reels">
```

The placeholder assert that fails on purpose is the point: a reel cannot render until someone has
written down what it claims.

---

## 5. Asset packs (not code)

| Asset | Where it should live | Status |
|:--|:--|:--|
| Brand fonts (5 latin woff2) | `remotion/public/fonts/` | done — renders are offline since r007 |
| Natural Earth coastlines, 110 m and 50 m, as JSON | `data/geo/` | built inside two reels, never committed as a shared file |
| OSM city graphs (Paris, London, NYC, Delhi) | `data/geo/osm/` | in `the deleted `I15` build/`, ~7 MB, tracked — move so the next city reel finds them |
| NASA Blue Marble texture | `remotion/public/textures/` (git-ignored, download script) | not present |
| Z-Anatomy `.blend` | outside the repo, download script + checksum | not present |
| Coastline/graph fetch scripts | `data/geo/README.md` with provenance and licence per file | not present |

---

## 6. The contract for a pack

1. **It is proven by a shipped reel**, named in its README, or it does not exist yet.
2. **Its API is listed in `.claude/skills/new-reel/reference/build.md`** next to the chrome table,
   with the traps it fixes — so the skill uses it instead of re-deriving.
3. **Inline-literal doctrine.** `tokens.ts` says scene files carry inline style literals so Studio
   stays click-editable, and `chrome.tsx` documents why the fixed chrome is the exception. Packs
   follow the chrome's exception: the parts a reel would actually tweak on the canvas — the
   visualisation — stay in the reel file; the parts fixed by the format live in the pack.
   `brand:check` still polices both.
4. **Changing a pack never re-renders a posted reel.** Posted reels are mp4s and are immutable;
   the code moves on. What a change must not do is silently alter an *unposted* reel's numbers —
   the `emit_ts` asserts are what catch that.
5. **A pack has no network.** Fetching lives in scripts that cache to JSON; the pack reads the cache.

---

## 7. The rule added to Stage 6

`NOTES.md` gets a sixth section, **"What this reel left in the library"**, and
`validate-and-ship.md` gets one more line in its checklist: *name the helper you wrote that the
next reel will need, and move it into a pack before the reel is logged as shipped.* Zero minutes
when the answer is "nothing"; an hour when it is a camera or a projection — and that hour is the
one the next reel gets back.

---

## 8. What not to modularise

- **The visualisation itself.** Each reel's stage is the reel; forcing it through a generic
  component is how a channel starts to look like a template. `equation.verse` runs one fixed
  chassis and its reels are recognisable as a chassis — the account should share *parts*, not a
  *layout*.
- **The Gate 0 artefacts.** They are the human gate; making them fill-in-the-blank is fine, making
  them auto-generated is not.
- **Anything with fewer than two users.** Two reels is the threshold for extraction, and the table
  in §2 is where it has already been crossed.
