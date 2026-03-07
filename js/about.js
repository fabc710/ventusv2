/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — About Us JavaScript
 * File: js/about.js
 * Version: 3.0 — Bug fixes applied
 *
 * FIXES IN THIS VERSION:
 * 1. initTeamCardTilt: (hover:none) → isTouchDevice() usando
 *    (hover:none),(pointer:coarse) — confiable en híbridos.
 * 2. initHeroParallax: misma corrección de detección touch.
 * 3. initStoryImageParallax: misma corrección de detección touch.
 * 4. initMarqueeControl: misma corrección de detección touch.
 * 5. initMVVStagger + initTrustBadgeEntrance: eliminado inline
 *    opacity:0 al DOMContentLoaded (FOIC). Ahora usan clases CSS
 *    --hidden para el estado inicial, igual que services.js Fix 4.
 *    Requiere en CSS:
 *      .mvv-card--hidden    { opacity:0; transform:translateY(28px); }
 *      .trust-badge--hidden { opacity:0; transform:translateY(20px); }
 *      .mvv-card    { transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.25,0.8,0.25,1); }
 *      .trust-badge { transition: opacity 0.5s ease, transform 0.5s ease; }
 * 6. initTimelineHighlight: el bloque else ahora limpia también
 *    dot.style.transition, year.style.transition y
 *    content.style.transition — evita que el inline style bloquee
 *    hovers del CSS después de salir del viewport.
 *
 * TABLE OF CONTENTS
 * 1.  DOMContentLoaded Init
 * 2.  Utility Helpers
 * 3.  Timeline — Scroll Reveal with Progress Highlight
 * 4.  Team Cards — Tilt Effect on Hover
 * 5.  Marquee — Single-Row Control (reduced motion / touch)
 * 6.  MVV Cards — Entrance Stagger
 * 7.  Trust Badges — Entrance Animation
 * 8.  Page Hero Shapes — Parallax on Mouse Move
 * 9.  Story Section — Image Parallax on Scroll
 * ================================================================
 *
 * NOTE: All shared functionality (navbar scroll, hamburger, mobile
 * menu, AOS, back-to-top, current year, smooth scroll, dropdown)
 * is handled by js/index.js loaded on this page.
 * This file handles ONLY about.html-specific interactions.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initTimelineHighlight();
  initTeamCardTilt();
  initMarqueeControl();
  initMVVStagger();
  initTrustBadgeEntrance();
  initHeroParallax();
  initStoryImageParallax();
});


/* ================================================================
   2. UTILITY HELPERS
================================================================ */

/**
 * Devuelve true si el dispositivo es principalmente touch.
 * (hover:none),(pointer:coarse) cubre híbridos correctamente:
 * laptops con pantalla táctil, tablets con teclado, etc.
 */
function isTouchDevice() {
  return window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

/**
 * Devuelve true si el usuario prefiere movimiento reducido.
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}


/* ================================================================
   3. TIMELINE — Active Highlight on Scroll
   FIX 6: El bloque else ahora limpia TODAS las inline transitions
   (dot, year, content) para no bloquear futuros hovers del CSS.
================================================================ */
function initTimelineHighlight() {
  const items = document.querySelectorAll('.timeline__item');
  if (!items.length) return;

  const reduced = prefersReducedMotion();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const dot     = entry.target.querySelector('.timeline__dot');
        const content = entry.target.querySelector('.timeline__content');
        const year    = entry.target.querySelector('.timeline__year');

        if (entry.isIntersecting) {
          entry.target.classList.add('timeline__item--visible');

          if (!reduced && dot) {
            dot.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
            dot.style.transform  = 'scale(1.4)';
            setTimeout(() => {
              dot.style.transform = 'scale(1)';
            }, 400);
          }

          if (year) {
            year.style.transition  = 'color 0.3s ease, font-weight 0.3s ease';
            year.style.color       = 'var(--color-gold-dark)';
            year.style.fontWeight  = '900';
          }

          if (content) {
            content.style.transition  = 'border-color 0.4s ease, box-shadow 0.4s ease';
            content.style.borderColor = 'rgba(197,171,98,0.45)';
            content.style.boxShadow   = '0 8px 32px rgba(18,33,71,0.12)';
          }

        } else {
          entry.target.classList.remove('timeline__item--visible');
          const isCurrent = entry.target.classList.contains('timeline__item--current');

          // FIX 6: limpiar TODOS los inline styles (incluido transition)
          // para no interferir con los hovers/estados del CSS
          if (dot) {
            dot.style.transform  = '';
            dot.style.transition = '';
          }

          if (year && !isCurrent) {
            year.style.color       = '';
            year.style.fontWeight  = '';
            year.style.transition  = ''; // FIX 6
          }

          if (content && !isCurrent) {
            content.style.borderColor = '';
            content.style.boxShadow   = '';
            content.style.transition  = ''; // FIX 6
          }
        }
      });
    },
    { threshold: 0.55, rootMargin: '0px 0px -10% 0px' }
  );

  items.forEach((item) => observer.observe(item));
}


