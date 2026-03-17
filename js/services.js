/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — Services Page JavaScript
 * File: js/services.js
 * Version: 3.0 — Carrusel de testimonials agregado
 *
 * CAMBIOS EN ESTA VERSIÓN:
 * + initTestimonialsCarousel — carrusel completo con:
 *     · Flechas prev / next
 *     · Puntos de navegación generados dinámicamente
 *     · Auto-play con pausa al hover
 *     · Soporte táctil (swipe left / right)
 *     · Responsive (3 cards → 2 → 1 según breakpoint)
 *     · Accesibilidad: aria-labels en los dots
 *
 * TABLE OF CONTENTS
 * 1.  DOMContentLoaded Init
 * 2.  Service Stats Counter Animation
 * 3.  Service Cards — Hover Icon Ripple Effect
 * 4.  Process Steps — Sequential Highlight on Scroll
 * 5.  Hero Rings — Mouse Parallax
 * 6.  Specialty Cards — Staggered Entrance
 * 7.  Testimonials Carousel  ← NUEVO
 * ================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initServiceStatsCounter();
  initServiceCardRipple();
  initProcessStepsHighlight();
  initHeroRingsParallax();
  initSpecialtyStagger();
  initTestimonialsCarousel(); // ← NUEVO
});


/* ================================================================
   UTILITY
================================================================ */

function isTouchDevice() {
  return window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}


/* ================================================================
   2. SERVICE STATS COUNTER ANIMATION
================================================================ */
function initServiceStatsCounter() {
  const statValues = document.querySelectorAll('.svc-stat-item__value[data-target]');
  if (!statValues.length) return;

  const reduced = prefersReducedMotion();

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);

        if (reduced) {
          el.textContent = target.toLocaleString();
        } else {
          animateSvcCounter(el, target);
        }

        obs.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );

  statValues.forEach((el) => observer.observe(el));
}

function animateSvcCounter(el, target, duration = 1800) {
  let startTime = null;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function tick(timestamp) {
    if (!startTime) startTime = timestamp;

    const elapsed  = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value    = Math.round(easeOutQuart(progress) * target);

    el.textContent = value.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(tick);
}


/* ================================================================
   3. SERVICE CARDS — Hover Icon Ripple Effect
================================================================ */
function initServiceCardRipple() {
  const cards = document.querySelectorAll('.svc-card');
  if (!cards.length) return;
  if (prefersReducedMotion()) return;

  if (!document.getElementById('svc-ripple-style')) {
    const style = document.createElement('style');
    style.id = 'svc-ripple-style';
    style.textContent = `
      @keyframes svcRipple {
        0%   { transform: translate(-50%, -50%) scale(0); opacity: 0.8; }
        100% { transform: translate(-50%, -50%) scale(7); opacity: 0; }
      }
      .svc-icon-ripple {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 12px;
        height: 12px;
        background: rgba(197, 171, 98, 0.35);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        animation: svcRipple 0.55s ease-out forwards;
        pointer-events: none;
        z-index: 0;
      }
    `;
    document.head.appendChild(style);
  }

  cards.forEach((card) => {
    const iconWrap = card.querySelector('.svc-card__icon-wrap');
    if (!iconWrap) return;

    card.addEventListener('mouseenter', () => {
      iconWrap.querySelector('.svc-icon-ripple')?.remove();

      const ripple = document.createElement('span');
      ripple.className = 'svc-icon-ripple';
      iconWrap.appendChild(ripple);

      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
  });
}


/* ================================================================
   4. PROCESS STEPS — Sequential Highlight on Scroll
================================================================ */
function initProcessStepsHighlight() {
  const section = document.querySelector('.svc-process');
  const steps   = document.querySelectorAll('.svc-process__step');
  if (!section || !steps.length) return;
  if (prefersReducedMotion()) return;

  let animated = false;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || animated) return;
      animated = true;

      steps.forEach((step, i) => {
        setTimeout(() => {
          step.style.transition  = 'background 0.4s ease, border-color 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
          step.style.background  = 'rgba(255,255,255,0.09)';
          step.style.borderColor = 'rgba(197,171,98,0.30)';
          step.style.transform   = 'translateY(-4px)';

          setTimeout(() => {
            step.style.background  = '';
            step.style.borderColor = '';
            step.style.transform   = '';
            step.style.transition  = '';
          }, 600);

        }, i * 180);
      });

      observer.disconnect();
    },
    { threshold: 0.35 }
  );

  observer.observe(section);
}


