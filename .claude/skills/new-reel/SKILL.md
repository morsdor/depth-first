---
name: new-reel
description: >-
  Use when starting a new Depth First short-form reel — "/new-reel", "a new reel", "next reel",
  "what should the next reel be", "pick a reel", or resuming one mid-build. Presents the live
  candidate ids from backlog/open.md with their real status, runs the reasoning that picks
  one, then drives the whole pipeline: Gate 0 (sentence → payoff still → human yes), the licence
  and falsification checks, the real-algorithm Python → JSON → TS data module → Remotion build,
  the render, the motion and safe-area audits, and the four logs a shipped reel updates. Enforces
  the three human gates. Does NOT invent topics and does NOT skip Gate 0.
---

# New reel — from a backlog id to a shipped reel

A reel is **a day of work**. Everything in this skill exists because a previous day was spent on
the wrong thing. The three human gates are the whole point: they cost the user about a minute
each and they have each already saved a build.

**The channel promise is "how systems work" — not computer science.** Grids, water, tides, ports,
railways, orbits, cities are in scope and are the *stronger* half; a software mechanism is
invisible by nature, which is why three consecutive Gate 0 failures (`I52`, `I15` twice, `I24`)
all died on the same kill condition. Read `CLAUDE.md` "Short-form reels" before Stage 1 — this
skill is the procedure, `CLAUDE.md` is the law, and where they disagree `CLAUDE.md` wins.

**Runtime 30–60 s.** The 28–39 s of the shipped reels is history, not a rule.

---

## The pipeline, and where the human stands in it

```
Stage 1   Present ideas .......... 5 min    → GATE 1 · human picks the id
Stage 2   Gate 0 ................ 20 min    → GATE 2 · human says yes to the SENTENCE
Stage 2b  THE SEND TEST ......... 10 min    → GATE 3 · human names who sends it, and why
Stage 3   Research & measure ..... hours      (a figure can still kill it — I53 died here)
Stage 3b  THE SCRIPT ........... 30 min    → GATE 4 · human approves the FULL SCRIPT
Stage 3c  Choose the dimension ... 5 min      3D BY DEFAULT (@remotion/three) — 2D needs a reason
Stage 4   Build to the script .... hours      the script is a CONTRACT, not a draft
Stage 5   Render & validate ...... 1 hour
Stage 6   Log & ship ............ 20 min    → GATE 5 · human watches it end to end
```

Never run ahead of a gate. **Stages 2, 2b and 3b are not mine to pass**, and neither is Stage 1.

**Why 2b and 3b exist (2026-09-11).** r009 was cut three times and every cut fixed a SCRIPT
problem found after a full build, render and audit. Meanwhile the send test had correctly
predicted five floored reels in a row without ever stopping a build. **The two new gates are where
the money is**: one costs a sentence, the other costs a page of markdown, and between them they
guard every hour and every token the build spends.

---

## Git — do not commit

**Leave every change uncommitted in the working tree.** The user reads the diff themselves; that
review is a gate too, and committing for them takes it away.

- **Never commit unless the user says to commit**, in that turn. "Looks good" is not that.
- **When they do say so: commit directly to `main`.**
- **No new branches, and no worktrees.** Not for isolation, not for safety, not "just in case".
- No pushing, no merging, no PRs unless asked.

At the end of a stage, say what changed and in which files, then stop.

*(`.claude/settings.json` sets `worktree.bgIsolation: none` so a background job can edit the
checkout directly instead of being forced onto a branch. If some other harness still refuses an
edit without isolation, say so plainly rather than branching quietly.)*

---

## Stage 1 — Present the ideas

**Never invent a topic.** Every reel comes from a permanent id in
[`backlog/open.md`](../../../backlog/open.md). If the user wants something with no row, the
move is to *propose a new id* — with a section, and therefore an accent — get it written into the
backlog, and only then build. `I51`, `I52` and `I54`–`I68` were all added that way.

```bash
python3 .claude/skills/new-reel/scripts/backlog_ideas.py            # shortlist, grouped by section
python3 .claude/skills/new-reel/scripts/backlog_ideas.py --all      # every id with status
python3 .claude/skills/new-reel/scripts/backlog_ideas.py --id I58   # one id in full, with its notes
```

