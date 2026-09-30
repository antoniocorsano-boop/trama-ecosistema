(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.TRAMAContextHelp = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function initContextHelp(doc) {
    const documentRef = doc || document;
    const popover = documentRef.getElementById('helpPopover');
    const title = documentRef.getElementById('helpTitle');
    const text = documentRef.getElementById('helpText');
    if (!popover || !title || !text) {
      throw new Error('TRAMA_CONTEXT_HELP_SURFACE_MISSING');
    }

    let activeTrigger = null;
    let openedByPointer = false;

    const supportsNativePopover =
      typeof popover.showPopover === 'function' &&
      typeof popover.hidePopover === 'function';

    function nativeOpen() {
      return supportsNativePopover && popover.matches(':popover-open');
    }

    function showSurface() {
      popover.setAttribute('aria-hidden', 'false');
      popover.dataset.state = 'open';
      if (supportsNativePopover) {
        if (!nativeOpen()) popover.showPopover();
      } else {
        popover.classList.add('open');
      }
    }

    function hideSurface() {
      if (supportsNativePopover) {
        if (nativeOpen()) popover.hidePopover();
      } else {
        popover.classList.remove('open');
      }
      popover.setAttribute('aria-hidden', 'true');
      popover.dataset.state = 'closed';
    }

    function clearActiveTrigger() {
      if (!activeTrigger) return;
      if (activeTrigger.getAttribute('aria-describedby') === popover.id) {
        activeTrigger.removeAttribute('aria-describedby');
      }
      activeTrigger = null;
    }

    function open(trigger, options) {
      if (!trigger || !trigger.dataset || !trigger.dataset.help) return false;
      if (activeTrigger && activeTrigger !== trigger) clearActiveTrigger();
      activeTrigger = trigger;
      openedByPointer = Boolean(options && options.pointer);
      title.textContent = trigger.dataset.helpTitle || 'Informazioni';
      text.textContent = trigger.dataset.help;
      trigger.setAttribute('aria-describedby', popover.id);
      showSurface();
      return true;
    }

    function close(options) {
      const restoreFocus = Boolean(options && options.restoreFocus);
      const trigger = activeTrigger;
      hideSurface();
      clearActiveTrigger();
      openedByPointer = false;
      if (restoreFocus && trigger && typeof trigger.focus === 'function') {
        trigger.focus();
      }
    }

    function closestTrigger(target) {
      return target && typeof target.closest === 'function'
        ? target.closest('.helpable')
        : null;
    }

    function onPointerOver(event) {
      const trigger = closestTrigger(event.target);
      if (!trigger) return;
      const from = event.relatedTarget;
      if (from && trigger.contains(from)) return;
      open(trigger, { pointer: true });
    }

    function onPointerOut(event) {
      const trigger = closestTrigger(event.target);
      if (!trigger || trigger !== activeTrigger || !openedByPointer) return;
      const to = event.relatedTarget;
      if (to && trigger.contains(to)) return;
      if (documentRef.activeElement === trigger) {
        openedByPointer = false;
        return;
      }
      close();
    }

    function onFocusIn(event) {
      const trigger = closestTrigger(event.target);
      if (trigger) open(trigger, { pointer: false });
    }

    function onFocusOut(event) {
      const trigger = closestTrigger(event.target);
      if (!trigger || trigger !== activeTrigger) return;
      queueMicrotask(function () {
        if (documentRef.activeElement !== trigger) close();
      });
    }

    function onClick(event) {
      const trigger = closestTrigger(event.target);
      if (trigger) open(trigger, { pointer: false });
    }

    function onKeyDown(event) {
      if (event.key === 'Escape' && activeTrigger) {
        event.preventDefault();
        close({ restoreFocus: true });
      }
    }

    function onPointerDown(event) {
      if (!activeTrigger) return;
      const trigger = closestTrigger(event.target);
      if (trigger === activeTrigger) return;
      close();
    }

    documentRef.addEventListener('mouseover', onPointerOver);
    documentRef.addEventListener('mouseout', onPointerOut);
    documentRef.addEventListener('focusin', onFocusIn);
    documentRef.addEventListener('focusout', onFocusOut);
    documentRef.addEventListener('click', onClick);
    documentRef.addEventListener('keydown', onKeyDown);
    documentRef.addEventListener('pointerdown', onPointerDown);

    popover.setAttribute('aria-hidden', 'true');
    popover.dataset.state = 'closed';

    return {
      open,
      close,
      getActiveTrigger: function () { return activeTrigger; },
      supportsNativePopover,
      destroy: function () {
        documentRef.removeEventListener('mouseover', onPointerOver);
        documentRef.removeEventListener('mouseout', onPointerOut);
        documentRef.removeEventListener('focusin', onFocusIn);
        documentRef.removeEventListener('focusout', onFocusOut);
        documentRef.removeEventListener('click', onClick);
        documentRef.removeEventListener('keydown', onKeyDown);
        documentRef.removeEventListener('pointerdown', onPointerDown);
        close();
      },
    };
  }

  return { initContextHelp };
});
