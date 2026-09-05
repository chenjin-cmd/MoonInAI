# MoonInAI Personal Site

Static personal website for MoonInAI.

## Local Preview

```bash
npm run serve
```

Open `http://127.0.0.1:4173/`.

## Test

```bash
npm test
```

## GitHub Pages

Deploy from the `main` branch, root directory.

## Interactive lunar homepage

The homepage loads a local, pinned Three.js module and lunar texture through
`interactions.js` and `moon-scene.js`. Drag the moon with a mouse, or use the
rotation and pause buttons. Native scroll/hover effects are independent of WebGL.

The original static moon stays visible while loading and on failure. Reduced
motion, data-saving, and reported low-memory devices use the static image.
Rendering stops offscreen and in hidden tabs; sustained slow frames reduce
resolution before falling back. Texture credits and the vendored library license
are recorded in `assets/SOURCES.md` and `vendor/three/LICENSE`.

`npm test` includes content/link checks plus renderer lifecycle and fallback tests
using browser/renderer mocks. Actual WebGL visuals should also be checked in a
browser after changes to the scene.
