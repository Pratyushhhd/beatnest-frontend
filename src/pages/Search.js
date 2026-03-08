import { useState, useEffect } from "react";
import { api } from "../utils/api";
import SongCard from "../components/SongCard";

const LANGUAGES = [
  { label: "Nepali", lang: "nepali", color: "#D63031", accent: "#FF7675" },
  { label: "Hindi", lang: "hindi", color: "#FF6B6B", accent: "#FFE66D" },
  { label: "English", lang: "english", color: "#4ECDC4", accent: "#A8E6CF" },
  { label: "Bollywood", lang: "bollywood", color: "#C77DFF", accent: "#E0AAFF" },
  { label: "Punjabi", lang: "punjabi", color: "#FF9F43", accent: "#FFEAA7" },
  { label: "Tamil", lang: "tamil", color: "#FD79A8", accent: "#FDCFE8" },
  { label: "Pop", lang: "pop hits", color: "#6C5CE7", accent: "#A29BFE" },
  { label: "Romantic", lang: "romantic", color: "#00B894", accent: "#55EFC4" },
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeGenre, setActiveGenre] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setActiveGenre(null); setError(null); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const [local, saavn] = await Promise.all([
          api.getSongs({ search: query }),
          api.saavnSearch(query),
        ]);
        setResults([...local, ...saavn]);
      } catch (e) {
        setError("Search failed. Check your connection.");
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const browseLanguage = async (lang) => {
    setQuery("");
    setActiveGenre(lang.label);
    setLoading(true);
    setError(null);
    try {
      const tracks = await api.saavnLanguage(lang.lang);
      setResults(tracks);
    } catch {
      setError("Could not load. Try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ paddingBottom: 8 }}>
      {/* Search Input */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.35)">
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Nepali, Hindi, English songs..."
            style={{ width: "100%", padding: "13px 40px 13px 44px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, color: "#fff", fontFamily: "inherit", fontSize: 14, outline: "none", transition: "border-color 0.2s" }}
            onFocus={(e) => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
          {query && (
            <button onClick={() => { setQuery(""); setResults([]); setActiveGenre(null); }} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* JioSaavn badge */}
      {!query && !activeGenre && (
        <div style={{ margin: "0 20px 16px", padding: "10px 14px", borderRadius: 12, background: "rgba(30,144,255,0.08)", border: "1px solid rgba(30,144,255,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🎵</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1E90FF" }}>Powered by JioSaavn</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Nepali, Hindi, English & more — full songs free</div>
          </div>
        </div>
      )}

      {/* Language Browse */}
      {!query && !activeGenre && (
        <div style={{ padding: "0 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 14, letterSpacing: "-0.3px" }}>Browse by Language</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {LANGUAGES.map((lang, i) => (
              <div key={lang.label} onClick={() => browseLanguage(lang)} style={{ height: 72, borderRadius: 16, cursor: "pointer", position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${lang.color}cc, ${lang.accent}88)`, display: "flex", alignItems: "flex-end", padding: "12px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.35)", animation: `fadeRow 0.4s ${i * 0.06}s both`, transition: "transform 0.15s" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{lang.label}</div>
                <div style={{ position: "absolute", right: -8, top: -8, fontSize: 48, opacity: 0.15 }}>♪</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back button */}
      {activeGenre && !query && (
        <div style={{ padding: "0 20px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => { setActiveGenre(null); setResults([]); }} style={{ background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          </button>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{activeGenre}</div>
        </div>
      )}

      {/* Results */}
      {(query || activeGenre) && (
        <div style={{ padding: "0 12px", marginTop: 4 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 48, color: "rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: 32, marginBottom: 10, display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</div>
              <div style={{ fontSize: 13 }}>Searching JioSaavn...</div>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>{error}</div>
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, fontWeight: 600 }}>No results found</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 8 }}>Try a different search term</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", padding: "0 4px 10px", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                <span>{results.length} results {query ? `for "${query}"` : `in ${activeGenre}`}</span>
                <span style={{ color: "#1E90FF", fontSize: 10, fontWeight: 700 }}>🎵 JioSaavn · Full songs</span>
              </div>
              {results.map((song, i) => (
                <SongCard key={song.id} song={song} songs={results} index={i} onLike={() => {}} onDownload={() => {}} />
              ))}
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeRow { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
