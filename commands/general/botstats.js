const moment = require('moment');
require('moment-duration-format');
const Discord = require('discord.js');

exports.run = async (client, message, args, guildConf, userConf) => {

    client.sendEmbed(
        message.channel,
        "Stats", `
**Stats**:
- Servers: ${client.guilds.cache.size}
- Users: ${client.guilds.cache.map(s => s.memberCount).reduce((a, b) => a + b)}
- Channels: ${client.guilds.cache.map(s => s.channels.cache.size).reduce((a, b) => a + b)}
- Emojis: ${client.guilds.cache.map(s => s.emojis.cache.size).reduce((a, b) => a + b)}

**Database**:
- Servers: ${await client.serverDB.size}
- Users: ${await client.userDB.size}

**Other**:
- Discord.js: v${Discord.version}
- NodeJS: ${process.version}
- Ram Used: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB

`);

};

module.exports.help = {
    name: "botstats",
    description: "Checkout the stats regarding the bot",
    dm: true,
    aliases: []
}
