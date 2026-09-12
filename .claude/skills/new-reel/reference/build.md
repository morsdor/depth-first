# Build — compute the animation, don't author it

Stage 4 of `new-reel`. Runs only after a human yes at Gate 0 and after Stage 3 has measured the
figures.

---

## The method

Run the **real algorithm** in Python, dump its intermediate state to JSON, pack it to a TS module,
play it back in Remotion. On-screen numbers are then free and correct **because the run produced
them**.

**₹0 — no image model is involved in a reel. Keep it that way.** Every frame is computed.

Reference shape: `projects/r001_shazam/` (`fingerprint.py` → `emit_ts.py` → `emit_audio.py` →
`remotion/src/reels/Shazam.tsx`). Best modern examples: `the deleted `I15` build/` (real OSM graph) and
`projects/r006_cables/` (public geography, licence-clean).

---

## File layout

**Two trees, and each means exactly one thing.** Set 2026-09-10.

| Tree | Means |
|:--|:--|
| `gate0/i<NN>_<slug>/` | a concept with a written Gate 0 and **no** shipped reel — in gate, or killed |
| `projects/r<NNN>_<name>/` | **a reel that shipped**, numbered by the order it was posted |

**A concept starts in `gate0/` and moves to `projects/` when the reel is posted**, taking its number
at that moment. The name after the number can be as long as it needs to be; it is for humans reading
a directory listing.

**Reel numbers are contiguous and mean "the Nth reel posted."** The number is **claimed in
`CLAUDE.md`'s table the moment a build starts**, which is what stops two builds colliding — `I58`
tides and the shelved `I64` queue briefly held the same one. **If a build is abandoned, its number
is released and the next build takes it**, which is what keeps the sequence gapless: an unpublished
build has no reel number and is called by its backlog id, which is what ids are for.

Three built-but-never-posted reels (`I51` shuffle, `I15` A\*, the shelved `I64` queue) were deleted
on 2026-09-10 rather than kept; they are in git history if a rebuild ever wants them.

Backlog ids stay permanent in `backlog/open.md`; they are just not a folder key.

`.gitignore` tracks a render by the FILE's name — `!projects/*/r[0-9][0-9][0-9]_*.mp4` — so a
correctly named render is committed. Match the render's name to its folder: `projects/r005_greatcircle/r005_greatcircle.mp4`.

```
projects/r<NNN>_<name>/
  gate0/GATE0.md  mock_payoff.py  payoff_frame.png
  fetch_*.py           acquire real data; cache it to JSON so a rebuild is offline
  <compute>.py         the real algorithm; prints the figures; verifies its own invariants
  <name>_data.json     its dumped intermediate state
  emit_ts.py           packs the JSON to TS — and ASSERTS the reel's claims before writing
  NOTES.md             the build record
  r<NNN>_<name>.mp4      the render
remotion/src/reels/data/<name>.ts     generated — never hand-edited
remotion/src/reels/<Name>.tsx         the reel
remotion/src/Root.tsx                 both compositions registered
```

## Python conventions

- **Nothing is recalled.** Every figure that reaches the screen is printed by a script in this
  folder, and `NOTES.md` records which script and which run.
- **`emit_ts.py` refuses to write a module whose claims are false.** the deleted `I15` build's `emit_ts.py`
  asserts a route exists, that A\*'s cost equals Dijkstra's, and that the paths are the same node
  sequence. `search.py` goes further and verifies the heuristic is admissible at every settled node
  by running a full backwards Dijkstra. **If the reel claims it, a script asserts it.**
- **Downsample in Python, not in React.** The TS module holds playback-ready state (frames of
  frontier, path polylines, per-beat counters), not raw data for the browser to crunch.
