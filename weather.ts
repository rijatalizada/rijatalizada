const cityNameInput = <HTMLInputElement>document.querySelector("#name-input");
const latInput = <HTMLInputElement>document.querySelector("#lat-input")!;
const lonInput = <HTMLInputElement>document.querySelector("#lon-input")!;
const main = document.querySelector(".main-doc");
const form = document.querySelector("form")!;
const currentLocation = document.querySelector(".current-location")
let city: ICityWeather;
let cordinatesArr : {
  latitude: number,
  longitude: number
  id: number
}[] = []


window.addEventListener('load', async function() {
  if(window.localStorage.getItem("cityCordinates")){
    cordinatesArr = JSON.parse(window.localStorage.getItem("cityCordinates")!)
  }
  if(cordinatesArr.length > 0){
    for (const cordinates of cordinatesArr) {
      const cityWeather = await getWeather(
        {
          lat:cordinates.latitude,
          lon:cordinates.longitude
        }
      );
      const cityInfo = await searchingByCode(cityWeather.sys.country);
      const city = createCityObj(cityWeather, cityInfo, false)
    }
  }
})

async function getWeather({lat, lon, city} : {lat?: number, lon?: number, city?: string}) {
  if (lat && lon) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=188d29418805711738068caffbce18b2`
    );
    const data = await response.json();
    return data
  } else if(city) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=188d29418805711738068caffbce18b2`
    );
    const data = await response.json();
    return data;
  }
}

const searchingByCode = async (code: number) => {
  const cityResponse = await fetch(
    `https://restcountries.com/v2/alpha/${code}`
  );
  const data = await cityResponse.json();
  return data;
};

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  if (latInput.value && lonInput.value) {
    const cityWeather = await getWeather(
      {
        lat: Number(latInput.value),
        lon: Number(lonInput.value)
      }
    );
    const cityInfo = await searchingByCode(cityWeather.sys.country);
    
    const city = createCityObj(cityWeather, cityInfo, true)
    latInput.value = ""
    lonInput.value = ""
  } else if(cityNameInput.value) {
    const cityWeather = await getWeather(
      {
        city: cityNameInput.value
      }
    );
    const cityInfo = await searchingByCode(cityWeather.sys.country);
    
    const city = createCityObj(cityWeather, cityInfo, true)
    cityNameInput.value = ""
  }
});


const toCelsius = (degree: number) => {
  return degree - 272.15;
};

const createCityObj = (cityWeather: any, cityName:any, disableOnLoad : boolean) => {
  if(disableOnLoad){
    if(window.localStorage.getItem("cityCordinates")){
      if(!JSON.parse(window.localStorage.getItem("cityCordinates")!).find((cord: {latitude: number, longitude: number, id: number} ) => cord.id === cityWeather)){
        return
      }
    }
  }

  if(disableOnLoad){
    const cordinates = {
      longitude: cityWeather.coord.lon,
      latitude : cityWeather.coord.lat,
      id: cityWeather.id
    }
  
    cordinatesArr.push(cordinates)
  
    window.localStorage.setItem('cityCordinates', JSON.stringify(cordinatesArr))
  }

  const city: ICityWeather = {
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
    date: new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'long' }).format(new Date(cityWeather.dt * 1000)) ,
  };

  main!.innerHTML += `<div class="city" id="a${city.id}">
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
    </div>`

  return city
}

const removeCity = (cityId : number) => {
  if(window.localStorage.getItem("cityCordinates")){
    cordinatesArr = JSON.parse(window.localStorage.getItem("cityCordinates")!).filter((cord: {latitude: number, longitude: number, id: number}) => cord.id !== cityId)
    window.localStorage.setItem("cityCordinates", JSON.stringify(cordinatesArr))
    document.querySelector(`#a${cityId}`)?.remove()
  }
}

const detectWindDirection = (windDegree: number) => {
  let windDirection: string;
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

interface ICityWeather {
  id:number,
  lon:number,
  lat:number,
  cityName: string;
  countryName: string;
  weatherCondition: string;
  weatherDesc: string;
  temp: number;
  minTemp: number;
  maxTemp: number;
  realFeel: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: string;
  date: any;
}