The script reads status from the repo, not from memory: built reels from `CLAUDE.md`'s table,
Gate 0 verdicts from `projects/*/gate0/GATE0.md`, in-flight work from the `projects/` directories.
It reports facts. **The ranking below is mine to argue and the user's to decide.**

### Present 5–7 candidates, not 65. Rank them on the pattern that survived.

For each candidate, one line each:

1. **The draft sentence** — what a viewer repeats to a friend. Plain words, no CS noun.
2. **Who do they send it to, and what are they proving?** *(`brand_guide_software.md` §13)*
   r005: your uncle, that the earth is round → ~66k views. r006: nobody, nothing → ~1.8k.
   **No answer to that question means the reel gets liked and forgotten.** Cheapest filter there is.
   The full test is three conditions, all required: the viewer has **personally witnessed** the
   evidence, a **dispute is already running**, and it **resolves to one repeatable thing**.
3. **Is the object nameable with the sound off?** A city map, a photograph, a keyboard, a lock, a
   queue of people — yes. A matrix, a bar chart, a grid of cells, a graph — no; those are pictures
   *of* an idea.
4. **Is it visible by nature?** Physical systems are. Software is not, and pays a sentence of setup
   for it — which is the order Gate 0 forbids. Best predictor in the built history.
5. **Data: does it exist, is it free, and may we use it?** See `reference/gate0.md` § the licence
   question. Published figures are facts and citable; route geometry is a database.

Then say which one I'd build and why, in two sentences. **Ask; do not pick.**

Prefer the **"open with these eight"** (`I01 I02 I03 I15 I17 I25 I31 I42`) while any remain — they
cover all six sections and double as a pillar test. The script stars them.

> A reel is a day of work; don't guess which one. — `CLAUDE.md`

---

## Stage 2 — Gate 0 · the friend test

**Full procedure, kill conditions, templates and the licence check:
[`reference/gate0.md`](reference/gate0.md).**

Two artefacts, in this order, then a human yes:

1. **The sentence** — written and put in front of the user *as text*, first.
2. **One still of the payoff frame** — PIL/matplotlib, five minutes, into
   `gate0/<id>_<slug>/gate0/`. The frame is **evidence that the sentence can be shown**,
   nothing more.

**Ask about the SENTENCE, not the picture.** I15 passed this gate on *"does a stranger know
that's a city?"* — yes, the picture was genuinely good — and the finished reel got *"I didn't
understand the point. We are comparing 2 algos?"*. A beautiful frame will carry a bad sentence
straight through. The gate question is **"would you say this sentence to someone?"**

Three kill conditions. **Any one ends the concept — pick a different id, do not repair it.**

- The sentence needs a CS word ("hash", "index", "quantise", "edit distance").
- The payoff frame shows an object the viewer has never seen.
- The amazement depends on understanding first.

I do not pass this gate. I wrote the sentence, so I cannot un-know it to judge whether a stranger
would. Every other gate in the repo is machine-checkable, which is exactly why this one is human.

---

## Stage 2b — GATE 3 · the send test. Binding. No answer, no build.

**Evidence and grading: [`docs/depth_first/what_travels.md`](../../../docs/depth_first/what_travels.md).**

Ask, and put the answer in front of the human **as one sentence**:

> **Who does the viewer send this to, and what are they proving?**

r005: *your uncle, that the earth is round.* r006–r009: *nobody, nothing* — and all four floored,
each one flagged in writing beforehand. **The gate is not the asking, it is the stopping.**

Instagram ranks on watch time, likes per reach and **sends per reach**, and sends are what reach
non-followers — roughly 3–5× a like's weight for unconnected reach. r009 v3 likes at **2.92%** of
viewers against r005's 2.79% and sends at **0.00%** against 0.92%. It is not liked less; it does
not travel.

**The answer must name a channel** (Berger & Milkman, JMR 2012 — sharing is driven by high-arousal
emotion, plus practical utility and surprise):

