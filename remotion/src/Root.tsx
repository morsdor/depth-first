import { Composition } from 'remotion';
import './brand/fonts'; // module-level font loads — must be imported once, here
import { Diagram } from './families/Diagram';
import { MapRoute } from './families/MapRoute';
import { PlateAnnotated } from './families/PlateAnnotated';
import { DURATION_SECONDS, Shazam } from './reels/Shazam';
import {
  Autocorrect,
  DURATION_SECONDS as AUTOCORRECT_SECONDS,
} from './reels/Autocorrect';
import { DURATION_SECONDS as QR_SECONDS, Qr } from './reels/Qr';
import { DURATION_SECONDS as JPEG_SECONDS, Jpeg } from './reels/Jpeg';
import { DURATION_SECONDS as SHUFFLE_SECONDS, Shuffle } from './reels/Shuffle';
import { DURATION_SECONDS as MANIM_SECONDS, ManimProbe } from './reels/ManimProbe';
import { DURATION_SECONDS as GC_SECONDS, Greatcircle } from './reels/Greatcircle';
import { SafeZones } from './reels/lib/chrome';
import { TitleCard } from './scenes/TitleCard';
import { Scene16 } from './scenes/Scene16';
import { Scene24 } from './scenes/Scene24';
import { Scene31 } from './scenes/Scene31';
import { Scene44 } from './scenes/Scene44';
import { Scene55 } from './scenes/Scene55';
import { Scene59 } from './scenes/Scene59';
import { Scene63 } from './scenes/Scene63';
import { Scene69 } from './scenes/Scene69';
import { Scene73 } from './scenes/Scene73';
import { Scene77 } from './scenes/Scene77';

/**
 * Depth First — composition registry.
 *
 * s001 · Why AI Is So Expensive to Run — 77 scenes, 26,652 frames.
 *
 * Studio's Props editor writes visual edits back into the defaultProps literals below.
 * Hand-edit here — but do NOT regex-patch this file: the strings carry escaped
 * apostrophes and a naive pattern corrupts them. Regenerate wholesale or edit by hand.
 *
 * Plate scenes use PlateAnnotated: a leader-line annotation on the plate's MEASURED
 * brightest mass, one light sweep, a vignette, and a mono scene mark.
 *
 * 3840×2160 @ 30fps, 30 frames of handles at BOTH ends. Content starts at frame 30.
 */

