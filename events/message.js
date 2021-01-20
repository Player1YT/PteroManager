module.exports = async (client, message) => {

    if (message.author.bot) return;

    let args;
    let guildConf;
    let userConf;

    if (message.guild) {
        guildConf = await client.serverDB.ensure(message.guild.id, {
            guildID: message.guild.id,
            guildName: message.guild.name,
            prefix: client.config.prefix,
            panelURL: null,
            panelAPIKey: null,
            serversCreated: 0,
            packages: [],
        });
        userConf = await client.userDB.ensure(`${message.author.id}-${message.guild.id}`, {
            guildID: message.guild.id,
            userID: message.author.id,
            panelAPIKey: null,
            panelID: {},
            focused: null,
            servers: [],
            products: []
        });

        if (message.content.indexOf(guildConf.prefix) !== 0) return;
        args = message.content.slice(guildConf.prefix.length).trim().split(/ +/g);
    } else {
        if (message.content.indexOf(client.config.dmPrefix) !== 0) return;
        args = message.content.slice(client.config.dmPrefix.length).trim().split(/ +/g);
    }

    const command = args.shift().toLowerCase();
    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

    if (client.config.deleteMessage) await message.delete();
    if (!cmd) return;

    if (client.config.maintenance && !client.isOwner(message)) return client.sendEmbed(message.channel, client.config.botName + " is currently in maintenance! Check back soon!");

    if (!message.guild && !cmd.help.dm) return client.sendEmbed(message.channel, "You may only use that command in servers!");

    // if (cmd.help.cooldown != null) {
    //     if (client.hasCooldown(message.author.id, message.guild.id, cmd.help.name)) {
    //         return message.react("⏰");
    //     } else {
    //         client.addCooldown(message.author.id, message.guild.id, cmd.help.name, cmd.help.cooldown);
    //     }
    // }

    if (cmd.help.staff != null) {
        if (!message.member.hasPermission("ADMINISTRATOR") && !client.isOwner(message)) {
            return client.sendErrorEmbed(message.channel, `Missing: ADMINISTRATOR`);
        }
    }

    if (cmd.help.owner != null) {
        if (!client.isOwner(message)) {
            return client.sendErrorEmbed(message.channel, `Missing: OWNER`);
        }
    }

    if (message.guild) {
        try {
            cmd.run(client, message, args, guildConf, userConf);
            client.log("command", `[Guild: ${message.guild.name}] [Channel: "${message.channel.name}"] [User: "${message.author.username}#${message.author.discriminator}"]: "${message.content || JSON.stringify(message.embeds)}"`);
        } catch (e) {
            client.error(4, `Could not run command "${cmd}"\n${e}`);
            await client.sendErrorEmbed(message.channel, "An unknown error has occurred.\nReport this to: FlaringPhoenix#0001");
            return;
        }
    } else {
        try {
            cmd.run(client, message, args);
            client.log("command", `[DMS] [User: "${message.author.username}#${message.author.discriminator}"]: "${message.content || JSON.stringify(message.embeds)}"`);
            return;
        } catch (e) {
            client.error(4, `Could not run command "${cmd}"\n${e}`);
            await client.sendErrorEmbed(message.author, "An unknown error has occurred.\nReport this to: FlaringPhoenix#0001");
            return;
        }
    }

    return;

};