/* ================================================================
   4. TEAM CARDS — Subtle 3D Tilt on Mouse Move
   FIX 1: Reemplazado (hover:none) por isTouchDevice() que usa
   (hover:none),(pointer:coarse) — más confiable en híbridos.
================================================================ */
function initTeamCardTilt() {
  const cards = document.querySelectorAll('.team-card');
  if (!cards.length) return;

  // FIX 1: detección touch confiable
  if (isTouchDevice() || prefersReducedMotion()) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', handleTilt);
    card.addEventListener('mouseleave', resetTilt);
  });

  function handleTilt(e) {
    const card    = e.currentTarget;
    const rect    = card.getBoundingClientRect();
    const centerX = rect.left + rect.width  / 2;
    const centerY = rect.top  + rect.height / 2;
    const mouseX  = e.clientX - centerX;
    const mouseY  = e.clientY - centerY;
    const maxTilt = 6;
    const tiltX   = (mouseY / (rect.height / 2)) * -maxTilt;
    const tiltY   = (mouseX / (rect.width  / 2)) *  maxTilt;

    card.style.transform  = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
    card.style.transition = 'transform 0.08s linear';
    card.style.willChange = 'transform';
  }

  function resetTilt(e) {
    const card = e.currentTarget;
    card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
    setTimeout(() => {
      card.style.willChange = '';
    }, 500);
  }
}


