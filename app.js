const API_KEY = window.WEATHER_API_KEY || "";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const RECENT_CITIES_KEY = "recentWeatherCities";
const BASE_BODY_CLASS = "min-h-screen text-slate-900";

const weatherForm = document.getElementById("weather-form");
const cityInput = document.getElementById("city");
const statusText = document.getElementById("status");
const locationBtn = document.getElementById("current-location-btn");
const recentWrapper = document.getElementById("recent-wrapper");
const recentCitiesSelect = document.getElementById("recent-cities");
const appBody = document.getElementById("app-body");

const cityOutput = document.getElementById("result-city");
const conditionOutput = document.getElementById("result-condition");
const weatherIcon = document.getElementById("weather-icon");
const tempOutput = document.getElementById("result-temp");
const humidityOutput = document.getElementById("result-humidity");
const windOutput = document.getElementById("result-wind");
const extremeAlert = document.getElementById("extreme-alert");
const unitCBtn = document.getElementById("unit-c");
const unitFBtn = document.getElementById("unit-f");

let currentUnit = "C";
let lastWeatherData = null;

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
  lastWeatherData = data;
  cityOutput.textContent = `${data.name}, ${data.sys.country}`;
  conditionOutput.textContent = data.weather[0].description;
  updateTemperatureDisplay();
  humidityOutput.textContent = `${data.main.humidity}%`;
  windOutput.textContent = `${data.wind.speed} m/s`;
  setWeatherIcon(data.weather[0].icon, data.weather[0].main);
  updateExtremeAlert(data.main.temp);
  setDynamicBackground(data.weather[0].main);
}

function updateTemperatureDisplay() {
  if (!lastWeatherData) {
    tempOutput.textContent = "--";
    return;
  }

  const tempC = lastWeatherData.main.temp;
  if (currentUnit === "F") {
    const tempF = (tempC * 9) / 5 + 32;
    tempOutput.textContent = `${tempF.toFixed(1)} F`;
    return;
  }

  tempOutput.textContent = `${tempC.toFixed(1)} C`;
}

function updateUnitButtons() {
  if (currentUnit === "C") {
    unitCBtn.className = "rounded-l-lg bg-slate-900 px-2 py-1 font-semibold text-white";
    unitFBtn.className = "rounded-r-lg px-2 py-1 font-semibold text-slate-700";
    return;
  }

  unitCBtn.className = "rounded-l-lg px-2 py-1 font-semibold text-slate-700";
  unitFBtn.className = "rounded-r-lg bg-slate-900 px-2 py-1 font-semibold text-white";
}

function setWeatherIcon(iconCode, mainCondition) {
  if (!iconCode) {
    weatherIcon.classList.add("hidden");
    return;
  }
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIcon.alt = `${mainCondition} icon`;
  weatherIcon.classList.remove("hidden");
}

function updateExtremeAlert(tempCelsius) {
  if (tempCelsius > 40) {
    extremeAlert.classList.remove("hidden");
    return;
  }
  extremeAlert.classList.add("hidden");
}

function setDynamicBackground(mainCondition = "") {
  const condition = mainCondition.toLowerCase();
  let gradientClass = "bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700";

  if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("thunderstorm")) {
    gradientClass = "bg-gradient-to-br from-slate-700 via-blue-900 to-slate-900";
  } else if (condition.includes("clear")) {
    gradientClass = "bg-gradient-to-br from-amber-400 via-orange-500 to-sky-600";
  } else if (condition.includes("cloud")) {
    gradientClass = "bg-gradient-to-br from-slate-400 via-slate-600 to-blue-700";
  }

  appBody.className = `${BASE_BODY_CLASS} ${gradientClass}`;
}

function getRecentCities() {
  const stored = localStorage.getItem(RECENT_CITIES_KEY);
  if (!stored) {
    return [];
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecentCities(cities) {
  localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(cities));
}

function addRecentCity(city) {
  const normalized = city.trim();
  if (!normalized) return;

  const existing = getRecentCities().filter(
    (item) => item.toLowerCase() !== normalized.toLowerCase()
  );
  const updated = [normalized, ...existing].slice(0, 5);
  saveRecentCities(updated);
  renderRecentCities();
}

function renderRecentCities() {
  const cities = getRecentCities();
  if (cities.length === 0) {
    recentWrapper.classList.add("hidden");
    recentCitiesSelect.innerHTML = '<option value="">Select a city</option>';
    return;
  }

  recentWrapper.classList.remove("hidden");
  recentCitiesSelect.innerHTML = '<option value="">Select a city</option>';
  cities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentCitiesSelect.appendChild(option);
  });
}

function clearWeatherOutput() {
  cityOutput.textContent = "--";
  conditionOutput.textContent = "--";
  tempOutput.textContent = "--";
  humidityOutput.textContent = "--";
  windOutput.textContent = "--";
  weatherIcon.classList.add("hidden");
  extremeAlert.classList.add("hidden");
  lastWeatherData = null;
}

async function fetchWeatherByCity(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok || data.cod !== 200) {
    throw new Error(data.message || "Unable to fetch weather for this city.");
  }

  return data;
}

async function fetchWeatherByCoordinates(lat, lon) {
  const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok || data.cod !== 200) {
    throw new Error(data.message || "Unable to fetch weather for current location.");
  }

  return data;
}

async function handleCityWeatherSearch(city) {
  const cleanedCity = city.trim();
  if (!cleanedCity) {
    setStatus("Please enter a city name.", "error");
    return false;
  }
  if (!/^[a-zA-Z\s.-]{2,}$/.test(cleanedCity)) {
    setStatus("Enter a valid city name (letters only).", "error");
    return false;
  }

  setStatus("Loading weather data...", "loading");

  try {
    const weatherData = await fetchWeatherByCity(cleanedCity);
    setWeatherValues(weatherData);
    addRecentCity(weatherData.name);
    setStatus("Weather data loaded.", "success");
    return true;
  } catch (error) {
    clearWeatherOutput();
    setStatus(error.message, "error");
    return false;
  }
}

weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!API_KEY) {
    setStatus("API key missing. Add WEATHER_API_KEY in config.js", "error");
    return;
  }
  await handleCityWeatherSearch(cityInput.value);
});

locationBtn.addEventListener("click", async () => {
  if (!API_KEY) {
    setStatus("API key missing. Add WEATHER_API_KEY in config.js", "error");
    return;
  }
  if (!navigator.geolocation) {
    setStatus("Geolocation is not supported in this browser.", "error");
    return;
  }

  setStatus("Fetching your current location...", "loading");
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const weatherData = await fetchWeatherByCoordinates(latitude, longitude);
        setWeatherValues(weatherData);
        addRecentCity(weatherData.name);
        setStatus("Weather loaded for your current location.", "success");
      } catch (error) {
        clearWeatherOutput();
        setStatus(error.message, "error");
      }
    },
    () => {
      setStatus("Location permission denied or unavailable.", "error");
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

recentCitiesSelect.addEventListener("change", async (event) => {
  const selectedCity = event.target.value;
  if (!selectedCity) return;
  cityInput.value = selectedCity;
  await handleCityWeatherSearch(selectedCity);
});

unitCBtn.addEventListener("click", () => {
  currentUnit = "C";
  updateUnitButtons();
  updateTemperatureDisplay();
});

unitFBtn.addEventListener("click", () => {
  currentUnit = "F";
  updateUnitButtons();
  updateTemperatureDisplay();
});

updateUnitButtons();
renderRecentCities();
