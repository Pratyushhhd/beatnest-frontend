import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { usePlayer } from "../context/PlayerContext";
import SongCard from "../components/SongCard";
import { formatTime } from "../utils/helpers";

export default function Album({ albumName, artistName, onBack }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayer();

  useEffect(() => {
    if (!albumName) return;
    setLoading(true);
    api.saavnSearch(`${albumName} ${artistName || ""}`).then(results => {
      const filtered = results.filter(s =>
        s.album?.toLowerCase().includes(albumName.toLowerCase())
      );
      setSongs(filtered.length > 0 ? filtered : results.slice(0, 15));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [albumName, artistName]);

  const firstSong = songs[0];
  const totalDuration = songs.reduce((a, s) => a + (s.duration || 0), 0);

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        {firstSong && (
          <img src={firstSong.cover} alt="" style={{ width: "100%", height: 200, objectFit: "cover", filter: "blur(20px) brightness(0.35)", transform: "scale(1.2)", position: "absolute", inset: 0 }} />
        )}
        <div style={{ position: "relative", zIndex: 1, padding: "20px 20px 24px", display: "flex", flexDirection: "column", alignItems: "center", minHeight: 220, justifyContent: "flex-end" }}>
          <button onClick={onBack} style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,0.4)", border: "none", cursor: "pointer", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          </button>
          {firstSong && <img src={firstSong.cover} alt="" style={{ width: 130, height: 130, borderRadius: 16, objectFit: "cover", boxShadow: "0 16px 48px rgba(0,0,0,0.6)", marginBottom: 14 }} />}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px" }}>{albumName}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{artistName} · {songs.length} songs · {formatTime(totalDuration)}</div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, #06060a)" }} />
      </div>

      {/* Play button */}
      {songs.length > 0 && (
        <div style={{ padding: "12px 20px 8px", display: "flex", gap: 10 }}>
          <button onClick={() => playSong(songs[0], songs)} style={{ flex: 1, padding: "12px", borderRadius: 14, background: firstSong?.color || "#C77DFF", border: "none", cursor: "pointer", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
            Play Album
          </button>
        </div>
      )}

      <div style={{ padding: "8px 12px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 48, color: "rgba(255,255,255,0.4)" }}>
            <div style={{ fontSize: 28, animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</div>
          </div>
        ) : songs.map((song, i) => (
          <SongCard key={song.id} song={song} songs={songs} index={i} onLike={() => {}} onDownload={() => {}} />
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
