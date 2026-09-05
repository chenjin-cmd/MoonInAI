import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = readFileSync(
  new URL("../moon-scene.js", import.meta.url),
  "utf8",
)
  .replace(/import \* as THREE from [^;]+;/, "const THREE = fakeThree;")
  .replace("export async function mountMoon", "async function mountMoon")
  .replace("import.meta.url", '"http://localhost/moon-scene.js"');

function fixture({ textureFailure = false, webglFailure = false } = {}) {
  class Element extends EventTarget {
    constructor() {
      super();
      this.attributes = {};
      this.children = [];
      this.classList = { add() {}, remove() {} };
      this.clientWidth = 800;
      this.clientHeight = 800;
    }
    setAttribute(key, value) {
      this.attributes[key] = value;
    }
    append(child) {
      this.children.push(child);
    }
    remove() {
      this.removed = true;
    }
    hasPointerCapture() {
      return false;
    }
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 800, height: 800 };
    }
  }
  const state = {
    renders: 0,
    disposals: 0,
    textureDisposals: 0,
    ratios: [],
    failures: 0,
  };
  const host = new Element(),
    hero = new Element(),
    controls = new Element();
  const pause = new Element(),
    left = new Element(),
    right = new Element();
  left.dataset = { moonTurn: "-1" };
  right.dataset = { moonTurn: "1" };
  controls.hidden = true;
  controls.querySelector = () => pause;
  controls.querySelectorAll = () => [left, right];
  host.closest = () => hero;
  hero.querySelector = () => controls;
  const document = new Element();
  document.hidden = false;
  const frames = new Map();
  let frameId = 0,
    now = 0;
  const observers = [];
  class Observer {
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }
    observe(target) {
      this.target = target;
    }
    disconnect() {
      this.disconnected = true;
    }
  }
  class Renderer {
    constructor() {
      if (webglFailure) throw new Error("WebGL unavailable");
      this.domElement = new Element();
      state.canvas = this.domElement;
      this.capabilities = { getMaxAnisotropy: () => 4 };
    }
    setPixelRatio(value) {
      state.ratios.push(value);
    }
    setClearColor() {}
    setSize() {}
    render() {
      state.renders++;
    }
    dispose() {
      state.disposals++;
    }
  }
  class Disposable {
    dispose() {}
  }
  class Object3D {
    constructor() {
      this.position = { set() {} };
      this.rotation = { set() {} };
    }
    add() {}
    lookAt() {}
    updateProjectionMatrix() {}
  }
  const context = vm.createContext({
    AbortController,
    URL,
    console,
    document,
    devicePixelRatio: 2,
    matchMedia: (query) => ({ matches: query.includes("pointer: fine") }),
    requestAnimationFrame: (callback) => {
      frames.set(++frameId, callback);
      return frameId;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
    ResizeObserver: Observer,
    IntersectionObserver: Observer,
    fakeThree: {
      WebGLRenderer: Renderer,
      PerspectiveCamera: Object3D,
      Scene: Object3D,
      SphereGeometry: Disposable,
      MeshStandardMaterial: Disposable,
      Mesh: Object3D,
      AmbientLight: Object3D,
      DirectionalLight: Object3D,
      SRGBColorSpace: "srgb",
      TextureLoader: class {
        async loadAsync() {
          if (textureFailure) throw new Error("Texture unavailable");
          return {
            dispose() {
              state.textureDisposals++;
            },
          };
        }
      },
    },
  });
  vm.runInContext(source, context);
  return {
    state,
    controls,
    pause,
    left,
    right,
    document,
    observers,
    frames,
    mount: () => context.mountMoon(host, () => state.failures++),
    step: (elapsed = 16) => {
      now += elapsed;
      const current = [...frames.values()];
      frames.clear();
      current.forEach((callback) => callback(now));
    },
  };
}

