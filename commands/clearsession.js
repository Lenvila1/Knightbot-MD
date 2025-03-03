const fs = require('fs');
const path = require('path');
const isOwner = require('../helpers/isOwner');

async function clearSessionCommand(sock, chatId, senderId) {
    try {
        // Verificar si el remitente es el propietario
        if (!isOwner(senderId)) {
            await sock.sendMessage(chatId, { 
                text: '❌ ¡Este comando solo puede ser usado por el propietario!'
            });
            return;
        }

        // Definir el directorio de sesión
        const sessionDir = path.join(__dirname, '../session');

        if (!fs.existsSync(sessionDir)) {
            await sock.sendMessage(chatId, { 
                text: '❌ ¡No se encontró el directorio de sesión!'
            });
            return;
        }

        let archivosEliminados = 0;
        let errores = 0;
        let detallesErrores = [];

        // Enviar mensaje de estado inicial
        await sock.sendMessage(chatId, { 
            text: '🔍 Optimizando archivos de sesión para mejorar el rendimiento...'
        });

        const archivos = fs.readdirSync(sessionDir);
        
        // Contar archivos por tipo para optimización
        let appStateSyncCount = 0;
        let preKeyCount = 0;

        for (const archivo of archivos) {
            if (archivo.startsWith('app-state-sync-')) appStateSyncCount++;
            if (archivo.startsWith('pre-key-')) preKeyCount++;
        }

        for (const archivo of archivos) {
            try {
                // Omitir archivos protegidos
                if (archivo === 'creds.json') {
                    continue;
                }

                const rutaArchivo = path.join(sessionDir, archivo);
                if (!fs.statSync(rutaArchivo).isFile()) continue;

                // Optimizar archivos "app-state-sync" (mantener solo los últimos 3)
                if (archivo.startsWith('app-state-sync-')) {
                    if (appStateSyncCount > 3) {
                        fs.unlinkSync(rutaArchivo);
                        archivosEliminados++;
                        appStateSyncCount--;
                    }
                    continue;
                }

                // Optimizar archivos "pre-key" (mantener solo los últimos 5)
                if (archivo.startsWith('pre-key-')) {
                    if (preKeyCount > 5) {
                        fs.unlinkSync(rutaArchivo);
                        archivosEliminados++;
                        preKeyCount--;
                    }
                    continue;
                }

                // Eliminar archivos antiguos de "sender-key"
                if (archivo.startsWith('sender-key-')) {
                    const stats = fs.statSync(rutaArchivo);
                    const antigüedadArchivo = Date.now() - stats.mtimeMs;
                    // Eliminar solo si tiene más de 6 horas
                    if (antigüedadArchivo > 21600000) {
                        fs.unlinkSync(rutaArchivo);
                        archivosEliminados++;
                    }
                }

            } catch (err) {
                console.error('Error procesando archivo:', archivo, err);
                errores++;
                detallesErrores.push(`${archivo}: ${err.message}`);
            }
        }

        // Enviar mensaje de éxito de optimización
        let mensajeResultado = `✨ *Optimización de sesión completada*\n\n` +
                               `🔄 Archivos optimizados: ${archivosEliminados}\n` +
                               `⚡ ¡El rendimiento del bot ha mejorado!\n\n` +
                               `*Nota:* Ahora el bot responderá más rápido.`;

        if (errores > 0) {
            mensajeResultado += `\n\n⚠️ Se omitieron ${errores} archivo(s) por seguridad.`;
        }

        await sock.sendMessage(chatId, { 
            text: mensajeResultado
        });

    } catch (error) {
        console.error('Error en el comando clearsession:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ ¡Ocurrió un error al optimizar la sesión!\n' + error.message
        });
    }
}

module.exports = clearSessionCommand;