- **Argument ammunition** — a dispute is already running and this settles it.
- **High-arousal novelty** — awe/anger/anxiety at something genuinely unfamiliar. **Check the
  GENRE, not just the subject**: cosmic scale is the canonical awe stimulus and r009 got zero
  sends, because in a saturated genre the response is recognition, not awe.
- **"This is you"** — sent to one person because it is about them.
- **Practical utility** — the viewer will actually use it.

"The friend who likes space" is not an answer. If the honest answer is *nobody*, say so and go
back to Stage 1. That costs five minutes; a build costs a day.

---

## Stage 3 — Research and measure before building

**Treat every backlog figure as a research lead — including the ones in the hooks.** r004 shipped
promising "300 roads, not 300,000"; the real graph gave 17,092 vs 1,700. `I53` was approved at
Gate 2 and then killed by its own data here, for two scripts and twenty minutes. That is the gate
working, not failing.

- Every claim, figure and complexity bound is **verified against a primary source**, recorded.
  `I31 I48 I49 I50` and all of `I54`–`I68` carry figures from memory and must be checked.
- **Any on-screen "X happens because Y" needs an experiment that could falsify it**, with controls.
  r001 shipped "the cafe noise dies here" — false: noise yields *more* peaks (224) than the song (202).
- Every percentage gets **one stated base**; never compare two figures computed on different ones.
- **No shopping for a dataset that fits.** Trying Mumbai, then Chennai, until one supports the
  claim is p-hacking when the causal claim *is* the reel.
- **Record negative results, including broken tests.** `I53`'s first flow-accumulation test
  returned 96–99 for everything including its controls — saturation dressed as a result.

If a figure kills the concept: write the GATE0 file up as a **failure record** (model:
`gate0/i53_flood/gate0/GATE0.md`), append the verdict to the backlog row, keep the id, stop.
Do not repair and do not go city-shopping.

---

## Stage 3b — GATE 4 · the script. Nothing is coded until this is approved.

**Write the complete script as a TABLE and put it in
`projects/<id_or_reel>/SCRIPT.md`. No Python, no `.tsx`, no data module exists yet.**

| t | Narration — the on-screen words, verbatim | On screen | Why this beat exists |
|:--|:--|:--|:--|

Every beat, every line of copy, every number, the runtime, the hook and the close. **The human
reads it in two minutes and says yes or no.** `projects/r009_emptiness/SCRIPT.md` is the model —
it was written after the fact, and it is precisely what should have existed first.

**Check these before handing it over, because they are what the three r009 cuts were spent on:**

- **ONE ruler.** Every number on screen answers the same question. r009 v1 changed yardstick eight
  times in nine beats and the verdict was *"we don't know what we are comparing against."*
- **The hook SHOWS the result, it does not promise it.** Measured on r009: showing beat promising
  by +60% on watch time. In a saturated genre the difference must be legible inside one second.
- **Names ride on the objects**, not in a caption slot 470 px away.
- **Never more than three text blocks on screen at once.**
- **No jargon anywhere** — no catalogue designations, no units the viewer does not own (`AU`), no
  five-significant-figure research artefacts.
- **Every claim traced to a source**, and every mechanism sentence falsifiable (non-negotiable 7).

**Once approved the script is a CONTRACT.** If a beat cannot be animated as scripted, that comes
BACK here as a script change — it is never solved by improvising at build time. Improvising at
build time is how r009 v1 ended up with seven rulers.

---

## Stage 3c — 3D BY DEFAULT. `@remotion/three`, unless there is a stated reason not to.

**Standing direction from the account owner (2026-09-11): use 3D wherever it can add a sense of
awe.** `r009` proved the stack — `@remotion/three`, `<ThreeCanvas>`, and
`Config.setChromiumOpenGlRenderer("angle")` in `remotion.config.ts`. A flat 2D reel is now the
exception and needs a reason in `NOTES.md`.

**Spend the third dimension on something 2D cannot do**, not on tilting a chart. The test: name
the shot that only exists because the scene is 3D. The parked `I65` traffic build unrolls a
755-foot ring into a straight highway and bends it back — same road, one continuous move, no cut —
and drops the camera to driver's eye for the beat where the jam passes through *you* (code at
commit `18020c6`).

**Two failure modes, both already paid for:**

