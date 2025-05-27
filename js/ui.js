import CONFIG from './config.js';
import storage from './storage.js';
import timezoneUtils from './timezone.js';
import table from './table.js';

class UI {
  constructor() {
    this.errorContainer = document.getElementById('error-container');
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.toggleDarkMode.bind(this));
    }

    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', this.exportPDF.bind(this));
    }

    // Share button
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', this.shareSchedule.bind(this));
    }

    // Add zone button
    const addZoneBtn = document.getElementById('add-zone-btn');
    if (addZoneBtn) {
      addZoneBtn.addEventListener('click', this.addZone.bind(this));
    }

    // Input fields
    this.initializeInputFields();

    // Copy Table as Plain Text
    const copyTableBtn = document.getElementById('copy-table-btn');
    const copyModal = document.getElementById('copy-modal');
    const copyModalText = document.getElementById('copy-modal-text');
    const copyModalClose = document.getElementById('copy-modal-close');
    const copyModalCopy = document.getElementById('copy-modal-copy');
    if (copyTableBtn) {
      copyTableBtn.addEventListener('click', () => {
        const table = document.getElementById('timezone-table');
        if (!table || table.style.display === 'none') return;
        let text = '';
        // Headers
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());
        text += headers.join('\t') + '\n';
        // Rows
        Array.from(table.querySelectorAll('tbody tr')).forEach(row => {
          const cells = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n/g, ' '));
          text += cells.join('\t') + '\n';
        });
        if (copyModal && copyModalText) {
          copyModalText.value = text;
          copyModal.style.display = 'flex';
          copyModalText.focus();
        }
      });
    }
    if (copyModalClose && copyModal) {
      copyModalClose.addEventListener('click', () => {
        copyModal.style.display = 'none';
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

    // Add to Calendar Buttons
    const googleBtn = document.getElementById('add-google-calendar');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => {
        const event = this.getEventDetails();
        if (!event) return this.showError('Please fill out all event details.');
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.startStr}/${event.endStr}&details=${encodeURIComponent(event.description)}`;
        window.open(url, '_blank');
      });
    }

    const outlookBtn = document.getElementById('add-outlook-calendar');
    if (outlookBtn) {
      outlookBtn.addEventListener('click', () => {
        const event = this.getEventDetails();
        if (!event) return this.showError('Please fill out all event details.');
        const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(event.description)}&startdt=${event.start.toISOString()}&enddt=${event.end.toISOString()}`;
        window.open(url, '_blank');
      });
    }

    const appleBtn = document.getElementById('add-apple-calendar');
    if (appleBtn) {
      appleBtn.addEventListener('click', () => {
        const event = this.getEventDetails();
        if (!event) return this.showError('Please fill out all event details.');
        const plainTable = this.getPlainTextTable();
        const description = 'Scheduled via TimeSync';
        const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${event.title}\nDESCRIPTION:${description.replace(/\n/g, '\\n')}\\n\\n${plainTable.replace(/\n/g, '\\n')}\nDTSTART:${event.startStr}\nDTEND:${event.endStr}\nEND:VEVENT\nEND:VCALENDAR`;
        const blob = new Blob([ics], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'event.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    // Keyboard shortcut help modal
    const shortcutHelpModal = document.getElementById('shortcut-help-modal');
    const shortcutHelpClose = document.getElementById('shortcut-help-close');
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === '/') {
        e.preventDefault();
        if (shortcutHelpModal) shortcutHelpModal.style.display = 'flex';
      }
      if (e.key === 'Escape' && shortcutHelpModal && shortcutHelpModal.style.display === 'flex') {
        shortcutHelpModal.style.display = 'none';
      }
    });
    if (shortcutHelpClose && shortcutHelpModal) {
      shortcutHelpClose.addEventListener('click', () => {
        shortcutHelpModal.style.display = 'none';
      });
    }

    // Help icon button for keyboard shortcuts
    const shortcutHelpBtn = document.getElementById('shortcut-help-btn');
    if (shortcutHelpBtn && shortcutHelpModal) {
      shortcutHelpBtn.addEventListener('click', () => {
        shortcutHelpModal.style.display = 'flex';
        setTimeout(() => {
          const el = shortcutHelpModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (el) el.focus();
        }, 0);
      });
    }

    // Focus trap for modals
    function trapFocus(modal) {
      const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusableEls = modal.querySelectorAll(focusableSelectors);
      if (!focusableEls.length) return;
      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];
      function handleTrap(e) {
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
      }
      modal.addEventListener('keydown', handleTrap);
      // Remove event on close
      function cleanup() { modal.removeEventListener('keydown', handleTrap); }
      return cleanup;
    }
    let copyModalCleanup = null;
    let shortcutModalCleanup = null;
    if (copyModal && copyModalClose) {
      copyModal.addEventListener('transitionend', () => {
        if (copyModal.style.display === 'flex') {
          copyModalCleanup = trapFocus(copyModal);
          // Focus first focusable element
          setTimeout(() => {
            const el = copyModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (el) el.focus();
          }, 0);
        } else if (copyModalCleanup) {
          copyModalCleanup();
        }
      });
    }
    if (shortcutHelpModal && shortcutHelpClose) {
      shortcutHelpModal.addEventListener('transitionend', () => {
        if (shortcutHelpModal.style.display === 'flex') {
          shortcutModalCleanup = trapFocus(shortcutHelpModal);
          setTimeout(() => {
            const el = shortcutHelpModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (el) el.focus();
          }, 0);
        } else if (shortcutModalCleanup) {
          shortcutModalCleanup();
        }
      });
    }
    // Also trigger focus trap on open (for non-animated modals)
    if (copyTableBtn) {
      copyTableBtn.addEventListener('click', () => {
        if (copyModal && copyModal.style.display === 'flex') {
          copyModalCleanup = trapFocus(copyModal);
          setTimeout(() => {
            const el = copyModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (el) el.focus();
          }, 0);
        }
      });
    }
    if (shortcutHelpModal) {
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === '/') {
          setTimeout(() => {
            if (shortcutHelpModal.style.display === 'flex') {
              shortcutModalCleanup = trapFocus(shortcutHelpModal);
              const el = shortcutHelpModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
              if (el) el.focus();
            }
          }, 0);
        }
      });
    }
  }

  initializeInputFields() {
    const eventTimezoneInput = document.getElementById('event-timezone');
    const zoneInput = document.getElementById('zone-input');

    if (eventTimezoneInput) {
      eventTimezoneInput.addEventListener('input', this.debounce((e) => {
        const suggestions = timezoneUtils.getTimezoneSuggestions(e.target.value);
        this.updateTimezoneSuggestions('event-tz-list', suggestions);
      }, CONFIG.debounceDelay));

      eventTimezoneInput.addEventListener('change', () => {
        if (eventTimezoneInput.value) {
          table.generate();
        }
      });
    }

    if (zoneInput) {
      zoneInput.addEventListener('input', this.debounce((e) => {
        const suggestions = timezoneUtils.getTimezoneSuggestions(e.target.value);
        this.updateTimezoneSuggestions('tz-list', suggestions);
      }, CONFIG.debounceDelay));

      zoneInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addZone();
        }
      });
    }

    // Add change listeners for date, time, and duration inputs
    const inputs = ['input-date', 'input-time', 'input-duration'];
    inputs.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', () => table.generate());
      }
    });
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
    
    let validZone = null;
    for (const testZone of zonesToTry) {
      if (timezoneUtils.isValidTimezone(testZone)) {
        validZone = testZone;
        break;
      }
    }
    
    if (validZone) {
      const zones = storage.getZones();
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

    // Add click handlers for remove buttons
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

  updateTimezoneSuggestions(listId, suggestions) {
    const datalist = document.getElementById(listId);
    if (!datalist) return;

    datalist.innerHTML = suggestions
      .map(tz => `<option value="${tz}"></option>`)
      .join('');
  }

  toggleDarkMode() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    storage.setTheme(isDark ? 'light' : 'dark');
  }

  exportPDF() {
    this.setLoading('export-btn', true);
    try {
      window.print();
    } catch (error) {
      this.showError('Failed to export PDF. Please try again.');
    } finally {
      this.setLoading('export-btn', false);
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

  showSuccess(message) {
    if (!this.errorContainer) return;
    this.errorContainer.textContent = message;
    this.errorContainer.classList.add('show', 'success');
    setTimeout(() => {
      this.errorContainer.classList.remove('show', 'success');
    }, CONFIG.errorMessageDuration);
  }
}

export default new UI(); 