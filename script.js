window.onload = function () {
const cities = {
  "Los Angeles": "America/Los_Angeles",
  "Denver": "America/Denver",
  "Chicago": "America/Chicago",
  "New York": "America/New_York",
  "UTC": "Etc/UTC",
  "London": "Europe/London",
  "Berlin": "Europe/Berlin",
  "Dubai": "Asia/Dubai",
  "Mumbai": "Asia/Kolkata",
  "Singapore": "Asia/Singapore",
  "Tokyo": "Asia/Tokyo",
  "Sydney": "Australia/Sydney"
};
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
const addBtn = document.getElementById("add-city-btn");
const customInput = document.getElementById("custom-city");
let customCities = [];
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

  for (let i = 0; i < 48; i++) {
    const time = new Date(baseDate.getTime() + i * 30 * 60 * 1000);
    const row = document.createElement("tr");
    const baseTime = window.dateFnsTz.utcToZonedTime(time, baseZone);
    row.innerHTML = `<td>${window.dateFns.format(baseTime, "HH:mm")}</td>` +
      Object.values(cities).map(tz => {
        const local = window.dateFnsTz.utcToZonedTime(time, tz);
        return `<td>${window.dateFns.format(local, "HH:mm")}</td>`;
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

  addBtn.onclick = () => {
    const newCity = customInput.value.trim();
    if (newCity && !Object.values(cities).includes(newCity) && !customCities.includes(newCity)) {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: newCity });
        const cityName = newCity.split("/").pop().replace(/_/g, " ");
        cities[cityName + " (Custom)"] = newCity;
        customCities.push(newCity);
        const opt = document.createElement("option");
        opt.value = newCity;
        opt.textContent = cityName + " (Custom)";
        timezoneSelect.appendChild(opt);
        generateTable(timezoneSelect.value);
        customInput.value = "";
      } catch (e) {
        alert("Invalid time zone.");
      }
    }
  };

timezoneSelect.addEventListener("change", () => {
  generateTable(timezoneSelect.value);
});

};