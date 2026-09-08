import React from 'react';
import { AbsoluteFill } from 'remotion';
import { DOMAIN_ACCENT } from '../brand/tokens';
import { ReelGround, ReelHeader, Readout, t, useBreath } from './lib/chrome';
import { ManimLayer } from './lib/manim';

/** Proof composition: a Manim graph layer under the repo's own reel chrome. */
export const DURATION_SECONDS = 3.5;
const ACCENT = DOMAIN_ACCENT.data;

export const ManimProbe: React.FC = () => {
  const breath = useBreath();
  return (
    <AbsoluteFill>
      <ReelGround accent={ACCENT} />
      <div style={{ position: 'absolute', inset: 0, transform: breath }}>
        <ManimLayer dir="manim/probe" frames={105} />
      </div>
      <ReelHeader
        big="Manim draws it. Remotion owns the frame."
        small="One transparent layer, composited under the brand chrome."
        out={[2.6, 3.0]}
        in_={[3.0, 3.4]}
        bigSize={64}
      />
      // NOTE: Readout/Fade take FRAMES; ReelHeader takes SECONDS and calls t() itself.
      <Readout from={t(1.2)} to={t(3.4)} rows={[["layer", "manim · rgba png"], ["fps", "30"]]} />
    </AbsoluteFill>
  );
};
