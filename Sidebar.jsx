import React from "react";
import { useLang } from "../i18n.jsx";
import { LayoutDashboard, ClipboardList, History, User, Settings, LogOut, HeartPulse } from "lucide-react";

const ITEMS = [
  { key: "dashboard", label: "nav.dashboard", icon: LayoutDashboard },
  { key: "assessment", label: "nav.assessment", icon: ClipboardList },
  { key: "history", label: "nav.history", icon: History },
  { key: "profile", label: "nav.profile", icon: User },
  { key: "settings", label: "nav.settings", icon: Settings },
];

export default function Sidebar({ active, onNavigate, patientId, onLogout }) {
  const { t } = useLang();
  return (
    <aside className="sidebar" style={{
      width: 248, flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", padding: "22px 16px", minHeight: "100vh"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 10px", marginBottom: 26 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11, background: "var(--primary)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <HeartPulse size={22} color="#fff" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 22, color: "var(--ink)" }}>ESAS</span>
      </div>

      <nav aria-label={t("nav.main")} style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        {ITEMS.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.key;
          return (
            <button
              key={it.key}
              onClick={() => onNavigate(it.key)}
              style={{
                display: "flex", alignItems: "center", gap: 13, padding: "13px 16px",
                borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
                background: isActive ? "var(--primary-soft)" : "transparent",
                color: isActive ? "var(--primary)" : "var(--ink-soft)",
                fontWeight: isActive ? 600 : 500, fontSize: 15.5,
              }}
            >
              <Icon size={20} />
              {t(it.label)}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 }}>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", padding: "0 12px 10px" }}>
          {t("common.patient")} <strong style={{ color: "var(--ink)" }}>{patientId || "P001"}</strong>
        </div>
        <button
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 13, padding: "13px 16px", width: "100%",
            borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
            background: "transparent", color: "var(--severe)", fontSize: 15.5, fontWeight: 500
          }}
        >
          <LogOut size={20} />
          {t("nav.logout")}
        </button>
      </div>
    </aside>
  );
}
