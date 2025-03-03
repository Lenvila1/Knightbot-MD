const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const webp = require('node-webpmux');
const crypto = require('crypto');

async function stickerCommand(sock, chatId, message) {
    let mediaMessage;

    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedMessage = message.message.extendedTextMessage.contextInfo.quotedMessage;
        mediaMessage = quotedMessage.imageMessage || quotedMessage.videoMessage || quotedMessage.documentMessage;
        message = { message: quotedMessage };
    } else {
        mediaMessage = message.message?.imageMessage || message.message?.videoMessage || message.message?.documentMessage;
    }

    if (!mediaMessage) {
        await sock.sendMessage(chatId, { text: '❌ Responde a una imagen, video o GIF para crear un sticker.' });
        return;
    }

    try {
        const mediaBuffer = await downloadMediaMessage(message, 'buffer', {}, { 
            logger: undefined, 
            reuploadRequest: sock.updateMediaMessage 
        });

        if (!mediaBuffer) {
            await sock.sendMessage(chatId, { text: '❌ No se pudo descargar el archivo. Intenta de nuevo.' });
            return;
        }

        // Crear carpeta temporal si no existe
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        // Generar nombres de archivos temporales
        const tempInput = path.join(tempDir, `temp_${Date.now()}`);
        const tempOutput = path.join(tempDir, `sticker_${Date.now()}.webp`);

        // Guardar el archivo temporalmente
        fs.writeFileSync(tempInput, mediaBuffer);

        // Configurar el comando de conversión con ffmpeg
        const isAnimated = mediaMessage.mimetype?.includes('gif') || mediaMessage.seconds > 0;
        
        const ffmpegCommand = isAnimated
            ? `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`
            : `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;

        await new Promise((resolve, reject) => {
            exec(ffmpegCommand, (error) => {
                if (error) {
                    console.error('FFmpeg error:', error);
                    reject(error);
                } else resolve();
            });
        });

        // Leer el archivo WebP
        const webpBuffer = fs.readFileSync(tempOutput);

        // Agregar metadatos usando webpmux
        const img = new webp.Image();
        await img.load(webpBuffer);

        // Crear metadatos
        const json = {
            'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
            'sticker-pack-name': settings.packname || 'KnightBot',
            'sticker-pack-publisher': settings.author || '@bot',
            'emojis': ['🤖']
        };

        // Crear buffer EXIF
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
        const exif = Buffer.concat([exifAttr, jsonBuffer]);
        exif.writeUIntLE(jsonBuffer.length, 14, 4);

        // Insertar los metadatos
        img.exif = exif;

        // Guardar el sticker con metadatos
        const finalBuffer = await img.save(null);

        // Enviar el sticker
        await sock.sendMessage(chatId, { sticker: finalBuffer });

        // Eliminar archivos temporales
        try {
            fs.unlinkSync(tempInput);
            fs.unlinkSync(tempOutput);
        } catch (err) {
            console.error('Error eliminando archivos temporales:', err);
        }

    } catch (error) {
        console.error('Error en el comando de sticker:', error);
        await sock.sendMessage(chatId, { text: '❌ Error al crear el sticker. Intenta de nuevo más tarde.' });
    }
}

module.exports = stickerCommand;
