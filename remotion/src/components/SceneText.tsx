import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

/**
 * SceneText — the board's `texts[]` choreography, rendered (brand_guide_software.md §5 "Text").
 *
 * Pass 6 (motion-director) times every callout in SECONDS from the start of the scene's
 * content. This component owns the one conversion to frames and adds the 30-frame head
 * handle, so a text timed to 0.5s lands 0.5s after the scene really begins — not half a
 * second into the pre-roll.
 *
 * §5 text spec, and nothing else is permitted:
 *   In  — 8 frames fade + 12px rise, EASE.standard
 *   Out — 5 frames fade, NO movement
 *   Emphasis is colour or weight, never motion, never scale.
 *   Forbidden: typewriter, per-word cascade, bounce, blur-in, anything that performs.
 *
 * §4 surface rule: on-screen text never sits raw on imagery — it gets a slate panel at 85%,
 * 8px radius, 16px padding, 1px graphite border. Over a moving plate that is the difference
 * between legible and mush.
 */

export type SceneTextItem = {
  text: string;
  /** Seconds from the start of scene CONTENT (the handle is added here). */
  start: number;
  end: number;
  position: 'top' | 'bottom' | 'center';
};

export type SceneTextProps = {
  texts: SceneTextItem[];
  /** Accent for the leading rule. One accent per video (§3). */
  accent?: string;
};

const HANDLE = 30;

const PLACEMENT: Record<
  SceneTextItem['position'],
  { justifyContent: 'flex-start' | 'flex-end' | 'center'; padding: number }
> = {
  top: { justifyContent: 'flex-start', padding: 200 },
  bottom: { justifyContent: 'flex-end', padding: 200 },
  center: { justifyContent: 'center', padding: 200 },
};

export const SceneText: React.FC<SceneTextProps> = ({ texts, accent = '#00D6F7' }) => {
  const frame = useCurrentFrame();

  return (
    <>
      {texts.map((t) => {
        const inAt = HANDLE + t.start * 30;
        const outAt = HANDLE + t.end * 30;

        // Fade up over 8f, hold, fade down over 5f. Clamped: it never re-enters.
        const opacity = interpolate(
          frame,
          [inAt, inAt + 8, outAt - 5, outAt],
          [0, 1, 1, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          },
        );

        // 12px rise on entry only — the exit does not move (§5).
        const rise = interpolate(frame, [inAt, inAt + 8], [12, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        });

        if (opacity <= 0) return null;
        const place = PLACEMENT[t.position];

        return (
          <AbsoluteFill
            key={`${t.text}-${t.start}`}
            name={`Text: ${t.text}`}
            style={{
              alignItems: 'flex-start',
              justifyContent: place.justifyContent,
              padding: place.padding,
            }}
          >
            <div
              style={{
                backgroundColor: '#0E213E',
                border: '1px solid #274064',
                borderLeft: `6px solid ${accent}`,
                borderRadius: 8,
                padding: '24px 40px',
                color: '#E8E6E1',
                fontFamily: 'IBM Plex Mono',
                fontSize: 72,
                maxWidth: 2400,
                opacity,
                translate: `0px ${rise}px`,
              }}
            >
              {t.text}
            </div>
          </AbsoluteFill>
        );
      })}
    </>
  );
};
