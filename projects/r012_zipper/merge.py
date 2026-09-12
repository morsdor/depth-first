"""
I72 — the zipper merge.  Stage 3 measurement, run BEFORE any script is approved.

Two lanes drop to one at a cone. Every driver has sat in this and been furious at the
person who drove to the front and merged last. Traffic engineering says that person is
right. This file is the test, and it is allowed to say no.

  THE ONLY DIFFERENCE BETWEEN THE TWO RUNS IS WHERE THE MERGE HAPPENS.
  Same demand, same arrival times, same model, same seed, same road, same bottleneck.
      EARLY   everyone merges at the first opportunity -> ONE file of cars, second lane
              empty behind them.  The polite move, and what the sign asks for.
      ZIPPER  both lanes used in full to the taper, interleaving at the cone.

EARLY is modelled as its LIMITING CASE — nobody uses the closing lane at all. That is
deliberate and it is stated here rather than buried: it is what "merge as soon as you
see the sign" means once a queue exists, because the back of the queue is then the
merge point and it keeps moving upstream. It is also what drivers who block the closing
lane are trying to enforce. A partial version would sit between the two runs.

Longitudinal motion is the Optimal Velocity model (Bando et al., Phys Rev E 51, 1035,
1995) — the same model r010 was built on and validated against the Sugiyama ring
experiment.

  CALIBRATED, against road facts and never against the result
    v_free 70 mph approach · v_zone 45 mph posted in the zone · s_jam 7.0 m
    h_c, w  OVM shape.  CAPACITY IS NOT SET — it emerges and is reported.

  NOT CALIBRATED, AND THEREFORE WHAT THE REEL MAY CLAIM
    1. queue length under each policy
    2. throughput past the cone under each policy   <- expected EQUAL; that is the point
    3. mean delay per car
    4. how soon the queue reaches the junction upstream
"""
import numpy as np

MPH = 0.44704

# ── road ────────────────────────────────────────────────────────────────────
# The road must be long enough that NEITHER policy's queue is ever clipped by the end of
# the domain. On a 2 km road the over-capacity runs both filled it, and the policy that
# jammed worse then looked BETTER because it had refused more cars at the entry — a
# measurement artefact, not a result.
L_ROAD    = 6000.0     # m modelled
X_CONE    = 5400.0     # the taper. One lane downstream of it.
X_SIGN    = 4400.0     # "LANE CLOSED AHEAD" — 1 km up. Where a polite driver merges.
MERGE_LEN = 60.0       # length of the interleave zone
ANTICIPATE = 25.0      # how far back a driver reads the merged stream
ENTRY_GAP  = 45.0      # m of clear road required before a car may be released at x=0
MERGE_GAP  = 15.0      # m of hole in the single lane a car needs before it may take it
COURTESY   = 1.5       # s a car waits at the line before the stream is obliged to yield

# ── drivers ─────────────────────────────────────────────────────────────────
V_FREE, V_ZONE, S_JAM = 70 * MPH, 45 * MPH, 7.0
H_C, W_OVM, A_SENS = 26.0, 18.0, 0.9
DT = 0.05

_T0 = np.tanh(H_C / W_OVM)
_NORM = 1.0 + _T0


def V(h, v_des):
    """Optimal speed for headway h: zero at the jam spacing, v_des as h -> infinity."""
    out = v_des * (np.tanh((h - H_C) / W_OVM) + _T0) / _NORM
    return np.where(h <= S_JAM, 0.0, np.maximum(out, 0.0))


def capacity(v_des):
    """Veh/h/lane at the flow maximum. EMERGENT from the model, never assigned."""
    h = np.linspace(S_JAM + 1e-6, 400.0, 400_000)
    q = V(h, v_des) / h * 3600.0
    i = int(np.argmax(q))
    return q[i], h[i], V(h[i], v_des)


def _nearest_ahead(x, sorted_pos):
    """Vectorised: distance from each x to the next entry of sorted_pos strictly ahead."""
    if not len(sorted_pos):
        return np.full(len(x), 1e4)
    k = np.searchsorted(sorted_pos, x, side='right')
    ahead = np.where(k < len(sorted_pos), sorted_pos[np.minimum(k, len(sorted_pos) - 1)], np.inf)
    return np.where(k < len(sorted_pos), ahead - x, 1e4)


SLOW = 0.5 * V_ZONE          # below this a car counts as queueing
LINK = 70.0                  # max spacing that still counts as the SAME queue


