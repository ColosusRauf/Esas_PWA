import React from "react";
import { CalendarPlus, CalendarCheck } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Layout from "../components/Layout.jsx";
import ScoreRing from "../components/ScoreRing.jsx";
import { Card, linkBtn, th, td, primaryBtn } from "../components/ui.jsx";
import { DOMAINS, totalOf } from "../data.js";

const todayLabel = () =>
  new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

export default function Dashboard({ patientId, assessments, onNavigate, onLogout, onStartAssessment }) {
  const latest = assessments[assessments.length - 1];
  const total = latest ? totalOf(latest.answers) : 0;
  const doneToday = !!latest && latest.tanggal === todayLabel();

  const trend = assessments.slice(-7).map((a) => ({
    tanggal: a.tanggal.split(" ").slice(0, 2).join(" "),
    total: totalOf(a.answers),
  }));

  const topSymptoms = latest
    ? DOMAINS.map((d, i) => ({ ...d, v: latest.answers[i] })).sort((a, b) => b.v - a.v).slice(0, 5)
    : [];

  const Icon = doneToday ? CalendarCheck : CalendarPlus;

  return (
    <Layout active="dashboard" patientId={patientId} onNavigate={onNavigate} onLogout={onLogout}
      title={`Halo, Pasien ${patientId}`} subtitle="Tetap semangat! Kesehatan Anda adalah prioritas kami.">
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18, background: "var(--primary-soft)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Icon size={30} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 20, color: "var(--ink)" }}>Assessment Hari Ini</div>
              <div style={{ fontSize: 15, color: doneToday ? "var(--mild)" : "var(--ink-soft)", marginTop: 3 }}>
                {doneToday ? "Sudah diisi hari ini" : "Belum diisi"}
              </div>
            </div>
          </div>
          <button onClick={onStartAssessment} style={{ ...primaryBtn, width: "100%", padding: "16px 20px", fontSize: 16.5, borderRadius: 14 }}>
            {doneToday ? "Isi lagi" : "Mulai ESAS"}
          </button>
        </Card>

        <Card title="Ringkasan Skor">
          <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
            <ScoreRing value={total} size={150} />
            <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 12 }}>
              {topSymptoms.length === 0 && <span style={{ fontSize: 15, color: "var(--ink-soft)" }}>Belum ada data</span>}
              {topSymptoms.map((s) => (
                <div key={s.key} style={{ display: "flex", justifyContent: "space-between", fontSize: 15.5 }}>
                  <span style={{ color: "var(--ink-soft)" }}>{s.label.split(" (")[0]}</span>
                  <span style={{ fontWeight: 700, color: "var(--ink)" }}>{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Riwayat Assessment" action={<button onClick={() => onNavigate("history")} style={linkBtn}>Lihat Semua</button>}>
          {assessments.length === 0 ? (
            <p style={{ fontSize: 15, color: "var(--ink-soft)", margin: 0 }}>Belum ada riwayat. Mulai assessment pertama Anda.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={th}>Tanggal</th><th style={th}>Total Skor</th><th style={th}>Status</th></tr></thead>
              <tbody>
                {[...assessments].reverse().slice(0, 5).map((a) => (
                  <tr key={a.id}>
                    <td style={td}>{a.tanggal}</td>
                    <td style={{ ...td, fontWeight: 600 }}>{totalOf(a.answers)}</td>
                    <td style={td}><span style={{ color: a.status === "Selesai" ? "var(--mild)" : "var(--moderate)", fontWeight: 600 }}>● {a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Grafik Skor Terakhir">
          <div style={{ height: 290 }} role="img" aria-label="Grafik total skor assessment terakhir">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 14, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="tanggal" tick={{ fontSize: 12.5, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12.5, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} width={36} />
                <Tooltip contentStyle={{ fontSize: 13.5, borderRadius: 12, border: "1px solid var(--border)" }} formatter={(v) => [v, "Total skor"]} />
                <Line type="linear" dataKey="total" stroke="#2563EB" strokeWidth={2.5} isAnimationActive={false}
                  dot={{ r: 5, fill: "#2563EB", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
