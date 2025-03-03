const TicTacToe = require('../lib/tictactoe');

// Almacenar juegos en un objeto global
const juegos = {};

async function tictactoeCommand(sock, chatId, senderId, text) {
    try {
        // Comprobar si el jugador ya está en un juego
        if (Object.values(juegos).find(room => 
            room.id.startsWith('tictactoe') && 
            [room.game.playerX, room.game.playerO].includes(senderId)
        )) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Ya estás en un juego.* Escribe *rendirse* para salir.' 
            });
            return;
        }

        // Buscar una sala de espera
        let sala = Object.values(juegos).find(room => 
            room.estado === 'ESPERANDO' && 
            (text ? room.nombre === text : true)
        );

        if (sala) {
            // Unirse a una sala existente
            sala.o = chatId;
            sala.game.playerO = senderId;
            sala.estado = 'JUGANDO';

            const tablero = formatearTablero(sala.game.render());

            const mensaje = `
🎮 *¡Juego de Tic-Tac-Toe iniciado!*

🔄 Turno de @${sala.game.currentTurn.split('@')[0]}

${tablero}

📌 *Reglas:*
• Forma una fila, columna o diagonal con tu símbolo para ganar.
• Escribe un número (1-9) para colocar tu símbolo.
• Escribe *rendirse* para abandonar el juego.
`;

            // Enviar mensaje con menciones
            await sock.sendMessage(chatId, { 
                text: mensaje,
                mentions: [sala.game.currentTurn, sala.game.playerX, sala.game.playerO]
            });

        } else {
            // Crear una nueva sala de juego
            sala = {
                id: 'tictactoe-' + Date.now(),
                x: chatId,
                o: '',
                game: new TicTacToe(senderId, 'o'),
                estado: 'ESPERANDO'
            };

            if (text) sala.nombre = text;

            await sock.sendMessage(chatId, { 
                text: `⏳ *Esperando un oponente.*\nEscribe *.ttt ${text || ''}* para unirte.`
            });

            juegos[sala.id] = sala;
        }

    } catch (error) {
        console.error('Error en el comando Tic-Tac-Toe:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ *Error al iniciar el juego.* Inténtalo de nuevo.' 
        });
    }
}

async function handleTicTacToeMove(sock, chatId, senderId, text) {
    try {
        // Buscar el juego del jugador
        const sala = Object.values(juegos).find(room => 
            room.id.startsWith('tictactoe') && 
            [room.game.playerX, room.game.playerO].includes(senderId) && 
            room.estado === 'JUGANDO'
        );

        if (!sala) return;

        const esRendicion = /^(rendirse|abandonar)$/i.test(text);
        
        if (!esRendicion && !/^[1-9]$/.test(text)) return;

        if (senderId !== sala.game.currentTurn) {
            if (!esRendicion) {
                await sock.sendMessage(chatId, { text: '❌ *No es tu turno.*' });
                return;
            }
        }

        let jugadaValida = esRendicion ? true : sala.game.turn(
            senderId === sala.game.playerO,
            parseInt(text) - 1
        );

        if (!jugadaValida) {
            await sock.sendMessage(chatId, { text: '❌ *Movimiento inválido.* Esa casilla ya está ocupada.' });
            return;
        }

        let ganador = sala.game.winner;
        let esEmpate = sala.game.turns === 9;

        const tablero = formatearTablero(sala.game.render());

        if (esRendicion) {
            sala.game._currentTurn = senderId === sala.game.playerX;
            ganador = sala.game.currentTurn;
        }

        let estadoJuego;
        if (ganador) {
            estadoJuego = esRendicion 
                ? `🏳️ @${ganador.split('@')[0]} *gana por rendición!*`
                : `🎉 @${ganador.split('@')[0]} *gana la partida!*`;
        } else if (esEmpate) {
            estadoJuego = `🤝 *¡Empate!* No hay ganador.`;
        } else {
            estadoJuego = `🎲 *Turno de:* @${sala.game.currentTurn.split('@')[0]}`;
        }

        const mensaje = `
🎮 *Tic-Tac-Toe*

${estadoJuego}

${tablero}

👤 *Jugador ❎:* @${sala.game.playerX.split('@')[0]}
👤 *Jugador ⭕:* @${sala.game.playerO.split('@')[0]}

${!ganador && !esEmpate ? '• Escribe un número (1-9) para jugar.\n• Escribe *rendirse* para abandonar el juego.' : ''}
`;

        const menciones = [
            sala.game.playerX, 
            sala.game.playerO,
            ...(ganador ? [ganador] : [sala.game.currentTurn])
        ];

        await sock.sendMessage(sala.x, { text: mensaje, mentions: menciones });

        if (sala.x !== sala.o) {
            await sock.sendMessage(sala.o, { text: mensaje, mentions: menciones });
        }

        if (ganador || esEmpate) {
            delete juegos[sala.id];
        }

    } catch (error) {
        console.error('Error en el movimiento de Tic-Tac-Toe:', error);
    }
}

// Función para formatear el tablero con emojis
function formatearTablero(tablero) {
    return `
${tablero.slice(0, 3).map(celda => traducirSimbolo(celda)).join('')}
${tablero.slice(3, 6).map(celda => traducirSimbolo(celda)).join('')}
${tablero.slice(6).map(celda => traducirSimbolo(celda)).join('')}
`;
}

// Función para traducir los símbolos del tablero a emojis
function traducirSimbolo(simbolo) {
    return {
        'X': '❎',
        'O': '⭕',
        '1': '1️⃣',
        '2': '2️⃣',
        '3': '3️⃣',
        '4': '4️⃣',
        '5': '5️⃣',
        '6': '6️⃣',
        '7': '7️⃣',
        '8': '8️⃣',
        '9': '9️⃣',
    }[simbolo];
}

module.exports = {
    tictactoeCommand,
    handleTicTacToeMove
};
