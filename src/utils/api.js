const BASE = process.env.REACT_APP_API_URL || "https://beatnest-backend.onrender.com/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  // Local songs
  getSongs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/songs${q ? "?" + q : ""}`);
  },
  getFeatured: () => request("/songs/featured"),
  getSong: (id) => request(`/songs/${id}`),
  likeSong: (id) => request(`/songs/${id}/like`, { method: "POST" }),
  downloadSong: (id) => request(`/songs/${id}/download`, { method: "POST" }),
  removeDownload: (id) => request(`/songs/${id}/download`, { method: "DELETE" }),
  getDownloads: () => request("/downloads"),
  getPlaylists: () => request("/playlists"),
  createPlaylist: (data) => request("/playlists", { method: "POST", body: JSON.stringify(data) }),
  addToPlaylist: (plId, songId) =>
    request(`/playlists/${plId}/songs`, { method: "POST", body: JSON.stringify({ songId }) }),
  getGenres: () => request("/genres"),
  getStats: () => request("/stats"),

  // Lyrics
  getLyrics: (title, artist) => request(`/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist || "")}`),

  // Download
  saavnDownload: (url, title) => `${process.env.REACT_APP_API_URL || "http://localhost:4000/api"}/saavn/download?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title || "song")}`,

  // JioSaavn
  saavnSearch: (q) => request(`/saavn/search?q=${encodeURIComponent(q)}`),
  saavnTrending: () => request("/saavn/trending"),
  saavnLanguage: (lang) => request(`/saavn/language?lang=${encodeURIComponent(lang)}`),
};
