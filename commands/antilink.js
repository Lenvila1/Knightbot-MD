const { bots } = require('../lib/antilink');
const { setAntilink, getAntilink, removeAntilink } = require('../sql');
const isAdmin = require('../helpers/isAdmin');

async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '```¡Solo para administradores del grupo!```' });
            return;
        }

        const prefix = '.';
        const args = userMessage.slice(9).toLowerCase().trim().split(' ');
        const action = args[0];

        if (!action) {
            const usage = `\`\`\`CONFIGURACIÓN ANTILINK\n\n${prefix}antilink on\n${prefix}antilink set delete | kick | warn\n${prefix}antilink off\n\`\`\``;
            await sock.sendMessage(chatId, { text: usage });
            return;
        }

        switch (action) {
            case 'on':
                const existingConfig = await getAntilink(chatId, 'on');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, { text: '*_Antilink ya está activado_*' });
                    return;
                }
                const result = await setAntilink(chatId, 'on', 'delete');
                await sock.sendMessage(chatId, { 
                    text: result ? '*_Antilink ha sido activado_*' : '*_Error al activar Antilink_*' 
                });
                break;

            case 'off':
                await removeAntilink(chatId, 'on');
                await sock.sendMessage(chatId, { text: '*_Antilink ha sido desactivado_*' });
                break;

            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, { 
                        text: `*_Especifica una acción: ${prefix}antilink set delete | kick | warn_*` 
                    });
                    return;
                }
                const setAction = args[1];
                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    await sock.sendMessage(chatId, { 
                        text: '*_Acción no válida. Elige delete, kick o warn._*' 
                    });
                    return;
                }
                const setResult = await setAntilink(chatId, 'on', setAction);
                await sock.sendMessage(chatId, { 
                    text: setResult ? `*_Acción de Antilink establecida en ${setAction}_*` : '*_Error al configurar la acción de Antilink_*' 
                });
                break;

            case 'get':
                const status = await getAntilink(chatId, 'on');
                const actionConfig = await getAntilink(chatId, 'on');
                await sock.sendMessage(chatId, { 
                    text: `*_Configuración de Antilink:_*\nEstado: ${status ? 'ACTIVADO' : 'DESACTIVADO'}\nAcción: ${actionConfig ? actionConfig.action : 'No establecida'}` 
                });
                break;

            default:
                await sock.sendMessage(chatId, { text: `*_Usa ${prefix}antilink para ver el uso._*` });
        }
    } catch (error) {
        console.error('Error en el comando antilink:', error);
        await sock.sendMessage(chatId, { text: '*_Error al procesar el comando antilink_*' });
    }
}

async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
    const antilinkSetting = getAntilinkSetting(chatId);
    if (antilinkSetting === 'off') return;

    console.log(`Configuración Antilink para ${chatId}: ${antilinkSetting}`);
    console.log(`Revisando mensaje en busca de enlaces: ${userMessage}`);
    
    // Registrar el objeto completo del mensaje para diagnóstico
    console.log("Objeto completo del mensaje: ", JSON.stringify(message, null, 2));

    let shouldDelete = false;

    const linkPatterns = {
        whatsappGroup: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/,
        whatsappChannel: /wa\.me\/channel\/[A-Za-z0-9]{20,}/,
        telegram: /t\.me\/[A-Za-z0-9_]+/,
        allLinks: /https?:\/\/[^\s]+/,
    };

    // Detectar enlaces de grupos de WhatsApp
    if (antilinkSetting === 'whatsappGroup') {
        console.log('Protección contra enlaces de grupos de WhatsApp activada.');
        if (linkPatterns.whatsappGroup.test(userMessage)) {
            console.log('¡Detectado un enlace de grupo de WhatsApp!');
            shouldDelete = true;
        }
    } else if (antilinkSetting === 'whatsappChannel' && linkPatterns.whatsappChannel.test(userMessage)) {
        shouldDelete = true;
    } else if (antilinkSetting === 'telegram' && linkPatterns.telegram.test(userMessage)) {
        shouldDelete = true;
    } else if (antilinkSetting === 'allLinks' && linkPatterns.allLinks.test(userMessage)) {
        shouldDelete = true;
    }

    if (shouldDelete) {
        const quotedMessageId = message.key.id; // Obtener ID del mensaje para eliminar
        const quotedParticipant = message.key.participant || senderId; // Obtener ID del remitente

        console.log(`Intentando eliminar mensaje con ID: ${quotedMessageId} del participante: ${quotedParticipant}`);

        try {
            await sock.sendMessage(chatId, {
                delete: { remoteJid: chatId, fromMe: false, id: quotedMessageId, participant: quotedParticipant },
            });
            console.log(`Mensaje con ID ${quotedMessageId} eliminado correctamente.`);
        } catch (error) {
            console.error('Error al eliminar el mensaje:', error);
        }

        const mentionedJidList = [senderId];
        await sock.sendMessage(chatId, { text: `⚠️ ¡Advertencia! @${senderId.split('@')[0]}, no está permitido publicar enlaces.`, mentions: mentionedJidList });
    } else {
        console.log('No se detectó enlace o la protección no está activada para este tipo de enlace.');
    }
}

module.exports = {
    handleAntilinkCommand,
    handleLinkDetection,
};
