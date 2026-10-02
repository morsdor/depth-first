# r017 data — fetched, not committed

None of the files here are tracked. The plate model's repository carries no licence file, the DEM
is large, and every one of these files can be fetched again in seconds:

```bash
cd projects/r017_everest/data
curl -sO https://raw.githubusercontent.com/GPlates/pygplates-tutorials/master/data/Seton_etal_ESR2012_2012.1.rot
# plate lookup ONLY — never drawn:
curl -sO https://raw.githubusercontent.com/GPlates/pygplates-tutorials/master/data/Seton_etal_ESR2012_StaticPolygons_2012.1.gpmlz
curl -sO https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson
```

The Everest DEM (`everest_z12.npy`) is a 3×3 block of AWS Terrain Tiles (terrarium) at z12 around
the summit; `terrain.py` fetches it on first run.
