const axios = require('axios');

module.exports = async function (sock, chatId) {
    try {
        const response = await axios.get('https://icanhazdadjoke.com/', {
            headers: { Accept: 'application/json' }
        });
        const joke = response.data.joke;
        await sock.sendMessage(chatId, { text: `😂 *Chiste del día:* \n\n${joke}` });
    } catch (error) {
        console.error('Error al obtener un chiste:', error);
        await sock.sendMessage(chatId, { text: '❌ Lo siento, no pude obtener un chiste en este momento.' });
    }
};
