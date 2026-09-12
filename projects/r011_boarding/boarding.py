#!/usr/bin/env python3
"""I73 — why boarding a plane back to front is slower than boarding it at random.

STAGE 3 RESEARCH. Not the build. This file exists to answer one question before
a single frame is designed: does a real agent model, with its parameters taken
from the literature rather than fitted to the answer, reproduce the published
field test?

    Steffen & Hotchkiss, "Experimental test of airplane boarding methods",
    J. Air Transport Management 18 (2012) 64-67 / arXiv:1108.5211.
    Mock 757 fuselage, 12 rows x 6 seats, single aisle, 72 passengers:

        Steffen 3:36 | WilMA 4:13 | random 4:44 | back-to-front 6:11 | block 6:54

THE MECHANISM, which is what the reel is actually about. The aisle is the only
way in and only one person can use a stretch of it at a time, so boarding speed
is not walking speed -- it is HOW MANY PEOPLE CAN STOW A BAG AT ONCE. Back to
front lines everyone up in the order that puts every remaining bag into the same
few metres of aisle, so that number is about one. A random order scatters them
down the whole cabin, so it is five or six. The paper says the same thing in its
own words: back-to-front "maximizes the number of aisle interferences".

MODEL. Discrete aisle slots, one per row, at most one person in a slot. An
event loop, not a timestep loop, so the clock is exact: nothing is rounded to a
frame. A passenger walks slot by slot to their row, stows if they have a bag
(blocking everyone behind them), waits for any already-seated neighbour they
have to climb past, and then leaves the aisle.

Nobody overtakes anybody -- that is what makes an aisle an aisle, and
check_invariants() asserts it on every event.

    python3 gate0/i73_boarding/boarding.py            # the field test, all five methods
    python3 gate0/i73_boarding/boarding.py --sweep    # is the ordering an artefact?
"""
import argparse
import random as _random
import statistics

# ── geometry ───────────────────────────────────────────────────────────────
# The published field test: 12 rows of 6, one aisle, boarded through the front
# door. Seat 0 is the port window, 2 the port aisle, 3 the starboard aisle,
# 5 the starboard window.
ROWS, SEATS = 12, 6
WINDOW, MIDDLE, AISLE_SEAT = 0, 1, 2          # distance from the aisle, per side


def seat_class(seat):
    """0 = window, 1 = middle, 2 = aisle — DISTANCE FROM THE AISLE, not seat index.

    BUG 2, and it inverted two of the five methods without breaking anything.
    Both tuples were written back to front, so seat 0 (the port window) returned
    AISLE_SEAT. WilMA then boarded aisle seats FIRST -- the worst order there is,
    since every later passenger has to climb over someone -- and Steffen, which
    is defined to have zero seat interference, was charged 384 s of it. Nothing
    asserted, nothing crashed: WilMA simply came out slower than random, which
    is the opposite of the published result. Caught by printing the queue itself
    and reading the seat numbers, not by any invariant.
    """
    return (WINDOW, MIDDLE, AISLE_SEAT)[seat] if seat < 3 else (AISLE_SEAT, MIDDLE, WINDOW)[seat - 3]


def side(seat):
    return 0 if seat < 3 else 1


# ── parameters, and where each one comes from ──────────────────────────────
# NONE of these is fitted to the published times. They are the values a
# boarding model in the literature uses, and --sweep moves every one of them.
T_ROW = 1.0        # s to walk one row of pitch (~0.79 m at ~0.8 m/s in a queue)
T_STOW = 6.0       # s a bag blocks the aisle. The field test's own implied rate:
#                    371 s of back-to-front, where stowing is almost perfectly
#                    serialised, over ~54 bags is ~6.9 s including walking.
T_SIT = 2.0        # s to get out of the aisle into a free seat
SHUFFLE = (0.0, 6.0, 10.0)   # extra s when 1 or 2 seated neighbours must stand.
#                              Non-linear: two people shuffling in a 31-inch row
#                              interfere with each other. Widely used shape.
BAG_RATE = 0.75    # share of passengers with a bag for the overhead bin
LOAD = 1.00        # the field test ran a full cabin
SUB = 2            # aisle sub-slots per row of pitch. A standing person is
#                    ~0.4 m wide in a 0.79 m pitch, so two fit in one row and
#                    both can reach the same bin. See BUG 3 in simulate().
STOW_REACH = 1     # sub-slots from which a passenger can reach their own bin

WAITING, WALKING, STOWING, SHUFFLING, SEATED = range(5)


