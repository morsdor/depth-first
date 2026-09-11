import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { FPS, Fade, REEL_H, REEL_W, ReelGround, SAFE_BOTTOM, ease, t } from './lib/chrome';
import { FIX, FORM, type JamFrame, META } from './data/phantomJam';

/**
 * r010 · I65 — a traffic jam with no cause.
 *
 * ── The spine ───────────────────────────────────────────────────────────────
 * Everyone has crawled for ten minutes and then found nothing there. The reel
 * shows why, on the real experiment: 22 cars, 755 feet of road, one instruction
 * and no obstacle (Sugiyama et al., New J. Phys. 10 (2008) 033001). A jam
 * condenses out of a four-inch offset, and then the part the genre almost never
 * carries — it travels BACKWARDS through the traffic, and one car in twenty-two
 * can break it up (Stern et al., Transp. Res. C 89 (2018) 205-221).
 *
 * NOTHING about how the cars move is authored. Every position on screen comes
 * out of data/phantomJam.ts, which emit_ts.py refuses to write if any claim the
 * reel makes on screen stops being true of the run.
 *
 * ── Why the road bends instead of cutting ───────────────────────────────────
 * A ring is the only way to run traffic forever with no bottleneck to blame, and
 * a straight highway is the only thing the viewer has actually driven on. The
 * reel needs both and a cut between them would break the claim that it is the
 * same road, so ONE parameter — `bend` — carries the geometry continuously:
 *
 *     bend = 0   a straight road running away from the camera
 *     bend = 1   a closed ring of exactly the same length
 *
 * Every car and every metre of asphalt is placed by `pathPoint(s, bend)`, so the
 * unroll at 25 s is a real geometric morph rather than a dissolve between two
 * scenes. This is the shot that only exists because the scene is 3D, which is
 * the test CLAUDE.md sets for spending the third dimension at all.
 *
 * ── Why the camera never moves ──────────────────────────────────────────────
 * <ThreeCanvas> takes its camera as a prop. Animating it from inside means
 * fighting the canvas, so the camera is fixed and a wrapping <group> is what
 * moves: driver's eye at road level for the beats the viewer recognises, rising
 * to near-top-down for the beat that carries the claim. A wave travelling
 * backwards reads from above and nowhere else, so legibility, not drama, picks
 * that angle.
 */
export const DURATION_SECONDS = 46;

/** Beat boundaries, seconds. Non-negotiable 5 — read -> animate -> HOLD. */
const B = {
  hook: [0.0, 3.2],
  setup: [3.2, 8.0],
  form: [8.0, 17.0],
  reveal: [17.0, 25.0],
  you: [25.0, 31.0],
  fix: [31.0, 40.0],
  close: [40.0, 46.0],
} as const;

/** The car the viewer rides. Car 15 enters and leaves the jam every ~9 s of the
 *  run, so the hook is a genuine fragment of the pass-through beat 5 explains. */
const YOU_CAR = 15;

/** Simulation windows, seconds. The clock on screen states the compression. */
const HOOK_SIM = [128, 134] as const;
const YOU_SIM = [122, 134] as const;

const MPH = 2.236936;
const L = META.ringM;

// ── palette. Brand tokens only; brand:check reads them out of tokens.ts ──────
const INK = '#040E1F';
const BONE = '#E8E6E1';
const ASH = '#81A2C4';
const GRAPHITE = '#274064';
const SLATE = '#0E213E';
const ACCENT = '#51A4FF'; // DOMAIN_ACCENT.languages — content_backlog.md §3
const AMBER = '#FFB020'; // BRAND ANCHOR — never two in one frame

const FOV = 40;
/**
 * CAM_Z is set by the RING'S WIDTH, not its height. The first cut used 130, which
 * gives 95 m of visible height — comfortably more than the 73 m ring — and the ring
 * still burst out of frame, because a 9:16 frame is only 0.5625 as wide as it is
 * tall. The binding constraint is the 810 px safe width, so:
 *   worldWidth = 2 * CAM_Z * tan(FOV/2) * (1080/1920)  >=  73.2 * 1080/760
 */
