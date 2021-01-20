const Discord = require("discord.js");

exports.run = async (client, message, args, guildConf) => {

    await client.sendEmbed(message.channel, "Check console");
    console.log(guildConf);

    return;

}

module.exports.help = {
    name: "debug",
    description: "Debug's current guild",
    dm: false,
    aliases: []
}