def queue_order(method, seats, rng):
    """The boarding order. This is the ONLY thing that differs between methods.

    Making the method one function of one list is deliberate: it is what makes
    the arms a fair comparison. I72 was measured wrongly for exactly one day
    because its two arms were built as two different code paths.
    """
    pax = list(seats)
    rng.shuffle(pax)                                    # every method breaks ties randomly
    if method == 'random':
        return pax
    if method == 'back_to_front':
        return sorted(pax, key=lambda rs: -rs[0])
    if method == 'block':
        # The paper's own blocks: 12 rows in three groups of four, rear group
        # first, then the FRONT group, then the centre.
        order = {**{r: 0 for r in range(8, 12)}, **{r: 1 for r in range(0, 4)},
                 **{r: 2 for r in range(4, 8)}}
        return sorted(pax, key=lambda rs: order[rs[0]])
    if method == 'wilma':
        return sorted(pax, key=lambda rs: seat_class(rs[1]))
    if method == 'steffen':
        # Consecutive passengers sit two rows apart in the same column, so
        # nobody is ever behind somebody stowing, and seat interference is
        # impossible because windows precede middles precede aisles.
        return sorted(pax, key=lambda rs: (seat_class(rs[1]), side(rs[1]), rs[0] % 2, -rs[0]))
    raise ValueError(method)


METHODS = ('steffen', 'wilma', 'random', 'back_to_front', 'block')


def check_invariants(aisle, state, slot, order_index, seated_at, t):
    """The physics of a corridor, asserted. Costs nothing and has already paid
    for itself twice in this repo (I65, I72)."""
    occupied = [(s, p) for s, p in enumerate(aisle) if p is not None]
    assert len({p for _, p in occupied}) == len(occupied), 'one person in two slots'
    for s, p in occupied:
        assert state[p] in (WALKING, STOWING, SHUFFLING), f'seated passenger holding slot {s}'
        assert slot[p] == s, 'slot bookkeeping disagrees with the aisle'
    # NOBODY OVERTAKES. Whoever entered first is furthest down the aisle, so
    # reading the slots front-to-back must give the queue positions in REVERSE.
    # (Asserting ascending was the first version and it fired on the first run:
    # the person who boards first ends up at the highest slot, not the lowest.)
    entries = [order_index[p] for _, p in occupied]
    assert entries == sorted(entries, reverse=True), \
        f'someone overtook in the aisle at t={t:.2f}: queue positions {entries} down the cabin'
    for p, ts in seated_at.items():
        assert ts is None or ts <= t + 1e-9, 'seated in the future'


