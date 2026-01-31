import { Logger } from "../services/logger.js";

export default {
  name: "messageDelete",
  async execute(message) {
    if (message.author?.bot) return;
    if (message.partial) {
      return;
    }
    const logText = `🗑️ **Üzenet törölve** itt: <#${message.channelId}>\n**Ki:** ${message.author.tag}\n**Mit:** "${message.content}"`;
    await Logger.log(message.client, "MODERATION", logText, "ERROR");
  },
};
