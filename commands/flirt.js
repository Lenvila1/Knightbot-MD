const frasesCoqueteo = [
    "¿Eres un mago? Porque cada vez que te miro, todos los demás desaparecen.",
    "¿Tienes un mapa? Porque me he perdido en tus ojos.",
    "¿Tu nombre es Google? Porque tienes todo lo que estoy buscando.",
    "¿Crees en el amor a primera vista o debería pasar de nuevo?",
    "Si fueras una verdura, serías un pepi-guapo.",
    "¿Eres una multa de tráfico? Porque tienes 'MUY ATRACTIVO' escrito por todas partes.",
    "¿Tu papá es panadero? Porque eres un pastelito.",
    "¿Tienes una curita? Me lastimé la rodilla al caer por ti.",
    "Si la belleza fuera tiempo, tú serías una eternidad.",
    "¿Eres Wi-Fi? Porque siento una conexión contigo.",

    // Frases adicionales en español
    "¿Eres francés? Porque Eiffel por ti.",
    "¿Me prestas un beso? Prometo devolvértelo.",
    "¿Crees en el destino? Porque creo que acabamos de encontrarnos.",
    "¿Eres una fogata? Porque estás muy caliente y quiero más de ti.",
    "Si pudiera reordenar el abecedario, pondría la U y la I juntas.",
    "¿Eres una tormenta de nieve? Porque has acelerado mi corazón.",
    "¿Tu nombre es Chapstick? Porque eres la crema de mis labios.",
    "Disculpa, pero creo que se te cayó algo: ¡MI MANDÍBULA!",
    "¿Eres un viajero en el tiempo? Porque te veo en mi futuro.",
    "Tu mano se ve pesada, ¿puedo sostenerla por ti?",
    "¿Eres un préstamo bancario? Porque tienes todo mi interés.",
    "¿Tienes una quemadura de sol o siempre eres así de ardiente?",
    "¿Eres un ángel? Porque el cielo ha perdido uno.",
    "Debes estar hecha de cobre y telurio porque eres Cu-Te.",
    "¿Estás cansado/a? Porque has estado corriendo por mi mente todo el día.",
    "¿Tienes un espejo en el bolsillo? Porque me veo en tu pantalón.",
    "Eres como un buen vino; no puedo dejar de mirarte.",
    "¿Podemos tomarnos una foto juntos? Quiero demostrarle a mis amigos que los ángeles existen.",
    "¿Te dolió cuando caíste del cielo?",
    "¿Eres una cámara? Porque cada vez que te miro, sonrío.",
    "¿Eres un lugar de estacionamiento? Porque te he estado buscando toda mi vida.",
    "¿Tu papá es artista? Porque eres una obra maestra.",
    "Debes estar agotado/a porque has estado corriendo por mis sueños toda la noche.",
    "¿Eres un foco? Porque iluminas mi día.",
    "Debo ser un copo de nieve, porque me he derretido por ti.",
    "Eres tan dulce que me estás causando caries.",
    "¿Tienes nombre o puedo llamarte mío?",
    "¿Eres la gravedad? Porque me estás atrayendo hacia ti."
];

async function flirtCommand(sock, chatId) {
    const fraseAleatoria = frasesCoqueteo[Math.floor(Math.random() * frasesCoqueteo.length)];
    await sock.sendMessage(chatId, { text: `${fraseAleatoria}` });
}

module.exports = { flirtCommand };
