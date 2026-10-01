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
    display: "flex", alignItems: "center", gap: 13, padding: "13px 16px", borderRadius: 10, border: "none",
    cursor: "pointer", textAlign: "left", fontSize: 15.5, background: "transparent",
  };
  return (
    <aside className="sidebar" style={{
      width: 264, flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", padding: "28px 18px", minHeight: "100vh",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 10px", marginBottom: 38 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <HeartPulse size={22} color="#fff" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 22, color: "var(--ink)" }}>ESAS</span>
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
              <Icon size={20} />
              {it.label}
            </button>
          );
        })}
        <button className="only-mobile" onClick={onLogout} style={{ ...base, color: "var(--severe)" }}>
          <LogOut size={20} />
          Keluar
        </button>
      </nav>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 }}>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", padding: "0 12px 10px" }}>
          <strong style={{ color: "var(--ink)" }}>{session.name || session.id}</strong>
          <div>{ROLE[session.role] || session.role}</div>
        </div>
        <button onClick={onLogout} style={{ ...base, width: "100%", color: "var(--severe)", fontWeight: 500 }}>
          <LogOut size={20} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