def queue_tail(x, v):
    """How far back from the CONE the congestion reaches, in metres.

    Anchored on the cone, not on the front of the queue. Under early merging the jam
    builds back from the SIGN, a kilometre upstream of the taper, so a measure that
    demanded a slow car within 70 m of the cone reported a queue of zero while 152 cars
    sat stationary — the tell.

    Clustered, not min(): one stray slow vehicle upstream must not make this the whole
    road (r010's trap), so the slow cars are split wherever they are more than LINK
    apart and the most downstream cluster is the queue.
    """
    q = np.sort(x[(v < SLOW) & (x <= X_CONE + 1.0)])
    if not len(q):
        return 0.0
    brk = np.where(np.diff(q) > LINK)[0]
    start = brk[-1] + 1 if len(brk) else 0
    return float(X_CONE - q[start])


def enforce_spacing(x, v, sel, dt, x_old):
    """No car may end a step closer than S_JAM to the one ahead of it.

    NO FLOOR AT THE OLD POSITION. An earlier cut clamped the result to x_old so that no
    car could reverse, and that quietly defeated the whole constraint: once a
    configuration was already illegal the clamp preserved the illegality instead of
    resolving it, and the violations compounded. A single-lane jam then reported 3.6 m
    per car at a 7.0 m jam spacing — physically impossible, and the tell.

    The floor is not needed if the recursion is applied to the PROPOSED positions and
    the configuration was legal to begin with: x[k] <= x[k+1] - S_JAM and
    x_new[k+1] >= x[k+1] together give x_new[k] >= x[k], so nothing reverses on its own.
    Legality at entry is guaranteed by ENTRY_GAP and at the merge by the gate, and
    `check_invariants` asserts it rather than trusting it.

    THE OVM ALONE DOES NOT GUARANTEE THIS. V(0.01) = 0 sets the TARGET speed to zero,
    but speed relaxes toward the target with a 1.1 s time constant, so a car closing on
    a stopped leader keeps moving and passes straight through it. That is what let the
    first run report 1,950 veh/h through a bottleneck whose own emergent capacity is
    1,487 — cars were tunnelling, so no queue ever formed and the polite policy looked
    better than physics allows. A throughput above capacity is the tell.

    Vectorised: with z[k] = x[k] - k * S_JAM the whole constraint is "z is
    non-decreasing", so one reverse cumulative minimum enforces it for the entire
    platoon at once, front to back, with no Python loop.
    """
    i = np.where(sel)[0]
    if len(i) < 2:
        return x, v
    o = i[np.argsort(x[i])]
    xs = x[o]
    z = xs - np.arange(len(o)) * S_JAM
    z = np.minimum.accumulate(z[::-1])[::-1]
    xs_new = z + np.arange(len(o)) * S_JAM
    hit = xs_new < xs - 1e-12
    if hit.any():
        v[o[hit]] = np.maximum(v[o[hit]] - (xs[hit] - xs_new[hit]) / dt, 0.0)
        x[o] = xs_new
    return x, v


def check_invariants(x, v, lane, merged):
    """The physical facts this model is not allowed to violate. Cheap, so always on."""
    assert (x >= -1e-6).all(), f'a car reversed past the entry: min x = {x.min():.3f}'
    assert (v >= -1e-9).all(), 'negative speed'
    for sel, what in ((merged, 'merged stream'),
                      ((lane == 0) & ~merged, 'lane 0'), ((lane == 1) & ~merged, 'lane 1')):
        xs = np.sort(x[sel])
        if len(xs) > 1:
            d = np.diff(xs).min()
            assert d >= S_JAM - 1e-6, f'{what}: two cars {d:.3f} m apart, jam spacing is {S_JAM}'


