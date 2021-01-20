const Discord = require("discord.js");

exports.run = async (client, message, args) => {

    await client.sendEmbed(message.channel, "Check your dms");
    await client.sendEmbed(message.author, `Servers`, client.guilds.cache.map(g => `**${g.name}** [${g.memberCount} Members]\n`).join(""));

    return;

}

module.exports.help = {
    name: "servers",
    description: "Generates a pastebin link with all the current guilds",
    dm: true,
    aliases: []
}
