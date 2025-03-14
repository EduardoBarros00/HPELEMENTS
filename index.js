import discord
from discord.ext import commands

# Configuração do bot
intents = discord.Intents.default()
intents.guilds = True
intents.guild_messages = True
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)

# Lista de cargos para o hospital
HOSPITAL_ROLES = [
    "Diretor", "Médico", "Enfermeiro", "Paramédico", "Paciente", "Segurança"
]

# Lista de canais para o hospital
HOSPITAL_CHANNELS = {
    "text": [
        "📢・anúncios",
        "💬・chat-geral",
        "📑・relatórios",
        "🚨・chamados-emergência",
        "📋・registros-hospitalares"
    ],
    "voice": [
        "📞・sala-de-reunião",
        "🩺・atendimento",
        "📻・rádio-emergência"
    ]
}

@bot.event
async def on_ready():
    print(f"{bot.user} está online!")

@bot.command()
@commands.has_permissions(administrator=True)
async def setup_hospital(ctx):
    guild = ctx.guild
    
    await ctx.send("🛠️ Configurando o servidor para o hospital... Aguarde.")
    
    # Criando os cargos
    for role_name in HOSPITAL_ROLES:
        if not discord.utils.get(guild.roles, name=role_name):
            await guild.create_role(name=role_name)
            await ctx.send(f"✅ Cargo criado: {role_name}")
    
    # Criando as categorias e canais
    category = await guild.create_category("🏥・Hospital RP")
    
    for channel_name in HOSPITAL_CHANNELS["text"]:
        await guild.create_text_channel(channel_name, category=category)
        await ctx.send(f"✅ Canal de texto criado: {channel_name}")
    
    for channel_name in HOSPITAL_CHANNELS["voice"]:
        await guild.create_voice_channel(channel_name, category=category)
        await ctx.send(f"✅ Canal de voz criado: {channel_name}")
    
    await ctx.send("🏥 Configuração do hospital concluída com sucesso!")

# Rodar o bot
TOKEN = "SEU_TOKEN_AQUI"
bot.run(TOKEN)
