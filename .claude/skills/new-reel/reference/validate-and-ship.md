# Validate and ship

Stages 5 and 6 of `new-reel`.

---

## The commands

```bash
cd remotion
npx tsc --noEmit
npm run brand:check          # palette / easing / font-size / damping lint
npm run lint                 # eslint + tsc + brand:check
npm run dev                  # Studio — scrub, and check the *-safe composition

npx remotion render r<NNN>-<name> ../projects/r<NNN>_<name>/r<NNN>_<name>.mp4 --codec=h264
npx remotion still r<NNN>-<name>-safe out.png --frame=600

cd .. && python3 scripts/reel_motion_audit.py projects/r<NNN>_<name>/r<NNN>_<name>.mp4
```

---

## The motion audit

Two metrics, because the first one has a blind spot that shipped a bad reel.

| Metric | Threshold | Why |
|:--|:--|:--|
| **longest dead spell** | ≤ **1.5 s** under mean change 0.35 | a frozen frame on a feed reads as "this ended" |
| **event density** | share of 4 fps samples with change ≥ 1.0 | a slow push passes the stillness rule while nothing *happens* |

Benchmarks — **all at the default `--width 240`**:

| | density |
|:--|--:|
| I51 first cut — *a viewer called it static* | 26% |
| r006 first cut | 27% |
| r005 (shipped, ~66k views) | 38% |
| r004 | 42% |
| r006 (shipped, after the camera) | 49% |
| I51 v5 | 53% |

### Three rules for reading it

**1 · Run it at its default `--width 240`.** Every benchmark above is at 240. The *same reel*
scores 27% at 240 and 51% at 360, because small moving objects survive downscaling to 360 and
vanish at 240. A per-beat analysis at 360 once reported 51% for a reel the script scored 27%.

**2 · Measure per beat before changing anything.** The global number hides which beat is dead, and
**the beat carrying the argument is usually the deadest one** — r006's route-draw, the most
important animation in the reel, scored the lowest of any beat at 16%. Slice the render and audit
each beat:

```bash
# RE-ENCODE, and put -ss AFTER -i. Input-seeking with `-c copy` snaps to the nearest
# keyframe and can shift the window by a second — silently giving the wrong beat's number.
ffmpeg -i projects/r<NNN>_<name>/r<NNN>_<name>.mp4 -ss 6.3 -t 5.1 \
       -c:v libx264 -preset ultrafast /tmp/beat02.mp4
python3 scripts/reel_motion_audit.py /tmp/beat02.mp4
```

*(`reel_motion_audit.py` prefers Remotion's bundled compositor ffmpeg and lists only Linux paths
for it — that is for the render container, whose system ffmpeg is built `--disable-everything` and
cannot decode h264. On this Mac it falls through to Homebrew's `/opt/homebrew/bin/ffmpeg`, which
is fine.)*

**3 · Density is a floor, not a target.** It rewards motion and cannot tell whether the motion
carries information: I51 cut 4 hit **68%** by *looping* an animation, which teaches nothing. Read
it next to the reel, never instead of it.

### When a beat is dead, move the camera, not the marker

The audit measures **mean change over the whole frame**, so only large-area motion counts. A 6 px
line growing and a 15 px dot moving are worth almost nothing. The fix is a camera that opens tight,
pulls back to reveal, and follows the subject — each move meaningful, each moving the entire frame.
r006 went 27% → 49% that way. r005 cleared the bar without one only because a globe↔map morph moves
every coastline at once.

---

## The rest of Stage 5

- **`*-safe` composition, in Studio and as a still.** Check the title clears Instagram's top bar,
  and that nothing the viewer must *read* sits under the action rail (x ≥ 870, y ≥ 1050).
- **Watch the video end to end, and pull a filmstrip.** Stills are for layout; video is for timing.
  This is where r006's pronoun hook and I15's whole framing were caught — both had passed every
  automated check.
- **Read the title against the Gate 0 sentence.** If the sentence's subject noun is missing from
  the title, the title is weaker than something already approved.
- **Re-read every on-screen sentence for rule 7.** Any "X because Y" needs an experiment behind it,
  and every percentage needs one stated base. Check that instrumentation cannot be misread as a
  measurement — r006 puts *"speed-of-light floor, not a ping"* under its payoff line for exactly
  this reason.
- **Check the end card**: names what the next reel does (only if that one is already gated), and
  the ask is performable on the phone in the viewer's hand.

---

## GATE 3 — the human watches it

Before anything is posted. Under a minute, and it has caught what nothing else caught.

---

## Stage 6 — the five files

| File | What goes in |
|:--|:--|
| `CLAUDE.md` | the row in **Built so far**: reel, backlog id, subject, state |
| `brand_guide_software.md` §13 | a dated subsection — what this build taught, **including what failed** |
| `reel_captions_log.md` | the caption, the hook line (first ~125 chars), engagement columns later |
| `backlog/open.md` | the row marked produced/failed, plus corrections to any figure it got wrong |
| `projects/r<NNN>_<name>/NOTES.md` | the build record |

**Correcting the backlog is not optional.** `I01`'s row was wrong twice (30% → 24%; "no region is
essential" → a 0.7% corner is fatal) and `I15`'s hook claimed a 1000× ratio no real graph supports.
Every fix goes back into the row as an italic note with the date and the measuring script.

### Caption rules — `reel_captions_log.md`

- **No hashtag stuffing** (six topical tags is plenty), **no engagement bait** ("save this",
  "follow for one X a day"). Both are explicitly on the "leave" list from the `equation.verse`
  teardown.
- **Accuracy is the differentiator.** Every figure in a caption obeys the same gate as every figure
  on screen.
- **Record load-bearing phrasings** with the row. Some wordings are the difference between true and
  false, and "tightening" one later is exactly how a false claim ships.
- A caption that isn't in the log taught us nothing.

### NOTES.md template

Model: `projects/r006_cables/NOTES.md` — the fullest one, and the shape to copy.

```markdown
# rNNN · `I<NN>` — "<the sentence, short form>"

<N> s. Built <date>. <what number reel through Gate 0, and what it was testing>

**Gate 0 sentence** — the thing a viewer repeats to a friend:

> "<the sentence>"

Gate artefacts and the human yes are in [`gate0/`](gate0/GATE0.md).

## The figures
<table: value | provenance. Everything comes from <script>.py. Nothing is recalled.>
<mark every assumption as assumed, and show the sensitivity sweep that proves it cannot
change the conclusion>

## The beats
<table: t | beat | what moves>

## Gate numbers
<the audit output verbatim; tsc and brand:check clean; per-beat table if a beat was fixed>

## Traps
<every thing that silently did the wrong thing, so it is never rediscovered>

## What is NOT claimed
<the narrower, true version of the claim>
```

**Write the traps section even when the build went well.** Every entry in `r006_cables/NOTES.md`'s
trap list — a welded-then-measured cable, the 180° seam, `GEO_ALT` needing the equatorial radius,
coastlines invisible at `#274064` — is a thing that failed silently and would have cost the same
hour twice.
