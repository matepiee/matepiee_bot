import { Events } from "discord.js";
import { Logger } from "../services/logger.js";

export default {
  name: Events.MessageReactionRemove,
  async execute(reaction, user) {
    if (user.bot) return;

    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error("Hiba az üzenet lekérésekor:", error);
        return;
      }
    }

    const targetMessageId = process.env.RR_MESSAGE_ID;
    const targetEmoji = process.env.RR_EMOJI;
    const roleId = process.env.RR_ROLE_ID;

    if (
      reaction.message.id === targetMessageId &&
      reaction.emoji.name === targetEmoji
    ) {
      try {
        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);
        const role = guild.roles.cache.get(roleId);

        if (member.roles.cache.has(roleId)) {
          await member.roles.remove(role);
          Logger.log(
            reaction.client,
            "ADMIN",
            `❌ **RANG ELVÉVE**\n**Ki:** ${user.tag}\n**Rang:** ${role.name}`,
            "WARN",
          );
        }
      } catch (error) {
        console.error("[HIBA] Nem sikerült elvenni a rangot:", error);
      }
    }
  },
};
