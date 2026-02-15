const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('davet-kanalı-ayarla')
        .setDescription('Ekip davetlerinin gönderileceği kanalı sadece yöneticiler belirler.')
        .addChannelOption(opt => opt.setName('kanal').setDescription('Davet kanalı').setRequired(true))
       
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), 

    async execute(interaction) {
           // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
        const isOwner = interaction.user.id === interaction.guild.ownerId;
        const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        if (!isOwner && !isAdmin) {
            return interaction.reply({ 
                content: "Bu ayarı sadece sunucu sahibi yapabilir!", 
                ephemeral: true 
            });
        }
    // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
        const kanal = interaction.options.getChannel('kanal');
        await interaction.client.db.set(`davetKanal_${interaction.guild.id}`, kanal.id);

        return interaction.reply({ 
            content: `Davet kanalı başarıyla ${kanal} olarak ayarlandı ✅ `, 
            ephemeral: true 
        });
    }
};