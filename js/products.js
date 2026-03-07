/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — Products Page JavaScript
 * File: js/products.js
 * Version: 2.0 — Bug fixes applied
 *
 * FIXES IN THIS VERSION:
 * 1. initProductScrollSpy: El primer bloque tenía `.observe` como
 *    acceso de propiedad (no llamada). El observer se creaba pero
 *    nunca observaba nada (código muerto). Refactorizado a UN
 *    solo IntersectionObserver que observa todas las secciones
 *    con sections.forEach → observer.observe(section).
 * 2. initProductParallax: (hover:none) reemplazado por la
 *    detección confiable isTouchDevice() → (hover:none),(pointer:coarse).
 * 3. initAnchorNavigation: Los selectores .prod-nav-pills .prod-pill
 *    y .prod-pill[href^="#"] se solapaban, registrando el handler
 *    dos veces en los mismos pills (doble scroll). Unificado con
 *    Set para eliminar duplicados.
 * 4. initStickyProductNav: El IntersectionObserver se guardaba en
 *    variable para poder desconectarlo; mejorado manejo de estado.
 *
 * TABLE OF CONTENTS
 * 1.  DOMContentLoaded Init
 * 2.  Utility Helpers
 * 3.  Coverage Tabs
 * 4.  FAQ Accordion
 * 5.  Sticky Product Nav
 * 6.  Product Scroll Spy
 * 7.  Product Parallax
 * 8.  Anchor Navigation — Fix definitivo (mobile + desktop)
 * ================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initCoverageTabs();
  initFaqAccordion();
  initStickyProductNav();
  initProductScrollSpy();
  initProductParallax();
  initAnchorNavigation();
});


/* ================================================================
   2. UTILITY HELPERS
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
   3. COVERAGE TABS
================================================================ */
function initCoverageTabs() {
  const tabGroups = document.querySelectorAll('.coverage__tabs');

  tabGroups.forEach((group) => {
    const tabs   = Array.from(group.querySelectorAll('.coverage__tab'));
    const panels = [];

    let sibling = group.nextElementSibling;
    while (sibling && sibling.classList.contains('coverage__panel')) {
      panels.push(sibling);
      sibling = sibling.nextElementSibling;
    }

    if (!tabs.length || !panels.length) return;

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tabs, panels, index));

      tab.addEventListener('keydown', (e) => {
        let newIndex = index;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          newIndex = (index + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          newIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') {
          e.preventDefault();
          newIndex = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          newIndex = tabs.length - 1;
        }
        if (newIndex !== index) {
          activateTab(tabs, panels, newIndex);
          tabs[newIndex].focus();
        }
      });
    });
  });
}

function activateTab(tabs, panels, activeIndex) {
  tabs.forEach((tab, i) => {
    const isActive = i === activeIndex;
    tab.classList.toggle('coverage__tab--active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
    tab.setAttribute('tabindex', isActive ? '0' : '-1');
  });
  panels.forEach((panel, i) => {
    const isActive = i === activeIndex;
    panel.classList.toggle('is-active', isActive);
    if (isActive) {
      panel.removeAttribute('hidden');
    } else {
      panel.setAttribute('hidden', '');
    }
  });
}


/* ================================================================
   4. FAQ ACCORDION
================================================================ */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq__item');
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq__question');
    const answer   = item.querySelector('.faq__answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      // Cerrar todos los demás
      faqItems.forEach((other) => {
        if (other === item) return;
        const oQ = other.querySelector('.faq__question');
        const oA = other.querySelector('.faq__answer');
        if (oQ) oQ.setAttribute('aria-expanded', 'false');
        if (oA) oA.setAttribute('hidden', '');
      });

      question.setAttribute('aria-expanded', String(!isOpen));

      if (!isOpen) {
        answer.removeAttribute('hidden');
        // Scroll suave si el item queda oculto detrás del header
        setTimeout(() => {
          const rect   = item.getBoundingClientRect();
          const header = document.querySelector('#header');
          const offset = header ? header.offsetHeight + 16 : 140;
          if (rect.top < offset) {
            window.scrollBy({ top: rect.top - offset, behavior: 'smooth' });
          }
        }, 50);
      } else {
        answer.setAttribute('hidden', '');
      }
    });

    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });
}


