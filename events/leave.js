const { EmbedBuilder } = require("discord.js");
const embedConfig = require("../settings/embedConfig.json");
const roleConfig = require("../settings/roleConfig.json");
const channelConfig = require("../settings/channelConfig.json");

module.exports = {
  name: "guildMemberRemove",
  async execute(member) {
    console.log(`[INFO] ${member.user.tag} has left!`);

    const guild = member.guild
    if (guild.id !== '1249568441384304701') {
      return;
    }

    const leaveEmbed = new EmbedBuilder()
      .setColor(embedConfig.allEmbedColor)
      .setAuthor({
        name: embedConfig.allEmbedAuthor,
        iconURL: embedConfig.allAuthorIcon,
      })
      .setTitle(`Member Leave`)
      .setDescription(
        `<@${member.id}> has left the Server! L Fucking Bozo`
      )
      .setFooter({
        text: embedConfig.allEmbedFooterText,
        iconURL: embedConfig.allEmbedFooterIcon,
      })
      .setTimestamp();

    const channel = member.guild.channels.cache.get(channelConfig.leaveLogs);

    channel.send({
      content: `<@&${roleConfig.administration}>`,
      embeds: [leaveEmbed],
    });
  },
};
