export default function WaveformVisualizer({ data, active }) {
    return (
        <div className="waveform-container">
            {data.map((height, i) => (
                <div
                    key={i}
                    className="wave-bar"
                    style={{
                        height: `${height}px`,
                        opacity: active ? 0.85 : 0.25,
                        transition: 'height 0.08s ease, opacity 0.3s ease',
                    }}
                />
            ))}
        </div>
    )
}
