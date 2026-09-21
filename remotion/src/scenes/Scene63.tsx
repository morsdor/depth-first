import { AbsoluteFill, Img, Interactive, staticFile } from 'remotion';
import { AmbientDrift } from '../components/AmbientDrift';

/**
 * Scene63 — hero scene, canvas-interactive tier (brand_guide_software.md §11).
 *
 * THE TITLE PAYOFF — and the video's mandatory static beat (§5: 'the most important frame in
 * every video should be completely static'). After eleven minutes of escalation the camera stops.
 * The only motion permitted is the plume's ambient drift. Do not add a push here.
 *
 * Every style value is a hardcoded literal so Studio can select, drag and keyframe each
 * element and write the edit straight back into this file. Validated by `npm run brand:check`.
 */

export const Scene63: React.FC = () => {
  // §5 MANDATORY STATIC BEAT. There is deliberately no `useCurrentFrame` here: this scene
  // has NO camera move and NO frame-driven value of its own. The only motion in the frame
  // is AmbientDrift, which owns its own clock. If a future edit reintroduces `frame` to
  // this component, something has gone wrong — the payoff is supposed to be still.

  return (
    <AbsoluteFill name="Scene 63" style={{ backgroundColor: '#040E1F' }}>
      <Interactive.Div
        name="Plate"
        style={{
          width: '100%',
          height: '100%',
          scale: 1,
        }}
      >
        <Img
          src={staticFile('plates/scene_63.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Interactive.Div>

      <AmbientDrift pxPerSecond={4} />
    </AbsoluteFill>
  );
};
