import { Logger } from "../services/logger.js";

export default {
  name: "messageUpdate",
  async execute(oldMessage, newMessage) {
    if (oldMessage.author?.bot) return;
    if (oldMessage.partial) return;
    if (oldMessage.content === newMessage.content) return;
    const logText = `✏️ **Üzenet szerkesztve** itt: <#${oldMessage.channelId}>\n**Ki:** ${oldMessage.author.tag}\n**Erről:** "${oldMessage.content}"\n**Erre:** "${newMessage.content}"`;
    await Logger.log(newMessage.client, "MODERATION", logText, "WARN");
  },
};
