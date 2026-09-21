# Formula Library — v1.2

*Part of the [pipeline docs](pipeline_automation.md). Added July 21, 2026 with the
packaging-research system. This is the **one canonical list** of title formulas:
`channel_strategy.md` §4 points here, the Packaging gate generates title
candidates from here, and `scripts/tag_outliers.py` labels every row of
`data/outliers.csv` against these ids. If a pattern isn't in this table, it doesn't
exist as far as the pipeline is concerned.*

## How the library is used

1. **Choosing what to make (Packaging).** Topic selection starts from the data, not a
   blank page: after a refresh, `scripts/tag_outliers.py` prints the **top-3 formulas**
   currently breaking out across the comp set ([outlier_system.md](docs/outlier_system.md)).
   Generate ~25 title candidates across several formulas, weighted toward those top-3 —
   the concept only earns production hours once one of those titles survives the gate.
2. **Tagging evidence.** The tagger sends the table below to Claude and writes a
   `formula_tag` + one-line `why` per outlier — over time `data/outliers.csv` becomes a
   per-formula scoreboard of what actually earns clicks around our niche.
3. **Growing the library.** When the tagger keeps returning `none` for a repeating kind
   of title, that's a new pattern knocking — add it as the next F-id (rules below).

## The formulas

<!-- MACHINE-READABLE: scripts/tag_outliers.py parses rows matching `^| F<n> |` and
     reads the first three columns (id, name, pattern). Keep F-ids in THIS table only. -->

| ID | Name | Pattern | Psychological driver | Example (our niche) | Failure mode |
|:--|:--|:--|:--|:--|:--|
| F1 | The Extremity Frame | "The [Insane/CRUEL/Incredible/Mind-blowing] [X]" | Extremity framing — an intense adjective promises the subject is more extreme than you can picture; scale is one flavor, brutality and cleverness are others | The Insane Logistics of Feeding Ancient Rome · The CRUEL Physics of a Tsunami | The adjective writes a cheque the video can't cash — merely large or interesting, not extreme; burns an expert audience fast |
| F2 | Why X Is/Isn't Y | "Why [X] Is/Isn't [Y]" | Resolves a tension the viewer half-noticed but never got answered | Why Roman Concrete Outlasts Ours | Dead on arrival if the viewer never felt the tension — it must pre-exist the click |
| F3 | How X Almost Broke Y | "How [X] Almost Destroyed/Broke [Y]" | Near-miss stakes — survival was contingent, not inevitable | How One Flood Almost Erased Venice | An "almost" that was never actually close burns trust with an expert audience |
| F4 | The $N Billion X | "The $[N] Billion [X] That [Y]" | A hard number anchors scale and stakes before the click | The $2 Billion Canal Nobody Uses | A figure that's unverifiable, unremarkable — or quoted in rupees the Tier-1 audience can't feel |
| F5 | X's Y Problem | "[X]'s [Y] Problem" | An admired thing with one named structural weakness | The Suez Canal's Sand Problem | "Problem" left vague — it must be specific, structural, and real |
| F6 | The Last/Only/Largest X | "The Last/Only/Largest [X] (Ever Built)" | Superlative scarcity — the one member of the category that matters | The Largest Machine the Ancient World Ever Built | A contestable superlative — one wrong "only" and the comment section becomes the video |
| F7 | Why Nobody Can X | "Why Nobody Can [Rebuild/Copy/Explain] [X]" | Lost-knowledge mystery — modern capability failing at an old feat | Why Nobody Can Rebuild the Pantheon's Dome | Deflating when the honest answer is mundane (cost, permits, priorities) |
| F8 | How X Actually Works | "How [X] Actually Works" | "Actually" implies the viewer's mental model is wrong — a correction itch | How a Medieval Windmill Actually Works | Needs an existing wrong prior to correct; obscure subjects have none |
| F9 | The Hidden X That Runs Y | "The Hidden [X] That Runs/Built [Y]" | Invisible infrastructure revealed under a familiar surface | The Hidden Waterways That Built the Netherlands | Calling something hidden that the audience already knows about |
| F10 | Why X Is Dying | "Why [X] Is Dying/Disappearing" | Loss aversion + urgency — see it before it's gone | Why the World's Great Canals Are Disappearing | Pure nostalgia with no stakes; a channel-wide morbid drumbeat if overused |
| F11 | The Impossible-Feat Question | "How Did [Builders/Civilization] [achieve a feat that sounds impossible]?" | A specific achievement that sounds like it shouldn't have been physically possible, posed as *how did they* — the gap is the feat, not the question mark | How Did Venice Build a City on Water? | Not any question: definitional ("What is X?"), comparison, limit ("how far can X go?") and mechanism ("how does X work?" → F12) are NOT F11. A graspable-but-not-impossible feat reads as homework |
| F12 | How It Works (The Cutaway Reveal) | "How [Machine/System] Works" / "How [X] Is Made" | Mechanism curiosity — you've used or seen it but never inside it; the promise is to cut it open and show how it functions | How a Roman Aqueduct Moved Water Over a Valley | Needs real hidden complexity + a strong cutaway; a simple mechanism or a talking head reveals nothing. (Distinct from F8: no wrong belief to correct, just an unopened box.) |

