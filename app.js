const API_KEY = "78433e7a51c26cb2b0376ef6e91d22d5";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const weatherForm = document.getElementById("weather-form");
const cityInput = document.getElementById("city");
const statusText = document.getElementById("status");

const cityOutput = document.getElementById("result-city");
const conditionOutput = document.getElementById("result-condition");
const tempOutput = document.getElementById("result-temp");
const humidityOutput = document.getElementById("result-humidity");
const windOutput = document.getElementById("result-wind");

function setStatus(message) {
  statusText.textContent = message;
}

function setWeatherValues(data) {
  cityOutput.textContent = `${data.name}, ${data.sys.country}`;
  conditionOutput.textContent = data.weather[0].description;
  tempOutput.textContent = `${data.main.temp} C`;
  humidityOutput.textContent = `${data.main.humidity}%`;
  windOutput.textContent = `${data.wind.speed} m/s`;
}

async function fetchWeather(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok || data.cod !== 200) {
    throw new Error(data.message || "Unable to fetch weather for this city.");
  }

  return data;
}

weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (!city) {
    setStatus("Please enter a city name.");
    return;
  }

  setStatus("Loading weather data...");

  try {
    const weatherData = await fetchWeather(city);
    setWeatherValues(weatherData);
    setStatus("Weather data loaded.");
  } catch (error) {
    setStatus(error.message);
  }
});
