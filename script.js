// Time
function updateTime() {
  const now = new Date();

  const timeStr = now.toLocaleTimeString('en-GB', {
    timeZone: 'Atlantic/Reykjavik',
    hour12: false
  });

  const dateStr = now.toLocaleDateString('en-GB', {
    timeZone: 'Atlantic/Reykjavik',
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  document.getElementById('time').innerText = timeStr;
  document.getElementById('date').innerText = dateStr;
}

setInterval(updateTime, 1000);
updateTime();


// Weather
/*async function getWeather() {
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
    const wind01 = data.Sensors.Wind.find(w => w.Id === "Wind01");
    const wind10 = data.Sensors.Wind.find(w => w.Id === "Wind10");
    const wind19 = data.Sensors.Wind.find(w => w.Id === "Wind19");
    const wind28 = data.Sensors.Wind.find(w => w.Id === "Wind28");

    const windSpeed01 = wind01?.Speed?.Value ?? "N/A";
    const windDir01 = wind01?.Direction?.Value ?? "N/A";

    const windSpeed10 = wind10?.Speed?.Value ?? "N/A";
    const windDir10 = wind10?.Direction?.Value ?? "N/A";

    const windSpeed19 = wind19?.Speed?.Value ?? "N/A";
    const windDir19 = wind19?.Direction?.Value ?? "N/A";

    const windSpeed28 = wind28?.Speed?.Value ?? "N/A";
    const windDir28 = wind28?.Direction?.Value ?? "N/A";

    // Update the weather section (including compass container)
    document.getElementById('weather').innerHTML = `
      <strong>Atmospheric Conditions:</strong>
      Temperature: ${temp}°C<br>
      Dew Point: ${dew}°C<br>
      Humidity: ${rh}%<br><br>

      <strong>Runway Winds:</strong>
      RWY 01: ${windSpeed01} kts from ${windDir01}°<br>
      RWY 10: ${windSpeed10} kts from ${windDir10}°<br>
      RWY 19: ${windSpeed19} kts from ${windDir19}°<br>
      RWY 28: ${windSpeed28} kts from ${windDir28}°<br><br>

      <div id="wind-compass" class="compass">
        <div class="arrow" id="wind-arrow"></div>
      </div>
    `;

    // Now rotate the arrow (after the DOM is updated)
    document.getElementById('wind-arrow').style.transform = `rotate(${windDir01}deg)`;
    
  } catch (error) {
    console.error("Weather API error:", error.message || error);
    alert("Weather API error: " + (error.message || error));
    document.getElementById('weather').innerText = "Failed to load weather.";
  }
}
*/

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

    // Pressure
    const pressure = data.Sensors.Pressure.Parameters.find(p => p.Name === "QNH")?.Value ?? "N/A";

    // Wind sensors
    const getWind = id => data.Sensors.Wind.find(w => w.Id === id) || {};
    const wind01 = getWind("Wind01");
    const wind10 = getWind("Wind10");
    const wind19 = getWind("Wind19");
    const wind28 = getWind("Wind28");

    // Runway temperatures
    const rwyTemps = data.Sensors.TempRwy.Parameters.reduce((acc, param) => {
      acc[param.Name] = param.Value;
      return acc;
    }, {});

    // Helper to extract values cleanly
    const formatRWY = (name, wind, tempKey) => {
      const speed = wind?.Speed?.Value ?? "N/A";
      const dir = wind?.Direction?.Value ?? "N/A";
      const gust = wind?.Speed10MinutesMax?.Value ?? "N/A";
      const rwyTemp = rwyTemps[tempKey] ?? "N/A";
      return `RWY ${name}: ${speed} kts from direction ${dir}°, RW Temperature ${rwyTemp}°C and gusts at ${gust} kts`;
    };

    document.getElementById('weather').innerHTML = `
      <strong>Atmospheric Conditions:</strong>
      Temperature: ${temp}°C<br>
      Dew Point: ${dew}°C<br>
      Humidity: ${rh}%<br>
      Pressure: ${pressure} hPa<br><br>

      <strong>Runway Winds & Temps:</strong><br>
      ${formatRWY("01", wind01, "RWY Temp 01")}<br>
      ${formatRWY("10", wind10, "RWY Temp 10")}<br>
      ${formatRWY("19", wind19, "RWY Temp 19")}<br>
      ${formatRWY("28", wind28, "RWY Temp 28")}<br><br>

      <div id="wind-compass" class="compass">
        <div class="arrow" id="wind-arrow"></div>
      </div>
    `;

    // Rotate compass for RWY 01 (main direction indicator)
    const windDir01 = wind01?.Direction?.Value ?? 0;
    document.getElementById('wind-arrow').style.transform = `rotate(${windDir01}deg)`;

  } catch (error) {
    console.error("Weather API error:", error.message || error);
    alert("Weather API error: " + (error.message || error));
    document.getElementById('weather').innerText = "Failed to load weather.";
  }
}


// ATIS
async function getDatis() {
  try {
    const response = await fetch('https://site-proxy-m4fs.onrender.com/datis');
    const text = await response.text();

    const hasLowVis = text.toUpperCase().includes("LOW VIS");
    const visibilityStatus = hasLowVis ? "⚠️ LOW VIS" : "✅ NO LOW VIS";

    document.getElementById('datis').innerText = `${visibilityStatus}\n\n${text}`;
  } catch (error) {
    console.error("DATIS API error:", error.message || error);
    alert("DATIS API error: " + (error.message || error));
    document.getElementById('datis').innerText = "Failed to load DATIS.";
  }
}


getWeather();
getDatis();