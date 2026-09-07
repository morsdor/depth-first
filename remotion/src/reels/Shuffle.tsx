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
 * Every arrangement is a real Fisher-Yates shuffle from
 * projects/r005_shuffle/shuffle.py, measured over 200,000 of them. The closed
 * form E[pairs] = sum k(k-1)/n is the self-check. The reel does NOT name any
 * music company — see NOTES.md for the claim that was cut and why.
 *
 * ── Rebuilt after the first cut was watched ──────────────────────────────────
 * The first cut drew the playlist as 16 coloured bars and failed twice.
 *
 * It was not UNDERSTANDABLE: nothing on screen said "music". No rows, no artist
 * names, no player. The playlist had been abstracted into a bar chart and the
 * viewer was expected to make the leap back. That is the r003 finding — a legible
 * shape is not a recognisable object — in a new costume.
 *
 * And it was STATIC in a way the stillness audit could not see. That audit
 * measures mean inter-frame pixel change, so the slow stage push satisfies it
 * without anything HAPPENING: three arrangement swaps in thirty seconds, drifting
 * in between. Pixel change is a proxy for motion, not for event density, and on
 * r001-r004 the two were never allowed to come apart.
 *
 * So the queue now PLAYS. A playhead runs down it continuously, and a clump is an
 * event you watch arrive — two rows flaring as the counter ticks — rather than a
 * state you are told about after the fact.
 */

export const DURATION_SECONDS = 36;

const T = {
  deal: [0.12, 0.85] as [number, number],
  sweep1: [0.9, 4.6] as [number, number],
  hookVerdict: 4.4,
  titleOut: [5.6, 6.0] as [number, number],
  titleIn: [6.0, 6.35] as [number, number],
  hookOut: 7.6,

  s1Label: [7.8, 16.5] as [number, number],
  reshuffle: 8.4,
  s1Read: 12.6,
  s1Out: 16.2,

  s2Label: [16.8, 25.5] as [number, number],
  respread: 17.4,
  s2Verdict: 21.6,
  s2Out: 25.2,

  answer: 25.9,
  answerOut: 29.9,
  next: 30.3,
};

// ── geometry ────────────────────────────────────────────────────────────────
// 620 wide centred on the frame is 230..850, clear of the 870 action rail.
// SAFE_W is a width measured FROM x=60 — it is not a width you may centre.
const ROW_H = 46;
const GAP = 6;
const LIST_W = 620;
const LIST_H = SONGS * ROW_H + (SONGS - 1) * GAP;
const LIST_X = 540 - LIST_W / 2;
const LIST_Y = 672;

const ACCENT = '#AD88FF'; // DOMAIN_ACCENT.data — §1, things you touch every day

/** One colour per artist as a computed ramp, so the palette stays closed. */
const RAMP_A = [173, 136, 255]; // #AD88FF violet
const RAMP_B = [0, 214, 247]; // #00D6F7 cyan
const artistColor = (a: number, k = 1): string => {
  const f = ARTISTS < 2 ? 0 : a / (ARTISTS - 1);
  const ch = RAMP_A.map((x, i) => Math.round((x + (RAMP_B[i] - x) * f) * k));
  return `rgb(${ch.join(',')})`;
};

const NAMES = ['Artist A', 'Artist B', 'Artist C', 'Artist D', 'Artist E', 'Artist F'];

/** True where this row and the one before it are the same artist. */
const repeats = (order: number[]): boolean[] =>
  order.map((a, i) => i > 0 && order[i - 1] === a);

/**
 * Maximal runs of the same artist, length >= 2.
 *
 * This is the fix for the thing that made the reel WRONG rather than unclear. A
 * viewer reading a list where "Artist A" appears four times and a caption saying
 * "no repeats" concludes, correctly, that the caption is lying. The claim was
 * never about an artist appearing again — it is about appearing BACK TO BACK —
 * and neither the word "repeat" nor a per-row tag carried that. A run is drawn
 * as one fused block with a bracket, so adjacency is a thing you can see rather
 * than a property you are asked to infer.
 */
const runsOf = (order: number[]): { start: number; len: number }[] => {
  const out: { start: number; len: number }[] = [];
  let i = 0;
  while (i < order.length) {
    let j = i;
    while (j + 1 < order.length && order[j + 1] === order[i]) j++;
    if (j > i) out.push({ start: i, len: j - i + 1 });
    i = j + 1;
  }
  return out;
};

