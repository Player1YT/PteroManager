const discord = require('discord.js')

module.exports.run = async (client, message, args) => {

    let url = args[0];
    if (!url) {return await client.sendErrorEmbed(message.channel, `You must provide a url`);}

    let expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
    let regex = new RegExp(expression);

    if (!url.match(regex)) return client.sendErrorEmbed(message.channel, `You must provide a valid url`);
    if (url.endsWith("/")) { url = url.slice(0, -1); }

    client.serverDB.set(`${message.guild.id}.panelURL`, url);
    await client.sendEmbed(message.channel, "Panel URL Saved!", args[0]);

    client.log("PTERODACTYL", `${url} -> saved panel url`);

    return;

}

module.exports.help = {
    name: "setpanel",
    staff: true,
    aliases: ["sp"]
}
