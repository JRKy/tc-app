
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function format(date, token) {
  if (token === 'HH') return pad(date.getHours());
  if (token === 'mm') return pad(date.getMinutes());
  if (token === 'HH:mm') return pad(date.getHours()) + ':' + pad(date.getMinutes());
  return '';
}

function utcToZonedTime(date, timeZone) {
  const invdate = new Date(date.toLocaleString('en-US', { timeZone }));
  const diff = date.getTime() - invdate.getTime();
  return new Date(date.getTime() + diff);
}

let selectedZones = JSON.parse(localStorage.getItem("zones") || '["America/Denver", "UTC", "Asia/Tokyo"]');

function renderZones() {
  const headRow = document.querySelector("thead tr");
  const body = document.querySelector("tbody");
  headRow.innerHTML = "<th>Time</th>";
  body.innerHTML = "";

  selectedZones.forEach(zone => {
    const th = document.createElement("th");
    th.innerHTML = zone.replace("_", " ") + 
      ` <button onclick="removeZone('${zone}')">❌</button>`;
    headRow.appendChild(th);
  });

  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 48; i++) {
    const row = document.createElement("tr");
    const timeSlot = new Date(baseDate.getTime() + i * 30 * 60 * 1000);
    const label = format(timeSlot, "HH:mm");
    row.innerHTML = `<td>${label}</td>` + selectedZones.map(zone => {
      const local = utcToZonedTime(timeSlot, zone);
      const localTime = format(local, "HH:mm");
      return `<td>${localTime}</td>`;
    }).join("");
    body.appendChild(row);
  }
}

function addZone() {
  const input = document.getElementById("zone-input");
  const zone = input.value.trim();
  if (zone && !selectedZones.includes(zone)) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: zone }).format(new Date());
      selectedZones.push(zone);
      localStorage.setItem("zones", JSON.stringify(selectedZones));
      renderZones();
      input.value = "";
    } catch (e) {
      alert("Invalid time zone");
    }
  }
}

function removeZone(zone) {
  selectedZones = selectedZones.filter(z => z !== zone);
  localStorage.setItem("zones", JSON.stringify(selectedZones));
  renderZones();
}

window.onload = renderZones;
