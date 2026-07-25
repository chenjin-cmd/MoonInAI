/* ════════════════════════════════════════════
   MoonInAI — 动效脚本（sac-ai 复刻版）
   入场动画 / 信号条波动 / 终端编译 / 滚动激活
   ════════════════════════════════════════════ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- 01 入场动画：data-reveal + is-ready ---------- */
  function initReveal() {
    if (prefersReduced) {
      document.querySelectorAll("[data-reveal]").forEach(function (el) {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      document.body.classList.add("is-ready");
      return;
    }

    // 立即添加 is-ready，让 CSS 的过渡生效
    document.body.classList.add("is-ready");

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-reveal]").forEach(function (el) {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    // 初始时所有 data-reveal 元素先隐藏
    var reveals = document.querySelectorAll("[data-reveal]");
    reveals.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      el.style.transition = "opacity .8s cubic-bezier(.22,.61,.36,1), transform .8s cubic-bezier(.22,.61,.36,1)";
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "none";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    reveals.forEach(function (el) {
      io.observe(el);
    });

    // 兜底：首屏元素如果已经在视口内，立即显示
    setTimeout(function () {
      reveals.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
    }, 100);
  }

  /* ---------- 02 信号条波动 ---------- */
  function initSignalBars() {
    if (prefersReduced) return;
    var bars = document.querySelectorAll(".srow__bars");
    if (!bars.length) return;

    setInterval(function () {
      bars.forEach(function (bar) {
        var items = bar.querySelectorAll("i");
        items.forEach(function (el, i) {
          var base = 32 + i * 11;
          var wave = Math.sin(Date.now() * 0.003 + i * 0.9) * 8;
          var noise = (Math.random() - 0.5) * 5;
          var h = Math.max(15, base + wave + noise);
          el.style.height = h.toFixed(1) + "%";
        });
      });
    }, 120);
  }

  /* ---------- 03 终端逐行打字 + 编译进度 ---------- */
  function initTerminal() {
    var terminal = document.querySelector("[data-build]");
    if (!terminal) return;

    var code = terminal.querySelector("[data-typed]");
    if (code) {
      if (prefersReduced) {
        code.style.opacity = "1";
      } else {
        var raw = code.textContent.trim();
        var lines = raw.split("\n");
        code.innerHTML = lines
          .map(function (l) {
            return '<span class="typed-line">' + l + "</span>";
          })
          .join("");

        if ("IntersectionObserver" in window) {
          var io = new IntersectionObserver(
            function (entries) {
              entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var lineEls = code.querySelectorAll(".typed-line");
                lineEls.forEach(function (line, i) {
                  setTimeout(function () {
                    line.classList.add("is-typed");
                  }, i * 180);
                });
                io.unobserve(entry.target);
              });
            },
            { threshold: 0.3 }
          );
          io.observe(terminal);
        } else {
          code.querySelectorAll(".typed-line").forEach(function (line) {
            line.classList.add("is-typed");
          });
        }
      }
    }

    var progressBar = terminal.querySelector("[data-progress-bar]");
    var progressNum = terminal.querySelector("[data-progress-num]");
    var progressMeasure = document.querySelector("[data-progress-measure]");
    var compileLabel = terminal.querySelector("[data-compile-label]");

    if (prefersReduced) {
      if (progressBar) progressBar.style.width = "83%";
      if (progressNum) progressNum.textContent = "83%";
      if (progressMeasure) progressMeasure.textContent = "83%";
      if (compileLabel) compileLabel.textContent = "ready.";
      return;
    }

    if (!progressBar) return;

    if (!("IntersectionObserver" in window)) {
      progressBar.style.width = "83%";
      if (progressNum) progressNum.textContent = "83%";
      if (progressMeasure) progressMeasure.textContent = "83%";
      if (compileLabel) compileLabel.textContent = "ready.";
      return;
    }

    var io2 = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var target = 83;
          var duration = 2200;
          var startTime = performance.now();

          function step(now) {
            var p = Math.min(1, (now - startTime) / duration);
            var eased = 1 - Math.pow(1 - p, 3);
            var val = Math.round(target * eased);
            progressBar.style.width = val + "%";
            if (progressNum) progressNum.textContent = val + "%";
            if (progressMeasure) progressMeasure.textContent = val + "%";
            if (p < 1) {
              requestAnimationFrame(step);
            } else {
              if (compileLabel) compileLabel.textContent = "ready.";
            }
          }
          requestAnimationFrame(step);
          io2.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );
    io2.observe(terminal);
  }

  /* ---------- 04 导航高亮当前章节 ---------- */
  function initNavHighlight() {
    var links = document.querySelectorAll(".nav__links a[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) return;

    var sections = {};
    links.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      if (sec) sections[id] = { link: link, sec: sec };
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            links.forEach(function (l) { l.classList.remove("is-active"); });
            if (sections[id]) sections[id].link.classList.add("is-active");
          }
        });
      },
      { threshold: 0.3, rootMargin: "-20% 0px -40% 0px" }
    );

    Object.keys(sections).forEach(function (id) {
      io.observe(sections[id].sec);
    });
  }

  /* ---------- 05 移动端全屏导航 ---------- */
  function initMobileMenu() {
    var toggle = document.querySelector(".nav__menu-toggle");
    var menu = document.getElementById("mobileMenu");
    if (!toggle || !menu) return;

    var close = menu.querySelector(".mobile-menu__close");
    var links = menu.querySelectorAll("a");

    function setOpen(open, restoreFocus) {
      document.documentElement.classList.toggle("menu-is-open", open);
      document.body.classList.toggle("menu-is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));

      if (open) {
        links[0].focus();
      } else if (restoreFocus) {
        toggle.focus();
      }
    }

    toggle.addEventListener("click", function () { setOpen(true, false); });
    close.addEventListener("click", function () { setOpen(false, true); });
    links.forEach(function (link) {
      link.addEventListener("click", function () { setOpen(false, false); });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false, true);
      }
    });
  }

  /* ---------- 06 录制时间码跳动 ---------- */
  function initRecTime() {
    if (prefersReduced) return;
    var rec = document.querySelector(".shoot__rec");
    if (!rec) return;
    var start = Date.now();
    setInterval(function () {
      var elapsed = Math.floor((Date.now() - start) / 1000);
      var h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      var m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
      var s = String(elapsed % 60).padStart(2, "0");
      rec.innerHTML = "<i></i> RUN · " + h + ":" + m + ":" + s;
    }, 1000);
  }

  /* ---------- 07 AI 神经核心可视化 ---------- */
  function initNeuroCore() {
    var svg = document.querySelector(".neuro__svg");
    if (!svg) return;

    var ticksGroup = document.getElementById("neuroTicks");
    var nodesGroup = document.getElementById("neuroNodes");
    var linksGroup = document.getElementById("neuroLinks");
    var canvas = document.getElementById("neuroCanvas");
    if (!ticksGroup || !nodesGroup || !linksGroup) return;

    /* --- 生成外圈刻度环（60 个刻度，每 5 个为主刻度） --- */
    var cx = 200, cy = 200;
    var rOuter = 150, rMinor = 144, rMajor = 138;
    for (var i = 0; i < 60; i++) {
      var angle = (i * 6 - 90) * Math.PI / 180;
      var isMajor = i % 5 === 0;
      var r1 = isMajor ? rMajor : rMinor;
      var x1 = cx + Math.cos(angle) * r1;
      var y1 = cy + Math.sin(angle) * r1;
      var x2 = cx + Math.cos(angle) * rOuter;
      var y2 = cy + Math.sin(angle) * rOuter;
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1.toFixed(1));
      line.setAttribute("y1", y1.toFixed(1));
      line.setAttribute("x2", x2.toFixed(1));
      line.setAttribute("y2", y2.toFixed(1));
      if (isMajor) line.setAttribute("class", "major");
      ticksGroup.appendChild(line);
    }

    /* --- 关键词节点 --- */
    var keywords = [
      { zh: "AI 系统", en: "SYSTEM", angle: -90, r: 110 },
      { zh: "企业", en: "ENTERPRISE", angle: -45, r: 120 },
      { zh: "副业", en: "SIDE", angle: 0, r: 110 },
      { zh: "增长", en: "GROWTH", angle: 45, r: 120 },
      { zh: "学习", en: "LEARN", angle: 90, r: 110 },
      { zh: "培训", en: "TRAINING", angle: 135, r: 120 },
      { zh: "陪跑", en: "ITERATE", angle: 180, r: 110 },
      { zh: "SOP", en: "WORKFLOW", angle: 225, r: 120 }
    ];

    var nodePositions = [];
    keywords.forEach(function (kw, i) {
      var rad = kw.angle * Math.PI / 180;
      var x = cx + Math.cos(rad) * kw.r;
      var y = cy + Math.sin(rad) * kw.r;
      nodePositions.push({ x: x, y: y, baseX: x, baseY: y, idx: i });

      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("data-idx", i);

      var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", x.toFixed(1));
      circle.setAttribute("cy", y.toFixed(1));
      circle.setAttribute("r", "4");
      g.appendChild(circle);

      var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", x.toFixed(1));
      text.setAttribute("y", (y - 10).toFixed(1));
      text.setAttribute("text-anchor", "middle");
      text.textContent = kw.zh;
      g.appendChild(text);

      var textEn = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textEn.setAttribute("class", "node-en");
      textEn.setAttribute("x", x.toFixed(1));
      textEn.setAttribute("y", (y + 16).toFixed(1));
      textEn.setAttribute("text-anchor", "middle");
      textEn.textContent = kw.en;
      g.appendChild(textEn);

      nodesGroup.appendChild(g);
    });

    /* --- 连线（中心 → 每个节点 + 相邻节点） --- */
    function drawLinks() {
      linksGroup.innerHTML = "";
      // 中心到节点
      nodePositions.forEach(function (p) {
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", cx);
        line.setAttribute("y1", cy);
        line.setAttribute("x2", p.x.toFixed(1));
        line.setAttribute("y2", p.y.toFixed(1));
        linksGroup.appendChild(line);
      });
      // 相邻节点
      for (var i = 0; i < nodePositions.length; i++) {
        var a = nodePositions[i];
        var b = nodePositions[(i + 1) % nodePositions.length];
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", a.x.toFixed(1));
        line.setAttribute("y1", a.y.toFixed(1));
        line.setAttribute("x2", b.x.toFixed(1));
        line.setAttribute("y2", b.y.toFixed(1));
        line.setAttribute("opacity", "0.15");
        linksGroup.appendChild(line);
      }
    }
    drawLinks();

    /* --- 节点漂浮动画 --- */
    if (!prefersReduced) {
      var startTime = Date.now();
      function animateNodes() {
        var t = (Date.now() - startTime) * 0.001;
        nodePositions.forEach(function (p, i) {
          var offsetX = Math.sin(t * 0.8 + i * 0.7) * 4;
          var offsetY = Math.cos(t * 0.6 + i * 0.9) * 4;
          p.x = p.baseX + offsetX;
          p.y = p.baseY + offsetY;

          var g = nodesGroup.children[i];
          var circle = g.querySelector("circle");
          var texts = g.querySelectorAll("text");
          circle.setAttribute("cx", p.x.toFixed(1));
          circle.setAttribute("cy", p.y.toFixed(1));
          texts[0].setAttribute("x", p.x.toFixed(1));
          texts[0].setAttribute("y", (p.y - 10).toFixed(1));
          texts[1].setAttribute("x", p.x.toFixed(1));
          texts[1].setAttribute("y", (p.y + 16).toFixed(1));
        });
        drawLinks();
        requestAnimationFrame(animateNodes);
      }
      requestAnimationFrame(animateNodes);
    }

    /* --- Canvas 背景粒子（数据流） --- */
    if (canvas && !prefersReduced) {
      var ctx = canvas.getContext("2d");
      var dpr = window.devicePixelRatio || 1;
      function resize() {
        var rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }
      resize();
      window.addEventListener("resize", resize);

      var particles = [];
      var chars = ["0", "1", "·", "|", "─", "AI", "+", "-", "/", "\\"];
      for (var i = 0; i < 40; i++) {
        var rect = canvas.getBoundingClientRect();
        particles.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          char: chars[Math.floor(Math.random() * chars.length)],
          size: 8 + Math.random() * 6,
          opacity: 0.05 + Math.random() * 0.15
        });
      }

      function drawParticles() {
        var rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        particles.forEach(function (p) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = rect.width;
          if (p.x > rect.width) p.x = 0;
          if (p.y < 0) p.y = rect.height;
          if (p.y > rect.height) p.y = 0;

          ctx.font = p.size + "px " + "ui-monospace, monospace";
          ctx.fillStyle = "rgba(26, 23, 20, " + p.opacity + ")";
          ctx.fillText(p.char, p.x, p.y);
        });
        requestAnimationFrame(drawParticles);
      }
      drawParticles();
    }

    /* --- HUD 数据实时跳动 --- */
    if (!prefersReduced) {
      var signalEl = document.querySelector("[data-neuro-signal]");
      var latencyEl = document.querySelector("[data-neuro-latency]");
      setInterval(function () {
        if (signalEl) {
          var s = 78 + Math.floor(Math.random() * 18);
          signalEl.textContent = s + "%";
        }
        if (latencyEl) {
          var l = 8 + Math.floor(Math.random() * 14);
          latencyEl.textContent = l + "ms";
        }
      }, 1500);
    }
  }

  /* ---------- 启动 ---------- */
  function boot() {
    initMobileMenu();
    initReveal();
    initSignalBars();
    initTerminal();
    initNavHighlight();
    initRecTime();
    initNeuroCore();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