/* ================================================================
   5. HERO RINGS — Mouse Parallax
================================================================ */
function initHeroRingsParallax() {
  const hero  = document.querySelector('.svc-hero');
  const rings = document.querySelectorAll('.svc-hero__ring');
  if (!hero || !rings.length) return;

  if (isTouchDevice() || prefersReducedMotion()) return;

  const multipliers = [0.015, 0.025, 0.035];

  hero.addEventListener('mousemove', (e) => {
    const rect    = hero.getBoundingClientRect();
    const centerX = rect.width  / 2;
    const centerY = rect.height / 2;
    const dx      = e.clientX - rect.left  - centerX;
    const dy      = e.clientY - rect.top   - centerY;

    rings.forEach((ring, i) => {
      const m     = multipliers[i] ?? 0.02;
      const moveX = dx * m;
      const moveY = dy * m;
      ring.style.transform  = `translateY(-50%) translate(${moveX}px, ${moveY}px)`;
      ring.style.transition = 'transform 0.5s ease-out';
    });
  });

  hero.addEventListener('mouseleave', () => {
    rings.forEach((ring) => {
      ring.style.transform  = 'translateY(-50%) translate(0, 0)';
      ring.style.transition = 'transform 0.9s ease-out';
    });
  });
}


/* ================================================================
   6. SPECIALTY CARDS — Staggered Entrance on Scroll
================================================================ */
function initSpecialtyStagger() {
  const cards = document.querySelectorAll('.specialty-card');
  if (!cards.length) return;
  if (prefersReducedMotion()) return;

  const grid = document.querySelector('.specialty__grid');
  if (!grid) return;

  cards.forEach((card, i) => {
    card.classList.add('specialty-card--hidden');
    card.style.transitionDelay = `${i * 0.08}s`;
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;

      cards.forEach((card) => {
        card.classList.remove('specialty-card--hidden');
      });

      const maxDelay = (cards.length - 1) * 80 + 550 + 50;
      setTimeout(() => {
        cards.forEach((card) => {
          card.style.transitionDelay = '';
        });
      }, maxDelay);

      observer.disconnect();
    },
    { threshold: 0.15 }
  );

  observer.observe(grid);
}


