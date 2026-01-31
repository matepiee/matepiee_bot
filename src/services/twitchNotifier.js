import axios from "axios";
import { EmbedBuilder } from "discord.js";
import { Logger } from "./logger.js";

let isLive = false;

export const checkTwitch = async (client, isTest = false) => {
  const CHANNEL_NAME = process.env.TWITCH_CHANNEL_NAME;
  const STREAM_CHANNEL_ID = process.env.STREAM_CHANNEL_ID;

  try {
    const authResponse = await axios.post(
      `https://id.twitch.tv/oauth2/token`,
      null,
      {
        params: {
          client_id: process.env.TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
          grant_type: "client_credentials",
        },
      },
    );

    const token = authResponse.data.access_token;

    const streamResponse = await axios.get(
      `https://api.twitch.tv/helix/streams?user_login=${CHANNEL_NAME}`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const stream = streamResponse.data.data[0];
    const discordChannel = await client.channels.fetch(STREAM_CHANNEL_ID);

    if (!discordChannel) return;

    if (stream) {
      if (!isLive || isTest) {
        isLive = true;

        const embed = new EmbedBuilder()
          .setColor("#6441a5")
          .setTitle(
            `Most indul az élő adás a **${CHANNEL_NAME}** csatornán! 🎮`,
          )
          .setURL(`https://twitch.tv/${CHANNEL_NAME}`)
          .setDescription(stream.title)
          .addFields(
            {
              name: "Játék",
              value: stream.game_name || "Nincs megadva",
              inline: true,
            },
            {
              name: "Nézők",
              value: stream.viewer_count.toString(),
              inline: true,
            },
          )
          .setImage(
            stream.thumbnail_url
              .replace("{width}", "1280")
              .replace("{height}", "720") + `?t=${Date.now()}`,
          )
          .setTimestamp()
          .setFooter({ text: `matepiee.eu - Twitch értesítő` });

        await discordChannel.send({
          content: `@everyone **Most indult el az élő adás a Twitchen!** 💜\nhttps://twitch.tv/${CHANNEL_NAME}`,
          embeds: [embed],
        });
        Logger.log(
          client,
          "TWITCH",
          `Stream elindult: ${stream.title}`,
          "SUCCESS",
        );
      }
    } else {
      if (isLive) {
        isLive = false;

        const embed = new EmbedBuilder()
          .setColor("#2C2F33")
          .setTitle(`⚫ Az adás véget ért.`)
          .setDescription(
            `Köszönöm mindenkinek, aki itt volt! Ha lemaradtál, nézd vissza a videókat.`,
          )
          .setTimestamp()
          .setFooter({ text: "matepiee.eu - Twitch Offline" });

        await discordChannel.send({ embeds: [embed] });
        Logger.log(client, "TWITCH", `Stream véget ért.`, "INFO");
      } else if (isTest) {
        await discordChannel.send(
          `✅ **Twitch Teszt:** A bot sikeresen elérte a Twitch-et, de a csatorna (${CHANNEL_NAME}) jelenleg **OFFLINE**.`,
        );
        Logger.log(
          client,
          "TWITCH",
          `Teszt lefutott: Csatorna offline.`,
          "INFO",
        );
      }
    }
  } catch (error) {
    Logger.log(client, "TWITCH", `Hiba: ${error.message}`, "ERROR");
  }
};
