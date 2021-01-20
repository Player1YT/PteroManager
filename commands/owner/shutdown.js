const Discord = require('discord.js');

exports.run = async (client, message, args, guildConf, userConf) => {

    let m = await client.sendEmbed(message.channel, "Stopping...");

    process.exit(1);


}

module.exports.help = {
    name: "shutdown",
    description: "Stops the bot",
    owner: true,
    aliases: ["stop"]
}
