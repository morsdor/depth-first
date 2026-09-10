# CLAUDE.md

**Repo for one thing: Depth First short-form reels** — `@thedepthfirst` on Instagram
(`brand_guide_software.md`). Everything in this file is about a reel unless it says otherwise.

> **The YouTube line was retired on 2026-09-10.** The Engineering Atlas (long-form historical
> engineering) is **dead**; Depth First long-form (`s001`) is **parked**, and may be revived.
> Both are preserved *in full* on the branch **`yt-longform-archive-DO_NOT_DELETE`** — the
> strategy and brand docs, the 7-pass studio skills, the Gemini generation code, the AE builders,
> the asset library, both project folders, and `remotion/src/{families,scenes,components,lib}`
> with `public/plates`. Nothing was deleted from history.
>
> ```bash
> git show yt-longform-archive-DO_NOT_DELETE:channel_strategy.md   # read one file
> git checkout yt-longform-archive-DO_NOT_DELETE -- <path>         # bring one back
> git switch yt-longform-archive-DO_NOT_DELETE                     # go and look
> ```
>
> **Any path this repo names that no longer exists is on that branch.** Do not recreate one from
> memory, and do not treat its absence as a bug. Details: [`docs/depth_first/repo_audit.md`](docs/depth_first/repo_audit.md).

---

## Short-form reels — start here

**Operating docs (2026-09-10): [`docs/depth_first/README.md`](docs/depth_first/README.md)** — state of
the account, the full pipeline map, the repo audit, the visual toolbox, module packs, and the growth
strategy with its experiment register. This file stays the law; those are the map.

### The promise is "how systems work" — NOT computer science (2026-09-10)

**The subject is any system whose mechanism can be shown running on real data.** Power grids,
water, tides, ports, railways, orbits, cities — all in scope. Software is one lane of it and has
been mistaken for the whole channel because `content_backlog.md` was written in one sitting by
someone thinking only about software.

**This is the explanation for three Gate 0 failures in a row.** `I52`, both cuts of `I15` and
`I24` all died on the same kill condition — *the amazement depends on understanding first* — and
that is not bad luck. **A software mechanism is invisible by nature**, so it always needs a
sentence of setup before the picture means anything, which is precisely the order Gate 0 forbids.
A physical system is visible by nature. The reel that reached ~66k is a map and a physical fact;
the one that reached ~1.8k is a map and a fact nobody argues about. Widening the subject is not a
new strategy, it is removing a constraint that was never real.

**Length: 30–60 s.** The 28–39 s reels shipped so far were not a format rule, and at ≈6.5 s per
idea 60 s buys eight or nine beats instead of four. Longer is permitted, never required — earn
each beat, and the retention cliff at 1.5–3 s is unchanged by the runtime.

**The backlog is still the gate on inventing topics.** A non-software concept gets a permanent id
appended to `content_backlog.md` with its section and accent **before** it is built, exactly like
`I51` and `I52` did. Physical-system ids will usually land in §2 (`infrastructure`) or §6
(`failure`), which already fit them. Do not build off a topic that has no row.

**When asked for "a new reel", pick the next concept from [`content_backlog.md`](content_backlog.md).
Do not invent a topic — propose a new id and get it written down instead.** **69 entries, ids
`I01`–`I69`**, grouped into six sections that map 1:1 onto `DOMAIN_ACCENT` in
`remotion/src/brand/tokens.ts` — so the section *is* the accent colour decision. Live counts come
from the script, never from this line:
**8 built · 1 failed · 2 in gate · 2 retired · 1 shelved · 55 open** (2026-09-10).

**The procedure for all of this is the [`new-reel`](.claude/skills/new-reel/SKILL.md) skill —
`/new-reel`.** It lists the live candidate ids with their real status
(`python3 .claude/skills/new-reel/scripts/backlog_ideas.py`), runs the reasoning that shortlists
them, and then walks Gate 0 → research → build → render → audit → the five logs, stopping at each
of the three human gates. This file stays the law; the skill is the sequence.

- **Ids are permanent.** Never reuse an id for a different concept. Retire with
  "(retired — date, reason)"; the row stays so old logs resolve.
