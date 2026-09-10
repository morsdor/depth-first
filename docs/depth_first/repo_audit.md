# Repo audit — executed 2026-09-10

*This was a set of proposals. It is now a **record**: the YouTube line was retired on 2026-09-10 on
the user's decision ("all yt plan for engineering atlas is dead… park that yt content in some name
branch"), and this document says what moved, what was deleted, what was fixed, how to get anything
back, and what is still open. The changes are **uncommitted in the working tree** for review.*

---

## 1. The decision

Three eras were stacked in this repo and only one was live.

| Era | What it was | Verdict 2026-09-10 |
|:--|:--|:--|
| **1 · The Engineering Atlas** — long-form historical engineering on YouTube | strategy, brand guide, a 7-pass studio of skills, Gemini plate generation, AE builders, an asset library, video 001 boarded and narrated | **DEAD** |
| **2 · Depth First long-form** — s001 "The Physical Cost of AI" | brand guide §0–§12, the Remotion pivot, five scene families, 77 scenes boarded, 42 plates | **PARKED** — may be revived |
| **3 · Depth First reels** — Instagram-first | `CLAUDE.md` "Short-form reels", 22 compositions, the `new-reel` skill, the audits, the Manim bridge, 69 backlog ids | **LIVE** |

Eras 1 and 2 were not wrong. They were in the way, and neither had a commit since August.

---

## 2. Where the YouTube line went

**Branch: `yt-longform-archive-DO_NOT_DELETE`**, created at commit `8b4a48a` — the exact state of
`main` *before* any removal. It holds all **454** files, complete, with full history behind them.
Nothing was deleted from git.

```bash
git switch yt-longform-archive-DO_NOT_DELETE                # go and look
git show yt-longform-archive-DO_NOT_DELETE:brand_guide.md   # read one file without switching
git checkout yt-longform-archive-DO_NOT_DELETE -- <path>    # bring one file back to main
```

The branch is **local only**. `git push -u origin yt-longform-archive-DO_NOT_DELETE` is what makes
it survive this machine — see §6.

### What is on the branch and no longer on `main`

| Group | Paths |
|:--|:--|
| Era-1 strategy & brand | `channel_strategy.md` · `strategy_review.md` · `brand_guide.md` · `formula_library.md` · `pipeline_automation.md` · `new_video_prompt_template.md` · `style_card.txt` · `example_storyboard.json` |
| Era-2 doctrine | `animation_upgrade.md` · `style_card_software.txt` |
| Long-form docs (12) | `docs/{after_effects_workflow, cinematography, costs, image_generation, outlier_system, production_workflow, project_structure, setup, storyboard_schema, upscaling, video_assembly, voice_narration}.md` |
| Generation & assembly code | `generate_images.py` · `generate_asset.py` · `generate_thumbnail.py` · `add_thumbnail_text.py` · `prompt_builder.py` · `review_images.py` · `video_assembler.py` · `clean_vo.sh` |
| AE builders | `ae_scripts/` |
| Asset library | `assets_library/` (57 files incl. `_raw/`) · `assets/style_anchors/` · `assets/thumbnails_log.md` |
| The 14 long-form skills | `asset-generation/` · `thumbnail-workflow/` · `visual-accuracy-gate/` · `the-engineering-atlas-video/` and `.claude/skills/{art-director, studio-director, script-analyzer, film-director, storyboard-artist, scene-composer, asset-planner, motion-director, ae-director, remotion-director}` |
| The outlier system | `scripts/{fetch_outliers, tag_outliers, weekly_refresh}.py` · `.github/workflows/weekly_outliers.yml` · `data/{comp_channels.yaml, comp_videos.csv, outliers.csv}` |
| Projects | `projects/001_roman_aqueduct/` (incl. the two WAV masters, 156 MB) · `projects/s001_ai_physical_cost/` |
| Long-form Remotion source | `remotion/src/{families, scenes, components, lib}/` · `remotion/public/plates/` (42) |

### ⚠ What the branch does NOT hold — deleted from disk on the user's instruction

**~204 MB of charged AI plates were never in git** (they are `.gitignore`d as regenerable), so they
were never on the branch either. `git rm` removed only the tracked files and left them on disk; the
user then instructed *"delete everything from disk as well, which doesn't stay in repo — keep the
mp4s for the reels and nothing else"*, and they were deleted.

