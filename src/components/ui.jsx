import React from "react";

export function Card({ title, action, children, style, bodyStyle }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20,
      padding: "clamp(16px, 2.6vh, 26px) clamp(18px, 1.6vw, 28px)", boxShadow: "0 1px 2px rgba(15,27,61,0.03)",
      display: "flex", flexDirection: "column", minHeight: 0, ...style,
    }}>
      {(title || action) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "clamp(10px, 1.8vh, 18px)", gap: 12, flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: "var(--ink)" }}>{title}</span>
          {action}
        </div>
      )}
      <div className="card-body" style={bodyStyle}>{children}</div>
    </div>
  );
}

export const linkBtn = {
  background: "none", border: "none", padding: 0, color: "var(--primary)", fontSize: 14,
  fontWeight: 600, cursor: "pointer",
};

export const th = { fontWeight: 500, padding: "0 12px 12px 0", textAlign: "left", color: "var(--ink-soft)", fontSize: 14 };
export const td = { padding: "clamp(8px, 1.5vh, 14px) 12px clamp(8px, 1.5vh, 14px) 0", borderTop: "1px solid var(--border)", fontSize: 15, color: "var(--ink)" };

export const primaryBtn = {
  background: "var(--primary)", color: "#fff", border: "none", borderRadius: 12,
  padding: "13px 22px", fontSize: 15.5, fontWeight: 600, cursor: "pointer",
};
export const ghostBtn = {
  background: "var(--surface)", color: "var(--ink)", border: "1px solid var(--border)", borderRadius: 12,
  padding: "12px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer",
};
