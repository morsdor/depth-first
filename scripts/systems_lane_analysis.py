#!/usr/bin/env python3
"""
systems_lane_analysis.py — what in a title / topic goes with a video beating ITS OWN channel's normal?

Outcome dataset (the only one used for "what predicts views"):
  data/comp_videos_systems.csv           36 known channels, each one's newest <=30 long-form videos
  data/small_channel_catalogue_systems.csv  84 channels <10k subs, unfiltered newest <=30 (rerun of the small-channel hunt)
The search-hit files (lane_discovery*.csv) were pulled with order=viewCount, so they are top-viewed BY CONSTRUCTION.
They are used only for topic BREADTH (how many distinct channels reach big views on a topic), never for lift.

  y = ln(views / channel median)   (the channel's own normal = 0), then residualised on ln(age) within channel.
  Videos under 60 days old are dropped (their views are still accruing).

Every feature effect is reported with a within-channel PERMUTATION p-value, a channel-cluster BOOTSTRAP interval and a
Benjamini-Hochberg q. ~40 features on ~2,500 rows from ~120 channels WILL throw up spurious ones; q is the filter.
A topic only counts as a pattern when >=3 distinct channels have a 3x+ video in it.

    python3 scripts/systems_lane_analysis.py        # numpy + pandas only; writes data/analysis_systems/*.csv
"""
import re
import sys
import warnings
from pathlib import Path

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore", message="This pattern is interpreted")
warnings.filterwarnings("ignore", category=RuntimeWarning, message=".*encountered in matmul")  # numpy 2.0 + Accelerate false alarms
ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
OUT = DATA / "analysis_systems"
OUT.mkdir(exist_ok=True)
RNG = np.random.default_rng(7)
TODAY = pd.Timestamp("2026-10-07")
MIN_AGE = 60
HIT = 3.0
EXCLUDE_DISCOVERY = "--keep-discovery" not in sys.argv
# vendor / promotional channels: their view counts are ad-driven (Crusoe AI: 8.2M views on 3.3k subscribers), not organic demand
CORPORATE = {"Crusoe AI", "BIZON", "Scan Business", "Applied Digital", "HOSTKEY", "Ready Tensor"}
WINSOR = np.log(20)   # cap |ln(multiple)| at 20x so one viral video cannot move a mean

# ───────────────────────────── title features ─────────────────────────────
BRANDS = (r"nvidia|intel|amd|apple|asml|tsmc|samsung|openai|chatgpt|gpt-?\d|google|microsoft|amazon|aws|meta\b|tesla|huawei|"
          r"qualcomm|rtx|iphone|macbook|mac mini|\bm[1-5]\b|ryzen|starlink|spacex|deepseek|claude|gemini|anthropic|zeiss|"
          r"cloudflare|crowdstrike|facebook|netflix|discord|linux|windows|android|raspberry pi|arm\b|risc-?v|sk hynix|micron")
THREAT = (r"\bdead\b|\bdie[sd]?\b|kill|collaps|fail|crash|disrupt|replac|\bend(s|ed)?\b|\bwar\b|\bban(ned)?\b|break|broke|"
          r"lost|lose|threat|trouble|disaster|bubble|problem|impossible|can'?t|cannot|never|fall\b|fell\b|wrong|worst|risk")
