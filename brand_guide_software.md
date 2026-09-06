# Depth First — Brand Guide (software/technical documentaries)

*The identity document for the **second channel** — technical documentaries told visually. Sister to
`brand_guide.md` (The Engineering Atlas), which does **not** transfer: different subject, different
viewer, different visual language. Written 2026-08-17, after the @CodeSource comp deep dive
(`docs/comp_deep_dive_codesource.md`) and the Remotion pipeline decision.*

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
| §7 Structure | `storyboard.json` scene skeletons (script-analyzer, pass 1) |
| §8 Thumbnails | `generate_thumbnail.py` + `add_thumbnail_text.py` → `assets/thumbnails_log.md` |

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

*Companions: `docs/comp_deep_dive_codesource.md` (the evidence behind §7 runtime and §8) ·
`brand_guide.md` (The Engineering Atlas — the sister channel, deliberately different) ·
`docs/cinematography.md` (craft canon behind §5) · the `studio-director` chain for per-video execution.*

---

## 13. Instagram — `@thedepthfirst` (live 2026-09-02)

The short-form arm. Same name, same handle, same mark as YouTube — deliberately. Two names would be
two brands with zero compounding, and would recreate exactly the dead funnel diagnosed in
`docs/comp_deep_dive_equationverse.md` §5.

| Field | Value |
|:--|:--|
| Handle | `@thedepthfirst` |
| Name (30 char, indexed separately from the handle) | `Depth First · how code works` |
| Avatar | `assets/brand/depthfirst_mark_512.png` |
| Bio | The algorithms hiding in things you already use. Every animation here is the real algorithm, actually run — not drawn. |

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
are positioned against them, so any reel built on the shared lib is safe by construction.

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

### Posted

| Reel | Subject | Length | Posted |
|:--|:--|:--|:--|
| `r001` | How Shazam names a song in seconds | 40 s | **2026-09-02** |
| `r002` | Autocorrect / edit distance | 43 s | **2026-09-02** |
| `r003` | QR codes / Reed–Solomon | 35 s | not yet |
