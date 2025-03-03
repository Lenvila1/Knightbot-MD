const sharp = require('sharp');
const fs = require('fs');
const fsPromises = require('fs/promises');
const fse = require('fs-extra');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const tempDir = './temp';
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

// Función para eliminar archivos temporales después de un tiempo
const scheduleFileDeletion = (filePath) => {
    setTimeout(async () => {
        try {
            await fse.remove(filePath);
            console.log(`Archivo eliminado: ${filePath}`);
        } catch (error) {
            console.error(`Error al eliminar archivo:`, error);
        }
    }, 10000); // Eliminar después de 10 segundos
};

const convertStickerToImage = async (sock, quotedMessage, chatId) => {
    try {
        const stickerMessage = quotedMessage.stickerMessage;
        if (!stickerMessage) {
            await sock.sendMessage(chatId, { text: '❌ Responde a un sticker con *.simage* para convertirlo en imagen.' });
            return;
        }

        const stickerFilePath = path.join(tempDir, `sticker_${Date.now()}.webp`);
        const outputImagePath = path.join(tempDir, `converted_image_${Date.now()}.png`);

        const stream = await downloadContentFromMessage(stickerMessage, 'sticker');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        await fsPromises.writeFile(stickerFilePath, buffer);
        await sharp(stickerFilePath).toFormat('png').toFile(outputImagePath);

        const imageBuffer = await fsPromises.readFile(outputImagePath);
        await sock.sendMessage(chatId, { 
            image: imageBuffer, 
            caption: '✅ ¡Aquí está tu imagen convertida!' 
        });

        // Programar eliminación de archivos temporales
        scheduleFileDeletion(stickerFilePath);
        scheduleFileDeletion(outputImagePath);
    } catch (error) {
        console.error('Error al convertir sticker a imagen:', error);
        await sock.sendMessage(chatId, { text: '❌ Ocurrió un error al convertir el sticker en imagen. Inténtalo de nuevo.' });
    }
};

module.exports = convertStickerToImage;

