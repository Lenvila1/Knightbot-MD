const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const webp = require('node-webpmux');
const crypto = require('crypto');

async function takeCommand(sock, chatId, message, args) {
    try {
        // Verificar si el mensaje es una respuesta a un sticker
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage?.stickerMessage) {
            await sock.sendMessage(chatId, { text: '❌ *Responde a un sticker con* .take <nombre>' });
            return;
        }

        // Obtener el nombre del pack de stickers o usar un valor predeterminado
        const packname = args.join(' ') || 'KnightBot';
        const author = 'Bot';

        try {
            // Crear el directorio temporal si no existe
            const tmpDir = path.join(__dirname, '../tmp');
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir, { recursive: true });
            }

            // Descargar el sticker
            const stickerBuffer = await downloadMediaMessage(
                {
                    key: message.message.extendedTextMessage.contextInfo.stanzaId,
                    message: quotedMessage,
                    messageType: 'stickerMessage'
                },
                'buffer',
                {},
                {
                    logger: console,
                    reuploadRequest: sock.updateMediaMessage
                }
            );

            if (!stickerBuffer) {
                await sock.sendMessage(chatId, { text: '❌ *Error al descargar el sticker.*' });
                return;
            }

            // Convertir a WebP usando sharp
            const webpBuffer = await sharp(stickerBuffer)
                .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .webp()
                .toBuffer();

            // Cargar la imagen WebP y agregar metadata
            const img = new webp.Image();
            await img.load(webpBuffer);

            // Crear metadata personalizada
            const json = {
                'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
                'sticker-pack-name': packname,
                'sticker-pack-publisher': author,
                'emojis': ['🤖']
            };

            // Crear buffer con metadata
            const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
            const exif = Buffer.concat([exifAttr, jsonBuffer]);
            exif.writeUIntLE(jsonBuffer.length, 14, 4);

            // Asignar metadata al sticker
            img.exif = exif;

            // Obtener el buffer final con metadata
            const finalBuffer = await img.save(null);

            // Enviar el sticker con el nuevo packname y autor
            await sock.sendMessage(chatId, {
                sticker: finalBuffer
            });

        } catch (error) {
            console.error('❌ Error al procesar el sticker:', error);
            await sock.sendMessage(chatId, { text: '❌ *Error al modificar el sticker.*' });
        }

    } catch (error) {
        console.error('❌ Error en el comando take:', error);
        await sock.sendMessage(chatId, { text: '❌ *Error al ejecutar el comando.*' });
    }
}

module.exports = takeCommand;
