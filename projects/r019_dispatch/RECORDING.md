# RECORDING SHEET — `I90`, Version B

> **UPDATE 2026-10-05 — one continuous take is better, and it is supported.** The seven-take plan below was a safety
> net. The aligner now splits ONE recording of the whole script into beats (`--single`), and a continuous read flows
> more naturally. The owner recorded it this way (78 s). Keep the seven-take instructions only as a fallback for
> a re-record of a single beat.

**Read each take exactly as written.** The words below are the approved script (generated from
[`SCRIPT.md`](SCRIPT.md)); the aligner checks your recording against them word for word and refuses a take
with a skipped or changed word. If a line feels wrong in your mouth, **tell me and we change the script
first** — don't improvise on the take.

## Before you start (10 minutes)

- **iPhone 15 → Voice Memos.** First, once: **Settings → Voice Memos → Audio Quality → Lossless.**
- **Do Not Disturb on**, and don't touch the screen while it records (a tap is a loud thump).
- **A soft, quiet room** — a bedroom with a bed and curtains, or a parked car. Fans and AC off.
- **Phone about 15 cm (a hand's width) from your mouth, slightly to one side** so "p" and "b" don't pop. Hold
  it still, or prop it. **No AirPods or any Bluetooth mic.**
- Sit or stand the same way for every take, so the seven sound like one voice.

## How to record each take

1. Tap record. **Stay silent for 2 seconds.** (That room tone is how the tools find where you start.)
2. Read the take once, at a **brisk, natural pace** — like telling a friend, not reading aloud.
3. **Stay silent for 2 more seconds**, then stop.
4. **If you flub a word, stop, delete it, and start that take again from the top.** Takes are short. Don't
   restart in the middle of a take — a repeated sentence makes the check refuse it.

## Do take 2 first — as a test

It has the hardest words (**H3**, hexagons, neighbours, seven percent). Record it, send it to me, and I'll run
it through the word-timing check before you do the other six. If your room or your mic position is going to
cause trouble, we find out in two minutes instead of seven recordings.

## The seven takes

Name each recording **`b1`, `b2` … `b7`** (Voice Memos: tap the title to rename). Targets are speech only,
at 135–165 words a minute.

| take | read exactly | words | target |
|:--|:--|--:|:--|
| **b1** | The car that looks closest on your map? In our simulated New York, half the time it isn't the quickest. | 20 | 7–9 s |
| **b2** | Uber built a honeycomb for dispatch. It's called H3. Cut a city into hexagons and nearby can mean your hexagon and its six neighbours: in our simulation, seven percent of the cars, and almost always the closest one. | 38 | 14–17 s |
| **b3** | But close on the map isn't close on the road: blocks, one-way streets, now and then a river. Trust the straight line and you pick the wrong car half the time, costing about twenty-five seconds a ride. | 37 | 13–16 s |
| **b4** | Uber's first idea: send the closest available driver, one request at a time. Some riders got stuck waiting, and across a city it added up. So now it waits a few seconds. | 32 | 12–14 s |
| **b5** | Same riders, same cars. One side matches them one at a time. The other waits five seconds, then matches everyone together, as one batch. One rider in thirteen gets a car that isn't their closest, and the total wait comes out a little shorter. Wait a whole minute and it's worse than not waiting at all. | 56 | 20–25 s |
| **b6** | The same hexagons count who wants a ride and who's free. That's how Uber says it sets surge prices. A few seconds of patience, and there's your ride. | 28 | 10–12 s |
| **b7** | Next: how a map app finds your route. Follow for more. | 11 | 4–5 s |

**Total 222 words — about 89 s of speech at 150 wpm (≈ 91 s with the breaths between beats), 81 s if you read brisk.** Aim brisk: Version B runs a few seconds over the 90 s target at a natural pace.

## How to say each one

- **b1** — Open like you're about to tell a friend something odd. Land **half the time** on purpose, then **isn't the quickest.**
- **b2** — Say **It's called H three** lightly, like an aside. Give **seven percent** and **almost always the closest one** a tiny pause before each. *Record this one first — it has the hardest words.*
- **b3** — Run **blocks, one-way streets, now and then a river** quickly and evenly. Land **half the time**, then **twenty-five seconds a ride.**
- **b4** — Calm, storytelling. Slow slightly on **a few seconds** — it's the hinge of the whole reel.
- **b5** — The longest take. Keep the first three sentences short and clipped. Pause before **one rider in thirteen**; say **a little shorter** modestly; give **worse than not waiting at all** a beat of surprise.
- **b6** — Warm, wrapping up. Let **there's your ride** land.
- **b7** — Light and friendly. No hard sell.

## Say it like this

| written | say |
|:--|:--|
| H3 | "H three" |
| 25 / twenty-five | "twenty-five" |
| neighbours | however you naturally say it |
| Uber | "Uber" |

Numbers are written as words in the table on purpose. Don't add "um", "so", "basically" or "you know" — they
aren't in the script and the check counts them as extra words.

## When you're done

1. **AirDrop** the seven recordings to your Mac and put them in **`projects/r019_dispatch/audio/`**
   (they're git-ignored — your raw voice stays on your machine). Or tell me where they landed and I'll move them.
2. Tell me. I run:

   ```bash
   python3 scripts/vo_align.py --script projects/r019_dispatch/SCRIPT.md --audio-dir projects/r019_dispatch/audio --require-all
   ```

   It prints, per take: whether every word is there, your speaking pace, how long each take is, and any word the
   recogniser heard differently — **those I'll ask you to confirm by ear** (whisper sometimes mishears a clearly
   spoken word; it can't tell that apart from a skipped one, so you decide). A take that fails gets re-recorded;
   once all seven pass, the word-timing file is written and the build starts from it.
