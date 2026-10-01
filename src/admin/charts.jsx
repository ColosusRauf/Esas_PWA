import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Empty } from "./ui.jsx";

// Satu hue (biru), terang -> gelap = skor rendah -> tinggi
export const RAMP = ["#BFD4FB", "#7FA8F5", "#3F7BEE", "#1E3FA8"];
const tip = { fontSize: 12, borderRadius: 10, border: "1px solid var(--border)" };
const axis = { fontSize: 10.5, fill: "var(--ink-soft)" };

export function TrendChart({ data, yMax = 100, height = 220, unit = "Rata-rata skor" }) {
  if (!data.length) return <Empty>Belum ada data pada periode ini.</Empty>;
  return (
    <div style={{ height }} role="img" aria-label={`Grafik tren ${unit.toLowerCase()}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} minTickGap={18} />
          <YAxis domain={[0, yMax]} tick={axis} axisLine={false} tickLine={false} width={32} />
          <Tooltip contentStyle={tip} formatter={(v, _n, p) => [`${v}${p?.payload?.n > 1 ? ` (${p.payload.n} assessment)` : ""}`, unit]} />
          <Line type="linear" isAnimationActive={false} dataKey="mean" stroke="#2563EB" strokeWidth={2} dot={{ r: 4, fill: "#2563EB", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Distribution({ bins }) {
  const total = bins.reduce((s, b) => s + b.count, 0);
  if (!total) return <Empty>Belum ada data pada periode ini.</Empty>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
      <div style={{ width: 150, height: 150, position: "relative", flexShrink: 0 }} role="img" aria-label="Distribusi total skor">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={bins} dataKey="count" nameKey="label" innerRadius={48} outerRadius={70} paddingAngle={2} isAnimationActive={false} stroke="var(--surface)" strokeWidth={2}>
              {bins.map((b, i) => <Cell key={b.label} fill={RAMP[i]} />)}
            </Pie>
            <Tooltip contentStyle={tip} formatter={(v, n) => [`${v} assessment`, `Skor ${n}`]} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>{total}</span>
          <span style={{ fontSize: 10.5, color: "var(--ink-soft)" }}>assessment</span>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 150, display: "flex", flexDirection: "column", gap: 8 }}>
        {bins.map((b, i) => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: RAMP[i], flexShrink: 0 }} />
            <span style={{ color: "var(--ink)", flex: 1 }}>Skor {b.label}</span>
            <span style={{ color: "var(--ink-soft)" }}>{b.count}</span>
            <span style={{ color: "var(--ink)", fontWeight: 600, width: 38, textAlign: "right" }}>{b.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SymptomBars({ rows }) {
  if (!rows.some((r) => r.mean > 0)) return <Empty>Belum ada data pada periode ini.</Empty>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((r) => (
        <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
          <span style={{ width: 150, color: "var(--ink)", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.label}>{r.label}</span>
          <div style={{ flex: 1, height: 8, borderRadius: "0 4px 4px 0", background: "var(--primary-soft)" }} title={`${r.label}: ${r.mean} dari 10`}>
            <div style={{ width: `${(r.mean / 10) * 100}%`, height: "100%", borderRadius: "0 4px 4px 0", background: "#2563EB" }} />
          </div>
          <span style={{ width: 30, textAlign: "right", fontWeight: 600, color: "var(--ink)" }}>{r.mean}</span>
        </div>
      ))}
    </div>
  );
}
