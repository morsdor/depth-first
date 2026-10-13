"""Stage 3 research for I93 — every physical claim in the sentence, run and asserted.

Nothing here is drawn. It answers: is each sentence the reel will put on screen TRUE, by how much, and
against what outside number? Run:  python3 -I gate0/i93_whichice/research/melt_check.py

Five checks, in the order the sentence makes them:

  1. THE GLASS, AS A TIME SERIES (not just start and end). Melt the cube a step at a time and re-solve the
     water level at every step. Floating ice: the level is the same number at every step, to 1e-12.
     Ice on a shelf: the level climbs in a straight line. These curves are the data the build plays back.
  2. A REAL DRINK IS NOT ISOTHERMAL. A 20 C drink cools when 0 C ice melts in it, and water contracts
     as it cools toward 4 C, so the level FALLS a little, and returns to exactly where it started once the drink
     warms back to 20 C. "The glass doesn't overflow" has margin.
  3. THE SALT-WATER REMAINDER, on both bases people use, against the published figure.
  4. THE SCALE, on one ruler: metres of global sea level. Every input is a SEARCH-LEVEL figure (the primary
     papers are unreachable from this container) and is marked as such in figures.json.
  5. THE ON-SCREEN NUMBERS, converted to US units, and the one place a claim could be wrong in a way the
     sentence cannot tolerate.

No numpy needed. Writes figures.json beside this file.
"""
import json
import math
from pathlib import Path

HERE = Path(__file__).parent
OUT = {}

# ── 0. shared geometry (same glass as gate0/mock_payoff.py) ────────────────────────────────────
R_IN = 3.5                           # cm, inner radius
A = math.pi * R_IN ** 2              # cm^2
V_W0 = A * 8.0                       # cm^3, 8 cm of water before the ice goes in
SIDE0 = 4.0                          # cm, the cube
RHO_ICE = 0.917                      # g/cm^3
V_ICE0 = SIDE0 ** 3
M0 = RHO_ICE * V_ICE0                # g

# ── 1. the glass as a time series ──────────────────────────────────────────────────────────────
def float_level(frac_left, rho_w=1.0):
    """Level with the cube floating, after a fraction (1 - frac_left) of it has melted into the glass.
    The cube stays a cube (side shrinks), the water gained is meltwater, and the draft is re-solved from the
    force balance at every step: draft * side^2 * rho_w = mass."""
    m = M0 * frac_left
    side = (m / RHO_ICE) ** (1 / 3)
    draft = m / (rho_w * side ** 2) if m > 0 else 0.0
    melt_cm3 = (M0 - m) / rho_w
    level = (V_W0 + melt_cm3 + side ** 2 * draft) / A
    return level, side, draft


def shelf_level(frac_left, rho_w=1.0):
    melt_cm3 = (M0 * (1 - frac_left)) / rho_w
    return (V_W0 + melt_cm3) / A


STEPS = 200
floating, shelf = [], []
for i in range(STEPS + 1):
    f = 1 - i / STEPS                 # fraction of the ice still solid
    lv, side, draft = float_level(f)
    floating.append((round(1 - f, 4), lv, side, draft))
    shelf.append((round(1 - f, 4), shelf_level(f)))

L0 = floating[0][1]
assert max(abs(lv - L0) for _, lv, _, _ in floating) < 1e-9, "floating ice moved the level"
assert abs(shelf[0][1] - V_W0 / A) < 1e-12
rise = shelf[-1][1] - shelf[0][1]
# the shelf level is linear in the melt fraction
lin_err = max(abs(lv - (shelf[0][1] + rise * m)) for m, lv in shelf)
assert lin_err < 1e-9, lin_err
assert abs(shelf[-1][1] - L0) < 1e-9, "the shelf glass must END on the level the floating glass already sits at"
# the cube rides at a constant 91.7% under, however small it gets
assert all(abs(d / s - RHO_ICE) < 1e-9 for _, _, s, d in floating if s > 0)
print(f"1. glass, 200 melt steps: floating level {L0:.4f} cm at EVERY step (max drift < 1e-9 cm); "
      f"shelf level {shelf[0][1]:.4f} -> {shelf[-1][1]:.4f} cm (+{rise:.4f} cm, linear); both end at {L0:.4f}")
OUT["glass"] = {"area_cm2": A, "water_before_cm": V_W0 / A, "level_floating_cm": L0, "level_shelf_before_cm": shelf[0][1],
                "level_shelf_after_cm": shelf[-1][1], "rise_cm": rise, "cube_cm": SIDE0, "ice_g": M0}

