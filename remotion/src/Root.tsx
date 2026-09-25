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
import { DURATION_SECONDS as DIVERGENCE_SECONDS, Divergence } from './reels/Divergence';
import { DURATION_SECONDS as BOARDING_SECONDS, Boarding } from './reels/Boarding';
import { DURATION_SECONDS as EARNINGS_SECONDS, EarningsPeak } from './reels/EarningsPeak';
import { Breath, DURATION_SECONDS as BREATH_SECONDS } from './reels/Breath';
import { DURATION_SECONDS as HIJACK_SECONDS, Hijack } from './reels/Hijack';
import { DURATION_SECONDS as MOONMIRRORS_SECONDS, MoonMirrors } from './reels/MoonMirrors';
import { DURATION_SECONDS as EVMOTOR_SECONDS, EvMotor } from './reels/EvMotor';
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

const DivergenceSafe: React.FC = () => (
  <>
    <Divergence />
    <SafeZones />
  </>
);

const BoardingSafe: React.FC = () => (
  <>
    <Boarding />
    <SafeZones />
  </>
);

const EarningsPeakSafe: React.FC = () => (
  <>
    <EarningsPeak />
    <SafeZones />
  </>
);

const BreathSafe: React.FC = () => (
  <>
    <Breath />
    <SafeZones />
  </>
);

const HijackSafe: React.FC = () => (
  <>
    <Hijack />
    <SafeZones />
  </>
);

const MoonMirrorsSafe: React.FC = () => (
  <>
    <MoonMirrors />
    <SafeZones />
  </>
);

