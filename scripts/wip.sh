#!/usr/bin/env bash
# wip.sh — park the current work on a pushed branch so another device can pick it up.
#
# Why this exists: Claude Code's Remote Control is a window into the session on THIS
# machine, so it dies when the Mac sleeps. A Claude Code session started in the app
# instead runs in the cloud and clones from GitHub — it cannot see uncommitted local
# work. This is the bridge: it gets the working tree onto the remote in one step.
#
#   bash scripts/wip.sh            # auto-named branch
#   bash scripts/wip.sh some note  # auto-named branch with your note in the slug
#
# It never commits to main. It makes (or reuses) a wip/ branch and leaves you on it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

say() { printf '%s\n' "$*"; }

git rev-parse --git-dir >/dev/null 2>&1 || { say "not a git repository"; exit 1; }
git remote get-url origin >/dev/null 2>&1 || { say "no 'origin' remote — nothing to hand off to"; exit 1; }

branch="$(git rev-parse --abbrev-ref HEAD)"
dirty="$(git status --porcelain | wc -l | tr -d ' ')"

# ── name the branch from what actually changed ───────────────────────────────
slug_from_changes() {
  local note="${*:-}"
  if [ -n "$note" ]; then
    printf '%s' "$note" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' \
      | sed 's/^-*//; s/-*$//' | cut -c1-32
    return
  fi
  # the top-level path with the most changed files, e.g. docs, remotion, projects.
  # Root-level files (CLAUDE.md) would otherwise yield an uppercase slug, so this
  # lowercases and strips anything git will not take in a branch name.
  local top
  top="$(git status --porcelain | sed 's/^...//' | sed 's/.* -> //' \
        | awk -F/ '{print $1}' | sed 's/^\.//' | sed 's/\.[^.]*$//' \
        | sort | uniq -c | sort -rn | head -1 | awk '{print $2}')"
  top="$(printf '%s' "$top" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' \
        | sed 's/^-*//; s/-*$//' | cut -c1-24)"
  [ -n "$top" ] && printf '%s' "$top" || printf 'changes'
}

if [ "$dirty" -eq 0 ]; then
  # nothing uncommitted — but there may still be local commits worth pushing
  if git rev-parse --abbrev-ref '@{upstream}' >/dev/null 2>&1 \
     && [ -z "$(git log --oneline '@{upstream}..HEAD')" ]; then
    say "Nothing to hand off — working tree clean and '$branch' is already pushed."
    exit 0
  fi
  say "Working tree clean; pushing the local commits on '$branch'."
  git push -u origin HEAD
  say "Pushed. Continue from the app on branch: $branch"
  exit 0
fi

# ── pick the branch ──────────────────────────────────────────────────────────
if [[ "$branch" == wip/* ]]; then
  target="$branch"
  say "Already on a handoff branch; adding to it."
else
  target="wip/$(date +%Y%m%d-%H%M)-$(slug_from_changes "$@")"
  git switch -c "$target" >/dev/null
fi

# -uall, because plain --porcelain collapses an untracked directory to one entry
files="$(git status --porcelain --untracked-files=all | wc -l | tr -d ' ')"
git add -A
subject="wip: $files file(s) parked from $(hostname -s) at $(date '+%H:%M')"
[ "$#" -gt 0 ] && subject="wip: $*"

git commit --quiet -m "$subject" -m "Parked by scripts/wip.sh so this work can be
picked up from another device. NOT reviewed — do not merge to main without reading
the diff." -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"

git push -u origin HEAD

say ""
say "Parked on:  $target"
say "Files:      $files"
say ""
say "From the app, start a session on this repo and switch to '$target'."
say "Back on this Mac, when you have reviewed it:"
say "    git switch main && git merge --squash $target && git commit"
