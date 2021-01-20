module.exports = async (client) => {

    // Log stats
    client.log("STATS", `Servers: ${client.guilds.cache.size} - Channels: ${client.guilds.cache.map(s => s.channels.cache.size).reduce((a, b) => a + b)} - Users: ${client.guilds.cache.map(s => s.memberCount).reduce((a, b) => a + b)} - Emojis: ${client.guilds.cache.map(s => s.emojis.cache.size).reduce((a, b) => a + b)}`)

    // Bot invite
    client.invite = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=${client.config.permissions}&scope=bot`

    // Database stats
    client.log("DATABASE", `User database has ${await client.userDB.size} rows.`);
    client.log("DATABASE", `Server database has ${await client.serverDB.size} rows.`);

    // Create help menu
    client.generateHelp();

    // Ensure all guilds are in the db
    client.guilds.cache.map(async (g) => {
        await client.serverDB.ensure(g.id, {
            guildID: g.id,
            guildName: g.name,
            prefix: client.config.prefix,
            panelURL: null,
            panelAPIKey: null,
            serversCreated: 0,
            packages: [],
        });
    })

    // Set Status
    await client.user.setActivity(`${client.config.prefix}help || v${require('../package.json').version}`, { type: "WATCHING" });

    client.log("BOT", `Bot is online (${client.user.tag})`)

};
