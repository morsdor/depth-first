import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { FPS, Fade, REEL_H, REEL_W, ReelGround, SAFE_CX, ease, t } from './lib/chrome';
import { Arm, B2F, CLAIM, META, PUBLISHED, Pax, RANDOM } from './data/boarding';

/**
 * r011 · I73 — your airline boards the plane worse than no method at all.
 *
 * Two boardings of the SAME cabin by the SAME 72 passengers. One thing differs:
 * the order they are called in. Left is back to front, right is no order at all,
 * and the one with no system finishes 1:44 sooner.
 *
 * ── Nothing here is animated by hand ────────────────────────────────────────
 * Every figure walking down an aisle comes out of data/boarding.ts: a
 * discrete-event agent model (projects/r011_boarding/boarding.py) whose
 * parameters were chosen from ordinary walking and stowing times BEFORE any
 * comparison was run, and never tuned toward the answer. It lands within 1% of
 * the back-to-front time and 7% of the random time measured on 72 real people in
 * a mock 757 in 2011. 144 of 144 sweep points keep back to front slower.
 * emit_ts.py asserts 30 on-screen claims and refuses to write the data module if
 * one of them stops being true.
 *
 * ── Why the accent is on the person STOWING ─────────────────────────────────
 * tokens.ts says the failure accent is for the beat something breaks and that
 * decorative use destroys it. Red here is not decoration: it marks the one
 * quantity the whole reel is about — who is currently blocking the aisle with a
 * bag. That makes the claim a colour you can count rather than a sentence you
 * have to trust: the left cabin never shows more than TWO red figures at any
 * instant, in any seed, at any parameter setting. The right one reaches seven.
 * Everything else is ash and slate, and the ground takes ASH, not FAIL, because
 * passing the accent to ReelGround washes the whole frame (the r010 lesson).
 *
 * ── Why this is 3D, and what the third dimension buys ───────────────────────
 * A race between two cabins reads from directly above and nowhere else, so the
 * reel opens and closes in plan view. The dimensionality is spent on ONE move:
 * at 8 s the whole cabin block tips over and the camera falls to a low angle
 * down the two aisles, where the overhead bins exist, the queue has height, and
 * you can see a bag going up. That shot does not exist in 2D. It tips back at
 * 18 s for the finish, because the finish is a plan-view fact.
 *
 * The camera never moves: `<ThreeCanvas>` takes it as a prop, so the ROOT GROUP
 * is what rotates and scales (CLAUDE.md, 2026-09-11).
 *
 * ── The clock is linear in playback, and it has to be ──────────────────────
 * One second of reel is exactly 15 seconds of boarding, everywhere, including
 * the opening beat. No easing is applied to simulation time anywhere in this
 * file. Easing the physics is what made the parked I65 traffic build print
 * "1:35" where a true rate said 1:05 — the moment a reel puts a clock on screen,
 * the quantity behind it must be linear or the label is a false statement.
 */
export const DURATION_SECONDS = 45;

// ── palette. Brand tokens only; dimmed variants are computed rgb(). ─────────
const INK = '#040E1F';
const SLATE = '#0E213E';
const BONE = '#E8E6E1';
const ASH = '#81A2C4';
const GRAPHITE = '#274064';
const FAIL = '#FF4D4D'; // DOMAIN_ACCENT.failure — here: "blocking the aisle with a bag"

/**
 * The timeline. RACE_START and the four copy times are ALSO asserted in
 * emit_ts.py, which checks each claim against the data at the moment the copy
 * makes it — that the counter already reads 7 when the copy says seven, that
 * "EVERYONE SEATED AT 4:24" lands after the random cabin is actually full, and
 * that "ANOTHER 1:44" lands after the other one is. Change a number here and the
 * data module refuses to regenerate until the script and the run agree again.
 */
const REWIND = 2.9;
const RACE_START = 3.2;
const RATE = META.rate; // 15 s of boarding per second of reel
/** The opening beat plays the END of the race, so the result is on screen at
 *  frame 0 and something is moving by 0.1 s. r009's one transferable finding:
 *  show the result, do not promise it (+60% watch time, measured). */
const OPEN_AT = RANDOM.total;