SECRET = r"hidden|secret|truth|nobody|no one|actually|really|real reason|why .* (is|are|can'?t|won'?t|doesn'?t)|behind"
SUPER = r"\b(best|worst|biggest|largest|fastest|cheapest|most|insane|massive|huge|ultimate|only|first|every|all)\b"
FEATURES = {
    "number_in_title": r"\d",
    "dollar_amount": r"\$\s?\d|\b\d+\s?(million|billion|trillion)\b|\b\d[\d,.]*\s?(k|m|b)\b.*\b(cost|price|usd)\b",
    "year_in_title": r"\b20[12]\d\b",
    "question_mark": r"\?",
    "starts_how": r"^\s*how\b",
    "has_why": r"\bwhy\b",
    "has_what": r"\bwhat\b",
    "explained": r"explain|explanation|in \d+ min",
    "from_scratch": r"from scratch|from zero|from 0|from the ground up",
    "first_person_build": r"\b(i|we|my)\b.*\b(built|build|made|make|tested|test|tried|trained|train|measured|ran|broke|bought)\b|\bbuilding\b",
    "versus": r"\bvs\.?\b|\bversus\b",
    "brand_noun": BRANDS,
    "threat_or_problem": THREAT,
    "secret_or_hidden": SECRET,
    "superlative": SUPER,
    "colon_subtitle": r":|\||—| - ",
    "parenthetical": r"[\(\[]",
    "ai_word": r"\bai\b|\bllms?\b|neural|chatgpt|gpt|transformer|diffusion|deep learning|machine learning",
    "physical_word": r"\bchip|transistor|silicon|wafer|cable|fiber|fibre|data ?cent|\bpower\b|\bwatt|cool|\bgpu\b|\bcpu\b|ram\b|\bssd|memory|hardware|server|physical",
    "second_person": r"\byou(r|'re)?\b",
    "ellipsis_or_excl": r"!|\.\.\.",
}
LEN_FEATS = ["title_chars", "title_words", "caps_words"]

