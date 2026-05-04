async function processCalculation(channel, status, startNumber, newDropType, previousTag = null) {
    const mults = multipliers[status];
    const emojiMap = { "🌭": "🌭", "🍖": "🍖", "🦴": "🦴", "🐾": "🐾" };
    
    // 1. Helper to extract numbers and their emojis from input string
    // This looks for pairs like "1🌭" or just "1"
    const extractDrops = (input) => {
        const drops = { "🌭": 0, "🍖": 0, "🦴": 0, "🐾": 0 };
        // Matches "123🌭" or "123"
        const regex = /(\d+)(🌭|🍖|🦴|🐾)?/g;
        let match;
        while ((match = regex.exec(input)) !== null) {
            const count = parseInt(match[1]);
            const emoji = match[2] || "🌭"; // Default to 🌭 if no emoji provided
            if (drops.hasOwnProperty(emoji)) {
                drops[emoji] += count;
            }
        }
        return drops;
    };

    // 2. Combine and Sort Drops
    const newDrops = extractDrops(newDropType);
    const oldDrops = previousTag ? extractDrops(previousTag) : { "🌭": 0, "🍖": 0, "🦴": 0, "🐾": 0 };
    
    const totalDrops = {
        "🌭": newDrops["🌭"] + oldDrops["🌭"],
        "🍖": newDrops["🍖"] + oldDrops["🍖"],
        "🦴": newDrops["🦴"] + oldDrops["🦴"],
        "🐾": newDrops["🐾"] + oldDrops["🐾"]
    };

    // Build the string: "1🌭1🦴"
    let combinedDropType = "";
    ["🌭", "🍖", "🦴", "🐾"].forEach(type => {
        if (totalDrops[type] > 0) {
            combinedDropType += `${totalDrops[type]}${type}`;
        }
    });

    // 3. Calculate math based on NEW drops only
    const newValue = (newDrops["🌭"] * mults["🌭"]) + 
                     (newDrops["🍖"] * mults["🍖"]) + 
                     (newDrops["🦴"] * mults["🦴"]) + 
                     (newDrops["🐾"] * mults["🐾"]);
    
    const endingNumber = startNumber + newValue - 1;
    const partiesAdded = newValue; // Added based on new drops

    // 4. Output
    await channel.send(`ʚ💘ɞ「${endingNumber.toLocaleString()} ⋆ ${combinedDropType}」`);
    
    if (status === "perm" || status === "mini") {
        await channel.send(`૮(˶ᵔ ᴥᵔ)ა   ɪғ sᴇᴇɴ, ᴘʟᴇᴀsᴇ ʀᴇᴛᴜʀɴ\n  /づ  \\づ.. ⸝⸝ ♡ ⸝⸝ ᴛᴏ ᴘʀᴏᴠᴏᴄᴀᴛɪᴠᴇ.\n━═━═━ [💘] • ᴄᴏʟʟᴀʀ #${endingNumber.toLocaleString()}`);
    } else {
        await channel.send(`ɪғ sᴇᴇɴ, ᴘʟᴇᴀsᴇ ʀᴇᴛᴜʀɴ ᴛᴏ:\n૮(˶ᵔ ᴥᵔ)ა [💘] ${endingNumber.toLocaleString()} • ${combinedDropType}\n  /づ  \\づ.. ⸝⸝ ♡ ᴘʀᴏᴠᴏᴄᴀᴛɪᴠᴇ\n━═━═━═━═━═━═━═`);
    }
    await channel.send(`**Parties Added: ${partiesAdded}**`);
}
