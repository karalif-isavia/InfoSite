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

    // Extract ATIS letter (e.g. "C")
    const atisMatch = text.match(/ATIS\s+([A-Z])/i);
    const atisLetter = atisMatch ? atisMatch[1] : "Unknown";

    // Extract the timestamp directly under the ATIS line (e.g. 0823Z → 08:23Z)
    const lines = text.split('\n');
    const atisIndex = lines.findIndex(line => /ATIS\s+[A-Z]/i.test(line));
    const rawTimestamp = lines[atisIndex + 1]?.match(/(\d{4})Z/);
    const timeZulu = rawTimestamp ? `${rawTimestamp[1].slice(0, 2)}:${rawTimestamp[1].slice(2)}Z` : "Time N/A";

    // LVP status banner text
    const statusLine = hasLowVis
      ? `⚠️ <strong>LVO ástand til staðar samkvæmt ATIS ${atisLetter} (${timeZulu})</strong> / <strong>Low Visibility Procedure in place for ATIS ${atisLetter} (${timeZulu})</strong>`
      : `✅ <strong>LVO ástand ekki til staðar samkvæmt ATIS ${atisLetter} (${timeZulu})</strong> / <strong>No Low Visibility Procedure in place for ATIS ${atisLetter} (${timeZulu})</strong>`;

    // Info text about LVP procedures
    const procedureInfo = `
    
<strong>6.12 Lágskyggnis aðgerðir: </strong>
Þegar LVO ástand er til staðar, er sérstakt verklag virkjað fyrir lágskyggni. Á meðan því stendur er umferð ökutækja verulega takmörkuð á umferðarsvæði flugvallarins og fjöldi einstaklinga og ökutækja að vinnu á flughlöðum takmarkaður að nauðsynlegu lágmarki. Athugið að einstaklingum er <strong>EKKI</strong> heimilt að ganga frá silfurhliði að þjónustuhúsi á meðan lágskyggni aðgerðir eru virkar.
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