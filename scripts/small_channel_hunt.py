#!/usr/bin/env python3
"""
small_channel_hunt.py — find videos that got real views on a channel with almost no audience, in a topic lane.

lane_discovery.py showed the lane's size mix. This goes after the part a NEW channel cares about:
which videos reached tens or hundreds of thousands of views from channels under ~5k subscribers, and was
that one lucky hit or is the channel repeatable?

  1. Searches ~40 topic queries (most-viewed first, last two years, 4-20 min or 20+ min).
  2. Fetches every hit's channel (subs, created date, uploads playlist).
  3. For every channel under MAX_SUBS that owns at least one decent hit, pulls its newest 30 long-form
     videos, so each hit can be scored against that channel's OWN median (a repeatable channel vs a fluke).

    python3 scripts/small_channel_hunt.py            # ~4,000 search units + ~600 list units of 10,000/day

Writes data/lane_discovery_v2.csv (every hit) and data/small_channel_hits_systems.csv (the small-channel table).
EXISTENCE PROOF ONLY: search is ranked by views, queries are mine, subscriber counts are today's.
The API key is read from .env by fetch_outliers.py's loader and is never printed.
"""
import csv
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from statistics import median

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fetch_outliers as fo  # noqa: E402

ROOT, DATA = fo.ROOT, fo.DATA_DIR
OUT_ALL = DATA / "lane_discovery_v2.csv"
OUT_SMALL = DATA / "small_channel_hits_systems.csv"

MAX_SUBS = 10_000          # channels kept for the catalogue pass; the report separates <5k from 5-10k
MIN_HIT_VIEWS = 5_000      # a channel must own a hit this big to be worth a catalogue pull

# (lane, query, duration)  duration: medium = 4-20 min, long = 20+ min
Q = [
    # physical computing
    ("phys", "how a CPU works inside transistors animation", "medium"),
    ("phys", "how a GPU works architecture explained", "medium"),
    ("phys", "how RAM memory works physically", "medium"),
    ("phys", "how SSD flash storage works", "medium"),
    ("phys", "how a hard drive works inside", "medium"),
    ("phys", "how undersea cables are laid", "medium"),
    ("phys", "inside a data center how servers are cooled", "medium"),
    ("phys", "how fiber optic internet works light", "medium"),
    ("phys", "how wifi works physically", "medium"),
    ("phys", "how a transistor works", "medium"),
    ("phys", "how chips are made lithography EUV", "medium"),
    ("phys", "how the internet physically works routers cables", "medium"),
    ("phys", "how starlink satellite internet works", "medium"),
    ("phys", "how AI data centers use power and cooling", "medium"),
    ("phys", "from electricity to software how a computer really works", "long"),
    # AI internals, visual
    ("ai", "how ChatGPT works visualized in 3D", "medium"),
    ("ai", "transformer attention visualized", "medium"),
    ("ai", "how LLM inference works KV cache explained", "medium"),
    ("ai", "quantization explained LLM memory", "medium"),
    ("ai", "why GPUs are used for AI matrix multiplication explained", "medium"),
    ("ai", "how a neural network learns visualized", "medium"),
    ("ai", "tokenization explained how LLMs read text", "medium"),
    ("ai", "embeddings explained visualization", "medium"),
    ("ai", "how diffusion models generate images explained visually", "medium"),
    # built and measured
    ("build", "I built a tiny LLM from scratch", "medium"),
    ("build", "I trained a neural network from scratch in C", "medium"),
    ("build", "I built my own CPU from scratch", "medium"),
    ("build", "I tested GPUs for AI benchmark results", "medium"),
    ("build", "I measured how much power AI uses", "medium"),
    ("build", "running LLM locally tokens per second benchmark", "medium"),
    ("build", "I built a computer from logic gates", "long"),
    ("build", "experiment measuring cache memory speed", "medium"),
    ("build", "I trained an AI on my own computer how long it took", "medium"),
    # algorithms and data, visual
    ("algo", "sorting algorithms visualized 3D", "medium"),
    ("algo", "pathfinding algorithm visualized", "medium"),
    ("algo", "how video compression works visually", "medium"),
    ("algo", "data structures visualized animation", "medium"),
    ("algo", "how hash tables work visualized", "medium"),
    ("algo", "how encryption works visualized", "medium"),
    ("algo", "machine learning explained in 3D animation", "medium"),
]


def batched(xs, n=50):
    for i in range(0, len(xs), n):
        yield xs[i:i + n]


