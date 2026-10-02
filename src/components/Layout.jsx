import React from "react";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import SyncBanner from "./SyncBanner.jsx";

export default function Layout({ active, patientId, onNavigate, onLogout, title, subtitle, children }) {
  return (
    <div className="shell" style={{ display: "flex", background: "var(--bg)", minHeight: "100vh" }}>
      <Sidebar active={active} onNavigate={onNavigate} patientId={patientId} onLogout={onLogout} />
      <main className="page page-fit">
        <Topbar patientId={patientId} />
        <SyncBanner />
        <h1 style={{ fontSize: 26, margin: "0 0 4px", color: "var(--ink)", letterSpacing: "-0.01em" }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 15, color: "var(--ink-soft)", margin: "0 0 clamp(12px, 2.4vh, 22px)" }}>{subtitle}</p>}
        {!subtitle && <div style={{ height: 14 }} />}
        <div className="fit-body">{children}</div>
      </main>
    </div>
  );
}
