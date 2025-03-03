const fs = require('fs').promises;
const path = require('path');

const warningsFilePath = path.join(__dirname, '../data/warnings.json');

// Cargar advertencias desde el archivo
async function loadWarnings() {
    try {
        await fs.access(warningsFilePath);
        const data = await fs.readFile(warningsFilePath, 'utf8');
        return JSON.parse(data);
    } catch {
        await fs.writeFile(warningsFilePath, JSON.stringify({}), 'utf8');
        return {};
    }
}

async function warningsCommand(sock, chatId, mentionedJidList) {
    try {
        const warnings = await loadWarnings();

        if (!mentionedJidList || mentionedJidList.length === 0) {
            await sock.sendMessage(chatId, { text: '❌ Menciona a uno o más usuarios para ver sus advertencias.' });
            return;
        }

        let message = `📌 *Advertencias en el grupo*\n\n`;
        const mentions = [];

        for (const userId of mentionedJidList) {
            const count = warnings[userId] || 0;
            mentions.push(userId);
            message += `👤 @${userId.split('@')[0]} - ⚠️ ${count} advertencia(s)\n`;
        }

        await sock.sendMessage(chatId, { text: message, mentions });

    } catch (error) {
        console.error('❌ Error en warningsCommand:', error);
        await sock.sendMessage(chatId, { text: '⚠️ Ocurrió un error al verificar advertencias.' });
    }
}

module.exports = warningsCommand;
