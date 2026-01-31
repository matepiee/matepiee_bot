import { Logger } from "../services/logger.js";
import { MusicPlayer } from "../services/musicPlayer.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} from "@discordjs/voice";

export default {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return;
    if (message.content.startsWith("!purge")) {
      if (
        !message.member.permissions.has("ManageMessages") &&
        !message.member.permissions.has("Administrator")
      ) {
        return message.reply("⛔ Nincs jogod üzeneteket törölni!");
      }
      const args = message.content.split(" ");
      const amount = parseInt(args[1]);
      if (isNaN(amount)) {
        return message.reply("❌ Kérlek adj meg egy számot! (pl. `!purge 10`)");
      } else if (amount < 1 || amount > 100) {
        return message.reply("❌ Csak 1 és 100 közötti számot adhatsz meg!");
      }
      try {
        await message.delete().catch(() => {});
        const deleted = await message.channel.bulkDelete(amount, true);
        const msg = await message.channel.send(
          `🧹 Törölve **${deleted.size}** üzenet.`,
        );
        setTimeout(() => msg.delete().catch(() => {}), 3000);
      } catch (error) {
        console.error("[PURGE HIBA]", error);
        message.channel.send("❌ Hiba történt a törlésnél.");
      }
      return;
    }
    if (message.content === "!radio") {
      const channel = message.member.voice.channel;
      if (!channel) return message.reply("❌ Lépj be egy hangcsatornába!");

      try {
        console.log("[RADIO] Teszt indítása...");
        const connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });
        const player = createAudioPlayer();
        const resource = createAudioResource(
          "https://icast.connectmedia.hu/5202/live.mp3",
        );
        player.play(resource);
        connection.subscribe(player);
        return message.reply(
          "📻 Rádió teszt indítása... (Ha ezt hallod, a bot tud beszélni!)",
        );
      } catch (e) {
        console.error("[RADIO HIBA]", e);
        return message.reply("❌ Hiba a rádió indításakor.");
      }
    }
    if (
      message.content.startsWith("!play") ||
      message.content.startsWith("!skip") ||
      message.content.startsWith("!stop")
    ) {
      console.log(`[PARANCS ÉSZLELVE] ${message.content}`);
      const musicChannelId = process.env.MUSIC_TEXT_CHANNEL_ID;
      if (musicChannelId && message.channel.id !== musicChannelId) {
        console.log(
          `[HIBA] Rossz csatorna. Elvárt: ${musicChannelId}, Kapott: ${message.channel.id}`,
        );
        return message.reply(
          `❌ Gyere a zene csatornába! <#${musicChannelId}>`,
        );
      }

      const args = message.content.split(" ");
      const command = args.shift().toLowerCase();

      try {
        if (command === "!play") {
          console.log("[DEBUG] MusicPlayer.execute hívása...");
          await MusicPlayer.execute(message, args);
        } else if (command === "!skip") {
          MusicPlayer.skip(message);
        } else if (command === "!stop") {
          MusicPlayer.stop(message);
        }
      } catch (error) {
        console.error("[KRITIKUS HIBA]", error);
        message.reply("❌ Hiba történt a parancs feldolgozása közben.");
      }
      return;
    }
    if (message.content === "!website") {
      await message.reply("**Website** 🌐:\nhttps://matepiee.eu");
      return;
    }
  },
};