const BEAT = {
  result: [0.25, 2.75],
  same: [3.45, 7.7],
  fewFeet: [8.0, 12.9],
  seven: [13.2, 17.7],
  randomDone: [21.0, 24.7],
  b2fDone: [27.9, 31.1],
  field: [31.7, 37.6],
  close: [37.9, 44.7],
} as const;

const DIVE = [7.6, 8.4, 17.2, 18.0] as const;
/** How far the cabin block tips for the aisle shot, and how much it grows.
 *  Both are capped by the SAFE WIDTH, not by taste: at tilt -1.0 the near end of
 *  the block magnifies ~7% under perspective, so 1.22 is about the largest zoom
 *  whose bottom corners stay clear of Instagram's action rail. Tipping further
 *  compresses the cabin floor to nothing; zooming further pushes the corners under
 *  the rail. */
const TILT = -1.0;
const DIVE_ZOOM = 1.4;
/**
 * The two cabins also slide TOWARDS each other as the camera falls, to 0.62 of
 * their plan-view separation. That is what buys the zoom: the block's half-width
 * is what the action rail limits, and closing the gap by a third lets the dive be
 * 1.40 instead of 1.10 — the difference between a shot and a tilt. The cabins stay
 * two separate objects throughout; only the composition moves.
 */
const DIVE_SPREAD = 0.62;
/**
 * The closing beats shrink the cabin block and lift it into the top half, so the
 * field-test list has clean ground underneath instead of being read over twelve
 * rows of seats. The first attempt dimmed the cabins to 0.2 behind a 0.55 scrim
 * instead — and the motion audit failed it, 4.5 s dead spell at 33.0 s, because a
 * replay at 11% effective opacity registers as nothing at all. Moving the object
 * is what keeps it alive; dimming it is what killed it.
 */
const LATE_ZOOM = 0.55;
const LATE_CY = 706;
/**
 * When the cabins shrink and lift, and when the replay starts.
 *
 * These are set by the MOTION AUDIT, not by taste. The back-to-front cabin
 * finishes at 27.7 s and the field-test list arrives at 31.7, so for three
 * seconds in between both cabins are full and nothing on screen moves at all —
 * the second audit failed on exactly that, a 2.25 s dead spell at 28.8 s. Moving
 * the closing transition forward to 29.0 closes the gap to 1.3 s. The clocks go
 * first, because the replay resets simulation time and a clock reading 6:08 that
 * jumps to 0:00 would be a false statement.
 */
const LATE_MOVE = [29.0, 30.0] as const;
const REPLAY = 30.0;

// ── cabin geometry, in world units. 1 unit = one row of pitch. ─────────────
const SEAT_W = 0.5;
const AISLE_W = 0.7;
const CABIN_W = 6 * SEAT_W + AISLE_W; // 3.7
/** Wider than the picture needs, and set by the TEXT. Each cabin's header sits
 *  above its own cabin, and at a 0.9 gap the two boxes overlapped in the middle of
 *  the frame — "BACK TO FRONT" ran straight into "NO ORDER AT ALL". */
const GAP = 2.6;
const CAB_X = [-(CABIN_W + GAP) / 2, (CABIN_W + GAP) / 2] as const;
/** Seat 0 is the port window, 2 the port aisle seat, 3 the starboard aisle seat. */
const SEAT_X = [-1.6, -1.1, -0.6, 0.6, 1.1, 1.6] as const;
const Y0 = (META.rows - 1) / 2; // row 0 (the nose) sits at +5.5
const rowY = (r: number) => Y0 - r;
/** Sub-slot j of the aisle. Row r's own slot is j = sub*r, so the two agree. */
const slotY = (j: number) => Y0 - j / META.sub;

