// Połączony moduł SW: tickets
// Oryginalna logika pochodzi z repozytorium Bot-ticket.
module.exports = function init_tickets(sharedClient, createScopedClient, createRegistrar) {
const {
    Client,
    GatewayIntentBits,
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    REST,
    Routes
} = require("discord.js");

// ======================================================
// KONFIGURACJA
// ======================================================

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// ID roli opiekunów ticketów
const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID || "";

// ID kanału #logi-pomocy
const LOG_CHANNEL_ID = process.env.TICKET_LOG_CHANNEL_ID || process.env.LOG_CHANNEL_ID || "";

// Kategoria ticketów
const TICKET_CATEGORY_NAME = "🎫・TICKETY-SW";

// ======================================================
// TYPY TICKETÓW
// ======================================================

const TICKETS = {
    pomoc: {
        label: "Pomoc ogólna",
        prefix: "pomoc",
        color: 0xe53935
    },

    rekrutacja: {
        label: "Rekrutacja SW",
        prefix: "rekrutacja",
        color: 0x00a651
    },

    awans: {
        label: "Podanie o awans",
        prefix: "awans",
        color: 0x00a651
    },

    urlop: {
        label: "Urlop / Nieobecność",
        prefix: "urlop",
        color: 0x00a651
    },

    zwolnienie: {
        label: "Zwolnienie ze służby",
        prefix: "zwolnienie",
        color: 0x00a651
    },

    skarga_funkcjonariusz: {
        label: "Skarga na funkcjonariusza",
        prefix: "skarga-funkcjonariusz",
        color: 0x5865f2
    },

    skarga_osadzony: {
        label: "Skarga osadzonego",
        prefix: "skarga-osadzony",
        color: 0x5865f2
    },

    penitencjarna: {
        label: "Sprawa penitencjarna",
        prefix: "penitencjarna",
        color: 0x5865f2
    },

    ochrona: {
        label: "Dział Ochrony",
        prefix: "ochrona",
        color: 0x5865f2
    },

    kwatermistrzowski: {
        label: "Dział Kwatermistrzowski",
        prefix: "kwatermistrzowski",
        color: 0x2b2d31
    },

    it: {
        label: "Dział IT / Łączność",
        prefix: "it",
        color: 0x5865f2
    },

    odznaczenie: {
        label: "Pochwała / Odznaczenie",
        prefix: "odznaczenie",
        color: 0x00a651
    },

    pilna: {
        label: "Pilna interwencja",
        prefix: "pilna",
        color: 0xe53935
    },

    dowodztwo: {
        label: "Kontakt z Dowództwem",
        prefix: "dowodztwo",
        color: 0x2b2d31
    }
};

// ======================================================
// CLIENT
// ======================================================

const client = createScopedClient(sharedClient, ["ticket-panel"], ["ticket_"]);

// ======================================================
// KOMENDA
// ======================================================

const commands = [
    {
        name: "ticket-panel",
        description: "Wyświetla panel ticketów Służby Więziennej"
    }
];

const rest = createRegistrar();

// ======================================================
// FUNKCJA LOGÓW
// ======================================================

async function sendLog(embed) {

    if (!LOG_CHANNEL_ID) {
        console.log("⚠️ LOG_CHANNEL_ID nie jest ustawione.");
        return;
    }

    try {

        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);

        if (!logChannel) {
            console.log("❌ Nie znaleziono kanału logów.");
            return;
        }

        if (!logChannel.isTextBased()) {
            console.log("❌ Kanał logów nie jest kanałem tekstowym.");
            return;
        }

        await logChannel.send({
            embeds: [embed]
        });

        console.log("✅ Wysłano log do #logi-pomocy.");

    } catch (error) {

        console.error(
            "❌ Nie udało się wysłać loga:",
            error
        );
    }
}

// ======================================================
// GOTOWOŚĆ BOTA
// ======================================================

client.once("ready", async () => {

    console.log("======================================");
    console.log(`✅ BOT ONLINE: ${client.user.tag}`);
    console.log(`🏠 GUILD ID: ${GUILD_ID}`);
    console.log(`📋 LOG CHANNEL: ${LOG_CHANNEL_ID || "BRAK"}`);
    console.log(`👮 STAFF ROLE: ${STAFF_ROLE_ID || "BRAK"}`);
    console.log("======================================");

    try {

        await rest.put(
            Routes.applicationGuildCommands(
                CLIENT_ID,
                GUILD_ID
            ),
            {
                body: commands
            }
        );

        console.log("✅ Zarejestrowano /ticket-panel");

    } catch (error) {

        console.error(
            "❌ Błąd rejestracji komendy:",
            error
        );
    }
});

