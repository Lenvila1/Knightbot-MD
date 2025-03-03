const axios = require('axios');

let triviaJuegos = {};

async function iniciarTrivia(sock, chatId) {
    if (triviaJuegos[chatId]) {
        await sock.sendMessage(chatId, { text: '❌ *Ya hay una trivia en curso!*' });
        return;
    }

    try {
        const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
        const preguntaDatos = response.data.results[0];

        // Mezclar respuestas y almacenar la correcta
        let opciones = [...preguntaDatos.incorrect_answers, preguntaDatos.correct_answer];
        opciones = opciones.sort(() => Math.random() - 0.5);

        triviaJuegos[chatId] = {
            pregunta: preguntaDatos.question,
            respuestaCorrecta: preguntaDatos.correct_answer,
            opciones
        };

        const mensaje = `🤓 *Trivia Time!* 🧠\n\n` +
                        `❓ *Pregunta:* ${triviaJuegos[chatId].pregunta}\n\n` +
                        `🔹 *Opciones:* \n` +
                        opciones.map((opcion, index) => `   ${index + 1}) ${opcion}`).join('\n') + `\n\n` +
                        `✏️ *Responde escribiendo el número de la opción correcta!*`;

        await sock.sendMessage(chatId, { text: mensaje });

    } catch (error) {
        console.error('Error al obtener trivia:', error);
        await sock.sendMessage(chatId, { text: '❌ *Hubo un error al obtener la trivia. Intenta de nuevo más tarde.*' });
    }
}

async function responderTrivia(sock, chatId, respuesta) {
    if (!triviaJuegos[chatId]) {
        await sock.sendMessage(chatId, { text: '❌ *No hay una trivia en curso.*' });
        return;
    }

    const juego = triviaJuegos[chatId];

    if (!/^[1-4]$/.test(respuesta)) {
        await sock.sendMessage(chatId, { text: '⚠️ *Responde con un número entre 1 y 4!*' });
        return;
    }

    const indiceRespuesta = parseInt(respuesta) - 1;
    const esCorrecto = juego.opciones[indiceRespuesta] === juego.respuestaCorrecta;

    const mensaje = esCorrecto
        ? `🎉 ¡Correcto! ✅ La respuesta era: *${juego.respuestaCorrecta}*`
        : `❌ Incorrecto. La respuesta correcta era: *${juego.respuestaCorrecta}*`;

    await sock.sendMessage(chatId, { text: mensaje });

    delete triviaJuegos[chatId]; // Eliminar juego después de responder
}

module.exports = { iniciarTrivia, responderTrivia };