# ── 2. a real drink: 20 C water, 0 C ice ───────────────────────────────────────────────────────
def rho_pure(T):
    """Density of air-free pure water, g/cm^3, Kell (1975). T in deg C."""
    num = (999.83952 + 16.945176 * T - 7.9870401e-3 * T ** 2 - 46.170461e-6 * T ** 3
           + 105.56302e-9 * T ** 4 - 280.54253e-12 * T ** 5)
    return num / (1 + 16.879850e-3 * T) / 1000.0

# self-check the formula against textbook values before trusting it
for T, ref in ((0, 0.99984), (4, 0.99997), (20, 0.99821), (25, 0.99705)):
    assert abs(rho_pure(T) - ref) < 3e-5, (T, rho_pure(T), ref)

T_DRINK, L_FUS, C_W = 20.0, 334.0, 4.18          # deg C ; J/g ; J/(g K)
m_w = rho_pure(T_DRINK) * V_W0                    # g of drink
# energy balance, drink cools to Tf as 0 C ice melts and warms to Tf:  m_w c (T - Tf) = m_ice (L + c Tf)
Tf = (m_w * C_W * T_DRINK - M0 * L_FUS) / (m_w * C_W + M0 * C_W)
assert 0 < Tf < T_DRINK
V_before = m_w / rho_pure(T_DRINK) + M0 / rho_pure(T_DRINK)           # drink + displaced volume, ice just placed
V_cold = (m_w + M0) / rho_pure(Tf)                                    # everything melted, drink at Tf
V_warm = (m_w + M0) / rho_pure(T_DRINK)                               # drink back at room temperature
drop_mm = (V_before - V_cold) / A * 10
assert V_cold < V_before, "a cooled drink must not be higher than when the ice went in"
assert abs(V_warm - V_before) < 1e-9, "same water at the same temperature must return to the same level"
assert 0 < drop_mm < 2.0, drop_mm
print(f"2. real 20 C drink: ends at {Tf:.2f} C; level FALLS {drop_mm:.2f} mm while cold, "
      f"and returns to the starting level exactly when it warms back to 20 C")
OUT["real_drink"] = {"final_temp_c": Tf, "level_drop_mm": drop_mm, "returns_exactly_when_warmed": True}

# ── 3. the salt-water remainder ────────────────────────────────────────────────────────────────
rows = []
for rho_sw in (1.020, 1.025, 1.026, 1.027, 1.028):
    v_disp = M0 / rho_sw
    v_melt = M0 / 1.000
    extra = v_melt - v_disp
    rows.append((rho_sw, extra / V_ICE0, extra / v_disp))
    assert abs(extra / v_disp - (rho_sw - 1.0)) < 1e-12         # algebra: the remainder is exactly rho_sw/rho_fresh - 1
print("3. fresh ice floating in seawater — remainder on each base:")
for rho_sw, of_ice, of_disp in rows:
    print(f"     rho_sw {rho_sw:.3f}:  {of_ice * 100:.2f}% of the ice's volume   {of_disp * 100:.2f}% of the water it displaced")
PUBLISHED_PCT_OF_DISPLACED = 2.6      # Noerdlinger & Brower 2007, GJI 170:145-150 — SEARCH-LEVEL (abstract via search), unread at the primary
inside = [r for r in rows if 0.025 <= r[2] <= 0.027]
assert inside, "our unfitted remainder must bracket the published 2.6% of displaced volume"
print(f"   published (search-level, abstract): {PUBLISHED_PCT_OF_DISPLACED}% of the displaced volume; ours brackets it "
      f"at rho_sw {inside[0][0]:.3f}-{inside[-1][0]:.3f}, with nothing fitted")
# sea ice is itself salty (about 5 g/kg), so its meltwater is a little denser than fresh: the remainder is smaller
rho_melt_seaice = 1.004
rem_sea_ice = 1.026 / rho_melt_seaice - 1
assert 0.015 < rem_sea_ice < 0.026
print(f"   sea ice (about 5 g/kg salt, meltwater {rho_melt_seaice}): remainder {rem_sea_ice * 100:.2f}% of displaced — smaller, so the "
      f"fresh-ice figure is the upper bound")
OUT["salt_remainder"] = {"rows_rho_sw_pct_of_ice_pct_of_displaced": rows, "published_pct_of_displaced": PUBLISHED_PCT_OF_DISPLACED,
                         "grade": "search-level: abstract seen via search, paper unread"}

