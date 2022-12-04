"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const cityNameInput = document.querySelector("#name-input");
const latInput = document.querySelector("#lat-input");
const lonInput = document.querySelector("#lon-input");
const main = document.querySelector(".main-doc");
const form = document.querySelector("form");
let city;
let cordinatesArr = [];
window.addEventListener('load', function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (window.localStorage.getItem("cityCordinates")) {
            cordinatesArr = JSON.parse(window.localStorage.getItem("cityCordinates"));
        }
        if (cordinatesArr.length > 0) {
            for (const cordinates of cordinatesArr) {
                const cityWeather = yield getWeather({
                    lat: cordinates.latitude,
                    lon: cordinates.longitude
                });
                const cityInfo = yield searchingByCode(cityWeather.sys.country);
                const city = createCityObj(cityWeather, cityInfo, false);
            }
        }
    });
});
function getWeather({ lat, lon, city }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (lat && lon) {
            const response = yield fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=188d29418805711738068caffbce18b2`);
            const data = yield response.json();
            return data;
        }
        else if (city) {
            const response = yield fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=188d29418805711738068caffbce18b2`);
            const data = yield response.json();
            return data;
        }
    });
}
const searchingByCode = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const cityResponse = yield fetch(`https://restcountries.com/v2/alpha/${code}`);
    const data = yield cityResponse.json();
    return data;
});
form.addEventListener("submit", function (e) {
    return __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        if (latInput.value && lonInput.value) {
            const cityWeather = yield getWeather({
                lat: Number(latInput.value),
                lon: Number(lonInput.value)
            });
            const cityInfo = yield searchingByCode(cityWeather.sys.country);
            const city = createCityObj(cityWeather, cityInfo, true);
            latInput.value = "";
            lonInput.value = "";
        }
        else if (cityNameInput.value) {
            const cityWeather = yield getWeather({
                city: cityNameInput.value
            });
            const cityInfo = yield searchingByCode(cityWeather.sys.country);
            const city = createCityObj(cityWeather, cityInfo, true);
            cityNameInput.value = "";
        }
    });
});
const toCelsius = (degree) => {
    return degree - 272.15;
};
const createCityObj = (cityWeather, cityName, disableOnLoad) => {
    if (disableOnLoad) {
        if (window.localStorage.getItem("cityCordinates")) {
            if (!JSON.parse(window.localStorage.getItem("cityCordinates")).find((cord) => cord.id === cityWeather)) {
                return;
            }
        }
    }
    if (disableOnLoad) {
        const cordinates = {
            longitude: cityWeather.coord.lon,
            latitude: cityWeather.coord.lat,
            id: cityWeather.id
        };
        cordinatesArr.push(cordinates);
        window.localStorage.setItem('cityCordinates', JSON.stringify(cordinatesArr));
    }
    const city = {
        id: cityWeather.id,
        lon: cityWeather.coord.lon,
        lat: cityWeather.coord.lat,
        cityName: cityWeather.name,
        countryName: cityName.name,
        weatherCondition: cityWeather.weather[0].main,
        weatherDesc: cityWeather.weather[0].description,
        temp: toCelsius(cityWeather.main.temp),
        minTemp: toCelsius(cityWeather.main.temp_min),
        maxTemp: toCelsius(cityWeather.main.temp_max),
        realFeel: toCelsius(cityWeather.main.feels_like),
        humidity: cityWeather.main.humidity,
        pressure: cityWeather.main.pressure,
        windSpeed: cityWeather.wind.speed,
        windDirection: detectWindDirection(cityWeather.wind.deg),
        date: new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'long' }).format(new Date(cityWeather.dt * 1000)),
    };
    main.innerHTML += `<div class="city" id="a${city.id}">
      <header>
          <div>
              <p class="text-white text-xl">${city.cityName}, ${city.countryName} <button onclick="removeCity(${city.id})" class="text-red">&#215;</button></p>
              <p class="text-white weather-condition">${city.weatherCondition}, ${city.weatherDesc}</p>
          </div>
          <div class="temp">
              <span>${Math.round(city.temp)}<sup>o</sup></span>
              <div class="flex items-center gap-1">
                  <span class="border-right pr-1">Humidity: ${city.humidity}%</span>
                  <span>Pressure: ${city.pressure}HG</span>
              </div>
          </div>
          <div class="detailed-temp">
              <p>min-temp: <span>${Math.round(city.minTemp)}<sup>o</sup></span> </p>
              <p>max-temp: <span>${Math.round(city.maxTemp)}<sup>o</sup></span> </p>
              <p>feels-like: <span>${Math.round(city.realFeel)}<sup>o</sup></span> </p>
          </div>
      </header>
      <main>
          <div>
              <p class="text-white time">${city.date}</p>
          </div>
          <div class="wind">
              <p>Wind: ${city.windSpeed.toFixed(1)} m/s ${city.windDirection}</p>
          </div>
      </main>
    </div>`;
    return city;
};
const removeCity = (cityId) => {
    var _a;
    if (window.localStorage.getItem("cityCordinates")) {
        cordinatesArr = JSON.parse(window.localStorage.getItem("cityCordinates")).filter((cord) => cord.id !== cityId);
        console.log(cordinatesArr);
        window.localStorage.setItem("cityCordinates", JSON.stringify(cordinatesArr));
        (_a = document.querySelector(`#a${cityId}`)) === null || _a === void 0 ? void 0 : _a.remove();
    }
};
const detectWindDirection = (windDegree) => {
    let windDirection;
    switch (true) {
        case windDegree >= 0 && windDegree <= 45:
            windDirection = "North";
            break;
        case windDegree > 45 && windDegree <= 90:
            windDirection = "North East";
            break;
        case windDegree > 90 && windDegree <= 135:
            windDirection = "East";
            break;
        case windDegree > 135 && windDegree <= 180:
            windDirection = "South East";
            break;
        case windDegree > 180 && windDegree <= 225:
            windDirection = "South ";
            break;
        case windDegree > 225 && windDegree <= 270:
            windDirection = "South West";
            break;
        case windDegree > 270 && windDegree <= 315:
            windDirection = "West";
            break;
        case windDegree > 315 && windDegree <= 360:
            windDirection = "North West";
            break;
        default:
            windDirection = "North";
            break;
    }
    return windDirection;
};
