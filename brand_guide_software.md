# Depth First — Brand Guide (software/technical documentaries)

*The identity document for the **second channel** — technical documentaries told visually. Sister to
`brand_guide.md` (The Engineering Atlas — retired 2026-09-10, now on the branch
`yt-longform-archive-DO_NOT_DELETE`), which does **not** transfer: different subject, different
viewer, different visual language. Written 2026-08-17, after the @CodeSource comp deep dive
(`docs/comps/comp_deep_dive_codesource.md`) and the Remotion pipeline decision.*

> **§5 Motion Identity is not prose — it is the spec for `src/brand/tokens.ts`.** Under the AE pipeline
> a brand guide was a document a human had to remember to obey. Under Remotion it compiles. Every
> number in §5 becomes a typed constant, and a scene that violates one fails review because it
> physically cannot be expressed. That is the whole reason this guide is worth writing before scene one.

---

## 0. The name — ✅ LOCKED: **Depth First** (2026-08-20)

**Channel name: Depth First. Handle: `@thedepthfirst`.**

Written "Depth First" — two words, no hyphen, never "DepthFirst" or "Depth-First". The handle carries
a `the` prefix because `@depthfirst` is held by a dormant 19-sub channel; a prefixed handle is
standard in this lane (`@LowLevelTV`, `@TomScottGo`, `@TheCompanyMan`, `@kevinfaang` — 4 of our 16
comps run one). Claim the handle **before** the wordmark ships; a "free" `forHandle` lookup is a
strong signal, not a guarantee.

**Why this one, in the order the reasons mattered:**

1. **It is a statement of format, not of subject.** Depth-first search goes all the way down one
   branch before it considers the next. That is exactly the channel: few videos, long, one subject
   exhausted properly. The name promises the thing that actually differentiates us from the lane.
2. **It is dev vocabulary with no civilian reading** — a deliberate choice (see §12). No non-engineer
   says "depth first"; every engineer has implemented it. This gates the name to register 1.
3. **Lane-agnostic.** Breakthroughs, failures, architecture, languages all sit under it. The rejected
   alternates each boxed us in: The Stack Trace and Blast Radius read incident-only; Root Cause,
   Postmortem and Git Blame the same.
4. **Positive, not failure-coded.** Most available software names in this space are about things
   breaking. This one is about how we look at things.
5. **Wordmark:** DEPTH / FIRST = **5 over 5**, the only candidate that stacks a perfect square block
   in Archivo Black — see §2. This is a real asset at 48px.

**Rejected, with the reason each died** (naming research 2026-08-19/20; handle availability checked
live against the YouTube Data API, read-only, ~74 quota units):

