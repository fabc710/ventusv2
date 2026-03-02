/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — Services Page JavaScript
 * File: js/services.js
 * Description: Interactions exclusive to services.html
 *
 * TABLE OF CONTENTS
 * 1.  DOMContentLoaded Init
 * 2.  Service Stats Counter Animation
 * 3.  Service Cards — Hover Icon Ripple Effect
 * 4.  Process Steps — Sequential Highlight on Scroll
 * 5.  Hero Rings — Mouse Parallax
 * 6.  Specialty Cards — Staggered Entrance
 * ================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initServiceStatsCounter();
  initServiceCardRipple();
  initProcessStepsHighlight();
  initHeroRingsParallax();
  initSpecialtyStagger();
});


/* ================================================================
   2. SERVICE STATS COUNTER ANIMATION
   Counts .svc-stat-item__value elements from 0 → data-target
   using easeOutQuart and requestAnimationFrame.
================================================================ */
function initServiceStatsCounter() {
  const statValues = document.querySelectorAll('.svc-stat-item__value[data-target]');
  if (!statValues.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);

        if (prefersReduced) {
          el.textContent = target.toLocaleString();
        } else {
          animateSvcCounter(el, target);
        }

        observer.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );

  statValues.forEach((el) => observer.observe(el));
}

/**
 * Animates counter with easeOutQuart.
 * @param {Element} el
 * @param {number}  target
 * @param {number}  duration ms
 */
function animateSvcCounter(el, target, duration = 1800) {
  const start = performance.now();

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  (function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value    = Math.round(easeOutQuart(progress) * target);

    el.textContent = value.toLocaleString();

    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  })(start);
}


/* ================================================================
   3. SERVICE CARDS — Hover Icon Ripple Effect
   Creates a subtle ripple burst from the icon on mouse-enter.
   Pure JS — no external libraries required.
================================================================ */
function initServiceCardRipple() {
  const cards = document.querySelectorAll('.svc-card');
  if (!cards.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  cards.forEach((card) => {
    const iconWrap = card.querySelector('.svc-card__icon-wrap');
    if (!iconWrap) return;

    card.addEventListener('mouseenter', () => {
      // Remove any existing ripple first
      const old = iconWrap.querySelector('.svc-icon-ripple');
      if (old) old.remove();

      const ripple = document.createElement('span');
      ripple.className = 'svc-icon-ripple';
      ripple.style.cssText = `
        position: absolute;
        top: 50%; left: 50%;
        width: 10px; height: 10px;
        background: rgba(197,171,98,0.30);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        animation: svcRipple 0.55s ease-out forwards;
        pointer-events: none;
      `;

      // Make icon wrap relative if not already
      if (getComputedStyle(iconWrap).position === 'static') {
        iconWrap.style.position = 'relative';
        iconWrap.style.overflow = 'hidden';
      }

      iconWrap.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // Inject keyframe dynamically (once)
  if (!document.getElementById('svc-ripple-style')) {
    const style = document.createElement('style');
    style.id = 'svc-ripple-style';
    style.textContent = `
      @keyframes svcRipple {
        0%   { transform: translate(-50%,-50%) scale(0); opacity: 1; }
        100% { transform: translate(-50%,-50%) scale(7); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}


/* ================================================================
   4. PROCESS STEPS — Sequential Highlight on Scroll
   As the process section enters the viewport, steps
   illuminate one-by-one with a staggered delay.
================================================================ */
function initProcessStepsHighlight() {
  const section = document.querySelector('.svc-process');
  const steps   = document.querySelectorAll('.svc-process__step');
  if (!section || !steps.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let animated = false;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || animated) return;
      animated = true;

      steps.forEach((step, i) => {
        setTimeout(() => {
          step.style.transition = 'background 0.4s ease, border-color 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
          step.style.background = 'rgba(255,255,255,0.09)';
          step.style.borderColor = 'rgba(197,171,98,0.30)';
          step.style.transform = 'translateY(-4px)';

          // Reset back after a moment
          setTimeout(() => {
            step.style.background  = '';
            step.style.borderColor = '';
            step.style.transform   = '';
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
   The decorative rings in the hero respond gently to mouse
   movement for a subtle depth / floating effect.
================================================================ */
function initHeroRingsParallax() {
  const hero  = document.querySelector('.svc-hero');
  const rings = document.querySelectorAll('.svc-hero__ring');
  if (!hero || !rings.length) return;

  const isTouch        = window.matchMedia('(hover: none)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isTouch || prefersReduced) return;

  // Different movement multipliers per ring for layered depth
  const multipliers = [0.015, 0.025, 0.035];

  hero.addEventListener('mousemove', (e) => {
    const rect    = hero.getBoundingClientRect();
    const centerX = rect.width  / 2;
    const centerY = rect.height / 2;
    const dx      = e.clientX - rect.left  - centerX;
    const dy      = e.clientY - rect.top   - centerY;

    rings.forEach((ring, i) => {
      const m     = multipliers[i] || 0.02;
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
   The 6 specialty cards reveal in a wave pattern using
   IntersectionObserver + staggered transition-delay.
================================================================ */
function initSpecialtyStagger() {
  const cards = document.querySelectorAll('.specialty-card');
  if (!cards.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Set initial hidden state
  cards.forEach((card, i) => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition =
      `opacity 0.55s ease ${i * 0.08}s,` +
      `transform 0.55s cubic-bezier(0.25, 0.8, 0.25, 1) ${i * 0.08}s`;
  });

  const grid = document.querySelector('.specialty__grid');
  if (!grid) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      cards.forEach((card) => {
        card.style.opacity   = '1';
        card.style.transform = 'translateY(0)';
      });
      observer.disconnect();
    },
    { threshold: 0.15 }
  );

  observer.observe(grid);
}