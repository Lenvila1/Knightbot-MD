const { isAdmin } = require('../helpers/isAdmin'); 
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

async function verCommand(sock, chatId, senderId, message) {
    try {
        // ✅ Verificar si el bot y el usuario que envía el comando son administradores
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❌ *Error:* Necesito ser administrador para usar este comando.' });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '❌ *Error:* Solo los administradores pueden usar este comando.' });
            return;
        }

        // ✅ Buscar el mensaje citado con "ver una vez"
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage || (!quotedMessage.imageMessage && !quotedMessage.videoMessage)) {
            await sock.sendMessage(chatId, { text: '⚠️ *Error:* Responde a una foto o video enviado en "ver una vez".' });
            return;
        }

        // ✅ Determinar si es imagen o video
        const isImage = !!quotedMessage.imageMessage;
        const isVideo = !!quotedMessage.videoMessage;

        const mediaMessage = isImage ? quotedMessage.imageMessage : quotedMessage.videoMessage;

        // ✅ Descargar la imagen o video
        const stream = await downloadContentFromMessage(mediaMessage, isImage ? 'image' : 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // ✅ Crear una carpeta temporal para almacenar archivos
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        // ✅ Guardar el archivo en el sistema
        const filePath = path.join(tempDir, `ver_${Date.now()}.${isImage ? 'jpg' : 'mp4'}`);
        fs.writeFileSync(filePath, buffer);

        // ✅ Enviar la imagen o video recuperado al chat
        await sock.sendMessage(chatId, {
            [isImage ? 'image' : 'video']: fs.readFileSync(filePath),
            caption: `🔎 *Recuperado de "Ver una vez"*`,
        });

        // ✅ Eliminar el archivo después de enviarlo
        fs.unlinkSync(filePath);

    } catch (error) {
        console.error('❌ Error en el comando .ver:', error);
        await sock.sendMessage(chatId, { text: '❌ *Error:* No se pudo recuperar el mensaje.' });
    }
}

module.exports = verCommand;

