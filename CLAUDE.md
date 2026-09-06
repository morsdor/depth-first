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

### Built so far

| Reel | Backlog id | Subject | State |
|:--|:--|:--|:--|
| `r001` | `I02` | Shazam fingerprinting | **posted 2026-09-02** |
| `r002` | `I08` | Autocorrect / edit distance | **posted 2026-09-02** |
| `r003` | `I01` | QR / Reed–Solomon damage tolerance | re-cut hook-first 2026-09-03, end beat 2026-09-05, 37 s, not posted |

Update this table and `brand_guide_software.md` §13 when one ships.

**r003's end card promises `I03` (a JPEG stores no pixels) as r004.** Build that next, or change
the line in `Qr.tsx` before posting — the reel is on record either way.

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
5. **Pacing inside the body: read → animate → hold** — the hold keeps its reading time but never its
   stillness (see 4). Label alone ~1.5s, animation 2–3s, hold on the finished state
   ~2s. ≈6.5s per idea. The 2s hold is the phase everyone drops, and dropping it is why a reel reads
   as "too fast to understand anything".
6. **Open on a civilian object, never a developer noun.** Never name the algorithm in the hook.
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
