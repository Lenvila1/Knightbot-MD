const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');

async function blurCommand(sock, chatId, message, quotedMessage) {
    try {
        let imageBuffer;

        // Obtener la imagen a desenfocar
        if (quotedMessage) {
            if (!quotedMessage.imageMessage) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Debes responder a una imagen.' 
                });
                return;
            }

            const quoted = { message: { imageMessage: quotedMessage.imageMessage } };
            imageBuffer = await downloadMediaMessage(quoted, 'buffer', {}, {});
        } else if (message.message?.imageMessage) {
            imageBuffer = await downloadMediaMessage(message, 'buffer', {}, {});
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ Envía una imagen o responde a una con el comando .blur' 
            });
            return;
        }

        // Redimensionar y optimizar imagen
        const resizedImage = await sharp(imageBuffer)
            .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();

        // Aplicar efecto de desenfoque
        const blurredImage = await sharp(resizedImage)
            .blur(10) 
            .toBuffer();

        // Enviar la imagen desenfocada
        await sock.sendMessage(chatId, {
            image: blurredImage,
            caption: '*✅ Imagen desenfocada con éxito*'
        });

    } catch (error) {
        console.error('Error en el comando blur:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ No se pudo desenfocar la imagen. Inténtalo de nuevo más tarde.' 
        });
    }
}

module.exports = blurCommand;
