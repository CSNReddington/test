const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");
const embedConfig = require("../settings/embedConfig.json");
const discordTranscripts = require("discord-html-transcripts");
const { supportCategory } = require("../settings/channelConfig.json");
const channelConfig = require("../settings/channelConfig.json");
const roleConfig = require("../settings/roleConfig.json");

const fs = require("fs");
const path = require("path");

module.exports = {
  name: "interactionCreate",

  /**
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    const filePath = path.join(
      __dirname,
      "../",
      "settings",
      "ticketNumbers.json"
    );
    const ticketData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (interaction.customId === "create-ticket") {
      const ticketNumber = String(ticketData.ticketCount).padStart(3, "0");

      const createdChannel = await interaction.guild.channels.create({
        name: `ticket-${ticketNumber} - ${interaction.user.username}`,
        topic: `${interaction.user.id}`,
        type: ChannelType.GuildText,
        parent: supportCategory,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: interaction.guild.roles.cache.get(roleConfig.supportRole),
            allow: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });

      await interaction.reply({
        content: `Successfully created the ticket! ${createdChannel}`,
        ephemeral: true,
      });

      const supportRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setLabel("✖️Close HR Ticket✖️")
          .setCustomId("ticket-close"),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setLabel("🔒Lock to Administration🔒")
          .setCustomId("ticket-admin")
      );

      ticketData.ticketCount++;
      fs.writeFileSync(filePath, JSON.stringify(ticketData, null, 4));

      console.log(`Created ${createdChannel.name}`);
      const message = `<@${interaction.user.id}>, a <@&${roleConfig.supportRole}> Representative will be with you shortly.`;

      const supportEmbed = new EmbedBuilder()
        .setColor(embedConfig.allEmbedColor)
        .setTitle(`Hello Friend!`)
        .setDescription(
          `Please ask what you need support with below!\n> Been waiting more than **24 hours**?\n> Feel Free to ping <@&${roleConfig.supportRole}>`
        )
        .setFooter({
          text: embedConfig.allEmbedFooterText,
          iconURL: embedConfig.allEmbedFooterIcon,
        })
        .setTimestamp();

      await createdChannel.send({
        content: message,
        embeds: [supportEmbed],
        components: [supportRow],
      });
    } else if (interaction.customId === "ticket-admin") {
      const channel = interaction.channel;
      const foundersRole = interaction.guild.roles.cache.get(
        roleConfig.administration
      );
      if (!foundersRole) {
        return interaction.reply({
          content: `Admin role not found.`,
          ephemeral: true,
        });
      }

      await channel.permissionOverwrites.set([
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: foundersRole.id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
      ]);

      await interaction.reply({
        content: `This ticket is now locked to Administration.`,
        ephemeral: true,
      });

    } else if (interaction.customId === "ticket-close") {
      const channel = interaction.channel;
      const kratosSupportRole = interaction.guild.roles.cache.get(
        roleConfig.supportRole
      );
      if (!kratosSupportRole) {
        return interaction.reply({
          content: `Support role not found.`,
          ephemeral: true,
        });
      }

      await channel.permissionOverwrites.set([
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: kratosSupportRole.id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
      ]);

      const transcript = await discordTranscripts.createTranscript(channel);
      const logChannel = interaction.guild.channels.cache.get(
        channelConfig.ticketTranscript
      );

      if (logChannel) {
        await logChannel.send({
          content: `Transcript for ticket ${channel.name}`,
          files: [transcript],
        });
      }

      await interaction.reply({
        content: `This ticket has been closed.`,
        ephemeral: true,
      });

      setTimeout(async () => {
        await channel.delete();
      }, 5000);
    }
  },
};