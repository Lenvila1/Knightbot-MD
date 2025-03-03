const fs = require('fs');

async function banCommand(sock, chatId, message) {
    let userToBan;
    
    // Verificar si se mencionó a un usuario
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToBan = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Verificar si se respondió a un mensaje
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToBan = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToBan) {
        await sock.sendMessage(chatId, { 
            text: '❌ *Debes mencionar a un usuario o responder a su mensaje para prohibirlo!*'
        });
        return;
    }

    try {
        // Agregar el usuario a la lista de prohibidos
        const bannedUsers = JSON.parse(fs.readFileSync('./database/banned.json'));
        if (!bannedUsers.includes(userToBan)) {
            bannedUsers.push(userToBan);
            fs.writeFileSync('./database/banned.json', JSON.stringify(bannedUsers, null, 2));
            
            await sock.sendMessage(chatId, { 
                text: `✅ *El usuario @${userToBan.split('@')[0]} ha sido prohibido con éxito!*`,
                mentions: [userToBan]
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: `⚠️ *El usuario @${userToBan.split('@')[0]} ya está prohibido.*`,
                mentions: [userToBan]
            });
        }
    } catch (error) {
        console.error('Error en el comando de prohibición:', error);
        await sock.sendMessage(chatId, { text: '❌ *Error al prohibir al usuario.*' });
    }
}

module.exports = banCommand;
