const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs').promises;
const path = require('path');

const channelInfo = {
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'KnightBot MD',
            serverMessageId: -1
        }
    }
};

async function viewOnceCommand(sock, chatId, message) {
    try {
        // Buscar mensaje citado con ViewOnce
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage) {
            await sock.sendMessage(chatId, {
                text: '❌ *Debes responder a un mensaje con "Ver una vez" activado!*',
                ...channelInfo
            });
            return;
        }

        // Verificar si el mensaje es una imagen o video de "Ver una vez"
        const mediaMessage = quotedMessage.viewOnceMessage?.message?.imageMessage ||
                             quotedMessage.viewOnceMessage?.message?.videoMessage;

        if (!mediaMessage) {
            await sock.sendMessage(chatId, {
                text: '❌ *Este mensaje no es de "Ver una vez".*',
                ...channelInfo
            });
            return;
        }

        // Determinar tipo de contenido (imagen o video)
        const mediaType = mediaMessage.mimetype.includes('image') ? 'image' : 'video';
        console.log(`📥 Procesando mensaje ViewOnce (${mediaType})...`);

        // Descargar el contenido multimedia
        const stream = await downloadContentFromMessage(mediaMessage, mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Crear directorio temporal si no existe
        const tempDir = path.join(__dirname, '../temp');
        await fs.mkdir(tempDir, { recursive: true });

        // Guardar archivo temporal
        const tempFile = path.join(tempDir, `viewonce_${Date.now()}.${mediaType === 'image' ? 'jpg' : 'mp4'}`);
        await fs.writeFile(tempFile, buffer);

        // Enviar el archivo de vuelta al chat
        await sock.sendMessage(chatId, {
            [mediaType]: { url: tempFile },
            caption: `*💀 KnightBot Anti-ViewOnce 💀*\n\n*🔍 Tipo:* ${mediaType === 'image' ? '📸 Imagen' : '🎥 Video'}`,
            ...channelInfo
        });

        // Eliminar archivo temporal después de enviarlo
        await fs.unlink(tempFile);

        console.log(`✅ Mensaje ViewOnce (${mediaType}) procesado con éxito.`);
        
    } catch (error) {
        console.error('❌ Error en el comando ViewOnce:', error);
        await sock.sendMessage(chatId, {
            text: `❌ *Error al procesar el mensaje "Ver una vez".*\n🔍 _Detalles:_ ${error.message}`,
            ...channelInfo
        });
    }
}

module.exports = viewOnceCommand;
