
let customCities = JSON.parse(localStorage.getItem("customCities") || "[]");

// Helper to get UTC offset label
function getUTCOffsetLabel(tz) {
  const now = new Date();
  const zoned = window.dateFnsTz.utcToZonedTime(now, tz);
  const offsetMin = (zoned.getTime() - now.getTime()) / 60000;
  const sign = offsetMin >= 0 ? "+" : "-";
  const hours = Math.floor(Math.abs(offsetMin) / 60).toString().padStart(2, "0");
  const minutes = Math.abs(offsetMin) % 60 === 0 ? "00" : "30";
  return `UTC${sign}${hours}:${minutes}`;
}

// Render delete buttons for custom cities
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



window.onload = function () {
  const timezoneSelect = document.getElementById("timezone");
  const addBtn = document.getElementById("add-city-btn");
  const customInput = document.getElementById("custom-city");
  const tableHead = document.querySelector("#timezone-table thead");
  const tableBody = document.querySelector("#timezone-table tbody");
  

customCities.forEach((newCity) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: newCity });
    const cityName = newCity.split("/").pop().replace(/_/g, " ");
    cities[cityName + " (Custom)"] = newCity;
  } catch {}
});


  Object.entries(cities)
    .sort((a, b) => (new Date().toLocaleTimeString("en-US", { timeZone: a[1], hour12: false })).localeCompare(
                      new Date().toLocaleTimeString("en-US", { timeZone: b[1], hour12: false }))
    )
    .forEach(([name, tz]) => {
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
          
      const hour = parseInt(window.dateFns.format(local, "HH"), 10);
      const isWorkHour = hour >= 8 && hour < 17;
      return `<td class="${isWorkHour ? 'work-hour' : ''}">${window.dateFns.format(local, "HH:mm")}</td>`;
    
        }).join("");
      tableBody.appendChild(row);
    }
  }

  timezoneSelect.value = "America/Denver";
  generateTable("America/Denver");

  timezoneSelect.addEventListener("change", () => {
    generateTable(timezoneSelect.value);
  });

  addBtn.onclick = () => {
    const newCity = customInput.value.trim();
    if (newCity && !Object.values(cities).includes(newCity) && !customCities.includes(newCity)) {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: newCity });
        const cityName = newCity.split("/").pop().replace(/_/g, " ");
        cities[cityName + " (Custom)"] = newCity;
        customCities.push(newCity);
      localStorage.setItem("customCities", JSON.stringify(customCities));
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
};

// Dark mode toggle
document.getElementById("toggle-theme").onclick = () => {
  document.body.classList.toggle("dark");
};

// PDF download
document.getElementById("download-pdf").onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Time Zone Comparison Table", 10, 10);
  const rows = [...document.querySelectorAll("#timezone-table tbody tr")].map(row =>
    [...row.querySelectorAll("td")].map(td => td.textContent)
  );
  const headers = [...document.querySelectorAll("#timezone-table thead th")].map(th => th.textContent);
  doc.autoTable({ head: [headers], body: rows, startY: 20 });
  doc.save("timezone-table.pdf");
};


renderDeleteButtons();