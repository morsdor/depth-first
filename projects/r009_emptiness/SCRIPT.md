# r009 · I70 — script rewrite v2

**Written 2026-09-11, after the first viewer read of the 53 s cut.** The verdict was that the
craft is right and the *message* is not: *"I had a hard time understanding what it had to convey.
We don't know what we are comparing against. The sphere can also tell us what it represents."*

This document is the **script first, animation second** — the order the reel was not built in.
`NOTES.md` describes the build that exists; this describes the one that should. Nothing here
changes a measured figure, and the Gate 0 sentence is untouched:

> **"Everyone shows you how big stars get. Nobody shows you the emptiness — the biggest star
> anyone has found would still be a speck in the gap between two ordinary ones."**

The v1 cut does not deliver that sentence. It delivers nine facts, one of which is that sentence.

---

## 1. What is actually wrong — four defects, in order of damage

### D1 — the reel changes its yardstick eight times in nine beats

Beat by beat, what v1 asks the viewer to compare with:

| Beat | The ruler it uses |
|:--|:--|
| sun | Earths across (109) |
| giant | Suns across (1,540) |
| orbits | astronomical units, planet orbits (7.16 AU, Saturn) |
| saturate | percentage spread between five radii (8.7%) |
| break | biggest stars laid end to end (18,749) |
| hood | star systems per light-year radius (25 / 12 ly) |
| nebula | gaps per nebula width (5.7) |
| galaxy | percent of a galaxy diameter (0.0042%) |

**Seven different rulers, none of which survives into the next beat.** So when the payoff number
lands — 18,749 — the viewer has nothing in hand to feel it against, because the unit it is
measured in was invented four seconds earlier and is never used again. That is exactly
*"we don't know what we are comparing against"*, and it is the whole defect.

The fix is not more explanation. It is **one ruler, stated once, used four times, never replaced.**

### D2 — the sphere is never told what it is, on itself

Titles live at `y=300`. Captions live at `y=1300`. The object is at `y 520–1140`. The viewer's eye
is on the glowing ball and every word is somewhere else, in a block that swaps out between beats.
When two bodies share the frame — the Sun beside the giant — **nothing on screen says which is
which**, so "1,540 times wider" is a claim about two unlabelled circles.

### D3 — the biggest text on screen is a catalogue number

`WOH G64` runs at 92 px, the largest type in the reel. It is the astronomy version of a developer
noun and it violates non-negotiable 6 as squarely as "Reed–Solomon" would. Same for `AU`,
`PROXIMA`, `4.2465`, `R☉`, `8.7%`, `systems`. A viewer cannot repeat any of them to a friend.

### D4 — the hook's words and its picture are about different objects

At `t=0` the title says **THE BIGGEST STAR EVER MEASURED IS ABOUT TO VANISH** and the screen shows
**Earth**. The promised object does not appear for another 8.7 seconds. The words are a good
promise attached to the wrong frame, which is a worse failure than r008's label — r008 at least
described what was there.

### D5 (consequence, not a cause) — 18 of 53 seconds are a different reel

`hood`, `nebula`, `galaxy` open three new scales *after* the payoff has already landed at `t=31`.
They are also, by `NOTES.md`'s own audit, where the motion dies (31% event density, "the wide
rungs are the cause"). One cut fixes the comprehension problem and the motion problem together.

---

## 2. The one rule that fixes D1

**Every number on screen answers the same question: _how many of the last thing fit across the
next thing?_**

The reel already computes that number four times and then hides three of them under other units:

```
Earth  -> Jupiter          x11
Jupiter-> the Sun          x10
the Sun-> the biggest star x1,540      <- sizes stop here
that star -> the gap       x18,749     <- distances do not
```

That is the entire argument, and it is comparable *because one question produced all four
numbers*. 11, 10, 1,540 — and then the thing that beats the biggest star by twelve times over
is **not a thing at all**. Say it in one ruler and no one needs it explained.

Everything that cannot be expressed in that ruler is either demoted to a wordless beat or cut.

---

## 3. The script

