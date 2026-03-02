/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — Main JavaScript
 * File: js/index.js
 * Version: 2.0
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

/**
 * Debounce — limits how often a function fires during rapid events.
 * @param {Function} fn
 * @param {number} delay — ms
 * @returns {Function}
 */
function debounce(fn, delay = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle — ensures a function fires at most once per interval.
 * @param {Function} fn
 * @param {number} limit — ms
 * @returns {Function}
 */
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

/**
 * Safely query a single element — warns if not found in dev.
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {Element|null}
 */
function qs(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Safely query multiple elements.
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {NodeList}
 */
function qsAll(selector, context = document) {
  return context.querySelectorAll(selector);
}

/**
 * Lock / unlock body scroll (for modals and drawers).
 * @param {boolean} lock
 */
function lockBodyScroll(lock) {
  document.body.style.overflow = lock ? 'hidden' : '';
}


/* ================================================================
   3. NAVBAR — SCROLL EFFECT
   Adds .navbar--scrolled class after user scrolls 80px.
================================================================ */
function initNavbarScroll() {
  const navbar = qs('#navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 80;

  const handleScroll = throttle(() => {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    navbar.classList.toggle('navbar--scrolled', scrolled);
  }, 80);

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Run once on load in case page is already scrolled
  handleScroll();
}


/* ================================================================
   4. HAMBURGER MENU TOGGLE
   Toggles .is-active on button and opens/closes the mobile menu.
================================================================ */
function initHamburger() {
  const hamburger = qs('#hamburger-btn');
  const mobileMenu = qs('#mobile-menu');

  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('is-active');
    toggleMobileMenu(!isOpen, hamburger, mobileMenu);
  });

  // Close on Escape key
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
  const mobileMenu  = qs('#mobile-menu');
  const overlay     = qs('#menu-overlay');
  const closeBtn    = qs('#menu-close-btn');
  const hamburger   = qs('#hamburger-btn');

  if (!mobileMenu) return;

  // Close via overlay click
  overlay?.addEventListener('click', () => {
    toggleMobileMenu(false, hamburger, mobileMenu);
  });

  // Close via close button
  closeBtn?.addEventListener('click', () => {
    toggleMobileMenu(false, hamburger, mobileMenu);
    hamburger?.focus();
  });
}

/**
 * Open or close the mobile drawer.
 * @param {boolean} open
 * @param {Element} hamburger
 * @param {Element} mobileMenu
 */
function toggleMobileMenu(open, hamburger, mobileMenu) {
  hamburger?.classList.toggle('is-active', open);
  mobileMenu.classList.toggle('is-open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  hamburger?.setAttribute('aria-expanded', String(open));
  lockBodyScroll(open);
}


/* ================================================================
   6. MOBILE ACCORDION (Products Submenu)
   Each accordion button toggles its sibling submenu.
================================================================ */
function initMobileAccordion() {
  const accordionBtns = qsAll('.mobile-nav__accordion-btn');

  accordionBtns.forEach((btn) => {
    const submenu = btn.nextElementSibling;
    if (!submenu) return;

    btn.addEventListener('click', () => {
      const isExpanded = btn.classList.contains('is-expanded');

      // Close all other accordions first
      accordionBtns.forEach((otherBtn) => {
        if (otherBtn !== btn) {
          const otherSub = otherBtn.nextElementSibling;
          otherBtn.classList.remove('is-expanded');
          otherBtn.setAttribute('aria-expanded', 'false');
          otherSub?.classList.remove('is-open');
          otherSub?.setAttribute('aria-hidden', 'true');
        }
      });

      // Toggle current
      btn.classList.toggle('is-expanded', !isExpanded);
      btn.setAttribute('aria-expanded', String(!isExpanded));
      submenu.classList.toggle('is-open', !isExpanded);
      submenu.setAttribute('aria-hidden', String(isExpanded));
    });
  });
}


/* ================================================================
   7. DESKTOP DROPDOWN — KEYBOARD ACCESSIBILITY
   Arrow keys, Enter, and Escape navigation for dropdown menus.
================================================================ */
function initDropdownKeyboard() {
  const dropdowns = qsAll('.nav__dropdown');

  dropdowns.forEach((dropdown) => {
    const trigger  = qs('.nav__link--dropdown', dropdown);
    const menu     = qs('.dropdown__menu', dropdown);
    const items    = qsAll('.dropdown__item', dropdown);

    if (!trigger || !menu) return;

    // Open on Enter/Space
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isOpen = menu.style.opacity === '1';
        setDropdownState(menu, !isOpen);
        if (!isOpen) items[0]?.focus();
      }
      if (e.key === 'Escape') {
        setDropdownState(menu, false);
        trigger.focus();
      }
    });

    // Arrow key navigation inside menu
    items.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          items[index + 1]?.focus();
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (index === 0) {
            trigger.focus();
            setDropdownState(menu, false);
          } else {
            items[index - 1]?.focus();
          }
        }
        if (e.key === 'Escape') {
          setDropdownState(menu, false);
          trigger.focus();
        }
        if (e.key === 'Tab') {
          setDropdownState(menu, false);
        }
      });
    });

    // Close when focus leaves the dropdown
    dropdown.addEventListener('focusout', (e) => {
      if (!dropdown.contains(e.relatedTarget)) {
        setDropdownState(menu, false);
      }
    });
  });
}

