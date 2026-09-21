# Cinematography & Storytelling Canon — The Engineering Atlas

*The shared craft rulebook for the studio pipeline. Every role skill (script-analyzer →
film-director → storyboard-artist → scene-composer → motion-director → ae-director) cites
rules from this document by ID (e.g. `SHOT-3`, `RHYTHM-2`). Brand-specific numbers (palette,
type, motion limits) live in `brand_guide.md`; this doc is the craft — why and when.*

*Context this canon assumes: VO-driven documentary motion graphics; isometric AI-generated
plates + flat Oversimplified-style characters from `assets_library/`; 60–80 scenes of 8–12s;
motion hand-built in After Effects (transforms only, art never redrawn); final conform in
Premiere Pro against recorded VO.*

---

## 0 · The Prime Directive

**PRIME-1 — Motion serves comprehension.** Every camera move, layer drift, and text-in exists
to help the viewer *understand the engineering faster*. If a motion doesn't buy comprehension
or emotion, it's clutter — cut it. (This is why Kurzgesagt feels calm and dense at once:
nothing moves without a communicative job.)

**PRIME-2 — The 2-second test.** A viewer who glances back at the screen must grasp what
they're looking at within 2 seconds: one focal point, readable silhouette, obvious subject.
Any scene that fails this in a still frame will fail worse in motion.

**PRIME-3 — Accuracy is the aesthetic.** For an engineering channel, a wrong detail moving
beautifully is worse than a right detail holding still. `visual_facts` are hold-constraints:
they may not move, deform, or be covered.

---

## 1 · Shot grammar (SHOT)

Our five shot sizes, adapted from film's wide/medium/close for illustrated documentary:

| Size | Film equivalent | Job | Typical scene_type |
|---|---|---|---|
| **Vista** | extreme wide | scale, awe, geography | establishing, map |
| **Stage** | wide | action in context — characters/mechanism *and* their setting | establishing, narrative |
| **Action** | medium | the thing happening: a person descending steps, water rising | detail, narrative |
| **Study** | close-up | one element's craft: a joint, a carving, a waterline | detail |
| **Abstract** | insert/graphic | the idea itself: cross-section, diagram, numbers | cross_section, scale_comparison |

**SHOT-1 — Progress in steps, not leaps.** Default progression: Vista → Stage → Action →
Study → Abstract. You may skip one step; skipping two (Vista straight to Study) disorients —
do it only as a deliberate jolt, ≤2× per video.

**SHOT-2 — Re-establish after abstraction.** After 2+ consecutive Abstract shots (diagrams,
sections), return to a Vista or Stage so the viewer re-anchors the idea in the real structure.

**SHOT-3 — Cut vs move.** *Cut* when the subject changes; *move the camera* when the
understanding of the same subject deepens. A push-in says "this detail matters"; a cut says
"new thought." Never move the camera just because the shot has been still for a while — that's
what layered element motion and text-ins are for.

**SHOT-4 — One idea per scene.** 8–12s carries exactly one beat of the script. If the
narration makes two points, that's two scenes. (This is the script-analyzer's segmentation
law.)

**SHOT-5 — Variety audit.** Never 3 consecutive scenes of the same shot size *or* the same
scene_type. Alternate concrete (Vista/Stage/Action) with abstract (Study/Abstract) to keep
the eye reset.

---

## 2 · Composition on isometric art (COMP)

**COMP-1 — One focal point.** Every frame has a single dominant element, placed on a
rule-of-thirds power point or dead-center for symmetry-as-statement (title, outro, reveals).
On isometric plates the natural focal line is the structure's leading diagonal — put the
payoff where the diagonals converge.

**COMP-2 — Reserve negative space before generation.** Text positions (`texts[].position`)
are decided at direction time, and the plate prompt reserves that third of the frame. Never
place callouts over structural detail the narration is describing.

**COMP-3 — Depth is three bands.** Compose fg / mid / bg deliberately: foreground frames
(a wall edge, foliage), midground carries the subject, background gives context. This is what
makes Rung-2 parallax possible later — if the bands don't exist at composition time, the
scene-composer can't separate them.

