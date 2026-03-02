/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — About Us JavaScript
 * File: js/about.js
 * Description: Interactive functionality exclusive to about.html
 *
 * TABLE OF CONTENTS
 * 1.  DOMContentLoaded Init
 * 2.  Timeline — Scroll Reveal with Progress Highlight
 * 3.  Team Cards — Tilt Effect on Hover
 * 4.  Marquee — Pause on Hover & Reduced Motion
 * 5.  MVV Cards — Entrance Stagger
 * 6.  Trust Badges — Counter Animation
 * 7.  Page Hero Shapes — Parallax on Mouse Move
 * 8.  Story Section — Image Parallax on Scroll
 * ================================================================
 */

'use strict';

/* ================================================================
   NOTE: All shared functionality (navbar scroll, hamburger,
   mobile menu, AOS, back-to-top, current year, smooth scroll)
   is already handled by js/index.js which is loaded on this page.
   This file handles ONLY about.html-specific interactions.
================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initTimelineHighlight();
  initTeamCardTilt();
  initMarqueeControl();
  initMVVStagger();
  initHeroParallax();
  initStoryImageParallax();
});


/* ================================================================
   2. TIMELINE — Active Highlight on Scroll
   As user scrolls, each timeline item gets highlighted when
   it enters the center of the viewport.
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

          // Animate dot pulse (skip if reduced motion)
          if (!prefersReduced && dot) {
            dot.style.transform = 'scale(1.4)';
            dot.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
            setTimeout(() => {
              dot.style.transform = 'scale(1)';
            }, 400);
          }

          // Highlight year text
          if (year) {
            year.style.color = 'var(--color-gold-dark)';
            year.style.fontWeight = '900';
            year.style.transition = 'color 0.3s ease, font-weight 0.3s ease';
          }

          // Add glow to content card
          if (content) {
            content.style.borderColor = 'rgba(197,171,98,0.45)';
            content.style.transition = 'border-color 0.4s ease, box-shadow 0.4s ease';
            content.style.boxShadow = '0 8px 32px rgba(18,33,71,0.12)';
          }

        } else {
          // Reset when out of view
          entry.target.classList.remove('timeline__item--visible');

          if (year && !entry.target.classList.contains('timeline__item--current')) {
            year.style.color = '';
            year.style.fontWeight = '';
          }

          if (content && !entry.target.classList.contains('timeline__item--current')) {
            content.style.borderColor = '';
            content.style.boxShadow = '';
          }
        }
      });
    },
    {
      threshold: 0.55,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  items.forEach((item) => observer.observe(item));
}


/* ================================================================
   3. TEAM CARDS — Subtle 3D Tilt on Mouse Move
   Creates a gentle perspective tilt on desktop hover.
================================================================ */
function initTeamCardTilt() {
  const cards = document.querySelectorAll('.team-card');
  if (!cards.length) return;

  // Skip on touch devices or reduced motion
  const isTouch = window.matchMedia('(hover: none)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isTouch || prefersReduced) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', handleTilt);
    card.addEventListener('mouseleave', resetTilt);
  });

  function handleTilt(e) {
    const card   = e.currentTarget;
    const rect   = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top  + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Max tilt: 6 degrees
    const maxTilt = 6;
    const tiltX = (mouseY / (rect.height / 2)) * -maxTilt;
    const tiltY = (mouseX / (rect.width  / 2)) *  maxTilt;

    card.style.transform    = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
    card.style.transition   = 'transform 0.08s linear';
    card.style.willChange   = 'transform';
  }

  function resetTilt(e) {
    const card = e.currentTarget;
    card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';

    // Clean up will-change after animation
    setTimeout(() => {
      card.style.willChange = '';
    }, 500);
  }
}


/* ================================================================
   4. MARQUEE — Pause on Focus & Reduced Motion
   The CSS animation already handles pause on hover via
   .carriers__track:hover. This JS handles:
   - Keyboard focus pause (accessibility)
   - prefers-reduced-motion: stops animation entirely
   - Touch: disables animation for cleaner mobile experience
================================================================ */
function initMarqueeControl() {
  const track = document.querySelector('.carriers__track');
  if (!track) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch        = window.matchMedia('(hover: none)').matches;

  // Stop animation for reduced motion or touch
  if (prefersReduced || isTouch) {
    track.style.animation = 'none';
    track.style.display   = 'flex';
    track.style.flexWrap  = 'wrap';
    track.style.justifyContent = 'center';
    track.style.gap = '1rem';
    track.style.width = 'auto';

    // Remove duplicate items (second half)
    const allItems = track.querySelectorAll('.carrier__logo-item');
    const half = Math.floor(allItems.length / 2);
    for (let i = half; i < allItems.length; i++) {
      allItems[i].remove();
    }
    return;
  }

  // Pause marquee when any link inside receives focus (keyboard nav)
  const links = track.querySelectorAll('a, [tabindex]');
  links.forEach((link) => {
    link.addEventListener('focus', () => {
      track.style.animationPlayState = 'paused';
    });
    link.addEventListener('blur', () => {
      track.style.animationPlayState = 'running';
    });
  });
}