const PX = 66; // screen pixels per world unit
const FOV = 26;
const CAM_Z = REEL_H / PX / (2 * Math.tan(((FOV / 2) * Math.PI) / 180));
/** Centre the cabin block on the SAFE width (x 465), not the raw frame. */
const OFF_X = (SAFE_CX - REEL_W / 2) / PX;
const CAB_CY = 992; // screen y of the cabin block's centre
const OFF_Y = (REEL_H / 2 - CAB_CY) / PX;

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * Simulation seconds at screen second s. Three stretches, all at the SAME rate,
 * because a reel that prints a rate has to mean it:
 *
 *  - the opening beat plays the END of the race, from OPEN_AT
 *  - the race itself, from zero
 *  - the closing beats replay it from zero, behind the field-test list
 *
 * The replay is why the last thirteen seconds are not a frozen frame. r010's
 * retention bled 100% -> 37% on a reel whose last EVENT was at 4.7 s of 12, and
 * the lesson was that motion density is not event rate. No clock is on screen
 * during the replay, so nothing is being claimed by it; it is the object staying
 * alive in frame while the copy does the talking.
 */
const simTime = (s: number) => {
  if (s < REWIND) return OPEN_AT + s * RATE;
  if (s >= REPLAY) return (s - REPLAY) * RATE;
  return Math.max(0, (s - RACE_START) * RATE);
};

/** The value of a step function at tau. Both counters are step functions. */
const stepAt = (steps: readonly (readonly [number, number])[], tau: number) => {
  let v = 0;
  for (const st of steps) {
    if (st[0] <= tau) v = st[1];
    else break;
  }
  return v;
};

type State = { mode: 'out' | 'aisle' | 'seated'; pos: number; stowing: boolean; bag: number };

/**
 * Where one passenger is at simulation time tau.
 *
 * `arr` holds the time they ARRIVED at each aisle sub-slot, so this reconstructs
 * real stop-and-go motion: walk one body-width in tSub seconds, then stand until
 * the person in front moves. Tweening between snapshots would smooth the queue
 * into a smooth flow, and the queue IS the subject.
 */
const paxAt = (d: Pax, tau: number): State => {
  if (tau < d.arr[0][0]) return { mode: 'out', pos: 0, stowing: false, bag: 0 };
  if (tau >= d.sit) return { mode: 'seated', pos: 0, stowing: false, bag: 0 };
  let k = 0;
  for (let i = 0; i < d.arr.length; i++) {
    if (d.arr[i][0] <= tau) k = i;
    else break;
  }
  let pos = k;
  const nxt = d.arr[k + 1];
  if (nxt) {
    const start = nxt[0] - META.tSub;
    if (tau > start) pos = k + clamp01((tau - start) / META.tSub);
  }
  const stowing = !!d.stow && tau >= d.stow[0] && tau < d.stow[1];
  const bag = d.stow ? clamp01((tau - d.stow[0]) / (0.55 * (d.stow[1] - d.stow[0]))) : 0;
  return { mode: 'aisle', pos, stowing, bag };
};

/**
 * `pop` is 1 for the half-second after this passenger sits down and 0 after.
 *
 * Someone reaching their seat is the only thing in this reel that HAPPENS 144
 * times, and without the flash it was a 44 x 36 px square quietly changing
 * colour. The motion audit measures mean change over the whole frame, so a small
 * moving object is worth almost nothing (r006's route-draw beat, 16%) — but this
 * is not a craft fix to a measurement: every flash marks a real event in the run.
 */
const Seat: React.FC<{ x: number; y: number; filled: boolean; pop: number }> = ({
  x,
  y,
  filled,
  pop,
}) => (
  <>
    <mesh position={[x, y, 0.04]}>
      <boxGeometry args={[SEAT_W * 0.84, 0.78, 0.08]} />
      <meshStandardMaterial
        color={filled ? SLATE : INK}
        emissive={filled ? SLATE : INK}
        emissiveIntensity={0.4}
        roughness={0.7}
      />
    </mesh>
    {/* The empty seat is an outline, so a cabin filling up reads as a pattern
        rather than as a brightness change. */}
    <mesh position={[x, y, 0.02]}>
      <boxGeometry args={[SEAT_W * 0.92, 0.86, 0.02]} />
      <meshStandardMaterial color={GRAPHITE} emissive={GRAPHITE} emissiveIntensity={1} />
    </mesh>
    {filled && (
      <mesh position={[x, y - 0.05, 0.16]} scale={1 + 0.5 * pop}>
        <boxGeometry args={[SEAT_W * 0.58, 0.4, 0.14]} />
        <meshStandardMaterial
          color={pop > 0.01 ? BONE : ASH}
          emissive={pop > 0.01 ? BONE : ASH}
          emissiveIntensity={0.35 + 0.9 * pop}
          roughness={0.5}
        />
      </mesh>
    )}
  </>
);

