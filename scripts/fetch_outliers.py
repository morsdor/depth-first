#!/usr/bin/env python3
"""
fetch_outliers.py — the competitor outlier database (YouTube Data API v3).

For each channel in data/comp_channels.yaml: pull its recent long-form uploads
(Shorts excluded by duration), take the channel's MEDIAN views as its baseline,
compute  multiple = views / baseline,  and record every video at or above the
threshold (default 3x) into data/outliers.csv — the evidence base for the
Packaging gate ("does this concept have a >=3x precedent?").

Usage:
    python3 scripts/fetch_outliers.py                  # full run (~65 quota units of 10,000/day)
    python3 scripts/fetch_outliers.py --days 30        # only videos published in the last 30 days
    python3 scripts/fetch_outliers.py --only mustard   # substring filter on channel name (smoke test)
    python3 scripts/fetch_outliers.py --min-multiple 2.5

Setup (one-time):  console.cloud.google.com -> enable "YouTube Data API v3" ->
Credentials -> API key -> put  YOUTUBE_API_KEY=...  in .env at the repo root.
Free tier: 10,000 units/day, NO billing needed (unlike the Gemini image key).
Read-only against public data. Full docs: docs/outlier_system.md

Re-runs are idempotent: rows are deduped on video id; existing rows get their
views/baseline/multiple/velocity refreshed in place (date_added, formula_tag and why
are preserved); new outliers are appended. Row order is stable for clean git diffs.

Known limitation (tracked, deferred): a row is only refreshed while its video is still
in the channel's newest `want` uploads; once it ages out its numbers freeze against a
stale baseline. Fix later by batching every existing CSV id through videos.list (~1 unit
/ 50). No effect until a channel posts `want` newer long-form videos, so it keeps for weeks.
"""

import argparse
import csv
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from statistics import median

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent
DATA_DIR = ROOT / "data"
CHANNELS_PATH = DATA_DIR / "comp_channels.yaml"
CSV_PATH = DATA_DIR / "outliers.csv"
COMP_CSV_PATH = DATA_DIR / "comp_videos.csv"     # the control group: every long-form video scanned, outlier or not
CACHE_PATH = DATA_DIR / ".channels_cache.json"

API_BASE = "https://www.googleapis.com/youtube/v3"
LONGFORM_MIN_SECONDS = 180          # YouTube Shorts run up to 3:00 — longer counts as long-form
# Two axes, recorded separately.  `multiple` = packaging LIFT (views vs the channel's own
# median) — did this title beat the channel's normal?  `views_per_day` / `vpd_multiple` =
# topic DEMAND (raw daily pull, and pull vs the channel's median pull) — does the subject
# draw people at all?  A row can be high on one and low on the other, so gate on both.
COLUMNS = ["id", "date_added", "channel", "title", "url", "published", "views",
           "baseline", "multiple", "views_per_day", "vpd_multiple",
           "thumbnail_url", "duration", "formula_tag", "why"]
# The control group. Without it, counting formulas among outliers is a popularity contest
# between channel formats (a channel that only makes cutaways has only cutaway outliers, by
# construction); with it, a formula's share among outliers can be compared to its base rate.
COMP_COLUMNS = ["id", "channel", "title", "url", "published", "views", "duration",
                "baseline", "multiple", "views_per_day", "vpd_multiple"]

QUOTA_USED = 0                      # 1 unit per list call — printed at the end


def load_dotenv(*candidates):
    # same pattern as generate_images.py / generate_asset.py
    import os
    for p in candidates:
        p = Path(p)
        if p.is_file():
            for line in p.read_text().splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def api_key():
    import os
    key = os.environ.get("YOUTUBE_API_KEY", "").strip()
    if not key:
        sys.exit(
            "YOUTUBE_API_KEY is not set.\n"
            "  1. console.cloud.google.com -> create/select a project\n"
            "  2. APIs & Services -> enable 'YouTube Data API v3'\n"
            "  3. Credentials -> Create credentials -> API key\n"
            "  4. add  YOUTUBE_API_KEY=...  to .env at the repo root\n"
            "Free tier (10,000 units/day) — no billing required. See docs/outlier_system.md"
        )
    return key


def api_get(endpoint, **params):
    """One GET against the Data API. Every list call costs 1 quota unit."""
    global QUOTA_USED
    params["key"] = api_key()
    url = f"{API_BASE}/{endpoint}?{urllib.parse.urlencode(params)}"
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            QUOTA_USED += 1
            return json.load(resp)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        try:
            reason = json.loads(body)["error"]["errors"][0].get("reason", "")
            message = json.loads(body)["error"].get("message", body)
        except Exception:
            reason, message = "", body
        if reason == "quotaExceeded":
            sys.exit("YouTube API daily quota exhausted (10,000 units) — retry after midnight PT.")
        if e.code in (400, 403):
            sys.exit(f"YouTube API rejected the request ({e.code} {reason}): {message}\n"
                     "Check that the key is valid and 'YouTube Data API v3' is enabled on its project.")
        raise


