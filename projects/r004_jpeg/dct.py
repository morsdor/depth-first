"""
r004 - "Watch a photograph assemble from 64 patterns"  (backlog I03)

Runs the real transform half of JPEG on a real photograph and dumps its
intermediate state, in the shape r001/r003 established: the algorithm produces
the numbers, so every figure on screen is correct because the run made it.

WHAT IS ACTUALLY COMPUTED
  1. The 64 basis images of the 8x8 DCT-II, from the cosine definition.
  2. A real photo, level-shifted and forward-transformed block by block.
  3. Quantisation with the table THE SYSTEM'S OWN libjpeg CHOSE -- read back out
     of an encoded file rather than typed in from memory. The ITU-T T.81 Annex K
     table could not be fetched to check by hand (the egress proxy blocks both
     itu.int and the w3.org mirror), so the encoder is used as the source of
     truth instead: whatever libjpeg really used at this quality is what the
     reel quotes, and `quant_table_source` in the JSON records where it came from.
  4. Progressive reconstruction keeping the first N coefficients per block in
     zigzag order, with the error measured at every N.

SELF-CHECK
  Keeping all 64 coefficients must return the original samples to floating point
  tolerance. If that assertion fails the transform is wrong and nothing below it
  can be trusted, which is the same proof-by-reconstruction qr_damage.py does.

Usage:  python3 dct.py --image PATH [--size 512] [--quality 50]
"""

from __future__ import annotations

import argparse
import json
import pathlib

import numpy as np
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
REELS_PUBLIC = HERE.parents[1] / 'remotion' / 'public' / 'reels'

# Coefficient counts the reel actually stops on. 1 is flat blocks, 64 is lossless
# for this stage; the interesting ones are the single digits.
#
# ON --size, WHICH IS A STORYTELLING PARAMETER AND NOT A COSMETIC ONE
# At 512 the image is 64 blocks across, so keeping ONE coefficient per block is
# still a 64x64 thumbnail -- and a 64x64 thumbnail of a big structure is already
# recognisable. Measured: N=1 at 512 is legible, so the whole assembly has no
# visible progression and the reel has nothing to show. At 128 the image is 16
# blocks across, N=1 is an unreadable mosaic, arches appear by N=3 and the thing
# is sharp by N=10. Same algorithm, same maths -- a scale at which the 8x8 block
# is a thing the eye can see. Compute small, display upscaled.
STOPS = [1, 2, 3, 4, 6, 10, 15, 21, 28, 36, 64]


def dct_matrix() -> np.ndarray:
    """Orthonormal 8x8 DCT-II. D @ block @ D.T is the forward transform."""
    x = np.arange(8)
    u = x.reshape(-1, 1)
    d = np.cos((2 * x + 1) * u * np.pi / 16) * np.sqrt(2 / 8)
    d[0] = np.sqrt(1 / 8)
    return d


def zigzag_order() -> np.ndarray:
    """The 64 (row, col) positions in JPEG zigzag order, as flat indices."""
    pts = sorted(
        ((r, c) for r in range(8) for c in range(8)),
        key=lambda rc: (rc[0] + rc[1], rc[1] if (rc[0] + rc[1]) % 2 == 0 else -rc[1]),
    )
    return np.array([r * 8 + c for r, c in pts])


