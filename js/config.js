// Configuration object for TimeSync
const CONFIG = {
  // Time ranges
  workHours: {
    start: 8,
    end: 17
  },
  sleepHours: {
    start: 22,
    end: 6
  },
  
  // Default values
  defaultDuration: 4,
  timezoneSuggestions: 15,
  
  // UI settings
  errorMessageDuration: 5000,
  debounceDelay: 300,
  
  // Storage keys
  storageKeys: {
    zones: 'timesync-zones',
    theme: 'timesync-theme',
    schedules: 'timesync-schedules'
  },
  
  // Common timezones for quick selection
  commonTimezones: [
    'UTC',
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Toronto', 'America/Vancouver', 'America/Mexico_City', 'America/Sao_Paulo',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome', 'Europe/Madrid',
    'Europe/Amsterdam', 'Europe/Stockholm', 'Europe/Warsaw', 'Europe/Prague',
    'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore', 'Asia/Seoul',
    'Asia/Mumbai', 'Asia/Dubai', 'Asia/Bangkok', 'Asia/Jakarta', 'Asia/Manila',
    'Australia/Sydney', 'Australia/Melbourne', 'Australia/Perth', 'Australia/Brisbane',
    'Pacific/Auckland', 'Pacific/Honolulu', 'Pacific/Fiji',
    'Africa/Cairo', 'Africa/Lagos', 'Africa/Johannesburg', 'Africa/Nairobi'
  ],
  
  // Keyboard shortcuts
  shortcuts: {
    export: { key: 'e', description: 'Export PDF' },
    share: { key: 's', description: 'Share schedule' },
    darkMode: { key: 'd', description: 'Toggle dark mode' },
    save: { key: 's', description: 'Save schedule' }
  }
};

export default CONFIG; 