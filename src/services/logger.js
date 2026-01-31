import { EmbedBuilder } from "discord.js";
const COLORS = {
  SYSTEM: "#2B2D31",
  YOUTUBE: "#FF0000",
  TWITCH: "#9146FF",
  TIKTOK: "#EE1D52",
  COMMAND: "#5865F2",
  MODERATION: "#FEE75C",

  VOICE: "#1ABC9C",
  ADMIN: "#E67E22",
  INVITE: "#E91E63",

  SUCCESS: "#57F287",
  WARNING: "#FEE75C",
  ERROR: "#ED4245",
};

const getTime = () => {
  const now = new Date();
  return `${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getDate().toString().padStart(2, "0")} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
};

export const Logger = {
  log: async (client, service, message, type = "INFO") => {
    const timestamp = getTime();
    const logChannelId = process.env.DISCORD_LOG_CHANNEL_ID;

    let consolePrefix = `[${timestamp}] [${service}]`;
    if (type === "ERROR") console.error(`${consolePrefix} ❌ ${message}`);
    else if (type === "WARN") console.warn(`${consolePrefix} ⚠️ ${message}`);
    else if (type === "SUCCESS") console.log(`${consolePrefix} ✅ ${message}`);
    else console.log(`${consolePrefix} ℹ️ ${message}`);

    if (client && logChannelId) {
      try {
        const channel = await client.channels.fetch(logChannelId);
        if (channel) {
          let color = COLORS[service.toUpperCase()] || COLORS.SYSTEM;
          if (type === "ERROR") color = COLORS.ERROR;
          if (type === "SUCCESS") color = COLORS.SUCCESS;
          if (service === "COMMAND") color = COLORS.COMMAND;

          const embed = new EmbedBuilder()
            .setColor(color)
            .setAuthor({
              name: `${service} Log`,
              iconURL: client.user.displayAvatarURL(),
            })
            .setDescription(`**[${timestamp}]** ${message}`)
            .setFooter({ text: `Típus: ${type}` });

          await channel.send({ embeds: [embed] });
        }
      } catch (err) {
        console.error(
          `[${timestamp}] [SYSTEM] Nem sikerült a Discord logolás: ${err.message}`,
        );
      }
    }
  },
};
