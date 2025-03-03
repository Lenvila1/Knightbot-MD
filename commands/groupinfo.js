async function groupInfoCommand(sock, chatId, msg) {
    try {
        // Obtener los metadatos del grupo
        const groupMetadata = await sock.groupMetadata(chatId);
        
        // Obtener la foto de perfil del grupo
        let pp;
        try {
            pp = await sock.profilePictureUrl(chatId, 'image');
        } catch {
            pp = 'https://i.imgur.com/2wzGhpF.jpeg'; // Imagen predeterminada
        }

        // Obtener los administradores del grupo
        const participants = groupMetadata.participants;
        const groupAdmins = participants.filter(p => p.admin);
        const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
        
        // Obtener el propietario del grupo
        const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || chatId.split('-')[0] + '@s.whatsapp.net';

        // Crear el mensaje con la información del grupo
        const text = `
┌──「 *INFORMACIÓN DEL GRUPO* 」
▢ *🆔 ID:*
   • ${groupMetadata.id}
▢ *📌 Nombre:* 
   • ${groupMetadata.subject}
▢ *👥 Miembros:* 
   • ${participants.length}
▢ *👑 Propietario:* 
   • @${owner.split('@')[0]}
▢ *🛡 Administradores:* 
${listAdmin || 'No hay administradores.'}

▢ *📖 Descripción:* 
   • ${groupMetadata.desc?.toString() || 'Sin descripción'}
`.trim();

        // Enviar mensaje con imagen y menciones
        await sock.sendMessage(chatId, {
            image: { url: pp },
            caption: text,
            mentions: [...groupAdmins.map(v => v.id), owner]
        });

    } catch (error) {
        console.error('Error en el comando groupinfo:', error);
        await sock.sendMessage(chatId, { text: '❌ No se pudo obtener la información del grupo.' });
    }
}

module.exports = groupInfoCommand;
