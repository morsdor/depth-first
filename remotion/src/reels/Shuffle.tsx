import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
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
import {
  ARTISTS,
  EXAMPLES,
  EXACT_PAIRS,
  MEAN_PAIRS,
  PCT_CLEAN,
  PCT_CLUMPED,
  SONGS,
  SPREAD,
  TRIALS,
} from './data/shuffle';

/**
 * r005 · "Your shuffle isn't broken"  (backlog I07)
 *
 * Every arrangement on screen is a real Fisher-Yates shuffle from
 * projects/r005_shuffle/shuffle.py, and every figure is measured over 200,000 of
 * them. The closed form E[pairs] = sum k(k-1)/n is the self-check.
 *
 * WHAT THIS REEL DELIBERATELY DOES NOT SAY
 * The backlog hook names Spotify. That is an unverifiable claim about a company's
 * engineering from where this was built, so it is cut — see NOTES.md. The reel
 * shows both arrangements and lets the viewer pick, which is stronger than an
 * attribution anyway.
 *
 * ── Built from what r001–r004 measured ───────────────────────────────────────
 * Three things carried over. The opening object is legible AND in colour: r004
 * proved a legible hook buys reach (lowest skip rate of four, 5x r003's audience)
 * but ran grey for 32 of its 40s and lost the body. Twenty-four coloured tiles
 * are legible at thumbnail size and stay colourful throughout. And it is ~30s
 * against r004's 40s with three body beats against five — the untested direction
 * from that analysis, since the pacing rule budgets time per idea but says
 * nothing about how many ideas a viewer accepts.
 */

export const DURATION_SECONDS = 30;

const T = {
  // Movement by 0.5s. The first shuffle lands before the title has settled.
  // Bars start landing at 0.12s. The first cut opened at 0.3 and the audit
  // found half a second of empty frame at the very front — the one window
  // r003 proved decides reach.
  deal: [0.12, 0.95] as [number, number],
  flare: 1.4,
  hookVerdict: 2.4,
  titleOut: [4.4, 4.8] as [number, number],
  titleIn: [4.8, 5.15] as [number, number],
  hookOut: 5.4,

  // 1. it happens nearly every time
  s1Label: [5.8, 13.5] as [number, number],
  again: [6.8, 11.4] as [number, number],
  s1Read: 11.6,
  s1Out: 13.3,

  // 2. the arrangement that looks right is the less random one
  s2Label: [13.8, 21.5] as [number, number],
  toSpread: [15.0, 16.6] as [number, number],
  s2Verdict: 17.0,
  s2Out: 21.3,

  // 3/4. the answer, then the reason to follow
  answer: 21.8,
  answerOut: 25.4,
  next: 25.8,
};

// ── geometry ────────────────────────────────────────────────────────────────
// A VERTICAL LIST, because a playlist is a vertical list and, more importantly,
// because the claim is about songs that are ADJACENT. The first cut laid 24 tiles
// out as 4 rows of 6, and rendering it killed the idea: two songs back to back in
// the sequence land at opposite ends of the frame whenever the pair straddles a
// row end, so the lit tiles read as random highlighting rather than as a clump.
// In one column, adjacent in the shuffle IS adjacent on screen — and a clump
// literally fuses into one taller block of colour.
//
// 780 wide sits inside the 810 rail-safe width, so it never runs under
// Instagram's buttons. That is the r004 readout lesson.
//
// 620 wide, centred on the FRAME: 230..850, which clears the 870 rail. The first
// cut used 780 and the comment above claimed it was rail-safe — it is not when
// centred on 540, which puts the right edge at 930, under Instagram's buttons.
// SAFE_W is a width measured FROM x=60, not a width you may centre anywhere.
const GAP = 6;
const ROW_H = 28;
const GRID_W = 620;
const GRID_H = SONGS * ROW_H + (SONGS - 1) * GAP;
const GRID_X = 540 - GRID_W / 2;
const GRID_Y = 680;

const ACCENT = '#AD88FF'; // DOMAIN_ACCENT.data — §1, things you touch every day

/**
 * One colour per artist, as a computed ramp rather than six new hex literals, so
 * the palette stays closed (brand_guide_software.md §3a) and the colour ENCODES
 * which artist owns a slot rather than decorating it — the same device r003 used
 * for Reed-Solomon blocks.
 */
