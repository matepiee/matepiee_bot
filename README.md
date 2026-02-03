# 🤖 matepiee.eu Discord Bot

Ez egy egyedi fejlesztésű, többfunkciós Discord bot, amelyet a **matepiee.eu** weboldalhoz tartozik. A bot képes zenelejátszásra, adminisztrációs feladatokra, közösségi média értesítésekre (YouTube, Twitch), valamint interaktív funkciók (Reaction Roles, Embed készítő) kezelésére.

## ✨ Funkciók

- 🎵 **Zenelejátszó:** YouTube alapú lejátszás (`yt-dlp` és `ffmpeg` használatával) kiváló minőségben.
- 🛡️ **Moderáció:** Ban, Kick, Timeout, Purge (Tömeges törlés) parancsok logolással.
- 🔔 **Értesítések:** Automatikus jelzés új YouTube videókról, Twitch streamekről.
- 👋 **Üdvözlő Rendszer:** Képes üdvözlő üzenet az új tagoknak.
- 🎭 **Reaction Roles:** Automatikus rangosztás reakciók alapján.
- 📝 **Eszközök:** Egyedi Embed készítő (`/embed`) és weboldal linkelő.

## 🛠️ Előfeltételek

A bot futtatásához szükségesek a következők:

1.  **Node.js** (v18 vagy újabb verzió ajánlott)
2.  **FFmpeg** (Kötelező a zenelejátszáshoz! Hozzá kell adni a rendszer környezeti változóihoz, vagy a projekt mappájába kell tenni.)
3.  **Discord Bot Token** és **Application ID** (Developer Portal).

## 🚀 Telepítés

1.  **Klónozd le a repót:**

    ```bash
    git clone [https://github.com/FELHASZNALONEV/REPO_NEVE.git](https://github.com/FELHASZNALONEV/REPO_NEVE.git)
    cd matepiee-bot
    ```

2.  **Telepítsd a függőségeket:**

    ```bash
    npm install
    ```

3.  **Konfiguráció (.env fájl):**
    Hozd létre a `.env` fájlt a gyökérkönyvtárban, és másold bele az alábbi mintát a saját adataiddal kitöltve (lásd lentebb).

4.  **Parancsok regisztrálása (Első indítás előtt):**

    ```bash
    node src/deploy-commands.js
    ```

5.  **Indítás:**
    ```bash
    node src/index.js
    ```

## ⚙️ Konfiguráció (.env minta)

Hozz létre egy `.env` fájlt, és töltsd ki az alábbi adatokkal.
**Fontos:** A `.env` fájlt soha ne töltsd fel GitHubra! A lenti értékek csak helyőrzők, cseréld ki őket a sajátjaidra!

## env

# --- DISCORD ALAPBEÁLLÍTÁSOK ---

DISCORD*TOKEN=IDE*ÍRD_A_DISCORD_BOT_TOKENEDET
CLIENT_ID=IDE_A_BOT_APPLICATION_ID_JE
GUILD_ID=IDE_A_SZERVER_ID_JE

# --- MODERÁCIÓ ---

MODERATOR_ROLE_ID=IDE_A_MODERATOR_RANG_ID_JE
DISCORD_LOG_CHANNEL_ID=IDE_AZ_ADMIN_LOG_CSATORNA_ID

# --- ZENE ---

MUSIC_TEXT_CHANNEL_ID=IDE_AHOL_A_ZENE_PARANCSOKAT_FOGADJA

# --- ÜDVÖZLÉS ---

WELCOME_CHANNEL_ID=IDE_AZ_UDVOZLO_CSATORNA_ID

# --- REACTION ROLE (RANGOSZTÁS) ---

RR_CHANNEL_ID=IDE_A_CSATORNA_ID_AHOL_AZ_UZENET_VAN
RR_MESSAGE_ID=IDE_AZ_UZENET_ID_AMIRE_REAGALNI_KELL
RR_ROLE_ID=IDE_A_RANG_ID_AMIT_ADNI_KELL
RR_EMOJI=👍

# --- KÖZÖSSÉGI MÉDIA ÉRTESÍTÉSEK ---

# Csatornák az értesítésekhez:

STREAM_CHANNEL_ID=IDE_A_TWITCH_ERTESITES_CSATORNAJA
NOTIFIER_CHANNEL_ID=IDE_A_YOUTUBE_ERTESITES_CSATORNAJA

# YouTube

YOUTUBE_CHANNEL_ID=UCC1lXpfbbXHJzgwrTad4aiA
YOUTUBE_CHANNEL_ID_2=UCJbAruZ3R1tvQuSJQtqtGmA

# Twitch

TWITCH_CLIENT_ID=IDE_A_TWITCH_CLIENT_ID
TWITCH_CLIENT_SECRET=IDE_A_TWITCH_SECRET_TOKEN
TWITCH_CHANNEL_NAME=matepiee

## 🎮 Parancsok

### 🎵 Zene (Prefix: `!`)

- `!play <cím vagy link>` - Zene indítása.
- `!skip` - Zene átugrása.
- `!stop` - Zene leállítása és kilépés.

### 🛡️ Admin / Mod (Slash Command: `/` és Prefix `!`)

- `/ban <user> [indok]` - Kitiltás.
- `/kick <user> [indok]` - Kirúgás.
- `/timeout <user> <perc> [indok]` - Némítás.
- `/purge <mennyiség>` vagy `!purge <mennyiség>` - Üzenetek tömeges törlése.
- `/voice_mute`, `/voice_kick`, stb. - Hangcsatorna moderáció.
- `/embed` - Egyedi embed üzenet készítő.

### 🌐 Egyéb

- `/website` vagy `!website` - Weboldal linkje.
- `/matepiee_yt`, `/matepiee_twitch` - Értesítések tesztelése (Admin).

## 📁 Mappaszerkezet

- `src/index.js` - A bot fő belépési pontja.
- `src/events/` - Eseménykezelők (MessageCreate, InteractionCreate, stb.).
- `src/commands/` - Parancs definíciók.
- `src/services/` - Zenelejátszó, Logger és Értesítő modulok.
- `src/deploy-commands.js` - Slash commandok regisztráló szkriptje.

---

**Készítette:** matepiee
