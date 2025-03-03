const fs = require('fs');

// Lista de palabras para el ahorcado
const palabras = ['javascript', 'bot', 'ahorcado', 'whatsapp', 'nodejs'];
let juegosAhorcado = {};

function iniciarAhorcado(sock, chatId) {
    const palabra = palabras[Math.floor(Math.random() * palabras.length)];
    const palabraOculta = '_ '.repeat(palabra.length).trim();

    juegosAhorcado[chatId] = {
        palabra,
        palabraOculta: palabraOculta.split(' '),
        letrasAdivinadas: [],
        intentosIncorrectos: 0,
        maxIntentos: 6,
    };

    sock.sendMessage(chatId, { text: `🎮 ¡Juego iniciado! La palabra es: ${palabraOculta}` });
}

function adivinarLetra(sock, chatId, letra) {
    if (!juegosAhorcado[chatId]) {
        sock.sendMessage(chatId, { text: '❌ No hay un juego en curso. Inicia uno con .ahorcado' });
        return;
    }

    const juego = juegosAhorcado[chatId];
    const { palabra, letrasAdivinadas, palabraOculta, maxIntentos } = juego;

    if (letrasAdivinadas.includes(letra)) {
        sock.sendMessage(chatId, { text: `🔄 Ya has intentado con "${letra}". Prueba otra letra.` });
        return;
    }

    letrasAdivinadas.push(letra);

    if (palabra.includes(letra)) {
        for (let i = 0; i < palabra.length; i++) {
            if (palabra[i] === letra) {
                palabraOculta[i] = letra;
            }
        }
        sock.sendMessage(chatId, { text: `✅ ¡Bien hecho! ${palabraOculta.join(' ')}` });

        if (!palabraOculta.includes('_')) {
            sock.sendMessage(chatId, { text: `🎉 ¡Felicidades! Adivinaste la palabra: ${palabra}` });
            delete juegosAhorcado[chatId];
        }
    } else {
        juego.intentosIncorrectos += 1;
        sock.sendMessage(chatId, { text: `❌ Letra incorrecta. Te quedan ${maxIntentos - juego.intentosIncorrectos} intentos.` });

        if (juego.intentosIncorrectos >= maxIntentos) {
            sock.sendMessage(chatId, { text: `💀 ¡Juego terminado! La palabra era: ${palabra}` });
            delete juegosAhorcado[chatId];
        }
    }
}

module.exports = { iniciarAhorcado, adivinarLetra };
