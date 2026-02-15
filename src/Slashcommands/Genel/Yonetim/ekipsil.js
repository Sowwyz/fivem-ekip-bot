const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ekipsil')
        .setDescription('Bir ekibi koduna göre veritabanından ve sistemden tamamen siler.')
        .addIntegerOption(option => 
            option.setName('kod')
                .setDescription('Silinecek ekibin numarasını (kodunu) girin')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const db = interaction.client.db;
        const kod = interaction.options.getInteger('kod');
    // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!

        let ekipler = await db.get("ekipler") || [];

    // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
        const ekipIndex = ekipler.findIndex(e => e.ekipKodu === kod);

        if (ekipIndex === -1) {
            return interaction.reply({ 
                content: `❌ **${kod}** koduna sahip bir ekip bulunamadı!`, 
                ephemeral: true 
            });
        }
    // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
        const ekipIsmi = ekipler[ekipIndex].ekipIsmi; 
    // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!

        ekipler = ekipler.filter(e => e.ekipKodu !== kod);

     
        await db.set("ekipler", ekipler);

  
        return interaction.reply({ 
            content: `🗑️ **${ekipIsmi}** (Kod: ${kod}) ekibi ve tüm verileri sistemden başarıyla temizlendi.` 
        });
    },
};