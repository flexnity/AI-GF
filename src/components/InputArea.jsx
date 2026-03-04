import { FiSend } from 'react-icons/fi'
import { BsMicFill, BsStopFill } from 'react-icons/bs'
import { HiOutlineEmojiHappy } from 'react-icons/hi'

function formatSeconds(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function InputArea({
    textInput, onTextChange, onSend, onKeyDown,
    isRecording, recordingSeconds,
    onStartRecord, onStopRecord,
    isSpeaking
}) {
    return (
        <div className="input-area">
            <div className="input-row">
                <button className="input-btn" title="Emoji" style={{ fontSize: '18px' }}>
                    <HiOutlineEmojiHappy />
                </button>

                {isRecording ? (
                    <>
                        <span className="recording-timer">{formatSeconds(recordingSeconds)}</span>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: '0.8rem', color: '#ef4444', animation: 'pulse 1s infinite' }}>
                                🔴 Recording…
                            </span>
                        </div>
                    </>
                ) : (
                    <input
                        className="text-input"
                        id="chat-input"
                        type="text"
                        placeholder="Type a message or press 🎙️ to voice chat…"
                        value={textInput}
                        onChange={e => onTextChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        autoComplete="off"
                    />
                )}

                <button
                    id="record-btn"
                    className={`input-btn record-btn${isRecording ? ' recording' : ''}`}
                    title={isRecording ? 'Stop Recording' : 'Start Voice Message'}
                    onClick={isRecording ? onStopRecord : onStartRecord}
                >
                    {isRecording ? <BsStopFill /> : <BsMicFill />}
                </button>

                {!isRecording && (
                    <button
                        id="send-btn"
                        className="input-btn send-btn"
                        onClick={onSend}
                        disabled={!textInput.trim()}
                        title="Send"
                        style={{ opacity: textInput.trim() ? 1 : 0.5 }}
                    >
                        <FiSend />
                    </button>
                )}
            </div>

            <p className="input-hint">
                {isSpeaking
                    ? '🎵 Playing voice response…'
                    : isRecording
                        ? '🎙️ Tap the stop button to send your voice message'
                        : 'Press Enter to send · 🎙️ for voice · All conversations are private'}
            </p>
        </div>
    )
}
