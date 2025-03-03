async function aliveCommand(sock, chatId) {
    try {
        const message = `*🤖 Knight Bot está activo!*\n\n` +
                       `*Versión:* 1.0.0\n` +
                       `*Estado:* En línea\n` +
                       `*Modo:* Público\n\n` +
                       `*🌟 Funciones:*\n` +
                       `• Gestión de grupos\n` +
                       `• Protección contra enlaces\n` +
                       `• Comandos divertidos\n` +
                       `• ¡Y mucho más!\n\n` +
                       `Escribe *.menu* para ver la lista completa de comandos.`;

        await sock.sendMessage(chatId, { text: message });
    } catch (error) {
        console.error('Error en el comando alive:', error);
        await sock.sendMessage(chatId, { text: 'El bot está activo y en funcionamiento.' });
    }
}

module.exports = aliveCommand;
