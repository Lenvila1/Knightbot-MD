const axios = require('axios');

async function memeCommand(sock, chatId) {
    try {
        // Obtener memes desde la API de Imgflip
        const response = await axios.get('https://api.imgflip.com/get_memes');
        
        if (response.data.success) {
            const memes = response.data.data.memes;

            // Seleccionar un meme aleatorio de la lista
            const randomMeme = memes[Math.floor(Math.random() * memes.length)];

            // Enviar el meme al chat
            await sock.sendMessage(chatId, { 
                image: { url: randomMeme.url }, 
                caption: `🤣 *Meme:* ${randomMeme.name}` 
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ No se pudo obtener un meme. Inténtalo de nuevo más tarde.' 
            });
        }
    } catch (error) {
        console.error('❌ Error al obtener un meme:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Ocurrió un error al obtener un meme. Inténtalo de nuevo más tarde.' 
        });
    }
}

module.exports = memeCommand;
