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
    // FIX: Remove data-reveal from section-head to prevent global reveal logic
    // from hiding it (since it skips #book but the CSS [data-reveal] still applies).
    const head = sec.querySelector(".section-head");
    if (head) {
        head.removeAttribute("data-reveal");
        gsap.set(head, { autoAlpha: 1, y: 0 });
    }

    // Select elements using the split structure
    const leftText = sec.querySelector(".book-text");
    const rightForm = sec.querySelector(".book-form-card");

    // Left Content Stagger (Head, P, CTA)
    if (leftText) {
        // Select children of section-head + the button
        const textItems = leftText.querySelectorAll(".section-head > *, .btn");
        scrubReveal(tl, textItems, { at: 0.02, stagger: 0.08 });
    }

    // Right Form Reveal (Slide Up + Fade)
    if (rightForm) {
        gsap.set(rightForm, { autoAlpha: 0, y: 40 });
        tl.to(rightForm, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
        }, 0.15); // Start slightly after text
    }
  },
};

export function initBookForm() {
    const form = document.getElementById("bookForm");
    const successMsg = document.getElementById("bookSuccess");

    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Basic validation check (HTML5 'required' handles mostly, but we can double check)
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        console.log("Form Submitted:", data);

        // Show success
        if (successMsg) {
            successMsg.style.display = "block";
            // Optional: Hide button or form fields
            const btn = form.querySelector('button[type="submit"]');
            if(btn) {
                btn.textContent = "Sent";
                btn.disabled = true;
                btn.classList.add("ghost"); // Visual feedback
            }
        }
    });
}
