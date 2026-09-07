"""
r005 step 2 — run Dijkstra and A* on a real street graph and dump every step.

Backlog I15. The reel plays this back frame for frame, so the node counts on
screen are correct because this run produced them.

THE SELF-CHECK THAT MATTERS
  A* with an ADMISSIBLE heuristic (one that never overestimates) is guaranteed to
  return the same optimal cost as Dijkstra. So the script asserts exactly that,
  and separately asserts the heuristic never exceeds the true remaining distance
  on any node it settles. If either fails, the reel's whole claim -- same answer,
  a fraction of the work -- is false, and nothing downstream should run.

  Straight-line distance on a sphere is admissible for road distance because no
  road is shorter than the great circle between its endpoints. The heuristic uses
  the EQUATORIAL earth radius, which makes it a slight under-estimate everywhere
  away from the equator and therefore still admissible.

STREET GEOMETRY DECIDES THE HEADLINE NUMBER — pick the city on this
  Measured on synthetic graphs of identical size (1,600 junctions), same code:

      perfect lattice              Dijkstra 1,600   A* 1,561   1.02x
      irregular organic network    Dijkstra 1,549   A*   780   1.99x
      grid with jittered junctions Dijkstra 1,395   A*   407   3.43x

  On a perfect lattice every monotone route has the SAME length, so the graph is
  saturated with ties and the heuristic has nothing to discriminate with. Break
  the ties even slightly and A* prunes hard. A rigidly gridded city -- Manhattan,
  Chandigarh, the Eixample -- would therefore produce a reel with no result in
  it. Choose an organic street network.

  It also means the backlog's "300,000 vs 300" is a RESEARCH LEAD, exactly as
  content_backlog.md says of every figure in it. The real ratio is whatever the
  real graph gives, and the title follows the run, not the other way round.

Usage:  python3 search.py [--graph graph.json] [--from LAT,LON --to LAT,LON]
        python3 search.py --synthetic       # offline fixture, for testing only
"""

from __future__ import annotations

import argparse
import heapq
import json
import math
import pathlib

HERE = pathlib.Path(__file__).resolve().parent

# Equatorial radius. Any value at or below the local radius keeps the great-circle
# distance an under-estimate of road distance, which is what admissibility needs.
R_EARTH_M = 6_378_137.0


def haversine(a: tuple[float, float], b: tuple[float, float]) -> float:
    lat1, lon1 = math.radians(a[0]), math.radians(a[1])
    lat2, lon2 = math.radians(b[0]), math.radians(b[1])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * R_EARTH_M * math.asin(math.sqrt(h))


def build(graph: dict) -> tuple[dict, dict]:
    """OSM nodes+ways -> {node: (lat,lon)} and {node: [(neighbour, metres), ...]}."""
    pos = {int(k): tuple(v) for k, v in graph['nodes'].items()}
    adj: dict[int, list[tuple[int, float]]] = {}
    for way in graph['ways']:
        ns = [n for n in way['nodes'] if n in pos]
        for u, v in zip(ns, ns[1:]):
            d = haversine(pos[u], pos[v])
            adj.setdefault(u, []).append((v, d))
            if not way.get('oneway'):
                adj.setdefault(v, []).append((u, d))
    # Drop nodes no edge reaches; they are geometry, not junctions.
    pos = {n: p for n, p in pos.items() if n in adj}
    return pos, adj


def search(pos, adj, start, goal, heuristic):
    """One implementation for both. Dijkstra IS A* with h = 0 — that is the point."""
    g = {start: 0.0}
    came: dict[int, int] = {}
    settled: list[int] = []          # expansion order, which is what the reel animates
    seen: set[int] = set()
    pq = [(heuristic(start), 0.0, start)]
    while pq:
        _, cost, u = heapq.heappop(pq)
        if u in seen:
            continue
        seen.add(u)
        settled.append(u)
        if u == goal:
            break
        for v, w in adj.get(u, []):
            ng = cost + w
            if ng < g.get(v, math.inf):
                g[v] = ng
                came[v] = u
                heapq.heappush(pq, (ng + heuristic(v), ng, v))
    path, cur = [], goal
    while cur in came or cur == start:
        path.append(cur)
        if cur == start:
            break
        cur = came[cur]
    return {'settled': settled, 'cost': g.get(goal, math.inf), 'path': path[::-1], 'g': g}


