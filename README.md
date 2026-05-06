# Weather Forecast Dashboard

A responsive weather dashboard built with HTML, Tailwind CSS (CDN), and vanilla JavaScript.  
It shows current weather, a 5-day forecast, recent city history, location-based weather, and clear in-UI error handling.

## Features

- Search weather by city name
- Get weather using current browser location
- Display current weather details:
  - Condition with icon
  - Temperature
  - Humidity
  - Wind speed
- 5-day forecast cards with date, icon, temperature, humidity, and wind
- Temperature unit toggle (C/F) for today's temperature
- Extreme heat alert when temperature is above 40 C
- Dynamic background changes by condition (clear/cloudy/rainy)
- Recent searched cities dropdown (stored in localStorage)
- Friendly status messages and custom popup-based error feedback (no JS alerts)

## Tech Stack

- `index.html` - layout and UI structure
- `app.js` - API calls, event handling, validation, and rendering logic
- `config.js` - local API key file (ignored by Git)
- `config.example.js` - sample config template for setup

## Setup Instructions

1. Clone/download the project.
2. Create a local config file from the example:

   ```bash
   cp config.example.js config.js
   ```

3. Open `config.js` and add your OpenWeatherMap API key:

   ```js
   window.WEATHER_API_KEY = "YOUR_OPENWEATHERMAP_API_KEY";
   ```

4. Run the app using a local server (recommended, e.g. VS Code Live Server), then open:
   - `http://127.0.0.1:5500/index.html` (or your server URL)

## Usage

1. Enter a city name and click **Get Weather**.
2. Or click **Use Current Location** and allow location permission.
3. Use the **Recent cities** dropdown for quick repeat searches.
4. Toggle **C/F** to switch today's temperature unit.
5. Review the **5-Day Forecast** cards for extended data.

## Validation and Error Handling

- Empty city input is rejected with a clear message.
- Invalid city input format is handled before API calls.
- API errors (invalid key, city not found, network issues) are mapped to user-friendly messages.
- Errors are shown both:
  - inline in the status panel
  - in a custom popup notification

## Notes

- Keep `config.js` private. It is intentionally ignored in `.gitignore`.
- Commit only safe files (`index.html`, `app.js`, `config.example.js`, `.gitignore`, `README.md`).
