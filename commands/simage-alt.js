var { downloadContentFromMessage } = require('@whiskeysockets/baileys');
var { exec } = require('child_process');
var fs = require('fs');
const ffmpeg = require('ffmpeg-static');

async function simageCommand(sock, quotedMessage, chatId) {
    try {
        if (!quotedMessage?.stickerMessage) {
            await sock.sendMessage(chatId, { text: '❌ Debes responder a un sticker para convertirlo en imagen.' });
            return;
        }

        const stream = await downloadContentFromMessage(quotedMessage.stickerMessage, 'sticker');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const tempSticker = `/app/temp/temp_${Date.now()}.webp`;
        const tempOutput = `/app/temp/image_${Date.now()}.png`;
        
        fs.writeFileSync(tempSticker, buffer);

        // Convertir de webp a png usando ffmpeg
        await new Promise((resolve, reject) => {
            exec(`${ffmpeg} -i ${tempSticker} ${tempOutput}`, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        await sock.sendMessage(chatId, { 
            image: fs.readFileSync(tempOutput),
            caption: '✅ ¡Aquí está tu imagen convertida!' 
        });

        // Eliminar archivos temporales
        fs.unlinkSync(tempSticker);
        fs.unlinkSync(tempOutput);

    } catch (error) {
        console.error('Error en el comando simage:', error);
        await sock.sendMessage(chatId, { text: '❌ No se pudo convertir el sticker en imagen. Intenta nuevamente.' });
    }
}

module.exports = simageCommand;
