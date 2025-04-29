// Time
function updateTime() {
  const now = new Date();

  const timeStr = now.toLocaleTimeString('en-GB', {
    timeZone: 'Atlantic/Reykjavik',
    hour12: false
  });

  // Icelandic weekdays and months
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

    // Temperature, dew point, humidity
    const tempParams = data.Sensors.Temperature.Parameters;
    const temp = tempParams.find(p => p.Name === "Temp")?.Value ?? "N/A";
    const dew = tempParams.find(p => p.Name === "Dew")?.Value ?? "N/A";
    const rh = tempParams.find(p => p.Name === "RH")?.Value ?? "N/A";

    // Wind sensors
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

      <!-- MOVE arrow column here as column 3 -->
      <div class="weather-arrow">
        <div class="arrow-visual" style="transform: rotate(${parseFloat(windDirRWY19) - 90}deg);"></div>
      </div>
  
      <!-- MOVE wind info to column 4 -->
      <div class="weather-right weather-block">
        <div class="weather-row"><span class="label">Avg Speed:</span><span class="value">${windSpeedAvg} kts</span></div>
        <div class="weather-row"><span class="label">Gust:</span><span class="value">${gustAvg} kts</span></div>
        <div class="weather-row"><span class="label">Direction (19):</span><span class="value">${windDirRWY19}°</span></div>
      </div>
    </div>
  `;
  
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

    // Clear all previous classes (important!)
    weatherIconEl.className = 'wi weather-icon'; 

    // Then add the new weather icon class
    weatherIconEl.classList.add(iconClass);
  } catch (error) {
    console.error("Error fetching weather icon:", error);
    document.getElementById('weather-icon').className = "wi wi-na"; // fallback
  }
}



function mapWeatherCodeToIcon(code) {
  const iconMap = {
    0: "wi-day-sunny",             // Clear sky
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

  return iconMap[code] || "wi-na"; // fallback
}


// ATIS
async function getDatis() {
  try {
    const response = await fetch('https://site-proxy-m4fs.onrender.com/datis');
    const text = await response.text();

    //const hasLowVis = text.toUpperCase().includes("LOW VIS");
    const hasLowVis = text.toUpperCase().includes("BIKF");

    // Extract ATIS letter (e.g. "C")
    const atisMatch = text.match(/ATIS\s+([A-Z])/i);
    const atisLetter = atisMatch ? atisMatch[1] : "Unknown";

    // Extract the timestamp directly under the ATIS line (e.g. 0823Z → 08:23Z)
    const lines = text.split('\n');
    const atisIndex = lines.findIndex(line => /ATIS\s+[A-Z]/i.test(line));
    const rawTimestamp = lines[atisIndex + 1]?.match(/(\d{4})Z/);
    const timeZulu = rawTimestamp ? `${rawTimestamp[1].slice(0, 2)}:${rawTimestamp[1].slice(2)}` : "Time N/A";

    // LVP status banner text
    /*const statusLine = hasLowVis
    ? `<span class="status-line">
          <img src="https://flagcdn.com/w40/is.png" alt="IS" class="flag-icon"> <strong> Lágskyggnisástand til staðar samkvæmt ATIS ${atisLetter} (${timeZulu})</strong>
          <img src="https://flagcdn.com/w40/gb.png" alt="GB" class="flag-icon"> <strong> Low Visibility Procedure in place for ATIS ${atisLetter} (${timeZulu})</strong>
       </span>`
    : `<span class="status-line">
          <img src="https://flagcdn.com/w40/is.png" alt="IS" class="flag-icon"><strong> Lágskyggnisástand ekki til staðar samkvæmt ATIS ${atisLetter} (${timeZulu})</strong>
          <img src="https://flagcdn.com/w40/gb.png" alt="GB" class="flag-icon"><strong> No Low Visibility Procedure in place for ATIS ${atisLetter} (${timeZulu})</strong>
       </span>`;
  */
      const statusLine = hasLowVis
      ? `<span class="status-line">
            <strong> 🚨 Lágskyggnisástand til staðar samkvæmt ATIS ${atisLetter}, gefið út síðast kl. ${timeZulu} 🚨</strong>
        </span>`
      : `<span class="status-line">
            <strong> Lágskyggnisástand ekki til staðar samkvæmt ATIS ${atisLetter}, gefið út síðast kl. ${timeZulu}</strong>
        </span>`;

    // Info text about LVP procedures
    const procedureInfo = `
      <div class="procedure-info">
        <strong>6.12 Lágskyggnis aðgerðir:</strong> Sérstakt verklag er virkjað fyrir lágskyggni. Á meðan því stendur er umferð ökutækja og fjöldi einstaklinga að vinnu á flugvellinum verulega takmörkuð. Athugið að einstaklingum er <strong>EKKI</strong> heimilt að ganga frá silfurhliði að þjónustuhúsi á meðan aðgerðir eru virkar.
    `;
  
    // Update content
    const datisEl = document.getElementById('datis');
    datisEl.innerHTML = statusLine + procedureInfo;

    // Update styling class
    datisEl.className = hasLowVis ? 'datis-banner lvo-active' : 'datis-banner lvo-inactive';

  } catch (error) {
    console.error("DATIS API error:", error.message || error);
    alert("DATIS API error: " + (error.message || error));
    document.getElementById('datis').innerText = "Failed to load DATIS.";
  }
}


window.onload = function() {
  getWeather();
  getDatis();
};
