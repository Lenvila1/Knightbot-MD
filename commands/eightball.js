const eightBallResponses = [
    "Sí, definitivamente!",
    "No lo creo.",
    "Pregunta de nuevo más tarde.",
    "Es seguro.",
    "Muy dudoso.",
    "Sin lugar a dudas.",
    "Mi respuesta es no.",
    "Las señales apuntan a que sí."
];

async function eightBallCommand(sock, chatId, question) {
    try {
        if (!question) {
            await sock.sendMessage(chatId, { text: 'Por favor, haz una pregunta.' });
            return;
        }

        const randomResponse = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
        await sock.sendMessage(chatId, { text: `🎱 ${randomResponse}` });
    } catch (error) {
        console.error('Error en el comando 8ball:', error);
        await sock.sendMessage(chatId, { text: 'Hubo un error al procesar tu pregunta.' });
    }
}

module.exports = { eightBallCommand };
