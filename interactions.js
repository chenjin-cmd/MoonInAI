const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const fine = matchMedia("(hover: hover) and (pointer: fine)");
const hero = document.querySelector("#hero");
const stage = document.querySelector(".moon-stage");
const saveData = navigator.connection?.saveData;
const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
let destroyMoon,
  loading = false,
  failed = false;

async function syncMoon() {
  if (!stage) return;
  if (reduced.matches || saveData || lowMemory) {
    destroyMoon?.();
    destroyMoon = undefined;
    stage.dataset.moonState = "static";
    return;
  }
  if (destroyMoon || loading || failed) return;
  loading = true;
  stage.dataset.moonState = "loading";
  try {
    const { mountMoon } = await import("./moon-scene.js?v=motion-3");
    // A preference may have changed while the module was downloading.
    if (reduced.matches) return;
    destroyMoon = await mountMoon(stage, () => {
      failed = true;
      destroyMoon = undefined;
      stage.dataset.moonState = "static";
    });
    if (reduced.matches) {
      destroyMoon();
      destroyMoon = undefined;
    }
    stage.dataset.moonState = reduced.matches ? "static" : "interactive";
  } catch {
    failed = true;
    stage.dataset.moonState = "static";
  } finally {
    loading = false;
    if (reduced.matches) stage.dataset.moonState = "static";
  }
}
reduced.addEventListener("change", syncMoon);
syncMoon();

// Scroll is never intercepted. Only transforms and opacity follow its progress.
let scrollFrame = 0;
const navLinks = [
  ...document.querySelectorAll(".desktop-nav a, .mobile-menu a"),
];
const sections = [...document.querySelectorAll("main > section[id]")];
function updateScroll() {
  scrollFrame = 0;
  const y = window.scrollY;
  const progress = Math.max(0, Math.min(1, y / Math.max(1, hero.offsetHeight)));
  const motion = reduced.matches ? 0 : progress;
  hero.style.setProperty("--moon-y", `${-motion * 110}px`);
  hero.style.setProperty("--moon-scale", String(1 + motion * 0.15));
  hero.style.setProperty(
    "--hero-opacity",
    String(Math.max(0, 1 - motion * 1.6)),
  );
  hero.style.setProperty("--hero-lift", `${-motion * 45}px`);
  document.querySelector(".nav").classList.toggle("nav-scrolled", y > 80);
  let current = "hero";
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= innerHeight * 0.38)
      current = section.id;
  }
  for (const link of navLinks) {
    if (link.hash === `#${current}`)
      link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}
function queueScroll() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
}
window.addEventListener("scroll", queueScroll, { passive: true });
window.addEventListener("resize", queueScroll);
reduced.addEventListener("change", queueScroll);
updateScroll();

// Each pointer effect batches work to one frame and resets on exit/preferences.
const pointerTargets = [];
function pointerEffect(element, draw, reset) {
  let frame = 0,
    point;
  const clear = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    reset();
  };
  element.addEventListener("pointermove", (event) => {
    if (reduced.matches || !fine.matches || event.pointerType === "touch")
      return;
    point = { x: event.clientX, y: event.clientY };
    if (!frame)
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (reduced.matches || !fine.matches) return;
        const rect = element.getBoundingClientRect();
        draw(
          (point.x - rect.left) / rect.width,
          (point.y - rect.top) / rect.height,
        );
      });
  });
  element.addEventListener("pointerleave", clear);
  element.addEventListener("pointercancel", clear);
  pointerTargets.push(clear);
}
for (const element of document.querySelectorAll(".portrait, .project-art")) {
  pointerEffect(
    element,
    (x, y) => {
      element.style.setProperty("--tilt-x", `${(0.5 - y) * 7}deg`);
      element.style.setProperty("--tilt-y", `${(x - 0.5) * 9}deg`);
      element.style.setProperty("--shine-x", `${x * 100}%`);
      element.style.setProperty("--shine-y", `${y * 100}%`);
      element.classList.add("pointer-active");
    },
    () => {
      element.style.setProperty("--tilt-x", "0deg");
      element.style.setProperty("--tilt-y", "0deg");
      element.classList.remove("pointer-active");
    },
  );
}
for (const element of document.querySelectorAll(".service-row")) {
  pointerEffect(
    element,
    (x, y) => {
      element.style.setProperty("--spot-x", `${x * 100}%`);
      element.style.setProperty("--spot-y", `${y * 100}%`);
      element.classList.add("pointer-active");
    },
    () => element.classList.remove("pointer-active"),
  );
}
for (const element of document.querySelectorAll(".button, .nav-contact")) {
  pointerEffect(
    element,
    (x, y) => {
      element.style.setProperty("--magnet-x", `${(x - 0.5) * 9}px`);
      element.style.setProperty("--magnet-y", `${(y - 0.5) * 7}px`);
    },
    () => {
      element.style.setProperty("--magnet-x", "0px");
      element.style.setProperty("--magnet-y", "0px");
    },
  );
}
function resetEffects() {
  pointerTargets.forEach((reset) => reset());
}
reduced.addEventListener("change", resetEffects);
fine.addEventListener("change", resetEffects);
window.addEventListener("pagehide", () => {
  destroyMoon?.();
  destroyMoon = undefined;
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) syncMoon();
});