/* ================================================================
   7. TESTIMONIALS CAROUSEL
   ──────────────────────────────────────────────────────────────
   Características:
   · Slides en grupos (3 desktop / 2 tablet / 1 mobile)
   · Flechas prev/next con bucle infinito
   · Puntos de navegación generados automáticamente
   · Auto-play cada 5 s (pausa en hover y focus)
   · Soporte táctil (swipe left / right)
   · Movimiento desactivado si prefers-reduced-motion
================================================================ */
function initTestimonialsCarousel() {

  // ── Elementos del DOM ──────────────────────────────────────
  const track      = document.getElementById('testimonials-track');
  const outer      = document.getElementById('testimonials-outer');
  const prevBtn    = document.getElementById('test-prev');
  const nextBtn    = document.getElementById('test-next');
  const dotsWrap   = document.getElementById('testimonials-dots');
  const wrapper    = document.querySelector('.testimonials__carousel-wrapper');

  if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

  const cards      = Array.from(track.querySelectorAll('.testimonial-card'));
  const totalCards = cards.length;
  if (totalCards === 0) return;

  // ── Estado ──────────────────────────────────────────────────
  let currentIndex = 0;   // índice del primer card visible
  let autoPlayTimer = null;
  const AUTOPLAY_DELAY = 5000; // ms

  // ── Calcular cuántas cards son visibles según viewport ──────
  function getVisibleCount() {
    const w = window.innerWidth;
    if (w <= 640)  return 1;
    if (w <= 1024) return 2;
    return 3;
  }

  // ── Número total de "páginas" (grupos de cards) ─────────────
  function getTotalPages() {
    return Math.ceil(totalCards / getVisibleCount());
  }

  // ── Número de página actual ──────────────────────────────────
  function getCurrentPage() {
    return Math.floor(currentIndex / getVisibleCount());
  }

  // ── Calcular el ancho de cada card en px ────────────────────
  function getCardWidth() {
    const visible  = getVisibleCount();
    const gap      = parseFloat(getComputedStyle(track).gap) || 24;
    const outerW   = outer.getBoundingClientRect().width;
    return (outerW - gap * (visible - 1)) / visible;
  }

  // ── Mover el track al índice indicado ───────────────────────
  function goTo(index) {
    const visible   = getVisibleCount();
    const maxIndex  = Math.max(0, totalCards - visible);
    currentIndex    = Math.max(0, Math.min(index, maxIndex));

    const gap       = parseFloat(getComputedStyle(track).gap) || 24;
    const cardW     = getCardWidth();
    const offset    = currentIndex * (cardW + gap);

    if (prefersReducedMotion()) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.50s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    track.style.transform = `translateX(-${offset}px)`;

    updateDots();
    updateArrows();
  }

  // ── Actualizar estado visual de los dots ─────────────────────
  function updateDots() {
    const page = getCurrentPage();
    dotsWrap.querySelectorAll('.testimonials__dot').forEach((dot, i) => {
      const isActive = i === page;
      dot.classList.toggle('testimonials__dot--active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      dot.setAttribute('aria-label', `Review group ${i + 1}`);
    });
  }

  // ── Actualizar estado visual de las flechas ──────────────────
  function updateArrows() {
    const visible  = getVisibleCount();
    const maxIndex = Math.max(0, totalCards - visible);
    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= maxIndex;
    prevBtn.style.opacity = prevBtn.disabled ? '0.40' : '1';
    nextBtn.style.opacity = nextBtn.disabled ? '0.40' : '1';
  }

  // ── Generar puntos de navegación ────────────────────────────
  function buildDots() {
    dotsWrap.innerHTML = '';
    const pages = getTotalPages();

    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.className    = 'testimonials__dot';
      dot.role         = 'tab';
      dot.setAttribute('aria-label', `Review group ${i + 1}`);
      dot.setAttribute('aria-selected', 'false');

      dot.addEventListener('click', () => {
        stopAutoPlay();
        goTo(i * getVisibleCount());
        startAutoPlay();
      });

      dotsWrap.appendChild(dot);
    }
  }

  // ── Recalcular todo al cambiar el viewport ──────────────────
  function recalculate() {
    // Forzar ancho correcto en cada card via CSS custom property
    const cardW   = getCardWidth();
    const gap     = parseFloat(getComputedStyle(track).gap) || 24;
    const visible = getVisibleCount();

    cards.forEach((card) => {
      card.style.flex = `0 0 ${cardW}px`;
    });

    buildDots();
    goTo(currentIndex); // reposicionar sin animación
  }

  // ── Auto-play ────────────────────────────────────────────────
  function startAutoPlay() {
    if (prefersReducedMotion()) return;

    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      const visible  = getVisibleCount();
      const maxIndex = Math.max(0, totalCards - visible);

      if (currentIndex >= maxIndex) {
        goTo(0); // bucle infinito
      } else {
        goTo(currentIndex + visible);
      }
    }, AUTOPLAY_DELAY);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  // ── Event listeners — Flechas ────────────────────────────────
  prevBtn.addEventListener('click', () => {
    stopAutoPlay();
    goTo(currentIndex - getVisibleCount());
    startAutoPlay();
  });

  nextBtn.addEventListener('click', () => {
    stopAutoPlay();
    goTo(currentIndex + getVisibleCount());
    startAutoPlay();
  });

  // ── Pausa al hover / focus ────────────────────────────────────
  if (wrapper) {
    wrapper.addEventListener('mouseenter', stopAutoPlay);
    wrapper.addEventListener('mouseleave', startAutoPlay);
    wrapper.addEventListener('focusin',    stopAutoPlay);
    wrapper.addEventListener('focusout',   startAutoPlay);
  }

  // ── Soporte táctil (swipe) ────────────────────────────────────
  let touchStartX = 0;
  let touchEndX   = 0;
  const SWIPE_THRESHOLD = 50; // px mínimos para considerar swipe

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const delta = touchStartX - touchEndX;

    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      stopAutoPlay();
      if (delta > 0) {
        goTo(currentIndex + getVisibleCount()); // swipe izquierda → siguiente
      } else {
        goTo(currentIndex - getVisibleCount()); // swipe derecha → anterior
      }
      startAutoPlay();
    }
  }, { passive: true });

  // ── Resize: recalcular responsive ────────────────────────────
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      currentIndex = 0; // reset al cambiar breakpoint
      recalculate();
    }, 200);
  });

  // ── Inicialización ───────────────────────────────────────────
  recalculate();
  startAutoPlay();
}