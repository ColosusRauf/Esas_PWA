import React from "react";

// Ilustrasi sederhana (C5). Warna mengikuti tema lewat variabel CSS.
const ART = {
  chart: (
    <>
      <rect x="18" y="26" width="104" height="72" rx="10" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
      <path d="M32 82 L54 62 L72 72 L96 46 L110 54" fill="none" stroke="var(--primary)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 7" />
      <circle cx="54" cy="62" r="5" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="2.5" />
      <circle cx="96" cy="46" r="5" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="2.5" />
    </>
  ),
  list: (
    <>
      <rect x="30" y="16" width="80" height="92" rx="12" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
      {[38, 58, 78].map((y) => (
        <g key={y}>
          <circle cx="48" cy={y} r="6" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="2" />
          <rect x="62" y={y - 4} width="34" height="8" rx="4" fill="var(--border)" />
        </g>
      ))}
      <path d="M90 100 l8 8 16 -18" fill="none" stroke="var(--mild)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  search: (
    <>
      <circle cx="62" cy="54" r="30" fill="var(--surface)" stroke="var(--primary)" strokeWidth="5" />
      <path d="M85 77 L108 100" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round" />
      <path d="M50 54 h24" stroke="var(--border)" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  calendar: (
    <>
      <rect x="22" y="26" width="96" height="78" rx="12" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
      <rect x="22" y="26" width="96" height="20" rx="10" fill="var(--primary-soft)" />
      {[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => (
        <circle key={`${r}${c}`} cx={36 + c * 17} cy={60 + r * 11} r="3.5" fill="var(--border)" />
      )))}
    </>
  ),
};

export default function EmptyState({ kind = "chart", title, text, action, compact }) {
  return (
    <div className="empty-state" style={compact ? { padding: "10px 8px" } : undefined}>
      <svg viewBox="0 0 140 120" width={compact ? 96 : 132} height={compact ? 82 : 113} role="img" aria-hidden="true" className="empty-art">
        {ART[kind] || ART.chart}
      </svg>
      {title && <div className="empty-title">{title}</div>}
      {text && <p className="empty-text">{text}</p>}
      {action}
    </div>
  );
}
