const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const userState = new Map();
const multipliers = {
    member: { "🌭": 65, "🍖": 30, "🦴": 65, "🐾": 13 },
    mini:   { "🌭": 67, "🍖": 33, "🦴": 67, "🐾": 13 },
    perm:   { "🌭": 70, "🍖": 35, "🦴": 70, "🐾": 13 }
};

// Helper function to handle calculation and messaging
async function processCalculation(channel, status, startNumber, dropType) {
    const mults = multipliers[status];
    const getDrops = (type) => {
        const regex = new RegExp(`(\\d+)${type}`);
        const match = dropType.match(regex);
        return match ? parseInt(match[1]) : 0;
    };

    const totalDrops = (getDrops("🌭") * mults["🌭"]) + (getDrops("🍖") * mults["🍖"]) + 
                       (getDrops("🦴") * mults["🦴"]) + (getDrops("🐾") * mults["🐾"]);
    
    const endingNumber = startNumber - 1 + totalDrops;

    await channel.send(`ʚ💘ɞ「${endingNumber.toLocaleString()} ⋆ ${dropType}」`);
    
    if (status === "perm" || status === "mini") {
        await channel.send(`૮(˶ᵔ ᴥᵔ)ა   ɪғ sᴇᴇɴ, ᴘʟᴇᴀsᴇ ʀᴇᴛᴜʀɴ\n  /づ  \\づ.. ⸝⸝ ♡ ⸝⸝ ᴛᴏ ᴘʀᴏᴠᴏᴄᴀᴛɪᴠᴇ.\n━═━═━ [💘] • ᴄᴏʟʟᴀʀ #${endingNumber.toLocaleString()}`);
    } else {
        await channel.send(`ɪғ sᴇᴇɴ, ᴘʟᴇᴀsᴇ ʀᴇᴛᴜʀɴ ᴛᴏ:\n૮(˶ᵔ ᴥᵔ)ა [💘] ${endingNumber.toLocaleString()} • ${dropType}\n  /づ  \\づ.. ⸝⸝ ♡ ᴘʀᴏᴠᴏᴄᴀᴛɪᴠᴇ\n━═━═━═━═━═━═━═`);
    }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const content = message.content.toLowerCase();
    const parts = message.content.split(/\s+/);
    const userId = message.author.id;

    // --- QUICK MODE: "member 100 2🌭1🍖" ---
    if (parts.length >= 3 && ['member', 'mini', 'perm'].includes(parts[0].toLowerCase())) {
        return await processCalculation(message.channel, parts[0].toLowerCase(), parseInt(parts[1]), parts[2]);
    }

    // --- STEP-BY-STEP MODE ---
    if (['member', 'mini', 'perm'].includes(content)) {
        userState.set(userId, { step: 'waiting_for_number', status: content });
        return message.reply("Please provide the Starting Party Number:");
    }

    if (userState.has(userId)) {
        const state = userState.get(userId);
        
        if (state.step === 'waiting_for_number') {
            state.startNumber = parseInt(content);
            state.step = 'waiting_for_drop';
            return message.reply("Please provide the Drop Type:");
        }

        if (state.step === 'waiting_for_drop') {
            await processCalculation(message.channel, state.status, state.startNumber, content);
            userState.delete(userId);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
