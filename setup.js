const {
    Client,
    GatewayIntentBits,
    ChannelType,
    PermissionsBitField
} = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;

const struktura = [
    {
        nazwa: '👥 OBYWATELE',
        kanaly: [
            '👋・powitanie',
            '📢・ogłoszenia',
            '📜・informacje-dla-obywateli',
            '📝・rekrutacja-do-służby',
            '❓・pytania',
            '📩・kontakt-z-służbą',
            '📋・skargi-i-wnioski',
            '📸・zdjęcia'
        ]
    },
    {
        nazwa: '🏢 ORGANIZACJA SŁUŻBY WIĘZIENNEJ',
        kanaly: [
            '📢・komunikaty-dowództwa',
            '📋・rozkazy',
            '📅・grafik-służby',
            '📝・raporty-służbowe',
            '📊・statystyki-funkcjonariuszy',
            '📁・dokumenty-służbowe'
        ]
    },
    {
        nazwa: '👮 SŁUŻBA',
        kanaly: [
            '🔐・konwoje',
            '🚨・interwencje',
            '📋・raporty-zmianowe',
            '🔎・przeszukania',
            '🚔・transport-osadzonych',
            '⚠️・incydenty',
            '📦・magazyn'
        ]
    },
    {
        nazwa: '🎓 SZKOLENIA',
        kanaly: [
            '📚・materiały-szkoleniowe',
            '🎓・szkolenia',
            '📝・testy',
            '🏅・certyfikaty',
            '📈・postępy-szkolenia'
        ]
    },
    {
        nazwa: '👤 OSADZENI',
        kanaly: [
            '📋・ewidencja-osadzonych',
            '⚠️・osadzeni-poszukiwani',
            '🚨・osadzeni-niebezpieczni',
            '📑・wyroki',
            '🔒・cela-osadzonego'
        ]
    },
    {
        nazwa: '🛡️ KONTROLA FUNKCJONARIUSZY',
        kanaly: [
            '📢・skargi-na-funkcjonariuszy',
            '📋・raporty-kadrowe',
            '⚖️・postępowania-dyscyplinarne',
            '🏅・awanse',
            '📉・degradacje'
        ]
    },
    {
        nazwa: '💬 STREFA SPOŁECZNA',
        kanaly: [
            '💡・pomysły',
            '💬・pogaduchy',
            '📸・zdjęcia-z-służby',
            '🏆・wyróżnienia'
        ]
    }
];

client.once('clientReady', async () => {
    console.log(`✅ Zalogowano jako ${client.user.tag}`);

    try {
        const guild = await client.guilds.fetch(GUILD_ID);

        console.log(`🏢 Serwer: ${guild.name}`);
        console.log('🚀 Tworzę strukturę serwera...');

        for (const kategoria of struktura) {

            let category = guild.channels.cache.find(
                channel =>
                    channel.type === ChannelType.GuildCategory &&
                    channel.name === kategoria.nazwa
            );

            if (!category) {
                category = await guild.channels.create({
                    name: kategoria.nazwa,
                    type: ChannelType.GuildCategory
                });

                console.log(`📁 Utworzono kategorię: ${kategoria.nazwa}`);
            }

            for (const nazwaKanalu of kategoria.kanaly) {

                const istnieje = guild.channels.cache.find(
                    channel =>
                        channel.name === nazwaKanalu &&
                        channel.parentId === category.id
                );

                if (!istnieje) {
                    await guild.channels.create({
                        name: nazwaKanalu,
                        type: ChannelType.GuildText,
                        parent: category.id
                    });

                    console.log(`   💬 Utworzono: ${nazwaKanalu}`);
                }
            }
        }

        console.log('');
        console.log('================================');
        console.log('✅ STRUKTURA SW GOTOWA!');
        console.log('================================');

    } catch (error) {
        console.error('❌ Wystąpił błąd:', error);
    }

    await client.destroy();
});

client.login(TOKEN);
