#!/usr/bin/env python3
"""
lane_discovery.py — find what SMALL channels get in a topic lane (YouTube Data API v3).

fetch_outliers.py answers "did this video beat its own channel's normal?" for channels you already
know. It cannot answer the question a NEW channel needs: "can a channel with a small audience get views
on this topic at all?" This does. It searches the lane by topic (most-viewed first, last two years),
fetches the channel behind every hit, and records subscribers next to views.

    python3 scripts/lane_discovery.py                 # ~26 searches = ~2,600 quota units of 10,000/day
    python3 scripts/lane_discovery.py --only Pillar-B

Also writes data/channel_stats_systems.csv: subscribers and median views for every channel in
data/comp_channels_systems.yaml, from the ids fetch_outliers.py resolved.

READ THE LIMITS BEFORE QUOTING IT. Searching by view count returns the most-viewed videos, so this is an
EXISTENCE proof ("small channels do reach 100k+ here"), not a base rate ("most small channels do").
The key is read from .env by fetch_outliers.py's loader and is never printed.
"""
import argparse
import csv
import json
import sys
from datetime import date, timedelta
from pathlib import Path
from statistics import median

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fetch_outliers as fo  # noqa: E402

ROOT = fo.ROOT
DATA = fo.DATA_DIR
OUT_HITS = DATA / "lane_discovery_systems.csv"
OUT_CHANNELS = DATA / "channel_stats_systems.csv"

COST = {"search": 100}  # every other list call is 1 unit

QUERIES = [
    # A — failures as stories
    ("A", "outage postmortem explained"),
    ("A", "how the AWS outage happened"),
    ("A", "Cloudflare outage explained"),
    ("A", "CrowdStrike outage explained"),
    ("A", "production database deleted story"),
    ("A", "BGP hijack explained"),
    ("A", "Facebook outage BGP DNS explained"),
    ("A", "worst software bugs in history"),
    # B — the physical side of computing
    ("B", "how undersea internet cables work"),
    ("B", "AI data center power consumption explained"),
    ("B", "how the internet physically works"),
    ("B", "why AI chips GPUs are so expensive"),
    ("B", "inside a data center how it works"),
    ("B", "how chips are manufactured TSMC explained"),
    # C — trade-offs with numbers
    ("C", "why LLM inference is expensive"),
    ("C", "tail latency explained"),
    ("C", "how Netflix delivers video CDN"),
    ("C", "how Discord stores trillions of messages"),
    ("C", "system design case study failure at scale"),
    ("C", "queueing theory explained for engineers"),
    ("C", "database scaling story postgres"),
    ("C", "how WhatsApp handles millions of connections"),
    # D — control: ML concepts
    ("D", "transformers explained visually"),
    ("D", "machine learning explained simply"),
    ("D", "how neural networks learn explained"),
    ("D", "how large language models work explained"),
]


def search_ids(q, after):
    data = fo.api_get("search", part="snippet", type="video", q=q, order="viewCount",
                      publishedAfter=after, maxResults=50, relevanceLanguage="en", safeSearch="none")
    return [i["id"]["videoId"] for i in data.get("items", [])]


def batched(xs, n=50):
    for i in range(0, len(xs), n):
        yield xs[i:i + n]


def channel_stats(ids):
    out = {}
    for chunk in batched(sorted(set(ids))):
        data = fo.api_get("channels", part="snippet,statistics", id=",".join(chunk))
        for c in data.get("items", []):
            st = c.get("statistics", {})
            out[c["id"]] = {
                "title": c["snippet"]["title"],
                "subs": None if st.get("hiddenSubscriberCount") else int(st.get("subscriberCount", 0)),
                "videos": int(st.get("videoCount", 0)),
                "country": c["snippet"].get("country", ""),
            }
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default=None, help="Pillar letter (A/B/C/D) or substring of the query")
    a = ap.parse_args()
    fo.load_dotenv(ROOT / ".env")
    fo.api_key()

    after = (date.today() - timedelta(days=730)).isoformat() + "T00:00:00Z"
    queries = [(p, q) for p, q in QUERIES if not a.only or a.only.upper() == p or a.only.lower() in q.lower()]
    units = 0
    found = {}  # video id -> {pillar, queries}
    for p, q in queries:
        ids = search_ids(q, after)
        units += COST["search"]
        for vid in ids:
            rec = found.setdefault(vid, {"pillar": p, "queries": []})
            rec["queries"].append(q)
        print(f"  [{p}] {q:52s} {len(ids):2d} hits")

    vids = {}
    for chunk in batched(list(found)):
        data = fo.api_get("videos", part="snippet,contentDetails,statistics", id=",".join(chunk))
        units += 1
        for v in data.get("items", []):
            st = v.get("statistics", {})
            secs = fo.parse_duration(v["contentDetails"].get("duration"))
            if secs <= fo.LONGFORM_MIN_SECONDS or "viewCount" not in st:
                continue
            vids[v["id"]] = {
                "title": v["snippet"]["title"], "channelId": v["snippet"]["channelId"],
                "published": v["snippet"]["publishedAt"][:10], "views": int(st["viewCount"]), "duration": secs,
            }

    chans = channel_stats([v["channelId"] for v in vids.values()])
    units += (len(chans) + 49) // 50

    rows = []
    for vid, v in vids.items():
        c = chans.get(v["channelId"], {})
        subs = c.get("subs")
        rows.append({
            "id": vid, "pillar": found[vid]["pillar"], "channel": c.get("title", ""), "channelId": v["channelId"],
            "subs": "" if subs is None else subs, "views": v["views"],
            "views_per_sub": "" if not subs else round(v["views"] / subs, 2),
            "published": v["published"], "duration": v["duration"], "title": v["title"],
            "country": c.get("country", ""), "queries": " | ".join(sorted(set(found[vid]["queries"]))),
            "url": f"https://www.youtube.com/watch?v={vid}",
        })
    rows.sort(key=lambda r: -r["views"])
    with open(OUT_HITS, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"\n{OUT_HITS.relative_to(ROOT)}: {len(rows)} long-form videos from {len(chans)} channels")

    # subscribers + median views for the comp channels, from the ids the outlier scan already resolved
    cache = json.loads(fo.CACHE_PATH.read_text()) if fo.CACHE_PATH.is_file() else {}
    comp_ids = [c["channelId"] for c in cache.values()]
    comp = channel_stats(comp_ids)
    units += (len(comp_ids) + 49) // 50
    baselines = {}
    comp_csv = DATA / "comp_videos_systems.csv"
    if comp_csv.is_file():
        by = {}
        for r in csv.DictReader(open(comp_csv, newline="", encoding="utf-8")):
            by.setdefault(r["channel"], []).append(int(r["views"]))
        baselines = {k: int(median(v)) for k, v in by.items()}
    with open(OUT_CHANNELS, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["channelId", "title", "subs", "videos", "country", "median_views_recent30"])
        for cid, c in comp.items():
            w.writerow([cid, c["title"], "" if c["subs"] is None else c["subs"], c["videos"], c["country"],
                        baselines.get(c["title"], "")])
    print(f"{OUT_CHANNELS.relative_to(ROOT)}: {len(comp)} comp channels")
    print(f"Quota used: ~{units} units (of 10,000/day).")


if __name__ == "__main__":
    main()
