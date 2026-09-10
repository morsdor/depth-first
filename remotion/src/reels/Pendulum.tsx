import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ManimLayer } from './lib/manim';
import { FPS, Fade, ReelGround, SAFE_CX, SAFE_W, ease, t, useBreath } from './lib/chrome';
import { PENDULUM } from './data/pendulum';

/**
 * r010 · I69 — fifteen weights, and the thirty seconds they take to come back.
 *
 * The reel IS the physics: composed against a 30 s cycle, and the frame at
 * t = 30.000 s is the instant the row comes back into a straight line. Nothing
 * is retimed, sped up or looped, and the run continues to 34 s so the reel can
 * hold on the payoff and then show the row peeling apart again.
 *
 * ── Why 30 s and not 60 ─────────────────────────────────────────────────────
 * The first cut ran a 60 s cycle, N = 51..65 swings. That is a 1.62x spread of
 * string length, and on screen fifteen strings within 1.62x of each other read
 * as fifteen identical strings — which is exactly what the first viewer asked:
 * "first frame says 15 weights, are they all different?". Re-solving at N =
 * 26..40 gives a 2.37x spread, halves the runtime, and moves the payoff to
 * t = 30 s where a viewer can still be holding the promise made at t = 0.
 *
 * The pendulums are a Manim PNG sequence (scene_pendulum.py) rendered at
 * 1350x2400 — 1.25x the composition — so the camera below has somewhere to push
 * into without going soft. The angles inside those frames came from integrating
 * theta'' = -(g/L) sin(theta) in simulate.py; Manim only drew them.
 *
 * ── Where the annotations come from ─────────────────────────────────────────
 * <ManimLayer> stretches that 1350x2400 render across a 1080x1920 div, so INSIDE
 * the camera div one reference pixel is one composition pixel at any scale. That
 * is what lets the length labels below be plain HTML and still sit on the string
 * Manim drew. Every box on this page — labels, callout, table, equation, closing
 * line — is asserted clear of the apparatus, inside the safe area, and disjoint
 * from every other box that shares its screen time, by
 * projects/r010_pendulum/check_annotations.py. Move one here and re-run that.
 *
 * The camera lives in projects/r010_pendulum/camera.py and arrives through the
 * data module, for the same reason: the clearances are checked against it, so a
 * camera edited only in this file would invalidate those checks in silence.
 */
export const DURATION_SECONDS = 34;

const DATA = '#AD88FF';

/** Beat boundaries, seconds. Every one of these is also a camera keyframe. */
const B = {
  hook: [0.0, 5.0],
  free: [5.0, 10.0],
  strings: [10.0, 15.5],
  vars: [15.5, 20.5],
  long: [20.5, 25.0],
  short: [25.0, 29.4],
  /** 29.4 -> 31.2 carries no words at all: the reform is the frame the reel is for. */
  close: [31.2, DURATION_SECONDS],
} as const;

const L0 = PENDULUM.lengthsCm[0];
const LN = PENDULUM.lengthsCm[PENDULUM.count - 1];

const Head: React.FC<{ from: number; to?: number; children: React.ReactNode }> = ({
  from,
  to,
  children,
}) => (
  <Fade
    from={t(from)}
    to={to === undefined ? undefined : t(to)}
    style={{ position: 'absolute', top: 286, left: 60, width: SAFE_W }}
  >
    {children}
  </Fade>
);

const Say: React.FC<{ from: number; to?: number; children: React.ReactNode }> = ({
  from,
  to,
  children,
}) => (
  <Head from={from} to={to}>
    <div
      style={{
        fontFamily: 'IBM Plex Sans',
        fontWeight: 600,
        fontSize: 52,
        lineHeight: 1.25,
        color: '#E8E6E1',
      }}
    >
      {children}
    </div>
  </Head>
);

/**
 * The length written on the string it belongs to.
 *
 * Drawn inside the camera div, offset from the pivot along `perp` — the unit
 * normal of the beam, pointing up and left, away from where every string hangs.
 * The camera is parked at scale 1 for the whole of this beat, which is what
 * makes the analytic check on these five boxes exact rather than approximate.
 */
const LABELS = [0, 4, 8, 11, 14] as const;
const LABEL_SIZE = 36;
const LABEL_OFF = 46;
/** IBM Plex Mono advances exactly 0.6 em, so "32.4" is 4 * size * 0.6 wide. */
const LABEL_W = 4 * LABEL_SIZE * 0.6;

