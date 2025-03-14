const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`${client.user.tag} está online!`);
});

client.on('messageCreate', async message => {
    if (message.content === '!setup_hospital' && message.member.permissions.has('ADMINISTRATOR')) {
        let guild = message.guild;

        const roles = ["Diretor", "Médico", "Enfermeiro", "Paramédico", "Paciente", "Segurança"];
        const textChannels = ["📢・anúncios", "💬・chat-geral", "📑・relatórios", "🚨・chamados-emergência", "📋・registros-hospitalares"];
        const voiceChannels = ["📞・sala-de-reunião", "🩺・atendimento", "📻・rádio-emergência"];

        await message.channel.send("🛠️ Configurando o servidor para o hospital... Aguarde.");

        // Criando os cargos
        for (let roleName of roles) {
            if (!guild.roles.cache.find(role => role.name === roleName)) {
                await guild.roles.create({ name: roleName });
                await message.channel.send(`✅ Cargo criado: ${roleName}`);
            }
        }

        // Criando categoria
        let category = await guild.channels.create({
            name: "🏥・Hospital RP",
            type: 4
        });

        // Criando canais de texto
        for (let channelName of textChannels) {
            await guild.channels.create({
                name: channelName,
                type: 0,
                parent: category.id
            });
            await message.channel.send(`✅ Canal de texto criado: ${channelName}`);
        }

        // Criando canais de voz
        for (let channelName of voiceChannels) {
            await guild.channels.create({
                name: channelName,
                type: 2,
                parent: category.id
            });
            await message.channel.send(`✅ Canal de voz criado: ${channelName}`);
        }

        await message.channel.send("🏥 Configuração do hospital concluída com sucesso!");
    }
});

client.login('SEU_TOKEN_AQUI');
