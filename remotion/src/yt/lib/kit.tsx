import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { GPS } from '../data/gps';

/**
 * yt001 — shared kit for the long-form (16:9) video. Designed at 3840×2160 (the brand's native 4K
 * canvas, so TYPE_SCALE and the 36px floor mean what they say) and rendered at --scale=0.5 for 1080p.
 */
export const W = 3840;
export const H = 2160;
export const FPS = 30;

export const COL = {
  ink: '#040E1F',
  slate: '#0E213E',
  bone: '#E8E6E1',
  ash: '#81A2C4',
  graphite: '#274064',
  mesh: '#0D1F3C',
  amber: '#FFB020',
  cyan: '#00D6F7',
  blue: '#51A4FF',
  purple: '#AD88FF',
  green: '#3DDF7D',
  red: '#FF4D4D',
} as const;

export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/** The brand's two curves. `exit` accelerates away and never decelerates. */
export const ramp = (t: number, a: number, b: number, from = 0, to = 1, exit = false) =>
  interpolate(t, [a, b], [from, to], {
    easing: exit ? Easing.bezier(0.4, 0, 1, 1) : Easing.bezier(0.4, 0, 0.2, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/** Linear map for things that move at constant speed (orbits, light, counters). */
export const lin = (t: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(t, [a, b], [from, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

/** Scene windows: each scene's visuals lead its first sentence by LEAD seconds. */
const LEAD = 0.6;
const TL = GPS.timeline;
export const SCENE_IDS = TL.scenes.map((s) => s.id);
export type SceneId = (typeof SCENE_IDS)[number];

export const sceneWindow = (id: string) => {
  const i = TL.scenes.findIndex((s) => s.id === id);
  const start = i === 0 ? 0 : TL.scenes[i].start - LEAD;
  const end = i === TL.scenes.length - 1 ? TL.duration : TL.scenes[i + 1].start - LEAD;
  const cue = TL.sentences.filter((s) => s.scene === id).map((s) => s.start - start);
  const cueEnd = TL.sentences.filter((s) => s.scene === id).map((s) => s.end - start);
  return { start, end, dur: end - start, cue, cueEnd };
};

/** Local time (seconds since this scene began). Call inside the scene's <Sequence>. */
export const useT = () => useCurrentFrame() / FPS;

export const FONT = {
  display: 'Archivo Black',
  sans: 'IBM Plex Sans',
  mono: 'IBM Plex Mono',
} as const;

type TxtProps = {
  x: number;
  y: number;
  t: number;
  at: number;
  out?: number;
  size?: number;
  font?: keyof typeof FONT;
  color?: string;
  weight?: 400 | 600;
  align?: 'left' | 'center' | 'right';
  maxW?: number;
  lh?: number;
  ls?: number;
  rise?: number;
  children: React.ReactNode;
};

/** Text that fades in (8f, 24px rise) at `at` and out (5f) at `out`. Anchored at x,y by `align`. */
export const Txt: React.FC<TxtProps> = ({
  x, y, t, at, out, size = 72, font = 'sans', color = COL.bone, weight = 600, align = 'left',
  maxW, lh = 1.15, ls = 0, rise = 24, children,
}) => {
  const inn = ramp(t, at, at + 8 / FPS);
  const o = out === undefined ? 1 : 1 - ramp(t, out, out + 5 / FPS, 0, 1, true);
  const op = inn * o;
  if (op <= 0.001) return null;
  const tx = align === 'left' ? '0' : align === 'center' ? '-50%' : '-100%';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + (1 - inn) * rise,
        transform: `translateX(${tx})`,
        opacity: op,
        fontFamily: FONT[font],
        fontWeight: font === 'display' ? 400 : weight,
        fontSize: size,
        color,
        lineHeight: lh,
        letterSpacing: ls,
        width: maxW,
        whiteSpace: maxW ? 'normal' : 'nowrap',
        textAlign: align,
      }}
    >
      {children}
    </div>
  );
};

/** Ground: never a flat fill. A soft pool of slate, a drifting drafting grid, a vignette. */
export const Ground: React.FC<{ t: number; cx?: number; cy?: number }> = ({ t, cx = 0.6, cy = 0.5 }) => {
  const drift = (t * 8) % 160;
  return (
    <AbsoluteFill style={{ background: COL.ink }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 80% at ${cx * 100}% ${cy * 100}%, ${COL.slate} 0%, ${rgba(COL.ink, 0)} 72%)`,
        }}
      />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="mesh" width={160} height={160} patternUnits="userSpaceOnUse" patternTransform={`translate(${drift} ${drift * 0.5})`}>
            <path d="M160 0H0V160" fill="none" stroke={COL.mesh} strokeWidth={2} />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#mesh)" opacity={0.9} />
      </svg>
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse 85% 85% at 50% 50%, ${rgba(COL.ink, 0)} 55%, ${rgba(COL.ink, 0.75)} 100%)` }}
      />
    </AbsoluteFill>
  );
};

/** The chapter chip, bottom-left of every scene: a number, a name, a hairline of progress. */
export const Chapter: React.FC<{ n: number; name: string; t: number; dur: number }> = ({ n, name, t, dur }) => (
  <>
    <Txt x={240} y={1940} t={t} at={0.2} font="mono" size={40} color={COL.ash}>
      {`0${n} / 07`}
    </Txt>
    <Txt x={520} y={1940} t={t} at={0.2} font="mono" size={40} color={COL.bone}>
      {name}
    </Txt>
    <div style={{ position: 'absolute', left: 240, top: 2010, width: 600, height: 4, background: COL.graphite }}>
      <div style={{ width: `${lin(t, 0, dur) * 100}%`, height: 4, background: COL.ash }} />
    </div>
  </>
);

/** A number that counts. `fmt` receives the live value. */
export const Count: React.FC<{
  x: number; y: number; t: number; at: number; to: number; dur?: number; size?: number;
  color?: string; fmt: (v: number) => string; align?: 'left' | 'center' | 'right'; from?: number;
}> = ({ x, y, t, at, to, dur = 1.2, size = 160, color = COL.bone, fmt, align = 'left', from = 0 }) => {
  const v = from + (to - from) * ramp(t, at, at + dur);
  return (
    <Txt x={x} y={y} t={t} at={at} font="mono" size={size} color={color} align={align} weight={600}>
      {fmt(v)}
    </Txt>
  );
};

export const fmtInt = (v: number) => Math.round(v).toLocaleString('en-US');

/** Seconds (relative to the scene start) at which a phrase inside a sentence is spoken, by character share. */
export const phraseAt = (id: string, sentence: number, fragment: string) => {
  const w = sceneWindow(id);
  const sents = TL.sentences.filter((x) => x.scene === id);
  const text = sents[sentence].text;
  const idx = Math.max(0, text.indexOf(fragment));
  return w.cue[sentence] + ((w.cueEnd[sentence] - w.cue[sentence]) * idx) / text.length;
};
