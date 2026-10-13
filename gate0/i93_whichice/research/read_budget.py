"""Reading-time budget for I93's script — the owner's note, made a rule the script has to pass.

Owner direction, 2026-10-13: "give enough time for people to read on the screen on the animation and text."
The repo already says end-of-beat text needs >= 3 s at full opacity (brand_guide_software.md "Reading time")
and that every idea gets read -> animate -> hold with a ~2 s hold on the finished state (CLAUDE.md,
non-negotiable 5). This file turns both into numbers a script table can be checked against, and it is the
single source of the beat times: `emit_ts.py` will import `BLOCKS` and `EVENTS` from here, so moving a beat in
the build cannot quietly shorten a reading window.

Run:  python3 -I gate0/i93_whichice/research/read_budget.py

THE BUDGET, for a block of W words:   full-opacity time  >=  READ_BASE + READ_PER_WORD * W   (never under MIN_BLOCK)
  * READ_BASE 1.0 s — to notice the line arrived and find it.
  * READ_PER_WORD 0.40 s — 150 words per minute. The average adult silent reading rate in English non-fiction is
    238 wpm (Brysbaert 2019, a meta-analysis of 190 studies — SEARCH-LEVEL: abstract seen, paper unread), so this
    gives a 1.6x margin for a phone, no sound, and an animation competing for the eye.
  * The same 0.40 s/word is about 2.5 words/s, against roughly 20 characters/s (~3.6 words/s) that broadcast
    subtitle guides allow viewers who are EXPECTING text (a third-party summary of Netflix's English guide — UNVERIFIED).
  * "Full opacity" is measured from the end of the fade-in (FADE_IN) to the start of the fade-out (FADE_OUT is the
    ~5 frames `Fade` begins before its `to`), so the table's t_in/t_out are the nominal window, not the readable one.
  * Words are counted conservatively: a hyphenated or colon-joined word counts as two.
  * ONE READER, IN ORDER. A viewer reads one thing at a time, so two blocks on screen together do not each get their own
    budget: the reader starts a block when it is fully visible AND the previous block is finished, and the block must
    finish before its own fade-out. A name tag riding on an object is NOT exempt.
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).parent
FPS = 30
READ_BASE, READ_PER_WORD, MIN_BLOCK = 1.0, 0.40, 2.0
FADE_IN, FADE_OUT = 0.30, 0.17
END_OF_BEAT_MIN = 3.0          # brand_guide_software.md: a beat's closing line gets >= 3 s at full opacity
HOLD_MIN = 2.0                 # CLAUDE.md non-negotiable 5: the finished state stays on screen >= ~2 s
MAX_AT_ONCE = 3                # skill, GATE 4: never more than three text blocks on screen at once
RUNTIME_MAX = 60.0             # CLAUDE.md: 30-60 s


def words(copy: str) -> int:
    return len([w for w in re.split(r"[\s:/–—-]+", copy.strip()) if re.search(r"[A-Za-z0-9]", w)])


# id, copy (verbatim, on screen), t_in, t_out (nominal), rides_on, end_of_beat
BLOCKS = [
    ("B01", "DOES MELTING ICE RAISE THE SEA?",                                      0.3,  4.6, "the glass",             False),
    ("B02", "THE ICE MELTS. THE WATER LEVEL DOESN'T MOVE.",                         5.0, 10.0, "the glass and the ring", False),
    ("B03", "THE ICE TOOK UP THIS SPACE. ITS MELTWATER FILLS IT EXACTLY.",         10.2, 16.4, "the ghost outline",     True),
    ("B04", "NOW THE SAME ICE, ABOVE THE WATER.",                                  17.2, 21.6, "the shelf",             False),
    ("B05", "FLOATING ICE BARELY RAISES THE SEA. ICE ON LAND DOES.",               27.0, 32.8, "the two glasses",       True),
    ("B06", "SEA ICE: FLOATS",                                                      35.4,  38.2, "the floes",             False),
    ("B07", "GREENLAND'S ICE: ON LAND",                                            38.4, 42.2, "the ice sheet",         False),
    ("B08", "ALL FLOATING ICE MELTS: SEA LEVEL RISES ABOUT 1.5 INCHES",             42.4,  47.9, "the ring on the house", False),
    ("B09", "ALL OF GREENLAND'S ICE MELTS: SEA LEVEL RISES ABOUT 24 FEET",                  47.9,   53.8, "the ring on the house", True),
    ("B10", "SEND THIS TO WHOEVER'S ARGUING ABOUT ICE. FOLLOW FOR MORE.",            53.9,   59.4, "the finished frame",    True),
]

# key animation events: name, starts, ends, and when the finished STATE next changes (the hold is measured to there)
EVENTS = [
    ("the cube melts, the ring stays",               1.0, 10.6, 12.8),
    ("the meltwater fills the outlined space",      12.8, 15.0, 17.2),
    ("the shelf ice melts and the ring climbs",     21.8, 26.0, 33.4),
    ("the camera pulls out, glass to sea to Greenland", 33.4, 38.8, 42.4),
    ("the ring on the house rises 1.5 in",          43.2, 44.2, 47.9),
    ("the ring on the house climbs to 24 ft",       49.2, 52.8, 59.6),
]
RUNTIME = 59.6


def main() -> None:
    ok = True
    print(f"READ BUDGET: {READ_BASE:.1f} s + {READ_PER_WORD:.2f} s/word at full opacity (min {MIN_BLOCK:.1f} s; end-of-beat >= {END_OF_BEAT_MIN:.1f} s)\n")
    print(f"{'id':<4} {'in':>5} {'out':>5} {'words':>5} {'full':>5} {'need':>5} {'slack':>6}  copy")
    rows = []
    for bid, copy, t_in, t_out, rides, eob in BLOCKS:
        w = words(copy)
        full = (t_out - FADE_OUT) - (t_in + FADE_IN)
        need = max(MIN_BLOCK, READ_BASE + READ_PER_WORD * w, END_OF_BEAT_MIN if eob else 0.0)
        good = full + 1e-9 >= need
        ok &= good
        rows.append({"id": bid, "copy": copy, "t_in": t_in, "t_out": t_out, "words": w, "full_s": round(full, 2),
                     "need_s": round(need, 2), "rides_on": rides, "end_of_beat": eob})
        print(f"{bid:<4} {t_in:>5.1f} {t_out:>5.1f} {w:>5} {full:>5.2f} {need:>5.2f} {full - need:>+6.2f}  {'OK ' if good else 'FAIL'} {copy}")

    # one reader, in order of appearance: each block starts when it is fully visible and the last one is read
    print("\nONE READER, IN ORDER (arrives = fully visible; reads to; must be done by = fade-out starts):")
    free = 0.0
    for r, (bid, copy, t_in, t_out, rides, eob) in zip(rows, BLOCKS):
        arrive = t_in + FADE_IN
        start = max(arrive, free)
        done = start + r["need_s"]
        deadline = t_out - FADE_OUT
        good = done <= deadline + 1e-9
        ok &= good
        print(f"  {'OK ' if good else 'FAIL'} {bid}  arrives {arrive:>5.2f}  reader free {free:>5.2f}  reads {start:>5.2f}->{done:>5.2f}  deadline {deadline:>5.2f}  slack {deadline - done:>+5.2f}")
        r["reader_start"], r["reader_done"] = round(start, 2), round(done, 2)
        free = done

    # how many blocks are on screen at once
    ts = sorted({t for _, _, a, b, _, _ in BLOCKS for t in (a, b)})
    peak = max(sum(1 for _, _, a, b, _, _ in BLOCKS if a <= t + 1e-6 < b) for t in ts)
    print(f"\nmost text blocks on screen at once: {peak} (limit {MAX_AT_ONCE})")
    ok &= peak <= MAX_AT_ONCE

    print("\nHOLDS — the finished state stays on screen after the last motion:")
    for name, a, b, nxt in EVENTS:
        hold = nxt - b
        good = hold + 1e-9 >= HOLD_MIN
        ok &= good
        print(f"  {'OK ' if good else 'FAIL'} {name:<52} motion {a:>5.1f}-{b:>5.1f}   state held to {nxt:>5.1f}   hold {hold:.1f} s")

    total_words = sum(r["words"] for r in rows)
    ok &= RUNTIME <= RUNTIME_MAX
    print(f"\nruntime {RUNTIME:.1f} s (limit {RUNTIME_MAX:.0f}), {total_words} words of copy in {len(rows)} blocks, "
          f"{sum(r['full_s'] for r in rows):.1f} s of full-opacity reading")
    last_out = max(b for _, _, _, b, _, _ in BLOCKS)
    assert last_out <= RUNTIME + 1e-9, "a text block outlives the reel"
    print("\nCOPY COLUMN, READ ALONE:\n  " + "  ".join(c for _, c, *_ in BLOCKS))

    (HERE / "beats.json").write_text(json.dumps({"runtime_s": RUNTIME, "blocks": rows,
                                                  "events": [dict(zip(("name", "start", "end", "state_held_to"), e)) for e in EVENTS],
                                                  "budget": {"base_s": READ_BASE, "per_word_s": READ_PER_WORD, "min_block_s": MIN_BLOCK,
                                                             "end_of_beat_min_s": END_OF_BEAT_MIN, "hold_min_s": HOLD_MIN}}, indent=1))
    print("\n" + ("PASS" if ok else "FAIL") + " — wrote beats.json")
    raise SystemExit(0 if ok else 1)


if __name__ == "__main__":
    main()
