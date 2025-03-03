const isAdmin = require('../helpers/isAdmin'); // Función para verificar si es admin

async function tagAllCommand(sock, chatId, senderId) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, {
                text: '❌ *Solo los administradores pueden usar el comando .tagall*'
            });
            return;
        }

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: '❌ *Debo ser administrador para etiquetar a todos!*'
            });
            return;
        }

        // Obtener información del grupo
        const groupMetadata = await sock.groupMetadata(chatId);
        const participantes = groupMetadata.participants;

        if (!participantes || participantes.length === 0) {
            await sock.sendMessage(chatId, { text: '❌ *No se encontraron participantes en el grupo.*' });
            return;
        }

        // Crear mensaje con cada miembro en una nueva línea
        let mensaje = `🔊 *Miembros del grupo:*\n\n`;
        participantes.forEach(part => {
            mensaje += `• @${part.id.split('@')[0]}\n`;
        });

        // Enviar mensaje con menciones
        await sock.sendMessage(chatId, {
            text: mensaje,
            mentions: participantes.map(p => p.id)
        });

    } catch (error) {
        console.error('❌ Error en el comando tagall:', error);
        await sock.sendMessage(chatId, { text: '❌ *Ocurrió un error al etiquetar a todos.*' });
    }
}

module.exports = tagAllCommand;  // Exportar el módulo
