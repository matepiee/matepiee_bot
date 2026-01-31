import { Events, EmbedBuilder, AttachmentBuilder } from "discord.js";
import { Logger } from "../services/logger.js";

export default {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const client = member.client;
    const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;

    if (welcomeChannelId) {
      const channel = member.guild.channels.cache.get(welcomeChannelId);
      if (channel) {
        const file = new AttachmentBuilder("./welcome.jpg");

        const welcomeEmbed = new EmbedBuilder()
          .setColor("#8b437f")
          .setTitle(`👋 Üdvözlünk a szerveren, ${member.user.username}!`)
          .setDescription(
            `Örülünk, hogy itt vagy! Kérlek olvasd el a szabályzatot.\n\nTe vagy a(z) **${member.guild.memberCount}.** tagunk! 🥳`,
          )
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .setImage("attachment://welcome.jpg")
          .setFooter({
            text: `Csatlakozott: ${new Date().toLocaleDateString("hu-HU")}`,
          });

        try {
          await channel.send({
            content: `Szia ${member}!`,
            embeds: [welcomeEmbed],
            files: [file],
          });
        } catch (error) {
          console.error(`[WELCOME HIBA] Nem tudtam képet küldeni: ${error}`);
        }
      } else {
        console.log(
          "[WELCOME] Nincs beállítva vagy nem létezik a welcome csatorna.",
        );
      }
    }
    const logText = `📥 **BELÉPÉS**\n**Ki:** ${member.user.tag}\n**ID:** ${member.id}\n**Tagok száma:** ${member.guild.memberCount}`;
    Logger.log(client, "ADMIN", logText, "INFO");
  },
};
