const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ekip-bilgi')
        .setDescription('Ekip detaylarını sade bir panel üzerinden gösterir.')
        .addIntegerOption(opt => opt.setName('kod').setDescription('Sorgulanacak ekip kodu').setRequired(true)),
    // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
    async execute(interaction) {
        const db = interaction.client.db;
        const kod = interaction.options.getInteger('kod');
        
        const ekipler = await db.get("ekipler") || [];
        const ekip = ekipler.find(e => parseInt(e.ekipKodu) === kod);

        if (!ekip) {
            return interaction.reply({ 
                content: "❌ Belirtilen kod ile eşleşen bir ekip kaydı bulunamadı.", 
                ephemeral: true 
            });
        }

        const uyeListesi = ekip.uyeler && ekip.uyeler.length > 0 
            ? ekip.uyeler.map(id => `<@${id}>`).join('\n') 
            : "Henüz üye bulunmuyor.";
    // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setDescription(
                `**Ekip Bilgisi (#${ekip.ekipKodu})**\n\n` +
                `**OG-1:** <@${ekip.og1ID}>\n` +
                `**OG-2:** ${ekip.og2ID ? `<@${ekip.og2ID}>` : "Yok"}\n` +
                `**Ekip Rolü:** <@&${ekip.rolID}>\n` + 
                `**Ekip Kanal:** <#${ekip.ekipKanalID}>\n` +
                `**Limit:** ${ekip.limit}\n` +
                `**Üye:** \`${ekip.uyeler.length}/${ekip.limit}\` \n\n` +
                `**Üyeler:**\n${uyeListesi}`
            )
            .setFooter({ text: `Sorgulayan: ${interaction.user.tag}` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};