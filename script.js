
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

window.onload = function () {
  const timezoneSelect = document.getElementById("timezone");
  const addBtn = document.getElementById("add-city-btn");
  const customInput = document.getElementById("custom-city");
  const tableHead = document.querySelector("#timezone-table thead");
  const tableBody = document.querySelector("#timezone-table tbody");

  Object.entries(cities).forEach(([name, tz]) => {
    const option = document.createElement("option");
    option.value = tz;
    option.textContent = `${name} (${getUTCOffsetLabel(tz)})`;
    timezoneSelect.appendChild(option);
  });

  function generateTable(baseZone) {
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    const headRow = document.createElement("tr");
    headRow.innerHTML = "<th>UTC</th>" + Object.entries(cities).map(([name, tz]) => {
      const label = `${name} (${getUTCOffsetLabel(tz)})`;
      return "<th class='" + (tz === baseZone ? "highlight" : "") + "'>" + label + "</th>";
    }).join("");
    tableHead.appendChild(headRow);

    const nowUTC = new Date();
    const nowHHMM = nowUTC.getUTCHours().toString().padStart(2, "0") + ":" + 
                    (Math.floor(nowUTC.getUTCMinutes() / 30) * 30).toString().padStart(2, "0");

    const baseDate = new Date();
    baseDate.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < 48; i++) {
      const utcTime = new Date(baseDate.getTime() + i * 30 * 60 * 1000);
      const row = document.createElement("tr");
      const utcLabel = window.dateFns.format(utcTime, "HH:mm");
      if (utcLabel === nowHHMM) row.classList.add("now-row");

      row.innerHTML = `<td>${utcLabel}</td>` + 
        Object.values(cities).map(tz => {
          const local = window.dateFnsTz.utcToZonedTime(utcTime, tz);
          const hour = parseInt(window.dateFns.format(local, "HH"), 10);
          
      const localTimeStr = window.dateFns.format(local, "HH:mm");
      const localHour = parseInt(window.dateFns.format(local, "HH"), 10);
      const isSleep = localHour < 6 || localHour >= 22;
      const isWork = localHour >= 8 && localHour < 17;

      const classes = [];
      if (isSleep) classes.push("sleep");
      else if (isWork) classes.push("work");
      else classes.push("off");

      const isPast = utcTime < new Date();
      if (isPast) classes.push("past");

      const nowLocal = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: baseZone });
      if (tz === baseZone && localTimeStr === nowLocal) {
        classes.push("now-cell");
      }

      return `<td class="${classes.join(" ")}">${localTimeStr}</td>`;
    
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
        const name = newCity.split("/").pop().replace(/_/g, " ");
        cities[name + " (Custom)"] = newCity;
        customCities.push(newCity);
        localStorage.setItem("customCities", JSON.stringify(customCities));
        const opt = document.createElement("option");
        opt.value = newCity;
        opt.textContent = name + " (Custom)";
        timezoneSelect.appendChild(opt);
        generateTable(timezoneSelect.value);
        renderDeleteButtons();
        customInput.value = "";
      } catch (e) {
        alert("Invalid time zone.");
      }
    }
  };

  renderDeleteButtons();
};
