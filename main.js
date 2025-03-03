const settings = require('./settings');
const { loadCommands } = require('./utils');
require('./config.js');
const { isBanned } = require('./lib/isBanned');
const yts = require('youtube-yts');
const { fetchBuffer } = require('./lib/myfunc');
const ytdl = require('./lib/ytdl2');
const fs = require('fs');
const fetch = require('node-fetch');

// Importación de comandos
const tagAllCommand = require('./commands/tagall');
const helpCommand = require('./commands/help');
const banCommand = require('./commands/ban');
const { promoteCommand } = require('./commands/promote');
const { demoteCommand } = require('./commands/demote');
const muteCommand = require('./commands/mute');
const unmuteCommand = require('./commands/unmute');
const stickerCommand = require('./commands/sticker');
const isAdmin = require('./helpers/isAdmin');
const warnCommand = require('./commands/warn');
const warningsCommand = require('./commands/warnings');
const ttsCommand = require('./commands/tts');
const { tictactoeCommand, handleTicTacToeMove } = require('./commands/tictactoe');
const { incrementMessageCount } = require('./commands/topmembers');
const ownerCommand = require('./commands/owner');
const deleteCommand = require('./commands/delete');
const { handleAntilinkCommand } = require('./commands/antilink');
const { Antilink } = require('./lib/antilink');

// Configuración global
global.packname = settings.packname;
global.author = settings.author;

async function handleMessages(sock, messageUpdate) {
    try {
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;

        const message = messages[0];
        if (!message?.message) return;

        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');

        let userMessage = message.message?.conversation?.trim().toLowerCase() ||
            message.message?.extendedTextMessage?.text?.trim().toLowerCase() || '';
        userMessage = userMessage.replace(/\.\s+/g, '.').trim();

        // Log de comandos
        if (userMessage.startsWith('.')) {
            console.log(`📝 Comando usado en ${isGroup ? 'grupo' : 'privado'}: ${userMessage}`);
        }

        // Revisar si el usuario está baneado
        if (isBanned(senderId) && !userMessage.startsWith('.unban')) {
            if (Math.random() < 0.1) {
                await sock.sendMessage(chatId, { text: '❌ Estás baneado del bot. Contacta a un administrador.' });
            }
            return;
        }

        // Verificar si es un movimiento en el juego de Tic-Tac-Toe
        if (/^[1-9]$/.test(userMessage) || userMessage.toLowerCase() === 'surrender') {
            await handleTicTacToeMove(sock, chatId, senderId, userMessage);
            return;
        }

        // Respuesta básica en chat privado
        if (!isGroup && ['hi', 'hello', 'bot', 'hlo', 'hey', 'bro'].includes(userMessage)) {
            await sock.sendMessage(chatId, { text: 'Hola, ¿cómo puedo ayudarte?\nUsa .menu para ver los comandos.' });
            return;
        }

        if (!message.key.fromMe) incrementMessageCount(chatId, senderId);

        // Detección de malas palabras
        if (isGroup && userMessage) {
            await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
        }

        // Comprobar prefijo de comando
        if (!userMessage.startsWith('.')) {
            if (isGroup) {
                await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                await Antilink(message, sock);
                await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
            }
            return;
        }

        // Comandos administrativos
        const adminCommands = ['.mute', '.unmute', '.ban', '.unban', '.promote', '.demote', '.kick', '.tagall', '.antilink'];
        const isAdminCommand = adminCommands.some(cmd => userMessage.startsWith(cmd));

        let isSenderAdmin = false;
        let isBotAdmin = false;

        if (isGroup && isAdminCommand) {
            const adminStatus = await isAdmin(sock, chatId, senderId);
            isSenderAdmin = adminStatus.isSenderAdmin;
            isBotAdmin = adminStatus.isBotAdmin;

            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { text: 'Por favor, haz al bot administrador para usar comandos de administración.' });
                return;
            }

            if (!isSenderAdmin && !message.key.fromMe) {
                await sock.sendMessage(chatId, { text: 'Lo siento, solo los administradores pueden usar este comando.' });
                return;
            }
        }
    } catch (error) {
        console.error('❌ Error en el manejo de mensajes:', error.message);
    }
}

