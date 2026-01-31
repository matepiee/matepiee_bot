import Parser from "rss-parser";
import { EmbedBuilder } from "discord.js";
import fs from "fs";
import { Logger } from "./logger.js";

const parser = new Parser();
const DATABASE_FILE = "./lastVideo.json";

export const checkYoutube = async (
  client,
  force = false,
  targetChannelId = null,
) => {
  const channelConfigs = {
    [process.env.YOUTUBE_CHANNEL_ID]: "matepiee",
    [process.env.YOUTUBE_CHANNEL_ID_2]: "matepieeVOD",
  };
  const channelsToCheck = targetChannelId
    ? [targetChannelId]
    : Object.keys(channelConfigs).filter((id) => id);
  const NOTIFIER_CHANNEL_ID =
    process.env.DISCORD_NOTIFIER_CHANNEL_ID || process.env.NOTIFIER_CHANNEL_ID;

  if (!NOTIFIER_CHANNEL_ID) {
    Logger.log(
      client,
      "YOUTUBE",
      "HIBA: Nincs beállítva a csatorna ID a .env fájlban!",
      "ERROR",
    );
    return;
  }

  for (const CHANNEL_ID of channelsToCheck) {
    const channelName = channelConfigs[CHANNEL_ID];
    const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
    try {
      const feed = await parser.parseURL(RSS_URL);
      if (!feed.items || !feed.items.length) continue;

      const discordChannel = await client.channels.fetch(NOTIFIER_CHANNEL_ID);
      if (!discordChannel) continue;

      const itemsToProcess = force
        ? [...feed.items].reverse()
        : [feed.items[0]];

      for (const item of itemsToProcess) {
        const videoId = item.id.split(":")[2];
        const videoUrl = item.link;
        const title = item.title;
        let lastData = {};

        if (fs.existsSync(DATABASE_FILE)) {
          lastData = JSON.parse(fs.readFileSync(DATABASE_FILE));
        }

        if (lastData[CHANNEL_ID] === videoId && !force) continue;

        if (!force) {
          lastData[CHANNEL_ID] = videoId;
          fs.writeFileSync(DATABASE_FILE, JSON.stringify(lastData));
          Logger.log(
            client,
            "YOUTUBE",
            `Új tartalom mentve: ${title} (${channelName})`,
            "SUCCESS",
          );
        }

        let typeText = "Videó 📽️";
        let color = "#FF0000";
        let mentionText = `Új videó a **${channelName}** csatornán!`;

        if (videoUrl.includes("/shorts/")) {
          typeText = "Shorts 📱";
          mentionText = `Új Shorts a **${channelName}** csatornán!`;
        } else if (
          title.toLowerCase().includes("live") ||
          title.toLowerCase().includes("élő")
        ) {
          typeText = "Élőadás 🔴";
          mentionText = `Most indul az élő adás a **${channelName}** csatornán!`;
        } else if (title.toLowerCase().includes("premier")) {
          typeText = "Premier 🎭";
          mentionText = `Hamarosan kezdődik a Premier a **${channelName}** csatornán!`;
        }

        const embed = new EmbedBuilder()
          .setColor(color)
          .setTitle(`${typeText}`)
          .setDescription(`${title}`)
          .addFields({ name: "Link:", value: videoUrl })
          .setImage(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)
          .setTimestamp()
          .setFooter({ text: `matepiee.eu - ${channelName}` });

        await discordChannel.send({
          content: `@everyone ${mentionText} 🚀`,
          embeds: [embed],
        });

        if (force) await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      Logger.log(
        client,
        "YOUTUBE",
        `Hiba (${channelName}): ${error.message}`,
        "ERROR",
      );
    }
  }
};