const RAMP_A = [173, 136, 255]; // #AD88FF violet — the domain accent
const RAMP_B = [0, 214, 247]; // #00D6F7 cyan
const artistColor = (a: number, lit: boolean): string => {
  const f = ARTISTS < 2 ? 0 : a / (ARTISTS - 1);
  const k = lit ? 1 : 0.55; // a clumped bar burns at full strength
  const ch = RAMP_A.map((x, i) => Math.round((x + (RAMP_B[i] - x) * f) * k));
  return `rgb(${ch.join(',')})`;
};

/** Slots whose neighbour in the strip is the same artist. The clump, literally. */
const clumped = (order: number[]): boolean[] => {
  const out = order.map(() => false);
  for (let i = 0; i < order.length - 1; i++) {
    if (order[i] === order[i + 1]) {
      out[i] = true;
      out[i + 1] = true;
    }
  }
  return out;
};

const Strip: React.FC<{ order: number[]; lit: number; dealt: number }> = ({
  order,
  lit,
  dealt,
}) => {
  const flags = clumped(order);
  return (
    <div style={{ position: 'relative', width: GRID_W, height: GRID_H }}>
      {order.map((a, i) => {
        const on = flags[i] && lit > 0;
        // A clumped pair loses the gap between it, so the two bars fuse into one
        // block. That fusion IS the thing the reel is about.
        const fuseDown = on && i < order.length - 1 && order[i + 1] === a;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              top: i * (ROW_H + GAP),
              width: GRID_W,
              height: ROW_H + (fuseDown ? GAP : 0),
              borderRadius: 6,
              background: artistColor(a, on),
              opacity: i < dealt ? 1 : 0,
            }}
          />
        );
      })}
    </div>
  );
};

