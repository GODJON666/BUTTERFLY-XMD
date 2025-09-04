// === Imports ===
const fs = require('fs');
const path = require('path');
const os = require('os');
const express = require("express");
const { File } = require('megajs');
const P = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers,
  makeInMemoryStore,
  getContentType
} = require('@whiskeysockets/baileys');

const config = require('./config');
const { sms } = require('./lib/functions');
const GroupEvents = require('./lib/groupevents');
const { saveMessage } = require('./data');

// === Owner Numbers ===
const ownerNumber = ['50949100359', '50955928517', '243857465570', '243893024237'];

// === Temp Directory ===
const tempDir = path.join(os.tmpdir(), 'cache-temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
const clearTempDir = () => {
  fs.readdir(tempDir, (err, files) => {
    if (err) throw err;
    for (const file of files) fs.unlinkSync(path.join(tempDir, file));
  });
};
setInterval(clearTempDir, 5 * 60 * 1000);

// === Session Mega ===
const sessionFilePath = path.join(__dirname, 'sessions', 'creds.json');
if (!fs.existsSync(sessionFilePath)) {
  if (!config.SESSION_ID || !config.SESSION_ID.includes("#")) {
    console.error("\x1b[31m%s\x1b[0m", "❌ SESSION_ID invalide ou manquante !");
    console.error("\x1b[33m%s\x1b[0m", "Définissez un lien Mega complet avec le hash dans config.env :");
    console.error("\x1b[36m%s\x1b[0m", "SESSION_ID=https://mega.nz/file/EXAMPLE#HASH");
    process.exit(1);
  }
  const sessdata = config.SESSION_ID.replace("BUTTERFLY~XMD~", '');
  const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
  filer.download((err, data) => {
    if (err) throw err;
    fs.mkdirSync(path.join(__dirname, 'sessions'), { recursive: true });
    fs.writeFileSync(sessionFilePath, data);
    console.log("Session téléchargée ✅");
  });
}

// === Express Server ===
const app = express();
const port = process.env.PORT || 9090;
app.get("/", (req, res) => res.send("BUTTERFLY-XMD STARTED ✅"));
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

// === In-Memory Store ===
const store = makeInMemoryStore({ logger: P().child({ level: 'silent', stream: 'store' }) });

// === Connect to WhatsApp ===
async function connectToWA() {
  console.log("Connecting to WhatsApp ⏳️...");
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'sessions'));
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    syncFullHistory: true,
    auth: state,
    version
  });

  store.bind(conn.ev);

  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) connectToWA();
    } else if (connection === 'open') {
      // === Plugins ===
      fs.readdirSync("./plugins/").forEach((plugin) => {
        if (path.extname(plugin).toLowerCase() === ".js") require("./plugins/" + plugin);
      });
      console.log('Plugins installed successfully ✅');
      console.log('BUTTERFLY-XMD CONNECTED ✅');

      // === Message stylisé ===
      console.log(`
╭───〔 🤖 𝑩𝑻𝑭 𝘽𝙊𝙏 〕───⬣
│ ߷ *Etat*       ➜ Connecté ✅
│ ߷ *Préfixe*    ➜ ${config.PREFIX}
│ ߷ *Mode*       ➜ ${config.MODE}
│ ߷ *Commandes*  ➜ 335
│ ߷ *Version*    ➜ 2.0.4
│ ߷ *Développeur*➜ JON
╰──────────────⬣
      `);
    }
  });

  conn.ev.on('creds.update', saveCreds);

  // === Anti-Delete ===
  conn.ev.on('messages.update', async updates => {
    for (const update of updates) {
      if (update.update.message === null) {
        // ici tu peux appeler ta fonction AntiDelete
      }
    }
  });

  // === Group events ===
  conn.ev.on("group-participants.update", (update) => GroupEvents(conn, update));

  // === Read messages / Status auto ===
  conn.ev.on('messages.upsert', async (m) => {
    let mek = m.messages[0];
    if (!mek.message) return;
    mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;

    if (config.READ_MESSAGE === 'true') await conn.readMessages([mek.key]);
    await saveMessage(mek);

    // Ici tu peux ajouter le handler pour les commandes
    sms(conn, mek);
  });

  // === Utilitaires ===
  conn.decodeJid = jid => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server) ? decode.user + '@' + decode.server : jid;
    } else return jid;
  };

  conn.serializeM = mek => sms(conn, mek, store);
}

// === Lancement ===
setTimeout(connectToWA, 4000);
