const fs = require('fs');
const path = require('path');
const { isAdmin } = require('../helpers/isAdmin'); 

const welcomeFile = path.join(__dirname, '../data/welcome.json');

// Cargar configuración de bienvenida
function loadWelcomeSettings() {
    if (!fs.existsSync(welcomeFile)) {
        fs.writeFileSync(welcomeFile, JSON.stringify({}), 'utf8');
    }
    return JSON.parse(fs.readFileSync(welcomeFile, 'utf8'));
}

// Guardar configuración de bienvenida
function saveWelcomeSettings(settings) {
    fs.writeFileSync(welcomeFile, JSON.stringify(settings, null, 2));
}

async function welcomeCommand(sock, chatId, senderId, args) {
    try {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ Este comando solo funciona en grupos.' });
            return;
        }

        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Solo los administradores pueden usar este comando.' });
            return;
        }

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Necesito ser administrador para activar la bienvenida.' });
            return;
        }

        const settings = loadWelcomeSettings();
        const option = args[0]?.toLowerCase();

        if (option === 'on') {
            const welcomeMessage = args.slice(1).join(' ') || 
                '👋 ¡Bienvenidos al grupo! No olviden leer las reglas.';

            settings[chatId] = { enabled: true, message: welcomeMessage };
            saveWelcomeSettings(settings);

            await sock.sendMessage(chatId, { text: `✅ Bienvenida activada:\n\n"${welcomeMessage}"` });

        } else if (option === 'off') {
            delete settings[chatId];
            saveWelcomeSettings(settings);
            await sock.sendMessage(chatId, { text: '✅ Bienvenida desactivada.' });

        } else {
            await sock.sendMessage(chatId, { 
                text: '⚙️ *Comando de Bienvenida*\n\n' +
                      '🟢 *Activar:* `.welcome on [mensaje opcional]`\n' +
                      '🔴 *Desactivar:* `.welcome off`\n\n' +
                      'Ejemplo: `.welcome on ¡Hola! Bienvenidos al grupo 👋`'
            });
        }

    } catch (error) {
        console.error('Error en welcomeCommand:', error);
        await sock.sendMessage(chatId, { text: '❌ Ocurrió un error al procesar el comando.' });
    }
}

// Función para manejar nuevos miembros
async function handleNewParticipants(sock, chatId, participants) {
    try {
        const settings = loadWelcomeSettings();

        if (settings[chatId]?.enabled) {
            for (let participant of participants) {
                const welcomeMessage = settings[chatId].message.replace('{user}', `@${participant.split('@')[0]}`);
                await sock.sendMessage(chatId, { 
                    text: welcomeMessage,
                    mentions: [participant]
                });
            }
        }
    } catch (error) {
        console.error('Error en handleNewParticipants:', error);
    }
}

module.exports = { welcomeCommand, handleNewParticipants };
