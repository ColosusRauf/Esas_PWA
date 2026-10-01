import React from "react";
import Sidebar from "../components/Sidebar.jsx";
import { totalOf } from "../data.js";

export default function Profile({ patientId, assessments, onNavigate, onLogout }) {
  const totals = assessments.map((a) => totalOf(a.answers));
  const avg = totals.length ? (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1) : "-";
  const rows = [
    ["Patient ID", patientId],
    ["Jumlah assessment", assessments.length],
    ["Rata-rata total skor", avg],
    ["Assessment terakhir", assessments[assessments.length - 1]?.tanggal ?? "-"],
  ];
  return (
    <div style={{ display: "flex", background: "var(--bg)", minHeight: "100vh" }}>
      <Sidebar active="profile" onNavigate={onNavigate} patientId={patientId} onLogout={onLogout} />
      <main style={{ flex: 1, padding: "22px 34px", maxWidth: 720 }}>
        <h2 style={{ fontSize: 20, margin: "0 0 4px", color: "var(--ink)" }}>Profil</h2>
        <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: "0 0 20px" }}>Informasi akun dan ringkasan pemantauan Anda</p>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--primary-soft)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18 }}>
              {String(patientId).slice(0, 2)}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "var(--ink)" }}>Pasien {patientId}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>Pasca kemoterapi</div>
            </div>
          </div>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderTop: "1px solid var(--border)", fontSize: 13.5 }}>
              <span style={{ color: "var(--ink-soft)" }}>{k}</span>
              <span style={{ fontWeight: 600, color: "var(--ink)" }}>{v}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
