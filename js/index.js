/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — Main JavaScript
 * File: js/index.js
 * Version: 3.0 — Slider siempre activo, sin hover-pause
 * ================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initNavbarScrollDirection();
  initHamburger();
  initMobileMenu();
  initMobileAccordion();
  initDropdownKeyboard();
  initAOS();
  initStatsCounter();
  initBackToTop();
  initCurrentYear();
  initSmoothScroll();
  initScrollSpy();
  initHeroSlider();
});


/* ================================================================
   2. UTILITY HELPERS
================================================================ */
function throttle(fn, limit = 100) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= limit) { lastCall = now; fn.apply(this, args); }
  };
}

function qs(selector, context = document) {
  return context.querySelector(selector);
}

function qsAll(selector, context = document) {
  return context.querySelectorAll(selector);
}

function lockBodyScroll(lock) {
  document.body.style.overflow = lock ? 'hidden' : '';
}


/* ================================================================
   3. NAVBAR — SCROLL EFFECT
================================================================ */
function initNavbarScroll() {
  const navbar = qs('#navbar');
  if (!navbar) return;
  const handleScroll = throttle(() => {
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 80);
  }, 80);
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}


/* ================================================================
   4. HAMBURGER MENU TOGGLE
================================================================ */
function initHamburger() {
  const hamburger  = qs('#hamburger-btn');
  const mobileMenu = qs('#mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    toggleMobileMenu(!hamburger.classList.contains('is-active'), hamburger, mobileMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.classList.contains('is-active')) {
      toggleMobileMenu(false, hamburger, mobileMenu);
      hamburger.focus();
    }
  });
}


/* ================================================================
   5. MOBILE MENU
================================================================ */
function initMobileMenu() {
  const mobileMenu = qs('#mobile-menu');
  const overlay    = qs('#menu-overlay');
  const closeBtn   = qs('#menu-close-btn');
  const hamburger  = qs('#hamburger-btn');
  if (!mobileMenu) return;
  overlay?.addEventListener('click',  () => toggleMobileMenu(false, hamburger, mobileMenu));
  closeBtn?.addEventListener('click', () => { toggleMobileMenu(false, hamburger, mobileMenu); hamburger?.focus(); });
}

function toggleMobileMenu(open, hamburger, mobileMenu) {
  hamburger?.classList.toggle('is-active', open);
  mobileMenu.classList.toggle('is-open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  hamburger?.setAttribute('aria-expanded', String(open));
  lockBodyScroll(open);
}


/* ================================================================
   6. MOBILE ACCORDION
================================================================ */
function initMobileAccordion() {
  const btns = qsAll('.mobile-nav__accordion-btn');
  btns.forEach((btn) => {
    const sub = btn.nextElementSibling;
    if (!sub) return;
    btn.addEventListener('click', () => {
      const expanded = btn.classList.contains('is-expanded');
      btns.forEach((b) => {
        b.classList.remove('is-expanded');
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling?.classList.remove('is-open');
        b.nextElementSibling?.setAttribute('aria-hidden', 'true');
      });
      if (!expanded) {
        btn.classList.add('is-expanded');
        btn.setAttribute('aria-expanded', 'true');
        sub.classList.add('is-open');
        sub.setAttribute('aria-hidden', 'false');
      }
    });
  });
}


/* ================================================================
   7. DESKTOP DROPDOWN — KEYBOARD
================================================================ */
function initDropdownKeyboard() {
  qsAll('.nav__dropdown').forEach((dropdown) => {
    const trigger = qs('.nav__link--dropdown', dropdown);
    const menu    = qs('.dropdown__menu', dropdown);
    const items   = qsAll('.dropdown__item', dropdown);
    if (!trigger || !menu) return;

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const open = menu.style.opacity === '1'; setDropdownState(menu, !open); if (!open) items[0]?.focus(); }
      if (e.key === 'Escape') { setDropdownState(menu, false); trigger.focus(); }
    });

    items.forEach((item, i) => {
      item.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); items[i + 1]?.focus(); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); i === 0 ? (trigger.focus(), setDropdownState(menu, false)) : items[i - 1]?.focus(); }
        if (e.key === 'Escape')    { setDropdownState(menu, false); trigger.focus(); }
        if (e.key === 'Tab')       { setDropdownState(menu, false); }
      });
    });

    dropdown.addEventListener('focusout', (e) => {
      if (!dropdown.contains(e.relatedTarget)) setDropdownState(menu, false);
    });
  });
}