/* ================================================================
   5. STICKY PRODUCT NAV
   FIX 4: IntersectionObserver guardado en variable para poder
   desconectarlo si fuera necesario. Mejorado manejo de aria-hidden.
================================================================ */
function initStickyProductNav() {
  const hero    = document.querySelector('.prod-hero');
  const origNav = document.querySelector('.prod-nav-pills');
  if (!hero || !origNav) return;

  const sticky = document.createElement('div');
  sticky.className = 'prod-nav-sticky';
  sticky.setAttribute('aria-hidden', 'true');
  sticky.innerHTML = `<div class="container">${origNav.outerHTML}</div>`;
  document.body.appendChild(sticky);

  const stickyPills = sticky.querySelectorAll('.prod-pill');

  // Registrar handlers en los pills duplicados del sticky
  stickyPills.forEach((pill) => {
    pill.addEventListener('click', handleAnchorClick, { capture: true });
  });

  // FIX 4: Observer guardado en variable
  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      const isVisible = !entry.isIntersecting;
      sticky.classList.toggle('is-visible', isVisible);
      sticky.setAttribute('aria-hidden', String(!isVisible));
    },
    { threshold: 0.1 }
  );
  heroObserver.observe(hero);

  // Sincronizar estado activo con el scroll spy
  window.addEventListener('productScrollSpy', (e) => {
    const activeId = e.detail?.activeId;
    if (!activeId) return;
    stickyPills.forEach((pill) => {
      pill.classList.toggle(
        'prod-pill--active',
        pill.getAttribute('href') === `#${activeId}`
      );
    });
  });
}


/* ================================================================
   6. PRODUCT SCROLL SPY
   FIX 1 (CRÍTICO): El código original tenía:
     new IntersectionObserver(...).observe;   ← acceso de propiedad
   Esto creaba el observer pero NUNCA lo conectaba a ningún elemento.
   Era código muerto. Luego el sections.forEach creaba N observers
   separados en un bloque independiente.

   Solución: UN solo IntersectionObserver reutilizable que observa
   todas las secciones con sections.forEach → observer.observe(section).
================================================================ */
function initProductScrollSpy() {
  const sections  = document.querySelectorAll('.product-detail[id]');
  const origPills = document.querySelectorAll('.prod-nav-pills .prod-pill');
  if (!sections.length || !origPills.length) return;

  const header = document.querySelector('#header');
  const offset = (header?.offsetHeight ?? 120) + 60;

  function setActivePill(activeId) {
    origPills.forEach((pill) => {
      pill.classList.toggle(
        'prod-pill--active',
        pill.getAttribute('href') === `#${activeId}`
      );
    });
    // Notificar al sticky nav
    window.dispatchEvent(
      new CustomEvent('productScrollSpy', { detail: { activeId } })
    );
  }

  // FIX 1: UN observer que cubre todas las secciones
  const scrollSpyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActivePill(entry.target.id);
        }
      });
    },
    { rootMargin: `-${offset}px 0px -50% 0px`, threshold: 0 }
  );

  // Observar cada sección individualmente (observe() acepta 1 elemento)
  sections.forEach((section) => scrollSpyObserver.observe(section));
}