# ───────────────────────────── topic taxonomy (multi-label) ─────────────────────────────
TOPICS = {
    "chip_fab_lithography": r"asml|euv|lithograph|tsmc|\bfab\b|wafer|zeiss|semiconductor|chip ?(making|manufactur|fab)|foundry|high-na|photomask|nanometer|\bnm\b|moore",
    "transistors_logic": r"transistor|logic gate|\bnand\b|\bnor\b gate|adder|boolean|flip-?flop|breadboard|relay|vacuum tube|silicon",
    "cpu_gpu_architecture": r"\bcpu\b|\bgpu\b|processor|\bcore[s]?\b|risc|\barm\b|x86|pipeline|instruction set|microarchitecture|tensor core|\bnpu\b|\btpu\b|cuda",
    "memory_storage": r"\bram\b|dram|sram|\bhbm\b|\bssd\b|nand|flash memory|hard drive|\bhdd\b|memory|storage|\bnas\b|cache",
    "data_centers": r"data ?cent|datacent|server farm|hyperscal|\brack\b|immersion cool|server room|colocation",
    "ai_power_energy": r"power (consumption|grid|plant|demand|usage)|gigawatt|megawatt|\bwatts?\b|nuclear|electricity|energy|\bgrid\b|\bkwh\b|cooling|water use",
    "physical_networks": r"undersea|submarine|subsea|fiber|fibre|optic|internet cable|router|wi-?fi|5g|starlink|satellite|\bbgp\b|\bdns\b|network|ethernet|packet|latency|bandwidth",
    "local_ai_hardware_bench": r"benchmark|\brtx|\bm[1-5] (pro|max|ultra)?|mac (mini|studio)|strix|vram|local (llm|ai)|ollama|tokens?/?(s|sec)|homelab|home server|\bvs\.?\b.*(gpu|mac|rtx)",
    "diy_hardware_builds": r"from scratch.*(cpu|computer|processor|8-?bit|console)|(cpu|computer|processor|console).*from scratch|fpga|homebrew|raspberry pi|esp32|arduino|soldering|\bpcb\b|build(ing)? (a|my|an) (pc|computer|nas|server)",
    "llm_internals": r"\bllms?\b|transformer|attention|kv cache|token(s|ization|izer)?\b|embedding|quantiz|inference|flash ?attention|vllm|paged|context window|gpt|language model|speculative|\bmoe\b",
    "neural_net_basics": r"neural net|backprop|gradient|perceptron|deep learning|\bcnn\b|convolution|loss function|machine learning|neuron|train(ing)? a|activation|learn(s|ing)? (to|how)",
    "generative_images_video": r"diffusion|stable diffusion|\bgan\b|image generat|text-to-image|video generat|sora|midjourney|vae\b",
    "ai_industry_news": r"openai|anthropic|chatgpt|claude|gemini|agi\b|ai bubble|deepseek|altman|ai race|nvidia (stock|earnings)|\bai (is|will|can|agents?)\b|singularity|superintelligen",
    "llm_from_scratch_code": r"(llm|gpt|transformer|language model|neural network|nanogpt|tokenizer).*(from scratch|in python|in c\b|in \d+ lines|code)|(from scratch|build(ing)?|train(ing)?).*(llm|gpt|transformer|language model)",
    "algorithms_visualized": r"sort(ing)?\b|a\*|dijkstra|b\+? ?tree|binary (search|tree)|hash (table|map)|heap\b|\bgraph\b|algorithm|data structure|dynamic programming|pathfind|big o|recursion|bloom filter",
    "compression_crypto": r"compress|jpeg|codec|h\.?26[45]|encrypt|\baes\b|\brsa\b|cryptograph|hash function|\bsha-?\d|zero.knowledge|blockchain|bitcoin|steganograph|fourier|\bfft\b",
    "os_lowlevel": r"kernel|linux|\bboot|assembly|compiler|\bc\+\+|pointer|\bstack\b|memory (management|leak|safety)|operating system|\bos\b|syscall|\bebpf\b|bootloader|firmware|\bbios\b",
    "graphics_engines": r"graphics engine|ray ?trac|shader|opengl|vulkan|rasteri|\bdoom\b|3d engine|webgl|game engine|renderer|\bgpu\b.*render|mesh|voxel|path tracing",
    "failures_outages_bugs": r"outage|post-?mortem|\bbug\b|bugs\b|deleted|crash|\bhack(ed|er|s)?\b|breach|crowdstrike|y2k|2038|hijack|went down|\bdown\b|incident|disaster|cloudflare|aws.*(down|outage)|meltdown|leak(ed)?|rogue|ransomware|supply chain attack",
    "computing_history_companies": r"history|rise and fall|how .* (won|lost)|founder|\bibm\b|bell labs|xerox|story of|the (death|fall|rise) of|\b19[4-9]\d\b|origin|legend|era\b|pioneer|inventor|invent(ed|ion)",
    "security_hacking": r"exploit|vulnerabilit|malware|\bctf\b|reverse engineer|\bcve\b|zero-?day|penetration|phishing|spectre|rowhammer|side.channel|jailbreak",
    "geopolitics_of_tech": r"china|chinese|export (control|ban)|sanction|taiwan|tariff|huawei|\bsmic\b|geopolit|russia|ukraine|trade war|silicon shield|ban(ned)? .* chips",
    "system_design_architecture": r"system design|scal(e|ing|ability)|microservice|architecture|kafka|database|\bsql\b|redis|load balanc|distributed|cap theorem|consisten|sharding|rate limit|\bcdn\b|queue|monolith|design (a|an|the)",
    "devtools_langs_news": r"\brust\b|python|javascript|typescript|\breact\b|\bide\b|vs ?code|cursor|\bgit\b|docker|kubernetes|copilot|framework|\bnode\b|\bgo\b(lang)?|\bjava\b|programming language|developer|coding|vibe cod|\bapi\b|tutorial|web dev|frontend|backend",
    "electronics_motors_engineering": r"\bmotor\b|circuit|resistor|capacitor|inductor|voltage|current\b|battery|solar|\bev\b|magnet|turbine|generator|transformer(s)? (work|explained)|oscillo|amplifier|electric|electromagnet",
    "emerging_compute_hardware": r"quantum|photonic|optical comput|neuromorphic|analog comput|probabilistic|thermodynamic|extropic|in-memory|memristor|wafer.scale|cerebras|groq|chiplet|3d stack|light-based|asic",
    "info_theory_number_systems": r"information theory|entropy|shannon|binary\b|floating.point|bits?\b|bytes?\b|number system|hexadecimal|ieee 754|two'?s complement|precision|overflow",
    "how_its_made_factory": r"how (it'?s|its|they|is|are) (made|manufactur)|manufactur|factory|assembly line|production line|fabricat|how .* (is|are) made|mass.produc|supply chain",
}


