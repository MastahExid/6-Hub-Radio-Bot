require("dotenv").config();

const express = require("express");
const { spawn } = require("child_process");
const { VibeSync } = require("vibesync");
const ffmpegPath = require("ffmpeg-static");

const {
  Client,
  GatewayIntentBits,
  ActivityType,
  PermissionsBitField
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  NoSubscriberBehavior,
  StreamType
} = require("@discordjs/voice");

const app = express();

process.on("unhandledRejection", error => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", error => {
  console.error("Uncaught exception:", error);
});

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
    shortName: "Flash FM",
    note: null,
    durationSeconds: 4598,
    intro: "./audio/flash-fm/intro.mp3",
    main: "./audio/flash-fm/main.mp3",
    songs: [
      [8, "Hall and Oates — Out of Touch"],
      [255, "Wang Chung — Dance Hall Days"],
      [450, "Michael Jackson — Billie Jean"],
      [700, "Laura Branigan — Self Control"],
      [979, "Go West — Call Me"],
      [1186, "INXS — Kiss the Dirt (Falling Down the Mountain)"],
      [1471, "Bryan Adams — Run to You"],
      [1681, "Electric Light Orchestra — Four Little Diamonds"],
      [1916, "Yes — Owner of a Lonely Heart"],
      [2169, "The Buggles — Video Killed the Radio Star"],
      [2367, "Aneka — Japanese Boy"],
      [2671, "Talk Talk — Life’s What You Make It"],
      [2885, "The Outfield — Your Love"],
      [3173, "Joe Jackson — Steppin' Out"],
      [3369, "The Fixx — One Thing Leads to Another"],
      [3588, "Lionel Richie — Running with the Night"],
      [3782, "Boys Don't Cry — I Wanna Be a Cowboy"],
      [4136, "Glenn Frey — Smuggler's Blues"],
      [4362, "Toto — Hold the Line"]
    ]
  },
  {
    name: "Non-Stop Pop FM / GTA V",
    shortName: "Non-Stop Pop FM",
    note: "6 Hub Cut - Includes Deleted Songs",
    durationSeconds: 13878,
    intro: "./audio/non-stop-pop/intro.mp3",
    main: "./audio/non-stop-pop/main.mp3",
    songs: [
      [6, "Fergie feat. Ludacris — Glamorous"],
      [245, "Real Life — Send Me An Angel '89"],
      [480, "Corona — The Rhythm of the Night"],
      [703, "Kelly Rowland — Work"],
      [895, "Simply Red — Something Got Me Started"],
      [1128, "The Blow Monkeys & Kym Mazelle — Wait"],
      [1325, "Backstreet Boys — I Want It That Way"],
      [1547, "Dirty Vegas — Days Go By"],
      [1843, "Moloko — The Time Is Now"],
      [2070, "Amerie — 1 Thing"],
      [2291, "Robbie Williams & Kylie Minogue — Kids"],
      [2561, "Maroon 5 feat. Christina Aguilera — Moves like Jagger"],
      [2772, "N-Joi — Anthem"],
      [2977, "Wham! — Everything She Wants"],
      [3209, "Mis-Teeq — Scandalous"],
      [3449, "Mike Posner — Cooler Than Me"],
      [3672, "Lady Gaga — Applause"],
      [3894, "All Saints — Pure Shores"],
      [4142, "Jamiroquai — Alright"],
      [4362, "Modjo — Lady"],
      [4577, "Lorde — Tennis Court"],
      [4787, "Taylor Dayne — Tell It to My Heart"],
      [4998, "Sly Fox — Let's Go All the Way"],
      [5233, "Robyn feat. Kleerup — With Every Heartbeat"],
      [5462, "Bobby Brown — On Our Own"],
      [5731, "INXS — New Sensation"],
      [5958, "Naked Eyes — Promises, Promises"],
      [6189, "M.I.A. — Bad Girls"],
      [6420, "Hall & Oates — Adult Education"],
      [6697, "Sneaker Pimps — 6 Underground"],
      [6920, "Rihanna — Only Girl"],
      [7163, "Britney Spears — Gimme More"],
      [7369, "The Black Eyed Peas — Meet Me Halfway"],
      [7629, "Gorillaz feat. De La Soul — Feel Good Inc."],
      [7864, "Living in a Box — Living in a Box"],
      [8049, "M83 — Midnight City"],
      [8264, "Bronski Beat — Smalltown Boy"],
      [8540, "Morcheeba — Tape Loop"],
      [8751, "Morcheeba — Tape Loop"],
      [8980, "Pet Shop Boys — West End Girls"],
      [9208, "Cassie — Me & U"],
      [9405, "Jane Child — Don't Wanna Fall in Love"],
      [9621, "Stardust — Music Sounds Better with You"],
      [9865, "Neon Trees — Animal"],
      [10088, "Cobra Starship feat. Sabi — You Make Me Feel..."],
      [10298, "Belinda Carlisle — Circle in the Sand"],
      [10535, "Tears for Fears — Everybody Wants to Rule the World"],
      [10794, "Miike Snow — Animal"],
      [11034, "Wilson Phillips — Hold On"],
      [11253, "Michael Jackson — Jam"],
      [11565, "Jamiroquai — Love Foolosophy"],
      [11790, "Olivia Newton-John — Physical"],
      [12020, "Enrique Iglesias feat. Pitbull — I Like It"],
      [12261, "Estelle feat. Kanye West — American Boy"],
      [12541, "Kevin Rudolf feat. Lil Wayne — Let It Rock"],
      [12796, "Duran Duran — Serious"],
      [13048, "Seal — Future Love Paradise"],
      [13311, "Timbaland feat. Keri Hilson & D.O.E. — The Way I Are"],
      [13494, "Kylie Minogue — Surrender"],
      [13666, "The Supermen Lovers — Starlight"]
    ]
  },
  {
    name: "Fever 105 / GTA Vice City",
    shortName: "Fever 105",
    note: null,
    durationSeconds: 3793,
    intro: "./audio/fever-105/intro.mp3",
    main: "./audio/fever-105/main.mp3",
    songs: [
      [4, "The Whispers — And the Beat Goes On"],
      [271, "Fat Larry's Band — Act Like You Know"],
      [560, "Oliver Cheatham — Get Down Saturday Night"],
      [962, "Pointer Sisters — Automatic"],
      [1240, "René & Angela — I'll Be Good"],
      [1486, "Mary Jane Girls — All Night Long"],
      [1821, "Rick James — Ghetto Life"],
      [2079, "Michael Jackson — Wanna Be Startin' Somethin'"],
      [2437, "Evelyn King — Shame"],
      [2746, "Teena Marie — Behind the Groove"],
      [2953, "Mtume — Juicy Fruit"],
      [3225, "Kool & the Gang — Summer Madness"],
      [3538, "Indeep — Last Night a D.J. Saved My Life"]
    ]
  },
  {
    name: "Radio Los Santos / GTA V",
    shortName: "Radio Los Santos",
    note: "6 Hub Cut - Includes Deleted Songs",
    durationSeconds: 14428,
    intro: "./audio/radio-los-santos/intro.mp3",
    main: "./audio/radio-los-santos/main.mp3",
    songs: [
      [10, "G-Side feat. G-Mane — Relaxin'"],
      [202, "Kendrick Lamar — A.D.H.D"],
      [400, "Ace Hood feat. Future & Rick Ross — Bugatti"],
      [686, "Tia Corine — Coochie"],
      [851, "Young Scooter feat. Trinidad James — I Can't Wait"],
      [1036, "Tyler, The Creator feat. 42 Dugg — LEMONHEAD"],
      [1168, "Young Stoner Life, Young Thug & Gunna — Ski"],
      [1347, "ScHoolboy Q feat. Kendrick Lamar — Collard Greens"],
      [1625, "Young Scooter feat. Gucci Mane — Work"],
      [1916, "Kodak Black feat. Travis Scott & Offset — ZEZE"],
      [2148, "Dr. Dre feat. Nipsey Hustle & Ty Dolla Sign — Diamond Mind"],
      [2453, "Ab-Soul feat. ScHoolboy Q — Hunnid Stax"],
      [2641, "Gangrene — Bassheads"],
      [2849, "BJ the Chicago Kid feat. Freddie Gibbs & Problem — Smokin' and Ridin'"],
      [3058, "Saweetie — My Type"],
      [3218, "Big Sean & Hit-Boy — What a Life"],
      [3399, "Chuck Inglish feat. Ab-Soul & Mac Miller — Came Thru/Easily"],
      [3685, "Vince Staples feat. Juicy J — Big Fish"],
      [3887, "A$AP Ferg — Plain Jane"],
      [4074, "Marion Band$ feat. Nipsey Hussle — Hold Up"],
      [4286, "Fredo Santana feat. Chief Keef, Ball Out & Tadoe — Go Live"],
      [4584, "Clyde Carson feat. The Team — Slow Down"],
      [4809, "Ab-Soul feat. Kendrick Lamar — Illuminate"],
      [5089, "Travis Scott feat. 2 Chainz & T.I. — Upper Echelon"],
      [5260, "2 Chainz feat. Ty Dolla $ign, Trey Songz & Jhené Aiko — It’s a Vibe"],
      [5483, "Skeme — Millions"],
      [5726, "Mozzy feat. YG — Hoppin’ Out"],
      [5843, "The Game feat. 2 Chainz & Rick Ross — Ali Bomaye"],
      [6124, "Freddie Gibbs — Still Livin'"],
      [6342, "Danny Brown & Action Bronson — Bad News"],
      [6486, "DJ Esco feat. Future — How It Was"],
      [6730, "100s — Life of a Mack"],
      [6917, "Migos — Stir Fry"],
      [7144, "Kendrick Lamar — Swimming Pools"],
      [7362, "Dr. Dre feat. THURZ & Cocoa Sarai — Fallin Up"],
      [7595, "Mike Dean and Offset — So Fancy"],
      [7751, "A$AP Rocky feat. Aston Matthews & Joey Fatts — R-Cali"],
      [7893, "Mike Dean and Rich the Kid — Blue Cheese"],
      [8089, "Dr. Dre feat. Anderson .Paak, Snoop Dogg & Busta Rhymes — ETA"],
      [8331, "D-Block Europe & Offset — Chrome Hearts"],
      [8578, "French Montana feat. Kodak Black — Lockjaw"],
      [8808, "Danny Brown feat. A$AP Rocky & Zelooperz — Kush Coma"],
      [9063, "Hit-Boy feat. Dom Kennedy — XL"],
      [9333, "Polo G feat. Juice WRLD – Flex"],
      [9506, "A$AP Ferg — Work"],
      [9694, "Dr. Dre feat. Rick Ross & Anderson .Paak — The Scenic Route"],
      [9894, "Freddie Gibbs & Mike Dean — Sellin' Dope"],
      [10149, "NEZ feat. ScHoolboy Q — Let’s Get It"],
      [10325, "Problem feat. Glasses Malone — Say That Then"],
      [10498, "YG — I'm a Real 1"],
      [10680, "Future feat. The Weeknd — Low Life"],
      [11002, "Gucci Mane feat. Ciara — Too Hood"],
      [11230, "Problem & IamSu feat. Bad Lucc & Sage The Gemini — Do It Big"],
      [11439, "Future — Feed Me Dope"],
      [11617, "Freddie Gibbs feat. Pusha T & Kevin Cossom — Miami Vice"],
      [11852, "Dr. Dre — Black Privilege"],
      [12021, "Gucci Mane feat. Trouble — Everyday"],
      [12202, "Jay Rock feat. Kendrick Lamar — Hood Gone Love It"],
      [12475, "Roddy Ricch — The Box"],
      [12679, "Mount Westmore — Big Subwoofer"],
      [12950, "Jay Rock feat. Kendrick Lamar — Wow Freestyle"],
      [13124, "Dr. Dre feat. Eminem — Gospel"],
      [13337, "Freddie Gibbs feat. Juicy J — Pick the Phone Up"],
      [13568, "Cordae — Kung Fu"],
      [13777, "Miguel — Adorn"],
      [13988, "E-40 feat. Slim Thug & Bun B — That Candy Paint"],
      [14301, "Young Jeezy feat. Freddie Gibbs — Rough"]
    ]
  },
  {
    name: "West Coast Classics / GTA V",
    shortName: "West Coast Classics",
    note: "6 Hub Cut - Includes Deleted Songs",
    durationSeconds: 15512,
    intro: "./audio/west-coast-classics/intro.mp3",
    main: "./audio/west-coast-classics/main.mp3",
    songs: [
      [6, "The Conscious Daughters — We Roll Deep"],
      [235, "Obie Trice feat. Dr. Dre & Eminem — Shit Hits the Fan"],
      [537, "40 Glocc — Papa's Lil Soldier"],
      [752, "50 Cent feat. Mobb Deep — Outta Control"],
      [1003, "Compton's Most Wanted — Late Night Hype"],
      [1249, "Dr. Dre feat. Hittman, Six-Two, Nate Dogg & Kurupt — Xxplosive"],
      [1471, "Warren G — This D.J."],
      [1673, "Luniz feat. Michael Marshall — I Got 5 on It"],
      [1929, "Dr. Dre feat. Snoop Dogg, Kurupt & Nate Dogg — The Next Episode"],
      [2096, "Kausion feat. Ice Cube — What You Wanna Do?"],
      [2335, "Dr. Dre feat. Daz & Snoop Dogg — Lil' Ghetto Boy"],
      [2668, "The Lady of Rage feat. Snoop Dogg — Afro Puffs"],
      [2957, "Geto Boys — Mind Playing Tricks on Me"],
      [3235, "DJ Quik — Dollaz + Sense"],
      [3483, "Jay-Z — Trouble"],
      [3782, "Eazy-E feat. Ice Cube — No More ?'s"],
      [4014, "Ice Cube — You Know How We Do It"],
      [4234, "Dr. Dre feat. Snoop Dogg — Still D.R.E."],
      [4481, "Snoop Dogg — Gin and Juice"],
      [4707, "50 Cent — In da Club"],
      [4908, "Sam Sneed feat. Dr. Dre — U Better Recognize"],
      [5155, "Blackstreet feat. Dr. Dre & Queen Pen — No Diggity"],
      [5474, "Too $hort — So You Want to Be a Gangster"],
      [5666, "Bone Thugs-n-Harmony — 1st of tha Month"],
      [5955, "2Pac — Ambitionz az a Ridah"],
      [6240, "Ice Cube feat. Dr. Dre & MC Ren — Hello"],
      [6481, "MC Eiht — Streiht Up Menace"],
      [6711, "Dr. Dre — Keep Their Heads Ringin'"],
      [7026, "Mack 10 & Tha Dogg Pound — Nothin' But the Cavi Hit"],
      [7227, "N.W.A — Appetite for Destruction"],
      [7417, "2Pac feat. George Clinton — Can't C Me"],
      [7759, "Mary J. Blige — Family Affair"],
      [8038, "Tha Dogg Pound — What Would U Do?"],
      [8248, "E-40 feat. The Click — Captain Save a Hoe"],
      [8491, "Spice 1 feat. MC Eiht — The Murda Show"],
      [8719, "South Central Cartel — Servin' 'Em Heat"],
      [8978, "Westside Connection — Bow Down"],
      [9191, "N.W.A — Gangsta Gangsta"],
      [9422, "Truth Hurts feat. Rakim — Addictive"],
      [9658, "CPO feat. MC Ren — Ballad of a Menace"],
      [9930, "Kurupt — C-Walk"],
      [10170, "Nas feat. Dr. Dre — Nas Is Coming"],
      [10519, "King Tee — Played Like a Piano"],
      [10753, "2Pac feat. Roger Troutman & Dr. Dre — California Love"],
      [10994, "Jayo Felony — Sherm Stick"],
      [11181, "Spice 1 — 187 Proof"],
      [11402, "The D.O.C. feat. N.W.A — The Grand Finalé"],
      [11687, "MC Breed & DFC — Ain't No Future in Yo Frontin'"],
      [11930, "The Whoridas — Talkin' Bout Bank"],
      [12157, "DJ Pooh feat. Kam — Whoop! Whoop!"],
      [12447, "2Pac feat. K-Ci & JoJo — How Do U Want It"],
      [12693, "MC Ren — Ruthless for Life"],
      [12930, "Digital Underground feat. 2Pac — Same Song"],
      [13123, "Warren G feat. Nate Dogg — Regulate"],
      [13372, "Dr. Dre feat. Snoop Dogg, RBX & Jewell — Let Me Ride"],
      [13649, "Bone Thugs-n-Harmony — Mr. Bill Collector"],
      [13962, "Snoop Dogg feat. Goldie Loc — 20 Minutes"],
      [14168, "Too $hort — Money in the Ghetto"],
      [14517, "Nate Dogg — I Got Love"],
      [14757, "Ice Cube feat. Don Jagwarr — Wicked"],
      [14996, "Mack 10 feat. Ice Cube & WC — Westside Slaughterhouse"],
      [15303, "Thug Life — Pour Out a Little Liquor"]
    ]
  }
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const vibeSync = new VibeSync(client);