// ======================================================
// PANEL
// ======================================================

function createTicketPanel() {

    const embed = new EmbedBuilder()
        .setColor(0x19a85b)
        .setTitle("Kontakt ze Służbą Więzienną")
        .setDescription(
            "Aby skontaktować się z odpowiednim działem, " +
            "stwórz ticket w odpowiedniej kategorii.\n\n" +

            "• Opisz dokładnie swoją sprawę.\n" +
            "• W razie potrzeby dołącz dowody lub zdjęcia.\n" +
            "• Nie twórz kilku ticketów w tej samej sprawie.\n\n" +

            "🔒 Po zakończeniu sprawy ticket zostanie zamknięty " +
            "przez funkcjonariusza."
        )
        .setFooter({
            text: "Służba Więzienna • System Ticketów"
        })
        .setTimestamp();

    // ==================================================
    // RZĄD 1
    // ==================================================

    const row1 = new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId("ticket_pomoc")
                .setLabel("Pomoc ogólna")
                .setEmoji("📨")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("ticket_rekrutacja")
                .setLabel("Rekrutacja SW")
                .setEmoji("📨")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("ticket_awans")
                .setLabel("Podanie o awans")
                .setEmoji("📨")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("ticket_urlop")
                .setLabel("Urlop / Nieobecność")
                .setEmoji("📨")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("ticket_zwolnienie")
                .setLabel("Zwolnienie ze służby")
                .setEmoji("📨")
                .setStyle(ButtonStyle.Success)
        );

    // ==================================================
    // RZĄD 2
    // ==================================================

    const row2 = new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId("ticket_skarga_funkcjonariusz")
                .setLabel("Skarga na funkcjonariusza")
                .setEmoji("📨")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("ticket_skarga_osadzony")
                .setLabel("Skarga osadzonego")
                .setEmoji("📨")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("ticket_penitencjarna")
                .setLabel("Sprawa penitencjarna")
                .setEmoji("📨")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("ticket_ochrona")
                .setLabel("Dział Ochrony")
                .setEmoji("📨")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("ticket_kwatermistrzowski")
                .setLabel("Dział Kwatermistrzowski")
                .setEmoji("📨")
                .setStyle(ButtonStyle.Secondary)
        );

    // ==================================================
    // RZĄD 3
    // ==================================================

    const row3 = new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId("ticket_it")
                .setLabel("Dział IT / Łączność")
                .setEmoji("📨")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("ticket_odznaczenie")
                .setLabel("Pochwała / Odznaczenie")
                .setEmoji("📨")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("ticket_pilna")
                .setLabel("Pilna interwencja")
                .setEmoji("📨")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("ticket_dowodztwo")
                .setLabel("Kontakt z Dowództwem")
                .setEmoji("📨")
                .setStyle(ButtonStyle.Secondary)
        );

    return {
        embeds: [embed],
        components: [row1, row2, row3]
    };
}

// ======================================================
// INTERAKCJE
// ======================================================

