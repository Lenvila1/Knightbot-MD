const fs = require('fs');
const path = require('path');
const isOwner = require('../helpers/isOwner');

// Ruta para almacenar la configuración del auto estado
const configPath = path.join(__dirname, '../data/autoStatus.json');

// Inicializa el archivo de configuración si no existe
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ enabled: false }));
}

async function autoStatusCommand(sock, chatId, senderId, args) {
    try {
        // Verificar si el usuario es el dueño del bot
        if (!isOwner(senderId)) {
            await sock.sendMessage(chatId, { 
                text: '❌ *Este comando solo puede ser usado por el dueño del bot!*'
            });
            return;
        }

        // Leer la configuración actual
        let config = JSON.parse(fs.readFileSync(configPath));

        // Si no hay argumentos, mostrar el estado actual
        if (!args || args.length === 0) {
            const status = config.enabled ? 'activado' : 'desactivado';
            await sock.sendMessage(chatId, { 
                text: `🔄 *Estado Automático*\n\nEstado actual: ${status}\n\nUso:\n.autostatus on - Activar vista automática de estados\n.autostatus off - Desactivar vista automática de estados`
            });
            return;
        }

        // Manejo de comandos on/off
        const command = args[0].toLowerCase();
        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '✅ *Vista automática de estados activada.*\nEl bot ahora visualizará automáticamente los estados de los contactos.'
            });
        } else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '❌ *Vista automática de estados desactivada.*\nEl bot ya no visualizará automáticamente los estados.'
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ *Comando inválido.*\nUsa:\n.autostatus on - Activar vista automática de estados\n.autostatus off - Desactivar vista automática de estados'
            });
        }

    } catch (error) {
        console.error('Error en el comando autostatus:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ *Error al gestionar el auto estado.*\n' + error.message
        });
    }
}

// Función para verificar si el auto estado está activado
function isAutoStatusEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.enabled;
    } catch (error) {
        console.error('Error al verificar la configuración del auto estado:', error);
        return false;
    }
}

// Función para manejar actualizaciones de estado
async function handleStatusUpdate(sock, status) {
    try {
        if (!isAutoStatusEnabled()) {
            console.log('❌ Vista automática de estados está desactivada.');
            return;
        }

        // Agregar un pequeño retraso para evitar límite de tasa
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Manejar estado desde messages.upsert
        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                try {
                    await sock.readMessages([msg.key]);
                    const sender = msg.key.participant || msg.key.remoteJid;
                    console.log(`✅ Estado visualizado.`);
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        console.log('⚠️ Se alcanzó el límite de tasa, esperando antes de reintentar...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await sock.readMessages([msg.key]);
                    } else {
                        throw err;
                    }
                }
                return;
            }
        }

        // Manejar actualizaciones de estado directas
        if (status.key && status.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.key]);
                const sender = status.key.participant || status.key.remoteJid;
                console.log(`✅ Estado visto de: ${sender.split('@')[0]}`);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Se alcanzó el límite de tasa, esperando antes de reintentar...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.key]);
                } else {
                    throw err;
                }
            }
            return;
        }

        // Manejar reacciones en estados
        if (status.reaction && status.reaction.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.reaction.key]);
                const sender = status.reaction.key.participant || status.reaction.key.remoteJid;
                console.log(`✅ Estado visto de: ${sender.split('@')[0]}`);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Se alcanzó el límite de tasa, esperando antes de reintentar...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.reaction.key]);
                } else {
                    throw err;
                }
            }
            return;
        }

    } catch (error) {
        console.error('❌ Error en la vista automática de estados:', error.message);
    }
}

module.exports = {
    autoStatusCommand,
    handleStatusUpdate
};