/* ================================================================
   7. PRODUCT PARALLAX
   FIX 2: Reemplazado (hover:none) por isTouchDevice() que usa
   (hover:none),(pointer:coarse) — más confiable en híbridos.
================================================================ */
function initProductParallax() {
  const images = document.querySelectorAll('.product-detail__img-wrap img');
  if (!images.length) return;

  // FIX 2: detección touch confiable
  if (prefersReducedMotion() || isTouchDevice()) return;

  let ticking = false;

  function updateParallax() {
    const viewH = window.innerHeight;
    images.forEach((img) => {
      const wrap = img.closest('.product-detail__img-wrap');
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      // Saltar si el elemento no está en el viewport
      if (rect.bottom < 0 || rect.top > viewH) return;
      const progress = 1 - rect.bottom / (viewH + rect.height);
      const shift    = (progress - 0.5) * 24;
      img.style.transform  = `translateY(${shift}px) scale(1.04)`;
      img.style.transition = 'transform 0.12s linear';
    });
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


/* ================================================================
   8. ANCHOR NAVIGATION — Fix definitivo (mobile + desktop)
   ─────────────────────────────────────────────────────────────
   PROBLEMA RAÍZ:
   index.js tiene listeners en el dropdown y en el mobile drawer
   que llaman a preventDefault() / stopPropagation() bloqueando
   la navegación a anclas. Esto hace que:
     - Desktop: al hacer clic en un producto del dropdown, no pasa nada
     - Mobile: el browser intenta navegar a una ruta incorrecta

   SOLUCIÓN:
   1. { capture: true } → ejecuta ANTES que los listeners de index.js
   2. e.stopImmediatePropagation() cancela todos los demás handlers
   3. Cerramos el menú móvil manualmente
   4. Scroll suave con offset del header
   5. URL actualizada con history.pushState

   FIX 3: Los selectores ya no se solapan — se usa un Set para
   deduplicar los elementos antes de registrar el handler,
   evitando la doble ejecución (doble scroll).
================================================================ */

/**
 * Extrae el ID del ancla de un href.
 * Soporta: "#home-insurance", "products.html#auto-insurance"
 */
function getTargetId(href) {
  if (!href) return null;
  const idx = href.indexOf('#');
  if (idx === -1) return null;
  return href.substring(idx + 1) || null;
}

/**
 * Scroll suave a la sección, compensando el header sticky.
 */
function scrollToSection(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const header  = document.querySelector('#header');
  const headerH = header ? header.offsetHeight : 0;
  const gap     = 24;
  const top     = target.getBoundingClientRect().top + window.pageYOffset - headerH - gap;

  window.scrollTo({ top, behavior: 'smooth' });

  try {
    history.pushState(null, '', `#${targetId}`);
  } catch (_) {
    // noop — algunos browsers bloquean pushState en file://
  }
}

/**
 * Cierra el drawer móvil con compatibilidad amplia.
 */
function closeMobileMenu() {
  const mobileMenu   = document.getElementById('mobile-menu');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const overlay      = document.getElementById('menu-overlay');
  const body         = document.body;

  if (mobileMenu) {
    mobileMenu.classList.remove('is-open', 'is-active', 'open');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }
  if (hamburgerBtn) {
    hamburgerBtn.classList.remove('is-active', 'active', 'open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }
  if (overlay) {
    overlay.classList.remove('is-visible', 'is-active', 'open');
  }

  body.classList.remove('menu-open', 'no-scroll', 'overflow-hidden', 'modal-open');
  body.style.overflow     = '';
  body.style.paddingRight = '';
}

/**
 * Handler central — se registra en fase CAPTURE.
 */
function handleAnchorClick(e) {
  const link     = e.currentTarget;
  const href     = link.getAttribute('href');
  const targetId = getTargetId(href);

  if (!targetId) return;

  const targetEl = document.getElementById(targetId);
  if (!targetEl) {
    // No existe en esta página → dejar navegar al browser
    return;
  }

  e.preventDefault();
  e.stopImmediatePropagation();

  closeMobileMenu();

  const isMobile = window.matchMedia('(max-width: 1024px)').matches;
  setTimeout(() => scrollToSection(targetId), isMobile ? 350 : 0);
}

/**
 * Registra el handler en todos los enlaces de producto,
 * usando Set para evitar registros duplicados (FIX 3).
 */
function initAnchorNavigation() {
  // Selectores sin solapamiento:
  // .prod-nav-pills .prod-pill cubre los pills del nav.
  // No se repite .prod-pill[href^="#"] para evitar doble registro.
  const selectors = [
    '.dropdown__item[href^="#"]',
    '.dropdown__item[href*="products.html#"]',
    '.mobile-nav__sub a[href^="#"]',
    '.mobile-nav__sub a[href*="products.html#"]',
    '.prod-nav-pills .prod-pill',
  ].join(', ');

  // FIX 3: Usar Set para deduplicar elementos que coincidan
  // con más de un selector, evitando doble registro del handler
  const linkSet = new Set(document.querySelectorAll(selectors));

  linkSet.forEach((link) => {
    link.addEventListener('click', handleAnchorClick, { capture: true });
  });

  // ── Hash inicial en la URL ───────────────────────────────
  // Si se llega a products.html#auto-insurance, hacer scroll correcto
  const initialHash = window.location.hash?.substring(1);
  if (initialHash && document.getElementById(initialHash)) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => scrollToSection(initialHash), 100);
      });
    });
  }
}