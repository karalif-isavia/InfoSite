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

    // Runway temperatures (commented out)
    // const rwyTemps = data.Sensors.TempRwy.Parameters.reduce((acc, param) => {
    //   acc[param.Name] = param.Value;
    //   return acc;
    // }, {});

    // const formatRWY = (name, wind, tempKey) => {
    //   const speed = wind?.Speed?.Value ?? "N/A";
    //   const dir = wind?.Direction?.Value ?? "N/A";
    //   const gust = wind?.Speed10MinutesMax?.Value ?? "N/A";
    //   const rwyTemp = rwyTemps[tempKey] ?? "N/A";
    //   return `RWY ${name}: ${speed} kts from direction ${dir}°, RW Temp ${rwyTemp}°C and gusts at ${gust} kts`;
    // };

    const avg = arr => arr.reduce((sum, val) => sum + parseFloat(val), 0) / arr.length;
    const windSpeedAvg = avg(windSensors.map(w => w?.Speed?.Value ?? 0)).toFixed(1);
    const gustAvg = avg(windSensors.map(w => w?.Speed10MinutesMax?.Value ?? 0)).toFixed(1);
    const windDirRWY19 = wind19?.Direction?.Value ?? "N/A";

    document.getElementById('weather').innerHTML = `
    <div class="weather-columns">
      <div class="weather-left">
        <strong>Weather Information</strong><br>
        Temp: ${temp}°C<br>
        Dew: ${dew}°C<br>
        RH: ${rh}%
      </div>
  
      <div class="weather-picture">
        <img id="weather-icon" src="" alt="Weather Icon" class="weather-icon" />
      </div>
  
      <div class="weather-right">
        <strong>Wind</strong><br>
        Avg Speed: ${windSpeedAvg} kts<br>
        Gust: ${gustAvg} kts<br>
        Direction (RWY 19): ${windDirRWY19}°
      </div>
  
      <div class="weather-arrow">
        <div class="arrow-visual" style="transform: rotate(${parseFloat(windDirRWY19) - 90}deg);"></div>
      </div>
    </div>
  `;
  
  

  } catch (error) {
    console.error("Weather API error:", error.message || error);
    alert("Weather API error: " + (error.message || error));
    document.getElementById('weather').innerText = "Failed to load weather.";
  }
}


async function fetchWeatherIcon() {
  const latitude = 63.985; // Keflavík Airport latitude
  const longitude = -22.605; // Keflavík Airport longitude
  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weathercode&timezone=auto`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const weatherCode = data.current.weathercode;

    // Map the weather code to an appropriate icon
    const iconUrl = mapWeatherCodeToIcon(weatherCode);

    // Update the image source in your HTML
    document.getElementById('weather-icon').src = iconUrl;
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

function mapWeatherCodeToIcon(code) {
  const weatherIcons = {
    0: 'icons/clear.png',            // Clear sky
    1: 'icons/mainly_clear.png',     // Mainly clear
    2: 'icons/partly_cloudy.png',    // Partly cloudy
    3: 'icons/overcast.png',         // Overcast
    45: 'icons/fog.png',             // Fog
    48: 'icons/depositing_rime_fog.png', // Depositing rime fog
    51: 'icons/light_drizzle.png',   // Light drizzle
    53: 'icons/moderate_drizzle.png',// Moderate drizzle
    55: 'icons/dense_drizzle.png',   // Dense drizzle
    61: 'icons/slight_rain.png',     // Slight rain
    63: 'icons/moderate_rain.png',   // Moderate rain
    65: 'icons/heavy_rain.png',      // Heavy rain
    71: 'icons/slight_snow.png',     // Slight snow
    73: 'icons/moderate_snow.png',   // Moderate snow
    75: 'icons/heavy_snow.png',      // Heavy snow
    95: 'icons/thunderstorm.png',    // Thunderstorm
    // Add more mappings as needed
  };

  return weatherIcons[code] || 'icons/default.png'; // Fallback icon
}

window.onload = function() {
  fetchWeatherIcon();
};


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
    const timeZulu = rawTimestamp ? `${rawTimestamp[1].slice(0, 2)}:${rawTimestamp[1].slice(2)}Z` : "Time N/A";

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
            <strong> 🚨 Lágskyggnisástand til staðar samkvæmt ATIS ${atisLetter}, gefið út síðast kl. (${timeZulu}) 🚨</strong>
        </span>`
      : `<span class="status-line">
            <strong> Lágskyggnisástand ekki til staðar samkvæmt ATIS ${atisLetter}, gefið út síðast kl. (${timeZulu})</strong>
        </span>`;

    // Info text about LVP procedures
    const procedureInfo = `
      <div class="procedure-info">
        <strong>6.12 Lágskyggnis aðgerðir:</strong> Sérstakt verklag er virkjað fyrir lágskyggni. Á meðan því stendur er umferð ökutækja og fjöldi einstaklinga að vinnu á flugvellinum verulega takmörkuð. Athugið að einstaklingum er <strong>EKKI</strong> heimilt að ganga frá silfurhliði að þjónustuhúsi á meðan lágskyggni aðgerðir eru virkar.
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


getWeather();
getDatis();