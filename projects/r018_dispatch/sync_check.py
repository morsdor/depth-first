#!/usr/bin/env python3
"""Is the voice in the RENDERED mp4 where the animation thinks it is?

Pulls the audio back out of the finished video, force-aligns the approved script onto it again (independently of the
build), and compares every word's start with the screen time `emit_ts.py` cued the animation to. A drift here means
the picture and the voice disagree no matter what the code says.

    cd projects/r018_dispatch && ../../.venv/bin/python sync_check.py r018_dispatch.mp4
"""
import json
import pathlib
import re
import subprocess
import sys
import tempfile

import numpy as np

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
mp4 = pathlib.Path(sys.argv[1]).resolve()
vo = json.loads((HERE / 'vo_words.json').read_text())
ts = (ROOT / 'remotion/src/reels/data/dispatchVo.ts').read_text()
trim = int(re.search(r'VO_TRIM_FRAMES = ([0-9]+)', ts).group(1)) / 30 - float(re.search(r'AAC_PRIMING_S = ([0-9.]+)', ts).group(1))   # cues = file - trim + priming

with tempfile.TemporaryDirectory() as d:
    wav = pathlib.Path(d) / 'from_mp4.wav'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(mp4), '-vn', '-ac', '1', '-ar', '48000', str(wav)], check=True)
    out = pathlib.Path(d) / 'forced.json'
    r = subprocess.run([str(ROOT / '.venv/bin/python'), str(ROOT / 'scripts/vo_force_align.py'), '--script', str(HERE / 'SCRIPT.md'),
                        '--audio', str(wav), '--out', str(out)], capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(r.stderr[-1500:])
    got = json.loads(out.read_text())

diffs, rows = [], []
for gb, vb in zip(got['beats'], vo['beats']):
    for gw, vw in zip(gb['words'], vb['words']):
        exp = vw['startMs'] - trim * 1000          # where the animation was cued
        diffs.append(gw['startMs'] - exp)
    rows.append((gb['beat'], (gb['words'][0]['startMs'] - (vb['words'][0]['startMs'] - trim * 1000))))
d = np.array(diffs)
print(f'{len(d)} words: audio in the mp4 vs the cue times  |  median {np.median(d):+.0f} ms, mean |diff| {np.abs(d).mean():.0f} ms, '
      f'p95 |diff| {np.percentile(np.abs(d), 95):.0f} ms, max |diff| {np.abs(d).max():.0f} ms   (one frame = 33 ms)')
print('first word of each beat:', ', '.join(f'b{b} {x:+.0f} ms' for b, x in rows))
ok = np.abs(np.median(d)) <= 40 and np.percentile(np.abs(d), 95) <= 100
print('SYNC OK (median within a frame, 95% within 100 ms)' if ok else 'SYNC DRIFT - investigate before shipping')
sys.exit(0 if ok else 1)