| Path | Was | Recoverable? |
|:--|--:|:--|
| `projects/001_roman_aqueduct/output/` | 151 MB | **no** — 12 of its files are on the branch, the rest is gone. Dead project |
| `projects/001_roman_aqueduct/images/` | 34 MB | **no.** Dead project |
| `projects/s001_ai_physical_cost/images/` | 16 MB | **no** — but this was raw generation output |
| `projects/s001_ai_physical_cost/review/` | 3 MB | **no** — review montages, rebuildable from plates |

**The finished work survived.** s001's **42 validated plates** are on the branch at
`remotion/public/plates/`, and 001's boarded storyboard, references, script and both WAV narration
masters are on the branch too. What was deleted is the raw and rejected generation output behind
them. Reviving s001 therefore still works; regenerating its rejects would cost money again.

Also deleted from disk: `remotion/public/manim/` — 1,020 PNGs, 153 MB, the r010 render input.
**Fully regenerable in ~21 s** from tracked scripts, and the posted mp4 is committed:

```bash
python3 projects/i69_pendulum/simulate.py && python3 projects/i69_pendulum/emit_ts.py
MANIM_W=1350 MANIM_H=2400 python3 scripts/manim_render.py \
    projects/i69_pendulum/scene_pendulum.py Pendulums i69pendulum
```

**Kept deliberately:** `remotion/node_modules` (581 MB), `.venv` (431 MB), `.manimenv` (407 MB).
These are toolchain, not content — deleting them would mean an `npm install` and two venv rebuilds
before the next reel. Say so if you want them gone; each is one command to restore.

---

## 3. What was deleted outright

Nothing of value; git holds the history of all of it.

| Path | Why |
|:--|:--|
| `ae_scripts/build_scene_comps.pre_layers.bak.jsx`, `…pre_trueup.bak.jsx` | backups of a tracked file |
| `projects/001_roman_aqueduct/storyboard.pre_{1920fix,narration,regen,trueup}.bak.json` | four backups of a tracked file, 192 KB each |
| `remotion/out/` | ignored, stale, one leftover still |
| `.gitignore` — the duplicate `.venv/` line and the `.geoenv/` line | `.venv/` was already on line 6; `.geoenv/` referred to nothing |
| `data/.channels_cache.json` | cache for the archived outlier system |

---

## 4. Defects fixed

**1 · Two reels were both numbered `r009`.** `i58_tides` (posted) and the shelved `i64_queue` build.
The shelved build now holds **no** reel number: its render is `i64_queue_shelved.mp4` and its
compositions are `i64-queue` / `i64-queue-safe`. `brand_guide_software.md` updated. The rule — *a
reel number is claimed in `CLAUDE.md`'s table when the build starts and never shared* — is now
written into `.claude/skills/new-reel/reference/build.md`.

**2 · The posted r010 render was untracked.** `.gitignore`'s negation was `!projects/r*/*.mp4`,
written when every project folder was `r00N_<slug>`. Once folders became `i<NN>_<slug>` it silently
stopped matching: r006–r009 were tracked only because they had been force-added, and **r010 — a
posted reel — was not tracked at all**. The negation now matches the *render's* name rather than the
folder's:

```
!projects/*/r[0-9][0-9][0-9]_*.mp4
```

Verified both ways: `r010_pendulum.mp4` is now tracked (added, 15 MB), and a long-form
`scene_NN.mp4` is still correctly ignored. A shelved build's render no longer matches, which is the
right outcome.

**3 · `Root.tsx` was 1,665 lines with zero `<Folder>`s.** The proposal was to split it. Retiring the
long-form line resolved it instead: **1,665 → 310 lines**, reels only, with a header explaining
where the 77 scene registrations went. `tsc --noEmit` clean, `brand:check` green on 29 files, and
`npx remotion compositions` lists all 22 reel compositions.

**4 · Skills lived in two places.** Resolved by the archive: the four symlinked top-level skill dirs
and the ten long-form skills are gone. `.claude/skills/` now holds `new-reel/` plus the vendored
Remotion skills.

**5 · Stale ledgers.** `insta_strategy.md` carries a status banner: its *premise* (short-form as a
discovery layer feeding YouTube) is superseded, its *evidence* is not, and the banner says exactly
which sections survive. `CLAUDE.md`'s opening no longer describes two YouTube channels. The Posted
tables in `brand_guide_software.md` and `reel_captions_log.md` were completed earlier in the day.

