const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const config = require("../../../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ekip-davet')
        .setDescription('Resmi bir ekip katılım daveti oluşturur.')
        .addUserOption(opt => opt.setName('kullanici').setDescription('Davet edilecek kullanıcıyı seçin.').setRequired(true)),

    async execute(interaction) {
        const db = interaction.client.db;
        const hedef = interaction.options.getUser('kullanici');
        
    // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
        const davetKanalId = await db.get(`davetKanal_${interaction.guild.id}`);
        const davetKanali = interaction.guild.channels.cache.get(davetKanalId);

        if (!davetKanali) {
            return interaction.reply({ content: "Hata: Davet kanalı yapılandırılmamış.", ephemeral: true });
        }

    // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
        let ekipler = await db.get("ekipler") || [];
        let ekip = ekipler.find(e => e.og1ID === interaction.user.id || e.og2ID === interaction.user.id);

        if (!ekip) {
            return interaction.reply({ content: "Erişim Engellendi: Sadece ekip yöneticileri davet gönderebilir.", ephemeral: true });
        }

      
        if (hedef.bot) return interaction.reply({ content: "Botlar ekibe dahil edilemez.", ephemeral: true });
        if (hedef.id === interaction.user.id) return interaction.reply({ content: "Kendinizi davet edemezsiniz.", ephemeral: true });

        const zatenEkipteMi = ekipler.some(e => (e.uyeler && e.uyeler.includes(hedef.id)) || e.og1ID === hedef.id || e.og2ID === hedef.id);
        if (zatenEkipteMi) {
            return interaction.reply({ content: `${hedef.username} zaten bir ekibin parçası.`, ephemeral: true });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`accept_${ekip.ekipKodu}_${hedef.id}`)
                .setLabel('Onayla') 
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`reject_${ekip.ekipKodu}_${hedef.id}`)
                .setLabel('Reddet') 
                .setStyle(ButtonStyle.Danger)
        );

        const inviteEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTitle(`Ekip Daveti`) 
            .setColor("#0451ec") 
            .setDescription(
                `${hedef}, **${ekip.ekipIsmi}** ekibine davet ediliyorsun.\n` +
                `Onaylarsan 24 saat (1 gün) boyunca ayrılamazsın.`
            )
            .setTimestamp();

      // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
        try {
            const sentMessage = await davetKanali.send({ 
                content: `${hedef}`, 
                embeds: [inviteEmbed], 
                components: [row] 
            });

            await db.set(`aktifDavet_${interaction.user.id}_${hedef.id}`, sentMessage.id);

     
            setTimeout(async () => {
                const stillPending = await db.get(`aktifDavet_${interaction.user.id}_${hedef.id}`);
                if (stillPending) {
                    await db.delete(`aktifDavet_${interaction.user.id}_${hedef.id}`);
                    const expiredRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('exp').setLabel('Süresi Doldu').setStyle(ButtonStyle.Secondary).setDisabled(true)
                    );
                    await sentMessage.edit({ components: [expiredRow] }).catch(() => {});
                }
            }, 86400000);
    // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
            return interaction.reply({ content: `Davet başarıyla ${davetKanali} kanalına iletildi.`, ephemeral: true });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Mesaj gönderilirken bir hata oluştu.", ephemeral: true });
        }
    }
};