/** A person standing in the aisle. Red exactly while they are blocking it. */
const Person: React.FC<{ y: number; stowing: boolean; bag: number; binZ: number }> = ({
  y,
  stowing,
  bag,
  binZ,
}) => (
  <>
    <mesh position={[0, y, 0.48]}>
      <cylinderGeometry args={[0.165, 0.165, 0.9, 14]} />
      <meshStandardMaterial
        color={stowing ? FAIL : ASH}
        emissive={stowing ? FAIL : ASH}
        emissiveIntensity={stowing ? 0.85 : 0.45}
        roughness={0.45}
      />
    </mesh>
    {/* A bright head on every body. A boarding queue really is packed nose to tail,
        and at 0.5 units of sub-slot spacing the bodies alone rendered as a single
        grey bar — the heads are what make it read as people. */}
    <mesh position={[0, y, 1.02]}>
      <sphereGeometry args={[0.14, 14, 14]} />
      <meshStandardMaterial
        color={stowing ? FAIL : BONE}
        emissive={stowing ? FAIL : ASH}
        emissiveIntensity={stowing ? 0.95 : 0.7}
      />
    </mesh>
    {/* The bag rising into the bin. This is the thing that costs the time. */}
    {stowing && (
      <mesh position={[0.26, y, 0.7 + bag * (binZ - 0.82)]}>
        <boxGeometry args={[0.3, 0.42, 0.24]} />
        <meshStandardMaterial color={FAIL} emissive={FAIL} emissiveIntensity={0.7} roughness={0.4} />
      </mesh>
    )}
  </>
);

/** Overhead bins. They only exist once the camera has tipped — from plan view
 *  they would sit on top of the seats and hide the thing being counted. */
const Bins: React.FC<{ show: number }> = ({ show }) =>
  show <= 0.01 ? null : (
    <>
      {[-1.35, 1.35].map((x) => (
        <mesh key={x} position={[x, 0, 1.46]}>
          <boxGeometry args={[1.15, META.rows - 0.6, 0.18]} />
          <meshStandardMaterial
            color={GRAPHITE}
            emissive={GRAPHITE}
            emissiveIntensity={0.45}
            roughness={0.6}
            transparent
            opacity={0.5 * show}
          />
        </mesh>
      ))}
    </>
  );

const Cabin: React.FC<{ arm: Arm; tau: number; x: number; bins: number }> = ({
  arm,
  tau,
  x,
  bins,
}) => (
  <group position={[x, 0, 0]}>
    {/* the fuselage floor, so the cabin is an object and not a scatter of seats */}
    <mesh position={[0, 0, -0.04]}>
      <boxGeometry args={[CABIN_W, META.rows + 0.7, 0.06]} />
      <meshStandardMaterial color={INK} emissive={SLATE} emissiveIntensity={0.22} roughness={0.9} />
    </mesh>
    <Bins show={bins} />
    {arm.pax.map((d) => {
      const st = paxAt(d, tau);
      return (
        <React.Fragment key={`${d.r}-${d.s}`}>
          <Seat
            x={SEAT_X[d.s]}
            y={rowY(d.r)}
            filled={st.mode === 'seated'}
            pop={st.mode === 'seated' ? 1 - clamp01((tau - d.sit) / 7) : 0}
          />
          {st.mode === 'aisle' && (
            <Person y={slotY(st.pos)} stowing={st.stowing} bag={st.bag} binZ={1.36} />
          )}
        </React.Fragment>
      );
    })}
  </group>
);

