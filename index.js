const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const userState = new Map();
const multipliers = {
    member: { "🌭": 65, "🍖": 30, "🦴": 65, "🐾": 13 },
    mini:   { "🌭": 67, "🍖": 33, "🦴": 67, "🐾": 13 },
    perm:   { "🌭": 70, "🍖": 35, "🦴": 70, "🐾": 13 }
};

async function processCalculation(channel, status, startNumber, newDropType, previousTag = null) {
    const mults = multipliers[status];
    
    // 1. Combine Drop Types
    let combinedDropType = newDropType;
    if (previousTag) {
        // Extract drops from previous tag (e.g., "1🌭" from "30,070 ⋆ 1🌭")
        const oldDropsMatch = previousTag.match(/⋆\s*(.+?)」/);
        if (oldDropsMatch) {
            combinedDropType = oldDropsMatch[1] + newDropType;
        }
    }

    // 2. Helper to calculate drops
    const getDrops = (type, dropString) => {
        const regex = new RegExp(`(\\d+)${type}`, 'g');
        let total = 0;
        let match;
        while ((match = regex.exec(dropString)) !== null) {
            total += parseInt(match[1]);
        }
        return total;
    };

    const totalDropsValue = (getDrops("🌭", combinedDropType) * mults["🌭"]) + 
                            (getDrops("🍖", combinedDropType) * mults["🍖"]) + 
                            (getDrops("🦴", combinedDropType) * mults["🦴"]) + 
                            (getDrops("🐾", combinedDropType) * mults["🐾"]);
    
    const endingNumber = startNumber - 1 + totalDropsValue;
    const partiesAdded = endingNumber - startNumber + 1;

    // 3. Send Tag
    await channel.send(`ʚ💘ɞ「${endingNumber.toLocaleString()} ⋆ ${combinedDropType}」`);
    
    // 4. Send MP
    if (status === "perm" || status === "mini") {
        await channel.send(`૮(˶ᵔ ᴥᵔ)ა   ɪғ sᴇᴇɴ, ᴘʟᴇᴀsᴇ ʀᴇᴛᴜʀɴ\n  /づ  \\づ.. ⸝⸝ ♡ ⸝⸝ ᴛᴏ ᴘʀᴏᴠᴏᴄᴀᴛɪᴠᴇ.\n━═━═━ [💘] • ᴄᴏʟʟᴀʀ #${endingNumber.toLocaleString()}`);
    } else {
        await channel.send(`ɪғ sᴇᴇɴ, ᴘʟᴇᴀsᴇ ʀᴇᴛᴜʀɴ ᴛᴏ:\n૮(˶ᵔ ᴥᵔ)ა [💘] ${endingNumber.toLocaleString()} • ${combinedDropType}\n  /づ  \\づ.. ⸝⸝ ♡ ᴘʀᴏᴠᴏᴄᴀᴛɪᴠᴇ\n━═━═━═━═━═━═━═`);
    }

    // 5. Parties added
    await channel.send(`**Parties Added: ${partiesAdded}**`);
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const content = message.content;
    const parts = content.split(/\s+/);
    const userId = message.author.id;

    // QUICK MODE: "Member 30006 1🦴 ʚ💘ɞ「30,006 ⋆ 1🌭」"
    if (parts.length >= 3 && ['member', 'mini', 'perm'].includes(parts[0].toLowerCase())) {
        const status = parts[0].toLowerCase();
        const startNumber = parseInt(parts[1].replace(/,/g, ''));
        const newDropType = parts[2];
        const previousTag = parts.slice(3).join(' ');

        return await processCalculation(message.channel, status, startNumber, newDropType, previousTag);
    }
    
    // (Keep your existing step-by-step logic here if needed)
});

client.login(process.env.DISCORD_TOKEN);
