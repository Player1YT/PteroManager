const Discord = require("discord.js");
const request = require("request");

exports.run = async (client, message, args, guildConf, userConf) => {

    let panel = guildConf.panelURL;
    let key = guildConf.panelAPIKey;

    if (!panel) return client.sendErrorEmbed(message.channel, "No panel has been setup!");
    if (!key) return client.sendErrorEmbed(message.channel, "No panel api key has been setup!");

    if (!userConf.panelID) return client.sendErrorEmbed(message.channel, "You must sign up first");

    let validOptions = ["view", "buy", "info", "create", "delete"];
    let option = args[0];
    if (!option) return client.sendEmbed(message.channel, "Missing argument", "\`\`\`view, buy, info, create, delete\`\`\`")
    if (!validOptions.includes(option.toLowerCase())) return client.sendEmbed(message.channel, "Invalid argument", "\`\`\`view, buy, info, create, delete\`\`\`")

    switch (option) {
        case "view": {
            client.sendEmbed(message.channel, "💰 Store",guildConf.packages.length === 0 ? `There are no packages available at the moment.\n\`Please check again later\`` : ((guildConf.packages.map((p, index) => `**${index+1}**. ${p.title} - Price: $${p.price}`).join('\n')) + `\n\n\`${guildConf.prefix}store buy [number]\` to purchase a server`));
            break;
        }
        case "info": {
            let productIndex = args[1];
            if (!productIndex || isNaN(productIndex)) return client.sendErrorEmbed(message.channel, "You must provide a product ID");
            productIndex--;

            let products = guildConf.packages;

            let product = products[productIndex];
            if (!product) return client.sendErrorEmbed(message.channel, "Invalid product id");

            client.sendEmbed(message.channel, product.title, `**Description**: ${product.description}\n**Price**: ${product.price === 0 ? "FREE" : `$${product.price}` } ${product.duration === 0 ? "" : `every ${product.duration} days`}\n**Limit**: ${product.limit === 0 ? "Unlimited" : product.limit}\n**EggID**: ${product.eggID}\n**Specs**: \n- Ram: ${product.ram} MB\n- Disk: ${product.disk} MB\n- CPU: ${product.cpu}%\n\nRun: \`${guildConf.prefix}store buy ${args[1]}\` to purchase`);
            break;

        }
        case "create": {
            if (!client.checkPerms(message)) return client.sendErrorEmbed(message.channel, `Missing: ADMINISTRATOR`);
            const filter = m => m.author.id === message.author.id;

            let data = { title: null, description: null, price: 0,  duration: 0, limit: 0, eggID: 0, nestID: 0, ram: 0, disk: 0, cpu: 0 };

            // Ask for product title
            let question = client.sendEmbed(message.channel, "Product Creation", "What should the product title be?");
            message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                .then(collected => {
                    let msg = collected.first();
                    let content = msg.content;
                    if (content.length > 50) return client.sendErrorEmbed(message.channel, "Title is over 50 characters");
                    data.title = content;

                    // Ask for product description
                    question = client.sendEmbed(message.channel, "Product Creation", "What should the product description be?");
                    message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                        .then(collected => {
                            let msg = collected.first();
                            let content = msg.content;
                            if (content.length > 300) return client.sendErrorEmbed(message.channel, "Description is over 300 characters");
                            data.description = content;

                            // Ask for product price
                            question = client.sendEmbed(message.channel, "Product Creation", "What should the product price be?\n\`\"0\" if you want it to be free\`")
                            message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                                .then(collected => {
                                    let msg = collected.first();
                                    let content = Number(msg.content);
                                    if (isNaN(content)) return client.sendErrorEmbed(message.channel, "You must provide a number");
                                    if (content < 0) return client.sendErrorEmbed(message.channel, "The price cannot be a negative number");;
                                    data.price = content;

                                    // Ask for product billing duration
                                    question = client.sendEmbed(message.channel, "Product Creation", "How often should customers be charged for this? (days)\n\`\"0\" if you want it to be free\`")
                                    message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                                        .then(collected => {
                                            let msg = collected.first();
                                            let content = Number(msg.content);
                                            if (isNaN(content)) return client.sendErrorEmbed(message.channel, "You must provide a number");
                                            if (content < 0) return client.sendErrorEmbed(message.channel, "The duration cannot be a negative number");;
                                            data.duration = content;

                                            // Ask for product nest id
                                            question = client.sendEmbed(message.channel, "Product Creation", "What nest would you like this service to use from the panel? (Nest ID)")
                                            message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                                                .then(collected => {
                                                    let msg = collected.first();
                                                    let content = Number(msg.content);
                                                    if (isNaN(content)) return client.sendErrorEmbed(message.channel, "You must provide a number");
                                                    if (content < 0) return client.sendErrorEmbed(message.channel, "The nest id cannot be a negative number");

                                                    request.get(`${panel}/api/application/nests/${content}`, {
                                                        auth: {
                                                            bearer: key
                                                        }
                                                    }, async function(err, response, body) {

                                                        if (err) return client.sendErrorEmbed(message.channel, "Could not connect to panel");
                                                        if (response.statusCode === 403) return client.sendErrorEmbed(message.channel, "Invalid admin api key!");

                                                        try {
                                                            body = JSON.parse(body);
                                                        } catch (e) {
                                                            return client.sendErrorEmbed(message.channel, "An error has occured!");
                                                        }
                                                        body = body.data;
                                                        data.nestID = content;

                                                        client.log("PTERODACTYL", `${guildConf.panelURL} -> fetched nest (${content})'s eggs`);

                                                        // Ask for product egg id
                                                        question = client.sendEmbed(message.channel, "Product Creation", "What egg would you like this service to use from the panel? (Egg ID)")
                                                        message.channel.awaitMessages(filter, {
                                                            max: 1,
                                                            time: 60000,
                                                            errors: ['time']
                                                        })
                                                            .then(collected => {
                                                                let msg = collected.first();
                                                                let content = Number(msg.content);
                                                                if (isNaN(content)) return client.sendErrorEmbed(message.channel, "You must provide a number");
                                                                if (content < 0) return client.sendErrorEmbed(message.channel, "The egg id cannot be a negative number");

                                                                request.get(`${panel}/api/application/nests?include=eggs`, {
                                                                    auth: {
                                                                        bearer: key
                                                                    }
                                                                }, async function (err, response, body) {

                                                                    if (err) return client.sendErrorEmbed(message.channel, "Could not connect to panel");
                                                                    if (response.statusCode === 403) return client.sendErrorEmbed(message.channel, "Invalid admin api key!");

                                                                    try {
                                                                        body = JSON.parse(body);
                                                                    } catch (e) {
                                                                        return client.sendErrorEmbed(message.channel, "An error has occured!");
                                                                    }
                                                                    body = body.data;

                                                                    let eggs = body.map(n => n.attributes.relationships.eggs.data);
                                                                    eggs = ([].concat.apply([], eggs)).map(e => e.attributes);

                                                                    let egg = eggs.find(e => e.id === content);
                                                                    if (!egg) return client.sendErrorEmbed(message.channel, "Invalid egg ID");

                                                                    data.eggID = content;

                                                                    client.log("PTERODACTYL", `${guildConf.panelURL} -> fetched all eggs`);

                                                                    // Ask for product ram (MB)
                                                                    question = client.sendEmbed(message.channel, "Product Creation", "How much ram should this service have? (MB)")
                                                                    message.channel.awaitMessages(filter, {
                                                                        max: 1,
                                                                        time: 60000,
                                                                        errors: ['time']
                                                                    })
                                                                        .then(collected => {
                                                                            let msg = collected.first();
                                                                            let content = Number(msg.content);
                                                                            if (isNaN(content)) return client.sendErrorEmbed(message.channel, "You must provide a number");
                                                                            if (content < 0) return client.sendErrorEmbed(message.channel, "The ram amount cannot be a negative number");
                                                                            data.ram = content;

                                                                            // Ask for product disk (MB)
                                                                            question = client.sendEmbed(message.channel, "Product Creation", "How much disk storage should this service have? (MB)")
                                                                            message.channel.awaitMessages(filter, {
                                                                                max: 1,
                                                                                time: 60000,
                                                                                errors: ['time']
                                                                            })
                                                                                .then(collected => {
                                                                                    let msg = collected.first();
                                                                                    let content = Number(msg.content);
                                                                                    if (isNaN(content)) return client.sendErrorEmbed(message.channel, "You must provide a number");
                                                                                    if (content < 0) return client.sendErrorEmbed(message.channel, "The disk storage amount cannot be a negative number");
                                                                                    data.disk = content;

                                                                                    // Ask for product cpu limit (MB)
                                                                                    question = client.sendEmbed(message.channel, "Product Creation", "How much cpu should this service have?")
                                                                                    message.channel.awaitMessages(filter, {
                                                                                        max: 1,
                                                                                        time: 60000,
                                                                                        errors: ['time']
                                                                                    })
                                                                                        .then(collected => {
                                                                                            let msg = collected.first();
                                                                                            let content = Number(msg.content);
                                                                                            if (isNaN(content)) return client.sendErrorEmbed(message.channel, "You must provide a number");
                                                                                            if (content < 0) return client.sendErrorEmbed(message.channel, "The cpu amount cannot be a negative number");
                                                                                            data.cpu = content;

                                                                                            // Ask for product limit
                                                                                            question = client.sendEmbed(message.channel, "Product Creation", "How many should each customer be able to order?\n\`\"0\" if you want unlimited\`")
                                                                                            message.channel.awaitMessages(filter, {
                                                                                                max: 1,
                                                                                                time: 60000,
                                                                                                errors: ['time']
                                                                                            })
                                                                                                .then(collected => {
                                                                                                    let msg = collected.first();
                                                                                                    let content = Number(msg.content);
                                                                                                    if (isNaN(content)) return client.sendErrorEmbed(message.channel, "You must provide a number");
                                                                                                    if (content < 0) return client.sendErrorEmbed(message.channel, "The limit cannot be a negative number");
                                                                                                    data.limit = content;

                                                                                                    client.serverDB.push(`${message.guild.id}.packages`, data);
                                                                                                    return client.sendEmbed(message.channel, "Product Created!", "", [
                                                                                                        {
                                                                                                            name: "Title",
                                                                                                            value: data.title
                                                                                                        },
                                                                                                        {
                                                                                                            name: "Description",
                                                                                                            value: data.description
                                                                                                        },
                                                                                                        {
                                                                                                            name: "Price",
                                                                                                            value: `$${data.price}`
                                                                                                        },
                                                                                                        {
                                                                                                            name: "Duration (Billing)",
                                                                                                            value: `Every (${data.duration}) days`
                                                                                                        },
                                                                                                        {
                                                                                                            name: "Egg",
                                                                                                            value: `${data.eggID} (Nest: ${data.nestID})`
                                                                                                        },
                                                                                                        {
                                                                                                            name: "Limit",
                                                                                                            value: data.limit
                                                                                                        },
                                                                                                        {
                                                                                                            name: "Ram",
                                                                                                            value: data.ram + " MB"
                                                                                                        },
                                                                                                        {
                                                                                                            name: "Disk Storage",
                                                                                                            value: data.disk + " MB"
                                                                                                        },
                                                                                                        {
                                                                                                            name: "Cpu Usage",
                                                                                                            value: `${data.cpu}%`
                                                                                                        },
                                                                                                    ]);


                                                                                                })
                                                                                                .catch((e) => { console.log(e); return client.sendEmbed(message.channel, "You have not responded in time. Please start over."); });

                                                                                        })
                                                                                        .catch((e) => { console.log(e); return client.sendEmbed(message.channel, "You have not responded in time. Please start over."); });
                                                                                })
                                                                                .catch((e) => { console.log(e); return client.sendEmbed(message.channel, "You have not responded in time. Please start over."); });

                                                                        });

                                                                })
                                                            });

                                                    });

                                                })
                                                .catch((e) => { console.log(e); return client.sendEmbed(message.channel, "You have not responded in time. Please start over."); });

                                        })
                                        .catch((e) => { console.log(e); return client.sendEmbed(message.channel, "You have not responded in time. Please start over."); });

                                })
                                .catch((e) => { console.log(e); return client.sendEmbed(message.channel, "You have not responded in time. Please start over."); });

                        })
                        .catch((e) => { console.log(e); return client.sendEmbed(message.channel, "You have not responded in time. Please start over."); });

                })
                .catch((e) => { console.log(e); return client.sendEmbed(message.channel, "You have not responded in time. Please start over."); });

            return;
        }
        case "buy": {
            let productIndex = args[1];
            if (!productIndex || isNaN(productIndex)) return client.sendErrorEmbed(message.channel, "You must provide a product ID");
            productIndex--;

            let products = guildConf.packages;

            // Fetch product
            let product = products[productIndex];
            if (!product) return client.sendErrorEmbed(message.channel, "Invalid product id");

            // Check if limit has been reached
            let limit = product.limit;
            let found = 0;
            userConf.products.forEach(p => {
                if (p.title === product.title) found++;
            })
            if (found >= limit && limit != 0) return client.sendErrorEmbed(message.channel, "You have reached the limit for that product.");

            let key = guildConf.panelAPIKey;

            let params = {
                name: product.title,
                user: userConf.panelID,
                egg: product.eggID,
                nest: product.nestID,
                startup: null,
                docker_image: null,
                environment: {},
                limits: {
                    memory: product.ram,
                    swap: -1,
                    disk: product.disk,
                    io: 500,
                    cpu: product.cpu
                },
                feature_limits: {
                    databases: 1,
                    allocations: 1,
                    backups: 3,
                },
                deploy: {
                    locations: [],
                    dedicated_ip: false,
                    port_range: []
                },
            }

            request.get(`${panel}/api/application/nests/${params.nest}/eggs/${params.egg}?include=variables`, {
                auth: { bearer: key }
            }, async function(err, response, body) {

                if (err) return client.sendErrorEmbed(message.channel, "Could not connect to panel");
                if (response.statusCode === 403) return client.sendErrorEmbed(message.channel, "Invalid admin api key!");

                try {
                    body = JSON.parse(body);
                } catch (e) {
                    return client.sendErrorEmbed(message.channel, "An error has occured!");
                }

                let attributes = body.attributes;

                params.startup = attributes.startup;
                params.docker_image = attributes.docker_image;

                let relationships = attributes.relationships;

                relationships.variables.data.forEach(r => {
                    params.environment[r.attributes["env_variable"]] = r.attributes["default_value"];
                });

                client.log("PTERODACTYL", `${guildConf.panelURL} -> fetched egg (${params.egg})'s variables`);

                request.post(`${panel}/api/application/servers`, {
                    auth: {
                        bearer: key
                    },
                    json: params,
                    followRedirect: true,
                    maxRedirects: 5,
                }, async function(err, response, body) {

                    let server = response.body.attributes;

                    let identifier = server.identifier;
                    product.identifier = identifier;

                    let errors = response.body.errors;
                    if (errors && errors.length > 0) return client.sendErrorEmbed(message.channel, errors[0].detail);

                    if (err) return client.sendErrorEmbed(message.channel, "An error has occured");
                    if (response.statusCode === 403) return client.sendErrorEmbed(message.channel, "Invalid api key!");

                    await client.sendEmbed(message.channel, `Your server has been created!`, `\nName: ${server.name}\nDescription: ${server.description || "None"}\nLimits: \n- Ram: ${server.limits.memory} MB\n- Disk: ${server.limits.disk} MB\n- CPU: ${server.limits.cpu}%\nNode: ${server.node}\nAllocation: ${server.allocation}\nNest: ${server.nest}\nEgg: ${server.egg}`);

                    client.log("PTERODACTYL", `${guildConf.panelURL} -> created server! Data: "${server}"`);

                    client.serverDB.inc(`${message.guild.id}.serversCreated`);
                    client.userDB.push(`${message.author.id}-${message.guild.id}.products`, product);

                });

            });

            break;

        }
        case "delete": {
            if (!client.checkPerms(message)) return client.sendErrorEmbed(message.channel, `Missing: ADMINISTRATOR`)

            let productIndex = args[1];
            if (!productIndex || isNaN(productIndex)) return client.sendErrorEmbed(message.channel, "You must provide a product ID");
            productIndex--;

            let products = guildConf.packages;

            let product = products[productIndex];
            if (!product) return client.sendErrorEmbed(message.channel, "Invalid product id");

            let newProducts = [];
            products.forEach((p, index) => {
               if (index != productIndex) newProducts.push(p);
            });

            client.serverDB.set(`${message.guild.id}.packages`, newProducts);
            client.sendEmbed(message.channel, "Success", `Product: "${product.title}" has been deleted`);

            break;


        }
    }


}

module.exports.help = {
    name: "store",
    description: "View store",
    aliases: ["shop"]
}
