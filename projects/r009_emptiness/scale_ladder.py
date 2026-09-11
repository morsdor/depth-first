#!/usr/bin/env python3
"""r009 / I70 — "the biggest star in the universe is a speck".

Computes every number the reel shows, from published measurements, and asserts
each claim the reel makes. If an assertion fails the reel does not get built.

    python3 projects/r009_emptiness/scale_ladder.py

Writes emptiness_data.json next to this file and prints every figure.

METHOD NOTE (CLAUDE.md "compute the animation, don't author it"): there is no
simulation here to run -- the subject is measurement, not process. So the
honesty burden moves to PROVENANCE: every constant below carries its source in
the same structure, the ratios are derived rather than typed, and the claims are
asserted. Nothing on screen is a number a human chose.
"""
import json
import math
import pathlib

# ─────────────────────────────────────────────────────────────────────────────
# Star colour is COMPUTED, not chosen — Planck's law through the CIE 1931
# colour matching functions, then XYZ -> sRGB. Two reasons:
#   1. honesty: a red supergiant is red because it is 3,400 K, and the frame
#      should be able to say so. No colour on screen is a taste decision.
#   2. brand:check bans hex literals outside brand/ but accepts computed rgb()
#      strings (CLAUDE.md), which is exactly what a physical ramp emits.
# CIE fits: Wyman, Sloan & Shirley 2013, JCGT 2(2) — multi-lobe Gaussians.
# ─────────────────────────────────────────────────────────────────────────────
H_PLANCK, C_LIGHT, K_BOLTZ = 6.62607015e-34, 2.99792458e8, 1.380649e-23


def _g(x, mu, s1, s2):
    s = s1 if x < mu else s2
    return math.exp(-0.5 * ((x - mu) / s) ** 2)


def _cie(nm):
    x = (1.056 * _g(nm, 599.8, 37.9, 31.0) + 0.362 * _g(nm, 442.0, 16.0, 26.7)
         - 0.065 * _g(nm, 501.1, 20.4, 26.2))
    y = 0.821 * _g(nm, 568.8, 46.9, 40.5) + 0.286 * _g(nm, 530.9, 16.3, 31.1)
    z = 1.217 * _g(nm, 437.0, 11.8, 36.0) + 0.681 * _g(nm, 459.0, 26.0, 13.8)
    return x, y, z


def blackbody_rgb(teff_k):
    """Effective temperature -> an sRGB string, normalised to full brightness."""
    X = Y = Z = 0.0
    for nm in range(380, 781, 5):
        lam = nm * 1e-9
        # Planck spectral radiance
        b = ((2 * H_PLANCK * C_LIGHT ** 2) / lam ** 5) / (
            math.exp(H_PLANCK * C_LIGHT / (lam * K_BOLTZ * teff_k)) - 1)
        cx, cy, cz = _cie(nm)
        X += b * cx; Y += b * cy; Z += b * cz
    n = X + Y + Z
    X, Y, Z = X / n, Y / n, Z / n
    r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z
    g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z
    b = 0.0557 * X - 0.2040 * Y + 1.0570 * Z
    m = max(r, g, b)
    out = []
    for v in (r / m, g / m, b / m):
        v = max(0.0, v)
        v = 1.055 * v ** (1 / 2.4) - 0.055 if v > 0.0031308 else 12.92 * v
        out.append(max(0, min(255, round(v * 255))))
    return f'rgb({out[0]}, {out[1]}, {out[2]})'


def surface_flux_rel(teff_k):
    """Stefan-Boltzmann: emitted power per unit area goes as T^4, relative to
    the Sun. This is why a red supergiant looks deep and dim rather than peach --
    normalising colour to full brightness would be a lie about its surface."""
    return (teff_k / 5772.0) ** 4

# ─────────────────────────────────────────────────────────────────────────────
# Constants that are exact by definition
# ─────────────────────────────────────────────────────────────────────────────
LY_KM = 9_460_730_472_580.8      # IAU: Julian year x c, exact
AU_KM = 149_597_870.7            # IAU 2012 Resolution B2, exact
R_SUN_KM = 695_700.0             # IAU 2015 Resolution B3 nominal solar radius

