#!/usr/bin/env python3
"""
yt_lane_scan.py — re-run the YouTube lane scan, freeze it as a dated snapshot, and diff it against the last one.

The lane data goes stale in weeks (small channels grow, videos age out of a channel's newest 30, new outliers
appear), so every backlog version is tied to a snapshot and every new snapshot is diffed against the previous.
The procedure and its honesty rules are in .claude/skills/yt-lane-scan/SKILL.md — read it before quoting a result.

    python3 scripts/yt_lane_scan.py plan                       # what a run does and what it costs in API units
    python3 scripts/yt_lane_scan.py run --yes [--queries FILE] # run, snapshot and diff (needs YOUTUBE_API_KEY in .env)
    python3 scripts/yt_lane_scan.py run --yes --only analysis  # re-analyse the data already on disk (0 units)
    python3 scripts/yt_lane_scan.py snapshot [--date D]        # freeze data/ into data/yt_scans/D
    python3 scripts/yt_lane_scan.py diff [--prev D1] [--new D2]  # what changed between two snapshots

The API is free but capped at 10,000 units a day; a full run is ~6,100. The key is read from .env by
fetch_outliers.py and is never printed. Stored YouTube API data is perishable (the API developer policies ask that
non-authorised data be refreshed or deleted within about 30 days — check the current terms): treat any snapshot over a
month old as a record, not as evidence.
"""
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
from datetime import date, datetime
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
DATA = ROOT / "data"
sys.path.insert(0, str(HERE))
import systems_lane_analysis as sla  # noqa: E402  (CORPORATE set and thresholds, one source of truth)

# name, script, args, API units (approx), needs the key
STEPS = [
    ("comp", "fetch_outliers.py", ["--channels", "data/comp_channels_systems.yaml", "--csv", "data/outliers_systems.csv"], 300, True),
    ("hunt", "small_channel_hunt.py", [], 4300, True),
    ("catalogue", "small_channel_catalogue.py", [], 260, True),
    ("analysis", "systems_lane_analysis.py", [], 0, False),
    ("saturation", "idea_saturation_check.py", [], 1250, True),
]
OPTIONAL = ("lane_discovery", "lane_discovery.py", [], 2600, True)

SNAPSHOT_FILES = [
    "comp_channels_systems.yaml", "comp_videos_systems.csv", "outliers_systems.csv", "lane_discovery_v2.csv",
    "lane_discovery_systems.csv", "small_channel_hits_systems.csv", "small_channel_catalogue_systems.csv",
    "channel_stats_systems.csv",
]
SNAPSHOT_DIRS = ["analysis_systems"]
SCANS = Path(os.environ.get("YT_SCANS_DIR", DATA / "yt_scans"))   # override only for tests
SMALL_SUBS, OUTLIER_VIEWS = 5_000, 10_000


def plan(with_optional=False):
    steps = STEPS + ([OPTIONAL] if with_optional else [])
    total = sum(s[3] for s in steps)
    print("A run does, in order:")
    for name, script, args, units, key in steps:
        print(f"  {name:10s} scripts/{script:28s} ~{units:>5,} units{'  (needs the API key)' if key else ''}")
    print(f"  {'':10s} {'snapshot + diff':35s}      0 units\nTotal ~{total:,} units of the 10,000/day free quota.")
    print("The saturation step searches the queries in scripts/idea_saturation_check.py (or --queries FILE): edit them to\n"
          "match the CURRENT top backlog ideas first.")


def run_steps(only, with_optional, queries=None):
    steps = STEPS + ([OPTIONAL] if with_optional else [])
    for name, script, args, units, key in steps:
        if only and name not in only:
            continue
        if name == "saturation" and queries:
            args = [*args, "--queries", queries]
        print(f"\n=== {name}: scripts/{script} {' '.join(args)}", flush=True)
        subprocess.run([sys.executable, str(HERE / script), *args], cwd=ROOT, check=True)
        if name == "comp":  # fetch_outliers always writes data/comp_videos.csv; this lane keeps its own name
            src = DATA / "comp_videos.csv"
            if src.is_file():
                shutil.move(str(src), str(DATA / "comp_videos_systems.csv"))


def _rows(p):
    try:
        return int(len(pd.read_csv(p)))
    except Exception:  # noqa: BLE001
        return None


