const fs = require('fs');
const path = require('path');

const bannedUsersFile = path.join(__dirname, '../database/banned.json');

async function unbanCommand(sock, chatId, message) {
    let userToUnban;
    
    // Verifica si se mencionó a un usuario
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToUnban = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Verifica si se respondió a un mensaje
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToUnban = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToUnban) {
        await sock.sendMessage(chatId, { 
            text: '❌ *Debes mencionar un usuario o responder a su mensaje para desbanearlo.*'
        });
        return;
    }

    try {
        // Verificar si el archivo existe
        if (!fs.existsSync(bannedUsersFile)) {
            fs.writeFileSync(bannedUsersFile, JSON.stringify([])); 
        }

        // Cargar la lista de baneados
        const bannedUsers = JSON.parse(fs.readFileSync(bannedUsersFile));
        const index = bannedUsers.indexOf(userToUnban);

        if (index > -1) {
            // Eliminar usuario de la lista de baneados
            bannedUsers.splice(index, 1);
            fs.writeFileSync(bannedUsersFile, JSON.stringify(bannedUsers, null, 2));

            await sock.sendMessage(chatId, { 
                text: `✅ *El usuario @${userToUnban.split('@')[0]} ha sido desbaneado correctamente.*`,
                mentions: [userToUnban]
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: `⚠️ *El usuario @${userToUnban.split('@')[0]} no está baneado.*`,
                mentions: [userToUnban]
            });
        }
    } catch (error) {
        console.error('❌ Error en el comando unban:', error);
        await sock.sendMessage(chatId, { text: '🚨 *Error al intentar desbanear al usuario. Inténtalo de nuevo.*' });
    }
}

module.exports = unbanCommand;
