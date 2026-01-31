import { ActivityType } from "discord.js";
import { checkYoutube } from "../services/youtubeNotifier.js";
import { checkTiktok } from "../services/tiktokNotifier.js";
import { checkTwitch } from "../services/twitchNotifier.js";
import { Logger } from "../services/logger.js";

const getTime = () => {
  const now = new Date();
  return `${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getDate().toString().padStart(2, "0")} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
};

export default {
  name: "clientReady",
  once: true,
  async execute(client) {
    await Logger.log(
      client,
      "SYSTEM",
      `${client.user.tag} bot sikeresen elindult! 🚀`,
      "SUCCESS",
    );
    const statuses = [
      "Hivatalos matepiee.eu bot 🤖",
      "matepiee.eu website 🌐",
      "Értesítés mindenről 🔔",
      "Egyéb funkciók 🎮",
    ];
    const channelId = process.env.RR_CHANNEL_ID;
    const messageId = process.env.RR_MESSAGE_ID;
    const emoji = process.env.RR_EMOJI;
    if (channelId && messageId && emoji) {
      try {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
          const message = await channel.messages.fetch(messageId);
          if (message) {
            const botReaction = message.reactions.cache.find(
              (r) => r.emoji.name === emoji && r.me,
            );
            if (!botReaction) {
              await message.react(emoji);
              console.log(
                "[REACTION ROLE] A bot sikeresen rátette a kezdő reakciót az üzenetre.",
              );
            }
          }
        }
      } catch (error) {
        console.error(
          "[REACTION ROLE HIBA] Nem sikerült elérni az üzenetet (Ellenőrizd az ID-ket a .env-ben!):",
          error.message,
        );
      }
    }
    let i = 0;
    setInterval(() => {
      client.user.setPresence({
        activities: [
          {
            name: statuses[i],
            type: ActivityType.Streaming,
            url: "https://www.twitch.tv/matepiee",
          },
        ],
        status: "online",
      });
      i = (i + 1) % statuses.length;
    }, 5000);
    checkYoutube(client);
    setInterval(() => checkYoutube(client), 600000);
    checkTiktok(client);
    setInterval(() => checkTiktok(client), 3600000);
    checkTwitch(client);
    setInterval(() => checkTwitch(client), 60000);
  },
};
