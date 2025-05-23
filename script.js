let selectedZones = [];

function generateTable(autoTriggered = false) {
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
  headRow.innerHTML = selectedZones.map(zone => {
    const local = new Date().toLocaleString("en-US", { timeZone: zone });
    const d = new Date(local);
    const jan = new Date(d.getFullYear(), 0, 1);
    const jul = new Date(d.getFullYear(), 6, 1);
    const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    const isDST = d.getTimezoneOffset() < stdOffset;

    const offset = -d.getTimezoneOffset() / 60;
    const offsetStr = `UTC${offset >= 0 ? "+" : ""}${offset}${isDST ? "*" : ""}`;
    return `<th>${zone} (${offsetStr})</th>`;
  }).join("");
  tableHead.appendChild(headRow);

  for (let i = 0; i < 48; i++) {
    const utcTime = new Date(startUTC.getTime() + i * 30 * 60 * 1000);
    const row = document.createElement("tr");

    selectedZones.forEach(zone => {
      const local = new Date(utcTime.toLocaleString("en-US", { timeZone: zone }));
      const hour = local.getHours();
      const label = local.toTimeString().slice(0, 5);
      const dateStr = local.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });

      let cls = "off";
      if (hour >= 8 && hour < 17) cls = "work";
      else if (hour < 6 || hour >= 22) cls = "sleep";

      row.innerHTML += `<td class="${cls}">${label}<br/><small>${dateStr}</small></td>`;
    });

    tableBody.appendChild(row);
  }
}  // END generateTable

function addZone() {
  const input = document.getElementById("zone-input");
  const zone = input.value.trim();
  if (!zone || !ianaTimeZones.includes(zone)) {
    alert("Invalid time zone. Please select from the suggestions.");
    return;
  }

  if (!selectedZones.includes(zone)) {
    selectedZones.push(zone);
    input.value = "";
    generateTable();
  }
}

function removeZone(zone) {
  selectedZones = selectedZones.filter(z => z !== zone);
  generateTable();
}

document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("zone-input");
  if (!input) return;

  input.addEventListener("input", function () {
    const inputVal = this.value.toLowerCase();
    const suggestions = ianaTimeZones.filter(z => z.toLowerCase().includes(inputVal));

    let datalist = document.getElementById("tz-list");
    if (!datalist) {
      datalist = document.createElement("datalist");
      datalist.id = "tz-list";
      document.body.appendChild(datalist);
    }

    const optionsHTML = suggestions
      .slice(0, 20)
      .map(function (z) {
        return `<option value="${z}">`;
      })
      .join("");

    datalist.innerHTML = optionsHTML;
  });
});
