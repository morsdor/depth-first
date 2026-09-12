# Content backlog — MOVED 2026-09-12

**This file is a pointer. The register now lives in [`backlog/`](backlog/).**

| Looking for | Go to |
|:--|:--|
| **the live candidates** | [`backlog/open.md`](backlog/open.md) |
| what already shipped | [`backlog/posted.md`](backlog/posted.md) |
| retired, killed and shelved ideas | [`backlog/closed.md`](backlog/closed.md) |
| how the register works | [`backlog/README.md`](backlog/README.md) |

**Why it moved.** One file held live candidates, shipped reels and dead ideas together, so reading
it meant filtering out 15 spent ids to find the 56 that were open. Posted ideas now leave the live
list on the day they post. **Nothing was deleted and no id changed** — ids are permanent, and the
full pre-split file is in git history.

```bash
git show HEAD~1:content_backlog.md            # the file as it was
python3 .claude/skills/new-reel/scripts/backlog_ideas.py
```
