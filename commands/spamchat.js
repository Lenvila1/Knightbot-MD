const { isAdmin } = require('../helpers/isAdmin');

async function spamChatCommand(sock, chatId, senderId, message) {
    try {
        // ✅ Verificar si el usuario es el OWNER
        const botOwner = '593963348736@s.whatsapp.net'; // 🔹 Reemplaza con tu número en formato internacional
        if (senderId !== botOwner) {
            await sock.sendMessage(chatId, { text: '❌ Solo el *Owner* puede usar este comando.' });
            return;
        }

        // ✅ Extraer el mensaje de spam
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        if (!text) {
            await sock.sendMessage(chatId, { text: '❌ Debes ingresar un mensaje para spamear.\n\nEjemplo:\n.spamchat Esto es una prueba' });
            return;
        }

        // ✅ Obtener los participantes del grupo y excluir administradores
        const groupMetadata = await sock.groupMetadata(chatId);
        const nonAdmins = groupMetadata.participants
            .filter(member => !member.admin)
            .map(member => member.id); 

        // ✅ Enviar el mensaje 30 veces con 0.5 segundos de retraso
        for (let i = 0; i < 30; i++) {
            await sock.sendMessage(chatId, { 
                text: text, 
                mentions: nonAdmins 
            });
            await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 segundos de retraso
        }

    } catch (error) {
        console.error('❌ Error en spamChatCommand:', error);
        await sock.sendMessage(chatId, { text: '❌ Error al ejecutar el comando de spam.' });
    }
}

module.exports = spamChatCommand;
