# GATE 0 — `N5` · The monsoon is a planetary-scale machine

**Channel:** India long-form documentary (new line, not Depth First reels)
**Format:** 16:9, target 20–28 min · English primary, Hindi audio track added later
**Status:** awaiting the human yes. I wrote the sentence, so I cannot judge it.

---

## 1. The sentence

> **"You know the monsoon? They taught us it's because land heats up faster than the sea.
> That's basically not it — it's the Himalaya acting as a wall that keeps the dry northern
> air out. Without that wall, India doesn't get a monsoon at all."**

Repeatable, no jargon, and it corrects something **every single Indian was taught in school.**
That last part is what makes it travel: it is argument ammunition against a belief the viewer
personally holds, sourced from their own geography textbook.

## 2. The payoff frame

`payoff_frame.png` (from `mock_payoff.py` — a sketch, not a render).

India coloured by normal monsoon onset date, the Himalaya drawn as a hard bright wall, dry
northern air pressing down on it and getting nowhere.

**Copy column read alone** — the r010 check — is a complete thought:
*"The monsoon isn't India heating up. It's that wall holding the dry air out."*

The real payoff beat in the video is a **two-run comparison**: the monsoon with the mountains,
and the same model with the Himalaya removed, where the rain never arrives.

## 3. The three kill conditions

| Condition | Verdict |
|:--|:--|
| **Sentence needs a jargon word** | **PASS.** "Wall", "dry air", "monsoon". No technical term is load-bearing. |
| **Payoff shows an object nobody has seen** | **PASS.** A map of India and rain. Both nameable with the sound off and no labels. |
| **Amazement depends on understanding first** | **PASS**, and see §4 — long-form changes what this condition is even asking. |

## 4. Long-form adaptation of kill condition 3 — stated explicitly

Condition 3 exists because a reel loses half its audience at 1.5–3 s, so setup-before-payoff is
fatal. **A long-form viewer arrives through the title and thumbnail having already opted in**, so
a sentence of setup is permitted where a reel forbids it.

**What does NOT relax: the thumbnail now carries the whole Gate 0 burden.** It is the 1.5-second
surface. The frame above is the thumbnail candidate as much as the payoff, which is why it was
drawn to work with no labels read.

## 5. Licence check — run BEFORE any build (the `I22` rule)

| Source | Needed for | Must confirm |
|:--|:--|:--|
| **IMD gridded rainfall** (0.25°, 1901–) | the onset animation, the whole spine | **Open access, or paid/restricted? This is the one that can kill the build.** Published figures are citable; a gridded product is a database. |
| **Natural Earth** | coastline, borders | public domain — expected clear |
| **Boos & Kuang (2010)** | the central thesis | a published finding is a fact and is citable |

**If IMD gridded data is restricted**, fall back to IMD's *published* normal-onset isochrone map
(a figure, citable) plus an open reanalysis product, and say so on screen.

## 6. Accuracy flags — non-negotiable 7, unresolved

**The central claim is NOT yet verified and must not be built on until it is.**

1. **The thesis.** My understanding is Boos & Kuang, *Nature* 463 (2010), "Dominant control of the
   South Asian monsoon by orographic insulation versus plateau heating" — removing the Tibetan
   Plateau while keeping the Himalaya preserves a realistic monsoon; removing the Himalaya
   weakens it sharply. **Read the actual paper.** I am working from recall, and this repo's own
   rule is that every figure and mechanism sentence is a research lead until checked.
2. **"The school version is wrong" is too strong and will be challenged.** The land–sea thermal
   contrast is not fictional; the honest claim is that it is **insufficient on its own** and that
   orographic insulation dominates. Find the wording that is both true and still surprising —
   this is the single hardest editorial problem in the video.
3. **Check the counter-literature.** Anything this clean has people arguing with it. If the field
   is genuinely split, that is a better video, not a worse one — but it changes the sentence.
4. **Onset dates.** IMD revised its normal onset/withdrawal calendar in 2020; full-country
   coverage moved from ~15 July to ~8 July. Use the current normals and say which.

## 7. Why this one is first

Not the highest-ceiling idea on the list, deliberately. It is the one that **exercises the whole
pipeline** — real gridded data → Python → JSON → Remotion — while carrying **zero political heat**
and staying searchable every June for the next decade. `N1` (genetics) and `H6` (GDP share) are
better videos and far worse first videos.

## 8. What would falsify the pick

Pre-registered, before anything is built:

- **Craft:** if the onset animation does not read as beautiful in the animatic, the thesis does not
  matter — the whole video rests on one visual.
- **Thesis:** if §6.1 does not survive the primary source, **the concept dies here.** Do not repair
  it into a weaker "monsoon explainer" — that video has no sentence and there are 69 other ids.
- **Data:** if IMD gridded data is not licensable and the fallback looks thin, defer to `N3` or `G3`.

---

## The ask

**Read §1 out loud. Would you say that sentence to a friend?**

Not "is the picture good" — the picture is only evidence that the sentence can be shown. That is
the `I15` lesson, and it is the entire cost of this gate.
