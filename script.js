// Time
function updateTime() {
  const now = new Date();

  const timeStr = now.toLocaleTimeString('en-GB', {
    timeZone: 'Atlantic/Reykjavik',
    hour12: false
  });

  const weekdays = ['Sunnudagur', 'Mánudagur', 'Þriðjudagur', 'Miðvikudagur', 'Fimmtudagur', 'Föstudagur', 'Laugardagur'];
  const months = ['janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní', 'júlí', 'ágúst', 'september', 'október', 'nóvember', 'desember'];

  const weekday = weekdays[now.getDay()];
  const day = now.getDate();
  const month = months[now.getMonth()];

  const dateStr = `${weekday} ${day}. ${month}`;

  document.getElementById('time').innerText = timeStr;
  document.getElementById('date').innerText = dateStr;
}

setInterval(updateTime, 1000);
updateTime();

// Weather
async function getWeather() {
  try {
    const response = await fetch('https://site-proxy-m4fs.onrender.com/weather');
    const json = await response.json();
    const data = json.data;

    const tempParams = data.Sensors.Temperature.Parameters;
    const temp = tempParams.find(p => p.Name === "Temp")?.Value ?? "N/A";
    const dew = tempParams.find(p => p.Name === "Dew")?.Value ?? "N/A";
    const rh = tempParams.find(p => p.Name === "RH")?.Value ?? "N/A";

    const windSensors = data.Sensors.Wind;
    const getWind = id => windSensors.find(w => w.Id === id) || {};
    const wind01 = getWind("Wind01");
    const wind10 = getWind("Wind10");
    const wind19 = getWind("Wind19");
    const wind28 = getWind("Wind28");

    const avg = arr => arr.reduce((sum, val) => sum + parseFloat(val), 0) / arr.length;
    const windSpeedAvg = avg(windSensors.map(w => w?.Speed?.Value ?? 0)).toFixed(1);
    const gustAvg = avg(windSensors.map(w => w?.Speed10MinutesMax?.Value ?? 0)).toFixed(1);
    const windDirRWY19 = wind19?.Direction?.Value ?? "N/A";

    document.getElementById('weather').innerHTML = `
    <div class="weather-columns">
      <div class="weather-left weather-block">
        <div class="weather-row"><span class="label">Temp:</span><span class="value">${temp}°C</span></div>
        <div class="weather-row"><span class="label">Dew:</span><span class="value">${dew}°C</span></div>
        <div class="weather-row"><span class="label">RH:</span><span class="value">${rh}%</span></div>
      </div>
  
      <div class="weather-picture">
        <i id="weather-icon" class="wi wi-day-sunny weather-icon"></i>
      </div>
  
      <div class="weather-arrow">
        <i id="wind-arrow" class="wi wi-direction-up"></i> <!-- ✅ CHANGE wi-wind -> wi-direction-up -->
      </div>
  
      <div class="weather-right weather-block" id="iws-data">
        <div class="weather-row"><span class="label">Speed:</span><span class="value">--</span></div>
        <div class="weather-row"><span class="label">Gust:</span><span class="value">--</span></div>
        <div class="weather-row"><span class="label">Direction:</span><span class="value">--</span></div>
      </div>

    </div>
  `;
  
  const windDir = parseFloat(windDirRWY19) || 0;
  const windArrowEl = document.getElementById('wind-arrow');
  windArrowEl.className = 'wi wi-direction-up';
  windArrowEl.style.transform = `rotate(${windDir}deg)`;
  
  
  await fetchWeatherIcon();

  } catch (error) {
    console.error("Weather API error:", error.message || error);
    alert("Weather API error: " + (error.message || error));
    document.getElementById('weather').innerText = "Failed to load weather.";
  }
}

