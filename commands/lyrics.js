const fetch = require('node-fetch');
require('../config.js');

async function lyricsCommand(sock, chatId, songTitle) {
    if (!songTitle) {
        await sock.sendMessage(chatId, { 
            text: '❌ ¡Por favor, proporciona el título de una canción!' 
        });
        return;
    }

    try {
        // Usando la API de XTeam en lugar de LolHuman
        const apiUrl = `${global.APIs.xteam}/api/lirik?q=${encodeURIComponent(songTitle)}&apikey=${global.APIKeys['https://api.xteam.xyz']}`;
        
        const res = await fetch(apiUrl);
        const json = await res.json();
        
        if (!json.result) {
            await sock.sendMessage(chatId, { 
                text: '❌ No se encontraron letras para esta canción.' 
            });
            return;
        }

        const lyricsText = `🎵 *Letra de la canción: ${songTitle}* 🎶

${json.result}

_Powered by XTeam API_`;

        await sock.sendMessage(chatId, {
            text: lyricsText
        });

    } catch (error) {
        console.error('❌ Error en el comando de letras:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ El servicio de letras no está disponible en este momento. Inténtalo más tarde.' 
        });
    }
}

module.exports = { lyricsCommand };
