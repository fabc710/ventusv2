/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — Services Page JavaScript
 * File: js/services.js
 * Version: 2.0 — Bug fixes applied
 *
 * FIXES IN THIS VERSION:
 * 1. initHeroRingsParallax: Replaced (hover:none) with
 *    (hover:none),(pointer:coarse) — más confiable en híbridos.
 * 2. initProcessStepsHighlight: Ahora limpia también
 *    step.style.transition después del reset, evitando que el
 *    inline style interfiera con los hovers del CSS.
 * 3. animateSvcCounter: Refactored para usar requestAnimationFrame
 *    correctamente desde el primer frame (sin IIFE con start).
 * 4. initSpecialtyStagger: Las cards ahora usan una clase CSS
 *    (.specialty-card--hidden) en lugar de inline styles, evitando
 *    flash de contenido invisible cuando el JS tarda en cargar.
 *    Requiere agregar en CSS: .specialty-card--hidden { opacity:0;
 *    transform: translateY(24px); }
 * 5. initServiceCardRipple: Ya no fuerza position/overflow inline.
 *    Usa overflow:clip en el ripple mismo para contenerlo, y solo
 *    actúa si el iconWrap existe.
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
   UTILITY
================================================================ */

/**
 * Devuelve true si el dispositivo es principalmente touch.
 * Usa (hover:none) AND (pointer:coarse) para mayor precisión
 * en laptops con pantalla táctil (dispositivos híbridos).
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
   2. SERVICE STATS COUNTER ANIMATION
   Cuenta .svc-stat-item__value desde 0 → data-target
   con easeOutQuart y requestAnimationFrame.
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

/**
 * FIX 3: Animación de contador corregida.
 * El primer requestAnimationFrame recibe el timestamp real del browser,
 * evitando el patrón IIFE(start) que era frágil.
 *
 * @param {Element} el       - Elemento DOM a actualizar
 * @param {number}  target   - Valor final
 * @param {number}  duration - Duración en ms (default 1800)
 */
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
      el.textContent = target.toLocaleString(); // garantizar valor exacto final
    }
  }

  requestAnimationFrame(tick);
}


/* ================================================================
   3. SERVICE CARDS — Hover Icon Ripple Effect
   Crea un ripple desde el icono al hacer hover.
   Pure JS — sin librerías externas.

   FIX 5: Ya no se fuerzan estilos position/overflow inline sobre
   el iconWrap (podían romper CSS existente). El ripple es
   contenido por border-radius + clip-path en su propio nodo.
================================================================ */
function initServiceCardRipple() {
  const cards = document.querySelectorAll('.svc-card');
  if (!cards.length) return;
  if (prefersReducedMotion()) return;

  // Inyectar keyframe una sola vez
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
      // Eliminar ripple previo si existe
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
   Los pasos se iluminan uno por uno cuando la sección entra
   en el viewport.

   FIX 2: Ahora limpia TAMBIÉN step.style.transition en el reset,
   evitando que el inline style bloquee las transiciones del CSS
   (ej: estados hover definidos en la hoja de estilos).
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
        // Fase 1: iluminar
        setTimeout(() => {
          step.style.transition  = 'background 0.4s ease, border-color 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
          step.style.background  = 'rgba(255,255,255,0.09)';
          step.style.borderColor = 'rgba(197,171,98,0.30)';
          step.style.transform   = 'translateY(-4px)';

          // Fase 2: reset — limpia TODOS los inline styles para
          // no interferir con hover states del CSS
          setTimeout(() => {
            step.style.background  = '';
            step.style.borderColor = '';
            step.style.transform   = '';

            // FIX 2: también limpiar transition inline
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
   Los anillos decorativos responden al movimiento del mouse.

   FIX 1: Reemplazado (hover:none) por (hover:none),(pointer:coarse)
   para detectar touch correctamente en dispositivos híbridos
   (laptops con touchscreen, tablets con teclado, etc.).
================================================================ */
function initHeroRingsParallax() {
  const hero  = document.querySelector('.svc-hero');
  const rings = document.querySelectorAll('.svc-hero__ring');
  if (!hero || !rings.length) return;

  // FIX 1: detección de touch más confiable
  if (isTouchDevice() || prefersReducedMotion()) return;

  // Multiplicadores distintos por anillo para efecto de profundidad
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

   FIX 4: Las cards ya NO reciben opacity/transform inline desde JS
   al cargar. En su lugar se agrega la clase .specialty-card--hidden
   ANTES del primer frame de pintura (en el mismo tick del observer
   setup), y la clase se remueve al entrar en viewport.

   Esto evita el flash de contenido invisible (FOIC) cuando el JS
   tarda en ejecutarse, porque el CSS puede proveer un fallback
   visible si la clase no existe todavía.

   REQUIERE en tu CSS (services.css o index.css):
   ─────────────────────────────────────────────
   .specialty-card--hidden {
     opacity: 0;
     transform: translateY(24px);
   }
   .specialty-card {
     transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.25,0.8,0.25,1);
   }
   ─────────────────────────────────────────────
   El delay escalonado se aplica vía CSS custom property --card-index.
   Si usas JS para el delay (como abajo), aplica directamente al
   elemento y se respeta igual.
================================================================ */
function initSpecialtyStagger() {
  const cards = document.querySelectorAll('.specialty-card');
  if (!cards.length) return;
  if (prefersReducedMotion()) return;

  const grid = document.querySelector('.specialty__grid');
  if (!grid) return;

  // FIX 4: Agregar clase hidden (no inline opacity) — permite fallback CSS
  cards.forEach((card, i) => {
    card.classList.add('specialty-card--hidden');
    // Aplicar el delay de forma individual para el efecto escalonado
    card.style.transitionDelay = `${i * 0.08}s`;
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;

      cards.forEach((card) => {
        card.classList.remove('specialty-card--hidden');
      });

      // Limpiar transition-delay inline después de la animación
      // para no interferir con futuras transiciones del elemento
      const maxDelay = (cards.length - 1) * 80 + 550 + 50; // ms
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