function setDropdownState(menu, open) {
  menu.style.opacity    = open ? '1' : '';
  menu.style.visibility = open ? 'visible' : '';
  menu.style.transform  = open ? 'translateX(-50%) translateY(0)' : '';
  menu.style.pointerEvents = open ? 'auto' : '';
}


/* ================================================================
   8. AOS — ANIMATE ON SCROLL (Lightweight Native Implementation)
   Watches [data-aos] elements with IntersectionObserver.
   Respects data-aos-delay attribute for staggered animations.
================================================================ */
function initAOS() {
  const elements = qsAll('[data-aos]');
  if (!elements.length) return;

  // Respect user's reduced motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    elements.forEach((el) => el.classList.add('aos-animate'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const delay = parseInt(el.dataset.aosDelay || '0', 10);

          setTimeout(() => {
            el.classList.add('aos-animate');
          }, delay);

          // Stop observing once animated (one-shot)
          observer.unobserve(el);
        }
      });
    },
    {
      threshold: 0.12,      // Trigger when 12% of element is visible
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
}


/* ================================================================
   9. HERO STATS COUNTER ANIMATION
   Counts up numbers from 0 to their target when the hero is in view.
================================================================ */
function initStatsCounter() {
  const statNumbers = qsAll('.stat__number[data-target]');
  if (!statNumbers.length) return;

  // Respect reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.target, 10);

          if (prefersReduced) {
            el.textContent = target.toLocaleString();
          } else {
            animateCounter(el, target);
          }

          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((el) => observer.observe(el));
}

/**
 * Animates a number from 0 to target using easing.
 * @param {Element} el
 * @param {number} target
 * @param {number} duration — ms
 */
function animateCounter(el, target, duration = 2000) {
  const startTime = performance.now();

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function step(currentTime) {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = easeOutQuart(progress);
    const value    = Math.round(eased * target);

    el.textContent = value.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(step);
}


/* ================================================================
   10. BACK TO TOP BUTTON
   Shows button after scrolling 400px, smooth scrolls to top on click.
================================================================ */
function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;

  const SHOW_AFTER = 400;

  const handleScroll = throttle(() => {
    const visible = window.scrollY > SHOW_AFTER;
    btn.classList.toggle('is-visible', visible);
  }, 100);

  window.addEventListener('scroll', handleScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Return focus to top of page for accessibility
    const firstFocusable = qs('a, button, [tabindex="0"]');
    firstFocusable?.focus({ preventScroll: true });
  });

  // Initialize on load
  handleScroll();
}


