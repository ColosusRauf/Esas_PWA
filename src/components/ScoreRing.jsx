import React from "react";

export default function ScoreRing({ value, max = 100, size = 96, label = "Total Skor" }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = pct <= 30 ? "var(--mild)" : pct <= 60 ? "var(--moderate)" : "var(--severe)";

  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `conic-gradient(${color} ${pct * 3.6}deg, var(--border) 0deg)`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
    }}>
      <div style={{
        width: size - 16, height: size - 16, borderRadius: "50%", background: "var(--surface)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 10, color: "var(--ink-soft)", marginTop: 3 }}>{label}</span>
      </div>
    </div>
  );
}