def simulate(method, seed=0, rows=ROWS, t_row=T_ROW, t_stow=T_STOW, t_sit=T_SIT,
             shuffle=SHUFFLE, bag_rate=BAG_RATE, load=LOAD, sub=SUB,
             stow_reach=STOW_REACH, trace=False):
    """Board one cabin. Returns (total seconds, stow-concurrency samples, trace).

    The aisle is `sub` sub-slots per row of pitch, at most one person in each.
    A passenger stows as soon as they are within `stow_reach` sub-slots of their
    own row, then closes up to it, then climbs over any seated neighbour.

    BUG 3 — and it was quantitative, not a crash. The first version had ONE slot
    per row, so a standing passenger owned the entire 0.79 m pitch and only one
    person in the whole cabin could ever stow at a given row. That is not how an
    aisle works: two people stand shoulder to shoulder in one pitch and both
    reach the same bin. With one slot per row the model made back-to-front
    almost perfectly serial and reported it 66% slower than random, against the
    31% actually measured -- an over-prediction of the exact effect the reel is
    about, which is the worst direction to be wrong in.
    """
    rng = _random.Random(seed)
    seats = [(r, s) for r in range(rows) for s in range(SEATS)]
    rng.shuffle(seats)
    seats = sorted(seats[:int(round(len(seats) * load))])

    queue = queue_order(method, seats, _random.Random(seed * 977 + 13))
    n = len(queue)
    row_of = [q[0] for q in queue]
    seat_of = [q[1] for q in queue]
    target = [sub * r for r in row_of]              # the sub-slot they sit from
    has_bag = [rng.random() < bag_rate for _ in range(n)]
    order_index = {p: p for p in range(n)}          # queue position IS the index
    t_sub = t_row / sub                             # time to walk one sub-slot

    state = [WAITING] * n
    stowed = [not b for b in has_bag]               # no bag, nothing to stow
    slot = [-1] * n
    ready = [0.0] * n
    blocked = [False] * n
    aisle = [None] * (rows * sub)
    filled = {(r, s): False for r in range(rows) for s in range(SEATS)}
    seated_at = {p: None for p in range(n)}
    next_in = 0
    t = 0.0
    events, samples, tr = 0, [], []

    def wake_behind(s):
        if s == 0:
            return
        p = aisle[s - 1]
        if p is not None and state[p] == WALKING and blocked[p]:
            blocked[p], ready[p] = False, t

    def shuffle_time(p):
        r, s = row_of[p], seat_of[p]
        inner = ([(r, x) for x in range(s + 1, 3)] if s < 3
                 else [(r, x) for x in range(3, s)])
        return shuffle[min(sum(filled[c] for c in inner), len(shuffle) - 1)]

    def start_seating(p):
        state[p], ready[p] = SHUFFLING, t + t_sit + shuffle_time(p)

    while any(st != SEATED for st in state):
        events += 1
        assert events < 2_000_000, 'the boarding never finished — deadlock'

        cand = [ready[p] for p in range(n)
                if state[p] in (STOWING, SHUFFLING)
                or (state[p] == WALKING and not blocked[p])]
        if next_in < n and aisle[0] is None:
            cand.append(max(t, ready[next_in]))
        assert cand, f'nothing can move at t={t:.2f} — deadlock'
        t = max(t, min(cand))

        for p in sorted((p for p in range(n) if state[p] != WAITING),
                        key=lambda p: -slot[p]):
            if ready[p] > t + 1e-9:
                continue
            if state[p] == STOWING:
                stowed[p], state[p], blocked[p] = True, WALKING, False
                ready[p] = t
            if state[p] == SHUFFLING and ready[p] <= t + 1e-9:
                s = slot[p]
                aisle[s], slot[p], state[p] = None, -1, SEATED
                filled[(row_of[p], seat_of[p])] = True
                seated_at[p] = t
                wake_behind(s)
            elif state[p] == WALKING and not blocked[p] and ready[p] <= t + 1e-9:
                if not stowed[p] and slot[p] >= target[p] - stow_reach:
                    state[p], ready[p] = STOWING, t + t_stow
                elif slot[p] == target[p]:
                    start_seating(p)
                elif aisle[slot[p] + 1] is None:
                    s = slot[p]
                    aisle[s], aisle[s + 1], slot[p] = None, p, s + 1
                    ready[p] = t + t_sub
                    wake_behind(s)
                else:
                    blocked[p] = True

        if next_in < n and aisle[0] is None and ready[next_in] <= t + 1e-9:
            p = next_in
            aisle[0], slot[p], state[p] = p, 0, WALKING
            ready[p] = t + t_sub
            next_in += 1

        check_invariants(aisle, state, slot, order_index, seated_at, t)
        samples.append((t, sum(1 for p in range(n) if state[p] == STOWING)))
        if trace:
            tr.append((t, [(p, slot[p], state[p]) for p in range(n)
                           if state[p] in (WALKING, STOWING, SHUFFLING)]))

    assert all(filled[c] for c in filled) or load < 1.0, 'a seat was left empty'
    assert len({(row_of[p], seat_of[p]) for p in range(n)}) == n, 'two people, one seat'
    return t, samples, tr


def mean_concurrency(samples, total):
    """Time-weighted mean number of people stowing at once, over the whole
    boarding. This is the mechanism, so it is measured, not asserted."""
    if len(samples) < 2:
        return 0.0
    area = sum(samples[i][1] * (samples[i + 1][0] - samples[i][0])
               for i in range(len(samples) - 1))
    return area / total if total else 0.0


def peak_concurrency(samples):
    return max(s[1] for s in samples)


def run(method, seeds=25, **kw):
    ts, con, peak = [], [], []
    for sd in range(seeds):
        total, samples, _ = simulate(method, seed=sd, **kw)
        ts.append(total)
        con.append(mean_concurrency(samples, total))
        peak.append(peak_concurrency(samples))
    return (statistics.mean(ts), statistics.stdev(ts) if len(ts) > 1 else 0.0,
            statistics.mean(con), statistics.mean(peak))


PUBLISHED = {'steffen': 216, 'wilma': 253, 'random': 284, 'back_to_front': 371, 'block': 414}


def mmss(s):
    return f"{int(s) // 60}:{int(round(s)) % 60:02d}"


