const request = require('request');
const moment = require('moment');

exports.run = async (client, message, args, guildConf, userConf) => {

    let panel = guildConf.panelURL;
    let key = guildConf.panelAPIKey;

    if (!panel) return client.sendErrorEmbed(message.channel, "No panel has been setup!");
    if (!key) return client.sendErrorEmbed(message.channel, "You havent set your api key!\nDo: cp!account link API-KEY");

    let discordUser = message.mentions.users.first() || client.users.cache.get(args[0]);
    if (!discordUser) return client.sendErrorEmbed(message.channel, "Please provide a discord user");

    let panelID = args[1];
    if (!panelID) return client.sendErrorEmbed(message.channel, "Please provide a panel user id");
    if (isNaN(panelID)) return client.sendErrorEmbed(message.channel, "Invalid panel user id");

    let data = {};

    request.get(`${panel}/api/application/users/${panelID}?include=servers`, {
        auth: {
            bearer: key
        },
        json: data
    }, async function(err, response, body) {

        let errors = response.body.errors;
        if (errors && errors.length > 0) return client.sendErrorEmbed(message.author, errors[0].detail);

        if (err) return client.sendErrorEmbed(message.author, "An error has occured");
        if (response.statusCode === 403) return client.sendErrorEmbed(message.author, "Invalid api key!");

        let attributes = body.attributes;

        Object.keys(attributes).forEach(k => {
            if (k !== "relationships") data[k] = attributes[k];
        })

        let servers = attributes.relationships.servers.data.map(s => s.attributes);

        client.userDB.set(`${discordUser.id}-${message.guild.id}`, {
            guildID: message.guild.id,
            userID: discordUser.id,
            panelAPIKey: null,
            panelID: data.id,
            focused: null,
            servers: servers.map(s => s.identifier),
            products: []
        });

        await client.sendEmbed(message.channel, "Success!", "", [
            {
                name: "Profile",
                value: `
First Name: ${attributes.first_name}
Language: ${attributes.language}
Admin: ${attributes.root_admin ? "✅" : "❌"}

Created: ${moment(new Date()).diff(attributes.created_at, 'days') + ' days ago'}
Last Updated: ${moment(new Date()).diff(attributes.updated_at, 'days') + ' days ago'}  
`
            },
            {
                name: `Servers [${servers.length}]`,
                value: `
**Total Limits**:
- Ram: ${servers.length === 0 ? "0" : servers.map(s => s.limits.memory).reduce((a, b) => a + b)} MB
- Disk: ${servers.length === 0 ? "0" : servers.map(s => s.limits.disk).reduce((a, b) => a + b)} MB
- CPU: ${servers.length === 0 ? "0" : servers.map(s => s.limits.cpu).reduce((a, b) => a + b)}%
- Databases: ${servers.length === 0 ? "0" : servers.map(s => s.feature_limits.databases).reduce((a, b) => a + b)}
- Allocations: ${servers.length === 0 ? "0" : servers.map(s => s.feature_limits.allocations).reduce((a, b) => a + b)}
`
            }
        ])

        client.log("PTERODACTYL", `${guildConf.panelURL} -> forcelinked ${discordUser.username}`);


        return;
    });

    return;


}

module.exports.help = {
    name: "forcelink",
    description: "Forces panel account and discord account to link",
    aliases: []
}
