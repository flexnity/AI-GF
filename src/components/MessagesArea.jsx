import { useEffect, useRef, useState } from 'react'
import { FiPlay, FiSquare } from 'react-icons/fi'
import { BsMicFill } from 'react-icons/bs'
import { speak, stop as stopSpeech } from '../services/ttsService'

function AudioPlayer({ text, personality }) {
    const [isPlaying, setIsPlaying] = useState(false)

    // Stop speech when component unmounts
    useEffect(() => () => stopSpeech(), [])

    const handleToggle = async () => {
        if (isPlaying) {
            stopSpeech()
            setIsPlaying(false)
        } else {
            setIsPlaying(true)
            await speak(text, personality, {
                onEnd: () => setIsPlaying(false),
            })
        }
    }

    return (
        <div className="audio-player">
            <button
                className="audio-play-btn"
                onClick={handleToggle}
                title={isPlaying ? 'Stop' : 'Play voice response'}
            >
                {isPlaying ? <FiSquare size={11} /> : <FiPlay size={11} />}
            </button>
            <div className="audio-progress-bar">
                {isPlaying ? (
                    <div className="audio-speaking-bars">
                        {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} className="speaking-bar" style={{ animationDelay: `${i * 0.12}s` }} />
                        ))}
                    </div>
                ) : (
                    <div className="audio-progress-fill" style={{ width: '0%' }} />
                )}
            </div>
            <span className="audio-duration">
                {isPlaying ? '🔊 Speaking…' : '🔊 Play'}
            </span>
        </div>
    )
}

export default function MessagesArea({ messages, isTyping, personality }) {
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    return (
        <div className="messages-container">
            {messages.length === 0 && !isTyping && (
                <div className="empty-state">
                    <div className="empty-state-icon">💬</div>
                    <p>Say something to {personality.name}!</p>
                    <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Type or use voice to start chatting</p>
                </div>
            )}

            {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.role}`}>
                    <div className="message-avatar">
                        {msg.role === 'ai' ? personality.emoji : '🧑'}
                    </div>
                    <div className="message-content">
                        <div className="message-bubble">{msg.text}</div>

                        {msg.role === 'ai' && msg.hasAudio && (
                            <AudioPlayer text={msg.text} personality={personality} />
                        )}

                        {msg.role === 'user' && msg.isVoice && (
                            <div className="message-audio-indicator">
                                <BsMicFill size={10} /> Voice message
                            </div>
                        )}

                        <div className="message-time">{msg.time}</div>
                    </div>
                </div>
            ))}

            {isTyping && (
                <div className="message ai">
                    <div className="message-avatar">{personality.emoji}</div>
                    <div className="typing-indicator">
                        <div className="typing-dots">
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                        </div>
                    </div>
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    )
}
