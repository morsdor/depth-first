import { Composition } from 'remotion';
import './brand/fonts'; // module-level font loads — must be imported once, here
import { DURATION_SECONDS, Shazam } from './reels/Shazam';
import {
  Autocorrect,
  DURATION_SECONDS as AUTOCORRECT_SECONDS,
} from './reels/Autocorrect';
import { DURATION_SECONDS as QR_SECONDS, Qr } from './reels/Qr';
import { DURATION_SECONDS as JPEG_SECONDS, Jpeg } from './reels/Jpeg';
import { DURATION_SECONDS as SHUFFLE_SECONDS, Shuffle } from './reels/Shuffle';
import { DURATION_SECONDS as MANIM_SECONDS, ManimProbe } from './reels/ManimProbe';
import { Astar, DURATION_SECONDS as ASTAR_SECONDS } from './reels/Astar';
import { DURATION_SECONDS as QUEUE_SECONDS, Queue } from './reels/Queue';
import { DURATION_SECONDS as PENDULUM_SECONDS, Pendulum } from './reels/Pendulum';
import { Cables, DURATION_SECONDS as CABLES_SECONDS } from './reels/Cables';
import { DURATION_SECONDS as TIDES_SECONDS, Tides } from './reels/Tides';
import { DURATION_SECONDS as GC_SECONDS, Greatcircle } from './reels/Greatcircle';
import { SafeZones } from './reels/lib/chrome';

/**
 * Depth First — composition registry. SHORT-FORM ONLY.
 *
 * 1080×1920 @ 30fps, NO handles: a reel is the final deliverable, not a Premiere
 * conform, so content starts at frame 0. Every reel registers TWICE —
 * `rNNN-<slug>` and `rNNN-<slug>-safe` — and the `-safe` variant paints Instagram's
 * chrome over the frame so a layout can be scrubbed before posting. r001 shipped
 * with its title inside the red band; that is the bug the pair prevents.
 *
 * The 77 long-form scene registrations that used to live below line 317 were removed
 * on 2026-09-10 when the YouTube line was retired. They are preserved in full on the
 * branch `yt-longform-archive-DO_NOT_DELETE`, together with src/{families,scenes,
 * components,lib} and public/plates. Nothing here imports any of it.
 *
 * Studio's Props editor writes visual edits back into defaultProps literals. Hand-edit
 * here — but do NOT regex-patch this file: strings carry escaped apostrophes and a
 * naive pattern corrupts them.
 */

const ShuffleSafe: React.FC = () => (
  <>
    <Shuffle />
    <SafeZones />
  </>
);

const QueueSafe: React.FC = () => (
  <>
    <Queue />
    <SafeZones />
  </>
);

const PendulumSafe: React.FC = () => (
  <>
    <Pendulum />
    <SafeZones />
  </>
);

const AstarSafe: React.FC = () => (
  <>
    <Astar />
    <SafeZones />
  </>
);

const TidesSafe: React.FC = () => (
  <>
    <Tides />
    <SafeZones />
  </>
);

const CablesSafe: React.FC = () => (
  <>
    <Cables />
    <SafeZones />
  </>
);

const GreatcircleSafe: React.FC = () => (
  <>
    <Greatcircle />
    <SafeZones />
  </>
);

const JpegSafe: React.FC = () => (
  <>
    <Jpeg />
    <SafeZones />
  </>
);

const QrSafe: React.FC = () => (
  <>
    <Qr />
    <SafeZones />
  </>
);

const AutocorrectSafe: React.FC = () => (
  <>
    <Autocorrect />
    <SafeZones />
  </>
);

export const RemotionRoot: React.FC = () => {
  return (
    <>

      {/* ── r001 · short-form ────────────────────────────────────────────────
          1080×1920 for Instagram/Shorts, no handles — a reel is the final
          deliverable, not a Premiere conform. Every mark is computed output from
          projects/r001_shazam/fingerprint.py. */}
      <Composition
        id="r001-shazam"
        component={Shazam}
        durationInFrames={DURATION_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r002-autocorrect"
        component={Autocorrect}
        durationInFrames={AUTOCORRECT_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

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

      <Composition
        id="manim-probe"
        component={ManimProbe}
        durationInFrames={Math.round(MANIM_SECONDS * 30)}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r008-astar"
        component={Astar}
        durationInFrames={ASTAR_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r008-astar-safe"
        component={AstarSafe}
        durationInFrames={ASTAR_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* r010 · I69 · fifteen pendulums, and the thirty seconds they take to come back */}
      <Composition
        id="r010-pendulum"
        component={Pendulum}
        durationInFrames={PENDULUM_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r010-pendulum-safe"
        component={PendulumSafe}
        durationInFrames={PENDULUM_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* I64 · one line or four — a real queueing simulation.
          SHELVED at Gate 3 ("the output is not sound"), so it holds NO reel number:
          r009 went to I58 tides. See projects/i64_queue/NOTES.md. */}
      <Composition
        id="i64-queue"
        component={Queue}
        durationInFrames={QUEUE_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="i64-queue-safe"
        component={QueueSafe}
        durationInFrames={QUEUE_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r009-tides"
        component={Tides}
        durationInFrames={TIDES_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r009-tides-safe"
        component={TidesSafe}
        durationInFrames={TIDES_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r007-cables"
        component={Cables}
        durationInFrames={CABLES_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r007-cables-safe"
        component={CablesSafe}
        durationInFrames={CABLES_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r006-greatcircle"
        component={Greatcircle}
        durationInFrames={GC_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r006-greatcircle-safe"
        component={GreatcircleSafe}
        durationInFrames={GC_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r005-shuffle"
        component={Shuffle}
        durationInFrames={SHUFFLE_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r005-shuffle-safe"
        component={ShuffleSafe}
        durationInFrames={SHUFFLE_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Same reel with Instagram's chrome painted over it. Red = covered by the
          IG header / caption strip, amber = the like-comment-share rail. Scrub
          this before posting: r001 shipped with its title inside the red band. */}
      <Composition
        id="r002-autocorrect-safe"
        component={AutocorrectSafe}
        durationInFrames={AUTOCORRECT_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

    </>
  );
};
