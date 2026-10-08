# Globe probes — real imagery on a three.js globe, no key

**Not a reel.** No backlog id, no reel number, no log entries. It is the smoke test for one question:
can `@remotion/three` fly a camera from orbit down to the English Channel over real satellite imagery,
with real borders, with no API key — and where does the imagery stop being sharp.

Composition id `globe-probe` (6 s, 1080x1920). Source: `remotion/src/reels/GlobeProbe.tsx`.

## Sources

| What | Source | Licence |
|:--|:--|:--|
| Globe texture, patch | NASA Blue Marble Next Generation w/ Topography and Bathymetry, December 2004 | NASA imagery, public domain; credit NASA Earth Observatory |
| Borders | Natural Earth 1:10m `admin_0_map_units` (England is its own unit; `admin_0_countries` has the UK as one polygon) | public domain |

## Fetch (nothing here is tracked)

```bash
mkdir -p scripts/globe_probe/data && cd scripts/globe_probe/data
curl -sfLO https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg    # 2.6 MB
curl -sfLO https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x21600x10800.jpg  # 29.9 MB
curl -sfLO https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_map_units.geojson  # 13.5 MB
cd ../../.. && python3 scripts/globe_probe/prep.py
```

`prep.py` writes `remotion/public/globe_probe/*.jpg` (untracked) and `remotion/src/reels/data/globeprobe.ts`
(generated). The 21600x10800 image is never loaded by the browser — it is cropped to a 3600x2220 patch (lon -40..20, lat 25..62).

## Render

```bash
cd remotion
npx remotion render globe-probe ../scripts/globe_probe/globe_probe.mp4 --codec=h264
npx remotion still globe-probe /tmp/x.png --frame=179
```

## What it found

See the "Findings" block at the top of `GlobeProbe.tsx` — it is kept next to the code it describes.

## India edition (`globe-india`, 50 s)

Globe → India → Delhi → Uttar Pradesh → Karnataka → Mumbai → Indore → Madhya Pradesh. Each border draws itself, fills,
and fades as the next place arrives, under a fact card. Source: `remotion/src/reels/GlobeIndia.tsx`, on the shared
engine `remotion/src/reels/lib/globe.tsx`. Not a reel: no backlog id, no reel number.

### Where every dataset lives

| What | Source | Licence | Raw file (untracked) | Derived (untracked) |
|:--|:--|:--|:--|:--|
| Whole-Earth imagery | NASA Blue Marble NG, Dec 2004, 5400x2700 | public domain | `data/world.topo.bathy.200412.3x5400x2700.jpg` | `remotion/public/globe_probe/globe_5400.jpg` |
| State-scale imagery (60 px/deg) | the same, 21600x10800 | public domain | `data/world.topo.bathy.200412.3x21600x10800.jpg` | `.../india_patch.jpg`, `.../europe_patch.jpg` |
| Mid-zoom imagery (150 px/deg) | NASA GIBS, MODIS Terra true colour, 2025-03-05, lon 68..84 / lat 8..32 | NASA, public domain | `data/gibs/mid_2025-03-05.jpg` | `.../mid.jpg` (cropped to lat 19.5+) |
| City imagery (455 px/deg) | NASA GIBS, same layer and day, three 3x3 degree windows | NASA, public domain | `data/gibs/{delhi,mumbai,indore}_2025-03-05.jpg` | `.../city_*.jpg` |
| World + India outlines | Natural Earth 1:10m `admin_0_countries_ind` (**India's point of view** — checked: Gilgit, Muzaffarabad, Aksai Chin, Leh, Srinagar, Tawang all inside India's polygon) | public domain | `data/ne_10m_admin_0_countries_ind.geojson` | `remotion/src/reels/data/globeindia.ts` |
| States (Delhi, UP, Karnataka, MP + faint context) | Natural Earth 1:10m `admin_1_states_provinces` (de facto; J&K and Ladakh are not drawn) | public domain | `data/ne_10m_admin_1_states_provinces.geojson` | same |
| Mumbai, Indore borders | OpenStreetMap relations 7964375 + 7964376 (merged), 1976160 | **ODbL** — "© OpenStreetMap contributors" on screen | `data/osm/cities_geom.json` | same |
| Europe borders | Natural Earth 1:10m `admin_0_map_units` | public domain | `data/ne_10m_admin_0_map_units.geojson` | `remotion/src/reels/data/globeprobe.ts` |

Everything under `scripts/globe_probe/data/` and `remotion/public/globe_probe/` is untracked and regenerable. The two
generated TS modules in `remotion/src/reels/data/` are tracked.

### Fetch

```bash
cd scripts/globe_probe/data
curl -sfLO https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson    # 40.7 MB
curl -sfLO https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries_ind.geojson      # 13.2 MB
mkdir -p gibs && cd gibs
L=MODIS_Terra_CorrectedReflectance_TrueColor; D=2025-03-05
g() { curl -sfL -A "depth-first-probe/1.0" -o "$1" "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=$L&STYLES=&FORMAT=image/jpeg&SRS=EPSG:4326&BBOX=$2&WIDTH=$3&HEIGHT=$4&TIME=$D"; }
g delhi_$D.jpg  75.7,27.1,78.7,30.1 1366 1366
g mumbai_$D.jpg 71.4,17.6,74.4,20.6 1366 1366
g indore_$D.jpg 74.4,21.2,77.4,24.2 1366 1366
g mid_$D.jpg    68,8,84,32          2400 3600
# OSM: POST the Overpass query  [out:json][timeout:90];(relation(id:7964376,7964375,1976160,16636427,16636428););out geom;
# to https://overpass-api.de/api/interpreter with a descriptive User-Agent (the default one gets HTTP 406), save as ../osm/cities_geom.json
cd ../../../.. && python3 scripts/globe_probe/prep_india.py
```

### What detail "like the Europe one" takes, per region

1. **Imagery.** A crop from the 21600 image is enough for state-sized shots (x2-3 stretch). City-sized shots need a
   sharper source; this probe uses NASA GIBS MODIS at 250 m, which is what a no-key, public-domain source can give.
   Between the two sits a frame 150-800 km wide that nothing covers — add a mid tier (done here at 150 px/deg).
2. **Borders.** Natural Earth for countries and states; OpenStreetMap for anything finer (cities, districts).
3. **Shots as data.** `SHOT` and `AT` in `GlobeIndia.tsx`: where the camera lands, how wide the frame is, when.
4. **Points of view.** Natural Earth's default borders are de facto. The India point-of-view set is used here.
