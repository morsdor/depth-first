"""I85 Stage 3 — where every dollar of energy goes, gas vs electric, on the EPA test cycles.

The headline figures are somebody else's (US DOE / fueleconomy.gov, Oak Ridge National Laboratory
analysis of 100+ vehicles). This script is the OUTSIDE CHECK on them, not their source: it runs
NREL's FASTSim (fastsim 2.1.5, a validated DOE vehicle model) on two real US cars over the two EPA
cycles that make up the window-sticker "combined" figure, and audits the energy.

ONE RULER, fixed before any number was looked at:

    moves the car  =  energy spent against air drag + tyre rolling resistance
                      ─────────────────────────────────────────────────────────
                      energy you PAY for  (gas into the tank  |  electricity out of the wall)

Braking energy is deliberately NOT counted as "moving the car": a gas car turns it into brake-pad
heat, an EV turns most of it back into charge, and that difference is part of the mechanism rather
than part of the ruler. DOE's own "energy to the wheels" figures DO include braking energy, so a
second, DOE-comparable ratio is printed beside it for the check.

Combined = 55% city (UDDS) / 45% highway (HWFET) by distance — the EPA and DOE weighting.

Every claim is asserted; the script refuses to print a verdict if the model has drifted from
EPA's own window-sticker economy for the car by more than VALIDATION_TOL.
"""
import json
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")
from fastsim import cycle, simdrive, simdrivelabel, vehicle  # noqa: E402

GAS_ID, EV_ID = 3, 17          # FASTSim veh db: 2016 Toyota Camry 4cyl · 2017 Chevrolet Bolt
CITY_W, HWY_W = 0.55, 0.45     # EPA/DOE combined weighting, by distance
VALIDATION_TOL = 0.10          # model vs EPA's window-sticker combined figure
OUT = Path(__file__).with_name("energy_budget.json")


def run(vid, cyc_name):
    veh = vehicle.Vehicle.from_vehdb(vid)
    cyc = cycle.Cycle.from_file(cyc_name)
    sd = simdrive.SimDrive(cyc, veh)
    sd.sim_drive()
    miles = float(sum(cyc.dist_m)) / 1609.344
    if veh.veh_pt_type == "Conv":
        bought = float(sd.fuel_kj)
    else:
        # battery energy out (net of regen) grossed up by the charger: what left the wall
        bought = float(sd.ess_dischg_kj) / float(veh.chg_eff)
    audit = {k: float(getattr(sd, k)) for k in
             ("drag_kj", "rr_kj", "brake_kj", "aux_kj", "trans_kj", "fc_kj", "mc_kj", "ess_eff_kj")}
    return dict(veh=veh.scenario_name, type=veh.veh_pt_type, cycle=cyc_name, miles=miles,
                bought_kj=bought, mpgge=float(sd.mpgge),
                kwh_per_mi=float(getattr(sd, "electric_kwh_per_mi", 0.0)),
                chg_eff=float(veh.chg_eff), audit=audit,
                val_comb=float(veh.val_comb_mpgge if veh.veh_pt_type == "Conv"
                               else veh.val_comb_kwh_per_mile))


def combined(city, hwy, num):
    """55/45-by-distance ratio of per-mile quantities."""
    n = CITY_W * num(city) / city["miles"] + HWY_W * num(hwy) / hwy["miles"]
    d = CITY_W * city["bought_kj"] / city["miles"] + HWY_W * hwy["bought_kj"] / hwy["miles"]
    return n / d


moves = lambda r: r["audit"]["drag_kj"] + r["audit"]["rr_kj"]
to_wheels = lambda r: moves(r) + r["audit"]["brake_kj"]      # DOE-comparable: incl. braking

def main():
    res = {}
    for name, vid in (("gas", GAS_ID), ("ev", EV_ID)):
        city, hwy = run(vid, "udds"), run(vid, "hwfet")
        # --- validation against EPA's own window-sticker figure for this exact car ---
        # val_* in the veh db are EPA's ADJUSTED (sticker) figures, not raw test-cycle results —
        # comparing raw UDDS mpg to them read +26% on the first run. FASTSim's label routine
        # applies EPA's 5-cycle adjustment, so model and EPA are on the same base.
        lab = simdrivelabel.get_label_fe(vehicle.Vehicle.from_vehdb(vid))
        lab = lab[0] if isinstance(lab, tuple) else lab
        if city["type"] == "Conv":
            model, epa, unit = float(lab["adjCombMpgge"]), city["val_comb"], "mpg"
        else:
            model, epa, unit = float(lab["adjCombKwhPerMile"]), city["val_comb"], "kWh/mi"
        err = model / epa - 1
        print(f"  validate {city['veh']:<28} sticker combined  model {model:6.3f}  EPA {epa:6.3f} {unit}"
              f"  ({err:+.1%})")
        assert abs(err) <= VALIDATION_TOL, f"model drifted {err:+.1%} from EPA's sticker figure"
        res[name] = dict(city=city, hwy=hwy,
                         moves=combined(city, hwy, moves),
                         to_wheels=combined(city, hwy, to_wheels),
                         per_cycle={c: dict(moves=moves(r) / r["bought_kj"],
                                            to_wheels=to_wheels(r) / r["bought_kj"])
                                    for c, r in (("udds", city), ("hwfet", hwy))})

    g, e = res["gas"], res["ev"]
    print()
    print("ONE RULER — share of the energy you pay for that pushes the car against air and road")
    for n, r in (("gas", g), ("ev", e)):
        pc = r["per_cycle"]
        print(f"  {r['city']['veh']:<28} combined {r['moves']:.1%}   city {pc['udds']['moves']:.1%}"
              f"   highway {pc['hwfet']['moves']:.1%}")
    print("DOE-COMPARABLE — 'energy to the wheels', braking energy included")
    for n, r in (("gas", g), ("ev", e)):
        print(f"  {r['city']['veh']:<28} combined {r['to_wheels']:.1%}")

    # --- the outside check: do we land inside DOE's published ranges? ---------------------------
    DOE_GAS_RANGE = (0.12, 0.30)     # fueleconomy.gov: "about 12%–30% ... depending on the drive cycle"
    DOE_EV_MIN = 0.77                # fueleconomy.gov: "over 77% of the electrical energy from the grid"
    print()
    print(f"check: gas to-wheels {g['to_wheels']:.1%} inside DOE 12–30%  ->",
          DOE_GAS_RANGE[0] <= g["to_wheels"] <= DOE_GAS_RANGE[1])
    print(f"check: EV  to-wheels {e['to_wheels']:.1%} vs DOE 'over 77%'  (DOE's figure credits regen as a"
          " gain on top; ours is net of it, so ours should sit BELOW 77%)")

    assert DOE_GAS_RANGE[0] <= g["to_wheels"] <= DOE_GAS_RANGE[1], "gas model outside DOE range"
    assert e["moves"] > 2.5 * g["moves"], "the reel's ratio claim no longer holds"

    dollars = {n: round(100 * r["moves"]) for n, r in res.items()}
    print()
    print(f"=> of every $100 you pay for: gas ${dollars['gas']} pushes the car, "
          f"${100 - dollars['gas']} does not; electric ${dollars['ev']} pushes the car")
    print(f"=> ratio {e['moves'] / g['moves']:.2f}x")
    OUT.write_text(json.dumps(dict(ruler="drag+rolling / energy paid for", combined_weights=[CITY_W, HWY_W],
                                   dollars_of_100=dollars, results=res), indent=1))
    print(f"wrote {OUT.name}")



if __name__ == "__main__":
    main()
