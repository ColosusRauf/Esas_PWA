import React from "react";
import { Search, Bell, CalendarPlus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Sidebar from "../components/Sidebar.jsx";
import ScoreRing from "../components/ScoreRing.jsx";
import { DOMAINS, totalOf } from "../data.js";

export default function Dashboard({ patientId, assessments, onNavigate, onLogout, onStartAssessment }) {
  const latest = assessments[assessments.length - 1];
  const total = latest ? totalOf(latest.answers) : 0;

  const trend = assessments.slice(-7).map((a) => ({
    tanggal: a.tanggal.split(" ").slice(0, 2).join(" "),
    total: totalOf(a.answers),
  }));

  const topSymptoms = latest
    ? DOMAINS.map((d, i) => ({ ...d, v: latest.answers[i] })).sort((a, b) => b.v - a.v).slice(0, 5)
    : [];

  return (
    <div style={{ display: "flex", background: "var(--bg)", minHeight: "100vh" }}>
      <Sidebar active="dashboard" onNavigate={onNavigate} patientId={patientId} onLogout={onLogout} />

      <main style={{ flex: 1, padding: "22px 34px", maxWidth: 1040 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 9, background: "var(--surface)",
            border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px", width: 260
          }}>
            <Search size={15} color="var(--ink-soft)" />
            <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>Cari...</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Bell size={18} color="var(--ink-soft)" />
            <div style={{
              width: 34, height: 34, borderRadius: "50%", background: "var(--primary-soft)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5,
              fontWeight: 700, color: "var(--primary)"
            }}>
              {(patientId || "P001").slice(0, 2)}
            </div>
          </div>
        </div>

        <h1 style={{ fontSize: 22, margin: "0 0 4px", color: "var(--ink)" }}>Halo, Pasien {patientId}</h1>
        <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: "0 0 22px" }}>
          Tetap semangat! Kesehatan Anda adalah prioritas kami.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 13, background: "var(--primary-soft)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <CalendarPlus size={22} color="var(--primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>Assessment Hari Ini</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>Belum diisi</div>
              </div>
            </div>
            <button onClick={onStartAssessment} style={{
              marginTop: 16, width: "100%", background: "var(--primary)", color: "#fff", border: "none",
              borderRadius: 10, padding: "11px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer"
            }}>
              Mulai ESAS
            </button>
          </Card>

          <Card>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 14 }}>Ringkasan Skor</div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <ScoreRing value={total} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                {topSymptoms.length === 0 && (
                  <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>Belum ada data</span>
                )}
                {topSymptoms.map((s) => (
                  <div key={s.key} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span style={{ color: "var(--ink-soft)" }}>{s.label.split(" (")[0]}</span>
                    <span style={{ fontWeight: 600, color: "var(--ink)" }}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>Riwayat Assessment</span>
              <span onClick={() => onNavigate("history")} style={{ fontSize: 12.5, color: "var(--primary)", cursor: "pointer", fontWeight: 600 }}>
                Lihat Semua
              </span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ color: "var(--ink-soft)", textAlign: "left" }}>
                  <th style={{ fontWeight: 500, paddingBottom: 8 }}>Tanggal</th>
                  <th style={{ fontWeight: 500, paddingBottom: 8 }}>Total Skor</th>
                  <th style={{ fontWeight: 500, paddingBottom: 8 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...assessments].reverse().slice(0, 4).map((a) => (
                  <tr key={a.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px 0", color: "var(--ink)" }}>{a.tanggal}</td>
                    <td style={{ padding: "8px 0", color: "var(--ink)" }}>{totalOf(a.answers)}</td>
                    <td style={{ padding: "8px 0" }}>
                      <span style={{ color: "var(--mild)", fontWeight: 600 }}>● {a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 10 }}>
              Grafik Skor Terakhir
            </div>
            <div style={{ height: 170 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 4, right: 6, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 10.5, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10.5, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid var(--border)" }} />
                  <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3.5, fill: "var(--primary)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20
    }}>
      {children}
    </div>
  );
}