async function fetchWeatherIcon() {
  const latitude = 63.985; // Keflavík
  const longitude = -22.605;
  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weathercode&timezone=auto`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const weatherCode = data.current.weathercode;

    const iconClass = mapWeatherCodeToIcon(weatherCode);
    const weatherIconEl = document.getElementById('weather-icon');

    weatherIconEl.className = 'wi weather-icon'; 

    weatherIconEl.classList.add(iconClass);
  } catch (error) {
    console.error("Error fetching weather icon:", error);
    document.getElementById('weather-icon').className = "wi wi-na"; 
  }
}

function mapWeatherCodeToIcon(code) {
  const iconMap = {
    0: "wi-day-sunny",              // Clear sky
    1: "wi-day-sunny-overcast",     // Mainly clear
    2: "wi-day-cloudy",             // Partly cloudy
    3: "wi-cloudy",                 // Overcast
    45: "wi-fog",                   // Fog
    48: "wi-fog",                   // Fog with frost
    51: "wi-sprinkle",              // Light drizzle
    53: "wi-sprinkle",              // Moderate drizzle
    55: "wi-showers",               // Dense drizzle
    61: "wi-rain",                  // Light rain
    63: "wi-rain",                  // Moderate rain
    65: "wi-rain-wind",             // Heavy rain
    66: "wi-rain-mix",              // Freezing rain
    67: "wi-rain-mix",              // Heavy freezing rain
    71: "wi-snow",                  // Light snow
    73: "wi-snow",                  // Moderate snow
    75: "wi-snow-wind",             // Heavy snow
    77: "wi-snowflake-cold",        // Snow grains
    80: "wi-showers",               // Rain showers slight
    81: "wi-showers",               // Rain showers moderate
    82: "wi-showers",               // Rain showers violent
    85: "wi-snow",                  // Snow showers slight
    86: "wi-snow",                  // Snow showers heavy
    95: "wi-thunderstorm",          // Thunderstorm
    96: "wi-thunderstorm",          // Thunderstorm slight hail
    99: "wi-thunderstorm"           // Thunderstorm heavy hail
  };

  return iconMap[code] || "wi-na";
}

async function getIwsWind() {
  try {
    const response = await fetch('https://iws.isavia.is/weather/BIKF');
    const json = await response.json();

    const rwy19 = json?.data?.rwy19;
    if (!rwy19) throw new Error("No RWY19 data in IWS response.");

    const speed = rwy19.windSpeed?.value?.toFixed(1) ?? "N/A";
    const gust = rwy19.windSpeed10MinutesMax?.value?.toFixed(1) ?? "N/A";
    const direction = rwy19.windDirection?.value ?? "N/A";

    const iwsEl = document.getElementById('iws-data');
    if (iwsEl) {
      iwsEl.innerHTML = `
        <div class="weather-row"><span class="label">Speed:</span><span class="value">${speed} kts</span></div>
        <div class="weather-row"><span class="label">Gust:</span><span class="value">${gust} kts</span></div>
        <div class="weather-row"><span class="label">Direction:</span><span class="value">${direction}°</span></div>
      `;
    }

    // ✅ Rotate wind arrow using IWS direction
    const windArrowEl = document.getElementById('wind-arrow');
    windArrowEl.className = 'wi wi-direction-up';
    windArrowEl.style.transform = `rotate(${parseFloat(direction)}deg)`;

  } catch (error) {
    console.error("IWS Weather error:", error.message || error);
    const iwsEl = document.getElementById('iws-data');
    if (iwsEl) {
      iwsEl.innerHTML = `<div class="weather-row">Failed to load IWS data.</div>`;
    }
  }
}




// ATIS
async function getDatis() {
  try {
    const response = await fetch('https://site-proxy-m4fs.onrender.com/datis');
    const text = await response.text();

    const hasLowVis = text.toUpperCase().includes("LOW VIS");
    //const hasLowVis = text.toUpperCase().includes("BIKF");

    const atisMatch = text.match(/ATIS\s+([A-Z])/i);
    const atisLetter = atisMatch ? atisMatch[1] : "Unknown";

    const lines = text.split('\n');
    const atisIndex = lines.findIndex(line => /ATIS\s+[A-Z]/i.test(line));
    const rawTimestamp = lines[atisIndex + 1]?.match(/(\d{4})Z/);
    const timeZulu = rawTimestamp ? `${rawTimestamp[1].slice(0, 2)}:${rawTimestamp[1].slice(2)}` : "Time N/A";

    const statusLine = hasLowVis
    ? `<span class="status-line">
          <strong> 🚨 Lágskyggnisástand til staðar samkvæmt ATIS ${atisLetter}, gefið út síðast kl. ${timeZulu} 🚨</strong>
      </span>`
    : `<span class="status-line">
          <strong> Lágskyggnisástand ekki til staðar samkvæmt ATIS ${atisLetter}, gefið út síðast kl. ${timeZulu}</strong>
      </span>`;

    const procedureInfo = `
      <div class="procedure-info">
        <strong>6.12 Lágskyggnis aðgerðir:</strong> Sérstakt verklag er virkjað fyrir lágskyggni. Á meðan því stendur er umferð ökutækja og fjöldi einstaklinga að vinnu á flugvellinum verulega takmörkuð. Athugið að einstaklingum er <strong>EKKI</strong> heimilt að ganga frá silfurhliði að þjónustuhúsi á meðan aðgerðir eru virkar.
    `;
  
    const datisEl = document.getElementById('datis');
    datisEl.innerHTML = statusLine + procedureInfo;

    datisEl.className = hasLowVis ? 'datis-banner lvo-active' : 'datis-banner lvo-inactive';

  } catch (error) {
    console.error("DATIS API error:", error.message || error);
    alert("DATIS API error: " + (error.message || error));
    document.getElementById('datis').innerText = "Failed to load DATIS.";
  }
}

async function getViewMondoData() {
  try {
    const response = await fetch('https://site-proxy-m4fs.onrender.com/viewmondo/rwy28');
    const json = await response.json();

    const station = json.station;
    const channels = station.SensorChannels;
    const values = station.LastData?.MeasureValues || [];

    // Build a map from channel ID → { name, unit }
    const channelMap = {};
    channels.forEach(ch => {
      channelMap[ch.SensorChannelId] = {
        name: ch.SensorChannelName,
        unit: ch.SensorChannelUnit
      };
    });

    // Build a readable list of values
    const displayedRows = values.map(val => {
      const meta = channelMap[val.SensorChannelId];
      if (!meta) return null;

      const valueDisplay = val.Value != null ? `${val.Value.toFixed(2)} ${meta.unit}` : "N/A";
      const status = val.StatusText ? ` (${val.StatusText})` : "";
      return `<div class="weather-row"><span class="label">${meta.name}:</span><span class="value">${valueDisplay}${status}</span></div>`;
    }).filter(Boolean).join("");

    const viewMondoEl = document.getElementById('viewmondo');
    viewMondoEl.innerHTML = `
      <h3>ViewMondo – ${station.StationName}</h3>
      ${displayedRows}
    `;
  } catch (error) {
    console.error("ViewMondo error:", error.message || error);
    const viewMondoEl = document.getElementById('viewmondo');
    viewMondoEl.innerText = "Failed to load ViewMondo data.";
  }
}




window.onload = function() {
  getWeather();
  getDatis();
  getIwsWind();
  getViewMondoData();
};
