const Discord = require('discord.js');
const request = require('request');

exports.run = async (client, message, args, guildConf, userConf) => {

    let panel = guildConf.panelURL;
    let key = userConf.panelAPIKey;

    if (!panel) await client.sendErrorEmbed(message.channel, "No panel has been setup!");
    if (!key) return client.sendErrorEmbed(message.channel, `You havent set your api key!\nDo: ${guildConf.prefix}account api`);

    let serverID = args[0];
    if (!serverID) return client.sendErrorEmbed(message.channel, "You must provide a valid server number!\nDo: cp!listservers to see your servers");

    request.get(`${panel}/api/client/servers/${serverID}`, {
        auth: {
            'bearer': key
        }
    }, async function(err, response, body) {

        if (response.statusCode === 404) return client.sendErrorEmbed(message.channel, "Could not find that server");

        body = JSON.parse(body).attributes;

        let p = guildConf.prefix;
        await client.sendEmbed(message.channel, "Server Focused!", "", [
            {
                name: "Information",
                value: `
\`\`\`
Name: ${body.name}
ID: ${body.identifier}
Description: ${body.description || "None"}
\`\`\``
            },
            {
                name: "Limits",
                value: `
\`\`\`
Ram: ${body.limits.memory === 0 ? "∞" : body.limits.memory} MB
Disk: ${body.limits.disk === 0 ? "∞" : body.limits.disk} MB
CPU: ${body.limits.cpu}%
\`\`\``
            },
            {
                name: "Commands",
                value: `
\`\`\`
${p}power
${p}info
\`\`\``
            }
        ]);

    });

    client.log("PTERODACTYL", `${guildConf.panelURL} -> fetched server ${serverID}`);

    client.userDB.set(`${message.author.id}-${message.guild.id}.focused`, serverID);

    return;

}

module.exports.help = {
    name: "focus",
    description: "Focus a server from the panel",
    dm: false,
    cooldown: 1,
    aliases: ["f"]
}
