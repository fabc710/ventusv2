/**
 * ================================================================
 * VENTUS INSURANCE AGENCY — Contact Page JavaScript
 * File: js/contact.js
 * Version: 2.0 — Bug fixes applied
 *
 * FIXES IN THIS VERSION:
 * 1. initFloatingButtons: Un solo requestAnimationFrame (rAF) no
 *    garantiza que el browser haya pintado el estado inicial antes
 *    de ejecutar el callback — la transición saltaba sin animar.
 *    Corregido con doble rAF (patrón estándar) para asegurar que
 *    el estado opacity:0 / translateX(80px) se pinte primero.
 * 2. initFloatingButtons + initInfoPanelEntrance: Eliminado inline
 *    opacity:0 al DOMContentLoaded (FOIC). Ahora usan clases CSS
 *    --hidden para el estado inicial, igual que los otros archivos.
 *    Requiere en CSS:
 *      .float-btn--hidden  { opacity:0; transform:translateX(80px); }
 *      .cinfo-item--hidden { opacity:0; transform:translateX(-16px); }
 *    Nota: initFloatingButtons también puede conflictuar con el
 *    @keyframes floatBtnsIn del index.css — si ya existe esa
 *    animación en el CSS, esta función no es necesaria.
 * 3. initFloatingButtons: Conflicto potencial con @keyframes
 *    floatBtnsIn definido en index.css sobre .floating-buttons.
 *    Se agrega guard para no duplicar la animación si ya corre el CSS.
 * 4. initConsentAnimation: custom.style.transition se seteaba inline
 *    en cada change event pero nunca se limpiaba, dejando la
 *    transición inline activa permanentemente y bloqueando futuros
 *    estados CSS del elemento. Ahora se limpia con setTimeout tras
 *    la animación.
 *
 * TABLE OF CONTENTS
 * 1.  DOMContentLoaded Init
 * 2.  Utility Helpers
 * 3.  Form Submission (fetch → send_mail.php)
 * 4.  Real-time Field Validation
 * 5.  Phone Number Auto-Formatting
 * 6.  SMS Consent Checkbox Animation
 * 7.  Floating Buttons — Entrance Animation
 * 8.  Info Panel Items — Hover Entrance
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
   2. UTILITY HELPERS
================================================================ */

/**
 * Devuelve true si el usuario prefiere movimiento reducido.
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}


/* ================================================================
   3. FORM SUBMISSION
   Lógica original preservada:
   - Previene el submit por defecto
   - Lee smsConsentCheckbox → "Yes" o "No" en FormData
   - Fetch POST a send_mail.php
   - Verifica "success" en la respuesta
   - Muestra mensaje de éxito o error en #formMessage
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

    // Validación del lado del cliente primero
    if (!validateAllFields()) return;

    const formData = new FormData(form);

    // Captura del estado del checkbox SMS (mismo que el original)
    const smsCheckbox = document.getElementById('smsConsentCheckbox');
    formData.set('sms_consent', smsCheckbox.checked ? 'Yes' : 'No');

    setLoadingState(true);
    showMessage('loading', '<i class="ri-loader-4-line cform__spinner"></i> Sending your message…');

    try {
      const response = await fetch('send_mail.php', {
        method: 'POST',
        body: formData,
      });

      const result = await response.text();

      if (result.trim() === 'success') {
        showMessage(
          'success',
          '<i class="ri-checkbox-circle-line"></i> We\'ve received your message. Our team will get back to you as soon as possible.'
        );
        form.reset();
        clearAllValidationStates();
        messageBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        showMessage(
          'error',
          '<i class="ri-close-circle-line"></i> There was a problem sending your message. Please try again later.'
        );
      }

    } catch (_) {
      showMessage(
        'error',
        '<i class="ri-wifi-off-line"></i> Connection error. Please check your connection and try again.'
      );
    } finally {
      setLoadingState(false);
    }
  });

  function setLoadingState(isLoading) {
    submitBtn.disabled = isLoading;
    if (submitText)    submitText.hidden    =  isLoading;
    if (submitLoading) submitLoading.hidden = !isLoading;
  }

  function showMessage(type, html) {
    messageBox.removeAttribute('hidden');
    messageBox.innerHTML = `<div class="cform__message-${type}">${html}</div>`;
  }
}


/* ================================================================
   4. REAL-TIME FIELD VALIDATION
   Valida campos en blur y muestra errores inline.
   Limpia errores mientras el usuario escribe.
================================================================ */
function initFieldValidation() {
  const nameInput    = document.getElementById('name');
  const emailInput   = document.getElementById('email');
  const messageInput = document.getElementById('message');

  nameInput?.addEventListener('blur',    () => validateName(nameInput));
  emailInput?.addEventListener('blur',   () => validateEmail(emailInput));
  messageInput?.addEventListener('blur', () => validateMessage(messageInput));

  [nameInput, emailInput, messageInput].forEach((input) => {
    input?.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      if (input.value.trim()) clearError(input.id + '-error');
    });
  });
}

