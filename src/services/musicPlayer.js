import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
} from "@discordjs/voice";
import ytSearch from "yt-search";
import { spawn } from "child_process";
import fs from "fs";
import ffmpegPath from "ffmpeg-static";
import { Logger } from "./logger.js";

const queue = new Map();

console.log(`[FFMPEG CHECK] Útvonal: ${ffmpegPath}`);

function cleanYoutubeLink(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.searchParams.has("v")) {
      return `https://www.youtube.com/watch?v=${urlObj.searchParams.get("v")}`;
    }
  } catch (e) {}
  return url;
}

function getTitleWithYtDlp(url) {
  return new Promise((resolve) => {
    const args = [
      "--get-title",
      url,
      "--no-warnings",
      "--no-cache-dir",
      "--no-check-certificates",
      "--ffmpeg-location",
      ffmpegPath,
    ];

    if (fs.existsSync("cookies.txt")) args.push("--cookies", "cookies.txt");

    const process = spawn("./yt-dlp.exe", args);
    let data = "";
    process.stdout.on("data", (chunk) => (data += chunk));
    process.on("close", () => resolve(data.trim() || "YouTube Video"));
    process.on("error", () => resolve("YouTube Video"));
  });
}

export const MusicPlayer = {
  async execute(message, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.reply("❌ Előbb lépj be egy hangcsatornába!");

    let searchInput = args.join(" ");
    if (!searchInput) return message.reply("❌ Írd oda a zene címét!");

    searchInput = cleanYoutubeLink(searchInput);

    let songInfo;
    try {
      if (searchInput.startsWith("http")) {
        message.reply("🔍 Link feldolgozása...");
        const title = await getTitleWithYtDlp(searchInput);
        songInfo = {
          title: title,
          url: searchInput,
        };
      } else {
        console.log(`[MUSIC] Keresés indítása: ${searchInput}`);
        const r = await ytSearch(searchInput);

        if (!r || !r.videos || r.videos.length === 0) {
          return message.reply("❌ Nem találtam ilyen zenét.");
        }

        const video = r.videos[0];
        console.log(`[MUSIC] Találat: ${video.title}`);
        songInfo = {
          title: video.title,
          url: video.url,
        };
      }
    } catch (error) {
      console.error("Keresési hiba:", error);
      return message.reply("❌ Hiba a keresésnél.");
    }

    const serverQueue = queue.get(message.guild.id);

    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        player: createAudioPlayer({
          behaviors: { noSubscriber: NoSubscriberBehavior.Play },
        }),
        playing: true,
      };

      queue.set(message.guild.id, queueContruct);
      queueContruct.songs.push(songInfo);

      try {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        queueContruct.connection = connection;

        queueContruct.player.on(AudioPlayerStatus.Idle, () => {
          queueContruct.songs.shift();
          if (queueContruct.songs.length > 0) {
            playSong(message.guild, queueContruct.songs[0]);
          } else {
            // IDLE TIMER (CRASH FIX)
            setTimeout(() => {
              const currentQueue = queue.get(message.guild.id);
              // Csak akkor lépünk ki, ha MÉG létezik a kapcsolat és üres a sor
              if (
                currentQueue &&
                currentQueue.songs.length === 0 &&
                currentQueue.connection
              ) {
                if (currentQueue.connection.state.status !== "destroyed") {
                  try {
                    currentQueue.connection.destroy();
                  } catch (e) {
                    console.log("Kilépési hiba (figyelmen kívül hagyva).");
                  }
                }
                queue.delete(message.guild.id);
              }
            }, 60000);
          }
        });

        queueContruct.player.on("error", (error) => {
          console.error("[PLAYER ERROR]", error);
          queueContruct.songs.shift();
          if (queueContruct.songs.length > 0)
            playSong(message.guild, queueContruct.songs[0]);
        });

        connection.subscribe(queueContruct.player);
        playSong(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.error(err);
        queue.delete(message.guild.id);
        return message.reply("❌ Hiba a csatlakozásnál.");
      }
    } else {
      serverQueue.songs.push(songInfo);
      return message.reply(`✅ **${songInfo.title}** hozzáadva a sorhoz!`);
    }
  },

  skip(message) {
    const serverQueue = queue.get(message.guild.id);
    if (serverQueue) {
      serverQueue.player.stop();
      message.reply("⏭️ Zene átugorva!");
    }
  },

  stop(message) {
    const serverQueue = queue.get(message.guild.id);
    if (serverQueue) {
      serverQueue.songs = [];
      serverQueue.player.stop();
      // CRASH FIX: Csak akkor destroy, ha még él a kapcsolat
      if (
        serverQueue.connection &&
        serverQueue.connection.state.status !== "destroyed"
      ) {
        try {
          serverQueue.connection.destroy();
        } catch (e) {
          console.log("Stop hiba (már nincs kapcsolat):", e.message);
        }
      }
      queue.delete(message.guild.id);
      message.reply("🛑 Leállítva.");
    }
  },
};

async function playSong(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song || !serverQueue) return;

  console.log(`[STREAM] yt-dlp indítása: ${song.title}`);

  // --- YT-DLP KONFIGURÁCIÓ ---
  const args = [
    song.url,
    "-o",
    "-",
    "-q",
    "--no-playlist",
    "--no-check-certificates",
    "--no-cache-dir",
    "-f",
    "bestaudio", // Most már biztosan van bestaudio!
    "--buffer-size",
    "16K",
    "--ffmpeg-location",
    ffmpegPath,
  ];

  if (fs.existsSync("cookies.txt")) {
    args.push("--cookies", "cookies.txt");
  }

  try {
    const ytDlpProcess = spawn("./yt-dlp.exe", args);
    const resource = createAudioResource(ytDlpProcess.stdout);

    serverQueue.player.play(resource);
    serverQueue.textChannel.send(`🎶 Most szól: **${song.title}**`);

    ytDlpProcess.stderr.on("data", (data) => {
      const err = data.toString();
      // Broken pipe és Warning szűrése
      if (
        !err.includes("WARNING") &&
        !err.includes("DeprecationWarning") &&
        !err.includes("Broken pipe")
      ) {
        console.error(`[yt-dlp HIBA]: ${err}`);
      }
    });
  } catch (error) {
    console.error("[STREAM HIBA]", error);
    if (serverQueue) {
      serverQueue.textChannel.send(`⚠️ Hiba a lejátszásnál: ${song.title}`);
      serverQueue.songs.shift();
      playSong(guild, serverQueue.songs[0]);
    }
  }
}