def load():
    c = pd.read_csv(DATA / "comp_videos_systems.csv")
    c = c.rename(columns={"multiple": "mult"})
    c["group"] = "comp"
    c["subs"] = np.nan
    cs = pd.read_csv(DATA / "channel_stats_systems.csv")
    s = pd.read_csv(DATA / "small_channel_catalogue_systems.csv").rename(columns={"mult_vs_own_median": "mult"})
    s["group"] = "small"
    if EXCLUDE_DISCOVERY:
        # the small channels were FOUND because one of their videos was a view-sorted search hit. That video is selected
        # on the outcome, so its topic/title would look artificially strong; drop every search-found video from them.
        found = set(pd.read_csv(DATA / "small_channel_hits_systems.csv").query("in_search == True")["id"])
        s = s[~s["id"].isin(found)].copy()
    keep = ["id", "channel", "group", "subs", "title", "published", "views", "duration", "mult"]
    d = pd.concat([c[keep], s[keep]], ignore_index=True).drop_duplicates("id")
    d = d[~d["channel"].isin(CORPORATE)]
    d["published"] = pd.to_datetime(d["published"])
    d["age_days"] = (TODAY - d["published"]).dt.days
    d = d[(d["age_days"] >= MIN_AGE) & (d["mult"] > 0)].copy()
    d["y_raw"] = np.log(d["mult"]).clip(-WINSOR, WINSOR)
    # residualise on ln(age) within channel (pooled slope), centre per channel
    d["lage"] = np.log(d["age_days"])
    d["lage_c"] = d["lage"] - d.groupby("channel")["lage"].transform("mean")
    d["y_c"] = d["y_raw"] - d.groupby("channel")["y_raw"].transform("mean")
    beta = (d["lage_c"] * d["y_c"]).sum() / (d["lage_c"] ** 2).sum()
    d["y"] = d["y_c"] - beta * d["lage_c"]
    d["hit"] = (d["mult"] >= HIT).astype(int)
    d.attrs["age_beta"] = beta
    return d.reset_index(drop=True)


def add_features(d):
    t = d["title"].str.lower()
    for k, rx in FEATURES.items():
        d[k] = t.str.contains(rx, regex=True).astype(int)
    d["title_chars"] = d["title"].str.len()
    d["title_words"] = d["title"].str.split().str.len()
    d["caps_words"] = d["title"].apply(lambda x: sum(1 for w in re.findall(r"[A-Za-z]{3,}", x) if w.isupper()))
    d["len_long"] = (d["title_chars"] >= 60).astype(int)
    d["len_short"] = (d["title_chars"] <= 35).astype(int)
    d["has_caps_word"] = (d["caps_words"] >= 1).astype(int)
    for k, rx in TOPICS.items():
        d["T_" + k] = t.str.contains(rx, regex=True).astype(int)
    return d


# ───────────────────────────── statistics ─────────────────────────────
def within_channel_perm_p(y, x, ch_codes, n_perm=2000):
    """effect = mean(y|x=1) - mean(y|x=0); null = shuffle x within each channel."""
    obs = y[x == 1].mean() - y[x == 0].mean()
    idx = [np.where(ch_codes == k)[0] for k in np.unique(ch_codes)]
    cnt = 0
    for _ in range(n_perm):
        xp = x.copy()
        for ii in idx:
            xp[ii] = x[ii][RNG.permutation(len(ii))]
        if xp.sum() in (0, len(xp)):
            continue
        e = y[xp == 1].mean() - y[xp == 0].mean()
        cnt += abs(e) >= abs(obs) - 1e-12
    return obs, (cnt + 1) / (n_perm + 1)


def cluster_boot_ci(y, x, ch_codes, n_boot=600):
    chans = np.unique(ch_codes)
    idx = {k: np.where(ch_codes == k)[0] for k in chans}
    effs = []
    for _ in range(n_boot):
        pick = RNG.choice(chans, len(chans), replace=True)
        ii = np.concatenate([idx[k] for k in pick])
        yy, xx = y[ii], x[ii]
        if xx.sum() < 3 or (1 - xx).sum() < 3:
            continue
        effs.append(yy[xx == 1].mean() - yy[xx == 0].mean())
    return (np.percentile(effs, 5), np.percentile(effs, 95)) if len(effs) > 100 else (np.nan, np.nan)


def bh(p):
    p = np.asarray(p, float)
    o = np.argsort(p)
    q = np.empty_like(p)
    prev = 1.0
    for rank, i in enumerate(o[::-1]):
        k = len(p) - rank
        prev = min(prev, p[i] * len(p) / k)
        q[i] = prev
    return q


