# Lunar interactions implementation plan

Approved scope: 3D lunar hero, hero-to-about scroll transition, portrait/project tilt, workflow flow lights, service spotlight, magnetic buttons and current-section navigation. Preserve color portrait, repository counts and current page order.

Architecture: isolated moon-scene.js using vendored Three.js; interactions.js uses native requestAnimationFrame and IntersectionObserver for scroll/hover effects. CSS handles simple transitions. Existing script.js retains navigation, reveal and clipboard behavior. No bundler or production CDN dependency.

- [x] Vendor a pinned Three.js release and NASA equirectangular lunar texture with source/license notes.
- [x] Implement lazily loaded 3D moon with drag, arrow-key rotation, pause, slow spin and desktop pointer response. Stop offscreen/hidden and clean up on preference changes. Retain static image until first successful frame; fall back on import, texture, context or sustained frame-budget failure.
- [x] Add scroll transform/opacity, portrait and artwork tilt/glint, workflow pulses, skill spread, service spotlight, magnetic buttons and section indicator. Respect reduced motion, touch scrolling and keyboard focus.
- [x] Validate static tests and browser functionality, mobile layout, WebGL fallback and controls. Document any browser limitation.

Validation: actual browser WebGL render, manual drag, pause/resume control, portrait transform, section navigation and 390px layout verified. Renderer lifecycle/failure modes and reduced-motion changes covered by six Node tests with mocked renderer/browser dependencies. Real device battery behavior and real GPU context loss are not hardware-tested.
