
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
  generateTable(true);
    } catch (e) {
      alert("Invalid time zone");
    }
  }
}

function removeZone(zone) {
  selectedZones = selectedZones.filter(z => z !== zone);
  localStorage.setItem("zones", JSON.stringify(selectedZones));
  updateZoneDisplay();
  generateTable(true);
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
  headRow.innerHTML = "<th>UTC</th>" + selectedZones.map(zone => {
    
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
    let workCount = 0;

    selectedZones.forEach(zone => {
      const local = utcToZonedTime(utcTime, zone);
      const h = local.getHours();
      const label = local.toTimeString().slice(0, 5);
      const cls = (h >= 8 && h < 17) ? "work" : (h < 6 || h >= 22) ? "sleep" : "off";
      if (cls === "work") workCount++;
      cells.push(`<td class="${cls}">${label}</td>`);
    });

    if (workCount === selectedZones.length && selectedZones.length > 0) {
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
  if (suggestions.length === 1 && suggestions[0].toLowerCase() === input) return;
  this.setAttribute("list", "tz-list");
  let datalist = document.getElementById("tz-list");
  if (!datalist) {
    datalist = document.createElement("datalist");
    datalist.id = "tz-list";
    document.body.appendChild(datalist);
  }
  datalist.innerHTML = suggestions.slice(0, 10).map(z => `<option value="${z}">`).join("");
});

window.onload = () => {
  updateZoneDisplay();
  generateTable(true);
  applyTheme();
};

document.getElementById("input-date").addEventListener("change", generateTable);
document.getElementById("input-time").addEventListener("change", generateTable);
