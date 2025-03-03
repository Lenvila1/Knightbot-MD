async function shipCommand(sock, chatId, msg, groupMetadata) {
    try {
        // Obtener todos los participantes del grupo
        const participants = await sock.groupMetadata(chatId);
        const ps = participants.participants.map(v => v.id);
        
        // Obtener dos participantes aleatorios
        let firstUser, secondUser;
        
        // Seleccionar el primer usuario al azar
        firstUser = ps[Math.floor(Math.random() * ps.length)];
        
        // Seleccionar el segundo usuario al azar (que no sea el mismo que el primero)
        do {
            secondUser = ps[Math.floor(Math.random() * ps.length)];
        } while (secondUser === firstUser);

        // Formatear las menciones
        const formatMention = id => '@' + id.split('@')[0];

        // Crear y enviar el mensaje de shippeo
        await sock.sendMessage(chatId, {
            text: `❤️ ¡Nueva pareja formada! ❤️\n\n${formatMention(firstUser)} 💞 ${formatMention(secondUser)}\n🎉 ¡Felicidades! 💖🥂`,
            mentions: [firstUser, secondUser]
        });

    } catch (error) {
        console.error('Error en el comando ship:', error);
        await sock.sendMessage(chatId, { text: '❌ No se pudo hacer el shippeo. Asegúrate de que esto es un grupo.' });
    }
}

module.exports = shipCommand;
