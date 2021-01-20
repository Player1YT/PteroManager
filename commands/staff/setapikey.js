const request = require('request');

module.exports.run = async (client, message, args, guildConf, userConf) => {

    const panel = guildConf.panelURL;

    await client.sendEmbed(message.channel, "Check your dms");

    let msg;

    try {
        msg = await client.sendEmbed(message.author, "Application API", "Please send the application api key from the panel");
    } catch(e) {
            return client.sendErrorEmbed(message.channel, "Please turn your dms on and try again.");
    }

    const filter = m => m.author.id === message.author.id;
        msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(collected => {
                let msg = collected.first();
                let content = msg.content;

                request.get(`${panel}/api/application/nodes`, {
                    auth: {
                        bearer: content
                    }
                }, async function(err, response, body) {

                    if (err) return client.sendErrorEmbed(message.author, "An error has occured!");
                    if (response.statusCode === 403) return client.sendErrorEmbed(message.author, "Invalid api key!");

                    client.serverDB.set(`${message.guild.id}.panelAPIKey`, content);
                    client.log("PTERODACTYL", `${guildConf.panelURL} -> checked application api key`);
                    return client.sendEmbed(message.author, "Application api key has been saved!");
                
                });

            })
            .catch(() => client.sendErrorEmbed(message.author, "You have not responded in time. Please start over."));

    return;

}

module.exports.help = {
    name: "setapikey",
    staff: true,
    aliases: []
}
