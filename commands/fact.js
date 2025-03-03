const axios = require('axios');

module.exports = async function (sock, chatId) {
    try {
        const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=es'); // Solicitar datos en español
        const fact = response.data.text;
        await sock.sendMessage(chatId, { text: `📢 *Dato curioso:* ${fact}` });
    } catch (error) {
        console.error('Error al obtener un dato curioso:', error);
        await sock.sendMessage(chatId, { text: 'Lo siento, no pude obtener un dato curioso en este momento.' });
    }
};
