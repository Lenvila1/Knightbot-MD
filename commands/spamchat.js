let handler = async (m, { conn, text }) => {
    if (!text) return conn.reply(m.chat, '> Ingrese el texto que se enviará como spam!', m);

    let pesan = ${text};
    //await m.reply('INICIO DE SPAM!\n\n*Nota: El Bot enviará el mensaje 30 veces*');

    // Obtener los participantes del grupo y filtrar solo los que no son administradores
    let participants = (await conn.groupMetadata(m.chat)).participants;
    let nonAdmins = participants
        .filter(member => !member.admin) // Excluir administradores
        .map(member => member.id); // Obtener solo los IDs de los no administradores

    // Enviar el mensaje 30 veces a los no administradores
    for (let i = 0; i < 30; i++) {
        await conn.sendMessage(m.chat, {
            text: pesan,
            mentions: nonAdmins
        });
    }
};

handler.help = ['spamchat'].map(v => v + ' <texto>');
handler.tags = ['tools'];
handler.command = /^(sp|spamchat)$/i;

handler.owner = true;

export default handler;

