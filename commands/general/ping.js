const Discord = require('discord.js');

exports.run = (client, message, args, guildConf, userConf) => {

    client.sendEmbed(
        message.channel,
        `Latency`,
        `
        \`Bot Latency\` ${Date.now() - message.createdTimestamp}ms
        \`API Latency\` ${Math.round(client.ws.ping)}ms`
    );

}

module.exports.help = {
    name: "ping",
    description: "Pings the Bot",
    dm: true,
    cooldown: 5,
    aliases: ["p"]
}
