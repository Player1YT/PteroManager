const Discord = require('discord.js');
const request = require('request');

exports.run = async (client, message, args, guildConf, userConf) => {

    let panel = guildConf.panelURL;
    let key = userConf.panelAPIKey;
    let focused = userConf.focused;

    if (!panel) return client.sendErrorEmbed(message.channel, "No panel has been setup!");
    if (!key) return client.sendErrorEmbed(message.channel, `You havent set your api key!\nDo: ${guildConf.prefix}account api`);

    if (focused === null) return client.sendErrorEmbed(message.channel, "You havent focused a server");

    request.get(`${panel}/api/client/servers/${focused}`, {
        auth: {
            'bearer': key
        }
    }, async function(err, response, body) {

        if (err) return client.sendErrorEmbed(message.channel, "An error has occured");
        if (response.statusCode === 403) return client.sendErrorEmbed(message.channel, "Invalid api key!");

        body = JSON.parse(body);
        body = body.attributes;

        client.log("PTERODACTYL", `${guildConf.panelURL} -> fetched ${focused} server`);

        request.get(`${panel}/api/client/servers/${focused}/utilization`, {
            auth: {
                'bearer': key
            }
        }, async function(err2, response2, body2) {

            if (err) return client.sendErrorEmbed(message.channel, "An error has occured");

            body2 = JSON.parse(body2).attributes;

            let state = body2.state;
            if (state === "on") {
                state = "Online";
            } else if (state === "off") {
                state = "Offline";
            } else if (state === "starting") {
                state = "Restarting"
            }

            await client.sendEmbed(
                message.channel,
                body.name, `
📌 **Information**
Status: ${state}
Description: ${body.description ? body.description : "None"}
Server Owner: ${body.server_owner ? "✅" : "❌" }

📈 **Stats**
Ram: ${body2.memory.current} MB / ${body2.memory.limit === 0 ? "∞" : body2.memory.limit} MB
Disk: ${body2.disk.current} MB / ${body2.disk.limit === 0 ? "∞" : body2.disk.limit} MB
CPU: ${body2.cpu.current}%
${body2.players.current > 0 ? `Players: ${body2.players.current}/${body2.players.limit}` : ""}
`);

            client.log("PTERODACTYL", `${guildConf.panelURL} -> fetched ${focused} server's utilization`);

        });

    });

    return;

}

module.exports.help = {
    name: "info",
    description: "Gets the current focused server's information",
    dm: false,
    cooldown: 1,
    aliases: ["i"]
}
