const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ChannelType,
    PermissionsBitField,
  } = require("discord.js");
const  embedConfig = require("../../settings/embedConfig.json");

  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("hr-panel-send")
      .setDescription("Create a Kratos Support Panel and send it to a channel")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The channel that you want to send the Support panel to")
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildText)
      ),
  
    async execute(interaction) {
      const channel = interaction.options.getChannel("channel");
  
      await interaction.reply({
        content: `Kratos Support | Currently Checking your permissions!`,
        ephemeral: true,
      });
  
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      ) {
        return await interaction.editReply({
          content: `Kratos Support | You are not allowed to use this.`,
          ephemeral: true,
        });
      }
  
      await interaction.editReply({
        content: `Kratos | Im sending the Support panel!`,
        ephemeral: true,
      });
  
      const supportPanelEmbed = new EmbedBuilder()
        .setColor(embedConfig.allEmbedColor)
        .setTitle(`Kratos Studio | Support Panel`)
        .setDescription(
          `To create a Support ticket, Click the Button Below!`
        )
        .setTimestamp()
        .setFooter({text: `Kratos Support | Developed by: Founder|Mike`});
  
      const supportButton = new ButtonBuilder()
        .setCustomId("create-ticket")
        .setLabel("🖮 Create a Support Ticket 🖮")
        .setStyle(ButtonStyle.Success);
  
      const supportRow = new ActionRowBuilder().addComponents(supportButton);
  
      await channel.send({ embeds: [supportPanelEmbed], components: [supportRow] });
      await interaction.editReply({
        content: `Kratos | Successfull! The Support panel is in ${channel}`,
        ephemeral: true,
      });
    },
  };
  