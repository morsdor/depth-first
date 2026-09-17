import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { FPS, Fade, REEL_H, REEL_W, ReelGround, ease, t, useBreath } from './lib/chrome';
import { AMBIENT, CLOCK_KEYFRAMES, COASTLINES, CONVERGING, META } from './data/hijack';

/**
 * r014 · I31 — a typo once took a country off the internet (it wasn't a typo).
 *
 * ── The spine ────────────────────────────────────────────────────────────
 * 24 Feb 2008: Pakistan Telecom announces a route for YouTube's address block,
 * meant to stay inside Pakistan. Its upstream provider, PCCW Global, never
 * validated the announcement before repeating it to the rest of the world.
 * 97 networks were carrying it within 2 min 30 s. It stayed broken for 2h14m.
 * VERIFIED against RIPE NCC's own RIS case study, a Google Research analysis
 * of this exact event, and Renesys's contemporaneous writeup — see
 * gate0/GATE0.md §5. "Typo" appears nowhere on screen: the block was
 * intentional, the leak was a missing validation step downstream.
 *
 * GATE 3 was passed as a pre-registered novelty-channel experiment with NO
 * argument-ammunition leg (gate0/GATE0.md §9) — judged on likes/saves/watch
 * time against the teaching-reel baseline, not sends.
 *
 * ── The one ruler ────────────────────────────────────────────────────────
 * Elapsed time since the 18:47 UTC announcement, on a single running clock,
 * via CLOCK_KEYFRAMES (piecewise-linear, shared with emit_ts.py so the clock
 * the viewer reads and the clock the claims are checked against are the same
 * function). "97 networks" is a one-time fact, not a second competing ruler.
 *
 * ── The 3D shot that only exists because this is 3D ─────────────────────
 * The camera is fixed (<ThreeCanvas> takes it as a prop); a wrapping <group>
 * moves. The dive: the globe starts small and slowly turning (orbit), then
 * the group ROTATES to bring Karachi to face the camera while SCALING up, so
 * the sphere's own curvature reads as "arriving at street level" without any
 * separate ground geometry — then reverses, scaling back down and rotating to
 * a wide default view as the leak spreads. Same object, one continuous move,
 * the way non-negotiable 6 requires.
 *
 * A solid inner sphere (opaque, real depth test) sits just under the coastline
 * and arc geometry so the far side of the globe correctly occludes anything
 * behind it — a great-circle arc to the far side of the world should vanish
 * over the horizon, the way it would on an actual globe.
 */
export const DURATION_SECONDS = 44;

const ACCENT = '#51A4FF'; // DOMAIN_ACCENT.languages — §3
const INK = '#E8E6E1';
const DIM = '#81A2C4';
const GLOBE_FILL = '#040E1F'; // matches ReelGround's base, so the globe reads as "the same dark"
const COAST_LINE = '#274064'; // BASE.graphite

// Sized against the PORTRAIT frame's tighter (horizontal) frustum, not the
// vertical one -- a sphere sized to fit the vertical FOV alone overflowed the
// sides of the frame and filled the screen edge to edge even at "wide" scale.
// That tuning fit the raw 1080-wide canvas, not Instagram's narrower safe
// COLUMN (x 60-870, non-negotiable 1) -- the safe-area audit measured the
// idle globe's right edge at x~976 at CAM_Z=6, and still x~872 (2px over) at
// CAM_Z=8. CAM_Z=8.5 closed that but shrank the WHOLE scene enough to reopen
// motion-audit dead spells that were previously passing (stat/duration held
// on nothing but a now-smaller marker pulse) -- pulling the camera back
// fights the wrong variable. R=0.715 (down 0.7% from 0.72) closes the same
// 2px idle gap surgically, at CAM_Z=8, without shrinking every other beat.
// The idle x-overflow (x~872 vs the x<=870 limit) turned out to be the globe
// silhouette itself, not the Head text (insetting the text boxes below did
// not move this number) -- and a small CAM_Z nudge (8 -> 8.15) didn't move
// it either, because the resulting shift was under one 4px measurement
// bucket (SCALE=4 in reel_safe_audit.py). Shrinking R instead of pushing
// CAM_Z further keeps this surgical: CAM_Z also shrinks every OTHER
// object's on-screen size via perspective (including the close-beat ping,
// which is what the motion audit needed), while R only pulls in the globe's
// own geometry.
const R = 0.66; // sphere radius, world units -- full-res edge measured at
// exactly x=870 (the boundary itself) at R=0.69; this gives real margin so
// the audit's downsample step (scale=4 in reel_safe_audit.py, which can
// round a boundary-touching edge up a bucket) doesn't flip it back to FAIL.
const CAM_Z = 8.15;
const FOV = 30;

