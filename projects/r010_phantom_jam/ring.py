"""
I65 — the phantom traffic jam.  Stage 3 measurement, run BEFORE any script is approved.

Optimal Velocity car-following model (Bando et al., Phys Rev E 51, 1035, 1995) on the
geometry of the real experiment: 22 cars, a 230 m ring, drivers told 30 km/h and nothing else.

  Sugiyama et al., New J. Phys. 10 (2008) 033001
    -> a jam forms with NO bottleneck and travels BACKWARDS at about 20 km/h,
       the same speed as shockwave jams measured on real highways.
  Stern et al., Transp Res C 89 (2018) 205-221
    -> on the same ring, ONE car of 22 running FollowerStopper dissipates the wave.

WHAT IS CALIBRATED (3 parameters against 3 measured properties of the experiment):
    h_c, w, a   <-  target speed 30 km/h, free-flow escape ~40 km/h, wave speed ~-20 km/h

WHAT IS NOT CALIBRATED, AND IS THEREFORE WHAT THE REEL MAY CLAIM:
    1. that a jam forms at all, from a 10 cm offset, with no obstacle
    2. that it persists as a localised structure instead of washing out
    3. that below a critical density it does NOT happen  (the falsification control)
    4. that one controlled car in twenty-two destroys it
"""
import numpy as np

L_RING, N_CARS, V_TARGET = 230.0, 22, 30 / 3.6
H_STAR = L_RING / N_CARS
H_C, W_OVM, A_SENS = 9.00, 2.50, 2.20          # fitted; see module docstring
DT, T_END = 0.01, 420.0

_T0 = np.tanh(H_C / W_OVM)
V_MAX = 2 * V_TARGET / (np.tanh((H_STAR - H_C) / W_OVM) + _T0)

def V(h):
    return (V_MAX / 2) * (np.tanh((h - H_C) / W_OVM) + _T0)

def Vprime(h):
    return (V_MAX / 2) * (1 - np.tanh((h - H_C) / W_OVM) ** 2) / W_OVM

def headways(x):
    """Centre-to-centre distance to the car ahead, ON A RING.
    np.diff on the raw array is wrong: once any car wraps past L_RING the array is no
    longer sorted, and that artefact alone manufactures a 'jam' at every density."""
    return (np.roll(x, -1) - x) % L_RING

def follower_stopper(gap, dv, v_lead, U):
    """Stern et al. 2018 eq. 3-5.  dv = v_lead - v_ego."""
    dvm = min(dv, 0.0)
    d, dx0 = (1.5, 1.0, 0.5), (4.5, 5.25, 6.0)
    dx = [dx0[k] + dvm * dvm / (2 * d[k]) for k in range(3)]
    vl = min(max(v_lead, 0.0), U)
    if gap <= dx[0]:                      return 0.0
    if gap <= dx[1]:                      return vl * (gap - dx[0]) / (dx[1] - dx[0])
    if gap <= dx[2]:                      return vl + (U - vl) * (gap - dx[1]) / (dx[2] - dx[1])
    return U

def simulate(n=N_CARS, control_car=None, t_end=T_END, noise=0.0, seed=7,
             control_from=0.0, u_factor=1.0):
    """noise = steady-state speed jitter of a HUMAN driver in km/h (NOT an acceleration).

    Without it one controlled car restores PERFECT uniformity and the fix scores 100%,
    which is an artefact of a noiseless world, not a result. Real drivers fidget.

    Scaling matters: white noise added to acceleration must carry 1/sqrt(dt), or the
    jitter silently depends on the timestep. For the OU process dv = -a*v dt + s*dW the
    steady-state speed std is s/sqrt(2a), so we invert that to hit the requested jitter."""
    rng = np.random.default_rng(seed)
    sigma = (noise / 3.6) * np.sqrt(2 * A_SENS) if noise else 0.0
    h0 = L_RING / n
    x = np.arange(n) * h0
    x[0] += 0.10                          # ONE 10 cm offset. That is the entire cause.
    v = np.full(n, V(h0))
    U = V(h0) * u_factor
    keep = int(0.10 / DT)
    X, Vh, T = [], [], []
    for s in range(int(t_end / DT)):
        h = headways(x)
        acc = A_SENS * (V(h) - v)
        if sigma:
            acc = acc + rng.normal(0.0, sigma / np.sqrt(DT), n)
        if control_car is not None and s * DT >= control_from:
            i, lead = control_car, (control_car + 1) % n
            cmd = follower_stopper(h[i], v[lead] - v[i], v[lead], U)
            acc[i] = np.clip((cmd - v[i]) / 0.4, -3.0, 1.5)
        v = np.maximum(v + acc * DT, 0.0)
        x = (x + v * DT) % L_RING
        if s % keep == 0:
            X.append(x.copy()); Vh.append(v.copy()); T.append(s * DT)
    return np.array(T), np.array(X), np.array(Vh)

