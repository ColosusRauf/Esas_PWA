import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Layout from "../components/Layout.jsx";
import { Card, th, td } from "../components/ui.jsx";
import { DOMAINS, totalOf, severity, SEV_COLOR, SEV_LABEL } from "../data.js";

export default function History({ patientId, assessments, onNavigate, onLogout }) {
  const [openId, setOpenId] = useState(assessments[assessments.length - 1]?.id ?? null);
  const reversed = [...assessments].reverse();
  const openItem = assessments.find((a) => a.id === openId);

  const breakdownData = openItem
    ? DOMAINS.map((d, i) => ({ name: d.label.split(" (")[0].replace(/^Rasa /, "").replace(" Umum", ""), value: openItem.answers[i] }))
    : [];

  return (
    <Layout active="history" patientId={patientId} onNavigate={onNavigate} onLogout={onLogout}
      title="Riwayat Assessment" subtitle="Lihat riwayat penilaian ESAS Anda. Pilih satu baris untuk melihat rinciannya.">
      <div className="grid-2 fit-fill history-grid">
        <Card>
          {reversed.length === 0 ? (
            <p style={{ fontSize: 15, color: "var(--ink-soft)", margin: 0 }}>Belum ada riwayat assessment.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={th}>Tanggal</th><th style={th}>Total Skor</th><th style={th}>Status</th><th style={th} /></tr></thead>
              <tbody>
                {reversed.map((a) => {
                  const isOpen = openId === a.id;
                  return (
                    <tr key={a.id} onClick={() => setOpenId(isOpen ? null : a.id)} style={{ cursor: "pointer", background: isOpen ? "var(--primary-soft)" : "transparent" }}>
                      <td style={{ ...td, paddingLeft: 12 }}>{a.tanggal}</td>
                      <td style={{ ...td, fontWeight: 700 }}>{totalOf(a.answers)}</td>
                      <td style={td}><span style={{ color: a.status === "Selesai" ? "var(--mild)" : "var(--moderate)", fontWeight: 600 }}>● {a.status}</span></td>
                      <td style={{ ...td, textAlign: "right", color: "var(--ink-soft)", paddingRight: 12 }}>
                        {isOpen ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        {openItem ? (
          <Card title={`${openItem.tanggal} · Total Skor: ${totalOf(openItem.answers)}`}>
            <div className="tiles" style={{ display: "grid", gap: 10, marginBottom: "clamp(10px, 2vh, 20px)", flexShrink: 0 }}>
              {DOMAINS.map((d, i) => {
                const v = openItem.answers[i];
                const sev = severity(v);
                return (
                  <div key={d.key} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "clamp(8px, 1.4vh, 13px) 14px" }}>
                    <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.label.split(" (")[0].replace(/^Rasa /, "").replace(" Umum", "")}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: SEV_COLOR[sev], lineHeight: 1.1 }}>{v}</div>
                    <div style={{ fontSize: 12.5, color: SEV_COLOR[sev], marginTop: 3 }}>{SEV_LABEL[sev]}</div>
                  </div>
                );
              })}
            </div>
            <div className="chart-box" role="img" aria-label="Grafik skor per gejala">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11.5, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} interval={0} height={70} angle={-30} textAnchor="end" />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12.5, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip contentStyle={{ fontSize: 13.5, borderRadius: 12, border: "1px solid var(--border)" }} formatter={(v) => [v, "Skor"]} />
                  <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ) : (
          <Card><p style={{ fontSize: 15, color: "var(--ink-soft)", margin: 0 }}>Pilih satu tanggal di sebelah kiri untuk melihat rincian skornya.</p></Card>
        )}
      </div>
    </Layout>
  );
}