const Queue: React.FC<{
  order: number[];
  head: number;
  dealt: number;
  revealed: number;
}> = ({ order, head, dealt, revealed }) => {
  const rep = repeats(order);
  const cur = Math.floor(head);
  // How far through the current song the playhead is. This is what makes the
  // frame move EVERY frame rather than once per row: a 620px fill sweeping a row
  // changes far more pixels than a 6px marker stepping down a list, and event
  // density — not drift — is what the viewer reads as "something is happening".
  const frac = head - cur;
  return (
    <div style={{ position: 'relative', width: LIST_W, height: LIST_H }}>
      {order.map((a, i) => {
        const played = i < cur;
        const active = i === cur;
        // A repeat only counts once the playhead has reached it — the viewer
        // sees it land rather than being shown the answer in advance.
        const caught = rep[i] && i <= revealed;
        const lit = active || caught;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              top: i * (ROW_H + GAP),
              width: LIST_W,
              height: ROW_H,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              paddingLeft: 12,
              overflow: 'hidden',
              // the playing row tints toward its own artist — a computed rgb() from the
              // ramp, not a new hex, so the palette stays closed (brand:check rejected
              // the literal I first reached for)
              background: caught
                ? artistColor(a, 0.42)
                : active
                  ? artistColor(a, 0.2)
                  : '#0D1F3C',
              outline: caught ? `3px solid ${artistColor(a)}` : 'none',
              opacity: i < dealt ? (played && !caught ? 0.55 : 1) : 0,
            }}
          >
            {/* the song playing, filling left to right */}
            {active ? (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: LIST_W * frac,
                  height: ROW_H,
                  borderRadius: 8,
                  background: artistColor(a, 0.5),
                }}
              />
            ) : null}
            <div
              style={{
                position: 'relative',
                width: 30,
                height: 30,
                borderRadius: 6,
                background: artistColor(a, lit ? 1 : 0.72),
              }}
            />
            <div
              style={{
                position: 'relative',
                fontFamily: 'IBM Plex Sans',
                fontSize: 36,
                color: lit ? '#E8E6E1' : '#81A2C4',
              }}
            >
              {NAMES[a]}
            </div>

          </div>
        );
      })}
      {/* Runs, once the playhead has passed through them: one bracketed block
          spanning the whole run, labelled in words the viewer already has. */}
      {runsOf(order)
        .filter((r) => r.start <= revealed)
        .map((r) => {
          const a = order[r.start];
          const top = r.start * (ROW_H + GAP) - 4;
          const height = r.len * ROW_H + (r.len - 1) * GAP + 8;
          return (
            <div key={`run-${r.start}`}>
              <div
                style={{
                  position: 'absolute',
                  left: -6,
                  top,
                  width: LIST_W + 12,
                  height,
                  borderRadius: 12,
                  border: `4px solid ${artistColor(a)}`,
                  pointerEvents: 'none',
                }}
              />
              {/* Inside the block, not beside it: the list already reaches x=850
                  and anything hung off its right edge lands under the action
                  rail. The rows carry the artist name on the left, so the right
                  half is free. */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: top + height / 2 - 24,
                  width: LIST_W - 18,
                  textAlign: 'right',
                  fontFamily: 'IBM Plex Mono',
                  fontSize: 36,
                  color: artistColor(a),
                  whiteSpace: 'nowrap',
                }}
              >
                back to back
              </div>
            </div>
          );
        })}

      {/* the playhead itself — a continuously moving bar, not a row highlight */}
      {head >= 0 && head < SONGS ? (
        <div
          style={{
            position: 'absolute',
            left: -14,
            top: head * (ROW_H + GAP),
            width: 6,
            height: ROW_H,
            borderRadius: 3,
            background: '#00D6F7',
          }}
        />
      ) : null}
    </div>
  );
};

