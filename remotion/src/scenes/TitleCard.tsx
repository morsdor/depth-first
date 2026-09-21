import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from 'remotion';

/**
 * TitleCard — the §7 beat at ~1:10, on every video, unchanged. (scene_12)
 *
 * This file is also the HOUSE REFERENCE for a fully canvas-interactive scene: every
 * value in every `style` is a hardcoded literal, so Studio can select, drag and keyframe
 * each element and write the edit back into this file. Compare `families/PlatePush.tsx`,
 * which trades that for reusability.
 *
 * §2 lockup (rewritten at name-lock, 2026-08-20): DEPTH over FIRST — 5 characters over 5,
 * the only candidate that stacks a perfect square block in Archivo Black, which is what
 * makes it survive at 48px. The mark is a VERTICAL rule descending the left edge of the
 * stack, past the baseline of FIRST: it reads as the traversal, down before across.
 * (The previous horizontal underline belonged to the old working name and died with it.)
 *
 * Brand literals used (validated by `npm run brand:check`):
 *   #040E1F ink · #E8E6E1 bone · #FFB020 amber · #81A2C4 ash · Easing.bezier(0.4, 0, 0.2, 1)
 */

export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      name="Title card"
      style={{
        backgroundColor: '#040E1F',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <Interactive.Div
        name="Wordmark lockup"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          gap: 56,
        }}
      >
        {/* §2: the descending rule — down before across. Draws downward, then holds. */}
        <Interactive.Div
          name="Rule"
          style={{
            width: 12,
            backgroundColor: '#FFB020',
            alignSelf: 'flex-start',
            height: interpolate(frame, [36, 56], ['0px', '640px'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
          }}
        />

        <Interactive.Div
          name="Wordmark"
          style={{
            fontFamily: 'Archivo Black',
            fontSize: 260,
            lineHeight: 1.02,
            letterSpacing: '0.02em',
            color: '#E8E6E1',
            display: 'flex',
            flexDirection: 'column',
            opacity: interpolate(frame, [60, 68], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
            translate: interpolate(frame, [60, 68], ['0px 12px', '0px 0px'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
          }}
        >
          <div>DEPTH</div>
          <div>FIRST</div>
        </Interactive.Div>
      </Interactive.Div>

      <Interactive.Div
        name="Topic"
        style={{
          fontFamily: 'IBM Plex Sans',
          fontWeight: 400,
          fontSize: 72,
          color: '#81A2C4',
          marginTop: 96,
          opacity: interpolate(frame, [44, 52], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
        }}
      >
        Why AI Is So Expensive to Run
      </Interactive.Div>
    </AbsoluteFill>
  );
};
