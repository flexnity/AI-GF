import { useEffect, useRef, useState } from 'react'
import { FiPlay, FiPause } from 'react-icons/fi'
import { BsMicFill } from 'react-icons/bs'

function AudioPlayer({ duration }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [elapsed, setElapsed] = useState(0)
    const timerRef = useRef(null)

    const toggle = () => {
        if (isPlaying) {
            clearInterval(timerRef.current)
            setIsPlaying(false)
        } else {
            setIsPlaying(true)
            setProgress(0)
            setElapsed(0)
            timerRef.current = setInterval(() => {
                setElapsed(e => {
                    if (e >= duration) {
                        clearInterval(timerRef.current)
                        setIsPlaying(false)
                        setProgress(0)
                        return 0
                    }
                    setProgress(((e + 0.1) / duration) * 100)
                    return e + 0.1
                })
            }, 100)
        }
    }

    useEffect(() => () => clearInterval(timerRef.current), [])

    const fmt = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`

    return (
        <div className="audio-player">
            <button className="audio-play-btn" onClick={toggle}>
                {isPlaying ? <FiPause size={12} /> : <FiPlay size={12} />}
            </button>
            <div className="audio-progress-bar">
                <div className="audio-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="audio-duration">{fmt(isPlaying ? elapsed : duration)}</span>
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
                            <AudioPlayer duration={msg.audioDuration} />
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
