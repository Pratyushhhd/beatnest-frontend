import { usePlayer } from "../context/PlayerContext";
import SongCard from "../components/SongCard";

export default function Offline() {
  const { downloadedSongs, removeDownload, playSong } = usePlayer();

  return (
    <div style={{ paddingBottom: 8 }}>
      {/* Header card */}
      <div style={{ margin: "16px 20px", padding: "16px 18px", borderRadius: 18, background: "linear-gradient(135deg, rgba(78,205,196,0.15), rgba(78,205,196,0.05))", border: "1px solid rgba(78,205,196,0.25)", display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #4ECDC4, #00B894)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(78,205,196,0.4)", flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Offline Library</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>
            {`${downloadedSongs.length} song${downloadedSongs.length !== 1 ? "s" : ""} · Available without internet`}
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 750, color: "#4ECDC4" }}>{downloadedSongs.length}</div>
      </div>

      {/* Play all button */}
      {downloadedSongs.length > 0 && (
        <div style={{ padding: "0 20px 12px" }}>
          <button onClick={() => playSong(downloadedSongs[0], downloadedSongs)} style={{ width: "100%", padding: 12, borderRadius: 14, background: "linear-gradient(135deg, #4ECDC4, #00B894)", border: "none", cursor: "pointer", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 16px rgba(78,205,196,0.35)" }}>
            ▶ Play All Offline Songs
          </button>
        </div>
      )}

      {/* Song list */}
      <div style={{ padding: "0 12px" }}>
        {downloadedSongs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", animation: "fadeUp 0.5s both" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📥</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>No Offline Songs</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
              Tap the download icon on any song to save it here
            </div>
          </div>
        ) : (
          <>
            {downloadedSongs.map((song, i) => (
              <SongCard key={song.id} song={song} songs={downloadedSongs} index={i}
                onLike={() => {}} onDownload={(id) => removeDownload(id)} />
            ))}
            <div style={{ padding: "16px 4px 0", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>Tap the ✓ icon to remove a download</div>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