const Lengths: React.FC = () => (
  <>
    {LABELS.map((n, i) => {
      const [px, py] = PENDULUM.pivots[n];
      const [ux, uy] = PENDULUM.perp;
      return (
        <Fade
          key={n}
          from={t(B.strings[0] + 0.2 + i * 0.12)}
          to={t(B.strings[1])}
          style={{
            position: 'absolute',
            left: px + ux * LABEL_OFF - LABEL_W,
            top: py + uy * LABEL_OFF - (LABEL_SIZE * 1.22) / 2,
            width: LABEL_W,
            textAlign: 'right',
            fontFamily: 'IBM Plex Mono',
            fontSize: 36,
            lineHeight: 1.22,
            color: '#E8E6E1',
          }}
        >
          {PENDULUM.lengthsCm[n].toFixed(1)}
        </Fade>
      );
    })}
  </>
);

/**
 * The design equation, printed beside the string it produced.
 *
 * The textbook form — L = g(tau/N)^2 / 4pi^2 — would print 33.1 cm next to a
 * rope labelled 32.4 cm, because it assumes an infinitely small swing. C is the
 * exact-period correction at the 24 deg release these actually use. emit_ts.py
 * refuses to write the data module unless this expression reproduces all
 * fifteen lengths to 0.005 cm, so the frame cannot drift from the apparatus.
 */
const Equation: React.FC<{ i: number; from: number; to: number }> = ({ i, from, to }) => (
  <>
    <Fade
      from={t(from)}
      to={t(to)}
      style={{
        position: 'absolute',
        top: 468,
        left: 60,
        width: 492,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 40, color: '#81A2C4' }}>L =</div>
      <div>
        <div
          style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: 38,
            lineHeight: 1.3,
            color: '#E8E6E1',
            padding: '0 8px',
          }}
        >
          {`g · (${PENDULUM.tau.toFixed(0)} s / ${PENDULUM.swings[i]})²`}
        </div>
        <div style={{ height: 3, background: '#274064' }} />
        <div
          style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: 38,
            lineHeight: 1.3,
            color: '#E8E6E1',
            padding: '0 8px',
          }}
        >
          {`4π² · ${PENDULUM.nonlinearC.toFixed(4)}²`}
        </div>
      </div>
    </Fade>
    <Fade
      from={t(from)}
      to={t(to)}
      style={{ position: 'absolute', top: 626, left: 60, width: 344 }}
    >
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 56, lineHeight: 1.2 }}>
        <span style={{ color: '#81A2C4' }}>= </span>
        <span style={{ color: '#E8E6E1' }}>{PENDULUM.lengthsCm[i].toFixed(1)} cm</span>
      </div>
    </Fade>
  </>
);

/**
 * One key/value line of a mono table.
 *
 * `size` is a real parameter and not a default to be ignored: the variables
 * table is sized in check_annotations.py at 36px, and rendering it at the
 * readout's 40px overflowed the cleared box in both directions — the label ran
 * into the value, and three rows stood 26px taller than the box that had been
 * checked against the strings.
 */
const Row: React.FC<{ k: string; v: string; size?: number; pad?: number }> = ({
  k,
  v,
  size = 40,
  pad = 8,
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      borderTop: '2px solid #274064',
      padding: `${pad}px 0`,
      fontFamily: 'IBM Plex Mono',
      fontSize: size,
      lineHeight: 1.2,
    }}
  >
    {/* nowrap because a wrap here is silent: "how far you pull" broke over two
        lines in the first render and pushed the block past the box that
        check_annotations.py had cleared. */}
    <span style={{ color: '#81A2C4', whiteSpace: 'nowrap' }}>{k}</span>
    <span style={{ color: '#E8E6E1', whiteSpace: 'nowrap' }}>{v}</span>
  </div>
);

