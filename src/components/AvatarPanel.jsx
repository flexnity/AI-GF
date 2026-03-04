import { useState } from 'react'

export default function AvatarPanel({ personality, isSpeaking }) {
    const [imgError, setImgError] = useState(false)

    // Gradient colors per personality for the ring
    const ringGradients = {
        trisha: 'conic-gradient(from 0deg, #a855f7, #ec4899, #a855f7)',
        simran: 'conic-gradient(from 0deg, #ec4899, #f43f5e, #ec4899)',
        nayantara: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #3b82f6)',
        anushka: 'conic-gradient(from 0deg, #f97316, #ef4444, #f97316)',
    }

    const ringGradient = ringGradients[personality.id] || ringGradients.trisha

    return (
        <div className="avatar-panel">
            <div className="avatar-container">
                {/* Rotating gradient ring */}
                <div className="avatar-ring" style={{ background: ringGradient }} />
                <div className="avatar-ring-inner" />

                {/* Avatar image or fallback emoji */}
                <div className="avatar-img-wrapper">
                    {!imgError && personality.avatar ? (
                        <img
                            src={personality.avatar}
                            alt={personality.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '50%',
                                display: 'block',
                            }}
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <span style={{ fontSize: '52px', filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.3))' }}>
                            {personality.emoji}
                        </span>
                    )}
                </div>

                {/* Speaking pulse ring */}
                <div
                    className={`avatar-speaking-ring${isSpeaking ? ' active' : ''}`}
                    style={{ borderColor: isSpeaking ? personality.color : undefined }}
                />

                {/* Speaking animated dots */}
                {isSpeaking && (
                    <div style={{
                        position: 'absolute',
                        bottom: -6,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 4,
                    }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: personality.color,
                                animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                            }} />
                        ))}
                    </div>
                )}
            </div>

            <div className="avatar-name" style={{ color: personality.color, marginTop: '18px' }}>
                {personality.name}
            </div>
            <div className="avatar-tagline">
                {isSpeaking ? '🎵 Speaking…' : `Your AI Companion · ${personality.desc}`}
            </div>
        </div>
    )
}
