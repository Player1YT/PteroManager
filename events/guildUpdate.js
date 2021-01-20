module.exports = async (client, oldGuild, newGuild) => {

    let oldName = oldGuild.name;
    let newName = newGuild.name;

    if (oldName != newName) {
        client.serverDB.set(`${oldGuild.id}.guildName`, newName);
    }

};
