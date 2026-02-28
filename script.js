// script.js (ESM) — CAM Home ALL FINAL
// ✅ One-init, no duplicate pins
// ✅ Lenis smooth scroll (stable)
// ✅ Stage pinned: Hero -> Crossfade -> Iterate (Iterate driven, no extra pin)
// ✅ Pinned mini-stages (Projects/Packages/Book/Reviews) with snap beats
// ✅ Global reveals + parallax + hover tilt
// ✅ Reviews slider drag + dots + arrows
// ✅ Single footer reveal (no duplicates)

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

// Expose for loaders
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------------------------
  // 0) ONE INIT GUARD
  // -------------------------------------------------------
  if (window.__CAM_HOME_ALL_FINAL__) return;
  window.__CAM_HOME_ALL_FINAL__ = true;

  gsap.registerPlugin(ScrollTrigger);

  // -------------------------------------------------------
  // 1) TUNABLES
  // -------------------------------------------------------
  const HERO_SCROLL_VH = 280;
  const XFADE_SCROLL_VH = 60;
  const ITER_SCROLL_VH = 200;
  const HERO_FRAME_COUNT = 100;

  const ITERATE_SNAP = true;
  const PINNED_SECTIONS_SNAP = true; // mini-stages snap beats

  const isDesktop = () => window.matchMedia("(min-width: 861px)").matches;
  const isBigDesktop = () => window.matchMedia("(min-width: 981px)").matches;
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const vhToPx = (vh) => (vh / 100) * innerHeight;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  // -------------------------------------------------------
  // 2) DEV HARD CLEANUP (optional, keeps reload clean)
  // -------------------------------------------------------
  try {
    ScrollTrigger.getAll().forEach((st) => st.kill(true));
    gsap.globalTimeline.clear();
    gsap.killTweensOf("*");
  } catch (_) {}

  // Remove leftover pin spacers from hot reload / double init
  document.querySelectorAll(".pin-spacer").forEach((spacer) => {
    const child = spacer.firstElementChild;
    if (child) spacer.replaceWith(child);
  });

  // -------------------------------------------------------
  // 3) FOOTER YEAR
  // -------------------------------------------------------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // -------------------------------------------------------
  // 4) LENIS (stable integration)
  // -------------------------------------------------------
  const lenis = new Lenis({
    smooth: !reduceMotion(),
    lerp: 0.1,
    wheelMultiplier: 1.3,
    smoothTouch: false, // Explicit disable
    touchMultiplier: 0, // Fallback safety
  });

  // Expose Lenis
  window.lenis = lenis;

  // Drive Lenis from RAF + sync ScrollTrigger
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  lenis.on("scroll", () => ScrollTrigger.update());
  gsap.ticker.lagSmoothing(0);

  // -------------------------------------------------------
  // 5) SMOOTH ANCHORS (# links)
  // -------------------------------------------------------
  initSmoothAnchors();

  // -------------------------------------------------------
  // 6) NAV / MEGA / DRAWER
  // -------------------------------------------------------
  initNavActive();
  initMegaMenu();
  initMobileDrawer();

  // -------------------------------------------------------
  // 7) STAGE PIN: HERO -> XFADE -> ITERATE (single pin)
  // -------------------------------------------------------
  initStageHeroIterate();

  // -------------------------------------------------------
  // 8) GLOBAL EFFECTS (ONE reveal system)
  // -------------------------------------------------------
  initGlobalReveals();
  initGlobalParallax();
  initGlobalHoverTilt();

  // -------------------------------------------------------
  // 9) PINNED MINI-STAGES (Projects/Packages/Book/Reviews)
  // IMPORTANT: These pin the whole sections, so DO NOT pin left column separately.
  // -------------------------------------------------------
  initPinnedSectionsSnapped();

  // -------------------------------------------------------
  // 10) REVIEWS SLIDER (drag + arrows + dots)
  // -------------------------------------------------------
  initReviewsSlider();

  // -------------------------------------------------------
  // 11) FOOTER REVEAL (single)
  // -------------------------------------------------------
  initFooterReveal();

  // -------------------------------------------------------
  // 12) REFRESH ONCE (and on resize)
  // -------------------------------------------------------
  requestAnimationFrame(() => ScrollTrigger.refresh());
  window.addEventListener("resize", () => requestAnimationFrame(() => ScrollTrigger.refresh()));

  // =======================================================
  // FUNCTIONS
  // =======================================================

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (!id || id === "#") return;

        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();

        // close drawer if open
        const drawer = document.querySelector(".drawer");
        if (drawer?.classList.contains("open")) {
          drawer.classList.remove("open");
          drawer.setAttribute("aria-hidden", "true");
          document.body.style.overflow = "";
          document.querySelector(".hamburger")?.setAttribute("aria-expanded", "false");
        }

        lenis.scrollTo(target, {
          offset: -86,
          duration: 1.0,
          easing: (t) => 1 - Math.pow(1 - t, 3),
        });

        history.pushState(null, "", id);
      });
    });
  }

  // -------------------------
  // NAV active highlight
  // -------------------------
  function initNavActive() {
    const navLinks = Array.from(document.querySelectorAll(".nav-left .nav-link")).filter((a) =>
      a.getAttribute("href")?.startsWith("#")
    );

    const setActive = (id) => {
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
    };

    const ids = ["hero", "iterate", "projects", "", "book", "reviews"];
    ids.forEach((id) => {
      const sec = document.getElementById(id);
      if (!sec) return;

      ScrollTrigger.create({
        id: `nav-${id}`,
        trigger: sec,
        start: "top 45%",
        end: "bottom 45%",
        onEnter: () => setActive(id),
        onEnterBack: () => setActive(id),
      });
    });
  }

  // -------------------------
  // Mega menu
  // -------------------------
  function initMegaMenu() {
    const nav = document.querySelector(".nav");
    const mega = document.querySelector(".mega");
    const megaTrigger = document.querySelector(".mega-trigger");
    if (!nav || !mega || !megaTrigger) return;

    let megaTL = null;
    let megaOpen = false;
    let megaTimer;

    const buildMegaTL = () => {
      const inner = mega.querySelector(".mega-inner");
      const cols = mega.querySelectorAll(".mega-col");
      const links = mega.querySelectorAll(".mega-col a");
      const preview = mega.querySelector(".mega-preview");

      gsap.set(mega, { autoAlpha: 0, y: -12 });
      if (inner) gsap.set(inner, { y: -8 });
      gsap.set(cols, { autoAlpha: 0, y: 14 });
      gsap.set(links, { autoAlpha: 0, y: 10 });
      if (preview) gsap.set(preview, { autoAlpha: 0, y: 10 });

      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      tl.to(mega, { autoAlpha: 1, y: 0, duration: 0.22 })
        .to(inner, { y: 0, duration: 0.22 }, "<")
        .to(cols, { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.06 }, "-=0.08")
        .to(links, { autoAlpha: 1, y: 0, duration: 0.24, stagger: 0.02 }, "-=0.20");
      if (preview) tl.to(preview, { autoAlpha: 1, y: 0, duration: 0.22 }, "-=0.22");
      return tl;
    };

    const openMega = () => {
      if (!isDesktop()) return;
      if (megaOpen) return;

      megaOpen = true;
      nav.classList.add("mega-open");
      mega.setAttribute("aria-hidden", "false");
      megaTrigger.setAttribute("aria-expanded", "true");

      if (!megaTL) megaTL = buildMegaTL();
      megaTL.play(0);
    };

    const closeMega = () => {
      if (!megaOpen) return;
      megaOpen = false;

      nav.classList.remove("mega-open");
      mega.setAttribute("aria-hidden", "true");
      megaTrigger.setAttribute("aria-expanded", "false");

      megaTL?.reverse();
    };

    megaTrigger.addEventListener("mouseenter", () => {
      clearTimeout(megaTimer);
      openMega();
    });

    mega.addEventListener("mouseenter", () => {
      clearTimeout(megaTimer);
      openMega();
    });

    nav.addEventListener("mouseleave", () => {
      clearTimeout(megaTimer);
      megaTimer = setTimeout(closeMega, 140);
    });

    megaTrigger.addEventListener("focus", openMega);
    nav.addEventListener("focusout", (e) => {
      if (!nav.contains(e.relatedTarget)) closeMega();
    });

    window.addEventListener("scroll", () => megaOpen && closeMega(), { passive: true });
    document.addEventListener("keydown", (e) => e.key === "Escape" && closeMega());

    // preview swap
    const megaStepBadge = document.getElementById("megaStepBadge");
    const megaStepTitle = document.getElementById("megaStepTitle");
    const megaPreviewImg = document.getElementById("megaPreviewImg");
    const megaDotsWrap = document.getElementById("megaDots");

    const setMegaDots = (stepStr) => {
      if (!megaDotsWrap) return;
      const idx = Math.max(0, Math.min(3, parseInt(stepStr, 10) - 1));
      megaDotsWrap.querySelectorAll(".mdot").forEach((d, i) => d.classList.toggle("active", i === idx));
    };

    const swapPreview = (stepStr, titleStr, imgSrc) => {
      if (!megaStepBadge || !megaStepTitle || !megaPreviewImg) return;

      megaStepBadge.textContent = String(stepStr).padStart(2, "0");
      megaStepTitle.textContent = titleStr || "Preview";
      setMegaDots(stepStr);

      if (!imgSrc) return;

      gsap.to(megaPreviewImg, {
        autoAlpha: 0,
        scale: 1.02,
        duration: 0.18,
        ease: "power2.out",
        onComplete: () => {
          megaPreviewImg.src = imgSrc;
          gsap.fromTo(
            megaPreviewImg,
            { autoAlpha: 0, scale: 1.02 },
            { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power3.out" }
          );
        },
      });
    };

    document.querySelectorAll(".mega-col a, .mega-col h4").forEach((el) => {
      const activate = () => {
        const stepStr = el.getAttribute("data-step") || "01";
        const titleStr = el.getAttribute("data-title") || el.textContent.trim();
        const imgSrc = el.getAttribute("data-img");
        swapPreview(stepStr, titleStr, imgSrc);
      };
      el.addEventListener("mouseenter", activate);
      el.addEventListener("focus", activate);
    });
  }

  // -------------------------
  // Mobile drawer
  // -------------------------
  function initMobileDrawer() {
    const hamburger = document.querySelector(".hamburger");
    const drawer = document.querySelector(".drawer");
    const drawerClose = document.querySelector(".drawer-close");

    const openDrawer = () => {
      if (!drawer || !hamburger) return;
      drawer.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
      hamburger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    };

    const closeDrawer = () => {
      if (!drawer || !hamburger) return;
      drawer.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };

    hamburger?.addEventListener("click", () => (drawer?.classList.contains("open") ? closeDrawer() : openDrawer()));
    drawerClose?.addEventListener("click", closeDrawer);
    drawer?.addEventListener("click", (e) => e.target === drawer && closeDrawer());
    drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeDrawer));
  }

  // -------------------------
  // Stage: Hero -> Crossfade -> Iterate
  // -------------------------
  function initStageHeroIterate() {
    const hero = document.querySelector("section.hero#hero") || document.querySelector("section.hero");
    const iterate = document.querySelector("section.iterate#iterate") || document.querySelector("section.iterate");
    if (!hero || !iterate) return;

    const stage = wrapIntoStage(hero, iterate);

    gsap.set(hero, { autoAlpha: 1, pointerEvents: "auto" });
    gsap.set(iterate, { autoAlpha: 0, pointerEvents: "none", y: 18 });

    const heroEngine = createHeroEngine(hero, HERO_FRAME_COUNT);
    const iterateEngine = createIterateEngine(iterate, { snap: ITERATE_SNAP });

    const heroLen = vhToPx(HERO_SCROLL_VH);
    const xfadeLen = vhToPx(XFADE_SCROLL_VH);
    const iterLen = vhToPx(ITER_SCROLL_VH);
    const totalLen = heroLen + xfadeLen + iterLen;

    ScrollTrigger.create({
      id: "CAM_STAGE_PIN",
      trigger: stage,
      start: "top top",
      end: `+=${totalLen}`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        const t = p * totalLen;

        const inHero = t <= heroLen;
        const inXfade = t > heroLen && t <= heroLen + xfadeLen;
        const inIter = t > heroLen + xfadeLen;

        // HERO frames
        if (inHero) heroEngine.render(t / heroLen);
        else heroEngine.render(1);

        // CROSSFADE
        if (inXfade) {
          const x = (t - heroLen) / xfadeLen;
          gsap.set(hero, { autoAlpha: 1 - x, pointerEvents: "none" });
          gsap.set(iterate, { autoAlpha: x, y: (1 - x) * 18, pointerEvents: x > 0.65 ? "auto" : "none" });
        } else if (inIter) {
          gsap.set(hero, { autoAlpha: 0, pointerEvents: "none" });
          gsap.set(iterate, { autoAlpha: 1, y: 0, pointerEvents: "auto" });
        } else {
          gsap.set(hero, { autoAlpha: 1, pointerEvents: "auto" });
          gsap.set(iterate, { autoAlpha: 0, y: 18, pointerEvents: "none" });
        }

        // ITERATE driven segment
        if (inIter) iterateEngine.render((t - (heroLen + xfadeLen)) / iterLen);
        else iterateEngine.render(0);
      },
    });
  }

  function wrapIntoStage(heroEl, iterateEl) {
    const existing = document.querySelector(".stage");
    if (existing && existing.contains(heroEl) && existing.contains(iterateEl)) return existing;

    const stage = document.createElement("div");
    stage.className = "stage";
    stage.id = "stage";

    heroEl.parentNode.insertBefore(stage, heroEl);
    stage.appendChild(heroEl);
    stage.appendChild(iterateEl);

    return stage;
  }

  // -------------------------
  // HERO engine (canvas frames)
  // -------------------------
  function createHeroEngine(heroEl, frameCount) {
    const canvas = heroEl.querySelector("canvas");
    const ctx = canvas?.getContext("2d", { alpha: false });
    const h1 = heroEl.querySelector(".hero-header h1") || heroEl.querySelector("h1");
    const sub = heroEl.querySelector(".hero-sub");
    const actions = heroEl.querySelector(".hero-actions");
    const stats = heroEl.querySelector(".hero-stats");

    if (!canvas || !ctx) return { render: () => {} };

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const setCanvasSize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(innerWidth * dpr);
      canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width = innerWidth + "px";
      canvas.style.height = innerHeight + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    setCanvasSize();

    const currentFrame = (i) => `/frames/frame_${String(i + 1).padStart(4, "0")}.jpg`;
    const images = new Array(frameCount);
    let lastFrame = -1;

    // Helper: Draw logic isolated
    const performDraw = (img) => {
      const cw = innerWidth;
      const ch = innerHeight;
      ctx.clearRect(0, 0, cw, ch);

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = cw / ch;

      let drawW, drawH, x, y;
      if (imgAspect > canvasAspect) {
        drawH = ch;
        drawW = drawH * imgAspect;
        x = (cw - drawW) / 2;
        y = 0;
      } else {
        drawW = cw;
        drawH = drawW / imgAspect;
        x = 0;
        y = (ch - drawH) / 2;
      }
      ctx.drawImage(img, x, y, drawW, drawH);
    };

    const drawFrame = (idx) => {
      if (idx === lastFrame) return;
      lastFrame = idx;

      const img = images[idx];
      if (!img) return;

      if (img.complete && img.naturalWidth > 0) {
        performDraw(img);
      }
    };

    // Preload & Init Frame 0
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images[i] = img;

      // Ensure first frame draws as soon as it loads
      if (i === 0) {
        // Immediate check if already cached/loaded
        if (img.complete && img.naturalWidth > 0) {
          performDraw(img);
          lastFrame = 0;
        } else {
          // Otherwise wait for load
          img.onload = () => {
            // Only draw if we haven't scrolled yet (lastFrame is still initial)
            if (lastFrame === -1 || lastFrame === 0) {
              performDraw(img);
              lastFrame = 0;
            }
          };
        }
      }
    }

    const applyText = (p) => {
      if (!h1 || reduceMotion()) return;

      const intro = clamp01(p / 0.22);
      const stepped = Math.round(intro * 5) / 5;

      gsap.set(h1, {
        transformOrigin: "50% 50%",
        scale: 1.08 - stepped * 0.30,
        y: -stepped * 18,
        opacity: 1 - stepped,
      });

      const other = clamp01(intro / 0.75);
      if (sub) gsap.set(sub, { opacity: 1 - other, y: -other * 8 });
      if (actions) gsap.set(actions, { opacity: 1 - other, y: -other * 6 });
      if (stats) gsap.set(stats, { opacity: 1 - other, y: other * 8 });
    };

    window.addEventListener("resize", () => {
      setCanvasSize();
      lastFrame = -1;
    });

    return {
      render: (p01) => {
        const p = clamp01(p01);
        const frame = Math.round(p * (frameCount - 1));
        drawFrame(frame);
        applyText(p);
      },
    };
  }

  // -------------------------
  // ITERATE engine (step content + stack)
  // -------------------------
  function createIterateEngine(root, { snap }) {
    const badge = document.getElementById("itBadge");
    const nowEl = document.getElementById("itNow");
    const totalEl = document.getElementById("itTotal");
    const dotsWrap = document.getElementById("itDots");

    const miniKicker = document.getElementById("itMiniKicker");
    const heading = document.getElementById("itHeading");
    const body = document.getElementById("itBody");
    const footA = document.getElementById("ipFootA");
    const footB = document.getElementById("ipFootB");
    const footC = document.getElementById("ipFootC");
    const chip = document.getElementById("ipChip");
    const sub = document.getElementById("ipSub");
    const glow = document.getElementById("itGlow");
    const previewImg = document.getElementById("itPreviewImg");

    const tabs = Array.from(document.querySelectorAll(".itab"));
    const stack = document.getElementById("ipStack");
    const cards = stack ? Array.from(stack.querySelectorAll(".stack-card")) : [];

    const steps = [
      {
        badge: "01",
        tab: "PLAN",
        kicker: "End-to-End Delivery",
        title: "Plan and align your project from day one.",
        text:
          "Define scope, budget, timeline, approvals, and investor-friendly milestones. We keep every decision traceable so delivery stays predictable.",
        sub: "Blueprint clarity",
        foot: ["Phased delivery", "Spec compliance", "Weekly reporting"],
        images: ["/assets/iterate/plan-1.jpg", "/assets/iterate/plan-2.jpg", "/assets/iterate/plan-3.jpg", "/assets/iterate/plan-4.jpg"],
        mainImage: "/iterate/plan.jpg",
      },
      {
        badge: "02",
        tab: "DESIGN",
        kicker: "Design & Architecture",
        title: "Design with intent — premium, modern, buildable.",
        text:
          "We translate lifestyle and brand into layouts, elevations, and materials. Visualise early, reduce revisions, and protect quality before construction begins.",
        sub: "Concept → approvals",
        foot: ["3D visualisation", "Material selection", "Budget alignment"],
        images: ["/assets/iterate/design-1.jpg", "/assets/iterate/design-2.jpg", "/assets/iterate/design-3.jpg", "/assets/iterate/design-4.jpg"],
        mainImage: "/iterate/design.jpg",
      },
      {
        badge: "03",
        tab: "BUILD",
        kicker: "Construction Management",
        title: "Build with strict process and on-site control.",
        text:
          "Structured scheduling, procurement, and supervision. We keep the site moving, manage risk, and maintain consistent workmanship across teams.",
        sub: "Execution discipline",
        foot: ["Site coordination", "Quality checks", "Progress updates"],
        images: ["/assets/iterate/build-1.jpg", "/assets/iterate/build-2.jpg", "/assets/iterate/build-3.jpg", "/assets/iterate/build-4.jpg"],
        mainImage: "/iterate/build.jpg",
      },
      {
        badge: "04",
        tab: "FINISH",
        kicker: "Interiors & Finishing",
        title: "Finish with signature detailing and luxury feel.",
        text:
          "Lighting, textures, joinery, and final styling — where premium spaces are made. We deliver a cohesive end result with lasting value.",
        sub: "Signature finishing",
        foot: ["Detail execution", "Snag resolution", "Handover readiness"],
        images: ["/assets/iterate/finish-1.jpg", "/assets/iterate/finish-2.jpg", "/assets/iterate/finish-3.jpg", "/assets/iterate/finish-4.jpg"],
        mainImage: "/iterate/finish.jpg",
      },
    ];

    // Preload main images
    steps.forEach(s => {
      const i = new Image();
      i.src = s.mainImage;
    });

    if (totalEl) totalEl.textContent = String(steps.length);

    const setDots = (index) => {
      if (!dotsWrap) return;
      dotsWrap.querySelectorAll(".idot").forEach((d, i) => d.classList.toggle("active", i === index));
    };
    const setTabs = (index) => tabs.forEach((t, i) => t.classList.toggle("active", i === index));

    const POSES = [
      { y: 0, s: 1.0, r: 0.0, z: 0, o: 1.0 },
      { y: 18, s: 0.97, r: -1.2, z: -55, o: 0.94 },
      { y: 36, s: 0.94, r: -2.4, z: -110, o: 0.88 },
      { y: 54, s: 0.91, r: -3.6, z: -165, o: 0.82 },
    ];

    const poseFor = (cardIndex, activeIndex) => {
      const n = cards.length || 4;
      const order = (cardIndex - activeIndex + n) % n;
      return POSES[order] || POSES[0];
    };

    const quick = cards.map((card) => ({
      y: gsap.quickTo(card, "y", { duration: 0.18, ease: "power2.out" }),
      s: gsap.quickTo(card, "scale", { duration: 0.18, ease: "power2.out" }),
      r: gsap.quickTo(card, "rotateZ", { duration: 0.18, ease: "power2.out" }),
      z: gsap.quickTo(card, "z", { duration: 0.18, ease: "power2.out" }),
      o: gsap.quickTo(card, "autoAlpha", { duration: 0.18, ease: "power2.out" }),
    }));

    function renderStack(progressSteps) {
      if (!cards.length) return;

      const max = steps.length - 1;
      const p = Math.max(0, Math.min(max, progressSteps));
      const base = Math.floor(p);
      const frac = p - base;
      const next = Math.min(max, base + 1);

      cards.forEach((_, i) => {
        const A = poseFor(i, base);
        const B = poseFor(i, next);
        quick[i].y(A.y + (B.y - A.y) * frac);
        quick[i].s(A.s + (B.s - A.s) * frac);
        quick[i].r(A.r + (B.r - A.r) * frac);
        quick[i].z(A.z + (B.z - A.z) * frac);
        quick[i].o(A.o + (B.o - A.o) * frac);
      });

      if (glow) {
        glow.style.opacity = String(Math.min(1, 0.12 + frac * 0.88));
        glow.style.transform = `scale(${0.985 + frac * 0.03})`;
      }
    }

    let activeStep = -1;
    function applyStep(index) {
      if (index === activeStep) return;
      activeStep = index;

      const s = steps[index];
      if (!s) return;

      if (badge) badge.textContent = s.badge;
      if (nowEl) nowEl.textContent = String(index + 1);
      setDots(index);
      setTabs(index);

      // --- NEW: Update main card image with crossfade ---
      if (previewImg && s.mainImage) {
        gsap.to(previewImg, {
          autoAlpha: 0,
          scale: 1.05,
          duration: 0.20,
          ease: "power2.inOut",
          onComplete: () => {
            previewImg.src = s.mainImage;
            gsap.fromTo(
              previewImg,
              { autoAlpha: 0, scale: 1.05 },
              { autoAlpha: 1, scale: 1, duration: 0.40, ease: "power2.out" }
            );
          },
        });
      }

      if (cards.length) {
        cards.forEach((c, i) => {
          const img = s.images[i] || s.images[0];
          c.style.setProperty("--card-img", `url('${img}')`);
          c.style.setProperty("--card-bg", `url('${img}')`);
        });
      }

      const targets = [miniKicker, heading, body, chip, sub, footA, footB, footC].filter(Boolean);

      if (reduceMotion()) {
        if (miniKicker) miniKicker.innerHTML = `<span class="dot"></span> ${s.kicker}`;
        if (heading) heading.textContent = s.title;
        if (body) body.textContent = s.text;
        if (chip) chip.textContent = `${s.badge} • ${s.tab}`;
        if (sub) sub.textContent = s.sub;
        if (footA) footA.textContent = s.foot[0];
        if (footB) footB.textContent = s.foot[1];
        if (footC) footC.textContent = s.foot[2];
        if (previewImg) previewImg.src = s.mainImage;
        return;
      }

      gsap.to(targets, {
        autoAlpha: 0,
        y: 10,
        duration: 0.18,
        ease: "power2.out",
        onComplete: () => {
          if (miniKicker) miniKicker.innerHTML = `<span class="dot"></span> ${s.kicker}`;
          if (heading) heading.textContent = s.title;
          if (body) body.textContent = s.text;
          if (chip) chip.textContent = `${s.badge} • ${s.tab}`;
          if (sub) sub.textContent = s.sub;
          if (footA) footA.textContent = s.foot[0];
          if (footB) footB.textContent = s.foot[1];
          if (footC) footC.textContent = s.foot[2];

          gsap.fromTo(
            targets,
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: 0.36, ease: "power3.out", stagger: 0.03 }
          );
        },
      });
    }

    // init
    renderStack(0);
    applyStep(0);

    // tabs click = immediate change
    tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.dataset.step, 10);
        if (Number.isNaN(i)) return;
        applyStep(i);
      });
    });

    return {
      render: (p01) => {
        const p = clamp01(p01);
        const max = steps.length - 1;
        const raw = p * max;
        const idx = snap ? Math.round(raw) : Math.floor(raw);
        renderStack(raw);
        applyStep(Math.max(0, Math.min(max, idx)));
      },
    };
  }

  // -------------------------
  // GLOBAL: reveal-on-scroll (ONE system)
  // -------------------------
  function initGlobalReveals() {
    if (reduceMotion()) return;

    // Auto-mark common elements if not already marked
    const autoTargets = gsap.utils.toArray(".section-head, .project-card, .pkg, .review, .book-card, .stat, .plist, .bp");
    autoTargets.forEach((el) => {
      if (el.dataset.reveal) return;
      el.dataset.reveal = "up";
    });

    document.querySelectorAll("[data-reveal]").forEach((el) => {
      // Exclude elements inside pinned stages (they are handled by initPinnedSectionsSnapped)
      if (el.closest("#projects, #packages, #book, #reviews")) return;

      const mode = el.getAttribute("data-reveal") || "up";
      const isHead = el.matches(".section-head") || el.querySelector(".h2, .kicker");

      const from = { autoAlpha: 0, scale: 1.02 };
      if (mode === "up") Object.assign(from, { y: 20 });
      if (mode === "fade") Object.assign(from, { y: 0 });
      if (mode === "left") Object.assign(from, { x: -24 });
      if (mode === "right") Object.assign(from, { x: 24 });

      gsap.fromTo(el, from, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: 1.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: isHead ? "top 92%" : "top 85%",
          end: "top 55%",
          toggleActions: "play none none none",
        },
      });
    });
  }

  // -------------------------
  // GLOBAL: parallax
  // -------------------------
  function initGlobalParallax() {
    if (reduceMotion()) return;

    gsap.utils.toArray("[data-parallax]").forEach((el) => {
      const strength = parseFloat(el.getAttribute("data-parallax") || "0.08");
      gsap.to(el, {
        yPercent: -strength * 100,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    });

    // default parallax for project media
    gsap.utils.toArray(".pc-media").forEach((media) => {
      gsap.fromTo(
        media,
        { y: 18, scale: 1.06 },
        {
          y: -18,
          scale: 1.02,
          ease: "none",
          scrollTrigger: {
            trigger: media.closest(".project-card") || media,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    });
  }

  // -------------------------
  // GLOBAL: hover tilt
  // -------------------------
  function initGlobalHoverTilt() {
    if (reduceMotion() || !isDesktop()) return;

    const cards = gsap.utils.toArray(".project-card, .pkg, .review");
    cards.forEach((card) => {
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const ry = (px - 0.5) * 6;
        const rx = -(py - 0.5) * 5;

        gsap.to(card, {
          rotateX: rx,
          rotateY: ry,
          transformPerspective: 900,
          transformOrigin: "50% 50%",
          duration: 0.18,
          ease: "power2.out",
        });
      };

      const onLeave = () => {
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.35, ease: "power3.out" });
      };

      card.addEventListener("mousemove", onMove, { passive: true });
      card.addEventListener("mouseleave", onLeave);
    });
  }

  // -------------------------
  // PINNED MINI-STAGES with snap beats
  // Projects / Packages / Book / Reviews
  // -------------------------
  function initPinnedSectionsSnapped() {
    if (window.__CAM_PINNED_SECTIONS__) return;
    window.__CAM_PINNED_SECTIONS__ = true;

    if (reduceMotion()) return;

    const desktop = isBigDesktop();
    const makeEndPx = (vh) => Math.max(260, vhToPx(vh));

    function scrubReveal(tl, els, { fromY = 18, fromBlur = 0, stagger = 0.08, at = 0.08 } = {}) {
      const arr = gsap.utils.toArray(els).filter(Boolean);
      if (!arr.length) return;
      gsap.set(arr, { autoAlpha: 0, y: fromY });
      tl.to(arr, { autoAlpha: 1, y: 0, stagger, duration: 0.35, ease: "power3.out" }, at);
    }

    function parallaxInPinned(tl, el, { y = 16, scaleFrom = 1.06, scaleTo = 1.02, at = 0.0 } = {}) {
      if (!el) return;
      gsap.set(el, { y, scale: scaleFrom });
      tl.to(el, { y: -y, scale: scaleTo, duration: 1 }, at);
    }

    function makeStepStage({ id, beats = 3, endVh = 220, onBuild }) {
      const sec = document.getElementById(id);
      if (!sec) return;

      sec.classList.add("pin-stage");

      // Ensure pin-inner wrapper
      let inner = sec.querySelector(":scope > .pin-inner");
      if (!inner) {
        inner = document.createElement("div");
        inner.className = "pin-inner";
        while (sec.firstChild) inner.appendChild(sec.firstChild);
        sec.appendChild(inner);
      }

      const tl = gsap.timeline({ defaults: { ease: "none" }, paused: true });
      onBuild?.({ sec, inner, tl, beats });

      // Mobile / Tablet: Just play the animation (no pin)
      if (!desktop) {
        ScrollTrigger.create({
          id: `stage-${id}-mobile`,
          trigger: sec,
          start: "top 65%",
          onEnter: () => tl.play(),
        });
        return;
      }

      const config = {
        id: `stage-${id}`,
        trigger: sec,
        start: "top top",
        end: `+=${makeEndPx(endVh)}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        animation: tl,
      };

      if (PINNED_SECTIONS_SNAP) {
        config.snap = {
          snapTo: (value) => {
            const step = 1 / (beats - 1);
            return Math.round(value / step) * step;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0.02,
          ease: "power2.out",
        };
      }

      ScrollTrigger.create(config);
    }

    // ---------------- Projects (Intro -> Cards -> CTA)
    makeStepStage({
      id: "projects",
      beats: 3,
      endVh: 110,
      onBuild: ({ sec, tl }) => {
        const head = sec.querySelectorAll(".kicker, .h2, .section-head p, [data-reveal]");
        const lines = sec.querySelectorAll("[data-project-lines] .plist, .projects-list .plist");
        const cards = sec.querySelectorAll(".project-card");
        const medias = sec.querySelectorAll(".project-card .pc-media");
        const ctas = sec.querySelectorAll(".projects-cta .btn");

        scrubReveal(tl, head, { at: 0.02, stagger: 0.06 });
        scrubReveal(tl, lines, { at: 0.12, stagger: 0.08 });

        scrubReveal(tl, cards, { at: 0.50, stagger: 0.10 });
        medias.forEach((m, i) => parallaxInPinned(tl, m, { y: 14, at: 0.34 + i * 0.02 }));

        scrubReveal(tl, ctas, { at: 0.78, stagger: 0.06 });
      },
    });

    // ---------------- Packages (Intro -> Cards -> Buttons)
    makeStepStage({
      id: "packages",
      beats: 3,
      endVh: 100,
      onBuild: ({ sec, tl }) => {
        const head = sec.querySelectorAll(".kicker, .h2, .section-head p, [data-reveal]");
        const pkgs = sec.querySelectorAll(".pkg");
        const buttons = sec.querySelectorAll(".pkg-actions .btn");

        scrubReveal(tl, head, { at: 0.02, stagger: 0.06 });
        scrubReveal(tl, pkgs, { at: 0.50, stagger: 0.10 });
        scrubReveal(tl, buttons, { at: 0.78, stagger: 0.05 });

        pkgs.forEach((card, i) => {
          gsap.set(card, { y: 14 });
          tl.to(card, { y: -10, duration: 1 }, 0.34 + i * 0.03);
        });
      },
    });

    // ---------------- Book (Intro -> Form -> Points/Actions)
    makeStepStage({
      id: "book",
      beats: 3,
      endVh: 100,
      onBuild: ({ sec, tl }) => {
        const head = sec.querySelectorAll(".kicker, .h2, .section-head p, [data-reveal]");
        const card = sec.querySelector(".book-form");
        const fields = sec.querySelectorAll(".book-form label, .book-form .bc-row");
        const points = sec.querySelectorAll(".book-benefits .benefit");
        const actions = sec.querySelectorAll(".bc-actions .btn");

        scrubReveal(tl, head, { at: 0.02, stagger: 0.06 });
        scrubReveal(tl, [card], { at: 0.50, stagger: 0 });
        scrubReveal(tl, fields, { at: 0.56, stagger: 0.04 });

        scrubReveal(tl, points, { at: 0.76, stagger: 0.08 });
        scrubReveal(tl, actions, { at: 0.84, stagger: 0.05 });

        points.forEach((p, i) => {
          gsap.set(p, { y: 10 });
          tl.to(p, { y: -8, duration: 1 }, 0.70 + i * 0.04);
        });
      },
    });

    // ---------------- Reviews (Intro -> Cards -> Nav/Dots)
    makeStepStage({
      id: "reviews",
      beats: 3,
      endVh: 100,
      onBuild: ({ sec, tl }) => {
        const head = sec.querySelectorAll(".kicker, .h2, .section-head p, [data-reveal]");
        const reviews = sec.querySelectorAll(".review");
        const dots = sec.querySelectorAll(".rv-dot");
        const arrows = sec.querySelectorAll(".rv-nav");

        scrubReveal(tl, head, { at: 0.02, stagger: 0.06 });
        scrubReveal(tl, reviews, { at: 0.50, stagger: 0.10 });
        scrubReveal(tl, arrows, { at: 0.78, stagger: 0.04 });
        scrubReveal(tl, dots, { at: 0.84, stagger: 0.02 });

        reviews.forEach((r, i) => {
          gsap.set(r, { y: 14 });
          tl.to(r, { y: -10, duration: 1 }, 0.34 + i * 0.03);
        });
      },
    });
  }

  // -------------------------
  // Reviews slider (track + dots + arrows + drag)
  // -------------------------
  function initReviewsSlider() {
    if (window.__CAM_REVIEWS_SLIDER__) return;
    window.__CAM_REVIEWS_SLIDER__ = true;

    const root = document.getElementById("reviews");
    const track = document.getElementById("reviewsTrack");
    const dotsWrap = document.getElementById("reviewsDots");
    const prev = root?.querySelector(".rv-prev");
    const next = root?.querySelector(".rv-next");
    if (!root || !track) return;

    const cards = Array.from(track.querySelectorAll(".review"));
    if (!cards.length) return;

    // Build dots
    let dots = [];
    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      cards.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "rv-dot" + (i === 0 ? " active" : "");
        b.setAttribute("aria-label", `Go to review ${i + 1}`);
        b.addEventListener("click", () => scrollToIndex(i));
        dotsWrap.appendChild(b);
      });
      dots = Array.from(dotsWrap.querySelectorAll(".rv-dot"));
    }

    const cardStep = () => {
      if (cards.length < 2) return cards[0].offsetWidth + 16;
      const a = cards[0].offsetLeft;
      const b = cards[1].offsetLeft;
      return Math.max(1, b - a);
    };

    const activeIndex = () => Math.round(track.scrollLeft / cardStep());

    const setActiveDot = (i) => dots.forEach((d, idx) => d.classList.toggle("active", idx === i));

    const scrollToIndex = (i) => {
      const step = cardStep();
      track.scrollTo({ left: i * step, behavior: "smooth" });
    };

    prev?.addEventListener("click", () => scrollToIndex(Math.max(0, activeIndex() - 1)));
    next?.addEventListener("click", () => scrollToIndex(Math.min(cards.length - 1, activeIndex() + 1)));

    // Drag
    let isDown = false;
    let startX = 0;
    let startLeft = 0;

    track.addEventListener("pointerdown", (e) => {
      isDown = true;
      track.classList.add("is-dragging");
      track.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startLeft = track.scrollLeft;
    });

    track.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      track.scrollLeft = startLeft - dx;
    });

    const endDrag = () => {
      if (!isDown) return;
      isDown = false;
      track.classList.remove("is-dragging");
      const i = Math.max(0, Math.min(cards.length - 1, activeIndex()));
      setActiveDot(i);
      scrollToIndex(i);
    };

    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("pointerleave", endDrag);

    let rafId = null;
    track.addEventListener("scroll", () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setActiveDot(activeIndex()));
    });
  }

  // -------------------------
  // Footer reveal (single, uses .lux-footer)
  // -------------------------
  function initFooterReveal() {
    if (reduceMotion()) return;
    const footer = document.querySelector(".lux-footer");
    if (!footer) return;

    const brand = footer.querySelector(".lf-brand");
    const cols = Array.from(footer.querySelectorAll(".lf-col"));
    const bottom = footer.querySelector(".lux-footer-bottom");

    const targets = [brand, ...cols, bottom].filter(Boolean);
    if (!targets.length) return;

    gsap.set(targets, { autoAlpha: 0, y: 22 });

    gsap.to(targets, {
      autoAlpha: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.10,
      scrollTrigger: {
        id: "footer-reveal",
        trigger: footer,
        start: "top 85%",
        end: "top 55%",
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
  }
});

// ===============================
// Premium Hover Tilt (subtle)
// ===============================
function initTiltCards() {
  const cards = document.querySelectorAll("[data-tilt], .service-card, .metric");
  if (!cards.length) return;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  cards.forEach((card) => {
    let rect = null;

    const onMove = (e) => {
      rect = rect || card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;  // 0..1
      const y = (e.clientY - rect.top) / rect.height;  // 0..1

      const rx = clamp((0.5 - y) * 6, -6, 6);  // tilt strength
      const ry = clamp((x - 0.5) * 8, -8, 8);

      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
    };

    const onLeave = () => {
      rect = null;
      card.style.transform = "";
    };

    // only on devices with hover
    if (window.matchMedia("(hover: hover)").matches) {
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTiltCards();
});

// ===============================
// Projects Page Animations (GSAP)
// ===============================
function initProjectsAnimations() {
  // Your HTML uses: <html class="page-projects">
  if (!document.documentElement.classList.contains("page-projects")) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  // HERO intro
  gsap.from(".projects-hero .kicker, .projects-hero .projects-title, .projects-hero .projects-lead, .projects-hero .projects-hero-actions", {
    opacity: 0,
    y: 18,
    duration: 0.85,
    ease: "power3.out",
    stagger: 0.08,
    delay: 0.05,
  });

  // Filter strip reveal
  const strip = document.querySelector(".process-strip");
  if (strip) {
    gsap.from(strip.children, {
      opacity: 0,
      y: 14,
      duration: 0.75,
      ease: "power3.out",
      stagger: 0.10,
      scrollTrigger: {
        trigger: strip,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  }

  // Projects grids stagger
  document.querySelectorAll(".projects-grid").forEach((grid) => {
    const items = grid.querySelectorAll(".project-card");
    gsap.from(items, {
      opacity: 0,
      y: 22,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: grid,
        start: "top 75%", // Delayed to allow head to load first
        toggleActions: "play none none none",
      },
    });
  });

  // Interiors blocks stagger
  const rvGrid = document.querySelector(".reviews-grid");
  if (rvGrid) {
    const blocks = rvGrid.querySelectorAll(".review");
    gsap.from(blocks, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.10,
      scrollTrigger: {
        trigger: rvGrid,
        start: "top 82%",
        toggleActions: "play none none none",
      },
    });
  }

  // Smooth anchor scroll for filter links (optional)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const el = document.querySelector(id);
    if (!el) return;

    e.preventDefault();
    if (window.lenis) window.lenis.scrollTo(el, { offset: -86 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

// ===============================
// Premium Hover Tilt (projects cards)
// ===============================
function initProjectsTilt() {
  if (!document.documentElement.classList.contains("page-projects")) return;

  const cards = document.querySelectorAll(".project-card, .review");
  if (!cards.length) return;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  cards.forEach((card) => {
    let rect = null;

    const onMove = (e) => {
      rect = rect || card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;  // 0..1
      const y = (e.clientY - rect.top) / rect.height;  // 0..1
      const rx = clamp((0.5 - y) * 5, -5, 5);
      const ry = clamp((x - 0.5) * 7, -7, 7);

      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
    };

    const onLeave = () => {
      rect = null;
      card.style.transform = "";
    };

    if (window.matchMedia("(hover: hover)").matches) {
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
    }
  });
}

// ===============================
// Services Page Animations (GSAP)
// ===============================
function initServicesAnimations() {
  if (!document.documentElement.classList.contains("page-services") && !document.body.classList.contains("page-services")) return;
  if (!window.gsap) return;

  // Explicitly stagger the hero elements so title appears FIRST
  // order: .kicker -> .services-title -> .services-lead -> .services-hero-actions -> .services-metrics
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from(".services-hero .kicker", {
    opacity: 0,
    y: 14,
    duration: 0.6,
    delay: 0.1
  })
  .from(".services-hero .services-title", {
    opacity: 0,
    y: 18,
    duration: 0.85
  }, "-=0.4")
  .from(".services-hero .services-lead", {
    opacity: 0,
    y: 16,
    duration: 0.8
  }, "-=0.6")
  .from(".services-hero .services-hero-actions", {
    opacity: 0,
    y: 14,
    duration: 0.7
  }, "-=0.6")
  .from(".services-hero .metric", {
    opacity: 0,
    y: 20,
    duration: 0.8,
    stagger: 0.1
  }, "-=0.5");

  // Process strip reveal
  const strip = document.querySelector(".process-strip");
  if (strip) {
    gsap.from(strip.children, {
      opacity: 0,
      y: 18,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger: strip,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initProjectsAnimations();
  initServicesAnimations();
  initProjectsTilt();
});
