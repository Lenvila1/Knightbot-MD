const isAdmin = require('../helpers/isAdmin');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

async function descargarMensajeMedia(message, tipoMedia) {
    const stream = await downloadContentFromMessage(message, tipoMedia);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    const rutaArchivo = path.join(__dirname, '../temp/', `${Date.now()}.${tipoMedia}`);
    fs.writeFileSync(rutaArchivo, buffer);
    return rutaArchivo;
}

async function tagCommand(sock, chatId, senderId, messageText, replyMessage) {
    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

    if (!isBotAdmin) {
        await sock.sendMessage(chatId, { text: '❌ *Debo ser administrador para etiquetar a todos!*' });
        return;
    }

    if (!isSenderAdmin) {
        const stickerPath = './assets/sticktag.webp';  // Ruta al sticker personalizado
        if (fs.existsSync(stickerPath)) {
            const stickerBuffer = fs.readFileSync(stickerPath);
            await sock.sendMessage(chatId, { sticker: stickerBuffer });
        }
        return;
    }

    // Obtener información del grupo
    const groupMetadata = await sock.groupMetadata(chatId);
    const participantes = groupMetadata.participants;
    const listaEtiquetas = participantes.map(p => p.id);

    // Si es una respuesta a un mensaje
    if (replyMessage) {
        let contenidoMensaje = {};

        // Si es una imagen
        if (replyMessage.imageMessage) {
            const rutaArchivo = await descargarMensajeMedia(replyMessage.imageMessage, 'image');
            contenidoMensaje = {
                image: { url: rutaArchivo },
                caption: messageText || replyMessage.imageMessage.caption || '',
                mentions: listaEtiquetas
            };
        }
        // Si es un video
        else if (replyMessage.videoMessage) {
            const rutaArchivo = await descargarMensajeMedia(replyMessage.videoMessage, 'video');
            contenidoMensaje = {
                video: { url: rutaArchivo },
                caption: messageText || replyMessage.videoMessage.caption || '',
                mentions: listaEtiquetas
            };
        }
        // Si es un mensaje de texto
        else if (replyMessage.conversation || replyMessage.extendedTextMessage) {
            contenidoMensaje = {
                text: replyMessage.conversation || replyMessage.extendedTextMessage.text,
                mentions: listaEtiquetas
            };
        }
        // Si es un documento
        else if (replyMessage.documentMessage) {
            const rutaArchivo = await descargarMensajeMedia(replyMessage.documentMessage, 'document');
            contenidoMensaje = {
                document: { url: rutaArchivo },
                fileName: replyMessage.documentMessage.fileName,
                caption: messageText || '',
                mentions: listaEtiquetas
            };
        }

        if (Object.keys(contenidoMensaje).length > 0) {
            await sock.sendMessage(chatId, contenidoMensaje);
        }
    } else {
        // Enviar solo un mensaje etiquetando a todos
        await sock.sendMessage(chatId, {
            text: messageText || "🔔 *Etiquetando a todos...*",
            mentions: listaEtiquetas
        });
    }
}

module.exports = tagCommand;
