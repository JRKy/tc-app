import CONFIG from './config.js';

class TimezoneUtils {
  constructor() {
    this.commonTimezones = CONFIG.commonTimezones;
  }

  utcToZonedTime(date, timeZone) {
    const localString = date.toLocaleString('en-US', {
      timeZone: timeZone,
      hour12: false
    });

    const [datePart, timePart] = localString.split(', ');
    const [month, day, year] = datePart.split('/');
    const [hour, minute, second = '00'] = timePart.split(':');

    return new Date(`${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`);
  }

  isValidTimezone(timezone) {
    try {
      if (timezone === 'UTC') return true;
      new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
      return true;
    } catch (e) {
      return false;
    }
  }

  getTimezoneSuggestions(input) {
    const searchTerm = input.toLowerCase();
    return this.commonTimezones
      .filter(tz => tz.toLowerCase().includes(searchTerm))
      .slice(0, CONFIG.timezoneSuggestions);
  }

  getTimezoneDisplayName(timezone) {
    if (timezone === 'UTC') return 'UTC';
    return timezone.split('/').pop().replace('_', ' ');
  }

  isWorkHour(hour, minute = 0) {
    if (hour < CONFIG.workHours.start) return false;
    if (hour > CONFIG.workHours.end) return false;
    if (hour === CONFIG.workHours.end && minute > 0) return false;
    return true;
  }

  isSleepHour(hour, minute = 0) {
    // Sleep hours: 22:00 to 05:59 (inclusive)
    if (CONFIG.sleepHours.start <= hour && hour <= 23) return true; // 22:00 to 23:59
    if (0 <= hour && hour < CONFIG.sleepHours.end) return true;    // 00:00 to 05:59
    if (hour === CONFIG.sleepHours.end && minute > 0) return false; // 06:00+ is not sleep
    return false;
  }

  getTimeClass(hour, minute = 0) {
    if (this.isWorkHour(hour, minute)) return 'work';
    if (this.isSleepHour(hour, minute)) return 'sleep';
    return 'off';
  }

  formatTime(date, timezone) {
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  formatDate(date, timezone) {
    const options = {
      month: 'short',
      day: 'numeric',
      timeZone: timezone
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  isDST(timezone) {
    try {
      if (timezone === 'UTC') return false;
      
      const now = new Date();
      const jan = new Date(now.getFullYear(), 0, 1);
      const jul = new Date(now.getFullYear(), 6, 1);
      
      const janOffset = new Date(jan.toLocaleString('en-US', { timeZone: timezone })).getTimezoneOffset();
      const julOffset = new Date(jul.toLocaleString('en-US', { timeZone: timezone })).getTimezoneOffset();
      
      // If the offset in July is greater than in January, it means DST is in effect
      return janOffset !== julOffset;
    } catch (e) {
      console.error('Error checking DST for timezone:', timezone, e);
      return false;
    }
  }
}

export default new TimezoneUtils(); 