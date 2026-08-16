const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;

client.once("ready", () => {
    console.log(`✅ Bot uruchomiony jako ${client.user.tag}`);
});

client.login(TOKEN);
