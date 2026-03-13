/**
 * VENTUS INSURANCE AGENCY — Privacy Page JavaScript
 * File: js/privacy.js
 * Handles: Table of contents active highlighting + smooth scroll
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initTocHighlight();
  initCurrentYear();
});

/* ── Active TOC link as user scrolls ── */
function initTocHighlight() {
  const sections  = document.querySelectorAll('.policy-section[id]');
  const tocLinks  = document.querySelectorAll('.toc-link');
  if (!sections.length || !tocLinks.length) return;

  const header = document.querySelector('#header');
  const offset = (header ? header.offsetHeight : 124) + 24;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('is-active', isActive);
          });
        }
      });
    },
    { rootMargin: `-${offset}px 0px -60% 0px`, threshold: 0 }
  );

  sections.forEach(s => observer.observe(s));
}

/* ── Current year in footer ── */
function initCurrentYear() {
  const el = document.querySelector('#current-year');
  if (el) el.textContent = new Date().getFullYear();
}