const request = require('request');
const Discord = require("discord.js");

exports.run = async (client, message, args, guildConf) => {

    let panel = guildConf.panelURL;
    let key = guildConf.panelAPIKey;

    if (!panel) return client.sendErrorEmbed(message.channel, "No panel has been setup!");
    if (!key) return client.sendErrorEmbed(message.channel, "No panel api key has been setup!");

    request.get(`${panel}/api/application/nodes`, {
        auth: {
            bearer: key
        }
    }, async function(err, response, body) {

        if (err) return client.sendErrorEmbed(message.channel, "Could not connect to panel");
        if (response.statusCode === 403) return client.sendErrorEmbed(message.channel, "Invalid admin api key!");

        body = JSON.parse(body);
        body = body.data;

        const embed = new Discord.MessageEmbed()
            .setTitle("Nodes")
            .setColor(client.config.embed.color)
            .setFooter(client.config.embed.footer)

        let d = [];

        for (let i = 0; i < body.length; i++) {
            let n = await client.parseNode(body[i].attributes);
            d.push(`__**${n.name}**__\nDescription: ${n.description}\nRam: ${n.ram.max} MB\nDisk: ${n.disk.max} MB\n`);
        }

        embed.setDescription(d.length === 0 ? "None" : d.toString());

        await message.channel.send(embed);
        client.log("PTERODACTYL", `${guildConf.panelURL} -> fetched ${d.length} nodes`);


    });

}

module.exports.help = {
    name: "nodes",
    description: "Shows all nodes",
    dm: true,
    aliases: []
}
