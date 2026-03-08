import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const ACCENT = "#C77DFF";
const EMAIL = "pratyushmaharjan90@gmail.com"; 

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", padding: "0 20px", marginBottom: 8 }}>{title}</div>
      <div style={{ margin: "0 16px", background: "rgba(255,255,255,0.04)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

function Row({ icon, label, sub, onClick, right, noBorder }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", borderBottom: noBorder ? "none" : "1px solid rgba(255,255,255,0.05)", cursor: onClick ? "pointer" : "default", transition: "background 0.15s" }}
      onMouseEnter={e => onClick && (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{sub}</div>}
      </div>
      {right || (onClick && <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>)}
    </div>
  );
}

export default function Settings() {
  const { dark, toggle } = useTheme();
  const [view, setView] = useState("main"); // main | contact | report | feedback
  const [form, setForm] = useState({ name: "", email: "", message: "", category: "Song not playing" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSending(true);
    // Simulate sending (replace with real email API if needed)
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setTimeout(() => { setSent(false); setForm({ name: "", email: "", message: "", category: "Song not playing" }); setView("main"); }, 2500);
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 12,
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff", fontFamily: "inherit", fontSize: 14, outline: "none",
    transition: "border-color 0.2s",
  };

  if (view !== "main") {
    const titles = { contact: "Contact Support", report: "Report a Problem", feedback: "Send Feedback" };
    const icons = { contact: "💬", report: "🐛", feedback: "💡" };
    const placeholders = {
      contact: "Describe your issue in detail...",
      report: "What went wrong? (e.g. song not playing, app crashed...)",
      feedback: "Share your ideas to improve BeatNest...",
    };
    const categories = ["Song not playing", "App crashing", "Wrong song info", "Copyright issue", "Other"];

    return (
      <div style={{ padding: "0 0 120px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px 20px" }}>
          <button onClick={() => { setView("main"); setSent(false); }} style={{ background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 750, color: "#fff" }}>{icons[view]} {titles[view]}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>We'll get back to you within 24 hours</div>
          </div>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "60px 24px", animation: "fadeUp 0.4s both" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 750, color: "#fff", marginBottom: 8 }}>Message Sent!</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Thank you. We'll respond to your email soon.</div>
          </div>
        ) : (
          <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.06em" }}>YOUR NAME *</div>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Pratyush Maharjan" style={inputStyle}
                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.06em" }}>YOUR EMAIL *</div>
              <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" type="email" style={inputStyle}
                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
            </div>
            {view === "report" && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.06em" }}>CATEGORY</div>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.06em" }}>MESSAGE *</div>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder={placeholders[view]} rows={5}
                style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
            </div>

            {/* Send via mailto fallback */}
            <button onClick={() => {
              const subject = encodeURIComponent(`[BeatNest] ${titles[view]}${view === "report" ? ` - ${form.category}` : ""}`);
              const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
              window.open(`mailto:${EMAIL}?subject=${subject}&body=${body}`, "_blank");
              setSending(true);
              setTimeout(() => { setSending(false); setSent(true); }, 1000);
            }} disabled={!form.name.trim() || !form.email.trim() || !form.message.trim() || sending}
              style={{ padding: "14px", borderRadius: 16, background: (!form.name.trim() || !form.email.trim() || !form.message.trim()) ? "rgba(255,255,255,0.08)" : `linear-gradient(135deg, ${ACCENT}, #9B59B6)`, border: "none", cursor: "pointer", color: "#fff", fontFamily: "inherit", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
              {sending ? "Sending..." : `Send ${titles[view]}`}
              {!sending && <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>}
            </button>

            <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
              Or email directly: <span style={{ color: ACCENT }}>{EMAIL}</span>
            </div>
          </div>
        )}
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* About card */}
      <div style={{ margin: "16px 16px 24px", padding: "24px 20px", borderRadius: 22, background: `linear-gradient(135deg, ${ACCENT}33, rgba(155,89,182,0.15))`, border: `1px solid ${ACCENT}44`, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎵</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>BeatNest</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>Version 1.0.0</div>
        <div style={{ marginTop: 16, padding: "10px 16px", background: "rgba(0,0,0,0.2)", borderRadius: 12, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
          © 2026 <span style={{ color: ACCENT, fontWeight: 700 }}>Pratyush Maharjan</span>. All rights reserved.{"\n"}
          Music powered by JioSaavn.
        </div>
      </div>

      <Section title="Appearance">
        <Row icon={dark ? "☀️" : "🌙"} label={dark ? "Switch to Light Mode" : "Switch to Dark Mode"} sub={dark ? "Currently in dark mode" : "Currently in light mode"} onClick={toggle} noBorder />
      </Section>

      <Section title="Support">
        <Row icon="💬" label="Contact Support" sub="Get help with the app" onClick={() => setView("contact")} />
        <Row icon="🐛" label="Report a Problem" sub="Song not playing, crashes, wrong info" onClick={() => setView("report")} />
        <Row icon="💡" label="Send Feedback" sub="Ideas & suggestions to improve BeatNest" onClick={() => setView("feedback")} noBorder />
      </Section>

      <Section title="About">
        <Row icon="👨‍💻" label="Developer" sub="Pratyush Maharjan" />
        <Row icon="📧" label="Email" sub={EMAIL} onClick={() => window.open(`mailto:${EMAIL}`)} />
        <Row icon="🎵" label="Music Source" sub="JioSaavn — Nepali, Hindi, English & more" />
        <Row icon="📱" label="Platform" sub="BeatNest Web App (PWA)" noBorder />
      </Section>

      <Section title="Legal">
        <Row icon="📄" label="Terms of Use" sub="Music streaming for personal use only" />
        <Row icon="🔒" label="Privacy Policy" sub="We don't collect or sell your data" noBorder />
      </Section>

      <div style={{ textAlign: "center", padding: "8px 0 16px", fontSize: 11, color: "rgba(255,255,255,0.2)", lineHeight: 1.8 }}>
        Made with ❤️ by Pratyush Maharjan{"\n"}
        © 2025 BeatNest. All rights reserved.
      </div>
    </div>
  );
}