S = {  # source tags, expanded in NOTES.md
    'iau15': 'IAU 2015 Resolution B3 (nominal solar/planetary radii)',
    'iau12': 'IAU 2012 Resolution B2 (astronomical unit, exact)',
    'ohnaka24': 'Ohnaka et al. 2024, A&A 691 L15 (arXiv:2412.01921) — VLTI/GRAVITY',
    'wiki_lls': 'Wikipedia "List of largest stars", radii as cited there — all disputed',
    'gaia': 'Gaia DR2/DR3 parallaxes as published in standard nearest-star catalogues',
    'menten07': 'Menten et al. 2007, A&A 474, 515 — VLBA parallax to the Orion Nebula',
    'gravity19': 'GRAVITY Collaboration 2019, A&A 625 L10 — R0 = 8.178 kpc',
}

# ─────────────────────────────────────────────────────────────────────────────
# Rung 1 — the size ladder everyone has seen
# ─────────────────────────────────────────────────────────────────────────────
SIZES = [
    {'name': 'Earth',    'radius_km': 6_371.0,  'teff': None, 'src': 'iau15'},  # volumetric mean
    {'name': 'Jupiter',  'radius_km': 71_492.0, 'teff': None, 'src': 'iau15'},  # equatorial
    {'name': 'the Sun',  'radius_km': R_SUN_KM, 'teff': 5772, 'src': 'iau15'},
    {'name': 'WOH G64',  'radius_km': 1540.0 * R_SUN_KM, 'teff': 3400, 'src': 'ohnaka24'},
]

# ─────────────────────────────────────────────────────────────────────────────
# Rung 2 — sizes SATURATE. Not a theory claim: the five largest ever measured.
# (The Hayashi-limit "1,500 R_sun cap" was checked and is false — it is a
#  temperature line, not a radius. See GATE0.md §9.)
# ─────────────────────────────────────────────────────────────────────────────
BIGGEST = [
    {'name': 'WOH G64 A',       'r_rsun': 1540, 'err': 77,  'teff': 3400, 'where': 'Large Magellanic Cloud'},
    {'name': 'VX Sagittarii',   'r_rsun': 1556, 'err': 110, 'teff': 3300, 'where': 'Milky Way'},
    {'name': 'RSGC1-F01',       'r_rsun': 1530, 'err': 377, 'teff': 3200, 'where': 'Milky Way'},
    {'name': 'RSGC1-F04',       'r_rsun': 1422, 'err': 348, 'teff': 3200, 'where': 'Milky Way'},
    {'name': 'VY Canis Majoris','r_rsun': 1420, 'err': 120, 'teff': 3490, 'where': 'Milky Way'},
]

# ─────────────────────────────────────────────────────────────────────────────
# Rung 3 — the gap. The reel's load-bearing claim.
# ─────────────────────────────────────────────────────────────────────────────
D_PROXIMA_LY = 4.2465

# ─────────────────────────────────────────────────────────────────────────────
# Rung 4 — the real solar neighbourhood. Published catalogue distances and
# positions; converted to 3D here rather than copied from anywhere.
# ─────────────────────────────────────────────────────────────────────────────
NEIGHBOURS = [
    # name, distance ly, RA deg, Dec deg, Teff K
    # Teff are published catalogue values where measured, otherwise the
    # representative value for the star's spectral class. Flagged in NOTES.md:
    # these drive COLOUR only, never a number on screen.
    ('Proxima Centauri',  4.2465, 217.429, -62.679, 3042),
    ('Alpha Centauri',    4.3441, 219.902, -60.834, 5790),
    ("Barnard's Star",    5.9629, 269.452,   4.693, 3134),
    ('Luhman 16',         6.503,  162.328, -53.319, 1350),
    ('WISE 0855-0714',    7.43,   133.786,  -7.244, 285),
    ('Wolf 359',          7.856,  164.120,   7.014, 2800),
    ('Lalande 21185',     8.307,  165.834,  35.970, 3600),
    ('Sirius',            8.659,  101.287, -16.716, 9940),
    ('Luyten 726-8',      8.791,   24.756, -17.950, 2670),
    ('Ross 154',          9.7035, 282.456, -23.836, 3340),
    ('Ross 248',         10.065,  355.482,  44.177, 3200),
    ('Epsilon Eridani',  10.475,   53.233,  -9.458, 5084),
    ('Lacaille 9352',    10.7241, 346.467, -35.853, 3690),
    ('Ross 128',         11.007,  176.937,   0.804, 3192),
    ('WISE 1506+7027',   11.089,  226.650,  70.460, 950),
    ('EZ Aquarii',       11.266,  344.687, -13.873, 3000),
    ('61 Cygni',         11.403,  316.725,  38.749, 4400),
    ('Procyon',          11.462,  114.826,   5.225, 6530),
    ('Struve 2398',      11.525,  269.838,  59.622, 3300),
    ('Groombridge 34',   11.624,    4.595,  44.023, 3600),
    ('DX Cancri',        11.826,  128.564,  26.776, 2840),
    ('Epsilon Indi',     11.867,  330.840, -56.786, 4630),
    ('Tau Ceti',         11.912,   26.017, -15.938, 5344),
    ('GJ 1061',          11.980,   53.996, -44.512, 2950),
    ('YZ Ceti',          12.100,   26.571, -16.993, 3060),
]

