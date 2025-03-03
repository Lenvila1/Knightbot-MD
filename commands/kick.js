const isAdmin = require('../helpers/isAdmin');

async function kickCommand(sock, chatId, senderId, mentionedJids, message) {
    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

    if (!isBotAdmin) {
        await sock.sendMessage(chatId, { text: '❌ El bot debe ser administrador para poder expulsar usuarios.' });
        return;
    }

    if (!isSenderAdmin) {
        await sock.sendMessage(chatId, { text: '⚠️ Solo los administradores del grupo pueden usar el comando de expulsión.' });
        return;
    }

    let usersToKick = [];
    
    // Verifica si hay usuarios mencionados
    if (mentionedJids && mentionedJids.length > 0) {
        usersToKick = mentionedJids;
    }
    // Verifica si se respondió a un mensaje
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        usersToKick = [message.message.extendedTextMessage.contextInfo.participant];
    }
    
    // Si no se encontró ningún usuario para expulsar
    if (usersToKick.length === 0) {
        await sock.sendMessage(chatId, { 
            text: '⚠️ Menciona al usuario o responde a su mensaje para expulsarlo.'
        });
        return;
    }

    try {
        await sock.groupParticipantsUpdate(chatId, usersToKick, "remove");
        
        // Obtener los nombres de usuario de los expulsados
        const usernames = usersToKick.map(jid => `@${jid.split('@')[0]}`);

        await sock.sendMessage(chatId, { 
            text: `✅ ${usernames.join(', ')} ha sido expulsado correctamente.`,
            mentions: usersToKick
        });
    } catch (error) {
        console.error('❌ Error en el comando de expulsión:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ No se pudo expulsar al usuario. Inténtalo de nuevo.'
        });
    }
}

module.exports = kickCommand;