def feature_table(d, cols, label):
    y = d["y"].to_numpy()
    codes = pd.factorize(d["channel"])[0]
    rows = []
    for c in cols:
        x = d[c].to_numpy().astype(int)
        if x.sum() < 12 or (1 - x).sum() < 12:
            continue
        eff, p = within_channel_perm_p(y, x, codes)
        lo, hi = cluster_boot_ci(y, x, codes)
        has = d[d[c] == 1]
        no = d[d[c] == 0]
        rows.append({
            label: c, "n_with": len(has), "channels_with": has["channel"].nunique(),
            "pct_of_videos": round(100 * len(has) / len(d), 1),
            "mult_with(median)": round(has["mult"].median(), 2), "mult_without(median)": round(no["mult"].median(), 2),
            "effect_x(mult)": round(float(np.exp(eff)), 3), "ci90_lo": round(float(np.exp(lo)), 3), "ci90_hi": round(float(np.exp(hi)), 3),
            "hit_rate_with_%": round(100 * has["hit"].mean(), 1), "hit_rate_without_%": round(100 * no["hit"].mean(), 1),
            "channels_with_3x_hit": has[has["hit"] == 1]["channel"].nunique(), "p_perm": round(p, 4),
        })
    t = pd.DataFrame(rows)
    t["q_BH"] = np.round(bh(t["p_perm"]), 4)
    return t.sort_values("effect_x(mult)", ascending=False)


def auc(score, label):
    r = pd.Series(score).rank().to_numpy()
    n1 = label.sum()
    n0 = len(label) - n1
    return (r[label == 1].sum() - n1 * (n1 + 1) / 2) / (n1 * n0)


def cv_predictability(d, groups, k=6):
    """Leave-channels-out ridge on y; report out-of-sample R2 and AUC for 'hit'. groups: {name: [cols]}"""
    chans = d["channel"].unique()
    RNG.shuffle(chans)
    folds = {c: i % k for i, c in enumerate(chans)}
    fold = d["channel"].map(folds).to_numpy()
    out = []
    for name, cols in groups.items():
        X = d[cols].to_numpy(float)
        X = (X - X.mean(0)) / (X.std(0) + 1e-9)
        y = d["y"].to_numpy()
        pred = np.zeros(len(d))
        for f in range(k):
            tr, te = fold != f, fold == f
            A = X[tr]
            w = np.linalg.solve(A.T @ A + 30.0 * np.eye(A.shape[1]), A.T @ (y[tr] - y[tr].mean()))
            pred[te] = X[te] @ w + y[tr].mean()
        ss = ((y - pred) ** 2).sum()
        r2 = 1 - ss / ((y - y.mean()) ** 2).sum()
        out.append({"model": name, "n_features": len(cols), "oos_R2": round(r2, 4), "oos_AUC_hit": round(auc(pred, d["hit"].to_numpy()), 3)})
    return pd.DataFrame(out)


def ngram_table(d, n_perm=600):
    tok = d["title"].str.lower().apply(lambda s: re.findall(r"[a-z0-9\+\*#']+", s))
    stop = set("the a an of and to in on for is are it with this that how what why you your i my we at as by from be or not do does".split())
    vocab = {}
    for i, ts in enumerate(tok):
        ts = [t for t in ts if t not in stop and len(t) > 1]
        grams = set(ts) | {" ".join(p) for p in zip(ts, ts[1:])}
        for g in grams:
            vocab.setdefault(g, set()).add(i)
    y = d["y"].to_numpy()
    codes = pd.factorize(d["channel"])[0]
    rows = []
    for g, ids in vocab.items():
        ids = np.fromiter(ids, int)
        if len(ids) < 10 or len(set(codes[ids])) < 4:
            continue
        x = np.zeros(len(d), int)
        x[ids] = 1
        eff, p = within_channel_perm_p(y, x, codes, n_perm=n_perm)
        rows.append({"ngram": g, "n": len(ids), "channels": len(set(codes[ids])), "effect_x(mult)": round(float(np.exp(eff)), 3),
                     "median_mult": round(float(d["mult"].iloc[ids].median()), 2), "p_perm": round(p, 4)})
    t = pd.DataFrame(rows)
    t["q_BH"] = np.round(bh(t["p_perm"]), 4)
    return t.sort_values("effect_x(mult)", ascending=False)


