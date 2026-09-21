# GATE 0 — `N5` · The monsoon is a planetary rain belt, not a sea breeze

**Channel:** India long-form documentary (new line, not Depth First reels)
**Format:** 16:9, target 20–28 min · English primary, Hindi audio track added later
**Status:** GATE 0 PASSED — sentence approved by the account owner 2026-09-21, payoff frame drawn.

> **Revision history.** v1 of this gate proposed a Boos & Kuang "Himalaya as insulator" hook and a
> payoff frame that failed on its own terms. Both were rejected by the account owner before any
> build. §9 records what went wrong, because the failure is reusable.

---

## 1. The sentence

> **"You know how they taught us the monsoon is a giant sea breeze — land heats up, sea air rushes
> in? That's not what it is. It's a planetary rain belt that sits near the equator all year and
> wanders north every summer, and India happens to be where it parks."**

No jargon ("ITCZ" never appears), repeatable, and it corrects something **every Indian was taught in
school** — argument ammunition against a belief the viewer personally holds, sourced from their own
geography textbook.

## 2. The thesis, and why it is not one paper

**Spine — Sulochana Gadgil (IISc):**

- **Gadgil (2003)**, "The Indian Monsoon and Its Variability," *Annu. Rev. Earth Planet. Sci.*
  31:429–467 — **1,201 citations.**
- **Gadgil (2018)**, "The monsoon system: Land–sea breeze or the ITCZ?", *J. Earth Syst. Sci.* 127:1
  — *"For well over 300 years, the monsoon has been considered to be a gigantic land–sea breeze…
  it is shown that the observations of monsoon variability do not support this popular theory."*
  This is the hook, verbatim, from the primary source.
- **Sikka & Gadgil (1980)** — the observational foundation for poleward ITCZ propagation.

**Independent endorsement — Geen, Bordoni, Battisti & Hui, *Reviews of Geophysics* (2020):**
*"this theoretical framework provides strong support for the migrating convergence zone picture."*
A top-tier review synthesis backing the reframing, which is what takes this from "one paper" to
mainstream.

**Act two — the Himalaya.** Boos & Kuang, *Nature* 463:218–222 (2010), **938 citations**, is
authoritative and belongs in the video — but **presented for what it actually does.** See §6.1.

## 3. Payoff frame — DRAWN (sentence approved 2026-09-21)

`payoff_frame.png`, from `mock_payoff.py`. A sketch, not a render. **Coastlines are real** —
Natural Earth 110m, public domain, vendored as `ne_110m_land.geojson` so the sketch reproduces
offline. ITCZ latitudes are hand-approximated from the standard climatology and get replaced by
positions computed from GODL-licensed rainfall data at build.

**One frame, one claim: the same rain belt, six months apart.** January sits south of the equator,
July arcs up over India. Both bands are drawn in the same hue — dimmer for January — because they
have to read as *one belt somewhere else*, not two different things. The swing over India is marked
at **31° of latitude**, the widest on Earth (Africa 29°, W Pacific 28°).

> **Why this passes where v1 failed.** v1 paired an onset-date colour field with an insulation
> diagram — a picture that would look **identical whether the thesis were true or false**.
> This one would not. **If the monsoon really were a giant sea breeze, the belt would appear over
> India in July and simply not exist in January.** It does exist. It is just somewhere else, and
> the frame shows that. The picture is now evidence for the sentence rather than decoration
> beside it.

**Copy column read alone** — the r010 check — is a complete thought:
*"In January, the rain is down there. In July, it's over India. That move is the monsoon."*

## 4. The three kill conditions

| Condition | Verdict |
|:--|:--|
| **Sentence needs a jargon word** | **PASS.** "Rain belt", "wanders north". **"ITCZ" appears nowhere on screen or in the script.** |
| **Payoff shows an object nobody has seen** | **PASS.** A world map and a band of rain. India, Africa, Australia and Indonesia are all nameable with the sound off and no labels read. |
| **Amazement depends on understanding first** | **PASS**, with §5's long-form adaptation. |

## 5. Long-form adaptation of kill condition 3

Condition 3 exists because a reel loses half its audience at 1.5–3 s, so setup-before-payoff is
fatal. **A long-form viewer arrives through title and thumbnail having already opted in**, so a
sentence of setup is permitted where a reel forbids it.

**What does NOT relax: the thumbnail now carries the whole Gate 0 burden.** It is the 1.5-second
surface, and it must work with no labels read.

## 6. Accuracy — resolved and unresolved

### 6.1 RESOLVED: the v1 thesis was wrong about its own target

