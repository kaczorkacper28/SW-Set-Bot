require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  throw new Error("Brakuje TOKEN lub CLIENT_ID w sekretach środowiska.");
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel]
});

// Każdy moduł rejestruje swoje komendy tutaj. Moduły nie wykonują własnych
// żądań REST i nie uruchamiają osobnego klienta Discord.
const pendingCommands = new Map();

function createRegistrar() {
  return {
    async put(route, payload) {
      const match = String(route).match(/guilds\/(\d+)\/commands/);
      if (!match) throw new Error("Nieobsługiwana trasa rejestracji komend: " + route);
      const guildId = match[1];
      const commands = payload && Array.isArray(payload.body) ? payload.body : [];
      const current = pendingCommands.get(guildId) || [];
      pendingCommands.set(guildId, current.concat(commands));
      return { queued: true, guildId, count: commands.length };
    }
  };
}

function createScopedClient(sharedClient, commandNames, componentPrefixes) {
  const commands = new Set(commandNames);
  return new Proxy(sharedClient, {
    get(target, property) {
      if (property === "on") {
        return (eventName, listener) => {
          if (eventName === "interactionCreate") {
            target.on(eventName, async interaction => {
              if (interaction.isChatInputCommand?.()) {
                if (!commands.has(interaction.commandName)) return;
              } else if (
                interaction.isButton?.() ||
                interaction.isModalSubmit?.() ||
                interaction.isStringSelectMenu?.() ||
                interaction.isAnySelectMenu?.()
              ) {
                const customId = interaction.customId || "";
                if (!componentPrefixes.some(prefix => customId.startsWith(prefix))) return;
              } else {
                return;
              }
              try {
                await listener(interaction);
              } catch (error) {
                console.error("[SW moduł] Błąd obsługi interakcji:", error);
              }
            });
            return sharedClient;
          }
          target.on(eventName, listener);
          return sharedClient;
        };
      }
      const value = Reflect.get(target, property, target);
      return typeof value === "function" ? value.bind(target) : value;
    }
  });
}

// Wczytanie modułów: każdy zachowuje własną logikę i konfigurację,
// ale wszystkie korzystają z jednego klienta Discord.
require("./modules/documents")(client, createScopedClient, createRegistrar);
require("./modules/staff")(client, createScopedClient, createRegistrar);
require("./modules/ranks")(client, createScopedClient, createRegistrar);
require("./modules/reports")(client, createScopedClient, createRegistrar);
require("./modules/payouts")(client, createScopedClient, createRegistrar);
require("./modules/prisoners")(client, createScopedClient, createRegistrar);
require("./modules/tickets")(client, createScopedClient, createRegistrar);

client.once("ready", async () => {
  console.log(`✅ Połączony bot SW zalogowany jako ${client.user.tag}`);
  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    for (const [guildId, queued] of pendingCommands.entries()) {
      const byName = new Map();
      for (const command of queued) {
        if (!command || !command.name) continue;
        if (byName.has(command.name)) {
          throw new Error(`Powtórzona komenda /${command.name} dla serwera ${guildId}. Sprawdź moduły przed rejestracją.`);
        }
        byName.set(command.name, command);
      }
      const commands = [...byName.values()];
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, guildId), { body: commands });
      console.log(`✅ Zarejestrowano ${commands.length} komend na serwerze ${guildId}.`);
    }
    if (pendingCommands.size === 0) {
      console.warn("⚠️ Żaden moduł nie dodał komend. Sprawdź konfigurację.");
    }
  } catch (error) {
    console.error("❌ Rejestracja połączonych komend nie powiodła się:", error);
  }
});

client.on("error", error => console.error("❌ Błąd klienta Discord:", error));
process.on("unhandledRejection", error => console.error("❌ Nieobsłużone odrzucenie Promise:", error));

client.login(TOKEN).catch(error => {
  console.error("❌ Nie udało się zalogować do Discorda:", error);
  process.exitCode = 1;
});
