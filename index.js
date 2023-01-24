function getWeather(city) {
    return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=4f5b8192f7ed63d425ea8d883abe553e`)
}

getWeather('Parsssis')
    .then(response => {
        if (! response.ok) {
            throw new Error('somtehing went wrong')
        } else {
            return response.json()
        }
    })
    .then(data => {
        return {
            name : data.name,
            temperature : data.main.temp,
            weather : data.weather[0].main
        }
    })
    .then(data => console.log(data))
    .catch(error => console.log(error))


/* <a>href="https://www.vecteezy.com/free-vector/nature">Nature Vectors by Vecteezy</a>  */
