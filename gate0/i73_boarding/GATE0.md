# GATE 0 — `I73` · aeroplane boarding

**Written 2026-09-12. Status: AWAITING THE HUMAN YES ON G2 AND G3.**
Nothing has been coded. No Python, no `.tsx`, no data module, and **no reel number claimed** —
this folder is `gate0/i73_boarding/` and it moves to `projects/r011_boarding/` only when a build
starts. `I72` is the reason that rule is being obeyed to the letter today: it claimed `r012`, was
parked, and cost a repo-wide renumber.

**Picked by the account owner (G1), 2026-09-12**, with the argument named in their own words:

> *"The argument: boarding is agony and everyone has a theory. The airline boards back-to-front.
> Back-to-front is reportedly slower than boarding people in a completely random order."*

---

## 1 · The sentence (G2) — the thing a viewer repeats at dinner

> **"Airlines board back to front. Somebody actually raced it against letting people on in a
> completely random order, and the random order won by a minute and a half."**

Shorter, if the reel wants the harder edge:

> **"The airline's boarding order is slower than having no order at all."**

**Test it against the three kill conditions:**

| Kill condition | Verdict |
|:--|:--|
| **Needs a CS word** | **No.** "Back to front", "random order", "stowing a bag", "the aisle". There is not one developer noun in the sentence, and no jargon anywhere near it |
| **Payoff frame shows an object nobody has seen** | **No.** It is a cabin seat map seen from above — the picture every booking site shows you when you choose a seat. §3 is the frame; name what is on it with the sound off |
| **Amazement depends on understanding first** | **No, and this is the strongest leg.** Two cabins, one clock, one is full and one still has a queue. You are amazed at the picture before anybody explains anything. The mechanism is the reward for staying, which is the required order |

## 2 · Why this one, straight after `I72` was parked

`I72` died as a *pitch* because our own model said the zipper gets nobody through faster. **This
concept does not have that failure mode available to it**, because the headline is not a
prediction — it is a **measured race that somebody already ran with 72 real people in a real
fuselage.** The reel's job is to show the mechanism behind a result that is already in, not to
argue a result into existence.

## 3 · The payoff frame

![payoff](payoff_frame.png)

`mock_payoff.py` — PIL, not a render. One moment, one clock: **4:44, the instant the
randomly-ordered cabin finishes.** The random cabin is full and its aisle is empty. The airline's
cabin still has its front third empty and eight people standing in the aisle behind **one person
stowing a bag.**

**What is measured and what is drawn, stated plainly** (the file says the same thing, because the
`I15` lesson is that a good picture walks a bad claim through this gate):

- **Measured and published:** the four clocks. Back-to-front **6:11**, block **6:54**, random
  **4:44**, Steffen **3:36**.
- **Drawn, illustrative, NOT a measurement:** which individual seats are full at 4:44, and where
  the queue is standing. The *pattern* is structurally true — back-to-front fills from the tail, so
  its empty seats are always a block at the front — but the reel's fill pattern will come out of
  our own simulation and never out of this mock.

## 4 · GATE 3 — the send test. It is binding, and this is the answer.

**Who does the viewer send this to, and what are they proving?**

> **To the person they argue with about boarding.** Proving: *the queue you defend is the slow one.*
> And to the friend who stands up the moment their group is called — that one is sent with no text
> at all, because the reel is about them.

**Channel: argument ammunition, primary.** Against the three required conditions:

| Condition | This reel |
|:--|:--|
| The viewer has **personally witnessed the evidence** | **As close to 100% as this account will ever get.** Everybody has stood in that queue and watched one person with a roller bag stop an entire aisle |
| **A dispute is already running** | **Yes.** "Boarding is broken and here is my theory" is a permanent argument with a fresh round every time anybody flies, and the back-to-front intuition — *surely filling from the back is fastest* — is asserted confidently and often |
| It **resolves to one repeatable thing** | **Yes. 6:11 against 4:44** — one subtraction, carried into the argument without the reel |

**Second channel, "this is you", scores unusually well here** and the account has never used it:
sending this to one specific person because it is about them is a different send from sending it to
win an argument, and it is the send that does not need a caption.

**Honest grading against `r005`.** Witness rate is higher than flat earth; **heat is lower.** Nobody
has an identity stake in boarding order, and identity is part of why the flat-earth argument moves
94k views. Expect this to travel on recognition and mild fury rather than on tribal defence — which
is a real send channel (Berger & Milkman: anger is high-arousal) but not the same engine.

