const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'data', 'messageCount.json');

// Función para cargar los contadores de mensajes desde un archivo JSON
function cargarConteoMensajes() {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath);
        return JSON.parse(data);
    }
    return {};
}

// Función para guardar los contadores de mensajes en un archivo JSON
function guardarConteoMensajes(conteoMensajes) {
    fs.writeFileSync(dataFilePath, JSON.stringify(conteoMensajes, null, 2));
}

// Función para incrementar el conteo de mensajes de un usuario en un grupo
function incrementarConteoMensajes(groupId, userId) {
    const conteoMensajes = cargarConteoMensajes();

    if (!conteoMensajes[groupId]) {
        conteoMensajes[groupId] = {};
    }

    if (!conteoMensajes[groupId][userId]) {
        conteoMensajes[groupId][userId] = 0;
    }

    conteoMensajes[groupId][userId] += 1;
    guardarConteoMensajes(conteoMensajes);
}

// Función para mostrar los 5 miembros más activos del grupo
async function topMiembros(sock, chatId, isGroup) {
    if (!isGroup) {
        await sock.sendMessage(chatId, { text: '❌ *Este comando solo está disponible en grupos.*' });
        return;
    }

    const conteoMensajes = cargarConteoMensajes();
    const conteoGrupo = conteoMensajes[chatId] || {};

    // Ordenar los miembros según el número de mensajes
    const miembrosOrdenados = Object.entries(conteoGrupo)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Obtener los 5 miembros más activos

    if (miembrosOrdenados.length === 0) {
        await sock.sendMessage(chatId, { text: '📊 *Aún no hay actividad registrada en el grupo.*' });
        return;
    }

    // Crear el mensaje de ranking con formato atractivo
    let mensaje = `🏆 *Top 5 Miembros más activos del grupo*\n\n`;
    miembrosOrdenados.forEach(([userId, count], index) => {
        const medalla = ['🥇', '🥈', '🥉', '🎖️', '🏅'][index] || '🔹';
        mensaje += `${medalla} *@${userId.split('@')[0]}* - *${count} mensajes*\n`;
    });

    await sock.sendMessage(chatId, { 
        text: mensaje, 
        mentions: miembrosOrdenados.map(([userId]) => userId) 
    });
}

module.exports = { incrementarConteoMensajes, topMiembros };
