#!/usr/bin/env python3
"""Word-time a recorded voice-over against the APPROVED script, and FAIL CLOSED.

The script (a SCRIPT.md table, narration column) is the contract. Each beat is recorded as its own take,
`b1.m4a` ... `b7.m4a`. Per take this: converts to 16 kHz mono (ffmpeg), runs whisper.cpp for word timestamps
(remotion/scripts/vo-transcribe.mjs), then aligns what was HEARD onto what was APPROVED and refuses the take if
they disagree -- a missing content word, extra spoken words, or times out of order.

Output is keyed to the SCRIPT's words (spelling, punctuation and all) so the captions are always the approved text,
whatever whisper happened to write. Times are milliseconds from the start of the take file. Anchor animation on a
word's START: whisper's END includes the pause after the word.

    scripts/vo_align.py --script projects/r019_dispatch/SCRIPT.md --audio-dir projects/r019_dispatch/audio
    scripts/vo_align.py ... --beats 2            # just the test take
    scripts/vo_align.py ... --require-all        # the real run: all seven takes must exist and pass

Standard library only.
"""
import argparse
import difflib
import os
import json
import pathlib
import re
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
TRANSCRIBE = ROOT / 'remotion' / 'scripts' / 'vo-transcribe.mjs'
EXTS = ('.m4a', '.wav', '.aiff', '.aif', '.mp3', '.caf', '.mp4')

# words whose absence is tolerated (a speaker may swallow one); anything else missing FAILS the take
STOP = {'a', 'an', 'the', 'and', 'of', 'to', 'is', 'in', 'on', 'at', 'so', 'but', 'as', 'up', 'it', "it's", 'its', 'that', "that's", 's'}
GAP, MATCH_MIN, DOUBT_MIN = -0.7, 0.75, 0.3

ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = 'zero ten twenty thirty forty fifty sixty seventy eighty ninety'.split()


