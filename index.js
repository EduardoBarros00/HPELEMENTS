import express from "express";
import {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
} from "discord.js";
import dotenv from "dotenv";

dotenv.config();

// Criar servidor Express para evitar erro de "Port Scan Timeout" na Render
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Bot está rodando!");
});

app.listen(PORT, () => {
    console.log(`🌍 Servidor HTTP rodando na porta ${PORT}`);
});

// Criar cliente do bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ],
});

client.once("ready", async () => {
    console.log(`✅ Bot online como ${client.user.tag}`);
});

// IDs dos canais
const CHANNEL_SETUP_HOSPITAL = "1338158040767139923";

// Configuração do hospital
const HOSPITAL_ROLES = [
    "Diretor", "Médico", "Enfermeiro", "Paramédico", "Paciente", "Segurança"
];

const HOSPITAL_CHANNELS = {
    text: [
        "📢・anúncios",
        "💬・chat-geral",
        "📑・relatórios",
        "🚨・chamados-emergência",
        "📋・registros-hospitalares"
    ],
    voice: [
        "📞・sala-de-reunião",
        "🩺・atendimento",
        "📻・rádio-emergência"
    ]
};

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "setup_hospital") {
        const guild = interaction.guild;
        
        await interaction.reply({ content: "🛠️ Configurando o servidor para o hospital... Aguarde.", ephemeral: true });
        
        // Criando os cargos
        for (const roleName of HOSPITAL_ROLES) {
            if (!guild.roles.cache.find(role => role.name === roleName)) {
                await guild.roles.create({ name: roleName, permissions: [] });
            }
        }

        // Criando as categorias e canais
        const category = await guild.channels.create({
            name: "🏥・Hospital RP",
            type: 4
        });

        for (const channelName of HOSPITAL_CHANNELS.text) {
            await guild.channels.create({ name: channelName, type: 0, parent: category.id });
        }

        for (const channelName of HOSPITAL_CHANNELS.voice) {
            await guild.channels.create({ name: channelName, type: 2, parent: category.id });
        }

        await interaction.followUp("🏥 Configuração do hospital concluída com sucesso!");
    }
});

client.once("ready", async () => {
    const channel = await client.channels.fetch(CHANNEL_SETUP_HOSPITAL).catch(console.error);
    if (channel) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("setup_hospital")
                .setLabel("🏥 Configurar Hospital")
                .setStyle(ButtonStyle.Primary),
        );
        await channel.send({
            content: "Clique no botão abaixo para configurar o hospital RP!",
            components: [row],
        });
    }
});

// Logar o bot
client.login(process.env.TOKEN);
