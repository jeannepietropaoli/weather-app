    // with async / await syntax

const searchCityInput = document.querySelector('#searchCityInput');
const submitCityBtn = document.querySelector('#submitCityBtn');
const defaultCity = 'Paris';
let city = defaultCity;

function isSearchCityInputValid() {
    return searchCityInput.value !== '';
}

function isolateIconUrl(url) {
    const regex = /((day|night)\/\d{3}.png)$/;
    const source = url.match(regex)[0];
    return source;
}

function resetCityInput() {
    searchCityInput.value = '';
}

function shakeInput() {
    searchCityInput.classList.add('invalidValueShaking');
    setTimeout(() => {
        searchCityInput.classList.remove('invalidValueShaking');
        resetCityInput()
    }, 400)
}

async function getWeather(city) {
        const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=b47fa22050904e7e89122000232301&q=${city}&days=3&aqi=no&alerts=no`, {mode : "cors"});
        if (!response.ok) {
            throw new Error('no city found')
        } else {
            const data = await response.json();
            return data
        }
}

    // current

const displayCurrentWeather = ((data) => {
    const currentWeatherIcon = document.querySelector('#currentWeatherIcon');
    const temperatureElement = document.querySelector('#currentWeatherInfos > .temperature');
    const feelsLikeTempElement = document.querySelector('#currentWeatherInfos > .feels-like');
    const descriptionElement = document.querySelector('#currentWeatherInfos > .description');

    const displayWeatherIcon = (data) => {
        const url = isolateIconUrl(data.current.condition.icon);
        currentWeatherIcon.src = `./img/${url}`
    }

    const displayTemperature = (data) => {
        const temperature = data.current.temp_c;
        temperatureElement.textContent = `${temperature}°C`;
    }

    const displayFeelsLikeTemp = (data) => {
        const feelsLikeTemp = data.current.feelslike_c;
        feelsLikeTempElement.textContent = `Feels like : ${feelsLikeTemp} °C`;
    }

    const displayDescription = (data) => {
        const description = data.current.condition.text;
        descriptionElement.textContent = description;
    }

    const displayData = (data) => {
        displayWeatherIcon(data);
        displayTemperature(data);
        displayFeelsLikeTemp(data);
        displayDescription(data)
    }

    return { displayData }
})()

const displayCurrentDate = ((data) => {
    const currentDateElement = document.querySelector('#currentWeatherInfos > .date');

    const displayDate = (data) => {
        const date = new Date(data.location.localtime);
        const formatedDate = new Intl.DateTimeFormat('en-GB',{ month: "long", day: "numeric", year: "numeric",weekday: "long" }).format(date);
        currentDateElement.textContent = formatedDate;
    }

    return { displayDate }
})()


// location

const displayLocation = ((data) => {
    const cityElement = document.querySelector('#locationInfos > #city');
    const countryElement = document.querySelector('#locationInfos > #country');
    const regionElement = document.querySelector('#locationInfos > #region');

    const displayCity = (data) => {
        const city = data.location.name;
        cityElement.textContent = city;
    }

    const displayCountry = (data) => {
        const country = data.location.country;
        countryElement.textContent = country;
    }

    const displayRegion = (data) => {
        const region = data.location.region;
        regionElement.textContent = region;
    }

    const display = (data) => {
        displayCity(data);
        displayCountry(data);
        displayRegion(data);
    }

    return { display }
})()

// forecast

const displayForecastDates = ((data) => {
    const dayElements = document.querySelectorAll('.day > .dayOfTheWeek');
    const dateElements = document.querySelectorAll('.day > .date');
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday","Thursday", "Friday","Saturday"];

    const getDate = (data, index) => {
        let dateString = data.forecast.forecastday[index].date;
        const date = new Date(dateString);
        return date;
    }

    const displayDay = (data) => {
        for (let i=0; i<dayElements.length; i++) {
            const date = getDate(data, i);
            let day = days[date.getDay()];
            dayElements[i].textContent = day;
        }
    }

    const displayDate = (data) => {
        for (let i=0; i<dateElements.length; i++) {
            const date = getDate(data, i);
            const formatedDate = new Intl.DateTimeFormat('en-GB',{ month: "long", day: "numeric", year: "numeric" }).format(date);
            dateElements[i].textContent = formatedDate;
        }
    }

    const displayData = (data) => {
        displayDay(data);
        displayDate(data)
    }
    
    return { displayData }
})()

const displayForecastWeather = ((data) => {
    const tempElements = document.querySelectorAll('.forecastTemperature');
    const icons = document.querySelectorAll('.forecastWeatherIcon');

    const displayTemps = (data) => {
        for (let i=0; i<tempElements.length; i++) {
            let minTemp = data.forecast.forecastday[i].day.mintemp_c;
            let maxTemp = data.forecast.forecastday[i].day.maxtemp_c;
            tempElements[i].textContent = `${minTemp}°C | ${maxTemp}°C`;
        }
    }

    const displayIcons = (data) => {
        for (let i=0; i<icons.length; i++) {
            let source = data.forecast.forecastday[i].day.condition.icon;
            let url = isolateIconUrl(source);
            icons[i].src = `./img/${url}`;
        }
    }

    const displayData = (data) => {
        displayTemps(data);
        displayIcons(data);
    }

    return { displayData }
})()

function displayAllData(data) {
    displayCurrentWeather.displayData(data)
    displayCurrentDate.displayDate(data)
    displayLocation.display(data);
    displayForecastDates.displayData(data);
    displayForecastWeather.displayData(data);
    displayBackground(data)
    console.log(data)
}


function displayBackground(data) {
    if (data.current.is_day) {
        document.querySelector('body').style.backgroundImage = "url('./img/hot.svg')"
    } else {
        document.querySelector('body').style.backgroundImage = "url('./img/cold.svg')"
    }
}
// on page load

getWeather(city)
    .catch((err) => console.log(err))
    .then(data => {
        displayAllData(data);
        return data;
    })
    .then(data => console.log(data)) 

submitCityBtn.addEventListener('click', () => {
    if (isSearchCityInputValid) {
        city = searchCityInput.value;
        getWeather(city)
            .then(data => displayAllData(data))
            .then(() => {
                resetCityInput();
            })
            .catch((err) => {
                shakeInput();
                console.log(err)
            })
    } else {
        shakeInput();
    }
})

