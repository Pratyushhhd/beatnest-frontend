export default function BottomNav({ activeTab, onChange, accentColor }) {
  const tabs = [
    { id: "home", label: "Home", path: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" },
    { id: "search", label: "Search", path: "M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" },
    { id: "library", label: "Library", path: "M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" },
    { id: "offline", label: "Offline", path: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" },
    { id: "settings", label: "Settings", path: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" },
  ];

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 390, zIndex: 60,
      background: "rgba(8,8,14,0.94)",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      display: "flex", justifyContent: "space-around",
      padding: "10px 0 22px",
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, flex: 1, padding: "2px 0", transition: "all 0.2s",
          }}>
            <div style={{ width: 32, height: 28, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: isActive ? `${accentColor}22` : "transparent", transition: "background 0.25s" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isActive ? accentColor : "rgba(255,255,255,0.3)"} style={{ transition: "fill 0.25s" }}>
                <path d={tab.path} />
              </svg>
            </div>
            <span style={{ fontSize: 9.5, fontWeight: isActive ? 700 : 500, letterSpacing: "0.04em", textTransform: "uppercase", color: isActive ? accentColor : "rgba(255,255,255,0.3)", transition: "color 0.25s" }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
