async function getWeather() {
    const zipcode = document.getElementById('zipcode').value;
    const geocodeUrl = `https://api.zippopotam.us/us/${zipcode}`;

    try {
        // First, get the latitude and longitude for the zipcode
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();
        console.log('Geocode data:', geocodeData);

        if (!geocodeResponse.ok) {
            throw new Error('Invalid zipcode');
        }

        const lat = geocodeData.places[0].latitude;
        const lon = geocodeData.places[0].longitude;

        // Get more detailed location information
        const reverseGeocodeUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
        const reverseGeocodeResponse = await fetch(reverseGeocodeUrl);
        const reverseGeocodeData = await reverseGeocodeResponse.json();
        console.log('Reverse geocode data:', reverseGeocodeData);

        const cityName = reverseGeocodeData.city || geocodeData.places[0]['place name'];
        const stateName = reverseGeocodeData.principalSubdivision || '';
        const fullLocationName = `${cityName}, ${stateName}`.trim();

        // Now, get the weather data using the latitude and longitude
        const weatherUrl = `https://api.weather.gov/points/${lat},${lon}`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        console.log('Weather data:', weatherData);

        if (!weatherResponse.ok) {
            throw new Error('Unable to fetch weather data');
        }

        // Fetch the forecast data
        const forecastUrl = weatherData.properties.forecast;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
        console.log('Forecast data:', forecastData);

        if (!forecastResponse.ok) {
            throw new Error('Unable to fetch forecast data');
        }

        const imageUrl = await getLocationImage(fullLocationName);
        displayWeather(forecastData, fullLocationName, imageUrl);
    } catch (error) {
        console.error('Error:', error);
        displayError(error.message);
    }
}

async function getLocationImage(locationName) {
    const query = `${locationName} landmark`;
    const unsplashUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=GlGbFsHRxMnldNtDE01J69gp-BCuCtkc7dlGGYkurik`;
    try {
        const response = await fetch(unsplashUrl);
        const data = await response.json();
        return data.urls.regular;
    } catch (error) {
        console.error('Error fetching image:', error);
        return null;
    }
}

function displayWeather(data, cityName, imageUrl) {
    console.log('Data received:', data);
    console.log('City name:', cityName);

    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.style.display = 'block';

    if (!data || !data.properties || !data.properties.periods || data.properties.periods.length === 0) {
        weatherInfo.innerHTML = `<p class="error">Error: Unable to process weather data</p>`;
        return;
    }

    const currentPeriod = data.properties.periods[0];
    const temperature = currentPeriod.temperature;

    // Set the background color based on temperature
    if (temperature < 55) {
        document.body.style.backgroundColor = '#e6f3ff'; // Pale blue for cold
    } else if (temperature >= 55 && temperature <= 75) {
        document.body.style.backgroundColor = '#e6ffe6'; // Pale green for mild
    } else {
        document.body.style.backgroundColor = '#fff0e6'; // Pale orange for hot
    }

    weatherInfo.innerHTML = `
        <div class="weather-container">
            <h2 class="city-name">${cityName}</h2>
            ${imageUrl ? `<img src="${imageUrl}" alt="${cityName} landmark" class="city-image">` : ''}
            <div class="weather-details">
                <div class="weather-item">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <i class="fas fa-thermometer-half" style="font-size: 1.5em; color: #ff6347;"></i>
                        <span style="font-weight: bold; font-size: 1.2em; margin-left: 10px;">${temperature}°${currentPeriod.temperatureUnit}</span>
                    </div>
                </div>
                <div class="weather-item">
                    <i class="fas fa-cloud"></i>
                    <span>${currentPeriod.shortForecast}</span>
                </div>
                <div class="weather-item">
                    <i class="fas fa-wind"></i>
                    <span>${currentPeriod.windSpeed} ${currentPeriod.windDirection}</span>
                </div>
            </div>
            <p class="forecast">${currentPeriod.detailedForecast}</p>
        </div>
    `;
}

function displayError(message) {
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.style.display = 'block';
    weatherInfo.innerHTML = `
        <div class="error-container">
            <i class="fas fa-exclamation-triangle"></i>
            <p class="error-message">Error: ${message}</p>
        </div>
    `;
}

// Add this function to handle errors
function displayError(message) {
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.style.display = 'block';
    weatherInfo.innerHTML = `<p class="error">Error: ${message}</p>`;
}