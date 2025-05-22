
// Placeholder for date-fns UMD bundle
// In actual deployment, replace this with the real content from:
// https://cdn.jsdelivr.net/npm/date-fns@2.30.0/dist/date-fns.min.js
window.dateFns = {
  format: function(date, formatStr) {
    const pad = (n) => (n < 10 ? '0' + n : n);
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return formatStr === "HH:mm" ? `${hours}:${minutes}` : date.toString();
  }
};
