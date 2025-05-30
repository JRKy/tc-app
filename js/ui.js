import CONFIG from './config.js';
import storage from './storage.js';
import timezoneUtils from './timezone.js';
import table from './table.js';
import Modal from './modal.js';

class UI {
  constructor() {
    this.errorContainer = document.getElementById('error-container');
    this.isPrinting = false;
    this.printTimeout = null;
    this.hasSelectedTimezone = false;
    this.initializeModals();
    this.initializeEventListeners();
  }

  initializeModals() {
    const copyModal = document.getElementById('copy-modal');
    const shortcutHelpModal = document.getElementById('shortcut-help-modal');

    if (copyModal) {
      this.copyModal = new Modal(copyModal, {
        onOpen: () => {
          const textArea = copyModal.querySelector('textarea');
          if (textArea) textArea.focus();
        }
      });
    }

    if (shortcutHelpModal) {
      this.shortcutHelpModal = new Modal(shortcutHelpModal);
    }
  }

  initializeEventListeners() {
    this.initializeKeyboardShortcuts();
    this.initializeThemeToggle();
    this.initializeExportButton();
    this.initializeShareButton();
    this.initializeAddZoneButton();
    this.initializeInputFields();
    this.initializeCopyTable();
    this.initializeShortcutHelp();
  }

  initializeKeyboardShortcuts() {
    document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
  }

  initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.toggleDarkMode.bind(this));
    }
  }

  initializeExportButton() {
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', this.exportPDF.bind(this));
    }
  }

  initializeShareButton() {
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', this.shareSchedule.bind(this));
    }
  }

  initializeAddZoneButton() {
    const addZoneBtn = document.getElementById('add-zone-btn');
    if (addZoneBtn) {
      addZoneBtn.addEventListener('click', this.addZone.bind(this));
    }
  }

  initializeInputFields() {
    this.initializeTimezoneInputs();
    this.initializeDateTimeInputs();
  }

  initializeTimezoneInputs() {
    const eventTimezoneInput = document.getElementById('event-timezone');
    const zoneInput = document.getElementById('zone-input');

    if (eventTimezoneInput) {
      this.setupTimezoneInput(eventTimezoneInput, 'event-tz-list', true);
    }

    if (zoneInput) {
      this.setupTimezoneInput(zoneInput, 'tz-list', false);
    }
  }

  setupTimezoneInput(input, listId, isEventTimezone) {
    input.addEventListener('input', this.debounce((e) => {
      if (!isEventTimezone || !this.hasSelectedTimezone) {
        const suggestions = timezoneUtils.getTimezoneSuggestions(e.target.value);
        this.updateTimezoneSuggestions(listId, suggestions);
      }
    }, CONFIG.debounceDelay));

    input.addEventListener('change', () => {
      if (input.value) {
        if (isEventTimezone) {
          this.hasSelectedTimezone = true;
          table.generate();
        }
        this.clearSuggestions(listId);
      }
    });

    input.addEventListener('blur', () => {
      this.clearSuggestions(listId);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (isEventTimezone) {
          this.hasSelectedTimezone = false;
        }
        this.clearSuggestions(listId);
      }
    });

    if (!isEventTimezone) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addZone();
          this.clearSuggestions(listId);
        }
      });
    }
  }

  initializeDateTimeInputs() {
    const inputs = ['input-date', 'input-time', 'input-duration'];
    inputs.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', () => table.generate());
      }
    });
  }

  initializeCopyTable() {
    const copyTableBtn = document.getElementById('copy-table-btn');
    const copyModalText = document.getElementById('copy-modal-text');
    const copyModalCopy = document.getElementById('copy-modal-copy');

    if (copyTableBtn && this.copyModal) {
      copyTableBtn.addEventListener('click', () => {
        const table = document.getElementById('timezone-table');
        if (!table || table.style.display === 'none') return;
        
        const optimalOnlyToggle = document.getElementById('optimal-only-toggle');
        const text = optimalOnlyToggle && optimalOnlyToggle.checked
          ? this.getOptimalPlainTextTable()
          : this.getPlainTextTable();

        if (copyModalText) {
          copyModalText.value = text;
          this.copyModal.open();
        }
      });
    }

    if (copyModalCopy && copyModalText) {
      copyModalCopy.addEventListener('click', () => {
        copyModalText.select();
        document.execCommand('copy');
        copyModalCopy.innerHTML = '<span class="material-icons">check</span> Copied!';
        setTimeout(() => {
          copyModalCopy.innerHTML = '<span class="material-icons">content_copy</span> Copy';
        }, 1200);
      });
    }
  }

  initializeShortcutHelp() {
    const shortcutHelpBtn = document.getElementById('shortcut-help-btn');

    // Keyboard shortcut to open help
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === '/') {
        e.preventDefault();
        if (this.shortcutHelpModal) this.shortcutHelpModal.open();
      }
    });

    // Help button click
    if (shortcutHelpBtn && this.shortcutHelpModal) {
      shortcutHelpBtn.addEventListener('click', () => {
        this.shortcutHelpModal.open();
      });
    }
  }

  clearSuggestions(listId) {
    const datalist = document.getElementById(listId);
    if (datalist) {
      datalist.innerHTML = '';
    }
  }

  updateTimezoneSuggestions(listId, suggestions) {
    const datalist = document.getElementById(listId);
    if (!datalist) return;

    datalist.innerHTML = '';
    suggestions.forEach(tz => {
      const option = document.createElement('option');
      option.value = tz;
      datalist.appendChild(option);
    });
  }

  handleKeyboardShortcuts(e) {
    if (!(e.ctrlKey || e.metaKey)) return;

    const shortcuts = CONFIG.shortcuts;
    switch (e.key.toLowerCase()) {
      case shortcuts.export.key:
        e.preventDefault();
        this.exportPDF();
        break;
      case shortcuts.share.key:
        e.preventDefault();
        this.shareSchedule();
        break;
      case shortcuts.darkMode.key:
        e.preventDefault();
        this.toggleDarkMode();
        break;
      case shortcuts.save.key:
        e.preventDefault();
        this.saveSchedule();
        break;
    }
  }

  showError(message) {
    if (!this.errorContainer) return;
    
    this.errorContainer.textContent = message;
    this.errorContainer.classList.add('show');
    
    setTimeout(() => {
      this.errorContainer.classList.remove('show');
    }, CONFIG.errorMessageDuration);
  }

  setLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    button.classList.toggle('loading', isLoading);
    button.disabled = isLoading;
  }

  toggleDarkMode() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    storage.setTheme(isDark ? 'light' : 'dark');
  }

  exportPDF() {
    if (this.isPrinting) return;
    
    if (this.printTimeout) {
      clearTimeout(this.printTimeout);
      this.printTimeout = null;
    }

    this.isPrinting = true;
    this.setLoading('export-btn', true);
    
    const optimalOnlyToggle = document.getElementById('optimal-only-toggle');
    const table = document.getElementById('timezone-table');
    
    if (!table) {
      this.setLoading('export-btn', false);
      this.isPrinting = false;
      return;
    }

    const allRows = Array.from(table.querySelectorAll('tbody tr'));
    const originalDisplayStates = allRows.map(row => row.style.display);

    try {
      if (optimalOnlyToggle && optimalOnlyToggle.checked) {
        allRows.forEach(row => {
          if (!row.classList.contains('smart-slot')) {
            row.style.display = 'none';
          }
        });
      }

      const afterPrintHandler = () => {
        allRows.forEach((row, index) => {
          row.style.display = originalDisplayStates[index];
        });
        this.setLoading('export-btn', false);
        
        this.printTimeout = setTimeout(() => {
          this.isPrinting = false;
          this.printTimeout = null;
        }, 500);
      };

      window.addEventListener('afterprint', afterPrintHandler, { once: true });

      setTimeout(() => {
        window.print();
      }, 100);

    } catch (error) {
      this.showError('Failed to export PDF. Please try again.');
      this.setLoading('export-btn', false);
      this.isPrinting = false;
    }
  }

  shareSchedule() {
    this.setLoading('share-btn', true);
    try {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        this.showError('Schedule link copied to clipboard!');
      }).catch(() => {
        this.showError('Could not copy to clipboard. Please try again.');
      });
    } finally {
      this.setLoading('share-btn', false);
    }
  }

  saveSchedule() {
    const schedule = {
      date: document.getElementById('input-date').value,
      time: document.getElementById('input-time').value,
      timezone: document.getElementById('event-timezone').value,
      duration: document.getElementById('input-duration').value,
      zones: storage.getZones()
    };

    storage.addSchedule(schedule);
    this.showError('Schedule saved successfully!');
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  getEventDetails() {
    const date = document.getElementById('input-date')?.value;
    const time = document.getElementById('input-time')?.value;
    const duration = parseInt(document.getElementById('input-duration')?.value || CONFIG.defaultDuration);
    const eventTimezone = document.getElementById('event-timezone')?.value;
    const title = 'TimeSync Event';
    const description = 'Scheduled via TimeSync\n\n' + document.getElementById('timezone-table').outerHTML;
    if (!date || !time || !eventTimezone) return null;
    const start = new Date(`${date}T${time}:00`);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
    function formatICSDate(d) {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
    return {
      title,
      description,
      start,
      end,
      startStr: formatICSDate(start),
      endStr: formatICSDate(end),
      timezone: eventTimezone
    };
  }

  getPlainTextTable() {
    const table = document.getElementById('timezone-table');
    if (!table || table.style.display === 'none') return '';
    let text = '';
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());
    text += headers.join('\t') + '\n';
    Array.from(table.querySelectorAll('tbody tr')).forEach(row => {
      const cells = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n/g, ' '));
      text += cells.join('\t') + '\n';
    });
    return text;
  }

  getOptimalPlainTextTable() {
    const table = document.getElementById('timezone-table');
    if (!table || table.style.display === 'none') return '';
    let text = '';
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());
    text += headers.join('\t') + '\n';
    Array.from(table.querySelectorAll('tbody tr.smart-slot')).forEach(row => {
      const cells = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n/g, ' '));
      text += cells.join('\t') + '\n';
    });
    return text;
  }

  showSuccess(message) {
    if (!this.errorContainer) return;
    this.errorContainer.textContent = message;
    this.errorContainer.classList.add('show', 'success');
    setTimeout(() => {
      this.errorContainer.classList.remove('show', 'success');
    }, CONFIG.errorMessageDuration);
  }

  addZone() {
    const input = document.getElementById('zone-input');
    if (!input) return;
    
    let zone = input.value.trim();
    
    if (!zone) {
      input.focus();
      return;
    }
    
    const zones = storage.getZones();
    if (zones.includes(zone)) {
      this.showError(`⚠️ ${zone} is already added`);
      input.value = "";
      input.focus();
      return;
    }
    
    const validZone = this.normalizeAndValidateTimezone(zone);
    
    if (validZone) {
      zones.push(validZone);
      storage.setZones(zones);
      input.value = "";
      input.focus();
      this.updateZoneDisplay();
      table.generate();
    } else {
      this.showError(`Invalid time zone: "${zone}". Try selecting from dropdown suggestions.`);
      input.focus();
      input.select();
    }
  }

  normalizeAndValidateTimezone(zone) {
    const zonesToTry = [
      zone,
      zone.replace(/\s+/g, '_'),
      zone.replace(/_/g, ' '),
      zone.split('/').map(part => 
        part.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join('_')
      ).join('/'),
      zone.toUpperCase() === 'EST' ? 'America/New_York' : zone,
      zone.toUpperCase() === 'PST' ? 'America/Los_Angeles' : zone,
      zone.toUpperCase() === 'MST' ? 'America/Denver' : zone,
      zone.toUpperCase() === 'CST' ? 'America/Chicago' : zone,
      zone.toUpperCase() === 'GMT' ? 'Europe/London' : zone,
      zone.toUpperCase() === 'UTC' ? 'UTC' : zone
    ];
    
    for (const testZone of zonesToTry) {
      if (timezoneUtils.isValidTimezone(testZone)) {
        return testZone;
      }
    }
    return null;
  }

  updateZoneDisplay() {
    const container = document.getElementById('selected-zones');
    const wrapper = document.getElementById('selected-zones-container');
    
    if (!container || !wrapper) return;
    
    const zones = storage.getZones();
    if (zones.length === 0) {
      wrapper.style.display = 'none';
      return;
    }
    
    wrapper.style.display = 'block';
    container.innerHTML = zones.map(zone => `
      <div class="zone-chip">
        <span>${timezoneUtils.getTimezoneDisplayName(zone)}</span>
        <button class="remove-btn btn btn-icon" data-zone="${zone}" aria-label="Remove ${zone}">
          <span class="material-icons">close</span>
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const zone = btn.dataset.zone;
        const zones = storage.getZones().filter(z => z !== zone);
        storage.setZones(zones);
        this.updateZoneDisplay();
        table.generate();
      });
    });
  }
}

export default new UI(); 