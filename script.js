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

// Weather
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

async function getWeather() {
  try {
    const response = await fetch('https://site-proxy-m4fs.onrender.com/weather');
    const json = await response.json();

    const results = json.results;

    const windSpeedEntry = results.find(r => r.sensor_id === 117 && r.name === "Wind Speed");
    const windDirEntry = results.find(r => r.sensor_id === 117 && r.name === "Wind Direction");

    const windSpeed = windSpeedEntry?.value ?? "N/A";
    const windDir = windDirEntry?.value ?? "N/A";

    document.getElementById('weather').innerHTML = `
      <strong>Wind at Keflavík Airport:</strong><br>
      Wind Speed: ${windSpeed} m/s<br>
      Wind Direction: ${windDir}°
    `;
  } catch (error) {
    console.error("Weather API error:", error);
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