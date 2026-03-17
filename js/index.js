/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — Main JavaScript
 * File: js/index.js
 * Version: 3.2 — Testimonials infinite carousel added
 * ================================================================
 *
 * CAMBIOS EN ESTA VERSION:
 * 1. initTestimonialsCarousel(): Carrusel infinito de 9 reseñas.
 *    - Clona las primeras y últimas N tarjetas para efecto infinito sin saltos.
 *    - Flechas prev/next, dots de navegación, auto-avance, touch swipe.
 *    - Responsive: 3 tarjetas en desktop, 2 en tablet, 1 en mobile.
 *    - Pausa al hacer hover o cuando el tab está oculto.
 *
 * FIXES PREVIOS (v3.1):
 * 1. initStatsCounter: Corregido .observe() — solo acepta un elemento.
 * 2. initScrollSpy: Corregido spread en .observe() — reemplazado con forEach.
 * 3. initDropdownClick: Soporte click+touch en dropdown desktop/mobile.
 * ================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initNavbarScrollDirection();
  initHamburger();
  initMobileMenu();
  initMobileAccordion();
  initDropdownClick();
  initDropdownKeyboard();
  initAOS();
  initStatsCounter();
  initBackToTop();
  initCurrentYear();
  initSmoothScroll();
  initScrollSpy();
  initHeroSlider();
  initTestimonialsCarousel();   // ← Carrusel de reseñas
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
   7. DESKTOP DROPDOWN — CLICK / TOUCH SUPPORT
================================================================ */
function initDropdownClick() {
  const dropdowns = qsAll('.nav__dropdown');

  const isTouchPrimary = () =>
    window.matchMedia('(hover: none), (pointer: coarse)').matches;

  dropdowns.forEach((dropdown) => {
    const trigger = qs('.nav__link--dropdown', dropdown);
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      if (!isTouchPrimary()) {
        dropdown.classList.remove('is-open');
        return;
      }
      const isOpen = dropdown.classList.contains('is-open');
      dropdowns.forEach((d) => { if (d !== dropdown) d.classList.remove('is-open'); });
      if (!isOpen) {
        e.preventDefault();
        dropdown.classList.add('is-open');
      }
    });

    dropdown.addEventListener('mouseleave', () => {
      if (!isTouchPrimary()) {
        dropdown.classList.remove('is-open');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav__dropdown')) {
      dropdowns.forEach((d) => d.classList.remove('is-open'));
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdowns.forEach((d) => d.classList.remove('is-open'));
    }
  });
}


/* ================================================================
   8. DESKTOP DROPDOWN — KEYBOARD NAVIGATION
================================================================ */
function initDropdownKeyboard() {
  qsAll('.nav__dropdown').forEach((dropdown) => {
    const trigger = qs('.nav__link--dropdown', dropdown);
    const menu    = qs('.dropdown__menu', dropdown);
    const items   = qsAll('.dropdown__item', dropdown);
    if (!trigger || !menu) return;

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const open = dropdown.classList.contains('is-open');
        dropdown.classList.toggle('is-open', !open);
        if (!open) items[0]?.focus();
      }
      if (e.key === 'Escape') {
        dropdown.classList.remove('is-open');
        trigger.focus();
      }
    });

    items.forEach((item, i) => {
      item.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); items[i + 1]?.focus(); }
        if (e.key === 'ArrowUp')   {
          e.preventDefault();
          if (i === 0) { trigger.focus(); dropdown.classList.remove('is-open'); }
          else items[i - 1]?.focus();
        }
        if (e.key === 'Escape') { dropdown.classList.remove('is-open'); trigger.focus(); }
        if (e.key === 'Tab')    { dropdown.classList.remove('is-open'); }
      });
    });

    dropdown.addEventListener('focusout', (e) => {
      if (!dropdown.contains(e.relatedTarget)) {
        dropdown.classList.remove('is-open');
      }
    });
  });
}


