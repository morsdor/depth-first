from manim import *

ACCENT = "#AD88FF"   # DOMAIN_ACCENT.data, same token the reels use
INK    = "#E8E4F3"

class Probe(Scene):
    def construct(self):
        # A graph: the one thing Remotion has no primitive for.
        g = Graph(
            list(range(9)),
            [(0,1),(1,2),(0,3),(3,4),(4,5),(2,5),(5,6),(6,7),(4,7),(7,8),(1,8)],
            layout="kamada_kawai", layout_scale=3.2,
            vertex_config={"radius": 0.14, "fill_color": INK},
            edge_config={"stroke_color": INK, "stroke_opacity": 0.35, "stroke_width": 3},
        )
        self.play(Create(g), run_time=1.2)
        # Flood a path in the accent -- the equation.verse move.
        for a, b in [(0,3),(3,4),(4,7),(7,8)]:
            self.play(g.edges[(a,b)].animate.set_stroke(color=ACCENT, opacity=1, width=9),
                      g[b].animate.set_fill(ACCENT), run_time=0.28)
        # Text via Pango -- no LaTeX needed.
        t = Text("shortest path", font_size=44, color=ACCENT).next_to(g, DOWN, buff=0.7)
        self.play(FadeIn(t, shift=UP*0.3), run_time=0.6)
        self.wait(0.5)
