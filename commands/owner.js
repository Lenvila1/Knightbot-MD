const settings = require('../settings');

async function ownerCommand(sock, chatId) {
    try {
        const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${settings.botOwner}
TEL;waid=${settings.ownerNumber}:${settings.ownerNumber}
END:VCARD
`;

        await sock.sendMessage(chatId, {
            contacts: { displayName: settings.botOwner, contacts: [{ vcard }] },
        });

        await sock.sendMessage(chatId, {
            text: `📞 *Información del Propietario*\n👤 Nombre: *${settings.botOwner}*\n📱 Número: wa.me/${settings.ownerNumber}`
        });

    } catch (error) {
        console.error('❌ Error en el comando de propietario:', error);
        await sock.sendMessage(chatId, { text: '❌ No se pudo obtener la información del propietario en este momento.' });
    }
}

module.exports = ownerCommand;
