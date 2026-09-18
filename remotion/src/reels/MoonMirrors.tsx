import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { FPS, Fade, REEL_H, REEL_W, ReelGround, ease, t, useBreath } from './lib/chrome';
import { CLOCK_KEYFRAMES, MIRRORS, META, OBSERVATORY, REFLECTOR, YEAR_KEYFRAMES } from './data/moonmirrors';

/**
 * r015 · I77 — there are mirrors on the Moon, and observatories still bounce
 * lasers off them.
 *
 * ── The spine ────────────────────────────────────────────────────────────
 * Apollo 11, 14 and 15 (US, 1969-71) and the Soviet Lunokhod 1/2 arrays
 * (French-built, 1970/73) are still there and still used. An observatory
 * fires a laser at one; by the time it arrives the beam has spread to
 * roughly 7 km wide, and of ~3.1e17 photons in one APOLLO-station pulse,
 * typically only 5-10 are detected coming back. Timing that round trip to a
 * few picoseconds gives APOLLO's own stated ~1mm ranging precision on a
 * 384,400 km distance — and 57 years of that measurement show the Moon
 * receding 3.83 cm every year. VERIFIED against APOLLO's own instrument
 * papers, an LLR round-trip-loss review, and Eos.org's recession-rate
 * feature — gate0/GATE0.md §5.
 *
 * GATE 3 was passed as the strongest send-test answer on the account since
 * r005 — settles moon-landing denial with a real, ongoing measurement — and
 * is also flagged for real toxicity risk in its own comments
 * (gate0/GATE0.md §2, §7.4). No beat stages or rebuts that claim on screen;
 * the reel states the mechanism and lets it stand.
 *
 * ── The one ruler ────────────────────────────────────────────────────────
 * The round-trip light-travel time of THIS beam, running via CLOCK_KEYFRAMES
 * across beats 2-5 (fire → arrive → dilute/return → lock). Every other
 * number (7 km spot, 310 quadrillion photons, ±1mm, 3.83 cm/yr, five
 * mirrors) is stated once, as a fact the clock's measurement makes possible.
 *
 * ── The 3D shot that only exists because this is 3D ─────────────────────
 * The camera is fixed; a wrapping <group> moves. A FOCUS point (world-space)
 * is chosen per beat — world origin at wide shots, the observatory on Earth,
 * or the reflector on the Moon — and the group's position is solved each
 * frame so that focus point lands exactly at the origin regardless of the
 * group's current scale and Y-rotation: `position = -scale * rotateY(focus)`.
 * That is what lets the ambient rotation keep turning continuously (non-
 * negotiable 4) without ever breaking the "diving toward this exact point"
 * illusion — the same underlying trick as r014's dive, generalised from one
 * sphere centred at the group origin to two bodies offset from it.
 */
export const DURATION_SECONDS = 45;

const ACCENT = '#3DDF7D'; // DOMAIN_ACCENT.security — §4
const INK = '#E8E6E1';
const DIM = '#81A2C4';
const EARTH_FILL = '#81A2C4'; // BASE.ash -- slate/graphite read as near-black against the ground
const MOON_FILL = '#E8E6E1'; // BASE.bone -- with roughness, reads as pale grey, not white
const GROUND_FILL = '#040E1F';

// World-space, illustrative — NOT to physical scale (60 Earth-radii of real
// separation would put one body off-frame at any legible size, the same
// problem r009 solved by re-basing). The real 384,400 km figure is stated
// as text, never implied by this geometry (gate0/GATE0.md §3).
//
// Sized against the SAFE COLUMN (x 60-870, y 270-1540), not the raw 1080x1920
// canvas -- non-negotiable 1. At CAM_Z=7.2/FOV=30, the safe column at z=0
// spans world x [-0.964, 0.663] and y [-1.165, 1.386] (497.7 px/world-unit).
// The original R_EARTH=0.5 at x=-0.85 put Earth's own left edge at -1.35,
// nowhere near the safe column -- the safe-area audit failed on 1348/1350
// frames, not just the dive. These values keep both idle spheres, with
// margin, inside that box; the dive beats (scale up to 3.4x) still bleed
// past it deliberately, same shape as r014's declared dive window.
const EARTH_POS = new THREE.Vector3(-0.5, -0.6, 0);
const MOON_POS = new THREE.Vector3(0.32, 0.62, 0);
const R_EARTH = 0.3;
const R_MOON = 0.13; // real ratio ~0.273; kept close while staying visually distinct
const CAM_Z = 7.2;
const FOV = 30;

