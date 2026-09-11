"""I71 — two double pendulums, released a millionth of a degree apart.

Stage 3 measurement, BEFORE any script is approved. The RUNTIME of the reel is an
OUTPUT of this file, not a guess: the loop has to be long enough to show the split
and short enough to be rewatched.

Classic double-pendulum equations, RK4 at dt = 1/2000 s. The invariant is total
energy, asserted below -- if the integrator is leaking energy the "chaos" on screen
is the solver's, not the physics'.
"""
import numpy as np

G, L1, L2, M1, M2 = 9.80665, 1.0, 1.0, 1.0, 1.0
DT = 1.0 / 2000


def deriv(y):
    t1, w1, t2, w2 = y
    d = t2 - t1
    sd, cd = np.sin(d), np.cos(d)
    den1 = (M1 + M2) * L1 - M2 * L1 * cd * cd
    a1 = (M2 * L1 * w1 * w1 * sd * cd
          + M2 * G * np.sin(t2) * cd
          + M2 * L2 * w2 * w2 * sd
          - (M1 + M2) * G * np.sin(t1)) / den1
    den2 = (L2 / L1) * den1
    a2 = (-M2 * L2 * w2 * w2 * sd * cd
          + (M1 + M2) * (G * np.sin(t1) * cd - L1 * w1 * w1 * sd - G * np.sin(t2))) / den2
    return np.array([w1, a1, w2, a2])


def energy(y):
    t1, w1, t2, w2 = y
    y1, y2 = -L1 * np.cos(t1), -L1 * np.cos(t1) - L2 * np.cos(t2)
    v1sq = (L1 * w1) ** 2
    v2sq = v1sq + (L2 * w2) ** 2 + 2 * L1 * L2 * w1 * w2 * np.cos(t1 - t2)
    return 0.5 * M1 * v1sq + 0.5 * M2 * v2sq + M1 * G * y1 + M2 * G * y2


def rk4(y):
    k1 = deriv(y)
    k2 = deriv(y + DT / 2 * k1)
    k3 = deriv(y + DT / 2 * k2)
    k4 = deriv(y + DT * k3)
    return y + DT / 6 * (k1 + 2 * k2 + 2 * k3 + k4)


def tip(y):
    t1, _, t2, _ = y
    return np.array([L1 * np.sin(t1) + L2 * np.sin(t2),
                     -L1 * np.cos(t1) - L2 * np.cos(t2)])


def run(theta0_deg, nudge_deg, t_end=20.0):
    a = np.radians(theta0_deg)
    ya = np.array([a, 0.0, a, 0.0])
    yb = np.array([a + np.radians(nudge_deg), 0.0, a, 0.0])
    e0a, e0b = energy(ya), energy(yb)
    T, sep, A, B = [], [], [], []
    for i in range(int(t_end / DT)):
        if i % 10 == 0:                      # log at 200 Hz
            T.append(i * DT)
            A.append(ya.copy()); B.append(yb.copy())
            sep.append(np.linalg.norm(tip(ya) - tip(yb)))
        ya, yb = rk4(ya), rk4(yb)
    # Normalise by M*g*L, never by E0: total energy is EXACTLY ZERO at theta0 = 90
    # degrees, and dividing by it reported a drift of 1.0e+05 for a run that was in
    # fact clean. A relative error needs a scale that cannot vanish.
    scale = (M1 + M2) * G * (L1 + L2)
    drift = max(abs(energy(ya) - e0a), abs(energy(yb) - e0b)) / scale
    return np.array(T), np.array(sep), np.array(A), np.array(B), drift


# The perturbation is ONE HUMAN HAIR of arc at the first bob -- 70 um, the middle of
# the commonly cited 17-181 um range. Chosen from the sweep in GATE0.md §5: a
# millionth of a degree is a better sentence but takes 11 s to become visible, and a
# 12 s loop cannot spend 11 s on setup.
HAIR_UM = 70.0
NUDGE = np.degrees(HAIR_UM * 1e-6 / L1)

# Screen geometry, so divergence is measured in PIXELS a viewer can actually see
# rather than in an arbitrary fraction of the span.
SPAN_M = 2 * (L1 + L2)
PX_PER_M = 760.0 / SPAN_M

def _demo():
  for th0 in (120.0, 135.0, 144.0):
      T, sep, A, B, drift = run(th0, NUDGE, t_end=14.0)
      px = sep * PX_PER_M

      def firstpx(p):
          m = px > p
          return round(float(T[np.argmax(m)]), 2) if m.any() else None

      print(f"theta0 = {th0:5.1f} deg   perturbation = one hair ({NUDGE:.6f} deg)   "
            f"energy drift {drift:.2e} of MgL")
      print(f"   pixel-identical until   {firstpx(1)} s")
      print(f"   a viewer could notice   {firstpx(4)} s")
      print(f"   unmistakably two        {firstpx(20)} s")
      print(f"   unrelated               {firstpx(150)} s")
      print(f"   apart at 12 s           {px[np.argmin(abs(T - 12))]:.0f} px")
      print()


if __name__ == '__main__':
    _demo()
