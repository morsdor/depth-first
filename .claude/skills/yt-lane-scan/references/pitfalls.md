# Pitfalls found in the 2026-10-07 scan — each one changed an answer

Read this before quoting a re-run. Every item below was found *after* a result had already looked convincing.

| # | The mistake | What it did | The fix now in the code |
|:--|:--|:--|:--|
| 1 | Treated view-sorted search hits (`order=viewCount`) as a sample | Top-viewed by construction: shows what is *possible*, nothing about odds or lift | Search pulls feed only topic breadth and crowding; lift comes from full catalogues |
| 2 | `small_channel_hunt.py` kept only catalogue videos ≥ 3,000 views | Every small channel's flops were missing, so any hit-vs-flop comparison was biased upward | `small_channel_catalogue.py` re-pulls without the filter |
| 3 | Small channels were found *because* one video was a search hit | That video is selected on the outcome and inflated its topic and title; `local_ai` and `cpu_gpu` looked like the best topics | `EXCLUDE_DISCOVERY` drops every search-found video from the small channels |
| 4 | Vendor channels in the data (Crusoe AI: 8.2M views on 3,310 subscribers) | A single ad-driven channel produced the "lift" for local-AI hardware, LLM inference and "vs" titles; effects fell from ×1.6 to ×1.2 | `CORPORATE` set removed from every test; add new vendors as found |
| 5 | A topic regex matched the word "engine" | "Physical electronics" showed a 2.17× absolute yield; six of its seven 10k+ videos were game-engine tutorials. It nearly became a pilot | Regex fixed (topic ×0.91, 1.18× yield); **print the rows behind any topic before trusting it** |
| 6 | One viral video moved a channel's mean (a cave-exploration channel at ×3,800 its own median) | Large spurious "effects" | `ln(multiple)` capped at ±ln 20 |
| 7 | `hqdefault` thumbnails | Letterbox black bars corrupt brightness, contrast and black-share | `mqdefault` (320×180, no bars) only |
| 8 | Reading a short front page as a gap | Uncrowded topics had 10–40k ceilings; the demanded ones were walls of 1M+ videos | `idea_saturation_check.py` reports demand *and* giants; read both |
| 9 | Quoting a within-channel lift alone | A topic can beat its channels' normals and still rarely reach 10k (LLM internals: ×1.34, 2.5 % reach 10k) | Report the absolute small-channel yield beside every lift |
| 10 | Trusting a taxonomy that predicts nothing out of sample | Topic AUC was 0.509, titles 0.555 — a coin flip per video | Predictability table in every report |
| 11 | Hand-tagging thumbnails while seeing titles/views | Coder bias | Shuffle and number; tag blind; join roles afterwards |
| 12 | Reading the 42 Index split-frame template as proof | 8 template videos: median 13.1k vs 0.8k, but four of them flopped and the winners were about the better-known subjects; the comparison also used search-found videos | Say "one channel, confounded with topic" |

**Selection that remains after every fix:** the small channels were found through *my* topic queries, so the topic mix
is partly my queries; subscriber counts are today's, not at publication; the evergreen proxy is one snapshot (it
cannot be tested for topics two years old, e.g. data centres); thumbnails are today's, often A/B-swapped.

**Base rates to keep in front of any pass line (v1, small channels under 5k subs that had a hit):** median video ≈ 800
views; 31 % reach 2k; 7.7 % reach 10k; 1.9 % reach 40k; channels under two years old: median 490, 5.8 % reach 10k.
