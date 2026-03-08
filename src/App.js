import { useState } from "react";
import { PlayerProvider, usePlayer } from "./context/PlayerContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import BottomNav from "./components/BottomNav";
import MiniPlayer from "./components/MiniPlayer";
import ExpandedPlayer from "./components/ExpandedPlayer";
import QueueManager from "./components/QueueManager";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Offline from "./pages/Offline";
import Artist from "./pages/Artist";
import Album from "./pages/Album";
import Settings from "./pages/Settings";
import { api } from "./utils/api";

function AppShell() {
  const [tab, setTab] = useState("home");
  const [artistPage, setArtistPage] = useState(null);
  const [albumPage, setAlbumPage] = useState(null);
  const { currentSong, expandPlayer, setExpandPlayer, showQueue } = usePlayer();
  const { dark, toggle, theme } = useTheme();

  const accentColor = currentSong?.color || "#C77DFF";
  const accentColor2 = currentSong?.accent || "#9B59B6";

  const handleTabChange = (t) => { setTab(t); setExpandPlayer(false); setArtistPage(null); setAlbumPage(null); };
  const openArtist = (name) => { setArtistPage(name); setAlbumPage(null); };
  const openAlbum = (album, artist) => { setAlbumPage({ album, artist }); setArtistPage(null); };

  return (
    <div style={{
      width: "100%", maxWidth: 390, minHeight: "100dvh", margin: "0 auto",
      backgroundColor: theme.bg,
      backgroundImage: currentSong
        ? `radial-gradient(ellipse at 15% 10%, ${accentColor}${dark ? "22" : "18"} 0%, transparent 55%), radial-gradient(ellipse at 85% 85%, ${accentColor2}${dark ? "18" : "12"} 0%, transparent 55%)`
        : "none",
      color: theme.text,
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      position: "relative", overflowX: "hidden",
      transition: "background-color 0.3s",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300..700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { display: none; }
        input, select, button { font-family: inherit; }
        select option { background: ${dark ? "#1a1a2e" : "#f0f2f8"}; }
      `}</style>



      {/* Header */}
      <div style={{ padding: "14px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: theme.textMuted, marginBottom: 3 }}>
            {artistPage ? "Artist" : albumPage ? "Album" : tab === "home" ? "Welcome back" : tab === "search" ? "Discover" : tab === "library" ? "Collection" : "Downloaded"}
          </div>
          <div style={{ fontSize: 26, fontWeight: 780, letterSpacing: "-0.7px", color: theme.text }}>
            Beat<span style={{ color: accentColor }}>Nest</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Theme toggle */}
          <button onClick={toggle} style={{ width: 36, height: 36, borderRadius: "50%", background: theme.bgCard, border: `1px solid ${theme.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
            {dark ? "☀️" : "🌙"}
          </button>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg, ${accentColor}, ${accentColor2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 4px 18px ${accentColor}60`, flexShrink: 0 }}>
            🎧
          </div>
        </div>
      </div>

      {/* Page content */}
      <div style={{ paddingTop: 8, paddingBottom: 160, overflowY: "auto", minHeight: "calc(100dvh - 120px)" }}>
        {artistPage ? (
          <Artist artistName={artistPage} onBack={() => setArtistPage(null)} />
        ) : albumPage ? (
          <Album albumName={albumPage.album} artistName={albumPage.artist} onBack={() => setAlbumPage(null)} />
        ) : (
          <>
            {tab === "home" && <Home onOpenArtist={openArtist} onOpenAlbum={openAlbum} />}
            {tab === "search" && <Search onOpenArtist={openArtist} onOpenAlbum={openAlbum} />}
            {tab === "library" && <Library />}
            {tab === "offline" && <Offline />}
            {tab === "settings" && <Settings />}
          </>
        )}
      </div>

      <MiniPlayer />
      <ExpandedPlayer onLike={(id) => api.likeSong(id)} />
      {showQueue && <QueueManager />}
      <BottomNav activeTab={tab} onChange={handleTabChange} accentColor={accentColor} />
    </div>
  );
}

function AudioElement() {
  const { setAudioElement } = usePlayer();
  return (
    <audio
      ref={setAudioElement}
      crossOrigin="anonymous"
      style={{ display: "none" }}
      playsInline
      preload="auto"
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <AudioElement />
        <AppShell />
      </PlayerProvider>
    </ThemeProvider>
  );
}