function setDropdownState(menu, open) {
  menu.style.opacity       = open ? '1' : '';
  menu.style.visibility    = open ? 'visible' : '';
  menu.style.transform     = open ? 'translateX(-50%) translateY(0)' : '';
  menu.style.pointerEvents = open ? 'auto' : '';
}


/* ================================================================
   8. AOS — ANIMATE ON SCROLL
================================================================ */
function initAOS() {
  const elements = qsAll('[data-aos]');
  if (!elements.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((el) => el.classList.add('aos-animate'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.aosDelay || '0', 10);
          setTimeout(() => entry.target.classList.add('aos-animate'), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}


/* ================================================================
   9. HERO STATS COUNTER
================================================================ */
function initStatsCounter() {
  const els = qsAll('.stat__number[data-target]');
  if (!els.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        reduced ? (el.textContent = target.toLocaleString()) : animateCounter(el, target);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 }).observe(...els);

  // observe each individually
  const obs2 = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        reduced ? (el.textContent = target.toLocaleString()) : animateCounter(el, target);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  els.forEach((el) => obs2.observe(el));
}

function animateCounter(el, target, duration = 2000) {
  const start = performance.now();
  const ease  = (t) => 1 - Math.pow(1 - t, 4);
  const step  = (now) => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(ease(p) * target).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(step);
}


/* ================================================================
   10. BACK TO TOP
================================================================ */
function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;
  const handle = throttle(() => btn.classList.toggle('is-visible', window.scrollY > 400), 100);
  window.addEventListener('scroll', handle, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  handle();
}


/* ================================================================
   11. CURRENT YEAR
================================================================ */
function initCurrentYear() {
  const el = qs('#current-year');
  if (el) el.textContent = new Date().getFullYear();
}


/* ================================================================
   12. SMOOTH SCROLL
================================================================ */
function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = qs(id);
    if (!target) return;
    e.preventDefault();
    const offset = (qs('#header')?.offsetHeight ?? 120) + 16;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    const mm = qs('#mobile-menu');
    if (mm?.classList.contains('is-open')) toggleMobileMenu(false, qs('#hamburger-btn'), mm);
  });
}


/* ================================================================
   13. NAVBAR HIDE ON SCROLL DOWN
================================================================ */
function initNavbarScrollDirection() {
  const header = qs('#header');
  if (!header) return;
  let last = window.scrollY, ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const cur  = window.scrollY;
        if (cur > 160) header.classList.toggle('header--topbar-hidden', cur > last);
        else           header.classList.remove('header--topbar-hidden');
        last    = cur <= 0 ? 0 : cur;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}


