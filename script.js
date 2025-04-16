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

// Fetch local weather at Keflavík Airport
async function getWeather() {
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=64.13&longitude=-21.94&current_weather=true');
    const data = await response.json();
    const weather = data.current_weather;
    document.getElementById('weather').innerHTML =
      `<strong>Weather at Keflavík Airport:</strong><br>
       Temperature: ${weather.temperature}°C<br>
       Wind: ${weather.windspeed} km/h`;
  } catch (error) {
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
