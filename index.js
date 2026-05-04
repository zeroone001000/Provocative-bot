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
    
    let effectiveStart = startNumber;
    if (previousTag) {
        const tagNumberMatch = previousTag.match(/(\d{1,3}(?:,\d{3})*|\d+)/);
        if (tagNumberMatch) {
            effectiveStart = parseInt(tagNumberMatch[0].replace(/,/g, '')) + 1;
        }
    }
    
    const extractDrops = (input) => {
        const drops = { "🌭": 0, "🍖": 0, "🦴": 0, "🐾": 0 };
        const regex = /(\d+)(🌭|🍖|🦴|🐾)/g;
        let match;
        while ((match = regex.exec(input)) !== null) {
            const count = parseInt(match[1]);
            const emoji = match[2];
            if (drops.hasOwnProperty(emoji)) {
                drops[emoji] += count;
            }
        }
        return drops;
    };

    const newDrops = extractDrops(newDropType);
    const oldDrops = previousTag ? extractDrops(previousTag) : { "🌭": 0, "🍖": 0, "🦴": 0, "🐾": 0 };
    
    const totalDrops = {
        "🌭": newDrops["🌭"] + oldDrops["🌭"],
        "🍖": newDrops["🍖"] + oldDrops["🍖"],
        "🦴": newDrops["🦴"] + oldDrops["🦴"],
        "🐾": newDrops["🐾"] + oldDrops["🐾"]
    };

    let combinedDropType = "";
    ["🌭", "🍖", "🦴", "🐾"].forEach(type => {
        if (totalDrops[type] > 0) {
            combinedDropType += `${totalDrops[type]}${type}`;
        }
    });

    const newValue = (newDrops["🌭"] * mults["🌭"]) + 
                     (newDrops["🍖"] * mults["🍖"]) + 
                     (newDrops["🦴"] * mults["🦴"]) + 
                     (newDrops["🐾"] * mults["🐾"]);
    
    const endingNumber = effectiveStart + newValue - 1;
    const partiesAdded = newValue;

    await channel.send(`ʚ💘ɞ「${endingNumber.toLocaleString()} ⋆ ${combinedDropType}」`);
    
    if (status === "perm" || status === "mini") {
        await channel.send(`૮(˶ᵔ ᴥᵔ)ა   ɪғ sᴇᴇɴ, ᴘʟᴇᴀsᴇ ʀᴇᴛᴜʀɴ\n  /づ  \\づ.. ⸝⸝ ♡ ⸝⸝ ᴛᴏ ᴘʀᴏᴠᴏᴄᴀᴛɪᴠᴇ.\n━═━═━ [💘] • ᴄᴏʟʟᴀʀ #${endingNumber.toLocaleString()}`);
    } else {
        await channel.send(`ɪғ sᴇᴇɴ, ᴘʟᴇᴀsᴇ ʀᴇᴛᴜʀɴ ᴛᴏ:\n૮(˶ᵔ ᴥᵔ)ა [💘] ${endingNumber.toLocaleString()} • ${combinedDropType}\n  /づ  \\づ.. ⸝⸝ ♡ ᴘʀᴏᴠᴏᴄᴀᴛɪᴠᴇ\n━═━═━═━═━═━═━═`);
    }
    await channel.send(`**Parties Added: ${partiesAdded}**`);
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const content = message.content;
    const userId = message.author.id;

    // Pattern matches status (member/mini/perm), then looks for split parts regardless of separators
    const statusMatch = content.match(/\b(member|mini|perm)\b/i);
    
    if (statusMatch) {
        const status = statusMatch[1].toLowerCase();
        // Remove the status from content to find other components
        const remaining = content.replace(statusMatch[0], '');
        const parts = remaining.split(/[|*]+|\s+/).filter(p => p.trim() !== '');

        let startNumber = null;
        let newDropType = "";
        let previousTag = "";

        parts.forEach(part => {
            part = part.trim();
            // If it's a number (digits with optional comma)
            if (/^\d{1,3}(?:,\d{3})*|\d+$/.test(part)) {
                startNumber = parseInt(part.replace(/,/g, ''));
            } 
            // If it looks like a tag (contains ʚ or ⋆)
            else if (part.includes('ʚ') || part.includes('⋆')) {
                previousTag = part;
            } 
            // Otherwise treat as drop
            else {
                newDropType = part;
            }
        });

        if (startNumber !== null && newDropType !== "") {
            return await processCalculation(message.channel, status, startNumber, newDropType, previousTag);
        }
    }

    if (['member', 'mini', 'perm'].includes(content.toLowerCase())) {
        userState.set(userId, { step: 'waiting_for_number', status: content.toLowerCase() });
        return message.reply("Please provide the Starting Party Number:");
    }

    if (userState.has(userId)) {
        const state = userState.get(userId);
        if (state.step === 'waiting_for_number') {
            const val = parseInt(content.replace(/,/g, ''));
            if (isNaN(val)) return message.reply("Invalid number.");
            state.startNumber = val;
            state.step = 'waiting_for_drop';
            return message.reply("Please provide the Drop Type (and previous tag if stacking):");
        }
        if (state.step === 'waiting_for_drop') {
            const parts = content.split(/[|*]+|\s+/);
            const drop = parts.find(p => !p.includes('ʚ') && !p.includes('⋆'));
            const tag = parts.find(p => p.includes('ʚ') || p.includes('⋆')) || "";
            await processCalculation(message.channel, state.status, state.startNumber, drop || "", tag);
            userState.delete(userId);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
