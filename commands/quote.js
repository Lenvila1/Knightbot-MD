const axios = require('axios');

module.exports = async function (sock, chatId) {
    try {
        const response = await axios.get('https://type.fit/api/quotes');
        const quotes = response.data;
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        await sock.sendMessage(chatId, { 
            text: `📜 *Frase del día:*\n\n"${randomQuote.text}"\n\n— ${randomQuote.author || 'Desconocido'}` 
        });
    } catch (error) {
        console.error('Error al obtener la frase:', error);
        await sock.sendMessage(chatId, { text: '❌ No se pudo obtener una frase en este momento. Inténtalo más tarde.' });
    }
};
