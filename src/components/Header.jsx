import { FiSettings, FiVolume2 } from 'react-icons/fi'
import { RiHeartFill } from 'react-icons/ri'

export default function Header({ personality }) {
    return (
        <header className="header">
            <div className="header-logo">
                <div className="header-logo-icon">💕</div>
                <span className="header-logo-text">AI Girlfriend</span>
            </div>

            <div className="header-status">
                <div className="status-dot" />
                <span>{personality.name} is Online</span>
            </div>

            <div className="header-actions">
                <button className="header-btn" title="Volume">
                    <FiVolume2 />
                </button>
                <button className="header-btn" title="Settings">
                    <FiSettings />
                </button>
            </div>
        </header>
    )
}
