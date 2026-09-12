#!/usr/bin/env python3
"""List the live reel candidates in backlog/open.md, with status read from the repo.

Stage 1 of the `new-reel` skill. This script reports FACTS and deliberately does no
ranking: which idea is worth a day of work is an editorial call made in the skill and
decided by the human, and a script that scored ideas would be exactly the
machine-checkable rigor CLAUDE.md warns the model drifts toward.

Status is never taken from memory. It comes from three places in the repo:

  built       CLAUDE.md's "Built so far" table         (backlog id -> reel id + state)
  gate-*      gate0/*/gate0/GATE0.md, first line       (FAILED in the title = killed)
  started     projects/<id>_*/ exists with no GATE0.md (work begun, no gate written)

    python3 .claude/skills/new-reel/scripts/backlog_ideas.py
    python3 .claude/skills/new-reel/scripts/backlog_ideas.py --all
    python3 .claude/skills/new-reel/scripts/backlog_ideas.py --id I58
    python3 .claude/skills/new-reel/scripts/backlog_ideas.py --json

NOTE ON ACCENTS: the section headings in backlog/open.md carry hex values that no
longer match remotion/src/brand/tokens.ts (the backlog says infrastructure #22D3EE,
tokens.ts says #00D6F7). The ACCENT NAME is the decision the section makes; the hex
comes from DOMAIN_ACCENT in tokens.ts, which is what brand:check enforces. This script
prints the name and the tokens.ts hex, never the backlog's.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]

# Moved out of the root content_backlog.md on 2026-09-12. THE LIVE LIST IS open.md AND
# IT CONTAINS ONLY LIVE CANDIDATES: anything posted, retired, killed or shelved was moved
# to posted.md / closed.md so the list a human reads is the list that is actually open.
# Ids stay permanent and are never reused — the other two files are what guarantee that.
BACKLOG = ROOT / 'backlog' / 'open.md'
SPENT = {'posted': ROOT / 'backlog' / 'posted.md',
         'closed': ROOT / 'backlog' / 'closed.md'}
CLAUDE_MD = ROOT / 'CLAUDE.md'
PROJECTS = ROOT / 'projects'
GATE0 = ROOT / 'gate0'
TOKENS = ROOT / 'remotion' / 'src' / 'brand' / 'tokens.ts'

# CLAUDE.md: "Prefer the open with these eight until they are used up."
OPENERS = ('I01', 'I02', 'I03', 'I15', 'I17', 'I25', 'I31', 'I42')

SECTION_RE = re.compile(r'^##\s+§(\d+)\s+·\s+(.+?)\s+—\s+accent\s+`(\w+)')
ROW_RE = re.compile(r'^\|\s*\*\*(I\d+)\*\*\s*(★?)\s*\|(.*)$')
NOTE_RE = re.compile(r'^\*\(')
BUILT_RE = re.compile(r'^\|\s*`(r\d+)`\s*\|\s*`(I\d+)`\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|')


def domain_accents() -> dict[str, str]:
    """The authoritative accent hexes, straight out of tokens.ts."""
    if not TOKENS.exists():
        return {}
    block = TOKENS.read_text(encoding='utf-8').split('DOMAIN_ACCENT', 1)
    if len(block) < 2:
        return {}
    body = block[1].split('} as const', 1)[0]
    return dict(re.findall(r"(\w+):\s*'(#[0-9A-Fa-f]{6})'", body))


def parse_backlog() -> list[dict]:
    """Every id row in section order, with its section, accent name and trailing note."""
    entries: list[dict] = []
    section = accent = None
    section_no = None
    for line in BACKLOG.read_text(encoding='utf-8').splitlines():
        m = SECTION_RE.match(line)
        if m:
            section_no, section, accent = m.group(1), m.group(2), m.group(3)
            continue
        m = ROW_RE.match(line)
        if m:
            cells = [c.strip() for c in m.group(3).split('|')]
            entries.append({
                'id': m.group(1),
                'opener': m.group(2) == '★' or m.group(1) in OPENERS,
                'section': f'§{section_no} {section}' if section else '(no section)',
                'accent': accent or '(none)',
                'hook': cells[0] if len(cells) > 0 else '',
                'already_know': cells[1] if len(cells) > 1 else '',
                'never_seen': cells[2] if len(cells) > 2 else '',
                'on_screen': cells[3] if len(cells) > 3 else '',
                'family': cells[4] if len(cells) > 4 else '',
                'note': '',
            })
            continue
        if NOTE_RE.match(line) and entries:
            entries[-1]['note'] = (entries[-1]['note'] + ' ' + line.strip()).strip()
    return entries


def parse_built() -> dict[str, dict]:
    """CLAUDE.md's Built-so-far table — the authoritative record of what exists."""
    built: dict[str, dict] = {}
    if not CLAUDE_MD.exists():
        return built
    for line in CLAUDE_MD.read_text(encoding='utf-8').splitlines():
        m = BUILT_RE.match(line)
        if m:
            built[m.group(2)] = {'reel': m.group(1), 'subject': m.group(3), 'state': m.group(4)}
    return built