def topic_table(d):
    # evergreen proxy: among videos >= 18 months old, views/day relative to channel's own median views/day
    d = d.copy()
    d["vpd"] = d["views"] / d["age_days"].clip(lower=1)
    d["vpd_rel"] = d["vpd"] / d.groupby("channel")["vpd"].transform("median")
    rows = []
    for k in TOPICS:
        c = "T_" + k
        t = d[d[c] == 1]
        if len(t) < 8:
            continue
        hits = t[t["hit"] == 1]
        old = t[t["age_days"] >= 548]
        recent = t[t["age_days"] <= 180]
        small_hit_ch = hits[hits["group"] == "small"]["channel"].nunique()
        rows.append({
            "topic": k, "n": len(t), "channels": t["channel"].nunique(),
            "median_mult": round(t["mult"].median(), 2), "mean_log_resid_x": round(float(np.exp(t["y"].mean())), 3),
            "hit_rate_%": round(100 * t["hit"].mean(), 1), "channels_with_3x_hit": hits["channel"].nunique(),
            "small_channels_with_3x_hit": small_hit_ch, "hits_last_180d_%": round(100 * (hits["age_days"] <= 180).mean(), 0) if len(hits) else np.nan,
            "n_recent<=180d": len(recent), "median_mult_recent": round(recent["mult"].median(), 2) if len(recent) >= 5 else np.nan,
            "n_old>=18m": len(old), "evergreen_vpd_rel_old": round(old["vpd_rel"].median(), 2) if len(old) >= 5 else np.nan,
            "pattern(>=3 ch)": "YES" if hits["channel"].nunique() >= 3 else "no",
        })
    return pd.DataFrame(rows).sort_values("channels_with_3x_hit", ascending=False)


def small_yield_table(d):
    """ABSOLUTE view of the same topics, for channels under 5k subs only (so size is comparable across channels).
    Within-channel lift cannot see a niche specialist (a lithography-only channel has no other topic to compare against);
    this can. Selection caveat: the channels were found through MY topic searches, so topic mix is partly my queries."""
    sm = d[(d["group"] == "small") & (d["subs"] < 5000)].copy()
    sm["v10k"] = (sm["views"] >= 10_000).astype(int)
    base = sm["v10k"].mean()
    rows = []
    for k in TOPICS:
        t = sm[sm["T_" + k] == 1]
        if len(t) < 8:
            continue
        rows.append({"topic": k, "n_small(<5k)": len(t), "channels": t["channel"].nunique(),
                     "share_10k+_%": round(100 * t["v10k"].mean(), 1), "base_%": round(100 * base, 1),
                     "lift_vs_base": round(t["v10k"].mean() / base, 2),
                     "channels_with_10k+": t[t["v10k"] == 1]["channel"].nunique(),
                     "median_views": int(t["views"].median()), "p90_views": int(t["views"].quantile(0.9))})
    return pd.DataFrame(rows).sort_values("lift_vs_base", ascending=False)


def search_topic_table():
    """Topic BREADTH and CROWDING from the view-sorted search pulls (top-viewed by construction: NOT a base rate)."""
    a = pd.read_csv(DATA / "lane_discovery_v2.csv")[["id", "channel", "subs", "views", "published", "title"]]
    b = pd.read_csv(DATA / "lane_discovery_systems.csv")[["id", "channel", "subs", "views", "published", "title"]]
    s = pd.concat([a, b]).drop_duplicates("id")
    s = s[s["subs"].notna()].copy()
    t = s["title"].str.lower()
    rows = []
    for k, rx in TOPICS.items():
        m = s[t.str.contains(rx, regex=True)]
        if len(m) < 8:
            continue
        top = m.sort_values("views", ascending=False).head(15)
        rows.append({"topic": k, "n_search_hits": len(m), "channels": m["channel"].nunique(),
                     "top15_median_views": int(top["views"].median()),
                     "crowd_top15_%_from_>=1M_subs": round(100 * (top["subs"] >= 1_000_000).mean()),
                     "share_hits_from_<10k_subs_%": round(100 * (m["subs"] < 10_000).mean()),
                     "distinct_<10k_channels_with_20k+": m[(m["subs"] < 10_000) & (m["views"] >= 20_000)]["channel"].nunique()})
    return pd.DataFrame(rows)


