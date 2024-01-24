const APIKey = "adcaae3b9607a32452c3826c0b247d8f";
const searchBtn = document.querySelector("#search-button");
const userInput = document.querySelector("#user-search-input");
const recentSearch = document.querySelector("#recent-search");
const cityArrList = JSON.parse(localStorage.getItem("cities")) || [];
let city = cityArrList[7] || "New York";

searchBtn.addEventListener("click", handleSearch);

function handleSearch() {
  const cityInput = userInput.value.trim().toLowerCase();
  city = toTitleCase(cityInput);

  searchCity(city);
  getCityGeo(city);
  saveRecentSearch(city);
}

function searchCity(city) {
  const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${APIKey}`;
  fetchWeatherData(queryURL, displayCurrentWeather);
}

function getCityGeo(city) {
  const cityGeoCodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${APIKey}`;
  fetchWeatherData(cityGeoCodeURL, (data) => {
    const lat = data[0].lat.toFixed(2);
    const lon = data[0].lon.toFixed(2);
    displayFiveDayForecast(lat, lon);
  });
}

function fetchWeatherData(url, callback) {
  fetch(url)
    .then(response => response.json())
    .then(data => callback(data));
}

function displayCurrentWeather(data) {
  const cityName = data.name;
  const currentTemp = Math.round(data.main.temp);
  const currentHumidity = data.main.humidity;
  const currentWindSpeed = data.wind.speed;
  const currentWeatherIcon = data.weather[0].icon;

  $("#city-name-display").text(city);
  $("#temperature").text(currentTemp);
  $("#humidity").text(currentHumidity);
  $("#wind-speed").text(currentWindSpeed);
  $("#weather-icon").html(`<img src="http://openweathermap.org/img/wn/${currentWeatherIcon}.png" alt="weather-icon" id="current-weather-icon">`);
}

function displayFiveDayForecast(lat, lon) {
  const fiveDayForecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;
  fetchWeatherData(fiveDayForecastURL, (data) => {
    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = "";
    
    for (let i = 0; i < data.list.length; i += 8) {
      const date = data.list[i].dt_txt.substring(0, 10);
      const humidity = data.list[i].main.humidity;
      const windSpeed = data.list[i].wind.speed;
      const temp = Math.round(data.list[i].main.temp);

      const template = `
        <ul class="forecast-five-day">
          <li><span class="fs-5 text">${date}</span></li>
          <img src="http://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png" alt="weather-icon" id="forecast-weather-icon">
          <li> Temp: <span class="fs-5 text">${temp}&#176F</span></li>
          <li> Wind: <span class="fs-5 text">${windSpeed}MPH</span></li>
          <li> Humidity: <span class="fs-5 text">${humidity}%</span></li>
        </ul>
      `;
      forecastContainer.innerHTML += template;
    }
  });
}

function saveRecentSearch(city) {
  const cityTitleCase = toTitleCase(city);

  if (!cityArrList.includes(cityTitleCase)) {
    cityArrList.push(cityTitleCase);
    if (cityArrList.length > 8) {
      cityArrList.shift();
    }
    buildSearchButtons();
  }
  localStorage.setItem("cities", JSON.stringify(cityArrList));
}

function toTitleCase(city) {
  return city.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function buildSearchButtons() {
  recentSearch.innerHTML = "";
  for (const cityName of cityArrList) {
    const buttonEl = document.createElement("button");
    buttonEl.textContent = cityName;
    buttonEl.className = "searched-city-btn btn btn-secondary my-1";
    recentSearch.appendChild(buttonEl);
    
    buttonEl.addEventListener("click", (e) => {
      e.stopPropagation();
      const buttonText = e.target.textContent;
      handleSearch();
    });
  }
}

function displayTime() {
  $("#current-date").text(dayjs().format("MMM D, YYYY"));
  $("#current-time").text(dayjs().format("h:mm:ss A"));
}

setInterval(displayTime, 1000);
buildSearchButtons();
searchCity(city);
getCityGeo(city);