def num_words(n):
    """0-99 as words -- all the digits whisper emits for this script ("2", "25", "60", the 3 in "H3")."""
    if n < 20:
        return ONES[n]
    return TENS[n // 10] + ('' if n % 10 == 0 else ' ' + ONES[n % 10])


def tokens(text):
    """Normalise to a comparable token list: lower-case, no punctuation, hyphens split, digits spelled out,
    letter/digit joins split ("H3" -> "h three"). Script and transcript both go through here."""
    t = text.lower().replace('%', ' percent ').replace('’', "'").replace('—', ' ').replace('–', ' ')
    t = re.sub(r'(?<=[a-z])(?=\d)|(?<=\d)(?=[a-z])', ' ', t).replace('-', ' ')
    out = []
    for w in re.findall(r"[a-z0-9']+", t):
        w = w.strip("'")
        if not w:
            continue
        out.extend(num_words(int(w)).split() if w.isdigit() else [w])
    return out


def parse_script(path):
    """{beat number: narration text} from the table rows `| **N · t** | **"narration"** | ...`"""
    beats = {}
    for line in pathlib.Path(path).read_text().splitlines():
        m = re.match(r'\| \*\*(\d+) · ', line)
        if not m:
            continue
        cell = [c.strip() for c in line.strip().strip('|').split('|')][1]
        beats[int(m.group(1))] = cell.strip('*').strip().strip('"').strip()
    if not beats:
        raise SystemExit(f'no beat rows found in {path}')
    return beats


def sim(a, b):
    return 2.0 if a == b else difflib.SequenceMatcher(None, a, b).ratio()


def align(S, H):
    """Global alignment of script tokens S onto heard tokens H (token strings). Returns match[i] = heard index | None.
    A pairing with similarity below MATCH_MIN but at least DOUBT_MIN is kept as a DOUBTFUL substitution (reported)."""
    n, m = len(S), len(H)
    dp = [[0.0] * (m + 1) for _ in range(n + 1)]
    bk = [[None] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        dp[i][0], bk[i][0] = i * GAP, 'u'
    for j in range(1, m + 1):
        dp[0][j], bk[0][j] = j * GAP, 'l'
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            r = sim(S[i - 1], H[j - 1])
            diag = dp[i - 1][j - 1] + (1.0 + r if r >= MATCH_MIN else (r - 0.2 if r >= DOUBT_MIN else -1.0))
            up, left = dp[i - 1][j] + GAP, dp[i][j - 1] + GAP
            best = max(diag, up, left)
            dp[i][j] = best
            bk[i][j] = 'd' if best == diag else ('u' if best == up else 'l')
    match, i, j = [None] * n, n, m
    while i > 0 or j > 0:
        step = bk[i][j]
        if step == 'd':
            if sim(S[i - 1], H[j - 1]) >= DOUBT_MIN:
                match[i - 1] = j - 1
            i, j = i - 1, j - 1
        elif step == 'u':
            i -= 1
        else:
            j -= 1
    return match


def run(cmd, cwd=None):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(f'command failed: {" ".join(map(str, cmd))}\n{r.stderr[-800:]}')
    return r.stdout


def speech_start_ms(audio):
    """Where the first sound is. Leading silence is CUT before transcription: padding the head scrambles
    whisper.cpp's first few word times (found on the stand-in read), and a take recorded as the sheet asks has
    ~2 s of room tone before the first word."""
    r = subprocess.run(['ffmpeg', '-i', str(audio), '-af', 'silencedetect=noise=-38dB:d=0.25', '-f', 'null', '-'],
                       capture_output=True, text=True)
    starts = re.findall(r'silence_start: (-?[0-9.]+)', r.stderr)
    ends = re.findall(r'silence_end: ([0-9.]+)', r.stderr)
    return float(ends[0]) * 1000.0 if starts and float(starts[0]) <= 0.05 and ends else 0.0


def heard_words(audio, tmp):
    wav, js = tmp / 'take.wav', tmp / 'take.json'
    dur = float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(audio)]).strip())
    cut = max(0.0, speech_start_ms(audio) - 200.0)
    # a second of silence on the TAIL only: whisper.cpp drops the last words of a take that ends abruptly
    run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{cut / 1000:.3f}', '-i', str(audio), '-af', 'apad=pad_dur=1.0',
         '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', str(wav)])
    run(['node', str(TRANSCRIBE), str(wav), str(js)], cwd=str(tmp))      # cwd=tmp: transcribe() writes tmp.json there
    words = [w for w in json.loads(js.read_text()) if not re.fullmatch(r'[\[(].*[\])]', w['text'].strip())]   # [BLANK_AUDIO], (music)
    for w in words:                                                       # back to the take file's own clock
        w['startMs'] += cut
        w['endMs'] += cut
    # whisper.cpp sometimes gives the FIRST word a start later than its own end (seen: 'The' 920 -> 270 ms). The end is
    # the sane number there: the word is the one that ends where the next begins, so pull its start back before it.
    for i, w in enumerate(words):
        if w['endMs'] < w['startMs']:
            w['startMs'] = max(0.0, (words[i - 1]['endMs'] if i else w['endMs'] - 250.0))
    return words, dur * 1000.0


