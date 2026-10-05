"""Fetch the NOAA Global Drifter Program 6-hourly archive (May 2025 release), the whole globe.

Source: s3://noaa-oar-hourly-gdp-pds/experimental/gdp6h_ragged_may25.zarr — NOAA AOML GDP DAC,
doi:10.25921/7ntx-z961, licence "freely available" (zarr .zattrs). Read chunk by chunk over plain
HTTPS (blosc-compressed zarr v2 arrays), so no zarr install is needed.

Writes a cache (~1.2 GB) to $I87_CACHE (default: the session scratchpad) — never into the repo.
"""
import json, os, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import numpy as np
import requests
from numcodecs import Blosc  # noqa: F401  (registers the codec)
from numcodecs import get_codec

BASE = "https://noaa-oar-hourly-gdp-pds.s3.amazonaws.com/experimental/gdp6h_ragged_may25.zarr"
CACHE = Path(os.environ.get("I87_CACHE", "/tmp/claude-0/-home-user-depth-first/"
                            "0f34dec1-f71f-5b7a-991c-59813c89984c/scratchpad/i87"))
CACHE.mkdir(parents=True, exist_ok=True)
S = requests.Session()


def meta():
    return S.get(f"{BASE}/.zmetadata", timeout=60).json()["metadata"]


def read(var, M):
    za = M[f"{var}/.zarray"]
    n, c = za["shape"][0], za["chunks"][0]
    codec = get_codec(za["compressor"])
    dt = np.dtype(za["dtype"])
    def chunk(i):
        for attempt in range(4):
            try:
                r = S.get(f"{BASE}/{var}/{i}", timeout=120)
                r.raise_for_status()
                return np.frombuffer(codec.decode(r.content), dtype=dt)
            except Exception:
                if attempt == 3:
                    raise
    k = -(-n // c)
    with ThreadPoolExecutor(16) as ex:
        parts = list(ex.map(chunk, range(k)))
    a = np.concatenate(parts)[:n]
    assert a.size == n, (var, a.size, n)
    return a


if __name__ == "__main__":
    M = meta()
    out = {}
    for v in ["id", "rowsize", "deploy_lat", "deploy_lon", "deploy_date", "drogue_lost_date",
              "end_lat", "end_lon", "end_date", "DeployingCountry"]:
        out[v] = read(v, M)
        print(v, out[v].shape, file=sys.stderr)
    for v in ["lat", "lon", "time", "drogue_status"]:
        out[v] = read(v, M)
        print(v, out[v].shape, file=sys.stderr)
    assert out["rowsize"].sum() == out["lat"].size
    np.savez(CACHE / "gdp6h_may25.npz", **out)
    print("saved", CACHE / "gdp6h_may25.npz", out["lat"].size, "obs,", out["id"].size, "drifters")
