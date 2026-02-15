const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const config = require("../../../../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ekibi-tanımla') 
        .setDescription('Yeni bir ekip tanımlama işlemi gerçekleştirir.')
        .addUserOption(opt => opt.setName('og1').setDescription('Birinci yöneticiyi seçin.').setRequired(true))
           .addUserOption(opt => opt.setName('og2').setDescription('İkinci yöneticiyi seçin.').setRequired(true))
        .addRoleOption(opt => opt.setName('rol').setDescription('Ekibe atanacak rolü seçin.').setRequired(true))
        .addChannelOption(opt => opt.setName('ekipkanal').setDescription('Ekip kanalını seçin.').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addIntegerOption(opt => opt.setName('limit').setDescription('Maksimum üye limitini belirleyin.').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply();
        const db = interaction.client.db;
        
        const og1 = interaction.options.getUser('og1');
        const og2 = interaction.options.getUser('og2');
        const rol = interaction.options.getRole('rol');
        const kanal = interaction.options.getChannel('ekipkanal');
        const limit = interaction.options.getInteger('limit');
           // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!! 
        const ogRolID = config.ogRolID;

        try {
          
            const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
            if (botMember.roles.highest.position <= rol.position) {
                return await interaction.editReply({ 
                    content: "Botun rolü, tanımlanmaya çalışılan rolden daha aşağıda. Lütfen roller kısmından botu en üste taşıyın." 
                });
            }

            let ekipler = await db.get("ekipler") || [];
            const sonEkip = ekipler.length > 0 ? ekipler[ekipler.length - 1] : null;
            const yeniKod = sonEkip ? (parseInt(sonEkip.ekipKodu) + 1) : 1;

            const ogYonetim = [og1.id];
            if (og2) ogYonetim.push(og2.id);

            // OG rollerini tanımla
            for (const id of ogYonetim) {
                try {
                    const member = await interaction.guild.members.fetch(id);
                    await member.roles.add(rol.id);
                    if (ogRolID) await member.roles.add(ogRolID);
                } catch (e) { 
                    console.log(`${id} için rol atama başarısız.`); 
                }
            }

            const yeniEkipData = {
                ekipKodu: yeniKod,
                ekipIsmi: `${rol.name}`, 
                og1ID: og1.id,
                og2ID: og2 ? og2.id : null,
                uyeler: ogYonetim,
                limit: limit,
                rolID: rol.id,
                ekipKanalID: kanal.id,
                kayitTarihi: Date.now()
            };
            
            await db.push("ekipler", yeniEkipData);

        // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
            const successEmbed = new EmbedBuilder()
                .setColor("#2b2d31")
                .setAuthor({ name: "Ekip Kayıt Sistemi", iconURL: interaction.guild.iconURL() })
                .setDescription(
                    `**Ekip Bilgisi (#${yeniKod})**\n\n` +
                    `OG-1: <@${og1.id}>\n` +
                    `OG-2: ${og2 ? `<@${og2.id}>` : "Yok"}\n` +
                    `Ekip Rolü: <@&${rol.id}>\n` +
                    `Ekip Kanal: <#${kanal.id}>\n` +
                    `Limit: ${limit}`
                )
                .setFooter({ text: "İşlem başarıyla tamamlandı ✅" })
                .setTimestamp();
    // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
            return await interaction.editReply({ embeds: [successEmbed] });
    // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
        } catch (err) {
            console.error(err);
            return await interaction.editReply({ content: "İşlem sırasında bir sistem hatası oluştu." });
        }
    }
};