- **Awe is not distribution.** `r009` was the first 3D reel, drew the best craft verdict the
  account has had, and posted its worst reach. 3D raises the ceiling on a reel that already
  answers GATE 3; it is never the answer itself. See
  [`what_travels.md`](../../../docs/depth_first/what_travels.md) §B — arousal requires novelty,
  and a genre the viewer has seen a hundred times produces recognition instead.
- **3D must never cost legibility.** If the claim reads more clearly from one angle, the camera
  goes there and stays. A wave moving backwards through traffic reads from above and nowhere
  else, so the beat carrying that claim is near-top-down and the dimensionality is spent getting
  there.

**Mechanics that cost a day if you learn them the hard way:**

- **Animate the ROOT GROUP, not the camera.** `<ThreeCanvas>` takes its camera as a prop. Fix the
  camera, wrap the scene in a `<group>`, and animate that group's position and rotation.
- **`useBeat` and friends are HOOKS.** Never call one inside a branch — a conditional call changes
  hook order between frames. Compute both and pick the result.
- **Depth precision.** A float32 depth buffer falls apart after ~7 orders of magnitude. If a scene
  spans more, re-base it (`r009`'s `viewKm`) rather than scaling or flying through.
- **Render needs an explicit browser** in this container:
  `--browser-executable=/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`.
  The plain `chrome` binary fails — old headless mode was removed.

---

## Stage 4 — Build to the approved script

**Full pipeline, file layout, chrome API and the nine non-negotiables:
[`reference/build.md`](reference/build.md).**

The method is **compute the animation, don't author it**: run the real algorithm in Python, dump
its intermediate state to JSON, pack it into a TS module, play it back in Remotion. On-screen
numbers are then free and correct because the run produced them. **₹0 — no image model is ever
involved in a reel. Keep it that way.**

```
projects/r<NNN>_<name>/
  gate0/GATE0.md, mock_payoff.py, payoff_frame.png
  <compute>.py      → <name>_data.json   real algorithm on real data; asserts its own claims
  emit_ts.py        → remotion/src/reels/data/<name>.ts
  NOTES.md          build record — figures with provenance, beats, traps, what is NOT claimed
remotion/src/reels/<Name>.tsx             plus BOTH compositions registered in Root.tsx
```

---

## Stage 5 — Render and validate

**Full checklist and thresholds: [`reference/validate-and-ship.md`](reference/validate-and-ship.md).**

```bash
cd remotion
npx tsc --noEmit && npm run brand:check
npx remotion render r<NNN>-<name> ../projects/r<NNN>_<name>/r<NNN>_<name>.mp4 --codec=h264
cd ..
python3 scripts/reel_motion_audit.py projects/r<NNN>_<name>/r<NNN>_<name>.mp4
```

Non-negotiable: **run the audit at its default `--width 240`** — every benchmark in the repo is at
240, and the same reel scores 27% at 240 and 51% at 360. Measure **per beat** before changing
anything; the global number hides which beat is dead, and the beat carrying the argument is
usually the deadest one. Then check the `*-safe` composition still, and **watch the video end to
end** — stills are for layout, video is for timing.

---

## Stage 6 — Log and ship

Five files, every time (details in `reference/validate-and-ship.md`):

| File | What goes in |
|:--|:--|
| `CLAUDE.md` | the "Built so far" row |
| `brand_guide_software.md` §13 | what this build taught, dated — including what failed |
| `reel_captions_log.md` | the caption, the hook line, engagement columns filled in later |
| `backlog/open.md` | the row marked produced/failed, with corrections to its figures |
| `projects/r<NNN>_<name>/NOTES.md` | figures with provenance, the beats, the traps, what is NOT claimed |

**GATE 3: the user watches the reel end to end before it is posted.** r006's pronoun hook and
I15's entire framing passed every automated check and were caught only by watching.

Write all five, then **stop — do not commit.** List what changed and let the user read the diff.
See "Git — do not commit" above.

---

## Resuming

If `projects/<id>_*/` already exists, read its `gate0/GATE0.md` and `NOTES.md` first and rejoin at
the right stage. Do not restart a gate that has been passed, and do not skip one that has not.