**Runtime 44 s.** Narration is the on-screen wording, verbatim. `TITLE` is the Archivo Black block,
`CAPTION` the Plex rows beneath, `LABEL` a tick that rides **on the body in world space**.

### B1 · 0.0–5.0 — the promise, on the object it promises

> **TITLE** THE BIGGEST STAR
> **TITLE** ANYONE HAS EVER MEASURED
> **TITLE (accent)** IS ABOUT TO VANISH
> **CLOCK** GONE IN 30.0s

**On screen:** cold open **on the giant**, amber, filling ~half the stage, already breathing.
`LABEL` on the body: `THE BIGGEST STAR WE HAVE MEASURED`. Clock in from 1.0 s.

**Why:** fixes D4 — the promised object is the object. It also satisfies non-negotiable 6 properly
for the first time: this star is now on screen from frame 1 to the vanish, so the reel never leaves
its recognisable object. Opening on the payoff object is the `equation.verse` order — amazed first,
understanding is the reward for staying.

### B2 · 5.0–9.0 — the ruler is set, in words, once

> **TITLE** TO SEE HOW BIG,
> **TITLE** START WITH EARTH
> **CAPTION** Jupiter is 11 times wider
> **READOUT** ×11 WIDER

**On screen:** hard cut down to Earth alone, `LABEL: EARTH`. Jupiter swells in beside it,
`LABEL: JUPITER`. **Earth stays on screen, labelled, while Jupiter grows** — the comparison is two
labelled objects in one frame, never a swap.

**Why:** the ruler is introduced in a sentence a child could repeat, and the `READOUT` slot is
born here. From now on **that slot never changes its wording, only its number.**

### B3 · 9.0–12.5 — rung two, same ruler

> **TITLE** OUR SUN
> **CAPTION** 10 times wider than Jupiter
> **READOUT** ×10 WIDER

**On screen:** Jupiter holds, labelled, while the Sun grows past it. Jupiter does not disappear
until the Sun is at full size.

**Cut from v1:** *"109 Earths across"* — a second ruler in the same breath as the first, and the
beat does not need it.

### B4 · 12.5–18.0 — the giant comes back, and now the number means something

> **TITLE** AND BACK TO THE BIG ONE
> **CAPTION** 1,540 times wider than the Sun
> **CAPTION** first star ever photographed outside our galaxy
> **READOUT** ×1,540 WIDER

**On screen:** the giant swells back in. **The Sun stays on screen as a labelled dot beside it for
the entire beat** — `LABEL: OUR SUN`, with a leader line, because a 0.3 px unlabelled dot is not a
comparison. The giant keeps its own label.

**Why:** fixes D2 and D3 at once. `WOH G64` is demoted out of the title entirely; if the name is
wanted at all it goes in 30 px grey as a credit (`WOH G64 A · ESO, 2024`), never as the headline.
The claim the viewer repeats is *"the biggest star ever measured"*, not a catalogue string.

### B5 · 18.0–21.5 — one wordless beat for what 1,540 feels like

> **TITLE** DROP IT WHERE THE SUN IS
> **CAPTION** it reaches out past Jupiter

**On screen:** the existing orbit beat — rings drawn outward from the giant's seat, Jupiter's ring
swallowed. **No number, no readout.** The `READOUT` holds at ×1,540 untouched.

**Cut from v1:** `7.16 AU · short of Saturn`. `AU` is the purest jargon in the reel and "short of
Saturn" weakens the beat by making the giant sound small at the exact moment it should feel huge.

### B6 · 21.5–25.5 — sizes stop

> **TITLE** AND THAT IS WHERE
> **TITLE (accent)** SIZE STOPS
> **CAPTION** the five biggest ever found, in two galaxies
> **CAPTION** all of them the same size
> **READOUT** ×1,540 WIDER — STILL

**On screen:** the five largest travel in on the wave, near-identical. The `READOUT` visibly
refuses to climb — that is the beat's whole job.

**Changed:** `all within 8.7%` becomes `all of them the same size`. The 8.7% is true, is in
`NOTES.md`, and is a sixth ruler on screen. Plain words carry the same claim and the source record
carries the rigour.

