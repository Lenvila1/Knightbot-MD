const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

async function attpCommand(sock, chatId, message) {
    const userMessage = message.message.conversation || message.message.extendedTextMessage?.text || '';
    const text = userMessage.split(' ').slice(1).join(' ');

    if (!text) {
        await sock.sendMessage(chatId, { text: '⚠️ *Debes proporcionar un texto después del comando .attp*' });
        return;
    }

    const width = 512;
    const height = 512;
    const stickerPath = path.join(__dirname, './temp', `sticker-${Date.now()}.png`);

    try {
        const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
        const image = new Jimp(width, height, '#FFFFFF');

        const textWidth = Jimp.measureText(font, text);
        const textHeight = Jimp.measureTextHeight(font, text, width);

        const x = (width - textWidth) / 2;
        const y = (height - textHeight) / 2;

        image.print(font, x, y, text, width);
        await image.writeAsync(stickerPath);

        const stickerBuffer = await sharp(stickerPath)
            .resize(512, 512, { fit: 'cover' })
            .webp()
            .toBuffer();

        await sock.sendMessage(chatId, {
            sticker: stickerBuffer,
            mimetype: 'image/webp',
            packname: 'Paquete de Stickers', 
            author: 'Mi Bot', 
        });

        fs.unlinkSync(stickerPath);
    } catch (error) {
        console.error('Error al generar el sticker:', error);
        await sock.sendMessage(chatId, { text: '❌ *Error al generar el sticker. Inténtalo nuevamente más tarde.*' });
    }
}

module.exports = attpCommand;
