import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import {
  Fade,
  Progress,
  ReelGround,
  ReelHeader,
  StepLabel,
  useBreath,
  ease,
  t,
} from './lib/chrome';
import {
  BLOB,
  BLOB_CX,
  BLOB_CY,
  FUNC,
  MATRIX,
  N,
  OWNER,
  SPECKLE,
  SPECKLE_ORDER,
  STATS,
  type Step,
} from './data/qr';

/**
 * r003 · "How much of a QR code can you destroy?"  (backlog I01)
 *
 * Every number and every damaged module is measured output from
 * projects/r003_qr/qr_damage.py, which encodes a real QR, rebuilds the
 * module -> codeword -> Reed-Solomon block mapping from the spec, proves it by
 * reconstructing the payload byte for byte, then damages the code and asks
 * OpenCV whether it still reads. Nothing here is drawn by hand.
 *
 * ── Re-cut 2026-09-03, from the first Instagram retention data ───────────────
 * r001 lost half its audience by ~3s and r002 by ~1.5s, while BOTH curves then
 * flattened — so the body works and the opening does not. The first cut of this
 * reel sat on a static code for 6.6s before anything happened, which on that
 * evidence is fatal. Now the destruction starts at 0.3s and the payoff verdict
 * lands at 2.5s, with the title riding over the damage instead of preceding it.
 * Runtime 45s -> 35s.
 *
 * ── End beat added 2026-09-05, from r001's three-day numbers ─────────────────
 * r001 finished at 1,286 viewers, ~18% of whom reached the last frame — roughly
 * 230 people — and ONE followed. The reel earned forty seconds and then asked for
 * nothing. So the tail now does two things it did not: it says where the code
 * goes (an unexplained QR is not scanned; this one opens the account, which is
 * the payload qr_damage.py actually encodes), and it closes on a line naming
 * what the next reel does, held 3.4s. See CLAUDE.md non-negotiable 9.
 */

export const DURATION_SECONDS = 37;

const T = {
  // ── HOOK: destroy it first, explain afterwards ────────────────────────────
  stain: [0.3, 2.4] as [number, number],
  hookVerdict: 2.5,
  titleOut: [5.5, 5.9] as [number, number],
  titleIn: [5.9, 6.25] as [number, number],
  hookOut: 6.0,

  // ── 1. why it survived ────────────────────────────────────────────────────
  s1Label: [6.0, 14.0] as [number, number],
  sweep: [7.2, 10.2] as [number, number],
  s1Read: 10.5,
  s1Out: 13.8,

  // ── 2. the same damage, scattered ─────────────────────────────────────────
  s2Label: [14.0, 21.2] as [number, number],
  speck: [15.2, 17.5] as [number, number],
  s2Verdict: 17.7,
  s2Out: 21.0,

  // ── 3. the corner nobody expects ──────────────────────────────────────────
  s3Label: [21.2, 28.2] as [number, number],
  corner: [22.4, 23.7] as [number, number],
  s3Verdict: 23.9,
  s3Out: 28.0,

  // ── 4/5. the answer, then something for the viewer to do ──────────────────
  // Every end-of-beat block now holds >= 3s. They were 2.0-2.7s, which is not
  // long enough to read two lines including a mono figure.
  answer: 28.4,
  answerOut: 32.2,
  cta: 32.4,
  // The closing ask. 33.6 -> 37.0 is 3.4s, over the >= 3s an end-of-beat block
  // needs, and it is the last thing on screen rather than a handle under a CTA.
  next: 33.6,
};

// ── geometry ────────────────────────────────────────────────────────────────
const CELL = 17;
const QW = N * CELL;
const PAD = 14;
// Centred on the FRAME (540): at 657px total the right edge lands at 868, inside
// the 870 action-rail limit, so it clears the buttons without looking off-centre.
const QX = 540 - (QW + PAD * 2) / 2;
const QY = 690;

const at = (r: number, c: number) => r * N + c;
const isDark = (r: number, c: number) => MATRIX[at(r, c)] === '1';
const isFunc = (r: number, c: number) => FUNC[at(r, c)] === '1';

/**
 * The Reed-Solomon block ramp — the domain accent through to cyan, one stop per
 * block. Computed rgb() rather than new hex literals, so the palette stays
 * closed (brand_guide_software.md §3a), and the colour ENCODES which of the four
 * blocks owns each module rather than decorating it. Four interleaved colour
 * populations, none of which owns a region, IS the beat.
 */
