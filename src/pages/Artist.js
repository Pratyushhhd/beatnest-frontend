import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { usePlayer } from "../context/PlayerContext";
import SongCard from "../components/SongCard";

export default function Artist({ artistName, onBack }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayer();

  useEffect(() => {
    if (!artistName) return;
    setLoading(true);
    api.saavnSearch(artistName).then(results => {
      // Filter to songs by this artist
      const filtered = results.filter(s =>
        s.artist.toLowerCase().includes(artistName.toLowerCase())
      );
      setSongs(filtered.length > 0 ? filtered : results.slice(0, 10));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [artistName]);

  const firstSong = songs[0];

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* Hero */}
      <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
        {firstSong && (
          <img src={firstSong.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(20px) brightness(0.4)", transform: "scale(1.2)" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, #06060a 100%)" }} />
        <button onClick={onBack} style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,0.4)", border: "none", cursor: "pointer", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div style={{ position: "absolute", bottom: 16, left: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 4 }}>Artist</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>{artistName}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{songs.length} songs found</div>
        </div>
      </div>

      {/* Play all button */}
      {songs.length > 0 && (
        <div style={{ padding: "16px 20px 8px", display: "flex", gap: 10 }}>
          <button onClick={() => playSong(songs[0], songs)} style={{ flex: 1, padding: "12px", borderRadius: 14, background: songs[0]?.color || "#C77DFF", border: "none", cursor: "pointer", color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
            Play All
          </button>
        </div>
      )}

      {/* Songs */}
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
