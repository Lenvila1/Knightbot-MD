const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function stickerCommand(sock, chatId, message) {
    try {
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg) {
            await sock.sendMessage(chatId, { text: '❌ Responde a una imagen o video para convertirlo en sticker.' });
            return;
        }

        const type = Object.keys(quotedMsg)[0];
        if (!['imageMessage', 'videoMessage'].includes(type)) {
            await sock.sendMessage(chatId, { text: '❌ Solo puedes convertir imágenes o videos en stickers.' });
            return;
        }

        const stream = await downloadContentFromMessage(quotedMsg[type], type.split('Message')[0]);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const tempInput = path.join(tempDir, `temp_${Date.now()}.${type === 'imageMessage' ? 'jpg' : 'mp4'}`);
        const tempOutput = path.join(tempDir, `sticker_${Date.now()}.webp`);

        fs.writeFileSync(tempInput, buffer);

        // Convertir a WebP usando ffmpeg
        await new Promise((resolve, reject) => {
            const cmd = type === 'imageMessage' 
                ? `ffmpeg -i "${tempInput}" -vf "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease" -c:v libwebp -preset default -loop 0 -an -vsync 0 "${tempOutput}"`
                : `ffmpeg -i "${tempInput}" -vf "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease" -c:v libwebp -preset default -loop 0 -an -vsync 0 -t 6 "${tempOutput}"`;
            
            exec(cmd, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        await sock.sendMessage(chatId, { 
            sticker: fs.readFileSync(tempOutput)
        });

        // Limpiar archivos temporales
        fs.unlinkSync(tempInput);
        fs.unlinkSync(tempOutput);

    } catch (error) {
        console.error('Error en el comando sticker:', error);
        await sock.sendMessage(chatId, { text: '❌ No se pudo crear el sticker.' });
    }
}

module.exports = stickerCommand;
