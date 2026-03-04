import { useState, useRef, useEffect, useCallback } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import AvatarPanel from './components/AvatarPanel'
import WaveformVisualizer from './components/WaveformVisualizer'
import MessagesArea from './components/MessagesArea'
import InputArea from './components/InputArea'
import { generateAIResponse } from './services/aiService'

const PERSONALITIES = [
    { id: 'trisha', name: 'Trisha', emoji: '🌙', avatar: '/trisha.png', desc: 'Sweet & elegant', voice: 'soft', color: '#a855f7' },
    { id: 'simran', name: 'Simran', emoji: '🌸', avatar: '/simran.png', desc: 'Playful & cheerful', voice: 'cheerful', color: '#ec4899' },
    { id: 'nayantara', name: 'Nayantara', emoji: '⭐', avatar: '/nayantara.png', desc: 'Confident & graceful', voice: 'wise', color: '#3b82f6' },
    { id: 'anushka', name: 'Anushka', emoji: '🔥', avatar: '/anushka.png', desc: 'Bold & passionate', voice: 'passionate', color: '#f97316' },
]

const MOODS = ['Happy 😊', 'Flirty 😏', 'Shy 🥺', 'Excited 🤩', 'Calm 😌', 'Curious 🤔']

export default function App() {
    const [messages, setMessages] = useState([])
    const [isTyping, setIsTyping] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [recordingSeconds, setRecordingSeconds] = useState(0)
    const [textInput, setTextInput] = useState('')
    const [selectedPersonality, setSelectedPersonality] = useState(PERSONALITIES[0])
    const [selectedMood, setSelectedMood] = useState(MOODS[0])
    const [waveformData, setWaveformData] = useState(Array(35).fill(4))
    const [sessionStats, setSessionStats] = useState({ messages: 0, voiceMessages: 0, duration: '0:00' })
    const [sessionStartTime] = useState(Date.now())
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
    const [mobileTab, setMobileTab] = useState('chat') // 'chat' | 'companions'

    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])
    const recordingTimerRef = useRef(null)
    const waveformAnimRef = useRef(null)
    const analyserRef = useRef(null)
    const audioCtxRef = useRef(null)

    // Session duration tracker
    useEffect(() => {
        const timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000)
            const m = Math.floor(elapsed / 60)
            const s = elapsed % 60
            setSessionStats(prev => ({ ...prev, duration: `${m}:${s.toString().padStart(2, '0')}` }))
        }, 1000)
        return () => clearInterval(timer)
    }, [sessionStartTime])

    // Welcome message
    useEffect(() => {
        const p = PERSONALITIES[0]
        setTimeout(() => {
            addAIMessage(`Hi there! 💕 I'm ${p.name}, your AI companion. I'm so happy you're here! You can talk to me by typing or using your voice. What's on your mind today? 🌸`)
        }, 600)
    }, [])

    const addAIMessage = useCallback((text, hasAudio = false, audioDuration = 0) => {
        const msg = {
            id: Date.now(),
            role: 'ai',
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            hasAudio,
            audioDuration,
            audioProgress: 0,
            isPlaying: false,
        }
        setMessages(prev => [...prev, msg])
        setSessionStats(prev => ({ ...prev, messages: prev.messages + 1 }))
    }, [])

    const addUserMessage = useCallback((text, isVoice = false) => {
        const msg = {
            id: Date.now(),
            role: 'user',
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isVoice,
        }
        setMessages(prev => [...prev, msg])
        setSessionStats(prev => ({
            ...prev,
            messages: prev.messages + 1,
            voiceMessages: isVoice ? prev.voiceMessages + 1 : prev.voiceMessages
        }))
        return msg
    }, [])

    const simulateWaveform = useCallback((active) => {
        if (waveformAnimRef.current) {
            cancelAnimationFrame(waveformAnimRef.current)
            waveformAnimRef.current = null
        }
        if (!active) {
            setWaveformData(Array(35).fill(4))
            return
        }
        const animate = () => {
            setWaveformData(prev => prev.map((_, i) => {
                const base = active ? Math.random() * 40 + 8 : 4
                const center = Math.abs(i - 17) / 17
                return base * (1 - center * 0.5)
            }))
            waveformAnimRef.current = requestAnimationFrame(animate)
        }
        animate()
    }, [])

    const handleSendText = useCallback(async () => {
        const text = textInput.trim()
        if (!text) return
        setTextInput('')
        addUserMessage(text, false)
        setIsTyping(true)
        simulateWaveform(false)
        try {
            const response = await generateAIResponse(text, selectedPersonality, selectedMood, messages)
            setIsTyping(false)
            setIsSpeaking(true)
            simulateWaveform(true)
            addAIMessage(response, true, Math.floor(Math.random() * 8 + 3))
            setTimeout(() => {
                setIsSpeaking(false)
                simulateWaveform(false)
            }, 3000)
        } catch (e) {
            setIsTyping(false)
            addAIMessage("Aww, I'm having a little trouble connecting right now. Please try again! 💝")
        }
    }, [textInput, selectedPersonality, selectedMood, messages, addUserMessage, addAIMessage, simulateWaveform])

    const handleStartRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            audioChunksRef.current = []
            const mr = new MediaRecorder(stream)
            mediaRecorderRef.current = mr

            // Setup analyser for real waveform
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
            const source = audioCtxRef.current.createMediaStreamSource(stream)
            const analyser = audioCtxRef.current.createAnalyser()
            analyser.fftSize = 64
            source.connect(analyser)
            analyserRef.current = analyser

            mr.ondataavailable = e => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data)
            }

            mr.onstop = async () => {
                stream.getTracks().forEach(t => t.stop())
                if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null }
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                const duration = recordingSeconds
                handleVoiceMessage(blob, duration)
            }

            mr.start()
            setIsRecording(true)
            setRecordingSeconds(0)

            // Live waveform from mic
            const dataArr = new Uint8Array(analyser.frequencyBinCount)
            const animateMic = () => {
                if (!analyserRef.current) return
                analyserRef.current.getByteFrequencyData(dataArr)
                const bars = Array.from({ length: 35 }, (_, i) => {
                    const idx = Math.floor(i / 35 * dataArr.length)
                    return Math.max(4, (dataArr[idx] / 255) * 52)
                })
                setWaveformData(bars)
                waveformAnimRef.current = requestAnimationFrame(animateMic)
            }
            animateMic()

            recordingTimerRef.current = setInterval(() => {
                setRecordingSeconds(s => s + 1)
            }, 1000)
        } catch (err) {
            console.error('Mic access denied', err)
            addAIMessage("I couldn't access your microphone. Please allow microphone access and try again! 🎙️")
        }
    }, [recordingSeconds, addAIMessage])

    const handleStopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        }
        clearInterval(recordingTimerRef.current)
        if (waveformAnimRef.current) {
            cancelAnimationFrame(waveformAnimRef.current)
            waveformAnimRef.current = null
        }
        setIsRecording(false)
        setRecordingSeconds(0)
    }, [])

    const handleVoiceMessage = useCallback(async (blob, duration) => {
        const displayDuration = `${duration}s voice message`
        addUserMessage(`🎙️ ${displayDuration}`, true)
        setIsTyping(true)
        try {
            const response = await generateAIResponse(
                `[User sent a ${duration}-second voice message]`,
                selectedPersonality,
                selectedMood,
                messages
            )
            setIsTyping(false)
            setIsSpeaking(true)
            simulateWaveform(true)
            addAIMessage(response, true, Math.floor(Math.random() * 8 + 3))
            setTimeout(() => {
                setIsSpeaking(false)
                simulateWaveform(false)
            }, 3000)
        } catch (e) {
            setIsTyping(false)
            addAIMessage("I had trouble understanding that. Could you try again? 💕")
        }
    }, [selectedPersonality, selectedMood, messages, addUserMessage, addAIMessage, simulateWaveform])

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendText()
        }
    }

    const handlePersonalityChange = (p) => {
        setSelectedPersonality(p)
        setMessages([])
        setTimeout(() => {
            addAIMessage(`Hey! 💖 I'm ${p.name}. ${p.desc.charAt(0).toUpperCase() + p.desc.slice(1)} — that's my vibe! So lovely to meet you. What would you like to talk about? ✨`)
        }, 300)
        setSessionStats(prev => ({ messages: 1, voiceMessages: 0, duration: prev.duration }))
    }

    const handlePersonalitySelect = (p) => {
        handlePersonalityChange(p)
        setMobileSidebarOpen(false)
        setMobileTab('chat')
    }

    return (
        <div className="app-layout">
            {/* Ambient background */}
            <div className="ambient-bg">
                <div className="ambient-orb ambient-orb-1" />
                <div className="ambient-orb ambient-orb-2" />
                <div className="ambient-orb ambient-orb-3" />
            </div>

            <Header personality={selectedPersonality} />

            {/* Mobile sidebar backdrop */}
            {mobileSidebarOpen && (
                <div className="mobile-backdrop" onClick={() => setMobileSidebarOpen(false)} />
            )}

            <div className="main-area">
                <Sidebar
                    personalities={PERSONALITIES}
                    selected={selectedPersonality}
                    onSelect={handlePersonalitySelect}
                    moods={MOODS}
                    selectedMood={selectedMood}
                    onMoodSelect={setSelectedMood}
                    stats={sessionStats}
                    mobileOpen={mobileSidebarOpen}
                    onMobileClose={() => setMobileSidebarOpen(false)}
                />

                <div className="chat-area">
                    <AvatarPanel personality={selectedPersonality} isSpeaking={isSpeaking} />
                    <WaveformVisualizer data={waveformData} active={isSpeaking || isRecording} />
                    <MessagesArea
                        messages={messages}
                        isTyping={isTyping}
                        personality={selectedPersonality}
                    />
                    <InputArea
                        textInput={textInput}
                        onTextChange={setTextInput}
                        onSend={handleSendText}
                        onKeyDown={handleKeyDown}
                        isRecording={isRecording}
                        recordingSeconds={recordingSeconds}
                        onStartRecord={handleStartRecording}
                        onStopRecord={handleStopRecording}
                        isSpeaking={isSpeaking}
                    />
                </div>
            </div>

            {/* Mobile bottom nav */}
            <nav className="mobile-bottom-nav">
                <button
                    className={`mobile-nav-btn${mobileTab === 'chat' ? ' active' : ''}`}
                    onClick={() => { setMobileTab('chat'); setMobileSidebarOpen(false) }}
                >
                    <span className="mobile-nav-icon">💬</span>
                    <span className="mobile-nav-label">Chat</span>
                </button>
                <button
                    className={`mobile-nav-btn${mobileTab === 'companions' ? ' active' : ''}`}
                    onClick={() => { setMobileTab('companions'); setMobileSidebarOpen(true) }}
                >
                    <span className="mobile-nav-icon">{selectedPersonality.emoji}</span>
                    <span className="mobile-nav-label">Companions</span>
                </button>
                <button
                    className="mobile-nav-btn mobile-nav-record"
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                >
                    <span className="mobile-nav-icon">{isRecording ? '⏹️' : '🎙️'}</span>
                    <span className="mobile-nav-label">{isRecording ? 'Stop' : 'Voice'}</span>
                </button>
            </nav>
        </div>
    )
}
