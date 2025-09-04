const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  isJidBroadcast,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  AnyMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  MessageRetryMap,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const l = console.log;
const { getBuffer, getGroupAdmins, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, saveMessage } = require('./data');
const fs = require('fs');
const ff = require('fluent-ffmpeg');
const P = require('pino');
const config = require('./config');
const GroupEvents = require('./lib/groupevents');
const qrcode = require('qrcode-terminal');
const StickersTypes = require('wa-sticker-formatter');
const util = require('util');
const { sms, downloadMediaMessage, AntiDelete } = require('./lib');
const FileType = require('file-type');
const axios = require('axios');
const { File } = require('megajs');
const { fromBuffer } = require('file-type');
const bodyparser = require('body-parser');
const os = require('os');
const Crypto = require('crypto');
const path = require('path');
const prefix = config.PREFIX;

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

// === Session ===
if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
  if(!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!');
  const sessdata = config.SESSION_ID.replace("BUTTERFLY~XMD~", '');
  const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
  filer.download((err, data) => {
    if(err) throw err;
    fs.writeFileSync(__dirname + '/sessions/creds.json', data);
    console.log("Session downloaded ✅");
  });
}

// === Express Server ===
const express = require("express");
const app = express();
const port = process.env.PORT || 9090;
app.get("/", (req, res) => res.send("BUTTERFLY-XMD STARTED ✅"));
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

// === In-Memory Store ===
const store = makeInMemoryStore({ logger: P().child({ level: 'silent', stream: 'store' }) });

// === Connect to WhatsApp ===
async function connectToWA() {
  console.log("Connecting to WhatsApp ⏳️...");
  const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/');
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

  conn.ev.on('connection.update', async(update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) connectToWA();
    } else if (connection === 'open') {
      console.log('🧬 Installing Plugins');
      fs.readdirSync("./plugins/").forEach((plugin) => {
        if (path.extname(plugin).toLowerCase() === ".js") require("./plugins/" + plugin);
      });
      console.log('Plugins installed successfully ✅');
      console.log('BUTTERFLY-XMD CONNECTED ✅');
    }
  });

  conn.ev.on('creds.update', saveCreds);

  // Anti-Delete
  conn.ev.on('messages.update', async updates => {
    for (const update of updates) {
      if (update.update.message === null) await AntiDelete(conn, updates);
    }
  });

  // Group events
  conn.ev.on("group-participants.update", (update) => GroupEvents(conn, update));

  // Read messages / Status auto
  conn.ev.on('messages.upsert', async(m) => {
    let mek = m.messages[0];
    if (!mek.message) return;
    mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;

    if (config.READ_MESSAGE === 'true') await conn.readMessages([mek.key]);

    // Save message
    await saveMessage(mek);

    // Message wrapper
    const messageHandler = sms(conn, mek);
    // Other logic (commands, reactions, etc.)...
  });

  // === Util functions ===
  conn.decodeJid = jid => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server) ? decode.user + '@' + decode.server : jid;
    } else return jid;
  };

  conn.serializeM = mek => sms(conn, mek, store);

  // === Additional helper methods (sendFile, sendMedia, stickers, etc.) can be copied from your original script ===
}

setTimeout(connectToWA, 4000);
