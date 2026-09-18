# Gate 0 — `I77`, "there are mirrors on the Moon, and observatories still bounce lasers off them"

Proposed as the next reel, 2026-09-18. Backlog id `I77` (§4 `security` → accent `#3DDF7D`).
Nothing has been built. This file and `payoff_frame.png` are the two artefacts CLAUDE.md requires
**before** any Python, any `.tsx`, any data module.

**Supersedes `I63`** (2026-09-02, §2 `infrastructure`) — the same concept, added twice under two
different ids. `I63` is retired to `backlog/closed.md` as a duplicate; this file is where Gate 0
now proceeds, under `I77`'s sharper framing and its already-sourced photon-budget detail.

## 1. The sentence

> **"There are actual mirrors sitting on the Moon from Apollo, and observatories still fire lasers
> at them and catch the bounce back — that's how we know the Moon is drifting away, 3.8 cm every
> year."**

No mechanism word in it. A stranger can repeat this exactly as heard.

## 2. Who does the viewer send this to, and what are they proving?

**The strongest send-channel answer this account has written since `r005`.** Sent to the person
who says the Moon landings were faked, proving that real, ongoing, independently repeatable
science — not a photo, not a flag, an actual instrument still returning a signal off the Moon
tonight — sits on top of the exact claim they're denying.

| condition | verdict |
|:--|:--|
| Personally witnessed the evidence | **Partial, same shape as `r005`.** Nobody has watched a laser return from the Moon, but everyone has looked at the Moon itself and everyone has encountered the "faked" claim, often confidently, in a comment section or from one specific person |
| A dispute already running, that a non-specialist is in | **Yes, unambiguously.** Moon-landing denial is one of the most repeated conspiracy claims in casual conversation and online — closer to flat earth than any other id on the backlog |
| Resolves to one repeatable number | **Yes** — one figure, cm/year of recession, that only exists because a real object is up there returning a real signal |

**This is `r005`'s exact mechanism, not just its visual family**: a physical, verifiable fact that
settles an identity-loaded argument nobody can resolve by staring at a photo.

## 3. The payoff frame

`payoff_frame.png` — drawn in PIL, ~15 minutes (see note below), illustrative geometry: Earth and
Moon as shaded spheres, a beam travelling from a labelled "OBSERVATORY" point to a labelled
"RETROREFLECTOR" point on the Moon, the outbound cone widening (divergence), a much wider, far
fainter return fan (illustrating how little comes back), with the round-trip distance and the
recession-rate stat beneath. Distance (384,400 km) is real; beam-divergence widths and the photon
ratio are placeholders for Stage 3, flagged `LEAD` in the script and printed to stdout.

