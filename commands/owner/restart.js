const Discord = require('discord.js');

exports.run = async (client, message, args, guildConf, userConf) => {

    let m = await client.sendEmbed(message.channel, "Restarting...");

    process.exit(0);


}

module.exports.help = {
    name: "restart",
    description: "Restart the bot",
    owner: true,
    aliases: ["reboot"]
}
