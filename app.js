const API_KEY = window.WEATHER_API_KEY || "";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
const RECENT_CITIES_KEY = "recentWeatherCities";
const BASE_BODY_CLASS = "min-h-screen text-slate-900";
const PROJECT_REPO_URL = "https://github.com/Vishnu6521/weather-forecast1";

const weatherForm = document.getElementById("weather-form");
const cityInput = document.getElementById("city");
const statusText = document.getElementById("status");
const locationBtn = document.getElementById("current-location-btn");
const recentWrapper = document.getElementById("recent-wrapper");
const recentCitiesSelect = document.getElementById("recent-cities");
const appBody = document.getElementById("app-body");
const forecastCards = document.getElementById("forecast-cards");
const popup = document.getElementById("popup");
const popupContent = document.getElementById("popup-content");
const popupTitle = document.getElementById("popup-title");
const popupMessage = document.getElementById("popup-message");
const popupCloseBtn = document.getElementById("popup-close");

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
let popupTimer = null;

// Updates inline status text below the search controls.
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

// Lightweight custom popup for important errors/info without using alert().
function showPopup(message, type = "error", title = "Error") {
  popupTitle.textContent = title;
  popupMessage.textContent = message;
  popup.classList.remove("hidden");
  popup.classList.add("pointer-events-auto");

  popupContent.className = "rounded-xl border bg-white p-4 shadow-lg";
  if (type === "error") {
    popupContent.classList.add("border-rose-200", "bg-rose-50");
  } else if (type === "success") {
    popupContent.classList.add("border-emerald-200", "bg-emerald-50");
  } else {
    popupContent.classList.add("border-blue-200", "bg-blue-50");
  }

  if (popupTimer) clearTimeout(popupTimer);
  popupTimer = setTimeout(() => {
    hidePopup();
  }, 4500);
}

function hidePopup() {
  popup.classList.add("hidden");
  popup.classList.remove("pointer-events-auto");
}

// Converts raw API/network error details into friendly user messages.
function mapApiError(data, fallbackMessage) {
  const raw = (data && (data.message || data.error || data.reason)) || fallbackMessage;
  const message = String(raw || "").toLowerCase();

  if (message.includes("invalid api key")) {
    return "Invalid API key. Update WEATHER_API_KEY in config.js.";
  }
  if (message.includes("city not found")) {
    return "City not found. Please check the spelling and try again.";
  }
  if (message.includes("nothing to geocode")) {
    return "Please enter a valid city name.";
  }
  if (message.includes("failed to fetch") || message.includes("network")) {
    return "Network issue. Please check internet connection and retry.";
  }
  return raw || fallbackMessage;
}

async function parseApiResponse(response) {
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  return data;
}

// Renders current weather panel using the selected city/location result.
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

// Shows a warning when today's temperature is above 40 C.
function updateExtremeAlert(tempCelsius) {
  if (tempCelsius > 40) {
    extremeAlert.classList.remove("hidden");
    return;
  }
  extremeAlert.classList.add("hidden");
}

// Dynamically changes app background by weather condition.
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

// Recent city history is persisted in localStorage for quick reuse.
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

// Clears all weather output blocks after failed requests.
function clearWeatherOutput() {
  resetCurrentWeatherFields();
  weatherIcon.classList.add("hidden");
  extremeAlert.classList.add("hidden");
  lastWeatherData = null;
  renderForecastCards([]);
}

function resetCurrentWeatherFields() {
  cityOutput.textContent = "--";
  conditionOutput.textContent = "--";
  tempOutput.textContent = "--";
  humidityOutput.textContent = "--";
  windOutput.textContent = "--";
}

async function fetchWeatherByCity(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);
  const data = await parseApiResponse(response);

  if (!response.ok || data.cod !== 200) {
    throw new Error(mapApiError(data, "Unable to fetch weather for this city."));
  }

  return data;
}

async function fetchWeatherByCoordinates(lat, lon) {
  const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);
  const data = await parseApiResponse(response);

  if (!response.ok || data.cod !== 200) {
    throw new Error(mapApiError(data, "Unable to fetch weather for current location."));
  }

  return data;
}

async function fetchForecastByCity(city) {
  const url = `${FORECAST_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);
  const data = await parseApiResponse(response);

  if (!response.ok || data.cod !== "200") {
    throw new Error(mapApiError(data, "Unable to fetch forecast for this city."));
  }

  return data;
}

async function fetchForecastByCoordinates(lat, lon) {
  const url = `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);
  const data = await parseApiResponse(response);

  if (!response.ok || data.cod !== "200") {
    throw new Error(mapApiError(data, "Unable to fetch forecast for current location."));
  }

  return data;
}

