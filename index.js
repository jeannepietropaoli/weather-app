const defaultCity = 'Paris';
let city = defaultCity;
const defaultUnit = 'c';
let unit = defaultUnit;
let unitString = `°${unit.toLocaleUpperCase()}`
const unitFBtn = document.querySelector('#unitF');
const unitCBtn = document.querySelector('#unitC');

async function getWeather(city) {
        const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=b47fa22050904e7e89122000232301&q=${city}&days=3&aqi=no&alerts=no`, {mode : "cors"});
        if (!response.ok) {
            throw new Error('no city found')
        } else {
            const data = await response.json();
            return data
        }
}

// icons

const manageWeatherIcons = (() => {
    isolateIconUrl = (url) => {
        const regex = /((day|night)\/\d{3}.png)$/;
        const source = url.match(regex)[0];
        return source;
    }
    display = (data, iconElement, source) => {
        const url = isolateIconUrl(source);
        iconElement.src = `./img/weatherIcons/${url}`
    }

    return { display }
})()

// current weather

const displayCurrentWeather = ((data) => {
    const currentWeatherIcon = document.querySelector('#currentWeatherIcon');
    const temperatureElement = document.querySelector('#currentWeatherInfos > .temperature');
    const feelsLikeTempElement = document.querySelector('#currentWeatherInfos > .feels-like');
    const descriptionElement = document.querySelector('#currentWeatherInfos > .description');

    const displayTemperature = (data) => {
        let temperature;
        unit === 'c' ? temperature = data.current.temp_c : temperature = data.current.temp_f;
        temperatureElement.textContent = `${temperature} ${unitString}`;
    }

    const displayFeelsLikeTemp = (data) => {
        const feelsLikeTemp = data.current.feelslike_c;
        feelsLikeTempElement.textContent = `Feels like : ${feelsLikeTemp} ${unitString}`;
    }

    const displayDescription = (data) => {
        const description = data.current.condition.text;
        descriptionElement.textContent = description;
    }

    const displayData = (data) => {
        manageWeatherIcons.display(data, currentWeatherIcon, data.current.condition.icon);
        displayTemperature(data);
        displayFeelsLikeTemp(data);
        displayDescription(data)
    }

    return { displayData }
})()

// current time

const displayCurrentDate = ((data) => {
    const currentDateElement = document.querySelector('#time > .date');
    const currentTimeElement = document.querySelector('#time > .hour');
    

    const displayDate = (data) => {
        const date = new Date(data.location.localtime);
        const formatedDate = new Intl.DateTimeFormat('en-GB',{ month: "long", day: "numeric", year: "numeric",weekday: "long" }).format(date);
        currentDateElement.textContent = formatedDate;
    }

    const displayHour = (data) => {
        const date = new Date(data.location.localtime);
        const hour = date.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
        currentTimeElement.textContent = hour;
    }

    const displayTime = (data) => {
        displayDate(data);
        displayHour(data);
    }

    return { displayTime }
})()

// location

const searchCityInput = (() => {
    const element = document.querySelector('#searchCityInput');
    const submitCityBtn = document.querySelector('#submitCityBtn');
    const isValid = () => element.value !== '';
    const resetValue = () => element.value = '';
    const shake = () => {
        element.classList.add('invalidValueShaking');
        setTimeout(() => {
            element.classList.remove('invalidValueShaking');
            resetValue()
        }, 400)
    }

    return {
        element,
        submitCityBtn,
        isValid,
        resetValue,
        shake
    }
})()

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

    const displayData = (data) => {
        displayCity(data);
        displayCountry(data);
        displayRegion(data);
    }

    return { displayData }
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
            let minTemp;
            let maxTemp;
            if (unit === 'c') {
                minTemp = data.forecast.forecastday[i].day.mintemp_c;
                maxTemp = data.forecast.forecastday[i].day.maxtemp_c;
            } else {
                minTemp = data.forecast.forecastday[i].day.mintemp_f;
                maxTemp = data.forecast.forecastday[i].day.maxtemp_f;
            }
            tempElements[i].textContent = `${minTemp}${unitString} | ${maxTemp}${unitString}`;
        }
    }

    const displayIcons = (data) => {
        for (let i=0; i<icons.length; i++) {
            let source = data.forecast.forecastday[i].day.condition.icon;
            manageWeatherIcons.display(data, icons[i], source)
        }
    }

    const displayData = (data) => {
        displayTemps(data);
        displayIcons(data);
    }

    return { displayData }
})()

// manage the display of all data on page 

function displayBackground(data) {
    (data.current.is_day) ? 
        document.querySelector('body').style.backgroundImage = "url('./img/background/day.svg')" :
        document.querySelector('body').style.backgroundImage = "url('./img/background/night.svg')"
}

function displayAllData(data) {
    displayCurrentWeather.displayData(data)
    displayCurrentDate.displayTime(data)
    displayLocation.displayData(data);
    displayForecastDates.displayData(data);
    displayForecastWeather.displayData(data);
    displayBackground(data)
}

// loading

function startDisplayLoading() {
    loadingGif.style.visibility = 'visible';
}

function endDisplayLoading() {
    loadingGif.style.visibility = 'hidden';
}

// on page load

getWeather(city)
    .catch((err) => console.log(err))
    .then(data => displayAllData(data))

searchCityInput.submitCityBtn.addEventListener('click', () => {
    if (searchCityInput.isValid()) {
        startDisplayLoading();
        city = searchCityInput.element.value;
        getWeather(city)
            .then((data) => {
                displayAllData(data);
                endDisplayLoading();
                searchCityInput.resetValue()
            })
            .catch((err) => {
                searchCityInput.shake();
                console.log(err);
                endDisplayLoading();
            })
    } else {
        searchCityInput.shake();
    }
})

unitCBtn.addEventListener('click', () => {
    if (unit !== 'c') {
        unit = 'c';
        unitString = `°${unit.toLocaleUpperCase()}`
        getWeather(city)
            .catch((err) => console.log(err))
            .then(data => displayAllData(data))
    }
})

unitFBtn.addEventListener('click', () => {
    if (unit !== 'f') {
        unit = 'f';
        unitString = `°${unit.toLocaleUpperCase()}`;
        getWeather(city)
            .catch((err) => console.log(err))
            .then(data => displayAllData(data))
    }
})
