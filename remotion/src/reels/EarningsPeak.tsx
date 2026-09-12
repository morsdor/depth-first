import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import {
  FPS,
  Fade,
  ReelGround,
  SAFE_BOTTOM,
  SAFE_TOP,
  SAFE_W,
  ease,
  fmt,
  t,
  useBreath,
} from './lib/chrome';
import {
  AGES,
  AGE_KEYFRAMES,
  ANCHORS,
  PEAK_AGE,
  PEAK_VALUE,
  VALUES,
} from './data/earningsPeak';

/**
 * r012 · I84 — your pay has a peak age. It's 46.
 *
 * ── Kill condition 2 is deliberately waived here ────────────────────────────
 * This is a chart as the payoff, which Gate 0 normally forbids — see
 * projects/r012_earnings/gate0/GATE0.md §5 for the written waiver and the
 * pre-registered success metric (saves/watch time, not sends). What is NOT
 * waived: the curve is a real dataset (income.py's monotone interpolation
 * through cited anchors), never authored to look right, and every number on
 * screen is asserted against the data at the exact frame it appears
 * (emit_ts.py) rather than merely being true somewhere in the JSON.
 *
 * ── The one thing this reel must never blur ─────────────────────────────────
 * Ages 30-46 are a CROSS-SECTIONAL snapshot of the 2016 tax year — different
 * people at different ages, not one career (the source's own caveat). Ages
 * 55-72 are cross-checked by the source against real panel data following the
 * SAME individuals. The "population dots" scattered along the line before age
 * 55 and their disappearance into one clean thread at 55 is not decoration —
 * it is the one visual doing the work of keeping those two claims apart.
 *
 * No 3D: the object under test is one line and a counter, and depth would
 * fight the instant self-relevant legibility the format depends on.
 */

export const DURATION_SECONDS = 32;

const ACCENT = '#AD88FF'; // DOMAIN_ACCENT.data — §1, things you touch every day
const INK = '#E8E6E1';
const DIM = '#81A2C4';
const LINE = '#274064';

// Inset well past the raw safe-area edges: the camera pan/zoom below moves
// this whole region, so the resting footprint must leave real headroom for
// the largest excursion the camera ever reaches (checked against
// scripts/reel_safe_audit.py, not just eyeballed).
const PLOT_X0 = 170;
const PLOT_X1 = 780;
const PLOT_Y0 = 700; // top
const PLOT_Y1 = 1170; // bottom (baseline)
const AGE_MIN = 22;
const AGE_MAX = 98;
const VAL_MIN = 20_000;
const VAL_MAX = 42_000;

const CROWD_SWITCH_AGE = 55; // matches AGE_KEYFRAMES[5] — see emit_ts.py's own check

const xOf = (age: number) =>
  PLOT_X0 + ((age - AGE_MIN) / (AGE_MAX - AGE_MIN)) * (PLOT_X1 - PLOT_X0);
const yOf = (value: number) =>
  PLOT_Y1 - ((value - VAL_MIN) / (VAL_MAX - VAL_MIN)) * (PLOT_Y1 - PLOT_Y0);

/** Same lookup as emit_ts.py's income_at(): nearest sampled value. */
function incomeAt(age: number): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < AGES.length; i++) {
    const d = Math.abs(AGES[i] - age);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return VALUES[best];
}

/** Same age_at() as emit_ts.py — one source of truth (AGE_KEYFRAMES), so a
 * screen-seconds change can never drift from what emit_ts.py asserted. */
function ageAt(seconds: number): number {
  for (let i = 0; i < AGE_KEYFRAMES.length - 1; i++) {
    const [t0, a0] = AGE_KEYFRAMES[i];
    const [t1, a1] = AGE_KEYFRAMES[i + 1];
    if (seconds >= t0 && seconds <= t1) {
      const f = t1 === t0 ? 0 : (seconds - t0) / (t1 - t0);
      return a0 + f * (a1 - a0);
    }
  }
  return AGE_KEYFRAMES[AGE_KEYFRAMES.length - 1][1];
}

