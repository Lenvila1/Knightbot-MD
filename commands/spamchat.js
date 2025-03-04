async function spamChatCommand(sock, chatId, senderId, messageText) {
    try {
        // Solo el dueño puede usar el comando
        const botOwner = '593963348736@s.whatsapp.net'; // ?? REEMPLAZA con tu número

        if (senderId !== botOwner) {
            await sock.sendMessage(chatId, { text: '❌ Only the bot owner can use this command!' });
            return;
        }

        if (!messageText || messageText.trim() === '') {
            await sock.sendMessage(chatId, { text: '❌ Please provide a message to spam!' });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants.map(p => p.id);

        let delay = 500; // ?? 0.5 segundos de espera entre mensajes

        for (let i = 0; i < 30; i++) {
            setTimeout(async () => {
                await sock.sendMessage(chatId, {
                    text: `${messageText.trim()}`, // ✅ Mantiene exactamente el formato del mensaje original
                    mentions: participants
                });
            }, i * delay); // ?? Cada mensaje se envía con retraso progresivo
        }

    } catch (error) {
        console.error('❌ Error in spamChatCommand:', error);
        await sock.sendMessage(chatId, { text: '❌ Error executing spam chat command.' });
    }
}

module.exports = spamChatCommand;


