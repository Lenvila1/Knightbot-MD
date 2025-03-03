const fetch = require('node-fetch');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

async function emojimixCommand(sock, chatId, msg) {
    try {
        // Obtener el texto después del comando
        const text = msg.message?.conversation?.trim() || 
                    msg.message?.extendedTextMessage?.text?.trim() || '';
        
        const args = text.split(' ').slice(1);
        
        if (!args[0]) {
            await sock.sendMessage(chatId, { text: '🎴 Ejemplo: .emojimix 😎+🥰' });
            return;
        }

        if (!text.includes('+')) {
            await sock.sendMessage(chatId, { 
                text: '✳️ Separa los emojis con un signo *+*\n\n📌 Ejemplo: \n*.emojimix* 😎+🥰' 
            });
            return;
        }

        let [emoji1, emoji2] = args[0].split('+').map(e => e.trim());

        // Usando la API de Tenor
        const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            await sock.sendMessage(chatId, { 
                text: '❌ Estos emojis no se pueden combinar. ¡Prueba con otros!' 
            });
            return;
        }

        // Obtener la primera imagen resultante
        const imageUrl = data.results[0].url;

        // Crear directorio temporal si no existe
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        // Generar nombres de archivo aleatorios con rutas seguras
        const tempFile = path.join(tmpDir, `temp_${Date.now()}.png`).replace(/\\/g, '/');
        const outputFile = path.join(tmpDir, `sticker_${Date.now()}.webp`).replace(/\\/g, '/');

        // Descargar y guardar la imagen
        const imageResponse = await fetch(imageUrl);
        const buffer = await imageResponse.buffer();
        fs.writeFileSync(tempFile, buffer);

        // Convertir a WebP usando ffmpeg con ruta segura
        const ffmpegCommand = `ffmpeg -i "${tempFile}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" "${outputFile}"`;
        
        await new Promise((resolve, reject) => {
            exec(ffmpegCommand, (error) => {
                if (error) {
                    console.error('Error en FFmpeg:', error);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        // Verificar si el archivo WebP se creó correctamente
        if (!fs.existsSync(outputFile)) {
            throw new Error('No se pudo crear el sticker.');
        }

        // Leer el archivo WebP
        const stickerBuffer = fs.readFileSync(outputFile);

        // Enviar el sticker
        await sock.sendMessage(chatId, { 
            sticker: stickerBuffer 
        }, { quoted: msg });

        // Limpiar archivos temporales
        try {
            fs.unlinkSync(tempFile);
            fs.unlinkSync(outputFile);
        } catch (err) {
            console.error('Error al limpiar archivos temporales:', err);
        }

    } catch (error) {
        console.error('Error en el comando emojimix:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ ¡No se pudo mezclar los emojis! Asegúrate de usar emojis válidos.\n\nEjemplo: .emojimix 😎+🥰' 
        });
    }
}

module.exports = emojimixCommand;
