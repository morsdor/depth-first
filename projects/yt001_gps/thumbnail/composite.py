"""Lock the globe to ours, keep the model's left third.

    python3 composite.py generated.png            # -> thumb_composite.png (1920x1080)

An image model asked to "keep the right half" will still nudge the globe, the beams or the blue dot.
This takes only the LEFT of the model's image (x < 720, feathered out by x = 960) and everything else
from thumb_base.png, so the part of the thumbnail that is the video's own never changes. Add the headline
afterwards, in an editor, in Archivo Black (the repo vendors it in remotion/public/fonts).
"""
import sys
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
KEEP, FADE = 720, 960          # model's pixels to x=720, linear blend to our base by x=960

def main(src: str) -> None:
    base = Image.open(HERE / "thumb_base.png").convert("RGB")
    gen = Image.open(src).convert("RGB").resize(base.size, Image.LANCZOS)
    mask = Image.new("L", base.size, 0)
    px = mask.load()
    for x in range(base.width):
        a = 255 if x <= KEEP else max(0, int(255 * (FADE - x) / (FADE - KEEP)))
        for y in range(base.height):
            px[x, y] = a
    out = Image.composite(gen, base, mask)
    out.save(HERE / "thumb_composite.png")
    print("wrote", HERE / "thumb_composite.png")

if __name__ == "__main__":
    main(sys.argv[1])
