const Discord = require("discord.js");
const fs = require("fs");
const Josh = require("josh");
const provider = require('@josh-providers/mongo');
require('moment-duration-format');

// Create client
const client = new Discord.Client({
    ws: {
        intents: [
            'GUILD_MESSAGES',
            'GUILDS',
            'GUILD_MEMBERS',
            'DIRECT_MESSAGES'
        ]
    },
    disableEveryone: true,
	messageCacheMaxSize: 1,
	messageCacheLifetime: 5,
	messageSweepInterval: 30,
});

// Global variables
client.config = require('./config.js');
client.modules = [ "general", "panel", "billing", "staff", "owner" ];
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.serverDB = new Josh({
    name: 'servers',
    provider,
    providerOptions: {
        collection: 'servers',
        dbName: "PteroManager",
        url: client.config.mongo
    }
});
client.userDB = new Josh({
    name: 'users',
    provider,
    providerOptions: {
        collection: 'users',
        dbName: "PteroManager",
        url: client.config.mongo
    }
});

// Load modules
fs.readdir(`${process.cwd()}/modules/`, (err, files) => {
    if (err) { throw err }
    for (const file of files) {
        if (!file.endsWith(".js")) continue;
        require(`${process.cwd()}/modules/${file}`)(client);
    }
    client.log("BOT", "Starting...");
    client.log("BOT", "Loaded modules");
    client.loadEvents();
    client.loadCommands();
});

// Log into client
try {
    client.login(client.config.token);
} catch(e) {
    console.error(`Invalid token: ${e}`);
    process.exit(2);
}
