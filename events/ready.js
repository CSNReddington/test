const {
  Events,
  Client,
  GatewayIntentBits,
  ActivityType,
} = require("discord.js");

// Add the additional required imports
const { REST, Routes } = require("discord.js");
const {
  clientId,
  guildId,
  token,
  mongoURL,
} = require("../settings/config.json");
const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    // Set bot presence
    client.user.setPresence({
      activities: [{ name: `For Support Needs`, type: ActivityType.Watching }],
      status: "online",
    });


    // Additional code to refresh bot commands
    const commands = [];
    const foldersPath = path.join(__dirname, "../commands");
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
      const commandsPath = path.join(foldersPath, folder);
      const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);

        try {
          const command = require(filePath);

          if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
          } else {
            console.log(
              `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
          }
        } catch (error) {
          console.log(
            `[ERROR] There was an issue loading the command at ${filePath}: ${error.message}`
          );
        }
      }
    }

    const rest = new REST({ version: "9" }).setToken(token);

    try {
      console.log(
        `Started refreshing ${commands.length} application (/) commands.`
      );

      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );

      console.log(
        `Successfully reloaded ${data.length} application (/) commands.`
      );
    } catch (error) {
      console.error(error);
    }
  },
};

console.log(`Reddington is My Creator`);
