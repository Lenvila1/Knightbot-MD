const truths = [
    "¿Cuál es tu mayor miedo?",
    "¿Cuál ha sido tu momento más vergonzoso?",
    "Si pudieras ser invisible por un día, ¿qué harías?",
    "¿Quién fue tu primer amor?",
    "¿Qué es algo que nunca le has contado a nadie?",
    "¿Cuál es tu peor hábito?",
    "Si solo pudieras comer una comida por el resto de tu vida, ¿cuál sería?",
    "¿Alguna vez has mentido para evitar problemas?",
    "¿Cuál es el mayor secreto que has guardado?",
    "¿Has hecho algo de lo que te arrepientes mucho?"
];

async function truthCommand(sock, chatId) {
    const randomTruth = truths[Math.floor(Math.random() * truths.length)];
    await sock.sendMessage(chatId, { text: `🔮 *Verdad:* ${randomTruth}` });
}

module.exports = { truthCommand };
