"""I69 — the fifteen pendulums, rendered by Manim as a transparent layer.

Angles are NOT animated here. They are read frame-by-frame from
pendulum_data.json, produced by integrating theta'' = -(g/L) sin theta in
simulate.py. Manim is the renderer; the physics happened upstream.

Framing is fixed on purpose: the camera move lives in Remotion, over the layer,
so it can be retimed without a 37 s re-render. Render TALLER than 1080x1920 to
give that push somewhere to go (MANIM_W / MANIM_H).

The layout comes from layout.py, which is also what emit_ts.py ships to Remotion
so the length labels drawn over this layer land ON these strings. Manim does NOT
keep frame_height at 8 for a tall canvas -- it holds frame_width at the 16:9
default and grows frame_height instead, so hardcoded unit constants silently
render at a third of the intended size. Hence the reference-pixel conversion.
"""
import os
import pathlib
import sys

import numpy as np
from manim import Scene, VGroup, Line, Dot, TracedPath, ValueTracker, linear, config

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import layout as LO

RAIL_C, STRING_C, BOB_C = '#274064', '#81A2C4', '#AD88FF'
COUNT, FPS = LO.COUNT, LO.D['fps']
TH = LO.TH
START = float(os.environ.get('PEND_START', '0'))
SECS = float(os.environ.get('PEND_SECONDS', str((LO.D['frames'] - 1) / FPS)))


def theta_at(t):
    x = np.clip(t * FPS, 0, len(TH) - 1)
    i = int(x)
    j = min(i + 1, len(TH) - 1)
    return TH[i] + (TH[j] - TH[i]) * (x - i)


class Pendulums(Scene):
    def construct(self):
        u = config.frame_width / LO.REF_W     # Manim units per reference pixel

        def v(px, py):                        # reference px -> Manim vector (y flips)
            return np.array([(px - LO.REF_W / 2) * u,
                             -(py - LO.REF_H / 2) * u, 0.0])

        P = LO.pivots()
        piv = [v(*P[n]) for n in range(COUNT)]
        # The rod directions must be UNIT vectors: their length comes from ln.
        # Building them through v() multiplies by u a second time, which makes
        # every string ~1/76 of its length and parks the bobs on the rail.
        down = np.array([0.0, -1.0, 0.0])
        swing = np.array([LO.SWING[0], -LO.SWING[1], 0.0])

        # Every bob, every frame, must stay inside the Instagram safe column.
        # Checking one frame is not enough: the widest instant is not the one
        # that happens to be on screen when you look.
        lo = np.full(2, 1e9); hi = -lo
        for n in range(COUNT):
            q = LO.bob_track(n, P)
            lo = np.minimum(lo, (q - LO.bob_px(n)).min(0))
            hi = np.maximum(hi, (q + LO.bob_px(n)).max(0))
        assert lo[0] >= 60 and hi[0] <= 870, \
            f'bobs span x {lo[0]:.0f}..{hi[0]:.0f}, outside the safe column 60..870'
        assert lo[1] >= 270 and hi[1] <= 1540, \
            f'bobs span y {lo[1]:.0f}..{hi[1]:.0f}, outside the safe band 270..1540'
        print(f'SAFE OK  bobs x {lo[0]:.0f}..{hi[0]:.0f}  y {lo[1]:.0f}..{hi[1]:.0f}')

        step = piv[1] - piv[0]
        self.add(Line(piv[0] - step * 0.9, piv[-1] + step * 0.9,
                      stroke_color=RAIL_C, stroke_width=13))

        t = ValueTracker(START)
        strings, bobs = VGroup(), VGroup()
        for n in range(COUNT):
            depth = LO.depth(n)
            ln = LO.rod_px(n) * u
            s = Line(piv[n], piv[n] + down * ln, stroke_color=STRING_C,
                     stroke_width=4.6 * depth, stroke_opacity=0.55 + 0.4 * depth)
            b = Dot(piv[n] + down * ln, radius=LO.bob_px(n) * u,
                    fill_color=BOB_C, fill_opacity=0.72 + 0.28 * depth)

            def upd(_, n=n, ln=ln, s=s, b=b):
                th = theta_at(t.get_value())[n]
                end = piv[n] + (down * np.cos(th) + swing * np.sin(th)) * ln
                s.put_start_and_end_on(piv[n], end)
                b.move_to(end)

            s.add_updater(upd)
            strings.add(s); bobs.add(b)

        self.add(strings)
        for b in bobs:
            self.add(TracedPath(b.get_center, stroke_color=BOB_C, stroke_width=4.5,
                                stroke_opacity=0.62, dissipating_time=0.5))
        self.add(bobs)          # bobs ride above their own trails
        self.play(t.animate.set_value(START + SECS), run_time=SECS, rate_func=linear)
