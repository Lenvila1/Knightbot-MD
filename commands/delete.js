const isAdmin = require('../helpers/isAdmin');

async function deleteCommand(sock, chatId, message, senderId) {
    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

    if (!isBotAdmin) {
        await sock.sendMessage(chatId, { text: 'Necesito ser administrador para eliminar mensajes.' });
        return;
    }

    if (!isSenderAdmin) {
        await sock.sendMessage(chatId, { text: 'tu q no eres admin jaja.' });
        return;
    }

    const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.stanzaId;
    const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;

    if (quotedMessage) {
        await sock.sendMessage(chatId, { delete: { remoteJid: chatId, fromMe: false, id: quotedMessage, participant: quotedParticipant } });
    } else {
        await sock.sendMessage(chatId, { text: 'Por favor, responde a un mensaje que quieras eliminar.' });
    }
}

module.exports = deleteCommand;
