async function staffCommand(sock, chatId, msg) {
    try {
        // Obtener metadata del grupo
        const groupMetadata = await sock.groupMetadata(chatId);
        
        // Obtener la foto de perfil del grupo
        let pp;
        try {
            pp = await sock.profilePictureUrl(chatId, 'image');
        } catch {
            pp = 'https://i.imgur.com/2wzGhpF.jpeg'; // Imagen predeterminada si no hay foto de grupo
        }

        // Obtener lista de administradores
        const participants = groupMetadata.participants;
        const groupAdmins = participants.filter(p => p.admin);
        const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n🔹 ');
        
        // Obtener el propietario del grupo
        const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || chatId.split('-')[0] + '@s.whatsapp.net';

        // Crear el mensaje de staff
        const text = `
≡ *ADMINISTRADORES DEL GRUPO* 🛡️
📌 *Grupo:* ${groupMetadata.subject}

👑 *Dueño del Grupo:*
🔹 @${owner.split('@')[0]}

👥 *Lista de Administradores:*
🔹 ${listAdmin}
`.trim();

        // Enviar mensaje con imagen y menciones
        await sock.sendMessage(chatId, {
            image: { url: pp },
            caption: text,
            mentions: [...groupAdmins.map(v => v.id), owner]
        });

    } catch (error) {
        console.error('Error en el comando staff:', error);
        await sock.sendMessage(chatId, { text: '❌ No se pudo obtener la lista de administradores.' });
    }
}

module.exports = staffCommand;
