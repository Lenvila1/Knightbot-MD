const axios = require('axios');

module.exports = async function (sock, chatId) {
    try {
        const apiKey = 'dcd720a6f1914e2d9dba9790c188c08c';  // Reemplaza con tu clave de NewsAPI
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`);
        
        const articles = response.data.articles.slice(0, 5); // Obtener las 5 noticias principales
        
        if (articles.length === 0) {
            await sock.sendMessage(chatId, { text: '⚠️ *No se encontraron noticias en este momento.*' });
            return;
        }

        let newsMessage = '📰 *Últimas Noticias*:\n\n';
        articles.forEach((article, index) => {
            newsMessage += `*${index + 1}. ${article.title}*\n${article.description || 'Sin descripción'}\n🔗 [Leer más](${article.url})\n\n`;
        });

        await sock.sendMessage(chatId, { text: newsMessage });

    } catch (error) {
        console.error('❌ Error al obtener noticias:', error);
        await sock.sendMessage(chatId, { text: '❌ *No se pudo obtener noticias en este momento. Inténtalo más tarde.*' });
    }
};