/** Beat boundaries, seconds. Matches SCRIPT.md and emit_ts.py's BEAT_* consts. */
const BEAT = {
  hook: [0.0, 3.0],
  announce: [3.0, 9.0],
  spread: [9.0, 14.0],
  dilution: [14.0, 20.0],
  roundtrip: [20.0, 26.0],
  timelapse: [26.0, 30.0],
  payoff: [30.0, 36.0],
  close: [36.0, 45.0],
} as const;

/** A point on a sphere's near-camera surface, in the sphere's OWN local
 * frame (before the sphere's world offset is added). lon=0,lat=0 faces +Z. */
function surfacePoint(lon: number, lat: number, r: number): THREE.Vector3 {
  const lo = (lon * Math.PI) / 180;
  const la = (lat * Math.PI) / 180;
  return new THREE.Vector3(
    r * Math.cos(la) * Math.sin(lo),
    r * Math.sin(la),
    r * Math.cos(la) * Math.cos(lo),
  );
}

function rotateY(v: THREE.Vector3, rad: number): THREE.Vector3 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return new THREE.Vector3(v.x * c + v.z * s, v.y, -v.x * s + v.z * c);
}

/** Same piecewise-linear lookup as emit_ts.py's clock_at()/year_at(). */
function lerpKeyframes(kf: readonly (readonly [number, number])[], screenS: number): number {
  if (screenS <= kf[0][0]) return kf[0][1];
  for (let i = 0; i < kf.length - 1; i++) {
    const [s0, r0] = kf[i];
    const [s1, r1] = kf[i + 1];
    if (screenS >= s0 && screenS <= s1) {
      if (s1 === s0) return r1;
      const f = (screenS - s0) / (s1 - s0);
      return r0 + f * (r1 - r0);
    }
  }
  return kf[kf.length - 1][1];
}

function fmtSeconds(s: number): string {
  return `${s.toFixed(2)}s`;
}

const OBS_LOCAL = surfacePoint(OBSERVATORY.lon, OBSERVATORY.lat, R_EARTH); // relative to Earth's own centre
const REF_LOCAL = surfacePoint(REFLECTOR.lon, REFLECTOR.lat, R_MOON); // relative to Moon's own centre
const OBS_WORLD = EARTH_POS.clone().add(OBS_LOCAL);
const REF_WORLD = MOON_POS.clone().add(REF_LOCAL);

/** A tube along the straight beam path between two world points. */
function beamTube(a: THREE.Vector3, b: THREE.Vector3, radius: number) {
  const curve = new THREE.LineCurve3(a, b);
  return new THREE.TubeGeometry(curve, 8, radius, 6, false);
}

