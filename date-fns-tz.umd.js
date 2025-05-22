
// Placeholder for date-fns-tz UMD bundle
// In actual deployment, replace this with the real content from:
// https://cdn.jsdelivr.net/npm/date-fns-tz@1.3.7/dist/date-fns-tz.umd.min.js
window.dateFnsTz = {
  utcToZonedTime: function (date, tz) {
    return new Date(date.toLocaleString('en-US', { timeZone: tz }));
  }
};