/* ================================================================
   5. MARQUEE — JS-driven right-to-left infinite scroll
   FIX 4: Reemplazado (hover:none) por isTouchDevice() que usa
   (hover:none),(pointer:coarse) — más confiable en híbridos.

   HOW IT WORKS:
   - CSS animation en .carriers__track es desactivada por JS.
   - JS mide halfWidth = scrollWidth / 2 (un set completo de logos).
   - Cada frame resta `speed` px a currentX (mueve a la izquierda).
   - Al llegar a halfWidth se resetea a 0 — loop seamless porque la
     segunda mitad del track es un duplicado exacto.

   FALLBACK (touch / reduced-motion):
   - Animación detenida, duplicados eliminados, grid estático.
================================================================ */
function initMarqueeControl() {
  const track   = document.querySelector('.carriers__track');
  const wrapper = document.querySelector('.carriers__marquee-wrapper');
  if (!track || !wrapper) return;

  const reduced = prefersReducedMotion();

  // FIX 4: detección touch confiable
  const isTouch = isTouchDevice();

  /* ── Static grid fallback (touch / reduced-motion) ── */
  if (reduced || isTouch) {
    track.style.animation      = 'none';
    track.style.flexWrap       = 'wrap';
    track.style.justifyContent = 'center';
    track.style.gap            = '1rem';
    track.style.width          = '100%';
    track.style.transform      = 'none';

    // Eliminar items duplicados (segunda mitad)
    const allItems = Array.from(track.querySelectorAll('.carrier__logo-item'));
    const half     = Math.ceil(allItems.length / 2);
    allItems.slice(half).forEach((item) => item.remove());

    // Color completo en vista estática
    track.querySelectorAll('.carrier__logo-item img').forEach((img) => {
      img.style.filter = 'none';
    });
    return;
  }

  /* ── Animated version: JS-driven RAF scroll ── */

  // Desactivar CSS @keyframes — JS toma el control
  track.style.animation  = 'none';
  track.style.willChange = 'transform';

  // Velocidad en px/frame (a 60 fps: 0.6 ≈ 36 px/s)
  const SPEED = 0.6;
  let currentX  = 0;
  let paused    = false;
  let rafId     = null;
  let halfWidth = 0;

  // Medir después del primer paint para que el layout esté completo
  requestAnimationFrame(() => {
    halfWidth = track.scrollWidth / 2;

    function tick() {
      if (!paused) {
        currentX -= SPEED;
        if (Math.abs(currentX) >= halfWidth) currentX = 0;
        track.style.transform = `translateX(${currentX}px)`;
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
  });

  /* ── Pause al hover sobre el wrapper ── */
  wrapper.addEventListener('mouseenter', () => { paused = true;  });
  wrapper.addEventListener('mouseleave', () => { paused = false; });

  /* ── Pause con foco de teclado (accesibilidad) ── */
  track.querySelectorAll('a, [tabindex]').forEach((link) => {
    link.addEventListener('focus', () => { paused = true;  });
    link.addEventListener('blur',  () => { paused = false; });
  });

  /* ── Stop RAF cuando la página está oculta (performance) ── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      function resumeTick() {
        if (!paused) {
          currentX -= SPEED;
          if (Math.abs(currentX) >= halfWidth) currentX = 0;
          track.style.transform = `translateX(${currentX}px)`;
        }
        rafId = requestAnimationFrame(resumeTick);
      }
      rafId = requestAnimationFrame(resumeTick);
    }
  });
}


/* ================================================================
   6. MVV CARDS — Entrance Stagger Animation
   FIX 5: Eliminado inline opacity:0 al DOMContentLoaded (FOIC).
   Ahora usa clase CSS .mvv-card--hidden para el estado inicial.

   REQUIERE en tu CSS (about.css o index.css):
   ─────────────────────────────────────────────
   .mvv-card--hidden {
     opacity: 0;
     transform: translateY(28px);
   }
   .mvv-card {
     transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.25,0.8,0.25,1);
   }
   ─────────────────────────────────────────────
================================================================ */
function initMVVStagger() {
  const cards = document.querySelectorAll('.mvv-card');
  if (!cards.length) return;
  if (prefersReducedMotion()) return;

  const mvvGrid = document.querySelector('.mvv__grid');
  if (!mvvGrid) return;

  // FIX 5: clase CSS en lugar de inline opacity:0
  cards.forEach((card, i) => {
    card.classList.add('mvv-card--hidden');
    card.style.transitionDelay = `${i * 0.15}s`;
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;

      cards.forEach((card) => {
        card.classList.remove('mvv-card--hidden');
      });

      // Limpiar transition-delay inline después de la animación
      const maxDelay = (cards.length - 1) * 150 + 600 + 50;
      setTimeout(() => {
        cards.forEach((card) => {
          card.style.transitionDelay = '';
        });
      }, maxDelay);

      observer.disconnect();
    },
    { threshold: 0.20 }
  );

  observer.observe(mvvGrid);
}


/* ================================================================
   7. TRUST BADGES — Entrance Animation
   FIX 5: Misma corrección que MVV Cards — clase CSS en lugar de
   inline opacity:0 para evitar FOIC.

   REQUIERE en tu CSS:
   ─────────────────────────────────────────────
   .trust-badge--hidden {
     opacity: 0;
     transform: translateY(20px);
   }
   .trust-badge {
     transition: opacity 0.5s ease, transform 0.5s ease;
   }
   ─────────────────────────────────────────────
================================================================ */
function initTrustBadgeEntrance() {
  const badges = document.querySelectorAll('.trust-badge');
  if (!badges.length) return;
  if (prefersReducedMotion()) return;

  const badgesWrapper = document.querySelector('.trust__badges');
  if (!badgesWrapper) return;

  // FIX 5: clase CSS en lugar de inline opacity:0
  badges.forEach((badge, i) => {
    badge.classList.add('trust-badge--hidden');
    badge.style.transitionDelay = `${i * 0.10}s`;
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;

      badges.forEach((badge) => {
        badge.classList.remove('trust-badge--hidden');
      });

      // Limpiar transition-delay inline después de la animación
      const maxDelay = (badges.length - 1) * 100 + 500 + 50;
      setTimeout(() => {
        badges.forEach((badge) => {
          badge.style.transitionDelay = '';
        });
      }, maxDelay);

      observer.disconnect();
    },
    { threshold: 0.25 }
  );

  observer.observe(badgesWrapper);
}


/* ================================================================
   8. PAGE HERO SHAPES — Parallax on Mouse Move
   FIX 2: Reemplazado (hover:none) por isTouchDevice() que usa
   (hover:none),(pointer:coarse) — más confiable en híbridos.
================================================================ */
function initHeroParallax() {
  const hero   = document.querySelector('.page-hero');
  const shapes = document.querySelectorAll('.page-hero__shape');
  if (!hero || !shapes.length) return;

  // FIX 2: detección touch confiable
  if (isTouchDevice() || prefersReducedMotion()) return;

  const depths = [0.018, 0.012, 0.025];

  hero.addEventListener('mousemove', (e) => {
    const rect    = hero.getBoundingClientRect();
    const centerX = rect.width  / 2;
    const centerY = rect.height / 2;
    const offsetX = e.clientX - rect.left - centerX;
    const offsetY = e.clientY - rect.top  - centerY;

    shapes.forEach((shape, i) => {
      const depth = depths[i] ?? 0.015;
      shape.style.transform  = `translate(${offsetX * depth}px, ${offsetY * depth}px)`;
      shape.style.transition = 'transform 0.4s ease-out';
    });
  });

  hero.addEventListener('mouseleave', () => {
    shapes.forEach((shape) => {
      shape.style.transform  = 'translate(0, 0)';
      shape.style.transition = 'transform 0.8s ease-out';
    });
  });
}


/* ================================================================
   9. STORY SECTION — Image Subtle Parallax on Scroll
   FIX 3: Reemplazado (hover:none) por isTouchDevice() que usa
   (hover:none),(pointer:coarse) — más confiable en híbridos.
================================================================ */
function initStoryImageParallax() {
  const imgMain = document.querySelector('.story__img-main img');
  if (!imgMain) return;

  // FIX 3: detección touch confiable
  if (prefersReducedMotion() || isTouchDevice()) return;

  let ticking = false;

  function updateParallax() {
    const section = imgMain.closest('.story-section');
    if (!section) return;

    const rect       = section.getBoundingClientRect();
    const viewHeight = window.innerHeight;

    if (rect.bottom < 0 || rect.top > viewHeight) {
      ticking = false;
      return;
    }

    const progress = 1 - rect.bottom / (viewHeight + rect.height);
    const shift    = (progress - 0.5) * 30;

    imgMain.style.transform  = `translateY(${shift}px) scale(1.04)`;
    imgMain.style.transition = 'transform 0.1s linear';
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateParallax();
}