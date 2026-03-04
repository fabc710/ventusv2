/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — Products Page JavaScript
 * File: js/products.js
 *
 * TABLE OF CONTENTS
 * 1.  DOMContentLoaded Init
 * 2.  Coverage Tabs
 * 3.  FAQ Accordion
 * 4.  Sticky Product Nav
 * 5.  Product Scroll Spy
 * 6.  Product Parallax
 * 7.  Anchor Navigation — Fix definitivo (mobile + desktop)
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
   2. COVERAGE TABS
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
          e.preventDefault(); newIndex = 0;
        } else if (e.key === 'End') {
          e.preventDefault(); newIndex = tabs.length - 1;
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
    isActive ? panel.removeAttribute('hidden') : panel.setAttribute('hidden', '');
  });
}


/* ================================================================
   3. FAQ ACCORDION
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

      faqItems.forEach((other) => {
        const oQ = other.querySelector('.faq__question');
        const oA = other.querySelector('.faq__answer');
        if (oQ && oA && other !== item) {
          oQ.setAttribute('aria-expanded', 'false');
          oA.setAttribute('hidden', '');
        }
      });

      question.setAttribute('aria-expanded', String(!isOpen));
      if (!isOpen) {
        answer.removeAttribute('hidden');
        setTimeout(() => {
          const rect   = item.getBoundingClientRect();
          const header = document.querySelector('#header');
          const offset = header ? header.offsetHeight + 16 : 140;
          if (rect.top < offset) window.scrollBy({ top: rect.top - offset, behavior: 'smooth' });
        }, 50);
      } else {
        answer.setAttribute('hidden', '');
      }
    });

    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); question.click(); }
    });
  });
}


/* ================================================================
   4. STICKY PRODUCT NAV
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

  // Registrar los mismos handlers en los pills duplicados del sticky
  stickyPills.forEach((pill) => {
    pill.addEventListener('click', handleAnchorClick, { capture: true });
  });

  new IntersectionObserver(([entry]) => {
    sticky.classList.toggle('is-visible', !entry.isIntersecting);
    sticky.setAttribute('aria-hidden', String(entry.isIntersecting));
  }, { threshold: 0.1 }).observe(hero);

  window.addEventListener('productScrollSpy', (e) => {
    const activeId = e.detail?.activeId;
    stickyPills.forEach((pill) => {
      pill.classList.toggle('prod-pill--active', pill.getAttribute('href') === `#${activeId}`);
    });
  });
}


/* ================================================================
   5. PRODUCT SCROLL SPY
================================================================ */
function initProductScrollSpy() {
  const sections  = document.querySelectorAll('.product-detail[id]');
  const origPills = document.querySelectorAll('.prod-nav-pills .prod-pill');
  if (!sections.length || !origPills.length) return;

  const header = document.querySelector('#header');
  const offset = (header?.offsetHeight ?? 120) + 60;

  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeId = entry.target.id;
        origPills.forEach((pill) => {
          pill.classList.toggle('prod-pill--active', pill.getAttribute('href') === `#${activeId}`);
        });
        window.dispatchEvent(new CustomEvent('productScrollSpy', { detail: { activeId } }));
      }
    });
  }, { rootMargin: `-${offset}px 0px -50% 0px`, threshold: 0 }).observe;

  sections.forEach((section) => {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const activeId = entry.target.id;
          origPills.forEach((pill) => {
            pill.classList.toggle('prod-pill--active', pill.getAttribute('href') === `#${activeId}`);
          });
          window.dispatchEvent(new CustomEvent('productScrollSpy', { detail: { activeId } }));
        }
      });
    }, { rootMargin: `-${offset}px 0px -50% 0px`, threshold: 0 }).observe(section);
  });
}