def wave_speed(T, X, Vv, t_from=240.0):
    """Phase velocity of the fundamental ring mode. Negative = backwards, against the cars."""
    m = T >= t_from
    T, X, Vv = T[m], X[m], Vv[m]
    k = 2 * np.pi / L_RING
    z = (Vv * np.exp(1j * k * X)).sum(axis=1)
    if np.abs(z).mean() < 1e-3:
        return 0.0
    return np.polyfit(T, np.unwrap(np.angle(z)), 1)[0] / k

def kmh(a):  return a * 3.6
def mph(a):  return a * 2.236936          # m/s -> mph
def feet(m): return m * 3.280840          # metres -> feet
def inch(m): return m * 39.37008          # metres -> inches

if __name__ == "__main__":
    print(f"CALIBRATION   V(h*)={kmh(V(H_STAR)):.2f} km/h   ceiling={kmh(V(1e3)):.2f} km/h   "
          f"V'(h*)={Vprime(H_STAR):.3f} vs a/2={A_SENS/2:.3f}  ->  "
          f"{'UNSTABLE' if Vprime(H_STAR) > A_SENS/2 else 'stable'}\n")

    T, X, Vv = simulate()
    tail = T >= T[-1] - 60
    vmin_t = Vv.min(axis=1)
    formed = T[np.argmax(vmin_t < 0.5 * V_TARGET)]
    c = wave_speed(T, X, Vv)
    print("RUN 1 — 22 cars, no bottleneck, one 10 cm initial offset")
    print(f"   jam forms at            {formed:6.0f} s")
    print(f"   slowest car (last 60 s) {kmh(Vv[tail].min()):6.2f} km/h")
    print(f"   fastest car (last 60 s) {kmh(Vv[tail].max()):6.2f} km/h")
    print(f"   speed spread (std dev)  {kmh(Vv[tail].std()):6.2f} km/h")
    print(f"   WAVE SPEED              {kmh(c):+6.2f} km/h  = {mph(c):+6.2f} mph"
          f"     experiment: about -20 km/h = -12 mph")
    print(f"   laps completed by a car {T[-1]*V_TARGET/L_RING:6.1f}   wave laps "
          f"{abs(c)*T[-1]/L_RING:4.1f} the other way\n")

    Tc, Xc, Vc = simulate(control_car=11)
    tc = Tc >= Tc[-1] - 60
    print("RUN 2 — identical, except ONE car of 22 runs FollowerStopper")
    print(f"   slowest car (last 60 s) {kmh(Vc[tc].min()):6.2f} km/h")
    print(f"   speed spread (std dev)  {kmh(Vc[tc].std()):6.2f} km/h")
    print(f"   wave speed              {kmh(wave_speed(Tc, Xc, Vc)):+6.2f} km/h")
    print(f"   SPEED SPREAD CUT BY     {100*(1-Vc[tc].std()/Vv[tail].std()):5.1f} %\n")

    print("CONTROL — density sweep on the SAME ring. If everything jams, the model is junk.")
    print("    cars  headway   V'(h*)   theory      spread    verdict")
    for n in (8, 12, 14, 16, 17, 18, 20, 22, 26, 30):
        h0 = L_RING / n
        _, _, Vn = simulate(n=n, t_end=300.0)
        sd = kmh(Vn[-600:].std())
        print(f"    {n:4d}  {h0:6.2f} m  {Vprime(h0):6.3f}  {'unstable' if Vprime(h0) > A_SENS/2 else '  stable':>8}"
              f"  {sd:8.2f}    {'JAM' if sd > 1.0 else 'smooth'}")
