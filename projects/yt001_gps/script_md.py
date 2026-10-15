"""Generate SCRIPT.md from the REAL sentence timings (timeline.json), so the table cannot drift from the audio."""
import json
from pathlib import Path

HERE = Path(__file__).parent
TL = json.loads((HERE / "timeline.json").read_text())
N = json.loads((HERE / "sims" / "numbers.json").read_text())

SCREEN = {
    ("hook", 0): ("Title 'HOW GPS FINDS YOU'. Real coastlines, 31 satellites on Kepler orbits, counter 31 · 20,191 km up", "Show the claim before explaining it"),
    ("hook", 1): ("Signal pulses run from every satellite above the horizon to the blue dot; '± 5 m from timestamps alone'", "The mechanism is already running on screen"),
    ("hook", 2): ("The line that matters: Δf/f = ΔΦ/c² − v²/2c² (how fast a clock ticks). EINSTEIN is the one amber word", "Plants the payoff for scene 5"),
    ("satellites", 0): ("Six orbital planes draw on in six hues; cards: 6 planes · 55° · 20,191 km (computed from Kepler)", "gps.gov + Navipedia; altitude is DERIVED and checked"),
    ("satellites", 1): ("2× orbits a day (11 h 58 min); live count of satellites above the horizon; never fewer than 6 anywhere (computed)", "'At least four' is verified on a global grid, not assumed"),
    ("satellites", 2): ("Each satellite 'broadcasts': WHO I AM · WHERE I AM · WHAT TIME IT IS", "What a GPS signal contains"),
    ("satellites", 3): ("RECEIVE ONLY: nothing travels up; any number of phones can listen", "Corrects a common misconception"),
    ("ranging", 0): ("DELAY × SPEED OF LIGHT = DISTANCE. A signal front expands from a satellite to scale; timer slowed 50×", "The one equation of the whole system"),
    ("ranging", 1): ("67.3 ms × 299,792 km/s = 20,191 km; a sphere of possible places drawn to scale", "Computed: altitude / c"),
    ("ranging", 2): ("Three spheres in 3-D: sphere, then circle, then two points; one mirror-point flagged OUT IN SPACE", "Real geometry: the second point is the reflection across the satellites' plane"),
    ("clock", 0): ("NEEDED: a few billionths of a second. A phone has a quartz crystal. Toy stage: three circles that do not meet", "Why the clock is the hard part"),
    ("clock", 1): ("1 µs = 300 m; 0.5 ms = 150 km; unknowns x · y · z · b", "Counts the unknowns"),
    ("clock", 2): ("4 unknowns, 4 satellites. A real Gauss–Newton fix from the centre of the Earth: 6,375,870 m → 3.5 m in 5 steps; the toy circles close on one point", "REAL solver on real satellite geometry, 2 m noise per range"),
    ("einstein", 0): ("Two clocks: GROUND ≠ SATELLITE", "Setup"),
    ("einstein", 1): ("Orbit with velocity arrow, v = 3.874 km/s; ledger row: special relativity −7.21 µs/day", "Computed from GM and the Kepler orbit"),
    ("einstein", 2): ("Gravity well; ledger row: general relativity +45.79 µs/day", "Computed from the IAU geoid potential and GM/r"),
    ("einstein", 3): ("Harvard tower: 22.5 m, 1959; predicted shift gh/c² = 2.46 × 10⁻¹⁵", "Pound–Rebka; the shift itself is computed, not quoted"),
    ("einstein", 4): ("Net +38.58 µs/day; a ruler that fills to 11.56 km as the day passes", "38.58 µs × c = 11.56 km"),
    ("einstein", 5): ("NTS-2 · June 1977; ≈ 20 days running free; synthesizer switch OFF", "Matters of Gravity (Ashby) via search; a secondary copy of the Living Review"),
    ("einstein", 6): ("MEASURED +442.5 vs PREDICTED +446.5 parts per trillion; OUR CALCULATION +446.5; switch flips to ON", "Our unfitted calculation lands on the published prediction"),
    ("einstein", 7): ("10.23000000000 MHz vs 10.22999999543 MHz (the differing digits in cyan); −4.465 × 10⁻¹⁰", "Computed offset reproduces the published pre-launch setting"),
    ("accuracy", 0): ("Street grid with rings TO SCALE: phone ~4.9 m, signals ~2 m; a signal bounced off a building", "gps.gov accuracy page"),
    ("accuracy", 1): ("Two rays through the ionosphere (L1 1575.42, L5 1176.45 MHz); delay ∝ 1/f²; L5 is delayed 1.79× more", "Physics; the ratio is computed"),
    ("accuracy", 2): ("Zoom out: a 100 m ring, 'until 2 May 2000, on purpose', then it shrinks to ~5 m", "gps.gov selective-availability pages"),
    ("close", 0): ("Three cards appear as spoken: DISTANCE FROM TIME · A FOURTH SATELLITE · EINSTEIN", "The recap"),
    ("close", 1): ("GPS TIME hub: cell networks, power grids, financial markets", "Reference-clock use of GPS time"),
    ("close", 2): ("TAKE ANY ONE AWAY — and the system stops working; then the sources", "Close; credits for 12 s"),
}

def mmss(t):
    return "%d:%04.1f" % (t // 60, t % 60)

out = ["# yt001 — How GPS finds you, and why it needs Einstein",
       "",
       f"**{TL['duration'] / 60:.2f} min · 3840×2160 design, rendered 1920×1080 · 30 fps · {TL['words']} words · "
       f"AI voice (Kokoro-82M, `{TL['voice']}`)**",
       "",
       "Generated from `timeline.json` by `script_md.py` — every time below is a real sentence boundary in the audio.",
       "",
       "| t | Narration (verbatim) | On screen | Why this beat exists / source |",
       "|:--|:--|:--|:--|"]
for s in TL["sentences"]:
    scr, why = SCREEN[(s["scene"], s["i"])]
    out.append(f"| {mmss(s['start'])} | {s['text']} | {scr} | {why} |")
out += ["", "## Scene windows", "", "| scene | start | end |", "|:--|--:|--:|"]
for sc in TL["scenes"]:
    out.append(f"| {sc['id']} | {mmss(sc['start'])} | {mmss(sc['end'])} |")
(HERE / "SCRIPT.md").write_text("\n".join(out) + "\n")
print("wrote SCRIPT.md,", len(TL["sentences"]), "rows")
