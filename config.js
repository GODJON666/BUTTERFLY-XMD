const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

// Vérification du SESSION_ID
const SESSION_ID = process.env.SESSION_ID || "";
if (!SESSION_ID || !SESSION_ID.includes("#")) {
    console.error("\x1b[31m%s\x1b[0m", "❌ SESSION_ID invalide ou manquante !"); 
    console.error("\x1b[33m%s\x1b[0m", "Veuillez définir un lien Mega complet avec le hash dans config.env :");
    console.error("\x1b[36m%s\x1b[0m", "SESSION_ID=https://mega.nz/file/EXAMPLE#HASH");
    process.exit(1); // Stop le bot pour éviter l'erreur megajs
}

module.exports = {
    SESSION_ID,
    AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "false",
    AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
    AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "false",
    AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "*sᴇᴇɴ ʏᴏᴜʀ sᴛᴀᴛᴜs ʙʏ butterfly xmd👑*",
    WELCOME: process.env.WELCOME || "false",
    ADMIN_EVENTS: process.env.ADMIN_EVENTS || "false",
    ANTI_LINK: process.env.ANTI_LINK || "false",
    MENTION_REPLY: process.env.MENTION_REPLY || "false",
    MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || "https://files.catbox.moe/us666o.jpg",
    PREFIX: process.env.PREFIX || ".",
    BOT_NAME: process.env.BOT_NAME || "buttefly xmd",
    STICKER_NAME: process.env.STICKER_NAME || `𝗟𝗘𝗦 𝗣𝗘𝗧𝗜𝗧𝗦 𝗣𝗔𝗣𝗜𝗟𝗟𝗢𝗡𝗦 𝗡𝗘 𝗙𝗢𝗡𝗧 𝗣𝗔𝗦 𝗗𝗘 𝗕𝗥𝗨𝗜𝗧...`,
    CUSTOM_REACT: process.env.CUSTOM_REACT || "false",
    CUSTOM_REACT_EMOJIS: process.env.CUSTOM_REACT_EMOJIS || "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍",
    DELETE_LINKS: process.env.DELETE_LINKS || "true",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "50949100359, 50955928517, 243857465570, 243893024237",
    OWNER_NAME: process.env.OWNER_NAME || "BUTTERFLY",
    DESCRIPTION: process.env.DESCRIPTION || "*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ jon tech*",
    ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/us666o.jpg",
    LIVE_MSG: process.env.LIVE_MSG || "> * ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ butterfly xmd*❄️",
    READ_MESSAGE: process.env.READ_MESSAGE || "false",
    AUTO_REACT: process.env.AUTO_REACT || "false",
    ANTI_BAD: process.env.ANTI_BAD || "false",
    MODE: process.env.MODE || "public",
    ANTI_LINK_KICK: process.env.ANTI_LINK_KICK || "false",
    AUTO_VOICE: process.env.AUTO_VOICE || "false",
    AUTO_STICKER: process.env.AUTO_STICKER || "false",
    AUTO_REPLY: process.env.AUTO_REPLY || "false",
    ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "true",
    PUBLIC_MODE: process.env.PUBLIC_MODE || "false",
    AUTO_TYPING: process.env.AUTO_TYPING || "false",
    READ_CMD: process.env.READ_CMD || "false",
    DEV: process.env.DEV || "50949100359, 50955928517, 243857465570, 243893024237",
    ANTI_VV: process.env.ANTI_VV || "true",
    ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "log",
    AUTO_RECORDING: process.env.AUTO_RECORDING || "false"
};