Boos & Kuang displaces the **Tibetan Plateau elevated-heating** hypothesis (Flohn's elevated heat
source; Wu's "sensible heat pump") — **not** the textbook land–sea breeze. *Nature*'s editor summary
says so directly. The insulation mechanism is real, but it is **compatible with** a thermally driven
monsoon, not a refutation of land–sea contrast.

**Stating it as a sea-breeze debunk would be a misattribution in the first five minutes of a channel
positioned on rigour.** Boos has also revised rather than retracted — Boos & Kuang, *Sci. Rep.* 3:1192
(2013) finds greater sensitivity to fluxes from *non-elevated* northern India.

### 6.2 The counter-literature is live, and the video must say so

Wu et al. (2012, *Sci. Rep.*) argue Himalayan southern-slope sensible heating drives much of the
monsoon. Boos & Kuang (2013) answered. **This is a "both mechanisms matter, proportions debated"
situation — not split, not converged.** Include Wu and the IISc mountain-removal work
(Chakraborty, Nanjundiah & Srinivasan, *GRL* 2002 — eight years before B&K) rather than hiding them.

### 6.3 CORRECTED: the 2020 IMD revision

v1 of this gate claimed full-country coverage moved from ~15 July to ~8 July. **Wrong.**
**Kerala onset is unchanged at 1 June.** The 2020 revision changed **withdrawal** — NW India from
1 Sept to 17 Sept, complete withdrawal 15 Oct. Basis: 1961–2019 onset, 1971–2019 withdrawal.

### 6.4 Is the science foreign-dominated? It splits, and the split is the story

**Dynamical theory** is substantially foreign-led (Boos, Kuang, Bordoni, Schneider, Battisti).
**Observational science, variability, prediction and essentially all the data are Indian-led** —
Gadgil; **EQUINOO**, an Indian-*discovered* mode of monsoon variability (Gadgil, Vinayachandran,
Francis & Gadgil, *GRL* 2004); Roxy Mathew Koll and B.N. Goswami at IITM Pune; the **Monsoon
Mission** (CFSv2 at 38 km); NCMRWF's **IMDAA** 12 km reanalysis; R. Krishnan's MoES
*Assessment of Climate Change over the Indian Region* (2020, Springer, open access).

**The video can be built on Indian science and Indian data, with foreign work as support.**

## 7. Licence — the `I22` gate

| Source | Terms | Verdict |
|:--|:--|:--|
| **data.gov.in** sub-divisional monthly rainfall 1901–2017 | **GODL-India** — royalty-free, **lawful commercial** use, attribution required | **Use this. Clean.** |
| **IMD 0.25° gridded** (Pai et al. 2014, *Mausam* 65(1):1–18) | Free download; **commercial terms not stated publicly** | **UNRESOLVED — email `cmagpune@gmail.com` before relying on it** |
| IMD custom data supply (`dsp.imdpune.gov.in`) | *"shall not be used for commercial purpose"* | **Different product. Do not conflate with the free gridded one.** |
| IMD published normal-onset isochrone maps | Published figures are citable facts | Fine to cite |
| **Natural Earth** basemap | Public domain, no attribution needed | Default basemap |
| **ISRO / NRSC Bhuvan** | **Non-commercial only** | **Unusable in a monetised video.** Counter-intuitive — do not assume `.gov.in` means free |

**Published figures are facts; a gridded product is a database.** Same distinction this repo paid
for once with TeleGeography on `r006`.

## 8. What would falsify the pick

- **Thesis:** survives — §2 is a citation chain, not a single paper.
- **Data:** if the 0.25° commercial terms come back restrictive *and* the GODL sub-divisional series
  proves too coarse for the animation, reconsider. The GODL series is the fallback and the floor.
- **Craft:** if the ITCZ migration does not read as beautiful in the animatic, the video has no
  spine — it rests on one visual.

## 9. What v1 got wrong, and why it is worth recording

1. **A thesis was written from recall and flagged as unverified instead of being verified first.**
   The repo's own order is research → script → build. Flagging is not verifying.
2. **The payoff frame showed two unrelated things** — an onset-date colour field (*when* rain
   arrives) beside an insulation diagram (*why* the monsoon exists). **That map looks identical
   whether the thesis is true or false**, so it was decoration beside the claim, not evidence for
   it. That is exactly the failure Gate 0 exists to catch.
3. **Both were caught by the human gate, before any build.** Cost: one afternoon. The `I51` cost
   for the same class of error was five rebuilds.

---

## Gate 0 verdict

**PASSED 2026-09-21.** The account owner approved the sentence in §1 before the frame was drawn,
which is the order this gate specifies and the order v1 skipped.

**Next:** Stage 3 is already done (`docs/india_longform/monsoon_research.md`). The next gate is
**G4 — the script**, written as a beat table before any Python, `.tsx` or data module exists.
Two things to clear alongside it:

1. Email `cmagpune@gmail.com` on the IMD 0.25° gridded product's commercial terms. The GODL
   sub-divisional series on data.gov.in is the fallback and is already clean.
2. Request Geen et al. 2020 from the corresponding author — it is the independent endorsement
   that makes the thesis mainstream rather than one scientist's view.
