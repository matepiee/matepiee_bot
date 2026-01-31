import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  Events,
} from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateDependencyReport } from "@discordjs/voice";
console.log(generateDependencyReport());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const { default: event } = await import(`file://${filePath}`);

  if (event && event.name) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}

client.login(process.env.DISCORD_TOKEN);