- **Cache the network.** `fetch_graph.py` identifies itself with a real User-Agent (Overpass
  answers urllib's default with **HTTP 406**) and falls back across three mirrors.

---

## The Remotion side

### The shared chrome — `remotion/src/reels/lib/chrome.tsx`

Import from here rather than reinventing. Everything below is real API.

| Export | Notes |
|:--|:--|
| `FPS` `REEL_W` `REEL_H` | 30, 1080, 1920 |
| `SAFE` `SAFE_TOP` `SAFE_BOTTOM` `SAFE_H` `CONTENT_W` `SAFE_W` `SAFE_CX` | 270 / 1540 / 1270 / 960 / **810** / 465 |
| `t(s)` | seconds → frames. Reels carry no handles; content starts at frame 0 |
| `fmt(n)` | thousands separators for on-screen numbers |
| `ease` | the brand curve, `extrapolate: clamp` both ends — spread it into `interpolate` |
| `Fade` | 8f fade + 12px rise in, 5f out |
| `ReelHeader` | `big`/`small` with a **sequential** handoff, not a crossfade |
| `StepLabel` | `n` / `title` / `sub` at y=470 |
| `Readout` | key–value instrumentation rows, default `top` 1240 |
| `Progress` | the bottom rail |
| `ReelGround` | the ground. **Never a flat `backgroundColor`** |
| `useBreath()` | a transform string — apply to every graphic stage |
| `SafeZones` | the overlay used by the `*-safe` composition |

### Six things about that API that have each cost a build

1. **`Fade` sets `transform`, so breath passed through it is a silent no-op.** Wrap, don't nest:
   put the breath transform on an inner element.
2. **`Readout` defaults to `CONTENT_W` (960), which runs under Instagram's action rail** (x ≥ 870,
   y ≥ 1050). Survivable when the numbers are ornamental, **fatal when they are the payoff** —
   pass `SAFE_W` (810) whenever the right-hand column is what the viewer must read. Found on r005,
   whose whole reel resolves to three right-aligned kilometre figures.
3. **`Progress` is 960 wide and also runs under the rail** on every reel from r002 on. Ornamental,
   left alone — but it will show up in any scrub.
4. **The ground must NOT scale.** It is exactly frame-size; scaling under 1 exposes its edges.
5. **Archivo Black runs ~0.58 em per character** — 960 px holds about 22 characters at 72 px. The
   header has room for exactly **two lines**; a third orphans a word onto the graphic. Drop
   `bigSize` below 76 rather than wrapping to three.
6. **Anything thresholded against a camera-transformed coordinate must be computed in SCREEN
   space.** r006's first attempt dimmed markers on map-space `y` and did nothing, because the
   opening is zoomed 1.75×.

### Colour

- Accent comes from `DOMAIN_ACCENT` in `remotion/src/brand/tokens.ts`, chosen by the backlog
  section. The hexes in the backlog headings are **stale** — tokens.ts wins.
- `failure #FF4D4D` goes **only on the beat something breaks.** Decorative use destroys it.
- **Amber stays one element per frame.** A moving marker is part of its line, not a second amber
  element (r005).
- `brand:check` accepts computed `rgb()` strings — that is how data-driven colour ramps stay legal.
  **Hardcoded hex literals outside `brand/` fail the check.**
- Coastlines and structure at `#274064` are invisible on this ground; use ash `#81A2C4` at ~0.42.

### Registration — `remotion/src/Root.tsx`

Export `DURATION_SECONDS` from the reel and register **two** compositions:

```tsx
<Composition id="r<NNN>-<name>"      component={Name} durationInFrames={NAME_SECONDS * 30} … />
<Composition id="r<NNN>-<name>-safe" component={NameSafe} durationInFrames={NAME_SECONDS * 30} … />
```

The `-safe` variant overlays `SafeZones` and is checked before posting. r001 shipped with its title
inside Instagram's top bar; that is the bug this prevents.

---

## The nine non-negotiables, as build rules

Each one is a measured finding, not a preference. Full text in `CLAUDE.md`.

**1 · Instagram safe area.** Compose in `y` 270–1540, `x` 60–870 — not the raw 1080×1920 canvas.