**Tag by mechanism, not by string.** The formula is the *hook mechanism*, not a word
template — "The Crazy Engineering of Venice" (a real 3.6× outlier in the CSV) is F1's
driver wearing different words. Generate and classify accordingly.

**⚠ Three caveats the data forces — read before weighting any formula count.**

- **Base rate, not lift.** A formula's share among outliers is only meaningful against
  `data/comp_videos.csv` (the control group — every scanned video, outlier or not). Animagraffs,
  Branch Education and Jared Owen publish **80–83% cutaway titles**, so *their* F12 breakouts are
  format-native, not proof the cutaway hook lifts. The F12 that means something is a channel that
  *doesn't* normally do cutaways breaking out with one — Sabin's "How are Modern Flyovers Built?"
  (5.3×, from a 13%-cutaway channel). Discount formula rows from channels that only make that format.
- **Runtime transfer is unproven for F12.** Every F12 outlier runs **17–55 min**; none is near our
  10–13 min target. A 26-minute cutaway's click may not survive compression to 12. Treat F12 as
  "can the promise land in 12 minutes?" — the hook is real, the delivery length isn't ours.
- **Lift ≠ demand.** `multiple` is packaging lift (beat the channel's own normal); `views_per_day`
  is topic pull. They disagree hard (Neutron Bomb 16.9× but 13.5k/d; LA Aqueduct 4.5× but 37k/d).
  A concept ideally clears **both** — a high multiple at low views/day is a small channel
  over-performing a niche, not proof of broad demand.

## Where §4's original five went

The five patterns that used to live inline in `channel_strategy.md` §4 map into the
library as follows — one list, no duplicates:

| §4 original | Now lives at |
|:--|:--|
| 1. The Question Hook — "How Did [Civilization] [Impossible-Sounding Feat]?" | F11 (kept verbatim — the house pattern) |
| 2. The Superlative — "The [Oldest/Largest/Most Complex] [Thing] Ever Built" | F6 |
| 3. The Failure — "The [Structure] That [Failed] Because of [Surprising Cause]" | F3 |
| 4. The Hidden Story — "The [Everyday Thing] That Was Actually [Mind-Blowing Origin]" | F9 |
| 5. The Comparison — "Why [Ancient Version] Was Better Than [Modern Equivalent]" | F2 |

## Versioning rules

- **Ids are permanent.** `data/outliers.csv` and packaging docs reference them — never
  renumber, never reuse. Retire a formula by appending "(retired — date, reason)" to its
  Name cell; the row stays so old tags keep resolving.
- **Adding:** append the next F-id and bump the version in the title line. A formula
  earns a row on **evidence** — several outliers sharing a hook mechanism that tags as
  `none` — not on brainstorming.

**Version history:**

- v1.2 — July 22, 2026: **renamed F1** The Insane Logistics → **The Extremity Frame** (its
  evidence is intensity-adjective framing — CRUEL/MAGIC/Incredible — of which scale is one flavor,
  not scale alone); **narrowed F11** to the true impossible-feat question and re-tagged the 7 rows
  that were only question-*shaped* (mechanism → F12, the rest → `none` with their sub-mechanism
  named). Added the control group `data/comp_videos.csv` + the base-rate / runtime / lift-vs-demand
  caveats above, and the `views_per_day`/`vpd_multiple` demand columns. **F11 now has 0 evidence
  rows** — the house pattern has no external precedent in the comp set (an identity bet, not a
  data-backed one). Top promotion candidate: the **definitional-gap question** ("What Is a Neutron
  Bomb?", 16.9× — the set's biggest outlier); earns its own id when a 2nd example appears.
- v1.1 — July 21, 2026: added **F12 How It Works (The Cutaway Reveal)** on evidence —
  12 of 21 new outliers from the animated-engineering comps (Animagraffs, Branch
  Education, Sabin Civil, Jared Owen) shared this hook while tagging `none`. It is the
  channel's native cutaway format. See `data/outliers.csv`.
- v1.0 — July 21, 2026: seeded F1–F10 (packaging-research spec) + F11 (the house
  Question Hook, §4's original #1).
