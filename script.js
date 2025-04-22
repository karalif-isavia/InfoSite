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
      return `RWY ${name}: ${speed} kts from direction ${dir}°, RW Temp ${rwyTemp}°C and gusts at ${gust} kts`;
    };

    document.getElementById('weather').innerHTML = `
      <strong>Atmospheric Conditions:</strong>
      Temperature: ${temp}°C<br>
      Dew Point: ${dew}°C<br>
      Humidity: ${rh}%<br>

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

    // Extract ATIS letter (e.g., "ATIS C") and timestamp (e.g., "0823Z")
    const atisMatch = text.match(/ATIS\s+([A-Z])/i);
    const timeMatch = text.match(/(\d{4})Z/);

    const atisLetter = atisMatch ? atisMatch[1] : "Unknown";
    const timeZulu = timeMatch ? `${timeMatch[1].slice(0, 2)}:${timeMatch[1].slice(2)}Z` : "Time N/A";

    const status = hasLowVis
      ? `⚠️ Low Visibility Procedure in place for ATIS ${atisLetter} (${timeZulu})`
      : `✅ No Low Visibility Procedure in place for ATIS ${atisLetter} (${timeZulu})`;

    document.getElementById('datis').innerText = status;
  } catch (error) {
    console.error("DATIS API error:", error.message || error);
    alert("DATIS API error: " + (error.message || error));
    document.getElementById('datis').innerText = "Failed to load DATIS.";
  }
}

getWeather();
getDatis();