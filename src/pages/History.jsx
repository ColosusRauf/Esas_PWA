import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Sidebar from "../components/Sidebar.jsx";
import { DOMAINS, totalOf, severity, SEV_COLOR, SEV_LABEL } from "../data.js";

export default function History({ patientId, assessments, onNavigate, onLogout }) {
  const [openId, setOpenId] = useState(assessments[assessments.length - 1]?.id ?? null);
  const reversed = [...assessments].reverse();
  const openItem = assessments.find((a) => a.id === openId);

  const breakdownData = openItem
    ? DOMAINS.map((d, i) => ({ name: d.label.split(" (")[0], value: openItem.answers[i] }))
    : [];

  return (
    <div style={{ display: "flex", background: "var(--bg)", minHeight: "100vh" }}>
      <Sidebar active="history" onNavigate={onNavigate} patientId={patientId} onLogout={onLogout} />

      <main style={{ flex: 1, padding: "22px 34px", maxWidth: 900 }}>
        <h2 style={{ fontSize: 20, margin: "0 0 4px", color: "var(--ink)" }}>Riwayat Assessment</h2>
        <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: "0 0 20px" }}>
          Lihat riwayat penilaian ESAS Anda
        </p>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--bg)", textAlign: "left", color: "var(--ink-soft)" }}>
                <th style={{ fontWeight: 600, padding: "12px 20px" }}>Tanggal</th>
                <th style={{ fontWeight: 600, padding: "12px 20px" }}>Total Skor</th>
                <th style={{ fontWeight: 600, padding: "12px 20px" }}>Status</th>
                <th style={{ padding: "12px 20px" }} />
              </tr>
            </thead>
            <tbody>
              {reversed.map((a) => {
                const isOpen = openId === a.id;
                return (
                  <tr
                    key={a.id}
                    onClick={() => setOpenId(isOpen ? null : a.id)}
                    style={{ borderTop: "1px solid var(--border)", cursor: "pointer" }}
                  >
                    <td style={{ padding: "13px 20px", color: "var(--ink)" }}>{a.tanggal}</td>
                    <td style={{ padding: "13px 20px", color: "var(--ink)", fontWeight: 600 }}>{totalOf(a.answers)}</td>
                    <td style={{ padding: "13px 20px" }}>
                      <span style={{ color: "var(--mild)", fontWeight: 600 }}>● {a.status}</span>
                    </td>
                    <td style={{ padding: "13px 20px", textAlign: "right", color: "var(--ink-soft)" }}>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {openItem && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 14.5, color: "var(--ink)" }}>
                {openItem.tanggal} · Total Skor: {totalOf(openItem.answers)}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 22 }}>
              {DOMAINS.map((d, i) => {
                const v = openItem.answers[i];
                const sev = severity(v);
                return (
                  <div key={d.key} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
                    <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 4 }}>{d.label.split(" (")[0]}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: SEV_COLOR[sev] }}>{v}</div>
                    <div style={{ fontSize: 10.5, color: SEV_COLOR[sev] }}>{SEV_LABEL[sev]}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 4, right: 6, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10.5, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid var(--border)" }} />
                  <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
