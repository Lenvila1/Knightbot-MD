const retos = [
    "¡Canta una canción para el grupo!",
    "Haz 10 flexiones.",
    "Habla con un acento divertido durante los próximos 5 minutos.",
    "Envía una selfie haciendo una cara graciosa.",
    "Deja que alguien escriba cualquier cosa desde tu teléfono."
];

async function dareCommand(sock, chatId) {
    const retoAleatorio = retos[Math.floor(Math.random() * retos.length)];
    await sock.sendMessage(chatId, { text: `🔥 Reto: ${retoAleatorio}` });
}

module.exports = { dareCommand };
