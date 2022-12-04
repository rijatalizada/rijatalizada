const cityNameInput = document.querySelector("#name-input");
const latInput = <HTMLInputElement>document.querySelector("#lat-input")!;
const lonInput = <HTMLInputElement>document.querySelector("#lon-input")!;
const form = document.querySelector('form')!
let city: ICityWeather;

async function getWeather (lat: number, lon: number) {
  const response = fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=188d29418805711738068caffbce18b2`);
  const data = (await response).json();
  return data;
};

const searchingByCode = async (code : number) => {
  const cityResponse = await fetch(`https://restcountries.com/v2/alpha/${code}`);
  const data = await cityResponse.json();
  return data
};

form.addEventListener("submit", async function (e){
    e.preventDefault()
    if(latInput.value && lonInput.value) {
      const cityWeather = await getWeather(Number(latInput.value), Number(lonInput.value));
      const cityName = await searchingByCode(cityWeather.sys.country)
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
        date: new Date(cityWeather.dt *1000).toString()
      }

      console.log(city)

    }
})

const toCelsius = (degree: number) => {
  return degree - 272.15
}

const detectWindDirection = (windDegree : number) =>  {
  let windDirection: string;
  switch(true) {
    case(windDegree >= 0 && windDegree <= 45):
      windDirection = "North"
      break;
    case(windDegree > 45 && windDegree <= 90 ): 
      windDirection = "North East"
      break;
    case(windDegree > 90 && windDegree <= 135):
      windDirection = "East"
      break;
    case(windDegree > 135 && windDegree <= 180):
      windDirection = "South East"
      break;
    case(windDegree > 180 && windDegree <= 225):
      windDirection = "South "
      break;
    case(windDegree > 225 && windDegree <= 270):
      windDirection = "South West"
      break;
    case(windDegree > 270 && windDegree <= 315):
      windDirection = "West"
      break;
    case(windDegree > 315 && windDegree <= 360):
      windDirection = "North West"
      break;
    default: 
      windDirection = "North"
      break;
    }

    return windDirection
}

interface ICityWeather{
  cityName: string,
  countryName: string,
  weatherCondition: string,
  weatherDesc: string,
  temp: number,
  minTemp: number,
  maxTemp: number,
  realFeel: number,
  humidity: number,
  pressure: number,
  windSpeed: number,
  windDirection: string,
  date: any
}