def opportunity(d, tt, tb, sy, st, n_draw=3000):
    """Rank topics on 6 criteria; then perturb the weights 3,000 times and report how stable each rank is."""
    t = tt.set_index("topic")["effect_x(mult)"].rename("lift").to_frame()
    t = t.join(tb.set_index("topic")[["channels_with_3x_hit", "evergreen_vpd_rel_old", "hits_last_180d_%"]])
    t = t.join(sy.set_index("topic")[["lift_vs_base", "channels_with_10k+"]].rename(columns={"lift_vs_base": "small_yield"}))
    t = t.join(st.set_index("topic")[["top15_median_views", "crowd_top15_%_from_>=1M_subs"]])
    t = t.dropna(subset=["lift", "channels_with_3x_hit", "small_yield"])
    t["evergreen_vpd_rel_old"] = t["evergreen_vpd_rel_old"].fillna(t["evergreen_vpd_rel_old"].median())
    t["top15_median_views"] = t["top15_median_views"].fillna(t["top15_median_views"].median())
    t["crowd_top15_%_from_>=1M_subs"] = t["crowd_top15_%_from_>=1M_subs"].fillna(t["crowd_top15_%_from_>=1M_subs"].median())
    crit = pd.DataFrame({
        "lift": t["lift"].rank(pct=True), "breadth": t["channels_with_3x_hit"].rank(pct=True),
        "small_yield": t["small_yield"].rank(pct=True), "evergreen": t["evergreen_vpd_rel_old"].rank(pct=True),
        "demand": t["top15_median_views"].rank(pct=True), "uncrowded": 1 - t["crowd_top15_%_from_>=1M_subs"].rank(pct=True),
    })
    W = RNG.dirichlet(np.ones(crit.shape[1]), size=n_draw)
    scores = crit.to_numpy() @ W.T                      # topics x draws
    ranks = (-scores).argsort(0).argsort(0) + 1
    eq = crit.mean(axis=1)
    out = pd.DataFrame({"topic": crit.index, "equal_weight_score": eq.round(3).to_numpy(),
                        "median_rank": np.median(ranks, 1), "rank_p10": np.percentile(ranks, 10, 1),
                        "rank_p90": np.percentile(ranks, 90, 1), "pct_draws_top5": (ranks <= 5).mean(1).round(2)})
    out = out.join(t[["lift", "channels_with_3x_hit", "small_yield", "evergreen_vpd_rel_old", "top15_median_views", "crowd_top15_%_from_>=1M_subs", "hits_last_180d_%"]], on="topic")
    return out.sort_values(["median_rank", "equal_weight_score"], ascending=[True, False])


def topic_evidence(d, per=6):
    rows = []
    for k in TOPICS:
        t = d[(d["T_" + k] == 1) & (d["hit"] == 1)].sort_values("mult", ascending=False)
        seen, n = set(), 0
        for _, r in t.iterrows():
            if r["channel"] in seen:
                continue
            seen.add(r["channel"])
            rows.append({"topic": k, "channel": r["channel"], "group": r["group"], "subs": r["subs"], "views": r["views"], "mult": r["mult"],
                         "published": r["published"].date(), "title": r["title"], "id": r["id"]})
            n += 1
            if n >= per:
                break
    return pd.DataFrame(rows)


