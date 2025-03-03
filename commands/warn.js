const fs = require('fs').promises;
const path = require('path');
const isAdmin = require('../helpers/isAdmin');

const databaseDir = path.join(process.cwd(), 'database');
const warningsPath = path.join(databaseDir, 'warnings.json');

// Función para inicializar el archivo de advertencias
async function initializeWarningsFile() {
    try {
        await fs.mkdir(databaseDir, { recursive: true });
        await fs.writeFile(warningsPath, JSON.stringify({}), { flag: 'wx' }).catch(() => {});
    } catch (error) {
        console.error('❌ Error initializing warnings file:', error);
    }
}

async function warnCommand(sock, chatId, senderId, mentionedJids, message) {
    try {
        await initializeWarningsFile();

        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ Este comando solo funciona en grupos.' });
            return;
        }

        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❌ El bot debe ser administrador para usar este comando.' });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Solo los administradores pueden usar el comando de advertencia.' });
            return;
        }

        let userToWarn = mentionedJids?.[0] || message.message?.extendedTextMessage?.contextInfo?.participant;
        if (!userToWarn) {
            await sock.sendMessage(chatId, { text: '❌ Menciona a un usuario o responde a su mensaje para advertirlo.' });
            return;
        }

        // Leer advertencias actuales
        let warnings = {};
        try {
            warnings = JSON.parse(await fs.readFile(warningsPath, 'utf8'));
        } catch (error) {
            console.error('❌ Error leyendo warnings.json:', error);
            warnings = {};
        }

        if (!warnings[chatId]) warnings[chatId] = {};
        warnings[chatId][userToWarn] = (warnings[chatId][userToWarn] || 0) + 1;

        await fs.writeFile(warningsPath, JSON.stringify(warnings, null, 2));

        // Mensaje de advertencia
        const warnMsg = `⚠️ *ADVERTENCIA*\n\n👤 *Usuario:* @${userToWarn.split('@')[0]}\n🔢 *Advertencias:* ${warnings[chatId][userToWarn]}/3\n👑 *Advertido por:* @${senderId.split('@')[0]}\n🕒 *Fecha:* ${new Date().toLocaleString()}`;
        
        await sock.sendMessage(chatId, {
            text: warnMsg,
            mentions: [userToWarn, senderId]
        });

        // Expulsión automática después de 3 advertencias
        if (warnings[chatId][userToWarn] >= 3) {
            await sock.sendMessage(chatId, {
                text: `🚫 @${userToWarn.split('@')[0]} ha sido expulsado del grupo tras recibir 3 advertencias.`,
                mentions: [userToWarn]
            });

            await sock.groupParticipantsUpdate(chatId, [userToWarn], "remove");

            delete warnings[chatId][userToWarn];
            await fs.writeFile(warningsPath, JSON.stringify(warnings, null, 2));
        }

    } catch (error) {
        console.error('❌ Error en warnCommand:', error);
        await sock.sendMessage(chatId, { text: '❌ Error al procesar la advertencia. Inténtalo de nuevo más tarde.' });
    }
}

module.exports = warnCommand;
