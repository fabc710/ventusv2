/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — Blog Post JavaScript
 * File: js/blog-post.js
 *
 * TABLE OF CONTENTS
 * 1.  Init
 * 2.  Reading Progress Bar
 * 3.  FAQ Accordion
 * 4.  Table of Contents — Active Link Tracking (IntersectionObserver)
 * 5.  Savings Calculator
 * 6.  Copy Link Button
 * 7.  Share URL Builder (append current URL to share links)
 * ================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initReadingProgress();
  initFaqAccordion();
  initTocActiveTracking();
  initSavingsCalculator();
  initCopyLink();
  initShareLinks();
});


/* ================================================================
   HELPERS
================================================================ */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function formatCurrency(num) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num);
}


/* ================================================================
   2. READING PROGRESS BAR
================================================================ */
function initReadingProgress() {
  const bar = document.getElementById('reading-progress');
  if (!bar || prefersReducedMotion()) return;

  let raf = false;

  window.addEventListener('scroll', () => {
    if (raf) return;
    raf = true;
    requestAnimationFrame(() => {
      const max      = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
      bar.style.width = `${progress}%`;
      bar.setAttribute('aria-valuenow', String(progress));
      raf = false;
    });
  }, { passive: true });
}


/* ================================================================
   3. FAQ ACCORDION
================================================================ */
function initFaqAccordion() {
  const accordion = document.getElementById('faq-accordion');
  if (!accordion) return;

  accordion.addEventListener('click', (e) => {
    const btn = e.target.closest('.post-faq__question');
    if (!btn) return;

    const isOpen   = btn.getAttribute('aria-expanded') === 'true';
    const answerId = btn.getAttribute('aria-controls');
    const answer   = document.getElementById(answerId);
    if (!answer) return;

    // Close all other open items first
    accordion.querySelectorAll('.post-faq__question[aria-expanded="true"]').forEach((openBtn) => {
      if (openBtn === btn) return;
      openBtn.setAttribute('aria-expanded', 'false');
      const openAnswer = document.getElementById(openBtn.getAttribute('aria-controls'));
      if (openAnswer) openAnswer.hidden = true;
    });

    // Toggle the clicked item
    const newState = !isOpen;
    btn.setAttribute('aria-expanded', String(newState));
    answer.hidden = !newState;
  });
}


/* ================================================================
   4. TABLE OF CONTENTS — Active Link Tracking
   Uses IntersectionObserver to highlight the current section
   in the sidebar TOC as the user scrolls through the article.
================================================================ */
function initTocActiveTracking() {
  const tocLinks  = document.querySelectorAll('.toc-link');
  const sections  = document.querySelectorAll('[id]');

  if (!tocLinks.length || !sections.length) return;

  // Map of section id → toc link
  const linkMap = {};
  tocLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      linkMap[href.slice(1)] = link;
    }
  });

  let activeId = null;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeId = entry.target.id;
        }
      });

      // Update active state
      tocLinks.forEach((link) => link.classList.remove('is-active'));
      if (activeId && linkMap[activeId]) {
        linkMap[activeId].classList.add('is-active');
      }
    },
    {
      rootMargin: '-20% 0px -70% 0px',
      threshold:  0,
    }
  );

  sections.forEach((section) => {
    if (linkMap[section.id]) observer.observe(section);
  });
}


/* ================================================================
   5. SAVINGS CALCULATOR
================================================================ */
function initSavingsCalculator() {
  const calcBtn      = document.getElementById('calc-btn');
  const premiumInput = document.getElementById('calc-premium');
  const trucksInput  = document.getElementById('calc-trucks');
  const resultEl     = document.getElementById('calc-result');
  const savingsEl    = document.getElementById('calc-savings');
  const newPremEl    = document.getElementById('calc-new-premium');

  if (!calcBtn) return;

  calcBtn.addEventListener('click', () => {
    const premium = parseFloat(premiumInput?.value) || 0;
    const trucks  = parseFloat(trucksInput?.value)  || 1;

    if (premium <= 0) {
      premiumInput?.focus();
      premiumInput?.classList.add('is-invalid-calc');
      setTimeout(() => premiumInput?.classList.remove('is-invalid-calc'), 1800);
      return;
    }

    const totalPremium = premium * trucks;
    const savings      = totalPremium * 0.10;
    const newPremium   = totalPremium - savings;

    if (savingsEl)  savingsEl.textContent  = formatCurrency(savings);
    if (newPremEl)  newPremEl.textContent  = formatCurrency(newPremium);

    if (resultEl) resultEl.hidden = false;

    // Scroll result into view on mobile
    if (window.innerWidth < 768) {
      resultEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // Allow Enter key in inputs to trigger calculation
  [premiumInput, trucksInput].forEach((input) => {
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') calcBtn.click();
    });
  });
}


/* ================================================================
   6. COPY LINK BUTTON
================================================================ */
function initCopyLink() {
  const btn      = document.getElementById('copy-link-btn');
  const iconEl   = document.getElementById('copy-icon');
  const textEl   = document.getElementById('copy-text');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    // Feedback
    btn.classList.add('copied');
    if (iconEl)  iconEl.className  = 'ri-check-line';
    if (textEl)  textEl.textContent = 'Copied!';

    setTimeout(() => {
      btn.classList.remove('copied');
      if (iconEl)  iconEl.className  = 'ri-link';
      if (textEl)  textEl.textContent = 'Copy Link';
    }, 2200);
  });
}


/* ================================================================
   7. SHARE LINKS — Append Current URL
   Appends the page's actual URL to each social share link so
   they open pre-filled with the correct article URL.
================================================================ */
function initShareLinks() {
  const url = encodeURIComponent(window.location.href);

  const fbBtn  = document.querySelector('.post-share__btn--facebook');
  const liBtn  = document.querySelector('.post-share__btn--linkedin');
  const twBtn  = document.querySelector('.post-share__btn--twitter');

  if (fbBtn) {
    const base = fbBtn.getAttribute('href');
    fbBtn.setAttribute('href', base + url);
  }

  if (liBtn) {
    const base = liBtn.getAttribute('href');
    liBtn.setAttribute('href', base + url);
  }

  if (twBtn) {
    const base = twBtn.getAttribute('href');
    twBtn.setAttribute('href', base + url);
  }
}