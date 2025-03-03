const axios = require('axios');

module.exports = async function (sock, chatId, city) {
    try {
        if (!city) {
            await sock.sendMessage(chatId, { text: '❌ Debes ingresar el nombre de una ciudad. Ejemplo: `.weather Quito`' });
            return;
        }

        const apiKey = '4902c0f2550f58298ad4146a92b65e10';  // Reemplaza con tu API Key de OpenWeather
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`;
        
        const response = await axios.get(url);
        const weather = response.data;

        if (!weather || !weather.main || !weather.weather[0]) {
            throw new Error('Respuesta inesperada de la API.');
        }

        // Extraer datos del clima
        const temp = weather.main.temp.toFixed(1);
        const feelsLike = weather.main.feels_like.toFixed(1);
        const humidity = weather.main.humidity;
        const windSpeed = (weather.wind.speed * 3.6).toFixed(1); // Convertir de m/s a km/h
        const description = weather.weather[0].description;
        const icon = weather.weather[0].icon;

        // Formatear respuesta
        const weatherText = `🌍 *Clima en ${weather.name}, ${weather.sys.country}:*\n\n` +
            `🌡 *Temperatura:* ${temp}°C\n` +
            `🤒 *Sensación térmica:* ${feelsLike}°C\n` +
            `💨 *Viento:* ${windSpeed} km/h\n` +
            `💧 *Humedad:* ${humidity}%\n` +
            `📌 *Condiciones:* ${description.charAt(0).toUpperCase() + description.slice(1)}\n`;

        // Obtener icono del clima
        const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;

        await sock.sendMessage(chatId, {
            image: { url: iconUrl },
            caption: weatherText
        });

    } catch (error) {
        console.error('❌ Error al obtener el clima:', error);

        let errorMessage = '❌ No se pudo obtener el clima.';
        if (error.response?.data?.message === 'city not found') {
            errorMessage = '❌ Ciudad no encontrada. Verifica el nombre e intenta nuevamente.';
        }

        await sock.sendMessage(chatId, { text: errorMessage });
    }
};
