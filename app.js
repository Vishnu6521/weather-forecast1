const API_KEY = window.WEATHER_API_KEY || "";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const weatherForm = document.getElementById("weather-form");
const cityInput = document.getElementById("city");
const statusText = document.getElementById("status");

const cityOutput = document.getElementById("result-city");
const conditionOutput = document.getElementById("result-condition");
const tempOutput = document.getElementById("result-temp");
const humidityOutput = document.getElementById("result-humidity");
const windOutput = document.getElementById("result-wind");

function setStatus(message, type = "info") {
  statusText.textContent = message;
  const statusClassMap = {
    info: "border-slate-200 bg-slate-50 text-slate-700",
    loading: "border-blue-200 bg-blue-50 text-blue-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    error: "border-rose-200 bg-rose-50 text-rose-700"
  };

  const colorClasses = statusClassMap[type] || statusClassMap.info;
  statusText.className =
    `mt-4 min-h-10 rounded-xl border px-3 py-2 text-sm sm:px-4 sm:text-base ${colorClasses}`;
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

  if (!API_KEY) {
    setStatus("API key missing. Add WEATHER_API_KEY in config.js", "error");
    return;
  }

  const city = cityInput.value.trim();
  if (!city) {
    setStatus("Please enter a city name.", "error");
    return;
  }

  setStatus("Loading weather data...", "loading");

  try {
    const weatherData = await fetchWeather(city);
    setWeatherValues(weatherData);
    setStatus("Weather data loaded.", "success");
  } catch (error) {
    cityOutput.textContent = "--";
    conditionOutput.textContent = "--";
    tempOutput.textContent = "--";
    humidityOutput.textContent = "--";
    windOutput.textContent = "--";
    setStatus(error.message, "error");
  }
});
