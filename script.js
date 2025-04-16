// Show local time in Iceland
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
  
  // Fetch local weather in Iceland using Open-Meteo API (no API key needed)
  async function getWeather() {
    try {
      const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=64.13&longitude=-21.9&current_weather=true');
      const data = await response.json();
      const weather = data.current_weather;
      document.getElementById('weather').innerText = `Weather in Reykjavík: ${weather.temperature}°C, Wind ${weather.windspeed} km/h`;
    } catch (error) {
      document.getElementById('weather').innerText = "Failed to load weather.";
    }
  }
  
  getWeather();
  
  // Fetch DATIS content
  async function getDatis() {
    try {
      const response = await fetch('https://webdatis.arinc.net/cgi-bin/datis/get_datis?station=BIKF&sessionId=HY618U7T&products=DATIS&arrdep=ARR');
      const text = await response.text();
      document.getElementById('datis').innerText = "DATIS Info:\n" + text;
    } catch (error) {
      document.getElementById('datis').innerText = "Failed to load DATIS.";
    }
  }
  
  getDatis();
  