import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { useSongs } from "../hooks/useSongs";
import { usePlayer } from "../context/PlayerContext";
import SongCard from "../components/SongCard";
import { formatPlays } from "../utils/helpers";

function hexToRgb(hex) {
  if (!hex || hex.length < 7) return "255,255,255";
  return `${parseInt(hex.slice(1,3),16)}, ${parseInt(hex.slice(3,5),16)}, ${parseInt(hex.slice(5,7),16)}`;
}

export default function Home({ onOpenArtist, onOpenAlbum }) {
  const [featured, setFeatured] = useState([]);
  const [saavnTrending, setSaavnTrending] = useState([]);
  const [genres, setGenres] = useState(["All"]);
  const [activeGenre, setActiveGenre] = useState("All");
  const [sort, setSort] = useState("plays");
  const { songs, loading, toggleLike, toggleDownload } = useSongs({ genre: activeGenre === "All" ? undefined : activeGenre, sort });
  const { playSong, currentSong } = usePlayer();
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.getFeatured().then(setFeatured).catch(() => {});
    api.getGenres().then(setGenres).catch(() => {});
    api.getStats().then(setStats).catch(() => {});
    api.saavnTrending().then(setSaavnTrending).catch(() => {});
  }, []);

  return (
    <div style={{ paddingBottom: 8 }}>
      {/* Stats */}
      {stats && (
        <div style={{ display: "flex", gap: 10, padding: "16px 20px 0", animation: "fadeUp 0.5s both" }}>
          {[{ label: "Tracks", val: stats.totalSongs }, { label: "Plays", val: formatPlays(stats.totalPlays) }, { label: "Genres", val: stats.genres }, { label: "Liked", val: stats.totalLiked }].map((s) => (
            <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 0", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 16, fontWeight: 750, color: "#fff", letterSpacing: "-0.5px" }}>{s.val}</div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* My Music */}
      {featured.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 12px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px", color: "#fff" }}>My Music</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>The Edge Band</div>
          </div>
          <div style={{ overflowX: "auto", display: "flex", gap: 14, padding: "4px 20px 8px", scrollSnapType: "x mandatory" }}>
            {featured.map((song) => (
              <FeaturedCard key={song.id} song={song} onPlay={() => playSong(song, featured)} isActive={currentSong?.id === song.id} />
            ))}
          </div>
        </div>
      )}

      {/* JioSaavn Trending */}
      {saavnTrending.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 12px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px", color: "#fff" }}>Trending Now</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 12 }}>🎵</span>
              <div style={{ fontSize: 11, color: "#1E90FF", fontWeight: 600 }}>JioSaavn</div>
            </div>
          </div>
          <div style={{ overflowX: "auto", display: "flex", gap: 14, padding: "4px 20px 8px", scrollSnapType: "x mandatory" }}>
            {saavnTrending.map((song) => (
              <FeaturedCard key={song.id} song={song} onPlay={() => playSong(song, saavnTrending)} isActive={currentSong?.id === song.id} isSaavn />
            ))}
          </div>
        </div>
      )}

      {/* Genre filter */}
      <div style={{ overflowX: "auto", display: "flex", gap: 8, padding: "16px 20px 12px", scrollbarWidth: "none" }}>
        {genres.map((g) => (
          <button key={g} onClick={() => setActiveGenre(g)} style={{ flexShrink: 0, padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, transition: "all 0.2s", background: activeGenre === g ? "#fff" : "rgba(255,255,255,0.07)", color: activeGenre === g ? "#000" : "rgba(255,255,255,0.55)" }}>
            {g}
          </button>
        ))}
      </div>

      {/* Song list */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 10px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>My Songs</div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 8px", fontFamily: "inherit", fontSize: 11, cursor: "pointer", outline: "none" }}>
          <option value="plays">Most Played</option>
          <option value="title">A–Z</option>
          <option value="recent">Newest</option>
        </select>
      </div>

      <div style={{ padding: "0 12px" }}>
        {loading ? <LoadingRows /> : songs.map((song, i) => (
          <SongCard key={song.id} song={song} songs={songs} index={i} onLike={toggleLike} onDownload={toggleDownload} onOpenArtist={onOpenArtist} onOpenAlbum={onOpenAlbum} />
        ))}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function FeaturedCard({ song, onPlay, isActive, isSaavn }) {
  const rgb = hexToRgb(song.color);
  return (
    <div onClick={onPlay} style={{ flexShrink: 0, width: 210, height: 130, borderRadius: 22, cursor: "pointer", background: `linear-gradient(135deg, ${song.color}dd, ${song.accent}99)`, position: "relative", overflow: "hidden", scrollSnapAlign: "start", boxShadow: isActive ? `0 8px 36px rgba(${rgb},0.7)` : `0 6px 24px rgba(${rgb},0.35)`, transition: "all 0.3s", transform: isActive ? "scale(1.03)" : "scale(1)", border: isActive ? "1.5px solid rgba(255,255,255,0.3)" : "1.5px solid transparent" }}>
      <img src={song.cover} alt="" style={{ position: "absolute", right: -18, bottom: -10, width: 120, height: 120, borderRadius: 18, opacity: 0.75, transform: "rotate(-8deg)", objectFit: "cover" }} />
      <div style={{ position: "absolute", top: 14, left: 14, right: 70 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", background: "rgba(0,0,0,0.25)", padding: "3px 8px", borderRadius: 20, display: "inline-block", marginBottom: 8 }}>
          {isSaavn ? "🎵 Trending" : "🔥 Featured"}
        </div>
        <div style={{ fontSize: 15, fontWeight: 750, lineHeight: 1.2, color: "#fff" }}>{song.title}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{song.artist}</div>
      </div>
    </div>
  );
}

function LoadingRows() {
  return (
    <div style={{ padding: "0 2px" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 13, padding: "10px 14px", marginBottom: 5, borderRadius: 16, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ width: 50, height: 50, borderRadius: 12, background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 13, borderRadius: 6, background: "rgba(255,255,255,0.06)", marginBottom: 8, width: "60%", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 10, borderRadius: 6, background: "rgba(255,255,255,0.04)", width: "40%", animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
        </div>
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}`}</style>
    </div>
  );
}
