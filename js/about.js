/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — About Us JavaScript
 * File: js/about.js
 * Version: 2.1 — Marquee single-row fix, reduced motion/touch fallback
 * ================================================================
 *
 * TABLE OF CONTENTS
 * 1.  DOMContentLoaded Init
 * 2.  Timeline — Scroll Reveal with Progress Highlight
 * 3.  Team Cards — Tilt Effect on Hover
 * 4.  Marquee — Single-Row Control (reduced motion / touch)
 * 5.  MVV Cards — Entrance Stagger
 * 6.  Trust Badges — Entrance Animation
 * 7.  Page Hero Shapes — Parallax on Mouse Move
 * 8.  Story Section — Image Parallax on Scroll
 * ================================================================
 *
 * NOTE: All shared functionality (navbar scroll, hamburger, mobile
 * menu, AOS, back-to-top, current year, smooth scroll, dropdown)
 * is handled by js/index.js loaded on this page.
 * This file handles ONLY about.html-specific interactions.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initTimelineHighlight();
  initTeamCardTilt();
  initMarqueeControl();
  initMVVStagger();
  initTrustBadgeEntrance();
  initHeroParallax();
  initStoryImageParallax();
});


/* ================================================================
   2. TIMELINE — Active Highlight on Scroll
================================================================ */
function initTimelineHighlight() {
  const items = document.querySelectorAll('.timeline__item');
  if (!items.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const dot     = entry.target.querySelector('.timeline__dot');
        const content = entry.target.querySelector('.timeline__content');
        const year    = entry.target.querySelector('.timeline__year');

        if (entry.isIntersecting) {
          entry.target.classList.add('timeline__item--visible');

          if (!prefersReduced && dot) {
            dot.style.transform  = 'scale(1.4)';
            dot.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
            setTimeout(() => { dot.style.transform = 'scale(1)'; }, 400);
          }

          if (year) {
            year.style.color      = 'var(--color-gold-dark)';
            year.style.fontWeight = '900';
            year.style.transition = 'color 0.3s ease, font-weight 0.3s ease';
          }

          if (content) {
            content.style.borderColor = 'rgba(197,171,98,0.45)';
            content.style.transition  = 'border-color 0.4s ease, box-shadow 0.4s ease';
            content.style.boxShadow   = '0 8px 32px rgba(18,33,71,0.12)';
          }

        } else {
          entry.target.classList.remove('timeline__item--visible');

          if (year && !entry.target.classList.contains('timeline__item--current')) {
            year.style.color      = '';
            year.style.fontWeight = '';
          }

          if (content && !entry.target.classList.contains('timeline__item--current')) {
            content.style.borderColor = '';
            content.style.boxShadow   = '';
          }
        }
      });
    },
    { threshold: 0.55, rootMargin: '0px 0px -10% 0px' }
  );

  items.forEach((item) => observer.observe(item));
}


/* ================================================================
   3. TEAM CARDS — Subtle 3D Tilt on Mouse Move
================================================================ */
function initTeamCardTilt() {
  const cards = document.querySelectorAll('.team-card');
  if (!cards.length) return;

  const isTouch        = window.matchMedia('(hover: none)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isTouch || prefersReduced) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', handleTilt);
    card.addEventListener('mouseleave', resetTilt);
  });

  function handleTilt(e) {
    const card    = e.currentTarget;
    const rect    = card.getBoundingClientRect();
    const centerX = rect.left + rect.width  / 2;
    const centerY = rect.top  + rect.height / 2;
    const mouseX  = e.clientX - centerX;
    const mouseY  = e.clientY - centerY;
    const maxTilt = 6;
    const tiltX   = (mouseY / (rect.height / 2)) * -maxTilt;
    const tiltY   = (mouseX / (rect.width  / 2)) *  maxTilt;

    card.style.transform  = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
    card.style.transition = 'transform 0.08s linear';
    card.style.willChange = 'transform';
  }

  function resetTilt(e) {
    const card = e.currentTarget;
    card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
    setTimeout(() => { card.style.willChange = ''; }, 500);
  }
}


