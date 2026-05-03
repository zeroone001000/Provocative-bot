const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const userState = new Map(); // Stores: { userId: { step: 'waiting_for_number', status: '...', startNumber: ... } }

const multipliers = {
    member: { "🌭": 65, "🍖": 30, "🦴": 65, "🐾": 13 },
    mini:   { "🌭": 67, "🍖": 33, "🦴": 67, "🐾": 13 },
    perm:   { "🌭": 70, "🍖": 35, "🦴": 70, "🐾": 13 }
};

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const content = message.content.toLowerCase();
    const userId = message.author.id;

    // STEP 0: Trigger
    if (['member', 'mini', 'perm'].includes(content)) {
        userState.set(userId, { step: 'waiting_for_number', status: content });
        return message.reply("Please provide the Starting Party Number:");
    }

    // STEP 1: Process Number
    if (userState.has(userId) && userState.get(userId).step === 'waiting_for_number') {
        const startNumber = parseInt(content);
        if (isNaN(startNumber)) return message.reply("Invalid number. Please try again.");
        
        userState.get(userId).startNumber = startNumber;
        userState.get(userId).step = 'waiting_for_drop';
        return message.reply("Please provide the Drop Type (e.g., 2🌭1🍖):");
    }

    // STEP 2: Process Drop Type & Calculate
    if (userState.has(userId) && userState.get(userId).step === 'waiting_for_drop') {
        const state = userState.get(userId);
        const dropType = content;
        const mults = multipliers[state.status];
        
        const getDrops = (type) => {
            const regex = new RegExp(`(\\d+)${type}`);
            const match = dropType.match(regex);
            return match ? parseInt(match[1]) : 0;
        };

        const totalDrops = (getDrops("🌭") * mults["🌭"]) + (getDrops("🍖") * mults["🍖"]) + 
                           (getDrops("🦴") * mults["🦴"]) + (getDrops("🐾") * mults["🐾"]);
        
        const endingNumber = state.startNumber - 1 + totalDrops; // Removed Add function

        // Send Tag
        await message.channel.send(`ʚ💘ɞ「${endingNumber.toLocaleString()} ⋆ ${dropType}」`);
        
        // Send MP
        if (state.status === "perm" || state.status === "mini") {
            await message.channel.send(`૮(˶ᵔ ᴥᵔ)ა   ɪғ sᴇᴇɴ, ᴘʟᴇᴀsᴇ ʀᴇᴛᴜʀɴ\n  /づ  \\づ.. ⸝⸝ ♡ ⸝⸝ ᴛᴏ ᴘʀᴏᴠᴏᴄᴀᴛɪᴠᴇ.\n━═━═━ [💘] • ᴄᴏʟʟᴀʀ #${endingNumber.toLocaleString()}`);
        } else {
            await message.channel.send(`ɪғ sᴇᴇɴ, ᴘʟᴇᴀsᴇ ʀᴇᴛᴜʀɴ ᴛᴏ:\n૮(˶ᵔ ᴥᵔ)ა [💘] ${endingNumber.toLocaleString()} • ${dropType}\n  /づ  \\づ.. ⸝⸝ ♡ ᴘʀᴏᴠᴏᴄᴀᴛɪᴠᴇ\n━═━═━═━═━═━═━═`);
        }

        userState.delete(userId); // Clear session
    }
});

client.login(process.env.DISCORD_TOKEN);