### B7 · 25.5–36.0 — the gap. The payoff. **Vanish at t=31.0, as promised.**

> **TITLE** NOW THE GAP
> **TITLE** TO THE NEXT STAR ALONG
> **TALLY LABEL** OF THAT STAR, SIDE BY SIDE, TO CROSS IT
> **TALLY** 1 → **18,749**
> **STAGE** OUR SUN · · · · · · · · · · · · · THE NEXT STAR
> **STAGE (accent)** FOUR LIGHT-YEARS OF NOTHING
> *(31.2)* **TITLE** IT IS IN THERE.
> *(31.2)* **TITLE (accent)** YOU CANNOT SEE IT.

**On screen:** unchanged from v1 — and this beat's animation is already the best thing in the reel.
The only changes are words:

- `BIGGEST STARS, LAID END TO END` → **`OF THAT STAR, SIDE BY SIDE, TO CROSS IT`**. The v1 label
  never says *across what*, which is D1 arriving at the worst possible moment. "That star" points
  back at the object the viewer has been watching for 31 seconds.
- `PROXIMA` → **`THE NEXT STAR`**. Its name is not the point and costs a beat of recognition.
- `4.2465 LIGHT-YEARS OF NOTHING` → **`FOUR LIGHT-YEARS OF NOTHING`**. Five significant figures is
  a research artefact, not a script. The exact value stays in `NOTES.md` where it belongs.
- The v1 title `NOW THE GAP TO THE NEXT STAR` runs to 30.4 and the tally to 35.0 — **four text
  blocks and three type scales at the single most important moment of the reel**. Retire the
  `y=690` line by 29.0 so that from 29.0 the frame carries the tally and the two end ticks only.

### B8 · 36.0–44.0 — the close, and the thing the viewer repeats

> **TITLE** SPACE ISN'T BIG.
> **TITLE (accent)** SPACE IS EMPTY.
> **CAPTION** The biggest star we've ever found, 18,749 times over,
> **CAPTION** just to reach the one next door.
> **CAPTION (grey)** Next: the traffic jam with no cause — and why it moves backwards.

**On screen:** **stay on the gap.** Do not pull back to the galaxy.

**Why:** non-negotiable 9 wants a reason to follow, and the honest reach-test answer in
`gate0/GATE0.md` §4 was that the one thing making this sendable is that it settles *"space is
mostly empty"*. So the close states that claim in the form it gets argued in. Pulling out to the
galaxy at `t=44` opens a brand-new scale at the exact moment the viewer should be sitting with one
fact, and it is the rung the audit already flags as dead.

---

## 4. The jargon kill list

| v1 on screen | v2 | Why |
|:--|:--|:--|
| `WOH G64` (92 px title) | `THE BIGGEST STAR WE HAVE MEASURED`; name demoted to a 30 px credit | a catalogue designation is a developer noun |
| `7.16 AU · short of Saturn` | *(cut — beat goes wordless)* | `AU` is unreadable to a civilian and the clause deflates the beat |
| `PROXIMA` | `THE NEXT STAR` | the name is not the claim |
| `4.2465 LIGHT-YEARS` | `FOUR LIGHT-YEARS` | five sig figs is a research artefact |
| `all within 8.7%` | `all of them the same size` | a sixth ruler, for no gain |
| `109 Earths across` | *(cut)* | a second ruler inside the first beat that uses one |
| `25 systems, 12 light-years` | *(beat cut)* | ruler five |
| `that is 5.7 of those gaps across` | *(beat cut)* | ruler six |
| `that gap is 0.0042% of the way across` | *(beat cut)* | ruler seven |
| `BIGGEST STARS, LAID END TO END` | `OF THAT STAR, SIDE BY SIDE, TO CROSS IT` | names the comparison at the payoff |

---

## 5. What the animation has to change — small, and mostly additive

The existing 3D is kept almost entirely. Four asks, in cost order:

1. **`BodyLabel` — a new component, and the one the viewer actually asked for.** A tick line plus a
   Plex Mono caps name, positioned from the body's world coordinates so it tracks the sphere rather
   than sitting in a fixed slot. Every hero body carries one the whole time it is on screen. This
   is D2, and no amount of caption rewriting substitutes for it.