const Scene: React.FC<{ s: number }> = ({ s }) => {
  const tau = simTime(s);
  const d = DIVE as unknown as number[];
  const late = LATE_MOVE as unknown as number[];
  const tilt = interpolate(s, d, [0, TILT, TILT, 0], ease);
  const zoom =
    interpolate(s, d, [1, DIVE_ZOOM, DIVE_ZOOM, 1], ease) *
    interpolate(s, late, [1, LATE_ZOOM], ease);
  const spread = interpolate(s, d, [1, DIVE_SPREAD, DIVE_SPREAD, 1], ease);
  const bins = interpolate(s, d, [0, 1, 1, 0], ease);
  const lift = interpolate(s, late, [OFF_Y, (REEL_H / 2 - LATE_CY) / PX], ease);
  // Nothing is ever perfectly still (non-negotiable 4). useBreath() drives a CSS
  // transform, which a three.js group cannot take, so the same idea is applied to
  // the group: long, mutually prime periods so it never visibly loops.
  const bx = 0.05 * Math.sin((2 * Math.PI * s) / 17);
  const by = 0.06 * Math.sin((2 * Math.PI * s) / 11);

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[-5, 7, 10]} intensity={0.8} />
      <directionalLight position={[6, -4, 6]} intensity={0.35} />
      <group position={[OFF_X + bx, lift + by, 0]}>
        <group scale={zoom} rotation={[tilt, 0, 0]}>
          <Cabin arm={B2F} tau={tau} x={CAB_X[0] * spread} bins={bins} />
          <Cabin arm={RANDOM} tau={tau} x={CAB_X[1] * spread} bins={bins} />
        </group>
      </group>
    </>
  );
};

/** Copy. Every moment sits in the same slot, sequential, never crossfading in
 *  place — two type blocks dissolving through each other reads as a double
 *  exposure (chrome.tsx, ReelHeader). */
/**
 * `hot` puts the last line in the failure accent. It is OFF for the beats that are
 * not about back-to-front being slow: red on "ONLY THE ORDER CHANGES." would be
 * exactly the decorative use of the accent that tokens.ts says destroys it.
 */
const Head: React.FC<{
  from: number;
  to: number;
  lines: string[];
  size?: number;
  hot?: boolean;
}> = ({ from, to, lines, size = 56, hot = false }) => (
  <Fade
    from={t(from)}
    to={t(to)}
    style={{ position: 'absolute', top: 292, left: 60, width: 810, textAlign: 'center' }}
  >
    {lines.map((l, i) => (
      <div
        key={i}
        style={{
          fontFamily: 'Archivo Black',
          fontSize: size,
          lineHeight: 1.14,
          letterSpacing: -1,
          color: hot && i === lines.length - 1 ? FAIL : BONE,
        }}
      >
        {l}
      </div>
    ))}
  </Fade>
);

const CabinHead: React.FC<{ cab: number; name: string; arm: Arm; s: number; hide: number }> = ({
  cab,
  name,
  arm,
  s,
  hide,
}) => {
  const tau = simTime(s);
  const done = tau >= arm.total;
  // Out of the way for the dive: tipped over and zoomed, the nose of the cabin and
  // the overhead bins reach up into this band. Both clocks read the same moment
  // anyway, so nothing is lost by dropping them for the aisle shot.
  const o = Math.min(
    interpolate(s, [hide, hide + 0.5], [1, 0], ease),
    interpolate(s, DIVE as unknown as number[], [1, 0, 0, 1], ease),
  );
  return (
    <div
      style={{
        position: 'absolute',
        top: 492,
        left: SAFE_CX + CAB_X[cab] * PX - 195,
        width: 390,
        whiteSpace: 'nowrap',
        textAlign: 'center',
        opacity: o,
      }}
    >
      <div style={{ fontFamily: 'Archivo Black', fontSize: 36, color: ASH, letterSpacing: 0.5 }}>
        {name}
      </div>
      <div
        style={{
          fontFamily: 'IBM Plex Mono',
          fontWeight: 700,
          fontSize: 58,
          color: done ? (cab === 0 ? FAIL : BONE) : ASH,
          marginTop: 2,
        }}
      >
        {mmss(Math.min(tau, arm.total))}
      </div>
    </div>
  );
};

/** MOST STOWING AT ONCE — a running maximum, so it is still readable a second
 *  later, and it is the number the copy quotes. */
