const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("./config.json");
const { QuickDB } = require("quick.db");
const { joinVoiceChannel } = require('@discordjs/voice');
const fs = require("fs");
const path = require("path");

const db = new QuickDB(); 
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ],
    partials: Object.values(Partials),
});

client.slashcommands = new Collection();
client.db = db;


const loadCommands = (dir) => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) return;
    const files = fs.readdirSync(fullPath);
    for (const file of files) {
        const filePath = path.join(fullPath, file);
        if (fs.lstatSync(filePath).isDirectory()) {
            loadCommands(path.join(dir, file));
        } else if (file.endsWith(".js")) {
            const command = require(filePath);
            if (command.data && command.data.name) {
                client.slashcommands.set(command.data.name, command);
                console.log(`✅ Komut Yüklendi: ${command.data.name}`);
            }
        }
    }
};

loadCommands("src/Slashcommands");
    // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!

client.on("interactionCreate", async (interaction) => {
    
    if (interaction.isChatInputCommand()) {
        const command = client.slashcommands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error("🔥 Komut Hatası:", error);
        }
    }

    if (interaction.isButton()) {
        const [action, kod, hedefId] = interaction.customId.split('_');
        
        if (interaction.user.id !== hedefId) {
            return interaction.reply({ content: "❌ Bu davet senin adına düzenlenmemiş!", ephemeral: true });
        }
    // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
        let ekipler = await client.db.get("ekipler") || [];
        let ekipIndex = ekipler.findIndex(e => String(e.ekipKodu) === String(kod));
        let ekip = ekipler[ekipIndex];

        if (!ekip) {
            return interaction.update({ content: "❌ Hata: Ekip veritabanında bulunamadı!", components: [], embeds: [] });
        }

    // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
        if (action === 'accept') {
            const zatenEkipteMi = ekipler.some(e => 
                (e.uyeler && e.uyeler.includes(interaction.user.id)) || 
                e.og1ID === interaction.user.id || 
                e.og2ID === interaction.user.id
            );

            if (zatenEkipteMi) {
                return interaction.reply({ content: "❌ Zaten aktif bir ekibin parçası olduğun için daveti kabul edemezsin!", ephemeral: true });
            }

            if (ekip.uyeler.length >= ekip.limit) {
                return interaction.update({ content: `❌ Bu ekibin kontenjanı dolmuş!`, components: [], embeds: [] });
            }


            try {
          
                const guild = client.guilds.cache.get(interaction.guildId);
                const member = await guild.members.fetch(interaction.user.id);
                
                if (ekip.rolID) {
                   
                    await member.roles.add(ekip.rolID);
                    console.log(`✅ [ROL VERİLDİ] ${member.user.tag} -> ${ekip.ekipIsmi}`);
                } else {
                    console.error("❌ Veritabanında bu ekibe ait rolID bulunamadı!");
                }
            } catch (err) {
                console.error("❌ KRİTİK ROL HATASI:", err.message);
                return interaction.reply({ 
                    content: "❌ Rolün verilemedi! Lütfen Botun rolünü 'Roller' kısmından en üste çekin ve Botun 'Manage Roles' yetkisi olduğundan emin olun.", 
                    ephemeral: true 
                });
            }

      // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
            ekip.uyeler.push(interaction.user.id);
            ekipler[ekipIndex] = ekip;
            await client.db.set("ekipler", ekipler);

    // Sowwyz Dc : feelsaura Güncel Hali Yakında Paylaşılıcak github takip edin cbk!!
            await client.db.delete(`aktifDavet_${ekip.og1ID}_${interaction.user.id}`);
            if (ekip.og2ID) await client.db.delete(`aktifDavet_${ekip.og2ID}_${interaction.user.id}`);


            const ekipKanali = interaction.guild.channels.cache.get(ekip.ekipKanalID);
            if (ekipKanali) {
                const duyuruEmbed = new EmbedBuilder()
                    .setAuthor({ name: `${ekip.ekipIsmi} `})
                    .setColor("#5865F2")
                    .setDescription(` ${interaction.user} ekibimize katıldı! `)
                    .setTimestamp();

                await ekipKanali.send({ content: `🔔 Hoş geldin ${interaction.user}^^`, embeds: [duyuruEmbed] }).catch(() => {});
            }
           const acceptEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setTitle("Davet Kabul Edildi") // 
            .setColor("#2ecc71") 
            .setDescription(`${interaction.user}, <@&${ekip.rolID}> ekibine katıldı!`); 

        return interaction.update({ 
            content: `${interaction.user}`, 
            embeds: [acceptEmbed], 
            components: [] 
        });
    }
    // Sowwyz Dc : feelsaura Günceeel Haaali Yakında Paaylaşılıcak github takip edin cbk!!
    if (action === 'reject') {
        await client.db.delete(`aktifDavet_${ekip.og1ID}_${interaction.user.id}`);
        return interaction.update({ content: "Davet reddedildi.", embeds: [], components: [] });
    }
}
});


client.on("ready", async () => {
    console.log(`\n🚀 ${client.user.tag} Sowwyz Project on ;D `);
    
    try {
        const commands = client.slashcommands.map(cmd => cmd.data.toJSON());
        await client.application.commands.set(commands);
        console.log("Sowwyz'nin özel dokunuşları tespit edildi ^^ ");
    } catch (e) { console.error(" Komut senkronizasyon hatası:", e); }

    const voiceChannel = client.channels.cache.get(config.BotSesKanal);
    if (voiceChannel) {
        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: true
        });
        console.log(`bot ait olduğu yere geldi: ${voiceChannel.name}`);
    }
});

client.login(config.token);