- **The "open with these eight" are nearly used up.** `I01 I02 I03 I17` are built (r003, r001,
  r004, r005) and `I15` is retired, so **only `I25`, `I31` and `I42` remain**. They were chosen to
  cover all six sections as a pillar test; with five gone that job is mostly done, and the argument
  test below now matters more than finishing the list. `I42` was the s001 warm-up — s001 is parked
  on the archive branch, so `I42` is now just a strong `§5 ai` candidate on its own merits.
- **Propose the id and confirm before building.** A reel is a day of work; don't guess which one.

### Gate 0 — the friend test. Runs BEFORE any code, and it is not mine to pass.

Nothing is built — no Python, no `.tsx`, no data module — until these two things exist and the
**human has said yes**:

1. **The sentence.** One sentence, in a normal person's words, that a viewer would say to a friend
   after watching. Not a description of the reel. The thing they'd repeat at dinner.
2. **One still of the payoff frame.** Drawn by hand or in PIL, in five minutes. Not a render.

**Three kill conditions. Any one of them ends the concept — pick a different id, don't repair it.**

- **The sentence needs a CS word.** "Shuffle bias", "hash", "index", "edit distance", "quantise".
  If the sentence cannot survive without it, the idea has no civilian surface and never will.
- **The payoff frame shows an object the viewer has never seen.** A matrix, a bar chart, a grid of
  abstract cells, a graph — these are pictures *of* an idea, not the thing itself. A city map, a
  photograph, a keyboard, a song, a lock, a queue of people: those are objects. The test is whether
  a stranger can name what is on screen with the sound off and no labels.
- **The amazement depends on understanding first.** If the viewer has to follow an argument before
  the frame is impressive, it is a blog post. The `equation.verse` reel at 131,000 likes is a real
  Berlin street map flooding with a pathfinding search — you are amazed *first*, and understanding
  is the reward for staying. That order is not optional and it is not reversible.

**I do not pass this gate.** I wrote the sentence, so I already know what it means, and I cannot
un-know it to judge whether a stranger would. The human says yes or no, in under a minute. That is
the entire cost of the gate, and it replaces a day of building the wrong thing.

**Ask about the SENTENCE, not the picture — I15, 2026-09-10.** I15 passed this gate on the
question *"does a stranger know that's a city and want to know why the blue spread everywhere?"*
and the answer was yes, because the picture was genuinely good. It was built, and the verdict on
watching it was **"I didn't understand the point. We are comparing 2 algos?"** — which was exactly
right: its sentence was *"that one change is the difference between checking 17,000 junctions and
checking 1,700"*, a fact about algorithmic efficiency that nobody would ever repeat to a friend.

A beautiful payoff frame will carry a bad sentence straight through this gate. **The gate question
must be "would you say this sentence to someone?", and the frame is only there to prove the
sentence can be shown.** The order matters: sentence first, frame as evidence for it.

**Why this exists — I51, five rebuilds, 2026-09-07/08.** Every rebuild raised rigor and lowered
recognition: v1 drew 16 coloured bars, v5 drew a 13x13 landing-position matrix measured over 400,000
shuffles. v5 is the more honest reel and it is the less watchable one, because no viewer has ever
seen either object. The verdict that ended it — *"anyone who sees that will not understand even a
single word; nobody knows what it is for"* — was given five times before it was heard, because each
time it was answered with a craft fix. **Every other gate in this file can be checked by me alone,
which is exactly why the one that decides whether the reel works had to become a human gate.**
Machine-checkable rigor is the thing I will drift toward if nothing stops me.

**A subject whose defining property is that it is invisible cannot pass this gate.** The naive
shuffle's whole point is that nobody can see the bias and no test catches it. That is a good essay
and a bad reel, and recognising it early is cheaper than five rebuilds.

### Pick a fight, not a gap (r005 vs r006 — the belief-correction test FAILED)

**r006 was the pre-registered test of the "correct a belief" pattern and it failed.** Built to all
five points, better motion numbers than r005, and it peaked at **~1.8k views against r005's ~66k**.
The stated fallback explanation — that the engine was the map and Explore's geography audience —
died with it, because r006 is also a map.

**What r005 actually had, per its comments: it landed inside the flat-earth argument.** The curved
flight path on a flat map is the most-cited exhibit on both sides of that fight, so the reel was
usable as evidence in a dispute already running. r006 corrected a belief nobody argues about.

