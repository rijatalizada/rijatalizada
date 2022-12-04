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
const form = document.querySelector('form');
let city;
function getWeather(lat, lon) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=188d29418805711738068caffbce18b2`);
        const data = (yield response).json();
        return data;
    });
}
;
const searchingByCode = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const cityResponse = yield fetch(`https://restcountries.com/v2/alpha/${code}`);
    const data = yield cityResponse.json();
    return data;
});
form.addEventListener("submit", function (e) {
    return __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        if (latInput.value && lonInput.value) {
            const cityWeather = yield getWeather(Number(latInput.value), Number(lonInput.value));
            const cityName = yield searchingByCode(cityWeather.sys.country);
            city = {
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
                date: new Date(cityWeather.dt * 1000).toString()
            };
            console.log(city);
        }
    });
});
const toCelsius = (degree) => {
    return degree - 272.15;
};
const detectWindDirection = (windDegree) => {
    let windDirection;
    switch (true) {
        case (windDegree >= 0 && windDegree <= 45):
            windDirection = "North";
            break;
        case (windDegree > 45 && windDegree <= 90):
            windDirection = "North East";
            break;
        case (windDegree > 90 && windDegree <= 135):
            windDirection = "East";
            break;
        case (windDegree > 135 && windDegree <= 180):
            windDirection = "South East";
            break;
        case (windDegree > 180 && windDegree <= 225):
            windDirection = "South ";
            break;
        case (windDegree > 225 && windDegree <= 270):
            windDirection = "South West";
            break;
        case (windDegree > 270 && windDegree <= 315):
            windDirection = "West";
            break;
        case (windDegree > 315 && windDegree <= 360):
            windDirection = "North West";
            break;
        default:
            windDirection = "North";
            break;
    }
    return windDirection;
};