const RAMP_A = [173, 136, 255]; // #AD88FF violet — the domain accent
const RAMP_B = [0, 214, 247]; // #00D6F7 cyan
const blockColor = (block: number, light: boolean): string => {
  const f = block / (STATS.blocks - 1);
  const k = light ? 1 : 0.42; // dark modules take a deeper step of the same hue
  const ch = RAMP_A.map((a, i) => Math.round((a + (RAMP_B[i] - a) * f) * k));
  return `rgb(${ch.join(',')})`;
};

// ── damage models, recomputed exactly as qr_damage.py generated them ─────────
const blobDamaged = (pct: number): Set<number> => {
  const out = new Set<number>();
  if (pct <= 0) return out;
  const rad2 = Math.round((STATS.dataModules * pct) / 100) / Math.PI;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (isFunc(r, c)) continue;
      if ((r - BLOB_CY) ** 2 + (c - BLOB_CX) ** 2 <= rad2) out.add(at(r, c));
    }
  }
  return out;
};

const speckleDamaged = (pct: number): Set<number> => {
  const n = Math.round((STATS.dataModules * pct) / 100);
  const out = new Set<number>();
  for (let i = 0; i < n && i < SPECKLE_ORDER.length; i++) {
    const [r, c] = SPECKLE_ORDER[i];
    out.add(at(r, c));
  }
  return out;
};

/** The nine modules inside a finder corner — 0.7% of the code, and fatal. */
const CORNER: number[] = (() => {
  const out: number[] = [];
  for (let r = 2; r < 5; r++) for (let c = 2; c < 5; c++) out.push(at(r, c));
  return out;
})();

/** The measured verdict at a damage level — read from the sweep, never assumed. */
const verdictAt = (steps: Step[], pct: number): boolean => {
  let ok = true;
  for (const s of steps) if (s.pct <= pct) ok = s.ok;
  return ok;
};

// ── the code ────────────────────────────────────────────────────────────────

/** The three finder patterns — the 7x7 squares that carry no data and cannot be lost. */
const FINDERS: [number, number][] = [
  [0, 0],
  [0, N - 7],
  [N - 7, 0],
];

const Code: React.FC<{
  damaged: Set<number>;
  sweep: number;
  markCorner: number;
  cornerRings: number;
  pulse: number;
}> = ({ damaged, sweep, markCorner, cornerRings, pulse }) => {
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const i = at(r, c);
      const dark = isDark(r, c);
      let fill = dark ? '#040E1F' : '#E8E6E1';
      // a diagonal wipe lights the blocks as it crosses them
      if (sweep > 0 && OWNER[i] !== '.') {
        if ((r + c) / (2 * N - 2) <= sweep) fill = blockColor(Number(OWNER[i]), !dark);
      }
      if (damaged.has(i)) fill = '#040E1F';
      cells.push(
        <rect key={i} x={c * CELL} y={r * CELL} width={CELL} height={CELL} fill={fill} />,
      );
    }
  }
  const S = QW + PAD * 2;
  return (
    <svg width={S + 180} height={S + 180} style={{ display: 'block', margin: -90 }}>
      <defs>
        <radialGradient id="halo">
          <stop offset="45%" stopColor="#AD88FF" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#AD88FF" stopOpacity={0} />
        </radialGradient>
      </defs>
      {pulse > 0 ? (
        <rect width={S + 180} height={S + 180} fill="url(#halo)" opacity={pulse} />
      ) : null}
      <g transform="translate(90,90)">
        <rect width={S} height={S} fill="#E8E6E1" />
        <g transform={`translate(${PAD},${PAD})`}>
          {cells}
          {cornerRings > 0
          ? FINDERS.map(([fr, fc]) => (
              <rect
                key={`f${fr}-${fc}`}
                x={fc * CELL - 6}
                y={fr * CELL - 6}
                width={7 * CELL + 12}
                height={7 * CELL + 12}
                fill="none"
                stroke="#AD88FF"
                strokeWidth={5}
                opacity={cornerRings}
              />
            ))
          : null}
        {markCorner > 0 ? (
            <rect
              x={2 * CELL - 5}
              y={2 * CELL - 5}
              width={3 * CELL + 10}
              height={3 * CELL + 10}
              fill="none"
              stroke="#FF4D4D"
              strokeWidth={5}
              opacity={markCorner}
            />
          ) : null}
        </g>
      </g>
    </svg>
  );
};

