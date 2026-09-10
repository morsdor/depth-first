---
description: Park the current work on a pushed wip/ branch so another device can pick it up
argument-hint: [optional note, e.g. mid-way through the audit]
allowed-tools: Bash(bash scripts/wip.sh:*), Bash(git status:*), Bash(git branch:*), Bash(git log:*)
---

Run the handoff script and report the result:

```
bash scripts/wip.sh $ARGUMENTS
```

Then tell me, in three lines at most:

1. the branch name it parked on, or that there was nothing to hand off
2. how many files went with it
3. the one command to get back to a clean `main` here

**Do not add anything to the commit, do not touch `main`, and do not merge.** The script
owns all of that. If the push is refused by a permission prompt, say so plainly and give me
`!bash scripts/wip.sh` to run myself — do not try another route to push.

## What this is for

Claude Code's Remote Control is a window into the session on *this* Mac, so it dies when the
Mac sleeps. A session started from the Claude app runs in the cloud and clones from GitHub —
it cannot see uncommitted local work. This command is the bridge: it gets the working tree
onto the remote in one step, on a branch that is never `main`.
