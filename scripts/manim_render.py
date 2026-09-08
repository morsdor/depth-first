#!/usr/bin/env python3
"""Render a Manim scene to a transparent PNG sequence Remotion can composite.

    python3 scripts/manim_render.py projects/manim/probe.py Probe probe

Writes remotion/public/manim/<name>/0000.png ... and prints the frame count to
pass to <ManimLayer frames={...} />.

Why PNG and not video: Chromium cannot decode Manim's qtrle .mov, and this
container's ffmpeg silently drops alpha when encoding VP9 webm -- it accepts
-pix_fmt yuva420p, reports success, and writes yuv420p, so the layer comes back
fully opaque with no error at any stage. PNG frames are lossless and ~29 KB
each at 1080x1920, so a 40 s layer is ~35 MB.

Setup (once per container -- the venv is not committed):

    apt-get install -y --no-install-recommends libpango1.0-dev libcairo2-dev pkg-config
    python3 -m venv .manimenv
    .manimenv/bin/pip install -r scripts/manim_requirements.txt

No LaTeX is installed, so Tex/MathTex are unavailable. Use Text (Pango), which
is what the brand font is anyway.
"""
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
VENV = ROOT / '.manimenv'
W, H, FPS = 1080, 1920, 30


def main() -> int:
    if len(sys.argv) != 4:
        print(__doc__)
        return 2
    scene_file, scene_name, out_name = sys.argv[1], sys.argv[2], sys.argv[3]

    py = VENV / 'bin' / 'python'
    if not py.exists():
        print(f'no venv at {VENV} -- see the setup block in this file', file=sys.stderr)
        return 1

    # Manim needs an ffmpeg on PATH; imageio-ffmpeg ships a static one.
    ff = subprocess.run(
        [py, '-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())'],
        capture_output=True, text=True, check=True).stdout.strip()
    binroot = ROOT / '.manimenv' / 'ffmpegbin'
    binroot.mkdir(exist_ok=True)
    link = binroot / 'ffmpeg'
    if not link.exists():
        link.symlink_to(ff)

    work = ROOT / '.manimenv' / 'work'
    env = {'PATH': f'{binroot}:/usr/bin:/bin'}
    subprocess.run(
        [VENV / 'bin' / 'manim', 'render', '-q', 'h', '--format=png', '--transparent',
         '-r', f'{W},{H}', '--fps', str(FPS),
         '--media_dir', str(work), scene_file, scene_name],
        cwd=ROOT, env=env, check=True)

    src = next((work / 'images').rglob(f'{scene_name}*'), None)
    if src is None or not src.is_dir():
        # Manim puts png sequences under videos/<file>/<res>/<Scene>/
        src = next((work / 'videos').rglob(scene_name), None)
    if src is None:
        print('could not locate the rendered frames', file=sys.stderr)
        return 1

    dest = ROOT / 'remotion' / 'public' / 'manim' / out_name
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    frames = sorted(src.glob('*.png'))
    for i, f in enumerate(frames):
        shutil.copyfile(f, dest / f'{i:04d}.png')

    print(f'{len(frames)} frames -> remotion/public/manim/{out_name}/')
    print(f'<ManimLayer dir="manim/{out_name}" frames={{{len(frames)}}} />')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