module.exports = { handleMessages };

       // Manejo del acceso según el modo del bot
try {
    const data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
    const senderNumber = senderId.split('@')[0];

    // Solo permitir al dueño usar el bot en modo privado
    if (!data.isPublic && senderNumber !== settings.ownerNumber) {
        return;
    }
} catch (error) {
    console.error('Error verificando el modo de acceso:', error);
}

// Manejador de comandos
switch (true) {
    case userMessage === '.simage': {
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quotedMessage?.stickerMessage) {
            await simageCommand(sock, quotedMessage, chatId);
        } else {
            await sock.sendMessage(chatId, { text: 'Responde a un sticker con el comando .simage para convertirlo en imagen.' });
        }
        break;
    }
    case userMessage.startsWith('.kick'):
        const mentionedJidListKick = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        await kickCommand(sock, chatId, senderId, mentionedJidListKick, message);
        break;
    case userMessage.startsWith('.mute'):
        const muteDuration = parseInt(userMessage.split(' ')[1]);
        if (isNaN(muteDuration)) {
            await sock.sendMessage(chatId, { text: 'Por favor, proporciona un número válido de minutos. Ejemplo: .mute 10' });
        } else {
            await muteCommand(sock, chatId, senderId, muteDuration);
        }
        break;
    case userMessage === '.unmute':
        await unmuteCommand(sock, chatId, senderId);
        break;
    case userMessage.startsWith('.ban'):
        await banCommand(sock, chatId, message);
        break;
    case userMessage.startsWith('.unban'):
        await unbanCommand(sock, chatId, message);
        break;
    case userMessage === '.help' || userMessage === '.menu' || userMessage === '.bot' || userMessage === '.list':
        await helpCommand(sock, chatId);
        break;
    case userMessage === '.sticker' || userMessage === '.s':
        await stickerCommand(sock, chatId, message);
        break;
    case userMessage.startsWith('.warnings'):
        const mentionedJidListWarnings = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        await warningsCommand(sock, chatId, mentionedJidListWarnings);
        break;
    case userMessage.startsWith('.warn'):
        const mentionedJidListWarn = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        await warnCommand(sock, chatId, senderId, mentionedJidListWarn, message);
        break;
    case userMessage.startsWith('.tts'):
        const text = userMessage.slice(4).trim();
        await ttsCommand(sock, chatId, text);
        break;
    case userMessage === '.delete' || userMessage === '.del':
        await deleteCommand(sock, chatId, message, senderId);
        break;
    case userMessage.startsWith('.attp'):
        await attpCommand(sock, chatId, message);
        break;
    case userMessage.startsWith('.mode'):
        const senderNumber = senderId.split('@')[0];
        if (senderNumber !== settings.ownerNumber) {
            await sock.sendMessage(chatId, { text: 'Solo el dueño del bot puede usar este comando.' });
            return;
        }

        let data;
        try {
            data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
        } catch (error) {
            console.error('Error leyendo el estado del bot:', error);
            await sock.sendMessage(chatId, { text: 'Error al leer el estado del bot.' });
            return;
        }

        const action = userMessage.split(' ')[1]?.toLowerCase();
        if (!action) {
            const currentMode = data.isPublic ? 'público' : 'privado';
            await sock.sendMessage(chatId, { 
                text: `Modo actual del bot: *${currentMode}*\n\nEjemplo:\n.mode public - Todos pueden usar el bot\n.mode private - Solo el dueño puede usar el bot`
            });
            return;
        }

        if (action !== 'public' && action !== 'private') {
            await sock.sendMessage(chatId, { 
                text: 'Uso: .mode public/private\nEjemplo:\n.mode public - Todos pueden usar el bot\n.mode private - Solo el dueño puede usar el bot'
            });
            return;
        }

        try {
            data.isPublic = action === 'public';
            fs.writeFileSync('./data/messageCount.json', JSON.stringify(data, null, 2));
            await sock.sendMessage(chatId, { text: `El bot ahora está en modo *${action}*.` });
        } catch (error) {
            console.error('Error actualizando el modo del bot:', error);
            await sock.sendMessage(chatId, { text: 'Error al actualizar el modo del bot.' });
        }
        break;
    case userMessage === '.owner':
        await ownerCommand(sock, chatId);
        break;
    case userMessage.startsWith('.tag'):
        const messageText = userMessage.slice(4).trim();
        const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
        await tagCommand(sock, chatId, senderId, messageText, replyMessage);
        break;
    case userMessage.startsWith('.antilink'):
        if (!isGroup) {
            await sock.sendMessage(chatId, { text: 'Este comando solo puede usarse en grupos.' });
            return;
        }
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: 'El bot debe ser administrador para usar este comando.' });
            return;
        }
        await handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin);
        break;
    case userMessage === '.meme':
        await memeCommand(sock, chatId);
        break;
    case userMessage === '.weather':
        const city = userMessage.slice(9).trim();
        if (city) {
            await weatherCommand(sock, chatId, city);
        } else {
            await sock.sendMessage(chatId, { text: 'Por favor, especifica una ciudad. Ejemplo: .weather Madrid' });
        }
        break;
    case userMessage === '.news':
        await newsCommand(sock, chatId);
        break;
    case userMessage.startsWith('.trivia'):
        startTrivia(sock, chatId);
        break;
    case userMessage.startsWith('.answer'):
        const answer = userMessage.split(' ').slice(1).join(' ');
        if (answer) {
            answerTrivia(sock, chatId, answer);
        } else {
            sock.sendMessage(chatId, { text: 'Por favor, proporciona una respuesta usando .answer <respuesta>' });
        }
        break;
    case userMessage.startsWith('.8ball'):
        const question = userMessage.split(' ').slice(1).join(' ');
        await eightBallCommand(sock, chatId, question);
        break;
    case userMessage.startsWith('.lyrics'):
        const songTitle = userMessage.split(' ').slice(1).join(' ');
        await lyricsCommand(sock, chatId, songTitle);
        break;
    case userMessage === '.dare':
        await dareCommand(sock, chatId);
        break;
    case userMessage === '.truth':
        await truthCommand(sock, chatId);
        break;
    case userMessage.startsWith('.promote'):
        const mentionedJidListPromote = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        await promoteCommand(sock, chatId, mentionedJidListPromote, message);
        break;
    case userMessage.startsWith('.demote'):
        const mentionedJidListDemote = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        await demoteCommand(sock, chatId, mentionedJidListDemote, message);
        break;
    default:
        console.log('Comando no reconocido:', userMessage);
}

                // Verificar si el usuario es administrador antes de ejecutar ciertos comandos
