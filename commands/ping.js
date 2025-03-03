const os = require('os');

async function pingCommand(sock, chatId) {
    try {
        const start = Date.now();
        
        // Obtener información del sistema
        const uptime = process.uptime();
        const ram = (os.totalmem() - os.freemem()) / (1024 * 1024 * 1024);
        const platform = os.platform();
        
        // Calcular ping
        await sock.sendMessage(chatId, { text: '📊 *Calculando...*' });
        const end = Date.now();
        const ping = end - start;

        const message = `*🤖 Estado del Bot*\n\n` +
                       `*⚡ Tiempo de respuesta:* ${ping}ms\n` +
                       `*💻 Plataforma:* ${platform}\n` +
                       `*🔄 Uptime:* ${formatTime(uptime)}\n` +
                       `*💾 Uso de RAM:* ${ram.toFixed(2)}GB`;

        await sock.sendMessage(chatId, { text: message });

    } catch (error) {
        console.error('Error en el comando ping:', error);
        await sock.sendMessage(chatId, { text: '❌ No se pudo obtener el estado del bot.' });
    }
}

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0) time += `${seconds}s`;

    return time.trim();
}

module.exports = pingCommand;
