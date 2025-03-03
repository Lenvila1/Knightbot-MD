const compliments = [
    "¡Eres increíble tal como eres!",
    "¡Tienes un gran sentido del humor!",
    "Eres una persona increíblemente amable y considerada.",
    "Eres más fuerte de lo que crees.",
    "¡Iluminas la habitación con tu presencia!",
    "Eres un amigo verdadero.",
    "¡Eres una inspiración!",
    "Tu creatividad no tiene límites.",
    "Tienes un corazón de oro.",
    "Haces la diferencia en el mundo.",
    "¡Tu positividad es contagiosa!",
    "Tienes una ética de trabajo impresionante.",
    "Sacas lo mejor de las personas.",
    "Tu sonrisa alegra el día de todos.",
    "Eres talentoso en todo lo que haces.",
    "Tu amabilidad hace del mundo un mejor lugar.",
    "Tienes una perspectiva única y maravillosa.",
    "¡Tu entusiasmo es realmente inspirador!",
    "Eres capaz de lograr grandes cosas.",
    "Siempre sabes cómo hacer sentir especial a alguien.",
    "Tu confianza es admirable.",
    "Tienes un alma hermosa.",
    "Tu generosidad no tiene límites.",
    "Tienes un gran ojo para los detalles.",
    "¡Tu pasión es realmente motivadora!",
    "Eres un gran oyente.",
    "¡Eres más fuerte de lo que piensas!",
    "Tu risa es contagiosa.",
    "Tienes un don natural para hacer que los demás se sientan valorados.",
    "Haces del mundo un lugar mejor simplemente con tu existencia."
];

async function complimentCommand(sock, chatId, message) {
    try {
        if (!message || !chatId) {
            console.log('Mensaje o chatId inválido:', { message, chatId });
            return;
        }

        let userToCompliment;
        
        // Verificar si hay usuarios mencionados
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            userToCompliment = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Verificar si es una respuesta a un mensaje
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToCompliment = message.message.extendedTextMessage.contextInfo.participant;
        }
        
        if (!userToCompliment) {
            await sock.sendMessage(chatId, { 
                text: 'Por favor, menciona a alguien o responde a su mensaje para elogiarlo.'
            });
            return;
        }

        const compliment = compliments[Math.floor(Math.random() * compliments.length)];

        // Agregar un pequeño retraso para evitar limitaciones de tasa
        await new Promise(resolve => setTimeout(resolve, 1000));

        await sock.sendMessage(chatId, { 
            text: `Hey @${userToCompliment.split('@')[0]}, ${compliment}`,
            mentions: [userToCompliment]
        });
    } catch (error) {
        console.error('Error en el comando de elogio:', error);
        if (error.data === 429) { // Código de error 429: demasiadas solicitudes
            await new Promise(resolve => setTimeout(resolve, 2000));
            try {
                await sock.sendMessage(chatId, { 
                    text: 'Por favor, intenta nuevamente en unos segundos.'
                });
            } catch (retryError) {
                console.error('Error al enviar mensaje de reintento:', retryError);
            }
        } else {
            try {
                await sock.sendMessage(chatId, { 
                    text: 'Ocurrió un error al enviar el elogio.'
                });
            } catch (sendError) {
                console.error('Error al enviar mensaje de error:', sendError);
            }
        }
    }
}

module.exports = { complimentCommand };