const Scene: React.FC<{ s: number }> = ({ s }) => {
  // ── ambient rotation — never frozen (non-negotiable 4), but BOUNDED. ─────
  // An unbounded drift (-0.045*s) swings past 90 degrees by s=20 and keeps
  // going, which rotates the two bodies (offset mostly along X) through
  // the camera's Z axis -- the "wide" framing at s=36-45 (close beat) no
  // longer resembles the hook's, because the whole scene has quietly spun
  // most of the way around. A bounded oscillation keeps continuous motion
  // (the FOCUS-centering math below is exact for any rotY, so this doesn't
  // touch the dive) without ever drifting the wide shots out of frame.
  const rotY = -0.1 * Math.sin((2 * Math.PI * s) / 16);

  // ── the FOCUS point and dive scale, per beat ─────────────────────────────
  // wide -> observatory (announce) -> reflector (spread/dilution) ->
  // observatory (return, back half of dilution) -> wide (timelapse onward).
  const [aFrom] = BEAT.announce;
  const [spFrom, spTo] = BEAT.spread;
  const [dFrom, dTo] = BEAT.dilution;
  const [tlFrom] = BEAT.timelapse;

  const toObservatory = interpolate(s, [aFrom, aFrom + 1.5], [0, 1], ease);
  const toReflector = interpolate(s, [spFrom, spFrom + 1.3], [0, 1], ease);
  const backToObservatory = interpolate(s, [dFrom + 3.0, dTo], [0, 1], ease);
  const backToWide = interpolate(s, [tlFrom, tlFrom + 1.4], [0, 1], ease);

  const focus = new THREE.Vector3(0, 0, 0);
  focus.lerp(OBS_WORLD, toObservatory);
  focus.lerp(REF_WORLD, toReflector);
  focus.lerp(OBS_WORLD, backToObservatory);
  focus.lerp(new THREE.Vector3(0, 0, 0), backToWide);

  const scale = interpolate(
    s,
    [0, aFrom, aFrom + 1.5, dTo - 1.5, dTo, tlFrom + 1.4],
    [1, 1, 1.9, 1.9, 1.9, 1],
    ease,
  );

  // Which body is NOT the current focus swings across the whole frame under
  // this transform (it's centred on the OTHER body's surface point, not its
  // own), and at peak scale its silhouette can swing straight through the
  // header band -- measured: diving to the observatory sent the Moon's
  // bottom edge to y~250, inside the never-exempt y<270 band, even with
  // R_EARTH/R_MOON and CAM_Z already sized to the safe column at rest.
  // Fading the off-focus body out during the OTHER body's dive fixes this
  // at the source rather than by shrinking the dive further, and reads
  // better besides -- attention genuinely narrows to whichever body this
  // beat is about. -1 = observatory dive, 0 = wide, +1 = reflector dive.
  const target = interpolate(
    s,
    [0, aFrom, aFrom + 1.5, spFrom, spFrom + 1.5, dFrom + 3.0, dTo, tlFrom, tlFrom + 1.4],
    [0, 0, -1, -1, 1, 1, -1, -1, 0],
    ease,
  );
  // Steep, not linear across the full [-1,0]/[0,1] range: measured at target
  // = -0.33 (25% into the ramp), a linear fade was still 71% opaque -- well
  // past enough of the Moon's swing to clip the header. Saturating by |target|
  // = 0.25 keeps the fade ahead of the swing instead of racing it.
  const earthOpacity = interpolate(target, [0, 0.15, 1], [1, 0.08, 0.08], ease);
  const moonOpacity = interpolate(target, [-1, -0.15, 0], [0.08, 0.08, 1], ease);

  // position = -scale * rotateY(focus) -- keeps `focus` exactly at the world
  // origin (screen centre) every frame regardless of the current rotation,
  // so the ambient spin never has to pause for the dive to read cleanly.
  const rotatedFocus = rotateY(focus, rotY);
  const groupPos: [number, number, number] = [
    -scale * rotatedFocus.x,
    -scale * rotatedFocus.y,
    -scale * rotatedFocus.z,
  ];

  // ── the beam: ambient pre-existing pulse (beat 1), then the real event ──
  const ambientPulse = 0.14 + 0.1 * (0.5 - 0.5 * Math.cos((2 * Math.PI * s) / 2.6));
  const outboundReveal = interpolate(s, [aFrom, aFrom + 5.2], [0, 1], ease);
  const beamOpacity = s < aFrom ? ambientPulse : 0.55 + 0.35 * outboundReveal;

  // return beam draws during the SECOND half of the dilution beat, matching
  // CLOCK_KEYFRAMES (one-way time holds to dTo-6, round trip lands at dTo).
  const returnReveal = interpolate(s, [dFrom + 3.0, dTo], [0, 1], ease);

  const beamGeo = useMemo(() => beamTube(OBS_WORLD, REF_WORLD, 0.012), []);
  const returnGeo = useMemo(() => beamTube(REF_WORLD, OBS_WORLD, 0.005), []);

  // ── the spread spot at the Moon (beat 3) ─────────────────────────────────
  const spotGrow = interpolate(s, [spFrom, spTo], [0.02, 0.34], ease);
  const spotOpacity = interpolate(s, [spFrom, spFrom + 1.5, spTo], [0, 0.55, 0.4], ease);

  // ── recession nudge (beat 7): the Moon visibly, honestly-exaggerated,
  // drifts a little further out as the payoff number locks. ────────────────
  const [pFrom, pTo] = BEAT.payoff;
  const recede = interpolate(s, [pFrom, pTo], [0, 1], ease);
  const moonPos = MOON_POS.clone().addScaledVector(MOON_POS.clone().normalize(), recede * 0.1);

  // ── five real mirrors, lit in sequence across the close beat ─────────────
  const [cFrom] = BEAT.close;
  const mirrorLight = MIRRORS.map((_, i) =>
    interpolate(s, [cFrom + i * 0.5, cFrom + i * 0.5 + 0.6], [0, 1], ease),
  );

  const breathScale = 1 + 0.09 * Math.sin((2 * Math.PI * s) / 5);

  // ── the close beat's own dead spell, and the r014-proven fix ─────────────
  // Once all five mirrors finish lighting (by ~cFrom+2.6s) the scene is
  // static apart from a sub-degree rotation wobble -- reel_motion_audit
  // measured an 8.75s dead spell here (limit 1.5s). Same cause and same
  // fix as r014's close beat: a continuously breathing marker, never fully
  // dark so there is no discontinuous reset at any wrap, sized to clear
  // the audit's 240px-wide downsample rather than just barely pass it.
  // Active from the PAYOFF beat onward, not just close -- a second dead
  // spell (3.25s) turned up at 32.8s once the close-beat one was fixed,
  // because the payoff beat's only other motion (the slow recede drift,
  // the text fade) is too subtle on its own. Ties the pulse to "the Moon
  // is measurably leaving" too, which fits the beat's own claim.
  // Also active during the hook (0-3s): a thin beam's opacity swing alone
  // (ambientPulse below) measured under threshold there too -- a thin line
  // is worth almost nothing to this audit (the r006 lesson), so the hook
  // needs the same sphere-pulse the payoff/close beats needed.
  const closePingActive = s < BEAT.hook[1] || s >= pFrom;
  const closePingPeriod = 1.6;
  const closePingPhase = closePingActive ? ((s - pFrom) % closePingPeriod) / closePingPeriod : 0;
  const closePingWave = 0.5 - 0.5 * Math.cos(2 * Math.PI * closePingPhase);
  // Sized against the CURRENT R_MOON (0.13) -- this used to be calibrated
  // against a since-shrunk R_MOON=0.19 (the safe-area fix above shrank both
  // bodies) and grew to visibly dwarf the Moon itself in the close beat.
  // The sphere-pulses (earthPulse/moonPulse) now carry the audit-motion
  // requirement on their own, so this stays a small highlight only.
  const closePingScale = 0.02 + 0.025 * closePingWave;
  const closePingOpacity = closePingActive ? 0.15 + 0.35 * closePingWave : 0;
  // A small added marker measured at only ~0.15-0.18 mean change at the
  // audit's 240px downsample (limit 0.35) -- a moving dot is worth almost
  // nothing there (the r006 lesson). Pulsing the MOON'S OWN scale instead
  // sweeps its actual edge pixels, which already cover real screen area.
  const moonPulse = closePingActive ? 1 + 0.4 * closePingWave : 1;
  const earthPulse = closePingActive ? 1 + 0.3 * closePingWave : 1;

  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[4, 6, 8]} intensity={0.75} />
      <directionalLight position={[-6, -3, 4]} intensity={0.3} />
      <group position={groupPos} rotation={[0, rotY, 0]} scale={scale * breathScale}>
        <mesh position={EARTH_POS.toArray()} scale={earthPulse}>
          <sphereGeometry args={[R_EARTH, 48, 48]} />
          <meshStandardMaterial color={EARTH_FILL} roughness={0.9} transparent opacity={earthOpacity} />
        </mesh>
        <mesh position={moonPos.toArray()} scale={moonPulse}>
          <sphereGeometry args={[R_MOON, 40, 40]} />
          <meshStandardMaterial color={MOON_FILL} roughness={1} transparent opacity={moonOpacity} />
        </mesh>

        <mesh geometry={beamGeo}>
          <meshBasicMaterial color={ACCENT} transparent opacity={beamOpacity} />
        </mesh>
        {returnReveal > 0.01 && (
          <mesh geometry={returnGeo} scale={[1, 1, returnReveal]}>
            <meshBasicMaterial color={DIM} transparent opacity={0.5 * returnReveal} />
          </mesh>
        )}

        {spotOpacity > 0.01 && (
          <mesh position={REF_WORLD.toArray()} scale={spotGrow}>
            <circleGeometry args={[R_MOON * 0.6, 24]} />
            <meshBasicMaterial color={ACCENT} transparent opacity={spotOpacity} side={THREE.DoubleSide} />
          </mesh>
        )}

        <mesh position={OBS_WORLD.toArray()} scale={0.03}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color={ACCENT} />
        </mesh>

        {closePingOpacity > 0.001 && (
          <mesh position={REF_WORLD.toArray()} scale={closePingScale}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshBasicMaterial color={ACCENT} transparent opacity={closePingOpacity} />
          </mesh>
        )}

        {MIRRORS.map((m, i) => {
          const p = MOON_POS.clone().add(surfacePoint(m.lon, m.lat, R_MOON * 1.02));
          const isReflector = m.name === REFLECTOR.name;
          const twinkle = 0.85 + 0.3 * Math.sin((2 * Math.PI * s) / (1.7 + i * 0.11));
          return (
            <mesh key={m.name} position={p.toArray()} scale={0.022 * twinkle}>
              <sphereGeometry args={[1, 10, 10]} />
              <meshBasicMaterial
                color={isReflector ? ACCENT : INK}
                transparent
                opacity={(s >= cFrom ? 0.35 + 0.65 * mirrorLight[i] : 0.55) * moonOpacity}
              />
            </mesh>
          );
        })}
      </group>
    </>
  );
};

