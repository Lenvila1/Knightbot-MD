const axios = require('axios');

async function characterCommand(sock, chatId, message) {
    let userToAnalyze;
    
    // Verificar si se mencionó a un usuario
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToAnalyze = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Verificar si se respondió a un mensaje
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToAnalyze = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToAnalyze) {
        await sock.sendMessage(chatId, { 
            text: '❌ *Debes mencionar a alguien o responder a su mensaje para analizar su personalidad!*' 
        });
        return;
    }

    try {
        // Obtener la foto de perfil del usuario
        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(userToAnalyze, 'image');
        } catch {
            profilePic = 'https://i.imgur.com/2wzGhpF.jpeg'; // Imagen por defecto si no tiene foto
        }

        const traits = [
            "Inteligente", "Creativo", "Determinado", "Ambicioso", "Cariñoso",
            "Carismático", "Seguro", "Empático", "Energético", "Amigable",
            "Generoso", "Honesto", "Divertido", "Imaginativo", "Independiente",
            "Intuitivo", "Amable", "Lógico", "Leal", "Optimista",
            "Apasionado", "Paciente", "Persistente", "Confiable", "Ingenioso",
            "Sincero", "Reflexivo", "Comprensivo", "Versátil", "Sabio"
        ];

        // Seleccionar entre 3 y 5 rasgos aleatorios
        const numTraits = Math.floor(Math.random() * 3) + 3;
        const selectedTraits = [];
        for (let i = 0; i < numTraits; i++) {
            const randomTrait = traits[Math.floor(Math.random() * traits.length)];
            if (!selectedTraits.includes(randomTrait)) {
                selectedTraits.push(randomTrait);
            }
        }

        // Calcular porcentajes aleatorios para cada rasgo
        const traitPercentages = selectedTraits.map(trait => {
            const percentage = Math.floor(Math.random() * 41) + 60; // Número aleatorio entre 60-100
            return `✨ ${trait}: ${percentage}%`;
        });

        // Crear el mensaje de análisis de personalidad
        const analysis = `🔮 *Análisis de Personalidad* 🔮\n\n` +
            `👤 *Usuario:* @${userToAnalyze.split('@')[0]}\n\n` +
            `✨ *Rasgos principales:*\n${traitPercentages.join('\n')}\n\n` +
            `🎯 *Puntaje general:* ${Math.floor(Math.random() * 21) + 80}%\n\n` +
            `🔍 *Nota:* Este análisis es solo por diversión y no debe tomarse en serio.`;

        // Enviar el análisis junto con la foto de perfil del usuario
        await sock.sendMessage(chatId, {
            image: { url: profilePic },
            caption: analysis,
            mentions: [userToAnalyze]
        });

    } catch (error) {
        console.error('Error en el comando de análisis de personalidad:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ *No se pudo analizar la personalidad. Inténtalo más tarde.*'
        });
    }
}

module.exports = characterCommand;
