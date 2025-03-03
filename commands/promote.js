const { isAdmin } = require('../helpers/isAdmin');

// Función para manejar promociones manuales a través del comando
async function promoteCommand(sock, chatId, mentionedJids, message) {
    let userToPromote = [];
    
    // Verificar si se mencionaron usuarios
    if (mentionedJids && mentionedJids.length > 0) {
        userToPromote = mentionedJids;
    }
    // Verificar si se respondió a un mensaje
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToPromote = [message.message.extendedTextMessage.contextInfo.participant];
    }
    
    // Si no se encontró ningún usuario
    if (userToPromote.length === 0) {
        await sock.sendMessage(chatId, { 
            text: '❌ Menciona a un usuario o responde a su mensaje para promoverlo a administrador.' 
        });
        return;
    }

    try {
        await sock.groupParticipantsUpdate(chatId, userToPromote, "promote");
        
        // Obtener los nombres de usuario de los promovidos
        const usernames = await Promise.all(userToPromote.map(async jid => {
            return `@${jid.split('@')[0]}`;
        }));

        // Obtener el nombre del usuario que hizo la promoción (el bot en este caso)
        const promoterJid = sock.user.id;
        
        const promotionMessage = `*『 PROMOCIÓN EN EL GRUPO 』*\n\n` +
            `👥 *Usuario(s) promovido(s):*\n` +
            `${usernames.map(name => `• ${name}`).join('\n')}\n\n` +
            `👑 *Promovido por:* @${promoterJid.split('@')[0]}\n\n` +
            `📅 *Fecha:* ${new Date().toLocaleString()}`;
        
        await sock.sendMessage(chatId, { 
            text: promotionMessage,
            mentions: [...userToPromote, promoterJid]
        });
    } catch (error) {
        console.error('Error en el comando de promoción:', error);
        await sock.sendMessage(chatId, { text: '❌ No se pudo promover al usuario.' });
    }
}

// Función para manejar promociones automáticas detectadas en el grupo
async function handlePromotionEvent(sock, groupId, participants, author) {
    try {
        console.log('Evento de promoción detectado:', {
            groupId,
            participants,
            author
        });

        // Obtener nombres de los participantes promovidos
        const promotedUsernames = await Promise.all(participants.map(async jid => {
            return `@${jid.split('@')[0]}`;
        }));

        let promotedBy;
        let mentionList = [...participants];

        if (author && author.length > 0) {
            // Asegurar que el autor tenga el formato correcto
            const authorJid = author;
            promotedBy = `@${authorJid.split('@')[0]}`;
            mentionList.push(authorJid);
        } else {
            promotedBy = 'Sistema';
        }

        const promotionMessage = `*『 PROMOCIÓN EN EL GRUPO 』*\n\n` +
            `👥 *Usuario(s) promovido(s):*\n` +
            `${promotedUsernames.map(name => `• ${name}`).join('\n')}\n\n` +
            `👑 *Promovido por:* ${promotedBy}\n\n` +
            `📅 *Fecha:* ${new Date().toLocaleString()}`;
        
        await sock.sendMessage(groupId, {
            text: promotionMessage,
            mentions: mentionList
        });
    } catch (error) {
        console.error('Error al manejar evento de promoción:', error);
    }
}

module.exports = { promoteCommand, handlePromotionEvent };

