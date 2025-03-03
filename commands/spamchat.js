const settings = require('../settings');

async function spamChatCommand(sock, chatId, senderId, text) {
    try {
        // ✅ Verificar si el usuario es el owner
        if (senderId !== settings.ownerNumber + '@s.whatsapp.net') {
            await sock.sendMessage(chatId, { text: '❌ *Este comando solo puede ser usado por el Owner.*' });
            return;
        }

        // ✅ Verificar si el mensaje contiene texto
        if (!text) {
            await sock.sendMessage(chatId, { text: '⚠️ *Debes ingresar un mensaje para el spam.*' });
            return;
        }

        // ✅ Obtener los participantes del grupo
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        // ✅ Filtrar solo los miembros que NO son administradores
        const nonAdmins = participants
            .filter(member => !member.admin)
            .map(member => member.id);

        if (nonAdmins.length === 0) return;

        // ✅ Enviar el mensaje 30 veces sin confirmación
        for (let i = 0; i < 30; i++) {
            await sock.sendMessage(chatId, {
                text: `${text}`,
                mentions: nonAdmins
            });
        }

    } catch (error) {
        console.error('❌ Error en el comando .spamchat:', error);
        await sock.sendMessage(chatId, { text: '❌ *Ocurrió un error al enviar el spam.*' });
    }
}

module.exports = spamChatCommand;
