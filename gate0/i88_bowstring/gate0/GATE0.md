# Gate 0 — `I88`, "'sine' was a bowstring"

Proposed 2026-10-05. Backlog id `I88` (§1 *Things you touch every day* → accent `data #AD88FF`; every
phone has the sin button, every viewer sat through it at school). **Reasoned from scratch** from the
owner's brief — *"explain why there was need of sine wave in mathematics: what real world problem we
were solving"* — after the other half of the brief (*"why we have 0s and 1s"*) was split off as its own
reel, `I89`, to be minted only when this one is done. Fusing them was refused in Stage 1: five beats of
setup before any frame is impressive is kill condition 3.

**No reel number is claimed.** `r018` is taken *if built* by `I87` (research and an approved script
exist). Whichever starts its first `.tsx` first claims it.

Nothing has been built. This file and `payoff_frame.png` are the two artefacts CLAUDE.md requires
**before** any Python, any `.tsx`, any data module.

## 1. The sentence

> **"'Sine' is a mistranslation of the Sanskrit word for a bowstring, and the maths behind it was
> built to work out where the planets are."**

Short form for the title: **"SINE" WAS A BOWSTRING.** (Tightened at G4 to *half* a bowstring if the
copy column can carry it — see §5, the one place the headline is looser than the fact.)

No CS word. "Sine" is a school word, not a developer noun. "Sanskrit" and "planets" are civilian.

## 2. Who does the viewer send this to, and what are they proving? (GATE 3, drafted)

**Sent to whoever said "when will I ever use trigonometry", to prove it was built to find things in
the sky.**

| condition | verdict |
|:--|:--|
| Personally witnessed the evidence | **Yes, in a school sense.** Everyone sat through sine and most remember asking what it was for. They have not seen the bow, which is the reel's contribution |
| A dispute already running, that a non-specialist is in | **Weak.** "When will I ever use this" is a standing complaint, not a two-sided argument. Nobody is publicly wrong about it and corrected. By the letter of the r005 test this scores about what `I82` scored: **polite, not heated** |
| Resolves to one repeatable thing | **Yes:** "sine is half a bowstring, and it was invented for the planets" |

**Heat: what the loser stands to lose.** This is the axis `r011` taught (`what_travels.md` §G), and
it is where this concept is weakest. The person who said "trig is useless" loses almost nothing by
being wrong; "I was bad at maths" is the only stake and it is mild. **By the heat hypothesis this
reel should not travel like `r005`, and that is stated here, before building, so it cannot be
explained away afterwards.**

**The honest channel is a different one, and it is not in the table.** Two things could carry it, both
unproven on this account: (a) **surprise** — a word everyone owns turns out to be a mistake with a
story, which is high-novelty if the viewer has genuinely never heard it, and weak if "did you know"
etymology is a saturated genre (it may well be: that check is a genre check, not a subject check, the
`r009` lesson); (b) **identity** — Indian astronomers made the half-chord, and a viewer from that
tradition may send it on pride. `r016` was deliberately framed for a US audience at the owner's
direction, so (b) pulls against the current framing. Neither is argument ammunition.

**Pre-registered reading (proposed — owner to change before posting).** Measure sends and saves *per
reach*, separately (`r011`'s split: ammunition → shares, utility → saves; here shares is the channel
under test):