const Head: React.FC<{ from: number; to: number; lines: string[]; size?: number }> = ({
  from,
  to,
  lines,
  size = 46,
}) => (
  <Fade
    from={t(from)}
    to={t(to)}
    style={{ position: 'absolute', top: 300, left: 70, width: 790, textAlign: 'center' }}
  >
    {lines.map((l, i) => (
      <div
        key={i}
        style={{
          fontFamily: 'Archivo Black',
          fontSize: size,
          lineHeight: 1.16,
          letterSpacing: -1,
          color: INK,
        }}
      >
        {l}
      </div>
    ))}
  </Fade>
);

const Clock: React.FC<{ s: number }> = ({ s }) => {
  if (s < BEAT.announce[0] || s > BEAT.roundtrip[1] + 0.4) return null;
  const secs = lerpKeyframes(CLOCK_KEYFRAMES, s);
  return (
    <Fade
      from={t(BEAT.announce[0])}
      to={t(BEAT.roundtrip[1] + 0.4)}
      style={{ position: 'absolute', top: 1400, left: 70, width: 790, textAlign: 'center' }}
    >
      <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: 72, color: ACCENT }}>
        {fmtSeconds(secs)}
      </div>
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: DIM, letterSpacing: 3, marginTop: 6 }}>
        ROUND-TRIP LIGHT TIME
      </div>
    </Fade>
  );
};