**2 · Ground is never a flat fill.** `<ReelGround accent={…} />`. Flat near-black left ~83% of the
frame empty and ~90% greyscale — why the first two reels read as pale (`brand_guide_software.md`
§3a supersedes §3's 10%-saturation rule for short-form).

**3 · Hook: show before you tell.** The payoff visual starts moving by **~0.5 s**, the first
surprising result lands by **~3 s**, and the title rides *over* the action. No step label in the
opening beat. Half the audience is gone by 1.5–3 s and both retention curves then **flatten** — so
the body works and the opening is the only thing costing reach.

> Name a recognisable object in the title. Never "this" — **and never a bare "It"**, which is the
> same failure. r006 shipped a first cut opening on *"It doesn't go up. It goes under."*: six
> seconds of pronoun with no antecedent, and it passed every automated check.
>
> **Check the title against the Gate 0 sentence before rendering.** That sentence is the most
> repeatable phrasing of the idea and a human approved it — if its subject noun (*"your message"*)
> is missing from the title, the title is weaker than something you already had.

**4 · Nothing is ever perfectly still.** `useBreath()` on every graphic stage, including text-only
beats. 51–55% of each shipped reel had no visible change at all, in stretches up to 6.5 s; on a
feed a frozen frame reads as "this ended". Two metrics, because the first has a blind spot — see
`validate-and-ship.md`. **Continuous motion is the fix, not more drift**: I51 v5 runs 53% by never
pausing the thing the reel is about.

**5 · Pacing: read → animate → hold.** Label alone ~1.5 s, animation 2–3 s, hold on the finished
state ~2 s. **≈6.5 s per idea**, so 60 s buys eight or nine beats. The hold keeps its reading time
but never its stillness. **The 2 s hold is the phase everyone drops, and dropping it is why a reel
reads as "too fast to understand anything".** End-of-beat text needs ≥ 3 s to read.

**6 · Open on a civilian object, and never leave it.** Never name the algorithm in the hook. **The
recognisable object stays on screen, or in frame, for the whole reel** — this used to govern only
the opening, which is how I51 could open on two decks of cards, cut to a 13×13 matrix three
seconds later, and still pass. If a beat needs an abstraction, it sits *beside* the object rather
than replacing it.

**7 · Accuracy gate — sentences, not just numbers.** Figures get checked because they visibly came
from a script; hand-written *mechanism* sentences slip through. r001 shipped "the cafe noise dies
here" — false. Any on-screen "X happens because Y" needs an experiment that could falsify it. One
stated base per percentage.

**8 · Verify with video + filmstrip, never stills** — for *timing*. Stills are correct for *layout*.

**9 · End on a reason to follow.** ~18% of r001's 1,286 viewers reached the last frame and **one**
followed. The end frame is the most-watched dead space in the format — close on a line naming what
the next reel does, over the finished visual, held the full 3 s. **The ask must be performable on
the phone in the viewer's hand**: r003 closed on "point your camera at it" over an on-screen QR
code, which nobody holding one phone can scan. Follows: 0. r005's "open a flight tracker" worked.

---

## Structural findings worth stealing

- **A claim about a RELATION has to draw the relation.** Two states side by side is not a relation.
- **The payoff frame must not argue against its own caption.**
- **End on an arrival, not on a finished diagram.** r005's *arrival* is the single most-liked frame
  in the reel; the 10.8 s race leading to it is the least-liked stretch. **Reach the winner fast** —
  one lap, not two. r006 ran the end card *over* the still-running race rather than after it.
- **Put a second surprise where the curve leaks.** r005's retention was a linear bleed: one
  surprise at 3 s, then twenty seconds elaborating it. r006 added "glass is the *slower* medium" at
  14.4 s specifically to re-commit the viewer.
- **A camera is how a map passes the motion audit.** The audit measures mean change over the whole
  frame, so a growing 6 px line and a moving 15 px dot are worth almost nothing. Open tight, pull
  back to reveal, follow the subject — three moves a documentary camera would make, each meaningful,
  each moving the entire frame. r006: 27% → 49%.
- **Don't promise a specific next reel on the end card** unless it is already gated. r005 promised
  `I15`; that promise was broken for four days.