**Three conditions, all required** (full reasoning in `brand_guide_software.md` §13):

1. **The viewer has personally witnessed the evidence** — seen it themselves, repeatedly. The
   seatback map. The blue dot. The shuffle that repeats an artist.
2. **A dispute is already running.** Somebody is publicly wrong about this on a regular basis and
   somebody else corrects them. If you cannot picture the argument, there isn't one.
3. **It resolves to one repeatable thing** — one number, ratio or subtraction, carried into the
   argument without the reel.

**Ask before building: who does the viewer send this to, and what are they proving?** r005: your
uncle, that the earth is round. r006: nobody, nothing. **No answer means the reel gets liked and
forgotten.** This is n=1 against n=1 and is not a law — but it is the cheapest available filter,
and it costs one sentence to apply.

**It does not license chasing conspiracy content.** The engine is "settles a live argument"; flat
earth is one arena and most others are cheaper and less toxic. Also unresolved and worth checking
before optimising for reach: whether r005's 71 follows stayed, and whether they watched r006.

### Built so far

| Reel | Backlog id | Subject | State |
|:--|:--|:--|:--|
| `r001` | `I02` | Shazam fingerprinting | **posted 2026-09-02** |
| `r002` | `I08` | Autocorrect / edit distance | **posted 2026-09-02** |
| `r003` | `I01` | QR / Reed–Solomon damage tolerance | **posted 2026-09-05** (without the end beat) |
| `r004` | `I03` | JPEG / DCT — a photo stores no pixels | **posted 2026-09-06** |
| `r005` | `I17` | Great circle — the flight path that looks curved is the straight one | **posted 2026-09-08** (32 s) — first reel built under Gate 0; **80k+ views and ~120 follows by 2026-09-10**, the account's only hit |
| `r006` | `I22` | Submarine cables — your message abroad goes underwater, not to space | **posted 2026-09-09** (28 s) — peaked ~1.8k views; the r005 pattern test, and it failed |
| `r007` | `I58` | Tides — the Sun pulls 179x harder and the Moon still makes the tide | built 2026-09-10 (54 s), **posted 2026-09-10** — 189 views · 4 likes · 1 follow at first reading; first reel outside software, and the longest |
| `r008` | `I69` | Pendulum wave — fifteen strings, and the thirty seconds they take to come back | built 2026-09-10 (34 s), **posted 2026-09-10** — 190 views · 0 engagement at first reading; first reel with a Manim layer; rebuilt down from a 60 s cycle after the first viewer could not tell the fifteen strings apart |

**Reel numbers are contiguous and mean "the Nth reel posted".** `r001`–`r008` above are the eight
that have shipped, in order. **The next reel is `r009`.**

**Three built reels were never posted and were deleted on 2026-09-10** — the shuffle bias (`I51`,
five rebuilds), A\* vs Dijkstra (`I15`, which failed the sentence test after being built) and the
shelved queue (`I64`). Their project folders, components and data modules are gone from the tree and
remain in git history.

**The number is claimed when a build starts and released if the build is abandoned.** Claiming it
at build time is what stops two builds colliding; releasing it is what keeps the sequence gapless.
**An unpublished build has no reel number and is called by its backlog id** — which is what ids are
for. `I51` and `I15` briefly held r005 and r008; those numbers now belong to the great-circle and
pendulum reels, and everything those builds taught is in `brand_guide_software.md` §13 under their
ids.

### Where things live — the whole repo (2026-09-10)

