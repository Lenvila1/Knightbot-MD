const isAdmin = require('../helpers/isAdmin');

async function unmuteCommand(sock, chatId, senderId) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Necesito ser administrador para desmutear el grupo.*' 
            });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { 
                text: '⚠️ *Solo los administradores pueden usar este comando.*' 
            });
            return;
        }

        // Desmutear el grupo
        await sock.groupSettingUpdate(chatId, 'not_announcement'); 
        await sock.sendMessage(chatId, { 
            text: '✅ *El grupo ha sido desmuteado. Todos pueden enviar mensajes.*' 
        });

    } catch (error) {
        console.error('❌ Error en el comando unmute:', error);
        await sock.sendMessage(chatId, { 
            text: '🚨 *Ocurrió un error al intentar desmutear el grupo. Inténtalo de nuevo.*' 
        });
    }
}

module.exports = unmuteCommand;