// Picks one representative forecast item per day (up to 5 days).
function getFiveDayForecastItems(forecastList) {
  const dailyMap = new Map();

  forecastList.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, item);
      return;
    }

    const currentSaved = dailyMap.get(date);
    const currentHourDiff = Math.abs(new Date(`${date}T12:00:00`).getHours() - Number(currentSaved.dt_txt.slice(11, 13)));
    const newHourDiff = Math.abs(new Date(`${date}T12:00:00`).getHours() - Number(item.dt_txt.slice(11, 13)));
    if (newHourDiff < currentHourDiff) {
      dailyMap.set(date, item);
    }
  });

  return Array.from(dailyMap.values()).slice(0, 5);
}

// Creates and injects forecast cards in a readable layout.
function renderForecastCards(forecastItems) {
  if (!forecastItems || forecastItems.length === 0) {
    forecastCards.innerHTML = `
      <div class="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
        Search a city to view 5-day forecast.
      </div>
    `;
    return;
  }

  forecastCards.innerHTML = forecastItems
    .map((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
      });

      return `
        <article class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-sm font-semibold text-slate-700">${date}</p>
          <div class="mt-2 flex items-center gap-2">
            <img
              src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png"
              alt="${item.weather[0].main}"
              class="h-10 w-10"
            />
            <p class="text-sm text-slate-600">${item.weather[0].description}</p>
          </div>
          <p class="mt-3 text-sm text-slate-700">🌡 Temp: <span class="font-medium">${item.main.temp.toFixed(1)} C</span></p>
          <p class="mt-1 text-sm text-slate-700">💧 Humidity: <span class="font-medium">${item.main.humidity}%</span></p>
          <p class="mt-1 text-sm text-slate-700">💨 Wind: <span class="font-medium">${item.wind.speed} m/s</span></p>
        </article>
      `;
    })
    .join("");
}

// Main city-search flow: validate -> fetch weather/forecast -> update UI.
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
    const [weatherData, forecastData] = await Promise.all([
      fetchWeatherByCity(cleanedCity),
      fetchForecastByCity(cleanedCity)
    ]);
    setWeatherValues(weatherData);
    renderForecastCards(getFiveDayForecastItems(forecastData.list));
    addRecentCity(weatherData.name);
    setStatus("Weather data loaded.", "success");
    return true;
  } catch (error) {
    clearWeatherOutput();
    setStatus(error.message, "error");
    showPopup(error.message, "error", "Weather Request Failed");
    return false;
  }
}

weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!API_KEY) {
    const message = "API key missing. Add WEATHER_API_KEY in config.js";
    setStatus(message, "error");
    showPopup(message, "error", "Configuration Error");
    return;
  }
  await handleCityWeatherSearch(cityInput.value);
});

locationBtn.addEventListener("click", async () => {
  if (!API_KEY) {
    const message = "API key missing. Add WEATHER_API_KEY in config.js";
    setStatus(message, "error");
    showPopup(message, "error", "Configuration Error");
    return;
  }
  if (!navigator.geolocation) {
    const message = "Geolocation is not supported in this browser.";
    setStatus(message, "error");
    showPopup(message, "error", "Location Error");
    return;
  }

  setStatus("Fetching your current location...", "loading");
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const [weatherData, forecastData] = await Promise.all([
          fetchWeatherByCoordinates(latitude, longitude),
          fetchForecastByCoordinates(latitude, longitude)
        ]);
        setWeatherValues(weatherData);
        renderForecastCards(getFiveDayForecastItems(forecastData.list));
        addRecentCity(weatherData.name);
        setStatus("Weather loaded for your current location.", "success");
      } catch (error) {
        clearWeatherOutput();
        setStatus(error.message, "error");
        showPopup(error.message, "error", "Location Weather Failed");
      }
    },
    (geoError) => {
      let message = "Location permission denied or unavailable.";
      if (geoError && geoError.code === 1) {
        message = "Location permission denied. Please allow location access.";
      } else if (geoError && geoError.code === 2) {
        message = "Unable to detect location. Try again in an open area.";
      } else if (geoError && geoError.code === 3) {
        message = "Location request timed out. Please try again.";
      }
      setStatus(message, "error");
      showPopup(message, "error", "Location Error");
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

popupCloseBtn.addEventListener("click", hidePopup);

console.info(`Project Repository: ${PROJECT_REPO_URL}`);
