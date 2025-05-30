class Modal {
  constructor(modalElement, options = {}) {
    this.modal = modalElement;
    this.options = {
      onOpen: () => {},
      onClose: () => {},
      ...options
    };
    this.cleanup = null;
    this.initialize();
  }

  initialize() {
    if (!this.modal) return;

    // Close button handling
    const closeBtn = this.modal.querySelector('[data-modal-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Click outside to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.style.display === 'flex') {
        this.close();
      }
    });

    // Focus trap
    this.modal.addEventListener('transitionend', () => {
      if (this.modal.style.display === 'flex') {
        this.cleanup = this.setupFocusTrap();
        this.focusFirstElement();
      } else if (this.cleanup) {
        this.cleanup();
      }
    });
  }

  open() {
    if (!this.modal) return;
    this.modal.style.display = 'flex';
    this.options.onOpen();
    this.focusFirstElement();
  }

  close() {
    if (!this.modal) return;
    this.modal.style.display = 'none';
    this.options.onClose();
  }

  setupFocusTrap() {
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableEls = this.modal.querySelectorAll(focusableSelectors);
    if (!focusableEls.length) return null;

    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    const handleTrap = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    this.modal.addEventListener('keydown', handleTrap);
    return () => this.modal.removeEventListener('keydown', handleTrap);
  }

  focusFirstElement() {
    setTimeout(() => {
      const el = this.modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (el) el.focus();
    }, 0);
  }
}

export default Modal; 