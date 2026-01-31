import axios from "axios";
import { EmbedBuilder } from "discord.js";
import fs from "fs";
import { Logger } from "./logger.js";
const DATABASE_FILE = "./lastTikTok.json";

const getTime = () => {
  const now = new Date();
  return `${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getDate().toString().padStart(2, "0")} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
};

let rateLimitUntil = 0;

let unbanTimer = null;

export const checkTiktok = async (client, force = false) => {
  if (Date.now() < rateLimitUntil) {
    if (force) {
      const remainingMinutes = Math.ceil((rateLimitUntil - Date.now()) / 60000);
      Logger.log(
        client,
        "TIKTOK",
        `A funkció még pihenőn van ${remainingMinutes} percig.`,
        "WARN",
      );
    }
    return;
  }

  const USERNAME = process.env.TIKTOK_USERNAME;
  const NOTIFIER_CHANNEL_ID = process.env.NOTIFIER_CHANNEL_ID;

  if (!process.env.RAPIDAPI_KEY) return;

  const options = {
    method: "GET",
    url: "https://tiktok-scraper7.p.rapidapi.com/user/posts",
    params: {
      unique_id: USERNAME,
      count: "10",
    },
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": "tiktok-scraper7.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    const videos = response.data?.data?.videos;

    if (!videos || videos.length === 0) {
      if (force)
        Logger.log(client, "TIKTOK", "Nem találtam új videókat.", "INFO");
      return;
    }

    let lastData = { lastId: "" };
    if (fs.existsSync(DATABASE_FILE)) {
      lastData = JSON.parse(fs.readFileSync(DATABASE_FILE));
    }

    const discordChannel = await client.channels.fetch(NOTIFIER_CHANNEL_ID);
    if (!discordChannel) return;

    const itemsToProcess = force
      ? [...videos].slice(0, 5).reverse()
      : [videos[0]];

    for (const video of itemsToProcess) {
      const videoId = video.video_id;
      const videoUrl = `https://www.tiktok.com/@${USERNAME}/video/${videoId}`;
      if (lastData.lastId === videoId && !force) continue;

      if (!force) {
        lastData.lastId = videoId;
        fs.writeFileSync(DATABASE_FILE, JSON.stringify(lastData));
        Logger.log(
          client,
          "TIKTOK",
          `Új videó közzétéve: ${videoId}`,
          "SUCCESS",
        );
      }
      const embed = new EmbedBuilder()
        .setColor("#EE1D52")
        .setTitle("Tiktok 📱")
        .setURL(videoUrl)
        .setDescription("Kattints a megtekintéshez!")
        .setImage(video.cover)
        .setTimestamp()
        .setFooter({ text: `matepiee.eu - TikTok` });
      await channel.send({
        content: `@everyone Új Tiktok videó! 🚀\n${videoUrl}`,
        embeds: [embed],
      });
    }
    rateLimitUntil = 0;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      const banTime = 5 * 60 * 1000;
      rateLimitUntil = Date.now() + banTime;
      Logger.log(
        client,
        "TIKTOK",
        `⚠️ Rate Limit! A TikTok funkció 5 percre letiltva.`,
        "ERROR",
      );
      if (!unbanTimer) {
        unbanTimer = setTimeout(() => {
          rateLimitUntil = 0;
          unbanTimer = null;
          Logger.log(
            client,
            "TIKTOK",
            `✅ Az 5 perces tiltás lejárt! A TikTok funkció újra aktív.`,
            "SUCCESS",
          );
        }, banTime);
      }
    } else {
      Logger.log(client, "TIKTOK", `Hiba: ${error.message}`, "ERROR");
    }
  }
};
