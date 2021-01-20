const Discord = require("discord.js");
const moment = require("moment");
const request = require("request");

exports.run = async (client, message, args, guildConf, userConf) => {

    let panel = guildConf.panelURL;
    let key = guildConf.panelAPIKey;

    let nestID = args[0];
    if (!nestID) return client.sendErrorEmbed(message.channel, "You must provide an egg id");

    if (!panel) return client.sendErrorEmbed(message.channel, "No panel has been setup!");
    if (!key) return client.sendErrorEmbed(message.channel, "You havent set your api key!\nDo: cp!account link API-KEY");

    request.get(`${panel}/api/application/nests/${nestID}/eggs`, {
        auth: {
            bearer: key
        }
    }, async function(err, response, body) {

        if (err) return client.sendErrorEmbed(message.channel, "Could not connect to panel");
        if (response.statusCode === 403) return client.sendErrorEmbed(message.channel, "Invalid admin api key!");

        try {
            body = JSON.parse(body);
        } catch(e) {
            return await client.sendErrorEmbed(message.channel, "An error has occured!");
        }
        body = body.data;

        const embed = new Discord.MessageEmbed()
            .setTitle(`Nest Eggs`)
            .setColor(client.config.embed.color)
            .setFooter(client.config.embed.footer)

            for (let i = 0; i < body.length && i < 10; i++) {
                let egg = body[i].attributes;
                embed.addField(`${egg.id}. ${egg.name}`, `
                **Author**: ${egg.author}
                **DockerImage**: \`\`\`${egg.docker_image}\`\`\`
                **Startup**: \`\`\`${egg.startup}\`\`\`

                **Created**: ${moment(new Date()).diff(egg.created_at, 'days') + ' days ago'}
                **Last Updated**: ${moment(new Date()).diff(egg.updated_at, 'days') + ' days ago'}`, true)
            }

        await message.channel.send(embed);
        client.log("PTERODACTYL", `${guildConf.panelURL} -> fetched nest (${nestID})'s eggs`);

    });


}

module.exports.help = {
    name: "eggs",
    description: "Shows all of the a nest's eggs",
    staff: true,
    aliases: []
}
