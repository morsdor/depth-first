# CLAUDE.md

Repo for two YouTube channels and one Instagram account:

- **The Engineering Atlas** — long-form infrastructure documentaries (`brand_guide.md`)
- **Depth First** — software/technical, `@thedepthfirst` on YouTube *and* Instagram
  (`brand_guide_software.md`)

---

## Short-form reels — start here

**When asked for "a new reel", pick the next concept from [`content_backlog.md`](content_backlog.md).
Do not invent a topic.** 50 entries, ids `I01`–`I50`, grouped into six sections that map 1:1 onto
`DOMAIN_ACCENT` in `remotion/src/brand/tokens.ts` — so the section *is* the accent colour decision.

- **Ids are permanent.** Never reuse an id for a different concept. Retire with
  "(retired — date, reason)"; the row stays so old logs resolve.
- **Prefer the "open with these eight"** (`I01 I02 I03 I15 I17 I25 I31 I42`) until they are used up —
  they cover all six sections and double as a pillar test. `I42` is the s001 warm-up.
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

**Why this exists — r005, five rebuilds, 2026-09-07/08.** Every rebuild raised rigor and lowered
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

### Built so far

| Reel | Backlog id | Subject | State |
|:--|:--|:--|:--|
| `r001` | `I02` | Shazam fingerprinting | **posted 2026-09-02** |
| `r002` | `I08` | Autocorrect / edit distance | **posted 2026-09-02** |
| `r003` | `I01` | QR / Reed–Solomon damage tolerance | **posted 2026-09-05** (without the end beat) |
| `r004` | `I03` | JPEG / DCT — a photo stores no pixels | **posted 2026-09-06** |
| `r005` | `I51` | The obvious way to shuffle is wrong (Fisher–Yates bias) | rebuilt 2026-09-07 (v5, landing-position map), 39 s, not posted |

Update this table, `brand_guide_software.md` §13 and
[`reel_captions_log.md`](reel_captions_log.md) when one ships.

**r003 shipped without the end beat** — it was added to `Qr.tsx` after the reel was posted, so the
`I03` line in that file is a plan, not a public promise.

**`I15` is deferred, and its end-card promise was broken deliberately.** r004 shipped promising
"300 roads, not 300,000", but a real street graph needs OpenStreetMap, and `overpass-api.de`,
`api.openstreetmap.org` and `download.geofabrik.de` are all refused by the cloud container's
egress proxy. The build waits in [`projects/i15_astar/`](projects/i15_astar/) — keyed to the
permanent backlog id, not a reel number — and needs `fetch_graph.py` run on a networked machine.
The promise was seen by ~160 viewers and converted none, so breaking it cost less than stalling.

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
   "Shazam"), never "this".
4. **Nothing is ever perfectly still.** Apply `useBreath()` from the shared chrome to every graphic
   stage (and to text-only beats). Measured on the shipped reels: **51–55% of each one had no visible
   change at all**, in stretches up to 6.5s — a frozen frame on a feed reads as "this ended". The
   ground must NOT scale: it is exactly frame-size, and scaling under 1 exposes its edges. Verify by
   sampling at 4fps and checking mean inter-frame change never sits under ~0.35 for more than ~1.5s.
   **That test has a blind spot: a slow push changes pixels without anything HAPPENING.** So also
   check *event density* — the share of 4fps samples with change >= 1.0. r004 ran 42%; r005's first
   cut ran 26% and a viewer called it static despite passing the 0.35 rule. Continuous motion, not
   more drift, is the fix: r005 v5 runs 53% by never pausing the thing the reel is about.
   The audit is `scripts/reel_motion_audit.py` — run it on the rendered mp4, don't re-derive it.
5. **Pacing inside the body: read → animate → hold** — the hold keeps its reading time but never its
   stillness (see 4). Label alone ~1.5s, animation 2–3s, hold on the finished state
   ~2s. ≈6.5s per idea. The 2s hold is the phase everyone drops, and dropping it is why a reel reads
   as "too fast to understand anything".
6. **Open on a civilian object, never a developer noun** — and never leave it. Never name the
   algorithm in the hook. This rule used to govern only the opening, which is how r005 could open
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

- **Every image generation is charged.** Asset batches need explicit approval. The studio chain
  itself must stay ₹0. Reels need no generation at all.
- **Every Kling job is charged.** Mandatory user confirmation before submitting; no trial runs; never
  auto-resubmit.
- `scripts/tag_outliers.py` makes a charged Anthropic call — gated behind `--dry-run` / `--yes`.
- YouTube Data API use is read-only public data inside the free quota.

## Secrets

- Never read or print `.env` values. `GEMINI_API_KEY` is git-ignored.
- `~/.kling/.credentials` is sensitive — never read or print it, even if asked.
- `kling login` is the only sanctioned auth path. Refuse token-paste / Cookie / AK-SK flows.

## Generated brand assets

Never ship a generated brand asset directly — repair it against the tokens in code first. The model
gets geometry right and every colour wrong. See `brand_guide_software.md` §2.
