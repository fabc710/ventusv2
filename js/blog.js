/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — Blog Page JavaScript
 * File: js/blog.js
 * Version: 2.0 — Bug fixes applied
 *
 * FIXES IN THIS VERSION:
 * 1. initCardTilt: (hover:none) → isTouchDevice() usando
 *    (hover:none),(pointer:coarse) — confiable en híbridos.
 * 2. initCardEntrance: Eliminado inline opacity:0 al DOMContentLoaded
 *    (FOIC). Ahora usa clase CSS .blog-card--hidden igual que los
 *    fixes aplicados en services.js y about.js.
 *    Requiere en CSS:
 *      .blog-card--hidden { opacity:0; transform:translateY(28px); }
 *      .blog-card { transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.25,0.8,0.25,1); }
 * 3. initCardTilt: will-change ahora se limpia en mouseleave con
 *    setTimeout para no dejar el hint de GPU activo permanentemente
 *    en todos los cards (consumo de memoria innecesario).
 * 4. initNewsletterForm: Reemplazados los selectores frágiles
 *    .newsletter__field:nth-child(2) y :nth-child(3) por atributos
 *    data-nl-field="name" y data-nl-field="email" para que sean
 *    robustos ante cambios de estructura del HTML.
 *    REQUIERE agregar data-nl-field="name" y data-nl-field="email"
 *    a los .newsletter__field correspondientes en el HTML.
 *
 * TABLE OF CONTENTS
 * 1.  Init
 * 2.  Newsletter Form — Validation & Submit
 * 3.  Reading Progress Bar
 * 4.  Blog Cards — Subtle Tilt on Hover (desktop)
 * 5.  Blog Cards — Scroll Entrance (mobile-safe)
 * ================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initNewsletterForm();
  initReadingProgress();
  initCardTilt();
  initCardEntrance();
});


/* ================================================================
   UTILITY HELPERS
================================================================ */

/**
 * Devuelve true si el dispositivo es principalmente touch.
 * (hover:none),(pointer:coarse) cubre híbridos correctamente.
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
   2. NEWSLETTER FORM — Validation & Async Submit
   FIX 4: Reemplazados los selectores posicionales nth-child(2/3)
   por data-nl-field="name" y data-nl-field="email" — robustos
   ante cualquier cambio de estructura en el HTML del formulario.

   REQUIERE en el HTML — agregar los atributos data-nl-field a los
   wrappers .newsletter__field correspondientes:
   ─────────────────────────────────────────────
   <div class="newsletter__field" data-nl-field="name"> ... </div>
   <div class="newsletter__field" data-nl-field="email"> ... </div>
   ─────────────────────────────────────────────
================================================================ */
function initNewsletterForm() {
  const form      = document.getElementById('newsletter-form');
  const successEl = document.getElementById('nl-success');
  const submitBtn = document.getElementById('nl-submit');
  if (!form) return;

  const nameInput  = document.getElementById('nl-name');
  const emailInput = document.getElementById('nl-email');
  const nlText     = submitBtn?.querySelector('.nl-text');
  const nlLoading  = submitBtn?.querySelector('.nl-loading');

  /* ── Submit ── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    // Simula envío asíncrono (reemplazar con endpoint real si se necesita)
    await new Promise((r) => setTimeout(r, 1400));

    setLoading(false);

    // FIX 4: Selectores robustos por data attribute en lugar de nth-child posicional
    const nameField  = form.querySelector('[data-nl-field="name"]');
    const emailField = form.querySelector('[data-nl-field="email"]');
    const privacy    = form.querySelector('.newsletter__privacy');

    if (nameField)  nameField.style.display  = 'none';
    if (emailField) emailField.style.display = 'none';
    if (privacy)    privacy.style.display    = 'none';
    if (submitBtn)  submitBtn.style.display  = 'none';

    if (successEl) successEl.removeAttribute('hidden');

    form.reset();
  });

  /* ── Live feedback ── */
  nameInput?.addEventListener('blur',  () => validateField(nameInput,  'nl-name-error',  nameRules));
  emailInput?.addEventListener('blur', () => validateField(emailInput, 'nl-email-error', emailRules));

  [nameInput, emailInput].forEach((inp) => {
    inp?.addEventListener('input', () => inp.classList.remove('is-invalid', 'is-valid'));
  });

  /* ── Helpers ── */
  function validate() {
    const a = validateField(nameInput,  'nl-name-error',  nameRules);
    const b = validateField(emailInput, 'nl-email-error', emailRules);
    return a && b;
  }

  function nameRules(v) {
    return v.trim().length >= 2 ? null : 'Please enter your first name.';
  }

  function emailRules(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? null
      : 'Please enter a valid email address.';
  }

  function validateField(input, errorId, rule) {
    if (!input) return true;
    const msg   = rule(input.value);
    const errEl = document.getElementById(errorId);
    if (msg) {
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      if (errEl) { errEl.textContent = msg; errEl.removeAttribute('hidden'); }
      return false;
    } else {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      if (errEl) { errEl.textContent = ''; errEl.setAttribute('hidden', ''); }
      return true;
    }
  }

  function setLoading(on) {
    if (!submitBtn) return;
    submitBtn.disabled = on;
    if (nlText)    nlText.hidden    =  on;
    if (nlLoading) nlLoading.hidden = !on;
  }
}


