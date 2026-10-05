#!/usr/bin/env python3
"""Forced alignment: put each word of the APPROVED script onto a recording, with a time and an acoustic confidence.

Why this and not just a transcriber. A transcriber GUESSES what was said (and on a fast, slightly noisy read it
guesses wrong: "surge" -> "search", "isn't" -> "in"). Here the text is already known, so the model only has to find
where each scripted word sits -- which is far more accurate (tens of milliseconds, not hundreds) and cannot invent
or rename a word. The cost is that it cannot say "you skipped that word" in so many words; it says it through the
confidence: a word that was not really spoken is squeezed into a few frames and scores low. So a recogniser
(`vo_align.py`) is used to VERIFY the words and this to TIME them.

Model: torchaudio WAV2VEC2_ASR_BASE_960H (English, CTC, ~360 MB, downloaded once to the torch cache).

    .venv/bin/python scripts/vo_force_align.py --script projects/r018_dispatch/SCRIPT.md \
        --audio "projects/r018_dispatch/audio/2nd Main Road 25.m4a" --out projects/r018_dispatch/audio/vo_forced.json
"""
import argparse
import json
import pathlib
import subprocess
import sys
import tempfile

import numpy as np
import scipy.io.wavfile as wf
import torch
import torchaudio
import torchaudio.functional as F

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import vo_align as va                                    # same tokeniser and script parser as the recogniser


def load_16k(path):
    with tempfile.TemporaryDirectory() as d:
        wav = pathlib.Path(d) / 'a.wav'
        r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(path), '-ac', '1', '-ar', '16000',
                            '-c:a', 'pcm_f32le', str(wav)], capture_output=True, text=True)
        if r.returncode:
            raise SystemExit(r.stderr)
        sr, x = wf.read(wav)
    return torch.from_numpy(x.astype(np.float32))[None, :]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--script', required=True)
    ap.add_argument('--audio', required=True, help='one continuous recording of the whole script')
    ap.add_argument('--out', required=True)
    ap.add_argument('--compare', help='a vo_align.py output to compare start times against')
    a = ap.parse_args()

    script = va.parse_script(a.script)
    bundle = torchaudio.pipelines.WAV2VEC2_ASR_BASE_960H
    labels = bundle.get_labels()
    vocab = {c: i for i, c in enumerate(labels)}
    model = bundle.get_model().eval()
    wave = load_16k(a.audio)
    with torch.inference_mode():
        emission, _ = model(wave)
        emission = torch.log_softmax(emission, dim=-1)
    n_frames = emission.size(1)
    sec_per_frame = wave.size(1) / n_frames / bundle.sample_rate

    # the script as normalised words (digits spelled, hyphens split, "H3" -> "h three"), remembering whose they are
    words, owner = [], []                                      # owner = (beat, display word index)
    for beat, text in sorted(script.items()):
        for k, w in enumerate(text.split()):
            for t in va.tokens(w):
                words.append(t.upper())
                owner.append((beat, k))
    chars, widx = [], []                                       # the CTC target: letters, '|' between words
    for i, w in enumerate(words):
        if i:
            chars.append('|')
            widx.append(-1)
        for c in w:
            if c in vocab:
                chars.append(c)
                widx.append(i)
    targets = torch.tensor([[vocab[c] for c in chars]], dtype=torch.int32)
    if targets.size(1) > n_frames:
        raise SystemExit('script is longer than the audio can hold - is this the right recording?')
    align, scores = F.forced_align(emission, targets, blank=0)
    spans = F.merge_tokens(align[0], scores[0].exp())
    assert len(spans) == len(chars), (len(spans), len(chars))

    wstart, wend, wscore = {}, {}, {}
    for sp, wi in zip(spans, widx):
        if wi < 0:
            continue
        wstart[wi] = min(wstart.get(wi, 1e18), sp.start * sec_per_frame)
        wend[wi] = max(wend.get(wi, 0.0), sp.end * sec_per_frame)
        wscore.setdefault(wi, []).append(sp.score)

    beats = {}
    for i in range(len(words)):
        beat, k = owner[i]
        beats.setdefault(beat, {}).setdefault(k, []).append(i)
    out_beats = []
    for beat in sorted(beats):
        display = script[beat].split()
        ws = []
        for k, w in enumerate(display):
            idx = beats[beat].get(k)
            if not idx:
                continue
            st, en = wstart[idx[0]], wend[idx[-1]]
            sc = float(np.mean([s for i in idx for s in wscore[i]]))
            ws.append(dict(text=w, startMs=round(st * 1000), endMs=round(en * 1000), score=round(sc, 3)))
        out_beats.append(dict(beat=beat, words=ws, startMs=ws[0]['startMs'], endMs=ws[-1]['endMs']))
    # a word's END is where the NEXT word starts (CTC spans are spiky); the last word of a beat keeps its own end
    for b in out_beats:
        for k, w in enumerate(b['words']):
            if k + 1 < len(b['words']):
                w['endMs'] = max(w['startMs'] + 40, b['words'][k + 1]['startMs'])

    all_w = [(b['beat'], w) for b in out_beats for w in b['words']]
    sc = np.array([w['score'] for _, w in all_w])
    print(f'{len(all_w)} words aligned over {wave.size(1) / 16000:.1f} s  |  confidence: median {np.median(sc):.2f}, '
          f'p10 {np.percentile(sc, 10):.2f}, min {sc.min():.2f}')
    print('\nlowest-confidence words (the ones to confirm by ear):')
    for b, w in sorted(all_w, key=lambda t: t[1]['score'])[:12]:
        print(f'  beat {b}  {w["startMs"] / 1000:6.2f}s  {w["text"]:14}  confidence {w["score"]:.2f}   ({(w["endMs"] - w["startMs"])} ms)')

    if a.compare:
        ref = json.loads(pathlib.Path(a.compare).read_text())
        rb = {b['beat']: b for b in ref['beats']}
        diffs = []
        for b in out_beats:
            for w, r in zip(b['words'], rb[b['beat']]['words']):
                diffs.append(w['startMs'] - r['startMs'])
        d = np.array(diffs)
        print(f'\nforced vs recogniser word STARTS: median {np.median(d):+.0f} ms, mean |diff| {np.abs(d).mean():.0f} ms, '
              f'p90 |diff| {np.percentile(np.abs(d), 90):.0f} ms, max |diff| {np.abs(d).max():.0f} ms')

    pathlib.Path(a.out).write_text(json.dumps(dict(script=a.script, audio=str(a.audio), method='torchaudio forced_align, WAV2VEC2_ASR_BASE_960H',
                                                   secPerFrame=sec_per_frame, beats=out_beats), indent=1))
    print('\nwrote', a.out)


if __name__ == '__main__':
    main()
