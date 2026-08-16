const {
  Client,
  GatewayIntentBits,
  ChannelType
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;

client.once("clientReady", async () => {
  console.log(`Bot uruchomiony jako ${client.user.tag}`);

  const guild = client.guilds.cache.get(GUILD_ID);

  if (!guild) {
    console.log("Nie znaleziono serwera!");
    return;
  }

  console.log(`Połączono z serwerem: ${guild.name}`);

  const structure = {
    "👥 Obywatele": [
      "👋・powitanie",
      "📢・ogłoszenia",
      "📜・informacje-dla-obywateli",
      "❓・pomoc",
      "💬・pogaduchy"
    ],

    "🛡️ Służba Więzienna": [
      "📢・komunikaty-dowództwa",
      "📋・rozkazy",
      "📅・grafik-służby",
      "📝・raporty-służbowe",
      "📊・statystyki-funkcjonariuszy",
      "📁・dokumenty-służbowe"
    ],

    "🎓 Rekrutacja": [
      "📋・rekrutacja",
      "📝・podania",
      "📞・rozmowy-rekrutacyjne"
    ],

    "🚨 Dowództwo": [
      "🔒・gabinet-dowództwa",
      "📋・decyzje-dowództwa",
      "📊・awansy"
    ],

    "🔧 System": [
      "🤖・bot-logi",
      "📜・logi",
      "🛠️・bot-komendy"
    ]
  };

  for (const [categoryName, channels] of Object.entries(structure)) {

    let category = guild.channels.cache.find(
      channel =>
        channel.name === categoryName &&
        channel.type === ChannelType.GuildCategory
    );

    if (!category) {
      category = await guild.channels.create({
        name: categoryName,
        type: ChannelType.GuildCategory
      });

      console.log(`Utworzono kategorię: ${categoryName}`);
    }

    for (const channelName of channels) {

      const exists = guild.channels.cache.find(
        channel =>
          channel.name === channelName &&
          channel.parentId === category.id
      );

      if (!exists) {
        await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: category.id
        });

        console.log(`Utworzono kanał: ${channelName}`);
      }
    }
  }

  console.log("✅ CAŁA STRUKTURA ZOSTAŁA UTWORZONA!");
});

client.login(TOKEN);
