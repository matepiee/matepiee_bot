import { Logger } from "../services/logger.js";
import { AuditLogEvent } from "discord.js";

export default {
  name: "guildMemberUpdate",

  async execute(oldMember, newMember) {
    const client = newMember.client;
    const isTimeoutNow =
      newMember.communicationDisabledUntilTimestamp > Date.now();
    const wasTimeoutBefore =
      oldMember.communicationDisabledUntilTimestamp > Date.now();

    if (!wasTimeoutBefore && isTimeoutNow) {
      const fetchedLogs = await newMember.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberUpdate,
      });

      const auditEntry = fetchedLogs.entries.first();

      let executor = "Ismeretlen";
      let reason = "Nincs megadva";

      if (
        auditEntry &&
        auditEntry.target.id === newMember.id &&
        auditEntry.createdTimestamp > Date.now() - 5000
      ) {
        executor = auditEntry.executor.tag;
        if (auditEntry.reason) reason = auditEntry.reason;
      }
      const until = newMember.communicationDisabledUntil;
      const durationMinutes = Math.round((until - Date.now()) / 1000 / 60);
      const text = `⏳ **Timeout kiosztva!**\n**Kit:** ${newMember.user.tag}\n**Ki:** ${executor}\n**Időtartam:** ${durationMinutes} perc\n**Indok:** ${reason}\n**Lejár:** ${until.toLocaleString()}`;
      await Logger.log(client, "ADMIN", text, "WARN");
    }
    if (wasTimeoutBefore && !isTimeoutNow) {
      await Logger.log(
        client,
        "ADMIN",
        `🔓 **Timeout levéve** róla: ${newMember.user.tag}`,
        "SUCCESS",
      );
    }
  },
};
