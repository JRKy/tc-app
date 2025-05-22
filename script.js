const cities = {
  "Baker Island": "Etc/GMT+12",
  "Los Angeles": "America/Los_Angeles",
  "Denver": "America/Denver",
  "New York": "America/New_York",
  "London": "Europe/London",
  "Berlin": "Europe/Berlin",
  "Moscow": "Europe/Moscow",
  "Mumbai": "Asia/Kolkata",
  "Beijing": "Asia/Shanghai",
  "Tokyo": "Asia/Tokyo",
  "Sydney": "Australia/Sydney",
  "Auckland": "Pacific/Auckland"
};

const timezoneSelect = document.getElementById("timezone");
const tableHead = document.querySelector("#timezone-table thead");
const tableBody = document.querySelector("#timezone-table tbody");

// Populate the dropdown
Object.entries(cities).forEach(([name, tz]) => {
  const option = document.createElement("option");
  option.value = tz;
  option.textContent = `${name} (${tz})`;
  timezoneSelect.appendChild(option);
});

function generateTable(baseZone) {
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  const headRow = document.createElement("tr");
  headRow.innerHTML = `<th>Time (${baseZone})</th>` +
    Object.keys(cities).map(city => `<th>${city}</th>`).join("");
  tableHead.appendChild(headRow);

  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 24; i++) {
    const time = new Date(baseDate.getTime() + i * 30 * 60 * 1000);
    const row = document.createElement("tr");
    const baseTime = dateFnsTz.utcToZonedTime(time, baseZone);
    row.innerHTML = `<td>${dateFns.format(baseTime, "HH:mm")}</td>` +
      Object.values(cities).map(tz => {
        const local = dateFnsTz.utcToZonedTime(time, tz);
        return `<td>${dateFns.format(local, "HH:mm")}</td>`;
      }).join("");
    tableBody.appendChild(row);
  }
}

// Dark mode toggle
document.getElementById("toggle-theme").onclick = () => {
  document.body.classList.toggle("dark");
};

// PDF download
document.getElementById("download-pdf").onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Time Zone Comparison Table", 10, 10);
  const rows = [...tableBody.querySelectorAll("tr")].map(row =>
    [...row.querySelectorAll("td")].map(td => td.textContent)
  );
  const headers = [...tableHead.querySelectorAll("th")].map(th => th.textContent);
  doc.autoTable({ head: [headers], body: rows, startY: 20 });
  doc.save("timezone-table.pdf");
};

// Initial render
timezoneSelect.value = "America/Denver";
generateTable("America/Denver");

timezoneSelect.addEventListener("change", () => {
  generateTable(timezoneSelect.value);
});
