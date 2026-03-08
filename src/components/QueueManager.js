import { usePlayer } from "../context/PlayerContext";
import { formatTime } from "../utils/helpers";

export default function QueueManager() {
  const { queue, queueIndex, currentSong, showQueue, setShowQueue, playFromQueue } = usePlayer();

  if (!showQueue) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(20px)", maxWidth: 390, margin: "0 auto",
      display: "flex", flexDirection: "column", animation: "slideUp 0.3s ease",
    }}>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ padding: "20px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 750, color: "#fff" }}>Queue</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{queue.length} songs</div>
        </div>
        <button onClick={() => setShowQueue(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>

      {/* Now playing */}
      {currentSong && (
        <div style={{ margin: "0 16px 12px", padding: "12px", borderRadius: 14, background: `${currentSong.color}22`, border: `1px solid ${currentSong.color}44` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: currentSong.color, marginBottom: 6, textTransform: "uppercase" }}>Now Playing</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={currentSong.cover} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentSong.title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{currentSong.artist}</div>
            </div>
          </div>
        </div>
      )}

      {/* Up next */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Up Next</div>
        {queue.slice(queueIndex + 1).map((song, i) => {
          const realIdx = queueIndex + 1 + i;
          return (
            <div key={song.id} onClick={() => { playFromQueue(realIdx); setShowQueue(false); }} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
              borderRadius: 12, cursor: "pointer", marginBottom: 4,
              background: "rgba(255,255,255,0.03)",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
            >
              <div style={{ width: 20, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>{i + 1}</div>
              <img src={song.cover} alt="" style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{song.title}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{song.artist}</div>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{formatTime(song.duration)}</div>
            </div>
          );
        })}
        {queue.slice(queueIndex + 1).length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No more songs in queue</div>
        )}
      </div>
    </div>
  );
}
