"""Generate SCRIPT.md from the REAL sentence timings (timeline.json), so the table cannot drift from the audio."""
import json
from pathlib import Path

HERE = Path(__file__).parent
TL = json.loads((HERE / "timeline.json").read_text())
N = json.loads((HERE / "sims" / "numbers.json").read_text())

SCREEN = {
    ("hook", 0): ("Title 'HOW GPS FINDS YOU'. Real coastlines; the blue dot lands; 31 satellites 20,191 km up; signals run down to you", "Hook: a thing everyone does, then the question"),
    ("hook", 1): ("Outline: 1 timestamps → your location · 2 a fourth satellite · 3 a physicist who died in 1955", "The promise: three things, in order"),
    ("hook", 2): ("COMING UP: PLOT TWIST, and 'the time the military broke GPS on purpose … and then un-broke it'", "The two open loops that keep you watching"),
    ("satellites", 0): ("Six orbital planes draw on; cards: 6 planes · 55° · 20,191 km (about 50× the space station)", "gps.gov + Navipedia; altitude DERIVED from Kepler"),
    ("satellites", 1): ("2× orbits a day; live count of satellites above your horizon; never fewer than 6 anywhere (computed)", "'At least four' verified on a global grid"),
    ("satellites", 2): ("WHO I AM · WHERE I AM · WHAT TIME IT IS", "What a GPS signal contains"),
    ("satellites", 3): ("RECEIVE ONLY — the world's most successful one-way relationship", "Corrects a misconception, with a joke"),
    ("ranging", 0): ("A thunderstorm: flash, count the seconds (3 s ≈ 1 km), sound ring reaches you; 'GPS: the same trick, with radio'", "The analogy a normal person already owns"),
    ("ranging", 1): ("DELAY × SPEED OF LIGHT = DISTANCE; the signal front crosses to scale, timer 67.3 ms; a bubble of possible places", "Computed: altitude / c"),
    ("ranging", 2): ("Three spheres in 3-D: bubble, circle, two points; one flagged OUT IN SPACE", "Real geometry: the mirror point across the satellites' plane"),
    ("clock", 0): ("NEEDED: a few billionths of a second. A PHONE HAS a quartz crystal — 'the same basic tech as a gas-station watch'", "Why the clock is the hard part"),
    ("clock", 1): ("1 µs = 300 m; 0.5 ms = 150 km; unknowns x · y · z · b", "Counts the unknowns"),
    ("clock", 2): ("4 unknowns, 4 satellites: a real Gauss–Newton fix from the centre of the Earth, 6,375,870 m → 3.5 m in 5 steps", "REAL solver on real geometry, 2 m noise per range"),
    ("einstein", 0): ("Two clocks: GROUND ≠ SATELLITE", "The plot twist"),
    ("einstein", 1): ("Orbit, v = 3.874 km/s; ledger: special relativity −7.21 µs/day", "Computed from GM and the Kepler orbit"),
    ("einstein", 2): ("Gravity well, two clocks (slower / faster, exaggerated); ledger: general relativity +45.79 µs/day", "Computed from the IAU geoid potential and GM/r"),
    ("einstein", 3): ("Harvard tower, 22.5 m, 1959; photons climb it; predicted shift gh/c² = 2.46 × 10⁻¹⁵", "Pound–Rebka; the shift is computed"),
    ("einstein", 4): ("Net +38.58 µs/day; a ruler fills to 11.56 km as the day passes", "38.58 µs × c = 11.56 km"),
    ("einstein", 5): ("NTS-2 · June 1977; day counter to 20; the correction switch is OFF", "Ashby via Matters of Gravity (search-level, secondary)"),
    ("einstein", 6): ("MEASURED +442.5 vs PREDICTED +446.5 ppt, our calculation +446.5; the switch flips ON", "Our unfitted calculation lands on the prediction"),
    ("einstein", 7): ("10.23000000000 MHz vs 10.22999999543 MHz typed on digit by digit; −4.465 × 10⁻¹⁰", "Computed offset reproduces the published setting"),
    ("accuracy", 0): ("Street grid with rings TO SCALE: phone ~4.9 m, signals ~2 m; a cab on the far side of the street; a signal bounced off a building", "gps.gov accuracy page; the joke is the street width"),
    ("accuracy", 1): ("Two rays through the ionosphere (L1, L5); delay ∝ 1/f²; the L5 pulse lags the L1 pulse", "Physics; the 1.79× ratio is computed"),
    ("accuracy", 2): ("Zoom out: a 100 m ring, 'until 2 May 2000, on purpose', then it shrinks to ~5 m", "gps.gov selective-availability pages"),
    ("close", 0): ("Three cards appear as spoken: DISTANCE FROM TIME · A FOURTH SATELLITE · EINSTEIN", "The recap in three lines"),
    ("close", 1): ("GPS TIME hub: phone networks, power grids, financial markets", "Reference-clock use of GPS time (not searched)"),
    ("close", 2): ("'YOU JUST HAD TO TURN LEFT.' — 31 clocks in space · 1 cheap watch · 1 physicist; then the sources", "The callback; credits for 10 s"),
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
