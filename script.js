// Clock only - Digital style
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

// Working version from open meteo API
/*async function getWeather() {
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=64.13&longitude=-21.9&current_weather=true');
    const data = await response.json();
    const weather = data.current_weather;
    document.getElementById('weather').innerText =
      `Weather in Reykjavík:\nTemperature: ${weather.temperature}°C\nWind: ${weather.windspeed} km/h`;
  } catch (error) {
    document.getElementById('weather').innerText = "Failed to load weather.";
  }
}*/

// Working version from AWOS using site proxy, only wind speed and direction
/*async function getWeather() {
  try {
    const response = await fetch('https://site-proxy-m4fs.onrender.com/weather');
    const json = await response.json();

    const windSensor = json.data.Sensors.Wind.find(w => w.Id === "Wind01");
    const windSpeed = windSensor?.Speed?.Value ?? "N/A";
    const windDir = windSensor?.Direction?.Value ?? "N/A";

    document.getElementById('weather').innerHTML = `
      <strong>Wind at Keflavík Airport:</strong><br>
      Wind Speed: ${windSpeed} kts<br>
      Wind Direction: ${windDir}°
    `;
  } catch (error) {
    console.error("Weather API error:", error.message || error);
    alert("Weather API error: " + (error.message || error));    
    document.getElementById('weather').innerText = "Failed to load weather.";
  }
}*/

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



// ATIS
async function getDatis() {
  try {
    const response = await fetch('https://webdatis.arinc.net/cgi-bin/datis/get_datis?station=BIKF&sessionId=HY618U7T&products=DATIS&arrdep=ARR');
    const text = await response.text();

    const hasLowVis = text.toUpperCase().includes("LOW VIS");
    const visibilityStatus = hasLowVis ? "⚠️ LOW VIS" : "✅ NO LOW VIS";

    document.getElementById('datis').innerText = `${visibilityStatus}\n\n${text}`;
  } catch (error) {
    console.error("DATIS API error:", error.message || error);
    document.getElementById('datis').innerText = "Failed to load DATIS.";
  }
}

getWeather();
getDatis();