def replication(d, cols):
    """Does an effect found on the pooled data show up, same sign, in BOTH independent halves (known big channels vs <10k-sub channels)?"""
    rows = []
    for c in cols:
        r = {"feature": c.replace("T_", "")}
        for g in ("comp", "small"):
            sub = d[d["group"] == g]
            has, no = sub[sub[c] == 1], sub[sub[c] == 0]
            if len(has) < 8 or len(no) < 8:
                r[f"{g}_n"], r[f"{g}_effect_x"] = len(has), np.nan
                continue
            r[f"{g}_n"] = len(has)
            r[f"{g}_channels"] = has["channel"].nunique()
            r[f"{g}_effect_x"] = round(float(np.exp(has["y"].mean() - no["y"].mean())), 2)
        e1, e2 = r.get("comp_effect_x", np.nan), r.get("small_effect_x", np.nan)
        r["same_direction"] = "yes" if (e1 - 1) * (e2 - 1) > 0 else ("n/a" if np.isnan(e1) or np.isnan(e2) else "NO")
        rows.append(r)
    return pd.DataFrame(rows)


def main():
    d = add_features(load())
    print(f"rows {len(d)}  channels {d['channel'].nunique()}  comp {int((d.group=='comp').sum())}  small {int((d.group=='small').sum())}  "
          f"hit(>={HIT}x) {d['hit'].mean():.1%}  ln(age) slope {d.attrs['age_beta']:+.3f}")
    d.to_csv(OUT / "analysis_dataset.csv", index=False)

    tf = feature_table(d, list(FEATURES) + ["len_long", "len_short", "has_caps_word"], "title_feature")
    tf.to_csv(OUT / "title_features.csv", index=False)
    print("\n== TITLE FEATURES (within-channel, age-adjusted; effect_x = multiplicative change in views vs own median)")
    print(tf.to_string(index=False))

    tt = feature_table(d, ["T_" + k for k in TOPICS], "topic")
    tt["topic"] = tt["topic"].str.replace("T_", "", regex=False)
    tt.to_csv(OUT / "topic_effects.csv", index=False)
    print("\n== TOPIC EFFECTS")
    print(tt.to_string(index=False))

    tb = topic_table(d)
    tb.to_csv(OUT / "topic_breadth.csv", index=False)
    print("\n== TOPIC BREADTH / RECENCY / EVERGREEN PROXY")
    print(tb.to_string(index=False))

    ng = ngram_table(d)
    ng.to_csv(OUT / "ngrams.csv", index=False)
    print("\n== N-GRAMS: top 20 lift / bottom 15 (n>=10 videos, >=4 channels)")
    print(ng.head(20).to_string(index=False))
    print(ng.tail(15).to_string(index=False))

    tcols = list(FEATURES) + ["len_long", "len_short", "has_caps_word"]
    pcols = ["T_" + k for k in TOPICS]
    sy = small_yield_table(d)
    sy.to_csv(OUT / "topic_small_channel_yield.csv", index=False)
    print("\n== ABSOLUTE VIEW: channels under 5k subs only — share of videos with 10k+ views, by topic")
    print(sy.to_string(index=False))

    st = search_topic_table()
    st.to_csv(OUT / "topic_search_breadth_crowding.csv", index=False)
    print("\n== SEARCH-PULL BREADTH / CROWDING (view-sorted pulls: existence, not base rate)")
    print(st.to_string(index=False))

    op = opportunity(d, tt, tb, sy, st)
    op.to_csv(OUT / "topic_opportunity_ranking.csv", index=False)
    print("\n== TOPIC OPPORTUNITY RANKING (6 criteria; ranks under 3,000 random weightings)")
    print(op.to_string(index=False))

    ev = topic_evidence(d)
    ev.to_csv(OUT / "topic_evidence.csv", index=False)

    rep = replication(d, list(FEATURES) + ["len_long", "len_short", "has_caps_word"] + ["T_" + k for k in TOPICS])
    rep.to_csv(OUT / "replication.csv", index=False)
    print("\n== REPLICATION: same-sign effect in BOTH known channels and <10k-sub channels?")
    print(rep.to_string(index=False))

    cv = cv_predictability(d, {"title features": tcols, "topics": pcols, "title+topics": tcols + pcols, "ln(age) only": ["lage"]})
    cv.to_csv(OUT / "predictability.csv", index=False)
    print("\n== HOW MUCH CAN WE PREDICT? (leave-channels-out; R2 about 0 and AUC about 0.5 = nothing)")
    print(cv.to_string(index=False))


if __name__ == "__main__":
    sys.exit(main())