def process(beats, audio, accept=None, ear_confirmed=False):
    """Align ONE recording against one or more beats of the script (a single beat for a per-beat take, all of
    them for one continuous read). Returns (per-beat results, global problems, global warnings)."""
    accept = accept or {}
    with tempfile.TemporaryDirectory() as d:
        words, dur_ms = heard_words(audio, pathlib.Path(d))
    S, owner = [], []                                   # script tokens, and the (beat, display word) each belongs to
    for b, text in beats.items():
        for k, w in enumerate(text.split()):
            for t in tokens(w):
                S.append(t)
                owner.append((b, k))
    H, ht, he = [], [], []                              # heard tokens with a start/end each (a hyphenated word shares its span)
    for w in words:
        tk = tokens(w['text'])
        for q, t in enumerate(tk):
            span = (w['endMs'] - w['startMs']) / max(1, len(tk))
            H.append(t)
            ht.append(w['startMs'] + q * span)
            he.append(w['startMs'] + (q + 1) * span)
    match = align(S, H)

    # per-token times, interpolating any unmatched token between its matched neighbours
    st = [ht[match[i]] if match[i] is not None else None for i in range(len(S))]
    en = [he[match[i]] if match[i] is not None else None for i in range(len(S))]
    for i in range(len(S)):
        if st[i] is not None:
            continue
        a = max((k for k in range(i) if en[k] is not None), default=None)
        b = min((k for k in range(i + 1, len(S)) if st[k] is not None), default=None)
        lo = en[a] if a is not None else (st[b] - 200.0 if b is not None else 0.0)
        hi = st[b] if b is not None else lo + 200.0
        gap = [k for k in range(a + 1 if a is not None else 0, b if b is not None else len(S)) if st[k] is None]
        slot = (hi - lo) / (len(gap) + 1) if gap else 0
        st[i] = lo + slot * gap.index(i)
        en[i] = st[i] + max(slot, 80.0)

    used = {j for j in match if j is not None}
    extra = [H[j] for j in range(len(H)) if j not in used]
    gprob, gwarn = [], []
    if ear_confirmed and extra:
        gwarn.append(f'EAR-CONFIRMED (a human listened): recogniser heard extra words {extra}')
    elif len(extra) >= 3:
        gprob.append(f'EXTRA words spoken that are not in the script: {extra}')
    elif extra:
        gwarn.append(f'extra heard words ignored: {extra}')

    results = []
    for beat, text in beats.items():
        display = text.split()
        mine = [i for i in range(len(S)) if owner[i][0] == beat]
        missing = [S[i] for i in mine if match[i] is None]
        doubts = [(S[i], H[match[i]]) for i in mine if match[i] is not None and sim(S[i], H[match[i]]) < MATCH_MIN]
        acc = accept.get(beat, ())
        miss_content = [t for t in missing if t not in STOP and t not in acc]
        accepted = [t for t in missing if t in acc]
        if ear_confirmed:                                   # a human listened: recorded, never silent
            accepted, miss_content = accepted + miss_content, []
        out = []
        for k, w in enumerate(display):
            idx = [i for i in mine if owner[i][1] == k]
            if not idx:
                continue
            heard_as = ' '.join(H[match[i]] for i in idx if match[i] is not None)
            out.append(dict(text=w, startMs=round(st[idx[0]]), endMs=round(en[idx[-1]]), flagged=any(match[i] is None for i in idx),
                            heardAs=heard_as if heard_as != ' '.join(S[i] for i in idx) else None))
        for k, w in enumerate(out):                     # tiny inversions are timestamp jitter; big ones are a real fault
            if k and w['startMs'] < out[k - 1]['startMs'] and out[k - 1]['startMs'] - w['startMs'] <= 80:
                w['startMs'] = out[k - 1]['startMs']
        for k, w in enumerate(out):                     # whisper's END times are unreliable: derive from the next START
            nxt = out[k + 1]['startMs'] if k + 1 < len(out) else None
            w['endMs'] = min(w['endMs'], nxt) if nxt is not None else min(w['endMs'], w['startMs'] + 700)
            if w['endMs'] <= w['startMs']:
                w['endMs'] = w['startMs'] + 80
        starts = [w['startMs'] for w in out]
        problems, warns = [], []
        if miss_content:
            problems.append(f'MISSING from the recording (content words): {miss_content}   '
                            f'(if you did say it and whisper misheard, confirm by ear and re-run with --accept {beat}:{miss_content[0]})')
        if accepted:
            warns.append(f'CONFIRMED BY EAR (the recogniser did not hear these): {accepted}')
        small = [t for t in missing if t in STOP]
        if len(small) >= 3:
            problems.append(f'MISSING small words: {small}')
        elif small:
            warns.append(f'small words not heard (times interpolated): {small}')
        if len(doubts) > 4 and not ear_confirmed:
            problems.append(f'TOO MANY words heard differently ({len(doubts)}): {doubts}')
        elif doubts and not ear_confirmed:
            warns.append('CONFIRM BY EAR - heard X for the scripted Y: ' + ', '.join(f'"{h}" for "{sc}"' for sc, h in doubts))
        if starts != sorted(starts):
            problems.append('word times are not in order (whisper timestamp fault) - re-run, or re-record')
        if starts and starts[-1] > dur_ms + 100:
            problems.append(f'a word is timed AFTER the end of the file ({starts[-1] / 1000:.1f} s > {dur_ms / 1000:.1f} s)')
        first, last = out[0]['startMs'], out[-1]['endMs']
        wpm = len(display) / max(1e-6, (last - first) / 60000.0)
        if not 95 <= wpm <= 230:
            warns.append(f'pace {wpm:.0f} wpm is outside 95-230')
        results.append(dict(beat=beat, file=pathlib.Path(audio).name, ok=not problems, problems=problems, warnings=warns,
                            words=out, startMs=round(first), endMs=round(last), leadMs=round(first), tailMs=round(dur_ms - last),
                            speechMs=round(last - first), fileMs=round(dur_ms), wpm=round(wpm), acceptedByEar=accepted,
                            coverage=round(100 * (1 - len(missing) / max(1, len(mine))), 1)))
    return results, gprob, gwarn


