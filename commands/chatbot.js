const { setChatbot, getChatbot, removeChatbot } = require('../sql');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Cargar configuración del chatbot
function loadChatbotConfig(groupId) {
    try {
        const configPath = path.join(__dirname, '../data/chatbot.json');
        if (!fs.existsSync(configPath)) {
            return null;
        }
        const data = JSON.parse(fs.readFileSync(configPath));
        return data[groupId];
    } catch (error) {
        console.error('❌ Error al cargar la configuración del chatbot:', error.message);
        return null;
    }
}

// Comando para activar o desactivar el chatbot en un grupo
async function handleChatbotCommand(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `🤖 *Configuración del Chatbot*\n\n` +
                  `✅ *.chatbot on* - Activar el chatbot en este grupo\n` +
                  `❌ *.chatbot off* - Desactivar el chatbot en este grupo`
        });
    }

    if (match === 'on') {
        const existingConfig = await getChatbot(chatId);
        if (existingConfig?.enabled) {
            return sock.sendMessage(chatId, { text: '⚠️ *El chatbot ya está activado en este grupo.*' });
        }
        await setChatbot(chatId, true);
        console.log(`✅ Chatbot activado en el grupo ${chatId}`);
        return sock.sendMessage(chatId, { text: '✅ *El chatbot ha sido activado en este grupo.*' });
    }

    if (match === 'off') {
        const config = await getChatbot(chatId);
        if (!config?.enabled) {
            return sock.sendMessage(chatId, { text: '⚠️ *El chatbot ya está desactivado en este grupo.*' });
        }
        await removeChatbot(chatId);
        console.log(`❌ Chatbot desactivado en el grupo ${chatId}`);
        return sock.sendMessage(chatId, { text: '❌ *El chatbot ha sido desactivado en este grupo.*' });
    }

    return sock.sendMessage(chatId, { text: '⚠️ *Comando inválido. Usa .chatbot para ver las opciones.*' });
}

// Manejo de respuestas del chatbot
async function handleChatbotResponse(sock, chatId, message, userMessage, senderId) {
    const config = loadChatbotConfig(chatId);
    if (!config?.enabled) return;

    try {
        console.log('📩 Procesando mensaje para chatbot...');
        console.log('Chat ID:', chatId);
        console.log('Mensaje del usuario:', userMessage);

        // Obtener el número del bot
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // Verificar si el mensaje menciona al bot o es una respuesta a este
        let isBotMentioned = false;
        let isReplyToBot = false;

        if (message.message?.extendedTextMessage) {
            const mentionedJid = message.message.extendedTextMessage.contextInfo?.mentionedJid || [];
            const quotedParticipant = message.message.extendedTextMessage.contextInfo?.participant;
            
            isBotMentioned = mentionedJid.some(jid => jid === botNumber);
            isReplyToBot = quotedParticipant === botNumber;
        } else if (message.message?.conversation) {
            isBotMentioned = userMessage.includes(`@${botNumber.split('@')[0]}`);
        }

        if (!isBotMentioned && !isReplyToBot) {
            console.log('🚫 El bot no fue mencionado ni respondido.');
            return;
        }

        // Limpiar el mensaje eliminando la mención al bot
        let cleanedMessage = userMessage.replace(new RegExp(`@${botNumber.split('@')[0]}`, 'g'), '').trim();

        // Obtener respuesta de la IA
        const response = await getGPT3Response(cleanedMessage || "Hola");
        console.log('🤖 Respuesta del Chatbot:', response);

        if (!response) {
            await sock.sendMessage(chatId, { 
                text: "⚠️ *No puedo procesar tu solicitud en este momento.*",
                quoted: message
            });
            return;
        }

        // Enviar respuesta del chatbot
        await sock.sendMessage(chatId, {
            text: `@${senderId.split('@')[0]} ${response}`,
            quoted: message,
            mentions: [senderId]
        });

        console.log(`✅ Chatbot respondió en el grupo ${chatId}`);
    } catch (error) {
        console.error('❌ Error en la respuesta del chatbot:', error.message);
        await sock.sendMessage(chatId, { 
            text: "⚠️ *Ocurrió un error al procesar tu mensaje.*",
            quoted: message,
            mentions: [senderId]
        });
    }
}

// Obtener respuesta de GPT-3
async function getGPT3Response(userMessage) {
    try {
        console.log('📡 Obteniendo respuesta de GPT-3 para:', userMessage);
        
        const systemPrompt = {
            role: "system",
            content: "Eres KnightBot, un chatbot inteligente y amigable. Responde de forma natural y con un tono humano. Usa emojis cuando sea apropiado y responde con claridad."
        };

        const userPrompt = {
            role: "user",
            content: userMessage
        };

        const response = await fetch("https://api.yanzbotz.live/api/ai/gpt3", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                messages: [systemPrompt, userPrompt] 
            })
        });

        if (!response.ok) {
            console.error('❌ Error en la API de GPT-3:', response.status);
            throw new Error("La llamada a la API falló");
        }

        const data = await response.json();
        console.log('✅ Respuesta recibida de la API:', data);
        return data.result;

    } catch (error) {
        console.error("❌ Error en la API de GPT-3:", error);
        return null;
    }
}

module.exports = {
    handleChatbotCommand,
    handleChatbotResponse
};
