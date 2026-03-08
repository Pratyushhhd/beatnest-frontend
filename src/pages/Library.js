import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { usePlayer } from "../context/PlayerContext";
import SongCard from "../components/SongCard";
import { formatTime } from "../utils/helpers";

export default function Library({ onOpenArtist, onOpenAlbum }) {
  const [playlists, setPlaylists] = useState([]);
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [tab, setTab] = useState("recent"); // recent | playlists
  const { recentlyPlayed, playSong } = usePlayer();

  useEffect(() => {
    api.getPlaylists().then(setPlaylists).catch(() => {});
  }, []);

  return (
    <div style={{ paddingBottom: 8 }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, padding: "16px 20px 12px" }}>
        {[["recent","🕐 Recent"],["playlists","📋 Playlists"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, transition: "all 0.2s", background: tab === key ? "#fff" : "rgba(255,255,255,0.07)", color: tab === key ? "#000" : "rgba(255,255,255,0.55)" }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "recent" && (
        <div>
          <div style={{ padding: "0 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Recently Played</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{recentlyPlayed.length} songs</div>
          </div>
          {recentlyPlayed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 600 }}>No recent songs</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 6 }}>Start listening to see history here</div>
            </div>
          ) : (
            <div style={{ padding: "0 12px" }}>
              {recentlyPlayed.map((song, i) => (
                <SongCard key={`${song.id}-${i}`} song={song} songs={recentlyPlayed} index={i} onLike={() => {}} onDownload={() => {}} onOpenArtist={onOpenArtist} onOpenAlbum={onOpenAlbum} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "playlists" && (
        <div>
          {activePlaylist ? (
            <div>
              <div style={{ padding: "0 20px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => setActivePlaylist(null)} style={{ background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                </button>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{activePlaylist.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{activePlaylist.songs?.length || 0} songs · {formatTime((activePlaylist.songs || []).reduce((a, s) => a + (s.duration || 0), 0))}</div>
                </div>
              </div>
              {activePlaylist.songs?.length > 0 && (
                <div style={{ padding: "0 20px 12px" }}>
                  <button onClick={() => playSong(activePlaylist.songs[0], activePlaylist.songs)} style={{ width: "100%", padding: "11px", borderRadius: 14, background: "#C77DFF", border: "none", cursor: "pointer", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>
                    ▶ Play All
                  </button>
                </div>
              )}
              <div style={{ padding: "0 12px" }}>
                {(activePlaylist.songs || []).map((song, i) => (
                  <SongCard key={song.id} song={song} songs={activePlaylist.songs} index={i} onLike={() => {}} onDownload={() => {}} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: "0 20px" }}>
              {playlists.map((pl, i) => (
                <div key={pl.id} onClick={() => setActivePlaylist(pl)} style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 14px", borderRadius: 16, cursor: "pointer", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 8, animation: `fadeRow 0.4s ${i * 0.06}s both` }}>
                  <img src={pl.cover} alt="" style={{ width: 54, height: 54, borderRadius: 12, objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{pl.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{pl.songs?.length || 0} songs</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                </div>
              ))}
              {playlists.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>No playlists yet</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes fadeRow{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
