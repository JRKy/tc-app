import CONFIG from './config.js';

class Storage {
  constructor() {
    this.zones = [];
    this.theme = null;
    this.schedules = [];
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const zonesData = localStorage.getItem(CONFIG.storageKeys.zones);
      const themeData = localStorage.getItem(CONFIG.storageKeys.theme);
      const schedulesData = localStorage.getItem(CONFIG.storageKeys.schedules);

      this.zones = zonesData ? JSON.parse(zonesData) : [];
      this.theme = themeData || null;
      this.schedules = schedulesData ? JSON.parse(schedulesData) : [];
    } catch (error) {
      console.error('Error loading from storage:', error);
      this.zones = [];
      this.theme = null;
      this.schedules = [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(CONFIG.storageKeys.zones, JSON.stringify(this.zones));
      localStorage.setItem(CONFIG.storageKeys.theme, this.theme);
      localStorage.setItem(CONFIG.storageKeys.schedules, JSON.stringify(this.schedules));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  getZones() {
    return this.zones;
  }

  setZones(zones) {
    this.zones = zones;
    this.saveToStorage();
  }

  getTheme() {
    return this.theme;
  }

  setTheme(theme) {
    this.theme = theme;
    this.saveToStorage();
  }

  getSchedules() {
    return this.schedules;
  }

  addSchedule(schedule) {
    this.schedules.push({
      ...schedule,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    });
    this.saveToStorage();
  }

  removeSchedule(scheduleId) {
    this.schedules = this.schedules.filter(s => s.id !== scheduleId);
    this.saveToStorage();
  }

  updateSchedule(scheduleId, updates) {
    const index = this.schedules.findIndex(s => s.id === scheduleId);
    if (index !== -1) {
      this.schedules[index] = {
        ...this.schedules[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveToStorage();
    }
  }
}

export default new Storage(); 