```
depth-first/
├── CLAUDE.md                    the law — this file
├── README.md                    what this is, how to run it, where the YouTube line went
├── content_backlog.md           69 permanent ids in six sections; the section IS the accent
├── brand_guide_software.md      §13 is the ledger: every dated lesson, incl. retracted ones
├── reel_captions_log.md         caption, hook line, load-bearing phrasings, engagement per reel
├── insta_strategy.md            superseded premise, surviving evidence — read its status banner
├── requirements.txt             numpy · Pillow · matplotlib (Manim has its own venv)
│
├── projects/r<NNN>_<name>/      A REEL THAT SHIPPED. r001…r008, contiguous, in posting order
│   ├── gate0/                   GATE0.md · mock_payoff.py · payoff_frame.png
│   ├── <compute>.py             the real algorithm; prints every figure; asserts its invariants
│   ├── <name>_data.json         its dumped intermediate state
│   ├── emit_ts.py               packs JSON → TS and REFUSES to write if a claim is false
│   ├── NOTES.md                 figures with provenance · beats · gate numbers · traps
│   └── r<NNN>_<name>.mp4        the render — tracked, so it can reach a phone
│
├── gate0/i<NN>_<slug>/          A WRITTEN GATE 0 WITH NO SHIPPED REEL — in gate, or killed
│                                I33, I52 in gate · I53 killed by its own data
│
├── remotion/
│   ├── src/reels/               one .tsx per reel + lib/chrome.tsx (the shared chrome)
│   │   ├── lib/chrome.tsx       SAFE area · ReelGround · useBreath · ReelHeader · Readout
│   │   ├── lib/manim.tsx        ManimLayer — plays a transparent PNG sequence
│   │   └── data/                GENERATED TS modules — never hand-edited
│   ├── src/brand/tokens.ts      palette · easing · type scale — brand:check enforces it
│   ├── src/Root.tsx             16 compositions: 8 reels × (plain + -safe), plus manim-probe
│   └── public/{fonts,reels,manim}/   vendored fonts (renders are offline) · audio · PNG layers
│
├── scripts/
│   ├── reel_motion_audit.py     dead spell ≤ 1.5 s · event density (run at DEFAULT --width 240)
│   ├── reel_safe_audit.py       any content outside x 60–870 / y 270–1540, on the mp4
│   ├── manim_render.py          Manim scene → transparent PNG sequence for ManimLayer
│   └── manim_probe/             the Manim→PNG→Remotion bridge smoke test. NOT a reel
│
├── docs/depth_first/            the operating docs — start at README.md
├── docs/comps/                  equation.verse and @CodeSource teardowns
├── data/                        the *_software competitor evidence
└── assets/{brand,fonts}/        the wordmark and the type
```

**A concept lives in `gate0/` from the moment its Gate 0 is written and moves to
`projects/r<NNN>_<name>/` when the build starts and claims its number.** If a build is abandoned it
is deleted and its number is released, which is what keeps `r001`–`r008` gapless.

Update this table, `brand_guide_software.md` §13 and
[`reel_captions_log.md`](reel_captions_log.md) when one ships.

**r003 shipped without the end beat** — it was added to `Qr.tsx` after the reel was posted, so the
`I03` line in that file is a plan, not a public promise.

**`I15` was built (2026-09-10, never posted, since deleted) and its numbers were nothing like the promise.** r004 shipped
promising "300 roads, not 300,000". A real graph does not do that: on 26,193 junctions of central
Paris, Arc de Triomphe to Notre-Dame, Dijkstra expands **17,092** and A* expands **1,700** —
**10.1x**, not 1000x. Manhattan gave only 3.6x. **Treat every backlog figure as a research lead,
including the ones in the hooks.**

The block that deferred it — `overpass-api.de` and every other OSM host refused by the cloud
container's egress proxy — does not apply on a local machine. Overpass also answers urllib's
default User-Agent with **HTTP 406**, so `fetch_graph.py` identifies itself and falls back across
three mirrors.

### Gate 0 also has a licence question (added 2026-09-09, from `I22`)

**Before building, check that the data source may actually be used.** r006's
route was first measured out of TeleGeography's submarine-cable API; their policy
permits screenshots of the published maps under CC BY-SA 4.0 but restricts "the
underlying databases" to paying subscribers, so the whole build had to be
re-sourced after Gate 0 had already passed. It survived only because a route
rebuilt from public geography alone — real ports and the chokepoints between
them — landed within 1.4% of it.

**Published figures are facts and are citable. Route geometry is a database.**
That distinction is what let r006 keep naming MAREA and IMEWE and quoting their
lengths. Ask the licence question next to the friend test, not after it.

### The method: compute the animation, don't author it

Run the **real algorithm** in Python, dump its intermediate state to JSON, pack it to a TS module,
play it back in Remotion. See `projects/r001_shazam/` for the reference shape
(`fingerprint.py` → `emit_ts.py` → `emit_audio.py` → `remotion/src/reels/Shazam.tsx`).

