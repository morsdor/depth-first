#!/usr/bin/env python3
"""
thumb_tag_analysis.py — hand-tagged thumbnail features, MATCHED within channel.

Sample: data/analysis_systems/thumb_matched_sample_tags.csv = each channel's best and worst videos by within-channel
(age-adjusted) views — comp channels top3/bottom3, 40 random small channels top2/bottom2 — 364 thumbnails, tagged
BLIND (shuffled, only a number shown, no title/views/role) from contact sheets. Tags: face (a human face, real or drawn,
clearly visible), text (0 none / 1 one-three words / 2 four+), subject (P photo of real object, R render/CGI,
D diagram/screenshot/code, I illustration, M scene/footage/map, H person-led, X text-only), annot (arrow/circle/stamp),
brand (logo or brand name), number (a figure on the thumbnail), clutter (1 clean / 2 / 3 busy).

Because every channel contributes equal numbers of top and bottom thumbnails, "Fireship-style vs 3B1B-style" cannot
leak in: the test is whether a channel's WINNERS differ from the SAME channel's LOSERS. Permutation = relabel top/bottom
within each channel. One coder (me), not blind to my own priors; today's thumbnails, often A/B-swapped since publishing.
    python3 scripts/thumb_tag_analysis.py
"""
import numpy as np
import pandas as pd
from pathlib import Path
import warnings
warnings.filterwarnings("ignore")

OUT = Path(__file__).resolve().parents[1] / "data" / "analysis_systems"
RNG = np.random.default_rng(5)
m = pd.read_csv(OUT / "thumb_matched_sample_tags.csv")
# vendor / promotional channels: ad-driven views make "winner" meaningless (same set as systems_lane_analysis.CORPORATE)
m = m[~m["channel"].isin({"Crusoe AI", "BIZON", "Scan Business", "Applied Digital", "HOSTKEY", "Ready Tensor"})].reset_index(drop=True)
m["win"] = (m["role"] == "top").astype(int)
feat = pd.DataFrame({
    "face": m["face"], "any_text": (m["text"] >= 1).astype(int), "heavy_text_4+words": (m["text"] == 2).astype(int),
    "no_text": (m["text"] == 0).astype(int), "annotation(arrow/circle/stamp)": m["annot"], "brand_logo/name": m["brand"],
    "number_on_thumb": m["number"], "clean(K1)": (m["clutter"] == 1).astype(int), "busy(K3)": (m["clutter"] == 3).astype(int),
})
for s, name in [("P", "photo_of_real_object"), ("R", "3D_render/CGI"), ("D", "diagram/screenshot/code"), ("I", "illustration"),
                ("M", "scene/footage/map"), ("H", "person-led"), ("X", "text-only")]:
    feat[name] = (m["subject"] == s).astype(int)
feat["physical_subject(P|R|M)"] = m["subject"].isin(list("PRM")).astype(int)
feat["channel"] = m["channel"]; feat["win"] = m["win"]; feat["group"] = m["group"]

def paired(f, cols, n_perm=4000):
    chans = f["channel"].unique()
    idx = {c: np.where(f["channel"].to_numpy() == c)[0] for c in chans}
    win = f["win"].to_numpy()
    rows = []
    for c in cols:
        x = f[c].to_numpy(float)
        d = x[win == 1].mean() - x[win == 0].mean()
        pc = []
        for ch, ii in idx.items():
            w = win[ii]
            if w.sum() and (1 - w).sum():
                pc.append(x[ii][w == 1].mean() - x[ii][w == 0].mean())
        pc = np.array(pc)
        null = []
        for _ in range(n_perm):
            tot = 0.0
            xs1 = []; xs0 = []
            for ch, ii in idx.items():
                w = win[ii]
                wp = w[RNG.permutation(len(w))]
                xs1.append(x[ii][wp == 1]); xs0.append(x[ii][wp == 0])
            null.append(np.concatenate(xs1).mean() - np.concatenate(xs0).mean())
        p = (np.sum(np.abs(null) >= abs(d) - 1e-12) + 1) / (n_perm + 1)
        rows.append({"feature": c, "winners_%": round(100 * x[win == 1].mean(), 1), "losers_%": round(100 * x[win == 0].mean(), 1),
                     "diff_pp": round(100 * d, 1), "channels_winners_more": int((pc > 0).sum()), "channels_losers_more": int((pc < 0).sum()),
                     "p_perm": round(p, 4)})
    t = pd.DataFrame(rows)
    # Benjamini-Hochberg
    o = np.argsort(t["p_perm"].to_numpy()); q = np.empty(len(t)); prev = 1.0
    for r, i in enumerate(o[::-1]):
        k = len(t) - r; prev = min(prev, t["p_perm"].iloc[i] * len(t) / k); q[i] = prev
    t["q_BH"] = np.round(q, 4)
    return t.sort_values("diff_pp", ascending=False)

cols = [c for c in feat.columns if c not in ("channel", "win", "group")]
print(f"n={len(feat)}  channels={feat['channel'].nunique()}  winners={int(feat['win'].sum())}  losers={int((1-feat['win']).sum())}")
allt = paired(feat, cols); allt.to_csv(OUT / "thumb_tag_effects.csv", index=False)
print("\n== ALL (matched within channel)\n" + allt.to_string(index=False))
for g in ["comp", "small"]:
    t = paired(feat[feat["group"] == g], cols, 2000)
    t.to_csv(OUT / f"thumb_tag_effects_{g}.csv", index=False)
    print(f"\n== {g} only (n={int((feat['group']==g).sum())}, channels={feat[feat['group']==g]['channel'].nunique()})\n" + t.head(8).to_string(index=False))
    print(t.tail(4).to_string(index=False))
print("\nBase rates (all sample):")
print((feat[cols].mean() * 100).round(1).to_string())
