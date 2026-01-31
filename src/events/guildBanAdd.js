import { Logger } from "../services/logger.js";
import { AuditLogEvent } from "discord.js";

export default {
  name: "guildBanAdd",
  async execute(ban) {
    const client = ban.client;
    setTimeout(async () => {
      const fetchedLogs = await ban.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanAdd,
      });
      const auditEntry = fetchedLogs.entries.first();

      let executor = "Ismeretlen";
      let reason = "Nincs megadva";

      if (auditEntry && auditEntry.target.id === ban.user.id) {
        executor = auditEntry.executor.tag;
        if (auditEntry.reason) reason = auditEntry.reason;
      }

      const text = `🚫 **BANNOLVA!**\n**Kit:** ${ban.user.tag}\n**Ki:** ${executor}\n**Indok:** ${reason}`;
      await Logger.log(client, "ADMIN", text, "ERROR");
    }, 1000);
  },
};
