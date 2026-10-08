#!/usr/bin/env python3
"""
small_channel_catalogue.py — re-pull the small channels' catalogues WITHOUT small_channel_hunt.py's 3,000-view filter.

small_channel_hunt.py:177 dropped every catalogue video under 3,000 views unless it was also a search hit, so the small
channels' flops were missing and any hit-vs-flop comparison on small_channel_hits_systems.csv is biased upward. This
keeps every one of each channel's newest 30 long-form videos.

    python3 scripts/small_channel_catalogue.py        # ~84 channels x ~3 list units = ~250 units of 10,000/day

Reads channel ids/subs from data/small_channel_hits_systems.csv, derives each uploads playlist as 'UU'+id[2:] (free).
Writes data/small_channel_catalogue_systems.csv. Selection caveat that REMAINS: these channels were found because one of
their videos was a search hit, so "share of videos that hit" is still inflated per channel. Within-channel comparisons
(top vs bottom of the same catalogue) are fine. The key is read from .env by fetch_outliers.py and never printed.
"""
import csv
import sys
from datetime import datetime, timezone, date
from pathlib import Path
from statistics import median

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fetch_outliers as fo  # noqa: E402

ROOT, DATA = fo.ROOT, fo.DATA_DIR
SRC = DATA / "small_channel_hits_systems.csv"
OUT = DATA / "small_channel_catalogue_systems.csv"


def main():
    fo.load_dotenv(ROOT / ".env")
    fo.api_key()
    chans = {}
    for r in csv.DictReader(open(SRC, newline="", encoding="utf-8")):
        chans.setdefault(r["channelId"], r)
    today = datetime.now(timezone.utc).date()
    rows, units = [], 0
    for n, (cid, c) in enumerate(chans.items(), 1):
        uploads = "UU" + cid[2:]
        try:
            vs = fo.fetch_recent_longform(uploads, want=30)
            units += 3
        except Exception as e:  # noqa: BLE001
            print(f"  skip {c['channel']}: {type(e).__name__}")
            continue
        if not vs:
            continue
        med = int(median(v["views"] for v in vs))
        for v in vs:
            rows.append({
                "id": v["id"], "lane": c["lane"], "channel": c["channel"], "channelId": cid, "subs": c["subs"],
                "channel_created": c["channel_created"], "catalogue_n": len(vs), "channel_median_views": med,
                "views": v["views"], "mult_vs_own_median": round(v["views"] / med, 3) if med else "",
                "published": v["published"], "age_days": (today - date.fromisoformat(v["published"])).days,
                "duration": v["duration"], "title": v["title"],
                "url": f"https://www.youtube.com/watch?v={v['id']}",
            })
        if n % 20 == 0:
            print(f"  ...{n}/{len(chans)} channels")
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"{OUT.relative_to(ROOT)}: {len(rows)} videos from {len({r['channelId'] for r in rows})} channels (~{units} units)")


if __name__ == "__main__":
    main()
