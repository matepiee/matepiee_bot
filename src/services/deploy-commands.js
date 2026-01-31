import {
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName("website")
    .setDescription("Elküldi a weboldal linkjét"),
  new SlashCommandBuilder()
    .setName("matepiee_yt")
    .setDescription("YouTube teszt (Admin)"),
  new SlashCommandBuilder()
    .setName("matepiee_tt")
    .setDescription("TikTok teszt (Admin)"),
  new SlashCommandBuilder()
    .setName("matepiee_twitch")
    .setDescription("Twitch teszt (Admin)"),
  new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Egyedi embed üzenet létrehozása (Admin)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option.setName("title").setDescription("Az embed címe").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Az embed szövege/leírása")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("Szín HEX kódja (pl. #ff0000).")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("image")
        .setDescription("Kép URL címe (Opcionális)")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("thumbnail")
        .setDescription("Kis kép (Thumbnail) URL címe (Opcionális)")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("footer")
        .setDescription("Lábléc szövege (Opcionális)")
        .setRequired(false),
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Hova küldjem? (Ha üres, ide küldöm)")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Felhasználó kitiltása a szerverről (Admin)")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("A felhasználó")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Az indok").setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Kitiltás feloldása (Unban) (Admin)")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("A felhasználó (ID vagy név)")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Az indok").setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Felhasználó kirúgása a szerverről (Admin)")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("A felhasználó")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Az indok").setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Felhasználó némítása (Timeout) (Admin)")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("A felhasználó")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("minutes")
        .setDescription("Hány percre?")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Az indok").setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Időkorlát levétele (Untimeout) (Admin)")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("A felhasználó")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Az indok").setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("voice_mute")
    .setDescription("Felhasználó némítása hangcsatornán (Admin)")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("A felhasználó")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Az indok").setRequired(false),
    ),

  new SlashCommandBuilder()
    .setName("voice_unmute")
    .setDescription("Hangcsatorna némítás feloldása (Admin)")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("A felhasználó")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Az indok").setRequired(false),
    ),

  new SlashCommandBuilder()
    .setName("voice_deafen")
    .setDescription("Felhasználó süketítése hangcsatornán (Admin)")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("A felhasználó")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Az indok").setRequired(false),
    ),

  new SlashCommandBuilder()
    .setName("voice_undeafen")
    .setDescription("Hangcsatorna süketítés feloldása (Admin)")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("A felhasználó")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Az indok").setRequired(false),
    ),

  new SlashCommandBuilder()
    .setName("voice_kick")
    .setDescription("Felhasználó kidobása a hangcsatornából (Admin)")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("A felhasználó")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Az indok").setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Üzenetek tömeges törlése (Admin)")
    .addIntegerOption((option) =>
      option
        .setName("mennyiseg")
        .setDescription("Hány üzenetet töröljek? (1-100)")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Parancsok frissítése folyamatban...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log("Sikeresen regisztráltad a parancsokat! ✅");
  } catch (error) {
    console.error(error);
  }
})();
