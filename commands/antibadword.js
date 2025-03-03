const { handleAntiBadwordCommand } = require('../lib/antibadword');
const isAdminHelper = require('../helpers/isAdmin');

async function antibadwordCommand(sock, chatId, message, senderId, isSenderAdmin) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '```¡Solo para administradores del grupo!```' });
            return;
        }

        // Extraer el texto del mensaje
        const text = message.message?.conversation || 
                    message.message?.extendedTextMessage?.text || '';
        const match = text.split(' ').slice(1).join(' ');

        await handleAntiBadwordCommand(sock, chatId, message, match);
    } catch (error) {
        console.error('Error en el comando antibadword:', error);
        await sock.sendMessage(chatId, { text: '*Error al procesar el comando antibadword*' });
    }
}

module.exports = antibadwordCommand;
