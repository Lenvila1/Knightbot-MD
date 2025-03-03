const isAdmin = require('../helpers/isAdmin');

async function muteCommand(sock, chatId, senderId, durationInMinutes) {
    console.log(`Intentando silenciar el grupo por ${durationInMinutes} minutos.`); // Log para depuración

    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
    if (!isBotAdmin) {
        await sock.sendMessage(chatId, { text: '❌ *Debo ser administrador para poder silenciar el grupo.*' });
        return;
    }

    if (!isSenderAdmin) {
        await sock.sendMessage(chatId, { text: '❌ *Solo los administradores del grupo pueden usar este comando.*' });
        return;
    }

    const durationInMilliseconds = durationInMinutes * 60 * 1000;
    try {
        await sock.groupSettingUpdate(chatId, 'announcement'); // Silenciar el grupo
        await sock.sendMessage(chatId, { text: `🔇 *El grupo ha sido silenciado por ${durationInMinutes} minutos.*` });

        setTimeout(async () => {
            await sock.groupSettingUpdate(chatId, 'not_announcement'); // Quitar silencio después del tiempo indicado
            await sock.sendMessage(chatId, { text: '🔊 *El grupo ha sido reactivado.*' });
        }, durationInMilliseconds);
    } catch (error) {
        console.error('❌ Error al silenciar/reactivar el grupo:', error);
        await sock.sendMessage(chatId, { text: '❌ *Ocurrió un error al intentar silenciar/reactivar el grupo. Inténtalo nuevamente.*' });
    }
}

module.exports = muteCommand;
