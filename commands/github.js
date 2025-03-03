async function githubCommand(sock, chatId) {
    const repoInfo = `*🤖 KnightBot MD* 

*📂 Repositorio en GitHub:*
🔗 https://github.com/Levila1/Knightbot-MD

🌟 _¡Dale una estrella ⭐ al repositorio si te gusta el bot!_`;

    try {
        await sock.sendMessage(chatId, {
            text: repoInfo
        });
    } catch (error) {
        console.error('Error en el comando github:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error al obtener la información del repositorio.' 
        });
    }
}

module.exports = githubCommand;