def parse_duration(iso):
    """ISO-8601 duration (PT#H#M#S) -> seconds."""
    m = re.fullmatch(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso or "")
    if not m:
        return 0
    h, mi, s = (int(g or 0) for g in m.groups())
    return h * 3600 + mi * 60 + s


def views_per_day(views, published_iso):
    """Raw demand velocity: total views / days since publish (floor 1 day)."""
    try:
        days = (date.today() - date.fromisoformat(published_iso)).days
    except (ValueError, TypeError):
        return 0.0
    return round(views / max(days, 1), 1)


def load_channels(path):
    try:
        import yaml
    except ImportError:
        sys.exit("pyyaml is required:  pip install pyyaml  (it's in requirements.txt)")
    doc = yaml.safe_load(Path(path).read_text())
    entries = (doc or {}).get("channels") or []
    for e in entries:
        if not e.get("name") or not (e.get("handle") or e.get("channelId")):
            sys.exit(f"comp_channels.yaml: every entry needs a name and a handle or channelId — bad entry: {e}")
    return entries


def resolve_channels(entries):
    """handle -> {channelId, title, uploads playlist}, cached in data/.channels_cache.json."""
    cache = {}
    if CACHE_PATH.is_file():
        cache = json.loads(CACHE_PATH.read_text())

    resolved = []
    to_batch = []                                       # entries with a pinned channelId, uncached
    for e in entries:
        key = e.get("handle") or e["channelId"]
        if key in cache:
            resolved.append({**e, **cache[key]})
        elif e.get("channelId"):
            to_batch.append(e)
        else:                                           # forHandle takes ONE handle per call (1 unit)
            data = api_get("channels", part="snippet,contentDetails", forHandle=e["handle"])
            items = data.get("items") or []
            if not items:
                print(f"  !! {e['handle']} did not resolve — check the handle, skipping {e['name']}")
                continue
            info = _channel_info(items[0])
            cache[key] = info
            resolved.append({**e, **info})

    if to_batch:                                        # pinned IDs batch into one call (1 unit / 50)
        ids = ",".join(e["channelId"] for e in to_batch)
        items = {i["id"]: i for i in api_get("channels", part="snippet,contentDetails", id=ids).get("items", [])}
        for e in to_batch:
            item = items.get(e["channelId"])
            if not item:
                print(f"  !! channelId {e['channelId']} not found — skipping {e['name']}")
                continue
            info = _channel_info(item)
            cache[e["channelId"]] = info
            resolved.append({**e, **info})

    CACHE_PATH.parent.mkdir(exist_ok=True)
    CACHE_PATH.write_text(json.dumps(cache, indent=2) + "\n")

    print("Channel resolution (eyeball this once — a wrong handle silently tracks the wrong channel):")
    for r in resolved:
        print(f"  {r.get('handle', r['channelId']):32s} -> {r['channelTitle']}  ({r['channelId']})")
    return resolved


def _channel_info(item):
    return {
        "channelId": item["id"],
        "channelTitle": item["snippet"]["title"],
        "uploads": item["contentDetails"]["relatedPlaylists"]["uploads"],
    }


def fetch_recent_longform(uploads_playlist, want=30, max_pages=4):
    """Newest `want` long-form videos (Shorts and live entries excluded)."""
    longform, page_token, pages = [], None, 0
    while len(longform) < want and pages < max_pages:
        params = dict(part="contentDetails", playlistId=uploads_playlist, maxResults=50)
        if page_token:
            params["pageToken"] = page_token
        page = api_get("playlistItems", **params)
        pages += 1
        ids = [i["contentDetails"]["videoId"] for i in page.get("items", [])]
        if not ids:
            break
        details = api_get("videos", part="snippet,contentDetails,statistics", id=",".join(ids))
        for v in details.get("items", []):
            sn, st = v["snippet"], v.get("statistics", {})
            if sn.get("liveBroadcastContent", "none") != "none":
                continue
            seconds = parse_duration(v["contentDetails"].get("duration"))
            if seconds <= LONGFORM_MIN_SECONDS or "viewCount" not in st:
                continue
            thumbs = sn.get("thumbnails", {})
            thumb = (thumbs.get("high") or thumbs.get("medium") or thumbs.get("default") or {}).get("url", "")
            longform.append({
                "id": v["id"],
                "title": sn["title"],
                "published": sn["publishedAt"][:10],
                "views": int(st["viewCount"]),
                "duration": seconds,
                "thumbnail_url": thumb,
            })
        page_token = page.get("nextPageToken")
        if not page_token:
            break
    longform.sort(key=lambda v: v["published"], reverse=True)
    return longform[:want]


def read_csv(path):
    if not Path(path).is_file():
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def write_csv(path, rows):
    Path(path).parent.mkdir(exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS)
        w.writeheader()
        w.writerows(rows)


def write_comps(path, comps):
    """Snapshot the full control group (every scanned long-form video). Fresh each run —
    base rates are computed against the CURRENT recent window, not an accreting history."""
    Path(path).parent.mkdir(exist_ok=True)
    comps = sorted(comps, key=lambda c: (c["channel"], -float(c["multiple"])))
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COMP_COLUMNS)
        w.writeheader()
        w.writerows(comps)