const chatbotAdminStatus = await isAdmin(sock, chatId, senderId);
if (!chatbotAdminStatus.isSenderAdmin) {
    await sock.sendMessage(chatId, { text: '*Solo los administradores pueden usar este comando*' });
    return;
}

const match = userMessage.slice(8).trim();
await handleChatbotCommand(sock, chatId, message, match);
break;

case userMessage.startsWith('.take'):
    const takeArgs = userMessage.slice(5).trim().split(' ');
    await takeCommand(sock, chatId, message, takeArgs);
    break;
case userMessage === '.flirt':
    await flirtCommand(sock, chatId);
    break;
case userMessage.startsWith('.character'):
    await characterCommand(sock, chatId, message);
    break;
case userMessage.startsWith('.waste'):
    await wastedCommand(sock, chatId, message);
    break;
case userMessage === '.ship':
    if (!isGroup) {
        await sock.sendMessage(chatId, { text: 'Este comando solo puede usarse en grupos.' });
        return;
    }
    await shipCommand(sock, chatId, message);
    break;
case userMessage === '.groupinfo':
case userMessage === '.infogp':
case userMessage === '.infogrupo':
    if (!isGroup) {
        await sock.sendMessage(chatId, { text: 'Este comando solo puede usarse en grupos.' });
        return;
    }
    await groupInfoCommand(sock, chatId, message);
    break;
