async function resetlinkCommand(sock, chatId, senderId) {
    try {
        // Obtener la información del grupo
        const groupMetadata = await sock.groupMetadata(chatId);
        
        // Verificar si el remitente es administrador
        const isAdmin = groupMetadata.participants
            .filter(p => p.admin)
            .map(p => p.id)
            .includes(senderId);

        // Verificar si el bot es administrador
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = groupMetadata.participants
            .filter(p => p.admin)
            .map(p => p.id)
            .includes(botId);

        if (!isAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Solo los administradores pueden usar este comando.' });
            return;
        }

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❌ El bot debe ser administrador para restablecer el enlace del grupo.' });
            return;
        }

        // Restablecer el enlace del grupo
        const newCode = await sock.groupRevokeInvite(chatId);
        
        // Enviar el nuevo enlace del grupo
        await sock.sendMessage(chatId, { 
            text: `✅ El enlace del grupo ha sido restablecido con éxito.\n\n📌 *Nuevo enlace:*\nhttps://chat.whatsapp.com/${newCode}`
        });

    } catch (error) {
        console.error('Error en el comando resetlink:', error);
        await sock.sendMessage(chatId, { text: '❌ No se pudo restablecer el enlace del grupo.' });
    }
}

module.exports = resetlinkCommand;