/** OpenCV's verdict on the damaged code — not ours. */
const Verdict: React.FC<{ from: number; to?: number; ok: boolean; note: string }> = ({
  from,
  to,
  ok,
  note,
}) => (
  <Fade
    from={t(from)}
    to={to === undefined ? undefined : t(to)}
    style={{ position: 'absolute', top: 1358, left: 60, width: 960, textAlign: 'center' }}
  >
    <div
      style={{
        fontFamily: 'Archivo Black',
        fontSize: 62,
        color: ok ? '#3DDF7D' : '#FF4D4D',
        letterSpacing: -0.5,
      }}
    >
      {ok ? 'STILL SCANS' : "DOESN'T SCAN"}
    </div>
    <div
      style={{ fontFamily: 'IBM Plex Mono', fontSize: 38, color: '#81A2C4', marginTop: 12 }}
    >
      {note}
    </div>
  </Fade>
);

// ── the reel ────────────────────────────────────────────────────────────────

export const Qr: React.FC = () => {
  const frame = useCurrentFrame();
  const breath = useBreath();

  const stainPct = interpolate(
    frame,
    [t(T.stain[0]), t(T.stain[1])],
    [0, STATS.blobMax],
    ease,
  );
  const speckPct = interpolate(
    frame,
    [t(T.speck[0]), t(T.speck[1])],
    [0, STATS.speckleMax + 2],
    ease,
  );
  const sweep = interpolate(frame, [t(T.sweep[0]), t(T.sweep[1])], [0, 1], ease);

  // Each beat's visual outlives its label by half a second, so the code is never
  // bare on screen while one step hands over to the next.
  const HOLD = 0.5;
  const inStain = frame >= t(T.stain[0]) && frame < t(T.hookOut + HOLD);
  const inSweep = frame >= t(T.sweep[0]) && frame < t(T.s1Out + HOLD);
  const inSpeck = frame >= t(T.speck[0]) && frame < t(T.s2Out + HOLD);
  const inCorner = frame >= t(T.corner[0]) && frame < t(T.s3Out);

  let damaged = new Set<number>();
  if (inStain) damaged = blobDamaged(stainPct);
  else if (inSpeck) damaged = speckleDamaged(speckPct);
  else if (inCorner) {
    const k = Math.round(
      interpolate(frame, [t(T.corner[0]), t(T.corner[1])], [0, 9], ease),
    );
    damaged = new Set(CORNER.slice(0, k));
  }

  // The code is on screen from frame 0 to the last frame. It used to fade out for
  // the answer, which meant "three corners are not [optional]" was said over an
  // empty stage — the one moment the corners most needed to be visible.
  const cornerRings = interpolate(
    frame,
    [t(T.corner[0]), t(T.corner[0] + 0.5), t(T.s3Out), t(T.answer), t(T.answerOut)],
    [0, 1, 1, 1, 1],
    ease,
  );
  const pulse = frame < t(T.cta) ? 0 : 0.5 + 0.4 * Math.sin((frame - t(T.cta)) / 5.2);

  return (
    <AbsoluteFill>
      <ReelGround accent="#AD88FF" />

      <ReelHeader
        bigSize={64}
        big={
          <>
            How much of a QR code
            <br />
            can you <span style={{ color: '#AD88FF' }}>destroy</span>?
          </>
        }
        small={
          <>
            How much of a QR code can you{' '}
            <span style={{ color: '#AD88FF' }}>destroy</span>?
          </>
        }
        out={T.titleOut}
        in_={T.titleIn}
      />

      <div
        style={{
          position: 'absolute',
          top: QY,
          left: QX,
          transform: breath,
          transformOrigin: 'center center',
        }}
      >
        <Code
          damaged={damaged}
          sweep={inSweep ? sweep : 0}
          markCorner={
            inCorner
              ? interpolate(frame, [t(T.corner[0]), t(T.corner[0] + 0.4)], [0, 1], ease)
              : 0
          }
          cornerRings={frame >= t(T.corner[0]) && frame < t(T.answerOut) ? cornerRings : 0}
          pulse={pulse}
        />
      </div>

      {/* ── HOOK: no step label, no preamble. It is already being destroyed. ── */}
      <Verdict
        from={T.hookVerdict}
        to={T.hookOut}
        ok={verdictAt(BLOB, STATS.blobMax)}
        note={`${STATS.blobMaxOfSquare}% of the square, painted out`}
      />

      {/* ── 1. why it survived ───────────────────────────────────────────── */}
      <StepLabel
        n="STEP 1"
        title="Nothing is stored in one place"
        sub="Four blocks of data, coloured where they really sit."
        from={t(T.s1Label[0])}
        to={t(T.s1Label[1])}
      />
      <Fade
        from={t(T.s1Read)}
        to={t(T.s1Out)}
        style={{
          position: 'absolute',
          top: 1358,
          left: 60,
          width: 960,
          textAlign: 'center',
          fontFamily: 'IBM Plex Sans',
          fontSize: 44,
          color: '#E8E6E1',
          lineHeight: 1.3,
        }}
      >
        Every block is spread across the whole square.
        <br />
        <span style={{ fontFamily: 'IBM Plex Mono', color: '#81A2C4' }}>
          {STATS.correctsPerBlock} of its {STATS.blockTotal} pieces can be wrong
        </span>
      </Fade>

      {/* ── 2. the same damage, scattered ────────────────────────────────── */}
      <StepLabel
        n="STEP 2"
        title="Now scatter the same damage"
        sub="The same damage, sprinkled instead of blobbed."
        from={t(T.s2Label[0])}
        to={t(T.s2Label[1])}
      />
      <Verdict
        from={T.s2Verdict}
        to={T.s2Out}
        ok={verdictAt(SPECKLE, STATS.speckleMax + 2)}
        note={`it dies at ${STATS.speckleMaxOfSquare}%, not ${STATS.blobMaxOfSquare}%`}
      />

      {/* ── 3. the corner ────────────────────────────────────────────────── */}
      <StepLabel
        n="STEP 3"
        title="Now touch the corner"
        sub="Nine squares. Not one of them holds your data."
        from={t(T.s3Label[0])}
        to={t(T.s3Label[1])}
      />
      <Verdict
        from={T.s3Verdict}
        to={T.s3Out}
        ok={STATS.cornerOk}
        note={`nine squares — ${STATS.cornerPct}% of the code`}
      />

      {/* ── 4. the answer — said over the code, with its corners ringed ── */}
      <Fade
        from={t(T.answer)}
        to={t(T.answerOut)}
        style={{
          position: 'absolute',
          top: 470,
          left: 60,
          width: 960,
          textAlign: 'center',
        }}
      >
        <div style={{ transform: breath, transformOrigin: 'center center' }}>
          <div style={{ fontFamily: 'Archivo Black', fontSize: 78, color: '#AD88FF' }}>
            {STATS.blobMaxOfSquare}% can vanish
          </div>
        </div>
      </Fade>
      <Fade
        from={t(T.answer + 0.5)}
        to={t(T.answerOut)}
        style={{
          position: 'absolute',
          top: 1358,
          left: 60,
          width: 960,
          textAlign: 'center',
          fontFamily: 'IBM Plex Sans',
          fontSize: 48,
          color: '#E8E6E1',
          lineHeight: 1.35,
        }}
      >
        Most of the square is optional.
        <br />
        <span style={{ color: '#AD88FF' }}>Three corners are not.</span>
      </Fade>

      {/* ── 5. give the viewer something to do, and say where it goes ────── */}
      <Fade
        from={t(T.cta)}
        style={{
          position: 'absolute',
          top: 470,
          left: 60,
          width: 960,
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: 'Archivo Black', fontSize: 58, color: '#E8E6E1' }}>
          This one is real.
        </div>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontSize: 40,
            color: '#81A2C4',
            marginTop: 14,
          }}
        >
          Point your camera — it opens this account.
        </div>
      </Fade>

      {/*
        ── 6. the reason to follow: what the NEXT one does ──────────────────
        Vertically this is the tightest block in the reel, so the numbers are
        deliberate. The code's white square runs 690 -> 1347 and Progress sits at
        SAFE_BOTTOM - 6 = 1534, leaving a 187px band and nothing else.

        1358 was the first attempt and it was wrong: it clears the code on paper,
        but the code and this block breathe INDEPENDENTLY (+-5px translate, and
        the code's 1.012 scale adds ~4px to a 657px square), so at opposing
        phases they touch. Rendering it is what caught that -- the arithmetic
        said it fitted. 1382 centres the block in the band instead: ~35px of air
        above at rest, ~25px worst case, and it ends at ~1497, clear of Progress.
      */}
      <Fade
        from={t(T.next)}
        style={{
          position: 'absolute',
          top: 1382,
          left: 60,
          width: 960,
          textAlign: 'center',
        }}
      >
        <div style={{ transform: breath, transformOrigin: 'center center' }}>
          <div style={{ fontFamily: 'IBM Plex Sans', fontSize: 44, color: '#E8E6E1' }}>
            Next: why a JPEG stores{' '}
            <span style={{ color: '#AD88FF' }}>no pixels</span>.
          </div>
          <div
            style={{
              fontFamily: 'IBM Plex Mono',
              fontSize: 38,
              color: '#AD88FF',
              marginTop: 14,
            }}
          >
            @thedepthfirst
          </div>
        </div>
      </Fade>

      <Progress seconds={DURATION_SECONDS} />
    </AbsoluteFill>
  );
};
