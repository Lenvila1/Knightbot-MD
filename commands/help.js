const settings = require('../settings');

async function helpCommand(sock, chatId) {
    const helpMessage = `
┏━━━━━━━━━━━━━━━
┃ *🤖 ${settings.botName || 'KnightBot-MD'}*  
┃ 🔹 Versión: *${settings.version || '1.0.0'}*
┗━━━━━━━━━━━━━━━
*SIGAN EL CANAL https://whatsapp.com/channel/0029VajM7fxEAKWOOIhQbR0K*

📌 *LISTA DE COMANDOS DISPONIBLES:*

🌀 *COMANDOS GENERALES*:
🎲 *.help* 
✅ *.ping* 
⚡ *.alive* 
🔊 *.tts <texto>* 
📜 *.quote* -
🤣 *.joke* 
🌍 *.weather <ciudad>* 
📰 *.news* 
🎶 *.lyrics <canción>* 
🔮 *.8ball <pregunta>*
📢 *.groupinfo* 
👥 *.staff* 

🖼️ *STICKERS & IMÁGENES*:
🔄 *.blur <imagen>* 
🎨 *.sticker* 
📷 *.simage* 
🖼️ *.meme* 
🔠 *.attp <texto>*
🎭 *.emojimix 😎+🥰* 

⚔️ *ADMINISTRACIÓN DE GRUPOS*:
🚫 *.ban @usuario* 
⬆️ *.promote @usuario* 
⬇️ *.demote @usuario* 
🔇 *.mute <minutos>* 
🔊 *.unmute* 
❌ *.delete* 
👮 *.kick @usuario* 
⚠️ *.warnings @usuario* 
🚨 *.antilink* 
🔤 *.antibadword* 
📢 *.tagall* 

👑 *COMANDOS PARA EL DUEÑO*:
🔄 *.mode* 
🛠️ *.autostatus* 
💾 *.clearsession* 

💻 *GITHUB & DESCARGAS*:
🔗 *.github* 
📥 *.play <canción>* 
🎵 *.song <nombre>* 

🎮 *JUEGOS*:
❌⭕ *.tictactoe @usuario*
📝 *.hangman* 
🧠 *.trivia* 
🎯 *.truth* 
🔥 *.dare* 

🔥 *DIVERSIÓN*:
🎭 *.compliment @usuario*
💥 *.insult @usuario* 
😍 *.flirt* 
🧬 *.character @usuario* 
💞 *.ship @usuario*

🚀 *¡KnightBot siempre listo para ayudarte!*
*SIGANME EN IG https://www.instagram.com/vilenkn?igsh=MWRpZDhsbTB3Y25wNA==*
`;

    try {
        await sock.sendMessage(chatId, { text: helpMessage });
    } catch (error) {
        console.error('Error en el comando de ayuda:', error);
        await sock.sendMessage(chatId, { text: '❌ Error al mostrar la lista de comandos.' });
    }
}

module.exports = helpCommand;
