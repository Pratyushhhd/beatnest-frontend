import { useState, useEffect , useRef} from "react";
import { usePlayer } from "../context/PlayerContext";
import { formatTime } from "../utils/helpers";
import { api } from "../utils/api";
import { Filesystem, Directory } from "@capacitor/filesystem";

function hexToRgb(hex) {
  if (!hex || hex.length < 7) return "255,255,255";
  return `${parseInt(hex.slice(1,3),16)}, ${parseInt(hex.slice(3,5),16)}, ${parseInt(hex.slice(5,7),16)}`;
}

export default function ExpandedPlayer({ onLike }) {
  const [likeAnim, setLikeAnim] = useState(false);
  const [volDragging, setVolDragging] = useState(false);
  const volBarRef = useRef(null);
  const {
    currentSong, isPlaying, elapsed, progress, volume, shuffle, repeat, expandPlayer,
    setIsPlaying, setVolume, setShuffle, setRepeat, setExpandPlayer, skipNext, skipPrev, seek, setShowQueue,
    toggleLike, isLiked, addDownload, isDownloaded,
  } = usePlayer();

  const [tab, setTab] = useState("player"); // player | lyrics
  const [lyrics, setLyrics] = useState(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dlDone, setDlDone] = useState(false);

  useEffect(() => {
    if (tab === "lyrics" && currentSong) {
      setLyrics(null);
      setLyricsLoading(true);
      api.getLyrics(currentSong.title, currentSong.artist)
        .then(d => { setLyrics(d.lyrics || "No lyrics found for this song."); setLyricsLoading(false); })
        .catch(() => { setLyrics("Could not load lyrics."); setLyricsLoading(false); });
    }
  }, [tab, currentSong?.id]);

  useEffect(() => { setDlDone(false); }, [currentSong?.id]);

  if (!expandPlayer || !currentSong) return null;
  const rgb = hexToRgb(currentSong.color);

  const handleDownload = async () => {
    if (!currentSong.audioUrl || isDownloaded(currentSong.id) || downloading) return;
    setDownloading(true);
    try {
      const audioUrl = currentSong.audioUrl.startsWith("http") ? currentSong.audioUrl : `https://beatnest-backend.onrender.com${currentSong.audioUrl}`;
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(",")[1]);
        reader.onerror = rej;
        reader.readAsDataURL(blob);
      });
      const fileName = `beatnest_${currentSong.id}.mp3`;
      await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Data,
      });
      addDownload({ ...currentSong, localPath: fileName });
      setDlDone(true);
    } catch (err) {
      console.error("Download failed:", err);
      addDownload(currentSong);
      setDlDone(true);
    }
    setDownloading(false);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * 100);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: `linear-gradient(175deg, rgba(${rgb},0.45) 0%, rgba(${rgb},0.1) 35%, #060609 65%)`,
      backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
      display: "flex", flexDirection: "column",
      maxWidth: 390, margin: "0 auto",
      animation: "slideUp 0.38s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <style>{`
        @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes shimmer { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px 0" }}>
        <button onClick={() => setExpandPlayer(false)} style={{ background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
        </button>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.07)", borderRadius: 20, padding: 3 }}>
          {["player","lyrics"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "5px 16px", borderRadius: 17, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, textTransform: "capitalize", transition: "all 0.2s", background: tab === t ? "rgba(255,255,255,0.15)" : "transparent", color: tab === t ? "#fff" : "rgba(255,255,255,0.4)" }}>
              {t === "lyrics" ? "🎤 Lyrics" : "🎵 Player"}
            </button>
          ))}
        </div>

        {/* Queue + Download */}
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => { setExpandPlayer(false); setShowQueue(true); }} style={{ background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }} title="Queue">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
          </button>
          <button onClick={handleDownload} title="Download" style={{ background: dlDone ? `rgba(${rgb},0.2)` : "rgba(255,255,255,0.08)", border: `1px solid ${dlDone ? currentSong.color : "rgba(255,255,255,0.1)"}`, cursor: "pointer", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {downloading ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill={currentSong.color} style={{ animation: "spin 1s linear infinite" }}><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
            ) : dlDone ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill={currentSong.color}><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M12 16l-5-5 1.4-1.4L11 13V4h2v9l2.6-3.4L17 11l-5 5zm-7 4h14v-2H5v2z"/></svg>
            )}
          </button>
        </div>
      </div>

      {tab === "lyrics" ? (
        /* ── LYRICS TAB ── */
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{currentSong.title}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>{currentSong.artist}</div>
          {lyricsLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: 28, animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</div>
              <div style={{ marginTop: 12, fontSize: 13 }}>Loading lyrics...</div>
            </div>
          ) : (
            <div style={{ fontSize: 14, lineHeight: 2, color: "rgba(255,255,255,0.8)", whiteSpace: "pre-wrap", fontWeight: 400 }}>
              {lyrics}
            </div>
          )}
        </div>
      ) : (
        /* ── PLAYER TAB ── */
        <>
          {/* Album Art */}
          <div style={{ display: "flex", justifyContent: "center", padding: "20px 24px 16px" }}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: -12, borderRadius: "50%", background: `radial-gradient(circle, rgba(${rgb},0.4) 0%, transparent 70%)`, animation: isPlaying ? "shimmer 3s ease-in-out infinite" : "none" }} />
              <img src={currentSong.cover} alt="" style={{ width: 230, height: 230, borderRadius: 26, objectFit: "cover", boxShadow: `0 28px 70px rgba(${rgb},0.55), 0 8px 24px rgba(0,0,0,0.5)`, transform: isPlaying ? "scale(1)" : "scale(0.93)", transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)", position: "relative", zIndex: 1 }} />
            </div>
          </div>

          {/* Song Info */}
          <div style={{ display: "flex", alignItems: "center", padding: "0 24px", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 750, letterSpacing: "-0.5px", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentSong.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 3, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentSong.artist} · {currentSong.album}</div>
            </div>
            <button onClick={() => {
                toggleLike(currentSong.id);
                onLike?.(currentSong.id);
                setLikeAnim(true);
                setTimeout(() => setLikeAnim(false), 600);
              }} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, flexShrink: 0, position: "relative" }}>
              <style>{`
                @keyframes likePopBig {
                  0% { transform: scale(1); }
                  30% { transform: scale(1.5); }
                  60% { transform: scale(0.85); }
                  100% { transform: scale(1); }
                }
                @keyframes likeParticle {
                  0% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
                  100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.3); }
                }
              `}</style>
              {likeAnim && isLiked(currentSong.id) && [0,1,2,3,4,5].map(i => (
                <span key={i} style={{
                  position: "absolute", top: "50%", left: "50%",
                  width: 6, height: 6, borderRadius: "50%",
                  background: currentSong.color,
                  pointerEvents: "none",
                  "--dx": `${Math.cos(i * 60 * Math.PI/180) * 20}px`,
                  "--dy": `${Math.sin(i * 60 * Math.PI/180) * 20}px`,
                  animation: "likeParticle 0.6s ease-out forwards",
                }} />
              ))}
              <svg width="24" height="24" viewBox="0 0 24 24"
                fill={isLiked(currentSong.id) ? currentSong.color : "none"}
                stroke={isLiked(currentSong.id) ? currentSong.color : "rgba(255,255,255,0.4)"}
                strokeWidth="2"
                style={{
                  display: "block",
                  animation: likeAnim ? "likePopBig 0.6s cubic-bezier(.36,.07,.19,.97) both" : "none",
                  filter: isLiked(currentSong.id) ? `drop-shadow(0 0 8px ${currentSong.color})` : "none",
                  transition: "filter 0.3s",
                }}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>

          {/* Seek */}
          <div style={{ padding: "16px 28px 4px" }}>
            <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, cursor: "pointer", position: "relative" }} onClick={handleSeek}>
              <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${currentSong.color}, ${currentSong.accent})`, borderRadius: 2, transition: "width 0.6s linear", position: "relative" }}>
                <div style={{ position: "absolute", right: -7, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, borderRadius: "50%", background: "#fff", boxShadow: `0 0 10px rgba(${rgb},0.8)` }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              <span>{formatTime(elapsed)}</span>
              <span>{formatTime(currentSong.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 24px" }}>
            <CtrlBtn active={shuffle} activeColor={currentSong.color} onClick={() => setShuffle(p => !p)}>
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
            </CtrlBtn>
            <CtrlBtn onClick={skipPrev} size={32} opacity={0.85}><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></CtrlBtn>
            <button onClick={() => setIsPlaying(p => !p)} style={{ width: 68, height: 68, borderRadius: "50%", background: `linear-gradient(145deg, ${currentSong.color}, ${currentSong.accent})`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 36px rgba(${rgb},0.65)`, transition: "transform 0.15s" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
                {isPlaying ? <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/> : <path d="M8 5v14l11-7z"/>}
              </svg>
            </button>
            <CtrlBtn onClick={skipNext} size={32} opacity={0.85}><path d="M6 18l8.5-6L6 6v12zm2-8.14 4.96 2.14L8 14.14V9.86zM16 6h2v12h-2z"/></CtrlBtn>
            <CtrlBtn active={repeat} activeColor={currentSong.color} onClick={() => setRepeat(p => !p)}>
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
            </CtrlBtn>
          </div>

          {/* Volume */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 32px 24px" }}>
            <style>{`
              @keyframes volPulse {
                0%,100% { transform: scale(1); }
                50% { transform: scale(1.3); }
              }
            `}</style>
            <svg width="15" height="15" viewBox="0 0 24 24"
              fill={volume === 0 ? currentSong.color : "rgba(255,255,255,0.3)"}
              style={{ transition: "fill 0.3s", flexShrink: 0 }}>
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <div ref={volBarRef}
              style={{ flex: 1, height: volDragging ? 6 : 4, background: "rgba(255,255,255,0.1)", borderRadius: 4, cursor: "pointer", transition: "height 0.15s", position: "relative" }}
              onClick={e => { const pct = (e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.offsetWidth; setVolume(Math.max(0, Math.min(1, pct))); }}
              onMouseDown={e => {
                setVolDragging(true);
                const bar = e.currentTarget;
                const move = ev => { const pct = (ev.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth; setVolume(Math.max(0, Math.min(1, pct))); };
                const up = () => { setVolDragging(false); window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
                window.addEventListener("mousemove", move);
                window.addEventListener("mouseup", up);
              }}
              onTouchStart={e => {
                setVolDragging(true);
                const bar = e.currentTarget;
                const move = ev => { const t = ev.touches[0]; const pct = (t.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth; setVolume(Math.max(0, Math.min(1, pct))); };
                const up = () => { setVolDragging(false); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", up); };
                window.addEventListener("touchmove", move);
                window.addEventListener("touchend", up);
              }}>
              <div style={{ height: "100%", width: `${volume * 100}%`, background: `linear-gradient(90deg, ${currentSong.color}, ${currentSong.accent})`, borderRadius: 4, position: "relative", transition: "width 0.05s" }}>
                <div style={{
                  position: "absolute", right: -7, top: "50%",
                  transform: `translateY(-50%) scale(${volDragging ? 1.4 : 1})`,
                  width: 14, height: 14, borderRadius: "50%",
                  background: "#fff",
                  boxShadow: `0 0 ${volDragging ? 14 : 6}px rgba(${rgb},0.9)`,
                  transition: "transform 0.15s, box-shadow 0.15s",
                }} />
              </div>
            </div>
            <svg width="17" height="17" viewBox="0 0 24 24"
              fill={volume > 0.6 ? currentSong.color : "rgba(255,255,255,0.3)"}
              style={{ transition: "fill 0.3s", flexShrink: 0, animation: volDragging && volume > 0.6 ? "volPulse 0.4s ease infinite" : "none" }}>
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          </div>
        </>
      )}
    </div>
  );
}

function CtrlBtn({ onClick, size=22, opacity=0.5, active, activeColor, children }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: active ? activeColor : `rgba(255,255,255,${opacity})`, filter: active ? `drop-shadow(0 0 6px ${activeColor})` : "none", transition: "all 0.2s" }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">{children}</svg>
    </button>
  );
}