const Counter: React.FC<{ cab: number; arm: Arm; s: number; from: number; to: number }> = ({
  cab,
  arm,
  s,
  from,
  to,
}) => (
  <Fade
    from={t(from)}
    to={t(to)}
    style={{
      position: 'absolute',
      top: 1396,
      left: SAFE_CX + CAB_X[cab] * PX - 195,
      width: 390,
      whiteSpace: 'nowrap',
      textAlign: 'center',
    }}
  >
    <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 36, color: ASH }}>
      most at once
    </div>
    {/* A neutral readout. Red belongs on the people who are actually blocking the
        aisle, not on the number that counts them — one meaning per accent. */}
    <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: 58, color: BONE }}>
      {stepAt(arm.maxStow, simTime(s))}
    </div>
  </Fade>
);

/** The 2011 field test — somebody else's numbers, on real people. */
const FieldTest: React.FC<{ s: number }> = ({ s }) => {
  const rows: [string, number, boolean][] = [
    ['Steffen order', PUBLISHED.times.steffen, false],
    ['window, middle, aisle', PUBLISHED.times.wilma, s >= BEAT.close[0]],
    ['no order at all', PUBLISHED.times.random, true],
    ['back to front', PUBLISHED.times.backToFront, true],
    ['blocks from the rear', PUBLISHED.times.block, false],
  ];
  return (
    <Fade
      from={t(BEAT.field[0])}
      style={{ position: 'absolute', top: 964, left: 60, width: 810 }}
    >
      <div
        style={{
          fontFamily: 'IBM Plex Sans',
          fontWeight: 600,
          fontSize: 36,
          color: ASH,
          marginBottom: 14,
        }}
      >
        72 passengers, a mock 757, 2011
      </div>
      {rows.map(([k, v, lit], i) => (
        <div
          key={k}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            borderTop: `2px solid ${GRAPHITE}`,
            padding: '16px 4px',
            opacity: interpolate(
              s,
              [BEAT.field[0] + i * 0.18, BEAT.field[0] + 0.5 + i * 0.18],
              [0, lit ? 1 : 0.42],
              ease,
            ),
          }}
        >
          <span style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 44, color: BONE }}>
            {k}
          </span>
          <span
            style={{
              fontFamily: 'IBM Plex Mono',
              fontWeight: 700,
              fontSize: 52,
              color: k === 'back to front' ? FAIL : BONE,
            }}
          >
            {mmss(v)}
          </span>
        </div>
      ))}
      <div
        style={{
          fontFamily: 'IBM Plex Sans',
          fontSize: 36,
          color: ASH,
          marginTop: 18,
          borderTop: `2px solid ${GRAPHITE}`,
          paddingTop: 16,
        }}
      >
        Steffen &amp; Hotchkiss 2012
      </div>
    </Fade>
  );
};