function validateAllFields() {
  const nameInput    = document.getElementById('name');
  const emailInput   = document.getElementById('email');
  const messageInput = document.getElementById('message');

  let isValid = true;
  if (!validateName(nameInput))       isValid = false;
  if (!validateEmail(emailInput))     isValid = false;
  if (!validateMessage(messageInput)) isValid = false;

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
  if (errorEl) { errorEl.textContent = message; errorEl.removeAttribute('hidden'); }
}

function setFieldValid(input, errorId) {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  input.setAttribute('aria-invalid', 'false');
  clearError(errorId);
}

function clearError(errorId) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) { errorEl.textContent = ''; errorEl.setAttribute('hidden', ''); }
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
   5. PHONE NUMBER AUTO-FORMATTING
   Formatea números de teléfono US como (XXX) XXX-XXXX al escribir.
================================================================ */
function initPhoneFormatter() {
  const phoneInput = document.getElementById('phone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (e) => {
    const raw = e.target.value.replace(/\D/g, '');
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

  phoneInput.addEventListener('keydown', (e) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End',
    ];
    if (allowedKeys.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  });
}


/* ================================================================
   6. SMS CONSENT CHECKBOX ANIMATION
   FIX 4: limpia inline transition después de la animación.
================================================================ */
function initConsentAnimation() {
  const checkbox = document.getElementById('smsConsentCheckbox');
  const custom   = document.querySelector('.cform__consent-custom');
  if (!checkbox || !custom) return;
  if (prefersReducedMotion()) return;

  checkbox.addEventListener('change', () => {
    custom.style.transition = 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease';
    custom.style.transform  = 'scale(1.25)';

    setTimeout(() => {
      custom.style.transform = 'scale(1)';

      setTimeout(() => {
        custom.style.transition = '';
        custom.style.transform  = '';
      }, 200);
    }, 200);
  });
}


/* ================================================================
   7. FLOATING BUTTONS — Entrance Animation
================================================================ */
function initFloatingButtons() {
  const buttons = document.querySelectorAll('.float-btn');
  if (!buttons.length) return;
  if (prefersReducedMotion()) return;

  // Guard — si el contenedor ya tiene animación CSS activa, no duplicar
  const container = document.querySelector('.floating-buttons');
  if (container) {
    const computedAnim = getComputedStyle(container).animationName;
    if (computedAnim && computedAnim !== 'none') return;
  }

  buttons.forEach((btn, i) => {
    btn.classList.add('float-btn--hidden');
    btn.style.transitionDelay = `${1.2 + i * 0.15}s`;
  });

  // Doble rAF — garantiza que el estado inicial se pinte antes de la transición
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      buttons.forEach((btn) => btn.classList.remove('float-btn--hidden'));

      const maxDelay = (1.2 + (buttons.length - 1) * 0.15) * 1000 + 550;
      setTimeout(() => {
        buttons.forEach((btn) => { btn.style.transitionDelay = ''; });
      }, maxDelay);
    });
  });
}


/* ================================================================
   8. INFO PANEL ITEMS — Staggered Entrance
================================================================ */
function initInfoPanelEntrance() {
  const items = document.querySelectorAll('.cinfo-item');
  if (!items.length) return;
  if (prefersReducedMotion()) return;

  const card = document.querySelector('.cinfo-card');
  if (!card) return;

  items.forEach((item, i) => {
    item.classList.add('cinfo-item--hidden');
    item.style.transitionDelay = `${i * 0.07}s`;
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;

      items.forEach((item) => item.classList.remove('cinfo-item--hidden'));

      const maxDelay = (items.length - 1) * 70 + 450 + 50;
      setTimeout(() => {
        items.forEach((item) => { item.style.transitionDelay = ''; });
      }, maxDelay);

      observer.disconnect();
    },
    { threshold: 0.20 }
  );

  observer.observe(card);
}