const PhotonReadout: React.FC<{ s: number }> = ({ s }) => {
  const [from, to] = BEAT.dilution;
  if (s < from) return null;
  const sentDisplay = Math.round(
    interpolate(s, [from, from + 1.2], [0, META.photonsSent], ease),
  );
  return (
    <Fade
      from={t(from)}
      to={t(to)}
      style={{ position: 'absolute', top: 1080, left: 70, width: 790, textAlign: 'center' }}
    >
      <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: 46, color: INK }}>
        {sentDisplay.toLocaleString('en-US')}
      </div>
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: DIM, letterSpacing: 2, marginTop: 4 }}>
        PHOTONS SENT
      </div>
      <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: 72, color: ACCENT, marginTop: 20 }}>
        {META.photonsReturnedDisplay}
      </div>
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: DIM, letterSpacing: 2, marginTop: 4 }}>
        TYPICALLY COME BACK
      </div>
    </Fade>
  );
};

const DistanceReadout: React.FC<{ s: number }> = ({ s }) => {
  const [from, to] = BEAT.roundtrip;
  if (s < from) return null;
  return (
    <Fade
      from={t(from)}
      to={t(to)}
      style={{ position: 'absolute', top: 1140, left: 70, width: 790, textAlign: 'center' }}
    >
      <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: 56, color: INK }}>
        {META.earthMoonKm.toLocaleString('en-US')} KM
      </div>
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: ACCENT, marginTop: 6 }}>
        ± {META.rangingPrecisionMm} MM
      </div>
    </Fade>
  );
};

