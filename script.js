(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  function initMobileMenu() {
    const button = document.querySelector(".nav__menu-toggle");
    const menu = document.getElementById("mobileMenu");
    if (!button || !menu) return;
    const setOpen = (open, returnFocus = false) => {
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "关闭导航菜单" : "打开导航菜单");
      menu.hidden = !open;
      document.body.classList.toggle("menu-is-open", open);
      document.querySelector("main").inert = open;
      document.querySelector("footer").inert = open;
      if (open) menu.querySelector("a").focus();
      else if (returnFocus) button.focus();
    };
    button.addEventListener("click", () => setOpen(menu.hidden));
    menu.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => {
        setOpen(false);
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }
      }),
    );
    document.addEventListener("keydown", (event) => {
      if (menu.hidden) return;
      if (event.key === "Escape") {
        setOpen(false, true);
        return;
      }
      if (event.key === "Tab") {
        const items = [button, ...menu.querySelectorAll("a")];
        const first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    window
      .matchMedia("(min-width: 768px)")
      .addEventListener("change", (event) => {
        if (event.matches && !menu.hidden) setOpen(false);
      });
  }
  initMobileMenu();
  if (!reduced.matches && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll("[data-reveal]").forEach((element) => {
      element.classList.add("reveal-pending");
      observer.observe(element);
    });
    reduced.addEventListener("change", (event) => {
      if (event.matches) {
        document
          .querySelectorAll(".reveal-pending")
          .forEach((el) => el.classList.add("is-visible"));
        observer.disconnect();
      }
    });
  }
  const copy = document.getElementById("copyWechat");
  if (copy)
    copy.addEventListener("click", async () => {
      const status = document.getElementById("copyStatus");
      try {
        await navigator.clipboard.writeText(copy.dataset.wechat);
        status.textContent = "已复制微信号，打开微信搜索添加。";
      } catch {
        status.textContent = `请长按或选中微信号复制：${copy.dataset.wechat}`;
      }
    });
})();
