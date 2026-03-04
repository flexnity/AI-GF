export default function Sidebar({ personalities, selected, onSelect, moods, selectedMood, onMoodSelect, stats }) {
    return (
        <aside className="sidebar">
            <p className="sidebar-section-title">✨ Choose Companion</p>

            {personalities.map(p => (
                <div
                    key={p.id}
                    className={`personality-card${selected.id === p.id ? ' active' : ''}`}
                    onClick={() => onSelect(p)}
                >
                    <div className="personality-emoji" style={selected.id === p.id ? { background: `${p.color}22` } : {}}>
                        {p.emoji}
                    </div>
                    <div className="personality-info">
                        <div className="personality-name" style={selected.id === p.id ? { color: p.color } : {}}>{p.name}</div>
                        <div className="personality-desc">{p.desc}</div>
                    </div>
                    {selected.id === p.id && <span style={{ color: p.color, fontSize: '10px' }}>●</span>}
                </div>
            ))}

            <p className="sidebar-section-title" style={{ marginTop: '12px' }}>🎭 Set Mood</p>

            <div className="mood-selector">
                <div className="mood-title">Current vibe</div>
                <div className="mood-buttons">
                    {moods.map(m => (
                        <button
                            key={m}
                            className={`mood-btn${selectedMood === m ? ' active' : ''}`}
                            onClick={() => onMoodSelect(m)}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            <div className="sidebar-stats">
                <p className="sidebar-section-title" style={{ padding: 0, marginBottom: '8px' }}>📊 Session</p>
                <div className="stat-row">
                    <span className="stat-label">Duration</span>
                    <span className="stat-value">{stats.duration}</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Messages</span>
                    <span className="stat-value">{stats.messages}</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Voice msgs</span>
                    <span className="stat-value">{stats.voiceMessages}</span>
                </div>
            </div>
        </aside>
    )
}
