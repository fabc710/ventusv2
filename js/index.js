/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — Main JavaScript
 * File: js/index.js
 * Version: 2.2
 * Description: All interactive functionality for index.html
 *
 * TABLE OF CONTENTS
 * 1.  DOMContentLoaded Init
 * 2.  Utility Helpers
 * 3.  Navbar — Scroll Effect & Active State
 * 4.  Hamburger Menu Toggle
 * 5.  Mobile Menu — Open / Close / Overlay
 * 6.  Mobile Accordion (Products Submenu)
 * 7.  Desktop Dropdown — Keyboard Accessibility
 * 8.  AOS — Animate On Scroll (native lightweight)
 * 9.  Hero Stats Counter Animation
 * 10. Back To Top Button
 * 11. Current Year (Footer)
 * 12. Smooth Anchor Scrolling
 * 13. Navbar Hide/Show on Scroll Direction
 * 14. Hero Image Slider (5 product slides, auto-advance, swipe)
 * 15. Active Nav Link on Scroll (Spy)
 * ================================================================
 */

'use strict';

/* ================================================================
   1. DOM CONTENT LOADED — INIT
================================================================ */
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
function debounce(fn, delay = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, limit = 100) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    }
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

  const SCROLL_THRESHOLD = 80;

  const handleScroll = throttle(() => {
    navbar.classList.toggle('navbar--scrolled', window.scrollY > SCROLL_THRESHOLD);
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
   5. MOBILE MENU — OPEN / CLOSE / OVERLAY
================================================================ */
function initMobileMenu() {
  const mobileMenu = qs('#mobile-menu');
  const overlay    = qs('#menu-overlay');
  const closeBtn   = qs('#menu-close-btn');
  const hamburger  = qs('#hamburger-btn');
  if (!mobileMenu) return;

  overlay?.addEventListener('click', () => toggleMobileMenu(false, hamburger, mobileMenu));
  closeBtn?.addEventListener('click', () => {
    toggleMobileMenu(false, hamburger, mobileMenu);
    hamburger?.focus();
  });
}

function toggleMobileMenu(open, hamburger, mobileMenu) {
  hamburger?.classList.toggle('is-active', open);
  mobileMenu.classList.toggle('is-open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  hamburger?.setAttribute('aria-expanded', String(open));
  lockBodyScroll(open);
}


/* ================================================================
   6. MOBILE ACCORDION (Products Submenu)
================================================================ */
function initMobileAccordion() {
  const accordionBtns = qsAll('.mobile-nav__accordion-btn');

  accordionBtns.forEach((btn) => {
    const submenu = btn.nextElementSibling;
    if (!submenu) return;

    btn.addEventListener('click', () => {
      const isExpanded = btn.classList.contains('is-expanded');

      accordionBtns.forEach((other) => {
        if (other !== btn) {
          const otherSub = other.nextElementSibling;
          other.classList.remove('is-expanded');
          other.setAttribute('aria-expanded', 'false');
          otherSub?.classList.remove('is-open');
          otherSub?.setAttribute('aria-hidden', 'true');
        }
      });

      btn.classList.toggle('is-expanded', !isExpanded);
      btn.setAttribute('aria-expanded', String(!isExpanded));
      submenu.classList.toggle('is-open', !isExpanded);
      submenu.setAttribute('aria-hidden', String(isExpanded));
    });
  });
}


/* ================================================================
   7. DESKTOP DROPDOWN — KEYBOARD ACCESSIBILITY
================================================================ */
function initDropdownKeyboard() {
  const dropdowns = qsAll('.nav__dropdown');

  dropdowns.forEach((dropdown) => {
    const trigger = qs('.nav__link--dropdown', dropdown);
    const menu    = qs('.dropdown__menu', dropdown);
    const items   = qsAll('.dropdown__item', dropdown);
    if (!trigger || !menu) return;

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isOpen = menu.style.opacity === '1';
        setDropdownState(menu, !isOpen);
        if (!isOpen) items[0]?.focus();
      }
      if (e.key === 'Escape') { setDropdownState(menu, false); trigger.focus(); }
    });

    items.forEach((item, i) => {
      item.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); items[i + 1]?.focus(); }
        if (e.key === 'ArrowUp')   {
          e.preventDefault();
          if (i === 0) { trigger.focus(); setDropdownState(menu, false); }
          else items[i - 1]?.focus();
        }
        if (e.key === 'Escape') { setDropdownState(menu, false); trigger.focus(); }
        if (e.key === 'Tab')    { setDropdownState(menu, false); }
      });
    });

    dropdown.addEventListener('focusout', (e) => {
      if (!dropdown.contains(e.relatedTarget)) setDropdownState(menu, false);
    });
  });
}

