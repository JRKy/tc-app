
let selectedZones = JSON.parse(localStorage.getItem("zones") || "[]");

function updateZoneDisplay() {
  const container = document.getElementById("selected-zones");
  container.innerHTML = "Selected Zones: " + selectedZones.map(z => 
    `<span>${z} <button onclick="removeZone('${z}')">❌</button></span>`
  ).join(" ");
}

function addZone() {
  const input = document.getElementById("zone-input");
  const zone = input.value.trim();
  if (zone && !selectedZones.includes(zone)) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: zone }).format(new Date());
      selectedZones.push(zone);
      localStorage.setItem("zones", JSON.stringify(selectedZones));
      input.value = "";
      updateZoneDisplay();
  try { generateTable(true); } catch(e) { console.warn('Table gen skipped:', e); }
    } catch (e) {
      alert("Invalid time zone");
    }
  }
}

function removeZone(zone) {
  selectedZones = selectedZones.filter(z => z !== zone);
  localStorage.setItem("zones", JSON.stringify(selectedZones));
  updateZoneDisplay();
  try { generateTable(true); } catch(e) { console.warn('Table gen skipped:', e); }
}

function utcToZonedTime(date, timeZone) {
  const localString = date.toLocaleString('en-US', {
    timeZone: timeZone,
    hour12: false
  });

  const [datePart, timePart] = localString.split(', ');
  const [month, day, year] = datePart.split('/');
  const [hour, minute, second = '00'] = timePart.split(':');

  return new Date(`${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`);
}

function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle("dark");
  localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");
}

function applyTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") document.body.classList.add("dark");
}

function exportPDF() {
  window.print();
}

function generateTable(autoTriggered = false) {
  const cb = document.getElementById("include-utc");
  const showUTC = cb && cb.checked === true;
    const dateStr = document.getElementById("input-date").value;
  const timeStr = document.getElementById("input-time").value;
  if (!dateStr || !timeStr) { if (!autoTriggered) alert("Please select both a date and time."); return; }

  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  const startUTC = new Date(Date.UTC(year, month - 1, day, hour, minute));

  const tableHead = document.querySelector("#timezone-table thead");
  const tableBody = document.querySelector("#timezone-table tbody");
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  const headRow = document.createElement("tr");
  headRow.innerHTML = "<th class=\"utc-header\">UTC</th>" + selectedZones.map(zone => {
    
    const offsetDate = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {

      timeZone: zone,
      timeZoneName: "shortOffset"
    })
    .formatToParts(offsetDate);
    const offsetPart = formatter.find(p => p.type === "timeZoneName")?.value || "";
    const isDST = offsetDate.toLocaleTimeString('en-US', { timeZone: zone }).includes("Daylight");
    const label = offsetPart.replace("GMT", "UTC") + (isDST ? "*" : "")
;
    return `<th>${zone} (${label.replace("GMT", "UTC")})</th>`;
  }).join("");
  tableHead.appendChild(headRow);

  
    for (let i = 0; i < 48; i++) {

    const utcTime = new Date(startUTC.getTime() + i * 30 * 60 * 1000);
    const utcLabel = utcTime.toISOString().slice(11, 16);
    const row = document.createElement("tr");
    let cells = [`<td>${utcLabel}</td>`];
    
    let utcHour = utcTime.getUTCHours();
    
    let utcClass = (utcHour >= 8 && utcHour < 17) ? "work" : (utcHour < 6 || utcHour >= 22) ? "sleep" : "off";
    if (showUTC && utcClass === "work") smartZones.push("__utc__");

    let workCount = 0;

    
    const smartZones = [];
    selectedZones.forEach(zone => {

      const local = utcToZonedTime(utcTime, zone);
      const h = local.getHours();
      
    const label = local.toTimeString().slice(0, 5);
    const dateLabel = local.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
      const cls = (h >= 8 && h < 17) ? "work" : (h < 6 || h >= 22) ? "sleep" : "off";
      if (cls === "work") { workCount++; smartZones.push(zone); }
      cells.push(`<td class="${cls}">${label}<br/><small>${dateLabel}</small></td>`);
    });

    if (selectedZones.length > 1 && smartZones.length === selectedZones.length) {
      row.classList.add("smart-slot");
      row.classList.add("now-cell");
    }

    row.innerHTML = cells.join("");
    tableBody.appendChild(row);
  }
}

