import React from "react";
import { Timer } from "lucide-react";
import { useLang } from "../i18n.jsx";
import { primaryBtn, ghostBtn } from "./ui.jsx";

export default function IdleWarning({ left, onStay, onLogout }) {
  const { t } = useLang();
  return (
    <div className="overlay" role="alertdialog" aria-modal="true" aria-labelledby="idle-title" style={{ zIndex: 200 }}>
      <div className="modal" style={{ width: "min(420px, 100%)", textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: "var(--primary-soft)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
          <Timer size={26} color="var(--primary)" />
        </div>
        <h2 id="idle-title">{t("idle.title")}</h2>
        <p style={{ margin: "0 0 16px", color: "var(--ink-soft)", fontSize: 14.5 }}>{t("idle.text", { n: left })}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onLogout} style={{ ...ghostBtn, flex: 1 }}>{t("nav.logout")}</button>
          <button onClick={onStay} style={{ ...primaryBtn, flex: 1 }} autoFocus>{t("idle.stay")}</button>
        </div>
      </div>
    </div>
  );
}
