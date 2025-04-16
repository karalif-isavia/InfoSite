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

// Weather using AWOS API from Keflavík Airport
async function getWeather() {
  try {
    //const response = await fetch('https://awos.kefairport.is/api/Values/');

    // Using a CORS proxy to bypass CORS issues, might be an issue later on
    const response = await fetch('https://corsproxy.io/?https://awos.kefairport.is/api/Values/');

    const json = await response.json();
    const data = json.data;

    // Extract temperature data
    const tempParams = data.Sensors.Temperature.Parameters;
    const temp = tempParams.find(p => p.Name === "Temp")?.Value ?? "N/A";
    const dew = tempParams.find(p => p.Name === "Dew")?.Value ?? "N/A";
    const rh = tempParams.find(p => p.Name === "RH")?.Value ?? "N/A";

    // Extract pressure
    const pressure = data.Sensors.Pressure.Parameters.find(p => p.Name === "QNH")?.Value ?? "N/A";

    // Extract wind from Wind01 sensor
    const windSensor = data.Sensors.Wind.find(w => w.Id === "Wind01");
    const windDir = windSensor?.Direction?.Value ?? "N/A";
    const windSpeed = windSensor?.Speed?.Value ?? "N/A";
    const windUnit = windSensor?.Speed?.Unit ?? "kts";

    document.getElementById('weather').innerHTML = `
      <strong>Live Weather at Keflavík Airport:</strong><br>
      Temperature: ${temp}°C<br>
      Dew Point: ${dew}°C<br>
      Humidity: ${rh}%<br>
      Pressure: ${pressure} hPa<br>
      Wind: ${windSpeed} ${windUnit} from ${windDir}°
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