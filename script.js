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

    const windSensor = json.data.Sensors.Wind.find(w => w.Id === "Wind01");
    const windSpeed = windSensor?.Speed?.Value ?? "N/A";
    const windDir = windSensor?.Direction?.Value ?? "N/A";

    const tempParams = json.data.Sensors.Temperature.Parameters;
    const temp = tempParams.find(p => p.Name === "Temp")?.Value ?? "N/A";
    const dew = tempParams.find(p => p.Name === "Dew")?.Value ?? "N/A";
    const rh = tempParams.find(p => p.Name === "RH")?.Value ?? "N/A";

    const pressure = json.data.Sensors.Pressure.Parameters.find(p => p.Name === "QNH")?.Value ?? "N/A";

    document.getElementById('weather').innerHTML = `
      <strong>Wind at Keflavík Airport:</strong><br>
      Wind Speed (Wind01): ${windSpeed} kts<br>
      Wind Direction: ${windDir}°<br><br>
      
      <strong>Atmospheric Conditions:</strong><br>
      Temperature: ${temp}°C<br>
      Dew Point: ${dew}°C<br>
      Humidity: ${rh}%<br>
      Pressure (QNH): ${pressure} hPa
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