# ── 4. the scale, on one ruler: metres of global sea level ────────────────────────────────────
OCEAN_KM2 = 3.618e8           # remembered; search-level not done. Used only for the cross-check below
GREENLAND_KM3 = 2.99e6        # Morlighem et al. 2017 (BedMachine v3), SEARCH-LEVEL via search snippet
GREENLAND_SLE = 7.42          # Morlighem et al. 2017: 7.42 +/- 0.05 m — SEARCH-LEVEL
ANTARCTICA_SLE = 57.9         # Morlighem et al. 2020 (BedMachine Antarctica), 57.9 +/- 0.9 m — SEARCH-LEVEL (one site gives 58.3)
GLACIERS_SLE = 0.32           # Farinotti et al. 2019, 0.32 +/- 0.08 m (Millan 2022 argues ~20% lower) — SEARCH-LEVEL
FLOATING_ALL_SLE = 0.04       # Noerdlinger & Brower 2007: all extant sea ice + shelf ice, "about 4 cm" — SEARCH-LEVEL, ABSTRACT ONLY
PIOMAS_MAX_KM3, PIOMAS_MIN_KM3 = 28000, 11500   # PIOMAS mean annual cycle (April / September) — SEARCH-LEVEL

# OUTSIDE-NUMBER CHECK on the Greenland figure: volume x ice density / ocean area, no floatation correction
naive = GREENLAND_KM3 * RHO_ICE / OCEAN_KM2 * 1000        # m
assert naive > GREENLAND_SLE, "ignoring the ice already below sea level must OVERSTATE the rise"
assert abs(naive - GREENLAND_SLE) / GREENLAND_SLE < 0.04
print(f"4. Greenland, computed from the volume alone: {naive:.2f} m vs published {GREENLAND_SLE} m "
      f"({(naive / GREENLAND_SLE - 1) * 100:+.1f}%, above — as it must be: the ice below sea level is already in the sea's level)")

land_total = GREENLAND_SLE + ANTARCTICA_SLE + GLACIERS_SLE
# remainder volume = V_melt - V_disp = V_ice * rho_ice * (1 - 1/rho_sw), in km^3; spread over the ocean, in mm
arctic_upper_mm = PIOMAS_MAX_KM3 * RHO_ICE * (1 - 1 / 1.026) / OCEAN_KM2 * 1e6
print(f"   ALL Arctic sea ice (28,000 km^3 at its April peak): at most {arctic_upper_mm:.2f} mm")
print(f"   ALL floating ice, sea ice + shelves (Noerdlinger & Brower): about {FLOATING_ALL_SLE * 100:.0f} cm")
print(f"   Greenland: {GREENLAND_SLE} m   Antarctica: {ANTARCTICA_SLE} m   other glaciers: {GLACIERS_SLE} m   ALL ice on land: {land_total:.1f} m")
print(f"   so ice on land holds {land_total / FLOATING_ALL_SLE:,.0f}x what ALL floating ice does; Greenland alone {GREENLAND_SLE / FLOATING_ALL_SLE:,.0f}x")
assert arctic_upper_mm < 3.0
assert FLOATING_ALL_SLE * 1000 > arctic_upper_mm, "all floating ice includes Antarctic sea ice and the shelves, so it must exceed Arctic sea ice alone"

# ── 5. the on-screen numbers, in US units ──────────────────────────────────────────────────────
IN_PER_M, FT_PER_M = 39.3701, 3.28084
floating_in = FLOATING_ALL_SLE * IN_PER_M
greenland_ft = GREENLAND_SLE * FT_PER_M
print(f"5. on screen (US units): all floating ice = {floating_in:.2f} in  (say 'about 1.5 inches');  Greenland = {greenland_ft:.1f} ft  (say 'about 24 feet')")
assert 1.4 < floating_in < 1.7 and 24.0 < greenland_ft < 24.7
OUT["scale"] = {
    "greenland_sle_m": GREENLAND_SLE, "greenland_volume_km3": GREENLAND_KM3, "greenland_naive_m": naive,
    "antarctica_sle_m": ANTARCTICA_SLE, "glaciers_sle_m": GLACIERS_SLE, "land_total_m": land_total,
    "floating_all_sle_m": FLOATING_ALL_SLE, "arctic_sea_ice_upper_bound_mm": arctic_upper_mm,
    "on_screen": {"floating_inches": floating_in, "greenland_feet": greenland_ft},
    "grade": "EVERY input is search-level; none read at a primary. The 4 cm is from one abstract. Nothing may say 'a study found' until read.",
}

# the curves the build plays back
OUT["curves"] = {"steps": STEPS,
                 "floating": [(m, lv, side, draft) for m, lv, side, draft in floating[::10]],
                 "shelf": [(m, lv) for m, lv in shelf[::10]]}
(HERE / "figures.json").write_text(json.dumps(OUT, indent=1))
print("wrote", HERE / "figures.json")
