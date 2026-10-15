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

VOICE, SPEED = "af_heart", 1.05
GAP_SENT, GAP_SCENE, PRE, POST = 0.4, 1.1, 1.0, 11.0

try:
    F = json.loads((HERE / "sims" / "numbers.json").read_text())
except FileNotFoundError:
    F = {}

def n(key, default):
    return F.get(key, default)

SCENES = [
    ("hook", [
        "You open Maps. A blue dot appears. But your phone has no eyes. So how does it know where you are? Because right now, thirty-one satellites, twenty thousand kilometers up, are yelling the time into space. Not directions. Just the time.",
        "In the next five minutes: how your phone turns timestamps into your location. Why it secretly needs a fourth satellite, to cover for its terrible clock. And why none of this works without a physicist who died in nineteen fifty-five.",
        "Yes, Einstein. Stay for the plot twist. Also stay for the time the military broke GPS on purpose, and then un-broke it.",
    ]),
    ("satellites", [
        "First, the cast. Thirty-one satellites, in six orbits, about fifty times higher than the space station. Basically, a very expensive flock of very serious birds.",
        "They circle the Earth twice a day, arranged so that wherever you stand, at least four are above your horizon. Even in the middle of nowhere. Even on a Monday.",
        "And all they do is broadcast three things, on a loop, forever: who I am, where I am, and what time it is. The most boring account in space.",
        "Your phone never replies. GPS is receive-only, so the satellites never know you exist. It's the world's most successful one-way relationship.",
    ]),
    ("ranging", [
        "So how does a timestamp become a location? Think thunderstorm. You see the lightning, count the seconds until the thunder, and you know how far away the storm is. GPS does the same thing, with radio instead of sound.",
        "Radio travels at the speed of light, so from a satellite overhead, the signal arrives in about a fifteenth of a second. Delay times speed of light is distance. So your phone is somewhere on a giant invisible bubble around that satellite.",
        "A second satellite adds a second bubble. Where the two overlap, you get a circle. A third satellite cuts that circle in two points, and one of them is floating in outer space, so your phone politely ignores it.",
    ]),
    ("clock", [
        "Here's the catch. To measure that delay, your phone needs the time to within a few billionths of a second. And its clock is a cheap quartz crystal, the same basic tech as a gas-station watch. It drifts, and it has no shame.",
        "A single millionth of a second of error puts you three hundred meters off. So your phone has four unknowns: where it is, in three dimensions, and what time it is.",
        f"Four unknowns need four satellites. Starting from a wild guess, the center of the Earth, your phone corrects itself {n('iters_words', 'five')} times, and lands a few meters from the truth. It even works out how wrong its own watch is. More self-awareness than most of us.",
    ]),
    ("einstein", [
        "Now, the plot twist. The satellites carry atomic clocks, which are basically perfect. And yet they disagree with the clocks on the ground. Not because they're broken. Because of Einstein.",
        f"Round one, speed. Moving clocks run slow. The satellites move at nearly four kilometers a second, so they lose about {n('sr_words', 'seven')} millionths of a second every day.",
        f"Round two, gravity. Clocks run faster where gravity is weaker, and up there it's weaker, so the satellite clocks gain about {n('gr_words', 'forty-six')} millionths of a second a day. A time glow-up.",
        "Not just theory. In nineteen fifty-nine, Harvard physicists measured it across a tower twenty-two and a half meters tall. You could climb it.",
        f"Net result: the satellite clocks gain about {n('net_words', 'thirty-eight and a half')} millionths of a second a day. Sounds like nothing. Except light travels {n('km_words', 'eleven and a half')} kilometers in that time.",
        "So in nineteen seventy-seven, engineers launched a test satellite, N T S two, with a switch to apply Einstein's correction. They left it off for twenty days, to see if he was right. No pressure.",
        "The clock gained four hundred forty-two and a half parts per trillion. Einstein predicted four hundred forty-six and a half. Less than one percent apart. Then they flipped the switch.",
        "Which is why every GPS clock is deliberately set to the wrong speed before launch, nudged down by a few billionths of a megahertz. Wrong on the ground, so it's right in orbit. Relatable.",
    ]),
    ("accuracy", [
        "So how good is it? Within about five meters. Good enough for your street. Not good enough to know which side of it your cab is on, which is why your driver is always on the other one. And tall buildings bounce the signals around, so your blue dot sometimes thinks you're in a river.",
        "The sky interferes too. The ionosphere slows radio waves by different amounts at different frequencies, so many phones listen on two and subtract the damage. Noise cancelling, but for space.",
        "And GPS used to be worse on purpose. Until May the second, two thousand, the US military blurred it for civilians, to about a hundred meters, in the name of security. A presidential order switched that off. A government removing a feature, and everyone was happy.",
    ]),
    ("close", [
        "So here's the whole story in three lines. Distance from time, like lightning and thunder. A fourth satellite, to cover for your phone's terrible watch. And Einstein, to cover for the satellites'.",
        "And it isn't just maps. Phone networks, power grids and financial markets use GPS time too. A lot of the modern world quietly agrees what time it is, thanks to clocks set wrong on purpose.",
        "So next time your phone says recalculating, remember: thirty-one clocks in space, one cheap watch in your pocket, and a physicist who never owned a smartphone. You just had to turn left.",
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
