import React from "react";
import { LayoutDashboard, ClipboardList, History, User, Settings, LogOut, HeartPulse } from "lucide-react";

const ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "assessment", label: "Assessment", icon: ClipboardList },
  { key: "history", label: "Riwayat", icon: History },
  { key: "profile", label: "Profil", icon: User },
  { key: "settings", label: "Pengaturan", icon: Settings },
];

export default function Sidebar({ active, onNavigate, patientId, onLogout }) {
  return (
    <aside className="sidebar" style={{
      width: 220, flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", padding: "22px 14px", minHeight: "100vh"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 10px", marginBottom: 30 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9, background: "var(--primary)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <HeartPulse size={17} color="#fff" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 17, color: "var(--ink)" }}>ESAS</span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        {ITEMS.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.key;
          return (
            <button
              key={it.key}
              onClick={() => onNavigate(it.key)}
              style={{
                display: "flex", alignItems: "center", gap: 11, padding: "10px 12px",
                borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
                background: isActive ? "var(--primary-soft)" : "transparent",
                color: isActive ? "var(--primary)" : "var(--ink-soft)",
                fontWeight: isActive ? 600 : 500, fontSize: 14,
              }}
            >
              <Icon size={17} />
              {it.label}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 }}>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", padding: "0 12px 10px" }}>
          Pasien <strong style={{ color: "var(--ink)" }}>{patientId || "P001"}</strong>
        </div>
        <button
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", width: "100%",
            borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
            background: "transparent", color: "var(--severe)", fontSize: 14, fontWeight: 500
          }}
        >
          <LogOut size={17} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
