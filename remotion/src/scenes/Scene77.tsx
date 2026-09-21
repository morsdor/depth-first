import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from 'remotion';

/**
 * Scene77 — the outro card. Same §2 lockup as TitleCard, so the video closes on the
 * identity it opened with: DEPTH over FIRST, 5 over 5, with the descending amber rule.
 *
 * Deliberately quiet — no subscribe animation, no bouncing arrow. §5 bans anything that
 * "performs", and an outro is the easiest place in a video to look like a template.
 */

export const Scene77: React.FC = () => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [60, 68], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  return (
    <AbsoluteFill
      name="Outro card"
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
          gap: 40,
          opacity: enter,
        }}
      >
        <div style={{ width: 8, backgroundColor: '#FFB020', alignSelf: 'flex-start', height: 340 }} />
        <div
          style={{
            fontFamily: 'Archivo Black',
            fontSize: 152,
            lineHeight: 1.02,
            letterSpacing: '0.02em',
            color: '#E8E6E1',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div>DEPTH</div>
          <div>FIRST</div>
        </div>
      </Interactive.Div>

      <Interactive.Div
        name="Next"
        style={{
          fontFamily: 'IBM Plex Sans',
          fontWeight: 400,
          fontSize: 64,
          color: '#81A2C4',
          marginTop: 88,
          opacity: interpolate(frame, [44, 52], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
        }}
      >
        Everything&rsquo;s holding something up.
      </Interactive.Div>
    </AbsoluteFill>
  );
};
