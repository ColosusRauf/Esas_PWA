import React from "react";

export function Card({ title, action, children, style }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20,
      padding: 28, boxShadow: "0 1px 2px rgba(15,27,61,0.03)", ...style,
    }}>
      {(title || action) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: "var(--ink)" }}>{title}</span>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export const linkBtn = {
  background: "none", border: "none", padding: 0, color: "var(--primary)", fontSize: 14,
  fontWeight: 600, cursor: "pointer",
};

export const th = { fontWeight: 500, padding: "0 12px 12px 0", textAlign: "left", color: "var(--ink-soft)", fontSize: 14 };
export const td = { padding: "15px 12px 15px 0", borderTop: "1px solid var(--border)", fontSize: 15, color: "var(--ink)" };

export const primaryBtn = {
  background: "var(--primary)", color: "#fff", border: "none", borderRadius: 12,
  padding: "13px 22px", fontSize: 15.5, fontWeight: 600, cursor: "pointer",
};
export const ghostBtn = {
  background: "var(--surface)", color: "var(--ink)", border: "1px solid var(--border)", borderRadius: 12,
  padding: "12px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer",
};