const YearReadout: React.FC<{ s: number }> = ({ s }) => {
  const [from, to] = BEAT.timelapse;
  if (s < from) return null;
  const year = Math.round(lerpKeyframes(YEAR_KEYFRAMES, s));
  return (
    <Fade
      from={t(from)}
      to={t(to)}
      style={{ position: 'absolute', top: 1150, left: 70, width: 790, textAlign: 'center' }}
    >
      <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: 88, color: INK }}>
        {year}
      </div>
    </Fade>
  );
};

const RecessionReadout: React.FC<{ s: number }> = ({ s }) => {
  const [from, to] = BEAT.payoff;
  if (s < from) return null;
  return (
    <Fade
      from={t(from + 1.0)}
      to={t(to)}
      style={{ position: 'absolute', top: 1240, left: 70, width: 790, textAlign: 'center' }}
    >
      <div style={{ fontFamily: 'Archivo Black', fontSize: 78, color: ACCENT }}>
        {META.recessionCmYr} CM
      </div>
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 36, color: DIM, letterSpacing: 3, marginTop: 6 }}>
        EVERY YEAR
      </div>
    </Fade>
  );
};

export const MoonMirrors: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const breath = useBreath();

  return (
    <AbsoluteFill style={{ backgroundColor: GROUND_FILL }}>
      <ReelGround accent={ACCENT} />

      <AbsoluteFill style={{ transform: breath }}>
        <ThreeCanvas
          width={REEL_W}
          height={REEL_H}
          linear
          camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.1, far: 60 }}
          gl={{ antialias: true, alpha: true }}
          style={{ backgroundColor: 'transparent' }}
        >
          <Scene s={s} />
        </ThreeCanvas>
      </AbsoluteFill>

      <Head from={BEAT.hook[0]} to={BEAT.hook[1]} lines={['THERE ARE MIRRORS', 'ON THE MOON.']} size={54} />
      <Head
        from={BEAT.announce[0]}
        to={BEAT.announce[1]}
        lines={['AN OBSERVATORY FIRES A LASER AT ONE.', 'TONIGHT, SOMEWHERE,', 'THIS IS HAPPENING.']}
        size={36}
      />
      <Head
        from={BEAT.spread[0]}
        to={BEAT.spread[1]}
        lines={['BY THE TIME IT ARRIVES,', 'THE BEAM IS SEVEN KILOMETRES WIDE.']}
        size={38}
      />
      <Head
        from={BEAT.dilution[0]}
        to={BEAT.dilution[1]}
        lines={['OUT OF 310 QUADRILLION PHOTONS SENT —', 'A HANDFUL COME BACK.']}
        size={34}
      />
      <PhotonReadout s={s} />
      <Head
        from={BEAT.roundtrip[0]}
        to={BEAT.roundtrip[1]}
        lines={['TIME THAT ROUND TRIP, AND YOU KNOW', 'THE DISTANCE — TO WITHIN A MILLIMETRE.']}
        size={34}
      />
      <Clock s={s} />
      <DistanceReadout s={s} />
      <Head from={BEAT.timelapse[0]} to={BEAT.timelapse[1]} lines={['DO THAT FOR OVER FIFTY YEARS.']} size={46} />
      <YearReadout s={s} />
      <Head
        from={BEAT.payoff[0]}
        to={BEAT.payoff[1]}
        lines={['THE MOON IS MEASURABLY LEAVING.']}
        size={44}
      />
      <RecessionReadout s={s} />

      <Fade
        from={t(BEAT.close[0])}
        style={{ position: 'absolute', top: 320, left: 70, width: 790, textAlign: 'center' }}
      >
        <div style={{ fontFamily: 'Archivo Black', fontSize: 42, color: INK, marginBottom: 26 }}>
          FIVE MIRRORS.
          <br />
          PLACED OVER FIFTY YEARS AGO.
          <br />
          STILL ANSWERING.
        </div>
        <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 36, color: DIM }}>
          Next: stop walking on the escalator —
          <br />
          more people get up it.
        </div>
      </Fade>
    </AbsoluteFill>
  );
};