def blocks_of(img: np.ndarray) -> np.ndarray:
    """(H,W) -> (nblocks, 8, 8), H and W already multiples of 8."""
    h, w = img.shape
    return (
        img.reshape(h // 8, 8, w // 8, 8).transpose(0, 2, 1, 3).reshape(-1, 8, 8)
    )


def unblock(blocks: np.ndarray, h: int, w: int) -> np.ndarray:
    return (
        blocks.reshape(h // 8, w // 8, 8, 8).transpose(0, 2, 1, 3).reshape(h, w)
    )


def libjpeg_quant_table(img: Image.Image, quality: int) -> tuple[np.ndarray, str]:
    """Encode with libjpeg, then read back the luminance table it really used."""
    tmp = HERE / f'_probe_q{quality}.jpg'
    img.save(tmp, 'JPEG', quality=quality)
    with Image.open(tmp) as reopened:
        table = np.array(reopened.quantization[0], dtype=np.float64)
    src = (
        f'libjpeg via Pillow {Image.__version__}, quality={quality}, '
        'read back from the encoded file (not transcribed by hand)'
    )
    tmp.unlink()
    # Pillow returns the table already in zigzag order; put it back on the grid.
    grid = np.empty(64, dtype=np.float64)
    grid[zigzag_order()] = table
    return grid.reshape(8, 8), src


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--image', required=True)
    ap.add_argument('--size', type=int, default=512)
    ap.add_argument('--quality', type=int, default=50)
    args = ap.parse_args()

    size = args.size - args.size % 8
    src = Image.open(args.image).convert('L')
    side = min(src.size)
    left, top = (src.width - side) // 2, (src.height - side) // 2
    src = src.crop((left, top, left + side, top + side)).resize(
        (size, size), Image.LANCZOS
    )
    samples = np.asarray(src, dtype=np.float64)

    D = dct_matrix()
    zz = zigzag_order()
    blocks = blocks_of(samples) - 128.0          # JPEG's level shift
    coeffs = D @ blocks @ D.T                     # forward DCT, every block

    # ── self-check: all 64 coefficients must rebuild the original exactly ──
    full = unblock(D.T @ coeffs @ D, size, size) + 128.0
    err = float(np.abs(full - samples).max())
    assert err < 1e-9, f'transform is not invertible: max error {err}'

    # ── what real quantisation actually throws away ────────────────────────
    qtable, qsource = libjpeg_quant_table(src, args.quality)
    quantised = np.round(coeffs / qtable)
    nonzero = int(np.count_nonzero(quantised))
    total = int(quantised.size)

    REELS_PUBLIC.mkdir(parents=True, exist_ok=True)

    # ── the 64 basis images, which is the thing the title names ────────────
    basis = np.einsum('ux,vy->uvxy', D, D)        # (u,v,8,8)
    tile, gap = 24, 3
    sheet = np.full((8 * tile + 7 * gap, 8 * tile + 7 * gap), 255, dtype=np.uint8)
    for u in range(8):
        for v in range(8):
            b = basis[u, v]
            # The DC basis (u=v=0) is constant, so its range is zero. Scaling it
            # by its own range is a divide by zero -- it renders as mid grey,
            # which is what a flat block IS.
            span = b.max() - b.min()
            b = np.full_like(b, 128.0) if span < 1e-12 else (b - b.min()) / span * 255
            patch = np.asarray(
                Image.fromarray(b.astype(np.uint8)).resize((tile, tile), Image.NEAREST)
            )
            y, x = u * (tile + gap), v * (tile + gap)
            sheet[y:y + tile, x:x + tile] = patch
    Image.fromarray(sheet).save(REELS_PUBLIC / 'r004_basis.png')

    # ── progressive reconstruction, and the error at every N ───────────────
    steps = []
    for n in range(1, 65):
        keep = np.zeros(64, dtype=bool)
        keep[zz[:n]] = True
        kept = coeffs * keep.reshape(8, 8)
        rec = np.clip(unblock(D.T @ kept @ D, size, size) + 128.0, 0, 255)
        mae = float(np.abs(rec - samples).mean())
        mse = float(((rec - samples) ** 2).mean())
        psnr = float('inf') if mse == 0 else float(10 * np.log10(255.0 ** 2 / mse))
        steps.append({'n': n, 'mae': round(mae, 4), 'psnr_db': round(psnr, 3)})
        if n in STOPS:
            Image.fromarray(rec.astype(np.uint8)).save(
                REELS_PUBLIC / f'r004_recon_{n:02d}.png'
            )
    Image.fromarray(samples.astype(np.uint8)).save(REELS_PUBLIC / 'r004_original.png')

    # The assembly is computed at a scale where 8x8 blocks are VISIBLE (see the
    # note in STOPS below), which necessarily makes the finished frame soft. The
    # true photograph is exported separately at full size so the reel can land on
    # it -- same crop, same pixels, just not decimated to 16 blocks across.
    src.resize((1024, 1024), Image.LANCZOS).save(REELS_PUBLIC / 'r004_photo.png')

    data = {
        'source_image': str(pathlib.Path(args.image).name),
        'size': size,
        'blocks': int(coeffs.shape[0]),
        'coefficients_total': total,
        'quality': args.quality,
        'quant_table': qtable.astype(int).tolist(),
        'quant_table_source': qsource,
        'quantised_nonzero': nonzero,
        'quantised_zero_pct': round(100.0 * (total - nonzero) / total, 2),
        'mean_kept_per_block': round(nonzero / coeffs.shape[0], 2),
        'reconstruction_max_error': err,
        'stops': STOPS,
        'steps': steps,
    }
    (HERE / 'jpeg_data.json').write_text(json.dumps(data, indent=2))

    print(f"image        {data['source_image']}  {size}x{size}, {data['blocks']} blocks")
    print(f"self-check   all-64 reconstruction max error {err:.2e}  (must be ~0)")
    print(f"quant table  {qsource}")
    print(f"             DC step {int(qtable[0,0])}, highest-frequency step {int(qtable[7,7])}")
    print(f"quantised    {nonzero:,} of {total:,} coefficients survive "
          f"= {100.0*nonzero/total:.2f}%  ({data['quantised_zero_pct']}% become zero)")
    print(f"             mean {data['mean_kept_per_block']} non-zero coefficients per 8x8 block")
    for n in [1, 2, 3, 4, 6, 10, 15, 21, 64]:
        s = steps[n - 1]
        print(f"  N={n:2d}   mean abs error {s['mae']:6.2f}   PSNR {s['psnr_db']:6.2f} dB")


if __name__ == '__main__':
    main()
