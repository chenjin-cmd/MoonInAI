import * as THREE from "./vendor/three/three.module.min.js";

// This module owns its GPU resources and listeners. The static image remains
// visible until the texture and first frame have both rendered successfully.
export async function mountMoon(host, onFailure) {
  const hero = host.closest(".hero");
  const controls = hero.querySelector(".moon-controls");
  const pause = controls.querySelector("[data-moon-pause]");
  const fine = matchMedia("(pointer: fine)");
  const mobile = matchMedia("(max-width: 767px)").matches;
  const events = new AbortController();
  let renderer, texture, geometry, material, resizeObserver, visibilityObserver;
  let frame = 0,
    disposed = false,
    visible = true,
    paused = false;
  let pointerX = 0,
    pointerY = 0,
    rotation = -Math.PI / 2;
  let drag = null,
    previousTime = 0,
    samples = [],
    degraded = false;
  const listen = (target, type, fn, options = {}) =>
    target.addEventListener(type, fn, { ...options, signal: events.signal });
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    events.abort();
    resizeObserver?.disconnect();
    visibilityObserver?.disconnect();
    if (drag !== null && renderer?.domElement.hasPointerCapture(drag.id))
      renderer.domElement.releasePointerCapture(drag.id);
    texture?.dispose();
    geometry?.dispose();
    material?.dispose();
    renderer?.dispose();
    renderer?.domElement.remove();
    host.classList.remove("moon-ready", "is-dragging");
    controls.hidden = true;
  };
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !mobile,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1 : 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    const canvas = renderer.domElement;
    canvas.className = "moon-canvas";
    canvas.setAttribute("aria-hidden", "true");
    host.append(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 20);
    camera.position.z = 3;
    texture = await new THREE.TextureLoader().loadAsync(
      new URL("./assets/lunar-surface.webp", import.meta.url).href,
    );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    geometry = new THREE.SphereGeometry(1, mobile ? 40 : 64, mobile ? 24 : 48);
    material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 1,
      metalness: 0,
    });
    const moon = new THREE.Mesh(geometry, material);
    moon.rotation.set(0.12, rotation, -0.17);
    scene.add(moon);
    scene.add(new THREE.AmbientLight(0xb7c9d4, 0.7));
    const sun = new THREE.DirectionalLight(0xfff5e5, 2.9);
    sun.position.set(3.5, 2, 3);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xc6ffb5, 0.25);
    rim.position.set(-3, 0, -1);
    scene.add(rim);
    const render = () => {
      moon.rotation.y = rotation;
      moon.rotation.x = 0.12 + pointerY * 0.08;
      camera.position.x = pointerX * 0.1;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    const fail = () => {
      dispose();
      onFailure();
    };
    const tick = (time) => {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      const elapsed = previousTime ? (time - previousTime) / 1000 : 0;
      previousTime = time;
      if (!paused && !drag) rotation += Math.min(elapsed, 0.05) * 0.045;
      try {
        render();
      } catch {
        fail();
        return;
      }
      // Downgrade sustained slow rendering, not a single frame or tab switch.
      if (!paused && elapsed > 0 && elapsed < 0.5) {
        samples.push(elapsed);
        if (samples.length >= 90) {
          const mean =
            samples.reduce((sum, value) => sum + value, 0) / samples.length;
          samples = [];
          if (mean > 0.075) {
            if (degraded) {
              fail();
              return;
            }
            degraded = true;
            renderer.setPixelRatio(0.8);
          }
        }
      }
      if (!paused || drag) frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (disposed || !visible || document.hidden || frame) return;
      previousTime = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      samples = [];
    };
    const size = () => {
      if (disposed) return;
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      camera.aspect = host.clientWidth / Math.max(1, host.clientHeight);
      camera.updateProjectionMatrix();
      wake();
    };
    listen(canvas, "webglcontextlost", (event) => {
      event.preventDefault();
      fail();
    });
    listen(canvas, "pointerdown", (event) => {
      if (!fine.matches || event.pointerType === "touch" || event.button !== 0)
        return;
      drag = { id: event.pointerId, x: event.clientX };
      canvas.setPointerCapture(event.pointerId);
      host.classList.add("is-dragging");
      wake();
    });
    listen(canvas, "pointermove", (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      rotation += (event.clientX - drag.x) * 0.006;
      drag.x = event.clientX;
      wake();
    });
    const endDrag = (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      if (canvas.hasPointerCapture(event.pointerId))
        canvas.releasePointerCapture(event.pointerId);
      drag = null;
      host.classList.remove("is-dragging");
    };
    listen(canvas, "pointerup", endDrag);
    listen(canvas, "pointercancel", endDrag);
    listen(canvas, "lostpointercapture", () => {
      drag = null;
      host.classList.remove("is-dragging");
    });
    listen(hero, "pointermove", (event) => {
      if (!fine.matches || event.pointerType === "touch") return;
      const rect = hero.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width - 0.5;
      pointerY = (event.clientY - rect.top) / rect.height - 0.5;
      wake();
    });
    listen(hero, "pointerleave", () => {
      pointerX = 0;
      pointerY = 0;
      wake();
    });
    listen(pause, "click", () => {
      paused = !paused;
      pause.textContent = paused ? "继续自转" : "暂停自转";
      pause.setAttribute("aria-pressed", String(paused));
      wake();
    });
    for (const button of controls.querySelectorAll("[data-moon-turn]")) {
      listen(button, "click", () => {
        rotation += Number(button.dataset.moonTurn) * 0.25;
        wake();
      });
    }
    listen(document, "visibilitychange", () => {
      if (document.hidden) stop();
      else wake();
    });
    resizeObserver = new ResizeObserver(size);
    resizeObserver.observe(host);
    visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
      else stop();
    });
    visibilityObserver.observe(hero);
    render();
    host.classList.add("moon-ready");
    pause.textContent = "暂停自转";
    pause.setAttribute("aria-pressed", "false");
    controls.hidden = false;
    wake();
    return dispose;
  } catch (error) {
    dispose();
    throw error;
  }
}
