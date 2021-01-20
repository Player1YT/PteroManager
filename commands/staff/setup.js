const discord = require('discord.js')

module.exports.run = async (client, message, args) => {

    return;

    const filter = m => m.author.id === message.author.id;

    await client.sendEmbed(message.channel, '**Welcome to the setup!**', 'Here i\'ll help you setup the bot for your server.\n> Firstly, Please tell me if you\'re using this bot for a custom panel **[I am/I am not]**');

    const guildName = message.guild.name;

    let panel;
    let key;
    let key_for_discord;

    message.channel.awaitMessages(filter, {
        max: 1,
        error: ['time'],
        time: 30000,
    })
        .then(collected => {
            let msg = collected.first();
            if (msg.content.toLowerCase() === 'i am') {
                if (!message.member.hasPermission('MANAGE_GUILD')) {
                    return sendError('You are not allowed, or do not have permission, to use this setup command for a custom panel');
                }
                if (msg.content.toLowerCase() === 'exit') return client.sendEmbed(message.channel, 'The Setup has been cancelled');
                client.sendEmbed(message.channel, '**Step 1: Panel**', 'You have chosen to use this bot for a custom panel.\n> Now, Please tell me the url of the main panel page \n\n``Example: https://panel.bluefoxhost.com/``');

                message.channel.awaitMessages(filter, {
                    max: 1,
                    error: ['time'],
                    time: 50000,
                }).then(collectedUsage => {
                        msg = collectedUsage.first();
                        panel = msg.content;
                        if (msg.content.toLowerCase() === 'exit') return client.sendEmbed(message.channel, 'The Setup has been cancelled');

                        client.sendEmbed(message.channel, '**Step 2: API Key**', 'Here you have to provide your API Key for staff commands.\n> Now, Please tell me the API Key \n\n``Example: nCitOncfJ1WcaoxsreXuMh6ORaXZZRKPNJ9U8pjKrxjtzGtP`` - Unusable');

                        message.channel.awaitMessages(filter, {
                            max: 1,
                            error: ['time'],
                            time: 30000,
                        }).then(collectedAPIKey => {
                                msg = collectedAPIKey.first();
                                key = msg.content;
                                if (msg.content.toLowerCase() === 'exit') return client.sendEmbed(message.channel, 'The Setup has been cancelled');

                                client.sendEmbed(message.channel, `Panel settings for "${guildName}"`, `> Panel URL: ${panel}\n> API Key: ||${key}||`);
                            }).catch((e) => {
                                console.log(e);
                                return client.sendErrorEmbed(message.channel, 'Time has run out!');
                            });

                    }).catch(() => {
                        return client.sendErrorEmbed(message.channel, 'Time has run out!');
                    });

            } else if (msg.content.toLowerCase() === 'i am not') {
                panel = 'https://panel.bluefoxhost.com/';
                client.sendErrorEmbed(message.channel, '**Step 1: API Key**', 'Here you have to provide your API Key to link with your discord account.\n> Now, Please tell me the API Key \n\n``Example: viXgTF5y70Gs8jnQMhZgpdohZQuZv3ObgjAwo5cZAI8IgVfc`` - Unusable');

                message.channel.awaitMessages(filter, {
                    max: 1,
                    error: ['time'],
                    time: 50000,
                }).then(collectedAPIKey => {
                        msg = collectedAPIKey.first();
                        key_for_discord = msg.content;
                        if (msg.content.toLowerCase() === 'exit') return client.sendErrorEmbed(message.channel, 'The Setup has been cancelled');

                        client.sendEmbed(message.channel, `Panel settings for "${guildName}"`, `> Panel URL: ${panel}\n> API Key: ||${key_for_discord}||`);
                    }).catch(() => {
                        return sendErrorEmbed(message.channel, 'Time has run out!');
                    });
            } else {
                return sendErrorEmbed(message.channel, 'That\'s an invalid option!');
            }
        }).catch(() => {
            return sendErrorEmbed(message.channel, 'Time has run out!');
        });
}

module.exports.help = {
    name: "setup",
    staff: true,
    aliases: []
}