def run(channels_path=CHANNELS_PATH, csv_path=CSV_PATH, days=None,
        min_multiple=3.0, only=None, want=30):
    """Scan all channels; merge into the CSV. Returns (new_rows, updated_count)."""
    load_dotenv(ROOT / ".env")
    api_key()                                            # fail fast with the setup hint

    entries = load_channels(channels_path)
    if only:
        entries = [e for e in entries if only.lower() in e["name"].lower()]
        if not entries:
            sys.exit(f"--only '{only}' matched no channel in {channels_path}")

    channels = resolve_channels(entries)
    rows = read_csv(csv_path)
    for r in rows:                                       # migrate pre-velocity CSVs to current columns
        for c in COLUMNS:
            r.setdefault(c, "")
    by_id = {r["id"]: r for r in rows}
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).date().isoformat() if days else None

    new_rows, updated, comps = [], 0, []
    print(f"\nScanning {len(channels)} channels (baseline = median of last {want} long-form):")
    for ch in channels:
        vids = fetch_recent_longform(ch["uploads"], want=want)
        if len(vids) < 5:
            print(f"  {ch['name']:24s} only {len(vids)} long-form videos — skipping (sample too small)")
            continue
        baseline = int(median(v["views"] for v in vids))
        baseline_vpd = median(views_per_day(v["views"], v["published"]) for v in vids) or 1.0
        outliers_here = 0
        for v in vids:
            mult = round(v["views"] / baseline, 2) if baseline else 0.0
            vpd = views_per_day(v["views"], v["published"])
            vpd_mult = round(vpd / baseline_vpd, 2) if baseline_vpd else 0.0
            comps.append({                               # control group: every video, outlier or not
                "id": v["id"], "channel": ch["name"], "title": v["title"],
                "url": f"https://www.youtube.com/watch?v={v['id']}", "published": v["published"],
                "views": str(v["views"]), "duration": str(v["duration"]), "baseline": str(baseline),
                "multiple": f"{mult:.2f}", "views_per_day": f"{vpd:.1f}", "vpd_multiple": f"{vpd_mult:.2f}",
            })
            if v["id"] in by_id:                         # refresh live numbers, keep human columns
                r = by_id[v["id"]]
                r["views"], r["baseline"], r["multiple"] = str(v["views"]), str(baseline), f"{mult:.2f}"
                r["views_per_day"], r["vpd_multiple"] = f"{vpd:.1f}", f"{vpd_mult:.2f}"
                updated += 1
                continue
            if mult < min_multiple:
                continue
            if cutoff and v["published"] < cutoff:
                continue
            row = {
                "id": v["id"], "date_added": date.today().isoformat(), "channel": ch["name"],
                "title": v["title"], "url": f"https://www.youtube.com/watch?v={v['id']}",
                "published": v["published"], "views": str(v["views"]), "baseline": str(baseline),
                "multiple": f"{mult:.2f}", "views_per_day": f"{vpd:.1f}", "vpd_multiple": f"{vpd_mult:.2f}",
                "thumbnail_url": v["thumbnail_url"],
                "duration": str(v["duration"]), "formula_tag": "", "why": "",
            }
            rows.append(row)
            by_id[v["id"]] = row
            new_rows.append(row)
            outliers_here += 1
        print(f"  {ch['name']:24s} baseline {baseline:>12,}   {len(vids):2d} long-form   "
              f"{outliers_here} new outlier{'s' if outliers_here != 1 else ''}")

    write_csv(csv_path, rows)
    write_comps(COMP_CSV_PATH, comps)
    print(f"{COMP_CSV_PATH}: {len(comps)} control-group videos (every long-form scanned, outlier or not).")
    print(f"\n{csv_path}: {len(rows)} rows total — {len(new_rows)} new, {updated} refreshed.")
    if new_rows:
        print("Top new outliers:")
        for r in sorted(new_rows, key=lambda r: float(r["multiple"]), reverse=True)[:10]:
            print(f"  {float(r['multiple']):5.1f}x  {r['channel']:22s}  {r['title']}")
    print(f"Quota used: ~{QUOTA_USED} units (of 10,000/day).")
    return new_rows, updated


def main():
    ap = argparse.ArgumentParser(description="Competitor outlier database (YouTube Data API v3)")
    ap.add_argument("--channels", default=str(CHANNELS_PATH))
    ap.add_argument("--csv", default=str(CSV_PATH))
    ap.add_argument("--days", type=int, default=None,
                    help="only add videos published in the last N days")
    ap.add_argument("--min-multiple", type=float, default=3.0)
    ap.add_argument("--only", default=None, help="substring filter on channel name")
    ap.add_argument("--want", type=int, default=30, help="long-form videos per channel for the baseline")
    a = ap.parse_args()
    run(Path(a.channels), Path(a.csv), days=a.days,
        min_multiple=a.min_multiple, only=a.only, want=a.want)


if __name__ == "__main__":
    main()