test("pause stops continuous rendering; rotate renders on demand; disposal is idempotent", async () => {
  const f = fixture();
  const dispose = await f.mount();
  assert.equal(f.controls.hidden, false);
  f.step();
  f.step();
  assert.ok(f.frames.size > 0);
  f.pause.dispatchEvent(new Event("click"));
  f.step();
  assert.equal(f.pause.attributes["aria-pressed"], "true");
  assert.equal(f.frames.size, 0);
  const before = f.state.renders;
  f.right.dispatchEvent(new Event("click"));
  f.step();
  assert.equal(f.state.renders, before + 1);
  assert.equal(f.frames.size, 0);
  dispose();
  dispose();
  assert.equal(f.state.disposals, 1);
  assert.equal(f.state.textureDisposals, 1);
  assert.equal(f.controls.hidden, true);
  assert.ok(f.observers.every((observer) => observer.disconnected));
});

test("offscreen and hidden-tab rendering stops and resumes", async () => {
  const f = fixture();
  const dispose = await f.mount();
  const visibility = f.observers[1];
  visibility.callback([{ isIntersecting: false }]);
  assert.equal(f.frames.size, 0);
  visibility.callback([{ isIntersecting: true }]);
  assert.equal(f.frames.size, 1);
  f.document.hidden = true;
  f.document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(f.frames.size, 0);
  f.document.hidden = false;
  f.document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(f.frames.size, 1);
  dispose();
});

test("context loss releases resources and restores static mode", async () => {
  const f = fixture();
  await f.mount();
  f.state.canvas.dispatchEvent(
    new Event("webglcontextlost", { cancelable: true }),
  );
  assert.equal(f.state.failures, 1);
  assert.equal(f.controls.hidden, true);
  assert.equal(f.frames.size, 0);
  assert.equal(f.state.disposals, 1);
});

test("texture and WebGL failures leave static controls hidden", async () => {
  for (const options of [{ textureFailure: true }, { webglFailure: true }]) {
    const f = fixture(options);
    await assert.rejects(f.mount());
    assert.equal(f.controls.hidden, true);
    assert.equal(f.frames.size, 0);
    if (options.textureFailure) assert.equal(f.state.disposals, 1);
  }
});

test("sustained low frame rate reduces resolution, then falls back", async () => {
  const f = fixture();
  await f.mount();
  for (let i = 0; i < 200; i++) f.step(100);
  assert.ok(f.state.ratios.includes(0.8));
  assert.equal(f.state.failures, 1);
  assert.equal(f.frames.size, 0);
});

const interactions = readFileSync(
  new URL("../interactions.js", import.meta.url),
  "utf8",
).replace(/await import\([^)]*\)/, "await loadMoonModule()");

function motionPreferenceFixture(initialReduced) {
  const media = new EventTarget();
  media.matches = initialReduced;
  const fine = new EventTarget();
  fine.matches = true;
  const stage = { dataset: {} },
    style = { setProperty() {} };
  const hero = { offsetHeight: 900, style },
    nav = { classList: { toggle() {} } };
  const document = {
    querySelector: (selector) =>
      selector === "#hero" ? hero : selector === ".moon-stage" ? stage : nav,
    querySelectorAll: () => [],
  };
  const window = new EventTarget();
  window.scrollY = 0;
  const state = { imports: 0, mounts: 0, disposals: 0 };
  const context = vm.createContext({
    document,
    window,
    navigator: {},
    innerHeight: 900,
    matchMedia: (query) => (query.includes("reduced") ? media : fine),
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
    loadMoonModule: async () => {
      state.imports++;
      return {
        mountMoon: async () => {
          state.mounts++;
          return () => state.disposals++;
        },
      };
    },
  });
  vm.runInContext(interactions, context);
  return { media, state, stage };
}

test("reduced motion avoids loading 3D; preference changes dispose and restore it", async () => {
  const f = motionPreferenceFixture(true);
  assert.equal(f.state.imports, 0);
  assert.equal(f.stage.dataset.moonState, "static");
  f.media.matches = false;
  f.media.dispatchEvent(new Event("change"));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(f.state.mounts, 1);
  assert.equal(f.stage.dataset.moonState, "interactive");
  f.media.matches = true;
  f.media.dispatchEvent(new Event("change"));
  assert.equal(f.state.disposals, 1);
  assert.equal(f.stage.dataset.moonState, "static");
});