function setDropdownState(menu, open) {
  menu.style.opacity      = open ? '1' : '';
  menu.style.visibility   = open ? 'visible' : '';
  menu.style.transform    = open ? 'translateX(-50%) translateY(0)' : '';
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
          const el    = entry.target;
          const delay = parseInt(el.dataset.aosDelay || '0', 10);
          setTimeout(() => el.classList.add('aos-animate'), delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}


/* ================================================================
   9. HERO STATS COUNTER ANIMATION
================================================================ */
function initStatsCounter() {
  const statNumbers   = qsAll('.stat__number[data-target]');
  if (!statNumbers.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.target, 10);
          prefersReduced ? (el.textContent = target.toLocaleString()) : animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((el) => observer.observe(el));
}

function animateCounter(el, target, duration = 2000) {
  const startTime = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 4);

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    el.textContent = Math.round(ease(progress) * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  }

  requestAnimationFrame(step);
}


/* ================================================================
   10. BACK TO TOP BUTTON
================================================================ */
function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;

  const handleScroll = throttle(() => {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  }, 100);

  window.addEventListener('scroll', handleScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    qs('a, button, [tabindex="0"]')?.focus({ preventScroll: true });
  });

  handleScroll();
}


/* ================================================================
   11. CURRENT YEAR (Footer Copyright)
================================================================ */
function initCurrentYear() {
  const el = qs('#current-year');
  if (el) el.textContent = new Date().getFullYear();
}


/* ================================================================
   12. SMOOTH ANCHOR SCROLLING
================================================================ */
function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    const target = qs(targetId);
    if (!target) return;

    e.preventDefault();

    const header    = qs('#header');
    const offset    = header ? header.offsetHeight : 120;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - offset - 16;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });

    const mobileMenu = qs('#mobile-menu');
    const hamburger  = qs('#hamburger-btn');
    if (mobileMenu?.classList.contains('is-open')) {
      toggleMobileMenu(false, hamburger, mobileMenu);
    }
  });
}


/* ================================================================
   13. NAVBAR HIDE / SHOW ON SCROLL DIRECTION
================================================================ */
function initNavbarScrollDirection() {
  const header = qs('#header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking     = false;

  function updateHeader() {
    const current    = window.scrollY;
    const goingDown  = current > lastScrollY;

    if (current > 160) {
      header.classList.toggle('header--topbar-hidden', goingDown);
    } else {
      header.classList.remove('header--topbar-hidden');
    }

    lastScrollY = current <= 0 ? 0 : current;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateHeader); ticking = true; }
  }, { passive: true });
}