/* ================================================================
   4. MARQUEE — JS-driven right-to-left infinite scroll
   Uses requestAnimationFrame for guaranteed smooth movement.
   Direction: items enter from the RIGHT, exit to the LEFT.

   HOW IT WORKS:
   - CSS animation on .carriers__track is disabled by JS.
   - JS measures the half-width of the track (= one full set of logos).
   - Each frame subtracts `speed` px from currentX (moves left).
   - When |currentX| reaches halfWidth we reset to 0 — seamless loop
     because the second half of the track is an exact duplicate.

   FALLBACK (touch / reduced-motion):
   - Animation stopped, duplicates removed, grid layout shown.
================================================================ */
function initMarqueeControl() {
  const track   = document.querySelector('.carriers__track');
  const wrapper = document.querySelector('.carriers__marquee-wrapper');
  if (!track || !wrapper) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch        = window.matchMedia('(hover: none)').matches;

  /* ── Static grid fallback (touch / reduced-motion) ── */
  if (prefersReduced || isTouch) {
    track.style.animation      = 'none';
    track.style.flexWrap       = 'wrap';
    track.style.justifyContent = 'center';
    track.style.gap            = '1rem';
    track.style.width          = '100%';
    track.style.transform      = 'none';

    // Remove duplicate items (second half)
    const allItems = Array.from(track.querySelectorAll('.carrier__logo-item'));
    const half     = Math.ceil(allItems.length / 2);
    allItems.slice(half).forEach((item) => item.remove());

    // Full colour in static view
    track.querySelectorAll('.carrier__logo-item img').forEach((img) => {
      img.style.filter = 'none';
    });
    return;
  }

  /* ── Animated version: JS-driven RAF scroll ── */

  // Kill the CSS @keyframes animation — JS takes over completely
  track.style.animation = 'none';
  track.style.willChange = 'transform';

  // Speed in px/frame (at 60 fps: 0.6 ≈ 36 px/s — adjust to taste)
  const SPEED = 0.6;
  let currentX = 0;
  let paused   = false;
  let rafId    = null;
  let halfWidth = 0;

  // Measure after first paint so layout is complete
  requestAnimationFrame(() => {
    // scrollWidth = total width of all 24 cards + gaps
    // halfWidth   = exactly one set of 12 logos (the seamless reset point)
    halfWidth = track.scrollWidth / 2;

    function tick() {
      if (!paused) {
        currentX -= SPEED;                        // ← move LEFT (right→left)
        if (Math.abs(currentX) >= halfWidth) {
          currentX = 0;                           // seamless reset
        }
        track.style.transform = `translateX(${currentX}px)`;
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
  });

  /* ── Pause on wrapper hover ── */
  wrapper.addEventListener('mouseenter', () => { paused = true;  });
  wrapper.addEventListener('mouseleave', () => { paused = false; });

  /* ── Pause on keyboard focus (accessibility) ── */
  track.querySelectorAll('a, [tabindex]').forEach((link) => {
    link.addEventListener('focus', () => { paused = true;  });
    link.addEventListener('blur',  () => { paused = false; });
  });

  /* ── Stop RAF when page is hidden (performance) ── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(function tick() {
        if (!paused) {
          currentX -= SPEED;
          if (Math.abs(currentX) >= halfWidth) currentX = 0;
          track.style.transform = `translateX(${currentX}px)`;
        }
        rafId = requestAnimationFrame(tick);
      });
    }
  });
}


/* ================================================================
   5. MVV CARDS — Entrance Stagger Animation
================================================================ */
function initMVVStagger() {
  const cards = document.querySelectorAll('.mvv-card');
  if (!cards.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  cards.forEach((card, i) => {
    card.style.opacity    = '0';
    card.style.transform  = 'translateY(28px)';
    card.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s cubic-bezier(0.25,0.8,0.25,1) ${i * 0.15}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          cards.forEach((card) => {
            card.style.opacity   = '1';
            card.style.transform = 'translateY(0)';
          });
          observer.disconnect();
        }
      });
    },
    { threshold: 0.20 }
  );

  const mvvGrid = document.querySelector('.mvv__grid');
  if (mvvGrid) observer.observe(mvvGrid);
}


/* ================================================================
   6. TRUST BADGES — Entrance Animation
================================================================ */
function initTrustBadgeEntrance() {
  const badges = document.querySelectorAll('.trust-badge');
  if (!badges.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  badges.forEach((badge, i) => {
    badge.style.opacity    = '0';
    badge.style.transform  = 'translateY(20px)';
    badge.style.transition = `opacity 0.5s ease ${i * 0.10}s, transform 0.5s ease ${i * 0.10}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          badges.forEach((badge) => {
            badge.style.opacity   = '1';
            badge.style.transform = 'translateY(0)';
          });
          observer.disconnect();
        }
      });
    },
    { threshold: 0.25 }
  );

  const badgesWrapper = document.querySelector('.trust__badges');
  if (badgesWrapper) observer.observe(badgesWrapper);
}


/* ================================================================
   7. PAGE HERO SHAPES — Parallax on Mouse Move
================================================================ */
function initHeroParallax() {
  const hero   = document.querySelector('.page-hero');
  const shapes = document.querySelectorAll('.page-hero__shape');
  if (!hero || !shapes.length) return;

  const isTouch        = window.matchMedia('(hover: none)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isTouch || prefersReduced) return;

  const depths = [0.018, 0.012, 0.025];

  hero.addEventListener('mousemove', (e) => {
    const rect    = hero.getBoundingClientRect();
    const centerX = rect.width  / 2;
    const centerY = rect.height / 2;
    const offsetX = e.clientX - rect.left - centerX;
    const offsetY = e.clientY - rect.top  - centerY;

    shapes.forEach((shape, i) => {
      const depth = depths[i] ?? 0.015;
      shape.style.transform = `translate(${offsetX * depth}px, ${offsetY * depth}px)`;
      shape.style.transition = 'transform 0.4s ease-out';
    });
  });

  hero.addEventListener('mouseleave', () => {
    shapes.forEach((shape) => {
      shape.style.transform  = 'translate(0, 0)';
      shape.style.transition = 'transform 0.8s ease-out';
    });
  });
}


/* ================================================================
   8. STORY SECTION — Image Subtle Parallax on Scroll
================================================================ */
function initStoryImageParallax() {
  const imgMain = document.querySelector('.story__img-main img');
  if (!imgMain) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch        = window.matchMedia('(hover: none)').matches;
  if (prefersReduced || isTouch) return;

  let ticking = false;

  function updateParallax() {
    const section    = imgMain.closest('.story-section');
    if (!section) return;

    const rect       = section.getBoundingClientRect();
    const viewHeight = window.innerHeight;

    if (rect.bottom < 0 || rect.top > viewHeight) {
      ticking = false;
      return;
    }

    const progress = 1 - (rect.bottom / (viewHeight + rect.height));
    const shift    = (progress - 0.5) * 30;

    imgMain.style.transform  = `translateY(${shift}px) scale(1.04)`;
    imgMain.style.transition = 'transform 0.1s linear';
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