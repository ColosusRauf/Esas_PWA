import React from "react";
import { LayoutDashboard, Users, BarChart3, ScrollText, LogOut, HeartPulse } from "lucide-react";

const ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "patients", label: "Pasien", icon: Users },
  { key: "analytics", label: "Analitik & Ekspor", icon: BarChart3 },
  { key: "logs", label: "Log aktivitas", icon: ScrollText, adminOnly: true },
];
const ROLE = { admin: "Admin", researcher: "Peneliti" };

export default function AdminSidebar({ active, onNavigate, session, onLogout }) {
  const base = {
    display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 10, border: "none",
    cursor: "pointer", textAlign: "left", fontSize: 14, background: "transparent",
  };
  return (
    <aside className="sidebar" style={{
      width: 220, flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", padding: "22px 14px", minHeight: "100vh",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 10px", marginBottom: 30 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <HeartPulse size={17} color="#fff" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 17, color: "var(--ink)" }}>ESAS</span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        {ITEMS.filter((it) => !it.adminOnly || session.role === "admin").map((it) => {
          const Icon = it.icon;
          const on = active === it.key;
          return (
            <button key={it.key} onClick={() => onNavigate(it.key)} style={{
              ...base, background: on ? "var(--primary-soft)" : "transparent",
              color: on ? "var(--primary)" : "var(--ink-soft)", fontWeight: on ? 600 : 500,
            }}>
              <Icon size={17} />
              {it.label}
            </button>
          );
        })}
        <button className="only-mobile" onClick={onLogout} style={{ ...base, color: "var(--severe)" }}>
          <LogOut size={17} />
          Keluar
        </button>
      </nav>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 }}>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", padding: "0 12px 10px" }}>
          <strong style={{ color: "var(--ink)" }}>{session.name || session.id}</strong>
          <div>{ROLE[session.role] || session.role}</div>
        </div>
        <button onClick={onLogout} style={{ ...base, width: "100%", color: "var(--severe)", fontWeight: 500 }}>
          <LogOut size={17} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
