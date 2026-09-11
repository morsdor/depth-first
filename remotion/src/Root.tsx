import { Composition } from 'remotion';
import './brand/fonts'; // module-level font loads — must be imported once, here
import { DURATION_SECONDS as SHAZAM_SECONDS, Shazam } from './reels/Shazam';
import { Autocorrect, DURATION_SECONDS as AUTOCORRECT_SECONDS } from './reels/Autocorrect';
import { DURATION_SECONDS as QR_SECONDS, Qr } from './reels/Qr';
import { DURATION_SECONDS as JPEG_SECONDS, Jpeg } from './reels/Jpeg';
import { DURATION_SECONDS as GC_SECONDS, Greatcircle } from './reels/Greatcircle';
import { Cables, DURATION_SECONDS as CABLES_SECONDS } from './reels/Cables';
import { DURATION_SECONDS as TIDES_SECONDS, Tides } from './reels/Tides';
import { DURATION_SECONDS as PENDULUM_SECONDS, Pendulum } from './reels/Pendulum';
import { DURATION_SECONDS as EMPTINESS_SECONDS, Emptiness } from './reels/Emptiness';
import { DURATION_SECONDS as PHANTOM_SECONDS, PhantomJam } from './reels/PhantomJam';
import { DURATION_SECONDS as MANIM_SECONDS, ManimProbe } from './reels/ManimProbe';
import { SafeZones } from './reels/lib/chrome';

/**
 * Depth First — composition registry. POSTED REELS ONLY.
 *
 * 1080×1920 @ 30fps, NO handles: a reel is the final deliverable, not a Premiere
 * conform, so content starts at frame 0.
 *
 * Every reel registers TWICE — `rNNN-<slug>` and `rNNN-<slug>-safe`. The `-safe`
 * variant paints Instagram's chrome over the frame (red = covered by the header and
 * caption strip, amber = the like/comment/share rail) so a layout can be scrubbed
 * before posting. r001 shipped with its title inside the red band; that pair is the
 * bug's fix, and r001 itself predates it and has no `-safe` variant.
 *
 * Registered in reel order, which is also the order they were posted.
 *
 * ── What is NOT here ────────────────────────────────────────────────────────
 * Three built-but-never-posted reels were removed on 2026-09-10 on the decision not
 * to publish them: I51 shuffle (five rebuilds, never posted), I15 A* (failed the
 * sentence test after building), and the shelved I64 queue (stopped at Gate 3).
 * Their components, data modules and project folders went with them. They remain in
 * git history.
 *
 * The 77 long-form scene registrations that used to live below are on the branch
 * `yt-longform-archive-DO_NOT_DELETE`, with src/{families,scenes,components,lib}.
 *
 * Studio's Props editor writes visual edits back into defaultProps literals. Hand-edit
 * here — but do NOT regex-patch this file: strings carry escaped apostrophes and a
 * naive pattern corrupts them.
 */

const AutocorrectSafe: React.FC = () => (
  <>
    <Autocorrect />
    <SafeZones />
  </>
);

const QrSafe: React.FC = () => (
  <>
    <Qr />
    <SafeZones />
  </>
);

const JpegSafe: React.FC = () => (
  <>
    <Jpeg />
    <SafeZones />
  </>
);

const GreatcircleSafe: React.FC = () => (
  <>
    <Greatcircle />
    <SafeZones />
  </>
);

const CablesSafe: React.FC = () => (
  <>
    <Cables />
    <SafeZones />
  </>
);

const TidesSafe: React.FC = () => (
  <>
    <Tides />
    <SafeZones />
  </>
);

const PendulumSafe: React.FC = () => (
  <>
    <Pendulum />
    <SafeZones />
  </>
);

const EmptinessSafe: React.FC = () => (
  <>
    <Emptiness />
    <SafeZones />
  </>
);

