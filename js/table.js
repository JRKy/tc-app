import CONFIG from './config.js';
import storage from './storage.js';
import timezoneUtils from './timezone.js';

class Table {
  constructor() {
    this.table = document.getElementById('timezone-table');
    this.emptyState = document.getElementById('empty-state');
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const inputs = ['input-date', 'input-time', 'event-timezone', 'input-duration'];
    inputs.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', () => this.generate());
      }
    });
  }

  generate() {
    const dateInput = document.getElementById('input-date');
    const timeInput = document.getElementById('input-time');
    const eventTimezoneInput = document.getElementById('event-timezone');
    const durationInput = document.getElementById('input-duration');
    
    // Show empty state if any required field is missing
    if (!dateInput?.value || !timeInput?.value || !eventTimezoneInput?.value || !durationInput?.value) {
      this.showEmptyState();
      return;
    }

    const dateStr = dateInput.value;
    const timeStr = timeInput.value;
    const eventTimezone = eventTimezoneInput.value.trim();
    const durationHours = parseInt(durationInput.value || CONFIG.defaultDuration);

    // Validate event timezone
    if (!timezoneUtils.isValidTimezone(eventTimezone)) {
      this.showEmptyState();
      return;
    }

    // Create event time in UTC
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    let eventTimeUTC;
    if (eventTimezone === 'UTC') {
      eventTimeUTC = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    } else {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
      eventTimeUTC = new Date(new Date(dateStr).toLocaleString('en-US', { timeZone: eventTimezone }));
    }

    this.showTable();
    this.generateHeader(eventTimezone);
    this.generateRows(eventTimeUTC, durationHours, eventTimezone);
  }

  validateInputs(dateInput, timeInput, eventTimezoneInput, durationInput) {
    if (!dateInput || !timeInput || !eventTimezoneInput || !durationInput || !this.table || !this.emptyState) {
      return false;
    }

    return true;
  }

  showEmptyState() {
    this.table.style.display = 'none';
    this.emptyState.style.display = 'block';
  }

  showTable() {
    this.table.style.display = 'table';
    this.emptyState.style.display = 'none';
  }

  generateHeader(eventTimezone) {
    const tableHead = this.table.querySelector('thead');
    if (!tableHead) return;

    const dateInput = document.getElementById('input-date');
    const [year, month, day] = dateInput.value.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day);

    const headRow = document.createElement('tr');
    const eventDisplayName = timezoneUtils.getTimezoneDisplayName(eventTimezone);
    const isEventDST = timezoneUtils.isDST(eventTimezone, eventDate);
    const eventOffset = timezoneUtils.getUTCOffset(eventTimezone, eventDate);
    
    // Event column header with icon
    let headerContent = `<th scope="col"><span class="header-icon material-icons">public</span><br>📍 ${eventDisplayName}${isEventDST ? ' *' : ''}<br><small>${eventOffset}</small></th>`;
    
    // Viewer columns with icon
    storage.getZones().forEach(zone => {
      const displayName = timezoneUtils.getTimezoneDisplayName(zone);
      const isDST = timezoneUtils.isDST(zone, eventDate);
      const offset = timezoneUtils.getUTCOffset(zone, eventDate);
      headerContent += `<th scope="col"><span class="header-icon material-icons">group</span><br>👥 ${displayName}${isDST ? ' *' : ''}<br><small>${offset}</small></th>`;
    });
    
    headRow.innerHTML = headerContent;
    tableHead.innerHTML = '';
    tableHead.appendChild(headRow);
  }

  generateRows(eventTimeUTC, durationHours, eventTimezone) {
    const tableBody = this.table.querySelector('tbody');
    if (!tableBody) return;

    const totalSlots = durationHours * 2;
    tableBody.innerHTML = '';

    for (let i = 0; i < totalSlots; i++) {
      const utcTime = new Date(eventTimeUTC.getTime() + i * 30 * 60 * 1000);
      const row = document.createElement('tr');
      let cells = [];

      // Event cell
      const eventCell = this.generateEventCell(utcTime, eventTimezone);
      cells.push(eventCell);

      // Viewer cells
      storage.getZones().forEach(zone => {
        const viewerCell = this.generateViewerCell(utcTime, zone);
        cells.push(viewerCell);
      });

      // Check for smart slot
      if (this.isSmartSlot(cells)) {
        row.classList.add('smart-slot');
      }

      row.innerHTML = cells.join('');
      tableBody.appendChild(row);
    }
  }

  generateEventCell(utcTime, eventTimezone) {
    const eventLocalTime = timezoneUtils.utcToZonedTime(utcTime, eventTimezone);
    const hour = eventLocalTime.getHours();
    const minute = eventLocalTime.getMinutes();
    const timeClass = timezoneUtils.getTimeClass(hour, minute);
    
    const displayTime = timezoneUtils.formatTime(utcTime, eventTimezone);
    const displayDate = timezoneUtils.formatDate(utcTime, eventTimezone);
    const isDST = timezoneUtils.isDST(eventTimezone, utcTime);
    
    return `<td class="time-cell ${timeClass}" style="font-weight: bold; border-left: 4px solid #667eea;">${displayTime}${isDST ? ' *' : ''}<br><small>${displayDate}</small></td>`;
  }

  generateViewerCell(utcTime, zone) {
    const localTime = timezoneUtils.utcToZonedTime(utcTime, zone);
    const hour = localTime.getHours();
    const minute = localTime.getMinutes();
    const timeClass = timezoneUtils.getTimeClass(hour, minute);
    const displayTime = timezoneUtils.formatTime(utcTime, zone);
    const displayDate = timezoneUtils.formatDate(utcTime, zone);
    const isDST = timezoneUtils.isDST(zone, utcTime);
    
    return `<td class="time-cell ${timeClass}">${displayTime}${isDST ? ' *' : ''}<br><small>${displayDate}</small></td>`;
  }

  isSmartSlot(cells) {
    if (storage.getZones().length === 0) return false;
    
    return cells.every((cell, index) => {
      const timeStr = cell.match(/(\d{2}):(\d{2})/)[0];
      const [hours, minutes] = timeStr.split(':').map(Number);
      return timezoneUtils.isWorkHour(hours, minutes);
    });
  }
}

export default new Table(); 