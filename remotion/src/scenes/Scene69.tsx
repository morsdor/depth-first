import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from 'remotion';

/**
 * Scene69 — THE WHOLE CHAIN, held as one schematic.
 *
 * Every node the film has visited, drawn left to right in the order the video visited
 * them, on the axis established in pass 2: demand flows LEFT to RIGHT
 * (continuity_registry.sides.query_flow). This is the frame that makes the argument
 * legible in one glance — it is the payoff of the whole "follow the wire" spine.
 *
 * §5: nodes arrive 8 frames apart with 3 frames of stagger, EASE.standard, then stop.
 * The connecting line draws on across 21 frames (the top of §5's 400–700ms range) because
 * it has the full width of a 4K frame to cross. Nothing loops.
 *
 * Built in code, not generated: an image model cannot be trusted to keep six labelled
 * nodes in the right order, and this frame's correctness IS its content.
 */

const NODES = ['phone', 'rack', 'cooling', 'grid', 'fab', 'reactor'];

export const Scene69: React.FC = () => {
  const frame = useCurrentFrame();

  const draw = interpolate(frame, [34, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  return (
    <AbsoluteFill
      name="Scene 69"
      style={{
        backgroundColor: '#040E1F',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Interactive.Div
        name="Spine"
        style={{
          position: 'absolute',
          left: 320,
          height: 4,
          backgroundColor: '#00D6F7',
          width: `${draw * 3200}px`,
        }}
      />

      <Interactive.Div
        name="Nodes"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 3200,
        }}
      >
        {NODES.map((node, i) => {
          const start = 38 + i * 3;
          const enter = interpolate(frame, [start, start + 8], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          });
          return (
            <div
              key={node}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 32,
                opacity: enter,
                transform: `translateY(${(1 - enter) * 12}px)`,
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 8,
                  backgroundColor: '#0E213E',
                  border: '3px solid #00D6F7',
                }}
              />
              <div
                style={{
                  fontFamily: 'IBM Plex Mono',
                  fontSize: 48,
                  color: '#81A2C4',
                }}
              >
                {node}
              </div>
            </div>
          );
        })}
      </Interactive.Div>
    </AbsoluteFill>
  );
};