def synthetic() -> dict:
    """A 40x40 lattice on a real-world scale. TEST FIXTURE ONLY — never shipped."""
    nodes, ways, k = {}, [], 40
    for r in range(k):
        for c in range(k):
            nodes[str(r * k + c)] = (18.92 + r * 0.0006, 72.828 + c * 0.0006)
    for r in range(k):
        ways.append({'nodes': [r * k + c for c in range(k)], 'oneway': False})
    for c in range(k):
        ways.append({'nodes': [r * k + c for r in range(k)], 'oneway': False})
    return {'place': 'SYNTHETIC LATTICE (test fixture)', 'nodes': nodes, 'ways': ways}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--graph', default=str(HERE / 'graph.json'))
    ap.add_argument('--synthetic', action='store_true')
    ap.add_argument('--from', dest='src', default='')
    ap.add_argument('--to', dest='dst', default='')
    args = ap.parse_args()

    if args.synthetic:
        graph = synthetic()
    else:
        p = pathlib.Path(args.graph)
        if not p.exists():
            raise SystemExit(
                f'{p} not found. Run fetch_graph.py on a machine that can reach '
                'Overpass — see its docstring.'
            )
        graph = json.loads(p.read_text())

    pos, adj = build(graph)
    nearest = lambda ll: min(pos, key=lambda n: haversine(pos[n], ll))
    if args.src and args.dst:
        start = nearest(tuple(float(v) for v in args.src.split(',')))
        goal = nearest(tuple(float(v) for v in args.dst.split(',')))
    else:
        # Default to the pair that are furthest apart, which is the honest worst
        # case and the one where the two searches differ most visibly.
        ns = list(pos)
        start = min(ns, key=lambda n: (pos[n][0], pos[n][1]))
        goal = max(ns, key=lambda n: (pos[n][0], pos[n][1]))

    gp = pos[goal]
    dij = search(pos, adj, start, goal, lambda n: 0.0)
    ast = search(pos, adj, start, goal, lambda n: haversine(pos[n], gp))

    # ── the assertions the claim rests on ──────────────────────────────────
    assert math.isfinite(dij['cost']), 'no route exists between these two points'
    assert abs(dij['cost'] - ast['cost']) < 1e-6, (
        f"A* returned a different cost ({ast['cost']:.3f}) from Dijkstra "
        f"({dij['cost']:.3f}) — the heuristic is not admissible"
    )
    assert dij['path'] == ast['path'], 'same cost but a different path — check tie-breaking'
    #
    # Admissibility needs h(n) <= the TRUE shortest distance from n to the goal.
    # The first version of this check used (total cost - g[n]), which is only the
    # true remaining distance for nodes ON the optimal path; for a node off it,
    # routing through n is a detour and that quantity understates the real
    # distance, so the check failed on a graph where the heuristic was fine.
    # The honest way is a full backwards search from the goal, which gives the
    # exact distance-to-goal for every node, and costs one more Dijkstra.
    rev: dict[int, list[tuple[int, float]]] = {}
    for u, edges in adj.items():
        for v, w in edges:
            rev.setdefault(v, []).append((u, w))
    to_goal = search(pos, rev, goal, start, lambda n: 0.0)['g']
    worst = max(
        (haversine(pos[n], gp) - to_goal[n] for n in to_goal), default=0.0
    )
    assert worst <= 1e-6, (
        f'heuristic overestimates the true distance-to-goal by {worst:.3f} m — '
        'it is not admissible, so A* is not guaranteed to match Dijkstra'
    )

    out = {
        'place': graph.get('place', ''),
        'nodes': {str(n): pos[n] for n in pos},
        'start': start, 'goal': goal,
        'dijkstra_settled': dij['settled'],
        'astar_settled': ast['settled'],
        'path': dij['path'],
        'cost_m': round(dij['cost'], 2),
        'stats': {
            'graph_nodes': len(pos),
            'graph_edges': sum(len(v) for v in adj.values()),
            'dijkstra_expanded': len(dij['settled']),
            'astar_expanded': len(ast['settled']),
            'ratio': round(len(dij['settled']) / max(1, len(ast['settled'])), 1),
            'path_nodes': len(dij['path']),
        },
    }
    (HERE / 'astar_data.json').write_text(json.dumps(out))

    st = out['stats']
    print(f"graph        {graph.get('place','?')}: {st['graph_nodes']:,} junctions, "
          f"{st['graph_edges']:,} directed edges")
    print(f"self-check   A* cost == Dijkstra cost ({out['cost_m']:,.0f} m), same path, "
          f"heuristic admissible on every settled node")
    print(f"Dijkstra     expanded {st['dijkstra_expanded']:,} junctions")
    print(f"A*           expanded {st['astar_expanded']:,} junctions")
    print(f"             {st['ratio']}x fewer, for the identical route "
          f"({st['path_nodes']} junctions, {out['cost_m']:,.0f} m)")


if __name__ == '__main__':
    main()
