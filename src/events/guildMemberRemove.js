import { Events, AuditLogEvent } from "discord.js";
import { Logger } from "../services/logger.js";

export default {
  name: Events.GuildMemberRemove,
  async execute(member) {
    const client = member.client;
    const fetchedLogs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberKick,
    });
    const auditEntry = fetchedLogs.entries.first();
    let isKick = false;
    let executor = null;
    let reason = null;
    if (
      auditEntry &&
      auditEntry.target.id === member.id &&
      auditEntry.createdTimestamp > Date.now() - 5000
    ) {
      isKick = true;
      executor = auditEntry.executor.tag;
      reason = auditEntry.reason || "Nincs megadva";
    }

    const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
    if (welcomeChannelId) {
      const channel = member.guild.channels.cache.get(welcomeChannelId);
      if (channel) {
        try {
          if (isKick) {
            await channel.send(
              `👢 **${member.user.tag}** ki lett rúgva a szerverről.`,
            );
          } else {
            await channel.send(
              `📤 **${member.user.tag}** kilépett a szerverről. Viszlát! 👋`,
            );
          }
        } catch (err) {
          console.error(
            "[LEAVE HIBA] Nem tudtam írni a welcome csatornába:",
            err,
          );
        }
      }
    }
    if (isKick) {
      const logText = `👢 **KICK (Kirúgás)!**\n**Kit:** ${member.user.tag}\n**Ki:** ${executor}\n**Indok:** ${reason}`;
      Logger.log(client, "ADMIN", logText, "ERROR");
    } else {
      const logText = `📤 **KILÉPÉS**\n**Ki:** ${member.user.tag}\nMagától távozott a szerverről.`;
      Logger.log(client, "ADMIN", logText, "INFO");
    }
  },
};