/* ================================================================
   9. AOS — ANIMATE ON SCROLL
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
   10. HERO STATS COUNTER
================================================================ */
function initStatsCounter() {
  const els = qsAll('.stat__number[data-target]');
  if (!els.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        if (reduced) {
          el.textContent = target.toLocaleString();
        } else {
          animateCounter(el, target);
        }
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  els.forEach((el) => observer.observe(el));
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
   11. BACK TO TOP
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
   12. CURRENT YEAR
================================================================ */
function initCurrentYear() {
  const el = qs('#current-year');
  if (el) el.textContent = new Date().getFullYear();
}


/* ================================================================
   13. SMOOTH SCROLL
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
   14. NAVBAR HIDE ON SCROLL DOWN
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
   15. HERO IMAGE SLIDER
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

  setInterval(() => {
    if (!isPaused) goTo(current + 1);
  }, INTERVAL);

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

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  dots.forEach((dot) => {
    dot.addEventListener('click', () => goTo(Number(dot.dataset.target)));
  });

  pauseBtn?.addEventListener('click', () => {
    isPaused = !isPaused;
    const icon = pauseBtn.querySelector('i');
    if (isPaused) {
      if (icon) icon.className = 'ri-play-line';
      pauseBtn.setAttribute('aria-label',   'Resume slideshow');
      pauseBtn.setAttribute('aria-pressed', 'true');
      stopProgress();
    } else {
      if (icon) icon.className = 'ri-pause-line';
      pauseBtn.setAttribute('aria-label',   'Pause slideshow');
      pauseBtn.setAttribute('aria-pressed', 'false');
      restartProgress();
    }
  });

  let touchStartX = 0;
  const heroEl = qs('.hero');
  heroEl?.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  heroEl?.addEventListener('touchend',   (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) goTo(delta < 0 ? current + 1 : current - 1);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopProgress();
    else if (!isPaused)  restartProgress();
  });

  slides.forEach((s, i) => { s.classList.toggle('is-active', i === 0); s.classList.remove('is-leaving'); });
  texts.forEach( (t, i) =>   t.classList.toggle('is-active', i === 0));
  dots.forEach(  (d, i) => { d.classList.toggle('is-active', i === 0); d.setAttribute('aria-current', i === 0 ? 'true' : 'false'); });

  restartProgress();
}


/* ================================================================
   16. SCROLL SPY
================================================================ */
function initScrollSpy() {
  const sections = qsAll('section[id]');
  const navLinks = qsAll('.nav__link');
  if (!sections.length || !navLinks.length) return;

  const offset = (qs('#header')?.offsetHeight ?? 120) + 40;

  function updateActiveLink(id) {
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

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updateActiveLink(entry.target.id);
        }
      });
    },
    { rootMargin: `-${offset}px 0px -55% 0px`, threshold: 0 }
  );

  sections.forEach((section) => spy.observe(section));
}