case userMessage === '.resetlink':
case userMessage === '.revoke':
case userMessage === '.anularlink':
    if (!isGroup) {
        await sock.sendMessage(chatId, { text: 'Este comando solo puede usarse en grupos.' });
        return;
    }
    await resetlinkCommand(sock, chatId, senderId);
    break;
case userMessage === '.staff':
case userMessage === '.admins':
case userMessage === '.listadmin':
    if (!isGroup) {
        await sock.sendMessage(chatId, { text: 'Este comando solo puede usarse en grupos.' });
        return;
    }
    await staffCommand(sock, chatId, message);
    break;
case userMessage.startsWith('.emojimix'):
case userMessage.startsWith('.emix'):
    await emojimixCommand(sock, chatId, message);
    break;
case userMessage.startsWith('.play'):
case userMessage.startsWith('.song'):
    try {
        const text = userMessage.split(' ').slice(1).join(' ');
        if (!text) {
            await sock.sendMessage(chatId, { text: '❌ Especifica una canción para buscar. Ejemplo: .play Despacito' });
            return;
        }

        // Buscar el video en YouTube
        const search = await yts(text);
        if (!search.videos.length) {
            await sock.sendMessage(chatId, { text: '❌ No se encontraron resultados.' });
            return;
        }

        const video = search.videos[0];
        await sock.sendMessage(chatId, { text: `🎵 Descargando: ${video.title}\n⏳ Por favor, espera...` });

        // Descargar audio
        const audioData = await ytdl.mp3(video.url);

        // Obtener miniatura
        const response = await fetch(video.thumbnail);
        const thumbBuffer = await response.buffer();

        // Enviar audio
        await sock.sendMessage(chatId, {
            audio: fs.readFileSync(audioData.path),
            mimetype: 'audio/mp4',
            fileName: `${video.title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: video.title,
                    body: global.botname,
                    thumbnail: thumbBuffer,
                    mediaType: 2,
                    mediaUrl: video.url,
                }
            }
        });

        // Limpiar archivo descargado
        try {
            fs.unlinkSync(audioData.path);
        } catch (err) {
            console.error('Error eliminando archivo de audio:', err);
        }
    } catch (error) {
        console.error('Error en el comando .play:', error);
        await sock.sendMessage(chatId, { text: '❌ Error al descargar la canción, inténtalo de nuevo más tarde.' });
    }
    break;
case userMessage === '.vv':
    await viewOnceCommand(sock, chatId, message);
    break;
case userMessage === '.clearsession':
case userMessage === '.clearsesi':
    await clearSessionCommand(sock, chatId, senderId);
    break;
case userMessage.startsWith('.autostatus'):
    const autoStatusArgs = userMessage.split(' ').slice(1);
    await autoStatusCommand(sock, chatId, senderId, autoStatusArgs);
    break;
default:
    if (isGroup) {
        // Procesar mensajes no reconocidos en grupos
        if (userMessage) {
            await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
        }
        await Antilink(message, sock);
        await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
    }
    break;
}

// Manejo de errores global en el mensaje
} catch (error) {
    console.error('❌ Error en el manejador de mensajes:', error.message);
    await sock.sendMessage(chatId, { text: '❌ Hubo un error procesando tu mensaje.' });
}
       // Solo enviar mensaje de error si chatId es válido
if (chatId) {
    await sock.sendMessage(chatId, { 
        text: '❌ Hubo un error procesando el comando.'
    });
}

// Exportar los manejadores junto con handleMessages
module.exports = { 
    handleMessages,
    handleGroupParticipantUpdate: async (sock, update) => {
        const { id, participants, action, author } = update;
        
        console.log('🔄 Actualización de grupo:', {
            id,
            participants,
            action,
            author
        });

        if (action === 'promote') {
            await handlePromotionEvent(sock, id, participants, author);
        } else if (action === 'demote') {
            await handleDemotionEvent(sock, id, participants, author);
        }
    },
    handleStatus: async (sock, status) => {
        await handleStatusUpdate(sock, status);
    }
};
