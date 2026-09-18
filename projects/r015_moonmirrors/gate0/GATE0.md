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

## 5. Numbers, and where they came from — Stage 3 complete, 2026-09-18

**Two of the original backlog LEADs were significantly wrong and are corrected below** — the
return-spot figure was off by roughly 500x, and the photon-ratio figure, while the right order of
magnitude, had a cleaner, better-sourced replacement. Recorded here rather than quietly fixed,
same as `I31`'s "1:45 vs 2:30" correction.

| Fact | Verified value | Source |
|:--|:--|:--|
| Earth–Moon mean distance | 384,400 km | Standard astronomical constant, cross-checked against NASA/lunar-distance references |
| Recession rate | **3.83 cm/year**, formal uncertainty ~0.09 mm, from 50+ years of LLR data | Eos.org ("Seeing the Light"), corroborated by IFLScience, ScienceBlog and an arXiv review on lunar recession and length-of-day — physical cause: tidal dissipation slowing Earth's rotation |
| Round-trip photon loss, typical LLR station | **~1 : 10^18** — a 10 Hz, ~200 ps pulse of ~10^18 photons returns roughly one detected photon every few seconds at most stations | Lunar laser ranging review literature (arXiv, "the millimeter challenge" and related LLR reviews) |
| APOLLO station's own figure (the modern outlier) | 115 mJ pulse = **3.1×10^17 photons sent**; APOLLO detects **5–10 photons per pulse**, i.e. roughly **1 : 4×10^16** — orders of magnitude better than older stations because of its larger aperture | APOLLO instrument papers (Murphy et al., IOPscience "Two Years of Millimeter-Precision Measurements"; arXiv instrument-description papers) |
| Per-target record returns | Apollo 11: 0.96 photons/shot · Apollo 14: 1.52 · **Apollo 15: 3.15** (its larger 3-panel array returns the strongest signal) | Same APOLLO instrument literature |
| Outgoing beam spot at the Moon | **A few km across, commonly cited ~7 km diameter** (atmospheric seeing sets a few arcsec of divergence) | Lunar ranging optics literature (Stony Brook laser-teaching report; IERS Technical Note 34) — corrects the backlog's uncited "kilometres wide" to a real range |
| Return beam spot at Earth | **A few TENS of km across** — **not** the ~15,000 km this file originally carried as a placeholder, which was a 500x overstatement | Same optics literature — this is the correction that matters most before any beam-cone visual ships |
| Active reflector arrays | **Apollo 11, 14, 15** (US, 1969–71) plus the Soviet **Lunokhod 1 and 2** French-built arrays (1970/73) — five real objects still on the Moon | Cross-checked via the Lunokhod 1 rediscovery literature below |

**The Lunokhod 1 story, found along the way and worth a beat of its own:** its reflector went
undetected from 1971 until 2010 — effectively lost for 39 years — until Lunar Reconnaissance
Orbiter imagery pinpointed the rover to ~100 m in March 2010, letting the APOLLO team range it
successfully weeks later, on 22 April 2010. It now returns a signal **roughly 4x stronger than its
twin, Lunokhod 2** — a mirror sitting untouched and still working after four decades, rediscovered
from a photograph. (Corney et al. 2010, arXiv:1009.5720 / ScienceDirect; Astronomy.com summary.)

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

1. **RESOLVED — the photon-return figure.** Different LLR stations report photon budgets that vary
   by orders of magnitude (typical stations ~1:10^18 vs APOLLO's ~1:4×10^16), so the build cites
   ONE station per figure and names it: "most stations" for the ~1:10^18 headline number, APOLLO
   named explicitly for its 5–10 photons/pulse and the per-target 0.96/1.52/3.15 breakdown. Never
   blended into a single unlabelled average — the `I31` "1:45 vs 2:30" lesson, applied.
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

## 8. Status

**Gate 0 (§1) — PASSED, 2026-09-18.** GATE 3 (§2) — PASSED, 2026-09-18. Stage 3 research (§5) —
COMPLETE, 2026-09-18.

**Awaiting GATE 4 — the human approves the full script**, in `../SCRIPT.md`. Nothing is coded
until then.
