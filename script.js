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



const cities = {
  "Los Angeles": "America/Los_Angeles",
  "Denver": "America/Denver",
  "New York": "America/New_York",
  "UTC": "Etc/UTC",
  "London": "Europe/London",
  "Berlin": "Europe/Berlin",
  "Tokyo": "Asia/Tokyo",
  "Sydney": "Australia/Sydney"
};


let customCities = JSON.parse(localStorage.getItem("customCities") || "[]");

function getUTCOffsetLabel(tz) {
  const now = new Date();
  const local = new Date(now.toLocaleString("en-US", { timeZone: tz }));
  const offsetMin = Math.round((local - now) / 60000);
  const sign = offsetMin >= 0 ? "+" : "-";
  const h = Math.floor(Math.abs(offsetMin) / 60).toString().padStart(2, "0");
  const m = (Math.abs(offsetMin) % 60).toString().padStart(2, "0");
  return `UTC${sign}${h}:${m}`;
}

function renderDeleteButtons() {
  const container = document.querySelector(".custom-city-controls");
  if (!container) return;
  container.innerHTML = "";
  customCities.forEach(city => {
    const btn = document.createElement("button");
    btn.textContent = `🗑️ ${city}`;
    btn.onclick = () => {
      customCities = customCities.filter(c => c !== city);
      localStorage.setItem("customCities", JSON.stringify(customCities));
      location.reload();
    };
    container.appendChild(btn);
  });
}

customCities.forEach(city => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: city });
    const label = city.split("/").pop().replace(/_/g, " ");
    cities[label + " (Custom)"] = city;
  } catch (e) {}
});

let selectedZones = JSON.parse(localStorage.getItem("zones") || '["America/Denver", "Asia/Tokyo"]');

function renderZones() {
  const tableHead = document.querySelector("#timezone-table thead");
  const tableBody = document.querySelector("#timezone-table tbody");

  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  const now = new Date();
  const nowUTCSlot = new Date(Math.round(now.getTime() / (30 * 60 * 1000)) * 30 * 60 * 1000);

  const headRow = document.createElement("tr");
  headRow.innerHTML = "<th>Time</th><th>UTC</th>" + selectedZones.map(zone => {
    return `<th>${zone} <button onclick="removeZone('${zone}')">❌</button></th>`;
  }).join("");
  tableHead.appendChild(headRow);

  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 48; i++) {
    const utcTime = new Date(baseDate.getTime() + i * 30 * 60 * 1000);
    const utcLabel = format(utcTime, "HH:mm");
    const row = document.createElement("tr");
    if (Math.abs(utcTime.getTime() - nowUTCSlot.getTime()) < 1000) {
      row.classList.add("now-row");
    }
    let rowHTML = `<td>${utcLabel}</td><td>${utcLabel}</td>`;
    rowHTML += selectedZones.map(zone => {
      const local = utcToZonedTime(utcTime, zone);
      const localTimeStr = format(local, "HH:mm");
      const localHour = parseInt(format(local, "HH"), 10);
      const classes = [];
      if (localHour < 6 || localHour >= 22) classes.push("sleep");
      else if (localHour >= 8 && localHour < 17) classes.push("work");
      else classes.push("off");
      if (utcTime < nowUTCSlot) classes.push("past");
      const localSlot = new Date(Math.round(local.getTime() / (30 * 60 * 1000)) * 30 * 60 * 1000);
      if (Math.abs(localSlot.getTime() - now.getTime()) < 30 * 60 * 1000) {
        classes.push("now-cell");
      }
      return `<td class="${classes.join(" ")}">${localTimeStr}</td>`;
    }).join("");
    row.innerHTML = rowHTML;
    tableBody.appendChild(row);
  }
}

function addZone() {
  const input = document.getElementById("zone-input");
  const zone = input.value.trim();
  if (zone && zone !== "UTC" && !selectedZones.includes(zone)) {
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
