const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const multipliers = {
    member: { "🌭": 65, "🍖": 30, "🦴": 65, "🐾": 13 },
    mini:   { "🌭": 67, "🍖": 33, "🦴": 67, "🐾": 13 },
    perm:   { "🌭": 70, "🍖": 35, "🦴": 70, "🐾": 13 }
};

async function processCalculation(channel, status, startNumber, dropString) {
    const mults = multipliers[status];
    
    // Extract drops from the combined string (e.g., "1🌭1🐾")
    const drops = { "🌭": 0, "🍖": 0, "🦴": 0, "🐾": 0 };
    const regex = /(\d+)(🌭|🍖|🦴|🐾)/g;
    let match;
    while ((match = regex.exec(dropString)) !== null) {
        const count = parseInt(match[1]);
        const emoji = match[2];
        if (drops.hasOwnProperty(emoji)) drops[emoji] += count;
    }

    const newValue = (drops["🌭"] * mults["🌭"]) + 
                     (drops["🍖"] * mults["🍖"]) + 
                     (drops["🦴"] * mults["🦴"]) + 
                     (drops["🐾"] * mults["🐾"]);
    
    const endingNumber = startNumber + newValue - 1;
    const combinedDropType = Object.entries(drops)
        .filter(([_, count]) => count > 0)
        .map(([emoji, count]) => `${count}${emoji}`)
        .join('');

    await channel.send(`ʚ💘ɞ「${endingNumber.toLocaleString()} ⋆ ${combinedDropType}」`);
    
    if (status === "perm" || status === "mini") {
        await channel.send(`૮(˶ᵔ ᴥᵔ)ა   ɪғ sᴇᴇɴ, ᴘʟᴇᴀsᴇ ʀᴇᴛᴜʀɴ\n  /づ  \\づ.. ⸝⸝ ♡ ⸝⸝ ᴛᴏ ᴘʀᴏᴠᴏᴄᴀᴛɪᴠᴇ.\n━═━═━ [💘] • ᴄᴏʟʟᴀʀ #${endingNumber.toLocaleString()}`);
    } else {
        await channel.send(`ɪғ sᴇᴇɴ, ᴘʟᴇᴀsᴇ ʀᴇᴛᴜʀɴ ᴛᴏ:\n૮(˶ᵔ ᴥᵔ)ა [💘] ${endingNumber.toLocaleString()} • ${combinedDropType}\n  /づ  \\づ.. ⸝⸝ ♡ ᴘʀᴏᴠᴏᴄᴀᴛɪᴠᴇ\n━═━═━═━═━═━═━═`);
    }
    await channel.send(`**Parties Added: ${newValue}**`);
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    // 1. Identify Status (member/mini/perm)
    const statusMatch = message.content.match(/member|mini|perm/i);
    if (!statusMatch) return;
    const status = statusMatch[0].toLowerCase();

    // 2. Identify all numbers
    const allNumbers = message.content.match(/\d{1,3}(?:,\d{3})*|\d+/g)?.map(n => parseInt(n.replace(/,/g, ''))) || [];
    
    // 3. Identify all drops (e.g., 1🌭)
    const dropMatches = message.content.match(/\d+(🌭|🍖|🦴|🐾)/g) || [];

    // Simple heuristic: The start number is usually the largest one
    const startNumber = allNumbers.length > 0 ? Math.max(...allNumbers) : null;
    const dropString = dropMatches.join('');

    if (status && startNumber && dropString) {
        await processCalculation(message.channel, status, startNumber, dropString);
    }
});

client.login(process.env.DISCORD_TOKEN);
