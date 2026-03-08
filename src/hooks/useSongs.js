import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";

export function useSongs(params = {}) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const key = JSON.stringify(params);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getSongs(params);
      setSongs(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleLike = async (id) => {
    try {
      await api.likeSong(id);
      setSongs((prev) => prev.map((s) => s.id === id ? { ...s, liked: !s.liked } : s));
    } catch {}
  };

  const toggleDownload = async (id, isDownloaded) => {
    try {
      if (isDownloaded) await api.removeDownload(id);
      else await api.downloadSong(id);
      setSongs((prev) => prev.map((s) => s.id === id ? { ...s, downloaded: !isDownloaded } : s));
    } catch {}
  };

  return { songs, loading, error, refetch: fetch, toggleLike, toggleDownload };
}
