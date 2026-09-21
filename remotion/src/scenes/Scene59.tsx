import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from 'remotion';

/**
 * Scene59 — THE HERO NUMBER. 835 MW, the figure the shipped thumbnail promised.
 *
 * This scene and the thumbnail must agree: same figure, same face (Archivo Black), same
 * amber. It is the one place in the video where packaging and content are literally the
 * same frame, so the viewer who clicked on `835 MW` sees it land.
 *
 * §5: the counter runs 24 frames (~800ms) and then STOPS — it never idles or loops.
 * cinematography RHYTHM-3 then wants ~1s of stillness after a figure lands, which is why
 * nothing else in this scene moves after frame 24. The camera is static.
 *
 * §4 exception, deliberate: numbers are normally IBM Plex Mono, but the thumbnail carve-out
 * puts the hero figure in Archivo Black — display beats mono when the number IS the frame.
 * Validated by `npm run brand:check`.
 */

export const Scene59: React.FC = () => {
  const frame = useCurrentFrame();

  // 0 → 835 over 24 frames, clamped both ends: it arrives and holds.
  const value = interpolate(frame, [30, 54], [0, 835], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  return (
    <AbsoluteFill
      name="Scene 59"
      style={{
        backgroundColor: '#040E1F',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <Interactive.Div
        name="835 MW"
        style={{
          fontFamily: 'Archivo Black',
          fontSize: 560,
          letterSpacing: '0.02em',
          color: '#FFB020',
          lineHeight: 1,
        }}
      >
        {Math.round(value)} MW
      </Interactive.Div>

      <Interactive.Div
        name="Rule"
        style={{
          height: 6,
          backgroundColor: '#274064',
          marginTop: 64,
          width: interpolate(frame, [54, 70], ['0px', '1400px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
        }}
      />

      <Interactive.Div
        name="Caption"
        style={{
          fontFamily: 'IBM Plex Sans',
          fontWeight: 400,
          fontSize: 72,
          color: '#81A2C4',
          marginTop: 56,
          opacity: interpolate(frame, [60, 68], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
        }}
      >
        every watt of one restarted reactor — to one customer
      </Interactive.Div>
    </AbsoluteFill>
  );
};
