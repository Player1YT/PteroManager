const Discord = require("discord.js");

exports.run = async (client, message, args) => {

    if (args[0]) {
        const cmd = client.commands.get(args[0].toLowerCase()) || client.commands.get(client.aliases.get(args[0].toLowerCase()));
        if (cmd) {
            await client.sendEmbed(message.channel, `Help`, `**Name**: ${cmd.help.name}\n**Category**: ${cmd.help.category}\n**Description**: ${cmd.help.description}\n**DM**: ${cmd.help.dm}\n**Cooldown**: ${cmd.help.cooldown ? cmd.help.cooldown + " Seconds" : "None"}\n**Aliases**: ${cmd.help.aliases}`);
            return;
        } else {
            await client.sendErrorEmbed(message.channel, "That is not a valid command or alias")
            return;
        }
    }

    return client.sendEmbed(message.channel, "Help", "", client.getHelp());

}

module.exports.help = {
    name: "help",
    description: "Shows you all the commands",
    dm: true,
    aliases: ["h"]
}