def report(r):
    print(f'{r["beat"]:>4} {r["file"][:16]:16} {len(r["words"]):>5} {r["coverage"]:>5.1f}% {r["startMs"] / 1000:>6.1f}s {r["endMs"] / 1000:>6.1f}s {r["wpm"]:>4}  '
          + ('ok' if r['ok'] else 'FAIL'))
    for p_ in r['problems']:
        print('        !!', p_)
    for w_ in r['warnings']:
        print('        ..', w_)
    heard = [f'{w["text"]}→{w["heardAs"]}' for w in r['words'] if w['heardAs']]
    if heard:
        print('        ~~ heard differently (kept as scripted):', ', '.join(heard[:10]))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--script', required=True)
    ap.add_argument('--audio-dir', help='folder of per-beat takes b1.m4a ... b7.m4a')
    ap.add_argument('--single', help='ONE continuous recording of the whole script (split into beats by the alignment)')
    ap.add_argument('--out', help='default: next to the audio')
    ap.add_argument('--model', default='small.en', help='whisper model installed under remotion/whisper.cpp (small.en, medium.en, large-v3)')
    ap.add_argument('--beats', help='per-beat mode: comma-separated beat numbers, e.g. 2 or 2,5')
    ap.add_argument('--require-all', action='store_true', help='per-beat mode: every beat must have a take and pass')
    ap.add_argument('--ear-confirmed', action='store_true', help='I listened to the take against the approved script and the flagged words ARE there; record that and continue')
    ap.add_argument('--accept', default='', help='beat:word,... a word you confirmed BY EAR that the recogniser missed, e.g. 2:cut,3:you')
    a = ap.parse_args()
    os.environ['VO_WHISPER_MODEL'] = a.model
    if bool(a.single) == bool(a.audio_dir):
        raise SystemExit('give exactly one of --single FILE or --audio-dir DIR')

    script = parse_script(a.script)
    accept = {}
    for item in filter(None, a.accept.split(',')):
        b_, w_ = item.split(':')
        accept.setdefault(int(b_), set()).update(tokens(w_))
    results, gprob, gwarn, failed = [], [], [], False
    print(f'{"beat":>4} {"file":16} {"words":>5} {"cover":>6} {"from":>7} {"to":>7} {"wpm":>4}  verdict')
    if a.single:
        f = pathlib.Path(a.single)
        results, gprob, gwarn = process(dict(sorted(script.items())), f, accept, a.ear_confirmed)
        for r in results:
            report(r)
        failed = any(not r['ok'] for r in results) or bool(gprob)
        out = pathlib.Path(a.out) if a.out else f.parent / 'vo_words.json'
        mode = 'single'
    else:
        adir = pathlib.Path(a.audio_dir)
        want = [int(x) for x in a.beats.split(',')] if a.beats else sorted(script)
        for b in want:
            found = [p for p in sorted(adir.iterdir()) if p.stem.lower() == f'b{b}' and p.suffix.lower() in EXTS] if adir.is_dir() else []
            if not found:
                msg = f'{b:>4} {"(no take)":16}'
                if a.require_all or a.beats:
                    failed = True
                    msg += '  FAIL - take not found'
                print(msg)
                continue
            rs, gp, gw = process({b: script[b]}, found[0], accept, a.ear_confirmed)
            results += rs
            gprob += [f'beat {b}: {x}' for x in gp]
            gwarn += [f'beat {b}: {x}' for x in gw]
            report(rs[0])
            failed |= not rs[0]['ok'] or bool(gp)
        if a.require_all and {r['beat'] for r in results} != set(script):
            failed = True
        out = pathlib.Path(a.out) if a.out else adir / 'vo_words.json'
        mode = 'per-beat'
    for g in gprob:
        print('   !!', g)
    for g in gwarn:
        print('   ..', g)
    if failed:
        print('\nFAILED CLOSED - no word-timing file written. Re-record what is marked FAIL (or change the approved script first).')
        return 1
    out.write_text(json.dumps(dict(script=a.script, mode=mode, earConfirmed=bool(a.ear_confirmed), beats=results), indent=1))
    print(f'\nOK - wrote {out}   ({len(results)} beat(s), {mode})')
    return 0


if __name__ == '__main__':
    sys.exit(main())
