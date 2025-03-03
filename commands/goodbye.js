const { handleGoodbye } = require('../lib/welcome');

async function goodbyeCommand(sock, chatId, message, match) {
    // Verificar si el comando se ejecuta en un grupo
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { text: 'Este comando solo puede usarse en grupos.' });
        return;
    }

    // Extraer el texto del mensaje
    const text = message.message?.conversation || 
                message.message?.extendedTextMessage?.text || '';
    const matchText = text.split(' ').slice(1).join(' ');

    await handleGoodbye(sock, chatId, message, matchText);
}

module.exports = goodbyeCommand;
