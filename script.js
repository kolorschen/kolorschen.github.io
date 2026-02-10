function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle('open')
  icon.classList.toggle('open')
}

// Scroll-driven slider rotation
(function() {
  const banner = document.querySelector('.banner');
  const slider = document.querySelector('.banner .slider');
  const gallery = document.getElementById('photo-gallery');
  if (!banner || !slider) return;

  let rotationY = 0; // degrees
  let netAccum = 0; // net accumulated rotation (positive = downward/clockwise, negative = upward/ccw)
  const sensitivity = 0.15; // degrees per pixel scrolled (lower = slower)
  let ticking = false;
  let locked = false; // lock to prevent repeated auto-scroll triggers

  function applyRotation() {
    slider.style.transform = `perspective(1000px) rotateX(-10deg) rotateY(${rotationY}deg)`;
    ticking = false;
  }

  function handleDelta(deltaY) {
    // Convert deltaY (pixels) to rotation degrees
    const rotateAmount = deltaY * sensitivity;
    rotationY = (rotationY + rotateAmount) % 360;

  // accumulate net rotation; upward scroll reduces accumulated value
  netAccum += rotateAmount;

  // small clamp to avoid runaway values
  if (netAccum > 3600) netAccum = 3600;
  if (netAccum < -3600) netAccum = -3600;

    if (!ticking) {
      window.requestAnimationFrame(applyRotation);
      ticking = true;
    }

    if (!locked && netAccum >= 360 && gallery) {
      locked = true;
      netAccum = 0;
      setTimeout(() => gallery.scrollIntoView({ behavior: 'smooth' }), 120);
      // unlock after animation completes
      setTimeout(() => { locked = false; }, 900);
    }

    if (!locked && netAccum <= -360) {
      locked = true;
      netAccum = 0;
      // scroll back to profile/header if present, otherwise to top
      const profileEl = document.getElementById('profile');
      if (profileEl) {
        setTimeout(() => profileEl.scrollIntoView({ behavior: 'smooth' }), 120);
      } else {
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 120);
      }
      setTimeout(() => { locked = false; }, 900);
    }
  }

  function onWheel(e) {
    // Only act when the banner is mostly in view
    const rect = banner.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    const delta = e.deltaY || e.detail || -e.wheelDelta;
    // apply scaled rotation; positive delta = scroll down
    handleDelta(delta);

    // prevent page from scrolling while user is rotating the banner
    e.preventDefault();
  }

  // Touch support for mobile (swipe up/down over banner)
  let lastTouchY = null;
  function onTouchStart(e) {
    if (e.touches && e.touches.length) lastTouchY = e.touches[0].clientY;
  }
  function onTouchMove(e) {
    if (!lastTouchY) return;
    const y = e.touches[0].clientY;
    const delta = lastTouchY - y; // positive when swiping up (we want down scroll to rotate clockwise)
    // Note: invert sign so downward swipe (finger moving up) produces positive deltaY as wheel
    handleDelta(delta);
    lastTouchY = y;
    e.preventDefault();
  }

  // Attach listeners to the banner only so normal page scrolling works elsewhere
  banner.addEventListener('wheel', onWheel, { passive: false });
  banner.addEventListener('touchstart', onTouchStart, { passive: true });
  banner.addEventListener('touchmove', onTouchMove, { passive: false });
})();

