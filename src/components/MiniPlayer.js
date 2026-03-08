import { usePlayer } from "../context/PlayerContext";
import { formatTime } from "../utils/helpers";

export default function MiniPlayer() {
  const { currentSong, isPlaying, progress, elapsed, setIsPlaying, skipNext, skipPrev, setExpandPlayer } = usePlayer();
  if (!currentSong) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 68,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 24px)",
        maxWidth: 366,
        zIndex: 50,
        borderRadius: 22,
        overflow: "hidden",
        background: "rgba(14,14,22,0.85)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: `1px solid rgba(${hexToRgb(currentSong.color)}, 0.3)`,
        boxShadow: `0 16px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), 0 4px 40px rgba(${hexToRgb(currentSong.color)}, 0.2)`,
      }}
    >
      {/* Seeker */}
      <div
        style={{ height: 2.5, background: "rgba(255,255,255,0.06)", cursor: "pointer" }}
        onClick={(e) => {
          const pct = (e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.offsetWidth * 100;
          usePlayer.seek?.(pct);
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${currentSong.color}, ${currentSong.accent})`,
            transition: "width 0.8s linear",
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", padding: "10px 12px", gap: 10 }}>
        {/* Artwork */}
        <div
          onClick={() => setExpandPlayer(true)}
          style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}
        >
          <img
            src={currentSong.cover}
            alt=""
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              objectFit: "cover",
              boxShadow: `0 4px 16px rgba(${hexToRgb(currentSong.color)}, 0.5)`,
            }}
          />
          {isPlaying && (
            <div style={{
              position: "absolute", inset: 0, borderRadius: 10,
              background: "rgba(0,0,0,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BarsIcon color={currentSong.color} />
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setExpandPlayer(true)}>
          <div style={{ fontSize: 13.5, fontWeight: 650, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.2px" }}>
            {currentSong.title}
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>
            {currentSong.artist}
          </div>
        </div>

        <span style={{ fontFamily: "monospace", fontSize: 10.5, color: "rgba(255,255,255,0.3)", marginRight: 4 }}>
          {formatTime(elapsed)}
        </span>

        {/* Controls */}
        <Btn onClick={skipPrev} size={18} opacity={0.55}>
          <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
        </Btn>
        <button
          onClick={() => setIsPlaying((p) => !p)}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: `linear-gradient(135deg, ${currentSong.color}, ${currentSong.accent})`,
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 16px rgba(${hexToRgb(currentSong.color)}, 0.7)`,
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
            {isPlaying ? <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /> : <path d="M8 5v14l11-7z" />}
          </svg>
        </button>
        <Btn onClick={skipNext} size={18} opacity={0.55}>
          <path d="M6 18l8.5-6L6 6v12zm2-8.14 4.96 2.14L8 14.14V9.86zM16 6h2v12h-2z" />
        </Btn>
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  if (!hex || hex.length < 7) return "255,255,255";
  return `${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}`;
}

function Btn({ onClick, size = 20, opacity = 0.7, children }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: `rgba(255,255,255,${opacity})`, display: "flex" }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">{children}</svg>
    </button>
  );
}

function BarsIcon({ color }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 16 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2, background: color,
          animation: `bar${i} ${0.5 + i * 0.15}s ease-in-out infinite alternate`,
        }} />
      ))}
      <style>{`
        @keyframes bar1 { from{height:3px} to{height:12px} }
        @keyframes bar2 { from{height:8px} to{height:4px} }
        @keyframes bar3 { from{height:4px} to{height:14px} }
      `}</style>
    </div>
  );
}
