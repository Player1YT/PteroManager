const Discord = require('discord.js');
const request = require('request');

exports.run = async (client, message, args, guildConf, userConf) => {

    let panel = guildConf.panelURL;
    let key = userConf.panelAPIKey;

    if (!panel) return client.sendErrorEmbed(message.channel, "No panel has been setup!");
    if (!key) return client.sendErrorEmbed(message.channel, `You havent set your api key!\nDo: ${guildConf.prefix}account api`);

    if (userConf.focused === null) return client.sendErrorEmbed(message.channel, "You havent focused a server");

    let power = args[0];
    if (!["start", "kill", "stop", "restart"].includes(power)) return client.sendEmbed(message.channel, "Invalid argument", "\`\`\`start, stop, kill, restart\`\`\`");

    let msg;
    switch(power) {
        case "start": {
            msg = "Server is starting!";
            break;
        }
        case "kill": {
            msg = "Server has been killed";
            break;
        }
        case "stop": {
            msg = "Server is now stopping.";
            break;
        }
        case "restart": {
            msg = "Server is restarting.";
            break;
        }
    }

    request.post(`${panel}/api/client/servers/${userConf.focused}/power`, {
        auth: {
            bearer: key
        },
        json: {
            signal: power
        }
    }, async function(err, response, body) {

        if (err) return client.sendErrorEmbed(message.channel, "An error has occured");
        if (response.statusCode === 403) return client.sendErrorEmbed(message.channel, "Invalid api key!");

        await client.sendEmbed(message.channel, msg);
        client.log("PTERODACTYL", `${guildConf.panelURL} -> ${userConf.panel.focused}: ${msg.toLowerCase()} `);

    });

}

module.exports.help = {
    name: "power",
    description: "Run a power action on the focused server",
    dm: false,
    cooldown: 2,
    aliases: []
}