const PhantomJamSafe: React.FC = () => (
  <>
    <PhantomJam />
    <SafeZones />
  </>
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* r001 · I02 · Shazam fingerprinting — posted 2026-09-02.
          Predates reels/lib/chrome.tsx and carries its own copies of it, which is why
          it has no -safe variant: it shipped with its title inside Instagram's top bar
          and that is the bug the shared chrome exists to prevent. */}
      <Composition
        id="r001-shazam"
        component={Shazam}
        durationInFrames={SHAZAM_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* r002 · I08 · autocorrect / edit distance — posted 2026-09-02 */}
      <Composition
        id="r002-autocorrect"
        component={Autocorrect}
        durationInFrames={AUTOCORRECT_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r002-autocorrect-safe"
        component={AutocorrectSafe}
        durationInFrames={AUTOCORRECT_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* r003 · I01 · QR / Reed–Solomon damage tolerance — posted 2026-09-05 */}
      <Composition
        id="r003-qr"
        component={Qr}
        durationInFrames={QR_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r003-qr-safe"
        component={QrSafe}
        durationInFrames={QR_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* r004 · I03 · JPEG / DCT — a photo stores no pixels — posted 2026-09-06 */}
      <Composition
        id="r004-jpeg"
        component={Jpeg}
        durationInFrames={JPEG_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r004-jpeg-safe"
        component={JpegSafe}
        durationInFrames={JPEG_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* r005 · I17 · great circle — the account's only hit, 80k+ views — posted 2026-09-08 */}
      <Composition
        id="r005-greatcircle"
        component={Greatcircle}
        durationInFrames={GC_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r005-greatcircle-safe"
        component={GreatcircleSafe}
        durationInFrames={GC_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* r006 · I22 · submarine cables — posted 2026-09-09 */}
      <Composition
        id="r006-cables"
        component={Cables}
        durationInFrames={CABLES_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r006-cables-safe"
        component={CablesSafe}
        durationInFrames={CABLES_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* r007 · I58 · tides — posted 2026-09-10 */}
      <Composition
        id="r007-tides"
        component={Tides}
        durationInFrames={TIDES_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r007-tides-safe"
        component={TidesSafe}
        durationInFrames={TIDES_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* r008 · I69 · pendulum wave — posted 2026-09-10. Needs the Manim PNG layer in
          remotion/public/manim/i69pendulum/ — regenerate it before rendering, see
          projects/r008_pendulum/NOTES.md. */}
      <Composition
        id="r008-pendulum"
        component={Pendulum}
        durationInFrames={PENDULUM_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r008-pendulum-safe"
        component={PendulumSafe}
        durationInFrames={PENDULUM_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* r009 · I70 · the biggest star is a speck — the first 3D reel, built on
          @remotion/three. No Manim layer and no external asset: the scene is drawn
          from remotion/src/reels/data/emptiness.ts, which emit_ts.py refuses to
          write unless all 13 on-screen claims hold. */}
      <Composition
        id="r009-emptiness"
        component={Emptiness}
        durationInFrames={EMPTINESS_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r009-emptiness-safe"
        component={EmptinessSafe}
        durationInFrames={EMPTINESS_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* r010 · I65 · a traffic jam with no cause. 3D by default from here on
          (CLAUDE.md, 2026-09-11). One parameter bends a straight highway into a
          755-foot ring and back, so the unroll is a real geometric morph rather
          than a cut — the shot that only exists because the scene is 3D. Every
          car position comes from remotion/src/reels/data/phantomJam.ts, which
          emit_ts.py refuses to write unless all 14 on-screen claims hold. */}
      <Composition
        id="r010-phantom-jam"
        component={PhantomJam}
        durationInFrames={PHANTOM_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r010-phantom-jam-safe"
        component={PhantomJamSafe}
        durationInFrames={PHANTOM_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Not a reel — the Manim bridge smoke test (scripts/manim_probe/probe.py). */}
      <Composition
        id="manim-probe"
        component={ManimProbe}
        durationInFrames={Math.round(MANIM_SECONDS * 30)}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