const CAM_Z = 312;
/** Metres per screen pixel at the scene plane — everything below is stated in px. */
const M_PER_PX = (2 * CAM_Z * Math.tan(((FOV / 2) * Math.PI) / 180) * (REEL_W / REEL_H)) / REEL_W;
const RING_LIFT = 60 * M_PER_PX; // centre the ring on the safe area, not the raw frame
/**
 * The frame is 1080 px wide but only x 60..870 is usable — the right-hand strip is
 * Instagram's like/comment/share rail (non-negotiable 1). Centred on the raw frame
 * the ring ran to x = 890 and its right edge sat under the icons, so the whole scene
 * shifts left onto the safe centre at x = 465.
 * CAM_Z is then set so the ring PLUS its outside jam marker clears the rail: the
 * marker sits 3.4 m beyond the asphalt, so the widest thing on screen is 80 m, not
 * the 73 m ring. Measured at 276 it ran to x = 880 and the marker — the single most
 * important element in the reel — was under the icons.
 */
const SAFE_SHIFT_M = -62 * M_PER_PX; // measured: centred on 465, width 795 px
const ROAD_HALF_W = 3.6; // metres either side — the experiment ran ONE lane

/**
 * Colour ramps by SPEED, and stopped is the bright end.
 *
 * The first cut ramped stopped -> GRAPHITE, which is nearly the colour of the road:
 * the jam rendered as an absence, a dark gap in a ring of blue, and the one thing
 * the whole reel is about was the hardest thing on screen to see. Stopped cars are
 * now bone and moving cars accent, so the jam is a bright clot that the eye finds
 * before any label points at it.
 */
const C_SLOW = new THREE.Color(BONE);
const C_FAST = new THREE.Color(ACCENT);

const secs = (frame: number) => frame / FPS;
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** Shortest signed distance from a to b around a ring of length L. */
const wrapDelta = (a: number, b: number) => ((b - a + L * 1.5) % L) - L / 2;

/**
 * The road, as one continuous family of shapes.
 *
 * `s` is metres along the centreline, measured from the middle of the visible
 * road, so s runs -L/2 .. +L/2. At bend -> 0 the arc radius runs to infinity and
 * this degenerates to a straight line down -Z, which is why the guard is on
 * `bend` and not on the radius.
 */
const pathPoint = (s: number, bend: number): [number, number] => {
  if (bend < 1e-3) return [0, -s];
  const R = L / (2 * Math.PI * bend);
  const th = s / R;
  const thm = Math.PI * bend;
  // Centre the arc on the origin, or the ring drifts off frame as it closes.
  const xOff = R * (1 - Math.sin(thm) / thm);
  return [R * (1 - Math.cos(th)) - xOff, -R * Math.sin(th)];
};

const tangentAt = (s: number, bend: number): [number, number] => {
  const d = 0.4;
  const [x0, z0] = pathPoint(s - d, bend);
  const [x1, z1] = pathPoint(s + d, bend);
  const dx = x1 - x0;
  const dz = z1 - z0;
  const n = Math.hypot(dx, dz) || 1;
  return [dx / n, dz / n];
};

/** Linear-in-time sample of a dumped run, with positions interpolated AROUND
 *  the ring — a naive lerp teleports a car backwards every time it wraps. */
const sampleRun = (run: JamFrame[], simT: number) => {
  const raw = simT / META.sampleS;
  const i = Math.max(0, Math.min(run.length - 1, Math.floor(raw)));
  const j = Math.min(run.length - 1, i + 1);
  const u = Math.max(0, Math.min(1, raw - i));
  const a = run[i];
  const b = run[j];
  const x = a.x.map((ax, k) => (ax + wrapDelta(ax, b.x[k]) * u + L) % L);
  const v = a.v.map((av, k) => lerp(av, b.v[k], u));
  let jam: [number, number] | null = null;
  if (a.jam && b.jam) {
    jam = [
      (a.jam[0] + wrapDelta(a.jam[0], b.jam[0]) * u + L) % L,
      lerp(a.jam[1], b.jam[1], u),
    ];
  } else if (a.jam) {
    jam = a.jam;
  }
  return { x, v, jam };
};

