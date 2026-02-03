import { checkYoutube } from "../services/youtubeNotifier.js";
import { checkTwitch } from "../services/twitchNotifier.js";
import { Logger } from "../services/logger.js";
import { EmbedBuilder } from "discord.js";

export default {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName, options, member, guild } = interaction;

    try {
      if (commandName === "matepiee_yt") {
        if (!member.permissions.has("Administrator"))
          return interaction.reply({
            content: "Nincs jogod ehhez!",
            ephemeral: true,
          });
        await interaction.reply("YouTube teszt...");
        await checkYoutube(interaction.client, true);
      } else if (commandName === "matepiee_twitch") {
        if (!member.permissions.has("Administrator"))
          return interaction.reply({
            content: "Nincs jogod ehhez!",
            ephemeral: true,
          });
        await interaction.reply("Twitch teszt...");
        await checkTwitch(interaction.client, true);
      } else if (commandName === "website") {
        await interaction.reply("**Website** 🌐:\nhttps://matepiee.eu/");
      } else if (commandName === "embed") {
        if (!member.permissions.has("Administrator")) {
          return interaction.reply({
            content: "⛔ Ezt a parancsot csak adminisztrátorok használhatják!",
            ephemeral: true,
          });
        }
        const title = options.getString("title");
        const description = options.getString("description");
        const image = options.getString("image");
        const thumbnail = options.getString("thumbnail");
        const footer = options.getString("footer");
        let colorInput = options.getString("color");
        const targetChannel =
          options.getChannel("channel") || interaction.channel;
        let embedColor = "#0099ff";
        const hexRegex = /^#[0-9A-F]{6}$/i;

        if (colorInput) {
          if (!colorInput.startsWith("#")) colorInput = "#" + colorInput;
          if (hexRegex.test(colorInput)) {
            embedColor = colorInput;
          } else {
            await interaction.reply({
              content: `⚠️ **Figyelem:** A megadott színkód (${colorInput}) érvénytelen! Alapértelmezett kéket használtam.\nHelyes formátum: #RRGGBB (6 karakter)`,
              ephemeral: true,
            });
          }
        }

        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .setColor(embedColor);

        if (image) embed.setImage(image);
        if (thumbnail) embed.setThumbnail(thumbnail);
        if (footer) embed.setFooter({ text: footer });

        try {
          await targetChannel.send({ embeds: [embed] });
          if (interaction.replied) {
            await interaction.followUp({
              content: `✅ Embed sikeresen elküldve ide: ${targetChannel}`,
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: `✅ Embed sikeresen elküldve ide: ${targetChannel}`,
              ephemeral: true,
            });
          }
        } catch (err) {
          console.error(err);
          if (!interaction.replied) {
            await interaction.reply({
              content: "❌ Hiba történt az üzenet küldésekor.",
              ephemeral: true,
            });
          }
        }
      } else if (commandName === "purge") {
        if (
          !member.permissions.has("ManageMessages") &&
          !member.permissions.has("Administrator")
        ) {
          return interaction.reply({
            content: "⛔ Nincs jogod üzeneteket törölni!",
            ephemeral: true,
          });
        }

        const amount = options.getInteger("mennyiseg");

        try {
          const deleted = await interaction.channel.bulkDelete(amount, true);
          await interaction.reply({
            content: `🧹 Sikeresen törölve **${deleted.size}** üzenet!`,
            ephemeral: true,
          });
        } catch (error) {
          console.error("[PURGE HIBA]", error);
          await interaction.reply({
            content: "❌ Hiba történt a törlés közben.",
            ephemeral: true,
          });
        }
      } else {
        const modCommands = [
          "ban",
          "unban",
          "kick",
          "timeout",
          "untimeout",
          "voice_mute",
          "voice_unmute",
          "voice_deafen",
          "voice_undeafen",
          "voice_kick",
        ];
        if (modCommands.includes(commandName)) {
          const modRoleId = process.env.MODERATOR_ROLE_ID;
          const hasModRole = member.roles.cache.has(modRoleId);
          const isAdmin = member.permissions.has("Administrator");
          if (!isAdmin && !hasModRole) {
            return interaction.reply({
              content: "⛔ Nincs jogosultságod a parancs használatához!",
              ephemeral: true,
            });
          }

          const targetUser = options.getUser("target");
          const targetMember = await guild.members
            .fetch(targetUser.id)
            .catch(() => null);
          const reason = options.getString("reason") || "Nincs megadva indok";
          if (!targetMember && commandName !== "unban") {
            return interaction.reply({
              content: "❌ Nem találom ezt a felhasználót a szerveren.",
              ephemeral: true,
            });
          }
          if (
            targetMember &&
            targetMember.roles.highest.position >=
              member.roles.highest.position &&
            !isAdmin
          ) {
            return interaction.reply({
              content:
                "❌ Nem moderálhatsz nálad nagyobb vagy egyenlő rangú felhasználót!",
              ephemeral: true,
            });
          }
          if (commandName === "ban") {
            if (!targetMember.bannable)
              return interaction.reply({
                content: "❌ Nem tudom bannolni (túl nagy rangja van).",
                ephemeral: true,
              });

            await targetMember.ban({
              reason: `Bannolta: ${member.user.tag} | Indok: ${reason}`,
            });
            await interaction.reply(`🚫 **${targetUser.tag}** ki lett tiltva.`);
            await Logger.log(
              interaction.client,
              "ADMIN",
              `🚫 **BAN**\n**Kit:** ${targetUser.tag}\n**Ki:** ${member.user.tag}\n**Indok:** ${reason}`,
              "ERROR",
            );
          } else if (commandName === "unban") {
            await guild.members.unban(
              targetUser.id,
              `Unbannolta: ${member.user.tag} | Indok: ${reason}`,
            );
            await interaction.reply(
              `✅ **${targetUser.tag}** kitiltása feloldva.`,
            );
            await Logger.log(
              interaction.client,
              "ADMIN",
              `🔓 **UNBAN**\n**Kit:** ${targetUser.tag}\n**Ki:** ${member.user.tag}\n**Indok:** ${reason}`,
              "SUCCESS",
            );
          } else if (commandName === "kick") {
            if (!targetMember.kickable)
              return interaction.reply({
                content: "❌ Nem tudom kirúgni.",
                ephemeral: true,
              });

            await targetMember.kick(
              `Kirúgta: ${member.user.tag} | Indok: ${reason}`,
            );
            await interaction.reply(`👢 **${targetUser.tag}** ki lett rúgva.`);
            await Logger.log(
              interaction.client,
              "ADMIN",
              `👢 **KICK**\n**Kit:** ${targetUser.tag}\n**Ki:** ${member.user.tag}\n**Indok:** ${reason}`,
              "WARN",
            );
          } else if (commandName === "timeout") {
            const minutes = options.getInteger("minutes");
            if (!targetMember.moderatable)
              return interaction.reply({
                content: "❌ Nem tudom némítani.",
                ephemeral: true,
              });

            await targetMember.timeout(
              minutes * 60 * 1000,
              `Mod: ${member.user.tag} | Indok: ${reason}`,
            );
            await interaction.reply(
              `⏳ **${targetUser.tag}** némítva lett ${minutes} percre.`,
            );
            await Logger.log(
              interaction.client,
              "ADMIN",
              `⏳ **TIMEOUT**\n**Kit:** ${targetUser.tag}\n**Ki:** ${member.user.tag}\n**Indok:** ${reason}`,
              "WARN",
            );
          } else if (commandName === "untimeout") {
            if (!targetMember.moderatable)
              return interaction.reply({
                content: "❌ Nem tudom levenni a némítást.",
                ephemeral: true,
              });

            await targetMember.timeout(
              null,
              `Mod: ${member.user.tag} | Indok: ${reason}`,
            );
            await interaction.reply(
              `✅ **${targetUser.tag}** némítása (timeout) levéve.`,
            );
            await Logger.log(
              interaction.client,
              "ADMIN",
              `✅ **TIMEOUT FELOLDÁSA**\n**Kit:** ${targetUser.tag}\n**Ki:** ${member.user.tag}\n**Indok:** ${reason}`,
              "WARN",
            );
          } else if (commandName === "voice_mute") {
            if (!targetMember.voice.channel)
              return interaction.reply({
                content: "❌ A felhasználó nincs hangcsatornában.",
                ephemeral: true,
              });
            await targetMember.voice.setMute(
              true,
              `Mod: ${member.user.tag} | Indok: ${reason}`,
            );
            await interaction.reply(
              `🔇 **${targetUser.tag}** némítva lett a hangcsatornán.`,
            );
            await Logger.log(
              interaction.client,
              "ADMIN",
              `🔇 **NÉMÍTÁS**\n**Kit:** ${targetUser.tag}\n**Ki:** ${member.user.tag}\n**Indok:** ${reason}`,
              "WARN",
            );
          } else if (commandName === "voice_unmute") {
            if (!targetMember.voice.channel)
              return interaction.reply({
                content: "❌ A felhasználó nincs hangcsatornában.",
                ephemeral: true,
              });
            await targetMember.voice.setMute(
              false,
              `Mod: ${member.user.tag} | Indok: ${reason}`,
            );
            await interaction.reply(
              `🔊 **${targetUser.tag}** némítása feloldva a hangcsatornán.`,
            );
            await Logger.log(
              interaction.client,
              "ADMIN",
              `🔊 **NÉMÍTÁS FELOLDÁSA**\n**Kit:** ${targetUser.tag}\n**Ki:** ${member.user.tag}\n**Indok:** ${reason}`,
              "WARN",
            );
          } else if (commandName === "voice_deafen") {
            if (!targetMember.voice.channel)
              return interaction.reply({
                content: "❌ A felhasználó nincs hangcsatornában.",
                ephemeral: true,
              });
            await targetMember.voice.setDeaf(
              true,
              `Mod: ${member.user.tag} | Indok: ${reason}`,
            );
            await interaction.reply(
              `🙉 **${targetUser.tag}** süketítve lett a hangcsatornán.`,
            );
            await Logger.log(
              interaction.client,
              "ADMIN",
              `😶 **VOICE DEAFEN**\n**Kit:** ${targetUser.tag}\n**Ki:** ${member.user.tag}\n**Indok:** ${reason}`,
              "WARN",
            );
          } else if (commandName === "voice_undeafen") {
            if (!targetMember.voice.channel)
              return interaction.reply({
                content: "❌ A felhasználó nincs hangcsatornában.",
                ephemeral: true,
              });
            await targetMember.voice.setDeaf(
              false,
              `Mod: ${member.user.tag} | Indok: ${reason}`,
            );
            await interaction.reply(
              `👂 **${targetUser.tag}** süketítése feloldva a hangcsatornán.`,
            );
            await Logger.log(
              interaction.client,
              "ADMIN",
              `🔊 **VOICE UNDEAFEN**\n**Kit:** ${targetUser.tag}\n**Ki:** ${member.user.tag}\n**Indok:** ${reason}`,
              "WARN",
            );
          } else if (commandName === "voice_kick") {
            if (!targetMember.voice.channel)
              return interaction.reply({
                content: "❌ A felhasználó nincs hangcsatornában.",
                ephemeral: true,
              });
            await targetMember.voice.disconnect(
              `Mod: ${member.user.tag} | Indok: ${reason}`,
            );
            await interaction.reply(
              `👋 **${targetUser.tag}** ki lett dobva a hangcsatornából.`,
            );
            await Logger.log(
              interaction.client,
              "ADMIN",
              `👋 **VOICE KICK**\n**Kit:** ${targetUser.tag}\n**Ki:** ${member.user.tag}\n**Indok:** ${reason}`,
              "WARN",
            );
          }
        }
      }
    } catch (error) {
      console.error("Parancs Hiba:", error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: `Hiba történt: ${error.message}`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `Hiba történt: ${error.message}`,
          ephemeral: true,
        });
      }
    }
  },
};