**6 · The profile was behind the promise.** `CLAUDE.md` widened the channel to *how systems work* on
2026-09-10 while §13 still specified the Instagram Name `Depth First · how code works` and a bio
about "algorithms". §13 now specifies `Depth First · how systems work` (exactly 30 characters) and
"The mechanisms hiding in things you already use… the real **thing**, actually run — not drawn".
**These are not yet changed in the app** — that is a manual edit only you can make, and §13 says so.

**8 · `requirements.txt` described era 1.** Rewritten for reels: numpy, Pillow, matplotlib as the
core three, per-reel extras (segno, opencv, pyproj) commented, Manim's separate venv explained, and
ffmpeg named as the system dependency the audits need.

**9 · `projects/i64_queue/` had a render and no `NOTES.md`.** Written as a failure record: the Gate 0
sentence, the fact that it **passed every automated gate** — 65% event density, the best in the repo
at the time, 15 asserts, clean lint — and was still stopped by a human at Gate 3 ("the output is not
sound"). It states plainly that nobody has since diagnosed *why*, so a rebuild starts there.

**10 · Two folder-naming conventions.** Documented in `build.md`: the folder is named for the
permanent backlog id, the reel number appears only on the render, and the `r001…r005` folders keep
their old names because the logs cite them.

**Also fixed:** a real broken dependency — `projects/i52_listening/gate0/mock_payoff.py` reads
`projects/001_roman_aqueduct/vo_001_final.wav`, which is now on the branch. `I52`'s `GATE0.md` records
this with the one-line restore command. Every other archived-path reference in the surviving files
(`brand_guide_software.md`, `content_backlog.md`, `insta_strategy.md`, `remotion/src/brand/tokens.ts`,
both comp deep dives) now names the branch instead of dangling.

---

## 5. Where things are now

```
yt video ideas/
├── README.md                    NEW — what this is, how to run it, where the YouTube line went
├── CLAUDE.md                    the law, now single-line, opening with the archive pointer
├── content_backlog.md · brand_guide_software.md · insta_strategy.md · reel_captions_log.md
├── requirements.txt             NEW content — reels only
├── docs/
│   ├── depth_first/             the seven operating docs
│   └── comps/                   the two competitor deep dives
├── projects/                    reels only — r001…r005, i15, i17, i22, i33, i52, i53, i58, i64, i69, manim
├── remotion/src/{reels, brand}  + Root.tsx (310 lines)
├── remotion/public/{fonts, reels, manim}
├── scripts/                     manim_render · reel_motion_audit · reel_safe_audit
├── data/                        the *_software comp evidence
└── assets/{brand, fonts}
```

**Root: 30 items → 13. Tracked files: 454 → 183. Working tree: ~357 MB of dead-era and
regenerable content deleted from disk.** Verified after the change: `npm run lint` clean,
`reel_motion_audit.py` reproduces r006's recorded 38% event density, `backlog_ideas.py` reports its
69 ids, and all 22 reel compositions enumerate.

---

## 6. Still open

**Push the branch.** `yt-longform-archive-DO_NOT_DELETE` is local. Until it is pushed, "do not
delete" is enforced by one disk. This was left for you because pushing is outward-facing:

```bash
git push -u origin yt-longform-archive-DO_NOT_DELETE
```

**~~Back up the 204 MB of charged plates~~** — deleted on instruction 2026-09-10, see §2. The
validated plates survive on the branch; the raw output does not.

**The repo is still ~655 MB**, and the archive branch is *why*. History carries 156 MB of WAV
masters and ~150 MB of renders, and the branch pins those blobs so they can never be garbage
collected. **That is the price of the safety guarantee and it is worth stating plainly:** shrinking
the repo now requires rewriting history, which would break the archive branch. Choosing safety over
size here is the right call while the material is fresh; revisit in a year, not this month.

**Defect 7 — `brand_guide_software.md` is 1,660 lines and §13 is ~1,200 of them.** Deliberately not
touched: it is the ledger the `new-reel` skill cites by name, and splitting it casually would break
the citation. The plan stands — `docs/depth_first/lessons_ledger.md` chronological, §13 keeping only
the rules that survived.

**Defect 11 — `.agents/` holds nested duplicate copies** of the vendored Remotion skills. Installer
artefact, git-ignored, harmless. `npx skills experimental_install` regenerates it.

**Nothing is committed.** Review the diff, then commit to `main` when you are ready.
