/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — Contact Page JavaScript
 * File: js/contact.js
 * Description: Interactions exclusive to contact.html
 *
 * TABLE OF CONTENTS
 * 1.  DOMContentLoaded Init
 * 2.  Form Submission (fetch → send_mail.php — original logic)
 * 3.  Real-time Field Validation
 * 4.  Phone Number Auto-Formatting
 * 5.  SMS Consent Checkbox Animation
 * 6.  Floating Buttons — Show/Hide on Scroll
 * 7.  Info Panel Items — Hover Entrance
 * ================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  initFieldValidation();
  initPhoneFormatter();
  initConsentAnimation();
  initFloatingButtons();
  initInfoPanelEntrance();
});


/* ================================================================
   2. FORM SUBMISSION
   Exact same logic as the original contact.html:
   - Prevents default submit
   - Reads smsConsentCheckbox → sets "Yes" or "No" in FormData
   - Fetches POST to send_mail.php
   - Checks for "success" text in response
   - Shows success or error message in #formMessage
================================================================ */
function initContactForm() {
  const form       = document.getElementById('contactForm');
  const messageBox = document.getElementById('formMessage');
  const submitBtn  = document.getElementById('submitBtn');
  if (!form || !messageBox || !submitBtn) return;

  const submitText    = submitBtn.querySelector('.cform__submit-text');
  const submitLoading = submitBtn.querySelector('.cform__submit-loading');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Run client-side validation first
    if (!validateAllFields()) return;

    const formData = new FormData(form);

    // ✅ Capture SMS checkbox state — same as original (Yes / No)
    const smsCheckbox = document.getElementById('smsConsentCheckbox');
    formData.set('sms_consent', smsCheckbox.checked ? 'Yes' : 'No');

    // Show loading state
    setLoadingState(true);
    showMessage('loading', '<i class="ri-loader-4-line cform__spinner"></i> Sending your message…');

    try {
      const response = await fetch('send_mail.php', {
        method: 'POST',
        body: formData,
      });

      const result = await response.text();

      // ✅ Original success check: result.trim() === "success"
      if (result.trim() === 'success') {
        showMessage(
          'success',
          '<i class="ri-checkbox-circle-line"></i> We\'ve received your message. Our team will get back to you as soon as possible.'
        );
        form.reset();
        clearAllValidationStates();
        // Scroll message into view
        messageBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        showMessage(
          'error',
          '<i class="ri-close-circle-line"></i> There was a problem sending your message. Please try again later.'
        );
      }

    } catch (error) {
      showMessage(
        'error',
        '<i class="ri-wifi-off-line"></i> Connection error. Please check your connection and try again.'
      );
    } finally {
      setLoadingState(false);
    }
  });

  /**
   * Toggle the button loading state.
   * @param {boolean} isLoading
   */
  function setLoadingState(isLoading) {
    submitBtn.disabled = isLoading;
    if (submitText)    submitText.hidden    = isLoading;
    if (submitLoading) submitLoading.hidden = !isLoading;
  }

  /**
   * Show a status message in #formMessage.
   * @param {'success'|'error'|'loading'} type
   * @param {string} html  — HTML string for message content
   */
  function showMessage(type, html) {
    messageBox.removeAttribute('hidden');
    messageBox.innerHTML = `<div class="cform__message-${type}">${html}</div>`;

    // Auto-hide loading messages when done
    if (type !== 'loading') {
      // Keep success/error visible — do not auto-dismiss
    }
  }
}


/* ================================================================
   3. REAL-TIME FIELD VALIDATION
   Validates fields on blur and shows inline error messages.
   Clears errors as user types.
================================================================ */
function initFieldValidation() {
  const nameInput    = document.getElementById('name');
  const emailInput   = document.getElementById('email');
  const messageInput = document.getElementById('message');

  // Validate on blur
  nameInput?.addEventListener('blur', () => validateName(nameInput));
  emailInput?.addEventListener('blur', () => validateEmail(emailInput));
  messageInput?.addEventListener('blur', () => validateMessage(messageInput));

  // Clear errors as user types
  [nameInput, emailInput, messageInput].forEach((input) => {
    input?.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      // Only add valid class when input has content
      if (input.value.trim()) {
        clearError(input.id + '-error');
      }
    });
  });
}

function validateAllFields() {
  const nameInput    = document.getElementById('name');
  const emailInput   = document.getElementById('email');
  const messageInput = document.getElementById('message');

  let isValid = true;

  if (!validateName(nameInput))    isValid = false;
  if (!validateEmail(emailInput))  isValid = false;
  if (!validateMessage(messageInput)) isValid = false;

  // Scroll to first error
  if (!isValid) {
    const firstError = document.querySelector('.cform__input.is-invalid');
    firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstError?.focus();
  }

  return isValid;
}

