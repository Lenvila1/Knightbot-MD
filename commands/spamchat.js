async function spamChatCommand(sock, chatId, senderId, messageText) {
    try {
        const ownerNumber = '593963348736@s.whatsapp.net'; // 🔴 REEMPLAZA con tu número correctamente

        console.log(`Owner: ${ownerNumber}, Sender: ${senderId}`); // ✅ Depuración

        if (senderId !== ownerNumber) {
            await sock.sendMessage(chatId, { text: '❌ Solo el dueño del bot puede usar este comando.' });
            return;
        }

        if (!messageText) {
            await sock.sendMessage(chatId, { text: '❌ Escribe un mensaje para hacer spam.' });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants.map(p => p.id);

        let delay = 1000; // 🔹 1 segundo entre mensajes

        for (let i = 0; i < 30; i++) {
            setTimeout(async () => {
                await sock.sendMessage(chatId, {
                    text: messageText,
                    mentions: participants
                });
            }, i * delay);
        }

    } catch (error) {
        console.error('Error en spamChatCommand:', error);
        await sock.sendMessage(chatId, { text: '❌ Hubo un error ejecutando el comando.' });
    }
}

module.exports = spamChatCommand;