/* ================================================================
   14. HERO IMAGE SLIDER
   - El slider avanza SIEMPRE automáticamente cada 5 segundos.
   - No se pausa con el mouse ni con ningún evento de hover.
   - Solo el botón de pausa (⏸) puede detenerlo y reanudarlo.
   - Las flechas y dots cambian el slide sin interrumpir el timer.
   - Swipe táctil funciona en móvil y tablet.
================================================================ */
function initHeroSlider() {
  const slides       = qsAll('.hero__slide');
  const texts        = qsAll('.hero__slide-text');
  const dots         = qsAll('.hero__dot');
  const prevBtn      = qs('#hero-prev');
  const nextBtn      = qs('#hero-next');
  const pauseBtn     = qs('#hero-pause');
  const progressFill = qs('#hero-progress-fill');

  if (!slides.length) return;

  const TOTAL    = slides.length;
  const INTERVAL = 5000;

  let current  = 0;
  let isPaused = false;

  /* ── Cambiar al slide N ── */
  function goTo(index) {
    const prev = current;
    current = ((index % TOTAL) + TOTAL) % TOTAL;
    if (prev === current) return;

    slides[prev].classList.remove('is-active');
    slides[prev].classList.add('is-leaving');
    slides[current].classList.add('is-active');
    setTimeout(() => slides[prev].classList.remove('is-leaving'), 1000);

    texts[prev]?.classList.remove('is-active');
    texts[current]?.classList.add('is-active');

    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === current);
      d.setAttribute('aria-current', i === current ? 'true' : 'false');
    });

    if (!isPaused) restartProgress();
  }

  /* ── Timer principal — un solo setInterval, siempre activo ── */
  const autoTimer = setInterval(() => {
    if (!isPaused) goTo(current + 1);
  }, INTERVAL);

  /* ── Progress bar ── */
  function restartProgress() {
    if (!progressFill) return;
    progressFill.style.transition = 'none';
    progressFill.style.width      = '0%';
    void progressFill.offsetWidth;
    progressFill.style.transition = `width ${INTERVAL}ms linear`;
    progressFill.style.width      = '100%';
  }

  function stopProgress() {
    if (!progressFill) return;
    progressFill.style.transition = 'none';
    progressFill.style.width      = '0%';
  }

  /* ── Flechas ── */
  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  /* ── Dots ── */
  dots.forEach((dot) => {
    dot.addEventListener('click', () => goTo(Number(dot.dataset.target)));
  });

  /* ── Botón pausa — único control para detener el slider ── */
  pauseBtn?.addEventListener('click', () => {
    isPaused = !isPaused;
    const icon = pauseBtn.querySelector('i');
    if (isPaused) {
      if (icon) icon.className = 'ri-play-line';
      pauseBtn.setAttribute('aria-label',   'Reanudar');
      pauseBtn.setAttribute('aria-pressed', 'true');
      stopProgress();
    } else {
      if (icon) icon.className = 'ri-pause-line';
      pauseBtn.setAttribute('aria-label',   'Pausar');
      pauseBtn.setAttribute('aria-pressed', 'false');
      restartProgress();
    }
  });

  /* ── Swipe táctil ── */
  let touchStartX = 0;
  const heroEl = qs('.hero');
  heroEl?.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  heroEl?.addEventListener('touchend',   (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) goTo(delta < 0 ? current + 1 : current - 1);
  }, { passive: true });

  /* ── Pausa al minimizar la pestaña ── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopProgress();
    else if (!isPaused)  restartProgress();
  });

  /* ── Init ── */
  slides.forEach((s, i) => { s.classList.toggle('is-active', i === 0); s.classList.remove('is-leaving'); });
  texts.forEach( (t, i) =>   t.classList.toggle('is-active', i === 0));
  dots.forEach(  (d, i) => { d.classList.toggle('is-active', i === 0); d.setAttribute('aria-current', i === 0 ? 'true' : 'false'); });

  restartProgress();
}


/* ================================================================
   15. SCROLL SPY
================================================================ */
function initScrollSpy() {
  const sections = qsAll('section[id]');
  const navLinks = qsAll('.nav__link');
  if (!sections.length || !navLinks.length) return;

  const offset = (qs('#header')?.offsetHeight ?? 120) + 40;

  new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const href    = link.getAttribute('href');
            const isMatch =
              href === `#${id}` ||
              (id === 'hero'     && href === 'index.html') ||
              (id === 'products' && href === 'products.html') ||
              (id === 'why-us'   && href === 'about.html') ||
              (id === 'blog'     && href === 'blog.html');
            link.classList.toggle('nav__link--active', !!isMatch);
            if (isMatch) link.setAttribute('aria-current', 'page');
            else         link.removeAttribute('aria-current');
          });
        }
      });
    },
    { rootMargin: `-${offset}px 0px -55% 0px`, threshold: 0 }
  ).observe(...[...sections]);  // spread para observar todas

  // Workaround: IntersectionObserver.observe() acepta un solo elemento
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          const href    = link.getAttribute('href');
          const isMatch =
            href === `#${id}` ||
            (id === 'hero'     && href === 'index.html') ||
            (id === 'products' && href === 'products.html') ||
            (id === 'why-us'   && href === 'about.html') ||
            (id === 'blog'     && href === 'blog.html');
          link.classList.toggle('nav__link--active', !!isMatch);
          if (isMatch) link.setAttribute('aria-current', 'page');
          else         link.removeAttribute('aria-current');
        });
      });
    },
    { rootMargin: `-${offset}px 0px -55% 0px`, threshold: 0 }
  );

  sections.forEach((s) => spy.observe(s));
}