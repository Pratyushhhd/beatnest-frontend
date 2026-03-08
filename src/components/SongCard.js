import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { formatTime, formatPlays } from "../utils/helpers";
import { api } from "../utils/api";

function hexToRgb(hex) {
  if (!hex || hex.length < 7) return "255,255,255";
  return `${parseInt(hex.slice(1,3),16)}, ${parseInt(hex.slice(3,5),16)}, ${parseInt(hex.slice(5,7),16)}`;
}

export default function SongCard({ song, songs, onLike, onDownload, index, onOpenArtist, onOpenAlbum }) {
  const [likeAnim, setLikeAnim] = useState(false);
  const { playSong, currentSong, isPlaying, toggleLike, isLiked, addDownload, removeDownload, isDownloaded } = usePlayer();
  const [dlDone, setDlDone] = useState(false);
  const [dlLoading, setDlLoading] = useState(false);
  const isActive = currentSong?.id === song.id;
  const rgb = hexToRgb(song.color);

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (isDownloaded(song.id)) { removeDownload(song.id); return; }
    if (dlLoading || !song.audioUrl) return;
    setDlLoading(true);
    try {
      // Fetch audio as base64
      const audioUrl = song.audioUrl.startsWith("http") ? song.audioUrl : `https://beatnest-backend.onrender.com${song.audioUrl}`;
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(",")[1]);
        reader.onerror = rej;
        reader.readAsDataURL(blob);
      });
      const fileName = `beatnest_${song.id}.mp3`;
      await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Data,
      });
      // Save song with local file path
      addDownload({ ...song, localPath: fileName });
      setDlDone(true);
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback: save song metadata only
      addDownload(song);
      setDlDone(true);
    }
    setDlLoading(false);
  };

  return (
    <div onClick={() => playSong(song, songs)} style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "9px 12px", borderRadius: 16, cursor: "pointer",
      background: isActive ? `linear-gradient(135deg, rgba(${rgb},0.18), rgba(${rgb},0.05))` : "rgba(255,255,255,0.02)",
      border: `1px solid ${isActive ? `rgba(${rgb},0.35)` : "rgba(255,255,255,0.04)"}`,
      transition: "all 0.25s", marginBottom: 5,
      animation: `fadeRow 0.4s ${(index || 0) * 0.04}s both`,
    }}>
      <style>{`@keyframes fadeRow{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}`}</style>

      {/* Cover */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img src={song.cover} alt="" style={{ width: 48, height: 48, borderRadius: 11, objectFit: "cover", boxShadow: isActive ? `0 6px 20px rgba(${rgb},0.55)` : "0 2px 8px rgba(0,0,0,0.35)", transition: "box-shadow 0.3s" }} />
        {isActive && isPlaying && (
          <div style={{ position: "absolute", inset: 0, borderRadius: 11, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PlayingDots color={song.color} />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 650, color: isActive ? song.color : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "color 0.3s" }}>
          {song.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
          <span onClick={(e) => { e.stopPropagation(); onOpenArtist?.(song.artist); }}
            style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: onOpenArtist ? "pointer" : "default", textDecoration: onOpenArtist ? "underline" : "none", textDecorationColor: "rgba(255,255,255,0.2)" }}>
            {song.artist}
          </span>
          {song.album && onOpenAlbum && (
            <>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>·</span>
              <span onClick={(e) => { e.stopPropagation(); onOpenAlbum?.(song.album, song.artist); }}
                style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer", textDecoration: "underline", textDecorationColor: "rgba(255,255,255,0.15)", maxWidth: 80 }}>
                {song.album}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Duration */}
      <div style={{ textAlign: "right", flexShrink: 0, marginRight: 2 }}>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{formatTime(song.duration)}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>{formatPlays(song.plays)}</div>
      </div>

      {/* Like */}
      <button onClick={(e) => {
          e.stopPropagation();
          toggleLike(song.id);
          onLike?.(song.id);
          setLikeAnim(true);
          setTimeout(() => setLikeAnim(false), 500);
        }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0, position: "relative" }}>
        <style>{`
          @keyframes scBeat {
            0% { transform: scale(1); }
            25% { transform: scale(1.45); }
            50% { transform: scale(0.9); }
            75% { transform: scale(1.15); }
            100% { transform: scale(1); }
          }
        `}</style>
        <svg width="17" height="17" viewBox="0 0 24 24"
          fill={isLiked(song.id) ? song.color : "none"}
          stroke={isLiked(song.id) ? song.color : "rgba(255,255,255,0.28)"}
          strokeWidth="2"
          style={{
            display: "block",
            animation: likeAnim ? "scBeat 0.5s cubic-bezier(.36,.07,.19,.97) both" : "none",
            filter: isLiked(song.id) ? `drop-shadow(0 0 4px ${song.color})` : "none",
            transition: "filter 0.3s",
          }}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>

      {/* Download */}
      <button onClick={handleDownload} title="Download MP3" style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: dlDone ? `rgba(${rgb},0.15)` : "rgba(255,255,255,0.05)", border: `1.5px solid ${dlDone ? song.color : "rgba(255,255,255,0.12)"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s" }}>
        {dlLoading ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill={song.color} style={{ animation: "spin 1s linear infinite" }}><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
        ) : dlDone ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill={song.color}><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)"><path d="M12 16l-5-5 1.4-1.4L11 13V4h2v9l2.6-3.4L17 11l-5 5zm-7 4h14v-2H5v2z"/></svg>
        )}
      </button>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function PlayingDots({ color }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 18 }}>
      {[0,1,2].map(i => <div key={i} style={{ width: 3, borderRadius: 2, background: color, animation: `dot 0.8s ${i*0.15}s ease-in-out infinite alternate` }} />)}
      <style>{`@keyframes dot{from{height:3px}to{height:16px}}`}</style>
    </div>
  );
}