/* ================================================================
   14. HERO IMAGE SLIDER
   FIX v2.2:
   ─ Usa #hero-progress-fill del HTML (NO crea uno dinámico)
   ─ Inicializa con doble requestAnimationFrame para garantizar
     que el browser haya pintado antes de arrancar setInterval
   ─ Elimina el getBoundingClientRect() que rompía el init
================================================================ */
function initHeroSlider() {

  /* ── Elementos ── */
  const slides   = qsAll('.hero__slide');
  const texts    = qsAll('.hero__slide-text');
  const dots     = qsAll('.hero__dot');
  const tabs     = qsAll('.hero__tab');        // vacío si no hay tabs — no importa
  const prevBtn  = qs('#hero-prev');
  const nextBtn  = qs('#hero-next');
  const pauseBtn = qs('#hero-pause');

  if (!slides.length) return;

  /* ── Barra de progreso: usa el del HTML, no crea uno dinámico ── */
  const progressFill = qs('#hero-progress-fill');
  const hasProgress  = !!progressFill;

  /* ── Estado ── */
  const TOTAL    = slides.length;  // 5
  const INTERVAL = 5000;           // ms por slide
  let current    = 0;
  let timer      = null;
  let isPaused   = false;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================================================================
     goTo(index) — cambia al slide indicado
  ================================================================ */
  function goTo(index) {
    const prev = current;
    const next = ((index % TOTAL) + TOTAL) % TOTAL;

    if (prev === next) return;   // ya estamos ahí, nada que hacer
    current = next;

    /* Fondos */
    slides[prev].classList.remove('is-active');
    slides[prev].classList.add('is-leaving');
    slides[current].classList.add('is-active');
    slides[current].classList.remove('is-leaving');
    setTimeout(() => slides[prev].classList.remove('is-leaving'), 1000);

    /* Textos */
    texts.forEach((t, i) => t.classList.toggle('is-active', i === current));

    /* Dots */
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === current);
      d.setAttribute('aria-selected', String(i === current));
      d.setAttribute('aria-current', i === current ? 'true' : 'false');
    });

    /* Tabs (no-op si vacío) */
    tabs.forEach((t, i) => t.classList.toggle('is-active', i === current));

    /* Reiniciar barra */
    if (!isPaused && !prefersReduced) startProgress();
  }

  /* ================================================================
     Auto-avance
  ================================================================ */
  function startAuto() {
    clearInterval(timer);
    if (isPaused || prefersReduced) return;
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  }

  function stopAuto() {
    clearInterval(timer);
    timer = null;
  }

  /* ================================================================
     Barra de progreso
     FIX: Doble requestAnimationFrame en lugar de getBoundingClientRect().
     1er rAF: espera fin del frame actual.
     2do rAF: garantiza que el layout del primer slide está completo.
     Esto evita la race condition que rompía el setInterval.
  ================================================================ */
  function startProgress() {
    if (!hasProgress) return;
    progressFill.style.transition = 'none';
    progressFill.style.width      = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressFill.style.transition = `width ${INTERVAL}ms linear`;
        progressFill.style.width      = '100%';
      });
    });
  }

  function stopProgress() {
    if (!hasProgress) return;
    progressFill.style.transition = 'none';
    progressFill.style.width      = '0%';
  }

  /* ================================================================
     Controles: flechas, dots, tabs, pausa
  ================================================================ */
  prevBtn?.addEventListener('click', () => {
    goTo(current - 1);
    stopAuto(); startAuto();
    if (!isPaused) startProgress();
  });

  nextBtn?.addEventListener('click', () => {
    goTo(current + 1);
    stopAuto(); startAuto();
    if (!isPaused) startProgress();
  });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.target));
      stopAuto(); startAuto();
      if (!isPaused) startProgress();
    });
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      goTo(Number(tab.dataset.target));
      stopAuto(); startAuto();
      if (!isPaused) startProgress();
    });
  });

  pauseBtn?.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.setAttribute('aria-pressed', String(isPaused));
    const icon = pauseBtn.querySelector('i');
    if (isPaused) {
      pauseBtn.setAttribute('aria-label', 'Resume slideshow');
      if (icon) icon.className = 'ri-play-line';
      stopAuto();
      stopProgress();
    } else {
      pauseBtn.setAttribute('aria-label', 'Pause slideshow');
      if (icon) icon.className = 'ri-pause-line';
      startAuto();
      startProgress();
    }
  });

  /* Pausa al pasar el mouse (desktop) */
  const heroEl = qs('.hero');
  heroEl?.addEventListener('mouseenter', () => { if (!isPaused) { stopAuto(); stopProgress(); } });
  heroEl?.addEventListener('mouseleave', () => { if (!isPaused) { startAuto(); startProgress(); } });

  /* Swipe en móvil */
  let touchStartX = 0;
  heroEl?.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  heroEl?.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < 40) return;
    goTo(delta < 0 ? current + 1 : current - 1);
    stopAuto(); startAuto();
    if (!isPaused) startProgress();
  }, { passive: true });

  /* Teclado */
  heroEl?.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); stopAuto(); startAuto(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); stopAuto(); startAuto(); }
  });

  /* Pausa cuando la pestaña está oculta */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden)      { stopAuto(); stopProgress(); }
    else if (!isPaused)       { startAuto(); startProgress(); }
  });

  /* ================================================================
     Init
     FIX: Los 3 estados iniciales se aplican de inmediato.
     El setInterval y la barra arrancan DESPUÉS de 2 frames pintados,
     garantizando que el DOM esté listo antes de iniciar la animación.
  ================================================================ */
  slides[0]?.classList.add('is-active');
  texts[0]?.classList.add('is-active');
  dots[0]?.classList.add('is-active');
  tabs[0]?.classList.add('is-active');  // no-op si tabs está vacío

  if (!prefersReduced) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        startAuto();       // arranca setInterval
        startProgress();   // arranca barra de progreso
      });
    });
  }
}


/* ================================================================
   15. ACTIVE NAV LINK ON SCROLL (Scroll Spy)
================================================================ */
function initScrollSpy() {
  const sections = qsAll('section[id]');
  const navLinks = qsAll('.nav__link');
  if (!sections.length || !navLinks.length) return;

  const header = qs('#header');
  const offset = (header?.offsetHeight ?? 120) + 40;

  const observer = new IntersectionObserver(
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
            else link.removeAttribute('aria-current');
          });
        }
      });
    },
    { rootMargin: `-${offset}px 0px -55% 0px`, threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}