| shares / reach at day 2–4 | reading |
|:--|:--|
| **≥ 0.6%** (half of r005's 1.203%) | the surprise/identity channel travels. Mint more reels on it |
| **0.2% – 0.6%** | in the r016/r017 band: a mild-heat reel moves like a mild-heat reel. No new information |
| **< 0.2%** | inside the band `r011` named as falsifying. Trivia-shaped, no-heat concepts do not travel on this account |

**Saturation risk, stated up front.** "Where the word X comes from" is a mature genre. What the
etymology-only video does not have is the *object*: a bow, drawn over the circle every viewer has
seen, with the amber half-string labelled SINE. The reel is the bow plus the sky, not the word chain
alone.

## 3. The payoff frame

`payoff_frame.png`, drawn by `mock_payoff.py` (Pillow + numpy). A sketch, not a render.

- An archery bow, arrow nocked, whose limb is an arc of the faint school-diagram circle and whose
  string is that arc's chord. **The upper half of the string is the one amber element, bracketed and
  labelled SINE** — the name rides on the object.
- Beneath it the word chain, one block: **jya → jiba → jaib → sinus**, each with what it meant
  (bowstring · just a sound · a fold, a bay · Latin: a fold), captioned SANSKRIT → ARABIC → LATIN.
- A strip of sky with a planet's looping path and the line **THE JOB: WHERE WILL MARS BE?**
- Three text blocks, within the three-block rule; the script asserts all 13 pieces of text and all
  geometry sit inside the safe area.

**The planet loop is hand-made.** It is an epicycle sketch, not an ephemeris and not Aryabhata's
table. **The build will not be this frame**: it replaces the sketch with a computed planetary path
and Aryabhata's real table (§6), and in 3D the move is the bowstring going taut and the arc-to-chord
construction turning into the sky-tracking triangle.

## 4. Kill conditions: the gate's own three

| Condition | Verdict |
|:--|:--|
| The sentence needs a CS word | **Pass.** None. |
| The payoff frame shows an object the viewer has never seen | **Pass, with one risk.** A bow, an arrow, a circle, a night sky: all nameable with the sound off. **The risk is that the circle-and-chord is, to most viewers, a diagram from school** — a picture *of* an idea. The bow is what makes it an object; if the build lets the bow shrink into a labelled diagram, this condition fails. Non-negotiable 6: the bow stays on screen, or in frame, for the whole reel |
| The amazement depends on understanding first | **Pass, narrowly.** The bow-becomes-the-textbook-diagram reveal is a one-second picture-first surprise, and *why it was needed* (the planets) is the reward for staying. **This is still the condition most likely to kill it**: if the reveal needs a sentence of setup, it is a blog post. G4 must put the bow in the first second, the word "sine" over it, and nothing explained before it |

## 5. Numbers, claims, and where they came from

All **search-level** (2026-10-05) — secondary sources, one open-access paper. **No primary reading yet.**
Wikipedia is blocked by the cloud egress proxy; the sources below are what came back.

| Claim | Source (secondary) | Status |
|:--|:--|:--|
| *jya* is Sanskrit for **bowstring**; in mathematics, the chord of a circle | MacTutor "Trigonometric functions"; Britannica "Trigonometry — India and the Islamic world" | search-level |
| Aryabhata's term **ardha-jya / ardha-jiva = "half-chord"**, shortened to *jiva*; **the sine is half the chord of double the angle**: crd(θ) = 2 sin(θ/2) | same; Singh, arXiv 2309.13577 | search-level |
| Arabic transliterated *jiva* as ***jiba*** (a non-word in Arabic) | same | search-level; **"a non-word" is from memory, to verify** |
| Written without vowels, *jiba* is the same as ***jaib*** ("bay", "fold", "bosom") | same | search-level |
| **Robert of Chester and Gherardo of Cremona**, Toledo, 12th century, rendered it **Latin *sinus*** ("fold, bay"), which became "sine" | same; ProofWiki / MathDoctors | search-level; **who did which, and the date, to verify** |
| Aryabhata's table: **24 values**, step **3.75° = 225′**, radius **3438** (so one arc-minute = one unit of length), c. **499 CE** | Singh arXiv 2309.13577; Clark Univ. note; MacTutor | search-level; **we recompute it and compare to modern sine in Stage 3** |
| The table was made **for computing the planets / eclipses / calendar** | the *Āryabhaṭīya* is an astronomical treatise | **LEAD.** *"built to work out where the planets are"* is the sentence's second half and has NO primary source yet. If the table's stated use is narrower (a calendar, an eclipse), the copy changes — see "AN APPROVED SCRIPT DOES NOT MAKE A CLAIM TRUE" |

**What is NOT claimed, and must not become claimed by accident:**

- **That Aryabhata invented the sine.** The half-chord was in the *Siddhāntas* tradition before him
  (the *Sūrya Siddhānta* is usually placed earlier). The copy says **"Indian astronomers"**, never one man.
- **That the Greeks did not use trigonometry for the same job.** Hipparchus and Ptolemy built chord
  tables for the same sky. The *difference* is full chord against half chord, and that must be the
  honest framing — "India switched to the half", not "India started".
- **That "sine WAVE" came from this.** The *wave* (Euler's and Bernoulli's vibrating string, then
  Fourier on heat in a metal bar) is a different story and a different century. The reel is about the
  function's origin; it must not slide into the wave without saying so, or it answers the owner's brief
  falsely. **The brief said "sine wave" and this reel answers "sine". That mismatch is raised at G2.**
- **"Mistranslation" vs "misreading".** *jiba* was *transliterated* into Arabic, then a translator
  *misread* the unvowelled Arabic as *jaib*. "Mistranslation" is the common word and is not wrong;
  the build's on-screen version should show the misreading step, because it is the actual mistake.

## 6. Data and licence (beside the friend test)

- **Aryabhata's table**: a 6th-century text. The figures are facts, not a database, and the table is
  24 integers. Free to use and to recompute.
- **Etymology and history**: published facts, citable. No dataset, no geometry database, no
  TeleGeography-style licence trap.
- **The sky**: the planetary path is computed (Python `ephem` / JPL ephemeris via `skyfield` or a
  hand-rolled Kepler solver), not a data purchase and not drawn. ₹0. No image model.
- **Bow, arrow, circle**: drawn in code.

## 7. The research question that could still kill it

Stage 3 has one question that decides whether this reel exists: **was the half-chord actually made for
the sky, in the source's own words?** If the *Āryabhaṭīya* gives the table for a purpose the viewer
would not call "the planets" (a calendar, a clock, mensuration), the second half of the sentence dies,
the reel is a word-origin video with no job, and by this file's own §2 it should not be built. That is
`I53`'s shape — a figure kills it — and it is cheaper to find out now than at the render.

## 8. What happens next

1. **Owner decision (G2):** would you say the sentence in §1 to someone? And the §5 mismatch — the
   brief asked for the sine *wave*; this answers the *function*. Say yes to that, or redirect.
2. **G3** is named in §2 and is graded **weak on heat**, with the pre-registered reading above.
3. Then Stage 3 (§7), then `SCRIPT.md` at G4. Nothing else is built before those.
