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
    
    // 1. Combine Drop Types (extract only the text part from old tag)
    let combinedDropType = newDropType;
    if (previousTag) {
        // Look for content after ⋆ and before 」
        const oldDropsMatch = previousTag.match(/⋆\s*(.+?)」/);
        if (oldDropsMatch) {
            // Take the old text and add the new one
            combinedDropType = oldDropsMatch[1] + newDropType;
        }
    }

    // 2. Calculate sum of drops based ONLY on the NEW drop provided
    // We only want to add the value of the NEW drop to the starting number
    const getDrops = (type, dropString) => {
        const regex = new RegExp(`(\\d+)${type}`, 'g');
        let total = 0;
        let match;
        while ((match = regex.exec(dropString)) !== null) {
            total += parseInt(match[1]);
        }
        return total;
    };

    // Calculate value based on the NEW drop only
    const newValue = (getDrops("🌭", newDropType) * mults["🌭"]) + 
                     (getDrops("🍖", newDropType) * mults["🍖"]) + 
                     (getDrops("🦴", newDropType) * mults["🦴"]) + 
                     (getDrops("🐾", newDropType) * mults["🐾"]);
    
    const endingNumber = startNumber + newValue;
    const partiesAdded = endingNumber - startNumber;

    // 3. Output
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
    const parts = content.split(/\s+/);
    const cmd = parts[0].toLowerCase();

    // QUICK MODE: Member 30006 1🦴 ʚ💘ɞ「30,005 ⋆ 1🌭」
    if (parts.length >= 3 && ['member', 'mini', 'perm'].includes(cmd)) {
        const startNumber = parseInt(parts[1].replace(/,/g, ''));
        const newDropType = parts[2];
        const previousTag = parts.slice(3).join(' ');
        return await processCalculation(message.channel, cmd, startNumber, newDropType, previousTag);
    }

    // STEP-BY-STEP MODE
    if (['member', 'mini', 'perm'].includes(content.toLowerCase())) {
        userState.set(userId, { step: 'waiting_for_number', status: content.toLowerCase() });
        return message.reply("Please provide the Starting Party Number:");
    }

    if (userState.has(userId)) {
        const state = userState.get(userId);
        if (state.step === 'waiting_for_number') {
            state.startNumber = parseInt(content.replace(/,/g, ''));
            state.step = 'waiting_for_drop';
            return message.reply("Please provide the Drop Type (and previous tag if stacking):");
        }
        if (state.step === 'waiting_for_drop') {
            const dropParts = content.split(/\s+/);
            await processCalculation(message.channel, state.status, state.startNumber, dropParts[0], dropParts.slice(1).join(' '));
            userState.delete(userId);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
