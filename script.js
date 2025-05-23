
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

  const now = new Date();
  const nowUTCSlot = new Date(Math.round(now.getTime() / (30 * 60 * 1000)) * 30 * 60 * 1000);

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
    const utcTime = new Date(baseDate.getTime() + i * 30 * 60 * 1000);
    const utcLabel = format(utcTime, "HH:mm");

    if (Math.abs(utcTime.getTime() - nowUTCSlot.getTime()) < 1000) {
      row.classList.add("now-row");
    }

    row.innerHTML = `<td>${utcLabel}</td>` + selectedZones.map(zone => {
      const local = utcToZonedTime(utcTime, zone);
      const localTime = format(local, "HH:mm");
      const localHour = parseInt(format(local, "HH"));
      const classes = [];

      if (localHour < 6 || localHour >= 22) {
        classes.push("sleep");
      } else if (localHour >= 8 && localHour < 17) {
        classes.push("work");
      } else {
        classes.push("off");
      }

      if (utcTime.getTime() < nowUTCSlot.getTime()) {
        classes.push("past");
      }

      const localSlot = new Date(Math.round(local.getTime() / (30 * 60 * 1000)) * 30 * 60 * 1000);
      if (Math.abs(localSlot.getTime() - now.getTime()) < 30 * 60 * 1000 &&
          zone === selectedZones[0]) {
        classes.push("now-cell");
      }

      return `<td class="${classes.join(" ")}">${localTime}</td>`;
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