const ShuffleSafe: React.FC = () => (
  <>
    <Shuffle />
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

      {/* scene_01 · detail · the hook: the weightlessness the whole video will dismantle */}
      <Composition
        id="scene-01"
        component={PlateAnnotated}
        durationInFrames={270}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_01.png',
          push: 3 as const,
          direction: 'in' as const,
          markerX: 0.495,
          markerY: 0.475,
          annotation: 'the lit screen',
          labelSide: 'left' as const,
          labelRise: 760,
          sceneMark: 'S01 · DETAIL',
        }}
      />

      {/* scene_02 · scale_comparison · plant the honest small number so the payoff can't be called a  */}
      <Composition
        id="scene-02"
        component={Diagram}
        durationInFrames={357}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['0.3 Wh — one answer', '2 seconds of a microwave'],
          layout: 'bars' as const,
          weights: [0.54, 1.0],
          texts: [{ text: '0.3 Wh — one answer', start: 0.5, end: 5.4, position: 'top' }, { text: '2 seconds of a microwave', start: 5.0, end: 9.3, position: 'top' }],
        }}
      />

      {/* scene_03 · establishing · state the contract: a question the viewer now wants answered */}
      <Composition
        id="scene-03"
        component={PlateAnnotated}
        durationInFrames={309}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_03.png',
          push: 0 as const,
          direction: 'in' as const,
          markerX: 0.452,
          markerY: 0.631,
          annotation: 'the lit hall',
          labelSide: 'right' as const,
          labelRise: 557,
          sceneMark: 'S03 · ESTABLISHING',
        }}
      />

      {/* scene_04 · establishing · the tease — name the reactor without explaining it */}
      <Composition
        id="scene-04"
        component={PlateAnnotated}
        durationInFrames={297}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_04.png',
          push: 4 as const,
          direction: 'in' as const,
          markerX: 0.72,
          markerY: 0.461,
          annotation: 'the towers on the horizon line',
          labelSide: 'left' as const,
          labelRise: 760,
          sceneMark: 'S04 · ESTABLISHING',
        }}
      />

      {/* scene_05 · narrative · make it human and specific before it becomes industrial */}
      <Composition
        id="scene-05"
        component={PlateAnnotated}
        durationInFrames={345}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_05.png',
          push: 3 as const,
          direction: 'in' as const,
          markerX: 0.633,
          markerY: 0.324,
          annotation: 'the single brighter window',
          labelSide: 'left' as const,
          labelRise: 479,
          sceneMark: 'S05 · NARRATIVE',
        }}
      />

      {/* scene_06 · narrative · breadth — this is everyone, not a niche */}
      <Composition
        id="scene-06"
        component={PlateAnnotated}
        durationInFrames={384}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_06.png',
          push: 4 as const,
          direction: 'in' as const,
          markerX: 0.613,
          markerY: 0.485,
          annotation: 'the centre pool of light',
          labelSide: 'left' as const,
          labelRise: 566,
          sceneMark: 'S06 · NARRATIVE',
        }}
      />

      {/* scene_07 · detail · name the illusion explicitly — the thesis in one word: weightl */}
      <Composition
        id="scene-07"
        component={PlateAnnotated}
        durationInFrames={369}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_07.png',
          push: 3 as const,
          direction: 'in' as const,
          markerX: 0.33,
          markerY: 0.326,
          annotation: 'the blinking cursor',
          labelSide: 'right' as const,
          labelRise: 484,
          sceneMark: 'S07 · DETAIL',
        }}
      />

      {/* scene_08 · scale_comparison · concede the honest point up front — earns trust for the escala */}
      <Composition
        id="scene-08"
        component={Diagram}
        durationInFrames={309}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['one question', 'cost: ~nothing'],
          layout: 'row' as const,
          texts: [{ text: 'one question', start: 0.5, end: 4.6, position: 'bottom' }, { text: 'cost: ~nothing', start: 4.2, end: 7.7, position: 'bottom' }],
        }}
      />

      {/* scene_09 · map · the pivot: singular to fleet. The whole argument turns here */}
      <Composition
        id="scene-09"
        component={MapRoute}
        durationInFrames={309}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          drawOnFrames: 16,
          texts: [{ text: '~1,000,000,000 / day', start: 0.5, end: 7.7, position: 'top' }],
        }}
      />

      {/* scene_10 · cross_section · the wire — introduce the through-line the video literally foll */}
      <Composition
        id="scene-10"
        component={Diagram}
        durationInFrames={309}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['your question', '→ something enormous'],
          layout: 'row' as const,
          texts: [{ text: 'your question', start: 0.5, end: 4.6, position: 'bottom' }, { text: '→ something enormous', start: 4.2, end: 7.7, position: 'bottom' }],
        }}
      />

      {/* scene_11 · establishing · state the method: we follow one query backwards */}
      <Composition
        id="scene-11"
        component={PlateAnnotated}
        durationInFrames={396}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_11.png',
          push: 0 as const,
          direction: 'in' as const,
          markerX: 0.753,
          markerY: 0.603,
          annotation: 'the datacenter where all lines meet',
          labelSide: 'left' as const,
          labelRise: 556,
          sceneMark: 'S11 · ESTABLISHING',
        }}
      />

      {/* scene_12 · title · title card — Why AI Is So Expensive to Run */}
      <Composition
        id="scene-12"
        component={TitleCard}
        durationInFrames={210}
        fps={30}
        width={3840}
        height={2160}
      />

      {/* scene_13 · cross_section · deliver the hero small number cleanly and without spin */}
      <Composition
        id="scene-13"
        component={Diagram}
        durationInFrames={396}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['0.3 Wh'],
          layout: 'row' as const,
          texts: [{ text: '0.3 Wh', start: 0.5, end: 10.6, position: 'bottom' }],
        }}
      />

      {/* scene_14 · scale_comparison · anchor 0.3 Wh to a body-scale referent, then raise the myth */}
      <Composition
        id="scene-14"
        component={PlateAnnotated}
        durationInFrames={357}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_14.png',
          push: 3 as const,
          direction: 'in' as const,
          markerX: 0.497,
          markerY: 0.346,
          annotation: 'a couple of minutes of this',
          labelSide: 'right' as const,
          labelRise: 527,
          sceneMark: 'S14 · SCALE COMPARISON',
        }}
      />

      {/* scene_15 · scale_comparison · correct the myth generously — credit the engineers, no scoldin */}
      <Composition
        id="scene-15"
        component={Diagram}
        durationInFrames={369}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['2023 estimate', 'today — ~10× lower'],
          layout: 'bars' as const,
          weights: [1.0, 0.1],
          texts: [{ text: '2023 estimate', start: 0.5, end: 5.7, position: 'top' }, { text: 'today — ~10× lower', start: 5.3, end: 9.7, position: 'top' }],
        }}
      />

      {/* scene_16 · cross_section · show the number is a floor, not a ceiling */}
      <Composition
        id="scene-16"
        component={Scene16}
        durationInFrames={396}
        fps={30}
        width={3840}
        height={2160}
      />

      {/* scene_17 · scale_comparison · the 100x spread — the first real jolt */}
      <Composition
        id="scene-17"
        component={PlateAnnotated}
        durationInFrames={297}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_17.png',
          push: 5 as const,
          direction: 'in' as const,
          markerX: 0.56,
          markerY: 0.573,
          annotation: 'one hard question',
          labelSide: 'left' as const,
          labelRise: 760,
          sceneMark: 'S17 · SCALE COMPARISON',
        }}
      />

      {/* scene_18 · detail · re-frame: the thesis is not per-query guilt */}
      <Composition
        id="scene-18"
        component={Diagram}
        durationInFrames={345}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['0.3'],
          layout: 'row' as const,
          texts: [{ text: '0.3', start: 0.5, end: 8.9, position: 'bottom' }],
        }}
      />

      {/* scene_19 · map · hand off to the ladder — 'follow the wire' is the spine cue */}
      <Composition
        id="scene-19"
        component={MapRoute}
        durationInFrames={384}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          drawOnFrames: 16,
          texts: [{ text: 'follow the wire', start: 0.5, end: 10.2, position: 'bottom' }],
        }}
      />

      {/* scene_20 · establishing · first scale-shock: the query's destination is a building */}
      <Composition
        id="scene-20"
        component={PlateAnnotated}
        durationInFrames={384}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_20.png',
          push: 4 as const,
          direction: 'in' as const,
          markerX: 0.276,
          markerY: 0.466,
          annotation: 'the door at the near corner',
          labelSide: 'right' as const,
          labelRise: 627,
          sceneMark: 'S20 · ESTABLISHING',
        }}
      />

      {/* scene_21 · detail · hero the chip — the physical object doing the thinking */}
      <Composition
        id="scene-21"
        component={PlateAnnotated}
        durationInFrames={345}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_21.png',
          push: 4 as const,
          direction: 'in' as const,
          sceneMark: 'S21 · DETAIL',
          texts: [{ text: 'NVIDIA H100 · ~700 W', start: 0.5, end: 8.9, position: 'bottom' }],
        }}
      />

      {/* scene_22 · cross_section · one chip is already absurd — and it is never one */}
      <Composition
        id="scene-22"
        component={PlateAnnotated}
        durationInFrames={309}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_22.png',
          push: 4 as const,
          direction: 'in' as const,
          markerX: 0.652,
          markerY: 0.652,
          annotation: '×8 per tray',
          labelSide: 'left' as const,
          labelRise: 760,
          sceneMark: 'S22 · CROSS SECTION',
        }}
      />

      {/* scene_23 · scale_comparison · convert watts into homes — the unit the viewer feels */}
      <Composition
        id="scene-23"
        component={Diagram}
        durationInFrames={333}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['one tray ≈ 10 kW', '≈ 5 homes'],
          layout: 'bars' as const,
          weights: [1.0, 1.0],
          texts: [{ text: 'one tray ≈ 10 kW', start: 0.5, end: 5.0, position: 'bottom' }, { text: '≈ 5 homes', start: 4.6, end: 8.5, position: 'bottom' }],
        }}
      />

      {/* scene_24 · scale_comparison · the multiply: rack to hall to town */}
      <Composition
        id="scene-24"
        component={Scene24}
        durationInFrames={333}
        fps={30}
        width={3840}
        height={2160}
      />

      {/* scene_25 · establishing · name the concealment — the emotional core of the video */}
      <Composition
        id="scene-25"
        component={PlateAnnotated}
        durationInFrames={369}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_25.png',
          push: 4 as const,
          direction: 'in' as const,
          markerX: 0.329,
          markerY: 0.522,
          annotation: 'the small chat window',
          labelSide: 'left' as const,
          labelRise: 493,
          sceneMark: 'S25 · ESTABLISHING',
        }}
      />

      {/* scene_26 · cross_section · the physics turn that opens the water beat */}
      <Composition
        id="scene-26"
        component={Diagram}
        durationInFrames={396}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['electricity in', 'heat out'],
          layout: 'row' as const,
          texts: [{ text: 'electricity in', start: 0.5, end: 6.2, position: 'top' }, { text: 'heat out', start: 5.8, end: 10.6, position: 'top' }],
        }}
      />

      {/* scene_27 · establishing · set up cost #2 as inevitable, not incidental */}
      <Composition
        id="scene-27"
        component={PlateAnnotated}
        durationInFrames={369}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_27.png',
          push: 4 as const,
          direction: 'in' as const,
          sceneMark: 'S27 · ESTABLISHING',
        }}
      />

      {/* scene_28 · establishing · why water — it is a heat problem, not a thirst problem */}
      <Composition
        id="scene-28"
        component={PlateAnnotated}
        durationInFrames={357}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_28.png',
          push: 4 as const,
          direction: 'in' as const,
          markerX: 0.602,
          markerY: 0.244,
          annotation: 'the largest plume where it leaves the tower',
          labelSide: 'right' as const,
          labelRise: 307,
          sceneMark: 'S28 · ESTABLISHING',
        }}
      />

      {/* scene_29 · detail · the on-site number, honestly small */}
      <Composition
        id="scene-29"
        component={PlateAnnotated}
        durationInFrames={321}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_29.png',
          push: 3 as const,
          direction: 'in' as const,
          markerX: 0.275,
          markerY: 0.183,
          annotation: 'a few mL — one answer',
          labelSide: 'right' as const,
          labelRise: 180,
          sceneMark: 'S29 · DETAIL',
        }}
      />

      {/* scene_30 · map · the misdirection: the water is upstream, not here */}
      <Composition
        id="scene-30"
        component={MapRoute}
        durationInFrames={282}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          drawOnFrames: 16,
          texts: [{ text: 'most of the water is NOT here', start: 0.5, end: 6.8, position: 'top' }],
        }}
      />

      {/* scene_31 · establishing · the grid's own water cost — the hidden second boundary */}
      <Composition
        id="scene-31"
        component={Scene31}
        durationInFrames={408}
        fps={30}
        width={3840}
        height={2160}
      />

      {/* scene_32 · map · connect the two boundaries into one chain */}
      <Composition
        id="scene-32"
        component={MapRoute}
        durationInFrames={345}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          drawOnFrames: 16,
          texts: [{ text: 'power →', start: 0.5, end: 5.2, position: 'bottom' }, { text: '← water already spent', start: 4.8, end: 8.9, position: 'bottom' }],
        }}
      />

      {/* scene_33 · scale_comparison · deliver ~15 mL and immediately flag its uncertainty */}
      <Composition
        id="scene-33"
        component={Diagram}
        durationInFrames={396}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['on-site: a few mL', 'grid: ~10 mL', '≈ 15 mL'],
          layout: 'bars' as const,
          weights: [0.33, 0.67, 1.0],
          texts: [{ text: 'on-site: a few mL', start: 0.5, end: 6.2, position: 'top' }, { text: 'grid: ~10 mL', start: 5.8, end: 10.6, position: 'top' }],
        }}
      />

      {/* scene_34 · detail · the humility beat — credibility with the expert viewer */}
      <Composition
        id="scene-34"
        component={Diagram}
        durationInFrames={321}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['≈ 15 mL', '± depends on site & cooling'],
          layout: 'row' as const,
          texts: [{ text: '≈ 15 mL', start: 0.5, end: 4.8, position: 'bottom' }, { text: '± depends on site & cooling', start: 4.4, end: 8.1, position: 'bottom' }],
        }}
      />

      {/* scene_35 · narrative · re-arm the fleet refrain and hand off to silicon */}
      <Composition
        id="scene-35"
        component={PlateAnnotated}
        durationInFrames={321}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_35.png',
          push: 4 as const,
          direction: 'in' as const,
          sceneMark: 'S35 · NARRATIVE',
        }}
      />

      {/* scene_36 · detail · reframe the chip from component to artefact */}
      <Composition
        id="scene-36"
        component={PlateAnnotated}
        durationInFrames={333}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_36.png',
          push: 3 as const,
          direction: 'in' as const,
          markerX: 0.387,
          markerY: 0.439,
          annotation: 'the wafer\'s centre',
          labelSide: 'right' as const,
          labelRise: 728,
          sceneMark: 'S36 · DETAIL',
        }}
      />

      {/* scene_37 · cross_section · the precision — awe, not statistics */}
      <Composition
        id="scene-37"
        component={Diagram}
        durationInFrames={321}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['a human hair', 'a virus', 'the features on this chip'],
          layout: 'row' as const,
          texts: [{ text: 'a human hair', start: 0.5, end: 4.8, position: 'top' }, { text: 'a virus', start: 4.4, end: 8.1, position: 'top' }],
        }}
      />

      {/* scene_38 · establishing · the ASML fact — a genuine jaw-drop, kept about the machine */}
      <Composition
        id="scene-38"
        component={PlateAnnotated}
        durationInFrames={321}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_38.png',
          push: 4 as const,
          direction: 'in' as const,
          markerX: 0.452,
          markerY: 0.448,
          annotation: 'one manufacturer on Earth',
          labelSide: 'right' as const,
          labelRise: 747,
          sceneMark: 'S38 · ESTABLISHING',
        }}
      />

      {/* scene_39 · establishing · the fab as its own industrial appetite */}
      <Composition
        id="scene-39"
        component={PlateAnnotated}
        durationInFrames={396}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_39.png',
          push: 4 as const,
          direction: 'in' as const,
          markerX: 0.509,
          markerY: 0.381,
          annotation: 'the nearest suited figure',
          labelSide: 'right' as const,
          labelRise: 602,
          sceneMark: 'S39 · ESTABLISHING',
        }}
      />

      {/* scene_40 · scale_comparison · the fab's power AND water in one line — the ladder's 4th rung */}
      <Composition
        id="scene-40"
        component={Diagram}
        durationInFrames={309}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['the power of a small city', 'the water of a small town'],
          layout: 'bars' as const,
          weights: [0.85, 0.7],
          texts: [{ text: 'the power of a small city', start: 0.5, end: 4.6, position: 'top' }, { text: 'the water of a small town', start: 4.2, end: 7.7, position: 'top' }],
        }}
      />

      {/* scene_41 · scale_comparison · make the volume physical */}
      <Composition
        id="scene-41"
        component={Diagram}
        durationInFrames={396}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['millions of gallons — every day'],
          layout: 'row' as const,
          texts: [{ text: 'millions of gallons — every day', start: 0.5, end: 10.6, position: 'bottom' }],
        }}
      />

      {/* scene_42 · map · TSMC vs countries — then the wit line that lands the beat */}
      <Composition
        id="scene-42"
        component={MapRoute}
        durationInFrames={396}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          drawOnFrames: 16,
          texts: [{ text: 'one company', start: 0.5, end: 6.2, position: 'bottom' }, { text: '> some entire countries', start: 5.8, end: 10.6, position: 'bottom' }],
        }}
      />

      {/* scene_43 · scale_comparison · summarise the three costs and cue the multiply */}
      <Composition
        id="scene-43"
        component={Diagram}
        durationInFrames={396}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['build', 'cool', 'make', '× ?'],
          layout: 'row' as const,
          texts: [{ text: 'build', start: 0.5, end: 6.2, position: 'top' }, { text: 'cool', start: 5.8, end: 10.6, position: 'top' }],
        }}
      />

      {/* scene_44 · map · recap the ladder and return to the spine */}
      <Composition
        id="scene-44"
        component={Scene44}
        durationInFrames={345}
        fps={30}
        width={3840}
        height={2160}
      />

      {/* scene_45 · scale_comparison · pose the aggregate question in the viewer's own terms */}
      <Composition
        id="scene-45"
        component={Diagram}
        durationInFrames={309}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['one query', '× 1,000,000,000 / day'],
          layout: 'bars' as const,
          weights: [0.001, 1.0],
          texts: [{ text: 'one query', start: 0.5, end: 4.6, position: 'top' }, { text: '× 1,000,000,000 / day', start: 4.2, end: 7.7, position: 'top' }],
        }}
      />

      {/* scene_46 · cross_section · growth rate — the number that makes it a trend, not a snapshot */}
      <Composition
        id="scene-46"
        component={Diagram}
        durationInFrames={408}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['data centres +15%/yr', 'everything else'],
          layout: 'bars' as const,
          weights: [1.0, 0.24],
          texts: [{ text: 'data centres +15%/yr', start: 0.5, end: 6.4, position: 'top' }, { text: 'everything else', start: 6.0, end: 11.0, position: 'top' }],
        }}
      />

      {/* scene_47 · map · Ireland: the abstraction becomes a country */}
      <Composition
        id="scene-47"
        component={MapRoute}
        durationInFrames={384}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          drawOnFrames: 16,
          texts: [{ text: '23% of the national grid', start: 0.5, end: 10.2, position: 'top' }],
        }}
      />

      {/* scene_48 · scale_comparison · make 23% concrete: halls instead of homes */}
      <Composition
        id="scene-48"
        component={Diagram}
        durationInFrames={357}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['homes', 'server halls', '+518% in a decade'],
          layout: 'row' as const,
          texts: [{ text: 'homes', start: 0.5, end: 5.4, position: 'bottom' }, { text: 'server halls', start: 5.0, end: 9.3, position: 'bottom' }],
        }}
      />

      {/* scene_49 · map · a state had to say no — the first hard consequence */}
      <Composition
        id="scene-49"
        component={MapRoute}
        durationInFrames={345}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          drawOnFrames: 16,
          texts: [{ text: 'no new connections', start: 0.5, end: 8.9, position: 'bottom' }],
        }}
      />

      {/* scene_50 · scale_comparison · the planetary figure, framed as projection */}
      <Composition
        id="scene-50"
        component={Diagram}
        durationInFrames={369}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['~3% of all power humanity generates', 'by 2030'],
          layout: 'bars' as const,
          weights: [0.03, 1.0],
          texts: [{ text: '~3% of all power humanity generates', start: 0.5, end: 5.7, position: 'bottom' }, { text: 'by 2030', start: 5.3, end: 9.7, position: 'bottom' }],
        }}
      />

      {/* scene_51 · scale_comparison · beat heavy industry — the comparison that lands hardest */}
      <Composition
        id="scene-51"
        component={PlateAnnotated}
        durationInFrames={321}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_51.png',
          push: 5 as const,
          direction: 'in' as const,
          sceneMark: 'S51 · SCALE COMPARISON',
          texts: [{ text: 'aluminium · steel · cement · chemicals', start: 0.5, end: 4.8, position: 'top' }, { text: 'vs data centres', start: 4.4, end: 8.1, position: 'top' }],
        }}
      />

      {/* scene_52 · cross_section · set up the training-vs-inference inversion */}
      <Composition
        id="scene-52"
        component={Diagram}
        durationInFrames={369}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['training — once'],
          layout: 'row' as const,
          texts: [{ text: 'training — once', start: 0.5, end: 9.7, position: 'top' }],
        }}
      />

      {/* scene_53 · scale_comparison · the inversion: running it beat building it */}
      <Composition
        id="scene-53"
        component={Diagram}
        durationInFrames={321}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['training — once', 'running it — forever'],
          layout: 'bars' as const,
          weights: [0.3, 1.0],
          texts: [{ text: 'training — once', start: 0.5, end: 4.8, position: 'top' }, { text: 'running it — forever', start: 4.4, end: 8.1, position: 'top' }],
        }}
      />

      {/* scene_54 · establishing · the hinge into the climax */}
      <Composition
        id="scene-54"
        component={PlateAnnotated}
        durationInFrames={297}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_54.png',
          push: 4 as const,
          direction: 'in' as const,
          markerX: 0.155,
          markerY: 0.539,
          annotation: 'the tower silhouettes on the right horizon',
          labelSide: 'right' as const,
          labelRise: 494,
          sceneMark: 'S54 · ESTABLISHING',
        }}
      />

      {/* scene_55 · establishing · the reveal — a name that carries its own dread */}
      <Composition
        id="scene-55"
        component={Scene55}
        durationInFrames={420}
        fps={30}
        width={3840}
        height={2160}
      />

      {/* scene_56 · narrative · the history, precisely — Unit 2 melted, Unit 1 survived */}
      <Composition
        id="scene-56"
        component={PlateAnnotated}
        durationInFrames={345}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_56.png',
          push: 4 as const,
          direction: 'in' as const,
          markerX: 0.874,
          markerY: 0.171,
          annotation: '1979',
          labelSide: 'left' as const,
          labelRise: 180,
          sceneMark: 'S56 · NARRATIVE',
          texts: [{ text: '2019', start: 4.8, end: 8.9, position: 'bottom' }],
        }}
      />

      {/* scene_57 · detail · the death of the plant — the low before the turn */}
      <Composition
        id="scene-57"
        component={PlateAnnotated}
        durationInFrames={297}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_57.png',
          push: 3 as const,
          direction: 'in' as const,
          markerX: 0.498,
          markerY: 0.475,
          annotation: '2019 — shut down',
          labelSide: 'left' as const,
          labelRise: 760,
          sceneMark: 'S57 · DETAIL',
        }}
      />

      {/* scene_58 · narrative · the turn — resurrection, and for whom */}
      <Composition
        id="scene-58"
        component={PlateAnnotated}
        durationInFrames={357}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_58.png',
          push: 4 as const,
          direction: 'in' as const,
          markerX: 0.631,
          markerY: 0.767,
          annotation: '2024 — restart',
          labelSide: 'left' as const,
          labelRise: 760,
          sceneMark: 'S58 · NARRATIVE',
        }}
      />

      {/* scene_59 · scale_comparison · the hero number the thumbnail promised: 835 MW */}
      <Composition
        id="scene-59"
        component={Scene59}
        durationInFrames={357}
        fps={30}
        width={3840}
        height={2160}
      />

      {/* scene_60 · detail · the cost, then convert MW into something human */}
      <Composition
        id="scene-60"
        component={Diagram}
        durationInFrames={345}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['20-year agreement', '> $1 billion'],
          layout: 'row' as const,
          texts: [{ text: '20-year agreement', start: 0.5, end: 5.2, position: 'top' }, { text: '> $1 billion', start: 4.8, end: 8.9, position: 'top' }],
        }}
      />

      {/* scene_61 · scale_comparison · 800k homes, re-routed to one customer — the asymmetry made vis */}
      <Composition
        id="scene-61"
        component={PlateAnnotated}
        durationInFrames={309}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_61.png',
          push: 5 as const,
          direction: 'in' as const,
          markerX: 0.717,
          markerY: 0.561,
          annotation: '~750,000 homes',
          labelSide: 'left' as const,
          labelRise: 760,
          sceneMark: 'S61 · SCALE COMPARISON',
          texts: [{ text: 'one customer', start: 4.2, end: 7.7, position: 'top' }],
        }}
      />

      {/* scene_62 · detail · close the loop opened in scene 3 */}
      <Composition
        id="scene-62"
        component={PlateAnnotated}
        durationInFrames={270}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_62.png',
          push: 3 as const,
          direction: 'in' as const,
          markerX: 0.488,
          markerY: 0.553,
          annotation: 'one question',
          labelSide: 'right' as const,
          labelRise: 760,
          sceneMark: 'S62 · DETAIL',
        }}
      />

      {/* scene_63 · establishing · THE title payoff — held on the towers, one continuous move */}
      <Composition
        id="scene-63"
        component={Scene63}
        durationInFrames={432}
        fps={30}
        width={3840}
        height={2160}
      />

      {/* scene_64 · detail · hand the honest counter-argument to the viewer, unprompted */}
      <Composition
        id="scene-64"
        component={PlateAnnotated}
        durationInFrames={420}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_64.png',
          push: 3 as const,
          direction: 'in' as const,
          sceneMark: 'S64 · DETAIL',
        }}
      />

      {/* scene_65 · scale_comparison · concede fully, then turn */}
      <Composition
        id="scene-65"
        component={Diagram}
        durationInFrames={396}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          labels: ['one query', '≈ a few seconds of TV'],
          layout: 'bars' as const,
          weights: [0.8, 1.0],
          texts: [{ text: 'one query', start: 0.5, end: 6.2, position: 'top' }, { text: '≈ a few seconds of TV', start: 5.8, end: 10.6, position: 'top' }],
        }}
      />

      {/* scene_66 · map · the thesis in one sentence — concentration, not per-prompt gui */}
      <Composition
        id="scene-66"
        component={MapRoute}
        durationInFrames={396}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          drawOnFrames: 16,
        }}
      />

      {/* scene_67 · establishing · relocate the weight — and turn to wonder */}
      <Composition
        id="scene-67"
        component={PlateAnnotated}
        durationInFrames={369}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_67.png',
          push: 4 as const,
          direction: 'in' as const,
          markerX: 0.298,
          markerY: 0.605,
          annotation: 'the chat panel',
          labelSide: 'right' as const,
          labelRise: 760,
          sceneMark: 'S67 · ESTABLISHING',
        }}
      />

      {/* scene_68 · establishing · begin the roll-call of the hidden chain */}
      <Composition
        id="scene-68"
        component={PlateAnnotated}
        durationInFrames={297}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_68.png',
          push: 4 as const,
          direction: 'in' as const,
          markerX: 0.31,
          markerY: 0.07,
          annotation: 'the power station\'s turbine hall',
          labelSide: 'right' as const,
          labelRise: 180,
          sceneMark: 'S68 · ESTABLISHING',
        }}
      />

      {/* scene_69 · cross_section · the collapse — civilisation-scale to a cursor */}
      <Composition
        id="scene-69"
        component={Scene69}
        durationInFrames={357}
        fps={30}
        width={3840}
        height={2160}
      />

      {/* scene_70 · detail · the house line — echoes 001's 'no monument to a gradient' */}
      <Composition
        id="scene-70"
        component={PlateAnnotated}
        durationInFrames={333}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_70.png',
          push: 0 as const,
          direction: 'in' as const,
          markerX: 0.498,
          markerY: 0.478,
          annotation: 'the empty plinth top',
          labelSide: 'left' as const,
          labelRise: 760,
          sceneMark: 'S70 · DETAIL',
          lightSweep: false,
        }}
      />

      {/* scene_71 · narrative · the emotional peak — the thesis as a closing aphorism */}
      <Composition
        id="scene-71"
        component={PlateAnnotated}
        durationInFrames={357}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_71.png',
          push: 5 as const,
          direction: 'in' as const,
          sceneMark: 'S71 · NARRATIVE',
        }}
      />

      {/* scene_72 · detail · return to the phone — the callback frame */}
      <Composition
        id="scene-72"
        component={PlateAnnotated}
        durationInFrames={357}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_72.png',
          push: 4 as const,
          direction: 'in' as const,
          sceneMark: 'S72 · DETAIL',
        }}
      />

      {/* scene_73 · cross_section · the ladder recited back, one continuous pull */}
      <Composition
        id="scene-73"
        component={Scene73}
        durationInFrames={408}
        fps={30}
        width={3840}
        height={2160}
      />

      {/* scene_74 · establishing · land the chain on the reactor — final rung */}
      <Composition
        id="scene-74"
        component={PlateAnnotated}
        durationInFrames={321}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_74.png',
          push: 4 as const,
          direction: 'in' as const,
          markerX: 0.579,
          markerY: 0.455,
          annotation: 'the towers',
          labelSide: 'left' as const,
          labelRise: 760,
          sceneMark: 'S74 · ESTABLISHING',
        }}
      />

      {/* scene_75 · establishing · the closing line — held */}
      <Composition
        id="scene-75"
        component={PlateAnnotated}
        durationInFrames={270}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_75.png',
          push: 0 as const,
          direction: 'in' as const,
          markerX: 0.781,
          markerY: 0.505,
          annotation: 'the one lit point in a vast dark field',
          labelSide: 'left' as const,
          labelRise: 491,
          sceneMark: 'S75 · ESTABLISHING',
        }}
      />

      {/* scene_76 · detail · sign-off */}
      <Composition
        id="scene-76"
        component={PlateAnnotated}
        durationInFrames={309}
        fps={30}
        width={3840}
        height={2160}
        defaultProps={{
          domain: 'infrastructure' as const,
          plate: 'plates/scene_76.png',
          push: 3 as const,
          direction: 'in' as const,
          sceneMark: 'S76 · DETAIL',
        }}
      />

      {/* scene_77 · outro · outro card — subscribe + next video, title sting reprise */}
      <Composition
        id="scene-77"
        component={Scene77}
        durationInFrames={240}
        fps={30}
        width={3840}
        height={2160}
      />

    </>
  );
};