client.on("interactionCreate", async interaction => {

    try {

        // ==================================================
        // /ticket-panel
        // ==================================================

        if (interaction.isChatInputCommand()) {

            if (interaction.commandName !== "ticket-panel") {
                return;
            }

            if (
                !interaction.memberPermissions.has(
                    PermissionFlagsBits.ManageGuild
                )
            ) {

                return interaction.reply({
                    content:
                        "❌ Nie masz uprawnień do wysłania panelu.",
                    ephemeral: true
                });
            }

            await interaction.channel.send(
                createTicketPanel()
            );

            return interaction.reply({
                content:
                    "✅ Panel ticketów SW został wysłany.",
                ephemeral: true
            });
        }

        // ==================================================
        // TYLKO PRZYCISKI
        // ==================================================

        if (!interaction.isButton()) {
            return;
        }

        // ==================================================
        // ZAMKNIĘCIE
        // ==================================================

        if (interaction.customId === "ticket_close") {

            const channel = interaction.channel;

            const ownerId =
                channel.topic?.match(
                    /ticket-owner:(\d+)/
                )?.[1];

            const ticketType =
                channel.topic?.match(
                    /ticket-type:([a-z0-9_-]+)/
                )?.[1];

            const ticketData =
                ticketType
                    ? TICKETS[ticketType]
                    : null;

            const logEmbed = new EmbedBuilder()
                .setColor(0xe53935)
                .setTitle("🔴 ZAMKNIĘTO TICKET")
                .addFields(
                    {
                        name: "🎫 Ticket",
                        value: `\`${channel.name}\``,
                        inline: false
                    },
                    {
                        name: "👤 Zamknął",
                        value: `${interaction.user}`,
                        inline: false
                    },
                    {
                        name: "🆔 ID zamykającego",
                        value: `\`${interaction.user.id}\``,
                        inline: false
                    }
                )
                .setFooter({
                    text:
                        "System logów • Służba Więzienna"
                })
                .setTimestamp();

            if (ownerId) {

                logEmbed.addFields({
                    name: "👤 Właściciel ticketu",
                    value: `<@${ownerId}>`,
                    inline: false
                });
            }

            if (ticketData) {

                logEmbed.addFields({
                    name: "📋 Kategoria",
                    value: ticketData.label,
                    inline: false
                });
            }

            await sendLog(logEmbed);

            await interaction.reply({
                content:
                    "🔒 Ticket zostanie zamknięty za 5 sekund.",
                ephemeral: true
            });

            setTimeout(async () => {

                try {

                    await channel.delete(
                        "Zamknięcie ticketu SW"
                    );

                } catch (error) {

                    console.error(
                        "❌ Nie udało się usunąć ticketu:",
                        error
                    );
                }

            }, 5000);

            return;
        }

        // ==================================================
        // SPRAWDZENIE TYP
        // ==================================================

        if (
            !interaction.customId.startsWith(
                "ticket_"
            )
        ) {
            return;
        }

        const type =
            interaction.customId.replace(
                "ticket_",
                ""
            );

        const ticket = TICKETS[type];

        if (!ticket) {
            return;
        }

        // ==================================================
        // SPRAWDZENIE CZY JUŻ MA TICKET
        // ==================================================

        const existingTicket =
            interaction.guild.channels.cache.find(
                channel =>
                    channel.type ===
                        ChannelType.GuildText &&
                    channel.topic?.includes(
                        `ticket-owner:${interaction.user.id}`
                    )
            );

        if (existingTicket) {

            return interaction.reply({
                content:
                    `❌ Masz już otwarty ticket: ${existingTicket}`,
                ephemeral: true
            });
        }

        // ==================================================
        // KATEGORIA
        // ==================================================

        let category =
            interaction.guild.channels.cache.find(
                channel =>
                    channel.type ===
                        ChannelType.GuildCategory &&
                    channel.name ===
                        TICKET_CATEGORY_NAME
            );

        if (!category) {

            category =
                await interaction.guild.channels.create({

                    name:
                        TICKET_CATEGORY_NAME,

                    type:
                        ChannelType.GuildCategory
                });
        }

        // ==================================================
        // NAZWA
        // ==================================================

        let username =
            interaction.user.username
                .toLowerCase()
                .replace(
                    /[^a-z0-9-_]/g,
                    "-"
                );

        if (!username) {
            username = interaction.user.id;
        }

        const channelName =
            `${ticket.prefix}-${username}`
                .slice(0, 90);

        // ==================================================
        // UPRAWNIENIA
        // ==================================================

        const permissionOverwrites = [

            {
                id: interaction.guild.id,

                deny: [
                    PermissionFlagsBits.ViewChannel
                ]
            },

            {
                id: interaction.user.id,

                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.EmbedLinks
                ]
            }
        ];

        // ==================================================
        // ROLA STAFF
        // ==================================================

        if (STAFF_ROLE_ID) {

            const staffRole =
                interaction.guild.roles.cache.get(
                    STAFF_ROLE_ID
                );

            if (staffRole) {

                permissionOverwrites.push({

                    id: STAFF_ROLE_ID,

                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks,
                        PermissionFlagsBits.ManageMessages
                    ]
                });

            } else {

                console.log(
                    "⚠️ STAFF_ROLE_ID jest nieprawidłowe."
                );
            }
        }

        // ==================================================
        // TWORZENIE KANAŁU
        // ==================================================

        let ticketChannel;

        try {

            ticketChannel =
                await interaction.guild.channels.create({

                    name: channelName,

                    type: ChannelType.GuildText,

                    parent: category.id,

                    topic:
                        `ticket-owner:${interaction.user.id}` +
                        `|ticket-type:${type}`,

                    permissionOverwrites
                });

        } catch (error) {

            console.error(
                "❌ BŁĄD TWORZENIA TICKETU:",
                error
            );

            return interaction.reply({
                content:
                    "❌ Nie udało się utworzyć ticketu.\n\n" +
                    "Sprawdź, czy bot posiada uprawnienie **Zarządzanie kanałami**.",
                ephemeral: true
            });
        }

        // ==================================================
        // EMBED TICKETU
        // ==================================================

        const ticketEmbed =
            new EmbedBuilder()

                .setColor(ticket.color)

                .setTitle(
                    `📨 ${ticket.label}`
                )

                .setDescription(
                    `Witaj ${interaction.user}!\n\n` +

                    `Twój ticket został utworzony.\n` +

                    `Opisz dokładnie swoją sprawę ` +
                    `i poczekaj na odpowiedź funkcjonariusza.\n\n` +

                    `**📋 Kategoria:** ${ticket.label}\n` +
                    `**👤 Autor:** ${interaction.user}\n\n` +

                    `• Opisz dokładnie swoją sprawę.\n` +
                    `• W razie potrzeby dołącz dowody lub zdjęcia.\n\n` +

                    `🔒 Po zakończeniu sprawy ticket zostanie zamknięty ` +
                    `przez funkcjonariusza.`
                )

                .setFooter({
                    text:
                        "Służba Więzienna • System Ticketów"
                })

                .setTimestamp();

        // ==================================================
        // PRZYCISK ZAMKNIĘCIA
        // ==================================================

        const closeRow =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            "ticket_close"
                        )

                        .setLabel(
                            "Zamknij ticket"
                        )

                        .setEmoji("🔒")

                        .setStyle(
                            ButtonStyle.Danger
                        )
                );

        // ==================================================
        // WYSŁANIE WIADOMOŚCI
        // ==================================================

        await ticketChannel.send({

            content:
                `${interaction.user}` +
                (
                    STAFF_ROLE_ID
                        ? ` <@&${STAFF_ROLE_ID}>`
                        : ""
                ),

            embeds: [
                ticketEmbed
            ],

            components: [
                closeRow
            ]
        });

        // ==================================================
        // LOG OTWARCIA
        // ==================================================

        const openLog =
            new EmbedBuilder()

                .setColor(0x57f287)

                .setTitle(
                    "🟢 OTWARTO TICKET"
                )

                .addFields(

                    {
                        name: "👤 Użytkownik",
                        value:
                            `${interaction.user}`,
                        inline: false
                    },

                    {
                        name: "🎫 Ticket",
                        value:
                            `${ticketChannel}`,
                        inline: false
                    },

                    {
                        name: "🆔 ID użytkownika",
                        value:
                            `\`${interaction.user.id}\``,
                        inline: false
                    },

                    {
                        name: "📋 Kategoria",
                        value:
                            ticket.label,
                        inline: false
                    }
                )

                .setFooter({
                    text:
                        "System logów • Służba Więzienna"
                })

                .setTimestamp();

        await sendLog(openLog);

        // ==================================================
        // ODPOWIEDŹ
        // ==================================================

        await interaction.reply({

            content:
                `✅ Twój ticket został utworzony: ${ticketChannel}`,

            ephemeral: true
        });

    } catch (error) {

        console.error(
            "❌ BŁĄD INTERAKCJI:",
            error
        );

        try {

            if (!interaction.replied) {

                await interaction.reply({

                    content:
                        "❌ Wystąpił błąd podczas wykonywania operacji.",

                    ephemeral: true
                });

            }

        } catch {}
    }
});

// ======================================================
// BŁĘDY
// ======================================================

client.on(
    "error",
    error => {

        console.error(
            "❌ Discord Client Error:",
            error
        );
    }
);

process.on(
    "unhandledRejection",
    error => {

        console.error(
            "❌ Unhandled Rejection:",
            error
        );
    }
);

// ======================================================
// SPRAWDZENIE VARIABLES
// ======================================================

if (
    !TOKEN ||
    !CLIENT_ID ||
    !GUILD_ID
) {

    console.error(
        "❌ Brakuje TOKEN, CLIENT_ID lub GUILD_ID w Variables."
    );

    process.exit(1);
}

// ======================================================
// LOGOWANIE
// ======================================================


};
