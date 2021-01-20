const Discord = require('discord.js');
const request = require('request');
const moment = require('moment');

exports.run = async (client, message, args, guildConf, userConf) => {

    let panel = guildConf.panelURL;
    let key = guildConf.panelAPIKey;

    if (!panel) return client.sendErrorEmbed(message.channel, "No panel has been setup!");
    if (!key) return client.sendErrorEmbed(message.channel, "The panel's application api key has not been set!");

    let option = args[0];

    switch (option) {
        case "signup": {
            if (!userConf.panelID) return client.sendErrorEmbed(message.channel, "You already have an account");

            const filter = m => m.author.id === message.author.id;

            let username;
            let email;

            await client.sendEmbed(message.channel, "Check your dms");

            let msg;

            try {
                msg = await client.sendEmbed(message.author, "Account Creation", "Please respond to the questions below in order to create an account.")
            } catch(e) {
                return client.sendErrorEmbed(message.channel, "Please turn your dms on and try again.")
            }

            // Ask for panel username
            await client.sendEmbed(message.author, "1. Username", "What would you like your username to be?");
            msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                .then(collected => {
                    let msg = collected.first();
                    let content = msg.content;
                    if (content.length > 520) return client.sendErrorEmbed(message.author, "Username is over 20 characters");
                    username = content;

                    // Ask for panel email
                    client.sendEmbed(message.author, "2. Email", "What would you like your email to be?");
                    msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                        .then(collected => {
                            let msg = collected.first();
                            let content = msg.content;
                            email = content;

                            let EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                            if (!EMAIL_REGEX.test(email)) return client.sendErrorEmbed(message.author, "Please provide a valid email. Please start over.")

                            let password = client.generatePassword(10);
                            const data = {
                                username: username,
                                email: email,
                                first_name: username,
                                last_name: username,
                                password: password,
                                root_admin: false,
                                language: "en"
                            }

                            request.post(`${panel}/api/application/users`, {
                                auth: {
                                    bearer: key
                                },
                                json: data
                            }, async function(err, response, body) {

                                let errors = response.body.errors;
                                if (errors && errors.length > 0) return client.sendErrorEmbed(message.author, errors[0].detail);

                                if (err) return client.sendErrorEmbed(message.author, "An error has occured");
                                if (response.statusCode === 403) return client.sendErrorEmbed(message.author, "Invalid api key!");

                                client.userDB.set(`${message.author.id}-${message.guild.id}.panelData`, response.body.attributes);

                                await client.sendEmbed(message.author, `Account Details`, `**Username**: ${username}\n**Email**: ${email}\n**Password**: ${password}`);

                                client.log("PTERODACTYL", `${guildConf.panelURL} -> created user: ${email}`);

                            });

                        })
                        .catch(() => client.sendErrorEmbed(message.author, "You have not responded in time. Please start over."));

                })
                .catch(() => client.sendErrorEmbed(message.author, "You have not responded in time. Please start over."));

            return;

        }
        case "api": {

            await client.sendEmbed(message.channel, "Check your dms");

            let msg;

            try {
                msg = await client.sendEmbed(message.author, "Account API", "Please send your api key from the panel below");
            } catch(e) {
                return client.sendErrorEmbed(message.channel, "Please turn your dms on and try again.");
            }

            const filter = m => m.author.id === message.author.id;
            msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                .then(collected => {
                    let msg = collected.first();
                    let content = msg.content;

                    request.get(`${panel}/api/client`, {
                        auth: {
                            bearer: content
                        }
                    }, async function(err, response, body) {

                        if (err) return client.sendErrorEmbed(message.author, "An error has occured!");
                        if (response.statusCode === 403) return client.sendErrorEmbed(message.author, "Invalid api key!");

                        client.userDB.set(`${message.author.id}-${message.guild.id}.panelAPIKey`, content);
                        client.log("PTERODACTYL", `${guildConf.panelURL} -> checked user's api key`);
                        return client.sendEmbed(message.author, "Your api key has been saved!");

                    });

                })
                .catch(() => client.sendErrorEmbed(message.author, "You have not responded in time. Please start over."));

            return;
        }
        case "info": {

            if (!userConf.panelID) return client.sendErrorEmbed(message.channel, `You must signup\n${guildConf.prefix}account signup`);

            let userID = userConf.panelID;

            request.get(`${panel}/api/application/users/${userID}`, {
                auth: {
                    bearer: key
                }
            }, async function(err, response, body) {

                let errors = response.body.errors;
                if (errors && errors.length > 0) return client.sendErrorEmbed(message.channel, errors[0].detail);

                if (err) return client.sendErrorEmbed(message.channel, "An error has occured");
                if (response.statusCode === 403) return client.sendErrorEmbed(message.channel, "Invalid api key!");

                await client.sendEmbed(message.channel, "Check your dms");

                body = JSON.parse(body);
                let user = body.attributes;

                try {
                    await client.sendEmbed(message.author, "Panel User", `
**First Name**: ${user.first_name}
**Last Name**: ${user.last_name}
**Language**: ${user.language}
**Admin**: ${user.root_admin ? "✅" : "❌"}

**ID**: ${user.id}
**ExternalID**: ${user.external_id ? user.external_id : "❌"}
**2FA**: ${user["2fa"] ? "✅" : "❌"}

**Created**: ${moment(new Date()).diff(user.created_at, 'days') + ' days ago'}
**Last Updated**: ${moment(new Date()).diff(user.updated_at, 'days') + ' days ago'}

`)
                } catch(e) {
                    await client.sendErrorEmbed(message.channel, "Please turn your dms on and try again.")
                }

            });

            return;
        }
        case "resetpassword": {

            return client.sendErrorEmbed(message.channel, "Being redone!");

            if (!userConf.panelID) return client.sendErrorEmbed(message.channel, `You must signup\n${guildConf.prefix}account signup`);

            let password = client.generatePassword(10);
            let user = userConf.panel.data;

            let data = {
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                password: password
            }

            request.patch(`${panel}/api/application/users/${user.id}`, {
                auth: {
                    bearer: key
                },
                json: data
            }, async function(err, response, body) {

                let errors = response.body.errors;
                if (errors && errors.length > 0) return client.sendErrorEmbed(message.channel, errors[0].detail);

                if (err) return client.sendErrorEmbed(message.channel, "An error has occured");
                if (response.statusCode === 403) return client.sendErrorEmbed(message.channel, "Invalid api key!");

                client.userDB.set(`${message.author.id}-${message.guild.id}.panelData`, response.body.attributes);

                await client.sendEmbed(message.channel, `Your password has been reset!`, "Check your dms");
                await client.sendEmbed(message.author, `Account New Password`, password);

            });

            return;
        }

    }

    await client.sendEmbed(message.channel, "Invalid argument", "\`\`\`signup, api, info, resetpassword\`\`\`");
    return;
    
}

module.exports.help = {
    name: "account",
    description: "Manage your account on the panel",
    dm: false,
    aliases: ["acc"]
}
