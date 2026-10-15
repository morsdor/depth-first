import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { FPS, sceneWindow } from './lib/kit';
import { GPS } from './data/gps';
import { S1Hook } from './scenes/S1Hook';
import { S2Satellites } from './scenes/S2Satellites';
import { S3Ranging } from './scenes/S3Ranging';
import { S4Clock } from './scenes/S4Clock';
import { S5Einstein } from './scenes/S5Einstein';
import { S6Accuracy } from './scenes/S6Accuracy';
import { S7Close } from './scenes/S7Close';

export const DURATION_SECONDS = Math.ceil(GPS.timeline.duration);

const SCENES: { id: string; C: React.FC }[] = [
  { id: 'hook', C: S1Hook },
  { id: 'satellites', C: S2Satellites },
  { id: 'ranging', C: S3Ranging },
  { id: 'clock', C: S4Clock },
  { id: 'einstein', C: S5Einstein },
  { id: 'accuracy', C: S6Accuracy },
  { id: 'close', C: S7Close },
];

/** yt001 — "How GPS finds you, and why it needs Einstein". 3840x2160 @ 30; render with --scale=0.5 for 1080p. */
export const Gps: React.FC = () => (
  <>
    {SCENES.map(({ id, C }) => {
      const w = sceneWindow(id);
      return (
        <Sequence key={id} from={Math.round(w.start * FPS)} durationInFrames={Math.round(w.dur * FPS)}>
          <C />
        </Sequence>
      );
    })}
    <Audio src={staticFile('yt_gps/audio/narration.wav')} />
  </>
);
