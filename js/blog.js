/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — Blog Page JavaScript
 * File: js/blog.js
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
   2. NEWSLETTER FORM — Validation & Async Submit
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

    // Simulate async send (replace with real endpoint if needed)
    await new Promise(r => setTimeout(r, 1400));

    setLoading(false);

    // Show success, hide form fields
    form.querySelector('.newsletter__field:nth-child(2)').style.display = 'none';
    form.querySelector('.newsletter__field:nth-child(3)').style.display = 'none';
    submitBtn.style.display = 'none';
    form.querySelector('.newsletter__privacy').style.display = 'none';
    if (successEl) successEl.removeAttribute('hidden');

    form.reset();
  });

  /* ── Live feedback ── */
  nameInput?.addEventListener('blur',  () => validateField(nameInput,  'nl-name-error',  nameRules));
  emailInput?.addEventListener('blur', () => validateField(emailInput, 'nl-email-error', emailRules));
  [nameInput, emailInput].forEach(inp => {
    inp?.addEventListener('input', () => inp.classList.remove('is-invalid', 'is-valid'));
  });

  /* ── Helpers ── */
  function validate() {
    const a = validateField(nameInput,  'nl-name-error',  nameRules);
    const b = validateField(emailInput, 'nl-email-error', emailRules);
    return a && b;
  }

  function nameRules(v)  { return v.trim().length >= 2 ? null : 'Please enter your first name.'; }
  function emailRules(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? null : 'Please enter a valid email address.';
  }

  function validateField(input, errorId, rule) {
    if (!input) return true;
    const msg = rule(input.value);
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
    if (nlText)    nlText.hidden    = on;
    if (nlLoading) nlLoading.hidden = !on;
  }
}


/* ================================================================
   3. READING PROGRESS BAR
   Thin gold bar pinned to top of viewport.
================================================================ */
function initReadingProgress() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

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
  window.addEventListener('scroll', () => {
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
  }, { passive: true });
}


/* ================================================================
   4. BLOG CARDS — Subtle 3D Tilt on Hover (desktop only)
================================================================ */
function initCardTilt() {
  const isTouch        = window.matchMedia('(hover: none)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isTouch || prefersReduced) return;

  document.querySelectorAll('.blog-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const tx = ((e.clientY - cy) / (r.height / 2)) * -3.5;
      const ty = ((e.clientX - cx) / (r.width  / 2)) *  3.5;
      card.style.transform  = `perspective(900px) rotateX(${tx}deg) rotateY(${ty}deg) translateY(-8px)`;
      card.style.transition = 'transform 0.08s linear';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
      card.style.transition = 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1)';
    });
  });
}


/* ================================================================
   5. BLOG CARDS — Staggered Scroll Entrance
   Falls back gracefully if IntersectionObserver unavailable.
================================================================ */
function initCardEntrance() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = document.querySelectorAll('.blog-card');
  if (!cards.length || !('IntersectionObserver' in window)) return;

  if (prefersReduced) return;

  cards.forEach((card, i) => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(28px)';
    card.style.transition = `opacity 0.55s ease ${i * 0.12}s, transform 0.55s cubic-bezier(0.25,0.8,0.25,1) ${i * 0.12}s`;
  });

  const grid = document.querySelector('.blog-grid');
  if (!grid) return;

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    cards.forEach(card => {
      card.style.opacity   = '1';
      card.style.transform = 'translateY(0)';
    });
    observer.disconnect();
  }, { threshold: 0.10 });

  observer.observe(grid);
}