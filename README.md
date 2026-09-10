# Depth First

Short-form reels about **how systems work** — `@thedepthfirst` on Instagram.

Every animation is the real algorithm or the real physics, actually run on real data and played
back frame by frame. Nothing is drawn by an image model, and the numbers on screen are correct
because the run produced them.

| | |
|:--|:--|
| **The law** | [`CLAUDE.md`](CLAUDE.md) — nine non-negotiables, Gate 0, the three human gates |
| **The procedure** | [`/new-reel`](.claude/skills/new-reel/SKILL.md) — backlog id → Gate 0 → build → render → audit → the five logs |
| **The map** | [`docs/depth_first/`](docs/depth_first/README.md) — state of the account, the pipeline end to end, the repo audit, the visual toolbox, module packs, growth strategy, and the software thesis |
| **The topics** | [`content_backlog.md`](content_backlog.md) — 69 permanent ids in six sections |
| **The ledger** | [`brand_guide_software.md`](brand_guide_software.md) §13 — every dated lesson, including the retracted ones |

```bash
python3 .claude/skills/new-reel/scripts/backlog_ideas.py   # what to build next
cd remotion && npm run dev                                 # Remotion Studio
npx remotion render r006-greatcircle ../projects/i17_greatcircle/r006_greatcircle.mp4 --codec=h264
cd .. && python3 scripts/reel_motion_audit.py projects/i17_greatcircle/r006_greatcircle.mp4
```

## The YouTube line is retired

This repo ran two YouTube channels until 2026-09-10. **The Engineering Atlas is dead and Depth
First long-form is parked.** Both are preserved in full — docs, skills, generation code, asset
library, project folders and the long-form Remotion source — on the branch
**`yt-longform-archive-DO_NOT_DELETE`**. Nothing was deleted from history.

```bash
git switch yt-longform-archive-DO_NOT_DELETE      # go and look
git checkout yt-longform-archive-DO_NOT_DELETE -- <path>   # bring one file back
```

Any path named in this repo that does not exist is on that branch. See
[`docs/depth_first/repo_audit.md`](docs/depth_first/repo_audit.md).