/* ================================================================
   5. MVV CARDS — Entrance Stagger Animation
   The three MVV cards appear in sequence (beyond what AOS does)
   with a slight vertical cascade for a polished presentation.
================================================================ */
function initMVVStagger() {
  const cards = document.querySelectorAll('.mvv-card');
  if (!cards.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Set initial state
  cards.forEach((card, i) => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(28px)';
    card.style.transition = `opacity 0.6s ease ${i * 0.15}s, transform 0.6s cubic-bezier(0.25,0.8,0.25,1) ${i * 0.15}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Animate all cards when section enters view
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

  // Observe the MVV grid container
  const mvvGrid = document.querySelector('.mvv__grid');
  if (mvvGrid) observer.observe(mvvGrid);
}


/* ================================================================
   6. TRUST BADGES — Subtle Entrance Animation
   Badges fade in and slide up in sequence when visible.
================================================================ */
function initTrustBadgeEntrance() {
  const badges = document.querySelectorAll('.trust-badge');
  if (!badges.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  badges.forEach((badge, i) => {
    badge.style.opacity   = '0';
    badge.style.transform = 'translateY(20px)';
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

  const wrapper = document.querySelector('.trust__badges');
  if (wrapper) observer.observe(wrapper);
}


/* ================================================================
   7. PAGE HERO SHAPES — Parallax on Mouse Move
   The decorative background shapes in the page hero subtly
   shift their position with the mouse for a depth effect.
================================================================ */
function initHeroParallax() {
  const hero   = document.querySelector('.page-hero');
  const shapes = document.querySelectorAll('.page-hero__shape');
  if (!hero || !shapes.length) return;

  const isTouch        = window.matchMedia('(hover: none)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isTouch || prefersReduced) return;

  // Each shape has a different parallax multiplier for depth layering
  const depths = [0.018, 0.012, 0.025];

  hero.addEventListener('mousemove', (e) => {
    const rect    = hero.getBoundingClientRect();
    const centerX = rect.width  / 2;
    const centerY = rect.height / 2;
    const offsetX = e.clientX - rect.left  - centerX;
    const offsetY = e.clientY - rect.top   - centerY;

    shapes.forEach((shape, i) => {
      const depth = depths[i] || 0.015;
      const moveX = offsetX * depth;
      const moveY = offsetY * depth;
      shape.style.transform = `translate(${moveX}px, ${moveY}px)`;
      shape.style.transition = 'transform 0.4s ease-out';
    });
  });

  hero.addEventListener('mouseleave', () => {
    shapes.forEach((shape) => {
      shape.style.transform = 'translate(0, 0)';
      shape.style.transition = 'transform 0.8s ease-out';
    });
  });
}


/* ================================================================
   8. STORY SECTION — Image Subtle Parallax on Scroll
   The story main image moves slightly on scroll to create depth.
================================================================ */
function initStoryImageParallax() {
  const imgMain = document.querySelector('.story__img-main img');
  if (!imgMain) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch        = window.matchMedia('(hover: none)').matches;
  if (prefersReduced || isTouch) return;

  let ticking = false;

  function updateParallax() {
    const section = imgMain.closest('.story-section');
    if (!section) return;

    const rect       = section.getBoundingClientRect();
    const viewHeight = window.innerHeight;

    // Only apply when section is visible
    if (rect.bottom < 0 || rect.top > viewHeight) {
      ticking = false;
      return;
    }

    // Progress: 0 (entering bottom) → 1 (leaving top)
    const progress = 1 - (rect.bottom / (viewHeight + rect.height));
    // Subtle shift: max 30px up or down
    const shift = (progress - 0.5) * 30;

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

  // Run once on load
  updateParallax();
}


/* ================================================================
   INIT CALL — Functions called after DOM is ready
   (initTrustBadgeEntrance was defined above but called here
    to keep the init block clean and centralized)
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTrustBadgeEntrance();
});