# ─────────────────────────────────────────────────────────────────────────────
# Rung 5+ — the wide shots
# ─────────────────────────────────────────────────────────────────────────────
ORION_D_LY, ORION_W_LY = 1344.0, 24.0       # menten07 / apparent extent
MW_DIAM_LY = 100_000.0                       # ~1e5; genuinely uncertain, see NOTES
SUN_GALACTOCENTRIC_LY = 8.178e3 * 3.26156    # gravity19, kpc -> ly
M31_D_LY = 2.537e6


def wavelength_rgb(nm):
    """A single emission line -> sRGB, through the same CIE fits.

    The nebula rung is coloured by the H-alpha line at 656.28 nm, which is the
    actual reason emission nebulae photograph red. Picking "nebula red" from a
    palette would have been a taste decision; this is a measurement.
    """
    cx, cy, cz = _cie(nm)
    n = cx + cy + cz
    X, Y, Z = cx / n, cy / n, cz / n
    r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z
    g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z
    b = 0.0557 * X - 0.2040 * Y + 1.0570 * Z
    m = max(r, g, b)
    out = []
    for v in (r / m, g / m, b / m):
        v = max(0.0, v)
        v = 1.055 * v ** (1 / 2.4) - 0.055 if v > 0.0031308 else 12.92 * v
        out.append(max(0, min(255, round(v * 255))))
    return f'rgb({out[0]}, {out[1]}, {out[2]})'


def galaxy_cloud(rng, n=2600):
    """A four-arm logarithmic spiral, the shape the Milky Way is modelled with.

    DECORATION, AND LABELLED AS SUCH: this is not a measurement of our galaxy
    and no number on screen is derived from it. The one real quantity in this
    rung is where the Sun sits -- R0 = 8.178 kpc, GRAVITY Collaboration 2019 --
    and that is what the marker is pinned to. Seeded, so the render is
    reproducible.
    """
    import math as m
    pts, arms, pitch = [], 4, m.radians(19.0)
    r_max = MW_DIAM_LY / 2
    for i in range(n):
        arm = i % arms
        # pitch 19 deg, not the Milky Way's measured ~12: at 12 the arms wind so
        # tightly they read as concentric rings on a 1080-wide frame. DECORATION,
        # already labelled as such -- no number on screen comes from this cloud.
        r = r_max * (rng.random() ** 0.62)
        th = m.log(max(r, 1.0) / 220.0) / m.tan(pitch) + arm * 2 * m.pi / arms
        th += rng.gauss(0, 0.22) * (1.0 - 0.45 * r / r_max)
        # disc thickness falls off with radius, and the bulge is fat
        z = rng.gauss(0, 320 if r > 0.12 * r_max else 1500)
        pts.append([round(r * m.cos(th), 1), round(r * m.sin(th), 1), round(z, 1)])
    return pts


