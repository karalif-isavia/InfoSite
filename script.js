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

    const windSensors = data.Sensors.Wind;
    const avg = arr => arr.reduce((sum, val) => sum + parseFloat(val), 0) / arr.length;
    const windSpeedAvg = avg(windSensors.map(w => w?.Speed?.Value ?? 0)).toFixed(1);
    const gustAvg = avg(windSensors.map(w => w?.Speed10MinutesMax?.Value ?? 0)).toFixed(1);

    document.getElementById('weather').innerHTML = `
    <div class="weather-columns">
      <div class="weather-right weather-block">
        <div id="metartaf-widget" class="weather-row" style="flex-direction: column; align-items: flex-start;">
          <a href="https://metar-taf.com/BIKF" id="metartaf-NKaps0w2" style="font-size:18px; font-weight:500; color:#000; width:350px; height:278px; display:block">METAR Keflavik International Airport</a>
        </div>
      </div>

      <div class="weather-right weather-block" id="iws-data">
        <div class="weather-row">Loading IWS wind data...</div>
      </div>
    </div>
  `;

    // Load the landscape widget script
    const script = document.createElement('script');
    script.src = 'https://metar-taf.com/embed-js/BIKF?layout=landscape&qnh=hPa&rh=rh&target=NKaps0w2';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);

    // IWS Wind Data
    try {
      const iwsResponse = await fetch('https://iws.isavia.is/weather/BIKF');
      const iwsJson = await iwsResponse.json();
      const apron = iwsJson?.data?.apron;

      if (!apron) throw new Error("Missing apron values in IWS data");

      const iwsSpeed = apron.windSpeed?.value?.toFixed(1) ?? "N/A";
      const iwsGust = apron.windSpeed10MinutesMax?.value?.toFixed(1) ?? "N/A";
      const iwsDir = apron.windDirection?.value != null ? Math.round(apron.windDirection.value) : "N/A";

      const iwsEl = document.getElementById('iws-data');
      iwsEl.innerHTML = `
        <div class="weather-row"><span class="label">Apron Wind Speed:</span><span class="value">${iwsSpeed} kts</span></div>
        <div class="weather-row"><span class="label">Gust:</span><span class="value">${iwsGust} kts</span></div>
        <div class="weather-row"><span class="label">Direction:</span><span class="value">${iwsDir}°</span></div>
      `;
    } catch (err) {
      console.error("IWS fetch error inside getWeather():", err);
      const iwsEl = document.getElementById('iws-data');
      iwsEl.innerHTML = `<div class="weather-row">Failed to load IWS data.</div>`;
    }

  } catch (error) {
    console.error("Weather API error:", error.message || error);
    alert("Weather API error: " + (error.message || error));
    document.getElementById('weather').innerText = "Failed to load weather.";
  }
}



/*async function fetchWeatherIcon() {
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
*/

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

    const datisEl = document.getElementById('datis');

    if (hasLowVis) {
      const statusLine = `
        <span class="status-line">
          <strong> 🚨 Lágskyggnisástand til staðar samkvæmt ATIS ${atisLetter}, gefið út síðast kl. ${timeZulu} 🚨</strong>
        </span>`;
    
      const procedureInfo = `
        <div class="procedure-info">
          <strong>6.12 Lágskyggnis aðgerðir:</strong> Sérstakt verklag er virkjað fyrir lágskyggni. Á meðan því stendur er umferð ökutækja og fjöldi einstaklinga að vinnu á flugvellinum verulega takmörkuð. Athugið að einstaklingum er <strong>EKKI</strong> heimilt að ganga frá silfurhliði að þjónustuhúsi á meðan aðgerðir eru virkar.
        </div>`;
    
      datisEl.innerHTML = statusLine + procedureInfo;
      datisEl.className = 'datis-banner lvo-active';
      datisEl.style.display = 'block';
    } else {
      datisEl.innerHTML = '';
      datisEl.className = '';
      datisEl.style.display = 'none'; 
    }

  } catch (error) {
    console.error("DATIS API error:", error.message || error);
    alert("DATIS API error: " + (error.message || error));
    document.getElementById('datis').innerText = "Failed to load DATIS.";
  }
}

/*async function getViewMondoData() {
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

    // Helper to find values by sensor name
    const findValByName = (name) => {
      const entry = values.find(val => {
        const meta = channelMap[val.SensorChannelId];
        return meta?.name === name;
      });
      const meta = entry ? channelMap[entry.SensorChannelId] : null;
      if (entry && meta) {
        const decimals = ["Air Temperature", "Dew Point", "Rel. Humidity"].includes(meta.name) ? 1 : 2;
        return `${entry.Value.toFixed(decimals)} ${meta.unit}`;
      }
      return "N/A";
    };
    

    const airTemp = findValByName("Air Temperature");
    const dewPoint = findValByName("Dew Point");
    const humidity = findValByName("Rel. Humidity");

    // Populate first column
    const leftEl = document.getElementById('viewmondo-left');
    if (leftEl) {
      leftEl.innerHTML = `
        <div class="weather-row"><span class="label">Air Temp:</span><span class="value">${airTemp}</span></div>
        <div class="weather-row"><span class="label">Dew Point:</span><span class="value">${dewPoint}</span></div>
        <div class="weather-row"><span class="label">RH:</span><span class="value">${humidity}</span></div>
      `;
    }

    // Still show all data in full section
    const viewMondoEl = document.getElementById('viewmondo');
    const displayedRows = values.map(val => {
      const meta = channelMap[val.SensorChannelId];
      if (!meta) return null;

      let valueDisplay = "N/A";
      if (val.Value != null) {
        const rounded = ["Air Temperature", "Dew Point", "Rel. Humidity"].includes(meta.name)
          ? val.Value.toFixed(1)
          : val.Value.toFixed(2);
        valueDisplay = `${rounded} ${meta.unit}`;
      }      
      const status = val.StatusText ? ` (${val.StatusText})` : "";
      return `<div class="weather-row"><span class="label">${meta.name}:</span><span class="value">${valueDisplay}${status}</span></div>`;
    }).filter(Boolean).join("");

    viewMondoEl.innerHTML = `
      <h3>ViewMondo – ${station.StationName}</h3>
      ${displayedRows}
    `;

  } catch (error) {
    console.error("ViewMondo error:", error.message || error);
    document.getElementById('viewmondo').innerText = "Failed to load ViewMondo data.";
  }
}*/

function refreshData() {
  getWeather();
  getDatis();
  //getViewMondoData();

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const dateStr = now.toLocaleDateString('en-GB', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
  document.getElementById('last-updated').innerText = `Last updated: ${dateStr}, ${timeStr}`;
  
}

window.onload = function() {
  refreshData();                      // initial load
  setInterval(refreshData, 30000);    // every 30 seconds
};