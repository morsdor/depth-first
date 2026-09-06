import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import {
  Fade,
  Progress,
  ReelGround,
  ReelHeader,
  SAFE_W,
  StepLabel,
  useBreath,
  ease,
  t,
} from './lib/chrome';
import { COLOUR, DONE_DELTA, DONE_N, EXAMPLE, QUALITY, STATS, STOPS } from './data/jpeg';

/**
 * r004 · "A JPEG stores no pixels"  (backlog I03)
 *
 * Every frame of the assembly and every number on screen is measured output from
 * projects/r004_jpeg/dct.py, which builds the 64 DCT-II basis images from the
 * cosine definition, transforms a real photograph block by block, quantises it
 * with the table libjpeg itself used, and reconstructs progressively while
 * measuring the error at every coefficient count. Nothing here is a blur filter.
 *
 * ── Built from what r001–r003 measured ──────────────────────────────────────
 * r003 was the reel built to fix the opening and it lost half its audience at
 * ~2s, EARLIER than r001 did. The most likely reason is that a QR matrix reads
 * as static at 0.5s: hook-first timing was satisfied on the clock but not in the
 * eye. So this one opens on the most legible object there is — a human face —
 * and the face is what assembles. Measured on the real run: N=1 is an
 * unreadable mosaic, a face is unmistakable by N=3, both faces by N=6.
 *
 * The scale is doing real work. At 64 blocks across, keeping one coefficient per
 * block is still a 64x64 thumbnail and already recognisable, so there is no
 * progression to watch. At 16 blocks across there is. See dct.py's note on --size.
 */

export const DURATION_SECONDS = 40;

const T = {
  // ── HOOK: it is already assembling. No step label, no preamble. ───────────
  //
  // Four points, not two, and the reason is measurable. The plate only redraws
  // when N crosses a STOP, so a linear 1->6 ramp leaves the first REDRAW until
  // ~1.1s -- and sampling the encoded file at 4fps duly found 1.25s of near-zero
  // change at the front of the reel, which is the one window that decides reach.
  // Stepping 1->2->3 inside the first 0.8s puts real movement at 0.5s, then the
  // climb to 6 slows down so the face arrives rather than snapping in.
  build: [0.25, 0.5, 0.8, 3.4] as [number, number, number, number],
  hookVerdict: 3.6,
  titleOut: [5.5, 5.9] as [number, number],
  titleIn: [5.9, 6.25] as [number, number],
  hookOut: 6.0,

  // ── 1. the 64 patterns ────────────────────────────────────────────────────
  s1Label: [6.0, 12.5] as [number, number],
  basis: [7.0, 9.8] as [number, number],
  s1Read: 10.2,
  s1Out: 12.3,

  // ── 2. the climb — which stops mattering long before 64 ───────────────────
  s2Label: [12.5, 19.0] as [number, number],
  climb: [13.6, 17.2] as [number, number],
  s2Read: 17.4,
  s2Out: 18.8,

  // ── 3. and then most of them are deleted ──────────────────────────────────
  s3Label: [19.0, 25.5] as [number, number],
  zero: [20.2, 22.2] as [number, number],
  s3Verdict: 22.5,
  s3Out: 25.3,

  // ── 4. colour, which the first cut popped to without ever explaining ──────
  s4Label: [25.5, 32.0] as [number, number],
  swapIn: 26.8,
  swapTo: [28.6, 29.2] as [number, number],
  s4Verdict: 29.5,
  s4Out: 31.8,

  // ── 5/6. the answer, then the reason to follow ────────────────────────────
  answer: 32.2,
  answerOut: 35.8,
  next: 36.2,
};

// ── geometry ────────────────────────────────────────────────────────────────
// 640 = 16 blocks x 40px, so one 8x8 block is 40 screen pixels and the mosaic is
// a thing the eye can resolve. Centred on the frame, the right edge lands at 860
// — inside the 870 action-rail limit, the same constraint r003's code obeyed.
const STAGE = 640;
const STAGE_X = 540 - STAGE / 2;
const STAGE_Y = 680;
const CELL = STAGE / 8;

const ACCENT = '#AD88FF'; // DOMAIN_ACCENT.data — §1, things you touch every day

/** The reconstruction PNG for a coefficient count: the largest stop at or below n. */
const stopAt = (n: number): number => {
  let s = STOPS[0];
  for (const v of STOPS) if (v <= n) s = v;
  return s;
};