def nebula_cloud(rng, n=520):
    """A clumpy emission cloud at the Orion Nebula's measured extent.
    Decoration, same caveat as the galaxy: only the SIZE and DISTANCE are real.
    """
    import math as m
    pts, cores = [], [(rng.gauss(0, 0.28), rng.gauss(0, 0.28), rng.gauss(0, 0.18))
                      for _ in range(7)]
    for _ in range(n):
        cx, cy, cz = cores[rng.randrange(len(cores))]
        sp = rng.random() ** 0.5 * 0.42
        th, ph = rng.uniform(0, 2 * m.pi), m.acos(rng.uniform(-1, 1))
        pts.append([round(cx + sp * m.sin(ph) * m.cos(th), 4),
                    round(cy + sp * m.sin(ph) * m.sin(th), 4),
                    round(cz + sp * m.cos(ph) * 0.6, 4)])
    return pts


def main() -> int:
    out = {'constants': {'ly_km': LY_KM, 'au_km': AU_KM, 'r_sun_km': R_SUN_KM},
           'sources': S}

    # ── ladder ──────────────────────────────────────────────────────────────
    print('── the size ladder ' + '─' * 52)
    ladder = []
    for i, s in enumerate(SIZES):
        step = s['radius_km'] / SIZES[i - 1]['radius_km'] if i else None
        t = s.get('teff')
        ladder.append({**s, 'radius_rsun': s['radius_km'] / R_SUN_KM,
                       'radius_au': s['radius_km'] / AU_KM, 'step': step,
                       'rgb': blackbody_rgb(t) if t else None,
                       'flux': surface_flux_rel(t) if t else None})
        print(f"  {s['name']:<10} r = {s['radius_km']:>18,.0f} km"
              + (f'   x{step:,.1f} on the one before' if step else ''))

    # WOH G64 dropped where the Sun is: which orbits does it swallow?
    woh_au = SIZES[3]['radius_km'] / AU_KM
    print(f"\n  WOH G64 put where the Sun is reaches {woh_au:.2f} AU —"
          f" past Jupiter ({5.204} AU), short of Saturn ({9.583} AU)")
    out['woh_reaches_au'] = woh_au

    # ── saturation ──────────────────────────────────────────────────────────
    print('\n── sizes saturate (measured, not theorised) ' + '─' * 27)
    rs = [b['r_rsun'] for b in BIGGEST]
    spread = (max(rs) - min(rs)) / max(rs)
    for b in BIGGEST:
        print(f"  {b['name']:<20} {b['r_rsun']:>5,} +/- {b['err']:<4} R_sun   {b['where']}")
    print(f"  -> largest {max(rs):,}, smallest {min(rs):,}, spread {spread * 100:.1f}%")
    for b in BIGGEST:
        b['rgb'] = blackbody_rgb(b['teff'])
        b['flux'] = surface_flux_rel(b['teff'])
    out['biggest'] = BIGGEST
    out['saturation_spread'] = spread

    # ── the break ───────────────────────────────────────────────────────────
    gap_km = D_PROXIMA_LY * LY_KM
    big_d = 2 * SIZES[3]['radius_km']
    sun_d = 2 * R_SUN_KM
    fits = gap_km / big_d
    print('\n── the break ' + '─' * 58)
    print(f'  gap Sun -> Proxima      {gap_km:>22,.0f} km  ({D_PROXIMA_LY} ly)')
    print(f'  diameter of WOH G64     {big_d:>22,.0f} km')
    print(f'  it fits in the gap      {fits:>22,.1f} x')
    print(f'  the Sun fits            {gap_km / sun_d:>22,.1f} x')
    out['gap'] = {'ly': D_PROXIMA_LY, 'km': gap_km, 'biggest_diam_km': big_d,
                  'fits': fits, 'sun_diam_km': sun_d, 'sun_fits': gap_km / sun_d}

    # ── neighbourhood, RA/Dec/d -> equatorial cartesian in light-years ──────
    print('\n── solar neighbourhood ' + '─' * 48)
    nb = []
    for name, d, ra, dec, teff in NEIGHBOURS:
        a, e = math.radians(ra), math.radians(dec)
        # below ~1800 K a body emits essentially nothing in the visible band --
        # several of our nearest neighbours are literally invisible to the eye
        nb.append({'name': name, 'ly': d, 'teff': teff,
                   'x': d * math.cos(e) * math.cos(a),
                   'y': d * math.cos(e) * math.sin(a),
                   'z': d * math.sin(e),
                   'rgb': blackbody_rgb(max(teff, 1800)),
                   'flux': surface_flux_rel(teff),
                   'dark': teff < 1800})
    dark = [n['name'] for n in nb if n['dark']]
    print(f'  {len(nb)} systems within {max(n["ly"] for n in nb):.1f} ly')
    print(f'  {len(dark)} of them emit essentially no visible light: {", ".join(dark)}')
    out['n_dark'] = len(dark)
    dens = len(nb) / (4 / 3 * math.pi * max(n['ly'] for n in nb) ** 3)
    print(f'  density {dens * 1000:.2f} systems per 1000 cubic light-years')
    out['neighbours'] = nb
    out['neighbour_density_per_kly3'] = dens * 1000

    # ── the wide shots ──────────────────────────────────────────────────────
    import random
    rng = random.Random(70)
    out['galaxy'] = galaxy_cloud(rng)
    out['nebula'] = nebula_cloud(rng)
    out['halpha_nm'] = 656.28
    out['halpha_rgb'] = wavelength_rgb(656.28)
    print(f"\n  H-alpha 656.28 nm -> {out['halpha_rgb']}  (why emission nebulae are red)")
    print(f"  galaxy cloud {len(out['galaxy'])} pts, nebula cloud {len(out['nebula'])} pts"
          f" — DECORATION, no on-screen number comes from them")
    out['wide'] = {'orion_d_ly': ORION_D_LY, 'orion_w_ly': ORION_W_LY,
                   'mw_diam_ly': MW_DIAM_LY, 'sun_r0_ly': SUN_GALACTOCENTRIC_LY,
                   'm31_d_ly': M31_D_LY}
    print(f'\n── wide ' + '─' * 63)
    print(f'  Orion Nebula {ORION_W_LY:.0f} ly across at {ORION_D_LY:,.0f} ly')
    print(f'  Milky Way ~{MW_DIAM_LY:,.0f} ly across; Sun {SUN_GALACTOCENTRIC_LY:,.0f} ly out')
    print(f'  Andromeda {M31_D_LY:,.0f} ly')
    out['gaps_across_orion'] = ORION_W_LY / D_PROXIMA_LY
    out['gap_pct_of_galaxy'] = D_PROXIMA_LY / MW_DIAM_LY * 100
    print(f'  the Sun-Proxima gap fits across the Orion Nebula '
          f'{out["gaps_across_orion"]:.2f} times')
    print(f'  gap to Proxima as a fraction of the galaxy: '
          f'{out["gap_pct_of_galaxy"]:.4f}%')

    # ── the claims. If one of these is false the reel is wrong. ─────────────
    assert 18_000 < fits < 19_500, f'headline claim moved: {fits}'
    assert spread < 0.10, f'"all within 10%" is false: {spread:.3f}'
    assert 5.204 < woh_au < 9.583, 'the "past Jupiter, short of Saturn" beat is wrong'
    assert ladder[1]['step'] > 10 and ladder[2]['step'] > 9, 'early rungs are not ~10x'
    assert ladder[3]['step'] > 1000, 'the Sun -> hypergiant jump is not the big one'
    assert nb[0]['name'] == 'Proxima Centauri' and abs(nb[0]['ly'] - D_PROXIMA_LY) < 1e-9
    assert out['halpha_rgb'].startswith('rgb('), 'nebula colour must be computed'
    assert max(abs(c) for pt in out['galaxy'] for c in pt[:2]) <= MW_DIAM_LY / 2 + 1, \
        'galaxy cloud escapes the disc radius it is drawn at'
    assert fits > ladder[3]['step'], (
        'THE SPINE: the gap must out-scale the biggest size jump, or the reel has no point')

    out['ladder'] = ladder
    p = pathlib.Path(__file__).with_name('emptiness_data.json')
    p.write_text(json.dumps(out, indent=1))
    print(f'\nall claims asserted. wrote {p.name}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
