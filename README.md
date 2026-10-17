# system32

Sri Kalyan Ippili's portfolio. A 3D desk with a small retro computer on it. Click the computer and the camera moves into the screen, the machine boots, and a 1-bit desktop opens with the work inside.

There is also a plain version of everything at `/simple`, which is what search engines and screen readers get.

## How it works

- **Next.js + React Three Fiber** for the desk. Static export, no server.
- **The OS is real DOM** on top of the canvas, so text is crisp, selectable and keyboard accessible.
- **The desk is modelled and lit in Blender.** `blender/build_desk.py` builds every model, bakes soft lighting into textures for three light modes (Studio, Day, Evening), denoises them and exports a Draco-compressed glTF. The browser draws the baked result unlit, which is why it stays light on a laptop.
- **Everything is data.** Projects, desk objects, files and terminal commands live in `src/data/site.ts`. Content changes need no component edits.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in ./out
```

## Rebuild the desk

Needs Blender 4.2 or newer on the path.

```bash
blender -b --python blender/build_desk.py
```

It bakes into `blender/out/staging` and swaps the files into `public/models` at the end, so a running site never sees half-finished textures. Useful switches:

| Variable | Effect |
| --- | --- |
| `ONLY=studio` | bake one light mode |
| `SKIP=desk,props` | skip those textures (also `furniture`, `floor`) |
| `BAKE_SAMPLES=64` | samples per pixel before denoising |
| `CHECK_ONLY=1` | print every prop's lowest point and exit, to catch anything sunk into or floating above the desk |

If you move an object, change both `PLACE` in the script and `src/scene/layout.ts`.

## Deploy

Pushing to `main` builds and publishes to GitHub Pages (`.github/workflows/pages.yml`).

For a custom domain, point DNS at GitHub Pages, set the repository variable `CUSTOM_DOMAIN` (for example `example.dev`) and re-run the workflow. The build then drops the `/system32` base path.

## Layout

```
src/data/site.ts       all content
src/scene/             R3F scene, camera, light modes, desk object layout
src/os/                window manager, terminal, sounds, ASCII wallpaper
src/components/        the plain-HTML view
blender/build_desk.py  models and baked lighting
public/models          glTF and baked textures
public/demos           project demo videos
```