**COMP-4 — Silhouette staging (Oversimplified's stage play).** Characters read by silhouette:
poses in profile or ¾, gestures outside the body outline, one character = one attitude.
Groups are staged like theatre — flat, along the stage line, facing their opponent/objective.

**COMP-5 — Safe margins.** Keep focal content inside 90% title-safe; text inside 80%. The
camera push (up to ~6%) eats the outer frame — compose knowing the edges will crop.

**COMP-6 — Light is always upper-left.** Brand invariant (see continuity registry). Every
plate, every asset, every scene. A sun that jumps sides between cuts is a continuity FAIL.

---

## 3 · The motivated camera (CAM)

**CAM-1 — Every move has a verb.** Push-in = *focus* ("look closer"). Pull-back = *reveal /
context* ("now see it whole"). Lateral pan = *journey / comparison* ("travel this aqueduct",
"compare these two"). Vertical pan = *ascent/descent, hierarchy* ("13 storeys down"). If you
can't name the verb, the camera doesn't move.

**CAM-2 — The camera is a surveyor, not a drone.** Slow, deliberate, weighty. One move per
scene; the move spans the whole scene duration; it begins and ends at rest (eased both ends,
0.5–1s hold at each end). Numeric limits in `brand_guide.md § Motion Identity`.

**CAM-3 — Direction persistence.** If scene N pans right following a water channel, scene
N+1 must not pan left on the same subject. Reverses need a reason the viewer can feel
(the journey turning back, a comparison flipping).

**CAM-4 — Save the pull-back.** The pull-back-to-reveal is the strongest move in the
vocabulary — spend it on scale payoffs (the full stepwell, the whole aqueduct route), at most
2–3 per video, ideally on the beat-sheet's scale/payoff beat.

---

## 4 · Rhythm & pacing against VO (RHYTHM)

**RHYTHM-1 — Animate to track.** The VO is recorded *before* the AE build. Scenes are timed
to the real read, not estimates; every AE render carries ~1s handles so Premiere conform is
trim-only.

**RHYTHM-2 — Cut on narration beats.** Scene changes land on sentence boundaries or breath
points of the VO — never mid-clause. In Premiere, favour J-cut feel: let the next scene's
subject be *named* by the VO ~0.5s before or after the cut, not long before.

**RHYTHM-3 — Let numbers land.** After the VO delivers a key figure (13 storeys, 3,500
steps, 6 °C cooler), hold ~1s with the supporting visual static or nearly static before the
next motion or text-in. Data needs silence around it.

**RHYTHM-4 — The 8-second law.** No visual configuration persists unchanged longer than ~8s.
Within an 8–12s scene something must evolve — the camera easing, a callout entering, a layer
drifting. (One camera move + one text-in usually satisfies this for the whole scene.)

**RHYTHM-5 — Density waves.** Alternate dense scenes (diagram + callouts + motion) with
breathing scenes (vista, slow push, no text). Two dense scenes in a row maximum. The
beat-sheet's emotional peaks get the dense treatment; transitions between beats get air.

**RHYTHM-6 — Scene budget.** 8–12s per scene, 60–80 scenes per 10–13 min video. Under 8s
only for deliberate staccato runs (montage of failures, rapid comparisons — max one run per
video); over 12s only when a single continuous motion genuinely needs it (a route arrow
crossing a map) — and it must still obey RHYTHM-4 internally.

---

## 5 · Staging, screen direction & the axis (STAGE)

**STAGE-1 — The axis rule for maps and journeys.** Establish a direction of travel and keep
it: if water flows left→right in the first cross-section, it flows left→right in every
subsequent one. If the trade route runs west→east as rightward, all its scenes keep that
screen direction. Flipping the axis mid-video reads as the flow reversing.

**STAGE-2 — Opposing forces own their sides.** In any conflict/comparison framing (attackers
vs defenders, before vs after, Rome vs Carthage), each side owns a screen half for the whole
video. Left/right assignment is recorded in the continuity registry at direction time.

**STAGE-3 — Characters enter from their side.** A character travelling toward a goal moves
toward it consistently across scenes; arrivals enter frame from the side they last exited.

**STAGE-4 — Stage flat, like Oversimplified.** Character scenes are theatre: a flat ground
plane, characters arranged along it, camera straight-on. Don't mix theatrical character
staging *into* an isometric plate's projection — characters on iso plates appear as tiny
scale silhouettes only.

---

## 6 · Continuity (CONT)

**CONT-1 — The registry is law.** `storyboard.json` v2 carries a `continuity_registry`:
light direction (upper-left, always), per-character costume/props, map orientation & palette,
side assignments (STAGE-2), recurring props. Every scene spec cites the entries it touches;
the visual-accuracy-gate checks renders against the registry.

**CONT-2 — Same asset, same file.** A recurring element (the water pot, the fort tower, a
character) is the *same PNG from `assets_library/`* in every appearance — never regenerated
per scene. Recognition is a retention device; drift breaks it.

**CONT-3 — Time moves one way.** Light/season/water-level states progress monotonically
through the video's narrative unless the script explicitly flashes back (and then the
transition grammar must mark it — see TRANS-3).

---

## 7 · Text & callout choreography (TEXT)

**TEXT-1 — One idea per callout, ≤6 words** (numbers + unit count as one word). If it needs
a second line, it's narration, not a callout.

**TEXT-2 — Enter after the ear, exit before the cut.** Text appears 0.2–0.5s *after* the VO
speaks the fact it reinforces (eye follows ear), and leaves ≥0.5s before the scene ends.
Never cut a scene with text still on screen.

**TEXT-3 — Text motion is furniture, not performance.** In/out per brand spec (fade + small
rise, ~300ms). No bounces, typewriters, or per-word cascades. Emphasis comes from the accent
color on a single word/number, not from movement.

**TEXT-4 — Max two callouts alive at once,** and only when they're a pair (e.g. two ends of
a comparison). Sequential beats get sequential callouts.

---

## 8 · Transition grammar (TRANS)

**TRANS-1 — Cut is the default** (≥90% of edits). Cuts are invisible when RHYTHM-2 is obeyed.