On-screen numbers are then free and correct because the run produced them. **₹0 — no image model is
involved in a reel.** Keep it that way.

### Non-negotiables for a reel

1. **Instagram safe area.** Compose in `y` 270–1540, `x` 60–870 — *not* the raw 1080×1920 canvas.
   Constants live in `remotion/src/reels/lib/chrome.tsx` (`SAFE`, `SAFE_TOP`, `SAFE_BOTTOM`,
   `SAFE_W`). Check the `*-safe` composition in Studio before posting. r001 shipped with its title
   inside Instagram's top bar — that is the bug this prevents.
2. **Ground is never a flat fill.** Use `<ReelGround accent={...} />` from the shared chrome, not
   `backgroundColor`. Flat near-black left ~83% of the frame empty and ~90% greyscale, which is why
   the first two reels read as pale — see `brand_guide_software.md` §3a, which supersedes §3's
   10%-saturation rule for short-form. Amber stays one element per frame.
3. **Hook: show before you tell — the first 2 seconds decide everything.** The payoff visual starts
   moving by ~0.5s and the first surprising result lands by ~3s; the title rides *over* the action
   rather than preceding it. No step label in the opening beat. Measured on r001/r002: half the
   audience is gone by 1.5–3s, and both retention curves then FLATTEN — so the body works and the
   opening is the only thing costing reach. Name a recognisable object in the title ("a QR code",
   "Shazam"), never "this" — **and never a bare "It" either, which is the same failure.** r006
   shipped a first cut opening on "It doesn't go up. It goes under.", six seconds of pronoun with
   no antecedent, and it passed every automated check. **Check the title against the Gate 0
   sentence before rendering:** that sentence is the most repeatable phrasing of the idea and a
   human approved it, so if its subject noun ("your *message*") is missing from the title, the
   title is weaker than something you already had.
   **A hook that only labels the frame is not a hook — r008, 2026-09-10.** Its first cut opened on
   "FIFTEEN WEIGHTS. FIFTEEN STRINGS.": accurate, two real objects named, and it passes every rule
   above. The verdict was *"first frame doesn't bring any question/hype that user would want to
   stick to end"*. A label describes what is on screen; a **promise** says what is about to happen
   to it and when — "REMEMBER THIS ROW OF WEIGHTS. In 30 seconds it comes back." And if the promise
   names a time, put a clock on screen keeping it: the countdown is what turns the claim into a
   reason to still be there at the payoff. Costs nothing, applies to every reel whose payoff is
   delayed.
4. **Nothing is ever perfectly still.** Apply `useBreath()` from the shared chrome to every graphic
   stage (and to text-only beats). Measured on the shipped reels: **51–55% of each one had no visible
   change at all**, in stretches up to 6.5s — a frozen frame on a feed reads as "this ended". The
   ground must NOT scale: it is exactly frame-size, and scaling under 1 exposes its edges. Verify by
   sampling at 4fps and checking mean inter-frame change never sits under ~0.35 for more than ~1.5s.
   **That test has a blind spot: a slow push changes pixels without anything HAPPENING.** So also
   check *event density* — the share of 4fps samples with change >= 1.0. r004 ran 42%; I51's first
   cut ran 26% and a viewer called it static despite passing the 0.35 rule. Continuous motion, not
   more drift, is the fix: I51 v5 runs 53% by never pausing the thing the reel is about.
   The audit is `scripts/reel_motion_audit.py` — run it on the rendered mp4, don't re-derive it,
   and run it at its DEFAULT `--width 240`: every benchmark above is at that width, and the same
   reel scores 27% at 240 and 51% at 360 because small moving objects vanish under downscaling.
   **The audit measures mean change over the whole frame, so only large-area motion counts.** A
   growing 6px line and a moving 15px dot are worth almost nothing — r006's route-draw beat, its
   most important animation, scored the LOWEST of any beat at 16%. Fixing it needs the frame to
   move, not the marker: r006 went 27% -> 49% by adding a camera that opens tight, pulls back, and
   follows the cable. Measure PER BEAT before changing anything; the global number hides which
   beat is dead.
