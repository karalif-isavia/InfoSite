// Clock only - Digital style
function updateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-GB', {
    timeZone: 'Atlantic/Reykjavik',
    hour12: false
  });
  document.getElementById('time').innerText = timeStr;
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

    // Main wind sensor
    const wind01 = json.data.Sensors.Wind.find(w => w.Id === "Wind01");
    const windSpeed01 = wind01?.Speed?.Value ?? "N/A";
    const windDir01 = wind01?.Direction?.Value ?? "N/A";

    // Runway-specific wind sensors
    const wind10 = json.data.Sensors.Wind.find(w => w.Id === "Wind10");
    const wind19 = json.data.Sensors.Wind.find(w => w.Id === "Wind19");
    const wind28 = json.data.Sensors.Wind.find(w => w.Id === "Wind28");

    const windSpeed10 = wind10?.Speed?.Value ?? "N/A";
    const windDir10 = wind10?.Direction?.Value ?? "N/A";

    const windSpeed19 = wind19?.Speed?.Value ?? "N/A";
    const windDir19 = wind19?.Direction?.Value ?? "N/A";

    const windSpeed28 = wind28?.Speed?.Value ?? "N/A";
    const windDir28 = wind28?.Direction?.Value ?? "N/A";

    document.getElementById('weather').innerHTML = `
      <strong>Wind at Keflavík Airport:</strong><br>
      Wind01: ${windSpeed01} kts from ${windDir01}°<br><br>

      <strong>Runway Winds:</strong><br>
      RWY 10: ${windSpeed10} kts from ${windDir10}°<br>
      RWY 19: ${windSpeed19} kts from ${windDir19}°<br>
      RWY 28: ${windSpeed28} kts from ${windDir28}°<br>
    `;
  } catch (error) {
    console.error("Weather API error:", error.message || error);
    alert("Weather API error: " + (error.message || error));
    document.getElementById('weather').innerText = "Failed to load weather.";
  }
}

// DATIS
async function getDatis() {
  try {
    const response = await fetch('https://webdatis.arinc.net/cgi-bin/datis/get_datis?station=BIKF&sessionId=HY618U7T&products=DATIS&arrdep=ARR');
    const text = await response.text();
    document.getElementById('datis').innerText = "DATIS Info:\n" + text;
  } catch (error) {
    document.getElementById('datis').innerText = "Failed to load DATIS.";
  }
}

getWeather();
getDatis();