def simulate(demand_vph, x_merge, t_end=2400.0, seed=11, log_from=None, log_to=None,
             cheat_frac=0.0):
    """demand_vph = total demand arriving at the junction, veh/h, both lanes together.

    x_merge IS THE POLICY, and it is the only thing that differs between the two runs:
    the point at which the closing lane must be gone. X_SIGN is the polite early merge,
    X_CONE is the zipper. Everything else — demand, arrival times, seed, the model, the
    merge gate and its friction — is identical.

    An earlier cut modelled early merging as "all traffic is in one lane before the road
    even starts", which handed that policy a FREE merge in open road while the zipper
    paid gate friction at a saturated taper. It duly reported the zipper 3.3% worse on
    throughput. Both policies must merge the same cars through the same gate; only the
    location may differ, or the comparison is rigged.

    cheat_frac > 0 sends that fraction of drivers past the merge point to the cone
    regardless — the case the ARGUMENT is actually about.

    Demand is CONSERVED: an arrival that cannot be released because the entry is
    occupied waits in a backlog and its delay is counted from when it WANTED to enter.
    Without that, the policy that jams worse silently drops traffic and looks better.
    """
    rng = np.random.default_rng(seed)
    zone0 = x_merge - MERGE_LEN

    x = np.zeros(0); v = np.zeros(0)
    lane = np.zeros(0, dtype=int); merged = np.zeros(0, dtype=bool); want_t = np.zeros(0)
    cheat = np.zeros(0, dtype=bool)
    waited = np.zeros(0)               # s spent waiting at the merge line, unmerged

    gap_in = 3600.0 / demand_vph
    t_next = rng.exponential(gap_in)
    backlog: list[float] = []          # times at which cars wanted to enter
    arrive_lane = 0
    serve_lane = 0                     # which lane the merge gate offers the next hole to

    done_t, done_want, done_cheat = [], [], []
    keep = int(0.2 / DT)
    t_series, q_series, thru_series, n_series = [], [], [], []
    frames_t, frames_x, frames_lane, frames_v = [], [], [], []

    for s in range(int(t_end / DT)):
        t = s * DT

        while t >= t_next:
            backlog.append(t)
            t_next += rng.exponential(gap_in)

        # Release from the backlog into whichever lane the policy uses, IF there is room.
        # A car is released at the speed its gap actually allows, never at V_FREE: the
        # first cut injected cars at 70 mph 33 m behind a stopped queue, which produced a
        # permanently stuck car at x~0 and then reported the queue as the whole road.
        while backlog:
            in_lane = arrive_lane
            # NOT `ahead[ahead > 0]`. Filtering out a car sitting at exactly x = 0 let
            # the next arrival be released on top of it, which is an illegal
            # configuration at birth — and the spacing recursion then resolved it by
            # pushing the platoon backwards to x = -5.6 m. check_invariants caught it.
            ahead = x[lane == in_lane] if len(x) else np.zeros(0)
            gap0 = ahead.min() if len(ahead) else 1e4
            if gap0 < ENTRY_GAP:
                break
            x = np.append(x, 0.0)
            v = np.append(v, min(V_FREE, float(V(np.array([gap0]), V_FREE)[0])))
            # `merged` means "is in the single-lane stream", NOT "is in lane 0".
            # Setting it for every lane-0 arrival was written for the early policy, where
            # there is only one lane in use, and it silently broke the zipper: every car
            # in the closing lane then yielded to the nearest lane-0 car ahead of it, so
            # the two lanes behaved as one file and stored cars at exactly the same
            # density. Two policies reporting the same metres-per-car is the tell.
            lane = np.append(lane, in_lane)
            merged = np.append(merged, False)
            # a driver who refuses to merge early and runs the closing lane to the cone
            cheat = np.append(cheat, in_lane == 1 and rng.random() < cheat_frac)
            waited = np.append(waited, 0.0)
            want_t = np.append(want_t, backlog.pop(0))
            arrive_lane = 1 - arrive_lane
            break                          # at most one release per step, never a stack

        if not len(x):
            continue


        # ── leaders, vectorised.  You yield to the nearest car ahead that is either in
        #    the merged stream or in your own lane; the adjacent lane does not block you.
        # A car that has NOT merged is in the other lane, so the single-lane stream does
        # not block it — it drives up alongside and looks for a hole. Applying the merged
        # stream as its leader pinned every waiting car to one x, so there was never a
        # hole to merge INTO and the whole thing deadlocked.
        pos_m = np.sort(x[merged])
        gap = np.full(len(x), 1e4)
        gap[merged] = _nearest_ahead(x[merged], pos_m)
        for ln in (0, 1):
            m = (lane == ln) & ~merged
            if m.any():
                gap[m] = _nearest_ahead(x[m], np.sort(x[m]))
        # An unmerged car may not cross the merge line until the gate lets it in. Without
        # this the two lanes poured over the line in the same step and 83 cars ended up
        # stacked at one x, which the spacing clamp could not undo because a car may not
        # reverse. The queue then measured 60 m with 108 cars in it — the tell.
        # An unmerged car must be in the single lane by the cone, so the cone itself is
        # the obstacle. It may run the whole merge zone alongside to find its hole.
        pre = ~merged
        lim = np.where(cheat, X_CONE, x_merge)
        gap[pre] = np.minimum(gap[pre], np.maximum(lim[pre] - x[pre], 0.01))

        # ── ONE candidate at a time, and only that one is let in.
        #    THE GATE AND THE COURTESY MUST AGREE ON WHO IS NEXT. A first version let
        #    every waiting car oblige the stream behind it to yield, and the merged lane
        #    stopped dead: with the stream stopped no holes open, so more cars wait, so
        #    more of the stream yields. Total deadlock, and it presented as a 1,939 m
        #    queue with nothing at all leaving the road. Courtesy is a turn, not a right.
        gate_i = None
        near = ~merged & ((x >= zone0) | (cheat & (x >= X_CONE - MERGE_LEN)))
        if near.any():
            ni = np.where(near)[0]
            for want in (serve_lane, 1 - serve_lane):
                c = ni[lane[ni] == want]
                if len(c):
                    gate_i = int(c[np.argmax(x[c])])
                    break

        # the car behind the hole yields to the one whose turn it is, once it has waited
        if gate_i is not None and waited[gate_i] >= COURTESY and merged.any():
            mi = np.where(merged)[0]
            b = mi[x[mi] < x[gate_i] - (S_JAM + 2.0)]
            if len(b):
                # Yielding means easing off, never stopping dead. Clamping to a sub-jam
                # gap froze the stream and starved the very car it was yielding to.
                j = int(b[np.argmax(x[b])])
                gap[j] = min(gap[j], max(x[gate_i] - x[j], S_JAM + 1.0))

        gap = np.maximum(gap, 0.01)

        waited = np.where(near, waited + DT, 0.0)
        if gate_i is not None:
            pm = x[merged]
            ahead = pm[pm > x[gate_i]]
            behind = pm[pm <= x[gate_i]]
            ok_a = (not len(ahead)) or (ahead.min() - x[gate_i]) >= MERGE_GAP
            ok_b = (not len(behind)) or (x[gate_i] - behind.max()) >= S_JAM + 2.0
            if ok_a and ok_b:
                merged[gate_i] = True
                serve_lane = 1 - lane[gate_i]

        # The gate is resolved BEFORE the move and before any car leaves the road.
        # Running it afterwards indexed gate_i and `near` into arrays that the exit had
        # already shortened — a silent off-by-one that only surfaced as a broadcast error
        # once `waited` was added. Any index taken before the exit is invalid after it.


        v_des = np.where(x >= zone0, V_ZONE, V_FREE)
        v = np.maximum(v + A_SENS * (V(gap, v_des) - v) * DT, 0.0)
        x_old = x.copy()
        x = x + v * DT
        x, v = enforce_spacing(x, v, merged, DT, x_old)
        for ln in (0, 1):
            x, v = enforce_spacing(x, v, (lane == ln) & ~merged, DT, x_old)

        out = x > L_ROAD
        if out.any():
            done_t.extend([t] * int(out.sum()))
            done_want.extend(want_t[out].tolist())
            done_cheat.extend(cheat[out].tolist())
            k = ~out
            x, v, lane, merged, want_t, cheat, waited = (x[k], v[k], lane[k], merged[k],
                                                        want_t[k], cheat[k], waited[k])

        # ── THE MERGE GATE.  This is the zipper, and it is not scripted: a car may join
        #    the single lane only when there is a real hole for it, and the two lanes are
        #    offered the hole alternately. Taking turns is what EMERGES from that, rather
        #    than being imposed — which is the whole point of computing it.
        if s % keep == 0:
            check_invariants(x, v, lane, merged)
            t_series.append(t)
            q_series.append(queue_tail(x, v))
            qn = q_series[-1]
            n_series.append(int(((x >= X_CONE - qn) & (x <= X_CONE + 1.0)).sum()))
            thru_series.append(len(done_t))
            if log_from is not None and log_from <= t < log_to:
                frames_t.append(t); frames_x.append(x.copy())
                frames_lane.append(lane.copy()); frames_v.append(v.copy())

    done_t, done_want = np.array(done_t), np.array(done_want)
    done_cheat = np.array(done_cheat, dtype=bool)
    ts, qs = np.array(t_series), np.array(q_series)
    half = t_end * 0.5
    warm = done_t > half
    free_tt = L_ROAD / V_FREE
    reach = ts[qs >= X_CONE - 30.0]

    return {
        'x_merge': x_merge, 'demand': demand_vph,
        'throughput': float(warm.sum() / (t_end - half) * 3600.0),
        'queue_len': float(qs[ts > half].mean()),
        'queue_max': float(qs.max()),
        'delay': float(((done_t - done_want)[warm] - free_tt).mean()) if warm.any() else float('nan'),
        'backlog_end': len(backlog),
        'delay_cheat': (float(((done_t - done_want)[warm & done_cheat] - free_tt).mean())
                        if (warm & done_cheat).any() else float('nan')),
        'delay_compliant': (float(((done_t - done_want)[warm & ~done_cheat] - free_tt).mean())
                            if (warm & ~done_cheat).any() else float('nan')),
        'n_cheat': int((warm & done_cheat).sum()), 'n_compliant': int((warm & ~done_cheat).sum()),
        'reach_junction': float(reach[0]) if len(reach) else None,
        'series': (ts, qs, np.array(n_series)),
        'frames': (np.array(frames_t), frames_x, frames_lane, frames_v),
    }