/** Beat boundaries, seconds. Matches SCRIPT.md and emit_ts.py's BEAT_* consts. */
const BEAT = {
  hook: [0.0, 3.0],
  announce: [3.0, 9.0],
  contained: [9.0, 13.5],
  leak: [13.5, 20.5],
  stat: [20.5, 26.0],
  duration: [26.0, 32.0],
  resolve: [32.0, 38.0],
  close: [38.0, 44.0],
} as const;

/** lon=0,lat=0 -> (0,0,r): facing the fixed camera at rotation zero. */
function lonLatToVec3(lon: number, lat: number, r: number): [number, number, number] {
  const lo = (lon * Math.PI) / 180;
  const la = (lat * Math.PI) / 180;
  return [r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo)];
}

/** Same piecewise-linear lookup as emit_ts.py's clock_at() — one source of
 * truth for what the clock reads, so a change here without a matching
 * regeneration is caught by re-running emit_ts.py's own assertions. */
function clockAt(screenS: number): number {
  const kf = CLOCK_KEYFRAMES;
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

function mmss(totalSeconds: number): string {
  const s = Math.round(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/** A tube along a great-circle path draped on the sphere, so it has real
 * screen-space width regardless of the WebGL driver's line-width support
 * (Divergence.tsx's ribbon trick, generalised to 3D via TubeGeometry). */
function arcTube(path: [number, number][], radius: number, tubeRadius: number) {
  const pts = path.map(([lon, lat]) => new THREE.Vector3(...lonLatToVec3(lon, lat, radius)));
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, Math.max(8, pts.length), tubeRadius, 6, false);
}

const Coastlines: React.FC = () => {
  const geo = useMemo(() => {
    const rings = COASTLINES.map((flat) => {
      const pts: number[] = [];
      for (let i = 0; i < flat.length - 1; i += 2) {
        const [x, y, z] = lonLatToVec3(flat[i], flat[i + 1], R * 1.001);
        pts.push(x, y, z);
      }
      return new Float32Array(pts);
    });
    return rings;
  }, []);
  return (
    <>
      {geo.map((arr, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[arr, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={COAST_LINE} transparent opacity={0.55} />
        </line>
      ))}
    </>
  );
};

const ArcLayer: React.FC<{
  paths: [number, number][][];
  color: string;
  opacity: number;
  reveal: number[]; // per-arc reveal progress, 0..1
}> = ({ paths, color, opacity, reveal }) => {
  const geos = useMemo(
    () => paths.map((p) => arcTube(p, R, 0.018)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paths.length],
  );
  return (
    <>
      {geos.map((g, i) => {
        const rv = reveal[i] ?? 1;
        if (rv <= 0.001) return null;
        return (
          <mesh key={i} geometry={g} scale={[1, 1, Math.min(1, rv * 1.02)]}>
            <meshBasicMaterial color={color} transparent opacity={opacity} />
          </mesh>
        );
      })}
    </>
  );
};

const Marker: React.FC<{ lon: number; lat: number; color: string; scale: number; opacity: number }> = ({
  lon,
  lat,
  color,
  scale,
  opacity,
}) => {
  const pos = lonLatToVec3(lon, lat, R * 1.02);
  return (
    <mesh position={pos} scale={scale}>
      <sphereGeometry args={[0.055, 12, 12]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
};

const CONVERGE_ORDER = ['LONDON', 'LAGOS', 'TOKYO', 'SYDNEY', 'SAO PAULO', 'MUMBAI'] as const;
const CONVERGE_COORD: Record<string, [number, number]> = {
  LONDON: [-0.1278, 51.5074],
  LAGOS: [3.3792, 6.5244],
  TOKYO: [139.6917, 35.6895],
  SYDNEY: [151.2093, -33.8688],
  'SAO PAULO': [-46.6333, -23.5505],
  MUMBAI: [72.8777, 19.076],
};

const Scene: React.FC<{ s: number }> = ({ s }) => {
  // Peak scale has TWO independent ceilings, and the tighter one wins.
  // (1) CAM_Z / R -- where the near surface reaches the camera itself: the
  //     old peak of 15 (at the old CAM_Z=6) put R*15=10.8 past the camera,
  //     so the camera sat inside solid globe material for several seconds --
  //     a black, unreadable frame in the middle of the reel's one 3D-only
  //     shot. That ceiling alone allows values well above 6.
  // (2) The safe-area HEADER band (y >= 270), which the audit never exempts
  //     even with --bleed (scripts/reel_safe_frames.py: "the ONE line that
  //     is never exempt"). At CAM_Z=8, R=0.715, a dive past ~2.09 pushes the
  //     sphere's vertical extent above y=270 -- confirmed by the safe-area
  //     audit measuring y0 down to 4 at the old peak of 6. THIS is the
  //     binding constraint, not (1): 1.9 keeps real margin under 2.09 while
  //     still reading as a genuine push-in from the baseline of 1.
  const dive = interpolate(
    s,
    [0, BEAT.hook[1], BEAT.announce[1] - 1, BEAT.contained[1], BEAT.leak[1]],
    [1, 1, 1.9, 1.5, 1],
    ease,
  );
  // Ambient slow spin during the hook, blending into the deliberate
  // "face Karachi" rotation so there is no pop at the beat boundary.
  const ambientRotY = -0.05 * Math.min(s, BEAT.hook[1]);
  const [kLon, kLat] = META.karachi;
  const faceKarachiY = -(kLon * Math.PI) / 180;
  const faceKarachiX = (kLat * Math.PI) / 180;
  const worldY = -(20 * Math.PI) / 180; // a pleasant default facing East Africa / South Asia
  const worldX = (8 * Math.PI) / 180;
  const rotY = interpolate(
    s,
    [0, BEAT.hook[1], BEAT.announce[1] - 1, BEAT.contained[1], BEAT.leak[1]],
    [0, ambientRotY, faceKarachiY, faceKarachiY, worldY],
    ease,
  );
  const rotX = interpolate(
    s,
    [0, BEAT.hook[1], BEAT.announce[1] - 1, BEAT.contained[1], BEAT.leak[1]],
    [-0.18, -0.18, faceKarachiX, faceKarachiX, worldX],
    ease,
  );
  // Every angle above is a fixed keyframe past 20.5s, so the whole back half
  // of the reel (stat/duration/resolve/close) would otherwise turn the globe
  // into a frozen frame the moment the leak/unreveal animation finishes --
  // the close beat's own copy calls it "the full orbit view," which should
  // still be turning. Resume the same slow ambient spin rate used in the
  // hook (non-negotiable 4: nothing is ever perfectly still).
  const postLeakSpin = s > BEAT.leak[1] ? -0.05 * (s - BEAT.leak[1]) : 0;
  const rotYSpinning = rotY + postLeakSpin;

  // Six arcs reveal in a staggered sweep across the leak beat (13.5-20.5) --
  // a directorial stagger for legibility, not a claim about real per-city
  // propagation timing (only the AGGREGATE 97-in-2:30 figure is verified).
  const [leakStart, leakEnd] = BEAT.leak;
  const reveal = CONVERGE_ORDER.map((_, i) => {
    const t0 = leakStart + (i / CONVERGE_ORDER.length) * (leakEnd - leakStart - 2);
    const t1 = t0 + 2;
    return interpolate(s, [t0, t1], [0, 1], ease);
  });
  // Resolution beat plays the same reveal in reverse.
  const [resStart, resEnd] = BEAT.resolve;
  const unreveal = reveal.map((r) => {
    const back = interpolate(s, [resStart, resEnd], [1, 0], ease);
    return Math.min(r, back);
  });
  const showConverging = s < resStart ? reveal : unreveal;

  const karachiIgnite = interpolate(s, [BEAT.announce[0], BEAT.announce[0] + 1], [0, 1], ease);
  const karachiDim = interpolate(s, [resStart, resEnd], [1, 0.15], ease);
  const karachiOpacity = Math.min(karachiIgnite, s < resStart ? 1 : karachiDim);
  const pulse = 1 + 0.15 * Math.sin((2 * Math.PI * s) / 1.6);

  // The close beat's hold is otherwise a near-black globe (GLOBE_FILL matches
  // the ground on purpose) with only fixed text on top -- the rotation added
  // above moves a few small, dim markers by single-digit pixels, which the
  // motion audit correctly reads as no event at all (non-negotiable 4: "a
  // moving 15px dot is worth almost nothing"). A repeating ping from the exact
  // point the leak started is a real, story-true event -- "this is still the
  // exposed point" -- not a decoration added to pass a number.
  // Starts at BEAT.leak[1] (20.5s), not just the close beat's tail: shrinking
  // the globe to fix the safe-area x-overflow (R went 0.72 -> 0.66) weakened
  // the same rotation this reel leans on for "nothing is ever perfectly
  // still" everywhere the leak/unreveal animations aren't themselves
  // providing motion -- a new dead spell opened in the STAT beat (21.8s,
  // well before resEnd) for the same underlying reason the close beat needed
  // this in the first place. Running it for the whole post-convergence hold
  // (stat/duration/resolve/close) is also the more honest story choice: "the
  // exposed point, still there" applies for the whole back half, not just
  // the last few seconds.
  // A sawtooth (linear grow, hard reset) put a discontinuous pop at the wrap
  // point, and the trough right before it read as near-static to the audit --
  // a 1.75s dead spell against the 1.5s limit. A cosine breathes continuously
  // through the wrap with no reset and never dims fully to zero.
  const pingStart = BEAT.leak[1];
  const pingPeriod = 1.6;
  const pingActive = s >= pingStart;
  const pingPhase = pingActive ? ((s - pingStart) % pingPeriod) / pingPeriod : 0;
  const pingWave = 0.5 - 0.5 * Math.cos(2 * Math.PI * pingPhase);
  const pingScale = 0.8 + 2.2 * pingWave;
  const pingOpacity = pingActive ? 0.12 + 0.38 * pingWave : 0;

  const originOpacity = (i: number) => {
    const lit = 1 - showConverging[i] * 0.85;
    return 0.55 + 0.45 * lit;
  };

  const ambientPaths = useMemo(() => AMBIENT.map((a) => a.path), []);
  // Bumped from 0.5 during the hook: shrinking R to fix the safe-area
  // x-overflow (0.72 -> 0.66) also shrank this pulse's own swept pixel area,
  // reopening the hook's dead spell -- a brighter base helps the same pulse
  // clear the audit's threshold without changing its rhythm.
  const ambientOpacity = interpolate(s, [0, BEAT.hook[1], BEAT.leak[0]], [0.62, 0.62, 0.12], ease);
  // The hook's own script beat calls for "traffic light-trails already
  // animating" -- with a static reveal=1 these were motionless lines, so the
  // first ~2.5s after the title fades in had nothing moving at large-enough
  // scale (a small, slowly-rotating globe barely shifts pixels). A phase-
  // offset pulse per arc reads as ordinary background traffic breathing, not
  // an audit patch, and it runs for the whole reel rather than just the hook.
  // Range widened (was 0.35-1.0) and period shortened (was 2.4s) for the same
  // reason as the opacity bump above -- the smaller globe needed a bigger,
  // faster swing to keep clearing the motion audit's threshold.
  const AMBIENT_PULSE = 1.8;
  const ambientReveal = ambientPaths.map((_, i) => {
    const phase = (i / Math.max(1, ambientPaths.length)) * AMBIENT_PULSE;
    const local = (((s + phase) % AMBIENT_PULSE) + AMBIENT_PULSE) % AMBIENT_PULSE;
    return 0.05 + 0.95 * (0.5 - 0.5 * Math.cos((2 * Math.PI * local) / AMBIENT_PULSE));
  });

  const bx = 0.03 * Math.sin((2 * Math.PI * s) / 13);
  const by = 0.03 * Math.sin((2 * Math.PI * s) / 17);

  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[4, 6, 8]} intensity={0.7} />
      <directionalLight position={[-6, -3, 4]} intensity={0.3} />
      <group position={[bx, by, 0]}>
        <group scale={dive} rotation={[rotX, rotYSpinning, 0]}>
          <mesh>
            <sphereGeometry args={[R, 64, 64]} />
            <meshBasicMaterial color={GLOBE_FILL} />
          </mesh>
          <Coastlines />
          <ArcLayer paths={ambientPaths} color={DIM} opacity={ambientOpacity} reveal={ambientReveal} />
          <ArcLayer
            paths={CONVERGE_ORDER.map((n) => CONVERGING[n].path)}
            color={ACCENT}
            opacity={0.9}
            reveal={showConverging}
          />
          {CONVERGE_ORDER.map((name, i) => {
            const [lon, lat] = CONVERGE_COORD[name];
            // A phase-offset scale pulse, not just opacity -- the ambient
            // ARC pulse (above) turned out too subtle to register on the
            // motion audit even boosted, because a tube's reveal-length
            // change is mostly hidden behind its own fixed 0.018-unit
            // thickness. A MARKER's own screen size doesn't shrink when R
            // does (it's positioned by R but sized independently), which is
            // the same property that made the Karachi ping reliable -- so
            // reuse that mechanism here for the hook's six origin dots. A
            // first pass at a mild +-22% twinkle (~1.56x scale range, so
            // ~2.4x AREA range) still left the exact same 0.5-3.0s dead
            // spell -- CAM_Z going 6 -> 8.15 for the safe-area fix shrank
            // every on-screen object by the same ratio, marker or not, so a
            // mild oscillation wasn't enough. This swings scale 0.49-1.75x
            // (~12.8x area range), matching the size of the Karachi ping
            // that was proven to clear the audit elsewhere in this reel.
            const twinklePhase = (((s + i * (1.4 / 6)) % 1.4) + 1.4) % 1.4;
            const twinkleWave = 0.5 - 0.5 * Math.cos((2 * Math.PI * twinklePhase) / 1.4);
            const twinkle = 0.7 + 1.8 * twinkleWave;
            return (
              <Marker
                key={name}
                lon={lon}
                lat={lat}
                color={DIM}
                scale={0.7 * twinkle}
                opacity={originOpacity(i)}
              />
            );
          })}
          <Marker lon={kLon} lat={kLat} color={ACCENT} scale={0.8 * pulse} opacity={karachiOpacity} />
          {pingOpacity > 0 && (
            <Marker lon={kLon} lat={kLat} color={ACCENT} scale={pingScale} opacity={pingOpacity} />
          )}
        </group>
      </group>
    </>
  );
};

const Head: React.FC<{ from: number; to: number; lines: string[]; size?: number }> = ({
  from,
  to,
  lines,
  size = 50,
}) => (
  <Fade
    from={t(from)}
    to={t(to)}
    // left 60 / width 810 put the right edge at exactly x=870 -- the safe-
    // area boundary itself, zero margin -- and bold-text antialiasing bled a
    // couple of px past it on every frame the hook's headline was up,
    // regardless of anything in the 3D scene (confirmed: changing camera
    // distance and sphere radius never moved this number). 10px inset each
    // side keeps text glyphs off the boundary.
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
  if (s < BEAT.announce[0]) return null;
  const secs = clockAt(s);
  return (
    <Fade
      from={t(BEAT.announce[0])}
      style={{ position: 'absolute', top: 1440, left: 70, width: 790, textAlign: 'center' }}
    >
      <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: 76, color: ACCENT }}>
        {mmss(secs)}
      </div>
    </Fade>
  );
};

const NetworksReadout: React.FC<{ s: number }> = ({ s }) => {
  const [from, to] = BEAT.stat;
  if (s < from) return null;
  const count = Math.round(interpolate(s, [from, from + 0.8], [0, META.asnsAffected], ease));
  return (
    <Fade
      from={t(from)}
      to={t(to)}
      style={{ position: 'absolute', top: 1100, left: 70, width: 790, textAlign: 'center' }}
    >
      <div style={{ fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: 88, color: INK }}>
        {count} NETWORKS
      </div>
    </Fade>
  );
};

export const Hijack: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const breath = useBreath();

  return (
    <AbsoluteFill style={{ backgroundColor: GLOBE_FILL }}>
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

      <Head from={BEAT.hook[0]} to={BEAT.hook[1]} lines={['ONE COUNTRY TRIED TO BLOCK YOUTUBE', '— FOR ITSELF.']} size={44} />
      <Head
        from={BEAT.announce[0]}
        to={BEAT.announce[1]}
        lines={['18:47 UTC, FEBRUARY 24TH, 2008.', "PAKISTAN TELECOM SENDS ONE MESSAGE:", "'SEND YOUTUBE'S TRAFFIC TO ME.'"]}
        size={36}
      />
      <Head
        from={BEAT.contained[0]}
        to={BEAT.contained[1]}
        lines={['IT WAS ONLY SUPPOSED TO WORK', 'INSIDE PAKISTAN.']}
        size={40}
      />
      <Head
        from={BEAT.leak[0]}
        to={BEAT.leak[1]}
        lines={["PAKISTAN'S OWN PROVIDER PASSED IT ON", 'TO THE REST OF THE INTERNET —', 'AND NEVER CHECKED IF IT WAS TRUE.']}
        size={34}
      />
      <NetworksReadout s={s} />
      <Head from={BEAT.stat[0]} to={BEAT.stat[1]} lines={['TWO AND A HALF MINUTES.']} size={44} />
      <Head
        from={BEAT.duration[0]}
        to={BEAT.duration[1]}
        lines={['FOR JUST OVER TWO HOURS,', "MOST OF THE PLANET COULDN'T REACH IT."]}
        size={40}
      />
      <Head
        from={BEAT.resolve[0]}
        to={BEAT.resolve[1]}
        lines={['THEN YOUTUBE ANNOUNCED A MORE', 'SPECIFIC ROUTE OF ITS OWN —', 'AND THE WORLD FOUND ITS WAY BACK.']}
        size={36}
      />
      <Clock s={s} />

      <Fade
        from={t(BEAT.close[0])}
        style={{ position: 'absolute', top: 320, left: 70, width: 790, textAlign: 'center' }}
      >
        <div style={{ fontFamily: 'Archivo Black', fontSize: 42, color: INK, marginBottom: 26 }}>
          NOBODY ASKED FOR ID.
          <br />
          THE INTERNET RUNS ON TRUST.
        </div>
        <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 38, color: DIM }}>
          Next: switching doors doubles your chances —
          <br />
          and it&rsquo;s not 50/50.
        </div>
      </Fade>
    </AbsoluteFill>
  );
};
