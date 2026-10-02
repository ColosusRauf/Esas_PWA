import React from "react";
import { ArrowLeft } from "lucide-react";

export const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, padding: "clamp(14px, 2.4vh, 22px) clamp(16px, 1.4vw, 24px)" };
export const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)",
  fontSize: 14, color: "var(--ink)", background: "var(--surface)",
};
export const primaryBtn = {
  background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10,
  padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer",
};
export const ghostBtn = {
  background: "var(--surface)", color: "var(--ink)", border: "1px solid var(--border)", borderRadius: 10,
  padding: "9px 16px", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
};

export function Card({ title, action, children, style, fill, bodyStyle }) {
  return (
    <div className={"card-hover" + (fill ? " fill" : "")} style={{ ...card, display: "flex", flexDirection: "column", minHeight: 0, ...style }}>
      {(title || action) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "clamp(8px, 1.6vh, 14px)", gap: 10, flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>{title}</span>
          {action}
        </div>
      )}
      <div className="card-body" style={bodyStyle}>{children}</div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, subTone }) {
  const tone = subTone === "up" ? "var(--severe)" : subTone === "down" ? "var(--mild)" : "var(--ink-soft)";
  return (
    <div className="card-hover" style={{ ...card, padding: "clamp(10px, 1.7vh, 16px) clamp(14px, 1.2vw, 20px)", display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={21} color="var(--primary)" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", lineHeight: 1.15 }}>{value}</div>
        {sub && <div style={{ fontSize: 11.5, color: tone, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export const Empty = ({ children }) => (
  <div style={{ padding: "26px 8px", textAlign: "center", fontSize: 13, color: "var(--ink-soft)" }}>{children}</div>
);

export const th = { fontWeight: 500, padding: "0 10px 8px 0", textAlign: "left", color: "var(--ink-soft)", fontSize: 13, position: "sticky", top: 0, background: "var(--surface)", zIndex: 1 };
export const td = { padding: "clamp(6px, 1.2vh, 11px) 10px clamp(6px, 1.2vh, 11px) 0", borderTop: "1px solid var(--border)", fontSize: 13.5, color: "var(--ink)" };

export function PageTitle({ title, sub, right, onBack }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        {onBack && (
          <button onClick={onBack} aria-label="Kembali ke daftar pasien" title="Daftar pasien" style={{
            width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--surface)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--ink)",
          }}>
            <ArrowLeft size={18} />
          </button>
        )}
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: 26, margin: "0 0 2px", color: "var(--ink)", letterSpacing: "-0.01em" }}>{title}</h1>
          {sub && <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: 0 }}>{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}
