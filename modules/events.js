const fs = require("fs");

module.exports = (client) => {

    client.loadEvents = () => {
        try {
            fs.readdir(`${process.cwd()}/events/`, (err, files) => {
                if (err) throw err
                for (const file of files) {
                    if (!file.endsWith(".js")) continue;
                    let event = require(`${process.cwd()}/events/${file}`);
                    let eventName = file.split(".")[0];
                    client.on(eventName, event.bind(null, client));
                    delete require.cache[require.resolve(`${process.cwd()}/events/${file}`)];
                }
            });
        } catch (e) {
            return client.error(5, `Could not load discord events\n${e}`);
        } finally {
            client.log("BOT", `Loaded discord events`);
        }

    }

}
