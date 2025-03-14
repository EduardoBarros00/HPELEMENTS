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

// Criar cliente do bot com intents ajustadas
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, // Necessário para interações e eventos básicos
        GatewayIntentBits.GuildMessages, // Necessário se o bot precisar ler mensagens
        GatewayIntentBits.GuildMessageReactions, // Caso precise de reações
    ],
});

client.once("ready", async () => {
    console.log(`✅ Bot online como ${client.user.tag}`);
});

// IDs dos canais
const CHANNEL_SETUP_HOSPITAL = "1350125282933346360";

// Configuração do hospital com permissões e cores personalizadas
const HOSPITAL_ROLES = {
    "Diretor": { permissions: [PermissionsBitField.Flags.Administrator], color: "#FF0000" },
    "Médico": { permissions: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageMessages], color: "#008000" },
    "Enfermeiro": { permissions: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel], color: "#00FFFF" },
    "Paramédico": { permissions: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel], color: "#FFD700" },
    "Paciente": { permissions: [PermissionsBitField.Flags.ViewChannel], color: "#FFFFFF" }
};

const HOSPITAL_CATEGORIES = {
    "RECEPÇÃO": ["💬・chat-visitante", "🩸・recrutamento", "📅・registre-se"],
    "EXAMES": ["📑・agendamentos", "📋・agendados", "🧪・testegravidez", "🧬・testedna"],
    "OBSTETRÍCIA": ["📜・cartão-gestante"],
    "ADOÇÃO": ["💚・quero-uma-família"],
    "PAIS-BEBÊS": ["👶・regras-pais-bebês"],
    "DIVERSOS": ["📷・instagram"],
    "TICKETS": ["🎫・abrir-ticket"]
};

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "setup_hospital") {
        const guild = interaction.guild;
        
        await interaction.reply({ content: "🛠️ Configurando o servidor para o hospital... Aguarde.", ephemeral: true });
        
        // Criando os cargos com permissões e cores personalizadas
        for (const [roleName, roleData] of Object.entries(HOSPITAL_ROLES)) {
            if (!guild.roles.cache.find(role => role.name === roleName)) {
                await guild.roles.create({ name: roleName, permissions: roleData.permissions, color: roleData.color });
            }
        }

        // Criando categorias e canais com permissões adequadas
        for (const [categoryName, channels] of Object.entries(HOSPITAL_CATEGORIES)) {
            const category = await guild.channels.create({
                name: `📂・${categoryName}`,
                type: 4
            });
            
            for (const channelName of channels) {
                await guild.channels.create({
                    name: channelName,
                    type: 0,
                    parent: category.id,
                    permissionOverwrites: Object.entries(HOSPITAL_ROLES).map(([roleName, roleData]) => {
                        const role = guild.roles.cache.find(r => r.name === roleName);
                        return role ? { id: role.id, allow: roleData.permissions } : null;
                    }).filter(Boolean)
                });
            }
        }

        await interaction.followUp("🏥 Configuração do hospital concluída com sucesso!");
    }
});

client.once("ready", async () => {
    try {
        const channel = await client.channels.fetch(CHANNEL_SETUP_HOSPITAL);
        if (!channel) {
            console.error(`❌ O canal com ID ${CHANNEL_SETUP_HOSPITAL} não foi encontrado! Verifique se o bot tem acesso.`);
            return;
        }
        
        // Verifica se o bot tem permissão de envio de mensagens no canal
        if (!channel.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)) {
            console.error("❌ O bot não tem permissão para enviar mensagens no canal especificado!");
            return;
        }
        
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
    } catch (error) {
        console.error("❌ Erro ao acessar o canal do bot. Verifique as permissões ou se o canal ainda existe.", error);
    }
});

// Logar o bot com token correto
if (!process.env.TOKEN) {
    console.error("❌ Token do bot não foi encontrado. Verifique o arquivo .env ou as variáveis de ambiente.");
    process.exit(1);
}

client.login(process.env.TOKEN).catch(err => {
    console.error("❌ Erro ao logar o bot. Verifique se o token é válido e se as intents corretas estão ativadas no Discord Developer Portal.", err);
    process.exit(1);
});
