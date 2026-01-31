import { Logger } from "../services/logger.js";
import { AuditLogEvent } from "discord.js";

export default {
  name: "voiceStateUpdate",
  async execute(oldState, newState) {
    const member = newState.member || oldState.member;
    if (!member) return;
    const userTag = member.user.tag;
    const client = newState.client;
    if (!oldState.channelId && newState.channelId) {
      const text = `🔊 **Belépett a hangcsatornába**\n**Ki:** ${userTag}\n**Hova:** ${newState.channel.name}`;
      return Logger.log(client, "VOICE", text, "SUCCESS");
    }
    if (oldState.channelId && !newState.channelId) {
      const text = `🔇 **Kilépett a hangcsatornából**\n**Ki:** ${userTag}\n**Honnan:** ${oldState.channel.name}`;
      return Logger.log(client, "VOICE", text, "ERROR");
    }
    if (
      oldState.channelId &&
      newState.channelId &&
      oldState.channelId !== newState.channelId
    ) {
      const text = `👣 **Átlépett másik szobába**\n**Ki:** ${userTag}\n**Honnan:** ${oldState.channel.name}\n**Hova:** ${newState.channel.name}`;
      return Logger.log(client, "VOICE", text, "INFO");
    }
    if (!oldState.streaming && newState.streaming) {
      const text = `🖥️ **Képernyőmegosztást indított**\n**Ki:** ${userTag}\n**Szoba:** ${newState.channel.name}`;
      return Logger.log(client, "VOICE", text, "INFO");
    } else if (oldState.streaming && !newState.streaming) {
      const text = `🖥️ **Képernyőmegosztást befejezte**\n**Ki:** ${userTag}`;
      return Logger.log(client, "VOICE", text, "INFO");
    }
    if (!oldState.selfVideo && newState.selfVideo) {
      const text = `📷 **Kamerát bekapcsolta**\n**Ki:** ${userTag}\n**Szoba:** ${newState.channel.name}`;
      return Logger.log(client, "VOICE", text, "INFO");
    } else if (oldState.selfVideo && !newState.selfVideo) {
      const text = `📷 **Kamerát kikapcsolta**\n**Ki:** ${userTag}`;
      return Logger.log(client, "VOICE", text, "INFO");
    }
    if (!oldState.serverMute && newState.serverMute) {
      setTimeout(async () => {
        const fetchedLogs = await newState.guild.fetchAuditLogs({
          limit: 3,
          type: AuditLogEvent.MemberUpdate,
        });
        const auditEntry = fetchedLogs.entries.find(
          (entry) => entry.target.id === member.id,
        );
        let executor = "Ismeretlen (Discord API késés)";
        if (auditEntry && auditEntry.createdTimestamp > Date.now() - 10000) {
          executor = auditEntry.executor.tag;
        }
        const text = `🔇 **Szerver Némítás (Mute)**\n**Kit:** ${userTag}\n**Ki:** ${executor}\n**Hol:** ${newState.channel.name}`;
        await Logger.log(client, "ADMIN", text, "WARN");
      }, 3000);
    } else if (oldState.serverMute && !newState.serverMute) {
      const text = `🔊 **Némítás feloldva (Unmute)**\n**Kit:** ${userTag}`;
      await Logger.log(client, "ADMIN", text, "SUCCESS");
    }
    if (!oldState.serverDeafen && newState.serverDeafen) {
      setTimeout(async () => {
        const fetchedLogs = await newState.guild.fetchAuditLogs({
          limit: 3,
          type: AuditLogEvent.MemberUpdate,
        });
        const auditEntry = fetchedLogs.entries.find(
          (entry) => entry.target.id === member.id,
        );
        let executor = "Ismeretlen (Discord API késés)";
        if (auditEntry && auditEntry.createdTimestamp > Date.now() - 10000) {
          executor = auditEntry.executor.tag;
        }
        const text = `🙉 **Szerver Süketítés (Deafen)**\n**Kit:** ${userTag}\n**Ki:** ${executor}\n**Hol:** ${newState.channel.name}`;
        await Logger.log(client, "ADMIN", text, "WARN");
      }, 3000);
    } else if (oldState.serverDeafen && !newState.serverDeafen) {
      const text = `👂 **Süketítés feloldva (Undeafen)**\n**Kit:** ${userTag}`;
      await Logger.log(client, "ADMIN", text, "SUCCESS");
    }
  },
};