def snapshot(day):
    dest = SCANS / day
    if dest.exists():
        sys.exit(f"{dest} already exists — pass --date for a different label (never overwrite a snapshot).")
    dest.mkdir(parents=True)
    manifest = {"date": day, "created": datetime.now().isoformat(timespec="seconds"), "files": {},
                "min_age_days": sla.MIN_AGE, "hit_multiple": sla.HIT, "corporate_excluded": sorted(sla.CORPORATE)}
    try:
        manifest["git_head"] = subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    except Exception:  # noqa: BLE001
        pass
    for f in SNAPSHOT_FILES:
        src = DATA / f
        if not src.is_file():
            continue
        shutil.copy2(src, dest / f)
        manifest["files"][f] = {"rows": _rows(src) if f.endswith(".csv") else None,
                                "sha256": hashlib.sha256(src.read_bytes()).hexdigest()[:16],
                                "file_modified": datetime.fromtimestamp(src.stat().st_mtime).date().isoformat()}
    for d in SNAPSHOT_DIRS:
        if (DATA / d).is_dir():
            shutil.copytree(DATA / d, dest / d)
    stale = [f for f, m in manifest["files"].items() if m["file_modified"] < day]
    manifest["not_refreshed_in_this_scan"] = stale
    (dest / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print(f"snapshot -> {dest.relative_to(ROOT)}  ({len(manifest['files'])} files)")
    if stale:
        print("  note: not refreshed on this date (older than the snapshot):", ", ".join(stale))
    return dest


def _outliers(snap):
    cols = ["id", "channel", "subs", "views", "published", "title"]
    parts = [pd.read_csv(snap / f)[cols] for f in ("small_channel_catalogue_systems.csv", "small_channel_hits_systems.csv") if (snap / f).is_file()]
    u = pd.concat(parts).drop_duplicates("id")
    return u[(u["subs"] < SMALL_SUBS) & (u["views"] >= OUTLIER_VIEWS) & ~u["channel"].isin(sla.CORPORATE)].set_index("id"), parts[0]


def _status(df, qcol, hitcol=None):
    ok = df[qcol] < 0.05
    if hitcol:
        ok &= df[hitcol] >= 3
    return ok.map({True: "SUPPORTED", False: "no"})


def _table_diff(prev, new, key, eff, q, hit=None, min_delta=0.15):
    p, n = prev.set_index(key), new.set_index(key)
    rows = []
    for k in sorted(set(p.index) | set(n.index)):
        a = p.loc[k] if k in p.index else None
        b = n.loc[k] if k in n.index else None
        if a is None or b is None:
            rows.append(f"| {k} | {'—' if a is None else a[eff]} | {'—' if b is None else b[eff]} | {'new' if a is None else 'dropped (too few rows)'} |")
            continue
        sa = "SUPPORTED" if a[q] < 0.05 and (hit is None or a[hit] >= 3) else "no"
        sb = "SUPPORTED" if b[q] < 0.05 and (hit is None or b[hit] >= 3) else "no"
        if sa != sb or abs(b[eff] - a[eff]) >= min_delta:
            rows.append(f"| {k} | ×{a[eff]:.2f} ({sa}) | ×{b[eff]:.2f} ({sb}) | {'**status changed**' if sa != sb else 'moved'} |")
    return rows


def diff(prev_day, new_day):
    days = sorted(p.name for p in SCANS.iterdir() if p.is_dir()) if SCANS.is_dir() else []
    if len(days) < 2 and not (prev_day and new_day):
        sys.exit(f"need two snapshots in {SCANS.relative_to(ROOT)} (have {len(days)}) — run `snapshot` after the next scan.")
    new_day = new_day or days[-1]
    prev_day = prev_day or [d for d in days if d < new_day][-1]
    P, N = SCANS / prev_day, SCANS / new_day
    L = [f"# Scan diff — {prev_day} → {new_day}", ""]
    po, _ = _outliers(P)
    no, ncat = _outliers(N)
    L += [f"## Outliers (videos ≥ {OUTLIER_VIEWS:,} views on channels under {SMALL_SUBS:,} subs, vendor channels removed)",
          f"{len(po)} → {len(no)}; **{len(set(no.index) - set(po.index))} new, {len(set(po.index) - set(no.index))} left the set.**", ""]
    new_ids = no.loc[sorted(set(no.index) - set(po.index))].sort_values("views", ascending=False)
    if len(new_ids):
        L += ["**New entrants** (vet each by hand — on-lane? vendor? off-lane viral?):", "", "| views | subs | channel | title | published |", "|--:|--:|:--|:--|:--|"]
        L += [f"| {int(r.views):,} | {int(r.subs):,} | {r.channel} | {r.title[:80]} | {r.published} |" for r in new_ids.head(40).itertuples()]
        L.append("")
    left = po.loc[sorted(set(po.index) - set(no.index))]
    if len(left):
        subs_now = ncat.drop_duplicates("channel").set_index("channel")["subs"]
        reasons = {"graduated": 0, "aged out / removed": 0}
        for r in left.itertuples():
            reasons["graduated" if subs_now.get(r.channel, 0) >= SMALL_SUBS else "aged out / removed"] += 1
        L += [f"**Left the set:** {reasons['graduated']} because the channel is now ≥ {SMALL_SUBS:,} subs; {reasons['aged out / removed']} aged out of the "
              "channel's newest 30 or were removed.", ""]
    both = po.join(no[["views"]], rsuffix="_new", how="inner")
    both["growth"] = both["views_new"] / both["views"] - 1
    rise = both[(both["growth"] >= 0.25) & (both["views_new"] - both["views"] >= 2_000)].sort_values("growth", ascending=False)
    if len(rise):
        L += ["**Still climbing (≥ +25 % and ≥ +2k views since the last scan)** — evergreen candidates:", "", "| channel | title | views before → now |", "|:--|:--|:--|"]
        L += [f"| {r.channel} | {r.title[:70]} | {int(r.views):,} → {int(r.views_new):,} |" for r in rise.head(15).itertuples()]
        L.append("")
    stale = json.loads((N / "manifest.json").read_text()).get("not_refreshed_in_this_scan", []) if (N / "manifest.json").is_file() else []
    if stale:
        L += [f"> Not refreshed in the new scan (identical or older than {new_day}): {', '.join(stale)} — comparisons that use them are not comparisons.", ""]
    for title, fname, key, eff, q, hit in [
        ("Topic effects vs own normal", "topic_effects.csv", "topic", "effect_x(mult)", "q_BH", "channels_with_3x_hit"),
        ("Title features", "title_features.csv", "title_feature", "effect_x(mult)", "q_BH", None),
    ]:
        pf, nf = P / "analysis_systems" / fname, N / "analysis_systems" / fname
        if pf.is_file() and nf.is_file():
            rows = _table_diff(pd.read_csv(pf), pd.read_csv(nf), key, eff, q, hit)
            L += [f"## {title}: what moved (|Δ| ≥ 0.15, or SUPPORTED ↔ no)", ""]
            L += (["| | before | now | |", "|:--|:--|:--|:--|"] + rows) if rows else ["No movement."]
            L.append("")
    pr, nr = P / "analysis_systems" / "topic_opportunity_ranking.csv", N / "analysis_systems" / "topic_opportunity_ranking.csv"
    if pr.is_file() and nr.is_file():
        a, b = pd.read_csv(pr).set_index("topic")["median_rank"], pd.read_csv(nr).set_index("topic")["median_rank"]
        moved = [(t, a[t], b[t]) for t in b.index if t in a.index and abs(b[t] - a[t]) >= 2]
        L += ["## Topic ranking: moved by 2 or more places", ""]
        L += ([f"- {t}: {x:g} → {y:g}" for t, x, y in sorted(moved, key=lambda m: m[2])] or ["No movement."]) + [""]
    ps, ns = P / "analysis_systems" / "idea_saturation.csv", N / "analysis_systems" / "idea_saturation.csv"
    if ps.is_file() and ns.is_file():
        def summ(p):
            d = pd.read_csv(p)
            return d.groupby("idea").agg(median_views=("views", "median"), giants=("subs", lambda s: int((s >= 500_000).sum())), newest=("age_days", "min"))
        a, b = summ(ps), summ(ns)
        rows = [f"| {i} | {int(a.loc[i].median_views):,} → {int(b.loc[i].median_views):,} | {int(a.loc[i].giants)} → {int(b.loc[i].giants)} | {int(a.loc[i].newest)} → {int(b.loc[i].newest)} d |"
                for i in b.index if i in a.index]
        L += ["## Front-page crowding (relevance order, top 10)", "", "| idea | median views | giants (500k+) | newest video |", "|:--|:--|:--|:--|"] + rows + [""]
    out = N / f"diff_vs_{prev_day}.md"
    out.write_text("\n".join(L))
    print("\n".join(L))
    print(f"\nwritten -> {out.relative_to(ROOT) if ROOT in out.parents else out}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("plan"); p.add_argument("--with-lane-discovery", action="store_true")
    r = sub.add_parser("run")
    r.add_argument("--yes", action="store_true", help="actually spend API quota (without it, only prints the plan)")
    r.add_argument("--only", default="", help="comma list of: comp,hunt,catalogue,analysis,saturation,lane_discovery")
    r.add_argument("--with-lane-discovery", action="store_true"); r.add_argument("--date", default=date.today().isoformat())
    r.add_argument("--no-snapshot", action="store_true")
    r.add_argument("--queries", default=None, help="file of 'tag|query' lines for the saturation step (the CURRENT top ideas)")
    s = sub.add_parser("snapshot"); s.add_argument("--date", default=date.today().isoformat())
    d = sub.add_parser("diff"); d.add_argument("--prev"); d.add_argument("--new")
    a = ap.parse_args()
    if a.cmd == "plan":
        plan(a.with_lane_discovery)
    elif a.cmd == "run":
        plan(a.with_lane_discovery)
        if not a.yes:
            print("\n(dry run — add --yes to execute)")
            return
        only = {x for x in a.only.split(",") if x}
        run_steps(only, a.with_lane_discovery, a.queries)
        if not a.no_snapshot:
            snapshot(a.date)
            try:
                diff(None, a.date)
            except SystemExit as e:
                print(e)
    elif a.cmd == "snapshot":
        snapshot(a.date)
    else:
        diff(a.prev, a.new)


if __name__ == "__main__":
    main()