function validateName(input) {
  if (!input) return true;
  const val = input.value.trim();

  if (!val || val.length < 2) {
    setFieldError(input, 'name-error', 'Please enter your full name (at least 2 characters).');
    return false;
  }
  setFieldValid(input, 'name-error');
  return true;
}

function validateEmail(input) {
  if (!input) return true;
  const val   = input.value.trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!val || !regex.test(val)) {
    setFieldError(input, 'email-error', 'Please enter a valid email address.');
    return false;
  }
  setFieldValid(input, 'email-error');
  return true;
}

function validateMessage(input) {
  if (!input) return true;
  const val = input.value.trim();

  if (!val || val.length < 10) {
    setFieldError(input, 'message-error', 'Please enter a message (at least 10 characters).');
    return false;
  }
  setFieldValid(input, 'message-error');
  return true;
}

function setFieldError(input, errorId, message) {
  input.classList.add('is-invalid');
  input.classList.remove('is-valid');
  input.setAttribute('aria-invalid', 'true');

  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.removeAttribute('hidden');
  }
}

function setFieldValid(input, errorId) {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  input.setAttribute('aria-invalid', 'false');
  clearError(errorId);
}

function clearError(errorId) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.setAttribute('hidden', '');
  }
}

function clearAllValidationStates() {
  document.querySelectorAll('.cform__input').forEach((input) => {
    input.classList.remove('is-valid', 'is-invalid');
    input.removeAttribute('aria-invalid');
  });
  document.querySelectorAll('.cform__error').forEach((el) => {
    el.textContent = '';
    el.setAttribute('hidden', '');
  });
}


/* ================================================================
   4. PHONE NUMBER AUTO-FORMATTING
   Formats US phone numbers as (XXX) XXX-XXXX while typing.
   Strips non-numeric characters automatically.
================================================================ */
function initPhoneFormatter() {
  const phoneInput = document.getElementById('phone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (e) => {
    let raw     = e.target.value.replace(/\D/g, ''); // strip non-digits
    let formatted = '';

    if (raw.length === 0) {
      formatted = '';
    } else if (raw.length <= 3) {
      formatted = `(${raw}`;
    } else if (raw.length <= 6) {
      formatted = `(${raw.slice(0, 3)}) ${raw.slice(3)}`;
    } else {
      formatted = `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6, 10)}`;
    }

    e.target.value = formatted;
  });

  // Allow only digits and formatting keys
  phoneInput.addEventListener('keydown', (e) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End',
    ];
    if (allowedKeys.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return; // allow copy/paste
    if (!/^\d$/.test(e.key)) e.preventDefault();
  });
}


/* ================================================================
   5. SMS CONSENT CHECKBOX ANIMATION
   Adds a subtle scale animation to the custom checkbox
   when the user checks/unchecks it.
================================================================ */
function initConsentAnimation() {
  const checkbox = document.getElementById('smsConsentCheckbox');
  const custom   = document.querySelector('.cform__consent-custom');
  if (!checkbox || !custom) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  checkbox.addEventListener('change', () => {
    custom.style.transition = 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease';
    custom.style.transform  = 'scale(1.25)';
    setTimeout(() => {
      custom.style.transform = 'scale(1)';
    }, 200);
  });
}


/* ================================================================
   6. FLOATING BUTTONS — Subtle Entrance on Load
   The floating payment and WhatsApp buttons slide in from the
   right side 1.5s after page load.
================================================================ */
function initFloatingButtons() {
  const buttons = document.querySelectorAll('.float-btn');
  if (!buttons.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Start hidden off-screen to the right
  buttons.forEach((btn, i) => {
    btn.style.opacity   = '0';
    btn.style.transform = 'translateX(80px)';
    btn.style.transition = `opacity 0.5s ease ${1.2 + i * 0.15}s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${1.2 + i * 0.15}s`;
  });

  // Trigger entrance after short delay
  requestAnimationFrame(() => {
    buttons.forEach((btn) => {
      btn.style.opacity   = '1';
      btn.style.transform = 'translateX(0)';
    });
  });
}


/* ================================================================
   7. INFO PANEL — Hover Entrance for Items
   Contact info items reveal with a staggered entrance when
   the info panel first enters the viewport.
================================================================ */
function initInfoPanelEntrance() {
  const items = document.querySelectorAll('.cinfo-item');
  if (!items.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Set initial hidden state
  items.forEach((item, i) => {
    item.style.opacity   = '0';
    item.style.transform = 'translateX(-16px)';
    item.style.transition =
      `opacity 0.45s ease ${i * 0.07}s,` +
      `transform 0.45s cubic-bezier(0.25,0.8,0.25,1) ${i * 0.07}s`;
  });

  const card = document.querySelector('.cinfo-card');
  if (!card) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      items.forEach((item) => {
        item.style.opacity   = '1';
        item.style.transform = 'translateX(0)';
      });
      observer.disconnect();
    },
    { threshold: 0.20 }
  );

  observer.observe(card);
}