export const Shuffle: React.FC = () => {
  const frame = useCurrentFrame();
  const breath = useBreath();

  const dealt = interpolate(frame, [t(T.deal[0]), t(T.deal[1])], [0, SONGS], ease);

  // THE QUEUE NEVER STOPS PLAYING.
  //
  // The previous cut ran the playhead only inside three defined sweeps — about
  // 12s of a 30s reel — and let the list sit still through every verdict, readout
  // and hold. Measured: 26% of samples had real change against r004's 42%, which
  // is the "not much happens" the first viewing found. A music player does not
  // pause while you read a caption, so this one does not either: the head loops
  // continuously from the first beat to the last frame, restarting whenever the
  // order changes.
  //
  // EXAMPLES are three real Fisher-Yates runs with 2, 0 and 4 repeats. The reel
  // shows the two that clump, which is the REPRESENTATIVE choice rather than a
  // flattering one: 96.82% of shuffles do. EXAMPLES[1] is the 3.18% case and
  // showing it as "what a shuffle looks like" would be the misleading edit.
  const beats: { from: number; order: number[] }[] = [
    { from: T.sweep1[0], order: EXAMPLES[2] },
    { from: T.reshuffle, order: EXAMPLES[0] },
    { from: T.respread, order: SPREAD },
    { from: T.answer, order: EXAMPLES[2] },
  ];
  const beat = beats.filter((b) => frame >= t(b.from)).pop();
  const order = beat ? beat.order : EXAMPLES[2];
  const SONG_FRAMES = 9; // 0.3s a song, so a full pass is 3.6s and then it loops
  const elapsed = beat ? frame - t(beat.from) : -1;
  const head = beat ? (elapsed / SONG_FRAMES) % SONGS : -1;
  // Marks appear as the playhead reaches them on the FIRST pass, then stay. The
  // loop was un-drawing them every time it wrapped, so by the time the hook's
  // verdict landed the clumps it was talking about were no longer marked.
  const revealed =
    beat && elapsed >= SONG_FRAMES * SONGS ? SONGS : Math.floor(head);

  const caughtSoFar = repeats(order).filter((r, i) => r && i <= revealed).length;
  // The counter shares the bottom slot with every readout, verdict and the
  // closing block, and making the queue play for the whole reel turned that into
  // three overlapping texts. It shows only while that slot is otherwise free:
  // during the hook, and in the run-up to each step's own verdict.
  const counterVisible =
    (frame >= t(T.sweep1[0]) && frame < t(T.hookVerdict)) ||
    (frame >= t(T.reshuffle) && frame < t(T.s1Read)) ||
    (frame >= t(T.respread) && frame < t(T.s2Verdict));

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
          top: LIST_Y,
          left: LIST_X,
          transform: breath,
          transformOrigin: 'center center',
        }}
      >
        <Queue order={order} head={head} dealt={Math.round(dealt)} revealed={revealed} />
      </div>

      {/* the live counter — the thing that makes a clump an event */}
      {counterVisible ? (
        <div
          style={{
            position: 'absolute',
            top: 1320,
            left: 60,
            width: 960,
            textAlign: 'center',
            fontFamily: 'IBM Plex Mono',
            fontSize: 44,
            color: caughtSoFar > 0 ? ACCENT : '#81A2C4',
          }}
        >
          back to back so far: {caughtSoFar}
        </div>
      ) : null}

      <Fade
        from={t(T.hookVerdict)}
        to={t(T.hookOut)}
        style={{
          position: 'absolute',
          top: 1400,
          left: 60,
          width: 960,
          textAlign: 'center',
          fontFamily: 'Archivo Black',
          fontSize: 56,
          color: ACCENT,
        }}
      >
        {PCT_CLUMPED}% of shuffles
      </Fade>

      {/* ── 1. again, with a different random order ───────────────────────── */}
      <StepLabel
        n="STEP 1"
        title="Shuffle it again"
        sub="Same songs, a genuinely random order."
        from={t(T.s1Label[0])}
        to={t(T.s1Label[1])}
      />
      <Fade
        from={t(T.s1Read)}
        to={t(T.s1Out)}
        style={{ position: 'absolute', top: 1330, left: 60, width: SAFE_W }}
      >
        {(
          [
            ['back to back', `${PCT_CLUMPED}%`],
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
              padding: '8px 4px',
              fontFamily: 'IBM Plex Mono',
              fontSize: 36,
            }}
          >
            <span style={{ color: '#81A2C4' }}>{k}</span>
            <span style={{ color: '#E8E6E1' }}>{v}</span>
          </div>
        ))}
      </Fade>

      {/* ── 2. the order people actually expect ───────────────────────────── */}
      <StepLabel
        n="STEP 2"
        title="Now the one you expected"
        sub="Never twice in a row — which is the whole trick."
        from={t(T.s2Label[0])}
        to={t(T.s2Label[1])}
      />
      <Fade
        from={t(T.s2Verdict)}
        to={t(T.s2Out)}
        style={{
          position: 'absolute',
          top: 1370,
          left: 60,
          width: 960,
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: 'Archivo Black', fontSize: 50, color: ACCENT }}>
          This is the less random one
        </div>
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontSize: 38,
            color: '#81A2C4',
            marginTop: 8,
          }}
        >
          it is built so that can never happen
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
          <div style={{ fontFamily: 'Archivo Black', fontSize: 64, color: ACCENT }}>
            Back to back is the proof
          </div>
        </div>
      </Fade>
      <Fade
        from={t(T.answer + 0.5)}
        to={t(T.answerOut)}
        style={{
          position: 'absolute',
          top: 1380,
          left: 60,
          width: 960,
          textAlign: 'center',
          fontFamily: 'IBM Plex Sans',
          fontSize: 42,
          color: '#E8E6E1',
          lineHeight: 1.3,
        }}
      >
        Expected per shuffle: {EXACT_PAIRS.toFixed(2)}.
        <br />
        <span style={{ color: ACCENT }}>Measured: {MEAN_PAIRS.toFixed(2)}.</span>
      </Fade>

      {/* ── 4. the reason to follow ──────────────────────────────────────── */}
      <Fade
        from={t(T.next)}
        style={{
          position: 'absolute',
          top: 1340,
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
              marginTop: 12,
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
