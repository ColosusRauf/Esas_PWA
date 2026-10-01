import React from "react";
import { Search, Bell, User } from "lucide-react";
import Sidebar from "./Sidebar.jsx";

function Topbar({ patientId }) {
  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: "clamp(10px, 2vh, 22px)" }}>
      <label className="topbar-search" style={{
        display: "flex", alignItems: "center", gap: 12, background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "0 18px", height: 44, width: "min(420px, 100%)", cursor: "text",
      }}>
        <Search size={19} color="var(--ink-soft)" />
        <input placeholder="Cari..." aria-label="Cari" style={{
          border: "none", outline: "none", background: "transparent", fontSize: 15, color: "var(--ink)", width: "100%",
        }} />
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginLeft: "auto" }}>
        <button aria-label="Notifikasi" style={{
          width: 44, height: 44, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
        }}>
          <Bell size={21} color="var(--ink-soft)" />
        </button>
        <div style={{
          display: "flex", alignItems: "center", gap: 12, background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 999, padding: "6px 18px 6px 6px",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: "var(--primary-soft)", color: "var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14.5, fontWeight: 700, flexShrink: 0,
          }}>
            <User size={20} />
          </div>
          <div className="user-text" style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>{patientId}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>Pasien</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ active, patientId, onNavigate, onLogout, title, subtitle, children }) {
  return (
    <div className="shell" style={{ display: "flex", background: "var(--bg)", minHeight: "100vh" }}>
      <Sidebar active={active} onNavigate={onNavigate} patientId={patientId} onLogout={onLogout} />
      <main className="page page-fit">
        <Topbar patientId={patientId} />
        <h1 style={{ fontSize: 26, margin: "0 0 4px", color: "var(--ink)", letterSpacing: "-0.01em" }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 15, color: "var(--ink-soft)", margin: "0 0 clamp(12px, 2.4vh, 22px)" }}>{subtitle}</p>}
        {!subtitle && <div style={{ height: 14 }} />}
        <div className="fit-body">{children}</div>
      </main>
    </div>
  );
}
