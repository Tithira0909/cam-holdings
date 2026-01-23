// script.js (ESM) — CAM Home ALL FINAL
// ✅ One-init, no duplicate pins
// ✅ Lenis smooth scroll (stable)
// ✅ Unified Animation System (Fade-up + Stagger)
// ✅ Global Card Hover Tilt

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
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktop = () => window.matchMedia("(min-width: 861px)").matches;

  // -------------------------------------------------------
  // 2) LENIS (Smooth Scroll)
  // -------------------------------------------------------
  const lenis = new Lenis({
    smooth: true,
    lerp: 0.085,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.1,
  });
  window.lenis = lenis;

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  lenis.on("scroll", () => ScrollTrigger.update());
  gsap.ticker.lagSmoothing(0);

  // -------------------------------------------------------
  // 3) UNIFIED GLOBAL REVEAL SYSTEM
  // -------------------------------------------------------
  // Standard Fade-Up + Slide for all sections and cards
  // Staggers children if container is marked, or reveals individually
  function initUnifiedReveals() {
    if (reduceMotion()) return;

    // 1. Section Headers (Kicker, H2, P) -> Staggered Fade Up
    const headers = gsap.utils.toArray(".section-head");
    headers.forEach((header) => {
      const children = header.querySelectorAll(".kicker, .h2, p");
      if (children.length === 0) return;

      gsap.fromTo(
        children,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: header,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // 2. Grids (Cards) -> Staggered Fade Up
    // Target any element with .grid, .re-grid, .projects-grid, .reviews-grid
    const grids = gsap.utils.toArray(".grid, .re-grid, .projects-grid, .reviews-grid, .packages-grid, .hp-grid, .b-grid, .gallery-grid");
    grids.forEach((grid) => {
      // Find direct children cards (handle various card class names)
      const cards = grid.querySelectorAll(".project-card, .re-card, .pkg, .review-card, .glass-project-card, .b-card, .gallery-item, .contact-card");
      if (cards.length === 0) return;

      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 40, scale: 0.98 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: grid,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // 3. Individual Elements marked with [data-reveal]
    // (For loose elements outside grids/headers)
    const individuals = gsap.utils.toArray("[data-reveal]");
    individuals.forEach((el) => {
        gsap.fromTo(
            el,
            { autoAlpha: 0, y: 30 },
            {
                autoAlpha: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
  }

  // -------------------------------------------------------
  // 4) UNIFIED CARD HOVER (Gold Glow + Lift)
  // -------------------------------------------------------
  function initCardHoverEffects() {
    if (reduceMotion() || !isDesktop()) return;

    // Select all luxury card types
    const cards = gsap.utils.toArray(".project-card, .re-card, .pkg, .review-card, .glass-project-card, .b-card, .contact-card");

    cards.forEach((card) => {
      // We rely mainly on CSS for the hover state (border/shadow),
      // but we can add a subtle tilt or scale via JS for "premium feel"

      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width; // 0..1
        const y = (e.clientY - rect.top) / rect.height; // 0..1

        // Slight Tilt
        const tiltX = (0.5 - y) * 4; // deg
        const tiltY = (x - 0.5) * 4; // deg

        gsap.to(card, {
          transformPerspective: 1000,
          rotateX: tiltX,
          rotateY: tiltY,
          duration: 0.4,
          ease: "power2.out",
        });
      };

      const onLeave = () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.5)",
        });
      };

      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
    });
  }

  // -------------------------------------------------------
  // 5) NAV / MEGA / DRAWER (Existing Logic)
  // -------------------------------------------------------
  initNavActive();
  initMegaMenu();
  initMobileDrawer();
  initSmoothAnchors();

  // -------------------------------------------------------
  // 6) FOOTER REVEAL
  // -------------------------------------------------------
  initFooterReveal();

  // -------------------------------------------------------
  // 7) INIT
  // -------------------------------------------------------
  initUnifiedReveals();
  initCardHoverEffects();

  // Refresh ScrollTrigger
  requestAnimationFrame(() => ScrollTrigger.refresh());


  // =======================================================
  // HELPER FUNCTIONS
  // =======================================================

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -100, duration: 1.2 });
      });
    });
  }

  function initNavActive() {
    const links = document.querySelectorAll(".nav-link");
    // Simple intersection observer or just manually highlight based on page
    const path = window.location.pathname;
    links.forEach(l => {
        if(l.getAttribute('href') === path) l.classList.add('active');
    });
  }

  function initMegaMenu() {
    const nav = document.querySelector(".nav");
    const mega = document.querySelector(".mega");
    const trigger = document.querySelector(".mega-trigger");
    if(!mega || !trigger) return;

    let timeout;
    const show = () => {
        clearTimeout(timeout);
        nav.classList.add("mega-open");
        gsap.to(mega, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" });
    };
    const hide = () => {
        timeout = setTimeout(() => {
            nav.classList.remove("mega-open");
            gsap.to(mega, { autoAlpha: 0, y: -10, duration: 0.25, ease: "power2.in" });
        }, 150);
    };

    trigger.addEventListener("mouseenter", show);
    nav.addEventListener("mouseleave", hide);
    mega.addEventListener("mouseenter", show);
    mega.addEventListener("mouseleave", hide);
  }

  function initMobileDrawer() {
    const btn = document.querySelector(".hamburger");
    const drawer = document.querySelector(".drawer");
    const close = document.querySelector(".drawer-close");
    if(!btn || !drawer) return;

    const toggle = () => drawer.classList.toggle("open");
    btn.addEventListener("click", toggle);
    if(close) close.addEventListener("click", toggle);
  }

  function initFooterReveal() {
    if (reduceMotion()) return;
    const footer = document.querySelector(".adaline-footer");
    if (!footer) return;

    gsap.fromTo(
      footer.querySelectorAll(".footer-brand, .footer-col"),
      { y: 30, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: footer,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }
});
