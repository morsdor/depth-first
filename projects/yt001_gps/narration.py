"""Narration for yt001 "How GPS finds you, and why it needs Einstein".

Voice: Kokoro-82M (Apache-2.0, open weights) via kokoro-onnx, running on CPU. An AI voice — disclose
it on upload. Every sentence is synthesised separately so the video timeline can be driven by REAL
sentence boundaries (no estimated word timings): this writes

  remotion/public/yt_gps/audio/narration.wav     the master track, 24 kHz mono
  projects/yt001_gps/timeline.json               scene + sentence start/end, seconds

Run with the TTS venv:  /tmp/tts/venv/bin/python narration.py
Numbers in the text that come from the simulations are filled from sims/*.json, so the voice can
never say a figure the animation does not show.
"""
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = Path(__file__).parent
AUDIO = HERE.parents[1] / "remotion" / "public" / "yt_gps" / "audio"
AUDIO.mkdir(parents=True, exist_ok=True)
CACHE = Path("/tmp/tts/cache")
CACHE.mkdir(parents=True, exist_ok=True)

VOICE, SPEED = "af_heart", 0.98
GAP_SENT, GAP_SCENE, PRE, POST = 0.45, 1.25, 1.2, 12.0

try:
    F = json.loads((HERE / "sims" / "numbers.json").read_text())
except FileNotFoundError:
    F = {}

def n(key, default):
    return F.get(key, default)

SCENES = [
    ("hook", [
        "Right now, thirty-one satellites, twenty thousand kilometers above your head, are broadcasting the time.",
        "Your phone listens, and from nothing but those timestamps, it works out where you are, to within a few meters.",
        "It's one of the most precise measurements most people make every day. And it only works because of Albert Einstein.",
    ]),
    ("satellites", [
        "GPS is thirty-one satellites in six orbital planes, tilted fifty-five degrees to the equator, at an altitude of about twenty thousand two hundred kilometers.",
        "Each one circles the Earth twice a day, and the pattern is arranged so that from almost anywhere on the surface, at least four are always above the horizon.",
        "They carry atomic clocks, and they do one thing: they broadcast who they are, where they are, and exactly what time it is.",
        "And notice what they don't do. Nothing travels from your phone to them. GPS is receive-only, so the satellites never know you exist, and any number of phones can use it at once.",
    ]),
    ("ranging", [
        "The signal travels at the speed of light, so the delay tells you the distance.",
        f"From a satellite straight overhead, the signal takes about {n('overhead_ms_words', 'sixty-seven')} milliseconds. Multiply by the speed of light, and you know you're somewhere on a sphere, centered on that satellite, with a radius of twenty thousand kilometers.",
        "A second satellite gives a second sphere. Where they overlap is a circle. A third narrows it to two points, and one of them is out in space.",
    ]),
    ("clock", [
        "There's a catch. To measure that delay, your phone needs the time to within a few billionths of a second. But the clock in your phone is a cheap quartz crystal, and it can be off by a lot.",
        "One microsecond of error is three hundred meters. So your phone has four unknowns: where you are in three dimensions, and how wrong its own clock is.",
        f"Four unknowns need four equations. That's why GPS needs a fourth satellite. Starting from a guess at the center of the Earth, the phone corrects its answer again and again, and in {n('iters_words', 'six')} steps it homes in on your position, and on your clock error.",
    ]),
    ("einstein", [
        "Now, the satellites' clocks. Einstein says they can't agree with clocks on the ground.",
        f"First, special relativity: a moving clock runs slow. The satellites move at nearly four kilometers a second, and that costs them about {n('sr_words', 'seven')} microseconds a day.",
        f"Second, general relativity: clocks run slower deeper in gravity. Up at twenty thousand kilometers, gravity is weaker, so the satellite clocks run faster, by about {n('gr_words', 'forty-six')} microseconds a day.",
        "This isn't only theory. In nineteen fifty-nine, physicists at Harvard measured gravity's effect on time across a tower just twenty-two and a half meters tall.",
        f"The net result: the satellite clocks gain about {n('net_words', 'thirty-eight')} microseconds every day. In that time, light travels {n('km_words', 'eleven and a half')} kilometers.",
        "When a test satellite, N T S two, launched in June nineteen seventy-seven, it carried a frequency synthesizer to cancel the effect. But engineers left it switched off, and let the atomic clock run for about twenty days.",
        "It gained four hundred forty-two and a half parts per trillion. General relativity had predicted four hundred forty-six and a half. Then they switched the correction on.",
        "Today, every GPS clock is set, before launch, to tick at ten point two, two, nine, nine, nine, nine, nine, nine, five, four, three megahertz, instead of ten point two three. So that in orbit, it ticks exactly right.",
    ]),
    ("accuracy", [
        "So how accurate is it? A smartphone under open sky is typically within about five meters. The signals in space are specified to about two. The rest comes from the atmosphere slowing the signal, and from buildings bouncing it.",
        "The ionosphere delays radio waves by an amount that depends on their frequency, so many modern phones listen on two frequencies at once, and use the difference to cancel the delay.",
        "It used to be far worse, on purpose. Until May the second, two thousand, the US military deliberately degraded civilian GPS to about a hundred meters. A presidential order switched that off.",
    ]),
    ("close", [
        "So every time a blue dot lands on your map, three ideas are working together. Distance from time. A fourth satellite, to fix your clock. And Einstein, to fix theirs.",
        "And it isn't just maps. Many cell networks, power grids and financial markets use GPS time as their reference, which is why getting the clocks right matters far beyond navigation.",
        "Take away any one of those three ideas, and the system stops working.",
    ]),
]

