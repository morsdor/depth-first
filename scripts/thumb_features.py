#!/usr/bin/env python3
"""
thumb_features.py — pixel statistics of every catalogue thumbnail, tested WITHIN each channel.

Reads mqdefault.jpg files (320x180, no letterbox bars — hqdefault has black bars that corrupt every brightness stat),
computes brightness, contrast, saturation, colourfulness (Hasler-Susstrunk), edge density, dark/light background, warm/cool
and vivid-accent shares, palette size; then asks, per channel, whether the thumbnail that is more X than that channel's
usual goes with more views than that channel's usual (data/analysis_systems/analysis_dataset.csv, `y`).

    python3 scripts/thumb_features.py --dir <folder of {video_id}.jpg>

READ BEFORE QUOTING: these are TODAY's thumbnails, often already A/B-swapped, not necessarily the ones that earned the
views. Pixel stats cannot see faces, text or objects — those were tagged by hand on a matched sample (see the report).
"""
import argparse
import sys
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import systems_lane_analysis as sla  # noqa: E402

warnings.filterwarnings("ignore")
OUT = sla.OUT


def feats(path):
    im = Image.open(path).convert("RGB")
    if im.size != (320, 180):
        im = im.resize((320, 180))
    a = np.asarray(im, float) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    hsv = np.asarray(im.convert("HSV"), float) / 255.0
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    rg, yb = r - g, 0.5 * (r + g) - b
    gy, gx = np.gradient(lum)
    mag = np.hypot(gx, gy)
    q = (a * 15).astype(int)
    code = q[..., 0] * 256 + q[..., 1] * 16 + q[..., 2]
    counts = np.sort(np.bincount(code.ravel()))[::-1]
    pal90 = int(np.searchsorted(np.cumsum(counts) / counts.sum(), 0.9) + 1)
    chroma = s > 0.3
    hh = h * 360
    warm = chroma & ((hh < 70) | (hh > 330))
    cool = chroma & (hh >= 170) & (hh <= 290)
    third = a.shape[1] // 3
    centre = lum[:, third:2 * third].mean()
    edge = np.concatenate([lum[:, :third], lum[:, 2 * third:]], 1).mean()
    return {
        "brightness": lum.mean(), "contrast": lum.std(), "saturation": s.mean(),
        "colourfulness": np.sqrt(rg.std() ** 2 + yb.std() ** 2) + 0.3 * np.sqrt(rg.mean() ** 2 + yb.mean() ** 2),
        "edge_density": (mag > 0.08).mean(), "dark_bg": float(np.median(lum) < 0.25), "light_bg": float(np.median(lum) > 0.65),
        "warm_share": warm.mean(), "cool_share": cool.mean(), "vivid_share": ((s > 0.7) & (v > 0.7)).mean(),
        "palette_size90": pal90, "centre_vs_sides": centre - edge,
        "white_share": (lum > 0.92).mean(), "black_share": (lum < 0.08).mean(),
    }


def continuous_table(d, cols):
    y = d["y"].to_numpy()
    codes = pd.factorize(d["channel"])[0]
    rows = []
    for c in cols:
        x = d[c].to_numpy(float)
        z = x - pd.Series(x).groupby(codes).transform("mean").to_numpy()
        sd = pd.Series(x).groupby(codes).transform("std").to_numpy()
        z = np.where(sd > 1e-9, z / np.where(sd > 1e-9, sd, 1), 0.0)
        obs = np.corrcoef(z, y)[0, 1]
        idx = [np.where(codes == k)[0] for k in np.unique(codes)]
        null = []
        for _ in range(1500):
            zp = z.copy()
            for ii in idx:
                zp[ii] = z[ii][sla.RNG.permutation(len(ii))]
            null.append(np.corrcoef(zp, y)[0, 1])
        p = (np.sum(np.abs(null) >= abs(obs)) + 1) / (len(null) + 1)
        hi, lo = z >= 0.67, z <= -0.67  # top / bottom ~quartile of the channel's own spread
        rows.append({"feature": c, "within_channel_r": round(obs, 3),
                     "views_x_when_high_vs_low": round(float(np.exp(y[hi].mean() - y[lo].mean())), 3),
                     "n_high": int(hi.sum()), "n_low": int(lo.sum()), "p_perm": round(p, 4)})
    t = pd.DataFrame(rows)
    t["q_BH"] = np.round(sla.bh(t["p_perm"]), 4)
    return t.sort_values("within_channel_r", ascending=False)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True)
    a = ap.parse_args()
    d = pd.read_csv(OUT / "analysis_dataset.csv")
    rows = []
    for vid in d["id"]:
        p = Path(a.dir) / f"{vid}.jpg"
        if p.is_file():
            rows.append({"id": vid, **feats(p)})
    f = pd.DataFrame(rows)
    f.to_csv(OUT / "thumb_features.csv", index=False)
    d = d.merge(f, on="id")
    print(f"{len(d)} thumbnails matched, {d['channel'].nunique()} channels")
    cols = [c for c in f.columns if c != "id"]
    t = continuous_table(d, cols)
    t.to_csv(OUT / "thumb_pixel_effects.csv", index=False)
    print("\n== PIXEL STATS, WITHIN-CHANNEL (r between a thumbnail's z-score within its channel and ln views-vs-own-median, age-adjusted)")
    print(t.to_string(index=False))
    for name, sub in [("comp (known channels)", d[d["group"] == "comp"]), ("small (<10k subs)", d[d["group"] == "small"])]:
        print(f"\n-- {name}: n={len(sub)}")
        print(continuous_table(sub, cols).head(6).to_string(index=False))


if __name__ == "__main__":
    main()
