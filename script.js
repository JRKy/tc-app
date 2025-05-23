
let selectedZones = JSON.parse(localStorage.getItem("zones") || '["America/Denver", "Asia/Tokyo"]');

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
    } catch (e) {
      alert("Invalid time zone");
    }
  }
}

function removeZone(zone) {
  selectedZones = selectedZones.filter(z => z !== zone);
  localStorage.setItem("zones", JSON.stringify(selectedZones));
  updateZoneDisplay();
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

function generateTable() {
  const dateStr = document.getElementById("input-date").value;
  const timeStr = document.getElementById("input-time").value;

  if (!dateStr || !timeStr) {
    alert("Please select both a date and time.");
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
  headRow.innerHTML = "<th>UTC</th>" + selectedZones.map(zone => {
    const label = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "shortOffset"
    }).formatToParts(new Date()).find(p => p.type === "timeZoneName")?.value || "";
    return `<th>${zone} (${label.replace("GMT", "UTC")})</th>`;
  }).join("");
  tableHead.appendChild(headRow);

  for (let i = 0; i < 48; i++) {
    const utcTime = new Date(startUTC.getTime() + i * 30 * 60 * 1000);
    const utcLabel = utcTime.toISOString().slice(11, 16);
    const row = document.createElement("tr");
    row.innerHTML = `<td>${utcLabel}</td>` + selectedZones.map(zone => {
      const local = utcToZonedTime(utcTime, zone);
      const localLabel = local.toTimeString().slice(0, 5);
      return `<td>${localLabel}</td>`;
    }).join("");
    tableBody.appendChild(row);
  }
}

window.onload = updateZoneDisplay;