def main():
    fo.load_dotenv(ROOT / ".env")
    fo.api_key()
    after = (date.today() - timedelta(days=730)).isoformat() + "T00:00:00Z"
    units = 0

    found = {}
    for lane, q, dur in Q:
        data = fo.api_get("search", part="snippet", type="video", q=q, order="viewCount", publishedAfter=after,
                          maxResults=50, relevanceLanguage="en", safeSearch="none", videoDuration=dur)
        units += 100
        ids = [i["id"]["videoId"] for i in data.get("items", [])]
        for v in ids:
            rec = found.setdefault(v, {"lane": lane, "queries": []})
            rec["queries"].append(q)
        print(f"  [{lane:5s}] {q:62s} {len(ids):2d}")

    vids = {}
    for chunk in batched(list(found)):
        data = fo.api_get("videos", part="snippet,contentDetails,statistics", id=",".join(chunk))
        units += 1
        for v in data.get("items", []):
            st = v.get("statistics", {})
            secs = fo.parse_duration(v["contentDetails"].get("duration"))
            if secs <= fo.LONGFORM_MIN_SECONDS or "viewCount" not in st:
                continue
            th = v["snippet"].get("thumbnails", {})
            vids[v["id"]] = {
                "title": v["snippet"]["title"], "channelId": v["snippet"]["channelId"],
                "published": v["snippet"]["publishedAt"][:10], "views": int(st["viewCount"]), "duration": secs,
                "thumb": (th.get("high") or th.get("medium") or th.get("default") or {}).get("url", ""),
            }

    chans = {}
    cids = sorted({v["channelId"] for v in vids.values()})
    for chunk in batched(cids):
        data = fo.api_get("channels", part="snippet,statistics,contentDetails", id=",".join(chunk))
        units += 1
        for c in data.get("items", []):
            st = c.get("statistics", {})
            chans[c["id"]] = {
                "title": c["snippet"]["title"], "created": c["snippet"]["publishedAt"][:10],
                "subs": None if st.get("hiddenSubscriberCount") else int(st.get("subscriberCount", 0)),
                "videos": int(st.get("videoCount", 0)), "country": c["snippet"].get("country", ""),
                "uploads": c["contentDetails"]["relatedPlaylists"]["uploads"],
            }

    all_rows = []
    for vid, v in vids.items():
        c = chans.get(v["channelId"], {})
        all_rows.append({"id": vid, "lane": found[vid]["lane"], "channel": c.get("title", ""), "channelId": v["channelId"],
                         "subs": "" if c.get("subs") is None else c["subs"], "channel_created": c.get("created", ""),
                         "views": v["views"], "published": v["published"], "duration": v["duration"], "title": v["title"],
                         "queries": " | ".join(sorted(set(found[vid]["queries"]))),
                         "url": f"https://www.youtube.com/watch?v={vid}"})
    all_rows.sort(key=lambda r: -r["views"])
    with open(OUT_ALL, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(all_rows[0].keys()))
        w.writeheader()
        w.writerows(all_rows)
    print(f"\n{OUT_ALL.relative_to(ROOT)}: {len(all_rows)} long-form videos, {len(chans)} channels")

    # catalogue pass: small channels that own at least one decent hit
    best = {}
    for v in vids.values():
        best[v["channelId"]] = max(best.get(v["channelId"], 0), v["views"])
    cand = [cid for cid, c in chans.items()
            if c["subs"] is not None and c["subs"] < MAX_SUBS and best.get(cid, 0) >= MIN_HIT_VIEWS]
    print(f"catalogue pass: {len(cand)} channels under {MAX_SUBS:,} subs with a hit of {MIN_HIT_VIEWS:,}+ views")

    small_rows = []
    lane_of_channel = {}
    for vid, v in vids.items():
        lane_of_channel.setdefault(v["channelId"], found[vid]["lane"])
    today = datetime.now(timezone.utc).date()
    for n, cid in enumerate(cand, 1):
        c = chans[cid]
        try:
            vs = fo.fetch_recent_longform(c["uploads"], want=30)
            units += 3
        except Exception:
            continue
        if not vs:
            continue
        med = int(median(x["views"] for x in vs))
        age = (today - date.fromisoformat(c["created"])).days
        for x in vs:
            if x["views"] < 3_000 and x["id"] not in vids:
                continue
            small_rows.append({
                "id": x["id"], "lane": lane_of_channel.get(cid, ""), "channel": c["title"], "channelId": cid, "subs": c["subs"],
                "channel_created": c["created"], "channel_age_days": age, "channel_videos": c["videos"], "country": c["country"],
                "catalogue_n": len(vs), "channel_median_views": med,
                "views": x["views"], "mult_vs_own_median": round(x["views"] / med, 2) if med else "",
                "views_per_sub": round(x["views"] / c["subs"], 2) if c["subs"] else "",
                "published": x["published"], "duration": x["duration"], "title": x["title"],
                "in_search": x["id"] in vids, "thumb": x["thumbnail_url"], "url": f"https://www.youtube.com/watch?v={x['id']}",
            })
        if n % 25 == 0:
            print(f"  ...{n}/{len(cand)} channels")
    small_rows.sort(key=lambda r: -r["views"])
    with open(OUT_SMALL, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(small_rows[0].keys()))
        w.writeheader()
        w.writerows(small_rows)
    print(f"{OUT_SMALL.relative_to(ROOT)}: {len(small_rows)} videos from {len(cand)} small channels")
    print(f"Quota used: ~{units} units (of 10,000/day).")


if __name__ == "__main__":
    main()
