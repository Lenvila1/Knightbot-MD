const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

async function wastedCommand(sock, chatId, message) {
    try {
        let userToWaste;

        // Obtener usuario mencionado o respondido
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            userToWaste = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToWaste = message.message.extendedTextMessage.contextInfo.participant;
        }

        if (!userToWaste) {
            await sock.sendMessage(chatId, { 
                text: '❌ Menciona a alguien o responde a su mensaje para aplicar el efecto "Wasted".'
            });
            return;
        }

        // Obtener foto de perfil
        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(userToWaste, 'image');
        } catch {
            profilePic = 'https://i.imgur.com/2wzGhpF.jpeg'; // Imagen por defecto si no tiene foto de perfil
        }

        // Directorio temporal
        const tempDir = path.join(process.cwd(), 'temp');
        await fs.mkdir(tempDir, { recursive: true });

        // Ruta para guardar imagen procesada
        const tempFile = path.join(tempDir, `wasted_${Date.now()}.png`);

        // Descargar la imagen generada con el efecto "Wasted"
        const wastedResponse = await axios.get(
            `https://some-random-api.com/canvas/overlay/wasted?avatar=${encodeURIComponent(profilePic)}`,
            { responseType: 'arraybuffer' }
        );

        await fs.writeFile(tempFile, wastedResponse.data);

        // Enviar imagen generada
        await sock.sendMessage(chatId, {
            image: { url: tempFile },
            caption: `⚰️ *Wasted* : @${userToWaste.split('@')[0]} 💀\n\n🕊️ Descansa en paz.`,
            mentions: [userToWaste]
        });

        // Limpiar archivo temporal
        setTimeout(() => fs.unlink(tempFile).catch(() => {}), 5000);

    } catch (error) {
        console.error('❌ Error en wastedCommand:', error);
        await sock.sendMessage(chatId, { 
            text: '⚠️ Ocurrió un error al aplicar el efecto "Wasted". Inténtalo más tarde.'
        });
    }
}

module.exports = wastedCommand;
