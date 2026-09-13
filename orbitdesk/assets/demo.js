/* Shared presentation helpers. No survey SDK, requests, or response collection. */
(() => {
  'use strict';

  const site = document.body.dataset.site || 'demo';
  const prefix = `sensefolks-demo:${site}:`;
  const memory = new Map();
  const state = {
    get(key, fallback = null) {
      try {
        const value = sessionStorage.getItem(prefix + key);
        return value === null ? (memory.get(key) ?? fallback) : JSON.parse(value);
      } catch {
        return memory.get(key) ?? fallback;
      }
    },
    set(key, value) {
      memory.set(key, value);
      try { sessionStorage.setItem(prefix + key, JSON.stringify(value)); } catch { /* Private browsing fallback. */ }
    },
  };

  function targetFor(id) {
    return typeof id === 'string' ? document.getElementById(id) : id;
  }

  function isTyping() {
    return document.activeElement?.matches('input, textarea, select, [contenteditable="true"]');
  }

  function show(id, { automatic = false, scroll = false } = {}) {
    const target = targetFor(id);
    if (!target) return false;
    const dialog = target instanceof HTMLDialogElement;
    const visible = dialog ? target.open : !target.hidden;
    if (!visible) {
      if (automatic && (document.hidden || isTyping() || document.querySelector('dialog[open]') || state.get('automatic-prompt-shown', false))) return false;
      target.hidden = false;
      if (dialog) target.showModal();
      target.removeAttribute('aria-hidden');
      if (automatic) state.set('automatic-prompt-shown', true);
      target.dispatchEvent(new CustomEvent('demo:shown', { bubbles: true }));
    }
    if (scroll && !dialog) target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
    return true;
  }

  function hide(id) {
    const target = targetFor(id);
    if (!target) return;
    if (target instanceof HTMLDialogElement) target.close();
    else target.hidden = true;
  }

  let toastTimer;
  function toast(message) {
    let region = document.querySelector('.demo-toast');
    if (!region) {
      region = document.createElement('div');
      region.className = 'demo-toast';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      document.body.append(region);
    }
    clearTimeout(toastTimer);
    region.textContent = message;
    region.hidden = false;
    toastTimer = setTimeout(() => { region.hidden = true; }, 4200);
  }

  function initializePlaceholders(root = document) {
    const elements = root.matches?.('.survey-placeholder[data-survey]') ? [root] : root.querySelectorAll('.survey-placeholder[data-survey]');
    elements.forEach((element) => {
      if (element.dataset.initialized) return;
      element.dataset.initialized = 'true';
      const label = document.createElement('p');
      label.className = 'survey-placeholder__label';
      label.textContent = `Sensefolks / ${element.dataset.survey}`;
      const title = document.createElement('h3');
      title.className = 'survey-placeholder__title';
      title.textContent = element.dataset.question || `${element.dataset.survey} survey`;
      const body = document.createElement('p');
      body.className = 'survey-placeholder__body';
      body.textContent = `A ${element.dataset.survey} survey will be embedded here.`;
      element.replaceChildren(label, title, body);
      if (element.dataset.trigger) {
        const trigger = document.createElement('p');
        trigger.className = 'survey-placeholder__trigger';
        trigger.textContent = `Appears: ${element.dataset.trigger}`;
        element.append(trigger);
      }
      const note = document.createElement('p');
      note.className = 'survey-placeholder__note';
      note.textContent = 'Placeholder only · No responses collected';
      element.append(note);
      const variants = document.createElement('a');
      variants.className = 'survey-placeholder__variants';
      variants.href = `/survey-examples/?type=${encodeURIComponent(element.dataset.survey)}`;
      variants.textContent = `Explore ${element.dataset.survey} combinations →`;
      element.append(variants);
    });
  }

  window.Demo = Object.freeze({ show, hide, toast, state, isTyping, initializePlaceholders });
  initializePlaceholders();
  document.addEventListener('click', (event) => {
    const open = event.target.closest('[data-open-dialog]');
    if (open) show(open.dataset.openDialog);
    const close = event.target.closest('[data-close-dialog]');
    if (close) hide(close.dataset.closeDialog || close.closest('dialog'));
    const reset = event.target.closest('[data-demo-reset]');
    if (reset) {
      try {
        Object.keys(sessionStorage).filter((key) => key.startsWith(prefix)).forEach((key) => sessionStorage.removeItem(key));
      } catch { /* Reset remains usable without storage. */ }
      memory.clear();
      document.dispatchEvent(new CustomEvent('demo:reset'));
      location.reload();
    }
  });
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
})();