/* ================================================================
   11. CURRENT YEAR (Footer Copyright)
================================================================ */
function initCurrentYear() {
  const yearEl = qs('#current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}


/* ================================================================
   12. SMOOTH ANCHOR SCROLLING
   Handles all [href^="#"] links for smooth scroll + offset for navbar.
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

    // Get actual header height at scroll time
    const header     = qs('#header');
    const offset     = header ? header.offsetHeight : 120;
    const targetTop  = target.getBoundingClientRect().top + window.scrollY - offset - 16;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });

    // Close mobile menu if open
    const mobileMenu = qs('#mobile-menu');
    const hamburger  = qs('#hamburger-btn');
    if (mobileMenu?.classList.contains('is-open')) {
      toggleMobileMenu(false, hamburger, mobileMenu);
    }
  });
}


/* ================================================================
   13. NAVBAR HIDE / SHOW ON SCROLL DIRECTION
   Hides topbar (slides header up) when scrolling DOWN rapidly,
   reveals when scrolling UP. Uses transform on .header — zero layout reflow,
   no jitter. topbar--hidden class is REMOVED; header--topbar-hidden is used.
================================================================ */
function initNavbarScrollDirection() {
  const header = qs('#header');
  if (!header) return;

  let lastScrollY  = window.scrollY;
  let ticking      = false;
  const HIDE_AFTER = 160; // px before hide logic activates

  function updateHeader() {
    const currentScrollY = window.scrollY;
    const scrollingDown  = currentScrollY > lastScrollY;

    if (currentScrollY > HIDE_AFTER) {
      if (scrollingDown) {
        // Scroll DOWN → slide header up by topbar height (transform only — no reflow)
        header.classList.add('header--topbar-hidden');
      } else {
        // Scroll UP → restore full header
        header.classList.remove('header--topbar-hidden');
      }
    } else {
      // Near top → always show full header
      header.classList.remove('header--topbar-hidden');
    }

    lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
}


/* ================================================================
   14. HERO IMAGE SLIDER
   Auto-advances every 5 seconds through 5 product slides.
   Controls: arrows, dot indicators, product tabs, pause button.
   Touch/swipe support for mobile.
   Respects prefers-reduced-motion.
================================================================ */
function initHeroSlider() {
  /* ── Elements ── */
  const slides    = qsAll('.hero__slide');
  const texts     = qsAll('.hero__slide-text');
  const dots      = qsAll('.hero__dot');
  const tabs      = qsAll('.hero__tab');
  const prevBtn   = qs('#hero-prev');
  const nextBtn   = qs('#hero-next');
  const pauseBtn  = qs('#hero-pause');

  if (!slides.length) return;

  /* ── Progress bar ── */
  const progressBar = document.createElement('div');
  progressBar.className = 'hero__progress';
  const progressFill = document.createElement('div');
  progressFill.className = 'hero__progress-fill';
  progressBar.appendChild(progressFill);
  qs('.hero')?.appendChild(progressBar);

  /* ── State ── */
  const TOTAL     = slides.length;
  const INTERVAL  = 5000; // ms per slide
  let current     = 0;
  let timer       = null;
  let isPaused    = false;
  let progressRaf = null;
  let progressStart = null;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Core: go to a specific slide ── */
  function goTo(index) {
    const prev = current;
    current = ((index % TOTAL) + TOTAL) % TOTAL;

    if (prev === current) return;

    /* Background slides */
    slides[prev].classList.add('is-leaving');
    slides[prev].classList.remove('is-active');
    slides[current].classList.add('is-active');
    slides[current].classList.remove('is-leaving');

    setTimeout(() => slides[prev].classList.remove('is-leaving'), 1000);

    /* Text blocks */
    texts[prev]?.classList.remove('is-active');
    texts[current]?.classList.add('is-active');

    /* Dots */
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === current);
      d.setAttribute('aria-current', i === current ? 'true' : 'false');
    });

    /* Product tabs */
    tabs.forEach((t, i) => t.classList.toggle('is-active', i === current));

    /* Restart progress */
    if (!isPaused && !prefersReduced) startProgress();
  }

  /* ── Auto-advance ── */
  function startAuto() {
    clearInterval(timer);
    if (isPaused || prefersReduced) return;
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  }

  function stopAuto() {
    clearInterval(timer);
    timer = null;
  }

  /* ── Progress bar animation ── */
  function startProgress() {
    cancelAnimationFrame(progressRaf);
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    // Force reflow then animate
    progressFill.getBoundingClientRect();
    progressFill.style.transition = `width ${INTERVAL}ms linear`;
    progressFill.style.width = '100%';
  }

  function stopProgress() {
    cancelAnimationFrame(progressRaf);
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
  }

  /* ── Controls ── */
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

  /* Pause / Resume */
  pauseBtn?.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.setAttribute('aria-pressed', String(isPaused));
    const icon = pauseBtn.querySelector('i');
    if (isPaused) {
      pauseBtn.setAttribute('aria-label', 'Resume slideshow');
      if (icon) { icon.className = 'ri-play-line'; }
      stopAuto();
      stopProgress();
    } else {
      pauseBtn.setAttribute('aria-label', 'Pause slideshow');
      if (icon) { icon.className = 'ri-pause-line'; }
      startAuto();
      startProgress();
    }
  });

  /* Pause on hover (desktop) */
  const heroEl = qs('.hero');
  heroEl?.addEventListener('mouseenter', () => {
    if (!isPaused) { stopAuto(); stopProgress(); }
  });
  heroEl?.addEventListener('mouseleave', () => {
    if (!isPaused) { startAuto(); startProgress(); }
  });

  /* ── Touch / Swipe ── */
  let touchStartX = 0;
  heroEl?.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  heroEl?.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < 40) return; // ignore micro-swipes
    goTo(delta < 0 ? current + 1 : current - 1);
    stopAuto(); startAuto();
    if (!isPaused) startProgress();
  }, { passive: true });

  /* ── Keyboard support ── */
  heroEl?.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); stopAuto(); startAuto(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); stopAuto(); startAuto(); }
  });

  /* ── Pause when tab is hidden ── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stopAuto(); stopProgress(); }
    else if (!isPaused)  { startAuto(); startProgress(); }
  });

  /* ── Init ── */
  // Ensure first slide + text is active
  slides[0]?.classList.add('is-active');
  texts[0]?.classList.add('is-active');
  dots[0]?.classList.add('is-active');
  tabs[0]?.classList.add('is-active');

  if (!prefersReduced) {
    startAuto();
    startProgress();
  }
}


/* ================================================================
   15. ACTIVE NAV LINK ON SCROLL (Scroll Spy)
   Highlights the correct nav link as user scrolls through sections.
================================================================ */
function initScrollSpy() {
  const sections  = qsAll('section[id]');
  const navLinks  = qsAll('.nav__link');
  if (!sections.length || !navLinks.length) return;

  const header    = qs('#header');
  const offset    = (header?.offsetHeight ?? 120) + 40;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;

          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            const isMatch =
              href === `#${id}` ||
              (id === 'hero'     && href === 'index.html') ||
              (id === 'products' && href === 'products.html') ||
              (id === 'why-us'   && href === 'about.html') ||
              (id === 'blog'     && href === 'blog.html');

            link.classList.toggle('nav__link--active', !!isMatch);
            if (isMatch) {
              link.setAttribute('aria-current', 'page');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        }
      });
    },
    {
      rootMargin: `-${offset}px 0px -55% 0px`,
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));
}


/* ================================================================
   NOTE: Topbar hide animation is handled entirely via CSS transform
   on .header--topbar-hidden in index.css. No JS injection needed.
   This eliminates scroll jitter caused by max-height layout reflow.
================================================================ */