**TRANS-2 — Crossfade (~0.5s) means time passing** — seasons, construction progress, decades.
Never use it as decoration between simultaneous ideas.

**TRANS-3 — Match-cut links concepts.** Align the outgoing and incoming focal points (the
well's square mouth → the map's square marker) to say "these are the same idea." Budget: 2–3
per video; they're precious. A flashback or era jump gets a marked transition (crossfade +
palette shift), never a bare cut.

**TRANS-4 — Forbidden:** whips, spins, zoom-blur transitions, star wipes, glitches, any
preset that draws attention to the edit. The brand moves like a surveyor (CAM-2), including
between scenes.

---

## 9 · Animation principles for transforms-only motion (ANIM)

The subset of the classic 12 principles that applies when art is never redrawn:

**ANIM-1 — Slow in, slow out — always.** Every keyframe pair is eased (F9 minimum; curve
influence per brand spec). Linear motion reads as mechanical error.

**ANIM-2 — Anticipation, in moderation.** Before a significant element motion (an arrow
launching across a map), give 2–4 frames of small counter-motion or a beat of stillness.
Skip it for ambient drift (clouds, water shimmer).

**ANIM-3 — Secondary action: one accent layer max.** The scene's main motion may be
supported by *one* subordinate ambient motion (dust, cloud drift) at low amplitude. Two
supports = clutter (also motion-director's ≤2-moving-elements law).

**ANIM-4 — Weight through timing.** Heavy things (stone, water mass) move slow with long
eases; light things (birds, dust) move quicker with shorter eases. Nothing in this channel
is bouncy; nothing overshoots except deliberately comedic character beats (≤1 per video).

**ANIM-5 — Offset your loops.** Ambient loops (`loopOut`, wiggle) on multiple instances must
be de-synced (different seeds/phase) — synchronized clouds read as broken.

---

## 10 · The animatic discipline (ANIMATIC)

**ANIMATIC-1 — Cut the animatic before building.** After stills pass the accuracy gate and
VO is recorded, assemble stills + VO with `video_assembler.py` (its post-pivot job) into a
rough animatic. Watch it once, full length.

**ANIMATIC-2 — Fix pacing in the board, not in AE.** A scene that drags in the animatic
drags worse animated. Re-time, merge, or cut scenes *in the storyboard* before a single AE
comp is opened. AE hours are the pipeline's scarcest resource; the animatic is how they're
protected.

---

## 11 · Direction QA checklist

Run by the studio-director before the final human gate; the render QC (visual-accuracy-gate
Layer 3) re-checks the built scenes.

- [ ] PRIME-2: every scene passes the 2-second test as a still
- [ ] SHOT-4: one idea per scene; SHOT-5: variety audit clean
- [ ] CAM-1: every camera move has a nameable verb
- [ ] RHYTHM-2/3: cuts on VO beats; holds after numbers
- [ ] RHYTHM-4: nothing static >8s; RHYTHM-6: durations in budget
- [ ] STAGE-1/2: axis and side assignments consistent with the registry
- [ ] CONT-1/2: registry cited; recurring assets are the same files
- [ ] TEXT-1/2: callouts ≤6 words, enter after the ear, exit before the cut
- [ ] TRANS-1/4: cuts default, nothing from the forbidden list
- [ ] ANIM-3: ≤2 moving elements per scene, ≤1 secondary action

---

## Sources & further study

Distilled July 2026 from film/animation craft practice plus:

- [Motion Graphics with Kurzgesagt (Skillshare)](https://www.skillshare.com/en/classes/motion-graphics-with-kurzgesagt-part-1/631970755) — AE workflow, expression loops, time remapping
- [10 Principles of Motion Design (Feelpixel)](https://medium.com/@feelpixelwork/10-principles-of-motion-design-5d1c6f16b9df) — timing/rhythm, simplicity
- [OverSimplified: a YouTube empire (Creator Handbook)](https://www.creatorhandbook.net/oversimplified-a-youtube-empire/) — "stage play" cinematography, AE + Photoshop pipeline
- [Staging in Animation (Character Bazaar)](https://www.characterbazaar.com/blogs/staging-in-animation) — silhouette & staging
- [J-Cuts and L-Cuts guide (Miracamp)](https://www.miracamp.com/learn/video-editing/j-cuts-and-l-cuts) — VO-led cutting
- [Cinematography for Storyboard Artists (StoryboardArt.org)](https://storyboardart.org/storyboard-tutorials/cinematography-and-film-for-storyboard-artists/) and [Film Continuity for Storyboard Artists](https://storyboardart.org/storyboard-tutorials/continuity-for-storyboards/) — shot grammar, continuity
- [The 180-Degree Rule (MasterClass)](https://www.masterclass.com/articles/understanding-the-180-degree-rule-in-cinematography) — axis & screen direction

*Related docs: `brand_guide.md` (identity + Motion Identity numbers) ·
`docs/after_effects_workflow.md` (how motion is built) · `assets_library/STYLE_BIBLE.md`
(art rules) · `docs/storyboard_schema.md` (where direction is recorded).*
