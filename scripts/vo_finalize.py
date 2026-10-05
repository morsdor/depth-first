#!/usr/bin/env python3
"""Turn a forced-alignment result into the FINAL word-timing file the build reads.

Inputs: the forced-alignment JSON (vo_force_align.py) and the finished voice WAV. The output holds only text and
numbers -- never audio -- so it is safe to track in git, unlike the raw voice.

  * a word's END is where the next word starts (CTC spans are spiky); the last word of a beat ends at its own end + 250 ms,
    but never after the next beat starts, and never after the file ends
  * words with low acoustic confidence are marked `weak`; the owner's by-ear confirmation is recorded in `confirmation`
  * every beat must be present, in order, with every scripted word

    python3 scripts/vo_finalize.py --forced projects/r018_dispatch/audio/vo_forced.json \
        --voice projects/r018_dispatch/audio/vo_clean.wav --out projects/r018_dispatch/vo_words.json --note "..."
"""
import argparse, json, pathlib, subprocess, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import vo_align as va

ap = argparse.ArgumentParser()
ap.add_argument('--forced', required=True); ap.add_argument('--voice', required=True)
ap.add_argument('--out', required=True); ap.add_argument('--note', default='')
ap.add_argument('--script', default='projects/r018_dispatch/SCRIPT.md')
ap.add_argument('--weak', type=float, default=0.30)
a = ap.parse_args()

F = json.loads(pathlib.Path(a.forced).read_text())
script = va.parse_script(a.script)
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.voice],
                           capture_output=True, text=True, check=True).stdout) * 1000.0
beats = sorted(F['beats'], key=lambda b: b['beat'])
assert [b['beat'] for b in beats] == sorted(script), 'beats missing or out of order'
for b in beats:
    assert [w['text'] for w in b['words']] == script[b['beat']].split(), f'beat {b["beat"]}: words differ from the approved script'

for i, b in enumerate(beats):
    nxt_beat = beats[i + 1]['words'][0]['startMs'] if i + 1 < len(beats) else dur
    last = b['words'][-1]
    last['endMs'] = round(min(last['endMs'] + 250, nxt_beat, dur))
    for w in b['words']:
        w['weak'] = w['score'] < a.weak
    b['startMs'], b['endMs'] = b['words'][0]['startMs'], last['endMs']
    b['wordCount'] = len(b['words'])
allw = [w for b in beats for w in b['words']]
starts = [w['startMs'] for w in allw]
assert starts == sorted(starts), 'word starts are not in order'
out = dict(
    script=a.script, method=F['method'], voiceFile=pathlib.Path(a.voice).name, voiceDurationMs=round(dur),
    sampleRate=48000, timingOffsetVsRawMs=0, wordCount=len(allw), weakWords=sum(w['weak'] for w in allw),
    confirmation=a.note, beats=beats)
pathlib.Path(a.out).write_text(json.dumps(out, indent=1))
print(f'{len(allw)} words, {len(beats)} beats, voice {dur/1000:.2f} s, {out["weakWords"]} weak words (confidence < {a.weak})\n')
print(f'{"beat":>4} {"from":>7} {"to":>7} {"dur":>6} {"words":>5} {"wpm":>4}')
for b in beats:
    d = (b['endMs'] - b['startMs']) / 1000
    print(f'{b["beat"]:>4} {b["startMs"]/1000:7.2f} {b["endMs"]/1000:7.2f} {d:6.2f} {b["wordCount"]:>5} {b["wordCount"]/d*60:4.0f}')
print('\nwrote', a.out)