export const Shuffle: React.FC = () => {
  const frame = useCurrentFrame();
  const breath = useBreath();
  // Same fix as Jpeg.tsx, for the same measured reason: useBreath alone is 1.2%
  // on a 9s period, which keeps a detailed plate alive but not a wall of flat
  // colour blocks. The audit found 1.75s under the stillness floor across step
  // 2's hold, where the spread arrangement sits still for 4.7s. Stage only —
  // the ground is frame-size and scaling it exposes its edges.
  const push = 1 + 0.05 * (0.5 - 0.5 * Math.cos((2 * Math.PI * frame) / (30 * 11)));

  const dealt = interpolate(frame, [t(T.deal[0]), t(T.deal[1])], [0, SONGS], ease);
  const lit = frame >= t(T.flare) ? 1 : 0;

  // Beat 1 reshuffles in front of you. Each of these is a real run, not a redraw:
  // EXAMPLES[i] came out of Fisher-Yates with the pair count printed beside it.
  const shuffleIndex = Math.min(
    EXAMPLES.length - 1,
    Math.max(
      0,
      Math.floor(interpolate(frame, [t(T.again[0]), t(T.again[1])], [0, EXAMPLES.length], ease)),
    ),
  );
  const inAgain = frame >= t(T.again[0]) && frame < t(T.s2Label[0]);
  const inSpread = frame >= t(T.toSpread[0]);

  const order = inSpread ? SPREAD : inAgain ? EXAMPLES[shuffleIndex] : EXAMPLES[0];

  return (
    <AbsoluteFill>
      <ReelGround accent={ACCENT} />

      <ReelHeader
        bigSize={72}
        big={
          <>
            Your shuffle
            <br />
            isn&apos;t <span style={{ color: ACCENT }}>broken</span>
          </>
        }
        small={
          <>
            Your shuffle isn&apos;t <span style={{ color: ACCENT }}>broken</span>
          </>
        }
        out={T.titleOut}
        in_={T.titleIn}
      />

      <div
        style={{
          position: 'absolute',
          top: GRID_Y,
          left: GRID_X,
          transform: `${breath} scale(${push.toFixed(4)})`,
          transformOrigin: 'center center',
        }}
      >
        <Strip order={order} lit={lit} dealt={Math.round(dealt)} />
      </div>

      {/* ── HOOK: no step label. The clumps are already burning. ─────────── */}
      <Fade
        from={t(T.hookVerdict)}
        to={t(T.hookOut)}
        style={{
          position: 'absolute',
          top: 1300,
          left: 60,
          width: 960,
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: 'Archivo Black', fontSize: 66, color: ACCENT }}>
          {PCT_CLUMPED}%
        </div>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontSize: 40,
            color: '#81A2C4',
            marginTop: 10,
          }}
        >
          of real shuffles do this
        </div>
      </Fade>

      {/* ── 1. again, and again ──────────────────────────────────────────── */}
      <StepLabel
        n="STEP 1"
        title="Shuffle it again"
        sub="Same playlist, a genuinely random order."
        from={t(T.s1Label[0])}
        to={t(T.s1Label[1])}
      />
      <Fade
        from={t(T.s1Read)}
        to={t(T.s1Out)}
        style={{ position: 'absolute', top: 1240, left: 60, width: SAFE_W }}
      >
        {/*
          Short labels are not a style choice. IBM Plex Mono at 36px runs about
          21px a character, so a label and value together have roughly 38
          characters inside SAFE_W before the row wraps and the third one falls
          under the progress bar. The first cut wrapped on two of three rows.
        */}
        {(
          [
            ['with a repeat', `${PCT_CLUMPED}%`],
            ['comes out clean', `${PCT_CLEAN}%`],
            ['shuffles run', TRIALS.toLocaleString('en-US')],
          ] as [string, string][]
        ).map(([k, v]) => (
          <div
            key={k}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '2px solid #274064',
              padding: '12px 4px',
              fontFamily: 'IBM Plex Mono',
              fontSize: 36,
            }}
          >
            <span style={{ color: '#81A2C4' }}>{k}</span>
            <span style={{ color: '#E8E6E1' }}>{v}</span>
          </div>
        ))}
      </Fade>

      {/* ── 2. the one that looks right ──────────────────────────────────── */}
      <StepLabel
        n="STEP 2"
        title="Now the one you expected"
        sub="Never the same artist twice in a row."
        from={t(T.s2Label[0])}
        to={t(T.s2Label[1])}
      />
      <Fade
        from={t(T.s2Verdict)}
        to={t(T.s2Out)}
        style={{
          position: 'absolute',
          top: 1290,
          left: 60,
          width: 960,
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: 'Archivo Black', fontSize: 54, color: ACCENT }}>
          This is the less random one
        </div>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontSize: 38,
            color: '#81A2C4',
            marginTop: 12,
            lineHeight: 1.3,
          }}
        >
          it is built to avoid repeats, so most
          <br />
          orderings can never come out of it
        </div>
      </Fade>

      {/* ── 3. the answer ────────────────────────────────────────────────── */}
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
          <div style={{ fontFamily: 'Archivo Black', fontSize: 68, color: ACCENT }}>
            Clumping is the proof
          </div>
        </div>
      </Fade>
      <Fade
        from={t(T.answer + 0.5)}
        to={t(T.answerOut)}
        style={{
          position: 'absolute',
          top: 1290,
          left: 60,
          width: 960,
          textAlign: 'center',
          fontFamily: 'IBM Plex Sans',
          fontSize: 44,
          color: '#E8E6E1',
          lineHeight: 1.35,
        }}
      >
        Expected repeats per shuffle: {EXACT_PAIRS.toFixed(2)}.
        <br />
        <span style={{ color: ACCENT }}>Measured: {MEAN_PAIRS.toFixed(2)}.</span>
      </Fade>

      {/* ── 4. the reason to follow ──────────────────────────────────────── */}
      <Fade
        from={t(T.next)}
        style={{
          position: 'absolute',
          top: 1284,
          left: 60,
          width: 960,
          textAlign: 'center',
        }}
      >
        <div style={{ transform: breath, transformOrigin: 'center center' }}>
          <div
            style={{
              fontFamily: 'IBM Plex Sans',
              fontSize: 42,
              color: '#E8E6E1',
              lineHeight: 1.3,
            }}
          >
            Next: the six digits your phone
            <br />
            and a server <span style={{ color: ACCENT }}>both guess</span>, offline.
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
