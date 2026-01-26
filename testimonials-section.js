
export function initTestimonialsSection() {
  const section = document.getElementById("testimonials");
  if (!section) return;

  const track = section.querySelector(".tm-track");
  const dotsContainer = section.querySelector(".tm-dots");
  if (!track || !dotsContainer) return;

  // Configuration
  const AUTO_PLAY_DELAY = 4000;
  let autoPlayTimer;
  let isDragging = false;
  let startX;
  let scrollLeft;

  // Calculate items per view based on CSS (handled by layout, but we need to know for dots)
  // For dots, we can count total items and active index
  const items = Array.from(track.children);
  const totalItems = items.length;

  // Build Dots
  // On desktop (3 items), we might want fewer dots (pages) or one dot per item?
  // User asked for "pagination dots centered below".
  // Let's do one dot per item for simplicity, or calculate pages if we want strictly "pages".
  // Given standard carousels, 1 dot per scroll-snap point (which is usually per item) is best.

  items.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = `tm-dot ${index === 0 ? "active" : ""}`;
    dot.ariaLabel = `Go to testimonial ${index + 1}`;
    dot.addEventListener("click", () => {
      scrollToIndex(index);
      resetAutoPlay();
    });
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);

  function updateActiveDot() {
    // Find the item closest to the left edge
    const scrollPos = track.scrollLeft;
    const itemWidth = items[0].offsetWidth + 24; // Width + Gap (approx)
    // More precise: getBoundingClientRect of items relative to track

    let activeIndex = 0;
    let minDiff = Infinity;

    items.forEach((item, index) => {
      const diff = Math.abs(item.offsetLeft - track.offsetLeft - scrollPos);
      if (diff < minDiff) {
        minDiff = diff;
        activeIndex = index;
      }
    });

    dots.forEach((d, i) => d.classList.toggle("active", i === activeIndex));
  }

  function scrollToIndex(index) {
    const item = items[index];
    if (item) {
        // Smooth scroll
        track.scrollTo({
            left: item.offsetLeft - track.offsetLeft,
            behavior: 'smooth'
        });
    }
  }

  function nextSlide() {
    const currentScroll = track.scrollLeft;
    const trackWidth = track.scrollWidth;
    const clientWidth = track.clientWidth;

    // Check if we are at the end
    if (Math.ceil(currentScroll + clientWidth) >= trackWidth) {
        // Loop back to start
        track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
        // Go to next item
        // Find current index
        const itemWidth = items[0].offsetWidth;
        const gap = 24; // assumed gap
        const step = itemWidth + gap;

        const nextPos = currentScroll + step;
        track.scrollTo({ left: nextPos, behavior: 'smooth' });
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(nextSlide, AUTO_PLAY_DELAY);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // Event Listeners
  track.addEventListener("scroll", () => {
    updateActiveDot();
  }, { passive: true });

  // Drag Support
  track.addEventListener('mousedown', (e) => {
    isDragging = true;
    track.classList.add('dragging');
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    stopAutoPlay();
  });

  track.addEventListener('mouseleave', () => {
    isDragging = false;
    track.classList.remove('dragging');
    startAutoPlay();
  });

  track.addEventListener('mouseup', () => {
    isDragging = false;
    track.classList.remove('dragging');
    startAutoPlay();
  });

  track.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    track.scrollLeft = scrollLeft - walk;
  });

  // Touch support is handled natively by overflow-x: auto,
  // but we should pause autoplay on touch
  track.addEventListener("touchstart", stopAutoPlay, { passive: true });
  track.addEventListener("touchend", startAutoPlay, { passive: true });

  // Init
  startAutoPlay();
}