/** Which run is playing, where it is, and how the road is shaped — one place,
 *  so the 3D scene and the DOM overlays can never disagree about the frame. */
const useStage = () => {
  const s = secs(useCurrentFrame());

  /**
   * LINEAR, deliberately — no easing.
   *
   * Simulation time was first interpolated with the brand ease, which silently
   * varies the playback rate inside every beat: at 13.3 s the clock read 1:35
   * where a true x12 would be 1:05. The clock states a rate on screen, so the rate
   * has to be constant or the clock is a false statement. Easing belongs on the
   * camera, never on the physics.
   */
  const span = (b: readonly [number, number], from: number, to: number) =>
    interpolate(s, [b[0], b[1]], [from, to], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  let run: JamFrame[] = FORM;
  let simT = 0;
  let clock = 0; // seconds of simulation, for the on-screen clock
  let rate = 1;

  if (s < B.setup[0]) {
    simT = span(B.hook, HOOK_SIM[0], HOOK_SIM[1]);
    rate = (HOOK_SIM[1] - HOOK_SIM[0]) / (B.hook[1] - B.hook[0]);
  } else if (s < B.form[0]) {
    simT = span(B.setup, 0, 4);
    rate = 1;
  } else if (s < B.reveal[0]) {
    simT = span(B.form, 0, 110);
    rate = 110 / (B.form[1] - B.form[0]);
  } else if (s < B.you[0]) {
    simT = span(B.reveal, 110, 150);
    rate = 40 / (B.reveal[1] - B.reveal[0]);
  } else if (s < B.fix[0]) {
    simT = span(B.you, YOU_SIM[0], YOU_SIM[1]);
    rate = (YOU_SIM[1] - YOU_SIM[0]) / (B.you[1] - B.you[0]);
  } else if (s < B.close[0]) {
    run = FIX;
    simT = span(B.fix, 0, 130);
    rate = 130 / (B.fix[1] - B.fix[0]);
  } else {
    run = FIX;
    simT = span(B.close, 130, 160);
    rate = 30 / (B.close[1] - B.close[0]);
  }
  clock = simT;

  const frame = sampleRun(run, simT);

  // bend: straight for the beats the viewer recognises, closed for the rest.
  const bend =
    s < B.setup[0]
      ? 0
      : s < B.form[0]
        ? interpolate(s, [B.setup[0] + 0.6, B.setup[1] - 1.6], [0, 1], ease)
        : s < B.you[0]
          ? 1
          : s < B.fix[0]
            ? interpolate(s, [B.you[0], B.you[0] + 1.6], [1, 0], ease)
            : s < B.close[0]
              ? interpolate(s, [B.fix[0], B.fix[0] + 1.6], [0, 1], ease)
              : 1;

  // The road unrolls AROUND the viewer's car, so the morph has a fixed anchor.
  const focus = bend > 0.985 ? 0 : frame.x[YOU_CAR];

  // Camera rig: pitch 0 = looking along the road, 90 = straight down.
  const pitch =
    s < B.setup[0]
      ? 17
      : s < B.form[0]
        ? interpolate(s, [B.setup[0] + 0.4, B.setup[1] - 1.4], [17, 74], ease)
        : s < B.reveal[0]
          ? interpolate(s, [B.form[0], B.form[1]], [74, 82], ease)
          : s < B.you[0]
            ? interpolate(s, [B.reveal[0], B.reveal[0] + 1.2], [82, 88], ease)
            : s < B.fix[0]
              ? interpolate(s, [B.you[0], B.you[0] + 1.6], [88, 17], ease)
              : s < B.close[0]
                ? interpolate(s, [B.fix[0], B.fix[0] + 1.6], [17, 84], ease)
                : 84;

  const eye = Math.max(0, Math.min(1, (46 - pitch) / 29)); // 1 at road level, 0 overhead
  return { s, run, simT, clock, rate, frame, bend, focus, pitch, eye };
};

type Stage = ReturnType<typeof useStage>;

/** A ribbon of constant width offset from the centreline, as one geometry. */
const ribbon = (bend: number, from: number, to: number, off: number, halfW: number, N: number) => {
  const pos: number[] = [];
  const idx: number[] = [];
  for (let k = 0; k <= N; k++) {
    const s = from + ((to - from) * k) / N;
    const [x, z] = pathPoint(s, bend);
    const [tx, tz] = tangentAt(s, bend);
    const a = off + halfW;
    const b = off - halfW;
    pos.push(x + tz * a, 0, z - tx * a);
    pos.push(x + tz * b, 0, z - tx * b);
    if (k < N) {
      const i0 = k * 2;
      idx.push(i0, i0 + 1, i0 + 2, i0 + 1, i0 + 3, i0 + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
};

/** Merge several ribbons into one buffer so the markings are a single draw call. */
const merge = (parts: THREE.BufferGeometry[]) => {
  const pos: number[] = [];
  const idx: number[] = [];
  let base = 0;
  for (const g of parts) {
    const p = g.getAttribute('position').array as ArrayLike<number>;
    const ix = g.getIndex()!.array as ArrayLike<number>;
    for (let i = 0; i < p.length; i++) pos.push(p[i]);
    for (let i = 0; i < ix.length; i++) idx.push(ix[i] + base);
    base += p.length / 3;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
};

const Road: React.FC<{ bend: number; focus: number; dashOpacity: number }> = ({ bend, dashOpacity }) => {
  const bendKey = Math.round(bend * 400);
  const geo = useMemo(() => ribbon(bend, -L / 2, L / 2, 0, ROAD_HALF_W, 220), [bendKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Edge lines and centre dashes. Without them the road reads as a black wedge at
   *  driver's eye and as a plain band from above — it has to look like a ROAD. */
  const edges = useMemo(
    () =>
      merge([
        ribbon(bend, -L / 2, L / 2, ROAD_HALF_W - 0.45, 0.16, 220),
        ribbon(bend, -L / 2, L / 2, -(ROAD_HALF_W - 0.45), 0.16, 220),
      ]),
    [bendKey], // eslint-disable-line react-hooks/exhaustive-deps
  );

  /**
   * Centre dashes exist so the road reads as a ROAD at low angle. Seen from
   * directly above they are the same size, spacing and rough colour as the cars,
   * and the first cut of this reel was a ring of blue dashes in which the cars
   * were genuinely unfindable. So they fade out with the camera: present when the
   * viewer is on the road, gone by the time the claim is being made.
   */
  const dashes = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    const DASH = 4.5;
    const GAP_M = 7.5;
    for (let s0 = -L / 2; s0 < L / 2 - DASH; s0 += DASH + GAP_M) {
      parts.push(ribbon(bend, s0, s0 + DASH, 0, 0.22, 3));
    }
    return merge(parts);
  }, [bendKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <mesh geometry={geo}>
        <meshBasicMaterial color={SLATE} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={edges} position={[0, 0.02, 0]}>
        <meshBasicMaterial color={GRAPHITE} side={THREE.DoubleSide} />
      </mesh>
      {dashOpacity > 0.02 ? (
        <mesh geometry={dashes} position={[0, 0.03, 0]}>
          <meshBasicMaterial color={GRAPHITE} transparent opacity={dashOpacity} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
    </>
  );
};

/** The stopped cars, marked where they actually are. */
const JamArc: React.FC<{ stage: Stage; color: string; opacity: number }> = ({
  stage,
  color,
  opacity,
}) => {
  const { frame, bend, focus } = stage;
  const hidden = opacity <= 0.01;
  const bendKey = Math.round(bend * 400);
  const focusKey = Math.round(focus * 4);
  const jamC = frame.jam ? frame.jam[0] : null;
  const jamH = frame.jam ? frame.jam[1] : null;
  const geo = useMemo(() => {
    if (!frame.jam || hidden) return null;
    const [centre, half] = frame.jam;
    const N = 40;
    const pos: number[] = [];
    const idx: number[] = [];
    for (let k = 0; k <= N; k++) {
      const m = centre - half + (2 * half * k) / N;
      const s = wrapDelta(focus, m);
      const [x, z] = pathPoint(s, bend);
      const [tx, tz] = tangentAt(s, bend);
      // Positive offset is the OUTSIDE of the ring. Flipped once by hand and checked
      // in a still, because "outside" depends on which way the normal points.
      const o1 = ROAD_HALF_W + 1.8;
      const o2 = ROAD_HALF_W + 3.4;
      pos.push(x + tz * o1, 0, z - tx * o1);
      pos.push(x + tz * o2, 0, z - tx * o2);
      if (k < N) {
        const a = k * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jamC, jamH, bendKey, focusKey, hidden]);

  if (!geo) return null;
  return (
    <mesh geometry={geo} position={[0, 0.05, 0]}>
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Cars: React.FC<{ stage: Stage }> = ({ stage }) => {
  const { frame, bend, focus, s } = stage;
  const nudgeFlash =
    s > B.form[0] && s < B.form[0] + 1.4
      ? interpolate(s, [B.form[0], B.form[0] + 0.4, B.form[0] + 1.4], [0, 1, 0], ease)
      : 0;
  const fixOn = s >= B.fix[0] + 1.4 ? 1 : 0;

  return (
    <>
      {frame.x.map((m, i) => {
        const sPos = wrapDelta(focus, m);
        const [x, z] = pathPoint(sPos, bend);
        const [tx, tz] = tangentAt(sPos, bend);
        const u = Math.max(0, Math.min(1, frame.v[i] / (META.ceilingMph / MPH)));
        const col = C_SLOW.clone().lerp(C_FAST, u);
        const isNudged = i === 0 && nudgeFlash > 0;
        const isFixer = i === META.controlCar && fixOn > 0;
        return (
          <mesh
            key={i}
            position={[x, 0.75, z]}
            rotation={[0, Math.atan2(tx, tz), 0]}
          >
            <boxGeometry args={[2.4, 1.4, 5.0]} />
            <meshBasicMaterial
              color={isFixer ? AMBER : isNudged ? AMBER : `rgb(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)})`}
            />
          </mesh>
        );
      })}
    </>
  );
};

const Scene: React.FC<{ stage: Stage }> = ({ stage }) => {
  const { bend, focus, pitch, eye, s } = stage;
  // Driver's eye sits low and just behind the viewer's car; overhead pulls back
  // far enough that a 755-foot ring fits inside the safe area.
  // At driver's eye the road must come TO the camera. Leaving the group at z=0 put
  // the near lane 254 m away, which is why the first cut's hook read as an abstract
  // wedge rather than a highway.
  // A true driver's eye 13 m behind one car fills the lower third with that car's
  // roof and shows no queue at all. The beat needs the QUEUE, so this is a chase
  // camera: back far enough that ~8 cars are in frame, high enough to see past them.
  const gy = lerp(RING_LIFT, -8.5, eye);
  const gz = lerp(0, CAM_Z - 44, eye);
  const spin = bend > 0.985 ? Math.sin((2 * Math.PI * s) / 37) * 0.06 : 0;
  // A side-band marker is meaningless from inside a car — down on the road the jam
  // IS the bunched cars, which is exactly what the viewer actually sees. So the
  // marker belongs to the overhead beats only.
  const overhead = 1 - eye;
  const jamAmber = (s >= B.reveal[0] && s < B.fix[0] ? 1 : 0) * overhead;
  const jamDim = (s >= B.fix[0] ? 0.55 : s < B.reveal[0] ? 0.7 : 0) * overhead;

  return (
    <group
      position={[SAFE_SHIFT_M, gy, gz]}
      rotation={[(pitch * Math.PI) / 180, spin, 0]}
    >
      <Road bend={bend} focus={focus} dashOpacity={eye} />
      <JamArc stage={stage} color={AMBER} opacity={jamAmber} />
      <JamArc stage={stage} color={ASH} opacity={jamDim} />
      <Cars stage={stage} />
    </group>
  );
};

/**
 * THE ONE RULER. Every number in this reel is a speed on this bar, and it is on
 * screen continuously from 3.2 s. The axis deliberately runs through zero: the
 * jam's reading sits on the far side of it, which is what makes "backwards" a
 * position rather than a word.
 */
const Ruler: React.FC<{ stage: Stage }> = ({ stage }) => {
  const { frame, s } = stage;
  if (s < B.setup[0] + 0.8) return null;
  const LO = -15;
  const HI = 26;
  const W = 810;
  const X0 = 60;
  const px = (mph: number) => X0 + ((mph - LO) / (HI - LO)) * W;
  const mph = frame.v.map((v) => v * MPH);
  const lo = Math.min(...mph);
  const hi = Math.max(...mph);
  const showJam = s >= B.reveal[0] + 1.0 && s < B.you[1];
  const y = 1345;
  return (
    <>
      <div style={{ position: 'absolute', top: y, left: X0, width: W, height: 4, backgroundColor: GRAPHITE }} />
      <div style={{ position: 'absolute', top: y - 16, left: px(0) - 2, width: 4, height: 36, backgroundColor: ASH }} />
      <div style={{ position: 'absolute', top: y + 30, left: px(0) - 40, width: 80, textAlign: 'center', fontFamily: 'IBM Plex Mono', fontSize: 36, color: ASH }}>
        0
      </div>
      <div style={{ position: 'absolute', top: y - 7, left: px(lo), width: Math.max(6, px(hi) - px(lo)), height: 18, backgroundColor: ACCENT }} />
      {showJam ? (
        <>
          <div style={{ position: 'absolute', top: y - 7, left: px(-META.waveMphCited) - 9, width: 18, height: 18, backgroundColor: BONE }} />
          {/* Left-ALIGNED at the safe margin, not centred on the marker: centring a
              280 px box on a marker at x = 119 puts its left edge at -21, and the
              glyphs reached x = 37 — 23 px inside Instagram's left cut. */}
          <div style={{ position: 'absolute', top: y - 78, left: 60, width: 300, textAlign: 'left', fontFamily: 'IBM Plex Mono', fontSize: 40, color: BONE }}>
            {`−${META.waveMphCited} JAM`}
          </div>
        </>
      ) : null}
      <div style={{ position: 'absolute', top: y - 78, left: Math.min(px(hi) - 140, 870 - 280), width: 280, textAlign: 'center', fontFamily: 'IBM Plex Mono', fontSize: 40, color: ACCENT }}>
        {`${Math.round(hi)} MPH`}
      </div>
    </>
  );
};

/** The clock. It states the time compression rather than hiding it, and it is
 *  the countdown non-negotiable 3 asks for on a delayed payoff. */
const Clock: React.FC<{ stage: Stage }> = ({ stage }) => {
  const { clock, rate, s } = stage;
  if (s < B.form[0] || (s > B.you[1] && s < B.fix[0])) return null;
  const mm = Math.floor(clock / 60);
  const ss = Math.floor(clock % 60);
  return (
    <div style={{ position: 'absolute', top: 1428, left: 60, width: 810, display: 'flex', justifyContent: 'space-between', fontFamily: 'IBM Plex Mono', fontSize: 38, color: ASH }}>
      <span>{`${mm}:${String(ss).padStart(2, '0')}`}</span>
      <span>{`×${Math.round(rate)}`}</span>
    </div>
  );
};

const Head: React.FC<{
  from: number;
  to: number;
  lines: string[];
  accent?: number;
  top?: number;
  size?: number;
  center?: boolean;
}> = ({ from, to, lines, accent, top = 300, size = 74, center = false }) => (
  <Fade from={t(from)} to={t(to)} style={{ position: 'absolute', top, left: 60, width: 810 }}>
    {lines.map((l, i) => (
      <div
        key={l}
        style={{
          fontFamily: 'Archivo Black',
          fontSize: size,
          lineHeight: 1.08,
          letterSpacing: -1,
          textAlign: center ? 'center' : 'left',
          color: i === accent ? ACCENT : BONE,
        }}
      >
        {l}
      </div>
    ))}
  </Fade>
);

const Sub: React.FC<{ from: number; to: number; text: string; top?: number }> = ({
  from,
  to,
  text,
  top = 470,
}) => (
  <Fade from={t(from)} to={t(to)} style={{ position: 'absolute', top, left: 60, width: 810 }}>
    <div style={{ fontFamily: 'IBM Plex Sans', fontSize: 40, color: ASH }}>{text}</div>
  </Fade>
);

export const PhantomJam: React.FC = () => {
  const stage = useStage();

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <ReelGround accent={ACCENT} />

      <AbsoluteFill>
        <ThreeCanvas
          width={REEL_W}
          height={REEL_H}
          linear
          camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.1, far: 600 }}
          gl={{ antialias: true, alpha: true }}
          style={{ backgroundColor: 'transparent' }}
        >
          <Scene stage={stage} />
        </ThreeCanvas>
      </AbsoluteFill>

      <Ruler stage={stage} />
      <Clock stage={stage} />

      {/* B1 — the hook SHOWS. Crawling traffic, then clear road, by 3.2 s. */}
      <Head from={0.25} to={3.4} lines={['YOU CRAWLED', 'FOR TEN MINUTES.']} />
      <Head from={2.0} to={3.4} lines={['THERE WAS', 'NOTHING THERE.']} accent={1} top={520} />

      {/* B2 — the controlled conditions, so "no cause" is airtight. */}
      <Head from={3.9} to={7.8} lines={[`22 CARS. ${META.ringFt} FEET.`]} size={70} />
      <Head from={5.0} to={7.8} lines={[`ONE INSTRUCTION: ${META.targetMph} MPH.`]} size={58} top={400} />
      <Sub from={5.6} to={7.8} text="Nagoya, 2008 — a real experiment" top={496} />

      {/* B3 — a four-inch offset, and nothing else. */}
      <Sub from={8.2} to={10.4} text={`one car drifts ${META.nudgeInches} inches out of place`} top={300} />
      <Head from={11.5} to={16.8} lines={['NOBODY BRAKED.', 'NOBODY CRASHED.']} accent={1} />

      {/* B4 — THE REEL. One number, one direction, on the same ruler. */}
      <Head from={17.4} to={24.8} lines={['THE CARS GO FORWARDS.']} size={54} />
      {/* Explicit line break: at 900 px this wraps on its own and collided with the
          number below it. The number goes in the ring's empty middle, where the
          Gate 0 payoff mock put it. */}
      <Head from={19.0} to={24.8} lines={['THE JAM GOES', 'BACKWARDS.']} size={54} accent={0} top={372} />
      <Head from={21.0} to={24.8} lines={[`${META.waveMphCited} MPH`]} size={100} top={820} center />
      <Fade from={t(21.6)} to={t(24.8)} style={{ position: 'absolute', top: 940, left: 60, width: 810 }}>
        <div style={{ fontFamily: 'IBM Plex Sans', fontSize: 40, color: ASH, textAlign: 'center' }}>
          backwards, through the traffic
        </div>
      </Fade>

      {/* B5 — the sentence that gets sent, in words with no technical content. */}
      <Head from={26.6} to={30.8} lines={['YOU NEVER DROVE INTO IT.']} size={54} />
      <Head from={28.4} to={30.8} lines={['IT DROVE INTO YOU.']} size={72} accent={0} top={382} />

      {/* B6 — the half of this subject the genre does not carry. */}
      <Head from={31.6} to={35.8} lines={['ONE CAR IN TWENTY-TWO']} size={54} />
      <Head from={32.8} to={35.8} lines={['STOPPED CHASING', 'THE CAR AHEAD.']} size={60} top={382} />
      <Head from={36.4} to={39.8} lines={['NOBODY STOPS', 'ANY MORE.']} size={74} accent={1} />
      <Sub from={37.4} to={39.8} text={`${META.fuelPct}% less gas — Stern et al., 2018`} top={500} />

      {/* B7 — a reason to follow, over the finished visual, held. */}
      <Head from={40.4} to={46} lines={['THE GAP IN FRONT OF YOU']} size={54} />
      <Head from={41.6} to={46} lines={['IS THE BRAKE YOU', "DON'T HAVE TO USE."]} size={62} top={382} accent={1} />
      <Fade from={t(43.2)} to={t(46)} style={{ position: 'absolute', top: SAFE_BOTTOM - 66, left: 60, width: 810 }}>
        <div style={{ fontFamily: 'IBM Plex Sans', fontSize: 38, color: ASH }}>
          Next: why your city&apos;s traffic lights aren&apos;t broken.
        </div>
      </Fade>
    </AbsoluteFill>
  );
};
