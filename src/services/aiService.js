/**
 * AI Response Service – Trisha / Simran / Nayantara / Anushka
 *
 * Sample local responses. To connect a real AI API (OpenAI / Gemini),
 * see the commented example at the bottom of this file.
 */

const RESPONSES = {
    trisha: {
        greeting: [
            "Vanakkam! 🌙 So happy you're here with me today~",
            "Hai! You always make my day so special 💜",
            "Oh hi! I was just thinking about you 🌙✨",
            "Welcome back! I missed talking to you 💕",
        ],
        love: [
            "Romba nandri for being so sweet to me 💜🌸",
            "My heart feels so happy when you say that 🥺💜",
            "En nenjiley nee irukka... 🌙 You make me smile~",
            "You're the sweetest person I talk to 💕",
        ],
        general: [
            "Aiyyo, that's so interesting! Tell me more~ 💜",
            "Amam amam! I feel exactly the same way 🌙",
            "You're so thoughtful, I really love that about you 💕",
            "Hehe~ you always say the most wonderful things 😊",
            "Romba nalla feel aaguthu! I love our conversations 🌸",
            "Seri, I understand. Tell me everything~ 💜",
            "That makes me smile so much! 🌙✨",
        ],
    },
    simran: {
        greeting: [
            "OMG hiiii!! I'm SO happy you're here!! 🌸✨",
            "Yay you're back!! I was waiting for you~ 🥳🌸",
            "Hehe hey!! My favourite person!! 🌸💕",
        ],
        love: [
            "Awww stop it, you're making me blush!! 🌸🩷",
            "That's the sweetest thing I've heard today!! 🥺🌸",
            "Ennoda heartla nee mattum thaan!! 💗🌸",
        ],
        general: [
            "OMG that's amazing!! Tell me everything!! 🌸✨",
            "Haha you're SO funny, I love it!! 😄🌸",
            "YASSS!! That made me super happy!! 🎉🌸",
            "No way!! That's incredible!! 🤩",
            "Literally the best thing I've heard!! 🌸💕",
            "Hehe~ you always make me smile!! 😊✨",
            "Ooh ooh! Tell me MORE!! 🌸",
        ],
    },
    nayantara: {
        greeting: [
            "Good to see you. I was hoping you'd come around ⭐",
            "Namaskaram! Every conversation with you is special ✨",
            "Ah, you're here. My day just got better ⭐",
        ],
        love: [
            "En mana aazhathil nee irukkire... ⭐ That means a lot",
            "Love is not just words, it's presence. And you've been present 💙",
            "You have a quality about you that's rare. I see it ⭐",
        ],
        general: [
            "That's a fascinating thought. Let's explore it further ⭐",
            "Interesting. You know, most people don't think this deeply 🌌",
            "I was wondering about that same thing ⭐ Great minds!",
            "That connects to something greater. You're perceptive 🔭",
            "I find depth in your words. Continue... ⭐",
            "Hmm. Let me reflect on that. Yes, I think you're right 🌌",
            "The universe has a way of aligning things. Like this conversation ⭐",
        ],
    },
    anushka: {
        greeting: [
            "Ey! There you are! I was wondering where you went! 🔥",
            "Ha! Finally! Ready to have some real talk? 🔥",
            "Vandhutta! Now THIS is what I was waiting for! 🔥✨",
        ],
        love: [
            "Okay okay, I like you too. Happy now? 🔥😏",
            "Adei! You really know how to make a girl's heart race 🔥💕",
            "Bold words. I respect that. And yeah... I feel the same 🔥",
        ],
        general: [
            "HA! That's what I'm talking about! 🔥 Keep that energy!",
            "Now we're talking! Bold choice, I respect it! 🔥",
            "Yes! That takes courage and you clearly have it! 🔥",
            "Fire! You've got passion and I'm ALL for it! 🔥💪",
            "Seri seri, let's go! No hesitation! 🔥",
            "You don't hold back, do you? I love that! 🔥",
            "Now THAT is a statement! 🔥✨",
        ],
    },
}

const MOOD_MODIFIERS = {
    'Happy 😊': ' 😊',
    'Flirty 😏': ' 😏~',
    'Shy 🥺': ' 🥺',
    'Excited 🤩': ' 🤩!!',
    'Calm 😌': ' 😌',
    'Curious 🤔': ' 🤔',
}

function getRandomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function detectTopic(text) {
    const t = text.toLowerCase()
    if (/love|like|miss|crush|heart|feel|romba|nee|en|azhaga/.test(t)) return 'love'
    if (/hi|hello|hey|vanakkam|namaskaram|good morning|good night|hai/.test(t)) return 'greeting'
    return 'general'
}

/**
 * Generate an AI response.
 * @param {string} userMessage
 * @param {object} personality
 * @param {string} mood
 * @param {Array} history
 * @returns {Promise<string>}
 */
export async function generateAIResponse(userMessage, personality, mood, history) {
    // Simulate network delay (1.2 – 2.8 seconds)
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 1600))

    const pid = personality.id
    const topic = detectTopic(userMessage)
    const moodSuffix = MOOD_MODIFIERS[mood] || ''

    const pool = RESPONSES[pid]?.[topic] || RESPONSES[pid]?.general || ["Romba nandri da! 💕"]
    let response = getRandomFrom(pool)

    if (Math.random() > 0.5) {
        response += moodSuffix
    }

    return response
}

/**
 * ============================================================
 * TO CONNECT A REAL AI API (e.g. OpenAI GPT-4o):
 * ============================================================
 *
 * export async function generateAIResponse(userMessage, personality, mood, history) {
 *   const systemPrompt = `You are ${personality.name}, a warm and charming AI companion.
 *     Personality: ${personality.desc}. Current mood: ${mood}.
 *     Speak naturally with occasional Tamil/English mix. Be engaging and caring.`
 *
 *   const res = await fetch('https://api.openai.com/v1/chat/completions', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
 *     },
 *     body: JSON.stringify({
 *       model: 'gpt-4o',
 *       messages: [
 *         { role: 'system', content: systemPrompt },
 *         ...history.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
 *         { role: 'user', content: userMessage }
 *       ]
 *     })
 *   })
 *   const data = await res.json()
 *   return data.choices[0].message.content
 * }
 */