const ianaTimeZones = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [];

document.getElementById("zone-input").addEventListener("input", function() {
  const input = this.value.toLowerCase();
  const suggestions = ianaTimeZones.filter(z => z.toLowerCase().includes(input));
  this.setAttribute("list", "tz-list");
  let datalist = document.getElementById("tz-list");
  if (!datalist) {
    datalist = document.createElement("datalist");
    datalist.id = "tz-list";
    document.body.appendChild(datalist);
  }
  datalist.innerHTML = suggestions.slice(0, 20).map(z => `<option value="${z}">`).join("");
});

window.onload = () => {

  applyTheme();
  updateZoneDisplay();
  try { generateTable(true); } catch(e) { console.warn('Table gen skipped:', e); }
  applyTheme();

  setTimeout(() => generateTable(true), 10); 
  const waitForControls = setInterval(() => {
    const cb = document.getElementById("include-utc");
    if (cb) {
      clearInterval(waitForControls);
      try { generateTable(true); } catch(e) { console.warn('Table gen skipped:', e); }
    }
  }, 50);
};

document.getElementById("input-date").addEventListener("change", generateTable);
document.getElementById("input-time").addEventListener("change", generateTable);


function generateTable(autoTriggered = false) {
  const cb = document.getElementById("include-utc");
  const showUTC = cb && cb.checked === true;
    const dateStr = document.getElementById("input-date").value;
  const timeStr = document.getElementById("input-time").value;
  if (!dateStr || !timeStr) {
    if (!autoTriggered) alert("Please select both a date and time.");
    return;
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  const startUTC = new Date(Date.UTC(year, month - 1, day, hour, minute));

  const tableHead = document.querySelector("#timezone-table thead");
  const tableBody = document.querySelector("#timezone-table tbody");
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  const headRow = document.createElement("tr");
  
  headRow.innerHTML = (showUTC ? '' : "") +
    selectedZones.map(zone => {

    const now = utcTime;
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "shortOffset"
    });
    const parts = formatter.formatToParts(now);
    const offset = parts.find(p => p.type === "timeZoneName")?.value.replace("GMT", "UTC") || "";
    
    const jan = new Date(now.getFullYear(), 0, 1);
    const jul = new Date(now.getFullYear(), 6, 1);
    const isDST = utcTime.getTimezoneOffset() < Math.max(
      new Date(utcTime.getFullYear(), 0, 1).getTimezoneOffset(),
      new Date(utcTime.getFullYear(), 6, 1).getTimezoneOffset()
    );
    
    
    return `<th>${zone} (${offset}${isDST ? "*" : ""})</th>`;
  }).join("");
  tableHead.appendChild(headRow);

  
    for (let i = 0; i < 48; i++) {

    const utcTime = new Date(startUTC.getTime() + i * 30 * 60 * 1000);
    const utcHour = utcTime.getUTCHours();
    const utcLabel = utcTime.toISOString().slice(11, 16);
    const utcDay = utcTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    let row = document.createElement("tr");
    let smartZones = [];
    
    let utcClass = (utcHour >= 8 && utcHour < 17) ? "work" : (utcHour < 6 || utcHour >= 22) ? "sleep" : "off";
    if (showUTC && utcClass === "work") smartZones.push("__utc__");

    
    if (showUTC) row.innerHTML = `<td class="${utcClass}">${utcLabel}<br/><small>${utcDay}</small></td>`;


    selectedZones.forEach(zone => {
      const local = utcToZonedTime(utcTime, zone);
      const localHour = local.getHours();
      const localLabel = local.toTimeString().slice(0, 5);
      const localDay = local.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const cls = (localHour >= 8 && localHour < 17) ? "work" : (localHour < 6 || localHour >= 22) ? "sleep" : "off";
      if (cls === "work") smartZones.push(zone);
      row.innerHTML += `<td class="${cls}">${localLabel}<br/><small>${localDay}</small></td>`;
    });

    if (smartZones.length === selectedZones.length + 1 && selectedZones.length > 0) {
      row.classList.add("smart-slot");
    }

    tableBody.appendChild(row);
  }
}  // END generateTable
