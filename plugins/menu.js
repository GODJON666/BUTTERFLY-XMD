const config = require('../config');
const { cmd, commands } = require('../command');

const delay = ms => new Promise(res => setTimeout(res, ms));

cmd({
  pattern: "menu",
  alias: ["allmenu", "BUTTERFLY", "Butterfly", "🦋"],
  use: '.menu',
  desc: "Show all bot commands",
  category: "menu",
  react: "🦋",
  filename: __filename
},
async (conn, mek, m, { from, reply }) => {
  try {
    const loadingSteps = [
      "🦋10%",
      "🦋30%",
      "🦋50%",
      "🦋80%",
      "🦋100%",
      "🦋 BUTTERFLY 16 Loading ..."
    ];

    // Animation loading (nouveaux messages)
    for (let i = 0; i < loadingSteps.length; i++) {
      await delay(800);
      await conn.sendMessage(from, { text: loadingSteps[i] }, { quoted: mek });
    }

    // Préparer infos
    const totalCommands = commands.length;
    const uptime = () => {
      let sec = process.uptime();
      let h = Math.floor(sec / 3600);
      let m = Math.floor((sec % 3600) / 60);
      let s = Math.floor(sec % 60);
      return `${h}h ${m}m ${s}s`;
    };

    let menuText = `
╭━━━〔 *𝐁𝐔𝐓𝐓𝐄𝐑𝐅𝐋𝐘-16* 〕━━╮
┃ ✦ ᴀᴜᴛʜᴏʀ : @${m.sender.split("@")[0]}
┃ ✦ ʀᴜɴᴛɪᴍᴇ : ${uptime()}
┃ ✦ ᴍᴏᴅᴇ : *${config.MODE}*
┃ ✦ ᴘʀᴇғɪx : [${config.PREFIX}]
┃ ✦ ᴄᴍᴅs : ${totalCommands}
┃ ✦ ᴅᴇᴠ : *ᴍᴇᴄ ɪᴅᴇᴀʟ*
┃ ✦ ᴠᴇʀ : *1.0.0*
╰━━━━━━━━━━━━━━━━━╯

╭──〔 *WELCOME TO* 〕──╮
│ *♛ BUTTERFLY 16bXMD ♛*
╰─────────────────╯
`;

    // Organiser les commandes par catégories
    let category = {};
    for (let c of commands) {
      if (!c.category) continue;
      if (!category[c.category]) category[c.category] = [];
      category[c.category].push(c);
    }

    const keys = Object.keys(category).sort();
    for (let k of keys) {
      menuText += `\n\n╭───〔 *${k.toUpperCase()} MENU* 〕───╮`;
      const cmds = category[k].filter(c => c.pattern).sort((a, b) => a.pattern.localeCompare(b.pattern));
      cmds.forEach((c) => {
        const usage = c.pattern.split('|')[0];
        menuText += `\n│ ✧ 🦋 ${config.PREFIX}${usage}`;
      });
      menuText += `\n╰──────────────────╯`;
    }

    // Envoie final avec image
    await conn.sendMessage(from, {
      image: { url: 'https://files.catbox.moe/3gitrg.jpg' },
      caption: menuText,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363419247130022@newsletter',
          newsletterName: config.OWNER_NAME || 'BUTTERFLY 16 MD',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply(`❌ Error: ${e.message}`);
  }
});