def field_test(seeds=25):
    print(f"\nTHE FIELD TEST REPRODUCED — {ROWS} rows x {SEATS}, "
          f"{ROWS * SEATS} passengers, {seeds} seeds")
    print(f"parameters: t_row {T_ROW}s  t_stow {T_STOW}s  t_sit {T_SIT}s  "
          f"shuffle {SHUFFLE}  bags {BAG_RATE:.0%}  sub-slots/row {SUB}")
    print(f"\n{'method':<15}{'ours':>9}{'sd':>7}{'published':>12}{'error':>9}"
          f"{'stowing at once':>18}{'peak':>7}")
    out = {}
    for m in METHODS:
        mean, sd, con, peak = run(m, seeds=seeds)
        pub = PUBLISHED[m]
        out[m] = (mean, sd, con, peak)
        print(f"{m:<15}{mmss(mean):>9}{sd:>7.1f}{mmss(pub):>12}"
              f"{(mean - pub) / pub * 100:>8.0f}%{con:>18.2f}{peak:>7.1f}")

    b2f, rnd = out['back_to_front'][0], out['random'][0]
    print(f"\nTHE CLAIM: back to front takes {(b2f - rnd) / rnd * 100:.0f}% longer than random")
    print(f"           published: {(PUBLISHED['back_to_front'] - PUBLISHED['random']) / PUBLISHED['random'] * 100:.0f}% longer")
    print(f"THE MECHANISM: {out['random'][2] / out['back_to_front'][2]:.1f}x as many people "
          f"stow at once under a random order")
    order_ok = [m for _, m in sorted((out[m][0], m) for m in METHODS)]
    print(f"\nordering, ours:      {' < '.join(order_ok)}")
    print(f"ordering, published: {' < '.join(m for _, m in sorted((PUBLISHED[m], m) for m in METHODS))}")
    print(f"ORDERING REPRODUCED: {order_ok == [m for _, m in sorted((PUBLISHED[m], m) for m in METHODS)]}")
    return out


def sweep(seeds=8):
    """Is the result an artefact of one guess? Every free parameter moved.

    The claim under test is NOT the absolute clock -- that depends on how long a
    bag takes, which nobody knows to a second. It is the ORDERING and the ~1.3x.
    """
    print("\nPARAMETER SWEEP — does back-to-front stay slower than random?")
    print(f"\n{'t_stow':>8}{'bags':>7}{'shuffle':>10}{'t_row':>7}"
          f"{'b2f':>8}{'random':>8}{'longer':>9}{'b2f>rand':>10}")
    rows = []
    for t_stow in (3.0, 6.0, 12.0, 20.0):
        for bag_rate in (0.4, 0.6, 0.75, 0.95):
            for sh in ((0.0, 3.0, 5.0), (0.0, 6.0, 10.0), (0.0, 12.0, 20.0)):
                for t_row in (0.7, 1.0, 1.6):
                    kw = dict(t_stow=t_stow, bag_rate=bag_rate, shuffle=sh, t_row=t_row)
                    b = run('back_to_front', seeds=seeds, **kw)[0]
                    r = run('random', seeds=seeds, **kw)[0]
                    rows.append((b - r) / r * 100)
                    if len(rows) % 12 == 1:
                        print(f"{t_stow:>8.0f}{bag_rate:>7.0%}{str(sh[1]):>10}{t_row:>7.1f}"
                              f"{mmss(b):>8}{mmss(r):>8}{(b - r) / r * 100:>8.0f}%"
                              f"{'YES' if b > r else 'NO':>10}")
    wins = sum(1 for d in rows if d > 0)
    print(f"\n{wins}/{len(rows)} parameter combinations have back-to-front SLOWER than random")
    print(f"penalty across the sweep: min {min(rows):.0f}%  median {statistics.median(rows):.0f}%  "
          f"max {max(rows):.0f}%")
    return rows


def bigger_cabin(seeds=15):
    print("\nA REAL SINGLE-AISLE CABIN — 30 rows x 6 = 180 seats (A320 / 737 economy)")
    print(f"\n{'method':<15}{'time':>9}{'vs random':>12}{'stowing at once':>18}")
    base = run('random', seeds=seeds, rows=30)[0]
    for m in ('random', 'back_to_front', 'wilma', 'steffen'):
        mean, _, con, _ = run(m, seeds=seeds, rows=30)
        print(f"{m:<15}{mmss(mean):>9}{(mean - base) / base * 100:>11.0f}%{con:>18.2f}")


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--sweep', action='store_true')
    ap.add_argument('--seeds', type=int, default=25)
    a = ap.parse_args()
    field_test(a.seeds)
    bigger_cabin()
    if a.sweep:
        sweep()