/* ================================================================
   17. TESTIMONIALS CAROUSEL — CARRUSEL INFINITO
   ----------------------------------------------------------------
   Funcionamiento:
   - Se toman las N tarjetas reales del HTML.
   - Se clonan las últimas CLONES tarjetas y se prependen al track.
   - Se clonan las primeras CLONES tarjetas y se appenden al track.
   - El índice `idx` empieza en CLONES (apuntando a la 1ª card real).
   - Al llegar al borde de los clones, se hace un salto instantáneo
     (sin animación) al extremo opuesto de las cards reales.

   Responsive (perView):
   - Desktop ≥ 1025px → 3 tarjetas visibles
   - Tablet  768–1024px → 2 tarjetas visibles
   - Mobile  < 768px → 1 tarjeta visible

   Controles:
   - Flechas prev/next
   - Dots de navegación (9 puntos, uno por card real)
   - Auto-avance cada AUTO_DELAY ms
   - Pausa al pasar el mouse encima
   - Pausa cuando el tab está oculto
   - Touch swipe (delta > 50px)
================================================================ */
function initTestimonialsCarousel() {
  const track     = qs('#testimonials-track');
  const dotsWrap  = qs('#testimonials-dots');
  const prevBtn   = qs('#test-prev');
  const nextBtn   = qs('#test-next');

  if (!track) return;

  /* ── Constantes ── */
  const GAP        = 24;           // px — debe coincidir con el gap CSS
  const CLONES     = 3;            // tarjetas clonadas a cada lado
  const AUTO_DELAY = 4000;         // ms entre avances automáticos
  const TRANS_MS   = 600;          // ms de duración de la transición CSS

  /* ── Obtener tarjetas reales ── */
  const realCards = Array.from(track.children);
  const N         = realCards.length; // 9

  if (N === 0) return;

  /* ── Clonar y añadir al DOM ── */
  // Prepend: clones de las últimas CLONES cards (para ir hacia atrás)
  const preClonesFragment = document.createDocumentFragment();
  for (let i = N - CLONES; i < N; i++) {
    const clone = realCards[i].cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    preClonesFragment.appendChild(clone);
  }
  track.prepend(preClonesFragment);

  // Append: clones de las primeras CLONES cards (para ir hacia adelante)
  for (let i = 0; i < CLONES; i++) {
    const clone = realCards[i].cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  }

  /* ── Estado ── */
  let idx        = CLONES;   // índice actual en el track total (con clones)
  let isAnimating = false;
  let autoTimer   = null;
  let isHovered   = false;

  /* ── Calcular ancho de tarjeta según viewport ── */
  function getPerView() {
    if (window.innerWidth >= 1025) return 3;
    if (window.innerWidth >= 768)  return 2;
    return 1;
  }

  function getCardWidth() {
    const outer     = qs('#testimonials-outer');
    const outerW    = outer ? outer.clientWidth : track.parentElement.clientWidth;
    const perView   = getPerView();
    const totalGaps = (perView - 1) * GAP;
    return (outerW - totalGaps) / perView;
  }

  /* ── Posicionar el track sin animación ── */
  function setPosition(instant) {
    const cardW  = getCardWidth();
    const offset = idx * (cardW + GAP);
    if (instant) {
      track.style.transition = 'none';
    } else {
      track.style.transition = `transform ${TRANS_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    }
    track.style.transform = `translateX(-${offset}px)`;
  }

  /* ── Actualizar ancho de todas las tarjetas ── */
  function updateCardWidths() {
    const cardW = getCardWidth();
    Array.from(track.children).forEach((card) => {
      card.style.width = `${cardW}px`;
    });
  }

  /* ── Ir a un slot del track (incluye clones) ── */
  function goToSlot(newIdx, animate = true) {
    if (isAnimating) return;
    isAnimating = true;
    idx = newIdx;
    setPosition(!animate);

    setTimeout(() => {
      // Salto infinito: si caímos en zona de clones, reposicionar
      if (idx >= CLONES + N) {
        idx = idx - N;
        setPosition(true); // sin animación
      } else if (idx < CLONES) {
        idx = idx + N;
        setPosition(true); // sin animación
      }
      isAnimating = false;
      updateDots();
    }, animate ? TRANS_MS + 20 : 0);
  }

  /* ── Navegar por delta (+1 o -1) ── */
  function navigate(delta) {
    goToSlot(idx + delta);
  }

  /* ── Auto-avance ── */
  function startAuto() {
    stopAuto();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    autoTimer = setInterval(() => {
      if (!isHovered && !document.hidden) navigate(1);
    }, AUTO_DELAY);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  /* ── Actualizar puntos de navegación ── */
  function updateDots() {
    // Índice real (0–8)
    const realIdx = ((idx - CLONES) % N + N) % N;
    qsAll('.testimonials__dot', dotsWrap).forEach((dot, i) => {
      dot.classList.toggle('is-active', i === realIdx);
      dot.setAttribute('aria-selected', i === realIdx ? 'true' : 'false');
    });
  }

  /* ── Construir dots ── */
  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for (let i = 0; i < N; i++) {
      const dot = document.createElement('button');
      dot.className    = 'testimonials__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Reseña ${i + 1}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => {
        stopAuto();
        goToSlot(CLONES + i);
        startAuto();
      });
      dotsWrap.appendChild(dot);
    }
  }

  /* ── Flechas ── */
  prevBtn?.addEventListener('click', () => {
    stopAuto();
    navigate(-1);
    startAuto();
  });
  nextBtn?.addEventListener('click', () => {
    stopAuto();
    navigate(1);
    startAuto();
  });

  /* ── Pausa al hacer hover ── */
  const wrapper = qs('#testimonials-outer');
  wrapper?.addEventListener('mouseenter', () => { isHovered = true; });
  wrapper?.addEventListener('mouseleave', () => { isHovered = false; });

  /* ── Touch swipe ── */
  let touchStartX = 0;
  wrapper?.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  wrapper?.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) {
      stopAuto();
      navigate(delta < 0 ? 1 : -1);
      startAuto();
    }
  }, { passive: true });

  /* ── Pausa cuando el tab está oculto ── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto();
    else startAuto();
  });

  /* ── Resize — recalcular anchos y reposicionar ── */
  window.addEventListener('resize', throttle(() => {
    updateCardWidths();
    setPosition(true); // reposicionar sin animación para evitar salto visual
  }, 200));

  /* ── Inicialización ── */
  buildDots();
  updateCardWidths();
  setPosition(true); // posición inicial sin animación
  startAuto();
}