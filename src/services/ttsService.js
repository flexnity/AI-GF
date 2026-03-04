/**
 * Text-to-Speech Service
 * Uses Google Translate TTS (free, no API key, consistent female voice).
 * Falls back to Web Speech API if fetch fails.
 */

// Per-personality settings
const VOICE_SETTINGS = {
    trisha: { lang: 'ta', rate: 0.9 },   // Tamil, slow & sweet
    simran: { lang: 'ta', rate: 1.0 },   // Tamil, cheerful pace
    nayantara: { lang: 'ta', rate: 0.85 },  // Tamil, calm & graceful
    anushka: { lang: 'ta', rate: 1.05 },  // Tamil, bold & fast
}

let currentAudio = null   // HTMLAudioElement (Google TTS)
let currentUtterance = null  // SpeechSynthesisUtterance (fallback)

// ─── Google Translate TTS (primary) ─────────────────────────────────────────

/**
 * Build the Google Translate TTS URL for a text chunk.
 * Google TTS max ~200 chars per request, so we split long texts.
 */
function googleTTSUrl(text, lang) {
    const encoded = encodeURIComponent(text)
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob&ttsspeed=1`
}

/**
 * Split text into chunks ≤ 200 chars, breaking at sentence boundaries.
 */
function splitText(text, maxLen = 190) {
    if (text.length <= maxLen) return [text]
    const chunks = []
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text]
    let current = ''
    for (const s of sentences) {
        if ((current + s).length > maxLen) {
            if (current) chunks.push(current.trim())
            current = s
        } else {
            current += s
        }
    }
    if (current.trim()) chunks.push(current.trim())
    return chunks.length ? chunks : [text.slice(0, maxLen)]
}

/**
 * Play chunks sequentially via Google TTS.
 */
async function playGoogleTTS(chunks, lang, { onStart, onEnd } = {}) {
    let started = false
    for (const chunk of chunks) {
        if (!chunk.trim()) continue
        const url = googleTTSUrl(chunk, lang)
        await new Promise((resolve, reject) => {
            const audio = new Audio()
            audio.crossOrigin = 'anonymous'
            currentAudio = audio

            audio.oncanplaythrough = () => {
                if (!started) { started = true; onStart?.() }
                audio.play()
            }
            audio.onended = resolve
            audio.onerror = reject  // will trigger fallback
            audio.src = url
            audio.load()
        })
    }
    currentAudio = null
    onEnd?.()
}

// ─── Web Speech API (fallback) ───────────────────────────────────────────────

/**
 * Pick the best female voice available in the browser.
 * Priority: female-named → en-IN → en-US
 */
function pickFemaleVoice() {
    const voices = window.speechSynthesis.getVoices()
    // Log all voices once for debugging
    console.log('[TTS] Available voices:', voices.map(v => `${v.name} (${v.lang})`))

    // Well-known female voice names
    const femaleNames = [
        'Google UK English Female',
        'Google US English Female',
        'Microsoft Heera',      // Windows Indian English female
        'Microsoft Zira',       // Windows US English female
        'Samantha',             // macOS/iOS
        'Karen',                // macOS Australian
        'Moira',                // macOS Irish
        'Tessa',                // macOS South African
        'Veena',                // macOS Indian
    ]
    let voice = voices.find(v => femaleNames.includes(v.name))
    if (!voice) voice = voices.find(v => /female|woman|girl/i.test(v.name))
    if (!voice) voice = voices.find(v => v.lang.startsWith('en-IN'))
    if (!voice) voice = voices.find(v => v.lang === 'en-US')
    if (!voice) voice = voices.find(v => v.lang.startsWith('en'))
    return voice
}

function waitForVoices() {
    return new Promise(resolve => {
        const v = window.speechSynthesis.getVoices()
        if (v.length > 0) { resolve(); return }
        window.speechSynthesis.addEventListener('voiceschanged', resolve, { once: true })
        setTimeout(resolve, 1500)
    })
}

function speakFallback(text, { onStart, onEnd } = {}) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voice = pickFemaleVoice()
    if (voice) utterance.voice = voice
    utterance.lang = voice?.lang || 'en-IN'
    utterance.pitch = 1.2
    utterance.rate = 0.92
    utterance.volume = 1
    utterance.onstart = () => onStart?.()
    utterance.onend = () => { currentUtterance = null; onEnd?.() }
    utterance.onerror = () => { currentUtterance = null; onEnd?.() }
    currentUtterance = utterance
    window.speechSynthesis.speak(utterance)
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Speak text using Google TTS (Tamil female), with Web Speech API fallback.
 */
export async function speak(text, personality, { onStart, onEnd } = {}) {
    stop()

    const settings = VOICE_SETTINGS[personality?.id] || VOICE_SETTINGS.trisha
    const chunks = splitText(text)

    try {
        await playGoogleTTS(chunks, settings.lang, { onStart, onEnd })
    } catch (err) {
        console.warn('[TTS] Google TTS failed, falling back to Web Speech API:', err)
        // Fallback to browser TTS
        await waitForVoices()
        speakFallback(text, { onStart, onEnd })
    }
}

/**
 * Stop any currently playing speech.
 */
export function stop() {
    if (currentAudio) {
        currentAudio.pause()
        currentAudio.src = ''
        currentAudio = null
    }
    if (window.speechSynthesis?.speaking || window.speechSynthesis?.pending) {
        window.speechSynthesis.cancel()
    }
    currentUtterance = null
}

export function isTTSAvailable() {
    return typeof Audio !== 'undefined' || 'speechSynthesis' in window
}
