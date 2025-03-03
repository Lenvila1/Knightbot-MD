const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { isAdmin } = require('../helpers/isAdmin');

async function verCommand(sock, chatId, senderId, message) {
    try {
        // Verificar si el bot y el usuario son administradores
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '❌ *Solo los administradores pueden usar este comando.*' });
            return;
        }

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❌ *Necesito ser administrador para desbloquear imágenes de "Ver Una Vez".*' });
            return;
        }

        // Obtener el mensaje citado
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quotedMessage || !quotedMessage.viewOnceMessage) {
            await sock.sendMessage(chatId, { text: '❌ *Debes responder a una foto de "Ver Una Vez".*' });
            return;
        }

        // Obtener la imagen dentro del mensaje de "ver una vez"
        const imageMessage = quotedMessage.viewOnceMessage.message.imageMessage;
        if (!imageMessage) {
            await sock.sendMessage(chatId, { text: '❌ *No se encontró ninguna imagen en el mensaje citado.*' });
            return;
        }

        // Descargar la imagen
        const stream = await downloadContentFromMessage(imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Enviar la imagen como normal
        await sock.sendMessage(chatId, {
            image: buffer,
            caption: '🔓 *Imagen desbloqueada de "Ver Una Vez"*'
        });

    } catch (error) {
        console.error('Error en verCommand:', error);
        await sock.sendMessage(chatId, { text: '❌ *Error al desbloquear la imagen. Inténtalo de nuevo más tarde.*' });
    }
}

module.exports = verCommand;
