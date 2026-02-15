const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ekip-çıkar')
        .setDescription('Ekip lideri olarak bir üyeyi ekibinizden uzaklaştırır.')
        .addUserOption(opt => opt.setName('kullanici').setDescription('Çıkarılacak üye').setRequired(true)),
    // Sowwyz Dc : feelsaura Günceeeel Hali Yaaakında Paylaşılıcak github takip edin cbk!!
    async execute(interaction) {
        const db = interaction.client.db;
        const hedefUye = interaction.options.getMember('kullanici');
        
        let ekipler = await db.get("ekipler") || [];
        let ekipIndex = ekipler.findIndex(e => e.liderID === interaction.user.id);
        let ekip = ekipler[ekipIndex];

        if (!ekip && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "❌ Bu komutu sadece ekip liderleri veya yöneticiler kullanabilir.", ephemeral: true });
        }

        if (!ekip && interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            ekipIndex = ekipler.findIndex(e => e.uyeler.includes(hedefUye.id));
            ekip = ekipler[ekipIndex];
        }

        if (!ekip || !ekip.uyeler.includes(hedefUye.id)) {
            return interaction.reply({ content: "❌ Bu kullanıcı belirtilen bir ekibin üyesi değil.", ephemeral: true });
        }


        if (hedefUye.id === ekip.liderID) {
            return interaction.reply({ content: "❌ Kendinizi çıkaramazsınız, ekibi silmeniz gerekir.", ephemeral: true });
        }

  
        ekip.uyeler = ekip.uyeler.filter(id => id !== hedefUye.id);
        ekipler[ekipIndex] = ekip;
        await db.set("ekipler", ekipler);


        await db.delete(`aktifDavet_${interaction.user.id}_${hedefUye.id}`); 



        if (ekip.rolID) {
            await hedefUye.roles.remove(ekip.rolID).catch(() => {});
        }
    // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
        const embed = new EmbedBuilder()
            .setTitle("Üye Ekipten Uzaklaştırıldı")
            .setColor("DarkRed")
            .setDescription(`**${ekip.ekipIsmi}** ekibinden ${hedefUye} başarıyla çıkarıldı.`)
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};