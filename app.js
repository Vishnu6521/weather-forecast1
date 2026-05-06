const API_KEY = "78433e7a51c26cb2b0376ef6e91d22d5";
const BASE_URL = "https://api.weatherapi.com/v1/current.json";

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
  cityOutput.textContent = `${data.location.name}, ${data.location.country}`;
  conditionOutput.textContent = data.current.condition.text;
  tempOutput.textContent = `${data.current.temp_c} C`;
  humidityOutput.textContent = `${data.current.humidity}%`;
  windOutput.textContent = `${data.current.wind_kph} kph`;
}

async function fetchWeather(city) {
  const url = `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to fetch weather for this city.");
  }

  return response.json();
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
