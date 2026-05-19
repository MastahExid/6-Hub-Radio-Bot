require("dotenv").config();

const express = require("express");
const {
  Client,
  GatewayIntentBits,
  ActivityType
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  NoSubscriberBehavior
} = require("@discordjs/voice");

const app = express();

app.get("/", (req, res) => {
  res.send("6 Hub 92.0 is online.");
});

app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("Web server running.");
});

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;
const STATUS_CHANNEL_ID = process.env.STATUS_CHANNEL_ID;

const BOT_STATION_NAME = "6 Hub 92.0";

const stations = [
  {
    name: "Flash FM / GTA Vice City",
    note: null,
    intro: "https://drive.google.com/uc?export=download&id=142Ui69r2quINmgUVmdcEUyKdSzRCcXqF",
    main: "https://drive.google.com/uc?export=download&id=1RyFyb9hogR9dupm6QUBDKXpbeKp90zAu"
  },
  {
    name: "Non-Stop Pop FM / GTA V",
    note: "6 Hub Cut - Includes Deleted Songs",
    intro: "https://drive.google.com/uc?export=download&id=1deMQNOwapCDPf1JIfPESZPE_U4KWZ4B6",
    main: "https://drive.google.com/uc?export=download&id=1JcNsPlQQG_ZHUjsqvJ0erlZzsYlt57KP"
  },
  {
    name: "Fever 105 / GTA Vice City",
    note: null,
    intro: "https://drive.google.com/uc?export=download&id=1afqoEPlj8-uFom4ArsZOTCLeqj3bCpuf",
    main: "https://drive.google.com/uc?export=download&id=1GFaqToOqDu2jns0FiJGwimeMGLWUuVr1"
  },
  {
    name: "Radio Los Santos / GTA V",
    note: "6 Hub Cut - Includes Deleted Songs",
    intro: "https://drive.google.com/uc?export=download&id=1TOqqt5WlasITsE4FrrKtlf7CUa-_MWof",
    main: "https://drive.google.com/uc?export=download&id=1oyt8ajgg35a3c2T_IX02SfocRo4CBvDT"
  },
  {
    name: "West Coast Classics / GTA V",
    note: "6 Hub Cut - Includes Deleted Songs",
    intro: "https://drive.google.com/uc?export=download&id=1B9RTY_8rTIgeD_4QaC4_JB065FQRJFWj",
    main: "https://drive.google.com/uc?export=download&id=1xRFSna24Q44rGTzT91NMrXDXSAnmJc2r"
  }
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

let connection;
let player;
let currentStationIndex = 0;
let statusMessageId = null;
let countdownInterval = null;

let currentStationStartedAt = null;
let currentStationDurationMs = 0;
let currentMode = "intro";

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hour${hours === 1 ? "" : "s"} ${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  return `${Math.max(1, minutes)} minute${minutes === 1 ? "" : "s"}`;
}

function getCurrentStation() {
  return stations[currentStationIndex];
}

function createStreamResource(url) {
  return createAudioResource(url, {
    inlineVolume: true
  });
}

async function updateStatus(station) {
  client.user.setActivity(`${BOT_STATION_NAME} • ${station.name}`, {
    type: ActivityType.Listening
  });

  if (!STATUS_CHANNEL_ID) return;

  const channel = await client.channels.fetch(STATUS_CHANNEL_ID).catch(() => null);
  if (!channel || !channel.isTextBased()) return;

  let timeLine = "";

  if (currentMode === "main" && currentStationStartedAt && currentStationDurationMs > 0) {
    const elapsed = Date.now() - currentStationStartedAt;
    const remaining = currentStationDurationMs - elapsed;
    timeLine = `Ends in **${formatTime(remaining)}**`;
  } else {
    timeLine = `Starting station intro...`;
  }

  const nextStation = stations[(currentStationIndex + 1) % stations.length];

  const message =
`📻 **${BOT_STATION_NAME} is now playing**

**${station.name}**
${station.note ? `*${station.note}*\n` : ""}
${timeLine}

**Next Up:** ${nextStation.name}

Looping through all GTASIXHUB stations 24/7.`;

  if (statusMessageId) {
    const oldMessage = await channel.messages.fetch(statusMessageId).catch(() => null);
    if (oldMessage) {
      await oldMessage.edit(message).catch(() => {});
      return;
    }
  }

  const sent = await channel.send(message).catch(() => null);
  if (sent) statusMessageId = sent.id;
}

function startCountdown(station) {
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    updateStatus(station);
  }, 60 * 1000);
}

function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

async function playIntro() {
  const station = getCurrentStation();

  currentMode = "intro";
  currentStationStartedAt = null;
  currentStationDurationMs = 0;

  stopCountdown();
  await updateStatus(station);

  console.log(`Playing intro: ${station.name}`);

  const resource = createStreamResource(station.intro);
  resource.volume.setVolume(0.35);

  player.play(resource);
}

async function playMain() {
  const station = getCurrentStation();

  currentMode = "main";
  currentStationStartedAt = Date.now();

  /*
    IMPORTANT:
    Because the files are streamed from Google Drive, the bot cannot always read
    the real MP3 duration perfectly.

    Set manual durations here in minutes when you know them.
    Example:
    "Flash FM / GTA Vice City": 74,

    If left as 0, the countdown will still work visually only if you add the durations.
  */

  const manualDurationsMinutes = {
    "Flash FM / GTA Vice City": 0,
    "Non-Stop Pop FM / GTA V": 0,
    "Fever 105 / GTA Vice City": 0,
    "Radio Los Santos / GTA V": 0,
    "West Coast Classics / GTA V": 0
  };

  currentStationDurationMs = (manualDurationsMinutes[station.name] || 0) * 60 * 1000;

  await updateStatus(station);
  startCountdown(station);

  console.log(`Playing main: ${station.name}`);

  const resource = createStreamResource(station.main);
  resource.volume.setVolume(0.35);

  player.play(resource);
}

async function playNextStation() {
  currentStationIndex = (currentStationIndex + 1) % stations.length;
  await playIntro();
}

async function connectToRadio() {
  const guild = await client.guilds.fetch(GUILD_ID);
  const channel = await guild.channels.fetch(VOICE_CHANNEL_ID);

  if (!channel || !channel.isVoiceBased()) {
    console.log("Voice channel not found or invalid.");
    return;
  }

  player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Play
    }
  });

  connection = joinVoiceChannel({
    channelId: VOICE_CHANNEL_ID,
    guildId: GUILD_ID,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: true
  });

  connection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, async () => {
    if (currentMode === "intro") {
      await playMain();
    } else {
      await playNextStation();
    }
  });

  player.on("error", async error => {
    console.error("Audio player error:", error);

    if (currentMode === "intro") {
      setTimeout(playMain, 2000);
    } else {
      setTimeout(playNextStation, 2000);
    }
  });

  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    console.log("Disconnected. Trying to reconnect...");

    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5000)
      ]);
    } catch {
      try {
        connection.destroy();
      } catch {}

      setTimeout(connectToRadio, 5000);
    }
  });

  await entersState(connection, VoiceConnectionStatus.Ready, 30000);

  console.log(`Connected to ${channel.name}. Starting ${BOT_STATION_NAME}...`);
  await playIntro();
}

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await connectToRadio();
});

client.login(TOKEN);