**No loop-format exemption is being claimed.** This is a 30–60 s teaching reel and it is graded on
**sends per reach against the 1.203% benchmark.**

## 5 · Licence

**Clean, and cleaner than `I22`'s was.** Published boarding times are figures in a peer-reviewed
paper — facts, citable, exactly the distinction that let `r006` name MAREA and quote its length.
**No database is used. No third-party data is redistributed.** The cabin is a generic 12-row single
-aisle layout, and every passenger on screen is generated by our own model. **₹0, no image model.**

## 6 · Sources — and what is NOT yet verified

**Primary:** Steffen, *Optimal boarding method for airline passengers*, Journal of Air Transport
Management 14 (2008) 146–150. Steffen & Hotchkiss, *Experimental test of airplane boarding methods*,
JATM 18 (2012) 64–67 (arXiv:1108.5211) — the field test: mock 757 fuselage on a Southern California
soundstage, 12 rows × 6 seats, single aisle, 72 passengers, five methods.

**⚠ THE FOUR CLOCKS ARE CURRENTLY SECOND-HAND.** `arxiv.org`, `en.wikipedia.org` and every mirror
of the PDF are **refused by this container's egress proxy** — the same block that deferred `I15`'s
OSM fetch, and it does not apply on a local machine. The figures above come from press coverage of
the paper, multiply attested and mutually consistent. **They are marked LEAD until the paper itself
is read.** Treat every number in this file as a research lead; that is the standing rule and it has
killed one concept (`I53`) and corrected another (`I15`).

**The mechanism, from the interference literature:** boarding time is governed by **aisle
interference** — a passenger blocked from reaching their row by someone ahead stowing a bag or
shuffling into a seat. The aisle is the resource, and **the real quantity is how many people can
stow AT THE SAME TIME.** Back-to-front packs everyone who still has a bag to lift into one short
stretch of aisle, so that number is about one. A random order scatters them down the whole cabin,
so it is five or six. Steffen's method is simply the arrangement that maximises it.

**That gives the reel a counter worth putting on screen: PEOPLE STOWING RIGHT NOW.** It is the
mechanism, it is a small integer, and it is countable by eye — which is the kind of on-screen number
this account's best reels are built on.

## 7 · Falsification — what would kill this, written BEFORE the research

**1 · The biggest risk is the word "airlines", and it is a `r011`-class copy risk.**
Most large carriers in 2026 board by **boarding group tied to fare and status**, and several use
window-middle-aisle. If strict back-to-front is no longer what a viewer's airline actually does,
*"your airline boards back to front"* is **false on screen** and non-negotiable 7 kills that line
however good the reel is. **Research item one is: what do the major carriers actually do, sourced.**
The repair, if needed, is to aim the reel at the *intuition* — "filling from the back is the obvious
way, and it is the slow way" — which is still a live argument and needs no claim about any airline.

**2 · If our own simulation cannot reproduce the published ordering, the reel dies.** The bar:
back-to-front slower than random, on our model, without fitting the model to that outcome. Same
standard `I65` met on the phantom-jam critical density and `I53` failed.

**3 · If the result turns out to hinge on an arbitrary parameter** — carry-on rate, stow time, walk
speed — the honest reel is much weaker and probably not worth making. A sweep is mandatory, not
optional, and the figure that goes on screen must be stable across it.

**4 · Runtime.** Four methods racing is the temptation and probably the mistake: it costs runtime
and the viewer cannot track four clocks. **Two arms, back-to-front against random, and Steffen only
as a closing beat** if it survives the script.

## 8 · What the research stage must produce, before any script

1. The paper's own table, read from the paper. Confirm or correct the four clocks.
2. What the major carriers actually board by, in 2026, with sources.
3. Our own agent model: a single-aisle cabin, walk speed, a stow-time distribution, seat shuffles,
   and a carry-on rate — then both orders run on **the same passenger list**, many seeds.
4. **Simultaneous stowers over time, per method.** This is the mechanism and therefore the reel.
5. A parameter sweep showing the ordering is not an artefact of one stow-time guess.
6. Why the slow method survives commercially — priority boarding is sold, and speed is not the only
   objective. Probably the closing beat; currently an unverified hunch and nothing more.

---

## 9 · The gate

**G2 — is the sentence one you would say to someone?**
**G3 — is the send test answered?** (§4: the person you argue with about boarding; and the friend
who stands up early, sent with no caption.)

Nothing gets built until both are a yes. If either is no, the answer is a different id — **not a
repair of this one.**
