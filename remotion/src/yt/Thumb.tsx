import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COL, FONT, Ground, H, W, rgba } from './lib/kit';
import { GlobeBody, SatIcon, YOU, makeProj, vec, type View } from './lib/globe';

/**
 * yt001 thumbnail — a single 3840×2160 still (render at --scale=0.5 for 1920×1080).
 * `text=false` is the BASE image handed to an image model: the globe, the four beams, the blue dot and
 * an empty left third. `text=true` is the finished, free fallback with the headline set in code.
 * The globe, coastlines and blue dot are the video's own; the satellites are drawn NEARER than scale and
 * on stylised ellipses — an illustration, not a diagram (the video's own constellation is real).
 */
const VIEW: View = { lon: 66, lat: 12, R: 900, cx: 2900, cy: 1360 };
const SPIN = 0;

// four satellites at the corners of an X, every beam meeting at the blue dot (screen px at 3840×2160)
const SATS: { x: number; y: number; ang: number }[] = [
  { x: 2330, y: 520, ang: -32 },
  { x: 3540, y: 400, ang: 28 },
  { x: 3640, y: 1640, ang: -20 },
  { x: 2200, y: 1640, ang: 24 },
];

export const Thumb: React.FC<{ text?: boolean }> = ({ text = true }) => {
  const P = makeProj(VIEW);
  const you = P(vec(YOU.lon + SPIN, YOU.lat));
  const sats = SATS;

  return (
    <AbsoluteFill>
      <Ground t={42} cx={0.72} cy={0.55} />

      {/* a cool wash behind the globe so its rim separates from the ground */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 34% 56% at ${(VIEW.cx / W) * 100}% ${(VIEW.cy / H) * 100}%, ${rgba(COL.cyan, 0.22)} 0%, ${rgba(COL.cyan, 0)} 70%)`,
        }}
      />

      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="th-halo">
            <stop offset="0%" stopColor={COL.cyan} stopOpacity={0.30} />
            <stop offset="100%" stopColor={COL.cyan} stopOpacity={0} />
          </radialGradient>
          <filter id="th-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={18} />
          </filter>
        </defs>

        <GlobeBody view={VIEW} spin={SPIN} id="th" glow={1.7} />

        {/* four beams, one blue dot */}
        {sats.map((s, i) => (
          <g key={i}>
            <line x1={s.x} y1={s.y} x2={you.x} y2={you.y} stroke={rgba(COL.cyan, 0.45)} strokeWidth={44} filter="url(#th-blur)" />
            <line x1={s.x} y1={s.y} x2={you.x} y2={you.y} stroke={COL.cyan} strokeWidth={9} strokeLinecap="round" />
          </g>
        ))}

        {sats.map((s, i) => (
          <g key={i}>
            <circle cx={s.x} cy={s.y} r={260} fill="url(#th-halo)" />
            <SatIcon x={s.x} y={s.y} s={104} angle={s.ang} glow={false} />
          </g>
        ))}

        {/* the blue dot: accuracy halos, then the dot */}
        <circle cx={you.x} cy={you.y} r={270} fill={rgba(COL.blue, 0.10)} stroke={rgba(COL.blue, 0.35)} strokeWidth={5} />
        <circle cx={you.x} cy={you.y} r={150} fill={rgba(COL.blue, 0.18)} stroke={rgba(COL.blue, 0.6)} strokeWidth={6} />
        <circle cx={you.x} cy={you.y} r={76} fill={COL.blue} stroke={COL.bone} strokeWidth={18} />
      </svg>

      {text && (
        <>
          {/* a shadow band so the headline stays readable where it crosses the globe */}
          <AbsoluteFill
            style={{ background: `linear-gradient(90deg, ${rgba(COL.ink, 0.88)} 0%, ${rgba(COL.ink, 0.55)} 40%, ${rgba(COL.ink, 0)} 62%)` }}
          />
          {(
            [
              ['GPS', 470, COL.bone],
              ['NEEDS', 770, COL.bone],
              ['EINSTEIN', 1070, COL.amber],
            ] as const
          ).map(([w, y, c]) => (
            <div
              key={w}
              style={{
                position: 'absolute',
                left: 170,
                top: y,
                fontFamily: FONT.display,
                fontSize: 310,
                lineHeight: 1,
                color: c,
                textShadow: `0 12px 0 ${rgba(COL.ink, 0.9)}, 0 0 60px ${rgba(COL.ink, 0.9)}`,
                whiteSpace: 'nowrap',
              }}
            >
              {w}
            </div>
          ))}
        </>
      )}
    </AbsoluteFill>
  );
};
