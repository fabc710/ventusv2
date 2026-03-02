/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — Products Page JavaScript
 * File: js/products.js
 * Description: Interactions exclusive to products.html
 *
 * TABLE OF CONTENTS
 * 1.  DOMContentLoaded Init
 * 2.  Coverage Tabs — Accessible Tab Switching
 * 3.  FAQ Accordion — Accessible Open/Close
 * 4.  Sticky Product Nav Pills — Show on Scroll
 * 5.  Product Nav Pills — Active Highlight (Scroll Spy)
 * 6.  Product Detail — Image Parallax on Scroll
 * ================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initCoverageTabs();
  initFaqAccordion();
  initStickyProductNav();
  initProductScrollSpy();
  initProductParallax();
});


/* ================================================================
   2. COVERAGE TABS — Accessible Tab Switching
   Handles all .coverage__tabs groups on the page independently.
   Supports keyboard navigation: ArrowLeft, ArrowRight, Home, End.
================================================================ */
function initCoverageTabs() {
  const tabGroups = document.querySelectorAll('.coverage__tabs');

  tabGroups.forEach((group) => {
    const tabs   = Array.from(group.querySelectorAll('.coverage__tab'));
    const panels = [];

    // Collect sibling panels (immediately after the tab group)
    let sibling = group.nextElementSibling;
    while (sibling && sibling.classList.contains('coverage__panel')) {
      panels.push(sibling);
      sibling = sibling.nextElementSibling;
    }

    if (!tabs.length || !panels.length) return;

    // Click handler
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tabs, panels, index));

      // Keyboard navigation within tab group
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

/**
 * Activate a tab and show its corresponding panel.
 * @param {Element[]} tabs
 * @param {Element[]} panels
 * @param {number} activeIndex
 */
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
   3. FAQ ACCORDION — Accessible Open/Close
   Only one FAQ item can be open at a time per column.
   Full keyboard support with Enter and Space.
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

      // Close all other FAQs
      faqItems.forEach((otherItem) => {
        const otherQ = otherItem.querySelector('.faq__question');
        const otherA = otherItem.querySelector('.faq__answer');
        if (otherQ && otherA && otherItem !== item) {
          otherQ.setAttribute('aria-expanded', 'false');
          otherA.setAttribute('hidden', '');
        }
      });

      // Toggle current
      question.setAttribute('aria-expanded', String(!isOpen));
      if (!isOpen) {
        answer.removeAttribute('hidden');
        // Smooth scroll to ensure full item is visible
        setTimeout(() => {
          const rect = item.getBoundingClientRect();
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

    // Keyboard: Space and Enter
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });
}


/* ================================================================
   4. STICKY PRODUCT NAV — Appears after hero scrolls out of view
   Creates a fixed nav bar with the 5 product pills that
   becomes visible once the page hero is no longer in viewport.
================================================================ */
function initStickyProductNav() {
  const hero    = document.querySelector('.prod-hero');
  const origNav = document.querySelector('.prod-nav-pills');
  if (!hero || !origNav) return;

  // Clone the pills nav and inject as sticky
  const sticky = document.createElement('div');
  sticky.className = 'prod-nav-sticky';
  sticky.setAttribute('aria-hidden', 'true'); // decorative duplicate
  sticky.innerHTML = `<div class="container">${origNav.outerHTML}</div>`;
  document.body.appendChild(sticky);

  const stickyPills = sticky.querySelectorAll('.prod-pill');

  const observer = new IntersectionObserver(
    ([entry]) => {
      sticky.classList.toggle('is-visible', !entry.isIntersecting);
      sticky.setAttribute('aria-hidden', String(entry.isIntersecting));
    },
    { threshold: 0.1 }
  );

  observer.observe(hero);

  // Sync active state from scroll spy to sticky nav
  window.addEventListener('productScrollSpy', (e) => {
    const activeId = e.detail?.activeId;
    stickyPills.forEach((pill) => {
      const href = pill.getAttribute('href');
      pill.classList.toggle('prod-pill--active', href === `#${activeId}`);
    });
  });
}


/* ================================================================
   5. PRODUCT SCROLL SPY — Highlights active pill as user scrolls
   Uses IntersectionObserver to track which product section
   is currently in view and updates the nav pills accordingly.
================================================================ */
function initProductScrollSpy() {
  const sections  = document.querySelectorAll('.product-detail[id]');
  const origPills = document.querySelectorAll('.prod-nav-pills .prod-pill');
  if (!sections.length || !origPills.length) return;

  const header = document.querySelector('#header');
  const offset = (header?.offsetHeight ?? 120) + 60;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const activeId = entry.target.id;

          // Update original pills
          origPills.forEach((pill) => {
            pill.classList.toggle(
              'prod-pill--active',
              pill.getAttribute('href') === `#${activeId}`
            );
          });

          // Dispatch custom event for sticky nav sync
          window.dispatchEvent(
            new CustomEvent('productScrollSpy', { detail: { activeId } })
          );
        }
      });
    },
    {
      rootMargin: `-${offset}px 0px -50% 0px`,
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));
}


/* ================================================================
   6. PRODUCT DETAIL — Subtle Image Parallax on Scroll
   Each product's hero image shifts slightly as the user scrolls
   past it, creating a layered depth effect.
================================================================ */
function initProductParallax() {
  const images = document.querySelectorAll('.product-detail__img-wrap img');
  if (!images.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch        = window.matchMedia('(hover: none)').matches;
  if (prefersReduced || isTouch) return;

  let ticking = false;

  function updateParallax() {
    const viewH = window.innerHeight;

    images.forEach((img) => {
      const wrap = img.closest('.product-detail__img-wrap');
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();

      // Only process when in viewport
      if (rect.bottom < 0 || rect.top > viewH) return;

      const progress = 1 - (rect.bottom / (viewH + rect.height));
      const shift    = (progress - 0.5) * 24; // max ±12px

      img.style.transform  = `translateY(${shift}px) scale(1.04)`;
      img.style.transition = 'transform 0.12s linear';
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  updateParallax();
}