/**
 * All eleven reconstructions are mounted at once and cross-faded by opacity.
 * Swapping the src instead would pop on first paint of each new file, which on a
 * 2s assembly is a visible stutter exactly where the reel can least afford one.
 *
 * `pixelated` is not a style choice — the 8x8 block IS the subject, and letting
 * the browser smooth a 5x upscale would erase the thing being demonstrated.
 */
const Plate: React.FC<{ n: number }> = ({ n }) => {
  const active = stopAt(n);
  return (
    <>
      {STOPS.map((s) => (
        <Img
          key={s}
          src={staticFile(`reels/r004_recon_${String(s).padStart(2, '0')}.png`)}
          style={{
            position: 'absolute',
            width: STAGE,
            height: STAGE,
            imageRendering: 'pixelated',
            opacity: s === active ? 1 : 0,
          }}
        />
      ))}
    </>
  );
};

/** The 64 basis images, revealed as a wipe crosses them. */
const Basis: React.FC<{ reveal: number }> = ({ reveal }) => (
  <div style={{ position: 'relative', width: STAGE, height: STAGE }}>
    <Img
      src={staticFile('reels/r004_basis.png')}
      style={{ width: STAGE, height: STAGE, imageRendering: 'pixelated' }}
    />
    {/* the un-revealed remainder, wiped away diagonally */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#040E1F',
        opacity: 0.92,
        clipPath: `polygon(${reveal * 200}% 0, 200% 0, 200% 200%, ${reveal * 200 - 100}% 200%)`,
      }}
    />
  </div>
);

/**
 * One real block's 64 quantised coefficients. The zeros are what the beat is
 * about, so they are the only thing that stays lit once the wave has passed.
 */
const Coefficients: React.FC<{ zeroed: number }> = ({ zeroed }) => {
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const v = EXAMPLE.quantised[r][c];
      // Zeros arrive in zigzag-ish order: the further from DC, the sooner it dies.
      const dist = (r + c) / 14;
      const gone = v === 0 && dist <= zeroed;
      cells.push(
        <div
          key={`${r}-${c}`}
          style={{
            position: 'absolute',
            left: c * CELL,
            top: r * CELL,
            width: CELL,
            height: CELL,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'IBM Plex Mono',
            fontSize: 36,
            color: gone ? ACCENT : '#E8E6E1',
            opacity: gone ? 1 : v === 0 ? 0.55 : 0.85,
            border: '2px solid #274064',
          }}
        >
          {gone ? '0' : v}
        </div>,
      );
    }
  }
  return <div style={{ position: 'relative', width: STAGE, height: STAGE }}>{cells}</div>;
};

// ── the reel ────────────────────────────────────────────────────────────────