export const Pendulum: React.FC = () => {
  const frame = useCurrentFrame();
  const secs = frame / FPS;
  const keys = PENDULUM.camera.t.map((s) => t(s));
  const s = interpolate(frame, keys, [...PENDULUM.camera.s], ease);
  const cx = interpolate(frame, keys, [...PENDULUM.camera.x], ease);
  const cy = interpolate(frame, keys, [...PENDULUM.camera.y], ease);

  // Swings completed so far — free authority, the run already produced them.
  // Clamped at the cycle: past t=30 the count is "26 of 26", not 29 of 26.
  const done = Math.min(secs, PENDULUM.tau);
  const front = Math.floor((PENDULUM.swings[0] * done) / PENDULUM.tau);
  const back = Math.floor((PENDULUM.swings[PENDULUM.count - 1] * done) / PENDULUM.tau);
  const back_ = PENDULUM.swings[PENDULUM.count - 1];

  // The promise, made in words at t=0 and kept by a clock from t=5.
  const left = Math.max(0, PENDULUM.tau - secs);
  const home = secs >= PENDULUM.tau;

  return (
    <AbsoluteFill>
      <ReelGround accent={DATA} />

      <AbsoluteFill style={{ transform: useBreath() }}>
        <div
          style={{
            position: 'absolute',
            width: 1080,
            height: 1920,
            transformOrigin: '0 0',
            transform: `translate(${SAFE_CX - cx * s}px, ${936 - cy * s}px) scale(${s})`,
          }}
        >
          {/* The SEQUENCE is DURATION_SECONDS long; PENDULUM.frames counts the
              simulation's samples, which include t=34.0 itself and so run one
              longer than the PNGs on disk. */}
          <ManimLayer dir="manim/i69pendulum" frames={DURATION_SECONDS * FPS} />
          <Lengths />
        </div>
      </AbsoluteFill>

      {/* ── beat 1 · the promise ────────────────────────────────────────────
          "THIS ROW OF WEIGHTS" and not "THIS": the row is on screen from frame
          0, so the deictic has something to point at — the failure r007 shipped
          was six seconds of a pronoun with no antecedent anywhere. */}
      <Head from={B.hook[0]} to={B.hook[1]}>
        <div
          style={{
            fontFamily: 'Archivo Black',
            fontSize: 68,
            lineHeight: 1.08,
            color: '#E8E6E1',
            letterSpacing: -1,
          }}
        >
          REMEMBER THIS
          <br />
          ROW OF WEIGHTS.
        </div>
      </Head>
      <Fade
        from={t(1.0)}
        to={t(B.hook[1])}
        style={{ position: 'absolute', top: 447, left: 60, width: 480 }}
      >
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontWeight: 600,
            fontSize: 52,
            lineHeight: 1.25,
            color: '#FFB020',
          }}
        >
          In {PENDULUM.tau.toFixed(0)} seconds
          <br />
          it comes back.
        </div>
      </Fade>

      {/* ── beat 2 · rule out the thing everyone says in the comments ────── */}
      <Say from={B.free[0]} to={B.free[1]}>
        Nothing joins them.
        <br />
        Nothing controls them.
      </Say>

      {/* ── beat 3 · answer "are they all different?" with the numbers ───── */}
      <Say from={B.strings[0]} to={B.strings[1]}>
        Every weight is identical.
        <br />
        Only the strings.
      </Say>
      <Fade
        from={t(B.strings[0] + 0.6)}
        to={t(B.strings[1])}
        style={{ position: 'absolute', top: 462, left: 60, width: 370 }}
      >
        <div
          style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: 36,
            lineHeight: 1.22,
            letterSpacing: 2,
            color: '#81A2C4',
          }}
        >
          STRING LENGTHS
        </div>
        <div
          style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: 42,
            lineHeight: 1.22,
            color: '#E8E6E1',
            marginTop: 4,
          }}
        >
          {L0.toFixed(1)} → {LN.toFixed(1)} cm
        </div>
        <div
          style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: 36,
            lineHeight: 1.22,
            color: '#81A2C4',
            marginTop: 4,
          }}
        >
          a {(L0 / LN).toFixed(1)}x spread
        </div>
      </Fade>

      {/* ── beat 4 · the other variables, asked for by name ─────────────────
          Weight is in the table because a viewer asked whether it matters. It
          does not: mass appears on both sides of m·L·theta'' = -m·g·sin(theta)
          and cancels, so it is not in the equation the next beat prints. The
          third row is the honest complication — amplitude DOES matter, by the
          1.1% that the C term in that equation exists to remove. */}
      <Say from={B.vars[0]} to={B.vars[1]}>
        Only one of these
        <br />
        changes the timing.
      </Say>
      <Fade
        from={t(B.vars[0] + 0.5)}
        to={t(B.vars[1])}
        style={{ position: 'absolute', top: 448, left: 60, width: 500 }}
      >
        <Row k="length" v="everything" size={36} pad={6} />
        <Row k="weight" v="nothing" size={36} pad={6} />
        <Row
          k="how far you pull"
          v={`+${((PENDULUM.nonlinearC - 1) * 100).toFixed(1)}%`}
          size={36}
          pad={6}
        />
      </Fade>

      {/* ── beats 5 and 6 · the two ends, each with the sum that cut it ──── */}
      <Say from={B.long[0]} to={B.long[1]}>
        The longest string swings
        <br />
        {PENDULUM.swings[0]} times in {PENDULUM.tau.toFixed(0)} seconds.
      </Say>
      <Equation i={0} from={B.long[0]} to={B.long[1]} />

      <Say from={B.short[0]} to={B.short[1]}>
        The shortest one
        <br />
        swings {back_} times.
      </Say>
      <Equation i={PENDULUM.count - 1} from={B.short[0]} to={B.short[1]} />

      {/* ── beat 7 · the carryable sentence, then the reason to follow ───── */}
      <Say from={B.close[0]}>
        Whole numbers of swings —
        <br />
        so they get home at once.
      </Say>
      <Fade
        from={t(B.close[0] + 0.6)}
        style={{ position: 'absolute', top: 462, left: 60, width: 560 }}
      >
        <div
          style={{ fontFamily: 'IBM Plex Sans', fontSize: 36, lineHeight: 1.3, color: '#81A2C4' }}
        >
          More systems that look
          <br />
          designed and aren&apos;t.
        </div>
      </Fade>

      {/* The bobs swing through this strip whenever the camera is wide. A scrim
          keeps the readout legible and reads as the row passing behind a panel.

          It runs to the bottom of the FRAME, not to the bottom of the safe area:
          at t=27 the camera is on the short end, and the longest bob — four
          hundred pixels of string below it — reappeared under the readout as a
          detached floating dot. Everything past 1470 is simply not in the reel. */}
      <div
        style={{
          position: 'absolute',
          top: 1276,
          left: 0,
          width: 1080,
          height: 200,
          backgroundImage: 'linear-gradient(to top, #040E1F 0%, transparent 100%)',
        }}
      />
      <div
        style={{ position: 'absolute', top: 1470, left: 0, width: 1080, height: 450, background: '#040E1F' }}
      />

      {/* live count, straight off the integration */}
      <Fade from={t(8)} style={{ position: 'absolute', top: 1320, left: 60, width: SAFE_W }}>
        {/* Counting toward the total, not just up: at 29.8 s only 25.8 swings
            are actually complete, so a bare "25 swings" reads as a contradiction
            of the closing line. "25 of 26" is the same truth and keeps both
            payoff numbers on screen the whole way. */}
        <Row k="longest string" v={`${front} of ${PENDULUM.swings[0]} swings`} />
        <Row k="shortest string" v={`${back} of ${back_} swings`} />
      </Fade>

      {/* The cycle itself. Doubles as the rule above the clock, and arrives with
          the promise line rather than sitting alone under frame 0. */}
      <Fade from={t(1.0)} style={{ position: 'absolute', top: 1456, left: 60, width: SAFE_W, height: 6 }}>
        <div style={{ position: 'absolute', width: SAFE_W, height: 6, background: '#274064' }} />
        <div
          style={{
            position: 'absolute',
            width: (SAFE_W * done) / PENDULUM.tau,
            height: 6,
            background: DATA,
          }}
        />
      </Fade>

      {/* The promise, as a clock. This is the reel's one amber element — it takes
          the colour over from the hook line the moment that line leaves. */}
      <Fade
        from={t(5.2)}
        style={{
          position: 'absolute',
          top: 1470,
          left: 60,
          width: SAFE_W,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <span
          style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: 36,
            letterSpacing: 2,
            color: '#81A2C4',
          }}
        >
          {home ? 'CAME BACK AT' : 'COMES BACK IN'}
        </span>
        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 48, color: '#FFB020' }}>
          {home ? PENDULUM.tau.toFixed(1) : left.toFixed(1)} s
        </span>
      </Fade>
    </AbsoluteFill>
  );
};
