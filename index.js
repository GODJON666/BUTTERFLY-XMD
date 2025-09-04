// === Imports ===
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers,
  makeInMemoryStore,
  getContentType,
  generateWAMessageFromContent,
  proto,
  downloadContentFromMessage
} = require('@whiskeysockets/baileys');

const l = console.log;
const { sms } = require('./lib/functions');
const { saveMessage } = require('./data');
const GroupEvents = require('./lib/groupevents');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const { File } = require('megajs');
const express = require("express");
const path = require("path");
const os = require("os");
const axios = require("axios");

// === Owner Numbers ===
const ownerNumber = ['50949100359', '50955928517', '243857465570', '243893024237'];

// === Temp Directory ===
const tempDir = path.join(os.tmpdir(), 'cache-temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
setInterval(() => {
  fs.readdir(tempDir, (err, files) => {
    if (err) return;
    for (const file of files) fs.unlinkSync(path.join(tempDir, file));
  });
}, 5 * 60 * 1000);

// === Session Mega ===
const sessionFilePath = path.join(__dirname, 'sessions', 'creds.json');
if (!fs.existsSync(sessionFilePath)) {
  if (!config.SESSION_ID || !config.SESSION_ID.includes("#")) {
    console.error("❌ SESSION_ID invalide ou manquante !");
    console.error("➡️ Ajoute un lien Mega complet dans config.env");
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
      let statusMsg = `
╭───〔 🤖 BUTTERFLY 〕───⬣
│ ߷ *Etat*       ➜ Connecté ✅
│ ߷ *Préfixe*    ➜ ${config.PREFIX}
│ ߷ *Mode*       ➜ ${config.MODE}
│ ߷ *Commandes*  ➜ 335
│ ߷ *Version*    ➜ 2.0.4
│ ߷ *Développeur*➜ JON TECH
╰──────────────⬣
      `;

      // envoie dans ton WhatsApp avec une image
      await conn.sendMessage(conn.user.id, { 
        image: { url: "https://files.catbox.moe/us666o.jpg" }, 
        caption: statusMsg 
      });
    }
  });

  conn.ev.on('creds.update', saveCreds);

  // === Group events ===
  conn.ev.on("group-participants.update", (update) => GroupEvents(conn, update));

  // === Messages handler ===
  conn.ev.on('messages.upsert', async (m) => {
    let mek = m.messages[0];
    if (!mek.message) return;
    mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;

    if (config.READ_MESSAGE === 'true') await conn.readMessages([mek.key]);
    await saveMessage(mek);

    sms(conn, mek);
  });

  // === Utils ===
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
