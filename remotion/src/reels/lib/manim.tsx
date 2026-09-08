import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';

/**
 * Plays a Manim render as a transparent layer inside a Remotion composition.
 *
 * Manim renders to a PNG sequence with a real alpha channel (see
 * scripts/manim_render.py). It is NOT transported as video: Chromium cannot
 * decode qtrle .mov, and this ffmpeg build silently drops alpha when encoding
 * VP9 webm -- it reports yuva420p and writes yuv420p, so the layer comes back
 * opaque with no error anywhere. PNG frames are lossless and cost ~29 KB each.
 *
 * Manim must render at the same fps as the composition, or the layer drifts
 * against everything Remotion animates beside it.
 */
export const ManimLayer: React.FC<{
  /** Directory under remotion/public, e.g. "manim/probe". */
  dir: string;
  /** Frame count in the sequence. */
  frames: number;
  /** Composition frame the sequence starts on. */
  startAt?: number;
  /** Hold the last frame instead of disappearing when the sequence ends. */
  freeze?: boolean;
  style?: React.CSSProperties;
}> = ({ dir, frames, startAt = 0, freeze = true, style }) => {
  const frame = useCurrentFrame();
  const i = frame - startAt;
  if (i < 0) return null;
  if (i >= frames && !freeze) return null;
  const idx = Math.min(i, frames - 1);
  const name = String(idx).padStart(4, '0');
  return (
    <Img
      src={staticFile(`${dir}/${name}.png`)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }}
    />
  );
};
