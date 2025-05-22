
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
  const absMin = Math.abs(offsetMin);
  const hours = Math.floor(absMin / 60).toString().padStart(2, "0");
  const minutes = (absMin % 60).toString().padStart(2, "0");
  return `UTC${sign}${hours}:${minutes}`;
}


function renderDeleteButtons() {
  const container = document.querySelector(".custom-city-controls");
  if (!container) return;
  container.innerHTML = "";
  customCities.forEach(city => {
    const btn = document.createElement("button");
    btn.textContent = `🗑️ $Auckland`;
    btn.onclick = () => {
      customCities = customCities.filter(c => c !== city);
      localStorage.setItem("customCities", JSON.stringify(customCities));
      location.reload();
    };
    container.appendChild(btn);
  });
}

customCities.forEach((newCity) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: newCity });
    const cityName = newCity.split("/").pop().replace(/_/g, " ");
    cities[cityName + " (Custom)"] = newCity;
  } catch {}
});

window.onload = function () {
  const timezoneSelect = document.getElementById("timezone");
  const addBtn = document.getElementById("add-city-btn");
  const customInput = document.getElementById("custom-city");
  const tableHead = document.querySelector("#timezone-table thead");
  const tableBody = document.querySelector("#timezone-table tbody");

  Object.entries(cities)
    .sort((a, b) => (new Date().toLocaleTimeString("en-US", { timeZone: a[1], hour12: false })).localeCompare(
                     new Date().toLocaleTimeString("en-US", { timeZone: b[1], hour12: false })))
    .forEach(([name, tz]) => {
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
      const isDST = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" }).formatToParts(new Date()).some(p => p.type === "timeZoneName" && p.value.includes("DT"));
const label = `${name}${isDST ? " *" : ""} (${getUTCOffsetLabel(tz)})`;
      return "<th class='" + (tz === baseZone ? "highlight" : "") + "'>" + label + "</th>";
    }).join("");
    tableHead.appendChild(headRow);

    const baseDate = new Date();
    baseDate.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < 48; i++) {
      const utcTime = new Date(baseDate.getTime() + i * 30 * 60 * 1000);
      const row = document.createElement("tr");
      row.innerHTML = `<td>${window.dateFns.format(utcTime, "HH:mm")}</td>` + 
        Object.values(cities).map(tz => {
          const local = window.dateFnsTz.utcToZonedTime(utcTime, tz);
          const hour = parseInt(window.dateFns.format(local, "HH"), 10);
          const isWorkHour = hour >= 8 && hour < 17;
          
      const nowUTC = new Date();
      const utcHour = utcTime.getUTCHours();
      const cellTime = window.dateFns.format(local, "HH:mm");
      const hour = parseInt(cellTime.split(":")[0], 10);
      const minute = parseInt(cellTime.split(":")[1], 10);
      const totalMins = hour * 60 + minute;

      const isPast = utcTime.getTime() < nowUTC.getTime();
      const isSleep = totalMins < 360 || totalMins >= 1320;
      const isWork = totalMins >= 480 && totalMins < 1020;

      let classes = [];
      if (isPast) classes.push("past");
      if (isSleep) classes.push("sleep");
      else if (isWork) classes.push("work");
      else classes.push("off");

      return `<td class="${classes.join(" ")}">${cellTime}</td>`;
    
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

  renderDeleteButtons();
};
