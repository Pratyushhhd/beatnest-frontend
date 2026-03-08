import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { api } from "../utils/api";
import { Filesystem, Directory } from "@capacitor/filesystem";

const PlayerCtx = createContext(null);
const LOCAL_SERVER = process.env.REACT_APP_API_URL?.replace("/api","") || "https://beatnest-backend.onrender.com";

function getAudioUrl(song) {
  if (!song?.audioUrl) return null;
  if (song.audioUrl.startsWith("http")) return song.audioUrl;
  return `${LOCAL_SERVER}${song.audioUrl}`;
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [expandPlayer, setExpandPlayer] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const [likedSongs, setLikedSongs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("likedSongs") || "[]"); } catch { return []; }
  });
  const [downloadedSongs, setDownloadedSongs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("downloadedSongs") || "[]"); } catch { return []; }
  });
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("recentlyPlayed") || "[]"); } catch { return []; }
  });

  // Audio element ref - set from DOM via setAudioElement
  const audioRef = useRef(null);
  const [audioReady, setAudioReady] = useState(false);

  const setAudioElement = useCallback((el) => {
    if (el && !audioRef.current) {
      audioRef.current = el;
      setAudioReady(true);
    }
  }, []);

  const currentSong = queue[queueIndex] || null;

  // Audio event listeners - only after audio element is ready
  useEffect(() => {
    if (!audioReady) return;
    const audio = audioRef.current;
    const onTimeUpdate = () => setElapsed(Math.floor(audio.currentTime));
    const onDurationChange = () => {
      if (!isNaN(audio.duration) && isFinite(audio.duration)) setDuration(Math.floor(audio.duration));
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
    };
  }, [audioReady]);

  const addToRecent = useCallback((song) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      const updated = [song, ...filtered].slice(0, 20);
      try { localStorage.setItem("recentlyPlayed", JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const loadAndPlay = useCallback(async (song) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    if (song.localPath) {
      try {
        const file = await Filesystem.readFile({ path: song.localPath, directory: Directory.Data });
        const blob = new Blob([base64ToArrayBuffer(file.data)], { type: "audio/mpeg" });
        audio.src = URL.createObjectURL(blob);
        audio.load();
        audio.play().catch(() => setIsPlaying(false));
        addToRecent(song);
        return;
      } catch (e) {}
    }
    const url = getAudioUrl(song);
    if (!url) { setIsPlaying(false); return; }
    audio.src = url;
    audio.load();
    audio.play().catch(() => setIsPlaying(false));
    addToRecent(song);
  }, [addToRecent]);

  const skipNext = useCallback(() => {
    if (!queue.length) return;
    const nextIdx = shuffle ? Math.floor(Math.random() * queue.length) : (queueIndex + 1) % queue.length;
    const next = queue[nextIdx];
    if (!next) return;
    setQueueIndex(nextIdx); setElapsed(0); setDuration(0); setIsPlaying(true);
    loadAndPlay(next);
  }, [queue, queueIndex, shuffle, loadAndPlay]);

  const skipPrev = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.currentTime > 3) { audio.currentTime = 0; setElapsed(0); return; }
    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    const prev = queue[prevIdx];
    if (!prev) return;
    setQueueIndex(prevIdx); setElapsed(0); setDuration(0); setIsPlaying(true);
    loadAndPlay(prev);
  }, [queueIndex, queue, loadAndPlay]);

  const seek = useCallback((pct) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = (pct / 100) * (audio.duration || 0);
    audio.currentTime = t; setElapsed(Math.floor(t));
  }, []);

  // Auto next song on end
  useEffect(() => {
    if (!audioReady) return;
    const audio = audioRef.current;
    const onEnded = () => {
      if (repeat) { audio.currentTime = 0; audio.play().catch(() => {}); }
      else skipNext();
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [audioReady, repeat, skipNext]);

  // Play/pause control
  useEffect(() => {
    if (!audioReady) return;
    const audio = audioRef.current;
    if (!audio.src || audio.src === window.location.href) return;
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying, audioReady]);

  // Volume control
  useEffect(() => {
    if (!audioReady) return;
    audioRef.current.volume = volume;
  }, [volume, audioReady]);

  // Media Session - notification with controls
  useEffect(() => {
    if (!currentSong || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title || "Unknown",
      artist: currentSong.artist || "Unknown",
      album: currentSong.album || "BeatNest",
      artwork: currentSong.cover ? [
        { src: currentSong.cover, sizes: "96x96",   type: "image/jpeg" },
        { src: currentSong.cover, sizes: "128x128", type: "image/jpeg" },
        { src: currentSong.cover, sizes: "256x256", type: "image/jpeg" },
        { src: currentSong.cover, sizes: "512x512", type: "image/jpeg" },
      ] : [],
    });
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [currentSong, isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler("nexttrack", skipNext);
    navigator.mediaSession.setActionHandler("previoustrack", skipPrev);
    navigator.mediaSession.setActionHandler("seekto", (d) => {
      if (d.seekTime != null) seek((d.seekTime / (audioRef.current?.duration || 1)) * 100);
    });
  }, [skipNext, skipPrev, seek]);

  const playSong = useCallback((song, songList = null) => {
    if (songList) setQueue(songList);
    const list = songList || queue;
    const idx = list.findIndex(s => s.id === song.id);
    if (currentSong?.id === song.id) { setIsPlaying(p => !p); return; }
    setQueueIndex(idx === -1 ? 0 : idx);
    setElapsed(0); setDuration(0); setIsPlaying(true);
    loadAndPlay(song);
    if (song.source === "local") api.getSong(song.id).catch(() => {});
  }, [queue, currentSong, loadAndPlay]);

  const playFromQueue = useCallback((idx) => {
    const song = queue[idx];
    if (!song) return;
    setQueueIndex(idx); setElapsed(0); setDuration(0); setIsPlaying(true);
    loadAndPlay(song);
  }, [queue, loadAndPlay]);

  const toggleLike = useCallback((songId) => {
    setLikedSongs(prev => {
      const updated = prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId];
      try { localStorage.setItem("likedSongs", JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);
  const isLiked = useCallback((songId) => likedSongs.includes(songId), [likedSongs]);

  const addDownload = useCallback((song) => {
    setDownloadedSongs(prev => {
      if (prev.find(s => s.id === song.id)) return prev;
      const updated = [song, ...prev];
      try { localStorage.setItem("downloadedSongs", JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);
  const removeDownload = useCallback((songId) => {
    setDownloadedSongs(prev => {
      const updated = prev.filter(s => s.id !== songId);
      try { localStorage.setItem("downloadedSongs", JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);
  const isDownloaded = useCallback((songId) => downloadedSongs.some(s => s.id === songId), [downloadedSongs]);

  const progress = duration > 0 ? (elapsed / duration) * 100 : 0;

  return (
    <PlayerCtx.Provider value={{
      currentSong, queue, queueIndex, isPlaying, elapsed, progress, volume,
      shuffle, repeat, expandPlayer, duration, recentlyPlayed, showQueue,
      setIsPlaying, setVolume, setShuffle, setRepeat, setExpandPlayer, setShowQueue,
      playSong, skipNext, skipPrev, seek, playFromQueue,
      toggleLike, isLiked, likedSongs,
      addDownload, removeDownload, isDownloaded, downloadedSongs,
      setAudioElement,
    }}>
      {children}
    </PlayerCtx.Provider>
  );
}

export const usePlayer = () => useContext(PlayerCtx);
