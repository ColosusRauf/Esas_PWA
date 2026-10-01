import React, { useEffect } from "react";
import { X } from "lucide-react";

const PW_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
export const randomPassword = (n = 10) =>
  Array.from(crypto.getRandomValues(new Uint32Array(n)), (x) => PW_CHARS[x % PW_CHARS.length]).join("");

export const fieldLabel = { fontSize: 13, fontWeight: 600, color: "var(--ink)", display: "block", marginBottom: 6 };

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label={title} style={{
      position: "fixed", inset: 0, background: "rgba(15,27,61,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50,
    }}>
      <div style={{ background: "var(--surface)", borderRadius: 18, padding: 24, width: "100%", maxWidth: 440, maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, margin: 0, color: "var(--ink)" }}>{title}</h2>
          <button onClick={onClose} aria-label="Tutup" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)" }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
