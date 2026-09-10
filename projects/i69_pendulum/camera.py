"""I69 — the camera, and a geometric model of what it is pointing at.

The camera lives here rather than in Pendulum.tsx so that placing an annotation
stops being a guess. Every string, bob and rail position is known analytically
(layout.py), so "is this corner of the screen empty for the whole beat" is a
question with an exact answer, asked before anything is rendered.

emit_ts.py ships these keyframes to Remotion, so the boxes asserted here are the
boxes the reel actually draws in. Editing the camera without re-running the
emitter cannot silently invalidate the checks -- the emitter runs them.

Easing matches lib/chrome.tsx `ease`: cubic-bezier(0.4, 0, 0.2, 1).
"""
import numpy as np

import layout as LO

SAFE_CX, CY = 465.0, 936.0
SAFE = (60.0, 270.0, 870.0, 1540.0)      # x0, y0, x1, y1

# t, scale, and the apparatus point that lands on (SAFE_CX, CY).
# Beat boundaries are ALSO keyframes: a beat that starts mid-segment visits
# camera states the emptiness check never sampled.
KEYS = [
    # t     s     x      y     what
    (0.0,  1.10, 465.0,  936.0),   # the WHOLE row: the hook promises this line back
    (5.0,  1.00, 465.0,  936.0),
    (10.0, 1.00, 465.0,  936.0),   # parked -- the length labels need a still frame
    (15.5, 1.00, 465.0,  936.0),
    # The variables table is a THREE-ROW block, and the beam sweeps down across
    # the frame as the camera pushes -- 1.14 at (520,880) put the strings straight
    # through it. A gentler drift keeps the beat alive and leaves the block empty.
    (18.0, 1.08, 470.0,  900.0),
    (20.5, 1.02, 440.0,  950.0),
    (22.2, 1.22, 300.0, 1010.0),   # "the longest one" -> look at the LONG end
    (25.0, 1.22, 300.0, 1010.0),
    (26.5, 1.20, 700.0,  585.0),   # "the shortest one" -> look at the SHORT end
    (27.8, 1.20, 700.0,  585.0),
    # Wide and LOCKED before t=30.0. The reform is the one frame the reel exists
    # for; catching it mid-move would throw away the payoff.
    (29.4, 1.00, 465.0,  936.0),
    (34.0, 1.00, 465.0,  936.0),
]


def _bez(x, p1x=0.4, p1y=0.0, p2x=0.2, p2y=1.0):
    """cubic-bezier(p1x,p1y,p2x,p2y) evaluated at x, by bisection on the parameter."""
    x = np.clip(x, 0.0, 1.0)
    lo, hi = 0.0, 1.0
    for _ in range(40):
        u = (lo + hi) / 2.0
        v = 3 * (1 - u) ** 2 * u * p1x + 3 * (1 - u) * u ** 2 * p2x + u ** 3
        lo, hi = (u, hi) if v < x else (lo, u)
    u = (lo + hi) / 2.0
    return 3 * (1 - u) ** 2 * u * p1y + 3 * (1 - u) * u ** 2 * p2y + u ** 3


def cam(t):
    """(scale, cx, cy) at time t, matching Remotion's interpolate(..., ease)."""
    ts = [k[0] for k in KEYS]
    if t <= ts[0]:
        return KEYS[0][1:]
    if t >= ts[-1]:
        return KEYS[-1][1:]
    i = int(np.searchsorted(ts, t, 'right')) - 1
    a, b = KEYS[i], KEYS[i + 1]
    f = _bez((t - a[0]) / (b[0] - a[0]))
    return tuple(a[j] + (b[j] - a[j]) * f for j in (1, 2, 3))


def to_screen(pts, t):
    """Apparatus reference px -> composition px, under the camera at time t."""
    s, cx, cy = cam(t)
    p = np.atleast_2d(np.asarray(pts, float))
    return np.column_stack([SAFE_CX + (p[:, 0] - cx) * s, CY + (p[:, 1] - cy) * s])


def parts(t, piv=None):
    """(segments, circles) of the apparatus in composition px at time t.

    Segments are the rail and the fifteen strings; circles are the bobs. Widths
    are the ones scene_pendulum.py draws with, in reference px, scaled.
    """
    piv = LO.pivots() if piv is None else piv
    s = cam(t)[0]
    f = int(round(np.clip(t, 0, (LO.D['frames'] - 1) / LO.D['fps']) * LO.D['fps']))
    f = min(f, LO.TH.shape[0] - 1)
    ends = np.array([piv[n] + (LO.DOWN * np.cos(LO.TH[f, n])
                               + LO.SWING * np.sin(LO.TH[f, n])) * LO.rod_px(n)
                     for n in range(LO.COUNT)])
    step = piv[1] - piv[0]
    segs = [(to_screen(piv[0] - step * 0.9, t)[0], to_screen(piv[-1] + step * 0.9, t)[0],
             13.0 * s / 2)]
    for n in range(LO.COUNT):
        segs.append((to_screen(piv[n], t)[0], to_screen(ends[n], t)[0],
                     4.6 * LO.depth(n) * s / 2))
    circ = [(to_screen(ends[n], t)[0], LO.bob_px(n) * s) for n in range(LO.COUNT)]
    return segs, circ


def _seg_box_gap(a, b, box):
    """Shortest distance from segment ab to an axis-aligned box (0 if it hits)."""
    x0, y0, x1, y1 = box
    ts = np.linspace(0, 1, 160)
    p = a + (b - a) * ts[:, None]
    dx = np.maximum(np.maximum(x0 - p[:, 0], p[:, 0] - x1), 0)
    dy = np.maximum(np.maximum(y0 - p[:, 1], p[:, 1] - y1), 0)
    return float(np.min(np.hypot(dx, dy)))


def clearance(box, t0, t1, step=1 / 6):
    """Smallest gap between the box and any part of the apparatus over [t0, t1]."""
    piv = LO.pivots()
    worst, when = 1e9, t0
    for t in np.arange(t0, t1 + 1e-9, step):
        segs, circ = parts(float(t), piv)
        g = 1e9
        for a, b, hw in segs:
            g = min(g, _seg_box_gap(a, b, box) - hw)
        for c, r in circ:
            x0, y0, x1, y1 = box
            dx = max(x0 - c[0], c[0] - x1, 0)
            dy = max(y0 - c[1], c[1] - y1, 0)
            g = min(g, float(np.hypot(dx, dy)) - r)
        if g < worst:
            worst, when = g, float(t)
    return worst, when


def in_safe(box):
    x0, y0, x1, y1 = box
    return x0 >= SAFE[0] and y0 >= SAFE[1] and x1 <= SAFE[2] and y1 <= SAFE[3]


def track(n, t):
    """Where bob n is on screen at time t, and its radius."""
    _, circ = parts(t)
    return circ[n]