/* ================================================================
   6. PRODUCT PARALLAX
================================================================ */
function initProductParallax() {
  const images = document.querySelectorAll('.product-detail__img-wrap img');
  if (!images.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;

  let ticking = false;

  function updateParallax() {
    const viewH = window.innerHeight;
    images.forEach((img) => {
      const wrap = img.closest('.product-detail__img-wrap');
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewH) return;
      const progress = 1 - (rect.bottom / (viewH + rect.height));
      const shift    = (progress - 0.5) * 24;
      img.style.transform  = `translateY(${shift}px) scale(1.04)`;
      img.style.transition = 'transform 0.12s linear';
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
  }, { passive: true });

  updateParallax();
}


/* ================================================================
   7. ANCHOR NAVIGATION — Fix definitivo
   ─────────────────────────────────────────────────────────────
   PROBLEMA RAÍZ:
   index.js tiene listeners en el dropdown y en el mobile drawer
   que llaman a preventDefault() / stopPropagation() bloqueando
   la navegación a anclas. Esto hace que:
     - Desktop: al hacer clic en un producto del dropdown, no pasa nada
     - Mobile: el browser intenta navegar a una ruta inexistente
               como /products/home-insurance.html

   SOLUCIÓN:
   1. Registramos nuestros handlers con { capture: true } — esto
      los ejecuta en la FASE DE CAPTURA, antes de que los
      listeners de index.js (que están en bubble phase) los vean.
   2. Usamos e.stopImmediatePropagation() para que NINGÚN otro
      handler (ni en capture ni en bubble) procese el evento.
   3. Cerramos el menú móvil manualmente.
   4. Hacemos el scroll suave con el offset del header.
   5. Actualizamos la URL con history.pushState.
================================================================ */

/**
 * Calcula el ID del destino a partir del href del enlace.
 * Soporta: "#home-insurance", "products.html#auto-insurance"
 */
function getTargetId(href) {
  if (!href) return null;
  const idx = href.indexOf('#');
  if (idx === -1) return null;
  return href.substring(idx + 1) || null;
}

/**
 * Scroll suave a la sección indicada por ID,
 * compensando la altura del header sticky.
 */
function scrollToSection(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const header   = document.querySelector('#header');
  const headerH  = header ? header.offsetHeight : 0;
  const gap      = 24; // px de respiro visual extra
  const top      = target.getBoundingClientRect().top + window.pageYOffset - headerH - gap;

  window.scrollTo({ top, behavior: 'smooth' });

  // Actualizar URL sin recargar
  try { history.pushState(null, '', `#${targetId}`); } catch (_) { /* noop */ }
}

/**
 * Cierra el drawer móvil sea cual sea la implementación de index.js.
 * Cubre las clases más comunes del proyecto.
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
  body.style.overflow    = '';
  body.style.paddingRight = '';
}

/**
 * Handler central para todos los enlaces de producto.
 * Se registra en fase CAPTURE para ejecutarse antes que index.js.
 */
function handleAnchorClick(e) {
  const link     = e.currentTarget;
  const href     = link.getAttribute('href');
  const targetId = getTargetId(href);

  // Si no hay ancla válida, dejamos el comportamiento por defecto
  if (!targetId) return;

  // Verificamos que el elemento destino existe en ESTA página
  const targetEl = document.getElementById(targetId);
  if (!targetEl) {
    // No existe en esta página → dejar que el browser navegue
    // (esto ocurrirá al venir de index.html con products.html#section)
    return;
  }

  // Cancelar TODOS los demás handlers (incluido index.js)
  e.preventDefault();
  e.stopImmediatePropagation();

  // Cerrar menú móvil si está abierto
  closeMobileMenu();

  // En móvil, dar tiempo al drawer para cerrarse antes del scroll
  const isMobile = window.matchMedia('(max-width: 1024px)').matches;
  setTimeout(() => scrollToSection(targetId), isMobile ? 350 : 0);
}

/**
 * Registra el handler en todos los enlaces de producto de la página.
 */
function initAnchorNavigation() {
  // Todos los selectores posibles de enlaces de producto
  const selectors = [
    '.dropdown__item[href^="#"]',
    '.dropdown__item[href*="products.html#"]',
    '.mobile-nav__sub a[href^="#"]',
    '.mobile-nav__sub a[href*="products.html#"]',
    '.prod-nav-pills .prod-pill',
    '.prod-pill[href^="#"]',
  ].join(', ');

  const links = document.querySelectorAll(selectors);

  links.forEach((link) => {
    // { capture: true } → ejecuta ANTES que cualquier listener de bubble phase
    link.addEventListener('click', handleAnchorClick, { capture: true });
  });

  // ── Hash inicial en la URL ───────────────────────────────
  // Si la página se carga con #section en la URL (ej: products.html#auto-insurance)
  // hacemos el scroll correcto después de que el DOM pinte.
  const initialHash = window.location.hash?.substring(1);
  if (initialHash && document.getElementById(initialHash)) {
    // doble rAF para esperar el layout completo
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => scrollToSection(initialHash), 100);
      });
    });
  }
}