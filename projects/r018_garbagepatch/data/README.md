# r018 data — fetched, not committed

```bash
cd projects/r018_garbagepatch/data
curl -sO https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson   # public domain
```

The NOAA drifter cache (~1.2 GB) is written by `../research/fetch_drifters.py` to `$I87_CACHE`
(default: the session scratchpad), never into the repo.