export const Jpeg: React.FC = () => {
  const frame = useCurrentFrame();
  const breath = useBreath();
  // Long period, never repeats visibly, and it rides ON TOP of useBreath rather
  // than replacing it. The ground must not scale (it is frame-size, and scaling
  // exposes its edges) so this is applied to the stage only.
  const push = 1 + 0.05 * (0.5 - 0.5 * Math.cos((2 * Math.PI * frame) / (30 * 11)));

  const hookN = interpolate(frame, T.build.map(t), [1, 2, 3, 6], ease);
  const climbN = interpolate(frame, [t(T.climb[0]), t(T.climb[1])], [1, DONE_N], ease);
  const basisReveal = interpolate(frame, [t(T.basis[0]), t(T.basis[1])], [0, 1], ease);
  const zeroed = interpolate(frame, [t(T.zero[0]), t(T.zero[1])], [0, 1], ease);

  // Each stage outlives its label by half a second, so the frame is never bare
  // while one beat hands over to the next.
  const HOLD = 0.5;
  const inHook = frame < t(T.hookOut + HOLD);
  // (T.build[0] is the first frame anything moves; the plate before it is N=1.)
  const inBasis = frame >= t(T.basis[0]) && frame < t(T.s1Out + HOLD);
  const inClimb = frame >= t(T.climb[0]) && frame < t(T.s2Out + HOLD);
  const inCoeff = frame >= t(T.zero[0]) && frame < t(T.s3Out + HOLD);
  const inColour = frame >= t(T.swapIn) && frame < t(T.s4Out + HOLD);
  const inFinal = frame >= t(T.answer);

  // The A/B that answers "so where does the colour come from?": the same 16x
  // squash applied to colour, then to brightness. Sequential rather than side by
  // side — two 300px panels on a phone is two things nobody looks at.
  const toLuma = interpolate(
    frame,
    [t(T.swapTo[0]), t(T.swapTo[1])],
    [0, 1],
    ease,
  );

  const shownN = inClimb ? climbN : inHook ? hookN : 64;

  // The colour photograph arrives only on the last beat: the transform stage runs
  // on luma, so everything before this is honestly grey.
  const colour = interpolate(
    frame,
    [t(T.next), t(T.next + 1.2)],
    [0, 1],
    ease,
  );

  return (
    <AbsoluteFill>
      <ReelGround accent={ACCENT} />

      <ReelHeader
        bigSize={68}
        big={
          <>
            Your photos contain
            <br />
            <span style={{ color: ACCENT }}>no pixels</span>
          </>
        }
        small={
          <>
            Your photos contain <span style={{ color: ACCENT }}>no pixels</span>
          </>
        }
        out={T.titleOut}
        in_={T.titleIn}
      />

      {/* ── the stage ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: STAGE_Y,
          left: STAGE_X,
          width: STAGE,
          height: STAGE,
          transform: `${breath} scale(${push.toFixed(4)})`,
          transformOrigin: 'center center',
        }}
      >
        {inBasis && !inClimb ? (
          <Basis reveal={basisReveal} />
        ) : inCoeff ? (
          <Coefficients zeroed={zeroed} />
        ) : inColour ? (
          <>
            <Img
              src={staticFile('reels/r004_chroma_16.png')}
              style={{ position: 'absolute', width: STAGE, height: STAGE }}
            />
            <Img
              src={staticFile('reels/r004_luma_16.png')}
              style={{
                position: 'absolute',
                width: STAGE,
                height: STAGE,
                opacity: toLuma,
              }}
            />
          </>
        ) : (
          <>
            <Plate n={shownN} />
            {inFinal ? (
              <Img
                src={staticFile('reels/r004_photo_color.png')}
                style={{
                  position: 'absolute',
                  width: STAGE,
                  height: STAGE,
                  opacity: colour,
                }}
              />
            ) : null}
          </>
        )}
      </div>

      {/* ── HOOK: no step label. The face is already arriving. ────────────── */}
      <Fade
        from={t(T.hookVerdict)}
        to={t(T.hookOut)}
        style={{
          position: 'absolute',
          top: 1358,
          left: 60,
          width: 960,
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: 'Archivo Black', fontSize: 62, color: ACCENT }}>
          6 numbers a square
        </div>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontSize: 40,
            color: '#81A2C4',
            marginTop: 10,
          }}
        >
          and not one of them is a pixel
        </div>
      </Fade>

      {/* ── 1. the 64 patterns ────────────────────────────────────────────── */}
      <StepLabel
        n="STEP 1"
        title="It stores a recipe"
        sub="Every 8×8 square is a mix of these 64."
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
        Flat grey top-left, finest detail bottom-right.
        <br />
        <span style={{ color: ACCENT }}>A photo is just how much of each.</span>
      </Fade>

      {/* ── 2. the climb, with the error measured at every step ───────────── */}
      <StepLabel
        n="STEP 2"
        title="Add them back, coarsest first"
        sub="The order a JPEG itself stores them in."
        from={t(T.s2Label[0])}
        to={t(T.s2Label[1])}
      />
      {inClimb && frame < t(T.s2Read) ? (
        <div
          style={{
            position: 'absolute',
            top: 1358,
            left: 60,
            width: 960,
            textAlign: 'center',
            fontFamily: 'IBM Plex Mono',
            fontSize: 56,
            color: ACCENT,
          }}
        >
          {Math.round(shownN)} / 64
        </div>
      ) : null}
      {/*
        It stops at DONE_N, not 64. Counting the last twenty on screen is dead
        time — measured against the finished reconstruction, they move it by less
        than DONE_DELTA of 255, which is not a thing an eye can find.
      */}
      <Fade
        from={t(T.s2Read)}
        to={t(T.s2Out)}
        style={{ position: 'absolute', top: 1340, left: 60, width: SAFE_W }}
      >
        {(
          [
            ['stops changing at', `${DONE_N} of 64`],
            ['the last 20 move it by', `${DONE_DELTA.toFixed(2)} of 255`],
          ] as [string, string][]
        ).map(([k, v]) => (
          <div
            key={k}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '2px solid #274064',
              padding: '14px 4px',
              fontFamily: 'IBM Plex Mono',
              fontSize: 38,
            }}
          >
            <span style={{ color: '#81A2C4' }}>{k}</span>
            <span style={{ color: '#E8E6E1' }}>{v}</span>
          </div>
        ))}
      </Fade>

      {/* ── 3. and then most of them are thrown away ──────────────────────── */}
      <StepLabel
        n="STEP 3"
        title="Then it deletes most of them"
        sub="The eye cannot resolve the finest ones."
        from={t(T.s3Label[0])}
        to={t(T.s3Label[1])}
      />
      <Fade
        from={t(T.s3Verdict)}
        to={t(T.s3Out)}
        style={{
          position: 'absolute',
          top: 1358,
          left: 60,
          width: 960,
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: 'Archivo Black', fontSize: 58, color: ACCENT }}>
          {EXAMPLE.zeros} of these 64 → 0
        </div>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontSize: 38,
            color: '#81A2C4',
            marginTop: 10,
          }}
        >
          the busiest square in the picture, at quality {QUALITY}
        </div>
      </Fade>

      {/*
        ── 4. colour ────────────────────────────────────────────────────────
        The first cut ran grey and then popped to colour with no explanation,
        which invites exactly one question and answers none of it. Colour is not
        deduced: it is stored separately and coarsely, and the A/B proves it.
        The claim is about what libjpeg does at this quality (measured: 4:2:0) —
        the source file is 4:4:4, so nothing is claimed about the source.
      */}
      <StepLabel
        n="STEP 4"
        title="Colour is stored separately"
        sub={`And coarsely — the encoder picks ${COLOUR.encoderSampling}.`}
        from={t(T.s4Label[0])}
        to={t(T.s4Label[1])}
      />
      <Fade
        from={t(T.swapIn)}
        to={t(T.s4Verdict)}
        style={{
          position: 'absolute',
          top: 1358,
          left: 60,
          width: 960,
          textAlign: 'center',
          fontFamily: 'IBM Plex Mono',
          fontSize: 44,
          color: ACCENT,
        }}
      >
        {toLuma < 0.5 ? 'colour squashed 16×' : 'brightness squashed 16×'}
      </Fade>
      <Fade
        from={t(T.s4Verdict)}
        to={t(T.s4Out)}
        style={{
          position: 'absolute',
          top: 1352,
          left: 60,
          width: 960,
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: 'Archivo Black', fontSize: 54, color: ACCENT }}>
          Same squash. {(COLOUR.lumaError['16'] / COLOUR.chromaError['16']).toFixed(1)}× the damage.
        </div>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontSize: 38,
            color: '#81A2C4',
            marginTop: 10,
            lineHeight: 1.3,
          }}
        >
          colour {COLOUR.chromaError['16']} of 255 · brightness{' '}
          {COLOUR.lumaError['16']} of 255
        </div>
      </Fade>

      {/* ── 5. the answer, over the finished photograph ───────────────────── */}
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
          <div style={{ fontFamily: 'Archivo Black', fontSize: 78, color: ACCENT }}>
            {STATS.zeroPct}% deleted
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
          fontSize: 46,
          color: '#E8E6E1',
          lineHeight: 1.35,
        }}
      >
        Of every number in this photograph.
        <br />
        <span style={{ color: ACCENT }}>You have never noticed.</span>
      </Fade>

      {/*
        ── 5. the reason to follow ──────────────────────────────────────────
        r003's end frame asked viewers to scan a QR code on the screen they were
        holding, which nobody can do, and converted 0 of ~230 who reached it.
        This asks for nothing but names what is next, and holds 4.6s.
        Geometry as in Qr.tsx: the stage ends at 1320 and Progress sits at 1534.
      */}
      <Fade
        from={t(T.next)}
        style={{
          position: 'absolute',
          top: 1348,
          left: 60,
          width: 960,
          textAlign: 'center',
        }}
      >
        <div style={{ transform: breath, transformOrigin: 'center center' }}>
          <div
            style={{
              fontFamily: 'IBM Plex Sans',
              fontSize: 40,
              color: '#E8E6E1',
              lineHeight: 1.3,
            }}
          >
            Next: why your phone checks{' '}
            <span style={{ color: ACCENT }}>300 roads</span>
            <br />
            instead of 300,000.
          </div>
          <div
            style={{
              fontFamily: 'IBM Plex Mono',
              fontSize: 38,
              color: ACCENT,
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