2. **The previous rung does not leave until the next one is at full size.** Earth stays while
   Jupiter grows; Jupiter stays while the Sun grows; **the Sun stays, labelled, through the entire
   giant beat.** A comparison needs both terms in the frame simultaneously.
3. **`Readout` — one persistent slot** (suggest `y≈1180`, where the tally later lands, so the eye
   already knows to look there) whose wording never changes and whose number steps
   `×11 → ×10 → ×1,540 → (holds) → 18,749`. The tally at B7 is then not a new object, it is this
   slot finally breaking.
4. **Re-base the opening to the giant's rung.** `VIEW[0]` becomes the giant's scale, cuts to Earth
   at 5.0, and climbs back. `viewKm` is log-interpolated and each beat already owns its origin, so
   this is a keyframe-table edit, not an architecture change. `VANISH` stays **31.0** — the clock
   is a contract.

Cut from the composition: `HoodGroup`, `NebulaGroup`, `GalaxyGroup` and their `VIEW` keyframes past
36.0.

## 6. What the cut buys, and what happens to it

**Runtime 53 s → 44 s.** Nine beats → eight, and the eight are one argument instead of nine facts.

**The cut third is a sequel, not a deletion.** `hood` / `nebula` / `galaxy` — 25 real neighbouring
systems in true 3D, the Orion Nebula at its measured width, the galaxy with the Sun pinned at its
real radius — is a coherent reel of its own (*"how empty is empty"*) and the code for all three
stays in `Emptiness.tsx` behind its beat gates. It is stranded here only because it arrives after
the payoff and speaks in three more rulers.

**The event-density problem goes with it.** `NOTES.md` names the wide rungs as the cause of the 31%
and says *"if it reads static, the wide third is where to cut"*. It read unclear rather than static,
and the wide third is still where to cut. Re-audit after the re-cut; the remaining beats are the
ones that already scored well.

---

## 7. What did NOT change

- The Gate 0 sentence, approved by the human before the build.
- Every measured figure and its provenance. `scale_ladder.py`, `emit_ts.py` and its assertions are
  untouched; v2 puts fewer of those figures on screen and none of them differently.
- The palette, the chrome, the breath, the safe-area budget, and the `viewKm` architecture.
- The reach-test verdict in `gate0/GATE0.md` §4 — still 1 of 3, still the honest weak point, and a
  clearer script does not repair a missing dispute. What it does repair is the part that was
  inside our control.

---

## 8. As built — 2026-09-11, the same day

**v2 is built, rendered and audited.** `Emptiness.tsx`, `r009_emptiness.mp4`, `NOTES.md`. What the
build changed about the plan above, and why:

- **40 s, not 44.** The audit decides beat length on an almost-empty frame, and the two beats the
  plan gave the most room to — the hook and the tail — are the two that cannot fill it. See
  `NOTES.md`, "v2, 0".
- **No `BodyLabel` credit line.** The plan demoted `WOH G64 A · ESO, 2024` to a small credit under
  the body. `brand:check` enforces a 36 px type floor, so there is no such thing as a small credit
  here — at 36 px it reads as a second name. The designation is in `NOTES.md` with its paper,
  which is where a source belongs; nothing on screen names it.
- **No B4 caption at all.** With two body names, the ruler and the countdown, the giant beat was
  already carrying four text blocks; the fifth made the still unreadable.
- **`two galaxies, all the same size` → `none of them bigger`.** 8.7% is 15 px at the size those
  five discs are drawn, and it is visible. The stronger claim was also the false one.
- **Ruler reads `×11.2 / ×9.7 / ×1,540`, not `×11 / ×10`.** Rounding 9.73 to 10 in the slot the
  whole reel resolves against is the kind of tidy-up non-negotiable 7 exists to stop. The title
  says "each one about ten times the last", which is the honest version in words.
- **The end ticks track the gap's ends** rather than sitting at x=60/x=1020, and a retiring rung
  now fades at the page margin instead of sliding off the edge — both found by measuring the mp4,
  not by reading the code.