| Candidate | Why it died |
|:--|:--|
| **Load Bearing** (the previous §0 recommendation) | Contains no software signal — reads as construction, and `@loadbearing` is squatted anyway. Its "legible to non-engineers" case was its *weakness* once we decided to gate on developers. |
| Bare Metal | Same flaw milder — could read as machining or a band; collides with bare-metal-cloud-hosting SEO; `@baremetal` squatted |
| Source Code · Prior Art | Real active channels already own them (21.4k / 5.9k subs) |
| Code Story | `@codestory` free, but [codestory.co](https://www.codestory.co/) is a top-1% software podcast (798 eps) and `@codestories` is a live 2k-sub channel — collision in our exact medium *and* subject |
| Byzantine · Postmortem · Runtime | Live collisions (`@byzantinetv` 3.2k, `@postmortemtv` 2.2k) or no clean variant left |
| In Review | Reads as a product-review channel (the most saturated corner of tech YouTube); buried under "year in review" saturation; `@inreview` taken by an active 1k channel; IN/REVIEW = 2-over-6, the weakest lockup considered |
| Machine Code · Monolith · The Codebase | Clean and available — genuine runners-up. Machine Code (`@machinecode`, exact handle free) is the fallback if Depth First ever has to be abandoned. Both say *software* but say nothing about *format* or *story*, which is what Depth First adds. |
| Commit History | The closest call — the only name that said software *and* story. Lost on tense: it frames the channel as retrospective, and s001 (*The Physical Cost of AI*) is a present-tense explainer, not a history. |

**Now unblocked:** the wordmark, the channel art, and s001's thumbnail typography.

---

## 1. Identity

**What it is:** technical documentaries — breakthroughs, blunders, and the architecture underneath —
told so precisely that engineers respect them and so clearly that non-engineers finish them.

**The promise:** *the thing you depend on has a story, and it is more fragile and more human than you
think.*

**Who it is for, in order:**
1. Working developers and infrastructure people — the ones who'll pay attention to whether you got it right.
2. Technically curious non-practitioners — the growth audience. They must never need a prerequisite.
3. Recruiters of your credibility — sponsors, collaborators, employers.

**The two rules that define the channel:**

- **Technical subject, human stakes.** The subject can be as deep as you like; the *stakes* must be
  legible to anyone. A story about a race condition is a story about two things arriving in the wrong
  order — and about the people who found out at 3am.
- **Never explain by simplifying. Explain by re-framing.** Dumbing down loses register 1. A good
  physical analogy keeps both.

**Not this channel:** tutorials, "top 10", news reaction, hot takes, framework advocacy, anything
where the value expires.

---

## 2. Wordmark & Channel Art

- **Wordmark:** **DEPTH** over **FIRST**, set in the display face (§4), letter-spaced +2%, on
  near-black. The two words are 5 characters each — set them to equal optical width so the lockup
  reads as a solid square block. Never set it on one line except where a horizontal strip forces it.
- **The mark:** one structural rule in the brand accent, weight 3px at 1080p — a *vertical* line
  descending down the left edge of the stack, past the baseline of FIRST. It reads as the traversal:
  down before across. Nothing else. No icon, no gradient, no bevel.
  *(This replaces the horizontal underline specced under the old working name, whose rationale — "the
  load it carries" — died with it. The rule mark is the one design call made at name-lock; override
  it here if you want the underline back.)*
- **Avatar:** the DEPTH/FIRST square block, or the descending rule alone, on near-black. The 5-over-5
  stack is what makes this survive 48px — protect it.
- **Banner:** near-black ground, the wordmark left of centre, one line of positioning text below it
  in mono. No collage of video thumbnails.

**Rendered assets — ✅ shipped 2026-09-02.**

| File | Use |
|:--|:--|
| `assets/brand/depthfirst_mark_2048.png` | Canonical mark. Exact tokens, no watermark, no shadow |
| `assets/brand/depthfirst_mark_512.png` | Upload size — the Instagram / YouTube avatar |
| `assets/brand/depthfirst_mark_src_gemini_2048.png` | Generated source, kept for provenance only — **do not ship** |

The mark was **generated (Gemini), then repaired deterministically.** What generation got right was
the hard part: the 5-over-5 block lands dead-centre (1023, 1024 on a 2048 canvas) and DEPTH / FIRST
come out at exactly equal optical width (944 px each) — the one rule in this section most likely to
fail. What it got wrong was every colour — `#0F141A` ground, `#FCFAFB` bone (pure white, which §3
explicitly forbids), `#FDA51D` amber — plus a drop shadow of 22,396 sub-ground pixels that no bullet
above permits. Because the amber rule and the letters never touch (rule ends x531, letters start
x612) the two were separated spatially and each rebuilt against exact tokens, with sub-ground pixels
clamped to ground to erase the shadow. Lockup half-diagonal is 673 px against an inscribed-circle
radius of 1024, so it survives Instagram's circle crop untouched; verified legible at 48 px.

> **Lesson: a wordmark is typography, not an image.** Generation is usable for the lockup's
> *geometry*, but its output is never token-exact — repair it in code before it ships. Judging the
> file by eye would have passed all five defects; measuring caught them and also overturned two
> things eyeballing got *wrong* (the mark looked off-centre and looked unequal — it was neither).

---

## 3. Color System

Deliberately opposite to The Engineering Atlas. EA is warm parchment and daylight; this is **dark,
schematic, high-contrast** — software's native environment, disciplined like a drafting table rather
than glossy like a render.

**Base palette (every video):**

| Role | Color | Hex | Notes |
|:--|:--|:--|:--|
| Ground | Ink black | `#040E1F` | Slightly blue-black, never pure `#000` — pure black crushes on OLED and kills depth |
| Surface / panel | Slate | `#0E213E` | Cards, code panels, callout bars |
| Primary text | Bone | `#E8E6E1` | Warm off-white, never pure white |
| Secondary text / labels | Ash | `#81A2C4` | Annotations, axis labels, timestamps |
| Rule / grid / schematic line | Graphite | `#274064` | Diagram lines, dividers, grid |
| **Brand anchor** | Signal amber | `#FFB020` | The wordmark, the underline, the single most important number in any frame |

**Per-domain accent** — one per video, chosen by subject. (Structurally the same idea as EA's
per-civilization accent, so the studio chain treats it identically.)

| Domain | Accent | Hex |
|:--|:--|:--|
| Infrastructure / networking | Electric cyan | `#00D6F7` |
| Security / cryptography | Acid green | `#3DDF7D` |
| Data / databases | Violet | `#AD88FF` |
| AI / compute | Signal amber | `#FFB020` |
| **Failure / incident** | Alert red | `#FF4D4D` |
| Languages / tooling | Sky | `#51A4FF` |

**Rules.**
- **Amber is reserved.** It is the brand anchor and the "this is the number that matters" color. If
  everything is amber, nothing is. **Maximum one amber element per frame.**
- Alert red is *only* for the failure lane and only on the beat where something breaks. Using it
  decoratively destroys its meaning.
- The domain accent carries callouts, key strokes in diagrams, and the thumbnail hero word. Everything
  else stays base.
- **Never put a saturated accent on more than ~10% of the frame.** Contrast is the asset.
  **Long-form only — see §3a.** On short-form this rule is actively wrong.

---

## 3a. Short-form colour — revised 2026-09-03

Measured on the posted reels: **~90% of every frame was effectively greyscale** (OKLCH chroma < 0.04)
and **under 2% was vivid**. The palette contained saturated colour; almost none of it reached the
screen. Feedback was blunt and correct — *"they look pale with background as well."*

Three causes, in order of how much each contributed:

1. **83% of the safe band was bare ground, and 40% of its rows were completely empty.** This was the
   real driver. No palette can rescue a frame that is mostly nothing.
2. **Three of the five base tokens were true greys** — ash `C=0.030`, graphite `C=0.028`, slate
   `C=0.023`. Ash carries every label and sub-line. Grey text on near-black *is* the pale look.
3. **§3's ≤10% saturation rule enforced it.** That rule is right for a 12-minute documentary, where
   restraint reads as sophistication. On a phone, mid-scroll, it reads as dead.

**The fixes, all shipped:**

- **Neutrals now carry chroma at the same lightness** — the table in §3 is the revised palette. The
  frame gains colour without a single element being added.
- **The ground is no longer a flat fill.** `ReelGround` in `remotion/src/reels/lib/chrome.tsx` draws
  the drafting table §3 already described in prose: a faint 90px measured grid in `mesh #0D1F3C`,
  radially masked so it is densest behind the content and gone by the frame edge, over a wide accent
  glow at 11% opacity. The accent is the reel's `DOMAIN_ACCENT`, so **the ground is tinted by
  subject**. Every reel uses this instead of `backgroundColor`.
- **Data fills stop being timid.** r002's distance heat map was capped at `0.30` alpha, which is why
  the one genuinely colourful element still measured at 1.5% vivid. Now `0.62`.

**Result on the same frame: greyscale share 92% → 12%, mean lightness 0.21 → 0.25.**

**§3a supersedes §3's ≤10% rule for short-form.** The amber rule does *not* change — amber is still
the brand anchor, still **one element per frame**. Saturation is now allowed to cover the ground;
amber remains the thing that means *this is the number that matters*.

> **Colour must encode data, not decorate.** The ramps here are computed `rgb()` from real values —
> frequency band in r001, distance in r002 — which is also why `brand:check` accepts them without
> the hexes being added to the palette. Before adding any colour, answer: *what does this encode?*

---

## 4. Typography

| Use | Font | Why |
|:--|:--|:--|
| **Wordmark, titles, thumbnail hero** | **Archivo Black** (fallback: Arial Black) | Dense, industrial, engineered — punches at 120px, which is the only test that matters. Distinct from EA's warm Fraunces serif |
| **On-screen labels, callouts, body** | **IBM Plex Sans** | Already bundled locally, reads "technical" without costume. Weights 400 / 600 only |
| **Numbers, code, data, timestamps, filenames** | **IBM Plex Mono** | Every figure, every identifier. Mono *is* the channel's signal of precision |

- Free; keep in `assets/fonts/` and load into Remotion via `staticFile()` + `@remotion/fonts`.
- **Numbers are always mono.** This is the single most identity-defining typographic rule here — a
  metric in a proportional face immediately looks like a generic explainer.
- **Carve-out: the thumbnail hero is always Archivo Black, even when it is a number.** The two rules
  above collide the moment a hero is a metric (s001's is `835 MW`). Display wins, and the reason is
  structural, not aesthetic: mono's uniform advance width forces wide sidebearings, so at 120px the
  lockup spreads wider at lower stroke density and fragments into two words instead of one mark.
  Tested head-to-head on s001 (`projects/s001_ai_physical_cost/output/thumb_D_font_contact_sheet.png`,
  2026-08-20) — Archivo Black wins decisively at squint size. **In-frame** numbers stay mono; the
  thumbnail is packaging competing in a sidebar, not on-screen data.
- **On-screen text sits on a surface**, never raw on imagery: `#161B26` at 85% opacity, 8px radius,
  16px padding, 1px `#2A3240` border. Bone text. Accent on one word maximum.
- **Minimum on-screen size: 36px at 4K** (≈ 1.7% of frame height). Below that it is decoration, not
  information — cut it.

---

## 5. Motion Identity — the spec for `src/brand/tokens.ts`

> EA moves like *a surveyor* — slow, weighted, geological. **Depth First moves like a system
> executing**: precise, purposeful, arriving exactly on time and then completely still. Snappier than
> EA. Never bouncy. Stillness is the default state; motion is an event that means something.

**Frame spec (every scene):** `3840×2160 @ 30fps` · rendered with **1s handles** both ends · target
`clips/scene_NN.mp4` (contract unchanged from the AE pipeline — Premiere conform stays trim-only).

### Easing — the two curves, and only two

```ts
export const EASE = {
  //          cubic-bezier          use
  standard: [0.4, 0.0, 0.2, 1.0],   // everything that enters, moves, or settles
  exit:     [0.4, 0.0, 1.0, 1.0],   // everything that leaves (accelerates away, no deceleration)
} as const;
```

**Springs are banned** except one sanctioned case: a diagram node landing into a locked position, and
only with `damping ≥ 200` (i.e. no visible overshoot). If a viewer can perceive the bounce, it's wrong.
Nothing in this brand wobbles.

### Camera (over a still plate)

| Move | Spec | Budget |
|:--|:--|:--|
| Push-in (default) | **3–5%** scale over the scene | Default; one move per scene, full duration |
| Pull-back (reveal) | **6–9%** | **2–3 per video max** — this is the scale-payoff move |
| Pan | **40–70 px/s** at 4K | Wide compositions only; direction persists across adjacent scenes |
| Static hold | 0% | **Mandatory on the hardest technical beat of every video.** When the idea is heavy, the frame stops moving |

Every camera move starts and ends at rest, with a **0.5s hold** at both ends inside the handles.

### Elements

| Class | Spec |
|:--|:--|
| Diagram build-on | Each element **250ms** in, **80ms** stagger between siblings, `EASE.standard` |
| Connecting line / flow | Draw-on **400–700ms**; a flowing packet/pulse travels **200–400 px/s** |
| Data counter | Counts up over **600–900ms**, `EASE.standard`, lands and **stops** — never idles or loops |
| Highlight / focus pull | Non-focus elements drop to **35% opacity** over 250ms; focus element unchanged (never scale-up to emphasise) |
| Ambient drift (smoke, heat, field) | **3–10 px/s**, ≤1.5° rotation, de-synced loop phases |
| Moving-element budget | **≤2** moving elements per scene, camera excluded |

### Text

- **In:** 250ms fade + **12px rise**. **Out:** 150ms fade, no movement.
- Emphasis is **color** (§3) or **weight**, never motion, never scale.
- On screen **≥2.5s**; clears **≥0.5s before the cut**.
- Forbidden: typewriter, per-word cascade, bounce, blur-in, counter-rotation, any preset that performs.

### Transitions

- **Cut** ≥90%. **Dip-to-black 300ms** = a chapter boundary only (≤4 per video). **Match-cut** =
  concept link, 2–3 per video.
- Forbidden: whips, glitches, zoom-blurs, page turns, light leaks, anything that says "template."

### The physics of the brand

1. Nothing overshoots. Nothing wobbles. Nothing idles.
2. Motion is **information** — if a move doesn't tell the viewer something, delete it.
3. **Stillness is a tool.** The most important frame in every video should be completely static.

---

## 6. Narration — "The Insider and the Translator"

The central tension of this genre: technical enough that engineers respect it, human enough that
everyone else finishes it. Two registers, braided.

**1. The Insider (authority — your differentiation).**
First-person practitioner. This is the register CodeSource structurally cannot do, and it's the
entire reason you have a right to this channel. It sounds like someone who has *been there*:
> *"If you've ever watched a migration run past its window with the rollback already failing, you
> know exactly what the next four hours looked like for them."*

Use it for judgement calls, for what the docs don't say, for why a decision that looks obviously
wrong was reasonable at the time.

**2. The Translator (access — your growth audience).**
Re-frames a mechanism in physical terms without losing precision. Never *"basically it's just…"* —
that signals you're about to lose the engineers. Instead, give the analogy and then immediately
give the real thing back:
> *"Every request waits in one line for one clerk. That clerk is a single thread — and the moment
> the clerk pauses to check something on disk, the entire line stops."*

**Wit:** one dry beat every 60–90s, in *phrasing*, never gags, memes, or snark at people. Failure
stories especially: the engineers in them were smart people having a bad day. Contempt is off-brand
and it reads as cheap.

**Guardrails (non-negotiable — same discipline as EA):**
1. **Never invent internal dialogue or motive.** For failures, this crosses into defamation risk fast.
   Say "the postmortem records that…", not "he panicked."
2. **Name the uncertainty.** *"The public postmortem doesn't say why."* Admitting the gap builds more
   authority than filling it.
3. **The explanation is always delivered straight.** No jokes inside a mechanism.
4. **Cite in-video for contested numbers**, and always in the description.

**Delivery spec.** Your own voice, recorded. **145–155 wpm** (slightly faster than EA — the subject
is contemporary, not geological). Let numbers breathe. Tone: *"here's what actually happened,"* never
*"let me teach you."*

**Sign-off — pick one and never change it:**
> **"Everything's holding something up. See you in the next one."** ⭐

---

## 7. Structure Template (~12–15 min)

Runtime target is **12–15 min**, not 10–13 — the comp data is unambiguous: CodeSource's 12–20 min
bucket medians **82,197** views against **48,213** for 8–12 min.

| Beat | ~Time | What | Register |
|:--|:--|:--|:--|
| **Cold open** | 0:00–0:45 | A specific moment, dated and located. *"Moscow. December 12, 2019."* No channel branding, no "hey guys." Ends on the question the video answers | Insider |
| **Title card** | 0:45–0:50 | Wordmark + topic. 2–3s. One audio motif | — |
| **The stakes** | 0:50–2:30 | Why this thing matters / how much rests on it. The load it bears | Translator |
| **Sponsor** | 2:30–3:15 | **After the hook has closed, never before.** Empirically where CodeSource places it across 63 sponsored videos | — |
| **The mechanism** | 3:15–8:00 | How it actually works. Diagrams, the clever bit, the constraint | Both |
| **The turn** | 8:00–11:00 | The breakthrough, or the failure and its blast radius | Insider |
| **What most people miss** | 11:00–13:00 | **Your** read. The judgement only a practitioner offers. This beat is the channel's moat | Insider |
| **Callback + close** | 13:00–14:00 | Resolve the cold open. Sign-off | Translator → sign-off |

- **Scene budget:** 60–80 scenes of **8–12s**, cut against pre-recorded VO.
- **Retention rule:** no visual configuration unchanged >8s.
- **One subscribe ask**, woven in ~60–70%. Never a hard beg.

---

## 8. Thumbnail Conventions

**The finding that governs this section:** across CodeSource's catalog, **the title and the thumbnail
make different promises.** Title = stable, searchable, evergreen. Thumbnail = the conflict hook.
Their titles all read "The Untold Story of X" while the thumbnails read "WRITE ONCE, SUE FOREVER."
The thumbnail is not a restatement of the title — it's the second, sharper promise.

- **Layout is fixed: hero type LEFT, subject RIGHT.** Pick it once, never flip (already provisional in
  `projects/s001_ai_physical_cost/thumbnail.md`).
- **≤4 words**, Archivo Black, bone or accent. Must survive the **120px squint test** — the only gate.
- **One dominant object**, 55–65% of frame. Dark ground, single light source, hard falloff.
- **One number, in mono, if the story has one.** The number does what the image can't.
- **A recurring visual anchor.** CodeSource's red/blue desk figure carried two years of thumbnails at
  near-zero cost. Decide yours during the first three videos and then keep it — this is the cheapest
  channel-recognition lever that exists.
- **Never** put a sponsor's product or logo in a thumbnail. Their one attempt (DeepAgent) was their
  second-worst video of 64.

Log every thumbnail to `assets/thumbnails_log.md` so CTR learning compounds.

---

## 9. Audio

- **Music:** sparse, tonal, low. **8%** under narration. Keep **3–4 recurring tracks** so the channel
  has a sonic signature.
- **One title motif**, 2–3s, on every video, unchanged.
- **Silence is a tool.** The beat where the thing breaks should have no music at all.
- **No sound effects on text.** Whooshes are the fastest way to look like a template.

---

## 10. Metadata

- **Projects:** `projects/sNNN_topic/` (the `s` prefix keeps these out of EA's `NNN` globs).
- **Title:** evergreen and searchable — the subject's proper noun must appear. Save the conflict for
  the thumbnail.
- **Description:** 2–3 sentence hook → chapters → **sources** → subscribe → socials. Always cite; in
  this genre sources *are* the authority.
- **"Altered content" disclosure ticked on every upload** (AI-assisted visuals). Non-negotiable —
  monetization depends on it.
- **Cadence:** 2/month. Sustainable beats fast; the comp set proves the plateau isn't fatal but a
  gap is.

---

## 11. Where each section lives in code

The point of writing this before scene one — every rule below has exactly one home, so it is enforced
rather than remembered.

| Guide section | Lives in |
|:--|:--|
| §3 Color · §4 Type · §5 Motion | `remotion/src/brand/tokens.ts` — `BASE`, `DOMAIN_ACCENT`, `FONT`, `TYPE_SCALE`, `EASE`, `CAMERA`, `TIMING` |
| §4 Font loading | `remotion/src/brand/fonts.ts` (`@remotion/google-fonts`) |
| §5 Frame spec | `<Composition width={3840} height={2160} fps={30}>`, `HANDLE_FRAMES = 30` |
| §5 Camera | `families/PlatePush.tsx`, `push` typed as `PushPercent` (a closed union, not `number`) |
| **Enforcement** | `remotion/scripts/check-brand.mjs` → `npm run brand:check`, wired into `npm run lint` |
| §7 Structure | `storyboard.json` scene skeletons (script-analyzer, pass 1) — *archived* |
| §8 Thumbnails | `generate_thumbnail.py` + `add_thumbnail_text.py` → `assets/thumbnails_log.md` — *archived* |

> [!IMPORTANT]
> **Corrected 2026-08-17 after building it — tokens are the spec and the validator, NOT runtime
> imports.** Remotion Studio only makes a style canvas-interactive (click-select, drag, editable
> keyframes, edits written back to code) when **every value in `style` is an inline literal**.
> `color: BASE.amber` greys the control out and silently costs the exact capability the pipeline was
> chosen for. So scene and family files **hardcode** brand literals, and `brand:check` scans them
> against `tokens.ts` and fails the build on drift.
>
> Enforcement therefore happens at **lint time, not import time** — which is strictly better: a lint
> catches drift that has already been written, while an import only prevents it by destroying
> interactivity. Verified catching all of: off-brand hex, non-brand easing curve, spring under
> damping 200, sub-36px type, and CSS `transition` (which never renders).

**Two tiers of tunability**, and the split is deliberate:

| Tier | What | How the user edits it |
|:--|:--|:--|
| **Canvas-interactive** | The 5–10 hero scenes per video. Written standalone, all literals, wrapped in `Interactive.Div` with `name` props | Click, drag, keyframe directly in Studio; edits write back to the file. Reference: `src/scenes/TitleCard.tsx` |
| **Props-editor tunable** | The other 50–70 mechanical scenes. Built from families taking props | Props panel writes back to code when `defaultProps` is an inline object literal on `<Composition>` |

**Clamp at the type level wherever possible.** `push: number` invites 40%; `PushPercent` is a closed
union of `0 | 3 | 4 | 5 | 6 | 7 | 8 | 9`. That is the difference between a brand guide and a brand.

---

## 12. The one-sentence test

Before publishing: *"Would an engineer who works on this exact system watch it without wincing — and
would their non-technical partner watch it to the end?"*

Both, or it isn't ready.

**Scope — amended at name-lock (2026-08-20).** This test governs **the video**: the script, the
narration, the visuals, the explanations. It does **not** govern **the channel name**. The name is
deliberately gated to register 1 — no non-engineer says "depth first" — and that was chosen on
evidence, not by accident:

- Every successful channel in `data/comp_channels_software.yaml` that isn't a person-brand or a
  coined word uses **CS jargon as its brand**: Reducible, Spanning Tree, Low Level. Not one of them
  uses a legible English metaphor. The metaphor names were ours, not the lane's.
- A name's job is to make the right viewer feel *found*. A video's job is to lose nobody. Those are
  different jobs and they take different rules.

So: the name may be opaque to a non-engineer. **The video may not be.** §1's audience order still
stands — register 2 is the growth audience and must never need a prerequisite *inside the video*.

The honest cost of this: the name does no recruiting work with register 2. Titles and thumbnails now
carry 100% of that load, which raises the bar on packaging rather than lowering it.

---

*Companions: `docs/comps/comp_deep_dive_codesource.md` (the evidence behind §7 runtime and §8) ·
`brand_guide.md` (The Engineering Atlas — the sister channel, deliberately different) ·
`docs/cinematography.md` (craft canon behind §5) · the `studio-director` chain for per-video execution.
**All three retired 2026-09-10 and preserved on `yt-longform-archive-DO_NOT_DELETE`.** For short-form, §13 below and
`CLAUDE.md` are the live authorities.*

---

## 13. Instagram — `@thedepthfirst` (live 2026-09-02)

The short-form arm. Same name, same handle, same mark as YouTube — deliberately. Two names would be
two brands with zero compounding, and would recreate exactly the dead funnel diagnosed in
`docs/comps/comp_deep_dive_equationverse.md` §5.

| Field | Value |
|:--|:--|
| Handle | `@thedepthfirst` |
| Name (30 char, indexed separately from the handle) | `Depth First · how systems work` — **widened 2026-09-10**, exactly 30 chars; was `Depth First · how code works` |
| Avatar | `assets/brand/depthfirst_mark_512.png` |
| Bio | The mechanisms hiding in things you already use. Every animation here is the real thing, actually run — not drawn. |

> **Both fields were widened on 2026-09-10 and are NOT yet changed in the app** — that is a
> manual edit only the account holder can make. `CLAUDE.md` widened the promise from software to
> *how systems work* that morning, and the profile is what a viewer reads at the follow decision,
> so a tides reel under a bio that says "algorithms" costs a follow. "The real **thing**, actually
> run" keeps the moat sentence true now that the subject is not always an algorithm.

**Why the Name field carries a plain-English descriptor.** §0 and §12 gate the *name* to engineers
and accept that it does no recruiting work with register 2. Instagram hands that cost back for free —
the Name field is indexed separately from the handle, so a dev-gated handle and a legible descriptor
coexist. This is the one place the §12 trade-off gets partially bought back.

**Why dev-gating costs less here than on YouTube.** Reels autoplay in-feed; the account name is a
12 px line above a video that is already running. Nobody reads the name and *then* decides to watch —
the name is read at the **follow** decision, by which point the content has already explained itself.

**The bio line is the moat.** "The real algorithm, actually run — not drawn" is true of these reels
and false of essentially every competitor in the lane. Nobody copies it without rebuilding their
pipeline. Keep it.

**The grid is an asset.** The content rule (open on a civilian object, never a developer noun) makes
the profile grid a wall of *objects*, where every competing dev account shows code screenshots.
Protect this deliberately when choosing cover frames.

### Safe area — the reel canvas is 1080×1270, not 1080×1920

Instagram paints its own chrome over the video and anything underneath is simply not read: the status
bar and Reels header across the top, the caption / username / audio strip across the bottom, and the
like-comment-share rail down the right.

| Zone | Extent | Verdict |
|:--|:--|:--|
| Top | `y < 270` | Covered — never place content |
| Bottom | `y > 1540` | Covered — never place content |
| Right rail | `x > 870`, roughly `y` 1050–1540 | Avoid for **wide graphics**; short centred text is fine |
| **Usable band** | **`y` 270 → 1540, `x` 60 → 870** | Compose here |

Codified in `remotion/src/reels/lib/chrome.tsx` as `SAFE`, `SAFE_TOP`, `SAFE_BOTTOM`, `SAFE_H`,
`SAFE_W`, `SAFE_CX`. The shared chrome components (`ReelHeader`, `StepLabel`, `Readout`, `Progress`)
are positioned against the top and bottom bands, so no reel built on the shared lib can repeat r001's
title-in-the-status-bar bug.

**The shared lib is NOT safe by construction against the right rail — r005 found this (2026-09-08).**
`Readout` defaults to `CONTENT_W` (960), which runs to `x=1020`, and its default `top` is 1240 — so
its right-aligned value column sits squarely inside the action rail (`x > 870`, `y` 1050–1540). Every
reel r002–I51 has shipped this way; it was survivable there because the readouts were corroborating
detail. r005 resolves to three right-aligned kilometre figures, so the rail was eating the payoff.
`Readout` now takes an optional `width`; the default is unchanged, and **any reel whose right-hand
column is the thing the viewer must read passes `SAFE_W`.** The `*-safe` scrub is what caught it,
which is the argument for the scrub being mandatory rather than a formality.

**How this was found — r001 shipped broken.** It was authored against the raw canvas, putting its
title at `y=120`, wholly inside Instagram's top bar; the progress bar at `y=1790` was likewise lost
in the caption strip. Confirmed in the app 2026-09-02, after posting. `Shazam.tsx` predates the
shared chrome and carries its own copies, so it is unaffected by the fix and was deliberately left
alone — the reel is live and approved.

**Verify before posting, every time.** Root.tsx carries a `*-safe` composition per reel that renders
the reel under `<SafeZones />` — red for the covered bands, amber for the action rail. Scrub it in
Studio. A reel whose title, final number, or answer touches red does not get posted.

**The right-rail number is deliberately conservative.** 210px assumes the widest plausible button
column; the icons themselves occupy nearer 140px. Hold wide graphics (tables, grids, charts) to
`x < 870`; centred prose at the full 960 width is acceptable and looks better centred on the frame.

### The hook — measured, not assumed (added 2026-09-03)

First Instagram retention data, r001 and r002, a few hours after posting:

| | r001 Shazam | r002 Autocorrect |
|:--|--:|--:|
| Skip rate | 34.1% | **59.4%** |
| Half the audience gone by | ~3 s | **~1.5 s** |
| Avg watch | 12 s of 40 s | — |

**Both curves fall off a cliff and then flatten.** The plateau is the finding: viewers who survive
the opening mostly stay to the end, so the body — pacing, density, explanation — is working, and the
opening is the only thing costing reach.

Two diagnosable differences explain why r002 is twice as bad:

1. **The title.** "How Shazam names a song in 3 seconds" names a product everyone knows and makes a
   specific numeric claim. "How your phone knows what you meant" names nothing.
2. **The opening image.** r001 opens on a moving spectrogram; r002 opens on a word being typed on a
   near-empty frame — functionally a title card for two seconds.

**Rules, from that evidence:**

- **Show before you tell.** The payoff visual starts moving by ~0.5 s; the first surprising result
  lands by ~3 s. No step label in the opening beat.
- **The title rides over the action**, never before it.
- **Name a recognisable object** in the title. r003 was re-cut from "How much of *this* can you
  destroy?" to "How much of *a QR code* can you destroy?" for exactly this reason.
- **Watch share rate, not like rate.** Both reels read 0.0% shares in the first hours, and shares
  drive Reels distribution more than any other signal. Like-rate differences at this sample size are
  one or two taps — noise. *(Superseded in part: r001 finished at 0.5% shares once the data matured
  — see the next section. The rule stands; the "0.0%" reading was a rounding artefact of a tiny
  sample, not a result.)*

r003 was re-cut on this basis: 45 s → 35 s, destruction begins at 0.3 s, verdict at 2.5 s (was
10.6 s), and it closes on the live scannable code as a call to action, since follows were 0.

### r001 at 3 days — the matured numbers (added 2026-09-05)

Read from Reel insights on 2026-09-05, three days after posting. **Every rate below has the same
base: the 1,286 unique viewers**, not the 1,656 views — 24/1286 = 1.9%, 6/1286 = 0.5%. Do not
compare these against a per-view figure from anywhere else.

| | r001, 3 days |
|:--|--:|
| Views / viewers | 1,656 / 1,286 |
| Avg watch | **15 s of 40 s** (37.5%) — was 12 s at a few hours |
| Skip rate | **37.9%** — was 34.1% at a few hours |
| Likes | 24 (1.9%) |
| Shares | 6 (0.5%) |
| Saves | 6 (0.5%) |
| Comments / reposts | 0 / 0 |
| Follows | **1** (0.08% of viewers) |
| Sources | Reels tab 89.7% · Explore 9.8% · Feed 0.2% |

**Three findings.**

1. **The distribution was entirely cold.** 99.5% of views came from Reels tab + Explore; 0.2% from
   feed. Nothing here was carried by an existing audience — the ranking system pushed it to
   strangers on its own. Every number above is therefore a cold-audience number, which is the only
   kind that predicts anything.
2. **The plateau survived contact with a larger audience.** The curve still falls to ~55% by ~3 s
   and then declines slowly to ~18% at 40 s with no second cliff, and avg watch *rose* 12 s → 15 s
   as the sample grew. The body holds up at scale; the opening is still the only thing costing
   reach. Skip rate drifting 34.1% → 37.9% is the audience getting colder, not the reel getting
   worse.
3. **Follows are the failure, and they are an end-frame failure.** Roughly 18% of viewers — ~230
   people — watched to the last frame, and one followed. The reel earns attention and then asks for
   nothing. Sends ÷ likes is 25% (6/24), between `equation.verse`'s spectacle post (12%) and its
   utility post (51%) in `insta_strategy.md` §2 — so the "forward this to someone" instinct is
   real and the account still converts almost none of it.

**Rule, from finding 3: every reel ends on a reason to follow.** Not a subscribe plate — a line
that names what the *next* one will do, over the finished visual, held for the full end-of-beat 3 s.
The end frame is currently the most-watched piece of dead space in the format.

### r003's first day — the hook re-cut did not move the opening (added 2026-09-05)

Posted 2026-09-05, read at ~18 h. **Base for every r003 rate below: its 324 viewers.** The r001
column is at **3 days and 1,286 viewers** — a different age and a different base, so the view counts
are NOT comparable and only the curve shape and the per-viewer fractions are read across the two.

| | r003 QR, ~18 h | r001 Shazam, 3 days |
|:--|--:|--:|
| Views / viewers | 390 / 324 | 1,656 / 1,286 |
| Avg watch | 9 s of 37 s (24%) | 15 s of 40 s (38%) |
| Half the audience gone by | **~2 s** | ~3 s |
| Still watching at the last frame | **~10%** | ~18% |
| Likes | 3 (0.9%) | 24 (1.9%) |
| Shares / saves | 0 / 1 | 6 / 6 |
| Follows | **0** | 1 |
| Sources | Reels tab 86.6% · Explore 9.5% · Feed 1.3% | Reels tab 89.7% · Explore 9.8% · Feed 0.2% |

**The finding runs against the theory that produced it.** r003 is the reel built to fix the opening:
destruction starts at 0.3 s, the verdict lands at 2.5 s, the title rides over the action, no step
label in the hook. It lost half its audience *earlier* than r001 and held a thinner tail.
**Hook-first timing on its own did not buy retention.** The rule is not refuted — r002, which broke
it hardest, is still the worst of the three — but it is plainly not sufficient, and §13 previously
read as though it were.

**What is not readable at 18 h.** r001 showed 0.0% shares and 12 s avg watch in its first hours and
finished at 0.5% and 15 s, so r003's 0 shares and 9 s are early numbers, not final ones. And 3 likes
against 24 is 3 taps against 24 — this section's own rule puts like-rate differences at that sample
size in the noise. Two readings are robust: the retention **shape**, and the reach curve, which had
already flattened by 18 h while r001's was still climbing at 3 days.

**Three hypotheses, in the order worth testing.** None of these is established; each needs a reel
that could falsify it.

1. **A QR code is visual noise at 0.5 s.** "Show before you tell" was satisfied on the clock but
   perhaps not in legibility. A spectrogram reads as a picture at thumbnail size; a QR matrix reads
   as static. The rule may need to be *show something legible*, not merely show something moving.
2. **The title dropped the number.** "How Shazam names a song in 3 seconds" names an object AND makes
   a specific numeric claim. "How much of a QR code can you destroy?" names the object and asks a
   question whose answer the viewer cannot guess, so there is nothing to be curious about verifying.
3. **The call to action was impossible to perform.** The reel closes on "Point your camera at it"
   over a code displayed on the only screen most viewers have. You cannot scan a QR code with the
   phone showing it. Follows: 0. Whatever else is true here, the ask could not be completed.

Hypothesis 3 is the one already fixed — the end beat added to `Qr.tsx` on 2026-09-05 closes on a line
naming the next reel, which needs no second device. **That beat is not in the posted cut**; r003 went
out before it landed. It is a rule for r004 on, not something this reel can be measured against.

### r004 — legibility fixed the opening, and moved the problem (added 2026-09-07)

r004 was built as a test of one r003 hypothesis: that a QR matrix reads as *static* at 0.5s and a
face does not. **Base for every r004 rate: its 1,617 viewers.** r001 is at 3 days, r003 at ~18 h,
r004 at an age Instagram does not state on the card — so views are not compared across them, only
per-viewer fractions and curve shape.

| | r001 Shazam | r003 QR | r004 JPEG |
|:--|--:|--:|--:|
| Viewers | 1,286 | 324 | **1,617** |
| Skip rate | 37.9% | — | **34.8%** *(Instagram: "Lower")* |
| Avg watch | 15 s of 40 s (37.5%) | 9 s of 37 s (24.3%) | 11 s of 40 s (27.5%) |
| Views ÷ viewers | 1.29 | 1.20 | **1.12** |
| Still watching at the last frame | ~18% | ~10% | ~10% |
| Likes | 24 (1.87%) | 3 (0.93%) | 17 (1.05%) |
| Shares / saves | 6 / 6 | 0 / 1 | 1 / 5 |
| Follows | 1 | 0 | **0** |
| Sources | Reels tab 89.7% · Explore 9.8% | 86.6% · 9.5% | 82.7% · **16.0%** |

**The hypothesis holds, at the top of the funnel.** r004 reached 1,617 viewers against r003's 324,
and its skip rate is the lowest of the three — Instagram flags it "Lower" than the account's own
typical, and flags like rate and share rate "Higher". A legible object in the first second buys
reach. **That is now measured, not assumed, and it is the one thing three reels have established.**

**And it moved the problem to the body.** Against r001, which is the same 40 s length: average watch
fell from 15 s to 11 s, the last-frame tail from ~18% to ~10%, and views per viewer from 1.29 to
1.12 — r001 was re-watched substantially more. The opening got better; the middle got worse.

**Do not read the 0 follows as the end beat failing.** About 161 people reached the last frame. At
r001's own follow rate (1 in 1,286 viewers) the *expected* yield from 161 people is **0.13 follows**.
Zero is what you would observe whether the beat works or not; distinguishing the two needs roughly
ten times that end-frame audience. The end beat is **untested**, not disproven — and the same
arithmetic says r001's single follow was never evidence either.

Read nothing into 1 share, either. The "Higher" flag on share rate is against a recent baseline that
includes r003's zero, which is a low bar rather than a result.

**Where the body loses them — the candidates, in the order worth testing:**

1. **The body is grey for 32 of its 40 seconds.** The same legibility argument that just won at 0.5s
   applies at 15 s: a grey plate is less arresting than a colour one, on a feed, at thumbnail size.
   r001's spectrogram was in colour and in constant motion.
2. **Five beats may be one too many.** The colour beat is a good beat and it pushed the reel to 40 s.
   Fewer ideas held longer is the untested direction; the pacing rule budgets ≈6.5 s per idea but
   says nothing about how many ideas a viewer will accept.
3. **Subject shape.** Shazam is something a person *does*, with a scene attached — a bar, a song you
   cannot name. A JPEG is something that happens to them. That difference is not fixable by craft and
   should be weighed when picking from the backlog.

### The stillness audit has a blind spot: event density (added 2026-09-07)

The 4fps mean-inter-frame-change test (non-negotiable 4) measures whether PIXELS move. It cannot
tell that apart from whether anything HAPPENS, and on r001–r004 the two never came apart because
those reels animated continuously anyway.

I51 pulled them apart. Its first cut passed the rule — no dead stretch over 0.75s, median 0.573 —
and the first person to watch it said *"not much happens, seems very static."* They were right. The
slow stage push satisfies the metric while the frame merely drifts.

**Second metric, measured the same way: event density — the share of 4fps samples with change ≥ 1.0.**

| | median | event density |
|:--|--:|--:|
| r004 JPEG | 0.861 | 42% |
| I51 first cut (passed the old rule, read as static) | 0.573 | **26%** |
| I51 rebuilt | 1.130 | **55%** |
| I51 v5 (landing-position map, the shipped cut) | 1.035 | **53%** |
| r005 great circle | 0.608 | **38%** |

**The fix is never a bigger push.** It is to stop pausing the thing the reel is about. I51's queue
now plays continuously from the first beat to the last frame instead of running three defined sweeps
and sitting still through every hold — a music player does not pause while you read a caption.

### A legible shape is not a recognisable object (added 2026-09-07)

The same viewing found I51's first cut *"not understandable by an average person"*, and that is the
r003 finding wearing a new costume. r003 failed because a QR matrix reads as static at 0.5s. I51's
first cut drew the playlist as 16 coloured bars — perfectly legible as SHAPES, and meaningless,
because nothing on screen said "music". No rows, no artist names, no player. The playlist had been
abstracted into a bar chart and the viewer was expected to make the leap back.

**Rule: the opening object must be recognisable as the thing it is, not merely visible.** r004 got
this right by accident — a photograph is unambiguously a photograph. A chart of an abstraction is
not the object, however cleanly it is drawn.

### A claim about a RELATION has to draw the relation (added 2026-09-07)

I51's second cut put a list on screen where "Artist A" appeared four times, and a caption reading
*"Never the same artist twice"* with a counter reading **0**. A viewer read that and concluded,
correctly, that the reel was lying.

It was. The claim was never that an artist appears once — it is about appearing **back to back** —
and nothing on screen carried that. The word "repeat" was doing the work of "adjacent", the counter
said "repeats so far", and a per-row tag marked members of a pair without showing they were a pair.
Every figure was right and the sentence was false.

**Two rules out of it.**

1. **Never name a relation the frame does not draw.** Adjacent songs are now one fused block with a
   bracket around the whole run and a single "back to back" label spanning it. Adjacency is a thing
   you see, not a property you are asked to infer from ordering.
2. **Say the relation in the words, every time.** "back to back", never "repeat"; "never twice in a
   row", never "never twice". The short version is the false one.

This is the same failure family as r003 (a QR matrix reads as static) and I51's first cut (a bar
chart is not a playlist): **the frame has to BE the thing, not stand for it.**

### Event density measures change, not information (added 2026-09-07)

The metric added two entries above has its own blind spot, and I51 found it the hard way. Told the
reel read as static, the fix applied was a LOOPING playhead — which drove event density from 26% to
68%, the highest of any reel, while adding no information at all. The viewer's verdict on that cut:
*"it doesn't talk about any algorithm or interesting knowledge, only fast repeated animations."*

**A loop is change. The metric cannot tell it from a result arriving.** So it is a floor, never a
target: use it to catch a frozen frame, and never to justify motion that repeats.

The rebuilt reel runs at **11% event density** and is far better, because what moves is a real
100,000-run trial converging once and never repeating. Both numbers are true and the lower one is
the better reel. The hard rule — no dead stretch over 1.5s — still binds, and it passes at 1.00s.

### The subject has to be a mechanism (added 2026-09-07)

r001 ran Shazam's fingerprinting. r003 ran Reed–Solomon. r004 ran the DCT. I51's first three cuts
ran `random.shuffle` and counted adjacent pairs — every figure correct, and no mechanism in it. A
statistics demo is not a `Depth First` reel, however cleanly it is animated.

**Test before building: what does the viewer now know how to do, or know is true, that they did not
before?** "Random clumps more than you think" is a fact about the world. "The shuffle everyone writes
first is measurably biased, and here is the counting argument" is a mechanism, and the second is what
the channel is for.

### Reading time — end-of-beat text needs >= 3s

A step label can be short; the **closing line of a beat carries the finding**, and it is usually two
lines including a figure. Measured on r003 before the fix, three of five were 2.0-2.7s, the shortest
being a two-line block with a mono number. Rule: **at least 3s of full opacity for any end-of-beat
text**, and remember `Fade` begins its fade-out 5 frames before its `to`, so subtract ~0.17s from the
nominal window when checking.

### Show the thing the payoff line refers to

r003 closed on "Three corners are not [optional]" while the code was faded out — the one moment the
corners most needed to be on screen. The code now stays visible to the last frame with its three
finder patterns ringed in the accent, and the answer text sits in the step-label and verdict slots
around it rather than over it. If a line names something, that something is on screen while it is
read.

### The payoff frame must not argue against its own caption (added 2026-09-07)

I51 was rebuilt five times. Four of those rebuilds were pacing, phrasing and motion work, and none
of them touched the actual fault, which was in the *demonstration* rather than the animation.

The v4 payoff frame was six bars — one per ordering of three cards — from a real trial, under a
caption reading "these are not equally likely". At n=3 the true spread is **1.25x**, so the six bars
are near-identical heights. The viewer sees six equal bars, reads "not equal", and believes their
eyes. Every figure on that frame was correct and the frame was still unpersuasive, because it asked
the viewer to accept text over a picture that contradicted it.

**Rule: the payoff frame must make the claim visible at a glance, or the claim needs a different
demonstration.** Not a bigger label, not a longer hold — a different measurement. If the effect you
are claiming is smaller than the viewer's own reading error on the graphic, the graphic is wrong for
the claim.

**The replacement measures the same bias in a form perception is good at.** Instead of comparing six
near-identical magnitudes, I51 v5 plots where each card *lands*: a 13x13 table, row = start
position, column = end position, over 400,000 shuffles. Fair is featureless; the naive shuffle grows
a bright staircase and a dark wedge. The task changes from magnitude comparison, which humans do
badly, to pattern detection, which they do better than any algorithm. Deviation from fair: **8.34%**
naive against **0.46%** for Fisher-Yates at the same sample size.

Three things that keep it honest, and are worth copying:

1. **Render the correct algorithm the same way, at the same sample size.** The Fisher-Yates map is
   the control: it establishes that "flat" is what this rendering produces when the algorithm is
   right, so the naive pattern cannot be an artefact of the colour ramp. `heatmap.py` asserts it
   (FY contrast < 1.10) and fails rather than emitting a flattering picture.
2. **One accent, one scale, both grids.** Different hues would let a viewer conclude the difference
   is the palette. The only thing that differs between the two panels is the data.
3. **The contrast curve is declared in a comment and applied identically to both.** A gamma of 1.9
   makes the measured pattern legible at phone size; it cannot invent one. State that in the code,
   because a colour ramp is the easiest place in a reel to lie by accident.

**And the counting argument survives as support, not as the payoff.** `27 ÷ 6 = 4.5` is still the
proof that the bias is inevitable rather than a sampling accident, but it now lands at beat 4, after
the viewer has already seen the pattern. A proof explains something you have been shown. It is a
poor thing to be shown first.

**Corollary on sample size:** at 60 runs *both* maps are ~36% deviated from fair. More data does not
kill bias, it kills noise — and the reel says exactly that rather than letting the early frames imply
the naive map is merely undersampled.

### `Fade` overwrites `transform` — breath passed through it is a silent no-op

The motion audit failed I51 on a 3.75s dead spell in the two text-only beats, and the first fix
(passing `useBreath()`'s transform into a `Fade`'s `style`) changed nothing at all: `Fade` sets its
own `translateY` for the rise and overwrites whatever `transform` it was handed. No error, no
warning, no visible effect — the audit was the only thing that caught it.

**Wrap breath in a plain div OUTSIDE `Fade`, never inside it.** That is what r001-r004 already do;
the idiom was there and this reel simply broke it. Do not "fix" `Fade` to compose transforms — it is
shared chrome under three posted reels, and the local wrapper is free.

More generally: **a motion fix that is not re-measured is not a fix.** The audit is now
`scripts/reel_motion_audit.py` rather than a shell pipeline re-derived per reel, so re-running it
costs one command.

### r005 — a moving marker is part of its line, not a second amber element (added 2026-09-08)

§3a holds amber to **one element per frame**, and r005's closing beat appeared to break it twice
over: the constant-bearing track is amber, and the marker racing along it is amber too. It is one
element. **A line and the marker travelling on it are a single amber object** — the marker is that
line's position, not a competing accent — and the rule counts objects a viewer would point at, not
SVG nodes. What the rule still forbids, and r005 obeys, is a second amber *thing*: the great-circle
arc, its own marker, and its distance label are all cyan, so the frame never asks which of two amber
items matters.

**The projection constraint that shaped the whole build.** A great circle projects to a straight line
in orthographic **only when the view centre lies on that great circle**. The reel's first beat has to
show the taut line as genuinely straight — that is the entire "pull a thread tight" claim — so the
globe is centred on a point of the flight path and rolls along it rather than sitting on a fixed
centre. The roll doubles as motion: it is what carries the opening beat's event density, which is why
the globe never stops turning.

**Two SVG traps in any globe↔flat morph**, both of which paint garbage rather than erroring:
splitting a coastline subpath at the Mercator seam (an x-jump > half the map width), and dropping the
runs behind the terminator mid-morph. Filling a ring that is cut at the terminator paints a chord
straight across the ocean, so the land fill is gated to the last 18% of the morph.

### r008 — the falsification test changed the design, not just the confidence (added 2026-09-10)

Stage 3 asks for an experiment that could falsify the on-screen claim. For a pendulum wave the
obvious expectation is that it passes: the lengths come from `T = 2π√(L/g)`, which is in every
textbook. Integrating the real equation `θ'' = −(g/L)·sin θ` instead said the row reforms **0.33 s
late**, and the payoff frame — fifteen weights in a straight line at exactly 30 s — would have been
a lie by a third of a second.

The reason is that a pendulum's period grows with amplitude, and the correction
`C = T_true/T_small` **depends on the release angle alone — never on the length**. Two consequences,
and the second one is the reel's actual constraint:

- Because `C` is common to all fifteen, solving each length against the *exact* period removes the
  error completely: reform at t = 30.000 s, worst bob **0.000000°** off. Lengths move from
  33.07–13.97 cm to **32.35–13.67 cm**.
- Because `C` depends on angle, the fifteen must be released from a common **angle**, not a common
  **displacement**. One straight lifting bar pulls every bob the same distance sideways, which is a
  much wider angle on a short string than a long one — `C` then spreads by **10368 ppm** and the
  line never comes back (48.5° of scatter at 30 s). Full table in
  `projects/r008_pendulum/gate0/GATE0.md` §6.

**The generalisable part: the approximation you are using is itself a claim, and it is the one
least likely to get tested** — because it arrived as a formula rather than as a sentence. The
falsification test is cheap precisely when you are confident, and that is when to run it.

It also killed a word. The middle of the reel *looks* chaotic, and "chaos" was in the draft
sentence. The phase is linear in the index `n`, so the row is always a sampled sinusoid — there is
no chaos in it at any instant, only spatial aliasing once the wavelength drops below two
pendulums. Peak measured raggedness is at t = 15 s — exactly τ/2, which is the perfectly *ordered*
antiphase comb. The shipped reel never characterises the middle at all: it lets the frame look
like a mess and does not claim the motion is disordered, because it isn't.

### r008 — Manim is a layer, not the animation (added 2026-09-10)

First reel with a Manim layer. The chain that works:

```
simulate.py → JSON  → scene_pendulum.py → transparent PNGs → <ManimLayer> in Remotion
```

**Manim renders the pendulums; it does not animate them.** Every angle is read frame-by-frame out
of the RK4 integration, so the method is unchanged — compute the animation, don't author it. Manim
is here for the drawing, not the motion. It is fast enough not to matter: ~50 fps, the full 34 s
run in ~21 s. Budget the disk, not the time: 1020 transparent 1350×2400 PNGs are **150 MB**, about
147 KB each, and that scales with how much ink is on the frame — the 60 s cut was a third of that
per frame with thinner strings and smaller bobs.

Four traps, all of which paint something plausible rather than erroring:

- **Manim does not hold `frame_height` at 8 on a tall canvas.** It holds `frame_width` at the 16:9
  default and grows `frame_height`, so hardcoded unit constants render the whole apparatus into a
  281×369 box inside a 1350×2400 frame. Write the layout in 1080×1920 reference pixels and convert
  with `u = config.frame_width / REF_W`.
- **Direction vectors must be unit vectors.** Building the rod direction through the px→unit
  converter multiplies by `u` a second time, giving every string zero length and parking fifteen
  bobs on the rail.
- **`scripts/manim_render.py` never cleared its work directory** (fixed). Manim appends into
  `media/images/` and never prunes, so a re-render producing *fewer* frames left the previous run's
  tail behind and the frame collector silently shipped a mix of two takes.
- **It also replaced the subprocess environment** with a bare `PATH` (fixed), so an env-parameterised
  scene silently ignored its parameters and rendered the full minute when asked for a 3-second probe.

Two things worth copying:

- **Render the layer at 1.25× the composition** (1350×2400) when a Remotion camera will push into
  it. A 1080-wide PNG upscaled 1.25× is visibly soft, and the cost is only disk.
- **Keep the camera in Remotion, not in the scene.** Retiming a push then costs a Remotion render
  rather than 37 s of Cairo — and the camera was retimed three times.

**Assert the safe area inside the scene, over every frame.** `scene_pendulum.py` checks all
fifteen bobs on all 1020 frames and prints the global extent. Sampling one frame is not enough: the
widest instant is not the one that happens to be on screen when you look at it.

### r008 — 99% event density is not a quality result (added 2026-09-10)

r008 measures **99% event density** — seven of its eight beats at 100%, the hook at 95% — median
change 3.36, no dead spell at all. Best on the account by a distance, and it means almost nothing
on its own.

**The shelved `I64` queue build held the previous record at 65% and the verdict on watching it
was "the output is not sound."** (That build was proposed as r007; the number went to `I58` tides,
which measures 47%. The queue render was renamed to
the deleted `I64` build's render on 2026-09-10 and its compositions to
`i64-queue` / `i64-queue-safe`, so a shelved build no longer holds a reel number.) The audit counts pixels changing; it cannot count
whether a stranger can name what is moving. The reason r008 scores where it does is not craft — it is that fifteen large bright bobs
are in motion for thirty-four consecutive seconds. Any reel about a physical system in continuous motion
will score like this, and the number should be read as "the metric is saturated and no longer
discriminating", not as a grade.

**So the number was spent rather than banked.** A filmstrip of the first render found three defects
the audit is structurally blind to:

| defect | fix |
|:--|:--|
| bobs swing across the bottom readout, making both numbers unreadable | gradient scrim under the readout, transparent → ink over 200 px, then solid ink to the bottom of the frame |
| counter reads "25 swings" while the text claims 26 | "**25 of 26** swings" — same truth, both payoff numbers on screen throughout |
| max camera scale 1.42 clipped bobs at the frame edge | scales pulled back to 1.22 max |

The last one *lowers* the audit score on purpose. With that much headroom, camera aggression is
worth trading for a row that stays inside the frame — and a per-beat re-measure confirmed no beat
was being carried by camera motion alone, which is the failure mode the camera rule invites.

**One more: `Fade`'s `to` prop begins its fade 5 frames early.** The closing payoff sentence was
dimming at exactly the instant the line reformed — the single frame the whole reel exists for. The
last beat now has no `to` at all and holds to the final frame.

### r008 — the cycle length was a legibility parameter, not a timing one (added 2026-09-10)

The 60 s cut passed every gate and every audit, and the first person to watch it returned four
notes. Three of them had one cause and one fix.

> *"First frame says 15 weights. are they all different?? we are not conveying a lot of info so
> does video have to be 1 min long. when the text comes longest ones swing 51 time a minute, it
> zooms on shorter string. should we also mention other variables like weight? first frame doesnt
> bring any question/hype that user would want to stick to end"*

**"Are they all different?" is a question about the picture, and the picture was answering "no".**
A 60 s cycle needs N = 51…65 swings, and consecutive integers that high are close together: the
strings run 33.63 cm to 20.70 cm, a **1.62x** spread. On a phone that is fifteen identical
strings. Re-solving at a 30 s cycle needs N = 26…40, and the same fifteen consecutive integers now
span **2.37x** — 32.35 cm to 13.67 cm, obviously different with no caption at all. **The parameter
that decided whether the reel's central visual claim was legible was the cycle length, which had
been chosen as a duration.** Worth checking on anything built from a harmonic series: the ratio of
the extremes is set by `N_max/N_min`, so lowering the fundamental is free contrast.

That one change also answered "does it have to be a minute" — the reel is now **34 s**, payoff at
30 s — and it answered *why* the minute felt empty: 60 s at ≈6.5 s a beat is nine beats, and the
cut only had eight things to say, so two of them were restatements.

**"It zooms on the shorter string" was a real bug and a cheap class of bug.** The camera keyframe
for "the longest one swings 51 times a minute" pushed to (762, 700) — the *short* end of the row.
Nothing catches this: the frame is well composed, inside the safe area, and moving. Only a viewer
reading the sentence and looking at the frame catches it. The fix is a check, not care:
`check_annotations.py` now asserts that **the bob the sentence names is on screen for the whole
beat that names it**, by number.

**"Should we mention weight" earned a beat.** It is the first question anyone asks about a
pendulum, and the answer is genuinely surprising: mass cancels out of `m·L·θ'' = −m·g·sin θ`, so
it is not in the design equation at all. The beat is a three-row table — `length / everything`,
`weight / nothing`, `how far you pull / +1.1%` — and the third row is the honest complication that
sets up the `C²` term the next beat prints. **A viewer question that the reel can answer truthfully
in three rows is a beat, not an objection.**

### r008 — clear the annotations before rendering, not after (added 2026-09-10)

"The video looks very blank" was the other verdict on the first cut, and the fix — length labels on
the ropes, a range callout, the design equation — meant putting text into a frame that fifteen
swinging bobs move through for the entire runtime. Rendering and eyeballing that is a 3-minute loop
per attempt, and the eye is bad at it.

So the geometry became a module and the placement became a question with an exact answer:

```
layout.py    apparatus geometry in 1080x1920 reference px — imported BY the Manim scene,
             so the scene and the annotations cannot disagree
camera.py    the keyframes + cam(t), to_screen(), clearance(box, t0, t1) — bisected
             cubic-bezier matching chrome.tsx exactly
check_annotations.py   every box in Pendulum.tsx, asserted clear of every string and bob
             over its whole beat, inside the safe area, and disjoint from the others
```

This works because `<ManimLayer>` stretches the 1350×2400 render across a 1080×1920 div: **inside
the camera div, one reference pixel is one composition pixel at any camera scale.** That is what
lets a plain HTML `<div>` sit on a string Manim drew.

What it caught, all before a single frame was rendered:

- **The clear region is a triangle, not a rectangle.** A single-box search found only 400×230 of
  usable space and the real profile is a per-y band: at y = 462 a block may run to x = 700, at
  y = 620 only to x = 560. Every block is sized against that profile.
- **A bob clipped at x = 1098** on a proposed camera keyframe, at one instant in the middle of a
  4-second beat.
- **Two annotations overlapping each other.** The apparatus check cannot see this, and the range
  callout as first written covered the n=8 length label by 86×27 px. A mutual-overlap pass over
  every pair that shares screen time is a separate check and now runs alongside.

**And the honest limit of the method: it checks the box you tell it about, not the box you drew.**
The variables table was cleared at 36 px and rendered at 40 px, because it reused the readout's
`<Row>` component and inherited its size — so the label ran into the value and the block stood
26 px taller than the box that had been verified. No analytic check catches that; a filmstrip did,
in five seconds. **Geometry checks and looking at the render are not substitutes for each other**,
and the component was given an explicit `size` prop so the next reuse states its size out loud.

### I15 — a good frame will smuggle a bad sentence through Gate 0 (added 2026-09-10)

I15 was built, rendered, audited at 55% event density, scrubbed clean, documented and committed —
and then failed on being watched: **"I didn't understand the point. We are comparing 2 algos?"**

It was. The question asked was *"how does a maps app find the route between two points"* and the
reel answered *"here are two algorithms and one is more efficient"*. Those are different questions,
and the second one is inside-baseball.

**Gate 0 did not catch it, and the reason is instructive.** The gate question was *"sound off, no
labels: does a stranger know that's a city and want to know why the blue spread everywhere and the
cyan didn't?"* — a question about the PICTURE, which was genuinely good and got a genuine yes. The
sentence was never tested. Read cold, it was: *"that one change is the difference between checking
17,000 junctions and checking 1,700."* Nobody says that at dinner. Compare r005's, which is the
whole reason that reel travelled: *"your flight path isn't curved, the map is bent."*

**The fix was a re-spine, not a rebuild — every frame was reusable.** The flood stopped being
"algorithm 1 of 2" and became the answer: *your phone doesn't aim at your destination, it spreads
out in every direction until it trips over it.* A\* dropped from co-equal beat to a four-second
twist ("the clever version does aim — and it still checks 1,700"). Same footage, same data, one
point, and a sentence a person could repeat.

**The rule: put the sentence in front of the human, not the frame.** The frame exists to prove the
sentence can be *shown*; it is not itself the thing being approved. A payoff frame good enough to
win the gate on its own is exactly the condition under which this failure happens.

### I15 — the beat carrying the argument is often the deadest one (added 2026-09-10)

I15's first cut measured **41%** event density overall, which passes. Per beat it did not:

| beat | density |
|:--|--:|
| Dijkstra floods the city | **91%** |
| **A\* aims at the goal** | **20%** |
| the twist | 29% |
| end card | 21% |

**The spectacle was fine and the argument was dead.** A\*'s whole point is that it looks at less
— 1,420 pixels against the flood's 14,018 — so the beat that carries the reel's actual claim is
*by construction* the one with the least on-screen change, for 6.2 seconds. This will happen to
any reel whose payoff is "and this one does less".

The fix was to draw the **frontier**: the ~150 junctions each search has just committed to, in
bone, moving ahead of the settled set. That band is not decoration — it *is* the search frontier,
the truest thing in the beat — and it turned 41% into **55%, the highest on the account**, past
I51 v5's 53%.

**The general rule: measure per beat, and check the beat that carries the argument separately.**
r006 needed the same lesson from the other direction (its route-draw beat scored lowest of any),
and in both cases the global number was passing while the most important seconds were not.

### r006 — a static map cannot pass the motion audit; move the camera (added 2026-09-09)

r006 is a world map with a line drawn across it. Its first cut measured **19% event
density** — below I51's first cut at 26%, the one a viewer called static. Three rounds of
adding motion to the *elements* (flowing dashes, a heavier race marker, a sweeping
wavefront) got it only to 27%. r005, for comparison, runs 38%.

**The reason is in the metric's definition and it generalises.** The audit takes the mean
absolute change over the WHOLE frame. A 6px line growing, or a 15px marker moving, changes
a few thousand pixels out of two million — it is worth roughly 0.1 against a threshold of
1.0. **No amount of detail animation will pass.** r005 cleared the bar because its
globe↔map morph moved every coastline in the frame at once.

**Measure per beat before changing anything.** The global number hid which beat was dead;
per-beat it was obvious:

| beat | density |
|:--|--:|
| hook | 17% |
| 01 the belief | 15% |
| **02 the route draws** | **16%** |
| distance readout | 23% |
| 03 speed bars | 38% |
| race lap 1 | 48% |

The route draw — the most important animation in the reel — was the second-worst beat in
it. Anything built on "one thing moves against a still background" will measure like this.

**The fix is a camera, and it is a craft improvement rather than a metric hack.** r006
opens tight on Mumbai, pulls back at 3.4s to reveal the ocean between the two cities, and
follows the cable as it is laid. Each move is one a documentary camera would make, each
carries meaning, and each moves the entire map. **27% → 49%**, above r005 and r004.

**Run the audit at its own default width.** It samples at `--width 240`. The same file
scored 27% at 240 and 51% at 360, because small moving objects survive one downscale and
vanish under the other. Every benchmark in `CLAUDE.md` is at 240; a per-beat script that
picks its own width is measuring a different reel.

### r006 — "It" is "this" wearing a different pronoun (added 2026-09-09)

r006's first cut opened on **"It doesn't go up. It goes under."** and held it for six
seconds over a map, before any element named the subject. Rule 3 in `CLAUDE.md` says name a
recognisable object in the title and **never "this"** — and a bare "It" is the same failure.
It survived a full build, a filmstrip pass, a safe-area scrub and a commit; the user caught
it on first watch, asking "should we reveal what is meant by It?"

**The worse half is that the reel already had its anchor and dropped it.** The Gate 0
sentence — the one a human approved — is *"when you **message** someone in America"*. The
word **message** never reached the screen. r005 is the model: **"Your flight path isn't
curved"** names the object in the first three words, and r005 is the account's best reel.

**Check the hook against the Gate 0 sentence before rendering.** The sentence is written to
be the most repeatable phrasing of the idea; if its subject noun is missing from the title,
the title is weaker than something already approved. That check costs one comparison and it
is not currently in any gate.

### r006 — check the data licence inside Gate 0 (added 2026-09-09)

r006's route was measured out of TeleGeography's submarine-cable API before anyone read
their terms. Their citation policy permits screenshots of the published maps under
CC BY-SA 4.0 but says **"access to the underlying databases remains restricted to paying
subscribers"** — so measuring route geometry from the API is use of the database, and the
build was not shippable. This was found *after* Gate 0 had passed and after the payoff
still had been committed and pushed.

**It survived on a distinction worth keeping: published figures are facts, route geometry
is a database.** The rebuilt route uses public geography only — real ports and the
chokepoints any cable between them must pass — and lands within **1.4%** of the licensed
geometry, while still naming MAREA and IMEWE and quoting their published lengths, which
are citable. The reel is unchanged in substance and now rests on something we may use.

**The rule: ask the licence question beside the friend test, not after it.** It costs one
search before the build and a rebuild after it.

### r005 — the hook problem is solved; the shape of the loss changed (added 2026-09-08)

**Base for every rate in this section: unique viewers, the base Instagram itself uses.** That is now
confirmed rather than assumed — Instagram's own "what affects your views" panel reports r005's share
rate as 0.9%, like rate 2.7%, save rate 1.1%, and 303/32,882, 916/32,882 and 362/32,882 give 0.92%,
2.79% and 1.10%. Against *views* they would be 0.65%, 1.96% and 0.77%, which match nothing. **Every
engagement rate Instagram shows you is per viewer, not per view** — so compute yours the same way.

r005's figures are at **day 1 (2026-09-09 09:47)**; r001 is at 3 days, r003 at ~18 h, r004 at an age
Instagram does not state. Skip rate, average watch and curve shape stabilise early and are worth
comparing; **views ÷ viewers is not** — a reel still in active distribution keeps meeting new people.

| | r001 Shazam | r003 QR | r004 JPEG | r005 Great circle |
|:--|--:|--:|--:|--:|
| Viewers | 1,286 | 324 | 1,617 | **32,882** *(day 1, still climbing)* |
| Skip rate | 37.9% | — | 34.8% | **29.9%** *(Instagram: "Lower")* |
| Avg watch | 15 s of 40 s | 9 s of 37 s | 11 s of 40 s | **20 s of 32 s** |
| Views ÷ viewers | 1.29 | 1.20 | 1.12 | **1.42** |
| Still watching at the last frame | ~18% | ~10% | ~10% | **~28%** |
| Likes | 24 (1.87%) | 3 (0.93%) | 17 (1.05%) | **916 (2.79%)** |
| Shares / saves | 6 (0.47%) / 6 (0.47%) | 0 / 1 (0.31%) | 1 (0.06%) / 5 (0.31%) | **303 (0.92%) / 362 (1.10%)** |
| Comments / reposts | — | — | — | 13 / 26 |
| Follows | 1 (0.078%) | 0 | 0 | **71 (0.216%)** |
| Sources | Reels tab 89.7% · Explore 9.8% | 86.6% · 9.5% | 82.7% · 16.0% | 82.2% · **17.0%** |

**r005 beats every previous reel on every per-viewer metric, and it is 20.3× the previous best reach**
(r004, 1,617 viewers). Likes are 1.5× r001's rate, shares 2.0×, saves 2.3×. It was still climbing at
day 1 — the views curve has not flattened — so these are lower bounds, for the reason in the next
section.

**The completion percentage has been removed from that row deliberately.** Earlier versions of this
table read "17 s of 32 s (53.1%)". That division is only valid if average watch time is per *view*,
and Instagram does not state its base. With views ÷ viewers at 1.42, 20 s per viewer is 14.1 s per
view — 44% of the runtime, not 62.5%. **Both are still the best on the account, but the honest claim
is the direction, not the ratio:** average watch rose 16 → 16 → 17 → 20 s on one consistent metric
definition while reach grew 64×. Report the seconds; do not divide them by the runtime. (Rule 7:
every percentage gets one stated base.)

### Three readings, two retractions — read this before writing a conclusion from fresh Insights

| | 1 h | 4 h | 7 h | day 1 |
|:--|--:|--:|--:|--:|
| Viewers | 515 | 6,799 | 10,311 | **32,882** |
| Avg watch | 16 s | 16 s | 17 s | **20 s** |
| Skip rate | 30.5% | — | 32.1% | **29.9%** |
| Likes | 12 | 100 | 211 | **916** |
| Saves | 2 | 36 | 86 | **362** |
| **Shares** | **0** | **5** | **73** | **303** |
| Follows | 1 | 8 | 16 | **71** |

And the same four as rates on viewers, which is the row that matters:

| | 1 h | 4 h | 7 h | day 1 |
|:--|--:|--:|--:|--:|
| Like rate | 2.33% | 1.47% | 2.05% | **2.79%** |
| Save rate | 0.39% | 0.53% | 0.83% | **1.10%** |
| Share rate | 0% | 0.07% | 0.71% | **0.92%** |
| Follow rate | 0.194% | 0.118% | 0.155% | **0.216%** |

**Three conclusions were written into this section and all three had to be retracted.**

1. At 1 h, 2 saves → *"a revelation has nothing to come back to; chasing saves needs a reel with
   reference value."* At 7 h it has **86 saves, 0.83% of viewers**, nearly double r001's rate.
2. At 4 h, 5 shares → *"shares stayed the weak one... 6× worse than r001... not reproduced in five
   reels and not understood."* Three hours later shares had gone **5 → 73**, a 14.6× jump, and
   **0.71% of viewers against r001's 0.47%.**

3. At 7 h, skip rate 30.5% → 32.1% → *"the small cost of a colder audience."* At day 1 it is
   **29.9%**, below the 1 h reading and the lowest on the account. A 1.6-point move was read as a
   trend; it was noise. Skip rate stayed inside a 2.2-point band across a 64× audience expansion —
   **the correct reading was "flat", and flat was the interesting result.**

**The first two were the same error: a count in single digits is not a low rate, it is an unpopulated
one.** The third is its mirror — reading a trend into a move smaller than the metric's own wobble.

**But the deeper mechanism is not noise, it is a systematic bias, and that is the part worth keeping.**
Every rate in the second table above *rose* from 4 h onward. Engagement is cumulative and lags the
view that caused it, so on a reel whose views are still climbing, the numerator is always behind the
denominator. **A cumulative engagement rate on a growing reel is biased low, not merely noisy** — it
is an underestimate whose error shrinks as growth decelerates, which is why every successive reading
looked better than the last and why every conclusion drawn from an early one was pessimistic in the
same direction. r005's day-1 rates are still lower bounds: the views curve had not flattened.

**The rule: record figures at any age, but do not write a content conclusion until the count is above
~30 AND the views curve has visibly flattened, and mark every conclusion with the age it was drawn
at.** A reel is not readable before ~24 h, and r005 was not fully readable then either. Three readings
in one day produced three false findings and one true one, and the true one (average watch rising as
reach grew) was the only one drawn from a metric that is an average rather than a cumulative count.

**What survived all four readings: average watch time.** 16 → 16 → 17 → **20 s** while the audience
grew 64× — **it went up at every reading, not down.** That is the strongest craft signal in the set
and it is worth more than the raw reach. It was also the only finding legible at the first reading,
because it is an average rather than a cumulative count, so it carries none of the lag bias above.

**Delete the phrase "warm early audience" wherever it appears in this file.** Earlier readings
explained the held watch time as a reel surviving the move from warm followers to cold strangers.
Instagram's audience panel says r005's viewers were **99.9% non-followers, 0.1% followers.** There
was never a warm cohort — 0.1% of 32,882 is about 33 people, and this account is far too small for
its followers to have been a meaningful share of even the 515 viewers at 1 h. **Every reel this
account has posted was watched almost entirely by strangers.** The rising watch time is still the
finding; the explanation attached to it was invented and is withdrawn.

**20 s of a 32 s reel is the best watch time on the account by a wide margin**, and it is the metric
that most directly feeds distribution. Part of it is craft and part of it is arithmetic — **32 s is
the shortest reel yet**, and a shorter reel is a cheaper thing to finish. Both r006 and any re-cut
should treat 30–35 s as the default length rather than 40.

**The retention curve changed shape, and that is the finding worth keeping.** r001 and r002 both fell
off a cliff and then FLATTENED — brutal opening, loyal body. r005 does neither:

| t | Still watching |
|--:|--:|
| 0 s | 100% |
| ~3 s | ~70% |
| 16 s | ~50% |
| 32 s | **~28%** |

A shallow knee, then a near-linear bleed of roughly 1.45 points per second for the remaining 29 s.
**The opening is no longer the thing costing reach** — 70% survive the first three seconds where r001
kept about half. But there is no plateau of committed viewers either: nobody is being lost to one bad
beat, everybody is leaking slowly. The two curve shapes want opposite fixes. A cliff says rebuild the
opening. A linear bleed says the reel has no moment that re-commits the viewer after the payoff —
and r005's payoff (the +2,572 km) lands at ~22 s, with the end card behind it.

**~28% reach the last frame — about 9,200 people.** The 7 h reading estimated ~18% off a smaller
graph; the day-1 curve is read directly and the tail is fatter than that guess.

**The account finally has a measured follow rate: 0.216%, from 71 follows on 32,882 viewers.**
It rose at every reading after 4 h (0.118% → 0.155% → 0.216%), which is the lag bias unwinding.

**It cannot be compared to r001.** r001's rate came from a single follow — one event, whose true rate
could plausibly be anywhere from a fifth to five times the 0.078% point estimate. Saying r005 is "3×
r001" is arithmetic on a number that was never measured. The honest statement is that **r005 is the
first reel on this account whose follow rate is known at all**, and it is 0.216%. That is the
baseline every future reel gets compared against.

**71 follows against 108 profile visits is the strange number, and it is the informative one.**
Follows are 66% of profile visits. Either most of those people followed without ever opening the
profile — using the follow button on the reel itself — or the profile converted two visitors in
three. Both are remarkable and both point the same way: **the persuading was done by the reel, not by
the profile.** Whatever the account bio says, it is not what earned these follows.

**Shares arrived late and then dominated — 303 at day 1, 0.92% of viewers, the best on the account.**
They were the last metric to move (0 at 1 h, 5 at 4 h, 73 at 7 h) and kept the steepest growth of any
metric after that. Shares are the strongest distribution signal Instagram has, and the views curve was
still climbing at day 1, so the likely causality runs share → reach rather than the reverse.
**r001's 6 shares are no longer the account's benchmark and no longer need explaining.**

**Saves were called wrong at 1 h, and the correction is the most useful thing in this section.**
At 2 saves the reading here was that "a revelation has nothing to come back to" — that a save means
"I will come back to this", so a reel complete on first watch cannot earn one. **By day 1
r005 has 362 saves, 1.10% of viewers, the best save rate on the account** (r001's 0.47% was the
previous best), and Instagram flipped the flag from "Lower" to "Higher".

**A save is not only reference value. It is also "I want to show this to someone."** r005 has nothing
to look up later and it is saved more than any reel that does, because "the curvy flight path is the
straight one" is a thing you carry to another person. The saves, comments, reposts and shares all
moved together and all four were near-zero before — that is one behaviour, not four.

**The rule this replaces the wrong one with: saves track tellability, not reference value.** And the
general lesson is the age one — 2 saves at 1 h was not a weak save rate, it was an unpopulated one.
**Do not draw a content conclusion from a metric whose count is still in single digits**, however
tempting the story. This section did exactly that and had to retract it inside four hours.

**Explore at 17.0% is the civilian-object thesis showing up in distribution, not just in the hook.**
Maps and aviation have an Explore audience that pure developer content does not. r003 (a QR matrix)
got 9.5%; r004 (a photograph) 16.0%; r005 (a world map) **17.0%**, the highest on the account, and it
rose from 13.6% at 1 h and then held at 17.0% from 7 h to day 1 while reach tripled. The reels that
open on something a non-programmer already cares about are the reels Explore carries.

### The end card is the most-liked frame in the reel (added 2026-09-09)

Instagram's **"when people liked your reel"** panel plots the share of all likes against playback
time. It had never been read on this account before. For r005 it is the most actionable instrument in
the whole Insights screen, because it says *where in the reel the viewer decided they liked it*.

Read off the day-1 graph — these are eyeballed from a chart, so treat them as ±1 point:

| t | Beat | Share of likes |
|--:|:--|--:|
| 0–1 s | first frame, arc drawing | ~5% *(partly a t=0 binning artefact)* |
| ~2.5 s | title lands | ~1% — trough |
| **~4.5 s** | **globe → Mercator morph completing** | **~5.7% — the mid-reel peak** |
| 6–9 s | readout: 12,373 km, 75.5° N | ~4.3%, sustained |
| ~12 s | morph back to the globe | ~1.4% — trough |
| ~16 s | scale bars, the 4.00× | ~3.4% |
| ~19 s | constant-bearing line draws | ~3.0% |
| 21–30 s | **the race** | ~1.2–2.6% — the lowest sustained stretch |
| **32 s** | **arrival + end card** | **~8.5% — the global maximum** |

**The tallest bar in the reel is the last frame.** And that understates it: only ~28% of viewers are
still there, so per surviving viewer the final frame is roughly **3.5× more like-dense than the best
mid-reel moment.**

**This resolves a question this section had written off.** At 7 h the entry here said the end beat's
contribution "stays unresolved until a reel ships without one." It is resolved, and positively —
the closing frame is where people commit. Together with follows running at 66% of profile visits,
the end card is doing real work rather than occupying the most-watched dead space. **Rule 9 in
`CLAUDE.md` was right for a reason nobody had measured.**

**The two peaks are the two morphs, and both are transformations of one object.** The 4.5 s peak is
the globe unrolling into a Mercator map — the exact moment the straight line becomes a curve. The
32 s peak is the arrival. Nothing in between comes close, and the readouts, the scale bars and the
bearing line — the three beats that carry the *explanation* — are all mid-table. **People like the
reveal and the resolution. They tolerate the argument in between.**

**The race is the reel's weakest stretch and it is 10.8 s long — a third of the runtime.** It scores
lowest on likes of any sustained section, and it sits directly between the two peaks, delaying the
one frame that outperforms everything. It was built as continuous motion to satisfy the event-density
rule, and it does that job, but it is dead weight for engagement. **The single clearest instruction
for r006: get to the end card sooner.** Cutting the race to one lap would have ended the reel at
~27 s. That is the first concrete thing this account has learned about its own pacing from data
rather than from principle.

### Who actually watched it (added 2026-09-09)

| | |
|:--|--:|
| Non-followers | **99.9%** |
| Followers | 0.1% |
| India | 58% |
| United States | 6% |
| Germany / Canada / UK | 2.3% / 2.3% / 2.2% |
| Age 25–34 | 42.9% |
| Age 35–44 | 24.2% |
| Age 18–24 | 16.3% |

**25–44 is 67% of the audience** — not the teenage feed this format is usually assumed to be aimed
at. That is squarely the demographic that flies, which is consistent with a reel about flight paths
finding the people it is for.

**India at 58% is a real number with an unknown cause, and it must not be over-read.** r005 uses
Delhi–San Francisco as its route, which is an India-relevant journey, so route choice is a plausible
driver. But the account posts from India, and Instagram's baseline distribution is home-market
weighted regardless of content — **and the audience panel has never been pulled for r001–I51, so
there is no baseline to compare against.** That is exactly the two-different-bases trap in rule 7.
**Action: pull the Audience panel for r001 and r004 before drawing any conclusion about route
choice.** If they are also ~58% India, the route explains nothing.

**What r006 should test.** Two things, and they are separable:

1. **Get to the end card sooner.** The like histogram says the closing frame is the strongest beat
   and the 10.8 s race is the weakest stretch. A 27–30 s cut that reaches the end card earlier is
   the highest-confidence change available.
2. **The linear bleed still wants a second re-commitment beat.** r005 gives the viewer one surprise
   (the arc is straight) and then spends 20 s elaborating it. A reel with two distinct surprises, the
   second landing around 15–18 s, would show up as a kink in the retention curve and as a third peak
   in the like histogram if the diagnosis is right.

**The end card also now owes a public promise** — about **9,200** people reached the last frame and
were told the next reel is the cable on the seabed, backlog `I22`. At 93 people that promise was
cheap to break, as `I15`'s was. At 9,200 it is not.

### FALSIFIED — the r005 pattern was not the engine (2026-09-10)

**r006 was the pre-registered test and it failed it.** It was built to all five points of the
pattern below — belief correction, a map that never leaves the frame, one arithmetic payoff, a
race that ends on an arrival, 28 s — with better motion numbers than r005 (46% event density
against 38%). **It peaked at ~1.8k views against r005's ~66k. A 36× gap.**

The falsification condition written below said r004-level reach would mean the engine was
elsewhere, and named the likely alternative: the map, i.e. Explore's geography audience. **That
alternative is dead too** — r006 is also a map and it did not travel at all. Both the stated
hypothesis and its stated alternative are wrong.

**What the comments say the engine actually was: r005 landed inside the flat-earth argument.**
The curved-flight-path-on-a-flat-map is *the* most-cited exhibit on both sides of that fight.
r005 did not merely correct a belief — it handed people a piece of usable evidence in a dispute
that was already running, and they took it somewhere.

**The refined hypothesis: a reel travels when it settles an argument the viewer is already
having.** Not when it fills a gap in their knowledge. The test is not "is the viewer wrong?" but
**"is the viewer wrong, out loud, in a fight they are already in?"**

| | r005 great circle | r006 cables |
|:--|:--|:--|
| Corrects a belief | yes | yes |
| Belief personally witnessed | **yes — the seatback screen** | no — nobody has watched a message route |
| An argument already running | **yes — flat earth** | **none. No faction, no stake, nobody to send it to** |
| Views | ~66,000 | ~1,800 |

**This is the same finding as the saves retraction above, arriving from the other side.** That
entry concluded "saves track tellability, not reference value — a save is *I want to show this to
someone*." r005's shares (0.92%) and saves (1.10%) were both roughly double the account's previous
best, which is the signature of people forwarding a thing to a specific person. r006 gave nobody
anything to say to anyone.

**Two caveats, stated so this is not over-read the way its predecessor was.**

1. **This is n=1 against n=1.** A 36× gap is far too large to be posting-time variance, but two
   reels cannot separate "argument" from every other difference between them. r005's globe→Mercator
   morph is also a more spectacular image than a line drawn across a static map, and that is
   unmeasured.
2. **Reach is not the only thing worth having, and this audience may not be the channel's.** r005
   converted 0.216% of 32,882 viewers into follows — the account's best *measured* rate, and still
   low. If that reach came from an argument rather than from interest in how things work, the
   followers it brought may not want the next reel. **Worth checking before optimising for it:
   how many of r005's 71 follows are still following, and did they watch r006?**

**What this does NOT license: chasing conspiracy content.** The engine is "settles a live
argument", and flat earth is one arena among many — most of them cheaper, less toxic, and closer
to what this channel is for. The next section is the pattern that survives.

### The pattern that survives — an argument, personally witnessed (2026-09-10)

Three conditions, all required. r005 has all three; r006 has one.

1. **The viewer has personally witnessed the evidence.** Not "has heard of it" — has *seen* it,
   with their own eyes, repeatedly. The seatback map. The blue dot. The shuffle that keeps
   playing the same artist. This is a stricter form of non-negotiable 6: the OBJECT must be
   recognisable, and now the BELIEF must be first-hand too.
2. **There is a dispute already running.** Somebody is wrong about this in public, regularly, and
   somebody else is correcting them. If you cannot picture the argument, there isn't one.
3. **It resolves to one thing you can repeat.** One number, one subtraction, one ratio — small
   enough to carry into the argument without the reel.

**The discriminating question, cheaper than building:** *who does the viewer send this to, and
what are they proving?* r005: your uncle, that the earth is round. r006: nobody, nothing.
**If that question has no answer, the reel will be liked and forgotten.**

### The r005 pattern — correct a belief, don't explain a mechanism (added 2026-09-08)

r005 is the account's biggest reel by a factor of twenty and the best on every per-viewer engagement
metric, shares included. **One reel is one data point**, and this repo has a written history of turning a
single result into a rule and then rebuilding five times — so what follows is a named hypothesis with
a test attached, not a law.

**What r005 did that r001–I51 did not:**

| | r001–I51 | r005 |
|:--|:--|:--|
| Proposition | "here is how X works" | "**the thing you believe is wrong**" |
| Viewer's prior | none — they had never considered it | a belief they already hold and have never examined |
| Object | a spectrogram, a QR matrix, a photo, a card table | a **world map** — a place, not a diagram |
| Object's tenure | opens on it, then cuts to the abstraction | **never leaves the screen** |
| Payoff | a mechanism understood | **one subtraction**: 14,945 − 12,373 = +2,572 |
| Length | 37–43 s | **32 s** |
| Close | the finished diagram | a **race with a winner**, still running under the end card |

**The candidate engine is the second row.** Everything else on this list has appeared in an earlier
reel in some form; the *belief correction* has not. r001 taught you something you had no opinion
about. r005 told you something you already thought was true is false — flight paths look bent because
the map is bent, not because planes detour. A viewer who has never wondered how Shazam works has
nothing at stake; a viewer who has looked at a seatback map has been quietly wrong for years and did
not know it.

**That is also the cleanest explanation of the engagement shape.** Saves, comments, reposts and shares
were all ~0 on every previous reel and all moved at once here. A correction is *tellable* — it makes
the viewer the person who knows something at the table. A mechanism explanation does not, however
elegant it is. See the saves retraction above: this is the same finding from the other side.

**The pattern, stated so it can be applied:**

1. **Find a belief the viewer already holds and has never checked.** Not a gap in their knowledge — a
   wrong answer they are confident in. If the viewer has no prior, this pattern does not apply.
2. **The object is a place or a thing, and it stays on screen the whole reel.** Rule 6 in CLAUDE.md
   already says this; r005 is the first reel that actually obeyed it end to end.
3. **Resolve to one arithmetic payoff the viewer can hold in their head.** One subtraction, one
   ratio. Not a mechanism, not a chain of steps.
4. **Close on a competition with a visible winner**, not a finished diagram — **and reach the winner
   fast.** The like histogram (above) makes this precise: r005's *arrival* is the single most-liked
   frame in the reel, while the 10.8 s race leading to it is the least-liked stretch. The resolution
   is what people respond to; the build-up to it is a cost. One lap, not two.
5. **30–35 s**, and shorter if the ending can arrive sooner. Shortest reel on the account and the
   best watch time on it by a wide margin.

**The test.** r006 is `I22` (the seabed cable), already promised on r005's end card to **~9,200**
people who reached the last frame. It has the same shape available: **everyone believes their message to a
friend abroad goes up to a satellite, and almost none of it does.** That is a belief correction, on a
map, resolving to one number. If the pattern is real, r006 performs like r005. If r006 lands back at
r004's numbers, then r005 was a topic that happened to travel and the table above is a coincidence —
which is the outcome worth being able to detect, so **do not change three other things at the same
time.**

**What would falsify the "belief correction" reading:** r006 built to all five points and landing at
r004-level reach would mean the engine is elsewhere — most likely the map itself, i.e. Explore's
geography audience rather than anything about the argument. That is distinguishable: check the
Explore share. If r006 travels on Explore too but engages worse, the object is doing the work and the
belief correction is decoration.

### r007 — the subject has to BE the frame, not sit in a panel (added 2026-09-10)

r007's first cut failed the motion audit at **19% event density with every one of its eight beats
dead**, and the cause was geometry rather than animation. The Earth sat in an 800x520 panel with
text above and readouts below — a sensible-looking layout — which at the audit's 240px sampling
width made the planet **15-40 px across**. The audit measures mean change over the whole frame, so
a subject that occupies a tenth of it cannot move the number no matter how much it animates.

The fix was structural: full-bleed stage, the planet nearly tripled in world radius, one rotation
per 10 s instead of 26, and **no two consecutive camera keyframes equal** — a documentary camera is
never locked off. 19% -> 38%. Then the two beats that were still dead (14% and 32%) turned out to be
the two where the camera had *shrunk* the planet to make room for a panel; the panels only need the
bottom of the frame, so the Earth was lifted instead, and the beat carrying the reel's second
surprise was made to push IN rather than drift out. 38% -> **44%, zero dead time in any beat.**

**The general rule this yields: text and graphic must share the frame, not divide it.** r005 and
r006 already put text over a full-bleed map; r007 is the case that shows what dividing costs.

It was deliberately not pushed to 50%. Density is a floor, not a target, and it cannot distinguish
motion that teaches from motion that fills.

### r007 — the audit cannot see a missing antecedent, and the filmstrip can (added 2026-09-10)

Two defects survived a passing motion audit, a clean typecheck, a clean `brand:check` and a
programmatic safe-area test, and both were obvious in a filmstrip:

- **The Sun was an 82 px sliver at the frame edge** — in a reel whose entire claim is "the Sun pulls
  179x harder". Every automated check was satisfied because something bright was on screen.
- **Beat 2 read "same scale as the bar above" while the bar above had faded out five seconds
  earlier.** Two states in sequence is not a relation. The bars are now co-present — 720 px against
  4 px — which is the whole argument in one picture.

This is the same lesson as r006's "It doesn't go up" pronoun hook, generalised: **the automated
gates check that things are legal, never that they are legible.** Non-negotiable 8 says verify
timing with video and filmstrip; the corollary is that composition needs it too.

### r007 — the render had a network dependency nobody had noticed (added 2026-09-10)

`remotion render` failed outright the first time the pipeline ran in a container with a controlled
egress: it tried to download Chromium from a non-allowlisted host, and once pointed at the
container's own Chromium, the headless browser is not proxy-aware and could not reach
`fonts.gstatic.com` — so `@remotion/google-fonts` failed every face and the render aborted with a
NetworkError before writing a frame.

**A render that needs the network is a render that can fail for reasons that have nothing to do with
the reel.** The five latin-subset woff2 files are now vendored in `remotion/public/fonts` and loaded
by local `@font-face`; `brand/fonts.ts` exports the same family names, so nothing downstream moved.
Renders are offline and reproducible. This is the "cache the network" rule the Python side already
followed, applied to the browser.

### r009 — three things only a per-frame scan could have caught (added 2026-09-11)

**The first 3D reel (`@remotion/three`), and every real defect in it was invisible to the
existing checks.** `tsc`, `brand:check`, the motion audit and the safe audit all passed on a cut
that had a **near-white flash** in it. Frames 79–100 averaged **180/255** — the visibility window
was letting a body fade in while it was still *larger than the frame*, and a lit sphere filling
the picture blows out. Stills at 0.5 s intervals missed it; the Studio missed it; it showed up
only when every frame's mean brightness was scanned.

**Two more of the same shape.** Orbit rings drawn at `r * 0.997` are **sub-pixel** and never
rendered at any zoom — the orbit beat shipped through four renders with no visible orbits at all.
And a yaw rotation added to "make the rings move" turns an already-tilted ring **edge-on**, because
euler XYZ applies yaw after tilt. Both look fine in code review and produce nothing on screen.

**The lesson is not "3D is hard".** It is that this repo's checks all measure *aggregate*
properties — a median, a dead spell, a bounding box — and every one of those survives a frame
that is simply wrong. **Scan per-frame statistics on any new renderer before trusting the
suite.** Three lines of numpy over the decoded frames found all three.

**A corollary about debugging tools.** `ffmpeg -ss 2.5 -i in.mp4` seeks to the nearest *keyframe*
and silently returns a different frame; it showed a clean picture for a full debugging round while
the flash sat two frames away. Use `-vf select=eq(n\,N)` when the exact frame matters.

### r009 — a sparse point cloud cannot carry a hold, at any size or brightness (2026-09-11)

The cosmic-scale beats failed the motion audit **seven times in a row**, and every "obvious" fix
did nothing measurable: more keyframes, a faster spin, a bigger disc, a brighter disc, a tighter
zoom. Measured directly, a 2,600-point galaxy holding for four seconds changed **0.12–0.19** per
sample against a 0.35 floor. This is `CLAUDE.md` non-negotiable 4's blind spot stated exactly —
the audit measures mean change over the whole frame, so only **large-area** motion counts, and a
cloud of 2 px points has no area however many of them there are.

**What actually worked was giving the beat a large bright mass rather than more motion:** the
galaxy got the diffuse unresolved disc light a real galaxy has, with a deliberately flat falloff.
One texture change moved the reel from FAIL to PASS after seven failed attempts at the problem
from the motion side.

**And the general fix for a hold is to keep leaving.** Every hold in this reel is now a
continuous recession — the frame never stops pulling back — which keeps the reading time and
loses the stillness, exactly as the rule asks.

### r009 — the accuracy gate caught a mechanism sentence, again (2026-09-11)

Gate 0 passed on a payoff frame built around **Stephenson 2-18 at 2,150 R☉**. Twenty minutes of
Stage 3 research killed it: the figure is revised down toward ~1,400 R☉ and was inflated by the
star's own ejected-material nebula confusing where the photosphere is. Replaced with **WOH G64 A,
1,540 ± 77 R☉** (Ohnaka et al. 2024) — measured, recent, and the first star ever imaged outside
our galaxy. The headline moved **13,430 → 18,749**: more honest *and* stronger.

**The one that nearly shipped was not a figure.** "The Hayashi limit caps stars at 1,500 R☉" is
false — it is a *temperature* line (~2,500 K) on the H–R diagram, not a radius cap — and the
number came from a fan wiki. Non-negotiable 7 is exactly right that **mechanism sentences slip
through where figures do not**, because a sentence looks like prose and nothing in the toolchain
checks prose. It was replaced with an observation instead of a theory: the five largest stars
ever measured, across two galaxies, are all within **8.7%** of each other.

### r009 — the reach test was failed ON PURPOSE, and recorded before the build (2026-09-11)

`I70` clears all three Gate 0 kill conditions cleanly — the payoff frame is impressive before a
word is read, which is the exact inverse of the three software concepts that died — but it scores
**1 of 3** on the reach test: no dispute is running about star sizes. That is the condition that
separated r005 (~66k) from r006 (~1.8k).

It was built anyway, for the 3D toolchain, and **the prediction was written into `GATE0.md` §4
before the build started**. That matters: if this lands at r006 numbers it is a *confirmed
prediction* and teaches nothing new, and only a good result is information. Recording the
expected outcome in advance is cheap and it is what stops a bad result being re-explained
afterwards — which is precisely what happened to r006.

### r011 — NEVER FIX A LAYOUT PROBLEM BY CHANGING THE SCALE A CLAIM IS MEASURED IN (2026-09-11)

`r011`'s copy says the two pendulums were indistinguishable for **3.3 seconds**, and that number is
the moment their tips first separate by **one screen pixel** at 190.3 px/m. Then the safe-area audit
found exactly two frames of 360 where a bob crossed into the action rail, by 2 and 4 px.

**The obvious fix — widen the lens slightly — would have silently moved the number the copy quotes.**
A different px/m is a different definition of "one pixel", and `emit_ts.py` had asserted 3.3 s
against the old one. The bob was shrunk instead, which cost motion density (84% → 61%, recovered to
69% by widening the traces).

**Rule: once a claim is measured in display units, the display scale is part of the claim.** It may
only change by going back to the measurement, never as a layout convenience.

### r011 — THE FAILURE ACCENT CANNOT BE THE GROUND (2026-09-11)

`<ReelGround accent={FAIL} />` is the natural thing to write for a §6 reel, and it washes the entire
frame red for the entire runtime — precisely the decorative use `tokens.ts` warns destroys the
accent. It passes `brand:check`, because the linter polices which hexes appear and not how much of
the frame they cover.

**A §6 reel takes a neutral ground and spends the red on one object, from one beat.** In `r011` the
second pendulum turns red at the split and stays red; nothing else is ever red.

### r011 — AN AUDIT CATCHES WHAT A STILL CANNOT (2026-09-11)

The scene group was positioned at `-PIVOT_X_M` where `PIVOT_X_M` was already an offset *toward* the
safe centre. The pivot landed 150 px right of where it belonged and the traces ran into Instagram's
action rail **on all 360 frames**. It typechecked, passed `brand:check`, and looked entirely
plausible in a still — because a still shows you a composition, not a coordinate.

**Stills are for layout, video is for timing, and only a per-frame numerical audit finds an offset
that looks fine.** Companion to r010's lesson that an exemption is written down rather than bought:
`scripts/reel_safe_frames.py` is now the tool for both, and `r011` needs no exemption at all.

### r010 — THE CLOCK MUST NOT LIE (2026-09-11)

`r010` compresses simulation time and prints the rate on screen (`×12`). The first cut interpolated
simulation time with the brand ease, the same curve every other animated value uses. At 13.3 s the
clock read **1:35 where a true ×12 is 1:05** — because easing varies the rate continuously inside
each beat.

**Easing belongs on the camera, never on the physics.** The moment a reel states a rate, a ratio or
a timestamp on screen, the quantity behind it has to be linear in playback or the label is a false
statement. Nothing caught this but arithmetic against a still: it type-checked, it passed
`brand:check`, and it looked completely normal in motion.

### r010 — THE JAM WAS THE DARKEST THING ON SCREEN (2026-09-11)

Cars were coloured by speed, ramping stopped → `GRAPHITE`. `GRAPHITE` is very nearly the colour of
the asphalt, so the jam rendered as an **absence** — a dark gap in a ring of blue — and the single
thing the entire reel is about was the hardest thing on the frame to see.

**The subject takes the bright end of any data ramp, whatever the data's natural polarity.** Stopped
is now bone and moving is accent, and the jam is a bright clot the eye finds before a label points
at it. Same failure family as r006's route-draw beat: technically correct, visually absent.

### r010 — AN EXEMPTION IS WRITTEN DOWN, NOT BOUGHT (2026-09-11)

The safe-area audit failed on the driver's-eye beats, where the road leaves the bottom corners the
way `ReelGround` leaves every edge. **The first thing I tried was raising the brightness threshold
until the number went green** — which is the `I51` mistake wearing a new costume: answering a
measurement you dislike with a craft adjustment to the measurement.

`scripts/reel_safe_frames.py` now takes `--bleed <ranges>`, so an exemption must be stated as an
explicit time range and justified in `NOTES.md`. **The header band is never exempt**, whatever the
camera is doing — that is r001's bug and the whole reason the rule exists. The audit also went from
FAIL to PASS on a real fix in between: a 280 px label centred on a marker at x = 119 put its glyphs
at x = 37, inside Instagram's left cut. 78 pixels, and still text under the chrome.

### r009 — ONE RULER. The yardstick problem, and the first Gate 3 failure on message (2026-09-11)

**The verdict on the 53 s cut:** *"I really like it. All colours, branding, palette, spacing,
focus, all animation aspects. I just had a hard time understanding the message. **We don't know
what we are comparing against.** The sphere can also tell us what it represents."*

This is a new failure mode for this repo and it deserves its own line. Every previous kill was
Gate 0 — the concept was wrong. r009's concept passed Gate 0 cleanly and its craft was praised.
**It failed on the script**, and the cause is countable:

> **The cut changed its yardstick eight times in nine beats.** Earths across → Suns across →
> astronomical units and planet orbits → a percentage spread → stars laid end to end → systems per
> light-year → gaps per nebula width → percent of a galaxy. **Seven units, none surviving into the
> next beat.** So when the payoff number landed, the viewer had nothing in hand to feel it
> against, because the unit it was measured in had been invented four seconds earlier and was
> never used again.

**The rule that came out of it, and it generalises past this reel:**

> **Pick ONE ruler, state it in words, use it at every rung, and never replace it.** Every number
> on screen must answer the same question. r009's is *how many of the last thing fit across the
> next*: 11, 10, 1,540 — and then 18,749, for a thing that is not a thing at all. Four numbers,
> one question, and the argument is legible without a single sentence of explanation. Anything
> that cannot be said in that ruler is demoted to a wordless beat or cut.

**Second rule, and it is the one the viewer actually asked for:**

> **A label belongs ON its object, not in a slot.** r009 v1 put titles at y=300 and captions at
> y=1300 with the sphere at y=830, so nothing on screen ever said which circle was which and
> "1,540 times wider" was a claim about two unlabelled discs. v2 gives every body a name that
> reads the same `rung`, `viewKm` and visibility window as the 3D object, so a name cannot
> outlive, precede or drift off the thing it names. **And a comparison needs both of its terms in
> frame at once**: a rung does not leave until the next one is at full size.

**Third, and it is a subtraction:** the catalogue designation `WOH G64` was the largest type on
screen at 92 px. That is non-negotiable 6 broken as squarely as "Reed-Solomon" in a hook would
break it, and the same beat also carried `7.16 AU`. Both are gone; so are `8.7%`, `4.2465` and
`PROXIMA`. **A reel is allowed a name the viewer can repeat or a name the viewer can look up, and
the first one wins every time.**

**What the cut bought.** 53 s → 40 s, nine beats → eight, and the audit improved on every measure
at the same time: median 0.658 → 0.723, dead spell 1.50 s → 0.75 s, event density 31% → 35%. The
18 s removed — the neighbourhood, the Orion Nebula, the galaxy — were the three rungs the v1 audit
had already blamed for the 31%. **The beats that diluted the message were the same beats that were
killing the motion**, which is not a coincidence: both are symptoms of a reel that kept adding
scales after its point had landed.

### FOUR FLOORS AFTER ONE HIT — the reach test works and is not binding (2026-09-11)

**The record, at 2026-09-11:**

| Reel | Views | Reach test at Gate 0 | Outcome |
|:--|--:|:--|:--|
| `r005` great circle | **~66–80k** | **3 of 3** | the account's only hit |
| `r006` cables | ~2.1k | 2 of 3 — no dispute running | floor |
| `r007` tides | ~600 | weak on all three | floor, and the lowest of the nine |
| `r008` pendulum | ~1.8k | "personally witnessed" flagged weak | floor |
| `r009` emptiness | low | **1 of 3**, recorded in `GATE0.md` §4 before the build | floor |

**Every one of the four was pre-flagged, in writing, before it was built.** r009's Gate 0 says it
outright: *"if this lands at r006 numbers, that is a confirmed prediction and not a new lesson."*
It did. **So the test is not the thing that is broken. The gate is: it has correctly named the
outcome four times running and has not stopped a single build.** That is the finding, and it is
about process, not craft.

#### The 5-second number, and what it rules out

r009 averages **5 s of a 40 s reel — 12.5% of runtime**. r005 averaged **20 s of 32 s — 62.5%**.
Same account, same palette, same chrome, same audit discipline, a 5x gap.

That comparison is worth more than the view counts, because it **rules things out**:

- **Not the message.** r009 v2 was re-cut specifically to fix comprehension, and its ruler is not
  established until 9 s with the payoff at 31 s. At a 5 s average, the overwhelming majority of
  viewers never reached either. The re-cut improved what a viewer who stays understands; it could
  not have moved this number, and it didn't.
- **Not the craft or the aesthetic.** r005 shares both and holds people for 62.5% of its runtime.
- **Not the motion audit.** r008 scored the best motion number on the account (99%) and floored.
  Four reels now say that passing the audit and holding an audience are different things.
- **Not runtime by itself.** 32 s vs 40 s does not explain 62.5% vs 12.5%.

**What is left is the first two seconds and what the reel is about.** Non-negotiable 3 has said
"the first 2 seconds decide everything" since r001; four floors are what it looks like when that
rule is satisfied on the letter and missed on the substance.

#### Three specific causes, in order of how confident I am

**1. Gate 0's "object" condition has been passing on technicalities.** The kill condition is *the
payoff frame shows an object the viewer has never seen*. Scored honestly:

- r005 — a **seatback flight map**. The viewer has personally seen it, repeatedly. PASSES.
- r006 — a world map with a line. Close, but nobody has watched a cable being laid.
- r007 — an Earth–Moon–Sun diagram. Nobody has seen a tidal bulge.
- r008 — fifteen weights on strings. Nobody has seen a pendulum wave outside a physics video.
- r009 — a hypergiant at true scale beside a sub-pixel Sun. **Nobody has seen this.** Its own
  `GATE0.md` recorded the caveat — *"a true-scale gap is a line with two dots on it, which drifts
  toward diagram"* — and the build argued past it.

"A star is an object everyone has seen" is true of a star and false of *this* star. **r005 is the
only reel of the nine whose payoff object is a thing the viewer has personally, repeatedly seen,
and it is the only hit.** n=1 either way, but the mechanism is plausible and the gate already
tried to say so twice.

**2. New, and specific to r009: differentiation that arrives at second 22 is not
differentiation.** For its first two seconds r009 is indistinguishable from the thousands of
cosmic-scale videos already in the feed — dark frame, glowing sphere, a size claim. Its entire
argument for being different, that sizes saturate and distances do not, does not appear until
~22 s. A viewer who has seen the genre swipes at 1 s and is *correct to*, on the evidence in front
of them. **Competing inside a saturated genre requires the difference to be visible in the first
second, not to be the reel's eventual thesis.** No previous reel had this problem, because no
previous subject had a genre.

**3. Distribution, stated as a caveat rather than a cause.** At 600–2,100 views the per-reel
engagement figures are noise, and a small follower base means every reel must earn a cold push on
its own with no warm pool to carry it. This does not explain the watch-time gap — that is measured
per viewer — but it does mean **the view counts should not be over-read individually**. The
pattern across four is the signal.

#### What should change

1. **Make the reach test binding.** No build without a written answer to *who does the viewer send
   this to, and what are they proving*. "Recorded in advance and built anyway" has now been run
   four times and produced four floors; it is a prediction log, not a gate. Cost: one sentence.
2. **Add a first-two-seconds test to Gate 0**, next to the payoff still: *would a viewer who has
   already seen this genre know, inside one second, that this one is different?* r009 fails it and
   would have failed it before a line of code was written.
3. **Score the "object" condition against the payoff frame as drawn, not the subject in the
   abstract.** The question is not "is a star an object" but "has the viewer seen THIS picture".

**What this does NOT say.** It does not say the physical-systems widening was wrong — r005 is a
physical fact and the software reels died at Gate 0 for a separate, well-documented reason. It
does not say the craft discipline is wasted; it says craft is necessary and has never been
sufficient. And it is nine data points with one success, so every causal claim above is a
hypothesis with a cheap test attached, not a law.

### THE HOOK A/B — pre-registered 2026-09-11, before any numbers came back

**r009 was re-cut and re-posted the same day with the same Caption A and the same hashtags.**
Everything from 4.2 s onward is identical. Only the opening differs:

| | v2 | v3 |
|:--|:--|:--|
| first 4 s | the giant receding, under a *promise* that it will vanish | the giant **actually vanishing**, into the gap, with no number |
| clock | `GONE IN __s` from 1.5 s | `THE NUMBER IN __s`, from after the cut |
| runtime | 40 s | 40.4 s |
| result | **5 s average watch (12.5%)** | — |

This is the closest thing to a controlled comparison this account has ever had: same subject, same
script from 4.2 s, same caption, same tags, same aesthetic, same day. **Writing down what may be
read from it, in advance, is the cheapest thing available and it is what `GATE0.md` §4 did
correctly for the reel itself.**

#### Read average watch time. Do NOT read views.

**Views are contaminated here and the contamination is one-directional.** A near-duplicate
re-post is exactly the thing a recommender suppresses, so v3 can lose on reach while winning on
the hook, and a low view count would tell us nothing about the change. Reach also depends on
time-of-day, on which pool the post lands in, and on how many of v3's viewers were already shown
v2 — none of which the re-cut touched.

**Average watch time is per viewer, so it survives all of that.** So does the skip rate, and so
does anything Instagram reports about the first three seconds. Those are the readings.

- **v3 beats 5 s** → the teaser did its job and the finding generalises to r010: *show the result
  in the first two seconds, do not promise it*.
- **v3 lands at ~5 s again** → the hook is not the binding constraint, and the remaining
  candidates are the two §13 already names — that nobody has ever seen a 1,540 R☉ hypergiant, and
  that a dark, low-saturation, low-contrast frame reads as "quiet" in a feed. **Both of those are
  choices about what to make, not about how to cut it**, and neither can be tested by re-cutting
  r009 again. A third re-cut would be the I51 mistake: answering a verdict with a craft fix.
- **v3 loses badly on views but holds watch time** → that is the duplicate-suppression signal, and
  it says the experiment worked and the distribution was withheld. Do not re-cut on that reading.

**Cost of being wrong here is one more floored reel; cost of not writing it down is another
re-cut cycle spent on the wrong layer.** That is the whole argument for pre-registration, and it
is the fourth time this repo has had the chance to make it.

### THE HOOK A/B — RESOLVED, 2026-09-11, ~6 h after posting

**The teaser won on the pre-registered metric and it did not move reach.** Both halves of that
sentence are load-bearing.

| | v2 | v3 |
|:--|:--|:--|
| average watch | 5 s of 40 s — **12.5%** | 8 s of 40.4 s — **19.8%** |
| views @ 6 h | — | 215 (171 viewers), tracking *below* the account's own typical curve |
| shares · saves · follows | — | 0 · 0 · 0 |

**+60% on watch time is a real result** and it is the read this entry called in advance: it is per
viewer, so it survives the duplicate-suppression confound that makes views unreadable here. Showing
the result in the first three seconds beats promising it. **That finding generalises to r010 and is
the one thing to carry forward from three cuts of this reel.**

**It bought nothing, because watch time is not the distribution mechanism.**

#### The number that actually explains nine reels

| | r005 (the hit) | r009 v3 |
|:--|--:|--:|
| viewers | 32,882 | 171 |
| **like** rate | 2.79% | **2.92%** |
| **share** rate | 0.92% | **0.00%** |
| **save** rate | 1.10% | **0.00%** |
| follow rate | 0.22% | 0.00% |

**The like rate MATCHES the hit.** The people who see r009 like it at the same rate people liked
the reel that did 66k. They do not like it less. **It just does not travel.**

Likes are passive and cheap; **shares and saves are the costly signals, and they are the mechanism
by which a reel escapes the pool it was tested on.** r005 got 303 shares and reached 32,882
viewers. r009 got 0 and reached 171. A reel that nobody sends anywhere is shown to nobody, no
matter how well it is cut.

**Honesty about what 0/171 proves: not much on its own.** At r005's share rate, 171 viewers would
be expected to produce **1.6** shares, and seeing zero has probability 0.21 — unremarkable. The
95% upper bound on r009's share rate from this sample is 1.75%, which does not even exclude r005's
0.92%. **The single reel is not the evidence. The pattern across r006–r009 is**, and this is the
fifth consecutive confirmation of the reach test.

#### What this closes, and what it opens

**CLOSED — the hook was a real defect and it is fixed.** Craft was never the binding constraint,
though: v3 has the best opening this account has built and the worst reach.

**CLOSED — stop cutting r009.** Three cuts. The pre-registration said a fourth would be the `I51`
mistake — answering a verdict with a craft fix — and that holds whether the reading was good or
bad. It was good, and it changed nothing that matters.

**r011 — A SURPRISE YOU PROTECT BY HIDING THE PREMISE IS NOT A SURPRISE (2026-09-11).** Cut 1 drew
the second pendulum in bone until the split so the pair would read as one object, with a comment in
the component defending it: turning it red from frame 0 "would have given away the entire reel in
the first second". It gave away nothing and cost everything. A viewer who does not know there are
two objects does not see *divergence* — they see **a red pendulum spawning out of a white one**,
which is a graphics effect rather than a physical fact. The existence of the second thing is the
PREMISE; only the divergence is the EVENT. Concealing a premise to protect an event deletes the
event. Ask which of the two you are actually withholding.

**r011 — THE VERDICT WAS ON THE COPY, AND THE COPY HAD BEEN APPROVED (2026-09-11).** *"What is the
text on video supposed to say?? I do not understand it."* The copy read "ONE OF THESE IS / A HAIR'S
WIDTH OFF." — a plural pointing at a singular, over a frame deliberately built to show one object —
and the sentence the reel was about (two released from the same place, nothing touched either, they
ended up unrelated) was never on screen in any form. **It passed G4 because the script table has a
"why this beat exists" column sitting next to the copy**, silently supplying the context the viewer
would never get. Every line read as clear in the table and as nothing on a phone. **At G4, read the
copy column alone with the others covered.** One minute; it is now in `CLAUDE.md`.

**r011 — AN APPROVED SCRIPT DOES NOT MAKE A CLAIM TRUE (2026-09-11).** The re-cut copy was approved
as "ONE STARTED A HAIR LOWER". The integrator says higher: the perturbation adds +0.004011° to θ₁
and at a 135° release a larger θ is further from the downward vertical, so B's elbow starts at
+0.707107645 m against +0.707106781 m. **Non-negotiable 7 outranks G4**, it covers sentences rather
than only figures, and the check is against the data — not against the sign of the constant as
reasoned about in your head. Change the word and tell the human which word changed.

**r011 — WHEN TWO THINGS MUST BE DISTINGUISHED AT THE SAME COORDINATES, SEPARATE THEM IN THE
PICTURE PLANE, NEVER IN DEPTH (2026-09-11).** The obvious repair — one solid bob larger and behind,
one smaller and in front, expecting a coloured rim — renders as a single solid object with the other
erased inside it, because concentric solids nest and the depth test hands the whole overlap to
whichever surface bulges furthest toward the camera. The z-offset that would fix it was computable
in advance (`sqrt(r_B² − r_A²) = 0.086 m`) and so was its price: **0.71 px of parallax at full
reach, on a reel whose entire claim is that two things agree to within one pixel.** A flat ring
whose inner edge clears the other silhouette costs nothing, occludes nothing, and needs no z
separation at all. In a near-orthographic 3D scene, depth is not free real estate — it is
accuracy budget.

**r011 — THE LOOP FORMAT RETURNED A RESULT, AND THE BET ITSELF FAILED (2026-09-12).** The format
was pre-registered in `CLAUDE.md` with one number: **average watch time ≥ 100% of runtime**, on the
mechanism that a 12 s loop watched twice is 200% watch time. First reading at ~8 h:

| | r011 (12 s loop) | r005 (32 s teaching reel) | r009 (40 s) |
|:--|--:|--:|--:|
| average watch / runtime | **66.7%** (8 s) | 62.5% (20 s) | 12.5% (5 s) |
| **views per viewer** | **1.460** | **1.423** | — |
| views / viewers | 3,546 / 2,429 | 46,782 / 32,882 | — |
| like rate | **0.247%** | **2.786%** | — |
| share rate | 0.124% | 0.921% | 0.00% |
| save rate | 0.124% | 1.101% | 0.00% |

**The rewatch mechanism did not appear. 1.460 replays per viewer against a 32-second reel's 1.423
is the same number.** Runtime bought about five points of watch ratio, not the doubling the format
was built on. **Runtime was not the variable** — the falsification condition written into
`CLAUDE.md` in advance, and it is met.

**What the format DID buy is reach, and that is not nothing.** 3,546 views is the account's second
best ever behind r005, roughly 10x a typical reel, flat by 8 h, and **85.8% of it came from the
Reels tab** — cold algorithmic distribution to strangers, not the follower pool. Skip rate 41.1%,
flagged "Lower". The algorithm liked it; people did not react to it.

**The collapse is in reaction, and it is r008's signature exactly.** 0.247% like rate against
r005's 2.786% is **11.3x lower** on the same account with the same craft discipline. r008 took 0
likes on ~1.8k views with the best motion score ever recorded here. **Two reels now say that
mesmerising physics is watched and not felt.** Three sends is the first non-zero share rate since
r005 and it is 7.5x below it; Instagram flagging share rate "Higher" only measures how long the
account has been posting reels nobody sends.

**THE RETENTION CURVE SAYS WHY IT NEVER LOOPED, AND IT IS A BUILD PROBLEM, NOT A FORMAT PROBLEM.**
100% → ~68% at ~1.5 s → **~37% at 11 s** → ~18% at the cut. That is a steady bleed rather than a
cliff, and for a loop it is fatal: **a reel cannot restart for the 63% who never reach the end.**
The cause is on the reel's own timeline — the last thing that HAPPENS is the copy at 4.7 s, so
**7.3 seconds, 61% of the runtime, carry no new event.** The motion audit reads 67% event density
throughout and cannot see this, because it measures pixel change and two pendulums swinging change
plenty of pixels. **Motion density is not event rate, and only event rate holds a viewer to a
restart.** Any future loop needs something to happen roughly every 2 s, with the last event close
to the cut so that reaching the restart is rewarded.

**Caveat, and it is the same one as always: n = 1, one post, one platform, and distribution has
never been controlled.** What is NOT caveated is the views-per-viewer figure — that is a direct
measurement of the exact mechanism the format was built on, taken against the account's own best
reel, and it shows nothing.

**r005 AT DAY 4 — A SENT REEL COMPOUNDS; A PUSHED REEL PLATEAUS (2026-09-12).** Read at day 4 with
the curve only now flattening: **94,171 views / 69,816 viewers, 157 follows, 840 shares, 855 saves,
27 comments, ~2K likes, average watch still 20 s.**

| | day 1 | **day 4** | growth |
|:--|--:|--:|--:|
| viewers | 32,882 | **69,816** | ×2.12 |
| shares | 303 | **840** | **×2.77** |
| **share rate** | 0.921% | **1.203%** | **+31%** |
| save rate | 1.101% | 1.225% | +11% |
| like rate | 2.786% | ~2.865% | flat |
| follow rate | 0.216% | 0.225% | flat |
| views per viewer | 1.423 | 1.349 | −5% |
| avg watch / runtime | 62.5% | 62.5% | flat |

**THE SHARE RATE ROSE WHILE THE REACH DOUBLED, AND THAT INVERTS THE NORMAL PATTERN.** Engagement
rates dilute as a post escapes its warm pool — r011's cold Reels-tab traffic is textbook dilution,
and r005's own views-per-viewer did dilute, 1.423 → 1.349. **Shares went the other way.** The
reading that fits: the further this reel travels, the likelier it lands on somebody who has an
argument to settle with it, so **sendability is not consumed by reach — it is created by it.** That
is what "lands inside a dispute already running" buys, and no craft variable in this repo can
produce it.

**The consequence is the shape of the two curves, and it is the clearest thing in the account's
data.** r005: four days, still climbing, 94k. r011: **eight hours, flat, 3.5k** — the algorithm
tested it, it retained well, nothing propagated it, and it stopped. **A pushed reel stops when the
push stops. A sent reel does not stop.**

**FOLLOWS ARE THE MOST BRUTAL COLUMN IN THIS LEDGER. r005 has 157. Every other reel r001–r011
combined has 3.** Not "r005 is the best performer" — **r005 is the account**, and ten reels of
craft work have added a rounding error to it. Whatever is being optimised on the other ten, it is
not the thing that produced this.

**Day-1 rates were a floor and were read as an estimate; they are now revised UP.** The GATE 3
benchmark moves from 0.92% to **1.203% sends per reach**. Two cautions on the day-4 figures: likes
are Instagram's rounded "2K", so the like rate is ~2.8–2.9% and not a precise 2.865%; and the curve
is flattening but not flat, so shares and follows may still rise.

**OPEN — "who does the viewer send this to, and what are they proving?" is not a filter, it is THE
constraint.** It has now predicted five outcomes in a row. Every craft rule in `CLAUDE.md` governs
what happens *after* a viewer is shown the reel; nothing in this repo governs whether it is shown
to anyone. That is the gap.

**OPEN — distribution has never been controlled.** Nine reels, one platform, one warm pool of a
couple of hundred followers acquired largely by a single geography reel, and every conclusion in
this ledger drawn from it. The account's own chart puts a *typical* reel at ~350 views in 6 h,
which is a floor, not a verdict on any particular reel. **Posting an already-rendered asset to a
second platform costs one upload and is the only free way to tell a content problem from a
distribution one.** It has never been tried.

### Posted

| Reel | Subject | Length | Posted |
|:--|:--|:--|:--|
| `r001` | How Shazam names a song in seconds | 40 s | **2026-09-02** |
| `r002` | Autocorrect / edit distance | 43 s | **2026-09-02** |
| `r003` | QR codes / Reed–Solomon | 37 s | **2026-09-05** |
| `r004` | JPEG / DCT — a photo stores no pixels | 40 s | **2026-09-06** |
| `r005` | Great circle — your flight path isn't curved | 32 s | **2026-09-08** — 94,171 views / 157 follows at day 4 |
| `r006` | Submarine cables — your message goes underwater | 28 s | **2026-09-09** |
| `r007` | Tides — the Sun pulls 179× harder, the Moon makes the tide | 54 s | **2026-09-10** |
| `r008` | Pendulum wave — fifteen strings, back in line at 30 s | 34 s | **2026-09-10** |
| `r009` | Scale — the biggest star ever measured is a speck in the gap | 40 s | **2026-09-11** |

| `r011` | Two double pendulums one hair apart — the loop format | 12 s | **2026-09-11/12** |

### Built and unposted — at GATE 5

| Reel | Subject | Length | State |
|:--|:--|:--|:--|
| `r010` | Traffic jam with no cause — it runs backwards at 12 mph | 46 s | built **2026-09-11** |

**The next reel is `r012`.**
