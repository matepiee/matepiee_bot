import { Logger } from "../services/logger.js";

export default {
  name: "inviteCreate",
  async execute(invite) {
    const inviter = invite.inviter ? invite.inviter.tag : "Ismeretlen";
    const channelName = invite.channel
      ? invite.channel.name
      : "Ismeretlen szoba";
    const logText = `📩 **Új meghívó készült!**\n**Készítette:** ${inviter}\n**Szoba:** ${channelName}\n**Kód:** \`${invite.code}\`\n**Lejárat:** ${invite.expiresAt ? invite.expiresAt.toLocaleString() : "Soha"}`;
    await Logger.log(invite.client, "INVITE", logText, "INFO");
  },
};
