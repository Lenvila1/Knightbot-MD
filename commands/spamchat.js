async function spamChatCommand(sock, chatId, senderId, message) {
    try {
        // ? Verificar si el usuario es el OWNER
        const botOwner = '593963348736@s.whatsapp.net'; // ?? Reemplaza con tu número en formato internacional
        if (senderId !== botOwner) {
            await sock.sendMessage(chatId, { text: '? Solo el *Owner* puede usar este comando.' });
            return;
        }

        // ? Extraer el mensaje de spam correctamente
        const text = message.message?.conversation || 
                     message.message?.extendedTextMessage?.text || 
                     message.message?.imageMessage?.caption || 
                     message.message?.videoMessage?.caption;

        if (!text || text.trim() === '.spamchat') { 
            await sock.sendMessage(chatId, { text: '? Debes ingresar un mensaje para spamear.\n\nEjemplo:\n.spamchat Esto es una prueba' });
            return;
        }

        // ? Obtener los participantes del grupo y excluir administradores
        const groupMetadata = await sock.groupMetadata(chatId);
        const nonAdmins = groupMetadata.participants
            .filter(member => !member.admin)
            .map(member => member.id);

        if (nonAdmins.length === 0) {
            await sock.sendMessage(chatId, { text: '? No hay miembros normales en este grupo para etiquetar.' });
            return;
        }

        // ? Tiempo de espera entre mensajes (0.5 segundos)
        let delay = 500; 

        // ? Enviar el mensaje 30 veces con 0.5 segundos de retraso
        for (let i = 0; i < 30; i++) {
            await sock.sendMessage(chatId, { 
                text: `${text}`, // ? Mantiene el texto sin cambiar mayúsculas/minúsculas
                mentions: nonAdmins 
            });
            await new Promise(resolve => setTimeout(resolve, delay)); // Aplicar delay
        }

    } catch (error) {
        console.error('? Error en spamChatCommand:', error);
        await sock.sendMessage(chatId, { text: '? Error al ejecutar el comando de spam.' });
    }
}

module.exports = spamChatCommand;
