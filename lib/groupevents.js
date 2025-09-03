//Give Me Credit If Using This File Give Me Credit On Your Channel ✅ 
// Credits Dev Raheem-cm - BUTTERFLY-XMD💜 

const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../config');

const getContextInfo = (m) => {
    return {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363419247130022@newsletter',
            newsletterName: 'BUTTERFLY-XMD',
            serverMessageId: 143,
        },
    };
};

const ppUrls = [
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
];

const GroupEvents = async (conn, update) => {
    try {
        const isGroup = isJidGroup(update.id);
        if (!isGroup) return;

        const metadata = await conn.groupMetadata(update.id);
        const participants = update.participants;
        const desc = metadata.desc || "No Description";
        const groupMembersCount = metadata.participants.length;

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(update.id, 'image');
        } catch {
            ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)];
        }

        for (const num of participants) {
            const userName = num.split("@")[0];
            const timestamp = new Date().toLocaleString();

            if (update.action === "add" && config.WELCOME === "true") {
                const WelcomeText = `╭╼━≪•🦋 𝙽𝙴𝚆 𝙱𝚄𝚃𝚃𝙴𝚁𝙵𝙻𝚈 𝙰𝚁𝚁𝙸𝚅𝙴𝚂 •≫━╾╮
┃𝚆𝙴𝙻𝙲𝙾𝙼𝙴: @${userName} 👋   
┃𝙳𝙴𝚅𝚂: MEC IDEAL JON SNOW BLACK GOKU KAEL NOCTURNE     
┃𝙼𝙴𝙼𝙱𝙴𝚁 #: #{groupMembersCount}  
┃⏰ 𝙹𝙾𝙸𝙽𝙴𝙳 𝙰𝚃: ${timestamp}  
╰━━━━━━━━━━━━━━━━━━━━╯  
*🦋 𝙵𝙻𝚈 𝚆𝙸𝚃𝙷 𝚄𝚂 𝙾𝚁 𝙵𝙰𝙳𝙴 𝙸𝙽 𝚃𝙷𝙴 𝙳𝚄𝚂𝚃.*
${desc}
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ JON SNOW*`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: WelcomeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "remove" && config.WELCOME === "true") {
                const GoodbyeText = `╔══❖•ೋ°🕯️°ೋ•❖══╗  
👤 𝙼𝙴𝙼𝙱𝙴𝚁 𝙵𝙰𝙳𝙴𝙳 𝙰𝚆𝙰𝚈...  
➤ 𝙽𝙰𝙼𝙴: @${userName}  
➤ 𝙼𝙴𝙼𝙱𝙴𝚁 #: #{groupMembersCount}  
➤ 𝚃𝙸𝙼𝙴: ${timestamp}  
✘ 𝙴𝚇𝙸𝚃 𝙱𝚈 𝙲𝙷𝙾𝙸𝙲𝙴 𝙾𝚁 𝙵𝙰𝚃𝙴  
╚══❖•ೋ°🕯️°ೋ•❖══╝  
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ JON SNOW*`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: GoodbyeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "demote" && config.ADMIN_EVENTS === "true") {
                const demoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `╭╼⪨ butterfly-𝙲𝙰𝙻𝙻𝙴𝙳 ⪩╾╮
┃@${𝚍𝚎𝚖𝚘𝚝𝚎𝚛} 𝙷𝙰𝚂 𝙳𝙴𝙼𝙾𝚃𝙴𝙳 @${𝚞𝚜𝚎𝚛𝙽𝚊𝚖𝚎} 𝙵𝚁𝙾𝙼 𝙰𝙳𝙼𝙸𝙽.
┃⏰ 𝚃𝙸𝙼𝙴: ${𝚝𝚒𝚖𝚎𝚜𝚝𝚊𝚖𝚙}
┃👥 𝙶𝚁𝙾𝚄𝙿: ${𝚖𝚎𝚝𝚊𝚍𝚊𝚝𝚊.𝚜𝚞𝚋𝚓𝚎𝚌𝚝}
╰─────────────────╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴇᴠ JON SNOW*`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });

            } else if (update.action === "promote" && config.ADMIN_EVENTS === "true") {
                const promoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `╭╼⪨ BUTTERFLY-𝙰𝙿𝙿𝙾𝙸𝙽𝚃 ⪩╾╮
┃@${promoter} 𝙷𝙰𝚂 𝙿𝚁𝙾𝙼𝙾𝚃𝙴𝙳 @${userName} 𝚃𝙾 𝙰𝙳𝙼𝙸𝙽.
┃⏰ 𝚃𝙸𝙼𝙴: ${timestamp}*
┃👥 𝙶𝚁𝙾𝚄𝙿: ${metadata.subject}
╰─────────────────╯
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ BUTTERFLY*`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;
