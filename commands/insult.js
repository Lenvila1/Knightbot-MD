const insults = [
    "Eres como una nube, cuando desapareces el día se vuelve hermoso.",
    "Traes mucha felicidad... cuando te vas.",
    "Estás en la lista de cosas que nadie quiere pero que están ahí.",
    "Si la ignorancia es felicidad, debes estar en un estado constante de éxtasis.",
    "No eres estúpido, solo tienes mala suerte cuando piensas.",
    "Si la inteligencia fuera dinero, estarías en bancarrota.",
    "Eres como un software viejo, siempre fallando en el momento menos oportuno.",
    "Eres como un Wi-Fi sin señal, absolutamente inútil cuando más se necesita.",
    "Tu sentido del humor es como la leche caducada, agrio y difícil de digerir.",
    "Tienes un gran talento: hacer que la gente quiera salir corriendo.",
    "Eres como un semáforo en rojo, nadie quiere verte pero todos tienen que esperarte.",
    "Eres como un spoiler de película, a nadie le caes bien.",
    "Si ser molesto fuera un deporte, serías campeón mundial.",
    "Hablar contigo es como usar Internet Explorer, todo va demasiado lento.",
    "No eres vago, solo estás muy motivado para hacer absolutamente nada.",
    "Eres como un meme viejo, todo el mundo quiere olvidarte.",
    "Eres como un rompecabezas con piezas faltantes, simplemente no encajas.",
    "Si fueras un objeto, serías un botón roto: inútil y frustrante.",
    "Tu personalidad es como una cebolla, cuanto más se descubre, más ganas dan de llorar."
];

async function insultCommand(sock, chatId, message) {
    try {
        if (!message || !chatId) {
            console.log('Mensaje o chatId inválidos:', { message, chatId });
            return;
        }

        let userToInsult;

        // Verificar menciones en el mensaje
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            userToInsult = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Verificar si es respuesta a un mensaje
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToInsult = message.message.extendedTextMessage.contextInfo.participant;
        }

        if (!userToInsult) {
            await sock.sendMessage(chatId, { 
                text: '❌ Menciona a alguien o responde a un mensaje para insultarlo.'
            });
            return;
        }

        const insult = insults[Math.floor(Math.random() * insults.length)];

        // Evitar límite de tasa de mensajes
        await new Promise(resolve => setTimeout(resolve, 1000));

        await sock.sendMessage(chatId, { 
            text: `💥 @${userToInsult.split('@')[0]}, ${insult}`,
            mentions: [userToInsult]
        });
    } catch (error) {
        console.error('Error en el comando insult:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Ocurrió un error al enviar el insulto, intenta nuevamente.'
        });
    }
}

module.exports = { insultCommand };
