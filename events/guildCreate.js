module.exports = async (client, guild) => {
    client.log("JOINS", `Guild Name: "${guild.name}" (ID: ${guild.id}). (Members: ${guild.memberCount}`);
    client.check(guild.id);
};
