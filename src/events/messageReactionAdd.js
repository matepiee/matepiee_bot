import { Events } from "discord.js";
import { Logger } from "../services/logger.js";

export default {
  name: Events.MessageReactionAdd,
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

        if (!role) {
          console.error("[HIBA] Nem találom a rangot az ID alapján!");
          return;
        }
        await member.roles.add(role);
        Logger.log(
          reaction.client,
          "ADMIN",
          `✅ **RANG ADVA**\n**Ki:** ${user.tag}\n**Rang:** ${role.name}`,
          "SUCCESS",
        );
      } catch (error) {
        console.error("[HIBA] Nem sikerült ráadni a rangot:", error);
      }
    }
  },
};
