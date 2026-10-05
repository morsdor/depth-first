// One 16 kHz mono WAV in, a word-timed transcript JSON out. Called by scripts/vo_align.py — not by hand.
//   node vo-transcribe.mjs <input.wav> <output.json>
//
// whisper.cpp 1.5.5 + a model (default small.en; VO_WHISPER_MODEL overrides), installed by `node scripts/whisper-setup.mjs [model]`.
// DELIBERATELY no `--prompt` seeded with the script: a model primed with the exact script will "hear" words the
// speaker skipped, and the aligner exists precisely to catch a skipped or misspoken word.
//
// Run it with a scratch folder as cwd: transcribe() drops a `tmp.json` into the current directory.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {toCaptions, transcribe} from '@remotion/install-whisper-cpp';

const [, , input, output] = process.argv;
if (!input || !output) {
  console.error('usage: node vo-transcribe.mjs <input.wav> <output.json>');
  process.exit(2);
}
const here = path.dirname(fileURLToPath(import.meta.url));

const whisperCppOutput = await transcribe({
  inputPath: path.resolve(input),
  whisperPath: path.join(here, '..', 'whisper.cpp'),
  whisperCppVersion: '1.5.5',
  model: process.env.VO_WHISPER_MODEL ?? 'small.en',
  tokenLevelTimestamps: true,
  splitOnWord: true,
  printOutput: false,
});
const {captions} = toCaptions({whisperCppOutput});
fs.writeFileSync(
  path.resolve(output),
  JSON.stringify(captions.map((c) => ({text: c.text.trim(), startMs: c.startMs, endMs: c.endMs})), null, 1),
);