def growth(demand_vph, t_marks=(300, 600, 900, 1200)):
    """Same oversaturated demand into both policies; queue length as it grows.

    This is the honest comparison. Throughput is set by the bottleneck and is the same
    either way, so over the same window both policies must store the SAME NUMBER of
    cars — and the only question is how much road that takes.
    """
    out = {}
    for pol, xm in (('early', X_SIGN), ('zipper', X_CONE)):
        r = simulate(demand_vph, xm, t_end=max(t_marks) + 60)
        ts, qs, ns = r['series']
        out[pol] = {'r': r, 'at': {m: (float(qs[np.argmin(abs(ts - m))]),
                                       int(ns[np.argmin(abs(ts - m))])) for m in t_marks}}
    return out


def _demo():
    q, h, vq = capacity(V_ZONE)
    qf, hf, vf = capacity(V_FREE)
    print(f'EMERGENT capacity   work zone {q:7.0f} veh/h/lane at {h:5.1f} m ({vq/MPH:4.1f} mph)'
          f'   |   open road {qf:7.0f} at {hf:5.1f} m ({vf/MPH:4.1f} mph)')
    print(f'free-flow {V(1e4, V_FREE)/MPH:.1f} mph · jam spacing {S_JAM:.1f} m · '
          f'road {L_ROAD:.0f} m · cone at {X_CONE:.0f} m\n')
    D = 1800
    g = growth(D)
    print(f'demand {D} veh/h into a bottleneck that passes '
          f"{g['early']['r']['throughput']:.0f} (early) / {g['zipper']['r']['throughput']:.0f} "
          f'(zipper) veh/h\n')
    print(f"{'minutes':>8} {'early m':>9} {'cars':>6} {'zipper m':>10} {'cars':>6} "
          f"{'shorter':>9} {'m per car':>20}")
    for m in sorted(g['early']['at']):
        qe, ne = g['early']['at'][m]
        qz, nz = g['zipper']['at'][m]
        cut = 100 * (1 - qz / qe) if qe else float('nan')
        per = f'{qe/max(ne,1):.1f} vs {qz/max(nz,1):.1f}'
        print(f"{m/60:>8.0f} {qe:>9.0f} {ne:>6} {qz:>10.0f} {nz:>6} {cut:>8.0f}% {per:>20}")
    print()
    for p in ('early', 'zipper'):
        r = g[p]['r']
        print(f"  {p:>6}  mean delay {r['delay']:>7.1f} s   unserved at end {r['backlog_end']:>4}")

    print('\n── the case the ARGUMENT is about: a minority jumps the queue ───────────')
    base = simulate(D, 'early', t_end=1260)
    print(f"  everyone merges early                      all {base['delay']:7.1f} s")
    for f in (0.05, 0.20):
        r = simulate(D, 'mixed', t_end=1260, cheat_frac=f)
        print(f"  {f:4.0%} use the closing lane   jumper {r['delay_cheat']:7.1f} s "
              f"(n={r['n_cheat']:3d})   complied {r['delay_compliant']:7.1f} s "
              f"(n={r['n_compliant']:3d})   queue {r['queue_len']:5.0f} m")


if __name__ == '__main__':
    _demo()
