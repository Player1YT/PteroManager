const Discord = require("discord.js");

exports.run = async (client, message, args) => {

    await client.sendEmbed(message.channel, "Check your dms");
    await client.sendEmbed(message.author, "Panels", client.serverDB.map(s => `URL: ${s.panel.url || "none"} [Nodes: ${s.nodes.length}]\n`).join(""));

    return;

}

module.exports.help = {
    name: "panels",
    description: "Gets a list of all panels",
    dm: true,
    owner: true,
    aliases: []
}
