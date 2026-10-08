#!/usr/bin/env python3
"""
idea_saturation_check.py — what does a VIEWER see when they type the idea's own words? (YouTube Data API v3)

The earlier pulls ranked by view count, so they cannot say how crowded the front page of an idea is. This asks for each
finalist query in RELEVANCE order (what search actually shows), 10 results, and records views / channel subscribers /
age. Reading it: a front page full of 1M+-sub channels with recent 500k+ videos is a wall; a front page with old or small
videos is a gap. It cannot see the thumbnail test, only the supply.

    python3 scripts/idea_saturation_check.py        # ~12 queries x 102 units; stops cleanly on quotaExceeded
    python3 scripts/idea_saturation_check.py --queries FILE   # FILE: one 'tag|query' per line — use the CURRENT top ideas

Writes data/analysis_systems/idea_saturation.csv. The key is read from .env by fetch_outliers.py and never printed.
"""
import csv
import sys
from datetime import date
from pathlib import Path
from statistics import median

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fetch_outliers as fo  # noqa: E402

ROOT, DATA = fo.ROOT, fo.DATA_DIR
OUT = DATA / "analysis_systems" / "idea_saturation.csv"

QUERIES = [
    ("Y-kv", "KV cache explained LLM inference"),
    ("Y-flash", "FlashAttention explained"),
    ("Y-dcpower", "how data center power works"),
    ("Y-dcai", "why AI data centers need so much power"),
    ("Y-cpugpu", "why GPU is faster than CPU matrix multiplication"),
    ("Y-transistor", "how transistors become a computer adder logic gates"),
    ("Y-membound", "LLM tokens per second memory bandwidth explained"),
    ("Y-memhier", "memory hierarchy cache RAM SSD latency explained"),
    ("Y-hbm", "how HBM high bandwidth memory works"),
    ("Y-cable", "undersea internet cables how they work"),
    ("Y-cpuscratch", "build a CPU from scratch simulator"),
    ("Y-euv", "how EUV lithography works"),
]


def load_queries(argv):
    """--queries FILE: one 'tag|query' per line (# comments allowed). Default: the built-in finalists above."""
    if "--queries" in argv:
        path = Path(argv[argv.index("--queries") + 1])
        out = []
        for line in path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "|" in line:
                tag, q = line.split("|", 1)
                out.append((tag.strip(), q.strip()))
        return out
    return QUERIES


def main():
    queries = load_queries(sys.argv)
    fo.load_dotenv(ROOT / ".env")
    fo.api_key()
    today = date.today()
    rows = []
    for tag, q in queries:
        try:
            s = fo.api_get("search", part="snippet", type="video", q=q, order="relevance", maxResults=10,
                           relevanceLanguage="en", safeSearch="none", videoDuration="medium")
        except Exception as e:  # noqa: BLE001  quotaExceeded etc.
            print(f"  stopped at '{q}': {type(e).__name__}")
            break
        ids = [i["id"]["videoId"] for i in s.get("items", [])]
        if not ids:
            continue
        v = fo.api_get("videos", part="snippet,statistics,contentDetails", id=",".join(ids))["items"]
        cids = sorted({x["snippet"]["channelId"] for x in v})
        c = {x["id"]: x for x in fo.api_get("channels", part="statistics", id=",".join(cids))["items"]}
        by = {x["id"]: x for x in v}
        for rank, vid in enumerate(ids, 1):
            x = by.get(vid)
            if not x:
                continue
            sub = c.get(x["snippet"]["channelId"], {}).get("statistics", {})
            subs = None if sub.get("hiddenSubscriberCount") else int(sub.get("subscriberCount", 0))
            pub = x["snippet"]["publishedAt"][:10]
            rows.append({"idea": tag, "query": q, "rank": rank, "title": x["snippet"]["title"], "channel": x["snippet"]["channelTitle"],
                         "subs": subs, "views": int(x["statistics"].get("viewCount", 0)), "published": pub,
                         "age_days": (today - date.fromisoformat(pub)).days, "url": f"https://www.youtube.com/watch?v={vid}"})
        print(f"  {tag:13s} {q}")
    if not rows:
        print("no rows")
        return
    OUT.parent.mkdir(exist_ok=True)
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"\n{OUT.relative_to(ROOT)}: {len(rows)} rows\n")
    for tag, q in queries:
        r = [x for x in rows if x["idea"] == tag]
        if not r:
            continue
        big = sum(1 for x in r if x["subs"] and x["subs"] >= 500_000)
        small = sum(1 for x in r if x["subs"] is not None and x["subs"] < 50_000)
        print(f"{tag:13s} top10 median views {int(median(x['views'] for x in r)):>9,}  from >=500k-sub channels {big}/10  "
              f"from <50k-sub {small}/10  newest {min(x['age_days'] for x in r)}d  median age {int(median(x['age_days'] for x in r))}d")


if __name__ == "__main__":
    main()