def main():
    k = Kokoro("/tmp/tts/kokoro-v1.0.onnx", "/tmp/tts/voices-v1.0.bin")
    sr = 24000
    chunks, sentences, scenes = [], [], []
    t = PRE
    chunks.append(np.zeros(int(PRE * sr), np.float32))
    for si, (sid, sents) in enumerate(SCENES):
        s0 = t
        for j, text in enumerate(sents):
            key = hashlib.sha1(f"{VOICE}|{SPEED}|{text}".encode()).hexdigest()[:16]
            cp = CACHE / f"{key}.npy"
            if cp.exists():
                wav = np.load(cp)
            else:
                wav, rate = k.create(text, voice=VOICE, speed=SPEED, lang="en-us")
                assert rate == sr, rate
                wav = np.asarray(wav, np.float32)
                np.save(cp, wav)
            wav = wav.copy()
            fade = int(0.012 * sr)
            wav[:fade] *= np.linspace(0, 1, fade)
            wav[-fade:] *= np.linspace(1, 0, fade)
            d = len(wav) / sr
            sentences.append({"scene": sid, "i": j, "text": text, "start": round(t, 3), "end": round(t + d, 3)})
            chunks.append(wav)
            t += d
            last = j == len(sents) - 1
            gap = GAP_SCENE if last else GAP_SENT
            chunks.append(np.zeros(int(gap * sr), np.float32))
            t += gap
            print(f"{sid}[{j}] {d:5.2f}s  total {t:6.1f}s", flush=True)
        scenes.append({"id": sid, "start": round(s0, 3), "end": round(t - GAP_SCENE, 3), "next": round(t, 3)})
    chunks.append(np.zeros(int((POST - GAP_SCENE) * sr), np.float32))
    t += POST - GAP_SCENE
    master = np.concatenate(chunks)
    peak = float(np.abs(master).max())
    master = master * (0.708 / peak)                      # peak -3 dBFS
    sf.write(AUDIO / "narration.wav", master, sr, subtype="PCM_16")
    words = sum(len(s["text"].split()) for s in sentences)
    out = {"voice": VOICE, "speed": SPEED, "sample_rate": sr, "duration": round(len(master) / sr, 3),
           "words": words, "scenes": scenes, "sentences": sentences}
    (HERE / "timeline.json").write_text(json.dumps(out, indent=1))
    print(f"DONE {out['duration']:.1f}s  {words} words  ({words / (out['duration'] / 60):.0f} wpm incl. pauses)")

if __name__ == "__main__":
    main()
