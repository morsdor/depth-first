// One-time install of whisper.cpp + a model, used to word-time a recorded voice-over.
//   node scripts/whisper-setup.mjs
//
// Why these two choices:
//   • version 1.5.5 — the oldest release Remotion supports with token-level timestamps, and
//     it builds with plain `make`. 1.7.3+ needs cmake, which this Mac does not have.
//   • small.en (~487 MB) — the script is known in advance, so the transcript is only used to
//     recover WHEN each word was said; the extra size over base.en buys robustness to accent
//     and to the non-dictionary words in the script ("Uber", "H3").
//
// Everything lands in remotion/whisper.cpp/, which is git-ignored (binary + weights, re-downloadable).
//
// Traps found the first time this was used (transcribe() from the same package):
//   • it needs `whisperCppVersion: '1.5.5'` passed explicitly, or it throws "Both inputs should be
//     strings. Expected x.x.x" — keep this file's version and that option in step.
//   • it writes `tmp.json` into the CURRENT directory; run it from a scratch folder or delete it.
//   • with tokenLevelTimestamps + splitOnWord a word's END time includes the pause after it, and
//     digits come back for number-words ("two" -> "2") — align to the approved script, anchor on starts.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {downloadWhisperModel, installWhisperCpp} from '@remotion/install-whisper-cpp';

const here = path.dirname(fileURLToPath(import.meta.url));
const to = path.join(here, '..', 'whisper.cpp');

const {alreadyExisted} = await installWhisperCpp({to, version: '1.5.5'});
console.log(alreadyExisted ? 'whisper.cpp already built' : 'whisper.cpp built');

// node scripts/whisper-setup.mjs [model]   e.g. small.en (default, 0.45 GB), medium.en (1.43 GB), large-v3 (2.88 GB)
const model = process.argv[2] ?? 'small.en';
await downloadWhisperModel({model, folder: to});
console.log(`${model} model ready in`, to);
