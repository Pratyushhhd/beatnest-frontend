import { createContext, useContext, useState, useEffect } from "react";

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("theme") !== "light"; } catch { return true; }
  });

  useEffect(() => {
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);

  const toggle = () => setDark(p => !p);

  const theme = dark ? {
    bg: "#06060a", bgCard: "rgba(255,255,255,0.04)", bgInput: "rgba(255,255,255,0.07)",
    border: "rgba(255,255,255,0.08)", text: "#ffffff", textSub: "rgba(255,255,255,0.45)",
    textMuted: "rgba(255,255,255,0.25)", miniPlayer: "rgba(10,10,18,0.96)", dark: true,
  } : {
    bg: "#f0f2f8", bgCard: "rgba(255,255,255,0.85)", bgInput: "rgba(255,255,255,0.9)",
    border: "rgba(0,0,0,0.08)", text: "#0a0a14", textSub: "rgba(0,0,0,0.5)",
    textMuted: "rgba(0,0,0,0.3)", miniPlayer: "rgba(240,242,248,0.96)", dark: false,
  };

  return <ThemeCtx.Provider value={{ dark, toggle, theme }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