let connection;
let player;
let currentStationIndex = 0;
let statusMessageId = null;
let updateInterval = null;
let currentStationStartedAt = null;
let currentMode = "intro";
let volume = 0.35;
let paused = false;
let statusUpdating = false;
let transitionLock = false;

function formatTime(seconds) {
  seconds = Math.max(0, Math.floor(seconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function isMod(member) {
  return member.permissions.has(PermissionsBitField.Flags.ManageGuild) ||
    member.permissions.has(PermissionsBitField.Flags.ManageChannels);
}

function getCurrentStation() {
  return stations[currentStationIndex];
}

function getElapsedSeconds() {
  if (!currentStationStartedAt || currentMode !== "main") return 0;
  return Math.floor((Date.now() - currentStationStartedAt) / 1000);
}

function getCurrentSong(station) {
  if (currentMode !== "main") return "Station intro";

  const elapsed = getElapsedSeconds();
  let current = station.songs[0]?.[1] || "Unknown song";

  for (const [time, title] of station.songs) {
    if (elapsed >= time) current = title;
    else break;
  }

  return current;
}

function getNextSong(station) {
  if (currentMode !== "main") return station.songs[0]?.[1] || "First track";

  const elapsed = getElapsedSeconds();

  for (const [time, title] of station.songs) {
    if (time > elapsed) return title;
  }

  return "Next station";
}

function createFfmpegResource(args, label = "audio") {
  const ffmpeg = spawn(ffmpegPath, args, {
    stdio: ["ignore", "pipe", "pipe"]
  });

  ffmpeg.stderr.on("data", data => {
    const text = data.toString().trim();
    if (text) console.error(`FFmpeg ${label}:`, text);
  });

  ffmpeg.on("error", error => {
    console.error(`FFmpeg ${label} process error:`, error);
  });

  ffmpeg.on("close", code => {
    console.log(`FFmpeg ${label} exited with code ${code}`);
  });

  const resource = createAudioResource(ffmpeg.stdout, {
    inputType: StreamType.Raw,
    inlineVolume: true
  });

  resource.volume.setVolume(volume);
  return resource;
}

async function createStreamResource(url) {
  console.log(`Loading audio URL: ${url}`);

  const isRemote = url.startsWith("http://") || url.startsWith("https://");

  const args = [
    "-hide_banner",
    "-loglevel", "warning"
  ];

  if (isRemote) {
    args.push(
      "-reconnect", "1",
      "-reconnect_streamed", "1",
      "-reconnect_delay_max", "5",
      "-user_agent", "Mozilla/5.0"
    );
  }

  args.push(
    "-i", url,
    "-f", "s16le",
    "-ar", "48000",
    "-ac", "2",
    "pipe:1"
  );

  const resource = createFfmpegResource(args, "stream");

  console.log("Audio resource created.");
  return resource;
}

async function createTestToneResource() {
  console.log("Creating 10 second test tone.");

  const resource = createFfmpegResource([
    "-hide_banner",
    "-loglevel", "warning",
    "-f", "lavfi",
    "-i", "sine=frequency=440:duration=10",
    "-f", "s16le",
    "-ar", "48000",
    "-ac", "2",
    "pipe:1"
  ], "test tone");

  resource.volume.setVolume(1);

  console.log("Test tone resource created.");
  return resource;
}

async function setVoiceStatus(text) {
  try {
    await vibeSync.setVoiceStatus(VOICE_CHANNEL_ID, text.slice(0, 500));
    console.log("Voice channel status updated successfully");
  } catch (err) {
    console.log("Could not update voice channel status:", err.message);
  }
}

async function getOrCreateStatusMessage(channel, content) {
  if (statusMessageId) {
    const existing = await channel.messages.fetch(statusMessageId).catch(() => null);

    if (existing) {
      await existing.edit(content).catch(() => {});
      return existing;
    }
  }

  const recentMessages = await channel.messages.fetch({ limit: 25 }).catch(() => null);

  if (recentMessages) {
    const existingBotMessage = recentMessages.find(msg =>
      msg.author.id === client.user.id &&
      msg.content.includes("📻 **6 Hub 92.0**")
    );

    if (existingBotMessage) {
      statusMessageId = existingBotMessage.id;
      await existingBotMessage.edit(content).catch(() => {});
      return existingBotMessage;
    }
  }

  const sent = await channel.send(content).catch(() => null);

  if (sent) statusMessageId = sent.id;
  return sent;
}

async function updatePresenceAndStatus() {
  if (statusUpdating) return;
  statusUpdating = true;

  try {
    const station = getCurrentStation();
    const currentSong = getCurrentSong(station);
    const nextSong = getNextSong(station);
    const nextStation = stations[(currentStationIndex + 1) % stations.length];

    client.user.setActivity(`${station.shortName} • ${currentSong}`, {
      type: ActivityType.Listening
    });

    await setVoiceStatus(
      currentMode === "intro"
        ? `📻 ${station.shortName} intro`
        : `🎵 ${currentSong}`
    );

    if (!STATUS_CHANNEL_ID) return;

    const channel = await client.channels.fetch(STATUS_CHANNEL_ID).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    const elapsed = getElapsedSeconds();
    const remaining = currentMode === "main"
      ? station.durationSeconds - elapsed
      : 0;

    const stationLine = station.note
      ? `${station.name}\n_${station.note}_`
      : station.name;

    const timeLine = currentMode === "main"
      ? `\`${formatTime(elapsed)} elapsed\` • ends in **${formatTime(remaining)}**`
      : "`Station intro playing...`";

    const content =
`📻 **6 Hub 92.0**

━━━━━━━━━━━━━━━━━━━━

🎶 **Now Playing**
${currentMode === "intro" ? "**Station Intro**" : `**${currentSong}**`}

📡 **Station**
${stationLine}

⏱️ **Time**
${timeLine}

⏭️ **Next Song**
${nextSong}

🔁 **Next Station**
${nextStation.name}

━━━━━━━━━━━━━━━━━━━━
_24/7 radio broadcast_`;

    await getOrCreateStatusMessage(channel, content);
  } finally {
    statusUpdating = false;
  }
}

function startUpdates() {
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(updatePresenceAndStatus, 60 * 1000);
}

function stopUpdates() {
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = null;
}

async function safeTransition(callback) {
  if (transitionLock) return;

  transitionLock = true;

  try {
    await callback();
  } catch (error) {
    console.error("Transition failed:", error);
  } finally {
    setTimeout(() => {
      transitionLock = false;
    }, 1500);
  }
}

async function playIntro() {
  const station = getCurrentStation();

  currentMode = "intro";
  currentStationStartedAt = null;

  console.log(`Playing intro: ${station.name}`);

  const resource = await createStreamResource(station.intro);
  player.play(resource);

  await updatePresenceAndStatus();
  startUpdates();
}

async function playMain() {
  const station = getCurrentStation();

  currentMode = "main";
  currentStationStartedAt = Date.now();

  console.log(`Playing main: ${station.name}`);

  const resource = await createStreamResource(station.main);
  player.play(resource);

  await updatePresenceAndStatus();
  startUpdates();
}

async function playTestTone() {
  currentMode = "intro";
  currentStationStartedAt = null;

  console.log("Playing test tone.");

  const resource = await createTestToneResource();
  player.play(resource);

  await setVoiceStatus("🔊 Test tone playing");
}

async function playNextStation() {
  currentStationIndex = (currentStationIndex + 1) % stations.length;
  await playIntro();
}

async function playPreviousStation() {
  currentStationIndex = (currentStationIndex - 1 + stations.length) % stations.length;
  await playIntro();
}

async function jumpToStation(index) {
  if (index < 0 || index >= stations.length) return false;
  currentStationIndex = index;
  await playIntro();
  return true;
}

async function connectToRadio() {
  const guild = await client.guilds.fetch(GUILD_ID);
  const channel = await guild.channels.fetch(VOICE_CHANNEL_ID);

  if (!channel || !channel.isVoiceBased()) {
    console.log("Voice channel not found.");
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
    selfDeaf: false,
    selfMute: false
  });

  connection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, async () => {
    if (paused) return;

    await safeTransition(async () => {
      if (currentMode === "intro") {
        await playMain();
      } else {
        await playNextStation();
      }
    });
  });

  player.on("error", async error => {
    console.error("Audio error:", error);

    setTimeout(() => {
      safeTransition(async () => {
        if (currentMode === "intro") {
          await playMain();
        } else {
          await playNextStation();
        }
      });
    }, 3000);
  });

  connection.on(VoiceConnectionStatus.Disconnected, async () => {
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

  console.log(`Connected. Starting ${BOT_STATION_NAME}.`);
  await playIntro();
}

client.once("clientReady", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await connectToRadio();
});

client.on("messageCreate", async message => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith("!radio")) return;

  const args = message.content.trim().split(/\s+/);
  const command = args[1]?.toLowerCase();

  if (!command || command === "help") {
    return message.reply(
`**6 Hub 92.0 Mod Commands**

\`!radio now\` - Show current station/song
\`!radio list\` - Show station list
\`!radio skip\` - Skip to next station
\`!radio prev\` - Go to previous station
\`!radio station 1-5\` - Jump to a station
\`!radio restart\` - Restart current station
\`!radio pause\` - Pause audio
\`!radio resume\` - Resume audio
\`!radio volume 1-100\` - Set volume
\`!radio refresh\` - Refresh status message and VC status
\`!radio testtone\` - Play a 10 second test beep`
    );
  }

  if (command === "now") {
    const station = getCurrentStation();
    return message.reply(`📻 **${BOT_STATION_NAME}**\n**Station:** ${station.name}\n**Song:** ${getCurrentSong(station)}`);
  }

  if (!isMod(message.member)) {
    return message.reply("You need Manage Server or Manage Channels to control 6 Hub 92.0.");
  }

  if (command === "list") {
    return message.reply(stations.map((s, i) => `**${i + 1}.** ${s.name}`).join("\n"));
  }

  if (command === "skip" || command === "next") {
    await playNextStation();
    return message.reply("Skipped to the next station.");
  }

  if (command === "prev" || command === "previous") {
    await playPreviousStation();
    return message.reply("Went back to the previous station.");
  }

  if (command === "station") {
    const stationNumber = Number(args[2]);

    if (!stationNumber || stationNumber < 1 || stationNumber > stations.length) {
      return message.reply("Use `!radio station 1-5`.");
    }

    await jumpToStation(stationNumber - 1);
    return message.reply(`Switched to **${getCurrentStation().name}**.`);
  }

  if (command === "restart") {
    await playIntro();
    return message.reply("Restarted the current station.");
  }

  if (command === "pause") {
    paused = true;
    player.pause();
    stopUpdates();
    await setVoiceStatus("⏸️ Broadcast paused");
    return message.reply("Paused 6 Hub 92.0.");
  }

  if (command === "resume") {
    paused = false;
    player.unpause();
    startUpdates();
    await updatePresenceAndStatus();
    return message.reply("Resumed 6 Hub 92.0.");
  }

  if (command === "volume") {
    const newVolume = Number(args[2]);

    if (!newVolume || newVolume < 1 || newVolume > 100) {
      return message.reply("Use `!radio volume 1-100`.");
    }

    volume = newVolume / 100;

    try {
      player.state.resource.volume.setVolume(volume);
    } catch {}

    return message.reply(`Volume set to **${newVolume}%**.`);
  }

  if (command === "refresh") {
    await updatePresenceAndStatus();
    return message.reply("Refreshed status.");
  }

  if (command === "testtone") {
    await playTestTone();
    return message.reply("Playing a 10 second test tone. If you cannot hear this, the issue is Discord voice output/encryption, not the MP3 links.");
  }

  return message.reply("Unknown command. Use `!radio help`.");
});

client.login(TOKEN);