export const EarningsPeak: React.FC = () => {
  const frame = useCurrentFrame();
  const seconds = frame / FPS;
  const breath = useBreath();

  const age = ageAt(seconds);
  const value = age >= 30 ? incomeAt(age) : null;
  const pastPeak = age >= PEAK_AGE;

  // The revealed portion of the curve: every real sample from 30 up to the
  // current portrayed age.
  const revealed = AGES.map((a, i) => ({ age: a, value: VALUES[i] })).filter(
    (p) => p.age <= Math.max(age, 30),
  );
  const pathD = revealed.length
    ? 'M ' + revealed.map((p) => `${xOf(p.age).toFixed(1)},${yOf(p.value).toFixed(1)}`).join(' L ')
    : '';

  const peakPoint = { age: PEAK_AGE, value: PEAK_VALUE };

  // A camera that FOLLOWS the point of interest for the whole 32s, not
  // decoration: r006's fix for the same trap ("a growing 6px line scores
  // near zero on the motion audit because only large-area motion counts")
  // was a camera that opens tight and pulls back. Here the whole frame pans
  // to track the reveal cursor while the curve is being drawn (0-26s), then
  // keeps tracking a travelling highlight once the curve is complete (26-32s)
  // — so the camera never stops moving with the thing the reel is about,
  // which is the I51 v5 lesson ("never pausing the thing the reel is about").
  const sweepT = Math.max(0, seconds - 26);
  const sweepFrac = 0.5 + 0.5 * Math.sin((sweepT / 3.2) * 2 * Math.PI);
  const sweepAge =
    revealed.length > 1
      ? revealed[Math.floor(sweepFrac * (revealed.length - 1))]
      : null;
  const focusAge = seconds < 26 ? age : sweepAge?.age ?? 30;

  const centreX = PLOT_X0 + (PLOT_X1 - PLOT_X0) / 2;
  const camX = (centreX - xOf(focusAge)) * 0.22;
  // Opening pull-back, 0-3s: there is genuinely little data to show yet (the
  // source's first anchor is age 30), so the establishing move — start tight,
  // pull back — carries the motion the same way r006's camera opened tight
  // on the cable landing point before following it out.
  const openPullBack = interpolate(seconds, [0, 3], [0.4, 0], ease);
  const camScale =
    1.045 + 0.035 * Math.sin((seconds / 2.4) * 2 * Math.PI) + openPullBack;

  return (
    <AbsoluteFill>
      <ReelGround accent={ACCENT} />

      {/* ── Beat 1 (0-3s): hook, line already moving ─────────────────────── */}
      <Fade from={t(0)} to={t(21)} style={{ position: 'absolute', top: SAFE_TOP + 10, left: 60, width: SAFE_W }}>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 66, color: INK, lineHeight: 1.08 }}>
          YOUR PAY HAS
        </div>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 66, color: ACCENT, lineHeight: 1.08 }}>
          A PEAK AGE.
        </div>
      </Fade>

      {/* ── Beat 2 (3-8s): the correction — real 2016 population data, one year ── */}
      <Fade from={t(3)} to={t(11)} style={{ position: 'absolute', top: SAFE_TOP + 190, left: 60, width: SAFE_W }}>
        <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 38, color: DIM }}>
          Real IRS tax data. Every American, one age at a time, in 2016.
        </div>
      </Fade>

      {/* ── Beat 3 (8-15s): the peak locks and holds ─────────────────────── */}
      <Fade from={t(11)} to={t(21)} style={{ position: 'absolute', top: SAFE_TOP + 190, left: 60, width: SAFE_W }}>
        <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 700, fontSize: 38, color: INK }}>
          It&rsquo;s 46. $41,000. The peak.
        </div>
      </Fade>

      {/* ── Beat 4 (15-21s): the panel-verified decline ──────────────────── */}
      <Fade from={t(15)} to={t(21)} style={{ position: 'absolute', top: SAFE_TOP + 250, left: 60, width: SAFE_W }}>
        <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 36, color: DIM }}>
          Past 55, when the SAME people were tracked for years —
          <br />
          it never came back.
        </div>
      </Fade>

      {/* ── Beat 5 (21-26s): pull back, self-placement ───────────────────── */}
      <Fade from={t(21)} to={t(26)} style={{ position: 'absolute', top: SAFE_TOP + 10, left: 60, width: SAFE_W }}>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 60, color: INK, textAlign: 'center' }}>
          WHERE ARE YOU
          <br />
          ON THIS LINE?
        </div>
      </Fade>

      {/* ── Beat 6 (26-32s): close ────────────────────────────────────────── */}
      <Fade from={t(26)} style={{ position: 'absolute', top: SAFE_TOP + 10, left: 60, width: SAFE_W }}>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 52, color: INK, textAlign: 'center' }}>
          SAVE THIS.
        </div>
        <div style={{ fontFamily: 'IBM Plex Sans', fontSize: 36, color: DIM, textAlign: 'center', marginTop: 10 }}>
          Check back at your birthday.
        </div>
      </Fade>

      {/* ── the chart itself ──────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `${breath} scale(${camScale.toFixed(4)}) translateX(${camX.toFixed(1)}px)`,
          transformOrigin: '50% 65%',
        }}
      >
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <line
            x1={PLOT_X0}
            y1={PLOT_Y1}
            x2={PLOT_X1}
            y2={PLOT_Y1}
            stroke={LINE}
            strokeWidth={2}
          />

          {/* population-dots texture: real, not decorative — see file docstring.
              Visible only up to age 55, fading before the line becomes one clean
              thread for the panel-verified stretch beyond it. */}
          {seconds < t(21) / FPS + 2 &&
            revealed
              .filter((_, i) => i % 6 === 0)
              .map((p) => {
                const nearSwitch = interpolate(
                  p.age,
                  [CROWD_SWITCH_AGE - 3, CROWD_SWITCH_AGE],
                  [1, 0],
                  ease,
                );
                return (
                  <circle
                    key={p.age}
                    cx={xOf(p.age) + ((p.age * 37) % 7) - 3.5}
                    cy={yOf(p.value) + ((p.age * 53) % 9) - 4.5}
                    r={2.4}
                    fill={DIM}
                    opacity={0.35 * nearSwitch}
                  />
                );
              })}

          {pathD && (
            <path d={pathD} fill="none" stroke={ACCENT} strokeWidth={6} strokeLinecap="round" />
          )}

          {/* the peak marker and the "never again this high" reference line */}
          {pastPeak && (
            <>
              <line
                x1={xOf(peakPoint.age)}
                y1={yOf(peakPoint.value)}
                x2={xOf(Math.max(age, peakPoint.age))}
                y2={yOf(peakPoint.value)}
                stroke={LINE}
                strokeWidth={2}
              />
              <circle cx={xOf(peakPoint.age)} cy={yOf(peakPoint.value)} r={9} fill={INK} />
              {/* a pulsing ring while the peak is being called out (11-21s) —
                  real emphasis on the number the reel resolves to, and also
                  the motion this hold needs (non-negotiable 4): the text box
                  itself holds still here for a full 4s otherwise. */}
              {seconds < 21 && (
                <>
                  <circle
                    cx={xOf(peakPoint.age)}
                    cy={yOf(peakPoint.value)}
                    r={20 + 55 * ((seconds % 1.1) / 1.1)}
                    fill={ACCENT}
                    opacity={0.28 * (1 - (seconds % 1.1) / 1.1)}
                  />
                  <circle
                    cx={xOf(peakPoint.age)}
                    cy={yOf(peakPoint.value)}
                    r={14 + 30 * ((seconds % 1.1) / 1.1)}
                    fill="none"
                    stroke={ACCENT}
                    strokeWidth={3}
                    opacity={0.7 * (1 - (seconds % 1.1) / 1.1)}
                  />
                </>
              )}
            </>
          )}

          {/* self-placement marker, beat 5 onward */}
          {seconds >= t(21) / FPS && (
            <g opacity={interpolate(seconds, [21, 22.5], [0, 1], ease)}>
              <circle cx={xOf(41)} cy={yOf(incomeAt(41))} r={11} fill={ACCENT} />
              <circle cx={xOf(41)} cy={yOf(incomeAt(41))} r={20} fill="none" stroke={ACCENT} strokeWidth={2} opacity={0.5} />
            </g>
          )}

          {/* the travelling highlight, beat 6 only — see sweepAge above.
              The camera tracks this the whole time, which is the real motion;
              the marker itself just shows what it is tracking. */}
          {seconds >= 26 && sweepAge && (
            <>
              <circle cx={xOf(sweepAge.age)} cy={yOf(sweepAge.value)} r={22} fill={ACCENT} opacity={0.22} />
              <circle cx={xOf(sweepAge.age)} cy={yOf(sweepAge.value)} r={10} fill={INK} />
            </>
          )}

        </svg>
      </div>

      {/* axis labels — deliberately OUTSIDE the camera transform above: fixed
          chrome, not something the pan/zoom should ever carry past the safe
          area (that drift is what originally failed scripts/reel_safe_audit.py). */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <text x={PLOT_X0} y={PLOT_Y1 + 40} fontFamily="IBM Plex Mono" fontSize={36} fill={DIM}>
          age {AGE_MIN}
        </text>
        <text x={PLOT_X1} y={PLOT_Y1 + 40} fontFamily="IBM Plex Mono" fontSize={36} fill={DIM} textAnchor="end">
          age {AGE_MAX}
        </text>
      </svg>

      {/* ── the counter — the mechanism this whole format is testing ──────── */}
      {seconds < t(21) / FPS + 1 && (
        <Fade from={t(0.5)} style={{ position: 'absolute', top: 1180, left: 60, width: SAFE_W }}>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: DIM, letterSpacing: 3 }}>
            AGE
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontFamily: 'Archivo Black', fontSize: 100, color: INK }}>
              {Math.round(age)}
            </div>
            {value !== null && (
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 68, color: ACCENT }}>
                {fmt(Math.round(value / 100) * 100)}
              </div>
            )}
          </div>
        </Fade>
      )}

      {/* ── save icon, beat 6 ─────────────────────────────────────────────── */}
      <Fade from={t(27)} style={{ position: 'absolute', top: 1290, left: 0, width: 1080, textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            width: 64,
            height: 64,
            border: `3px solid ${ACCENT}`,
            borderRadius: 8,
            opacity: interpolate(
              Math.sin((frame / FPS) * 2 * Math.PI * 0.6),
              [-1, 1],
              [0.5, 1],
            ),
          }}
        />
      </Fade>

      {/* the source line, small, honest, always present past the hook */}
      <Fade from={t(4)} style={{ position: 'absolute', top: SAFE_BOTTOM - 100, left: 60, width: SAFE_W }}>
        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: DIM, opacity: 0.8 }}>
          Brady &amp; Bass, IRS SOI (2024) · 2016 tax data
        </div>
      </Fade>
    </AbsoluteFill>
  );
};

// Anchors are re-exported here only so a `brand:check`-style eyeball can
// confirm the plotted line actually passes through the cited points, without
// re-deriving them — see income.py for the full provenance.
export const CITED_ANCHORS = ANCHORS;
