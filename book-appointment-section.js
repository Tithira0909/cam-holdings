import gsap from "gsap";

// Helper for reveal animation (same as in script.js)
function scrubReveal(tl, els, { fromY = 18, stagger = 0.08, at = 0.08 } = {}) {
  const arr = gsap.utils.toArray(els).filter(Boolean);
  if (!arr.length) return;
  gsap.set(arr, { autoAlpha: 0, y: fromY });
  tl.to(arr, { autoAlpha: 1, y: 0, stagger, duration: 0.35, ease: "power3.out" }, at);
}

export const bookSectionConfig = {
  id: "book",
  beats: 3,
  endVh: 130,
  onBuild: ({ sec, tl }) => {
    // Select elements
    const head = sec.querySelectorAll(".kicker, .h2, .section-head p, [data-reveal]");
    const cards = sec.querySelectorAll(".pkg, .book-card"); // Select cards
    const buttons = sec.querySelectorAll(".pkg-actions .btn"); // Buttons inside cards

    // 1. Header Reveal
    scrubReveal(tl, head, { at: 0.02, stagger: 0.06 });

    // 2. Cards Reveal
    scrubReveal(tl, cards, { at: 0.50, stagger: 0.10 });

    // 3. Buttons (if needed separately, but usually inside cards they animate with card)
    // However, in packages they are animated separately?
    // In packages onBuild: scrubReveal(tl, buttons, ...)
    // If buttons are inside cards, animating them separately might be for effect.
    // I'll keep it simple: just animate header and cards.
    // But if I use exactly the package structure, I might want the button stagger too.
    if (buttons.length > 0) {
        scrubReveal(tl, buttons, { at: 0.78, stagger: 0.05 });
    }

    // Parallax effect for cards
    cards.forEach((card, i) => {
      gsap.set(card, { y: 14 });
      tl.to(card, { y: -10, duration: 1 }, 0.34 + i * 0.03);
    });
  },
};
