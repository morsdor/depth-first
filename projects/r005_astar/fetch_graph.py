"""
r005 step 1 — pull a real street graph out of OpenStreetMap.

RUN THIS ON YOUR OWN MACHINE. The cloud container this repo is often edited from
cannot reach OSM at all: overpass-api.de, api.openstreetmap.org and
download.geofabrik.de are all refused by the egress proxy. Everything downstream
(search.py, emit_ts.py, the reel) runs fine there once graph.json exists.

Deliberately no osmnx / geopandas / networkx. The whole method of this repo is
that the reel plays back a real algorithm we ran ourselves, so pulling in a
library that implements the search would defeat the point -- and the dependency
tree is enormous for what is one Overpass query and a dictionary.

Usage:
    python3 fetch_graph.py --place "Fort, Mumbai" --bbox 18.920,72.828,18.945,72.845
    python3 fetch_graph.py --bbox <south,west,north,east> [--out graph.json]

Be considerate: Overpass is donated infrastructure. One query, cached to disk.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import urllib.parse
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
OVERPASS = 'https://overpass-api.de/api/interpreter'

# Drivable roads only. Excluding footways and service roads keeps the graph the
# size of the thing a routing app would actually search, which is the subject.
QUERY = '''
[out:json][timeout:120];
way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link)$"]
  ({s},{w},{n},{e});
(._;>;);
out body;
'''


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--bbox', required=True, help='south,west,north,east')
    ap.add_argument('--place', default='', help='free-text label, kept in the JSON')
    ap.add_argument('--out', default=str(HERE / 'graph.json'))
    args = ap.parse_args()

    s, w, n, e = (float(v) for v in args.bbox.split(','))
    q = QUERY.format(s=s, w=w, n=n, e=e)
    body = urllib.parse.urlencode({'data': q}).encode()
    print(f'querying Overpass for {args.place or args.bbox} …')
    with urllib.request.urlopen(OVERPASS, data=body, timeout=180) as r:
        raw = json.load(r)

    nodes = {
        el['id']: (el['lat'], el['lon']) for el in raw['elements'] if el['type'] == 'node'
    }
    ways = [
        {'nodes': el['nodes'], 'oneway': el.get('tags', {}).get('oneway') == 'yes',
         'highway': el.get('tags', {}).get('highway', '')}
        for el in raw['elements'] if el['type'] == 'way'
    ]

    out = {
        'place': args.place,
        'bbox': [s, w, n, e],
        'nodes': {str(k): v for k, v in nodes.items()},
        'ways': ways,
        'source': 'OpenStreetMap contributors, ODbL — https://www.openstreetmap.org/copyright',
    }
    pathlib.Path(args.out).write_text(json.dumps(out))
    print(f'{len(nodes):,} nodes, {len(ways):,} ways -> {args.out}')
    print('ATTRIBUTION: OSM data is ODbL. The reel must credit OpenStreetMap on screen.')


if __name__ == '__main__':
    main()
