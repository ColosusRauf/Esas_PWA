import React from "react";

export const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 };
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

export function Card({ title, action, children, style }) {
  return (
    <div style={{ ...card, ...style }}>
      {(title || action) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{title}</span>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, subTone }) {
  const tone = subTone === "up" ? "var(--severe)" : subTone === "down" ? "var(--mild)" : "var(--ink-soft)";
  return (
    <div style={{ ...card, display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={21} color="var(--primary)" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>{value}</div>
        {sub && <div style={{ fontSize: 11.5, color: tone, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export const Empty = ({ children }) => (
  <div style={{ padding: "26px 8px", textAlign: "center", fontSize: 13, color: "var(--ink-soft)" }}>{children}</div>
);

export const th = { fontWeight: 500, padding: "0 10px 10px 0", textAlign: "left", color: "var(--ink-soft)", fontSize: 12.5 };
export const td = { padding: "10px 10px 10px 0", borderTop: "1px solid var(--border)", fontSize: 13, color: "var(--ink)" };

export function PageTitle({ title, sub, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, margin: "0 0 4px", color: "var(--ink)" }}>{title}</h1>
        {sub && <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: 0 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}