**Build note:** the first draft pasted the Moon's `glow_sphere` patch — an opaque square roughly
6x the drawn radius — AFTER the headline text, and it silently overwrote the right half of both
title lines with plain background colour (confirmed by sampling lit pixels row-by-row; the cut sat
at the patch's left edge, not at any text-measurement boundary). Reordered so the headline is drawn
last, over the finished scene. Recorded here because it is exactly the kind of z-order bug a still
can hide — the file "looked done" at a glance and was still wrong.

## 4. Kill conditions — the gate's own three

| Condition | Verdict |
|:--|:--|
| The sentence needs a CS word | **No.** "Mirrors", "lasers", "drifting away" — no jargon, no unit the viewer doesn't own beyond "cm/year," which is not domain jargon. |
| The payoff frame shows an object the viewer has never seen | **No.** The Moon, the Earth, a beam of light — all namable with the sound off. Same basis r005/r009 passed on: a globe and a beam, not a chart. |
| The amazement depends on understanding first | **No.** A beam leaving Earth, touching the Moon, and a thin return arriving back reads as "wait, we're doing that right now?" before any mechanism is explained. The *why it proves the Moon is real and reachable* is the reward for staying, not a precondition. |

**The recognisable object (Earth, Moon, and the beam between them) can stay on screen for the
whole reel** — non-negotiable 6 — the same way r005's globe and r009's ladder never left frame.

## 5. Numbers, and where they came from — ALL LEADS, NONE VERIFIED YET

| Fact | Value (as proposed) | Status |
|:--|:--|:--|
| Earth–Moon mean distance | 384,400 km | Standard astronomical constant — low risk, verify against a primary ephemeris source in Stage 3 anyway |
| Apollo retroreflector arrays still in use | 11, 14, 15 (and the Soviet Lunokhod 1/2 arrays, sometimes counted separately) | LEAD — confirm which arrays are routinely used by which stations today, not just historically |
| Outgoing beam spread at the Moon | ~6.5 km diameter, order-of-magnitude figure carried from `I77`'s backlog row | LEAD — must be recomputed in Stage 3 from a station's actual divergence half-angle and the real distance, not carried from memory |
| Return beam spread at Earth | ~15,000 km, illustrative only | LEAD — same recomputation |
| Photon return rate | "~1 photon back per 10^17 sent," backlog's own figure | LEAD — this is the number most likely to be wrong by an order of magnitude; different stations (APOLLO vs older McDonald-era) report very different photon budgets, and the reel must cite one station's real, published rate, not an average from memory |
| Recession rate | 3.8 cm/year | LEAD — widely repeated, but must be sourced to an actual LLR data release or review (e.g. a JPL/IERS or APOLLO-station publication), not to secondary science writing |

**This id carries more unverified LEADs than most recent proposals**, precisely because it was
minted for its GATE 3 shape rather than researched first. Stage 3 must treat every row above as
possibly wrong, same as `I31`'s "typo" framing turned out to be.

## 6. Licence and feasibility

**Likely clear, same shape as `I31`/r014's licence check**, but not yet confirmed:

- Earth–Moon distance and orbital mechanics: public astronomical constants, no licence question.
- Photon-return and recession-rate figures: these come from **published lunar laser ranging (LLR)
  research** — station papers, IERS/ILRS technical reports, and review articles. Published figures
  are facts and are citable (the r006 precedent). **Open question for Stage 3**: whether any
  detailed per-shot LLR dataset the build might *want* (for a more literal "here's tonight's real
  attempt" beat) is a restricted database the way TeleGeography's cable routes were — the
  headline figures are not, but a live per-station data feed might be gated. If so, the build
  falls back to the published, citable summary figures only, the same way r006 fell back to public
  geography.
- Feasibility: no exotic data resolution problem like `I53`'s SRTM limit — this is geometry and a
  handful of published numbers, not a terrain query.

## 7. Accuracy risks the build must not skate past

1. **The photon-return figure is the single riskiest number on this page.** Different LLR stations
   across different decades report photon budgets that vary by orders of magnitude (older lunar
   arrays vs APOLLO's newer, larger-aperture setup). The build must cite ONE real station's
   published figure and say which station, not blend an "average" the way `I31`'s "1:45 vs 2:30"
   confusion nearly shipped a wrong number.
2. **"Landings were faked" must never be staged as a claim the reel takes seriously enough to
   rebut point-by-point.** The reel shows the mechanism and lets the fact stand; it does not
   itemise or platform specific conspiracy arguments, which is both a tone risk and an unnecessary
   one — the physical fact does the work alone, the way r005 never engaged flat-earth arguments
   directly either.
3. **"Mirrors" is a simplification** worth stating precisely on screen: these are corner-cube
   retroreflector arrays, not simple mirrors — CLAUDE.md's own "typo" lesson from `I31` says a
   popularised simplification that is subtly wrong must be corrected before it ships, even if the
   backlog's own hook uses the looser word.
4. **The toxicity risk flagged in `I77`'s own backlog annotation is real and does not go away at
   Gate 0.** This does not kill the concept — the send-test answer is the strongest on the
   account's slate — but the script (Gate 4) must be checked for tone: state the fact, show the
   mechanism, do not bait or mock the position being corrected. CLAUDE.md: "it does not license
   chasing conspiracy content... most other arenas are cheaper and less toxic" — noted and accepted
   here as a real cost of proceeding, not an oversight.

## 8. Awaiting

**A human yes.** Gate 0 is not mine to pass.
