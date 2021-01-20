const Discord = require("discord.js");
const moment = require("moment");
const request = require("request");

exports.run = async (client, message, args, guildConf, userConf) => {

    let panel = guildConf.panelURL;
    let key = guildConf.panelAPIKey;

    if (!panel) return client.sendErrorEmbed(message.channel, "No panel has been setup!");
    if (!key) return client.sendErrorEmbed(message.channel, "You havent set your api key!\nDo: cp!account link API-KEY");

    request.get(`${panel}/api/application/locations`, {
        auth: {
            bearer: key
        }
    }, async function(err, response, body) {

        if (err) return client.sendErrorEmbed(message.channel, "Could not connect to panel");
        if (response.statusCode === 403) return client.sendErrorEmbed(message.channel, "Invalid admin api key!");

        var body = JSON.parse(body);
        body = body.data;

        const embed = new Discord.MessageEmbed()
            .setTitle("Locations")
            .setColor(client.config.embed.color)
            .setFooter(client.config.embed.footer)

            for (let i = 0; i < body.length && i < 15; i++) {
                let location = body[i].attributes;
                embed.addField(`${i+1}. ${location.short}`, `
                **Description**: ${location.long}
                **Created**: ${moment(new Date()).diff(location.created_at, 'days') + ' days ago'}
                **Last Updated**: ${moment(new Date()).diff(location.updated_at, 'days') + ' days ago'}`, true)
            }

        await message.channel.send(embed);
        client.log("PTERODACTYL", `${guildConf.panelURL} -> fetched ${body.length} locations`);

    });


}

module.exports.help = {
    name: "locations",
    description: "Shows all of the panel locations",
    staff: true,
    aliases: ["l"]
}