const EvMotorSafe: React.FC = () => (
  <>
    <EvMotor />
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

      {/* r010 · I71 · two double pendulums, one a hair's width off. THE FIRST LOOP
          FORMAT REEL — 12 s against the 28-54 s of everything before it, because the
          runtime is the experiment (see projects/r010_divergence/gate0/GATE0.md §4).
          3D for material only: the camera is near-orthographic at FOV 12, since the
          reel rests on a separation measured in single pixels and perspective would
          corrupt it. Data from remotion/src/reels/data/divergence.ts, which
          emit_ts.py refuses to write unless all 12 on-screen claims hold. */}
      <Composition
        id="r010-divergence"
        component={Divergence}
        durationInFrames={DIVERGENCE_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r010-divergence-safe"
        component={DivergenceSafe}
        durationInFrames={DIVERGENCE_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* r011 · I73 · aeroplane boarding. Two boardings of the SAME cabin by the
          SAME 72 passengers, differing only in the order they are called in. The
          model lands within 1% of the back-to-front time and 7% of the random time
          measured on 72 real people in a mock 757 in 2011, with nothing fitted, and
          144 of 144 sweep points keep back to front slower. 3D is spent on one
          move: the cabin block tips over at 8 s so the camera falls down the two
          aisles where the bins are, and tips back at 18 s for the finish. Data from
          remotion/src/reels/data/boarding.ts, which emit_ts.py refuses to write
          unless all 30 on-screen claims hold. */}
      <Composition
        id="r011-boarding"
        component={Boarding}
        durationInFrames={BOARDING_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r011-boarding-safe"
        component={BoardingSafe}
        durationInFrames={BOARDING_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* r012 · I84 · your pay has a peak age — posted 2026-09-12.
          Pre-registered "this is you" format experiment: Gate 0 kill condition 2
          (no chart payoff) is deliberately waived in writing
          (projects/r012_earnings/gate0/GATE0.md §5). The line is a monotone
          interpolation through cited anchors from Brady & Bass (ICI), "A Day in
          the Life Cycle" (IRS SOI, 2024) — real 2016 tax data. Peaks at age 46,
          $41,000; the decline past 55 is cross-checked in the source against
          real panel data following the same individuals, which is the one leg
          of this claim with genuine longitudinal backing. Data from
          remotion/src/reels/data/earningsPeak.ts, which emit_ts.py refuses to
          write unless every on-screen claim holds. First reading: 2,421 views,
          2,092 viewers, like rate ~0.10% — the account's weakest engagement —
          alongside its first majority-Tier-1 audience; see
          brand_guide_software.md §13. */}
      <Composition
        id="r012-earnings"
        component={EarningsPeak}
        durationInFrames={EARNINGS_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r012-earnings-safe"
        component={EarningsPeakSafe}
        durationInFrames={EARNINGS_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* r013 · I81 · you don't sweat fat off, you breathe it out —
          POSTED 2026-09-16 (37s), RE-CUT AND RE-POSTED 2026-09-17 (39s). The
          average human triglyceride, C55H104O6, grown as a real ball-and-stick
          molecule from tetrahedral/trigonal bond-angle constraints
          (projects/r013_breath/breath.py), not an authored diagram.
          Independently re-derives 84.25% of the fat's own mass leaving as CO2
          and 15.75% as H2O against Meerman & Brown's published 84% / 16%
          (BMJ 2014;349:g7257). One continuous @remotion/three camera push
          from the wide human scene into the molecule and back. Data from
          remotion/src/reels/data/breath.ts, which emit_ts.py refuses to
          write unless all 22 on-screen claims hold. Both cuts floored on
          retention — see brand_guide_software.md §13 "A HOOK FIX MADE
          RETENTION WORSE" and projects/r013_breath/NOTES.md. */}
      <Composition
        id="r013-breath"
        component={Breath}
        durationInFrames={BREATH_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r013-breath-safe"
        component={BreathSafe}
        durationInFrames={BREATH_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* r014 · I31 · a typo once took a country off the internet (it wasn't a
          typo) — NOT YET POSTED, in gate. Claimed r014, not r013: r013 was
          taken by the already-posted Breath reel (I81) while this build was
          in progress on a separate machine/session. 24 Feb 2008: Pakistan
          Telecom leaked a route for YouTube's address block worldwide via its
          upstream PCCW, which never validated the announcement. 97 networks
          in 2:30; 2h14m to fix. VERIFIED against RIPE NCC's RIS case study, a
          Google Research analysis of the same event, and Renesys's
          contemporaneous writeup (gate0/GATE0.md §5) — "typo" appears nowhere
          on screen. GATE 3 passed as a pre-registered novelty-channel
          experiment with no argument-ammunition leg (gate0/GATE0.md §9). 3D
          is spent on one continuous move: the globe scales up and rotates to
          bring Karachi to face the camera (arriving at "street level" via the
          sphere's own curvature, no separate ground geometry), then reverses
          as the leak spreads. Data from remotion/src/reels/data/hijack.ts,
          which emit_ts.py refuses to write unless every on-screen claim
          holds. */}
      <Composition
        id="r014-hijack"
        component={Hijack}
        durationInFrames={HIJACK_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r014-hijack-safe"
        component={HijackSafe}
        durationInFrames={HIJACK_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* r015 · I77 · there are mirrors on the Moon, and observatories still
          bounce lasers off them — NOT YET POSTED, in gate. Claimed r015 the
          moment its script was written (gate0/ moved to projects/r015_moonmirrors/).
          Apollo 11/14/15 and Lunokhod 1/2 are still ranged today; timing the
          round trip to a few picoseconds gives ~1mm precision on 384,400 km,
          and 57 years of that shows the Moon receding 3.83 cm/year. VERIFIED
          against APOLLO's own instrument papers, an LLR round-trip-loss
          review and Eos.org's recession feature (gate0/GATE0.md §5). GATE 3
          passed as the strongest send-test answer since r005 (settles moon-
          landing denial with a real measurement) and flagged for real
          toxicity risk in its own comments. 3D is spent on one continuous
          move: the root group's position is solved each frame so a FOCUS
          point (observatory, then reflector, then back) lands exactly at
          the origin regardless of current scale/rotation, so the ambient
          spin never has to pause for the dive to read. Data from
          remotion/src/reels/data/moonmirrors.ts, which emit_ts.py refuses to
          write unless every on-screen claim holds. */}
      <Composition
        id="r015-moonmirrors"
        component={MoonMirrors}
        durationInFrames={MOONMIRRORS_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r015-moonmirrors-safe"
        component={MoonMirrorsSafe}
        durationInFrames={MOONMIRRORS_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* r016 · I85 · of every $100 you pay for, how much reaches the wheels —
          gas car $23, electric car $64 (FASTSim on the EPA combined cycle,
          validated against EPA sticker figures; inside DOE's own published
          numbers; every EV beats every gas car across all 51 in the database).
          NOT YET POSTED. The motor's coil glow and rotor angle are computed
          per frame from real three-phase currents (projects/r016_evmotor/
          motor.py); data from remotion/src/reels/data/evmotor.ts, which
          emit_ts.py refuses to write unless every on-screen claim holds. */}
      <Composition
        id="r016-evmotor"
        component={EvMotor}
        durationInFrames={EVMOTOR_SECONDS * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="r016-evmotor-safe"
        component={EvMotorSafe}
        durationInFrames={EVMOTOR_SECONDS * 30}
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