/* ================================================================
   3. READING PROGRESS BAR
   Barra dorada delgada fijada al tope del viewport.
   Sin cambios — la lógica original es correcta.
================================================================ */
function initReadingProgress() {
  if (prefersReducedMotion()) return;

  const bar = document.createElement('div');
  bar.id = 'blog-progress';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Page reading progress');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', '0');
  bar.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'height:3px',
    'width:0%',
    'background:linear-gradient(90deg,#a58533,#c5ab62,#ffdd88)',
    'z-index:99999',
    'transition:width 0.12s linear',
    'border-radius:0 2px 2px 0',
    'pointer-events:none',
  ].join(';');

  document.body.prepend(bar);

  let raf = false;

  window.addEventListener(
    'scroll',
    () => {
      if (!raf) {
        requestAnimationFrame(() => {
          const max      = document.documentElement.scrollHeight - window.innerHeight;
          const progress = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
          bar.style.width = `${progress}%`;
          bar.setAttribute('aria-valuenow', String(progress));
          raf = false;
        });
        raf = true;
      }
    },
    { passive: true }
  );
}


/* ================================================================
   4. BLOG CARDS — Subtle 3D Tilt on Hover (desktop only)
   FIX 1: (hover:none) → isTouchDevice() con (hover:none),(pointer:coarse).
   FIX 3: will-change limpiado en mouseleave con setTimeout(500ms)
          para no dejar el hint de GPU activo permanentemente.
================================================================ */
function initCardTilt() {
  // FIX 1: detección touch confiable
  if (isTouchDevice() || prefersReducedMotion()) return;

  document.querySelectorAll('.blog-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r  = card.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const tx = ((e.clientY - cy) / (r.height / 2)) * -3.5;
      const ty = ((e.clientX - cx) / (r.width  / 2)) *  3.5;

      card.style.transform  = `perspective(900px) rotateX(${tx}deg) rotateY(${ty}deg) translateY(-8px)`;
      card.style.transition = 'transform 0.08s linear';
      card.style.willChange = 'transform'; // hint de GPU solo mientras hay movimiento
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
      card.style.transition = 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1)';

      // FIX 3: limpiar willChange después de que termine la transición
      // para liberar el hint de GPU en lugar de dejarlo activo siempre
      setTimeout(() => {
        card.style.willChange = '';
      }, 550);
    });
  });
}


/* ================================================================
   5. BLOG CARDS — Staggered Scroll Entrance
   FIX 2: Eliminado inline opacity:0 al DOMContentLoaded (FOIC).
   Ahora usa clase CSS .blog-card--hidden para el estado inicial.

   REQUIERE en tu CSS (blog.css o index.css):
   ─────────────────────────────────────────────
   .blog-card--hidden {
     opacity: 0;
     transform: translateY(28px);
   }
   .blog-card {
     transition: opacity 0.55s ease,
                 transform 0.55s cubic-bezier(0.25, 0.8, 0.25, 1);
   }
   ─────────────────────────────────────────────
================================================================ */
function initCardEntrance() {
  const cards = document.querySelectorAll('.blog-card');
  if (!cards.length || !('IntersectionObserver' in window)) return;
  if (prefersReducedMotion()) return;

  const grid = document.querySelector('.blog-grid');
  if (!grid) return;

  // FIX 2: clase CSS en lugar de inline opacity:0 (evita FOIC)
  cards.forEach((card, i) => {
    card.classList.add('blog-card--hidden');
    card.style.transitionDelay = `${i * 0.12}s`;
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;

      cards.forEach((card) => {
        card.classList.remove('blog-card--hidden');
      });

      // Limpiar transition-delay inline después de que la animación termine
      // para no interferir con futuras transiciones del elemento
      const maxDelay = (cards.length - 1) * 120 + 550 + 50;
      setTimeout(() => {
        cards.forEach((card) => {
          card.style.transitionDelay = '';
        });
      }, maxDelay);

      observer.disconnect();
    },
    { threshold: 0.10 }
  );

  observer.observe(grid);
}