module.exports = (client, guild) => {
    client.log("LEAVES", `Guild Name: "${guild.name}" (ID: ${guild.id}). (Members: ${guild.memberCount})`);
    //client.serverDB.delete(guild.id);
};
