module.exports = (client) => {
 
    client.generateHelp = () => {
        let fields = [];
        client.modules
            .filter(m => m.toLowerCase() != "owner")
            .forEach((m, i) => {
                let name = m;
                let value = "";
                client.commands.forEach((c, y) => {
                    if ((c.help.category).toLowerCase() === m.toLowerCase()) value += (c.help.name).toLowerCase() + ", ";
                });
                fields.push({ name: name, value: value.slice(0, -1) });
            });
        client.helpMenu = fields;
        return fields;
    }

    client.getHelp = () => {
        return client.helpMenu;
    }

}