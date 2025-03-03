const axios = require('axios');
const settings = require('../settings'); // Asegúrate de tener la API Key de Giphy almacenada aquí

async function gifCommand(sock, chatId, query) {
    const apiKey = settings.giphyApiKey; // Reemplaza con tu clave de API de Giphy

    if (!query) {
        await sock.sendMessage(chatId, { text: '❌ Debes proporcionar un término de búsqueda para el GIF.\nEjemplo: *.gif gatos*' });
        return;
    }

    try {
        const response = await axios.get('https://api.giphy.com/v1/gifs/search', {
            params: {
                api_key: apiKey,
                q: query,
                limit: 1,
                rating: 'g' // Se pueden cambiar los filtros de clasificación según el contenido deseado
            }
        });

        const gifUrl = response.data.data[0]?.images?.downsized_medium?.url;

        if (gifUrl) {
            await sock.sendMessage(chatId, { 
                video: { url: gifUrl }, 
                caption: `🎥 Aquí tienes un GIF sobre: *${query}*`
            });
        } else {
            await sock.sendMessage(chatId, { text: '❌ No se encontraron GIFs para tu búsqueda. Intenta con otro término.' });
        }
    } catch (error) {
        console.error('Error al obtener el GIF:', error);
        await sock.sendMessage(chatId, { text: '⚠️ Ocurrió un error al buscar el GIF. Intenta de nuevo más tarde.' });
    }
}

module.exports = gifCommand;