5. **Pacing inside the body: read → animate → hold** — the hold keeps its reading time but never its
   stillness (see 4). Label alone ~1.5s, animation 2–3s, hold on the finished state
   ~2s. ≈6.5s per idea. The 2s hold is the phase everyone drops, and dropping it is why a reel reads
   as "too fast to understand anything".
6. **Open on a civilian object, never a developer noun** — and never leave it. Never name the
   algorithm in the hook. This rule used to govern only the opening, which is how I51 could open
   on two decks of cards, cut to a 13x13 matrix three seconds later, and still pass. **The
   recognisable object stays on screen, or in frame, for the whole reel.** If a beat needs an
   abstraction, it sits beside the object rather than replacing it.
7. **Accuracy gate — sentences, not just numbers.** Figures get checked because they visibly came
   from a script; hand-written *mechanism* sentences slip through. r001 shipped "the cafe noise dies
   here" — false: peak-picking yields MORE peaks on pure noise (224) than on the song (202). Any
   on-screen "X happens because Y" needs an experiment that could falsify it. Give every percentage
   one stated base and never compare two figures computed on different ones. Every claim, figure and complexity bound is verified against a primary source
   before shipping (`content_backlog.md` closing section). Historical entries `I31 I48 I49 I50` carry
   figures from memory and *must* be checked. Treat every number in the backlog as a research lead.
8. **Verify with video + filmstrip, never stills** — for *timing*. Stills are correct for *layout*.
9. **End on a reason to follow.** Measured on r001 at 3 days: ~18% of 1,286 viewers reached the
   last frame and **one** followed. The end frame is the most-watched dead space in the format —
   close on a line naming what the next reel does, over the finished visual, held the full 3s.
   The ask must be performable on the phone in the viewer's hand: r003 closed on "point your
   camera at it" over an on-screen QR code, which nobody holding one phone can scan. Follows: 0.

---

## Commands

```bash
cd remotion
npm run dev              # Remotion Studio — preview, scrub, and render from the UI
npx tsc --noEmit         # typecheck
npm run brand:check      # palette / easing / font-size / damping lint
npm run lint             # eslint + tsc + brand:check

npx remotion render r002-autocorrect ../projects/r002_autocorrect/r002_autocorrect.mp4 --codec=h264
npx remotion still r002-autocorrect-safe out.png --frame=600
```

`brand:check` accepts **computed `rgb()` strings**, which is how data-driven colour ramps stay legal
without adding hexes to the palette. Hardcoded hex literals outside `brand/` fail.

---

## Cost gates — always confirm before spending

**A reel costs ₹0 and that is a rule, not an accident.** Every frame is computed; no image model is
ever involved. It is also the channel's credibility claim — *"the real algorithm, actually run, not
drawn"* — so it is a positioning decision as much as a budget one. Keep it at ₹0.

- **Every image generation is charged**, and nothing in the reel pipeline needs one. If a task seems
  to want generation, the answer is that it is the wrong task.
- **Every Kling job is charged.** No Kling code exists on `main`; the rule stands for the archive
  branch and any future restore. Mandatory user confirmation before submitting; no trial runs;
  never auto-resubmit.
- The charged tools that used to live here — `generate_images.py`, `generate_asset.py`,
  `generate_thumbnail.py`, `scripts/tag_outliers.py` — went to
  `yt-longform-archive-DO_NOT_DELETE` with the YouTube line. Restoring one restores its cost gate too.
- **Model tokens are the one real cost of a reel.** Research and code generation are not free even
  though no image is; see `docs/depth_first/software_thesis.md` §8.

## Secrets

*(Kling and Gemini have no code on `main` any more — these rules stand for the archive branch and
for any future restore.)*

- Never read or print `.env` values. `GEMINI_API_KEY` is git-ignored.
- `~/.kling/.credentials` is sensitive — never read or print it, even if asked.
- `kling login` is the only sanctioned auth path. Refuse token-paste / Cookie / AK-SK flows.

## Generated brand assets

Never ship a generated brand asset directly — repair it against the tokens in code first. The model
gets geometry right and every colour wrong. See `brand_guide_software.md` §2. This applies to the
wordmark in `assets/brand/` and to nothing else on `main`: a reel generates no assets.
