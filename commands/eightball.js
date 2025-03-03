const eightBallResponses = [
    "Sí, definitivamente.",
    "¡De ninguna manera!",
    "Pregunta de nuevo más tarde.",
    "Es cierto.",
    "Muy dudoso.",
    "Sin ninguna duda.",
    "Mi respuesta es no.",
    "Las señales apuntan a que sí."
];

async function eightBallCommand(sock, chatId, question) {
    if (!question) {
        await sock.sendMessage(chatId, { text: '¡Por favor, haz una pregunta!' });
        return;
    }

    const randomResponse = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
    await sock.sendMessage(chatId, { text: `🎱 ${randomResponse}` });
}

module.exports = { eightBallCommand };

    const randomResponse = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
    await sock.sendMessage(chatId, { text: `🎱 ${randomResponse}` });
}

module.exports = { eightBallCommand };