def parse_projects() -> dict[str, dict]:
    """Gate verdicts and in-flight work.

    Since 2026-09-10 the two trees mean different things:
      projects/r<NNN>_<name>/  a reel that SHIPPED — its status comes from CLAUDE.md's table
      gate0/i<NN>_<slug>/      a concept with a written Gate 0 and no shipped reel

    Only the second is scanned here. `projects/` is still swept for an id-named
    directory so a build in flight before its reel number exists is not invisible.
    """
    found: dict[str, dict] = {}
    for root in (GATE0, PROJECTS):
        if not root.is_dir():
            continue
        for d in sorted(root.iterdir()):
            m = re.match(r'^(i\d+)_', d.name)
            if not (d.is_dir() and m):
                continue
            bid = 'I' + m.group(1)[1:].zfill(2)
            if bid in found:
                continue
            gate = d / 'gate0' / 'GATE0.md'
            if gate.exists():
                title = gate.read_text(encoding='utf-8').splitlines()[0]
                state = 'gate-failed' if 'FAILED' in title.upper() else 'gate-written'
            else:
                state = 'started'
            found[bid] = {'dir': f'{root.name}/{d.name}', 'state': state}
    return found


def status_of(entry: dict, built: dict, projects: dict) -> tuple[str, str]:
    """(status, detail). Precedence: what was built beats what was merely gated."""
    bid = entry['id']
    hook = entry['hook']
    if bid in built:
        b = built[bid]
        return 'BUILT', f"{b['reel']} — {b['state']}"
    if bid in projects:
        p = projects[bid]
        if p['state'] == 'gate-failed':
            return 'FAILED', f"Gate 0 — see {p['dir']}/gate0/GATE0.md"
        if p['state'] == 'gate-written':
            return 'IN GATE', f"gate written, no build — {p['dir']}"
        return 'STARTED', p['dir']
    if 'retired' in hook.lower():
        return 'RETIRED', 'see the row'
    # A build that was made and stopped by a human. The concept may still be open —
    # what is spent is the execution, and the row says which. Deleted projects leave
    # no directory to detect, so the row is the only record.
    if 'shelved' in hook.lower():
        return 'SHELVED', 'built and stopped — see the row before rebuilding'
    if 'FAILED' in hook:
        return 'FAILED', 'marked in the backlog row'
    if 'produced as' in hook:
        return 'BUILT', 'marked in the backlog row'
    return 'OPEN', ''


def clean(s: str, width: int | None = None) -> str:
    s = re.sub(r'\*\*(.+?)\*\*', r'\1', s)
    s = re.sub(r'\s*—\s*[✅❌].*$', '', s).strip()
    if width and len(s) > width:
        s = s[: width - 1].rstrip() + '…'
    return s


def show_one(e: dict) -> None:
    print(f"\n{e['id']}{'  ★' if e['opener'] else ''}   [{e['status']}]"
          f"{'  ' + e['detail'] if e['detail'] else ''}")
    print(f"  section     {e['section']}")
    print(f"  accent      {e['accent']}  {e['accent_hex']}   (tokens.ts DOMAIN_ACCENT)")
    print(f"  hook        {clean(e['hook'])}")
    print(f"  they know   {clean(e['already_know'])}")
    print(f"  never seen  {clean(e['never_seen'])}")
    print(f"  on screen   {clean(e['on_screen'])}")
    print(f"  family      {clean(e['family'])}")
    if e['note']:
        print(f"  NOTE        {clean(e['note'])}")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--all', action='store_true', help='every id, including built and killed')
    ap.add_argument('--id', help='one id in full, with its trailing note')
    ap.add_argument('--json', action='store_true', help='machine-readable dump')
    a = ap.parse_args()

    if not BACKLOG.exists():
        print(f'the live backlog was not found at {BACKLOG}', file=sys.stderr)
        return 2

    accents = domain_accents()
    built, projects = parse_built(), parse_projects()
    entries = parse_backlog()
    for e in entries:
        e['status'], e['detail'] = status_of(e, built, projects)
        e['accent_hex'] = accents.get(e['accent'], '?')

    if a.json:
        print(json.dumps(entries, indent=2, ensure_ascii=False))
        return 0

    if a.id:
        want = a.id.upper()
        hit = [e for e in entries if e['id'] == want]
        if not hit:
            for where, path in SPENT.items():
                if path.exists() and f"**{want}**" in path.read_text(encoding='utf-8'):
                    print(f'{want} is SPENT — it is in backlog/{where}.md. '
                          f'Ids are permanent and are never reused for a different concept.')
                    return 0
            print(f'no row for {want} in backlog/open.md — propose it as a new id first',
                  file=sys.stderr)
            return 1
        show_one(hit[0])
        return 0

    counts: dict[str, int] = {}
    for e in entries:
        counts[e['status']] = counts.get(e['status'], 0) + 1

    print(f'backlog/open.md (live) — {len(entries)} ids   ' +
          '   '.join(f'{k} {v}' for k, v in sorted(counts.items())))
    print('Runtime 30-60 s. The subject is any system whose mechanism can be shown running on '
          'real data.')
    print('★ = "open with these eight" — prefer these while any remain open.\n')

    section = None
    for e in entries:
        if not a.all and e['status'] != 'OPEN':
            continue
        if e['section'] != section:
            section = e['section']
            hexv = accents.get(e['accent'], '?')
            print(f"\n── {section}  → accent {e['accent']} {hexv}")
        star = '★' if e['opener'] else ' '
        tag = '' if e['status'] == 'OPEN' else f"  [{e['status']}]"
        print(f"  {star} {e['id']}  {clean(e['hook'], 88)}{tag}")

    if not a.all:
        spent = [e for e in entries if e['status'] != 'OPEN']
        if spent:
            print('\nnot available: ' +
                  ', '.join(f"{e['id']} {e['status'].lower()}" for e in spent))
    print('\nNext: shortlist 5-7 and answer, per candidate — the sentence, who the viewer sends '
          'it to\nand what they are proving, is the object nameable with the sound off, is it '
          'visible by\nnature, and may the data be used. Then ASK. Do not pick.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
