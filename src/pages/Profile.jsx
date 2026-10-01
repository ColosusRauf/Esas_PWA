import React from "react";
import { ClipboardCheck, Gauge, CalendarClock, User } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { Card } from "../components/ui.jsx";
import { totalOf } from "../data.js";

export default function Profile({ patientId, assessments, onNavigate, onLogout }) {
  const totals = assessments.map((a) => totalOf(a.answers));
  const avg = totals.length ? (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1) : "-";
  const last = assessments[assessments.length - 1]?.tanggal ?? "-";

  const stats = [
    { icon: ClipboardCheck, label: "Jumlah assessment", value: assessments.length },
    { icon: Gauge, label: "Rata-rata total skor", value: avg },
    { icon: CalendarClock, label: "Assessment terakhir", value: last },
  ];

  return (
    <Layout active="profile" patientId={patientId} onNavigate={onNavigate} onLogout={onLogout}
      title="Profil" subtitle="Informasi akun dan ringkasan pemantauan Anda.">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 380px) 1fr", gap: 24, alignItems: "start" }} className="profile-grid">
        <Card style={{ textAlign: "center", padding: 36 }}>
          <div style={{
            width: 104, height: 104, borderRadius: "50%", background: "var(--primary-soft)", color: "var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 36, margin: "0 auto 18px",
          }}>
            <User size={46} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>Pasien {patientId}</div>
          <div style={{ fontSize: 15, color: "var(--ink-soft)", marginTop: 4 }}>Pasca kemoterapi</div>
          <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: 15 }}>
            <span style={{ color: "var(--ink-soft)" }}>Patient ID</span>
            <strong style={{ color: "var(--ink)" }}>{patientId}</strong>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
          {stats.map((s) => (
            <Card key={s.label} style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <div style={{ width: 58, height: 58, borderRadius: 16, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <s.icon size={27} color="var(--primary)" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5, color: "var(--ink-soft)" }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>{s.value}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