export const Boarding: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  // The rewind: a six-frame dip, so the jump from the end of the race back to an
  // empty cabin reads as a rewind rather than as a glitch.
  const dip = interpolate(s, [REWIND - 0.1, REWIND, RACE_START, RACE_START + 0.1], [1, 0.12, 0.12, 1], ease);
  // The field-test beats dim the cabins rather than moving them: the object stays
  // in frame (non-negotiable 6) and nothing reflows under the copy.


  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {/* ASH, not FAIL. The failure accent in ReelGround washes the whole frame red
          for the whole reel — the decorative use tokens.ts says destroys it. */}
      <ReelGround accent={ASH} />

      <AbsoluteFill style={{ opacity: dip }}>
        <ThreeCanvas
          width={REEL_W}
          height={REEL_H}
          linear
          camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 1, far: 400 }}
          gl={{ antialias: true, alpha: true }}
          style={{ backgroundColor: 'transparent' }}
        >
          <Scene s={s} />
        </ThreeCanvas>
      </AbsoluteFill>

      <CabinHead cab={0} name="BACK TO FRONT" arm={B2F} s={s} hide={LATE_MOVE[0]} />
      <CabinHead cab={1} name="NO ORDER AT ALL" arm={RANDOM} s={s} hide={LATE_MOVE[0]} />

      {/* Beat 1 — the result, at frame 0. The opening beat plays the last three
          seconds of the race: the right cabin is already full and the left still
          has a queue in it, so a stranger sees the winner before a word of it is
          explained, and something is moving from the first tenth of a second. */}
      <Head
        from={BEAT.result[0]}
        to={BEAT.result[1]}
        lines={['BOARDING IN NO ORDER', 'AT ALL BEATS BOARDING', 'BACK TO FRONT.']}
        size={52}
        hot
      />

      {/* Beat 2 — the one-parameter statement. Same people, same seats, same bags:
          emit_ts.py asserts all three, because "only the order changes" is a claim. */}
      <Head
        from={BEAT.same[0]}
        to={BEAT.same[1]}
        lines={['SAME 72 PEOPLE.', 'SAME CABIN.', 'ONLY THE ORDER CHANGES.']}
        size={48}
      />

      {/* Beat 3 — the mechanism, over the dive. Both cabins are still boarding
          here, which is the reason this beat comes before the finish and not
          after it: at the finish the right-hand cabin is empty and there is
          nothing left to count. */}
      <Head
        from={BEAT.fewFeet[0]}
        to={BEAT.fewFeet[1]}
        lines={['BACK TO FRONT PUTS EVERY BAG', 'IN THE SAME FEW FEET OF AISLE.']}
        size={40}
        hot
      />

      {/* Beat 4 — the payoff of beat 3. Seven is this run's own live maximum and
          the counter on screen has already reached it; two is the ceiling in every
          seed and at all 144 sweep points. */}
      <Head
        from={BEAT.seven[0]}
        to={BEAT.seven[1]}
        lines={['SPREAD THEM OUT AND', 'SEVEN STOW AT ONCE.']}
        size={52}
      />

      {/* Beat 5 — lands after the right-hand clock has actually stopped. */}
      <Head
        from={BEAT.randomDone[0]}
        to={BEAT.randomDone[1]}
        lines={['NO ORDER AT ALL:', 'EVERYONE SEATED AT 4:24.']}
        size={46}
      />

      {/* Beat 6 — and after the left-hand one has. */}
      <Head
        from={BEAT.b2fDone[0]}
        to={BEAT.b2fDone[1]}
        lines={['BACK TO FRONT NEEDED', `ANOTHER ${mmss(CLAIM.remainingAtRandomDone)}.`]}
        size={52}
        hot
      />

      {/* Beat 7 — it stops being our simulation and becomes an experiment somebody
          ran with real people. This is the beat that makes the reel sendable. */}
      <Head
        from={BEAT.field[0]}
        to={BEAT.field[1]}
        lines={['THEY RAN THIS FOR REAL.', '6:11 AGAINST 4:44.']}
        size={48}
      />

      {/* Beat 8 — two airlines already changed, which is news rather than a
          grumble, and the window-middle-aisle row in the table above lights up as
          it is named. Then the follow ask, over the finished visual. */}
      <Head
        from={BEAT.close[0]}
        to={BEAT.close[1]}
        lines={['UNITED WENT WINDOW-MIDDLE-AISLE', 'IN 2023. SOUTHWEST IN JANUARY.']}
        size={38}
      />

      {/* Out before the replay starts: a running maximum that resets to zero
          because the animation looped would be a false readout. */}
      <Counter cab={0} arm={B2F} s={s} from={BEAT.fewFeet[0]} to={LATE_MOVE[0]} />
      <Counter cab={1} arm={RANDOM} s={s} from={BEAT.fewFeet[0]} to={LATE_MOVE[0]} />
      <FieldTest s={s} />

      {/* The rate label. A reel that prints a clock must print the rate, and the
          rate must be true: simulation time is linear in playback everywhere. */}
      <Fade
        from={t(RACE_START)}
        to={t(LATE_MOVE[0])}
        style={{ position: 'absolute', top: 1500, left: 60, width: 810, textAlign: 'center' }}
      >
        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: GRAPHITE }}>
          {`×${RATE} speed`}
        </div>
      </Fade>

      <Fade
        from={t(BEAT.close[0] + 2.6)}
        style={{ position: 'absolute', top: 1400, left: 60, width: 810, textAlign: 'center' }}
      >
        <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 40, color: ASH }}>
          Next: stand still on the escalator
        </div>
        <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 40, color: ASH }}>
          and more people get up it.
        </div>
      </Fade>
    </AbsoluteFill>
  );
};
