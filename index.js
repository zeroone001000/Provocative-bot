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
    
    const extractDrops = (input) => {
        const drops = { "🌭": 0, "🍖": 0, "🦴": 0, "🐾": 0 };
        const regex = /(\d+)(🌭|🍖|🦴|🐾)?/g;
        let match;
        while ((match = regex.exec(input)) !== null) {
            const count = parseInt(match[1]);
            const emoji = match[2] || "🌭";
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
    
    const endingNumber = startNumber + newValue - 1;
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
    const userId = message.author.id;
    
    const match = message.content.match(/^(\w+)\s+(\d{1,3}(?:,\d{3})*|\d+)\s+([^\s]+)(.*)/i);
    if (match) {
        const status = match[1].toLowerCase();
        if (['member', 'mini', 'perm'].includes(status)) {
            const startNumber = parseInt(match[2].replace(/,/g, ''));
            const newDropType = match[3];
            const previousTag = match[4].trim();
            return await processCalculation(message.channel, status, startNumber, newDropType, previousTag);
        }
    }

    if (['member', 'mini', 'perm'].includes(message.content.toLowerCase())) {
        userState.set(userId, { step: 'waiting_for_number', status: message.content.toLowerCase() });
        return message.reply("Please provide the Starting Party Number:");
    }

    if (userState.has(userId)) {
        const state = userState.get(userId);
        if (state.step === 'waiting_for_number') {
            const val = parseInt(message.content.replace(/,/g, ''));
            if (isNaN(val)) return message.reply("Invalid number.");
            state.startNumber = val;
            state.step = 'waiting_for_drop';
            return message.reply("Please provide the Drop Type (and previous tag if stacking):");
        }
        if (state.step === 'waiting_for_drop') {
            const parts = message.content.split(/\s+/);
            await processCalculation(message.channel, state.status, state.startNumber, parts[0], parts.slice(1).join(' '));
            userState.delete(userId);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
